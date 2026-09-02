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
const DOME = { w: 720, h: 320, base: 246, left: 54, right: 686, top: 34 };
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
      <div className="rounded-2xl border border-white/15 bg-foreground/[0.04] p-6 text-center backdrop-blur-xl">
        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Performance</p>
        <p className="mt-3 text-sm font-light text-muted-foreground">
          Trace a roof face to model production.
        </p>
      </div>
    );
  }

  /* shared glass shell */
  const glass =
    "relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-foreground/[0.06] to-foreground/[0.02] p-4 backdrop-blur-xl shadow-[0_18px_50px_-30px_rgba(8,12,24,0.7)] sm:p-5";

  return (
    <div className="space-y-3 sm:space-y-4">
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
        <div className="relative grid gap-5 sm:grid-cols-[minmax(0,168px)_1fr] sm:items-center">
          <svg
            viewBox="0 0 140 140"
            className="mx-auto h-32 w-32 sm:h-40 sm:w-40"
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
            <text x="70" y="66" textAnchor="middle" className="fill-foreground" style={{ fontSize: 24, fontWeight: 300 }}>
              {savings.offsetPercent}%
            </text>
            <text x="70" y="82" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 6.4, letterSpacing: 2 }}>
              OF YOUR BILL
            </text>
            <text x="70" y="95" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 5.6, letterSpacing: 1.6 }}>
              {`LAT ${lat.toFixed(2)}°`}
            </text>
          </svg>

          <dl className="grid grid-cols-2 gap-2 sm:gap-2.5">
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
                className="wl-fade rounded-xl border border-white/10 bg-background/20 px-3 py-2.5 backdrop-blur-md"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <dt className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">{row.k}</dt>
                <dd className="mt-1 text-base font-light leading-none sm:text-lg">{row.v}</dd>
                {row.s && <dd className="mt-1 text-[10px] text-muted-foreground">{row.s}</dd>}
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
