/**
 * Wonderlands Solar — astronomic performance instrumentation.
 *
 * A glassmorphic, mission-console style read-out of the live calculator:
 *   1. an orbital offset gauge — how much of the household bill the array covers,
 *   2. a sun-path dome — solstice/equinox arcs for the site latitude with a live
 *      solar marker and an irradiance intensity wash beneath the summer arc,
 *   3. a monthly kWh telemetry chart against household demand,
 *   4. a per-roof-face contribution ledger coloured by the aerial's exposure bands.
 *
 * All figures are viewBox-driven so they scale fluidly; motion is CSS only and
 * respects `prefers-reduced-motion`.
 */

import * as React from "react";
import {
  type RoofFace,
  type SystemProduction,
  type SavingsRead,
  compassLabel,
  readExposure,
} from "@/lib/solar/solarEngine";
import {
  BRIGHT_STARS,
  moonRead,
  planetReads,
  starHorizontal,
  sunEquatorial,
} from "@/lib/solar/astronomy";

import {
  DEFAULT_TARIFF_CODE,
  ELECTRICITY_TARIFFS,
  formatTariffMoney,
  tariffByCode,
} from "@/data/electricityTariffs";
import { usePersistentState } from "@/hooks/usePersistentState";


/**
 * Share of annual production per month for peninsular Florida — long, bright
 * spring, a wetter and cloudier summer, mild winter. Sums to 1.
 */
const FL_MONTH_SHARE = [
  0.071, 0.075, 0.089, 0.096, 0.096, 0.087, 0.086, 0.085, 0.081, 0.081, 0.077, 0.076,
];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  production: SystemProduction;
  savings: SavingsRead;
  faces: RoofFace[];
  latitude: number;
  /** Hide dollar figures while solar pricing stays on request */
  showMoney?: boolean;
}

const nf = new Intl.NumberFormat("en-US");
const RAD = Math.PI / 180;

/* ── solar geometry ───────────────────────────────────────────────────── */

/** Solar altitude + azimuth for a latitude, declination and hour angle (deg). */
const sunPosition = (latDeg: number, decDeg: number, hourAngleDeg: number) => {
  const lat = latDeg * RAD;
  const dec = decDeg * RAD;
  const H = hourAngleDeg * RAD;
  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz =
    (Math.sin(dec) - Math.sin(alt) * Math.sin(lat)) / (Math.cos(alt) * Math.cos(lat) || 1e-6);
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) / RAD; // from north
  if (hourAngleDeg > 0) az = 360 - az;
  return { altitude: alt / RAD, azimuth: az };
};

/** Declination for a day-of-year (Cooper's equation) — fallback only. */
const declination = (dayOfYear: number) =>
  23.45 * Math.sin(((360 / 365) * (dayOfYear - 81)) * RAD);

/**
 * True apparent solar declination for a calendar instant, taken from the same
 * ephemeris that places the Moon, the planets and the stars on this plate. The
 * solstice and equinox arcs are drawn from these figures, so their curvature is
 * the sky's own — not a sine approximation of the calendar.
 */
const decAt = (year: number, month: number, day: number) =>
  sunEquatorial(new Date(Date.UTC(year, month, day, 12, 0, 0))).dec;

/** Path geometry of the sun dome plate (a wide mission-console sheet). */
const DOME = { w: 720, h: 352, base: 262, left: 66, right: 686, top: 40 };
/** Azimuth window drawn across the plate: ENE → WNW. */
const AZ_FROM = 52;
const AZ_TO = 308;

/**
 * Project altitude/azimuth into the dome plate.
 *
 * The horizon is a circle seen from inside it, so the azimuth axis is projected
 * orthographically about due south: a degree of azimuth near the meridian opens
 * wide, a degree near the eastern or western edge foreshortens. That is what
 * gives a sun path its true curvature — the arc rises steeply out of the horizon
 * and rounds over at culmination, instead of the flat parabola a linear azimuth
 * axis draws. Altitude stays equidistant so the 15° grid remains a ruler, and
 * every body on the plate (sun, moon, planets, stars) shares this one geometry.
 */
const project = (azimuth: number, altitude: number) => {
  const half = (AZ_TO - AZ_FROM) / 2; // 128° each side of south
  const off = Math.max(-half, Math.min(half, azimuth - (AZ_FROM + half)));
  /* sin() over the half-window: monotonic, and foreshortened at the edges. */
  const u = Math.sin((off / half) * 90 * RAD);
  const cx = (DOME.left + DOME.right) / 2;
  return {
    x: cx + u * ((DOME.right - DOME.left) / 2),
    y: DOME.base - (Math.max(-12, altitude) / 90) * (DOME.base - DOME.top),
  };
};


/** Sample a full arc for a declination, keeping only daylight positions. */
const arcPoints = (lat: number, dec: number) => {
  const pts: { x: number; y: number; altitude: number }[] = [];
  for (let H = -180; H <= 180; H += 1) {
    const { altitude, azimuth } = sunPosition(lat, dec, H);
    if (altitude < 0) continue;
    const p = project(azimuth, altitude);
    pts.push({ ...p, altitude });
  }
  return pts;
};

/** Smooth the sampled arc into a Catmull-Rom curve so the culmination rounds. */
const toPath = (pts: { x: number; y: number }[]) => {
  if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
};


/* ── astronomical helpers ─────────────────────────────────────────────── */

/** Kasten–Young relative optical air mass for a solar altitude in degrees. */
const airMass = (altDeg: number) =>
  altDeg <= 0
    ? Infinity
    : 1 / (Math.sin(altDeg * RAD) + 0.50572 * Math.pow(altDeg + 6.07995, -1.6364));

/** Clear-sky direct normal irradiance (kW/m²) from air mass — Meinel model. */
const dniFor = (altDeg: number) => {
  const am = airMass(altDeg);
  if (!Number.isFinite(am)) return 0;
  return 1.353 * Math.pow(0.7, Math.pow(am, 0.678));
};

/** Hour angle of sunrise (deg) for a latitude and declination. */
const sunriseHourAngle = (latDeg: number, decDeg: number) => {
  const cosH = -Math.tan(latDeg * RAD) * Math.tan(decDeg * RAD);
  return Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD;
};

/** Day-of-year of a Date. */
const dayOfYearOf = (d: Date) =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);

const clockLabel = (hours: number) => {
  const h24 = ((hours % 24) + 24) % 24;
  const h = Math.floor(h24);
  const m = Math.round((h24 - h) * 60);
  const mm = m === 60 ? 0 : m;
  const hh = m === 60 ? (h + 1) % 24 : h;
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
};

const DAY_OF_MONTH_START = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

/**
 * Deterministic field of faint background stars — the sky's dust between the
 * catalogued bright stars. Fixed seed so the plate never shimmers into noise on
 * re-render, and each grain carries its own twinkle phase.
 */
const DUST = Array.from({ length: 260 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  const c = Math.sin(i * 39.4265) * 9871.234;
  const fa = a - Math.floor(a);
  const fb = b - Math.floor(b);
  const fc = c - Math.floor(c);
  return {
    x: 4 + fa * (DOME.w - 8),
    y: 4 + fb * (DOME.base - 12),
    r: 0.22 + fc * 0.72,
    o: 0.1 + fb * 0.55,
    delay: (fc * 5).toFixed(2),
    /* a faint colour spread — blue-white through amber, as the real sky reads */
    tint: fc > 0.82 ? "#ffd9b0" : fc > 0.6 ? "#fff4e2" : "#dbe7ff",
  };
});

