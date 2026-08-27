import * as React from "react";
import { Lock } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { formatUsd, type SolarBom } from "@/lib/solar/solarBom";
import {
  compassLabel,
  pitchAsRise,
  slopedAreaSqFt,
  SETBACK_FT,
  SYSTEM_DERATE,
  type RoofFace,
  type SavingsRead,
  type SystemProduction,
} from "@/lib/solar/solarEngine";
import type { BatterySpec, RoofCovering, SolarPanelSpec } from "@/data/solarHardware";
import { rackingByCovering } from "@/data/solarHardware";

/**
 * The solar report — the client sheet and, behind the staff passcode, the
 * contractor sheet: string sizing, cable and conduit runs, racking and anchoring
 * takeoff and the priced bill of materials.
 */

const PASSCODE = "WONDERMAGIC";

type Tab = "report" | "production" | "contractor";

export interface SolarReportProps {
  address: string;
  faces: RoofFace[];
  production: SystemProduction;
  savings: SavingsRead;
  bom: SolarBom;
  panel: SolarPanelSpec;
  battery: BatterySpec;
  covering: RoofCovering;
  monthlyBill: number;
  imageryDate?: string;
  verified: boolean;
}

const Row: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2">
    <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
    <span className="text-right font-serif text-sm font-light">
      {value}
      {note && <span className="ml-2 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">{note}</span>}
    </span>
  </div>
);

