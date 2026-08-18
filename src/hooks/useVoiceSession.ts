import * as React from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { isGeniusSpeaking, stopGeniusVoice, subscribeGeniusVoice } from '@/lib/geniusVoiceChannel';

export type MicPermission = 'unknown' | 'prompt' | 'granted' | 'denied';
export type VoicePhase = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking';

interface Options {
  /** Called with each finished phrase — this is what reaches Genius. */
  onPhrase: (text: string) => void | Promise<void>;
  /** Genius is composing an answer: the microphone waits its turn. */
  busy?: boolean;
  /** Language hint for the paid path; omitted lets the model detect it. */
  language?: string;
}

/** Silence, in ms, that ends a spoken turn on the recorded (paid) path. */
const SILENCE_MS = 1200;
/** Level above which we consider the guest to actually be speaking. */
const SPEECH_LEVEL = 0.045;
/** Breath between her last word and the microphone reopening. */
const REARM_MS = 300;
/** Grace given to the free browser engine before we record the turn instead. */
const FREE_ENGINE_MS = 1200;

const probePermission = async (): Promise<MicPermission> => {
  try {
    const anyNav = navigator as Navigator & {
      permissions?: { query: (d: { name: PermissionName }) => Promise<PermissionStatus> };
    };
    if (!anyNav.permissions?.query) return 'unknown';
    const status = await anyNav.permissions.query({ name: 'microphone' as PermissionName });
    if (status.state === 'granted') return 'granted';
    if (status.state === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unknown';
  }
};

/**
 * One voice conversation with Genius.
 *
 * Owns the microphone permission moment, the listen → answer → listen loop and
 * the echo guard that keeps her own voice out of the transcript. Free browser
 * recognition is used whenever the browser has it; the recorded (paid) path is
 * the fallback, so talking normally costs nothing.
 */
export function useVoiceSession({ onPhrase, busy = false, language }: Options) {
  const [permission, setPermission] = React.useState<MicPermission>('unknown');
  const [speaking, setSpeaking] = React.useState<boolean>(() => isGeniusSpeaking());
  const [handsFree, setHandsFree] = React.useState(false);
  const [armed, setArmed] = React.useState(false);
  const [permissionError, setPermissionError] = React.useState<string | null>(null);
  /* Some browsers expose SpeechRecognition but never actually start it. */
  const [freeEngineStalled, setFreeEngineStalled] = React.useState(false);

  const voice = useVoiceInput();
  const phraseRef = React.useRef(onPhrase);
  phraseRef.current = onPhrase;

  const recorder = useVoiceRecorder({
    language,
    onTranscript: (text) => void phraseRef.current(text),
  });

  const freePath = voice.isSupported && !freeEngineStalled;

  /* ------------------------------- permission ------------------------------ */

  React.useEffect(() => {
    let alive = true;
    void probePermission().then((p) => {
      if (alive) setPermission((current) => (current === 'granted' ? current : p));
    });
    return () => {
      alive = false;
    };
  }, []);

  const requestPermission = React.useCallback(async (): Promise<boolean> => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermission('granted');
      return true;
    } catch (err) {
      const name = (err as { name?: string })?.name ?? '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setPermission('denied');
        setPermissionError('Microphone blocked — enable it in your browser’s address bar to talk.');
      } else {
        setPermission('prompt');
        setPermissionError('No microphone was found — you can still type to Genius.');
      }
      return false;
    }
  }, []);

  /* ------------------------------ voice channel ---------------------------- */

  React.useEffect(() => subscribeGeniusVoice(setSpeaking), []);

  /* ------------------------------- listening ------------------------------- */

  const listening = freePath ? voice.isListening : recorder.isRecording;

  const beginListening = React.useCallback(() => {
    if (freePath) {
      if (!voice.isListening) voice.startListening();
    } else if (!recorder.isRecording && !recorder.isTranscribing) {
      void recorder.start();
    }
  }, [freePath, voice, recorder]);

  const stopListening = React.useCallback(() => {
    if (freePath) {
      if (voice.isListening) voice.stopListening();
    } else if (recorder.isRecording) {
      void recorder.stop();
    }
  }, [freePath, voice, recorder]);

  /** Press to talk: silences her first, then opens the microphone. */
  const start = React.useCallback(async () => {
    stopGeniusVoice();
    if (permission !== 'granted') {
      const ok = await requestPermission();
      if (!ok) return;
    }
    setArmed(true);
    beginListening();
  }, [permission, requestPermission, beginListening]);

  /* Watchdog: if the free engine never opens, fall back to recording the turn
     so the guest is never left talking to a microphone that isn't listening. */
  React.useEffect(() => {
    if (!armed || !freePath || voice.isListening) return;
    const t = window.setTimeout(() => setFreeEngineStalled(true), FREE_ENGINE_MS);
    return () => window.clearTimeout(t);
  }, [armed, freePath, voice.isListening]);

  /* The browser engine exists but refused the job (blocked inside an iframe, no
     network service, no capture device): switch to the recorded path at once so
     LIVE keeps working instead of failing silently. */
  React.useEffect(() => {
    const err = voice.error ?? '';
    if (!err) return;
    if (/denied|not-allowed|audio-capture|service-not-allowed|network/i.test(err)) {
      setFreeEngineStalled(true);
    }
  }, [voice.error]);


  React.useEffect(() => {
    if (!armed || !freeEngineStalled || recorder.isRecording || recorder.isTranscribing) return;
    void recorder.start();
  }, [armed, freeEngineStalled, recorder.isRecording, recorder.isTranscribing, recorder.start]);

  const stop = React.useCallback(() => {
    setArmed(false);
    stopListening();
  }, [stopListening]);

  const toggle = React.useCallback(() => {
    if (listening) {
      stop();
      return;
    }
    void start();
  }, [listening, start, stop]);

  /* Free path: a finished phrase goes straight to Genius. */
  React.useEffect(() => {
    if (!voice.transcript || voice.isListening) return;
    const said = voice.transcript;
    voice.resetTranscript();
    if (!handsFree) setArmed(false);
    void phraseRef.current(said);
  }, [voice.transcript, voice.isListening, voice.resetTranscript, handsFree]);

  /* Recorded path: end the turn on silence after speech. */
  const speechSeen = React.useRef(false);
  const quietSince = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (freePath || !recorder.isRecording) return;
    if (recorder.level > SPEECH_LEVEL) {
      speechSeen.current = true;
      quietSince.current = null;
      return;
    }
    if (!speechSeen.current) return;
    if (quietSince.current === null) {
      quietSince.current = Date.now();
      return;
    }
    if (Date.now() - quietSince.current > SILENCE_MS) {
      quietSince.current = null;
      speechSeen.current = false;
      if (!handsFree) setArmed(false);
      void recorder.stop();
    }
  }, [freePath, recorder.isRecording, recorder.level, recorder.stop, handsFree]);

  /* Hands-free: reopen the microphone once she has finished her answer. The
     echo guard is this same gate — the microphone is shut while she speaks. */
  React.useEffect(() => {
    if (!handsFree) return;
    if (listening || speaking || busy || recorder.isTranscribing) return;
    if (permission !== 'granted') return;
    const t = window.setTimeout(() => {
      setArmed(true);
      beginListening();
    }, REARM_MS);
    return () => window.clearTimeout(t);
  }, [handsFree, listening, speaking, busy, recorder.isTranscribing, permission, beginListening]);

  /* Leaving hands-free closes the microphone immediately. */
  React.useEffect(() => {
    if (handsFree) return;
    if (recorder.isRecording) recorder.cancel();
  }, [handsFree, recorder.isRecording, recorder.cancel]);

  const enableHandsFree = React.useCallback(
    async (next: boolean) => {
      if (!next) {
        setHandsFree(false);
        stop();
        return;
      }
      if (permission !== 'granted') {
        const ok = await requestPermission();
        if (!ok) return;
      }
      stopGeniusVoice();
      setHandsFree(true);
    },
    [permission, requestPermission, stop],
  );

  React.useEffect(() => {
    if (!speaking) return;
    /* She started speaking — never record her. */
    if (listening) stopListening();
  }, [speaking, listening, stopListening]);

  const phase: VoicePhase = listening
    ? 'listening'
    : recorder.isTranscribing
      ? 'transcribing'
      : busy
        ? 'thinking'
        : speaking
          ? 'speaking'
          : 'idle';

  return {
    permission,
    requestPermission,
    permissionError,
    /** Free browser recognition available (no per-word cost). */
    freePath,
    phase,
    listening,
    armed,
    speaking,
    level: freePath ? (voice.isListening ? 0.5 : 0) : recorder.level,
    partial: voice.interimTranscript,
    error: permissionError || voice.error || recorder.error,
    handsFree,
    setHandsFree: enableHandsFree,
    start,
    stop,
    toggle,
  };
}

export default useVoiceSession;