/** The Milky Way band, drawn as a soft diagonal wash across the plate. */
const MILKY_WAY =
  `M${-20},${DOME.base - 40} C${DOME.w * 0.24},${DOME.base - 150} ${DOME.w * 0.52},${DOME.top - 30} ${DOME.w + 20},${DOME.top - 90} L${DOME.w + 20},${DOME.top + 40} C${DOME.w * 0.55},${DOME.top + 96} ${DOME.w * 0.26},${DOME.base - 60} ${-20},${DOME.base + 20} Z`;

/** Local clock offset for the site, approximated from its longitude. */
const tzOffsetHours = (lng: number) => Math.round(lng / 15);

/**
 * The wall-clock instant the console is showing: the selected day of year and
 * solar hour, resolved to a real UTC Date so the Moon, the planets and the star
 * field can be placed astronomically rather than decoratively.
 */
const sceneInstant = (year: number, doy: number, hours: number, lng: number): Date =>
  new Date(
    Date.UTC(year, 0, 1) +
      (doy - 1) * 86_400_000 +
      (hours - tzOffsetHours(lng)) * 3_600_000,
  );

/**
 * SunPathConsole — a hyperdetailed, scrubbable sky chart for the site latitude.
 *
 * The plate draws the annual sun corridor (between both solstices), the arc for
 * the selected day with hour stations, civil twilight bands, the horizon and
 * compass rose, plus a live solar marker. At night it becomes a real sky: the
 * catalogued bright stars, the Milky Way, the Moon at its true position and
 * phase, and the naked-eye planets with NASA-like disc tints. Below it, a
 * mission-roadmap ribbon sequences the day's events, and a yearly simulation
 * accumulates production against the selected country's electricity token.
 */
