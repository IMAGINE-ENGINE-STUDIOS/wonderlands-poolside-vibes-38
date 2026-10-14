/**
 * Garden traits for the catalog filters (sun, salt, pets, height, flowering).
 *
 * Derived, not hand-authored: height/flowering come from `plantSpecs`, the rest
 * from a small keyword table of well-known Florida habits. Memoised per plant so
 * filtering 400 rows on every keystroke stays instant.
 */
import type { LandscapingPlant } from "@/data/landscapingData";
import { getPlantSpec } from "./plantSpecs";

export type SunNeed = "full" | "part" | "shade";
export type HeightBand = "low" | "mid" | "tall" | "canopy";

export interface PlantTraits {
  sun: SunNeed[];
  saltTolerant: boolean;
  petSafe: boolean;
  flowering: boolean;
  height: HeightBand;
  heightFt: number;
  spreadFt: number;
  spacingFt: number;
  bloom: string | null;
  foliage: string;
}

const SHADE = /fern|cast iron|bromeliad|peace lily|philodendron|ti plant|cordyline|calathea|aglaonema|liriope|mondo|pothos|arboricola|croton|camellia|azalea/i;
const SALT = /palm|sea grape|seagrape|buttonwood|coco plum|clusia|muhly|sabal|cocos|bougainvillea|lantana|plumbago|beach|dune|carissa|oleander|silver|thryallis|pittosporum|podocarpus|yucca|agave|ixora|firebush/i;
// ASPCA-listed as toxic to cats/dogs (common FL nursery stock)
const TOXIC = /sago|oleander|azalea|lily|philodendron|dieffenbachia|croton|pothos|aloe|yucca|ti plant|cordyline|bird of paradise|lantana|crown of thorns|euphorbia|ivy|foxtail|allamanda|cast iron/i;

const cache = new Map<string, PlantTraits>();

export function plantTraits(plant: LandscapingPlant): PlantTraits {
  const hit = cache.get(plant.id);
  if (hit) return hit;
  const spec = getPlantSpec(plant, plant.variants[0]?.label);
  const n = plant.name;
  const shade = SHADE.test(n);
  const sun: SunNeed[] = shade ? ["part", "shade"] : plant.category === "Palms" || plant.category === "Trees" ? ["full"] : ["full", "part"];
  const h = spec.heightFt;
  const t: PlantTraits = {
    sun,
    saltTolerant: SALT.test(n) || plant.category === "Palms",
    petSafe: !TOXIC.test(n),
    flowering: spec.bloom !== null || plant.category === "Flowering",
    height: h < 2 ? "low" : h < 6 ? "mid" : h < 15 ? "tall" : "canopy",
    heightFt: h,
    spreadFt: spec.spreadFt,
    spacingFt: spec.spacingFt,
    bloom: spec.bloom,
    foliage: spec.foliage,
  };
  cache.set(plant.id, t);
  return t;
}

export const HEIGHT_LABEL: Record<HeightBand, string> = {
  low: "Under 2 ft",
  mid: "2–6 ft",
  tall: "6–15 ft",
  canopy: "Over 15 ft",
};
