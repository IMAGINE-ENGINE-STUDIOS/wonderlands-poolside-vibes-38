/**
 * Landscape → 3D handoff. Converts the planting plan (board px, 10 px/ft) into
 * real-size plant markers in 3D feet, centred on the pool (or the plan when no
 * pool is drawn). Stored in localStorage so /studio-3d and the showroom 3D
 * studio pick it up; LandscapePlants3D draws it.
 */
import { LANDSCAPE_PX_PER_FT as PX, type LandscapeLayout } from "@/lib/landscape/landscapeEstimate";
import { resolvePick, drawnSpreadFt, type PlantForm } from "@/lib/landscape/plantSpecs";

export const LANDSCAPE_3D_KEY = "studio3d.landscape.v1";
export const LANDSCAPE_3D_EVENT = "studio3d:landscape";

export interface Plant3D { x: number; z: number; h: number; spread: number; form: PlantForm; foliage: string; bloom: string | null; rot: number; /** Sketchfab search query for the real model of this exact catalog plant. */ q?: string }
export interface Bed3D { points: { x: number; z: number }[] }
export interface Landscape3D { plants: Plant3D[]; beds: Bed3D[] }

type Hole = { x0: number; y0: number; x1: number; y1: number } | undefined;

export function layoutTo3D(layout: LandscapeLayout, hole: Hole): Landscape3D {
  let cx: number, cy: number;
  if (hole) { cx = (hole.x0 + hole.x1) / 2; cy = (hole.y0 + hole.y1) / 2; }
  else {
    const xs = layout.plantings.map((p) => p.x / PX), ys = layout.plantings.map((p) => p.y / PX);
    cx = xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0;
    cy = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : 0;
  }
  const plants: Plant3D[] = [];
  for (const p of layout.plantings) {
    const pick = resolvePick(p.plantId, p.variantId, p.size);
    if (!pick) continue;
    const spec = pick.spec;
    const spread = drawnSpreadFt(spec, pick.size);
    const k = spec.spreadFt > 0 ? spread / spec.spreadFt : 1;
    const nm = pick.plant.name.includes(',') ? pick.plant.name.split(',').map((w) => w.trim()).reverse().join(' ') : pick.plant.name;
    plants.push({ x: p.x / PX - cx, z: p.y / PX - cy, h: Math.max(0.5, spec.heightFt * k), spread, form: spec.form, foliage: spec.foliage, bloom: spec.bloom, rot: p.rot ?? 0, q: nm.toLowerCase() });
  }
  const beds = layout.beds.map((b) => ({ points: b.points.map((pt) => ({ x: pt.x / PX - cx, z: pt.y / PX - cy })) }));
  return { plants, beds };
}

export function saveLandscape3D(data: Landscape3D) {
  try { localStorage.setItem(LANDSCAPE_3D_KEY, JSON.stringify(data)); } catch { /* quota */ }
  window.dispatchEvent(new Event(LANDSCAPE_3D_EVENT));
}

export function loadLandscape3D(): Landscape3D | null {
  try { const raw = localStorage.getItem(LANDSCAPE_3D_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function clearLandscape3D() {
  try { localStorage.removeItem(LANDSCAPE_3D_KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event(LANDSCAPE_3D_EVENT));
}
