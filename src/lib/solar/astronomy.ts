/**
 * Wonderlands Solar — sky ephemeris.
 *
 * Pure, dependency-free astronomy used by the sky console: Julian day, local
 * sidereal time, equatorial→horizontal conversion, a Meeus-abridged lunar
 * position with phase, and low-precision Keplerian positions for the naked-eye
 * planets. Accuracy is arc-minute class for the Moon and a few arc-minutes for
 * the planets — far beyond what a 720px plate can resolve, and it costs nothing
 * because it never touches the network.
 */

const RAD = Math.PI / 180;
const norm360 = (d: number) => ((d % 360) + 360) % 360;

export interface Equatorial {
  /** Right ascension in degrees */
  ra: number;
  /** Declination in degrees */
  dec: number;
  /** Distance in AU (planets) or km (moon) */
  dist: number;
}

export interface Horizontal {
  altitude: number;
  azimuth: number;
}

/** Julian day from a JS Date. */
export const julianDay = (date: Date): number => date.getTime() / 86_400_000 + 2440587.5;

/** Days since the J2000.0 epoch. */
export const daysSinceJ2000 = (date: Date): number => julianDay(date) - 2451545.0;

/** Local apparent sidereal time in degrees. */
export const localSiderealTime = (date: Date, lngDeg: number): number => {
  const d = daysSinceJ2000(date);
  return norm360(280.46061837 + 360.98564736629 * d + lngDeg);
};

/** Mean obliquity of the ecliptic, degrees. */
const obliquity = (d: number) => 23.4392911 - 3.563e-7 * d;

/** Ecliptic longitude/latitude (deg) → equatorial RA/dec (deg). */
export const eclipticToEquatorial = (
  lonDeg: number,
  latDeg: number,
  dist: number,
  d: number,
): Equatorial => {
  const e = obliquity(d) * RAD;
  const l = lonDeg * RAD;
  const b = latDeg * RAD;
  const sinDec = Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l);
  const dec = Math.asin(Math.max(-1, Math.min(1, sinDec))) / RAD;
  const y = Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e);
  const x = Math.cos(l);
  const ra = norm360(Math.atan2(y, x) / RAD);
  return { ra, dec, dist };
};

/** Equatorial → horizontal for an observer. */
export const equatorialToHorizontal = (
  eq: Equatorial,
  date: Date,
  latDeg: number,
  lngDeg: number,
): Horizontal => {
  const lst = localSiderealTime(date, lngDeg);
  const H = norm360(lst - eq.ra) * RAD;
  const lat = latDeg * RAD;
  const dec = eq.dec * RAD;
  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) / RAD;
  const az =
    Math.atan2(
      -Math.cos(dec) * Math.cos(lat === 0 ? 1e-9 : lat) * 0 - Math.sin(H) * Math.cos(dec),
      Math.cos(H) * Math.cos(dec) * Math.sin(lat) - Math.sin(dec) * Math.cos(lat),
    ) / RAD;
  // atan2 above is measured from north through east once normalised
  return { altitude, azimuth: norm360(az + 180) };
};

/* ── the Sun ──────────────────────────────────────────────────────────── */

/** Geometric ecliptic longitude of the Sun (deg) and its distance in AU. */
export const sunEcliptic = (date: Date) => {
  const d = daysSinceJ2000(date);
  const L = norm360(280.459 + 0.98564736 * d);
  const g = norm360(357.529 + 0.98560028 * d) * RAD;
  const lon = norm360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
  const dist = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);
  return { lon, lat: 0, dist };
};

export const sunEquatorial = (date: Date): Equatorial => {
  const d = daysSinceJ2000(date);
  const s = sunEcliptic(date);
  return eclipticToEquatorial(s.lon, 0, s.dist, d);
};

/* ── the Moon ─────────────────────────────────────────────────────────── */

export interface MoonRead extends Horizontal {
  /** 0 = new, 0.5 = full, 1 = new again */
  phase: number;
  /** Fraction of the disc lit, 0–1 */
  illumination: number;
  /** Angular diameter in degrees */
  diameterDeg: number;
  /** Distance in km */
  distanceKm: number;
  /** Human phase name */
  phaseName: string;
  /** True when the lit limb faces plate-right */
  waxing: boolean;
}

const PHASE_NAMES = [
  "New moon",
  "Waxing crescent",
  "First quarter",
  "Waxing gibbous",
  "Full moon",
  "Waning gibbous",
  "Last quarter",
  "Waning crescent",
];

