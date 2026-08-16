/**
 * Tiny store so any surface (the FLIP left rail, a page, a widget) can open or
 * close the Genius panel without prop drilling.
 *
 * Genius is on by default: the panel restores open unless the guest closed it.
 */

const STORAGE_KEY = "wl.genius.panel.open";

let open = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
})();

const listeners = new Set<(open: boolean) => void>();

export const isGeniusOpen = () => open;

export function setGeniusOpen(next: boolean) {
  if (open === next) return;
  open = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((l) => l(open));
}

export const toggleGenius = () => setGeniusOpen(!open);

export function subscribeGeniusPanel(listener: (open: boolean) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
