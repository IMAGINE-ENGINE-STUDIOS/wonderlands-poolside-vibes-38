/**
 * Design traits — the horticultural judgment layer (Training Plan, Phase 2).
 *
 * The catalog knows what a plant costs and how big it gets. A designer also
 * knows how it BEHAVES: what light and water it wants, whether it drops
 * fruit or flowers into a pool, whether its roots lift pavers, whether it
 * actually screens a neighbor, when it blooms. Those behaviors are encoded
 * here so selection can be professional by construction.
 *
 * Method: entries below are authored per species for the plants a Florida
 * designer reaches for first (the catalog's palms, screens, pool-zone and
 * problem plants). Anything without an authored entry resolves from its
 * category's habit defaults — complete coverage for all 167 plants today,
 * with authored precision growing species by species.
 */
import { landscapingPlants, type LandscapingPlant } from "@/data/landscapingData";

export type SunNeed = "full" | "part" | "shade";
export type WaterNeed = "low" | "moderate" | "high";
export type LitterKind = "none" | "leaf" | "flower" | "fruit";
export type Season = "spring" | "summer" | "fall" | "winter";

export interface PlantTraits {
  sun: SunNeed;
  water: WaterNeed;
  /** Tolerates salt spray / coastal exposure. */
  salt: boolean;
  /** Belongs in the pool zone: no fruit or heavy litter over water, no thorns or toxic sap at the coping. */
  poolSafe: boolean;
  litter: LitterKind;
  /** Aggressive roots — keep away from pavers, deck and pool shell. */
  rootRisk: boolean;
  /** Screening value at maturity, 0 (none) to 3 (a wall). */
  screening: 0 | 1 | 2 | 3;
  fragrant: boolean;
  bloomSeasons: Season[];
}

const CATEGORY_DEFAULTS: Record<string, PlantTraits> = {
  Flowering: { sun: "full", water: "moderate", salt: false, poolSafe: true, litter: "flower", rootRisk: false, screening: 1, fragrant: false, bloomSeasons: ["spring", "summer"] },
  Shrubs: { sun: "full", water: "moderate", salt: false, poolSafe: true, litter: "none", rootRisk: false, screening: 2, fragrant: false, bloomSeasons: [] },
  Palms: { sun: "full", water: "moderate", salt: true, poolSafe: true, litter: "leaf", rootRisk: false, screening: 1, fragrant: false, bloomSeasons: [] },
  Trees: { sun: "full", water: "moderate", salt: false, poolSafe: true, litter: "leaf", rootRisk: false, screening: 2, fragrant: false, bloomSeasons: [] },
  Tropicals: { sun: "part", water: "moderate", salt: false, poolSafe: true, litter: "leaf", rootRisk: false, screening: 1, fragrant: false, bloomSeasons: [] },
  Grasses: { sun: "full", water: "low", salt: false, poolSafe: true, litter: "none", rootRisk: false, screening: 1, fragrant: false, bloomSeasons: [] },
  Groundcover: { sun: "full", water: "low", salt: false, poolSafe: true, litter: "none", rootRisk: false, screening: 0, fragrant: false, bloomSeasons: [] },
  Vines: { sun: "full", water: "moderate", salt: false, poolSafe: true, litter: "flower", rootRisk: false, screening: 1, fragrant: false, bloomSeasons: ["spring", "summer"] },
  "Fruit Trees": { sun: "full", water: "moderate", salt: false, poolSafe: false, litter: "fruit", rootRisk: false, screening: 1, fragrant: false, bloomSeasons: [] },
  Topiary: { sun: "full", water: "moderate", salt: false, poolSafe: true, litter: "none", rootRisk: false, screening: 2, fragrant: false, bloomSeasons: [] },
};

