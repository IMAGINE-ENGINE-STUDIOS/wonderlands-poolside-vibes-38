/**
 * Composition grammar — Training Plan, Phase 3.
 *
 * Blueprints supply species and beds; the grammar supplies the STRUCTURE a
 * professional composition obeys, whatever the style:
 *
 *  - THREE LAYERS everywhere: canopy (palms/trees) over mid (shrubs and
 *    flowering) over ground (grasses and groundcover). A missing layer is
 *    the amateur tell — the grammar fills it with a trait-clean species.
 *  - A FOCAL POINT: one named hero (specimen palm, a standard tree) placed
 *    at the back, on the yard's main sight line, in an odd-number group.
 *  - RHYTHM: accents come in odd numbers (3, 5) — never a lonely pair.
 *  - SYMMETRY for formal languages: a left-side composition gets its
 *    right-side twin, same species, same pattern.
 *
 * The grammar works in the engine's vocabulary (sides, patterns, counts)
 * and defers all geometry to landscapeOps, so every placement law still
 * holds. Species it adds are filtered through the same trait law as the
 * brief (designBrief.violates is the single source of that law).
 */
import { landscapingPlants } from "@/data/landscapingData";
import { findPlant, type LandscapeEdit, type PlantOp } from "./landscapeOps";
import { briefToEdits, type DesignBrief } from "./designBrief";
import { poolZoneOk, traitsFor } from "./designTraits";

const CANOPY = new Set(["Palms", "Trees"]);
const GROUND = new Set(["Groundcover", "Grasses"]);

const FOCALS: Record<string, string[]> = {
  "tropical-poolside": ["Palm, Adonidia", "Bird of Paradise"],
  "palm-beach-estate": ["Palm, Queen", "Palm, Sylvester"],
  "formal-garden-axis": ["Crape Myrtle STD", "Palm, Adonidia"],
  "courtyard-garden-room": ["Live Oak", "Crape Myrtle STD"],
  "coastal-native": ["Palm, Cabbage/Sabal", "Sea Grape"],
  "modern-minimal": ["Palm, Bismark", "Italian Cypress"],
  "formal-topiary": ["Italian Cypress", "Podocarpus"],
  "themed-patio": ["Bird of Paradise", "Palm, Adonidia"],
};
const FORMAL = new Set(["formal-garden-axis", "palm-beach-estate", "formal-topiary"]);
const GROUND_FILLERS = ["Perennial Peanut", "Blue Daze", "Jasmine Minima", "Liriope"];
const MID_FILLERS = ["Ixora", "Plumbago", "Lantana"];

export interface Composition {
  edits: LandscapeEdit[];
  rationale: string[];
  substitutions: Array<{ from: string; to: string; reason: string }>;
  grammarNotes: string[];
}

const layersOf = (ops: PlantOp[]): { canopy: boolean; mid: boolean; ground: boolean } => {
  const cats = new Set(ops.map((o) => findPlant(o.query)?.category).filter(Boolean));
  return {
    canopy: [...cats].some((c) => CANOPY.has(c!)),
    mid: [...cats].some((c) => !CANOPY.has(c!) && !GROUND.has(c!)),
    ground: [...cats].some((c) => GROUND.has(c!)),
  };
};

const cleanPick = (names: string[], brief: DesignBrief, prefer?: Set<string>): string | null => {
  const ordered = [...names].sort((a, b) => (prefer?.has(b) ? 1 : 0) - (prefer?.has(a) ? 1 : 0));
  for (const n of ordered) {
    const p = findPlant(n);
    if (!p) continue;
    if (brief.avoid.includes(p.id) || brief.avoidCategories.includes(p.category)) continue;
    const t = traitsFor(p);
    if (brief.waterfront && !t.salt) continue;
    if (brief.maintenance === "low" && t.water === "high") continue;
    return p.name;
  }
  return null;
};

/** Compose a brief into engine edits with professional structure. */
export function composeFromBrief(brief: DesignBrief, opts?: { prefer?: Set<string> }): Composition {
  const base = briefToEdits(brief, opts);
  const edits: LandscapeEdit[] = base.edits.map((e) => ({ ...e, add: e.add ? e.add.map((o) => ({ ...o })) : undefined }));
  const notes: string[] = [];
  const style = brief.style ?? "tropical-poolside";
  const allOps = () => edits.flatMap((e) => e.add ?? []);

  /* RHYTHM — accents in odd numbers. */
  for (const e of edits) for (const o of e.add ?? []) {
    if (o.pattern === "accent" && o.count && o.count >= 2 && o.count % 2 === 0) o.count += 1;
  }

  /* SYMMETRY — formal languages mirror their sides. */
  if (FORMAL.has(style)) {
    const ops = allOps();
    const lefts = ops.filter((o) => o.side === "left");
    const rights = ops.filter((o) => o.side === "right");
    const twins: PlantOp[] = [];
    for (const l of lefts) if (!rights.some((r) => r.query === l.query && r.pattern === l.pattern)) twins.push({ ...l, side: "right" });
    for (const r of rights) if (!lefts.some((l) => l.query === r.query && l.pattern === r.pattern)) twins.push({ ...r, side: "left" });
    if (twins.length) { edits.push({ add: twins }); notes.push("Mirrored the side plantings — formal designs balance left against right."); }
  }

  /* LAYERS + FOCAL — fill what the blueprint left out. */
  const fills: PlantOp[] = [];
  const layers = layersOf(allOps());
  if (!layers.canopy || !allOps().some((o) => o.pattern === "accent" && CANOPY.has(findPlant(o.query)?.category ?? ""))) {
    const focalNames = [...(FOCALS[style] ?? FOCALS["tropical-poolside"])].sort((a, b) => {
      const ca = findPlant(a)?.category, cb = findPlant(b)?.category;
      return (CANOPY.has(cb ?? "") ? 1 : 0) - (CANOPY.has(ca ?? "") ? 1 : 0);
    });
    const focal = cleanPick(focalNames, brief, opts?.prefer);
    if (focal) {
      fills.push({ query: focal, pattern: "accent", side: "back", count: FORMAL.has(style) ? 1 : 3 });
      notes.push(`${focal} is the focal point, set on the back sight line.`);
    }
  }
  if (!layers.ground) {
    const g = cleanPick(GROUND_FILLERS, brief, opts?.prefer);
    if (g && poolZoneOk(traitsFor(findPlant(g)!))) { fills.push({ query: g, pattern: "cluster", side: "around", count: 8 }); notes.push(`A ground layer of ${g} finishes the beds at soil level.`); }
  }
  if (!layers.mid) {
    const m = cleanPick(MID_FILLERS, brief, opts?.prefer);
    if (m) { fills.push({ query: m, pattern: "cluster", side: "back", count: 6 }); notes.push(`${m} carries the middle layer of flowering.`); }
  }
  if (fills.length) edits.push({ add: fills });

  return { edits, rationale: [...base.rationale, ...notes], substitutions: base.substitutions, grammarNotes: notes };
}

export { landscapingPlants };
