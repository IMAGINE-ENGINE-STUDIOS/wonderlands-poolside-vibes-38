// Wonderlands Solar — the sun study and production engine.
//
// Everything here is pure geometry and irradiance maths on the roof faces the
// reader captured, so it runs instantly with no network call and no cost. When
// the Google Solar API covers the address its measured figures are carried on
// the face and used in preference; this model is the fallback and the
// cross-check printed beside it.

import {
  FL_UTILITY_RATE,
  PANEL_DEGRADATION,
  UTILITY_ESCALATION,
  type SolarPanelSpec,
} from "@/data/solarHardware";

export interface LatLng {
  lat: number;
  lng: number;
}

/** One captured roof face. */
export interface RoofFace {
  id: string;
  /** Polygon in geographic coordinates, drawn or auto-traced */
  path: LatLng[];
  /** Plan (footprint) area in square feet */
  planAreaSqFt: number;
  /** Compass direction the face slopes toward, 0 = north, 90 = east */
  azimuthDeg: number;
  /** Roof slope in degrees */
  pitchDeg: number;
  /** Shading loss the reader dialled in, 0–0.6 */
  shadeFactor: number;
  /** Measured annual sunshine hours from the Solar API, when covered */
  measuredSunshineHours?: number | null;
  /** True when the face came from Google's roof segments rather than a trace */
  source: "auto" | "traced";
  /** Excluded from the array (vent stack, skylight, north face the reader rejects) */
  excluded?: boolean;
}

/* ── geometry ─────────────────────────────────────────────────────────── */

const M2_TO_SQFT = 10.7639;
const EARTH_R_M = 6378137;

/** Planar (shoelace) area of a lat/lng ring in square feet. */
export const pathAreaSqFt = (path: LatLng[]): number => {
  if (path.length < 3) return 0;
  const latRad = (path[0].lat * Math.PI) / 180;
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * latRad);
  const mPerDegLng = (Math.PI / 180) * EARTH_R_M * Math.cos(latRad);
  let sum = 0;
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    sum += a.lng * mPerDegLng * (b.lat * mPerDegLat) - b.lng * mPerDegLng * (a.lat * mPerDegLat);
  }
  return Math.abs(sum / 2) * M2_TO_SQFT;
};

/** Sloped surface area — the plan area opened out by the pitch. */
export const slopedAreaSqFt = (face: RoofFace): number =>
  face.planAreaSqFt / Math.max(0.35, Math.cos((face.pitchDeg * Math.PI) / 180));

/** Longest horizontal run of the ring, in feet — used for rail length. */
export const pathSpanFt = (path: LatLng[]): number => {
  if (path.length < 2) return 0;
  const latRad = (path[0].lat * Math.PI) / 180;
  const mPerDegLat = 111132.92;
  const mPerDegLng = (Math.PI / 180) * EARTH_R_M * Math.cos(latRad);
  let max = 0;
  for (let i = 0; i < path.length; i++)
    for (let j = i + 1; j < path.length; j++) {
      const dx = (path[i].lng - path[j].lng) * mPerDegLng;
      const dy = (path[i].lat - path[j].lat) * mPerDegLat;
      max = Math.max(max, Math.hypot(dx, dy));
    }
  return max * 3.28084;
};

/** Straight-line distance between two points, in feet. */
export const distanceFt = (a: LatLng, b: LatLng): number => {
  const latRad = (a.lat * Math.PI) / 180;
  const mPerDegLat = 111132.92;
  const mPerDegLng = (Math.PI / 180) * EARTH_R_M * Math.cos(latRad);
  const dx = (a.lng - b.lng) * mPerDegLng;
  const dy = (a.lat - b.lat) * mPerDegLat;
  return Math.hypot(dx, dy) * 3.28084;
};

/** True when the point falls inside the ring (planar ray casting). */
export const pointInPath = (point: LatLng, path: LatLng[]): boolean => {
  let inside = false;
  for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
    const xi = path[i].lng;
    const yi = path[i].lat;
    const xj = path[j].lng;
    const yj = path[j].lat;
    const hits =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (hits) inside = !inside;
  }
  return inside;
};


/* ── sun exposure ─────────────────────────────────────────────────────── */

