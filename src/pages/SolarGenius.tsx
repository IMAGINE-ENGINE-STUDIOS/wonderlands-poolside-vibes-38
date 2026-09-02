import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSolarSession } from "@/components/solar/solarSession";
import { computeProduction, computeSavings, pathAreaSqFt, type RoofFace } from "@/lib/solar/solarEngine";
import { buildSolarBom } from "@/lib/solar/solarBom";
import { solarBatteries, solarPanels, FL_UTILITY_RATE } from "@/data/solarHardware";
import { benchmarkRoof, screenFace } from "@/lib/solar/suitability";
import { REFERENCE_SOURCES } from "@/data/nrelRooftopPotential";
import { findJurisdictionById, resolveJurisdiction } from "@/data/floridaSolarJurisdictions";
import { computeJurisdictionEconomics } from "@/lib/solar/jurisdictionIncentives";
import { loadSolarIntoBlueprint } from "@/lib/solar/solarBlueprint";

/**
 * Solar Genius — the national-data solar workstation.
 *
 * Four movements, in the order a real study is worked:
 *   I  Instrument — trace the roof on the aerial, then run the published NREL
 *      suitability screen on every face and print the verdict with its reasons.
 *   II Benchmark — put this one roof against the national rooftop-potential data
 *      (developable area, capacity density, specific yield), with DOE's caution
 *      that technical potential is an upper limit, not a quote.
 *   III Analysis Deck — cash, loan and PPA, sensitivity, offset ladder, scenarios.
 *   IV Presentation — the consumer sheet, and a WONDERMAGIC dealer sheet with the
 *      bill of materials and takeoff.
 *
 * Every number derives from the live solar session, so the board on /solar-board
 * and this workstation always agree. Sections are lazy so the page opens fast.
 */

const SolarCalculatorBoard = React.lazy(() => import("@/components/solar/SolarCalculatorBoard"));
const SuitabilityScreen = React.lazy(() => import("@/components/solar/genius/SuitabilityScreen"));
const JurisdictionLeaf = React.lazy(() => import("@/components/solar/genius/JurisdictionLeaf"));
const NationalBenchmark = React.lazy(() => import("@/components/solar/genius/NationalBenchmark"));
const AnalysisDeck = React.lazy(() => import("@/components/solar/genius/AnalysisDeck"));
const PresentationLeaf = React.lazy(() => import("@/components/solar/genius/PresentationLeaf"));

const FL_LAT = 27.5;

const Movement: React.FC<{
  index: string;
  title: string;
  standfirst: string;
  children: React.ReactNode;
}> = ({ index, title, standfirst, children }) => (
  <section className="mt-16 md:mt-24">
    <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
      <span className="font-serif text-4xl font-light leading-none text-foreground/25">{index}</span>
      <h2 className="font-serif text-2xl font-light leading-tight md:text-3xl">{title}</h2>
    </div>
    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{standfirst}</p>
    <div className="mt-8 h-px w-16 bg-foreground/25" />
    <div className="mt-8">
      <React.Suspense
        fallback={
          <div className="flex h-40 items-center justify-center rounded-2xl border border-foreground/10 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
            Loading…
          </div>
        }
      >
        {children}
      </React.Suspense>
    </div>
  </section>
);

