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

/** Declination for a day-of-year (Cooper's equation). */
const declination = (dayOfYear: number) =>
  23.45 * Math.sin(((360 / 365) * (dayOfYear - 81)) * RAD);

/** Path geometry of the sun dome plate (a wide mission-console sheet). */
const DOME = { w: 720, h: 352, base: 262, left: 66, right: 686, top: 40 };
/** Azimuth window drawn across the plate: ENE → WNW. */
const AZ_FROM = 52;
const AZ_TO = 308;

/** Project altitude/azimuth into the dome plate. */
const project = (azimuth: number, altitude: number) => {
  const span = AZ_TO - AZ_FROM;
  const t = Math.max(0, Math.min(1, (azimuth - AZ_FROM) / span));
  return {
    x: DOME.left + t * (DOME.right - DOME.left),
    y: DOME.base - (Math.max(-12, altitude) / 90) * (DOME.base - DOME.top),
  };
};


/** Sample a full arc for a declination, keeping only daylight positions. */
const arcPoints = (lat: number, dec: number) => {
  const pts: { x: number; y: number; altitude: number }[] = [];
  for (let H = -180; H <= 180; H += 2) {
    const { altitude, azimuth } = sunPosition(lat, dec, H);
    if (altitude < 0) continue;
    const p = project(azimuth, altitude);
    pts.push({ ...p, altitude });
  }
  return pts;
};

const toPath = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

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

/** Deterministic pseudo-stars so the plate has a fixed night sky, not noise. */
const STARS = Array.from({ length: 68 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return {
    x: 12 + ((a - Math.floor(a)) * (DOME.w - 24)),
    y: 8 + ((b - Math.floor(b)) * (DOME.base - 20)),
    r: 0.35 + ((a - Math.floor(a)) * 0.9),
    o: 0.15 + ((b - Math.floor(b)) * 0.5),
  };
});

/**
 * SunPathConsole — a hyperdetailed, scrubbable sky chart for the site latitude.
 *
 * The plate draws the annual sun corridor (between both solstices), the arc for
 * the selected day with hour stations, civil twilight bands, the horizon and
 * compass rose, plus a live solar marker. Below it, a mission-roadmap ribbon
 * sequences the day's events (first light → sunrise → golden hour → solar noon
 * → golden hour → sunset → last light) with a travelling progress head.
 */
