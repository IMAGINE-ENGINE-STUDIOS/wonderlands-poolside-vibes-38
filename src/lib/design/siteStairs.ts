/**
 * Site access stairs — settings for the procedural stairs that join levels in
 * the 3D Studio. Credits: Imagine Engine Studios Corp.
 *
 * - "deck": raised deck → grade, or grade → sunken deck (inside the pit).
 * - "pool": raised pool rim → deck, so a pool taller than its deck can be reached.
 *
 * `start` is the position along the perimeter (0–1), `span` the length of the
 * run as a share of the perimeter (1 = full 360° wrap). Stored per browser and
 * broadcast with an event so the 3D view and the levels panel stay in sync.
 */
import * as React from "react";

export type StairKey = "deck" | "pool";
export interface StairRun { enabled: boolean; start: number; span: number; width: number }
export const STAIRS_KEY = "studio3d.siteStairs.v1";
export const STAIRS_EVENT = "studio3d:siteStairs";
const DEFAULTS: Record<StairKey, StairRun> = {
  deck: { enabled: true, start: 0.125, span: 0, width: 4 },
  pool: { enabled: true, start: 0.625, span: 0, width: 4 },
};

export function loadStairs(): Record<StairKey, StairRun> {
  try {
    const raw = JSON.parse(localStorage.getItem(STAIRS_KEY) || "{}");
    return { deck: { ...DEFAULTS.deck, ...raw.deck }, pool: { ...DEFAULTS.pool, ...raw.pool } };
  } catch { return { ...DEFAULTS }; }
}
export function updateStairs(key: StairKey, patch: Partial<StairRun>) {
  const all = loadStairs();
  all[key] = { ...all[key], ...patch };
  localStorage.setItem(STAIRS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(STAIRS_EVENT));
}
export function useSiteStairs() {
  const [s, set] = React.useState(loadStairs);
  React.useEffect(() => {
    const on = () => set(loadStairs());
    window.addEventListener(STAIRS_EVENT, on);
    return () => window.removeEventListener(STAIRS_EVENT, on);
  }, []);
  return s;
}

type XZ = { x: number; z: number };
/** Cumulative arc length of a closed ring (last entry = perimeter). */
export function ringLengths(ring: XZ[]) {
  const acc = [0];
  for (let i = 1; i <= ring.length; i++) {
    const a = ring[i - 1], b = ring[i % ring.length];
    acc.push(acc[i - 1] + Math.hypot(b.x - a.x, b.z - a.z));
  }
  return acc;
}
/** Point + unit tangent at perimeter share `u` (wraps). */
export function ringAt(ring: XZ[], acc: number[], u: number) {
  const L = acc[acc.length - 1] || 1;
  const d = (((u % 1) + 1) % 1) * L;
  let i = 0; while (i < ring.length - 1 && acc[i + 1] < d) i++;
  const a = ring[i], b = ring[(i + 1) % ring.length];
  const seg = acc[i + 1] - acc[i] || 1, t = (d - acc[i]) / seg;
  const tx = (b.x - a.x) / seg, tz = (b.z - a.z) / seg;
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, tx, tz };
}
/** Perimeter share closest to a point (used when dragging stairs). */
export function nearestU(ring: XZ[], acc: number[], p: XZ) {
  let best = 0, bd = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / l2));
    const d = Math.hypot(a.x + dx * t - p.x, a.z + dz * t - p.z);
    if (d < bd) { bd = d; best = (acc[i] + (acc[i + 1] - acc[i]) * t) / (acc[acc.length - 1] || 1); }
  }
  return best;
}
