# Solar Genius

Route: `/solar-genius` (page `src/pages/SolarGenius.tsx`), with the
`solar-report` Supabase function for generated reports and the
SolarGenius leaf components under `src/components/solar/`.

What it does: sizes a solar system for the guest's roof and usage, prices
it, and explains production, savings and payback in plain language.

Live data Genius must use (never invented figures):

- `src/data/solarData.ts` — panels, packages and production assumptions
- `src/data/solarHardware.ts` — inverters, batteries and hardware pricing
- `src/data/electricityTariffs.ts` — utility rates for savings maths
- `src/data/floridaSolarJurisdictions.ts` — permitting / jurisdiction rules
- `src/data/nrelRooftopPotential.ts` — rooftop solar potential reference

Model routing: solar Q&A and report narration are `qa` (Llama 3.3 70B);
a full report over a long usage history is `bulk` (Llama 4 Scout).
Calculations themselves are deterministic code, not model output — the
model explains the numbers, it never invents them.
