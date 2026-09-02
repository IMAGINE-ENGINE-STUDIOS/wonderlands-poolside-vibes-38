import * as React from "react";
import { Link } from "react-router-dom";
import { useSolarSession } from "@/components/solar/solarSession";
import SolarOptionsLeaf from "@/components/solar/SolarOptionsLeaf";
import JurisdictionLeaf from "@/components/solar/genius/JurisdictionLeaf";
import { computeProduction, computeSavings, pathAreaSqFt, type RoofFace } from "@/lib/solar/solarEngine";
import { buildSolarBom } from "@/lib/solar/solarBom";
import { screenFace } from "@/lib/solar/suitability";
import { solarBatteries, solarPanels } from "@/data/solarHardware";
import { findJurisdictionById, resolveJurisdiction } from "@/data/floridaSolarJurisdictions";
import { computeJurisdictionEconomics } from "@/lib/solar/jurisdictionIncentives";
import { DEFAULT_FINANCE, runFinance, usd } from "@/lib/solar/financeModel";
import { loadSolarIntoBlueprint } from "@/lib/solar/solarBlueprint";

/**
 * The FLIP V7 solar leaf — Solar Genius, at the latest version.
 *
 * The facing page of the solar spread used to carry only the product options.
 * It now carries the whole workstation in reading form, driven by the one live
 * solar session the board on the other leaf writes:
 *
 *   · the NREL suitability verdict for every traced face,
 *   · the county jurisdiction — tariff, export rule, taxes, programs, penalties,
 *   · cash / loan / PPA priced at the county's blended value of production,
 *   · the product options, unchanged, and
 *   · a one-click hand-off of the whole electrical story into the Blueprint
 *     Builder.
 */

const FL_LAT = 27.5;

const Tab: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={`shrink-0 rounded-full border px-3 py-1.5 text-[8px] uppercase tracking-[0.26em] transition-colors ${
      active ? "border-foreground bg-foreground text-background" : "border-border/60 hover:bg-foreground/5"
    }`}
  >
    {children}
  </button>
);

