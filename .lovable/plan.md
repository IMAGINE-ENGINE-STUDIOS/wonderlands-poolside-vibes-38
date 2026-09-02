# Solar Genius — the national-data solar workstation

A new page, `/solar-genius`, that turns the existing Total Solar Calculator into a
complete study, analysis and selling instrument: benchmarked against national
rooftop-potential science, usable by an installer or dealer in front of a
customer, and understandable enough that a consumer can quote themselves.

## What the research gives us

Two public sources are folded in as a permanent, offline reference layer — no
runtime API, no key, no latency.

**NREL, *Rooftop Solar PV Technical Potential in the United States* (data.nrel.gov
submission 121, 2016 workbook + shapefiles; Gagnon, Margolis, Melius, Phillips,
Elmore).** From it we adopt the published suitability rules and the
per-state/per-building-class potential:

- Suitability screen: shading (production not below 70% of an unshaded identical
  system), tilt no greater than 60°, azimuth not facing north, and a contiguous
  usable patch of at least 10 m².
- Building classes: small (<5,000 SF), medium (5,000–25,000 SF), large
  (>25,000 SF).
- Findings we quote to the customer: within the 128 lidar cities, 83% of small
  buildings have a suitable location but only 26% of small-building roof area is
  developable; small buildings alone could host 731 GW and generate 926 TWh/yr,
  about 65% of the national rooftop potential.

**DOE Clean Energy Manufacturing / Solar Rooftop Potential.** Framing and
national figures: over 8 billion m² of suitable rooftop, over 1 TW of potential
capacity, residential and other small roofs about 65% of it, 42% of residential
roofs low-to-moderate income, and the definition that technical potential is an
upper bound — not economic or market potential. Solar Genius states that
distinction on the page so nobody confuses potential with a quote.

Each figure is rendered with its source and year attached, so the page is
citable in a sales appointment.

## What Solar Genius is

One page, four movements, all reading the same live project (address, roof faces,
module, tariff) already produced by the existing board and session store.

**1 — The Instrument.** The aerial board and the roof faces, unchanged, at the
top. Adds a *Suitability Screen* verdict per face that runs the NREL criteria
explicitly: tilt pass/fail, azimuth pass/fail, contiguous-area pass/fail, shading
ratio vs the 70% floor. Each face gets Suitable / Marginal / Rejected with the
reason in words, so a dealer can defend the layout and a homeowner can see why a
north face was dropped.

**2 — The Benchmark.** Where this specific roof sits against the national data:
usable-area fraction for this roof versus NREL's 26% small-building average,
capacity density (W/m²), and modelled yield versus the state figure for the
building class. This is the "envy" panel — a homeowner learns their roof is
better or worse than the national roof, and a dealer gets a credible third-party
yardstick instead of a claim.

**3 — The Analysis Deck.** Study tools built on the existing engine:
- Scenario compare — up to three saved studies side by side (module, storage,
  offset, cost, payback) from the existing gallery.
- Sensitivity strip — what one variable does to the outcome: tariff escalation,
  degradation, shading, derate, module wattage.
- Financial model — cash, loan and PPA-style comparison with ITC, payback, 25-year
  net, LCOE per kWh, all priced from the current engine and the tariff table.
- Offset ladder — how many modules to reach 50 / 80 / 100 / 120% of the bill and
  whether the roof can physically hold each rung.

**4 — The Presentation.** What is handed to the customer: a one-page consumer
read (bill today, bill after, offset, payback, what the roof can hold, plain
language), and a dealer read behind the existing `WONDERMAGIC` passcode showing
the bill of materials, cost basis, margin and the takeoff. Prints on letter,
adds the system to the project, and hands off to the quote engine.

## Design

Astronomical OLED console, continuous with the current solar work: deep sky
field, glass instrument panes, orbital gauges, one accent per verdict
(suitable / marginal / rejected). All colour through semantic tokens; the page
carries its own scoped token set so it stays legible in both themes. Typography
is the house display/body pairing. Fully responsive — the deck reflows to a
single column, the aerial stays gesture-driven on touch.

## Technical notes

- New reference module `src/data/nrelRooftopPotential.ts`: the NREL suitability
  constants, building classes, national and per-state potential rows we cite,
  and the DOE national framing figures, each with source, publication year and
  URL. Static typed data, tree-shaken, no network.
- New library `src/lib/solar/suitability.ts`: runs the NREL screen against a
  `RoofFace`, returning verdict, failed criteria and the shading ratio; plus the
  benchmark comparison against the reference rows.
- New library `src/lib/solar/financeModel.ts`: cash/loan/PPA cash flows, ITC,
  payback, LCOE, escalation and degradation — pure functions, unit-testable.
- New page `src/pages/SolarGenius.tsx` + section components under
  `src/components/solar/genius/`, each lazy-loaded so the aerial and the
  astronomical console never block first paint.
- Reuses without modification: `solarEngine.ts`, `solarBom.ts`, `astronomy.ts`,
  `electricityTariffs.ts`, `solarHardware.ts`, `AerialCanvas`,
  `SolarPerformanceGraphics`, `SolarSystemConsole`, `solarSession`, the project
  gallery and the cart. No existing pricing or product data is altered.
- Route added to the router with SEO head tags; the existing `/solar-board`
  stays as the focused drawing board and links across.
- Persistence through `usePersistentState` / the solar session, so a reload
  returns the same study, scenarios and open panels.

## Out of scope for this pass

Shapefile/GIS ingestion (the 121 submission's polygons), lidar-derived roof
geometry, and utility-specific rate schedules beyond the existing tariff table.
Noted for a later pass.
