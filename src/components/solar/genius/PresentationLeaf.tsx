import * as React from "react";
import { Lock, Printer } from "lucide-react";
import { usd } from "@/lib/solar/financeModel";
import { formatUsd, type SolarBom } from "@/lib/solar/solarBom";

/**
 * Movement IV — Presentation.
 *
 * Two readings of the same study. The consumer sheet is plain language and
 * prints on one page; the dealer sheet is unlocked with the WONDERMAGIC passcode
 * and adds the bill of materials, the takeoff and the margin conversation.
 */

const PASSCODE = "WONDERMAGIC";

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-foreground/10 py-2 last:border-0">
    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    <span className="font-mono text-sm">{value}</span>
  </div>
);

const PresentationLeaf: React.FC<{
  address: string;
  panels: number;
  kwDc: number;
  yearlyKwh: number;
  offsetPercent: number;
  installed: number;
  netCost: number;
  paybackYears: number | null;
  lifetimeValue: number;
  bom: SolarBom | null;
}> = ({ address, panels, kwDc, yearlyKwh, offsetPercent, installed, netCost, paybackYears, lifetimeValue, bom }) => {
  const [entry, setEntry] = React.useState("");
  const [unlocked, setUnlocked] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* consumer sheet */}
      <div className="rounded-2xl border border-foreground/12 bg-background/70 p-7 backdrop-blur print:border-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Solar study</p>
            <h3 className="mt-2 font-serif text-2xl font-light">{address || "Your property"}</h3>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/25 bg-background/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition hover:border-foreground/60 print:hidden"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Modules that fit", value: `${panels}` },
            { label: "System size", value: `${kwDc} kW DC` },
            { label: "Year-1 production", value: `${yearlyKwh.toLocaleString()} kWh` },
            { label: "Bill offset", value: `${offsetPercent}%` },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4">
              <p className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{m.label}</p>
              <p className="mt-2 font-serif text-2xl font-light">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <Row label="Installed price" value={usd(installed)} />
            <Row label="After federal credit" value={usd(netCost)} />
            <Row label="Payback" value={paybackYears ? `${paybackYears} years` : "—"} />
            <Row label="Energy value over 25 years" value={usd(lifetimeValue)} />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Every figure above comes from your own roof as traced on the aerial — the faces that passed the national
            suitability screen, the modules that physically fit once fire setbacks and obstructions are kept clear, and the
            sun hours those faces actually receive. Nothing is scaled from an average house.
          </p>
        </div>
      </div>

      {/* dealer sheet */}
      {!unlocked ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (entry.trim().toUpperCase() === PASSCODE) setUnlocked(true);
            setEntry("");
          }}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-foreground/20 bg-foreground/[0.02] p-5 print:hidden"
        >
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Dealer sheet</span>
          <input
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            type="password"
            placeholder="Passcode"
            className="min-w-[160px] flex-1 rounded-xl border border-foreground/15 bg-background/70 px-3 py-2 text-sm outline-none focus:border-foreground/40"
          />
          <button
            type="submit"
            className="rounded-full border border-foreground/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition hover:border-foreground/60"
          >
            Unlock
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-foreground/20 bg-foreground/[0.04] p-7 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Dealer sheet — internal</p>
            <button
              type="button"
              onClick={() => setUnlocked(false)}
              className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground transition hover:text-foreground print:hidden"
            >
              Lock
            </button>
          </div>

          {bom ? (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {[
                  { label: "Installed", value: formatUsd(bom.installed) },
                  { label: "Cost per watt", value: `$${bom.costPerWatt.toFixed(2)}` },
                  { label: "Federal credit", value: formatUsd(bom.federalCredit) },
                  { label: "Net to customer", value: formatUsd(bom.netCost) },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-foreground/12 bg-background/60 p-4">
                    <p className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">{m.label}</p>
                    <p className="mt-2 font-serif text-xl font-light">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4 lg:grid-cols-8">
                {Object.entries(bom.takeoff).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-foreground/10 bg-background/50 p-3">
                    <p className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground">{k}</p>
                    <p className="mt-1 font-mono text-sm">{typeof v === "number" ? Math.round(v * 10) / 10 : String(v)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-foreground/10 bg-background/60">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead className="border-b border-foreground/10 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Group</th>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">Rate</th>
                      <th className="px-3 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {bom.lines.map((l, i) => (
                      <tr key={`${l.item}-${i}`} className="border-b border-foreground/5 last:border-0">
                        <td className="px-3 py-2 font-sans uppercase tracking-[0.14em] text-muted-foreground">{l.group}</td>
                        <td className="px-3 py-2">
                          {l.item}
                          {l.note && <span className="block text-[10px] text-muted-foreground">{l.note}</span>}
                        </td>
                        <td className="px-3 py-2">{l.qty}</td>
                        <td className="px-3 py-2">{l.unit}</td>
                        <td className="px-3 py-2">{formatUsd(l.unitPrice)}</td>
                        <td className="px-3 py-2">{formatUsd(l.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">Capture a roof to build the bill of materials.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PresentationLeaf;