/**
 * Relative annual irradiance for a face, 0–1, at Florida latitudes.
 *
 * Azimuth: due south (180°) is the reference; a cosine falls off toward east and
 * west and bottoms out on a north face. Pitch: the optimum in Florida is close
 * to the latitude (~27°), so the penalty grows with the distance from it — a
 * flat roof still collects well, a steep north face barely at all.
 */
export const faceIrradianceScore = (face: RoofFace, latitude = 27.5): number => {
  const shade = 1 - Math.min(0.6, face.shadeFactor);

  /* A near-flat deck has no facing: the modules are tilt-racked toward the sun,
     so orientation stops mattering and only the ballast loss is taken. */
  if (face.pitchDeg <= 7) return Math.max(0.05, Math.min(1, 0.93 * shade));

  const off = Math.abs(((face.azimuthDeg - 180 + 540) % 360) - 180); // 0 = due south
  const azFactor = 0.62 + 0.38 * Math.cos((off * Math.PI) / 180);
  const optimum = Math.min(30, Math.max(18, latitude - 2));
  const tiltPenalty = Math.min(1, Math.abs(face.pitchDeg - optimum) / 62);
  // a steep face pointed away from the sun compounds both penalties
  const orientationWeight = 1 - tiltPenalty * (0.35 + (off / 180) * 0.65);
  const score = azFactor * orientationWeight * shade;
  return Math.max(0.05, Math.min(1, score));
};


export type ExposureBand = "prime" | "good" | "fair" | "shaded";

export interface ExposureRead {
  score: number;
  band: ExposureBand;
  /** Fill used on the map overlay — orange (prime) through red (shaded) */
  color: string;
  label: string;
  /** Annual sun hours for this face — measured when available */
  sunHours: number;
}

const BANDS: Record<ExposureBand, { color: string; label: string }> = {
  prime: { color: "#f97316", label: "Prime exposure" },
  good: { color: "#facc15", label: "Good exposure" },
  fair: { color: "#fb923c", label: "Partial exposure" },
  shaded: { color: "#dc2626", label: "Shaded / rejected" },
};

/** Peak sun hours per year on an ideally tilted Florida plane. */
export const FL_PEAK_SUN_HOURS = 1850;

export const readExposure = (face: RoofFace, latitude = 27.5): ExposureRead => {
  const score = faceIrradianceScore(face, latitude);
  const band: ExposureBand = score >= 0.86 ? "prime" : score >= 0.7 ? "good" : score >= 0.52 ? "fair" : "shaded";
  const sunHours = face.measuredSunshineHours
    ? Math.round(face.measuredSunshineHours * (1 - Math.min(0.6, face.shadeFactor)))
    : Math.round(FL_PEAK_SUN_HOURS * score);
  return { score, band, ...BANDS[band], sunHours };
};

/* ── panel layout ─────────────────────────────────────────────────────── */

/** Florida fire-code setback kept clear at ridges, hips, valleys and eaves. */
export const SETBACK_FT = 3;

export interface FaceLayout {
  faceId: string;
  panels: number;
  usableSqFt: number;
  orientation: "portrait" | "landscape";
  exposure: ExposureRead;
  /** Annual DC kWh this face contributes */
  yearlyKwh: number;
}

/**
 * How many modules fit a face, and what they make.
 * The setback perimeter is removed from the sloped area, a packing factor covers
 * the row gaps and staggering that a real layout loses, and the better of the two
 * module orientations is kept.
 */
export const layoutFace = (face: RoofFace, panel: SolarPanelSpec, latitude = 27.5): FaceLayout => {
  const exposure = readExposure(face, latitude);
  const sloped = slopedAreaSqFt(face);
  // the setback ring costs roughly the perimeter × setback; approximated from a
  // square of the same area so it scales sensibly on small dormers
  const side = Math.sqrt(Math.max(0, sloped));
  const usableSqFt = Math.max(0, (side - 2 * SETBACK_FT) ** 2);
  const panelSqFt = panel.widthFt * panel.heightFt;
  const packing = 0.86;
  const panels =
    face.excluded || exposure.band === "shaded" ? 0 : Math.max(0, Math.floor((usableSqFt * packing) / panelSqFt));
  const yearlyKwh = (panels * panel.watts * exposure.sunHours * 0.84) / 1000;
  return {
    faceId: face.id,
    panels,
    usableSqFt,
    orientation: side > panel.heightFt * 2 ? "portrait" : "landscape",
    exposure,
    yearlyKwh: Math.round(yearlyKwh),
  };
};