const SunPathConsole: React.FC<{
  lat: number;
  /** Site longitude — sets the local clock and the sidereal sky */
  lng?: number;
  glass: string;
  /** Modelled annual DC production, used by the yearly simulation */
  yearlyKwh: number;
}> = ({ lat, lng = -81.5, glass, yearlyKwh }) => {
  const now = React.useMemo(() => new Date(), []);
  const [doy, setDoy] = React.useState(() => dayOfYearOf(now));
  const [hours, setHours] = React.useState(() => now.getHours() + now.getMinutes() / 60);
  const [playing, setPlaying] = React.useState(false);
  const [station, setStation] = React.useState<number | null>(null);
  const [body, setBody] = React.useState<string | null>(null);

  /* ── yearly simulation ── */
  const [yearRun, setYearRun] = React.useState(false);
  const [yearDay, setYearDay] = React.useState(0);
  const [tariffCode, setTariffCode] = usePersistentState<string>(
    "solar.sky.tariff",
    DEFAULT_TARIFF_CODE,
  );
  const tariff = tariffByCode(tariffCode);


  /* Play sweeps the day forward in solar time, then rolls into the next day. */
  React.useEffect(() => {
    if (!playing) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setHours((h) => {
        const next = h + dt * 3; // 3 solar hours per second
        if (next >= 24) {
          setDoy((d) => (d % 365) + 1);
          return next - 24;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const dec = React.useMemo(() => declination(doy), [doy]);

  const dayArc = React.useMemo(() => arcPoints(lat, dec), [lat, dec]);
  const summer = React.useMemo(() => arcPoints(lat, declination(172)), [lat]);
  const winter = React.useMemo(() => arcPoints(lat, declination(355)), [lat]);
  const equinox = React.useMemo(() => arcPoints(lat, declination(80)), [lat]);

  /* Hour stations along today's arc — the "waypoints" of the flight path. */
  const stations = React.useMemo(() => {
    const out: { h: number; x: number; y: number; altitude: number; azimuth: number }[] = [];
    for (let h = 4; h <= 20; h += 1) {
      const pos = sunPosition(lat, dec, (h - 12) * 15);
      if (pos.altitude < 1.5) continue;
      out.push({ h, ...project(pos.azimuth, pos.altitude), ...pos });
    }
    return out;
  }, [lat, dec]);

  const sun = React.useMemo(() => {
    const pos = sunPosition(lat, dec, (hours - 12) * 15);
    return { ...pos, ...project(pos.azimuth, pos.altitude) };
  }, [lat, dec, hours]);

  const H = React.useMemo(() => sunriseHourAngle(lat, dec), [lat, dec]);
  const sunrise = 12 - H / 15;
  const sunset = 12 + H / 15;
  const daylight = sunset - sunrise;
  const civilH = React.useMemo(() => {
    const cosH =
      (Math.sin(-6 * RAD) - Math.sin(lat * RAD) * Math.sin(dec * RAD)) /
      (Math.cos(lat * RAD) * Math.cos(dec * RAD));
    return Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD;
  }, [lat, dec]);
  const firstLight = 12 - civilH / 15;
  const lastLight = 12 + civilH / 15;

  const noonAlt = 90 - Math.abs(lat - dec);
  const readAlt = station !== null ? stations[station].altitude : sun.altitude;
  const readAz = station !== null ? stations[station].azimuth : sun.azimuth;
  const readHour = station !== null ? stations[station].h : hours;
  const dni = dniFor(readAlt);
  const ghi = Math.max(0, dni * Math.sin(Math.max(0, readAlt) * RAD) * 1.08);
  const am = airMass(readAlt);
  const shadow = readAlt > 1 ? 1 / Math.tan(readAlt * RAD) : Infinity;

  /* ── the real sky at this instant ─────────────────────────────────────
     The plate resolves the selected day and solar hour into a true UTC
     instant, so the Moon, the planets and the catalogued stars sit where they
     actually are for this latitude and longitude. */
  const scene = React.useMemo(
    () => sceneInstant(now.getFullYear(), doy, hours, lng),
    [now, doy, hours, lng],
  );

  /** 0 = full daylight, 1 = astronomical night. Drives the OLED sky. */
  const night = Math.max(0, Math.min(1, (-sun.altitude + 6) / 18));

  const moon = React.useMemo(() => moonRead(scene, lat, lng), [scene, lat, lng]);
  const moonXY = project(moon.azimuth, moon.altitude);

  const planets = React.useMemo(
    () =>
      planetReads(scene, lat, lng)
        .filter((p) => p.altitude > 0.5 && p.azimuth > AZ_FROM - 4 && p.azimuth < AZ_TO + 4)
        .map((p) => ({ ...p, ...project(p.azimuth, p.altitude) })),
    [scene, lat, lng],
  );

  const stars = React.useMemo(
    () =>
      BRIGHT_STARS.map((st) => {
        const h = starHorizontal(st, scene, lat, lng);
        return { ...st, ...h, ...project(h.azimuth, h.altitude) };
      }).filter((st) => st.altitude > 1 && st.azimuth > AZ_FROM - 2 && st.azimuth < AZ_TO + 2),
    [scene, lat, lng],
  );

  /* ── yearly accumulation ──────────────────────────────────────────────
     A day's production is the annual figure spread by the Florida monthly
     share; running the year integrates it day by day so the reader watches the
     kilowatt-hours and the money bank up against their country's tariff. */
  const dailyKwh = React.useCallback(
    (day: number) => {
      let m = 0;
      DAY_OF_MONTH_START.forEach((start, i) => {
        if (day >= start) m = i;
      });
      const days = (DAY_OF_MONTH_START[m + 1] ?? 366) - DAY_OF_MONTH_START[m];
      return (yearlyKwh * FL_MONTH_SHARE[m]) / days;
    },
    [yearlyKwh],
  );

  const yearAccumulated = React.useMemo(() => {
    let total = 0;
    for (let d = 1; d <= Math.floor(yearDay); d++) total += dailyKwh(d);
    return total;
  }, [yearDay, dailyKwh]);

  React.useEffect(() => {
    if (!yearRun) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setYearDay(365);
      setYearRun(false);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setYearDay((d) => {
        const next = d + dt * 70; // a full year in roughly five seconds
        if (next >= 365) {
          setYearRun(false);
          return 365;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [yearRun]);

  /* Following the simulation moves the sky with it. */
  React.useEffect(() => {
    if (!yearRun) return;
    const d = Math.max(1, Math.round(yearDay));
    setDoy(d);
  }, [yearRun, yearDay]);

  const yearMoney = yearAccumulated * tariff.rate;
  const fullYearMoney = yearlyKwh * tariff.rate;

  const monthIdx = React.useMemo(() => {
    let m = 0;
    DAY_OF_MONTH_START.forEach((start, i) => {
      if (doy >= start) m = i;
    });
    return m;
  }, [doy]);

  /* Annual corridor: summer arc out, winter arc back. */
  const corridor = React.useMemo(() => {
    if (summer.length < 2 || winter.length < 2) return "";
    return `${toPath(summer)} L${[...winter].reverse().map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L")} Z`;
  }, [summer, winter]);

  const sunriseX = project(sunPosition(lat, dec, -H).azimuth, 0).x;
  const sunsetX = project(sunPosition(lat, dec, H).azimuth, 0).x;

  const roadmap = [
    { l: "First light", t: firstLight, tone: "muted" as const },
    { l: "Sunrise", t: sunrise, tone: "warm" as const },
    { l: "Golden hour ends", t: sunrise + 1, tone: "muted" as const },
    { l: "Solar noon", t: 12, tone: "peak" as const },
    { l: "Golden hour", t: sunset - 1, tone: "muted" as const },
    { l: "Sunset", t: sunset, tone: "warm" as const },
    { l: "Last light", t: lastLight, tone: "muted" as const },
  ];
  const progress = Math.max(0, Math.min(1, (hours - firstLight) / (lastLight - firstLight)));

  const chip =
    "group rounded-xl border border-white/15 bg-background/30 px-3 py-2.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-amber-300/45 hover:bg-background/45";

  return (
    <div className={glass}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 140% at 50% 130%, rgba(249,115,22,0.16), transparent 58%), radial-gradient(80% 90% at 6% -10%, rgba(79,70,229,0.22), transparent 62%), radial-gradient(70% 80% at 96% 0%, rgba(56,189,248,0.12), transparent 60%)",
        }}
      />

      {/* header */}
      <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
            Solar ephemeris · sky console
          </p>
          <p className="mt-1.5 text-lg font-light leading-tight sm:text-xl">
            {`${MONTH_NAMES[monthIdx]} ${doy - DAY_OF_MONTH_START[monthIdx] + 1} · ${clockLabel(readHour)}`}
            <span className="text-muted-foreground">{` · lat ${lat.toFixed(2)}°`}</span>
          </p>
        </div>
        {/* mission controls — hard-edged instrument keys, SpaceX console style */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
            className={`wl-key group ${playing ? "wl-key-live" : ""}`}
          >
            <span aria-hidden className="wl-key-glyph">
              {playing ? (
                <svg viewBox="0 0 12 12" width="11" height="11">
                  <rect x="1.5" y="1" width="3" height="10" rx="0.6" fill="currentColor" />
                  <rect x="7.5" y="1" width="3" height="10" rx="0.6" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 12 12" width="11" height="11">
                  <path d="M2 1l9 5-9 5z" fill="currentColor" />
                </svg>
              )}
            </span>
            <span className="wl-key-label">{playing ? "Pause transit" : "Run transit"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setYearDay(0);
              setYearRun((r) => !r);
              setPlaying(false);
            }}
            aria-pressed={yearRun}
            className={`wl-key ${yearRun ? "wl-key-live" : ""}`}
          >
            <span aria-hidden className="wl-key-glyph">
              <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="6" cy="6" r="4.4" />
                <path d="M6 2.6V6l2.4 1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="wl-key-label">{yearRun ? "Halt year" : "Simulate year"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const d = new Date();
              setPlaying(false);
              setYearRun(false);
              setDoy(dayOfYearOf(d));
              setHours(d.getHours() + d.getMinutes() / 60);
              setStation(null);
            }}
            className="wl-key wl-key-ghost"
          >
            <span aria-hidden className="wl-key-glyph">
              <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="6" cy="6" r="4.4" />
                <path d="M6 0.6v2M6 9.4v2M0.6 6h2M9.4 6h2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="wl-key-label">Now</span>
          </button>
        </div>
      </div>


      {/* plate */}
      <svg
        viewBox={`0 0 ${DOME.w} ${DOME.h}`}
        className="relative mt-4 w-full select-none"
        role="img"
        aria-label={`Sun path chart for latitude ${lat.toFixed(2)} degrees on day ${doy}`}
      >
        <defs>
          <linearGradient id="wlSkyDome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="wlCorridor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="wlIntensity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wlTwilight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
          </linearGradient>
          <filter id="wlSunGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* OLED night — true black at the zenith so the stars carry the plate */}
          <linearGradient id="wlOled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="55%" stopColor="#02030a" />
            <stop offset="100%" stopColor="#0a1024" />
          </linearGradient>
          <radialGradient id="wlMilky" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#cbd5ff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#cbd5ff" stopOpacity="0" />
          </radialGradient>
          <filter id="wlMilkyBlur" x="-20%" y="-40%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="wlStarBloom" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Lunar disc — a NASA-like maria pattern, lit from the true limb */}
          <radialGradient id="wlMoonDisc" cx="38%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#fdfcf7" />
            <stop offset="62%" stopColor="#e6e2d6" />
            <stop offset="100%" stopColor="#b9b4a6" />
          </radialGradient>
          <radialGradient id="wlMoonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#e8eaff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#e8eaff" stopOpacity="0" />
          </radialGradient>
          {/* Planet discs — banded and tinted after the NASA imagery */}
          <radialGradient id="wlVenus" cx="36%" cy="32%" r="76%">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="100%" stopColor="#e4c98f" />
          </radialGradient>
          <radialGradient id="wlMars" cx="36%" cy="32%" r="76%">
            <stop offset="0%" stopColor="#f0a06a" />
            <stop offset="60%" stopColor="#c1440e" />
            <stop offset="100%" stopColor="#7d2b09" />
          </radialGradient>
          <linearGradient id="wlJupiter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#efdcc0" />
            <stop offset="26%" stopColor="#c99a6d" />
            <stop offset="42%" stopColor="#f2e2c6" />
            <stop offset="58%" stopColor="#b97f52" />
            <stop offset="74%" stopColor="#e8d3b2" />
            <stop offset="100%" stopColor="#a97a52" />
          </linearGradient>
          <linearGradient id="wlSaturn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3e6c4" />
            <stop offset="50%" stopColor="#e0c893" />
            <stop offset="100%" stopColor="#bda06d" />
          </linearGradient>
          <radialGradient id="wlMercury" cx="36%" cy="32%" r="76%">
            <stop offset="0%" stopColor="#e4ded4" />
            <stop offset="100%" stopColor="#8f887c" />
          </radialGradient>
        </defs>

        {/* sky field — an OLED night that fades into the daylight wash */}
        <rect x={0} y={0} width={DOME.w} height={DOME.base} fill="#000208" opacity={night} />
        <rect x={0} y={0} width={DOME.w} height={DOME.base} fill="url(#wlOled)" opacity={night * 0.92} />
        <rect x={0} y={0} width={DOME.w} height={DOME.base} fill="url(#wlSkyDome)" opacity={1 - night * 0.55} />

        {/* Milky Way — a soft band, only readable once the sky goes dark */}
        <g aria-hidden opacity={night * 0.85} className="transition-opacity duration-700">
          <path d={MILKY_WAY} fill="url(#wlMilky)" filter="url(#wlMilkyBlur)" />
        </g>

        {/* background star dust */}
        <g aria-hidden opacity={0.25 + night * 0.75} className="transition-opacity duration-700">
          {DUST.map((s, i) => (
            <circle
              key={i}
              className="wl-twinkle"
              style={{ animationDelay: `${s.delay}s` }}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={s.tint}
              opacity={s.o}
            />
          ))}
        </g>

        {/* catalogued bright stars at their true altitude and azimuth */}
        <g aria-hidden opacity={Math.min(1, 0.18 + night * 0.95)} className="transition-opacity duration-700">
          {stars.map((st) => {
            const r = Math.max(0.9, 2.9 - st.mag * 0.62);
            return (
              <g key={st.name}>
                <circle cx={st.x} cy={st.y} r={r} fill={st.color} filter="url(#wlStarBloom)" />
                {st.mag < 0.9 && night > 0.45 && (
                  <>
                    <line
                      x1={st.x - r * 3}
                      x2={st.x + r * 3}
                      y1={st.y}
                      y2={st.y}
                      stroke={st.color}
                      strokeOpacity={0.35}
                      strokeWidth={0.5}
                    />
                    <line
                      x1={st.x}
                      x2={st.x}
                      y1={st.y - r * 3}
                      y2={st.y + r * 3}
                      stroke={st.color}
                      strokeOpacity={0.35}
                      strokeWidth={0.5}
                    />
                    <text
                      x={st.x + r + 5}
                      y={st.y + 3.5}
                      className="fill-slate-300"
                      style={{ fontSize: 9.5, letterSpacing: 0.6, opacity: 0.75 }}
                    >
                      {st.name.toUpperCase()}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>


        {/* twilight wedges outside the daylight window */}
        <rect
          x={DOME.left}
          y={DOME.top}
          width={Math.max(0, sunriseX - DOME.left)}
          height={DOME.base - DOME.top}
          fill="url(#wlTwilight)"
        />
        <rect
          x={sunsetX}
          y={DOME.top}
          width={Math.max(0, DOME.right - sunsetX)}
          height={DOME.base - DOME.top}
          fill="url(#wlTwilight)"
        />

        {/* altitude grid every 15° */}
        {[0, 15, 30, 45, 60, 75, 90].map((a) => {
          const y = DOME.base - (a / 90) * (DOME.base - DOME.top);
          const major = a % 30 === 0;
          return (
            <g key={a}>
              <line
                x1={DOME.left}
                x2={DOME.right}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={a === 0 ? 0.34 : major ? 0.12 : 0.07}
                strokeWidth={a === 0 ? 1.1 : 0.6}
                strokeDasharray={a === 0 ? undefined : major ? "3 6" : "1 7"}
              />
              <text x={12} y={y + 4} className="fill-muted-foreground" style={{ fontSize: 12, letterSpacing: 0.5 }}>
                {a}°
              </text>
            </g>
          );
        })}

        {/* compass rose along the horizon */}
        {[
          { az: 60, l: "ENE" },
          { az: 90, l: "E" },
          { az: 120, l: "ESE" },
          { az: 150, l: "SSE" },
          { az: 180, l: "S" },
          { az: 210, l: "SSW" },
          { az: 240, l: "WSW" },
          { az: 270, l: "W" },
          { az: 300, l: "WNW" },
        ].map(({ az, l }) => {
          const { x } = project(az, 0);
          const cardinal = l.length === 1;
          return (
            <g key={l}>
              <line
                x1={x}
                x2={x}
                y1={DOME.top}
                y2={DOME.base}
                stroke="currentColor"
                strokeOpacity={cardinal ? 0.1 : 0.05}
                strokeWidth={0.6}
              />
              <line x1={x} x2={x} y1={DOME.base} y2={DOME.base + (cardinal ? 9 : 5)} stroke="currentColor" strokeOpacity={0.3} strokeWidth={0.8} />
              <text
                x={x}
                y={DOME.base + 26}
                textAnchor="middle"
                className={cardinal ? "fill-foreground" : "fill-muted-foreground"}
                style={{ fontSize: cardinal ? 14 : 11, letterSpacing: 1.4, opacity: cardinal ? 0.95 : 0.72 }}
              >
                {l}
              </text>
              <text x={x} y={DOME.base + 40} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9.5, letterSpacing: 0.6, opacity: 0.7 }}>
                {`${az}°`}
              </text>
            </g>
          );
        })}

        {/* annual corridor between the solstices */}
        {corridor && <path d={corridor} fill="url(#wlCorridor)" stroke="none" />}

        {/* irradiance wash below today's arc */}
        {dayArc.length > 1 && (
          <path
            d={`${toPath(dayArc)} L${dayArc[dayArc.length - 1].x.toFixed(1)},${DOME.base} L${dayArc[0].x.toFixed(1)},${DOME.base} Z`}
            fill="url(#wlIntensity)"
          />
        )}

        {/* reference arcs */}
        <path d={toPath(summer)} fill="none" stroke="#fbbf24" strokeWidth={1} strokeOpacity={0.5} strokeDasharray="5 5" />
        <path d={toPath(equinox)} fill="none" stroke="#f97316" strokeWidth={0.9} strokeOpacity={0.4} strokeDasharray="5 5" />
        <path d={toPath(winter)} fill="none" stroke="currentColor" strokeWidth={0.9} strokeOpacity={0.3} strokeDasharray="5 5" />

        {/* today's flight path */}
        <path
          className="wl-arc"
          d={toPath(dayArc)}
          fill="none"
          stroke="#fde68a"
          strokeWidth={2}
          strokeLinecap="round"
          filter="url(#wlSunGlow)"
        />

        {/* hour stations — hover to inspect, click to jump the solar clock */}
        {stations.map((s, i) => (
          <g
            key={s.h}
            onPointerEnter={() => setStation(i)}
            onPointerLeave={() => setStation(null)}
            onClick={() => {
              setPlaying(false);
              setHours(s.h);
              setStation(null);
            }}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={-1}
            aria-label={`${clockLabel(s.h)} — altitude ${s.altitude.toFixed(0)} degrees`}
          >
            <circle cx={s.x} cy={s.y} r={14} fill="transparent" />
            {station === i && (
              <circle cx={s.x} cy={s.y} r={9} fill="#fde68a" opacity={0.16} />
            )}
            <circle
              cx={s.x}
              cy={s.y}
              r={station === i ? 5 : 2.8}
              fill={station === i ? "#fde68a" : "#fbbf24"}
              opacity={station === i ? 1 : 0.8}
              className="transition-all duration-200"
            />
            {(s.h % 2 === 0 || station === i) && (
              <text
                x={s.x}
                y={s.y - 13}
                textAnchor="middle"
                className={station === i ? "fill-foreground" : "fill-muted-foreground"}
                style={{ fontSize: station === i ? 12 : 10.5, letterSpacing: 0.4 }}
              >
                {clockLabel(s.h).replace(":00", "")}
              </text>
            )}
          </g>
        ))}

        {/* hovered station tooltip — a floating glass tag inside the plate */}
        {station !== null && stations[station] && (
          <g pointerEvents="none" className="wl-fade">
            {(() => {
              const s = stations[station];
              const w = 150;
              const h = 52;
              const x = Math.max(DOME.left, Math.min(DOME.right - w, s.x - w / 2));
              const above = s.y > DOME.top + 80;
              const y = above ? s.y - h - 26 : s.y + 24;
              return (
                <>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={10}
                    fill="rgba(8,12,24,0.66)"
                    stroke="rgba(253,230,138,0.45)"
                    strokeWidth={1}
                  />
                  <text x={x + 12} y={y + 20} className="fill-foreground" style={{ fontSize: 13 }}>
                    {clockLabel(s.h)}
                  </text>
                  <text x={x + 12} y={y + 38} className="fill-muted-foreground" style={{ fontSize: 11 }}>
                    {`${s.altitude.toFixed(0)}° alt · ${s.azimuth.toFixed(0)}° ${compassLabel(s.azimuth)}`}
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* horizon terminators */}
        {[
          { x: sunriseX, l: `SUNRISE ${clockLabel(sunrise)}`, anchor: "start" as const },
          { x: sunsetX, l: `SUNSET ${clockLabel(sunset)}`, anchor: "end" as const },
        ].map((t) => (
          <g key={t.l}>
            <line x1={t.x} x2={t.x} y1={DOME.base - 30} y2={DOME.base} stroke="#fbbf24" strokeOpacity={0.6} strokeWidth={1} strokeDasharray="2 3" />
            <text
              x={t.anchor === "start" ? t.x + 6 : t.x - 6}
              y={DOME.base - 36}
              textAnchor={t.anchor}
              className="fill-amber-200"
              style={{ fontSize: 10.5, letterSpacing: 1 }}
            >
              {t.l}
            </text>
          </g>
        ))}

        {/* solar noon column */}
        {(() => {
          const p = project(180, noonAlt);
          return (
            <g>
              <line x1={p.x} x2={p.x} y1={p.y} y2={DOME.base} stroke="#fde68a" strokeOpacity={0.28} strokeWidth={0.8} strokeDasharray="2 4" />
              <text x={p.x} y={p.y - 16} textAnchor="middle" className="fill-foreground" style={{ fontSize: 10.5, letterSpacing: 1, opacity: 0.8 }}>
                {`CULMINATION ${noonAlt.toFixed(1)}°`}
              </text>
            </g>
          );
        })()}

        {/* ── the Moon, at its true position, size and phase ── */}
        {moon.altitude > -1 && (
          <g opacity={Math.min(1, 0.25 + night)} className="transition-opacity duration-700">
            {(() => {
              /* The plate is not a fisheye, so the disc is drawn at a legible
                 scale rather than its 0.5° angular size; the phase, limb
                 orientation and position are the real ones. */
              const r = 9.5;
              const k = moon.illumination;
              const rx = r * Math.abs(1 - 2 * k);
              const outerSweep = moon.waxing ? 1 : 0;
              const innerSweep = k > 0.5 ? outerSweep : 1 - outerSweep;
              const lit = `M${moonXY.x},${moonXY.y - r} A${r},${r} 0 0 ${outerSweep} ${moonXY.x},${moonXY.y + r} A${rx},${r} 0 0 ${innerSweep} ${moonXY.x},${moonXY.y - r} Z`;
              return (
                <g
                  onPointerEnter={() => setBody("Moon")}
                  onPointerLeave={() => setBody(null)}
                  style={{ cursor: "help" }}
                >
                  <circle cx={moonXY.x} cy={moonXY.y} r={r * 3.2} fill="url(#wlMoonHalo)" />
                  {/* the unlit disc, earthshine faint */}
                  <circle cx={moonXY.x} cy={moonXY.y} r={r} fill="#1b1f2e" opacity={0.85} />
                  <path d={lit} fill="url(#wlMoonDisc)" />
                  {/* maria — Imbrium, Serenitatis, Tranquillitatis, Crisium */}
                  <g clipPath="none" opacity={0.34}>
                    <ellipse cx={moonXY.x - r * 0.28} cy={moonXY.y - r * 0.3} rx={r * 0.3} ry={r * 0.24} fill="#6f6a5f" />
                    <ellipse cx={moonXY.x + r * 0.12} cy={moonXY.y - r * 0.12} rx={r * 0.22} ry={r * 0.2} fill="#6f6a5f" />
                    <ellipse cx={moonXY.x + r * 0.3} cy={moonXY.y + r * 0.2} rx={r * 0.18} ry={r * 0.16} fill="#6f6a5f" />
                    <circle cx={moonXY.x + r * 0.58} cy={moonXY.y - r * 0.34} r={r * 0.12} fill="#6f6a5f" />
                  </g>
                  <circle cx={moonXY.x} cy={moonXY.y} r={r} fill="none" stroke="#e8eaff" strokeOpacity={0.22} strokeWidth={0.6} />
                  {night > 0.2 && (
                    <text
                      x={moonXY.x}
                      y={moonXY.y - r - 8}
                      textAnchor="middle"
                      className="fill-slate-200"
                      style={{ fontSize: 10.5, letterSpacing: 1 }}
                    >
                      {`MOON · ${(k * 100).toFixed(0)}%`}
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* ── naked-eye planets ── */}
        <g opacity={Math.min(1, 0.15 + night * 1.1)} className="transition-opacity duration-700">
          {planets.map((pl) => {
            const r = Math.max(1.8, 4.4 - pl.magnitude * 0.5);
            const fill =
              pl.name === "Venus"
                ? "url(#wlVenus)"
                : pl.name === "Mars"
                  ? "url(#wlMars)"
                  : pl.name === "Jupiter"
                    ? "url(#wlJupiter)"
                    : pl.name === "Saturn"
                      ? "url(#wlSaturn)"
                      : "url(#wlMercury)";
            return (
              <g
                key={pl.name}
                onPointerEnter={() => setBody(pl.name)}
                onPointerLeave={() => setBody(null)}
                style={{ cursor: "help" }}
              >
                <circle cx={pl.x} cy={pl.y} r={r * 2.6} fill={pl.tint} opacity={0.1} />
                {pl.name === "Saturn" && (
                  <ellipse
                    cx={pl.x}
                    cy={pl.y}
                    rx={r * 2.1}
                    ry={r * 0.5}
                    fill="none"
                    stroke="#e6d3a2"
                    strokeOpacity={0.65}
                    strokeWidth={0.9}
                    transform={`rotate(-14 ${pl.x} ${pl.y})`}
                  />
                )}
                {pl.name === "Jupiter" && (
                  <ellipse cx={pl.x + r * 0.3} cy={pl.y + r * 0.25} rx={r * 0.26} ry={r * 0.16} fill="#a4442c" opacity={0.8} />
                )}
                <circle cx={pl.x} cy={pl.y} r={r} fill={fill} />
                <circle cx={pl.x} cy={pl.y} r={r} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={0.4} />
                {(night > 0.3 || body === pl.name) && (
                  <text
                    x={pl.x}
                    y={pl.y - r - 7}
                    textAnchor="middle"
                    className="fill-slate-200"
                    style={{ fontSize: 9.5, letterSpacing: 0.9, opacity: 0.85 }}
                  >
                    {pl.name.toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* live sun with ray crown and ground track */}
        {sun.altitude > 0 && (
          <g>
            <line x1={sun.x} x2={sun.x} y1={sun.y} y2={DOME.base} stroke="#fbbf24" strokeOpacity={0.3} strokeWidth={0.8} />
            <line x1={DOME.left} x2={sun.x} y1={sun.y} y2={sun.y} stroke="#fbbf24" strokeOpacity={0.18} strokeWidth={0.6} strokeDasharray="2 4" />
            <g filter="url(#wlSunGlow)">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * 30) * RAD;
                return (
                  <line
                    key={i}
                    x1={sun.x + Math.cos(a) * 7}
                    y1={sun.y + Math.sin(a) * 7}
                    x2={sun.x + Math.cos(a) * 12}
                    y2={sun.y + Math.sin(a) * 12}
                    stroke="#fbbf24"
                    strokeOpacity={0.5}
                    strokeWidth={0.9}
                  />
                );
              })}
              <circle className="wl-pulse" cx={sun.x} cy={sun.y} r={8} fill="#fbbf24" opacity={0.35} />
              <circle cx={sun.x} cy={sun.y} r={4.4} fill="#fef3c7" />
            </g>
            <circle cx={sun.x} cy={DOME.base} r={2} fill="#f97316" opacity={0.7} />
          </g>
        )}
        {sun.altitude <= 0 && (
          <text x={DOME.w / 2} y={DOME.top + 16} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 12.5, letterSpacing: 2 }}>
            SUN BELOW HORIZON · ARRAY IDLE
          </text>
        )}
      </svg>

      {/* mission roadmap ribbon — click any milestone to fly the clock there */}
      <div className="relative mt-6">
        <div className="relative h-[5px] w-full rounded-full bg-foreground/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-400/70 via-amber-300 to-orange-400 transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 shadow-[0_0_18px_4px_rgba(251,191,36,0.7)] transition-[left] duration-300"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {roadmap.map((r) => {
            const passed = hours >= r.t;
            return (
              <li key={r.l}>
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setHours(Math.max(0, Math.min(24, r.t)));
                  }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-amber-300/60 ${
                    passed
                      ? "border-amber-300/40 bg-amber-300/10 shadow-[0_10px_30px_-24px_rgba(251,191,36,0.9)]"
                      : "border-white/12 bg-background/25"
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {r.l}
                  </span>
                  <span
                    className={`mt-1 block text-[15px] font-light leading-none tabular-nums ${
                      r.tone === "peak" ? "text-amber-200" : ""
                    }`}
                  >
                    {clockLabel(r.t)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* telemetry read-out */}
      <dl className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { k: "Altitude", v: `${Math.max(0, readAlt).toFixed(1)}°`, h: "Height of the sun above the horizon" },
          { k: "Azimuth", v: `${readAz.toFixed(0)}° ${compassLabel(readAz)}`, h: "Compass bearing of the sun" },
          { k: "Air mass", v: Number.isFinite(am) ? `${am.toFixed(2)} AM` : "—", h: "Atmosphere the light travels through" },
          { k: "Direct beam", v: `${dni.toFixed(2)} kW/m²`, h: "Clear-sky direct normal irradiance" },
          { k: "Global horiz.", v: `${ghi.toFixed(2)} kW/m²`, h: "Total light on a flat surface" },
          { k: "Shadow ratio", v: Number.isFinite(shadow) ? `${shadow.toFixed(1)}×` : "—", h: "Shadow length per unit of height" },
        ].map((t) => (
          <div key={t.k} className={chip} title={t.h}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{t.k}</dt>
            <dd className="mt-1 text-[17px] font-light tabular-nums leading-none">{t.v}</dd>
          </div>
        ))}
      </dl>

      {/* scrubbers */}
      <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block rounded-2xl border border-white/12 bg-background/25 p-4 backdrop-blur-xl">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Day of year</span>
            <span className="tabular-nums text-foreground/80">{`DOY ${doy} · dec ${dec >= 0 ? "+" : ""}${dec.toFixed(1)}°`}</span>
          </span>
          <input
            type="range"
            min={1}
            max={365}
            step={1}
            value={doy}
            onChange={(e) => setDoy(Number(e.target.value))}
            className="wl-range mt-3 w-full cursor-pointer"
            aria-label="Day of year"
          />
          <span className="mt-3 flex flex-wrap gap-1.5">
            {DAY_OF_MONTH_START.map((start, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDoy(start)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.1em] transition ${
                  monthIdx === i
                    ? "border-amber-300/55 bg-amber-300/15 text-amber-100"
                    : "border-white/12 bg-background/25 text-muted-foreground hover:border-white/30 hover:text-foreground"
                }`}
              >
                {MONTH_NAMES[i].slice(0, 3)}
              </button>
            ))}
          </span>
        </label>

        <label className="block rounded-2xl border border-white/12 bg-background/25 p-4 backdrop-blur-xl">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Solar clock</span>
            <span className="tabular-nums text-foreground/80">{`${daylight.toFixed(2)} h daylight`}</span>
          </span>
          <input
            type="range"
            min={0}
            max={24}
            step={0.05}
            value={hours}
            onChange={(e) => {
              setPlaying(false);
              setHours(Number(e.target.value));
            }}
            className="wl-range mt-3 w-full cursor-pointer"
            aria-label="Hour of day"
          />
          <span className="mt-3 flex flex-wrap gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {[
              { c: "#fde68a", l: "Selected day" },
              { c: "#fbbf24", l: "June solstice" },
              { c: "#f97316", l: "Equinox" },
              { c: "currentColor", l: "December solstice" },
            ].map((k) => (
              <span key={k.l} className="flex items-center gap-2 rounded-lg border border-white/12 bg-background/25 px-2.5 py-1.5">
                <span className="h-[3px] w-4 rounded-full" style={{ backgroundColor: k.c, opacity: k.c === "currentColor" ? 0.45 : 1 }} />
                {k.l}
              </span>
            ))}
          </span>
        </label>
      </div>

      {/* ── night-sky ephemeris ── */}
      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className={chip} title={`${moon.phaseName} · ${(moon.illumination * 100).toFixed(0)}% lit`}>
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Moon</dt>
          <dd className="mt-1 text-[15px] font-light leading-tight">
            {moon.phaseName}
            <span className="block text-[11px] text-muted-foreground tabular-nums">
              {`${(moon.illumination * 100).toFixed(0)}% lit · ${moon.altitude > 0 ? `${moon.altitude.toFixed(0)}° up` : "below horizon"}`}
            </span>
          </dd>
        </div>
        <div className={chip} title="Distance to the Moon at this instant">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lunar range</dt>
          <dd className="mt-1 text-[15px] font-light tabular-nums leading-tight">
            {`${nf.format(Math.round(moon.distanceKm))} km`}
            <span className="block text-[11px] text-muted-foreground">{`${moon.diameterDeg.toFixed(2)}° disc`}</span>
          </dd>
        </div>
        <div className={chip} title="Naked-eye planets above the horizon in this window of sky">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Planets up</dt>
          <dd className="mt-1 text-[15px] font-light leading-tight">
            {planets.length ? planets.map((p) => p.name).join(" · ") : "None in view"}
          </dd>
        </div>
        <div className={chip} title="Darkness of the sky, from full daylight to astronomical night">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sky state</dt>
          <dd className="mt-1 text-[15px] font-light leading-tight">
            {night >= 0.95 ? "Astronomical night" : night > 0.35 ? "Twilight" : night > 0.02 ? "Civil dusk" : "Daylight"}
            <span className="block text-[11px] text-muted-foreground tabular-nums">
              {`${(night * 100).toFixed(0)}% dark`}
            </span>
          </dd>
        </div>
      </div>

      {/* ── yearly simulation & electricity token ── */}
      <div className="relative mt-4 rounded-2xl border border-white/12 bg-background/25 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Yearly simulation
            </p>
            <p className="mt-1 text-base font-light">
              {`Day ${Math.max(1, Math.round(yearDay))} of 365`}
              <span className="text-muted-foreground">{` · ${MONTH_NAMES[monthIdx]}`}</span>
            </p>
          </div>
          <label className="min-w-[220px] flex-1 sm:max-w-xs">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Electricity token
            </span>
            <select
              value={tariffCode}
              onChange={(e) => setTariffCode(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-background/60 px-3 py-2 text-sm font-light outline-none transition focus:border-amber-300/60"
            >
              {ELECTRICITY_TARIFFS.map((t) => (
                <option key={t.code} value={t.code}>
                  {`${t.country} — ${formatTariffMoney(t.rate, t)}/kWh`}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              {tariff.grid}
            </span>
          </label>
        </div>

        {/* accumulation bar */}
        <div className="mt-4 h-[6px] w-full overflow-hidden rounded-full bg-foreground/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400/70 via-amber-300 to-orange-400"
            style={{ width: `${(Math.min(365, yearDay) / 365) * 100}%` }}
          />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className={chip}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Accumulated</dt>
            <dd className="mt-1 text-[17px] font-light tabular-nums leading-none">{`${nf.format(Math.round(yearAccumulated))} kWh`}</dd>
          </div>
          <div className={chip}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Full year</dt>
            <dd className="mt-1 text-[17px] font-light tabular-nums leading-none">{`${nf.format(Math.round(yearlyKwh))} kWh`}</dd>
          </div>
          <div className={chip}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Value banked</dt>
            <dd className="mt-1 text-[17px] font-light tabular-nums leading-none text-amber-200">
              {formatTariffMoney(yearMoney, tariff)}
            </dd>
          </div>
          <div className={chip}>
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Year value</dt>
            <dd className="mt-1 text-[17px] font-light tabular-nums leading-none">
              {formatTariffMoney(fullYearMoney, tariff)}
            </dd>
          </div>
        </dl>

        <input
          type="range"
          min={0}
          max={365}
          step={1}
          value={Math.round(yearDay)}
          onChange={(e) => {
            setYearRun(false);
            setYearDay(Number(e.target.value));
            setDoy(Math.max(1, Number(e.target.value)));
          }}
          className="wl-range mt-4 w-full cursor-pointer"
          aria-label="Simulated day of the year"
        />
      </div>
    </div>
  );
};


export const SolarPerformanceGraphics: React.FC<Props> = ({
  production,
  savings,
  faces,
  latitude,
  showMoney = false,
}) => {
  const yearly = production.yearlyKwhVerified ?? production.yearlyKwhModel;
  const monthly = React.useMemo(
    () => FL_MONTH_SHARE.map((share) => Math.round(yearly * share)),
    [yearly],
  );
  const peak = Math.max(1, ...monthly);

  /* Household demand line, drawn against the same axis as production. */
  const demandPerMonth = Math.round(savings.householdKwhPerYear / 12);
  const axisMax = Math.max(peak, demandPerMonth) * 1.12;

  const [hover, setHover] = React.useState<number | null>(null);

  /* The gauge sweeps to the offset percentage, capped at a full ring. */
  const offset = Math.max(0, Math.min(100, savings.offsetPercent));
  const R = 54;
  const CIRC = 2 * Math.PI * R;

  /* ── site latitude drives the astronomical console ── */
  const lat = latitude || 27;


  const contributions = React.useMemo(
    () =>
      production.layouts
        .map((l) => {
          const face = faces.find((f) => f.id === l.faceId);
          return { layout: l, face };
        })
        .filter((c) => c.face && c.layout.panels > 0)
        .sort((a, b) => b.layout.yearlyKwh - a.layout.yearlyKwh),
    [production.layouts, faces],
  );
  const bestFaceKwh = Math.max(1, ...contributions.map((c) => c.layout.yearlyKwh));

  if (!production.panels) {
    return (
      <div className="rounded-3xl border border-white/15 bg-foreground/[0.05] p-8 text-center backdrop-blur-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Performance</p>
        <p className="mt-3 text-base font-light text-muted-foreground">
          Trace a roof face to model production.
        </p>
      </div>
    );
  }

  /* shared glass shell — deeper frost, inner light line, ultra-wide friendly */
  const glass =
    "relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-foreground/[0.09] to-foreground/[0.02] p-5 backdrop-blur-2xl shadow-[0_28px_70px_-38px_rgba(8,12,24,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] transition-shadow duration-500 hover:shadow-[0_34px_90px_-38px_rgba(8,12,24,0.95),inset_0_1px_0_rgba(255,255,255,0.18)] sm:p-7";

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* keyframes are local so the figure carries its own motion */}
      <style>{`
        @keyframes wlSolarRing { from { stroke-dashoffset: ${CIRC}; } }
        @keyframes wlSolarBar  { from { transform: scaleY(0); } }
        @keyframes wlSolarGrow { from { transform: scaleX(0); } }
        @keyframes wlSolarLine { from { stroke-dashoffset: 1200; } }
        @keyframes wlSolarArc  { from { stroke-dashoffset: 900; } }
        @keyframes wlSolarFade { from { opacity: 0; transform: translateY(6px); } }
        @keyframes wlSolarPulse { 0%,100% { opacity:.35; transform: scale(1);} 50% { opacity:.9; transform: scale(1.35);} }
        @keyframes wlSolarDrift { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
        .wl-ring { animation: wlSolarRing 1.6s cubic-bezier(.22,.9,.2,1) both; }
        .wl-bar  { transform-origin: bottom; animation: wlSolarBar .9s cubic-bezier(.22,.9,.2,1) both; }
        .wl-line { stroke-dasharray: 1200; animation: wlSolarLine 1.8s ease-out .3s both; }
        .wl-arc  { stroke-dasharray: 900; animation: wlSolarArc 2.2s ease-out both; }
        .wl-fade { animation: wlSolarFade .7s ease-out both; }
        .wl-pulse { transform-box: fill-box; transform-origin: center; animation: wlSolarPulse 2.6s ease-in-out infinite; }
        .wl-drift { animation: wlSolarDrift 18s ease-in-out infinite alternate; }
        @keyframes wlTwinkle { 0%,100% { opacity: .28; } 45% { opacity: 1; } }
        .wl-twinkle { animation: wlTwinkle 4.5s ease-in-out infinite; }

        /* instrument keys — hard-edged mission controls, SpaceX console style */
        .wl-key { position: relative; display: inline-flex; align-items: center; gap: .55rem;
          padding: .62rem 1.05rem; border-radius: 6px; font-size: 11px; letter-spacing: .22em;
          text-transform: uppercase; color: hsl(var(--foreground) / .92);
          border: 1px solid hsl(var(--foreground) / .22);
          background: linear-gradient(180deg, hsl(var(--foreground) / .10), hsl(var(--foreground) / .02));
          box-shadow: inset 0 1px 0 hsl(var(--background) / .5), 0 10px 26px -18px hsl(var(--foreground) / .5);
          backdrop-filter: blur(18px); overflow: hidden;
          transition: border-color .2s ease, transform .2s ease, box-shadow .25s ease, color .2s ease; }
        .wl-key::after { content: ''; position: absolute; inset: 0; opacity: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,.28) 50%, transparent 80%);
          transition: opacity .3s ease; }
        .wl-key:hover { transform: translateY(-1px); border-color: rgba(217,119,6,.75);
          color: hsl(var(--foreground)); box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 14px 34px -18px rgba(251,191,36,.55); }
        .wl-key:hover::after { opacity: 1; }
        .wl-key:active { transform: translateY(0); }
        .wl-key:focus-visible { outline: none; border-color: rgba(251,191,36,.9);
          box-shadow: 0 0 0 2px rgba(251,191,36,.45); }
        .wl-key-glyph { display: inline-flex; align-items: center; justify-content: center;
          height: 20px; width: 20px; border-radius: 4px; color: currentColor;
          border: 1px solid hsl(var(--foreground) / .2); background: hsl(var(--foreground) / .08); }
        .wl-key-label { line-height: 1; }
        .wl-key-live { border-color: rgba(217,119,6,.85); color: hsl(var(--foreground));
          background: linear-gradient(180deg, rgba(251,191,36,.42), rgba(249,115,22,.18));
          box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 16px 40px -20px rgba(251,191,36,.8); }
        .wl-key-ghost { color: hsl(var(--muted-foreground)); border-color: hsl(var(--foreground) / .16);
          background: linear-gradient(180deg, hsl(var(--foreground) / .05), transparent); }

        /* generous, glassy scrubbers — big enough to grab on a touch screen */
        .wl-range { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 999px;
          background: linear-gradient(90deg, rgba(99,102,241,.45), rgba(251,191,36,.55), rgba(249,115,22,.5));
          box-shadow: inset 0 1px 3px rgba(0,0,0,.45); outline: none; }
        .wl-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none;
          height: 22px; width: 22px; border-radius: 999px; background: #fef3c7;
          border: 1px solid rgba(255,255,255,.7);
          box-shadow: 0 0 0 5px rgba(251,191,36,.18), 0 6px 16px rgba(0,0,0,.45);
          transition: transform .18s ease, box-shadow .18s ease; cursor: grab; }
        .wl-range::-webkit-slider-thumb:hover { transform: scale(1.12); box-shadow: 0 0 0 8px rgba(251,191,36,.24), 0 8px 20px rgba(0,0,0,.5); }
        .wl-range::-moz-range-thumb { height: 20px; width: 20px; border-radius: 999px; background: #fef3c7;
          border: 1px solid rgba(255,255,255,.7); box-shadow: 0 0 0 5px rgba(251,191,36,.18); cursor: grab; }
        .wl-range:focus-visible { box-shadow: inset 0 1px 3px rgba(0,0,0,.45), 0 0 0 2px rgba(251,191,36,.7); }

        @media (prefers-reduced-motion: reduce) {
          .wl-ring, .wl-bar, .wl-grow, .wl-line, .wl-arc, .wl-fade, .wl-pulse, .wl-drift, .wl-twinkle { animation: none; }
        }
      `}</style>

      {/* ── astronomical sun-path console ── */}
      <SunPathConsole lat={lat} glass={glass} yearlyKwh={yearly} />


      {/* ── monthly production ── */}
      <div className={glass}>
        <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[12px] uppercase tracking-[0.3em] text-muted-foreground">Production by month</p>
          <p className="text-[13px] text-muted-foreground">
            {hover === null
              ? "kWh · dashed line is your household demand"
              : `${MONTH_NAMES[hover]} — ${nf.format(monthly[hover])} kWh`}
          </p>
        </div>

        <svg
          viewBox="0 0 360 140"
          preserveAspectRatio="none"
          className="relative mt-5 h-44 w-full sm:h-56 xl:h-64"
          role="img"
          aria-label="Modelled monthly production against household demand"
        >
          <defs>
            <linearGradient id="wlBarCover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="wlBarShort" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          {/* demand reference */}
          <line
            x1="0"
            x2="360"
            y1={120 - (demandPerMonth / axisMax) * 104}
            y2={120 - (demandPerMonth / axisMax) * 104}
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          {monthly.map((kwh, i) => {
            const h = (kwh / axisMax) * 104;
            const w = 360 / 12;
            const covers = kwh >= demandPerMonth;
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={i * w} y={0} width={w} height={134} fill="transparent" />
                <rect
                  className="wl-bar"
                  style={{ animationDelay: `${i * 0.06}s` }}
                  x={i * w + w * 0.22}
                  y={120 - h}
                  width={w * 0.56}
                  height={Math.max(1, h)}
                  fill={covers ? "url(#wlBarCover)" : "url(#wlBarShort)"}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
                <text
                  x={i * w + w / 2}
                  y={133}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  style={{ fontSize: 11, letterSpacing: 1.2 }}
                >
                  {MONTHS[i]}
                </text>
              </g>
            );
          })}
          {/* production curve over the bars */}
          <polyline
            className="wl-line"
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeWidth={1.5}
            points={monthly
              .map((kwh, i) => `${i * (360 / 12) + 360 / 24},${120 - (kwh / axisMax) * 104}`)
              .join(" ")}
          />
        </svg>
      </div>

      {/* ── per-face contribution ── */}
      <div className={glass}>
        <p className="relative text-[12px] uppercase tracking-[0.3em] text-muted-foreground">
          Where the energy comes from
        </p>
        <ul className="relative mt-4 space-y-3">
          {contributions.map(({ layout, face }, i) => {
            const exposure = readExposure(face!, latitude);
            const pct = (layout.yearlyKwh / bestFaceKwh) * 100;
            return (
              <li
                key={layout.faceId}
                className="wl-fade rounded-2xl border border-white/15 bg-background/28 px-4 py-3.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-amber-300/40 hover:bg-background/40"
                style={{ animationDelay: `${0.1 + i * 0.07}s` }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13px]">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {compassLabel(face!.azimuthDeg)} · {layout.panels} modules
                  </span>
                  <span className="shrink-0 text-[17px] font-light tabular-nums text-foreground">
                    {nf.format(Math.round(layout.yearlyKwh))} kWh
                  </span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-foreground/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]">
                  <div
                    className="wl-grow h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: exposure.color,
                      transformOrigin: "left",
                      animation: `wlSolarGrow .8s cubic-bezier(.22,.9,.2,1) ${i * 0.07}s both`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  {exposure.label} · {nf.format(Math.round(exposure.sunHours))} sun hours a year
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SolarPerformanceGraphics;
