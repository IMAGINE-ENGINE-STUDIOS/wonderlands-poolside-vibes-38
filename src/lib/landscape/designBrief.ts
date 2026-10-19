/**
 * The Design Brief — interpretation before composition (Training Plan,
 * Phase 1). Genius is the designer for people who are not: before planting
 * anything it forms the brief a professional would — style, budget,
 * maintenance, privacy, constraints — asks AT MOST ONE clarifying question
 * (with a professional default already chosen), and only then composes.
 *
 * briefToEdits turns a brief into engine edits by adapting the style's
 * blueprint with trait law (designTraits): nothing pool-unsafe beside the
 * water, no fruit-droppers over the pool, no high-water plants in a
 * low-maintenance brief, no salt-shy species on a waterfront — violations
 * are substituted with the best same-role plant, and every substitution is
 * disclosed in the rationale the customer hears.
 */
import { landscapingPlants, type LandscapingPlant } from "@/data/landscapingData";
import { findPlant, type LandscapeEdit, type PlantOp } from "./landscapeOps";
import { LANDSCAPE_LOOKS } from "./presets";
import { poolZoneOk, traitsFor, type PlantTraits } from "./designTraits";

export type BudgetTier = "essential" | "signature" | "estate";

export interface DesignBrief {
  /** Blueprint/look id once resolved (null = not yet chosen). */
  style: string | null;
  styleLabel: string | null;
  budgetCap?: number;
  tier: BudgetTier;
  maintenance: "low" | "standard";
  privacy: boolean;
  waterfront: boolean;
  mustHave: string[];
  avoid: string[];
  avoidCategories: string[];
  clarify?: {
    question: string;
    options: Array<{ id: string; label: string; blurb: string }>;
    defaultId: string;
  };
}

const STYLES: Array<{ id: string; label: string; blurb: string; re: RegExp }> = [
  { id: "palm-beach-estate", label: "Palm Beach Estate", blurb: "formal, palms and hedges, like a resort", re: /palm beach|\bestate\b/i },
  { id: "formal-garden-axis", label: "Formal Garden", blurb: "symmetry, hedge walls, roses", re: /\bformal\b|parterre/i },
  { id: "courtyard-garden-room", label: "Courtyard Garden Room", blurb: "a shade tree, garden rooms, relaxed luxury", re: /courtyard|mediterran/i },
  { id: "tropical-poolside", label: "Tropical Poolside", blurb: "palms, lush layers, resort color", re: /tropical/i },
  { id: "coastal-native", label: "Coastal Native", blurb: "salt-tough, natural, low water", re: /coastal|\bnative\b|beach\s*(house|style|vibe)/i },
  { id: "modern-minimal", label: "Modern Minimal", blurb: "clean lines, grasses, stone", re: /modern|minimal|desert|\bzen\b/i },
  { id: "formal-topiary", label: "Formal Topiary", blurb: "clipped shapes, classic green", re: /topiary/i },
  { id: "themed-patio", label: "Themed Patio", blurb: "green walls and a statement tree", re: /themed patio|resort/i },
];

export const styleLabel = (id: string | null): string | null => STYLES.find((s) => s.id === id)?.label ?? null;

const namedPlantsIn = (text: string): LandscapingPlant[] => {
  const t = ` ${text.toLowerCase()} `;
  return landscapingPlants.filter((p) => {
    /* Catalog names are comma-inverted ("Palm, Queen") — people say the
     * swapped form ("queen palm"), so try both, plus a lone distinctive
     * word ("ixora", "clusia", "gardenia"). */
    const parts = p.name.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
    const forms = [p.name.toLowerCase(), parts.length > 1 ? `${parts.slice(1).join(" ")} ${parts[0]}` : parts[0]];
    if (forms.some((f) => f && f.length >= 5 && t.includes(f))) return true;
    const words = (parts[parts.length - 1] ?? "").split(/\s+/);
    return words.length === 1 && words[0].length >= 5 && new RegExp(`\\b${words[0]}\\b`).test(t);
  });
};

/** Parse a request into a brief. Pure and deterministic — the same words
 * always produce the same brief. */