/** Moon position and phase (Meeus, abridged series). */
export const moonRead = (date: Date, latDeg: number, lngDeg: number): MoonRead => {
  const d = daysSinceJ2000(date);
  const L = norm360(218.316 + 13.176396 * d); // mean longitude
  const M = norm360(134.963 + 13.064993 * d) * RAD; // mean anomaly
  const F = norm360(93.272 + 13.229350 * d) * RAD; // argument of latitude
  const D = norm360(297.8502 + 12.190749 * d) * RAD; // mean elongation

  const lon = norm360(
    L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D) +
      0.214 * Math.sin(2 * M) - 0.186 * Math.sin(norm360(357.529 + 0.98560028 * d) * RAD),
  );
  const lat = 5.128 * Math.sin(F) + 0.281 * Math.sin(M + F) - 0.278 * Math.sin(F - M);
  const distanceKm = 385001 - 20905 * Math.cos(M) - 3699 * Math.cos(2 * D - M) - 2956 * Math.cos(2 * D);

  const eq = eclipticToEquatorial(lon, lat, distanceKm, d);
  const hor = equatorialToHorizontal(eq, date, latDeg, lngDeg);

  const sun = sunEcliptic(date);
  const elong = norm360(lon - sun.lon);
  const phase = elong / 360;
  const illumination = (1 - Math.cos(elong * RAD)) / 2;
  const idx = Math.round(phase * 8) % 8;

  return {
    ...hor,
    phase,
    illumination,
    diameterDeg: (2 * Math.atan(1737.4 / distanceKm)) / RAD,
    distanceKm,
    phaseName: PHASE_NAMES[idx],
    waxing: elong < 180,
  };
};

/* ── the planets ──────────────────────────────────────────────────────── */

interface Elements {
  name: string;
  /** semi-major axis (AU), rate per century */
  a: [number, number];
  /** eccentricity, rate */
  e: [number, number];
  /** inclination (deg), rate */
  i: [number, number];
  /** mean longitude (deg), rate */
  L: [number, number];
  /** longitude of perihelion (deg), rate */
  w: [number, number];
  /** longitude of ascending node (deg), rate */
  o: [number, number];
  /** absolute-ish brightness constant used for the plate's dot size */
  mag: number;
  /** disc tint used by the plate's NASA-like gradients */
  tint: string;
}

/** JPL Keplerian elements, J2000 with per-century rates. */
const PLANETS: Elements[] = [
  { name: "Mercury", a: [0.38709927, 0.00000037], e: [0.20563593, 0.00001906], i: [7.00497902, -0.00594749], L: [252.25032350, 149472.67411175], w: [77.45779628, 0.16047689], o: [48.33076593, -0.12534081], mag: -0.4, tint: "#c9c0b4" },
  { name: "Venus", a: [0.72333566, 0.00000390], e: [0.00677672, -0.00004107], i: [3.39467605, -0.00078890], L: [181.97909950, 58517.81538729], w: [131.60246718, 0.00268329], o: [76.67984255, -0.27769418], mag: -4.4, tint: "#f6e7c1" },
  { name: "Mars", a: [1.52371034, 0.00001847], e: [0.09339410, 0.00007882], i: [1.84969142, -0.00813131], L: [-4.55343205, 19140.30268499], w: [-23.94362959, 0.44441088], o: [49.55953891, -0.29257343], mag: -1.5, tint: "#c1440e" },
  { name: "Jupiter", a: [5.20288700, -0.00011607], e: [0.04838624, -0.00013253], i: [1.30439695, -0.00183714], L: [34.39644051, 3034.74612775], w: [14.72847983, 0.21252668], o: [100.47390909, 0.20469106], mag: -2.7, tint: "#d8b48b" },
  { name: "Saturn", a: [9.53667594, -0.00125060], e: [0.05386179, -0.00050991], i: [2.48599187, 0.00193609], L: [49.95424423, 1222.49362201], w: [92.59887831, -0.41897216], o: [113.66242448, -0.28867794], mag: 0.5, tint: "#e3ce9b" },
];

const helio = (el: Elements, T: number) => {
  const a = el.a[0] + el.a[1] * T;
  const e = el.e[0] + el.e[1] * T;
  const i = (el.i[0] + el.i[1] * T) * RAD;
  const L = norm360(el.L[0] + el.L[1] * T);
  const w = el.w[0] + el.w[1] * T;
  const o = (el.o[0] + el.o[1] * T) * RAD;
  const M = norm360(L - w) * RAD;
  const wp = (w - el.o[0] - el.o[1] * T) * RAD; // argument of perihelion

  // Kepler's equation, Newton–Raphson
  let E = M;
  for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));

  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);

  const u = v + wp;
  return {
    x: r * (Math.cos(o) * Math.cos(u) - Math.sin(o) * Math.sin(u) * Math.cos(i)),
    y: r * (Math.sin(o) * Math.cos(u) + Math.cos(o) * Math.sin(u) * Math.cos(i)),
    z: r * Math.sin(u) * Math.sin(i),
    r,
  };
};

export interface PlanetRead extends Horizontal {
  name: string;
  tint: string;
  /** Distance from Earth in AU */
  distanceAu: number;
  /** Rough apparent magnitude — drives the dot size on the plate */
  magnitude: number;
}

