/**
 * Whole-scene take-off for the 3D Studio header: every extra pool/spa (shell,
 * coping, waterline, sun benches/seating), every drawn or attached deck, turf,
 * fence and screen enclosure handed off from the 2D Design Studio. Quantities
 * come from the 3D geometry (feet); rates come only from the site's own price
 * lists — the 2D site element (by item id) or the paver/coping catalogs.
 * Each line carries the photo of the exact product drawn (never a random one).
 * Imagine Engine Studios Corp.
 */
import type { Board3D } from "@/lib/design/board3D";
import type { ContourSeatingConfig } from "@/components/scene3d/poolAssetTypes";
import { paverTypes } from "@/data/paverData";
import { getCopingPricePerSqFtByName, DEFAULT_PAVER_PRICE_PER_SQFT } from "@/utils/paverPricing";
import { buildPaverTextures, buildWaterlineTextures } from "@/data/textureLibrary";

/** Waterline tile is a flat price for the whole waterline of each pool or spa. */
export const WATERLINE_FLAT_PER_BODY = 4500;
/** Sun benches / built-in seating are billed at the spa & tanning-ledge multiplier (4x vs 3.5x). */
export const LEDGE_FACTOR = 4 / 3.5;

type XZ = { x: number; z: number };
export interface TakeoffLine { name: string; price: number; image?: string }
export interface BodyLine { name: string; areaSqFt: number; multiplierLabel?: string; price: number }
/** Minimal shape of a 2D site element (rate + unit + its own catalog photo). */
export interface RatedItem { id: string; label: string; rate: number; unit: "lf" | "sqft"; image?: string; /** Fence/screen door lines (name + price). */ doorLines?: Array<{ name: string; price: number }> }

const area = (r: XZ[]) => Math.abs(r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + p.x * q.z - q.x * p.z; }, 0) / 2);
const length = (r: XZ[], closed: boolean) => r.reduce((s, p, i) => (i === 0 && !closed ? s : s + Math.hypot(p.x - r[(i - 1 + r.length) % r.length].x, p.z - r[(i - 1 + r.length) % r.length].z)), 0);
const regionsArea = (regions: XZ[][][]) => regions.reduce((s, poly) => s + poly.reduce((a, r, k) => a + (k === 0 ? area(r) : -area(r)), 0), 0);
const paverByImage = (img?: string) => paverTypes.find((p) => p.image === img);
let copingNames: Map<string, string> | null = null;
const copingName = (url: string) => (copingNames ??= new Map(buildPaverTextures("coping").map((t) => [t.url, t.name]))).get(url);
let wNames: Map<string, string> | null = null;
const wName = (url: string) => (wNames ??= new Map(buildWaterlineTextures().map((t) => [t.url, t.name]))).get(url);

const SEAT_LABEL: Record<string, string> = { sunbench: "Sun bench", lounge: "Lounge ledge", bench: "Bench seating", corner: "Corner seat", contour: "Contour seating" };

/**
 * Seating / sun-bench lines for one body. The shell is $X/sq ft until seats
 * are added; the seat footprint (arc length × width) moves up to the ledge
 * rate, so the line is the upgrade on that footprint only.
 */
export function seatingLines(bodyName: string, seats: ContourSeatingConfig[] | undefined, outline: XZ[], shellRate: number): TakeoffLine[] {
  if (!seats?.length || outline.length < 3) return [];
  const per = length(outline, true);
  const up = shellRate * (LEDGE_FACTOR - 1);
  return seats.map((s) => {
    const span = Math.min(1, Math.abs(s.endPosition - s.startPosition));
    const sq = span * per * s.width;
    return { name: `${bodyName} ${SEAT_LABEL[s.kind ?? "contour"]} — ${Math.round(sq)} sq ft at ledge rate ($${Math.round(shellRate * LEDGE_FACTOR)}/sq ft)`, price: sq * up };
  }).filter((l) => l.price > 0);
}

export function board3DTakeoff(data: Board3D | null, items: RatedItem[], shellRate: number): { bodies: BodyLine[]; lines: TakeoffLine[] } {
  if (!data) return { bodies: [], lines: [] };
  const byId = new Map(items.map((i) => [i.id, i]));
  const bodies: BodyLine[] = []; const lines: TakeoffLine[] = [];
  let pools = 0, spas = 0;
  for (const w of data.waters ?? []) {
    if (w.pts.length < 3) continue;
    const spa = w.kind === "spa";
    const rate = spa ? shellRate * LEDGE_FACTOR : shellRate;
    const a = area(w.pts);
    const name = spa ? `Spa ${++spas}` : `Pool ${++pools + 1}`;
    bodies.push({ name, areaSqFt: a, multiplierLabel: `$${Math.round(rate)}/sq ft`, price: a * rate });
    const per = length(w.pts, true);
    const cName = copingName(w.coping);
    const cRate = getCopingPricePerSqFtByName(cName);
    if (cRate > 0) lines.push({ name: `${spa ? "Spa" : "Pool"} coping · ${cName} (${Math.round(per)} lf)`, price: per * (w.copingWidth || 1) * cRate, image: w.coping });
    if (w.waterline) lines.push({ name: `${name} waterline tile${wName(w.waterline) ? ` · ${wName(w.waterline)}` : ""}`, price: WATERLINE_FLAT_PER_BODY, image: w.waterline });
    if (!spa) lines.push(...seatingLines(name, w.seating, w.pts, shellRate));
  }
  for (const s of data.surfaces) {
    const q = regionsArea(s.regions); if (q <= 0) continue;
    const item = s.itemId ? byId.get(s.itemId) : undefined;
    if (s.kind === "deck") {
      const p = paverByImage(s.image);
      const rate = item?.rate ?? p?.basePrice ?? DEFAULT_PAVER_PRICE_PER_SQFT;
      lines.push({ name: `Deck · ${item?.label ?? p?.name ?? "Pavers"} (${Math.round(q)} sq ft)`, price: q * rate, image: p?.image ?? item?.image });
    } else if (item) lines.push({ name: `Turf · ${item.label} (${Math.round(q)} sq ft)`, price: q * item.rate, image: item.image });
  }
  for (const f of data.fences) {
    const item = f.itemId ? byId.get(f.itemId) : undefined; if (!item) continue;
    const q = length(f.pts, false); lines.push({ name: `Fence · ${item.label} (${Math.round(q)} lf)`, price: q * item.rate, image: item.image });
    item.doorLines?.forEach((d) => lines.push({ ...d, image: item.image }));
  }
  for (const s of data.screens) {
    const item = s.itemId ? byId.get(s.itemId) : undefined; if (!item) continue;
    const q = item.unit === "lf" ? length(s.pts, true) : area(s.pts);
    lines.push({ name: `Screen · ${item.label} (${Math.round(q)} ${item.unit})`, price: q * item.rate, image: item.image });
    item.doorLines?.forEach((d) => lines.push({ ...d, image: item.image }));
  }
  return { bodies, lines: lines.filter((l) => l.price > 0) };
}
