import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** 16 kHz mono is plenty for speech and keeps the upload small. */
const TARGET_RATE = 16000;

const downsample = (chunks: Float32Array[], from: number): Float32Array => {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const flat = new Float32Array(total);
  let at = 0;
  for (const c of chunks) {
    flat.set(c, at);
    at += c.length;
  }
  if (from <= TARGET_RATE) return flat;
  const ratio = from / TARGET_RATE;
  const out = new Float32Array(Math.floor(flat.length / ratio));
  for (let i = 0; i < out.length; i++) out[i] = flat[Math.floor(i * ratio)] ?? 0;
  return out;
};

/** Complete 16-bit mono WAV — decodable on every browser, unlike recorder fragments. */
const encodeWav = (chunks: Float32Array[], sampleRate: number): Blob => {
  const samples = downsample(chunks, sampleRate);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const str = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  str(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  let at = 44;
  for (let i = 0; i < samples.length; i++, at += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(at, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: 'audio/wav' });
};

interface Options {
  /** Called with the transcript of each finished recording. */
  onTranscript?: (text: string) => void;
  /** ISO-639-1 code, or omitted so the model detects the language. */
  language?: string;
}

/**
 * Microphone recording with transcription.
 *
 * This is the paid path and is used only for Genius LIVE, or as a fallback when
 * the browser has no free speech-recognition engine. Audio is captured as PCM
 * and uploaded as a complete WAV, so Safari's fragmented MP4 never appears.
 */
export function useVoiceRecorder({ onTranscript, language }: Options = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const node = useRef<ScriptProcessorNode | null>(null);
  const source = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcm = useRef<Float32Array[]>([]);

  const teardown = useCallback(() => {
    node.current?.disconnect();
    source.current?.disconnect();
    stream.current?.getTracks().forEach((t) => t.stop());
    ctx.current?.close().catch(() => undefined);
    node.current = null;
    source.current = null;
    stream.current = null;
    ctx.current = null;
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      stream.current = media;
      const audioCtx = new AudioContext();
      ctx.current = audioCtx;
      const src = audioCtx.createMediaStreamSource(media);
      source.current = src;
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      node.current = processor;
      pcm.current = [];
      processor.onaudioprocess = (e) => {
        const data = e.inputBuffer.getChannelData(0);
        pcm.current.push(new Float32Array(data));
        let peak = 0;
        for (let i = 0; i < data.length; i += 64) peak = Math.max(peak, Math.abs(data[i]));
        setLevel(peak);
      };
      src.connect(processor);
      processor.connect(audioCtx.destination);
      setIsRecording(true);
    } catch {
      setError('Microphone access is needed to record.');
      teardown();
      setIsRecording(false);
    }
  }, [teardown]);

  /** Stop, encode and transcribe. Returns the transcript (empty when silent). */
  const stop = useCallback(async (): Promise<string> => {
    if (!isRecording) return '';
    const rate = ctx.current?.sampleRate ?? TARGET_RATE;
    const chunks = pcm.current;
    pcm.current = [];
    teardown();
    setIsRecording(false);

    const blob = encodeWav(chunks, rate);
    if (blob.size < 2048) {
      setError('That recording was empty — please try again.');
      return '';
    }

    setIsTranscribing(true);
    try {
      const form = new FormData();
      form.append('file', blob, 'recording.wav');
      if (language) form.append('language', language);
      const { data, error: fnError } = await supabase.functions.invoke('transcribe-audio', {
        body: form,
      });
      if (fnError) throw fnError;
      const text = typeof data?.text === 'string' ? data.text.trim() : '';
      if (text) onTranscript?.(text);
      return text;
    } catch {
      setError('Genius could not hear that — please try again.');
      return '';
    } finally {
      setIsTranscribing(false);
    }
  }, [isRecording, language, onTranscript, teardown]);

  const cancel = useCallback(() => {
    pcm.current = [];
    teardown();
    setIsRecording(false);
  }, [teardown]);

  return { isRecording, isTranscribing, level, error, start, stop, cancel, resetError: () => setError(null) };
}