const SolarGenius: React.FC = () => {
  const [session, setSession] = useSolarSession();

  /* The session stores plain saved faces; the engine wants RoofFace, and the
     plan area is recovered from the traced ring so the workstation never depends
     on a stale number cached by an older version of the board. */
  const geometryFaces = React.useMemo<RoofFace[]>(
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

  const production = React.useMemo(
    () => computeProduction(geometryFaces, panel, FL_LAT),
    [geometryFaces, panel],
  );

  const bom = React.useMemo(
    () =>
      geometryFaces.length
        ? buildSolarBom({
            faces: geometryFaces,
            layouts: production.layouts,
            panel,
            battery,
            covering: session.covering,
            serviceRunFt: session.serviceRunFt,
            kwDc: production.kwDc,
            kwAc: production.kwAc,
          })
        : null,
    [geometryFaces, production, panel, battery, session.covering, session.serviceRunFt],
  );

  const yearlyKwh = production.yearlyKwhVerified ?? production.yearlyKwhModel;
  const savings = React.useMemo(
    () => computeSavings(yearlyKwh, bom?.netCost ?? 0, session.monthlyBill),
    [yearlyKwh, bom, session.monthlyBill],
  );

  const screens = React.useMemo(() => geometryFaces.map((f) => screenFace(f, FL_LAT)), [geometryFaces]);

  const benchmark = React.useMemo(
    () =>
      geometryFaces.length
        ? benchmarkRoof({
            faces: geometryFaces,
            layouts: production.layouts,
            screens,
            kwDc: production.kwDc,
            yearlyKwh,
          })
        : null,
    [geometryFaces, production, screens, yearlyKwh],
  );

  /* The jurisdiction: county tariff, export rule, taxes, programmes, penalties.
     Resolved from the traced address unless the dealer picked a county, and
     always overridable from the customer's own bill. Everything downstream — the
     analysis deck, the presentation sheet and the blueprint notes — prices at the
     BLENDED value of production this county actually pays, not at a flat rate. */
  const jurisdiction = session.countyId
    ? findJurisdictionById(session.countyId)
    : resolveJurisdiction(session.address);

  const economics = React.useMemo(
    () =>
      computeJurisdictionEconomics({
        jurisdiction,
        yearOneKwh: yearlyKwh,
        householdKwh: savings.householdKwhPerYear,
        installed: bom?.installed ?? 0,
        rateOverride: session.rateOverride ?? null,
      }),
    [jurisdiction, yearlyKwh, savings.householdKwhPerYear, bom, session.rateOverride],
  );

  const sendToBlueprint = React.useCallback(() => {
    const route = loadSolarIntoBlueprint({
      address: session.address,
      economics,
      kwDc: production.kwDc,
      kwAc: production.kwAc,
      panels: production.panels,
      panelWatts: panel.watts,
      yearOneKwh: yearlyKwh,
      installed: bom?.installed ?? 0,
      batteryLabel: battery?.name,
      covering: session.covering,
      serviceRunFt: session.serviceRunFt,
    });
    window.open(route, "_blank", "noopener");
  }, [session, economics, production, panel, yearlyKwh, bom, battery]);

  const measured = {
    installed: bom?.installed ?? 0,
    yearOneKwh: yearlyKwh,
    householdKwh: savings.householdKwhPerYear,
    maxPanels: production.panels,
    panelWatts: panel.watts,
    specificYield: production.kwDc > 0 ? Math.round(yearlyKwh / production.kwDc) : 0,
    pricePerWatt: bom?.costPerWatt ?? panel.pricePerWatt,
    /* The county's blended value of a produced kWh — self-consumption at retail,
       exports at whatever this utility actually credits. */
    utilityRate: economics.effectiveRate || FL_UTILITY_RATE,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Solar Genius | Roof-Measured Solar Analysis & Benchmarks</title>
        <meta
          name="description"
          content="Trace your roof, screen it against NREL suitability criteria, benchmark it against national rooftop potential, and model cash, loan or PPA economics."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/solar-genius" />
        <meta property="og:title" content="Solar Genius | Roof-Measured Solar Analysis" />
        <meta
          property="og:description"
          content="NREL suitability screening, national rooftop-potential benchmarks and full solar financial modelling on your own roof."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-[1600px] px-4 py-12 md:px-8 md:py-16">
        <header>
          <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
            Wonderlands Solar — Workstation
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-4xl font-light leading-[1.05] tracking-tight md:text-6xl">
            Solar Genius
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            A study, not a slide. Your roof is measured from the aerial, screened against the same criteria the National
            Renewable Energy Laboratory used to size the country's rooftop potential, benchmarked against that national
            data, then priced three ways — cash, loan and power purchase — with every assumption exposed.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <a className="underline" href={REFERENCE_SOURCES.nrelData.url} target="_blank" rel="noreferrer">
              NREL data 121
            </a>
            <a className="underline" href={REFERENCE_SOURCES.doe.url} target="_blank" rel="noreferrer">
              DOE rooftop potential
            </a>
            <Link className="underline" to="/solar-board">
              Total Solar Calculator
            </Link>
          </div>
        </header>

        <Movement
          index="I"
          title="Instrument the roof"
          standfirst="Search the property, frame the aerial and trace each roof plane. Faces are scored for sun, panels are laid out to fit inside the fire setbacks, and then every face is put through the four published suitability tests — shading, tilt, azimuth and contiguous area — so a rejected plane is explained, not hidden."
        >
          <div className="space-y-8">
            <SolarCalculatorBoard height={640} />
            <SuitabilityScreen faces={geometryFaces} screens={screens} />
          </div>
        </Movement>

        <Movement
          index="II"
          title="Benchmark against the nation"
          standfirst="How this roof compares with the national rooftop dataset: the share of its area that is genuinely developable, how densely it can be packed, and how hard each installed kilowatt works in Florida sun."
        >
          <NationalBenchmark benchmark={benchmark} />
        </Movement>

        <Movement
          index="III"
          title="County, tariff and tax"
          standfirst="Where the roof is decides what it earns. The serving utility, the retail rate and the fixed charge solar can never offset; the export rule — 1:1 net metering under the PSC rule, or a municipal net-billing rider that pays avoided cost; the federal credit and the two Florida exemptions with their statutes; local rebates, co-op loans and PACE districts; and the penalties that quietly remove value."
        >
          <JurisdictionLeaf
            address={session.address}
            countyId={session.countyId ?? null}
            rateOverride={session.rateOverride ?? null}
            economics={economics}
            onCountyChange={(id) => setSession((s) => ({ ...s, countyId: id }))}
            onRateChange={(rate) => setSession((s) => ({ ...s, rateOverride: rate }))}
            onSendToBlueprint={sendToBlueprint}
          />
        </Movement>

        <Movement
          index="IV"
          title="Analysis deck"
          standfirst="The economics, worked openly. Cash, loan and power purchase on one footing, a sensitivity grid that shows which assumption actually moves the deal, the 50/80/100/120% offset ladder priced from the measured design, and saved scenarios for side-by-side comparison."
        >
          <AnalysisDeck measured={measured} />
        </Movement>

        <Movement
          index="V"
          title="Presentation"
          standfirst="One study, two readings: a plain-language sheet the homeowner keeps, and a dealer sheet — behind the WONDERMAGIC passcode — carrying the bill of materials, the electrical takeoff and the cost per watt."
        >
          <PresentationLeaf
            address={session.address}
            panels={production.panels}
            kwDc={production.kwDc}
            yearlyKwh={yearlyKwh}
            offsetPercent={savings.offsetPercent}
            installed={bom?.installed ?? 0}
            netCost={bom?.netCost ?? 0}
            paybackYears={savings.paybackYears}
            lifetimeValue={savings.lifetimeSavings}
            bom={bom}
          />
        </Movement>
      </main>

      <Footer />
    </div>
  );
};

export default SolarGenius;