/* ── system totals ────────────────────────────────────────────────────── */

export interface SystemProduction {
  panels: number;
  kwDc: number;
  kwAc: number;
  /** Modelled house figure */
  yearlyKwhModel: number;
  /** Google Solar figure when the address is covered */
  yearlyKwhVerified: number | null;
  monthlyKwh: number;
  lifetimeKwh25: number;
  layouts: FaceLayout[];
}

/** System derate — inverter, wiring, soiling, temperature. */
export const SYSTEM_DERATE = 0.86;

export const computeProduction = (
  faces: RoofFace[],
  panel: SolarPanelSpec,
  latitude = 27.5,
): SystemProduction => {
  const layouts = faces.map((f) => layoutFace(f, panel, latitude));
  const panels = layouts.reduce((n, l) => n + l.panels, 0);
  const kwDc = (panels * panel.watts) / 1000;
  const yearlyKwhModel = Math.round(layouts.reduce((n, l) => n + l.yearlyKwh, 0));

  const measured = faces.filter((f) => f.measuredSunshineHours && !f.excluded);
  const yearlyKwhVerified = measured.length
    ? Math.round(
        layouts
          .filter((l) => measured.some((m) => m.id === l.faceId))
          .reduce((n, l) => {
            const face = faces.find((f) => f.id === l.faceId)!;
            const hours = (face.measuredSunshineHours ?? 0) * (1 - Math.min(0.6, face.shadeFactor));
            return n + (l.panels * panel.watts * hours * SYSTEM_DERATE) / 1000;
          }, 0),
      )
    : null;

  const yearly = yearlyKwhVerified ?? yearlyKwhModel;
  let lifetime = 0;
  for (let y = 0; y < 25; y++) lifetime += yearly * (1 - PANEL_DEGRADATION) ** y;

  return {
    panels,
    kwDc: Math.round(kwDc * 100) / 100,
    kwAc: Math.round(kwDc * 0.88 * 100) / 100,
    yearlyKwhModel,
    yearlyKwhVerified,
    monthlyKwh: Math.round(yearly / 12),
    lifetimeKwh25: Math.round(lifetime),
    layouts,
  };
};

/* ── savings ──────────────────────────────────────────────────────────── */

export interface SavingsRead {
  yearOneSavings: number;
  lifetimeSavings: number;
  offsetPercent: number;
  paybackYears: number | null;
  /** Estimated household consumption used for the offset */
  householdKwhPerYear: number;
}

export const computeSavings = (
  yearlyKwh: number,
  netCost: number,
  monthlyBill: number,
  rate = FL_UTILITY_RATE,
): SavingsRead => {
  const householdKwhPerYear = Math.max(1, Math.round((monthlyBill / rate) * 12));
  const offsetKwh = Math.min(yearlyKwh, householdKwhPerYear);
  const exported = Math.max(0, yearlyKwh - householdKwhPerYear);
  // Florida net metering credits export at the same 1:1 retail rate
  const yearOneSavings = Math.round((offsetKwh + exported) * rate);

  let lifetime = 0;
  for (let y = 0; y < 25; y++)
    lifetime += yearlyKwh * (1 - PANEL_DEGRADATION) ** y * rate * (1 + UTILITY_ESCALATION) ** y;

  const payback = yearOneSavings > 0 ? netCost / yearOneSavings : null;
  return {
    yearOneSavings,
    lifetimeSavings: Math.round(lifetime),
    offsetPercent: Math.min(999, Math.round((yearlyKwh / householdKwhPerYear) * 100)),
    paybackYears: payback ? Math.round(payback * 10) / 10 : null,
    householdKwhPerYear,
  };
};

/** Compass label for an azimuth. */
export const compassLabel = (azimuth: number): string => {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(((azimuth % 360) + 360) % 360 / 22.5) % 16];
};

/** Roof pitch in the builder's notation — "6:12". */
export const pitchAsRise = (pitchDeg: number): string =>
  `${(Math.tan((pitchDeg * Math.PI) / 180) * 12).toFixed(1)}:12`;
