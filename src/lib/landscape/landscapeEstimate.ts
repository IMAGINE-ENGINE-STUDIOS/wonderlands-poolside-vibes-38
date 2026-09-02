/**
 * Take-off and pricing for a planting plan.
 *
 * Kept out of the board component on purpose: the FLIP cost leaf, the suites
 * and the global design board all price the same drawing without pulling the
 * canvas code into their bundle.
 */

import { resolvePick } from "./plantSpecs";
import { samplePath, normalizeFlags, allCurved } from "@/utils/splineEditing";

/** Same scale as every other Wonderlands board: 10 px = 1 ft. */
export const LANDSCAPE_PX_PER_FT = 10;

export type BedFillId = "mulch-brown" | "mulch-black" | "shell" | "river-rock" | "lava-rock" | "sod" | "planted";

export interface BedFill {
  id: BedFillId;
  name: string;
  /** Installed price per square foot of bed surface */
  pricePerSqFt: number;
  /** Plan-view colour of the surface */
  color: string;
  /** Speckle colour used to texture the surface */
  fleck: string;
}

export const BED_FILLS: BedFill[] = [
  { id: "mulch-brown", name: "Pine bark mulch", pricePerSqFt: 1.35, color: "#8a6242", fleck: "#6c4a31" },
  { id: "mulch-black", name: "Black mulch", pricePerSqFt: 1.55, color: "#463c37", fleck: "#2f2825" },
  { id: "shell", name: "Crushed shell", pricePerSqFt: 2.1, color: "#ddd2bd", fleck: "#c2b49b" },
  { id: "river-rock", name: "River rock", pricePerSqFt: 4.25, color: "#a9a49b", fleck: "#847f77" },
  { id: "lava-rock", name: "Lava rock", pricePerSqFt: 3.75, color: "#8d4f47", fleck: "#6b3a34" },
  { id: "sod", name: "St. Augustine sod", pricePerSqFt: 1.15, color: "#5f8f4a", fleck: "#4d7a3b" },
  { id: "planted", name: "Planting bed only", pricePerSqFt: 0.85, color: "#5c5348", fleck: "#463f36" },
];

export const bedFill = (id: BedFillId) => BED_FILLS.find((f) => f.id === id) ?? BED_FILLS[0];

/** Bed edging and irrigation, installed. */
export const LANDSCAPE_RATES = {
  edgingPerFt: 6.5,
  /** Drip / bubbler zone extension, per plant */
  irrigationPerPlant: 14,
  /** Mulch depth used for the cubic-yard read-out */
  mulchDepthIn: 3,
  /** Bed prep, soil amendment and haul-off, per sq ft */
  bedPrepPerSqFt: 0.75,
};

/* ------------------------------------------------------------------ *
 * Geometry
 * ------------------------------------------------------------------ */

export interface LandscapePoint {
  x: number;
  y: number;
}

export interface LandscapeBed {
  id: string;
  points: LandscapePoint[];
  closed: boolean;
  /** Per-vertex curvature handles — a flagged vertex rounds both of its edges */
  curves?: boolean[];
  /** Legacy: every vertex curved */
  spline?: boolean;
  fill: BedFillId;
  /** Bed edging priced along the perimeter */
  edged?: boolean;
  label?: string;
}

export interface LandscapePlanting {
  id: string;
  plantId: string;
  variantId?: string;
  size?: string;
  x: number;
  y: number;
  /** Rotation in radians, so a drift does not look stamped */
  rot?: number;
}

export interface LandscapeLayout {
  beds: LandscapeBed[];
  plantings: LandscapePlanting[];
  /** Irrigation extended to every plant on the plan */
  irrigation?: boolean;
}

export const emptyLandscapeLayout = (): LandscapeLayout => ({ beds: [], plantings: [], irrigation: false });

export const bedCurveFlags = (bed: LandscapeBed): boolean[] =>
  bed.spline ? allCurved(bed.points.length) : normalizeFlags(bed.curves, bed.points.length);