const SunPathConsole: React.FC<{ lat: number; glass: string }> = ({ lat, glass }) => {
  const now = React.useMemo(() => new Date(), []);
  const [doy, setDoy] = React.useState(() => dayOfYearOf(now));
  const [hours, setHours] = React.useState(() => now.getHours() + now.getMinutes() / 60);
  const [playing, setPlaying] = React.useState(false);
  const [station, setStation] = React.useState<number | null>(null);

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
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
            className={`rounded-full border px-4 py-2 backdrop-blur-xl transition ${
              playing
                ? "border-amber-300/60 bg-amber-300/15 text-amber-100"
                : "border-white/20 bg-background/35 hover:border-amber-300/60 hover:text-amber-200"
            }`}
          >
            {playing ? "Pause transit" : "Run transit"}
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              setPlaying(false);
              setDoy(dayOfYearOf(d));
              setHours(d.getHours() + d.getMinutes() / 60);
              setStation(null);
            }}
            className="rounded-full border border-white/15 bg-background/25 px-4 py-2 text-muted-foreground backdrop-blur-xl transition hover:border-white/35 hover:text-foreground"
          >
            Now
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
        </defs>

        {/* sky field */}
        <rect x={0} y={0} width={DOME.w} height={DOME.base} fill="url(#wlSkyDome)" />
        <g aria-hidden opacity={sun.altitude > 0 ? 0.35 : 0.9} className="transition-opacity duration-700">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e0e7ff" opacity={s.o} />
          ))}
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
          .wl-ring, .wl-bar, .wl-grow, .wl-line, .wl-arc, .wl-fade, .wl-pulse, .wl-drift { animation: none; }
        }
      `}</style>

      {/* ── headline gauge + telemetry ── */}
      <div className={glass}>
        {/* starfield wash */}
        <div
          aria-hidden
          className="wl-drift pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(120% 90% at 12% 0%, rgba(249,115,22,0.16), transparent 60%), radial-gradient(80% 70% at 95% 100%, rgba(56,189,248,0.12), transparent 65%)",
          }}
        />
        <div className="relative grid gap-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-center xl:grid-cols-[minmax(0,240px)_1fr]">
          <svg
            viewBox="0 0 140 140"
            className="mx-auto h-40 w-40 sm:h-48 sm:w-48 xl:h-56 xl:w-56"
            role="img"
            aria-label={`Array covers ${offset}% of the household demand`}
          >
            <defs>
              <linearGradient id="wlGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="55%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
              <filter id="wlGaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* orbit rings */}
            <circle cx="70" cy="70" r={R + 12} fill="none" stroke="currentColor" strokeOpacity={0.07} strokeWidth={0.7} strokeDasharray="1 5" />
            <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={7} />
            <circle
              className="wl-ring"
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke="url(#wlGaugeGrad)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - offset / 100)}
              transform="rotate(-90 70 70)"
              filter="url(#wlGaugeGlow)"
            />
            <text x="70" y="68" textAnchor="middle" className="fill-foreground" style={{ fontSize: 32, fontWeight: 300 }}>
              {savings.offsetPercent}%
            </text>
            <text x="70" y="86" textAnchor="middle" className="fill-foreground" style={{ fontSize: 9, letterSpacing: 1.8, opacity: 0.75 }}>
              OF YOUR BILL
            </text>
            <text x="70" y="100" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 8, letterSpacing: 1.4 }}>
              {`LAT ${lat.toFixed(2)}°`}
            </text>
          </svg>

          <dl className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
            {[
              { k: "System", v: `${production.kwDc.toFixed(2)} kW`, s: `${production.panels} modules` },
              { k: "Per year", v: `${nf.format(yearly)} kWh`, s: production.yearlyKwhVerified ? "Measured by satellite" : "Modelled" },
              { k: "Per month", v: `${nf.format(production.monthlyKwh)} kWh`, s: `Home uses ${nf.format(demandPerMonth)} kWh` },
              { k: "25 years", v: `${nf.format(Math.round(production.lifetimeKwh25 / 1000))} MWh`, s: "After degradation" },
              ...(showMoney
                ? [{ k: "Year one", v: `$${nf.format(savings.yearOneSavings)}`, s: savings.paybackYears ? `Payback ${savings.paybackYears} yrs` : "" }]
                : []),
            ].map((row, i) => (
              <div
                key={row.k}
                className="wl-fade rounded-2xl border border-white/15 bg-background/28 px-4 py-3.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-background/40"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{row.k}</dt>
                <dd className="mt-1.5 text-2xl font-light leading-none tabular-nums sm:text-[26px]">{row.v}</dd>
                {row.s && <dd className="mt-1.5 text-[12px] text-muted-foreground">{row.s}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── astronomical sun-path console ── */}
      <SunPathConsole lat={lat} glass={glass} />


      {/* ── monthly production ── */}
      <div className={glass}>
        <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Production by month</p>
          <p className="text-[10px] text-muted-foreground">
            {hover === null
              ? "kWh · dashed line is your household demand"
              : `${MONTH_NAMES[hover]} — ${nf.format(monthly[hover])} kWh`}
          </p>
        </div>

        <svg
          viewBox="0 0 360 140"
          preserveAspectRatio="none"
          className="relative mt-4 h-36 w-full sm:h-44"
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
                  style={{ fontSize: 8, letterSpacing: 1 }}
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
        <p className="relative text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          Where the energy comes from
        </p>
        <ul className="relative mt-3 space-y-2.5">
          {contributions.map(({ layout, face }, i) => {
            const exposure = readExposure(face!, latitude);
            const pct = (layout.yearlyKwh / bestFaceKwh) * 100;
            return (
              <li
                key={layout.faceId}
                className="wl-fade rounded-xl border border-white/10 bg-background/20 px-3 py-2.5 backdrop-blur-md"
                style={{ animationDelay: `${0.1 + i * 0.07}s` }}
              >
                <div className="flex items-baseline justify-between gap-3 text-[10px]">
                  <span className="uppercase tracking-[0.2em] text-muted-foreground">
                    {compassLabel(face!.azimuthDeg)} · {layout.panels} modules
                  </span>
                  <span className="shrink-0 font-light text-foreground">
                    {nf.format(Math.round(layout.yearlyKwh))} kWh
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
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
                <p className="mt-1 text-[9px] text-muted-foreground">
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