const SolarReportTabs: React.FC<SolarReportProps> = ({
  address,
  faces,
  production,
  savings,
  bom,
  panel,
  battery,
  covering,
  monthlyBill,
  imageryDate,
  verified,
}) => {
  const [tab, setTab] = usePersistentState<Tab>("solar_report_tab", "report");
  const [unlocked, setUnlocked] = usePersistentState<boolean>("solar_contractor_unlocked", false);
  const [code, setCode] = React.useState("");
  const racking = rackingByCovering[covering];

  const yearly = production.yearlyKwhVerified ?? production.yearlyKwhModel;
  const groups = Array.from(new Set(bom.lines.map((l) => l.group)));

  return (
    <div className="border border-border/60">
      <div className="flex flex-wrap items-center gap-0 border-b border-border/60">
        {([
          ["report", "Client report"],
          ["production", "Production & sun study"],
          ["contractor", "Contractor sheet"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-3 text-[9px] uppercase tracking-[0.3em] transition-colors ${
              tab === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {id === "contractor" && !unlocked && <Lock className="ml-2 inline h-3 w-3" />}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {/* ── client report ── */}
        {tab === "report" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">The proposal</p>
              <h3 className="mt-2 font-serif text-2xl font-light leading-tight">
                {production.kwDc.toFixed(2)} kW · {production.panels} panels
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{address || "Search an address to begin"}</p>

              <div className="mt-5">
                <Row label="System size" value={`${production.kwDc.toFixed(2)} kW DC / ${production.kwAc.toFixed(2)} kW AC`} />
                <Row label="Module" value={panel.name} note={`${panel.watts} W`} />
                <Row label="Storage" value={battery.usableKwh ? `${battery.name} · ${battery.usableKwh} kWh` : "No battery"} />
                <Row label="Mounting" value={racking.label} note={`${racking.anchorsPerPanel}/panel`} />
                <Row label="Annual production" value={`${yearly.toLocaleString()} kWh`} note={verified ? "verified" : "modelled"} />
                <Row label="Monthly average" value={`${production.monthlyKwh.toLocaleString()} kWh`} />
                <Row label="25-year production" value={`${Math.round(production.lifetimeKwh25 / 1000).toLocaleString()} MWh`} />
                <Row label="Bill offset" value={`${savings.offsetPercent}%`} note={`on $${monthlyBill}/mo`} />
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">The numbers</p>
              <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Custom proposal</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Pricing is provided in writing after the site survey and shade study.
              </p>

              <div className="mt-5">
                <Row label="Florida sales tax on solar" value="$0" />
              </div>

              <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
                Figures are a design estimate from the roof as captured. A site survey confirms rafter spacing,
                service capacity and shading before contract.
              </p>
            </div>
          </div>
        )}

        {/* ── production & sun study ── */}
        {tab === "production" && (
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Modelled", `${production.yearlyKwhModel.toLocaleString()} kWh/yr`, "House irradiance model"],
                [
                  "Verified",
                  production.yearlyKwhVerified ? `${production.yearlyKwhVerified.toLocaleString()} kWh/yr` : "No coverage",
                  "Google Solar measurement",
                ],
                ["Peak DC", `${production.kwDc.toFixed(2)} kW`, `${production.panels} × ${panel.watts} W`],
                ["Derate", `${Math.round(SYSTEM_DERATE * 100)}%`, "Inverter, wiring, soiling, heat"],
              ].map(([label, value, note]) => (
                <div key={label} className="border border-border/60 p-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                  <p className="mt-2 font-serif text-xl font-light">{value}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              Roof faces — {faces.length} captured
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-border/60 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                    <th className="py-2 pr-4 font-normal">Face</th>
                    <th className="py-2 pr-4 font-normal">Facing</th>
                    <th className="py-2 pr-4 font-normal">Pitch</th>
                    <th className="py-2 pr-4 font-normal">Plan / sloped</th>
                    <th className="py-2 pr-4 font-normal">Sun hours</th>
                    <th className="py-2 pr-4 font-normal">Exposure</th>
                    <th className="py-2 pr-4 font-normal">Panels</th>
                    <th className="py-2 font-normal">kWh / yr</th>
                  </tr>
                </thead>
                <tbody>
                  {production.layouts.map((l, i) => {
                    const face = faces.find((f) => f.id === l.faceId);
                    if (!face) return null;
                    return (
                      <tr key={l.faceId} className="border-b border-border/40 text-sm">
                        <td className="py-2 pr-4 font-serif font-light">{String(i + 1).padStart(2, "0")}</td>
                        <td className="py-2 pr-4">
                          {compassLabel(face.azimuthDeg)} · {Math.round(face.azimuthDeg)}°
                        </td>
                        <td className="py-2 pr-4">{pitchAsRise(face.pitchDeg)}</td>
                        <td className="py-2 pr-4">
                          {Math.round(face.planAreaSqFt)} / {Math.round(slopedAreaSqFt(face))} SF
                        </td>
                        <td className="py-2 pr-4">{l.exposure.sunHours.toLocaleString()}</td>
                        <td className="py-2 pr-4">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-6"
                              style={{ backgroundColor: l.exposure.color }}
                              aria-hidden
                            />
                            {l.exposure.label}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{l.panels}</td>
                        <td className="py-2">{l.yearlyKwh.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── contractor sheet ── */}
        {tab === "contractor" &&
          (unlocked ? (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Strings", `${bom.takeoff.strings} × ≤12 modules`],
                  ["Inverter", `${bom.takeoff.inverterKwAc.toFixed(1)} kW AC`],
                  ["Backfed breaker", `${bom.takeoff.breakerAmps} A`],
                  ["DC:AC ratio", `${(production.kwDc / Math.max(0.1, production.kwAc)).toFixed(2)}`],
                  ["Anchors", `${bom.takeoff.anchors} (${racking.anchorsPerPanel}/panel)`],
                  ["Rail", `${bom.takeoff.railFt} ft`],
                  ["PV wire", `${bom.takeoff.dcWireFt} ft`],
                  ["AC feeder", `${bom.takeoff.acFeederFt} ft`],
                  ["EMT conduit", `${bom.takeoff.conduitFt} ft`],
                  ["Fire setback", `${SETBACK_FT} ft at ridges, hips, eaves`],
                  ["Covering", racking.label],
                  ["Anchor method", racking.anchor],
                ].map(([label, value]) => (
                  <div key={label} className="border border-border/60 p-3">
                    <p className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
                    <p className="mt-1 font-serif text-base font-light">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 border-l-2 border-primary pl-3 text-[11px] leading-relaxed text-muted-foreground">
                {racking.windNote} Imagery {imageryDate || "date unavailable"}. Verify rafter spacing, bus rating and
                the 120% rule on site.
              </p>

              {groups.map((g) => (
                <div key={g} className="mt-6">
                  <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">{g}</p>
                  <table className="mt-2 w-full text-left">
                    <tbody>
                      {bom.lines
                        .filter((l) => l.group === g)
                        .map((l) => (
                          <tr key={l.item} className="border-b border-border/40 align-top text-sm">
                            <td className="py-2 pr-4">
                              <span className="font-serif font-light">{l.item}</span>
                              {l.note && <span className="block text-[10px] text-muted-foreground">{l.note}</span>}
                            </td>
                            <td className="whitespace-nowrap py-2 pr-4 text-right text-xs text-muted-foreground">
                              {l.qty.toLocaleString()} {l.unit}
                            </td>
                            <td className="whitespace-nowrap py-2 pr-4 text-right text-xs text-muted-foreground">
                              ${l.unitPrice.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap py-2 text-right font-serif">{formatUsd(l.total)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="mt-5 flex items-baseline justify-between border-t border-foreground/30 pt-3">
                <span className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
                  Installed total · ${bom.costPerWatt.toFixed(2)} per watt
                </span>
                <span className="font-serif text-xl font-light">{formatUsd(bom.installed)}</span>
              </div>

              <button
                onClick={() => window.print()}
                className="mt-5 border border-border/60 px-4 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
              >
                Print the sheet
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim().toUpperCase() === PASSCODE) {
                  setUnlocked(true);
                  setCode("");
                }
              }}
              className="mx-auto max-w-sm text-center"
            >
              <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Staff sheet</p>
              <p className="mt-2 font-serif text-lg font-light">
                The technical takeoff is for the crew and the contractor.
              </p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Passcode"
                aria-label="Contractor passcode"
                className="mt-4 w-full border border-border/60 bg-transparent px-3 py-2 text-center text-sm tracking-[0.3em] outline-none focus:border-foreground"
              />
              <button
                type="submit"
                className="mt-3 w-full border border-foreground px-4 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
              >
                Open the sheet
              </button>
            </form>
          ))}
      </div>
    </div>
  );
};

export default SolarReportTabs;
