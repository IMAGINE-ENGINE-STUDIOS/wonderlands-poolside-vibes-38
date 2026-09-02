// Solar project gallery — local memory of every solar study a reader captures.
//
// The Total Solar Calculator keeps ONE live session in localStorage
// (SOLAR_SESSION_KEY). This module keeps the *history*: a small, capped list of
// previous studies (address, framing, captured roof faces, hardware choices and
// the headline numbers) so a reader can reload earlier work instead of tracing a
// roof twice. Everything is browser-local — no network, no account required.
import type { SolarSession } from "@/components/solar/solarSession";
import type { AerialView } from "@/components/solar/AerialCanvas";

export interface SolarProjectEntry {
  id: string;
  savedAt: number;
  /** headline label — the address, or a fallback */
  title: string;
  /** the full session, restorable verbatim */
  session: SolarSession;
  /** where the aerial was framed, so a reload lands on the same roof */
  view: AerialView | null;
  /** cached summary numbers so the gallery renders without recomputing */
  summary: {
    kwDc: number;
    yearlyKwh: number;
    netCost: number;
    faces: number;
  };
}

const KEY = "solar_project_gallery_v1";
const MAX_ENTRIES = 40;

const read = (): SolarProjectEntry[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as SolarProjectEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const write = (list: SolarProjectEntry[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    /* storage full or blocked — the live session still holds the work */
  }
  window.dispatchEvent(new Event("solar-gallery-change"));
};

export const listSolarProjects = (): SolarProjectEntry[] =>
  read().sort((a, b) => b.savedAt - a.savedAt);

/**
 * Save (or refresh) a study. Two captures of the same address collapse into one
 * entry so the gallery stays a list of properties, not a list of keystrokes.
 */
export const saveSolarProject = (
  entry: Omit<SolarProjectEntry, "id" | "savedAt"> & { id?: string },
): SolarProjectEntry => {
  const list = read();
  const key = entry.title.trim().toLowerCase();
  const existing = list.find((e) => e.id === entry.id || e.title.trim().toLowerCase() === key);
  const saved: SolarProjectEntry = {
    ...entry,
    id: existing?.id ?? `solar-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: Date.now(),
  };
  write([saved, ...list.filter((e) => e.id !== saved.id)]);
  return saved;
};

export const deleteSolarProject = (id: string) => write(read().filter((e) => e.id !== id));

export const clearSolarProjects = () => write([]);

/** Subscribe to gallery changes (same-tab writes and other-tab storage events). */
export const onSolarGalleryChange = (fn: () => void) => {
  const handler = () => fn();
  window.addEventListener("solar-gallery-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("solar-gallery-change", handler);
    window.removeEventListener("storage", handler);
  };
};
