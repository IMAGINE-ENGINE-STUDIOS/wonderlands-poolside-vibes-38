import * as React from "react";
import { Landmark, Receipt, PlugZap, ShieldAlert, FileSignature } from "lucide-react";
import {
  FLORIDA_SOLAR_JURISDICTIONS,
  FLORIDA_STATE_BENEFITS,
  findJurisdictionById,
  resolveJurisdiction,
} from "@/data/floridaSolarJurisdictions";
import type { JurisdictionEconomics } from "@/lib/solar/jurisdictionIncentives";

/**
 * Movement — the jurisdiction.
 *
 * A roof does not pay back in the abstract; it pays back behind a specific meter,
 * in a specific county, under a specific export rule. This leaf makes that
 * explicit: the county is resolved from the traced address, the tariff is shown
 * and can be overridden from the customer's own bill, and the whole incentive
 * stack — federal credit, Florida sales-tax exemption, property-tax exclusion,
 * local programs — is printed with its statutory authority beside it, together
 * with the penalties that quietly remove value (net billing, fixed charges,
 * capped allocations, wind-zone engineering).
 */

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

const Row: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-foreground/10 py-2.5 last:border-0">
    <span className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">{label}</span>
    <span className="text-right">
      <span className="font-mono text-sm">{value}</span>
      {note && <span className="ml-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{note}</span>}
    </span>
  </div>
);

const JurisdictionLeaf: React.FC<{
  address: string;
  countyId: string | null | undefined;
  rateOverride: number | null | undefined;
  economics: JurisdictionEconomics;
  onCountyChange: (id: string | null) => void;
  onRateChange: (rate: number | null) => void;
  /** Optional hand-off into the Blueprint Builder */
  onSendToBlueprint?: () => void;
  /** Compact rendering for the FLIP leaf */
  compact?: boolean;
}> = ({ address, countyId, rateOverride, economics, onCountyChange, onRateChange, onSendToBlueprint, compact }) => {
  const resolved = countyId ? findJurisdictionById(countyId) : resolveJurisdiction(address);
  const j = economics.jurisdiction;
  const cash = economics.incentives.filter((i) => i.amount > 0);
  const written = economics.incentives.filter((i) => i.amount === 0 && i.kind !== "penalty");
  const cautions = economics.incentives.filter((i) => i.kind === "penalty");

  return (
    <div className="space-y-6">
      {/* ------------------------------ the meter ------------------------------ */}
      <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
              <Landmark className="h-3 w-3" /> Jurisdiction
            </p>
            <p className="mt-2 font-serif text-2xl font-light leading-none">{j.county} County</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {j.utility} · {j.utilityKind} · tariff read {j.verified}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">County</span>
              <select
                value={countyId ?? resolved.id}
                onChange={(e) => onCountyChange(e.target.value || null)}
                className="mt-1.5 h-9 min-w-[13rem] rounded-xl border border-foreground/15 bg-background/70 px-3 text-sm outline-none focus:border-foreground/40"
              >
                {FLORIDA_SOLAR_JURISDICTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.county} — {c.utility.split(" / ")[0]}
                  </option>
                ))}
                <option value="fl-statewide">Florida — statewide average</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Rate from the bill</span>
              <span className="mt-1.5 flex h-9 items-center gap-2 rounded-xl border border-foreground/15 bg-background/70 px-3">
                <input
                  type="number"
                  step={0.001}
                  min={0}
                  value={rateOverride ?? ""}
                  placeholder={j.rateUsdPerKwh.toFixed(3)}
                  onChange={(e) => onRateChange(e.target.value === "" ? null : Number(e.target.value))}
                  className="w-24 bg-transparent font-mono text-sm outline-none"
                />
                <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">$/kWh</span>
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-0 md:grid-cols-2">
          <Row label="Retail rate used" value={`$${economics.rate.toFixed(3)}/kWh`} note={rateOverride ? "from bill" : "county tariff"} />
          <Row label="Fixed charge" value={`${usd(j.fixedMonthlyUsd)}/mo`} note="solar cannot offset" />
          <Row label="Export rule" value={economics.exportRuleLabel} />
          <Row
            label="Self-consumed"
            value={`${Math.round(economics.selfConsumedShare * 100)}%`}
            note={`${economics.selfConsumedKwh.toLocaleString()} kWh`}
          />
          <Row label="Exported" value={`${economics.exportedKwh.toLocaleString()} kWh`} />
          <Row label="Blended value of production" value={`$${economics.effectiveRate.toFixed(3)}/kWh`} />
          <Row label="Year-one bill saving" value={usd(economics.yearOneSaving)} note={`${Math.round(economics.offset * 100)}% offset`} />
          <Row label="Permit + interconnection" value={usd(economics.jurisdictionCosts)} />
        </div>
      </div>

      {/* ---------------------------- the incentives ---------------------------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            <Receipt className="h-3 w-3" /> Cash on the table
          </p>
          <p className="mt-3 font-serif text-3xl font-light leading-none">{usd(economics.incentiveCash)}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Net after incentives and county fees — {usd(economics.netCost)}
            {economics.paybackYears > 0 ? ` · payback ${economics.paybackYears.toFixed(1)} yrs` : ""}
          </p>
          <div className="mt-4 space-y-3">
            {cash.map((i) => (
              <div key={i.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm">{i.label}</span>
                  <span className="font-mono text-sm">{usd(i.amount)}</span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{i.authority}</p>
                {!compact && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{i.detail}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            <PlugZap className="h-3 w-3" /> Written into law, not into a cheque
          </p>
          <div className="mt-4 space-y-3">
            {written.map((i) => (
              <div key={i.id}>
                <p className="text-sm">{i.label}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{i.authority}</p>
                {!compact && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{i.detail}</p>}
              </div>
            ))}
          </div>
          {!compact && (
            <p className="mt-5 border-t border-foreground/10 pt-4 text-xs leading-relaxed text-muted-foreground">
              {FLORIDA_STATE_BENEFITS.find((b) => b.id === "fl-net-metering")?.detail}
            </p>
          )}
        </div>
      </div>

      {/* ----------------------------- the penalties ----------------------------- */}
      {cautions.length > 0 && (
        <div className="rounded-2xl border border-foreground/10 bg-background/60 p-5 backdrop-blur">
          <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            <ShieldAlert className="h-3 w-3" /> What removes value here
          </p>
          <ul className="mt-4 space-y-2.5">
            {economics.cautions.map((c, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Interconnection insurance — {j.insuranceNote}
          </p>
        </div>
      )}

      {onSendToBlueprint && (
        <button
          onClick={onSendToBlueprint}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-5 py-2.5 text-[9px] uppercase tracking-[0.28em] transition-colors hover:bg-foreground hover:text-background"
        >
          <FileSignature className="h-3.5 w-3.5" />
          Load county data into the Blueprint Builder
        </button>
      )}
    </div>
  );
};

export default JurisdictionLeaf;
