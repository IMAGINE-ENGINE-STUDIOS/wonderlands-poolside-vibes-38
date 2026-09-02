import * as React from "react";
import { Trash2, Save } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  DEFAULT_FINANCE,
  buildOffsetLadder,
  cents,
  runFinance,
  runSensitivity,
  usd,
  type FinanceInputs,
  type FinanceMode,
} from "@/lib/solar/financeModel";

/**
 * Movement III — Analysis Deck.
 *
 * Cash, loan and PPA on one footing; a one-at-a-time sensitivity grid so the
 * reader can see which assumption actually moves the deal; the 50/80/100/120%
 * offset ladder priced from the measured design; and saved scenarios so two
 * proposals can be compared side by side.
 */

interface Scenario {
  id: string;
  name: string;
  inputs: FinanceInputs;
}

const MODES: Array<{ id: FinanceMode; label: string; blurb: string }> = [
  { id: "cash", label: "Cash", blurb: "Bought outright. Federal credit lands in year one." },
  { id: "loan", label: "Loan", blurb: "Level monthly payment against the installed price." },
  { id: "ppa", label: "PPA", blurb: "No capital. Energy bought per kWh with an annual escalator." },
];

const Field: React.FC<{
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  suffix?: string;
  min?: number;
}> = ({ label, value, onChange, step = 1, suffix, min = 0 }) => (
  <label className="block">
    <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
    <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-foreground/15 bg-background/70 px-3 py-2 backdrop-blur focus-within:border-foreground/40">
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent font-mono text-sm outline-none"
      />
      {suffix && <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{suffix}</span>}
    </span>
  </label>
);

const Metric: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
    <p className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">{label}</p>
    <p className="mt-2 font-serif text-3xl font-light leading-none">{value}</p>
    {note && <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{note}</p>}
  </div>
);