const SolarGeniusLeaf: React.FC = () => {
  const [session, setSession] = useSolarSession();
  const [tab, setTab] = React.useState<"options" | "county" | "finance" | "screen">("options");

  const faces = React.useMemo<RoofFace[]>(
    () =>
      session.faces.map((f) => ({
        id: f.id,
        path: f.path,
        planAreaSqFt: f.path.length >= 3 ? Math.round(pathAreaSqFt(f.path)) : 0,
        azimuthDeg: f.azimuthDeg,
        pitchDeg: f.pitchDeg,
        shadeFactor: f.shadeFactor,
        measuredSunshineHours: f.measuredSunshineHours ?? null,
        source: f.source,
        excluded: f.excluded,
      })),
    [session.faces],
  );

  const panel = solarPanels.find((p) => p.id === session.panelId) ?? solarPanels[0];
  const battery = solarBatteries.find((b) => b.id === session.batteryId) ?? solarBatteries[0];
  const production = React.useMemo(() => computeProduction(faces, panel, FL_LAT), [faces, panel]);
  const yearOneKwh = production.yearlyKwhVerified ?? production.yearlyKwhModel;

  const bom = React.useMemo(
    () =>
      faces.length
        ? buildSolarBom({
            faces,
            layouts: production.layouts,
            panel,
            battery,
            covering: session.covering,
            serviceRunFt: session.serviceRunFt,
            kwDc: production.kwDc,
            kwAc: production.kwAc,
          })
        : null,
    [faces, production, panel, battery, session.covering, session.serviceRunFt],
  );

  const savings = React.useMemo(
    () => computeSavings(yearOneKwh, bom?.netCost ?? 0, session.monthlyBill),
    [yearOneKwh, bom, session.monthlyBill],
  );

  const jurisdiction = session.countyId ? findJurisdictionById(session.countyId) : resolveJurisdiction(session.address);
  const economics = React.useMemo(
    () =>
      computeJurisdictionEconomics({
        jurisdiction,
        yearOneKwh,
        householdKwh: savings.householdKwhPerYear,
        installed: bom?.installed ?? 0,
        rateOverride: session.rateOverride ?? null,
      }),
    [jurisdiction, yearOneKwh, savings.householdKwhPerYear, bom, session.rateOverride],
  );

  /* Cash, loan and PPA priced at the COUNTY's blended value of production, so
     the FLIP take-off and the workstation cannot disagree. */
  const trio = React.useMemo(() => {
    const base = {
      ...DEFAULT_FINANCE,
      installed: bom?.installed ?? 0,
      yearOneKwh,
      householdKwh: savings.householdKwhPerYear,
      utilityRate: economics.effectiveRate,
    };
    return {
      cash: runFinance({ ...base, mode: "cash" }),
      loan: runFinance({ ...base, mode: "loan" }),
      ppa: runFinance({ ...base, mode: "ppa" }),
    };
  }, [bom, yearOneKwh, savings.householdKwhPerYear, economics.effectiveRate]);

  const screens = React.useMemo(() => faces.map((f) => screenFace(f, FL_LAT)), [faces]);
  const accepted = screens.filter((s) => s.verdict !== "rejected").length;

  const sendToBlueprint = () => {
    const route = loadSolarIntoBlueprint({
      address: session.address,
      economics,
      kwDc: production.kwDc,
      kwAc: production.kwAc,
      panels: production.panels,
      panelWatts: panel.watts,
      yearOneKwh,
      installed: bom?.installed ?? 0,
      batteryLabel: battery?.name,
      covering: session.covering,
      serviceRunFt: session.serviceRunFt,
    });
    window.open(route, "_blank", "noopener");
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[8px] uppercase tracking-[0.34em] text-muted-foreground">Wonderlands Solar — Genius</p>
          <p className="mt-1 truncate font-serif text-lg font-light leading-none">
            {production.kwDc > 0 ? `${production.kwDc.toFixed(2)} kW · ${production.panels} panels` : "Trace the roof to begin"}
          </p>
        </div>
        <Link
          to="/solar-genius"
          className="shrink-0 text-[8px] uppercase tracking-[0.26em] text-muted-foreground underline"
        >
          Full workstation
        </Link>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        <Tab active={tab === "options"} onClick={() => setTab("options")}>
          Options
        </Tab>
        <Tab active={tab === "county"} onClick={() => setTab("county")}>
          County & taxes
        </Tab>
        <Tab active={tab === "finance"} onClick={() => setTab("finance")}>
          Cash · Loan · PPA
        </Tab>
        <Tab active={tab === "screen"} onClick={() => setTab("screen")}>
          NREL screen {faces.length ? `${accepted}/${faces.length}` : ""}
        </Tab>
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-auto pr-1">
        {tab === "options" && <SolarOptionsLeaf />}

        {tab === "county" && (
          <JurisdictionLeaf
            compact
            address={session.address}
            countyId={session.countyId ?? null}
            rateOverride={session.rateOverride ?? null}
            economics={economics}
            onCountyChange={(id) => setSession((s) => ({ ...s, countyId: id }))}
            onRateChange={(rate) => setSession((s) => ({ ...s, rateOverride: rate }))}
            onSendToBlueprint={sendToBlueprint}
          />
        )}

        {tab === "finance" && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Priced at {`$${economics.effectiveRate.toFixed(3)}`}/kWh — the blended value of production in{" "}
              {economics.jurisdiction.county} County under {economics.exportRuleLabel.toLowerCase()}.
            </p>
            {(
              [
                ["Cash", trio.cash],
                ["Loan", trio.loan],
                ["PPA", trio.ppa],
              ] as const
            ).map(([label, r]) => (
              <div key={label} className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                  <p className="font-serif text-xl font-light leading-none">{usd(r.netBenefit)}</p>
                </div>
                <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {r.paybackYears ? `Payback ${r.paybackYears.toFixed(1)} yrs · ` : ""}
                  {r.lcoe > 0 ? `LCOE ${(r.lcoe * 100).toFixed(1)}¢/kWh` : "—"}
                </p>
              </div>
            ))}
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">County adjustment</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {economics.selfConsumedKwh.toLocaleString()} kWh used behind the meter at{" "}
                {`$${economics.rate.toFixed(3)}`}, {economics.exportedKwh.toLocaleString()} kWh exported at{" "}
                {`$${(economics.effectiveRate === economics.rate ? economics.rate : (economics.effectiveRate * yearOneKwh - economics.selfConsumedKwh * economics.rate) / Math.max(1, economics.exportedKwh)).toFixed(3)}`}
                . Incentives {usd(economics.incentiveCash)}; fees {usd(economics.jurisdictionCosts)}.
              </p>
            </div>
          </div>
        )}

        {tab === "screen" && (
          <div className="space-y-2.5">
            {screens.length === 0 && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Trace a roof plane on the facing leaf and each face is put through the four published NREL suitability
                tests — shading, tilt, azimuth and contiguous area.
              </p>
            )}
            {screens.map((s) => (
              <div key={s.faceId} className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{s.verdict}</p>
                  <p className="font-mono text-xs">{Math.round(s.shadedRatio * 100)}% of unshaded</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed">{s.headline}</p>
                {s.failed.length > 0 && (
                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    Failed — {s.failed.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarGeniusLeaf;
