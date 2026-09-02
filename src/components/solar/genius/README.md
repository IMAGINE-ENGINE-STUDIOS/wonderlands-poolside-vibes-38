# Solar Genius sections

The four movements of `/solar-genius` (`src/pages/SolarGenius.tsx`). Each is lazy
loaded by the page and takes plain data props — none of them read the session
directly, so they stay pure and testable.

| File | Movement | Reads |
| --- | --- | --- |
| `SuitabilityScreen.tsx` | I — Instrument | `RoofFace[]` plus `FaceSuitability[]` from `src/lib/solar/suitability.ts` |
| `NationalBenchmark.tsx` | II — Benchmark | `RoofBenchmark` plus the static reference rows in `src/data/nrelRooftopPotential.ts` |
| `AnalysisDeck.tsx` | III — Analysis | measured design numbers; runs `src/lib/solar/financeModel.ts` |
| `PresentationLeaf.tsx` | IV — Presentation | headline numbers plus the `SolarBom` |

Reference data is static and offline — the NREL 2016 rooftop-potential study
(data submission 121) and the DOE Solar Rooftop Potential page. Every published
figure carries its source, and DOE's caution that technical potential is an upper
limit rather than an economic or market forecast is printed alongside the
benchmarks.

Pricing, product imagery and quote styling are untouched: the installed price and
bill of materials come from the existing `solarBom` / `solarHardware` modules, and
the aerial board is the existing `SolarCalculatorBoard`.

The dealer sheet in `PresentationLeaf.tsx` is gated by the `WONDERMAGIC` passcode,
matching the rest of the platform's sales-view convention.