/** Authored per-species overrides (partial — merged over category defaults). */
const AUTHORED: Record<string, Partial<PlantTraits>> = {
  /* ---- palms: the pool zone lives or dies on fruit and frond drop ---- */
  "plant-palm-queen-palms": { litter: "fruit", poolSafe: false },
  "plant-palm-sylvester-palms": { litter: "fruit", poolSafe: false },
  "plant-palm-canary-island-date-palms": { litter: "fruit", poolSafe: false },
  "plant-palm-pindo-palms": { litter: "fruit", poolSafe: false },
  "plant-palm-foxtail-palms": { litter: "fruit", poolSafe: false },
  "plant-palm-fishtail-palms": { litter: "fruit", poolSafe: false },
  "plant-palm-reclinata-palms": { litter: "fruit", poolSafe: false, screening: 2 },
  "plant-palm-roebellini-palms": { water: "moderate" },
  "plant-palm-adonidia-palms": {},
  "plant-palm-areca-palms": { screening: 2 },
  "plant-palm-areca-b-b-xl-palms": { screening: 2 },
  "plant-palm-bismark-palms": { screening: 2 },
  "plant-palm-cabbage-sabal-palms": { water: "low" },
  "plant-palm-cat-palms": { sun: "part" },
  "plant-palm-raphis-palms": { sun: "part", screening: 2 },
  "plant-palm-cardboard-palms": { sun: "part", water: "low", litter: "none" },
  "plant-sago-palm-palms": { water: "low", litter: "none" },
  "plant-palm-traveler-s-palms": { water: "high", screening: 2 },
  "plant-palm-majesty-palms": { water: "high" },
  "plant-palm-ponytail-palms": { water: "low", litter: "none" },
  "plant-palm-european-fan-palms": { water: "low", screening: 2 },
  "plant-palm-chinese-fan-palms": { screening: 2 },
  /* ---- trees: roots, litter and water are the professional tells ---- */
  "plant-live-oak-trees": { rootRisk: true, screening: 3 },
  "plant-laurel-oak-trees": { rootRisk: true, screening: 3 },
  "plant-magnolia-trees": { poolSafe: false, fragrant: true, bloomSeasons: ["spring", "summer"] },
  "plant-crape-myrtle-multi-trees": { litter: "flower", water: "low", bloomSeasons: ["summer"] },
  "plant-crape-myrtle-std-trees": { litter: "flower", water: "low", bloomSeasons: ["summer"] },
  "plant-jacaranda-trees": { litter: "flower", poolSafe: false, bloomSeasons: ["spring"] },
  "plant-royal-poinciana-trees": { litter: "flower", poolSafe: false, rootRisk: true, bloomSeasons: ["summer"] },
  "plant-sweet-gum-trees": { litter: "fruit", poolSafe: false },
  "plant-golden-rain-tree-trees": { litter: "fruit", poolSafe: false, bloomSeasons: ["summer"] },
  "plant-purple-leaf-plum-trees": { litter: "fruit", poolSafe: false },
  "plant-sycamore-trees": { rootRisk: true, water: "high" },
  "plant-bald-cypress-trees": { water: "high", rootRisk: true },
  "plant-red-maple-trees": { water: "high" },
  "plant-slash-pine-trees": { poolSafe: false },
  "plant-italian-cypress-trees": { water: "low", screening: 3, litter: "none" },
  "plant-leyland-cypress-trees": { screening: 3, litter: "none" },
  "plant-red-cedar-trees": { water: "low", litter: "none", salt: true },
  "plant-japanese-blueberry-trees": { litter: "none", screening: 3 },
  "plant-bottlebrush-red-cluster-trees": { litter: "leaf", bloomSeasons: ["spring", "summer"] },
  "plant-majestic-beauty-trees": { litter: "none", water: "low", salt: true },
  "plant-holly-trees": { screening: 2, litter: "none" },
  "plant-elm-trees": { rootRisk: true },
  /* ---- shrubs: the screening bench ---- */
  "plant-clusia-shrubs": { water: "low", salt: true, screening: 3, litter: "none" },
  "plant-ligustrum-shrubs": { screening: 3, fragrant: true, litter: "none", bloomSeasons: ["spring"] },
  "plant-podocarpus-shrubs": { screening: 3, litter: "none" },
  "plant-podocarpus-xl-shrubs": { screening: 3, litter: "none" },
  "plant-podocarpus-pringles-shrubs": { screening: 3, litter: "none" },
  "plant-eleagnus-shrubs": { screening: 3, salt: true, water: "low", fragrant: true, litter: "none" },
  "plant-eleagnus-variegated-shrubs": { screening: 3, salt: true, water: "low", fragrant: true, litter: "none" },
  "plant-viburnum-shrubs": { screening: 3, litter: "none" },
  "plant-coco-plum-shrubs": { salt: true, screening: 2, litter: "none" },
  "plant-sea-grape-shrubs": { salt: true, poolSafe: false, screening: 2 },
  "plant-buttonwood-shrubs": { salt: true, screening: 2, litter: "none" },
  "plant-wax-myrtle-shrubs": { salt: true, water: "high", screening: 2, fragrant: true, litter: "none" },
  "plant-simpson-stopper-shrubs": { salt: true, fragrant: true, screening: 2, litter: "none" },
  "plant-pittosporum-shrubs": { salt: true, fragrant: true, screening: 2, litter: "none", bloomSeasons: ["spring"] },
  "plant-texas-sage-shrubs": { water: "low", salt: true, litter: "flower", bloomSeasons: ["summer", "fall"] },
  "plant-indian-hawthorn-shrubs": { water: "low", litter: "none", bloomSeasons: ["spring"] },
  "plant-japanese-boxwood-shrubs": { screening: 2, litter: "none" },
  "plant-burfordii-holly-shrubs": { screening: 2, litter: "none" },
  "plant-juniper-shrubs": { water: "low", salt: true, litter: "none", screening: 2 },
  "plant-arboricola-shrubs": { sun: "part", litter: "none" },
  "plant-cast-iron-plant-shrubs": { sun: "shade", water: "low", litter: "none" },
  "plant-anise-shrubs": { sun: "part", water: "high", fragrant: true, screening: 2, litter: "none" },
  "plant-false-rosemary-shrubs": { water: "low", salt: true, litter: "none" },
  "plant-bottlebrush-red-cluster-shrubs": { bloomSeasons: ["spring", "summer"] },
  "plant-bottlebrush-better-john-shrubs": { bloomSeasons: ["spring", "summer"] },
  /* ---- flowering: beauty with honest litter ---- */
  "plant-bougainvillea-flowering": { water: "low", salt: true, poolSafe: false, screening: 2, bloomSeasons: ["spring", "summer", "fall"] },
  "plant-bougainvillea-bush-flowering": { water: "low", salt: true, poolSafe: false, bloomSeasons: ["spring", "summer", "fall"] },
  "plant-oleander-flowering": { water: "low", salt: true, poolSafe: false, litter: "leaf", screening: 3 },
  "plant-plumeria-flowering": { water: "low", salt: true, poolSafe: false, litter: "flower", fragrant: true, bloomSeasons: ["spring", "summer", "fall"] },
  "plant-hibiscus-bush-flowering": { poolSafe: false, bloomSeasons: ["spring", "summer", "fall"] },
  "plant-hibiscus-standard-flowering": { poolSafe: false, bloomSeasons: ["spring", "summer", "fall"] },
  "plant-allamanda-flowering": { poolSafe: false, bloomSeasons: ["summer", "fall"] },
  "plant-duranta-flowering": { litter: "fruit", poolSafe: false, bloomSeasons: ["spring", "summer"] },
  "plant-gardenia-flowering": { sun: "part", water: "high", fragrant: true, bloomSeasons: ["spring", "summer"] },
  "plant-jasmine-flowering": { fragrant: true, litter: "none", bloomSeasons: ["spring", "summer"] },
  "plant-ixora-flowering": { litter: "none", bloomSeasons: ["spring", "summer", "fall"] },
  "plant-lantana-flowering": { water: "low", salt: true, litter: "none", bloomSeasons: ["spring", "summer", "fall"] },
  "plant-fire-bush-flowering": { water: "low", salt: true, litter: "none", bloomSeasons: ["summer", "fall"] },
  "plant-pentas-flowering": { litter: "none", bloomSeasons: ["spring", "summer", "fall"] },
  "plant-buddleia-flowering": { litter: "none", fragrant: true, bloomSeasons: ["summer"] },
  "plant-azalea-encore-flowering": { sun: "part", water: "high", bloomSeasons: ["spring", "fall"] },
  "plant-azalea-red-lav-formosa-gg-gerb-fashion-flowering": { sun: "part", water: "high", bloomSeasons: ["spring"] },
  "plant-camellia-flowering": { sun: "part", water: "moderate", bloomSeasons: ["winter", "spring"] },
  "plant-desert-rose-flowering": { water: "low", poolSafe: false, litter: "none", bloomSeasons: ["spring", "summer"] },
  "plant-plumbago-flowering": { water: "low", salt: true, litter: "none", bloomSeasons: ["spring", "summer", "fall"] },
  "plant-bulbine-flowering": { water: "low", salt: true, litter: "none", bloomSeasons: ["spring", "summer", "fall"] },
  "plant-canna-lily-flowering": { water: "high", litter: "leaf" },
  "plant-crinum-lily-queen-emma-green-flowering": { water: "high", fragrant: true },
  "plant-mexican-petunia-flowering": { water: "high", litter: "none", bloomSeasons: ["spring", "summer", "fall"] },
  "plant-ruellia-flowering": { water: "high", litter: "none" },
  "plant-crossandra-flowering": { sun: "part", water: "high", bloomSeasons: ["summer", "fall"] },
  "plant-tibouchina-flowering": { sun: "part", water: "high", bloomSeasons: ["summer", "fall"] },
  "plant-panama-rose-flowering": { sun: "part", fragrant: true, bloomSeasons: ["fall", "winter"] },
  "plant-thryallis-flowering": { water: "low", litter: "none", bloomSeasons: ["summer", "fall"] },
  /* ---- tropicals ---- */
  "plant-bird-of-paradise-tropicals": {},
  "plant-elephant-ear-tropicals": { water: "high" },
  "plant-heliconia-tropicals": { water: "high" },
  "plant-ginger-tropicals": { water: "high", fragrant: true },
  "plant-fern-tropicals": { sun: "shade", water: "high" },
  "plant-snake-plant-tropicals": { water: "low", sun: "part", litter: "none" },
  "plant-spathiphyllum-tropicals": { sun: "shade", water: "high" },
  "plant-bromeliad-tropicals": { water: "low", litter: "none" },
  "plant-succulents-tropicals": { water: "low", sun: "full", litter: "none" },
  "plant-fiddle-leaf-fig-tropicals": { rootRisk: false },
  /* ---- grasses & groundcover ---- */
  "plant-muhly-grass-grasses": { water: "low", salt: true, bloomSeasons: ["fall"] },
  "plant-sea-oats-grasses": { salt: true, water: "low" },
  "plant-pampas-grass-grasses": { water: "low", screening: 2, litter: "leaf" },
  "plant-liriope-grasses": { sun: "part" },
  "plant-mondo-grass-grasses": { sun: "shade" },
  "plant-lemon-grass-grasses": { fragrant: true },
  "plant-jasmine-minima-groundcover": { fragrant: true, water: "low" },
  "plant-perennial-peanut-groundcover": { water: "low", bloomSeasons: ["summer"] },
  "plant-juniper-groundcover": { water: "low", salt: true },
  /* ---- fruit: never over water ---- */
  "plant-banana-fruit-trees": { water: "high", litter: "fruit", poolSafe: false },
  "plant-loquat-fruit-trees": { litter: "fruit", poolSafe: false },
  "plant-mulberry-fruit-trees": { litter: "fruit", poolSafe: false, rootRisk: true },
  /* ---- vines ---- */
  "plant-bougainvillea-trellis-vines": { water: "low", salt: true, poolSafe: false, bloomSeasons: ["spring", "summer", "fall"] },
  "plant-jasmine-vines": { fragrant: true, litter: "none", bloomSeasons: ["spring", "summer"] },
  "plant-honeysuckle-staked-vines": { fragrant: true, bloomSeasons: ["spring", "summer"] },
};

const byId = new Map(landscapingPlants.map((p) => [p.id, p]));

/** Complete traits for any catalog plant: authored override over habit defaults. */
export function traitsFor(plant: Pick<LandscapingPlant, "id" | "category">): PlantTraits {
  const base = CATEGORY_DEFAULTS[plant.category] ?? CATEGORY_DEFAULTS.Shrubs;
  const over = AUTHORED[plant.id];
  return over ? { ...base, ...over } : base;
}

export function traitsById(plantId: string): PlantTraits | null {
  const p = byId.get(plantId);
  return p ? traitsFor(p) : null;
}

/** Safe in the pool zone: belongs there, and drops nothing into the water. */
export const poolZoneOk = (t: PlantTraits): boolean => t.poolSafe && t.litter !== "fruit";

/** Two plants may share a bed (one drip zone) only if their water needs match. */
export const sameWater = (a: PlantTraits, b: PlantTraits): boolean => a.water === b.water;