/** Geocentric horizontal positions of the naked-eye planets. */
export const planetReads = (date: Date, latDeg: number, lngDeg: number): PlanetRead[] => {
  const d = daysSinceJ2000(date);
  const T = d / 36525;

  /* Earth from the Earth–Moon barycentre elements. */
  const earth = helio(
    { name: "Earth", a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392], i: [-0.00001531, -0.01294668], L: [100.46457166, 35999.37244981], w: [102.93768193, 0.32327364], o: [0, 0], mag: 0, tint: "#fff" },
    T,
  );

  return PLANETS.map((el) => {
    const p = helio(el, T);
    const x = p.x - earth.x;
    const y = p.y - earth.y;
    const z = p.z - earth.z;
    const dist = Math.hypot(x, y, z);
    const lon = norm360(Math.atan2(y, x) / RAD);
    const lat = Math.asin(z / dist) / RAD;
    const eq = eclipticToEquatorial(lon, lat, dist, d);
    const hor = equatorialToHorizontal(eq, date, latDeg, lngDeg);
    return {
      name: el.name,
      tint: el.tint,
      distanceAu: dist,
      magnitude: el.mag + 5 * Math.log10(Math.max(0.1, p.r * dist)),
      ...hor,
    };
  });
};

/* ── bright stars ─────────────────────────────────────────────────────── */

export interface StarCatalogEntry {
  name: string;
  /** RA in hours, dec in degrees, visual magnitude */
  raH: number;
  dec: number;
  mag: number;
  /** Approximate colour from spectral class */
  color: string;
}

/** The brightest stars, enough to make the plate recognisably the real sky. */
export const BRIGHT_STARS: StarCatalogEntry[] = [
  { name: "Sirius", raH: 6.752, dec: -16.72, mag: -1.46, color: "#cbe6ff" },
  { name: "Canopus", raH: 6.399, dec: -52.7, mag: -0.72, color: "#f6f1e2" },
  { name: "Arcturus", raH: 14.261, dec: 19.18, mag: -0.05, color: "#ffd6a4" },
  { name: "Vega", raH: 18.615, dec: 38.78, mag: 0.03, color: "#dbe9ff" },
  { name: "Capella", raH: 5.278, dec: 45.998, mag: 0.08, color: "#fff2cf" },
  { name: "Rigel", raH: 5.242, dec: -8.2, mag: 0.13, color: "#c8ddff" },
  { name: "Procyon", raH: 7.655, dec: 5.225, mag: 0.34, color: "#f4f7ff" },
  { name: "Betelgeuse", raH: 5.919, dec: 7.407, mag: 0.42, color: "#ffb27a" },
  { name: "Achernar", raH: 1.629, dec: -57.24, mag: 0.46, color: "#cfe3ff" },
  { name: "Altair", raH: 19.846, dec: 8.868, mag: 0.77, color: "#f2f6ff" },
  { name: "Aldebaran", raH: 4.599, dec: 16.509, mag: 0.85, color: "#ffbe86" },
  { name: "Antares", raH: 16.49, dec: -26.43, mag: 1.09, color: "#ff9d6e" },
  { name: "Spica", raH: 13.42, dec: -11.16, mag: 1.04, color: "#cdddff" },
  { name: "Pollux", raH: 7.755, dec: 28.026, mag: 1.14, color: "#ffd9a8" },
  { name: "Fomalhaut", raH: 22.961, dec: -29.62, mag: 1.16, color: "#eef3ff" },
  { name: "Deneb", raH: 20.69, dec: 45.28, mag: 1.25, color: "#e6efff" },
  { name: "Regulus", raH: 10.139, dec: 11.967, mag: 1.35, color: "#dcebff" },
  { name: "Castor", raH: 7.577, dec: 31.888, mag: 1.58, color: "#e8f0ff" },
  { name: "Bellatrix", raH: 5.418, dec: 6.35, mag: 1.64, color: "#cfe0ff" },
  { name: "Alnilam", raH: 5.604, dec: -1.202, mag: 1.69, color: "#c9dcff" },
  { name: "Alnitak", raH: 5.679, dec: -1.943, mag: 1.77, color: "#cadcff" },
  { name: "Mintaka", raH: 5.533, dec: -0.299, mag: 2.25, color: "#cddfff" },
  { name: "Polaris", raH: 2.53, dec: 89.264, mag: 1.98, color: "#fff6e2" },
  { name: "Alphard", raH: 9.46, dec: -8.66, mag: 1.98, color: "#ffc79a" },
  { name: "Denebola", raH: 11.818, dec: 14.572, mag: 2.11, color: "#eef4ff" },
  { name: "Sadr", raH: 20.371, dec: 40.257, mag: 2.23, color: "#fff0da" },
  { name: "Alphecca", raH: 15.578, dec: 26.715, mag: 2.22, color: "#e4eeff" },
  { name: "Markab", raH: 23.079, dec: 15.205, mag: 2.48, color: "#e9f0ff" },
];

/** Star position for the observer, from its catalogue coordinates. */
export const starHorizontal = (
  star: StarCatalogEntry,
  date: Date,
  latDeg: number,
  lngDeg: number,
): Horizontal => equatorialToHorizontal({ ra: star.raH * 15, dec: star.dec, dist: 1 }, date, latDeg, lngDeg);
