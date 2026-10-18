/**
 * Net take-off areas for the Global Design Board V2.
 * Imagine Engine Studios Corp.
 *
 * Rule (one place, used by the board's take-off, header and total):
 *  - Pools and spas are counted whole.
 *  - Deck = drawn deck MINUS water/coping and decks drawn before it
 *    (existing surfaces keep their material where drawings overlap).
 *  - Turf = drawn turf MINUS pools, spas, coping and decks, MINUS earlier turf.
 *  - Screens cover everything (gross footprint); fences are linear (untouched).
 * Uses polygon-clipping (already used by paverAreaLogic) for exact booleans.
 */
import polygonClipping from "polygon-clipping";

export type NetPt = { x: number; y: number };
export type NetItem = { id: string; kind: string; pts: NetPt[] };
type Ring = [number, number][];

const ring = (pts: NetPt[]): Ring => {
  const r = pts.map((p) => [p.x, p.y] as [number, number]);
  if (r.length >= 3) r.push([r[0][0], r[0][1]]);
  return r;
};
const ringArea = (r: Ring) => {
  let s = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[i][1] - r[j][1]);
  return Math.abs(s / 2);
};
const multiArea = (m: Ring[][]) => m.reduce((s, poly) => s + poly.reduce((a, r, i) => a + (i ? -ringArea(r) : ringArea(r)), 0), 0);
const gross = (pts: NetPt[]) => (pts.length < 3 ? 0 : ringArea(ring(pts)));

/** What each surface kind is cut by (besides earlier items of the same kind). */
const CUT_BY: Record<string, string[]> = { deck: ["pool", "spa", "coping"], turf: ["pool", "spa", "coping", "deck"] };

/** Net sq ft per item id (only for area kinds). Fences are not included. */
export function computeNetAreas(items: NetItem[]): Map<string, number> {
  const out = new Map<string, number>();
  items.forEach((it, idx) => {
    if (it.kind === "fence" || it.pts.length < 3) return;
    const cutKinds = CUT_BY[it.kind];
    if (!cutKinds) { out.set(it.id, gross(it.pts)); return; }
    const cuts = items
      .filter((o, j) => o.id !== it.id && o.pts.length >= 3 && (cutKinds.includes(o.kind) || (o.kind === it.kind && j < idx)))
      .map((o) => [ring(o.pts)]);
    if (!cuts.length) { out.set(it.id, gross(it.pts)); return; }
    try {
      const res = polygonClipping.difference([ring(it.pts)] as never, ...(cuts as never[])) as unknown as Ring[][];
      out.set(it.id, multiArea(res));
    } catch {
      out.set(it.id, gross(it.pts));
    }
  });
  return out;
}

/** Polygons that cut a given item (used by the 3D view to punch holes). */
export function cuttersFor(items: NetItem[], it: NetItem): NetPt[][] {
  const cutKinds = CUT_BY[it.kind] ?? [];
  const idx = items.findIndex((o) => o.id === it.id);
  return items.filter((o, j) => o.id !== it.id && o.pts.length >= 3 && (cutKinds.includes(o.kind) || (o.kind === it.kind && j < idx))).map((o) => o.pts);
}

/** Exact clipped regions (outer + holes) for 3D surfaces. */
export function netRegions(items: NetItem[], it: NetItem): NetPt[][][] {
  const cuts = cuttersFor(items, it).map((p) => [ring(p)]);
  try {
    const res = (cuts.length
      ? polygonClipping.difference([ring(it.pts)] as never, ...(cuts as never[]))
      : [[ring(it.pts)]]) as unknown as Ring[][];
    return res.map((poly) => poly.map((r) => r.slice(0, -1).map(([x, y]) => ({ x, y }))));
  } catch {
    return [[it.pts]];
  }
}
