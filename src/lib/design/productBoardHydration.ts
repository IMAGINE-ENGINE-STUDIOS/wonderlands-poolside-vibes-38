/**
 * Book selections → drawing board
 * ===============================
 * A reader configures a product inside the FLIP book: a paver deck, an interior
 * finish, coping, a heater, a cage. Those choices live on the shopping-cart line
 * of that product as `extras`. When the reader reaches the design spread of the
 * same dossier, the board must show exactly what was chosen — the paver at the
 * measured square footage, the selected finish on the water, the coping band —
 * not a generic plan.
 *
 * This module is pure: it reads cart extras and returns the feature ids and the
 * deck size to apply to the seeded plan. No pricing lives here; the board's own
 * estimate prices the shapes, so the figure never diverges from the studio.
 */

import { TRADE_LAYERS } from "@/lib/design/siteTradeLayers";
import type { SitePlanData, SiteShape } from "@/components/blueprint/SiteDrawingBoard";

export type BoardSelections = {
  /** feature ids, per drawn layer ("pool", "deck", "spa", "ledge", …) */
  features: Record<string, string[]>;
  /** square footage the reader entered for the paver deck, when they did */
  deckSqFt?: number;
};

/** "Paver Deck: Appian Harvest Blend (400 sq ft @ $18/sq ft)" → "appian harvest blend" */
const optionLabel = (name: string) =>
  name
    .replace(/^[^:]{0,40}:\s*/, "")
    .replace(/\s*\(.*$/, "")
    .trim()
    .toLowerCase();

const sqFtInName = (name: string) => {
  const m = name.match(/\((\d[\d,.]*)\s*sq\s*ft/i);
  if (!m) return undefined;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Layers a product dossier may seed and dress from its selections. */
const DRESSED_LAYERS = ["pool", "spa", "ledge", "deck", "enclosure", "fence", "gravel", "patio"] as const;

/**
 * Match the chosen option to a feature of a drawn layer by label. Exact match
 * first, then a contains match, so "Pebble Tec — Night Sky" still finds
 * "Night Sky". Nothing is guessed: an unmatched option is simply skipped.
 */
const featureIdFor = (layer: string, label: string): string | undefined => {
  const spec = TRADE_LAYERS[layer];
  if (!spec) return undefined;
  const exact = spec.features.find((f) => f.label.toLowerCase() === label);
  if (exact) return exact.id;
  if (label.length < 4) return undefined;
  const partial = spec.features.find((f) => {
    const l = f.label.toLowerCase();
    return l.includes(label) || label.includes(l);
  });
  return partial?.id;
};

/** Read a product's cart line and turn its extras into board selections. */
export function selectionsFromExtras(
  extras: Array<{ name: string }> | undefined,
): BoardSelections {
  const features: Record<string, string[]> = {};
  let deckSqFt: number | undefined;
  if (!extras?.length) return { features };

  for (const extra of extras) {
    const label = optionLabel(extra.name);
    if (!label) continue;
    const area = sqFtInName(extra.name);

    for (const layer of DRESSED_LAYERS) {
      const id = featureIdFor(layer, label);
      if (!id) continue;
      const list = features[layer] ?? (features[layer] = []);
      if (!list.includes(id)) list.push(id);
      if (layer === "deck" && area) deckSqFt = Math.max(deckSqFt ?? 0, area);
    }
  }

  return { features, deckSqFt };
}

/** Scale a closed ring about its centroid — used to grow the deck to a size. */
const scaleRing = (pts: { x: number; y: number }[], k: number) => {
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return pts.map((p) => ({
    x: +(cx + (p.x - cx) * k).toFixed(1),
    y: +(cy + (p.y - cy) * k).toFixed(1),
  }));
};

const ringAreaPx = (pts: { x: number; y: number }[]) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
};

/**
 * Dress a seeded plan with the reader's selections: every seeded shape carries
 * the features chosen for its layer, and the paver deck is grown (never shrunk
 * below the seeded minimum) to the square footage the reader entered.
 */
export function applySelectionsToPlan(plan: SitePlanData, sel: BoardSelections): SitePlanData {
  if (!Object.keys(sel.features).length && !sel.deckSqFt) return plan;
  const pxPerFt = plan.pxPerFt || 1;

  const shapes: SiteShape[] = plan.shapes.map((shape) => {
    const picked = sel.features[shape.layer];
    let next: SiteShape = picked?.length
      ? { ...shape, features: Array.from(new Set([...(shape.features ?? []), ...picked])) }
      : shape;

    if (shape.layer === "deck" && sel.deckSqFt && shape.closed) {
      const currentSqFt = ringAreaPx(shape.points) / (pxPerFt * pxPerFt);
      if (currentSqFt > 0 && sel.deckSqFt > currentSqFt) {
        next = { ...next, points: scaleRing(next.points, Math.sqrt(sel.deckSqFt / currentSqFt)) };
      }
    }
    return next;
  });

  return { ...plan, shapes };
}
