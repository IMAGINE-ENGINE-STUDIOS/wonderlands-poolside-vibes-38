import * as React from 'react';
import { toast } from 'sonner';
import {
  cacheAudio,
  cacheScript,
  getCachedAudio,
  getCachedScript,
  getNarratorContext,
  subscribeNarrator,
  type NarratorAction,
  type NarratorContext,
  type NarratorScript,
} from '@/lib/narratorStore';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
/** Genius speaks at mid volume so the page is still comfortable to read. */
const MID_VOLUME = 0.55;

export interface NarratorState {
  context: NarratorContext | null;
  script: string;
  actions: NarratorAction[];
  isLoading: boolean;
  isSpeaking: boolean;
  muted: boolean;
}

export function useNarrator() {
  const [context, setContext] = React.useState<NarratorContext | null>(() => getNarratorContext());
  const [script, setScript] = React.useState('');
  const [actions, setActions] = React.useState<NarratorAction[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [muted, setMuted] = React.useState<boolean>(() => localStorage.getItem('wl.narrator.muted') === '1');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const historyRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    const unsubscribe = subscribeNarrator(setContext);
    return () => {
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem('wl.narrator.muted', muted ? '1' : '0');
  }, [muted]);

  const stop = React.useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const speak = React.useCallback(
    async (text: string, key: string) => {
      if (muted || !text) return;
      try {
        let url = getCachedAudio(key);
        if (!url) {
          const res = await fetch(`${FUNCTIONS_BASE}/narrate-voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}` },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) return; // voice is a bonus — the transcript still reads
          const blob = await res.blob();
          url = URL.createObjectURL(blob);
          cacheAudio(key, url);
        }
        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;
        audio.src = url;
        /* mid volume by default — Genius speaks over the page, never across it */
        audio.volume = MID_VOLUME;
        audio.onended = () => setIsSpeaking(false);
        setIsSpeaking(true);
        await audio.play();
      } catch {
        setIsSpeaking(false);
      }
    },
    [muted],
  );

  const narrate = React.useCallback(
    async (opts?: { branch?: string; withVoice?: boolean }) => {
      const ctx = getNarratorContext();
      if (!ctx) return;
      const key = opts?.branch ? `${ctx.key}::${opts.branch}` : ctx.key;

      const cached = getCachedScript(key);
      if (cached) {
        setScript(cached.script);
        setActions(cached.actions);
        if (opts?.withVoice !== false) void speak(cached.script, key);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`${FUNCTIONS_BASE}/narrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}` },
          body: JSON.stringify({
            scope: ctx.scope,
            title: opts?.branch ? `${ctx.title} — ${opts.branch}` : ctx.title,
            category: ctx.category,
            product: ctx.product,
            price: ctx.price,
            features: ctx.features,
            route: ctx.route,
            history: historyRef.current,
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}) as { error?: string });
          if (res.status !== 402 && res.status !== 429) {
            setScript('');
          }
          toast.error(body.error || 'The narrator is unavailable right now.');
          return;
        }

        const data = (await res.json()) as NarratorScript;
        cacheScript(key, data);
        historyRef.current = [...historyRef.current, ctx.title].slice(-4);
        setScript(data.script);
        setActions(data.actions ?? []);
        if (opts?.withVoice !== false) void speak(data.script, key);
      } catch {
        toast.error('The narrator could not be reached.');
      } finally {
        setIsLoading(false);
      }
    },
    [speak],
  );

  // A new page invalidates the current reading.
  React.useEffect(() => {
    stop();
    setScript('');
    setActions([]);
  }, [context?.key, stop]);

  return {
    context,
    script,
    actions,
    isLoading,
    isSpeaking,
    muted,
    setMuted,
    narrate,
    stop,
    replay: () => {
      const ctx = getNarratorContext();
      if (ctx && script) void speak(script, ctx.key);
    },
  };
}

export default useNarrator;
