// Wonderlands Solar — the single system console.
//
// The house inputs (power bill, run to the panel), the project headline
// (kW, modules, annual production, bill offset) and the performance telemetry
// used to live in three separate panels: two in the system rail and one under
// the map. They read the same numbers, so they are now ONE widget — the console
// below is the only place the system is summarised and the only place the two
// house inputs are entered.
import * as React from "react";
import { Plus, Zap } from "lucide-react";
import type { SystemProduction, SavingsRead } from "@/lib/solar/solarEngine";

interface Props {
  /** Household power bill per month, in dollars */
  monthlyBill: number;
  onMonthlyBillChange: (value: number) => void;
  /** Cable run from the array to the service panel, in feet */
  serviceRunFt: number;
  onServiceRunChange: (value: number) => void;
  production: SystemProduction;
  savings: SavingsRead;
  latitude: number;
  /** Household demand per month, kWh — printed beside production */
  demandPerMonth: number;
  /** Passcode-gated money view; hidden for the public reader */
  showMoney?: boolean;
  /** Rendered only when a cart is mounted around the board */
  onAddToCart?: () => void;
}

const nf = new Intl.NumberFormat("en-US");

const Field = ({
  label,
  value,
  min,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  suffix: string;
  onChange: (v: number) => void;
}) => (
  <label className="block rounded-2xl border border-foreground/12 bg-background/40 px-4 py-3 backdrop-blur-xl transition hover:border-foreground/25">
    <span className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">{label}</span>
    <span className="mt-1 flex items-baseline gap-2">
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className="w-full bg-transparent text-2xl font-light leading-none tabular-nums outline-none [appearance:textfield] focus:text-foreground [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="shrink-0 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{suffix}</span>
    </span>
  </label>
);

/** One console: house inputs, system headline and production telemetry. */
const SolarSystemConsole: React.FC<Props> = ({
  monthlyBill,
  onMonthlyBillChange,
  serviceRunFt,
  onServiceRunChange,
  production,
  savings,
  latitude,
  demandPerMonth,
  showMoney,
  onAddToCart,
}) => {
  const yearly = production.yearlyKwhVerified ?? production.yearlyKwhModel;
  const offset = Math.max(0, Math.min(100, savings.offsetPercent));
  const R = 42;
  const CIRC = 2 * Math.PI * R;

  const rows = [
    { k: "Per year", v: `${nf.format(yearly)} kWh`, s: production.yearlyKwhVerified ? "Measured by satellite" : "Modelled" },
    { k: "Per month", v: `${nf.format(production.monthlyKwh)} kWh`, s: `Home uses ${nf.format(demandPerMonth)} kWh` },
    { k: "25 years", v: `${nf.format(Math.round(production.lifetimeKwh25 / 1000))} MWh`, s: "After degradation" },
    ...(showMoney
      ? [
          {
            k: "Year one",
            v: `$${nf.format(savings.yearOneSavings)}`,
            s: savings.paybackYears ? `Payback ${savings.paybackYears} yrs` : "",
          },
        ]
      : []),
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-foreground/15 bg-gradient-to-b from-foreground/[0.07] to-foreground/[0.01] p-5 backdrop-blur-2xl shadow-[0_28px_70px_-42px_hsl(var(--foreground)/0.5)] sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 90% at 10% 0%, rgba(249,115,22,0.14), transparent 62%), radial-gradient(80% 70% at 100% 100%, rgba(56,189,248,0.10), transparent 66%)",
        }}
      />

      <div className="relative">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Your solar project</p>
          <p className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
            lat {latitude.toFixed(2)}°
          </p>
        </div>

        {/* headline: gauge + system */}
        <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,132px)_1fr] sm:items-center">
          <svg
            viewBox="0 0 110 110"
            className="mx-auto h-28 w-28 sm:h-32 sm:w-32"
            role="img"
            aria-label={`Array covers ${offset}% of the household demand`}
          >
            <defs>
              <linearGradient id="wlConsoleGauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="55%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            <circle cx="55" cy="55" r={R + 9} fill="none" stroke="currentColor" strokeOpacity={0.07} strokeWidth={0.7} strokeDasharray="1 5" />
            <circle cx="55" cy="55" r={R} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={6} />
            <circle
              cx="55"
              cy="55"
              r={R}
              fill="none"
              stroke="url(#wlConsoleGauge)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - offset / 100)}
              transform="rotate(-90 55 55)"
            />
            <text x="55" y="55" textAnchor="middle" className="fill-foreground" style={{ fontSize: 24, fontWeight: 300 }}>
              {savings.offsetPercent}%
            </text>
            <text x="55" y="70" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 7.5, letterSpacing: 1.6 }}>
              OF YOUR BILL
            </text>
          </svg>

          <div>
            <p className="font-serif text-4xl font-light leading-none tabular-nums">
              {production.kwDc.toFixed(2)} <span className="text-2xl">kW</span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {production.panels} modules · {production.kwAc.toFixed(2)} kW AC · {nf.format(yearly)} kWh per year
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <Zap className="h-3 w-3" /> Pricing provided after the site survey
            </p>
          </div>
        </div>

        {/* house inputs — the only place they are entered */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Field label="Power bill / mo" value={monthlyBill} min={40} suffix="usd" onChange={onMonthlyBillChange} />
          <Field label="Run to panel" value={serviceRunFt} min={5} suffix="ft" onChange={onServiceRunChange} />
        </div>

        {/* production telemetry */}
        <dl className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-3">
          {rows.map((row) => (
            <div
              key={row.k}
              className="rounded-2xl border border-foreground/12 bg-background/35 px-4 py-3 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-amber-400/40"
            >
              <dt className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{row.k}</dt>
              <dd className="mt-1.5 text-xl font-light leading-none tabular-nums">{row.v}</dd>
              {row.s && <dd className="mt-1 text-[11px] text-muted-foreground">{row.s}</dd>}
            </div>
          ))}
        </dl>

        {onAddToCart && (
          <button
            onClick={onAddToCart}
            disabled={!production.panels}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-foreground px-4 py-3 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Add this system to my project
          </button>
        )}
      </div>
    </div>
  );
};

export default SolarSystemConsole;
