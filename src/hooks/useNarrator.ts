import * as React from 'react';
import { toast } from 'sonner';
import { generateFlipPitch } from '@/lib/flipPitchGenerator';
import { getFlipManifest } from '@/lib/flipPageRegistry';
import { playGeniusVoice, stopGeniusVoice, subscribeGeniusVoice, GENIUS_VOLUME } from '@/lib/geniusVoiceChannel';
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

/** Readings already recorded for this page, shared across every guest. */
async function loadSavedReading(key: string): Promise<string | null> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data } = await supabase
      .from('narration_cache')
      .select('script')
      .eq('cache_key', key)
      .maybeSingle();
    return data?.script ?? null;
  } catch {
    return null;
  }
}

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

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

  /* One voice channel for the whole app — the panel follows it. */
  React.useEffect(() => subscribeGeniusVoice(setIsSpeaking), []);

  const stop = React.useCallback(() => {
    stopGeniusVoice();
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
            body: JSON.stringify({ text, key }),
          });
          if (!res.ok) return; // voice is a bonus — the transcript still reads
          const blob = await res.blob();
          url = URL.createObjectURL(blob);
          cacheAudio(key, url);
        }
        /* mid volume by default — Genius speaks over the page, never across it */
        await playGeniusVoice(url);
      } catch {
        stopGeniusVoice();
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
        /* Text is written locally by the house copywriter — no paid text calls. */
        const manifest = getFlipManifest();
        const page = manifest ? manifest.pages[manifest.current] ?? null : null;
        const local = generateFlipPitch({ context: ctx, branch: opts?.branch, manifest, page });
        /* A reading recorded by an earlier guest is reused word for word so the
           voice clip in the library still matches the transcript. */
        const saved = await loadSavedReading(key);
        const data = saved ? { ...local, script: saved } : local;
        cacheScript(key, data);
        historyRef.current = [...historyRef.current, ctx.title].slice(-4);
        setScript(data.script);
        setActions(data.actions ?? []);
        if (opts?.withVoice !== false) void speak(data.script, key);
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
