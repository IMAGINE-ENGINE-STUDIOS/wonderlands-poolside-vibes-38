/**
 * Genius language layer — © Imagine Engine Studios Corp.
 * - detectLanguage(): guesses the guest's tongue from what they type (or the browser).
 * - translateTexts(): batched, cached translation via the Groq `genius-translate` function.
 * - pickVoice(): a native browser voice for the language, so Spanish sounds Spanish.
 */
import { supabase } from '@/integrations/supabase/client';

export const GENIUS_LANGUAGES = [
  { code: 'en-US', label: 'English', name: 'English' },
  { code: 'es-ES', label: 'Español', name: 'Spanish' },
  { code: 'pt-BR', label: 'Português', name: 'Portuguese' },
  { code: 'fr-FR', label: 'Français', name: 'French' },
  { code: 'de-DE', label: 'Deutsch', name: 'German' },
  { code: 'it-IT', label: 'Italiano', name: 'Italian' },
] as const;

export const languageName = (code: string) =>
  GENIUS_LANGUAGES.find((l) => l.code.slice(0, 2) === code.slice(0, 2))?.name ?? 'English';

const HINTS: [string, RegExp][] = [
  ['es-ES', /\b(el|la|los|las|una|quiero|piscina|cu[aá]nto|precio|barat[oa]|tienes|qu[eé]|para|con|m[aá]s|peque[ñn]a|busco)\b|[ñ¿¡]/i],
  ['pt-BR', /\b(voc[eê]|piscina|quanto|pre[cç]o|barat[ao]|n[aã]o|com|uma|quero|pequena|tem)\b|[ãõç]/i],
  ['fr-FR', /\b(le|les|une|je|veux|piscine|combien|prix|moins cher|avez|petite|pour|avec)\b|[èêàç]/i],
  ['de-DE', /\b(ich|ein|eine|der|die|das|und|pool|wie viel|preis|g[üu]nstig|klein|haben|mit)\b|[äöüß]/i],
  ['it-IT', /\b(il|una|voglio|piscina|quanto|prezzo|economic[ao]|piccola|avete|con|per)\b/i],
];

/** Language of a phrase; falls back to the browser language. Short English stays English. */
export function detectLanguage(text: string): string {
  const t = text.trim();
  if (t.length >= 3) {
    let best: [string, number] = ['en-US', 0];
    for (const [code, re] of HINTS) {
      const hits = (t.match(new RegExp(re.source, 'gi')) ?? []).length;
      if (hits > best[1]) best = [code, hits];
    }
    if (best[1] > 0 && !(best[0] === 'de-DE' && best[1] < 2)) return best[0];
    if (/^[\x00-\x7F]*$/.test(t)) return 'en-US';
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  return GENIUS_LANGUAGES.find((l) => l.code.slice(0, 2) === nav.slice(0, 2))?.code ?? 'en-US';
}

const cache = new Map<string, string>();

/** Translate many strings at once; English is a no-op; failures return the originals. */
export async function translateTexts(texts: string[], lang: string): Promise<string[]> {
  if (lang.startsWith('en') || !texts.length) return texts;
  const key = (t: string) => `${lang}|${t}`;
  const missing = [...new Set(texts.filter((t) => t && !cache.has(key(t))))];
  if (missing.length) {
    try {
      const { data } = await supabase.functions.invoke('genius-translate', {
        body: { texts: missing, language: languageName(lang) },
      });
      const out: string[] = data?.translations ?? [];
      missing.forEach((t, i) => out[i] && cache.set(key(t), out[i]));
    } catch {
      /* keep originals */
    }
  }
  return texts.map((t) => cache.get(key(t)) ?? t);
}

export const translateText = async (text: string, lang: string) => (await translateTexts([text], lang))[0];

/** Best native voice: exact locale, then same language, preferring natural/online voices. */
export function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const voices = synth?.getVoices() ?? [];
  if (!voices.length) return null;
  const base = lang.slice(0, 2).toLowerCase();
  const same = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(base));
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase() === lang.toLowerCase() ? 4 : 0) + (/natural|neural|online|premium|google/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
  return same.sort((a, b) => score(b) - score(a))[0] ?? null;
}

/* ---------- active guest language (shared by Genius chat, narrator and voice) ---------- */
const ACTIVE_KEY = 'wl.narrator.console.lang';
/** The language the guest is using now (last typed/spoken/selected); English by default. */
export function activeLanguage(): string {
  try { return localStorage.getItem(ACTIVE_KEY) || detectLanguage(''); } catch { return 'en-US'; }
}
export function setActiveLanguage(code: string) {
  try { localStorage.setItem(ACTIVE_KEY, code); } catch { /* private mode */ }
}
