import * as React from "react";
import { cacheRead, cacheWrite } from "@/lib/uiCache";

/**
 * Shared camera altitude for every drawing board.
 *
 * "Altitude" is how much land the camera frames across the sheet, in feet.
 * Each board draws at its own px-per-foot scale, so a raw zoom factor cannot be
 * carried between them — feet across can. Whenever the draughtsman zooms on any
 * board, that altitude is remembered here (and cached), and every other board —
 * site, enclosure, fence, turf, planting — opens at exactly the same altitude on
 * its next mount instead of a hard-coded default.
 */

const KEY = "board_camera_altitude_ft";
const FALLBACK_FT = 20;
const MIN_FT = 4;
const MAX_FT = 2000;

const clamp = (ft: number) => Math.min(MAX_FT, Math.max(MIN_FT, ft));

let current: number | null = null;
const subs = new Set<() => void>();

const read = (): number => {
  if (current == null) {
    const stored = cacheRead<number>(KEY, FALLBACK_FT);
    current = clamp(Number.isFinite(stored) && stored > 0 ? stored : FALLBACK_FT);
  }
  return current;
};

/** Read the remembered altitude without subscribing (for first-mount framing). */
export const readBoardAltitudeFt = (): number => read();

/** Remember the altitude the draughtsman is now flying at. */
export function setBoardAltitudeFt(ft: number) {
  if (!Number.isFinite(ft) || ft <= 0) return;
  const next = clamp(+ft.toFixed(2));
  /* a sub-percent drift is the same altitude — never thrash the cache on it */
  if (current != null && Math.abs(next - current) / current < 0.01) return;
  current = next;
  cacheWrite(KEY, next);
  subs.forEach((fn) => fn());
}

/** Subscribe to the shared altitude (live readouts, cross-board sync). */
export function useBoardAltitudeFt(): number {
  return React.useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    read,
    read,
  );
}

export default useBoardAltitudeFt;
