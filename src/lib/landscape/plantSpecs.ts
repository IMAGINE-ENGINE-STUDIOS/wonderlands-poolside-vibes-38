/**
 * Plan-view botany for the landscaping catalog.
 *
 * The price list in `src/data/landscapingData.ts` knows what a plant costs and
 * what it looks like in a photograph, but a planting plan needs three more
 * facts per plant: how wide the canopy grows, how far apart it is planted and
 * what colour it reads as from above (foliage, and the flower when it blooms).
 *
 * Rather than hand-authoring 400 rows, specs are derived:
 *   1. a base spec per catalog category (shrub, tree, palm, grass, …)
 *   2. a keyword table for the plants whose habit differs from their category
 *   3. the colour word already printed in the catalog name — "(Orange)",
 *      "Red Sister", "Blue Daze" — becomes the bloom / accent colour
 *   4. the container size scales the canopy actually drawn (a 3 gal Clusia is
 *      not a 45 gal Clusia)
 *
 * Everything is memoised in a Map, so the board can look up thousands of
 * plantings per frame without re-parsing names.
 */

import type { LandscapingCategory, LandscapingPlant, PlantSize } from "@/data/landscapingData";
import { landscapingPlants } from "@/data/landscapingData";

/** How a plant is drawn from above. */
export type PlantForm = "mound" | "tree" | "palm" | "grass" | "mat" | "vine" | "spike";

export interface PlantSpec {
  /** Mature canopy diameter in feet, before the container-size scale */
  spreadFt: number;
  /** Mature height in feet — decides draw order (tall plants render last) */
  heightFt: number;
  /** Recommended on-centre spacing in feet */
  spacingFt: number;
  /** Foliage colour seen from above */
  foliage: string;
  /** Flower / accent colour, when the plant reads as colour in bloom */
  bloom: string | null;
  form: PlantForm;
}

/* ------------------------------------------------------------------ *
 * Colour words used by the price list
 * ------------------------------------------------------------------ */

const COLOR_WORDS: [RegExp, string][] = [
  [/\bwhite\b|\bgg\b/i, "#f6f2e8"],
  [/\bcream\b|\bivory\b/i, "#f0e6c8"],
  [/\byellow\b|\bgold(en)?\b|\bbulbine\b/i, "#f2c53d"],
  [/\borange\b|\bapricot\b/i, "#e8873c"],
  [/\bcoral\b|\bsalmon\b/i, "#ef7f6b"],
  [/\bred\b|\bscarlet\b|\bcrimson\b|\bfirebush\b/i, "#cf4340"],
  [/\bburgundy\b|\bblack\b|\bebony\b|\bmagic\b/i, "#6d2b3f"],
  [/\bpink\b|\brose\b/i, "#e88bb0"],
  [/\bpurple\b|\blav(ender)?\.?\b|\bviolet\b/i, "#8c6bd0"],
  [/\bblue\b/i, "#5b8fd8"],
];

const inferColor = (name: string): string | null => {
  for (const [re, hex] of COLOR_WORDS) if (re.test(name)) return hex;
  return null;
};

/* ------------------------------------------------------------------ *
 * Base spec per catalog category
 * ------------------------------------------------------------------ */

const CATEGORY_SPEC: Record<LandscapingCategory, PlantSpec> = {
  Shrubs: { spreadFt: 3.5, heightFt: 4, spacingFt: 3, foliage: "#3f7a48", bloom: null, form: "mound" },
  Trees: { spreadFt: 18, heightFt: 25, spacingFt: 20, foliage: "#2f6b3d", bloom: null, form: "tree" },
  Palms: { spreadFt: 10, heightFt: 18, spacingFt: 10, foliage: "#417c50", bloom: null, form: "palm" },
  Grasses: { spreadFt: 2.5, heightFt: 3, spacingFt: 2.5, foliage: "#7f9a53", bloom: null, form: "grass" },
  Flowering: { spreadFt: 3, heightFt: 3.5, spacingFt: 2.5, foliage: "#4a8250", bloom: "#e88bb0", form: "mound" },
  Vines: { spreadFt: 3, heightFt: 8, spacingFt: 4, foliage: "#3d7a4d", bloom: "#c4527f", form: "vine" },
  Tropicals: { spreadFt: 4, heightFt: 6, spacingFt: 3.5, foliage: "#357a5c", bloom: "#e8873c", form: "spike" },
  Groundcover: { spreadFt: 1.8, heightFt: 0.8, spacingFt: 1.5, foliage: "#5f9455", bloom: null, form: "mat" },
  "Fruit Trees": { spreadFt: 14, heightFt: 18, spacingFt: 15, foliage: "#3a7340", bloom: "#f0e6c8", form: "tree" },
  Topiary: { spreadFt: 3, heightFt: 5, spacingFt: 3, foliage: "#356b44", bloom: null, form: "mound" },
};

/* ------------------------------------------------------------------ *
 * Plants whose habit differs from their category
 * ------------------------------------------------------------------ */

type Override = Partial<PlantSpec>;

