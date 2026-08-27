/**
 * Wonderlands Solar — animated performance graphics.
 *
 * Three responsive SVG figures that read the calculator's live production:
 *   1. an offset ring gauge — how much of the household bill the array covers,
 *   2. a monthly kWh curve with grow-in bars — Florida's seasonal shape,
 *   3. a per-roof-face contribution ledger, coloured by the same sun-exposure
 *      bands the aerial uses, so the plate and the map always agree.
 *
 * Everything scales with its container (viewBox + preserveAspectRatio), and all
 * motion is CSS so it stays cheap and respects `prefers-reduced-motion`.
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
      <div className="border border-border/60 p-6 text-center">
        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Performance</p>
        <p className="mt-3 text-sm font-light text-muted-foreground">
          Trace a roof face to model production.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* keyframes are local so the figure carries its own motion */}
      <style>{`
        @keyframes wlSolarRing { from { stroke-dashoffset: ${CIRC}; } }
        @keyframes wlSolarBar  { from { transform: scaleY(0); } }
        @keyframes wlSolarGrow { from { transform: scaleX(0); } }
        @keyframes wlSolarLine { from { stroke-dashoffset: 1200; } }
        @keyframes wlSolarFade { from { opacity: 0; transform: translateY(6px); } }
        .wl-ring { animation: wlSolarRing 1.6s cubic-bezier(.22,.9,.2,1) both; }
        .wl-bar  { transform-origin: bottom; animation: wlSolarBar .9s cubic-bezier(.22,.9,.2,1) both; }
        .wl-line { stroke-dasharray: 1200; animation: wlSolarLine 1.8s ease-out .3s both; }
        .wl-fade { animation: wlSolarFade .7s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .wl-ring, .wl-bar, .wl-grow, .wl-line, .wl-fade { animation: none; }
        }
      `}</style>

      {/* ── headline gauge + figures ── */}
      <div className="grid gap-4 border border-border/60 p-4 sm:grid-cols-[minmax(0,150px)_1fr] sm:items-center">
        <svg viewBox="0 0 140 140" className="mx-auto h-32 w-32 sm:h-36 sm:w-36" role="img"
          aria-label={`Array covers ${offset}% of the household demand`}>
          <circle cx="70" cy="70" r={R} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={9} />
          <circle
            className="wl-ring"
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="#f97316"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - offset / 100)}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="66" textAnchor="middle" className="fill-foreground" style={{ fontSize: 24, fontWeight: 300 }}>
            {savings.offsetPercent}%
          </text>
          <text x="70" y="84" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 7, letterSpacing: 2 }}>
            OF YOUR BILL
          </text>
        </svg>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { k: "System", v: `${production.kwDc.toFixed(2)} kW`, s: `${production.panels} modules` },
            { k: "Per year", v: `${nf.format(yearly)} kWh`, s: production.yearlyKwhVerified ? "Measured by satellite" : "Modelled" },
            { k: "Per month", v: `${nf.format(production.monthlyKwh)} kWh`, s: `Home uses ${nf.format(demandPerMonth)} kWh` },
            { k: "25 years", v: `${nf.format(Math.round(production.lifetimeKwh25 / 1000))} MWh`, s: "After degradation" },
            ...(showMoney
              ? [{ k: "Year one", v: `$${nf.format(savings.yearOneSavings)}`, s: savings.paybackYears ? `Payback ${savings.paybackYears} yrs` : "" }]
              : []),
          ].map((row, i) => (
            <div key={row.k} className="wl-fade" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
              <dt className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">{row.k}</dt>
              <dd className="mt-1 text-lg font-light leading-none">{row.v}</dd>
              {row.s && <dd className="mt-1 text-[10px] text-muted-foreground">{row.s}</dd>}
            </div>
          ))}
        </dl>
      </div>

      {/* ── monthly production ── */}
      <div className="border border-border/60 p-4">
        <div className="flex items-baseline justify-between">
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
          className="mt-4 h-40 w-full"
          role="img"
          aria-label="Modelled monthly production against household demand"
        >
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
                  fill={covers ? "#f97316" : "#facc15"}
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
      <div className="border border-border/60 p-4">
        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          Where the energy comes from
        </p>
        <ul className="mt-3 space-y-2.5">
          {contributions.map(({ layout, face }, i) => {
            const exposure = readExposure(face!, latitude);
            const pct = (layout.yearlyKwh / bestFaceKwh) * 100;
            return (
              <li key={layout.faceId} className="wl-fade" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                <div className="flex items-baseline justify-between text-[10px]">
                  <span className="uppercase tracking-[0.2em] text-muted-foreground">
                    {compassLabel(face!.azimuthDeg)} · {layout.panels} modules
                  </span>
                  <span className="font-light text-foreground">
                    {nf.format(Math.round(layout.yearlyKwh))} kWh
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full bg-muted">
                  <div
                    className="wl-grow h-full"
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