export function composeBrief(text: string): DesignBrief {
  const q = text.toLowerCase();
  const styleHit = STYLES.find((s) => s.re.test(q));
  const money = q.match(/\$\s?([\d,]+)(k)?\b/);
  const budgetCap = money ? parseInt(money[1].replace(/,/g, ""), 10) * (money[2] ? 1000 : 1) : undefined;
  const tier: BudgetTier = /cheap|budget|affordable|inexpensive|under \$|below \$/.test(q) || (budgetCap !== undefined && budgetCap < 8000)
    ? "essential"
    : /luxur|high.?end|estate|premium|money no object/.test(q) || (budgetCap !== undefined && budgetCap > 25000)
      ? "estate"
      : "signature";
  const named = namedPlantsIn(q);
  const avoid: string[] = [];
  const avoidCategories: string[] = [];
  const avoidMatch = q.match(/(?:\bno\b|\bwithout\b|\bavoid\b|\bnot\b)\s+(?:any\s+)?([a-z' ]+?)(?=,|\.|$|\band\b|\bbut\b)/);
  if (avoidMatch) {
    const frag = avoidMatch[1];
    if (/palm/.test(frag)) avoidCategories.push("Palms");
    if (/flower|bloom/.test(frag)) avoidCategories.push("Flowering");
    if (/grass/.test(frag)) avoidCategories.push("Grasses");
    const p = findPlant(frag);
    if (p) avoid.push(p.id);
  }
  const wholeDesign = /landscape|landscaping|design|make it|build|create|redo|transform|garden|backyard|yard/.test(q);
  const brief: DesignBrief = {
    style: styleHit?.id ?? null,
    styleLabel: styleHit?.label ?? null,
    budgetCap,
    tier,
    maintenance: /low.?maintenance|easy.?care|low.?water|drought|no fuss|set and forget|bajo mantenimiento/.test(q) ? "low" : "standard",
    privacy: /privacy|privacidad|screening|screen the|block (the )?(neighbo|street|view)|hide (the )?(neighbo|ac|pump|fence)/.test(q),
    waterfront: /waterfront|lakefront|oceanfront|on the water|salt/.test(q),
    mustHave: named.filter((p) => !avoid.includes(p.id)).map((p) => p.id),
    avoid,
    avoidCategories,
  };
  if (!brief.style && wholeDesign && !brief.mustHave.length) {
    brief.clarify = {
      question: "Which style should I design to?",
      options: [
        { id: "tropical-poolside", label: "Tropical Poolside", blurb: "palms, lush layers, resort color" },
        { id: "palm-beach-estate", label: "Palm Beach Estate", blurb: "formal, palms and hedges, like a resort" },
        { id: "modern-minimal", label: "Modern Minimal", blurb: "clean lines, grasses, stone" },
      ],
      defaultId: "tropical-poolside",
    };
  }
  return brief;
}

/* ------------------------------------------------------------------ */

interface Sub { from: string; to: string; reason: string }

const violates = (plant: LandscapingPlant, op: PlantOp, brief: DesignBrief): string | null => {
  const t = traitsFor(plant);
  if (brief.avoid.includes(plant.id)) return "you asked to leave it out";
  if (brief.avoidCategories.includes(plant.category)) return "you asked to leave that family out";
  if (op.side === "pool" && !poolZoneOk(t)) return t.litter === "fruit" ? "it drops fruit over the water" : "it sheds into the pool";
  if (op.side === "pool" && t.rootRisk) return "its roots need room away from the deck";
  if (brief.waterfront && !t.salt) return "it won't take waterfront salt air";
  if (brief.maintenance === "low" && t.water === "high") return "it drinks too much for a low-maintenance brief";
  return null;
};

const substituteFor = (plant: LandscapingPlant, op: PlantOp, brief: DesignBrief, prefer?: Set<string>): LandscapingPlant | null => {
  const cands = landscapingPlants.filter((p) =>
    p.category === plant.category && p.id !== plant.id && !violates(p, op, brief));
  if (!cands.length) return null;
  if (op.pattern === "hedge") cands.sort((a, b) => traitsFor(b).screening - traitsFor(a).screening);
  /* Species from designs the customer already approved win ties — the
   * house style is learned, not reinvented (Training Plan, Phase 5). */
  if (prefer?.size) cands.sort((a, b) => (prefer.has(b.id) ? 1 : 0) - (prefer.has(a.id) ? 1 : 0));
  return cands[0];
};

/** Adapt the style's blueprint to the brief. Every change is disclosed. */
export function briefToEdits(brief: DesignBrief, opts?: { prefer?: Set<string> }): { edits: LandscapeEdit[]; rationale: string[]; substitutions: Sub[] } {
  const look = LANDSCAPE_LOOKS.find((l) => l.id === (brief.style ?? "tropical-poolside")) ?? LANDSCAPE_LOOKS[0];
  const substitutions: Sub[] = [];
  const scale = brief.tier === "essential" ? 0.7 : brief.tier === "estate" ? 1.3 : 1;
  const edits: LandscapeEdit[] = [];
  const usedSpecies = new Set<string>();

  for (const raw of look.recipe) {
    const edit: LandscapeEdit = { ...raw };
    if (raw.add) {
      const ops: PlantOp[] = [];
      for (const op of raw.add) {
        let plant = findPlant(op.query);
        let nextOp: PlantOp | null = { ...op };
        if (plant) {
          const why = violates(plant, op, brief);
          if (why) {
            const sub = substituteFor(plant, op, brief, opts?.prefer);
            if (sub) {
              substitutions.push({ from: plant.name, to: sub.name, reason: why });
              plant = sub;
              nextOp = { ...op, query: sub.name };
            } else {
              substitutions.push({ from: plant.name, to: "—", reason: `${why}, and nothing in its family fits the brief` });
              nextOp = null;
            }
          }
        }
        if (nextOp) {
          if (nextOp.count && scale !== 1) nextOp = { ...nextOp, count: Math.max(1, Math.round(nextOp.count * scale)) };
          ops.push(nextOp);
          if (plant) usedSpecies.add(plant.id);
        }
      }
      if (ops.length) edit.add = ops; else delete edit.add;
    }
    if (edit.add || edit.newBed || edit.bedFill || edit.clear || edit.remove || edit.irrigation) edits.push(edit);
  }

  /* Must-haves the blueprint didn't already include. */
  for (const id of brief.mustHave) {
    if (usedSpecies.has(id)) continue;
    const plant = landscapingPlants.find((p) => p.id === id);
    if (!plant) continue;
    const t = traitsFor(plant);
    edits.push({ add: [{ query: plant.name, pattern: "accent", side: poolZoneOk(t) ? "pool" : "back", count: 3 }] });
    usedSpecies.add(id);
  }

  /* A privacy brief always ends with a real screen, never a hope. */
  const hasHedge = edits.some((e) => e.add?.some((o) => o.pattern === "hedge"));
  if (brief.privacy && !hasHedge) {
    const screens = landscapingPlants
      .filter((p) => p.category === "Shrubs" && !brief.avoid.includes(p.id))
      .sort((a, b) => traitsFor(b).screening - traitsFor(a).screening);
    if (screens[0]) edits.push({ add: [{ query: screens[0].name, pattern: "hedge", side: "back" }] });
  }

  /* The rationale — plain words a homeowner or a customer can follow. */
  const rationale: string[] = [];
  const allOps = edits.flatMap((e) => e.add ?? []);
  const focal = allOps.map((o) => findPlant(o.query)).find((p) => p && (p.category === "Palms" || p.category === "Trees"));
  if (focal) rationale.push(`${focal.name} anchors the composition.`);
  const hedge = allOps.find((o) => o.pattern === "hedge");
  if (hedge) { const hp = findPlant(hedge.query); if (hp) rationale.push(`A ${hp.name} hedge gives year-round structure${brief.privacy ? " and privacy" : ""}.`); }
  const poolOps = allOps.filter((o) => o.side === "pool");
  if (poolOps.length && poolOps.every((o) => { const p = findPlant(o.query); return p ? poolZoneOk(traitsFor(p)) : false; }))
    rationale.push("Everything by the water is pool-safe — no fruit or heavy litter over the pool.");
  if (brief.maintenance === "low") rationale.push("A low-water palette throughout, so it thrives on drip irrigation with little care.");
  if (brief.waterfront) rationale.push("Salt-tolerant species throughout for the waterfront air.");
  for (const s of substitutions.slice(0, 2)) rationale.push(s.to === "—" ? `Left out ${s.from} — ${s.reason}.` : `Swapped ${s.from} for ${s.to} — ${s.reason}.`);
  return { edits, rationale, substitutions };
}
