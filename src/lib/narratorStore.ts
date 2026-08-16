/**
 * Narrator page-context store.
 *
 * Any screen (FLIP spreads, studio, product pages) can publish what the guest is
 * currently looking at. The narrator orb subscribes and reads that page aloud.
 * Kept as a tiny external store so no extra provider nesting or re-render cost is
 * added to the FLIP render path.
 */

export type NarratorScope = 'index' | 'category' | 'product' | 'feature' | 'page';

export interface NarratorContext {
  scope: NarratorScope;
  title: string;
  category?: string;
  product?: string;
  price?: number;
  features?: string[];
  route?: string;
  /** Stable key used for script + audio caching */
  key: string;
}

export interface NarratorAction {
  label: string;
  type: 'branch' | 'add_to_cart' | 'navigate' | 'calculate';
  payload?: string;
}

export interface NarratorScript {
  script: string;
  actions: NarratorAction[];
}

type Listener = (ctx: NarratorContext | null) => void;

const listeners = new Set<Listener>();
let current: NarratorContext | null = null;

/** Script cache keyed by context key — avoids re-billing on flip-backs. */
const scriptCache = new Map<string, NarratorScript>();
/** Object-URL cache for generated audio, same keying. */
const audioCache = new Map<string, string>();

const MAX_CACHE = 40;

function trim<T>(map: Map<string, T>, onEvict?: (value: T) => void) {
  while (map.size > MAX_CACHE) {
    const oldest = map.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    const value = map.get(oldest);
    map.delete(oldest);
    if (value !== undefined) onEvict?.(value);
  }
}

export function setNarratorContext(ctx: NarratorContext | null) {
  if (ctx && current && ctx.key === current.key) return;
  current = ctx;
  listeners.forEach((l) => l(current));
}

export function getNarratorContext() {
  return current;
}

export function subscribeNarrator(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCachedScript(key: string) {
  return scriptCache.get(key);
}

export function cacheScript(key: string, script: NarratorScript) {
  scriptCache.set(key, script);
  trim(scriptCache);
}

export function getCachedAudio(key: string) {
  return audioCache.get(key);
}

export function cacheAudio(key: string, url: string) {
  audioCache.set(key, url);
  trim(audioCache, (old) => URL.revokeObjectURL(old));
}
