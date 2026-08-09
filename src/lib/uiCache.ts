/**
 * Central UI cache.
 *
 * Single, versioned, quota-safe access point for every piece of interface state
 * we want to survive a reload: viewport + element scroll positions, search
 * queries, filters, active categories, product selections, cart panels, etc.
 *
 * Performance model:
 *  - Reads are served from an in-memory map, so a hot path never pays for
 *    `JSON.parse` more than once per key.
 *  - Writes are coalesced per key and flushed on an idle callback (or a short
 *    timeout fallback), so scroll/drag/typing bursts never block paint with
 *    synchronous `localStorage` I/O.
 *  - Anything that would exceed the sanity size limit is skipped rather than
 *    thrashing the quota.
 */

const PREFIX = 'wl_ui_';
const VERSION_KEY = 'wl_ui_cache_version';
const VERSION = '2';
const MAX_ENTRY_BYTES = 256 * 1024; // per-key sanity cap
const FLUSH_DELAY_MS = 400;

// Drop the whole namespace when the shape/version changes (software update).
try {
  if (localStorage.getItem(VERSION_KEY) !== VERSION) {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX) || k.startsWith('wl_scroll_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(VERSION_KEY, VERSION);
  }
} catch {
  /* storage unavailable (private mode, quota) — cache simply disabled */
}

/** Hydrated values, keyed without the prefix. */
const memory = new Map<string, unknown>();
/** Keys whose in-memory value has not reached localStorage yet. */
const dirty = new Set<string>();
let flushHandle: number | null = null;

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function serialize(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function flush(): void {
  flushHandle = null;
  if (!dirty.size) return;
  const keys = Array.from(dirty);
  dirty.clear();
  for (const key of keys) {
    const raw = serialize(memory.get(key));
    if (raw === null || raw.length > MAX_ENTRY_BYTES) continue;
    try {
      localStorage.setItem(PREFIX + key, raw);
    } catch {
      /* quota exceeded — reclaim the biggest offender, then give up quietly */
      try {
        localStorage.removeItem(PREFIX + 'scroll_elements');
        localStorage.setItem(PREFIX + key, raw);
      } catch {
        /* ignore */
      }
    }
  }
}

function scheduleFlush(): void {
  if (flushHandle !== null) return;
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === 'function') {
    flushHandle = w.requestIdleCallback(flush, { timeout: FLUSH_DELAY_MS });
  } else {
    flushHandle = window.setTimeout(flush, FLUSH_DELAY_MS);
  }
}

/** Force pending writes out — used when the page is being hidden/unloaded. */
export function cacheFlush(): void {
  flush();
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

export function cacheRead<T>(key: string, fallback: T): T {
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) {
      memory.set(key, fallback);
      return fallback;
    }
    const parsed = JSON.parse(raw) as T;
    memory.set(key, parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

export function cacheWrite(key: string, value: unknown): void {
  if (memory.get(key) === value) return; // identical reference, nothing to do
  memory.set(key, value);
  dirty.add(key);
  scheduleFlush();
}

export function cacheRemove(key: string): void {
  memory.delete(key);
  dirty.delete(key);
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** Stable-enough selector path for an element, used to key its scroll offset. */
export function elementPath(el: Element): string {
  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;
  while (node && node !== document.body && depth < 8) {
    if (node.id) {
      parts.unshift('#' + node.id);
      break;
    }
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.children, node);
    parts.unshift(`${node.tagName.toLowerCase()}:${index}`);
    node = parent;
    depth += 1;
  }
  return parts.join('>');
}

export default { cacheRead, cacheWrite, cacheRemove, cacheFlush, elementPath };