const AnalysisDeck: React.FC<{
  /** Numbers measured on the board — these seed the model on every capture. */
  measured: {
    installed: number;
    yearOneKwh: number;
    householdKwh: number;
    maxPanels: number;
    panelWatts: number;
    specificYield: number;
    pricePerWatt: number;
    utilityRate: number;
  };
}> = ({ measured }) => {
  const [overrides, setOverrides] = usePersistentState<Partial<FinanceInputs>>("solar_genius_finance", {});
  const [scenarios, setScenarios] = usePersistentState<Scenario[]>("solar_genius_scenarios", []);

  /* The measured design always supplies the base; the reader's overrides sit on
     top, so re-tracing the roof updates the model without wiping their terms. */
  const inputs = React.useMemo<FinanceInputs>(
    () => ({
      ...DEFAULT_FINANCE,
      installed: measured.installed || DEFAULT_FINANCE.installed,
      yearOneKwh: measured.yearOneKwh || DEFAULT_FINANCE.yearOneKwh,
      householdKwh: measured.householdKwh || DEFAULT_FINANCE.householdKwh,
      utilityRate: measured.utilityRate || DEFAULT_FINANCE.utilityRate,
      ...overrides,
    }),
    [measured, overrides],
  );

  const set = (patch: Partial<FinanceInputs>) => setOverrides((o) => ({ ...o, ...patch }));

  const read = React.useMemo(() => runFinance(inputs), [inputs]);
  const sensitivity = React.useMemo(() => runSensitivity(inputs), [inputs]);
  const ladder = React.useMemo(
    () =>
      buildOffsetLadder({
        base: inputs,
        maxPanels: measured.maxPanels || 40,
        panelWatts: measured.panelWatts || 400,
        specificYield: measured.specificYield || 1450,
        pricePerWatt: measured.pricePerWatt || 2.5,
      }),
    [inputs, measured],
  );

  const saved = React.useMemo(() => scenarios.map((s) => ({ ...s, read: runFinance(s.inputs) })), [scenarios]);

  return (
    <div className="space-y-8">
      {/* structure */}
      <div className="grid gap-3 md:grid-cols-3">
        {MODES.map((m) => {
          const active = inputs.mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => set({ mode: m.id })}
              className={`rounded-2xl border p-5 text-left backdrop-blur transition ${
                active
                  ? "border-foreground/60 bg-foreground/[0.06] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]"
                  : "border-foreground/12 bg-background/50 hover:border-foreground/30"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">{m.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.blurb}</p>
            </button>
          );
        })}
      </div>

      {/* terms */}
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Installed price" value={inputs.installed} step={500} onChange={(n) => set({ installed: n })} suffix="$" />
        <Field label="Year-1 production" value={Math.round(inputs.yearOneKwh)} step={250} onChange={(n) => set({ yearOneKwh: n })} suffix="kWh" />
        <Field label="Household use" value={Math.round(inputs.householdKwh)} step={250} onChange={(n) => set({ householdKwh: n })} suffix="kWh" />
        <Field label="Utility rate" value={inputs.utilityRate} step={0.005} onChange={(n) => set({ utilityRate: n })} suffix="$/kWh" />
        <Field label="Rate escalation" value={inputs.escalation} step={0.005} onChange={(n) => set({ escalation: n })} suffix="/yr" />
        <Field label="Degradation" value={inputs.degradation} step={0.0005} onChange={(n) => set({ degradation: n })} suffix="/yr" />
        <Field label="Federal credit" value={inputs.itcRate} step={0.05} onChange={(n) => set({ itcRate: n })} suffix="rate" />
        <Field label="Horizon" value={inputs.horizon} step={1} min={5} onChange={(n) => set({ horizon: n })} suffix="yrs" />
        {inputs.mode === "loan" && (
          <>
            <Field label="APR" value={inputs.apr} step={0.0025} onChange={(n) => set({ apr: n })} suffix="rate" />
            <Field label="Term" value={inputs.termYears} step={1} min={1} onChange={(n) => set({ termYears: n })} suffix="yrs" />
            <Field label="Down payment" value={inputs.down} step={500} onChange={(n) => set({ down: n })} suffix="$" />
          </>
        )}
        {inputs.mode === "ppa" && (
          <>
            <Field label="PPA rate" value={inputs.ppaRate} step={0.005} onChange={(n) => set({ ppaRate: n })} suffix="$/kWh" />
            <Field label="PPA escalator" value={inputs.ppaEscalator} step={0.005} onChange={(n) => set({ ppaEscalator: n })} suffix="/yr" />
          </>
        )}
      </div>

      {/* headline */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Net cost" value={inputs.mode === "ppa" ? "$0" : usd(read.netCost)} note={`credit ${usd(read.itc)}`} />
        <Metric
          label="Payback"
          value={read.paybackYears ? `${read.paybackYears} yrs` : "—"}
          note={inputs.mode === "loan" ? `${usd(read.monthlyPayment)}/mo` : "cumulative crossing"}
        />
        <Metric label={`${inputs.horizon}-yr net`} value={usd(read.netBenefit)} note={`NPV ${usd(read.npv)}`} />
        <Metric label="Return" value={read.irr != null ? `${(read.irr * 100).toFixed(1)}%` : "n/a"} note="IRR on net cash flow" />
        <Metric label="LCOE" value={cents(read.lcoe)} note={`utility ${cents(read.utilityRateYearOne)} today`} />
        <Metric label="Offset" value={`${read.offsetPercent}%`} note={`${read.lifetimeKwh.toLocaleString()} kWh delivered`} />
      </div>

      {/* offset ladder */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Offset ladder</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {ladder.map((r) => (
            <div
              key={r.target}
              className={`rounded-2xl border p-5 backdrop-blur ${
                r.beyondRoof ? "border-dashed border-foreground/20 bg-foreground/[0.02]" : "border-foreground/12 bg-background/60"
              }`}
            >
              <p className="font-serif text-2xl font-light">{Math.round(r.target * 100)}%</p>
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">of household use</p>
              <dl className="mt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between"><dt>Panels</dt><dd>{r.panels}</dd></div>
                <div className="flex justify-between"><dt>kW DC</dt><dd>{r.kwDc}</dd></div>
                <div className="flex justify-between"><dt>kWh/yr</dt><dd>{r.kwh.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt>Net cost</dt><dd>{usd(r.netCost)}</dd></div>
                <div className="flex justify-between"><dt>Payback</dt><dd>{r.paybackYears ? `${r.paybackYears}y` : "—"}</dd></div>
              </dl>
              {r.beyondRoof && (
                <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Roof caps out — capped at {r.panels} modules
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* sensitivity */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Sensitivity — one driver at a time</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-foreground/10 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Swing</th>
                <th className="px-4 py-3">Payback low → high</th>
                <th className="px-4 py-3">Net position low → high</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {sensitivity.map((r) => (
                <tr key={r.id} className="border-b border-foreground/5 last:border-0">
                  <td className="px-4 py-3 font-sans uppercase tracking-[0.14em]">{r.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.swing}</td>
                  <td className="px-4 py-3">
                    {r.lowPayback ? `${r.lowPayback}y` : "—"} → {r.highPayback ? `${r.highPayback}y` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {usd(r.lowNet)} → {usd(r.highNet)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* scenarios */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Saved scenarios</p>
          <button
            type="button"
            onClick={() =>
              setScenarios((list) =>
                [
                  {
                    id: `s-${Date.now()}`,
                    name: `${MODES.find((m) => m.id === inputs.mode)?.label} · ${usd(inputs.installed)}`,
                    inputs,
                  },
                  ...list,
                ].slice(0, 6),
              )
            }
            className="inline-flex items-center gap-2 rounded-full border border-foreground/25 bg-background/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] backdrop-blur transition hover:border-foreground/60"
          >
            <Save className="h-3.5 w-3.5" /> Save this scenario
          </button>
        </div>

        {saved.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {saved.map((s) => (
              <div key={s.id} className="rounded-2xl border border-foreground/12 bg-background/60 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">{s.name}</p>
                  <button
                    type="button"
                    onClick={() => setScenarios((list) => list.filter((x) => x.id !== s.id))}
                    aria-label="Remove scenario"
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <dl className="mt-3 space-y-1 font-mono text-xs">
                  <div className="flex justify-between"><dt>Net cost</dt><dd>{usd(s.read.netCost)}</dd></div>
                  <div className="flex justify-between"><dt>Payback</dt><dd>{s.read.paybackYears ? `${s.read.paybackYears}y` : "—"}</dd></div>
                  <div className="flex justify-between"><dt>Net benefit</dt><dd>{usd(s.read.netBenefit)}</dd></div>
                  <div className="flex justify-between"><dt>LCOE</dt><dd>{cents(s.read.lcoe)}</dd></div>
                </dl>
                <button
                  type="button"
                  onClick={() => setOverrides(s.inputs)}
                  className="mt-4 w-full border-b border-foreground/30 pb-1 text-[10px] font-semibold uppercase tracking-[0.24em] transition hover:border-foreground"
                >
                  Load into the model
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Save a set of terms to compare cash against a loan or a PPA side by side.
          </p>
        )}
      </div>

      {/* cash flow */}
      <details className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.28em]">
          Year-by-year cash flow
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="border-b border-foreground/10 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Yr</th>
                <th className="px-3 py-2">kWh</th>
                <th className="px-3 py-2">Rate</th>
                <th className="px-3 py-2">Bill offset</th>
                <th className="px-3 py-2">System cost</th>
                <th className="px-3 py-2">Net</th>
                <th className="px-3 py-2">Cumulative</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {read.years.map((r) => (
                <tr key={r.year} className="border-b border-foreground/5 last:border-0">
                  <td className="px-3 py-1.5">{r.year}</td>
                  <td className="px-3 py-1.5">{r.kwh.toLocaleString()}</td>
                  <td className="px-3 py-1.5">{cents(r.utilityRate)}</td>
                  <td className="px-3 py-1.5">{usd(r.billOffset)}</td>
                  <td className="px-3 py-1.5">{usd(r.systemCost)}</td>
                  <td className="px-3 py-1.5">{usd(r.net)}</td>
                  <td className="px-3 py-1.5" style={{ color: r.cumulative >= 0 ? "#f97316" : undefined }}>
                    {usd(r.cumulative)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export default AnalysisDeck;