/** Outline of a bed after curvature handles are applied. */
export const sampleBed = (bed: LandscapeBed): LandscapePoint[] =>
  bed.points.length < 3 ? bed.points : samplePath(bed.points, bed.closed, bedCurveFlags(bed));

export function polygonAreaSqFt(pts: LandscapePoint[]): number {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum / 2) / (LANDSCAPE_PX_PER_FT * LANDSCAPE_PX_PER_FT);
}

export function perimeterFt(pts: LandscapePoint[], closed: boolean): number {
  if (pts.length < 2) return 0;
  let d = 0;
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    d += Math.hypot(a.x - b.x, a.y - b.y);
  }
  return d / LANDSCAPE_PX_PER_FT;
}

export function pointInPolygon(p: LandscapePoint, pts: LandscapePoint[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/* ------------------------------------------------------------------ *
 * Take-off
 * ------------------------------------------------------------------ */

export interface SpeciesLine {
  key: string;
  name: string;
  variant: string;
  size: string;
  qty: number;
  unit: number;
  amount: number;
  category: string;
  bloom: string | null;
  foliage: string;
}

export interface BedLine {
  id: string;
  fill: string;
  areaSqFt: number;
  edgeFt: number;
  amount: number;
}

export interface LandscapeTakeoff {
  bedSqFt: number;
  edgeFt: number;
  plantCount: number;
  mulchYards: number;
  beds: BedLine[];
  species: SpeciesLine[];
  plantTotal: number;
  bedTotal: number;
  irrigationTotal: number;
  total: number;
}

export const plantingKey = (p: LandscapePlanting) => `${p.plantId}|${p.variantId ?? ""}|${p.size ?? ""}`;

export function measureLandscapeLayout(layout: LandscapeLayout): LandscapeTakeoff {
  const beds: BedLine[] = [];
  let bedSqFt = 0;
  let edgeFt = 0;
  let bedTotal = 0;

  for (const bed of layout.beds) {
    if (!bed.closed || bed.points.length < 3) continue;
    const outline = sampleBed(bed);
    const area = polygonAreaSqFt(outline);
    const edge = perimeterFt(outline, true);
    const fill = bedFill(bed.fill);
    const amount =
      area * (fill.pricePerSqFt + LANDSCAPE_RATES.bedPrepPerSqFt) +
      (bed.edged ? edge * LANDSCAPE_RATES.edgingPerFt : 0);
    bedSqFt += area;
    edgeFt += bed.edged ? edge : 0;
    bedTotal += amount;
    beds.push({ id: bed.id, fill: fill.name, areaSqFt: area, edgeFt: edge, amount });
  }

  const grouped = new Map<string, SpeciesLine>();
  let plantTotal = 0;

  for (const planting of layout.plantings) {
    const pick = resolvePick(planting.plantId, planting.variantId, planting.size);
    if (!pick) continue;
    const key = plantingKey(planting);
    const line = grouped.get(key);
    if (line) {
      line.qty += 1;
      line.amount += pick.price;
    } else {
      grouped.set(key, {
        key,
        name: pick.plant.name,
        variant: pick.variantLabel,
        size: pick.size,
        qty: 1,
        unit: pick.price,
        amount: pick.price,
        category: pick.plant.category,
        bloom: pick.spec.bloom,
        foliage: pick.spec.foliage,
      });
    }
    plantTotal += pick.price;
  }

  const plantCount = layout.plantings.length;
  const irrigationTotal = layout.irrigation ? plantCount * LANDSCAPE_RATES.irrigationPerPlant : 0;
  const mulchYards = (bedSqFt * (LANDSCAPE_RATES.mulchDepthIn / 12)) / 27;

  const species = [...grouped.values()].sort((a, b) => b.amount - a.amount);

  return {
    bedSqFt: Math.round(bedSqFt),
    edgeFt: Math.round(edgeFt),
    plantCount,
    mulchYards: Math.round(mulchYards * 10) / 10,
    beds,
    species,
    plantTotal: Math.round(plantTotal),
    bedTotal: Math.round(bedTotal),
    irrigationTotal: Math.round(irrigationTotal),
    total: Math.round(plantTotal + bedTotal + irrigationTotal),
  };
}
