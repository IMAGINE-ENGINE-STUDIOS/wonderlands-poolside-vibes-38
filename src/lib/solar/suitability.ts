// The NREL suitability screen, run against a real captured roof.
//
// The 2016 NREL rooftop-potential study decided whether roof area could host PV
// with four published tests: shading (production not below 70% of an identical
// unshaded system), tilt (not above 60°), azimuth (not facing north) and
// contiguous area (at least 10 m²). This module runs those same four tests
// against the faces the reader traced, so every accepted or rejected face on the
// board can be defended against the national study rather than asserted.
//
// It also places one specific roof against the published national figures — the
// developable-area share, the capacity density and the specific yield.

import {
  NREL_SUITABILITY,
  NATIONAL_SMALL_SPECIFIC_YIELD,
  NATIONAL_CAPACITY_DENSITY_W_PER_M2,
  M2_PER_SQFT,
  classifyBuilding,
  type BuildingClassSpec,
} from "@/data/nrelRooftopPotential";
import {
  faceIrradianceScore,
  slopedAreaSqFt,
  compassLabel,
  type FaceLayout,
  type RoofFace,
} from "./solarEngine";

export type Verdict = "suitable" | "marginal" | "rejected";

export interface CriterionRead {
  id: "shading" | "tilt" | "azimuth" | "area";
  label: string;
  /** The measured value, formatted for print. */
  reading: string;
  /** The published threshold this is tested against. */
  threshold: string;
  pass: boolean;
  /** Plain-language explanation, for the homeowner. */
  note: string;
}

