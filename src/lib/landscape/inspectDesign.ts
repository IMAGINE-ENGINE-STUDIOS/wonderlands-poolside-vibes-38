/**
 * The Inspector — Training Plan, Phase 4.
 *
 * Every Genius-composed design is graded BEFORE the customer sees it,
 * against the rules a professional would check: the placement law, the
 * pool zone's species law, spacing at mature size, one water need per bed
 * (hydrozoning), the three layers, the brief's budget and its privacy
 * promise. Failures arrive NAMED, and repairLayout makes the one honest
 * repair — removing what breaks the rules — so what reaches the customer
 * has already survived review.
 */
import { measureLandscapeLayout, pointInPolygon, sampleBed, type LandscapeLayout, type LandscapePoint } from "./landscapeEstimate";
type Pt = LandscapePoint;
import { drawnSpreadFt, getPlantSpec, plantById, resolvePick } from "./plantSpecs";
import { poolZoneOk, traitsFor } from "./designTraits";

export interface InspectionIssue { rule: string; detail: string; plantingIds?: string[]; hard?: boolean }
export interface Inspection {
  score: number;
  passed: boolean;
  failures: InspectionIssue[];
  warnings: InspectionIssue[];
  total: number;
  plantCount: number;
}

export interface InspectOpts {
  /** Pool + deck footprint polygon, in px (the placement-law hole). */
  hole?: Pt[];
  /** Fence / screen linework, in px — plantings must keep clearance. */
  barriers?: Pt[][];
  budgetCap?: number;
  privacy?: boolean;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const distToSeg = (p: Pt, a: Pt, b: Pt) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const L2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

interface View { id: string; x: number; y: number; spreadFt: number; category: string; form: string }
const viewsOf = (layout: LandscapeLayout): View[] => layout.plantings.flatMap((p) => {
  const plant = plantById(p.plantId);
  if (!plant) return [];
  const variant = plant.variants.find((v) => v.id === p.variantId) ?? plant.variants[0];
  const spec = getPlantSpec(plant, variant?.label);
  const size = p.size ?? variant?.sizes[Math.min(1, Math.max(0, variant.sizes.length - 1))]?.size ?? "3 gal";
  return [{ id: p.id, x: p.x, y: p.y, spreadFt: drawnSpreadFt(spec, size), category: plant.category, form: spec.form }];
});

export function inspectDesign(layout: LandscapeLayout, opts: InspectOpts = {}): Inspection {
  const failures: InspectionIssue[] = [];
  const warnings: InspectionIssue[] = [];
  const takeoff = measureLandscapeLayout(layout);
  const views = viewsOf(layout);

  /* LAW — nothing in the water/deck hole, nothing on a fence or screen. */
  if (opts.hole?.length) {
    const inHole = layout.plantings.filter((p) => pointInPolygon({ x: p.x, y: p.y }, opts.hole!));
    if (inHole.length) failures.push({ rule: "placement-law", hard: true, plantingIds: inHole.map((p) => p.id), detail: `${inHole.length} plant(s) inside the pool/deck footprint` });
  }
  if (opts.barriers?.length) {
    const onLine = layout.plantings.filter((p) => opts.barriers!.some((poly) => poly.some((a, i) => i > 0 && distToSeg(p, poly[i - 1], a) < 12)));
    if (onLine.length) failures.push({ rule: "placement-law", hard: true, plantingIds: onLine.map((p) => p.id), detail: `${onLine.length} plant(s) on a fence or screen line` });
  }

  /* POOL ZONE — within 4 ft of the water's edge, only pool-safe species. */
  if (opts.hole?.length) {
    const xs = opts.hole.map((p) => p.x), ys = opts.hole.map((p) => p.y);
    const ring = { x0: Math.min(...xs) - 40, x1: Math.max(...xs) + 40, y0: Math.min(...ys) - 40, y1: Math.max(...ys) + 40 };
    const bad = layout.plantings.filter((p) => {
      if (pointInPolygon({ x: p.x, y: p.y }, opts.hole!)) return false;
      if (p.x < ring.x0 || p.x > ring.x1 || p.y < ring.y0 || p.y > ring.y1) return false;
      const plant = plantById(p.plantId);
      return plant ? !poolZoneOk(traitsFor(plant)) : false;
    });
    if (bad.length) failures.push({ rule: "pool-zone", hard: true, plantingIds: bad.map((p) => p.id), detail: `${bad.length} plant(s) beside the pool drop fruit or heavy litter into the water` });
  }

  /* SPACING — judged at mature canopy, not at planting size. */
  const crowded: string[] = [];
  for (let i = 0; i < views.length; i++) for (let j = i + 1; j < views.length; j++) {
    const a = views[i], b = views[j];
    const need = (Math.min(a.spreadFt, b.spreadFt) / 2) * 0.55 * 10;
    if (dist(a, b) < need) { crowded.push(a.id, b.id); }
  }
  if (crowded.length) failures.push({ rule: "spacing", plantingIds: [...new Set(crowded)], detail: `${new Set(crowded).size} plant(s) will crowd each other at mature size` });

  /* HYDROZONES — one water need per bed, or the drip line serves nobody. */
  for (const bed of layout.beds) {
    const poly = sampleBed(bed);
    if (poly.length < 3) continue;
    const inside = layout.plantings.filter((p) => pointInPolygon({ x: p.x, y: p.y }, poly));
    const waters = new Set(inside.map((p) => { const pl = plantById(p.plantId); return pl ? traitsFor(pl).water : null; }).filter(Boolean));
    if (waters.size > 1) failures.push({ rule: "hydrozone", plantingIds: inside.map((p) => p.id), detail: `Bed "${bed.label ?? bed.id}" mixes ${[...waters].join(" + ")} water needs on one drip zone` });
  }

  /* LAYERS — a real composition has all three (for designs of any size). */
  if (views.length >= 15) {
    const has = (pred: (v: View) => boolean) => views.some(pred);
    const canopy = has((v) => v.form === "tree" || v.form === "palm");
    const ground = has((v) => v.category === "Groundcover" || v.category === "Grasses" || v.form === "mat");
    if (!canopy) failures.push({ rule: "layers", detail: "No canopy layer — nothing gives the design height or shade" });
    if (!ground) warnings.push({ rule: "layers", detail: "No ground layer — beds will read unfinished at soil level" });
  }

  /* BUDGET — the brief's ceiling is a promise. */
  if (opts.budgetCap && takeoff.total > opts.budgetCap) {
    failures.push({ rule: "budget", detail: `Take-off $${Math.round(takeoff.total).toLocaleString()} is over the $${opts.budgetCap.toLocaleString()} brief by $${Math.round(takeoff.total - opts.budgetCap).toLocaleString()}` });
  }

  /* PRIVACY — a privacy brief must end with a real screen. */
  if (opts.privacy) {
    const topScreen = takeoff.species
      .map((s) => { const pl = plantById(s.key.split("|")[0]); return pl ? { qty: s.qty, score: traitsFor(pl).screening } : null; })
      .filter((x) => x && x.score >= 2)
      .sort((a, b) => b!.qty - a!.qty)[0];
    if (!topScreen || topScreen.qty < 6) failures.push({ rule: "privacy", detail: "The brief asked for privacy but no real screening run was planted" });
  }

  /* REPETITION — the "one of everything" amateur tell. */
  if (takeoff.species.length >= 6) {
    const singles = takeoff.species.filter((s) => s.qty === 1).length;
    if (singles / takeoff.species.length > 0.4) warnings.push({ rule: "repetition", detail: "Too many one-off species — professional planting repeats in rhythm" });
  }

  const score = Math.max(0, 100 - failures.reduce((a, f) => a + (f.hard ? 25 : 12), 0) - warnings.length * 3);
  return { score, passed: !failures.some((f) => f.hard) && score >= 70, failures, warnings, total: takeoff.total, plantCount: views.length };
}

/**
 * The one honest repair: remove what breaks the rules (law, pool zone,
 * crowding, mixed hydrozones), then step the most expensive accents down
 * until the budget holds — screening plants are removed last.
 */
export function repairLayout(layout: LandscapeLayout, insp: Inspection, opts: InspectOpts = {}): { layout: LandscapeLayout; removed: number } {
  const removeIds = new Set<string>();
  for (const f of insp.failures) if (f.plantingIds && f.rule !== "hydrozone") for (const id of f.plantingIds) removeIds.add(id);
  /* Hydrozone repair keeps the majority water band per flagged bed set. */
  for (const f of insp.failures.filter((x) => x.rule === "hydrozone")) {
    const ids = f.plantingIds ?? [];
    const bands = new Map<string, number>();
    for (const id of ids) { const p = layout.plantings.find((x) => x.id === id); const pl = p ? plantById(p.plantId) : null; if (pl) bands.set(traitsFor(pl).water, (bands.get(traitsFor(pl).water) ?? 0) + 1); }
    const keep = [...bands.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const id of ids) { const p = layout.plantings.find((x) => x.id === id); const pl = p ? plantById(p.plantId) : null; if (pl && traitsFor(pl).water !== keep) removeIds.add(id); }
  }
  let plantings = layout.plantings.filter((p) => !removeIds.has(p.id));
  let removed = removeIds.size;
  if (opts.budgetCap) {
    let total = measureLandscapeLayout({ ...layout, plantings }).total;
    const priceOf = (pid: string) => { const p = plantings.find((x) => x.id === pid); if (!p) return 0; const pl = plantById(p.plantId); if (!pl) return 0; const v = pl.variants.find((x) => x.id === p.variantId) ?? pl.variants[0]; return resolvePick(pl.id, v?.id, p.size)?.price ?? 0; };
    const screenScore = (pid: string) => { const p = plantings.find((x) => x.id === pid); const pl = p ? plantById(p.plantId) : null; return pl ? traitsFor(pl).screening : 0; };
    while (total > opts.budgetCap && plantings.length > 8) {
      const candidates = [...plantings].sort((a, b) => screenScore(a.id) - screenScore(b.id) || priceOf(b.id) - priceOf(a.id));
      const victim = candidates[0];
      if (!victim) break;
      plantings = plantings.filter((p) => p.id !== victim.id);
      removed++;
      total = measureLandscapeLayout({ ...layout, plantings }).total;
    }
  }
  return { layout: { ...layout, plantings }, removed };
}
