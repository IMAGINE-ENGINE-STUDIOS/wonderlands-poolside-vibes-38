/**
 * Central UI cache.
 *
 * Single, versioned, quota-safe access point for every piece of interface state
 * we want to survive a reload: viewport + element scroll positions, search
 * queries, filters, active categories, product selections, cart panels, etc.
 *
 * Kept intentionally tiny and synchronous (localStorage) so reads happen during
 * the first render and the app repaints exactly where the user left it.
 */

const PREFIX = 'wl_ui_';
const VERSION_KEY = 'wl_ui_cache_version';
const VERSION = '2';

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

export function cacheRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function cacheWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded — drop the oldest scroll map first, then give up */
    try {
      localStorage.removeItem('wl_scroll_elements_v1');
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }
}

export function cacheRemove(key: string): void {
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

export default { cacheRead, cacheWrite, cacheRemove, elementPath };