const NAME_OVERRIDES: [RegExp, Override][] = [
  // canopy trees
  [/live oak|laurel oak/i, { spreadFt: 40, heightFt: 45, spacingFt: 35, foliage: "#2b5f36" }],
  [/bald cypress/i, { spreadFt: 20, heightFt: 50, spacingFt: 18, foliage: "#4a7f52" }],
  [/mahogany|black olive|gumbo|slash pine|tabebuia|royal poinciana/i, { spreadFt: 26, heightFt: 32, spacingFt: 24 }],
  [/crape myrtle/i, { spreadFt: 15, heightFt: 20, spacingFt: 12, bloom: "#e07ba4" }],
  [/magnolia/i, { spreadFt: 18, heightFt: 28, spacingFt: 16, bloom: "#f6f2e8" }],
  // palms
  [/royal palm|foxtail/i, { spreadFt: 16, heightFt: 35, spacingFt: 14 }],
  [/coconut/i, { spreadFt: 18, heightFt: 30, spacingFt: 16, foliage: "#4d8352" }],
  [/sylvester|medjool|canary|bismarck/i, { spreadFt: 18, heightFt: 22, spacingFt: 16, foliage: "#5c8f72" }],
  [/areca|clustering|triple|multi.?trunk/i, { spreadFt: 12, heightFt: 16, spacingFt: 8 }],
  [/pygmy|robellini|adonidia|christmas palm/i, { spreadFt: 7, heightFt: 10, spacingFt: 6 }],
  [/sago|cardboard|coontie/i, { spreadFt: 4, heightFt: 3.5, spacingFt: 4, form: "palm" }],
  // hedges
  [/podocarpus|clusia|areca hedge|cocoplum|coco plum|viburnum|ligustrum|arboricola/i, {
    spreadFt: 3,
    heightFt: 8,
    spacingFt: 2.5,
  }],
  [/bamboo/i, { spreadFt: 5, heightFt: 20, spacingFt: 4, form: "grass" }],
  // accents & colour
  [/bougainvillea/i, { spreadFt: 6, heightFt: 8, spacingFt: 5, bloom: "#c4527f" }],
  [/hibiscus/i, { spreadFt: 5, heightFt: 7, spacingFt: 4, bloom: "#cf4340" }],
  [/ixora/i, { spreadFt: 3, heightFt: 3.5, spacingFt: 2.5, bloom: "#e8552f" }],
  [/plumbago/i, { spreadFt: 4, heightFt: 3.5, spacingFt: 3, bloom: "#5b8fd8" }],
  [/bird of paradise/i, { spreadFt: 6, heightFt: 8, spacingFt: 5, form: "spike" }],
  [/agave|yucca|aloe|sansevieria|dracaena/i, { spreadFt: 3, heightFt: 4, spacingFt: 3, form: "spike" }],
  [/bromeliad|croton|cordyline|ti plant/i, { spreadFt: 2.5, heightFt: 3, spacingFt: 2, form: "spike" }],
  [/muhly|fakahatchee|fountain grass|aztec grass|liriope|mondo/i, { form: "grass" }],
  [/jasmine|juniper|blue daze|perennial peanut|dwarf jasmine|lantana/i, { form: "mat" }],
  [/philodendron|monstera|bird.?s nest|xanadu/i, { spreadFt: 4, heightFt: 3, spacingFt: 3, form: "mound" }],
  // dwarf forms are always tighter
  [/dwarf/i, { spreadFt: 2.2, heightFt: 2.2, spacingFt: 2 }],
];

/** Container size → canopy scale actually drawn on the plan. */
const SIZE_SCALE: Record<PlantSize, number> = {
  '2"': 0.22,
  '4"': 0.3,
  '6"': 0.38,
  "1 gal": 0.45,
  "3 gal": 0.6,
  "7 gal": 0.75,
  "15 gal": 0.9,
  "30 gal": 1.1,
  "45 gal": 1.3,
  "B&B": 1.45,
};

export const sizeScale = (size: PlantSize | string): number =>
  SIZE_SCALE[size as PlantSize] ?? 0.7;

/* ------------------------------------------------------------------ *
 * Lookup
 * ------------------------------------------------------------------ */

const specCache = new Map<string, PlantSpec>();

/** Botanical plan spec for a catalog plant (optionally a named variant). */
export function getPlantSpec(plant: LandscapingPlant, variantName?: string): PlantSpec {
  const key = `${plant.id}|${variantName ?? ""}`;
  const hit = specCache.get(key);
  if (hit) return hit;

  const label = `${plant.name} ${variantName ?? ""}`;
  let spec: PlantSpec = { ...CATEGORY_SPEC[plant.category] };
  for (const [re, patch] of NAME_OVERRIDES) if (re.test(label)) spec = { ...spec, ...patch };

  const colour = inferColor(label);
  if (colour) {
    // colour words on foliage plants tint the leaf, on everything else the flower
    if (spec.bloom === null && /sister|magic|copper|ebony|glauca|black|red sensation/i.test(label)) spec.foliage = colour;
    else spec.bloom = colour;
  }

  specCache.set(key, spec);
  return spec;
}

/* ------------------------------------------------------------------ *
 * Catalog indexes — O(1) lookups for the board
 * ------------------------------------------------------------------ */

const byId = new Map<string, LandscapingPlant>();
for (const p of landscapingPlants) byId.set(p.id, p);

export const plantById = (id: string) => byId.get(id);

export interface PlantPick {
  plant: LandscapingPlant;
  variantId: string;
  variantLabel: string;
  size: PlantSize;
  /** Retail price of one plant, installed */
  price: number;
  spec: PlantSpec;
}

/** Resolve a planting reference into everything needed to draw and price it. */
export function resolvePick(plantId: string, variantId?: string, size?: string): PlantPick | null {
  const plant = byId.get(plantId);
  if (!plant) return null;
  const variant = plant.variants.find((v) => v.id === variantId) ?? plant.variants[0];
  const sizeOpt = variant.sizes.find((s) => s.size === size) ?? variant.sizes[0];
  return {
    plant,
    variantId: variant.id,
    variantLabel: variant.label,
    size: sizeOpt.size,
    price: sizeOpt.finalPrice,
    spec: getPlantSpec(plant, variant.label),
  };
}

/** Canopy diameter in feet as the plant will be drawn, at this container size. */
export const drawnSpreadFt = (spec: PlantSpec, size: PlantSize | string) =>
  Math.max(0.8, spec.spreadFt * sizeScale(size));