export interface FaceSuitability {
  faceId: string;
  verdict: Verdict;
  /** Production of this face relative to an identical UNSHADED face — the NREL ratio. */
  shadedRatio: number;
  criteria: CriterionRead[];
  /** Criteria that failed, by label. */
  failed: string[];
  headline: string;
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

/**
 * How far off due north a face points. NREL excluded north-facing roof area;
 * we treat anything within 45° of north as the north-facing case.
 */
const northOffset = (azimuthDeg: number): number => Math.abs(((azimuthDeg + 180) % 360) - 180);

export const screenFace = (face: RoofFace, latitude = 27.5): FaceSuitability => {
  /* The NREL shading test compares a face against an IDENTICAL unshaded face —
     same tilt, same azimuth — so orientation must be held constant and only the
     shade factor removed. */
  const shaded = faceIrradianceScore(face, latitude);
  const unshaded = faceIrradianceScore({ ...face, shadeFactor: 0 }, latitude);
  const shadedRatio = unshaded > 0 ? shaded / unshaded : 0;

  const slopedSqFt = slopedAreaSqFt(face);
  const slopedM2 = slopedSqFt * M2_PER_SQFT;
  const offNorth = northOffset(face.azimuthDeg);
  const flatDeck = face.pitchDeg <= 7;

  const criteria: CriterionRead[] = [
    {
      id: "shading",
      label: "Shading",
      reading: pct(shadedRatio),
      threshold: `≥ ${pct(NREL_SUITABILITY.minShadedProductionRatio)} of unshaded`,
      pass: shadedRatio >= NREL_SUITABILITY.minShadedProductionRatio,
      note:
        shadedRatio >= NREL_SUITABILITY.minShadedProductionRatio
          ? "This face keeps enough sun to count as developable under the national screen."
          : "Trees or structures cost this face more than the study allows before roof area stops counting.",
    },
    {
      id: "tilt",
      label: "Tilt",
      reading: `${Math.round(face.pitchDeg)}°`,
      threshold: `≤ ${NREL_SUITABILITY.maxTiltDeg}°`,
      pass: face.pitchDeg <= NREL_SUITABILITY.maxTiltDeg,
      note:
        face.pitchDeg <= NREL_SUITABILITY.maxTiltDeg
          ? "Within the slope range that can be racked and walked safely."
          : "Steeper than the study's limit — the area is not counted as developable.",
    },
    {
      id: "azimuth",
      label: "Azimuth",
      reading: `${Math.round(face.azimuthDeg)}° ${compassLabel(face.azimuthDeg)}`,
      threshold: flatDeck ? "any (flat deck, tilt-racked)" : "not north-facing",
      pass: flatDeck || offNorth > NREL_SUITABILITY.northExclusionHalfWidthDeg,
      note: flatDeck
        ? "A near-flat deck has no facing — modules are tilt-racked toward the sun, so orientation stops mattering."
        : offNorth > NREL_SUITABILITY.northExclusionHalfWidthDeg
          ? "Pointed away from north, so the face is counted."
          : "North-facing roof area was excluded outright by the national study.",
    },
    {
      id: "area",
      label: "Contiguous area",
      reading: `${slopedM2.toFixed(1)} m² (${Math.round(slopedSqFt)} SF)`,
      threshold: `≥ ${NREL_SUITABILITY.minContiguousAreaM2} m²`,
      pass: slopedM2 >= NREL_SUITABILITY.minContiguousAreaM2,
      note:
        slopedM2 >= NREL_SUITABILITY.minContiguousAreaM2
          ? "Large enough to carry a contiguous run of modules."
          : "Too small a patch to hold a module run once setbacks are kept clear.",
    },
  ];

  const failed = criteria.filter((c) => !c.pass);
  const hardFail = failed.some((c) => c.id !== "shading");
  const verdict: Verdict = face.excluded
    ? "rejected"
    : failed.length === 0
      ? "suitable"
      : hardFail
        ? "rejected"
        : shadedRatio >= 0.55
          ? "marginal"
          : "rejected";

  const headline = face.excluded
    ? "Excluded by the designer"
    : verdict === "suitable"
      ? "Developable under the NREL screen"
      : verdict === "marginal"
        ? "Buildable, but below the national screen"
        : `Not developable — ${failed.map((c) => c.label.toLowerCase()).join(", ")}`;

  return { faceId: face.id, verdict, shadedRatio, criteria, failed: failed.map((c) => c.label), headline };
};

export interface VerdictColours {
  /** Token-free accent used for the map/verdict chip — matched to the exposure bands. */
  color: string;
  label: string;
}

export const VERDICT_STYLE: Record<Verdict, VerdictColours> = {
  suitable: { color: "#f97316", label: "Suitable" },
  marginal: { color: "#facc15", label: "Marginal" },
  rejected: { color: "#dc2626", label: "Rejected" },
};

/* ── benchmark against the national data ──────────────────────────────── */

export interface RoofBenchmark {
  buildingClass: BuildingClassSpec;
  /** Total plan footprint captured, SF */
  footprintSqFt: number;
  /** Sloped area of the faces that passed the screen, SF */
  suitableSqFt: number;
  /** Share of captured roof area that is developable, 0–1 */
  developableShare: number;
  /** NREL's published share for this class, 0–1 */
  nationalShare: number;
  /** Installed watts per square metre of developable area on THIS roof */
  capacityDensity: number;
  nationalCapacityDensity: number;
  /** kWh per installed kW per year on this roof */
  specificYield: number;
  nationalSpecificYield: number;
  /** Verdict in one word for the headline gauge */
  standing: "above" | "at" | "below";
  /** How much better or worse than the national roof, as a percentage delta */
  deltaPercent: number;
}

/**
 * NREL published the developable share for small buildings (26% of total roof
 * area within the lidar cities). Medium and large roofs are flatter and far less
 * obstructed, so their published shares are higher; we keep the small-building
 * figure as the headline comparison and scale the two larger classes to the
 * study's own ordering.
 */
const NATIONAL_DEVELOPABLE_SHARE: Record<BuildingClassSpec["id"], number> = {
  small: 0.26,
  medium: 0.49,
  large: 0.6,
};

export const benchmarkRoof = (opts: {
  faces: RoofFace[];
  layouts: FaceLayout[];
  screens: FaceSuitability[];
  kwDc: number;
  yearlyKwh: number;
}): RoofBenchmark => {
  const { faces, layouts, screens, kwDc, yearlyKwh } = opts;

  const footprintSqFt = faces.reduce((n, f) => n + f.planAreaSqFt, 0);
  const suitableSqFt = faces.reduce((n, f) => {
    const s = screens.find((x) => x.faceId === f.id);
    return s && s.verdict !== "rejected" ? n + slopedAreaSqFt(f) : n;
  }, 0);
  const slopedTotal = faces.reduce((n, f) => n + slopedAreaSqFt(f), 0);

  const buildingClass = classifyBuilding(footprintSqFt);
  const nationalShare = NATIONAL_DEVELOPABLE_SHARE[buildingClass.id];

  /* Rackable area actually consumed by the layout, in m² — the honest
     denominator for capacity density. */
  const rackedM2 = layouts.reduce((n, l) => n + l.usableSqFt, 0) * M2_PER_SQFT;

  const developableShare = slopedTotal > 0 ? suitableSqFt / slopedTotal : 0;
  const capacityDensity = rackedM2 > 0 ? (kwDc * 1000) / rackedM2 : 0;
  const specificYield = kwDc > 0 ? yearlyKwh / kwDc : 0;

  const delta =
    NATIONAL_SMALL_SPECIFIC_YIELD > 0
      ? (specificYield - NATIONAL_SMALL_SPECIFIC_YIELD) / NATIONAL_SMALL_SPECIFIC_YIELD
      : 0;

  return {
    buildingClass,
    footprintSqFt: Math.round(footprintSqFt),
    suitableSqFt: Math.round(suitableSqFt),
    developableShare,
    nationalShare,
    capacityDensity: Math.round(capacityDensity),
    nationalCapacityDensity: NATIONAL_CAPACITY_DENSITY_W_PER_M2,
    specificYield: Math.round(specificYield),
    nationalSpecificYield: NATIONAL_SMALL_SPECIFIC_YIELD,
    standing: Math.abs(delta) < 0.05 ? "at" : delta > 0 ? "above" : "below",
    deltaPercent: Math.round(delta * 100),
  };
};
