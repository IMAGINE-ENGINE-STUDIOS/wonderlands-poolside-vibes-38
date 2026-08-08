# Recalibrate Screen Enclosure Pricing to the Florida Market

## What the research says (Florida, 2026)

Three current Florida contractor/market sources agree on the same corridor for professionally installed, permitted, code-compliant aluminum screen enclosures:

- **$12–$25 per sq ft** installed is the realistic market corridor.
  - $12–$15: simple geometry, standard spans, standard wind zone.
  - $18–$25: coastal/HVHZ, complex roof lines, heavy profiles, concrete remediation.
- **Typical mid-size pool cage (~1,500 sq ft): $20,000–$25,000**, market average about $23,000.
- Small patio enclosures: $2,500–$8,000. Average 20x30 pool enclosure: $12,000–$18,000. Large custom 30x50+: $20,000–$35,000+.

Sources: AAA Pro Screening 2026 price guide, Screen Factory Florida 2026 market analysis, Rescreen Rescue / MD Construction 2026 guides.

## Where our configurator sits today

The current model treats the Florida market band as **$24–$48/sq ft** — roughly double the real corridor — and then stacks 12% overhead on top of a 32% target gross margin (about a 1.65x markup on direct cost). Combined with a $22/sq ft "quality rate" and generous fixed soft costs, a standard 1,000–1,500 sq ft cage prices out near **$26–$30/sq ft**, i.e. above the top of the real Florida range even for a simple job. That is why it reads expensive.

## What to change

1. **Market band correction** — set the competitiveness benchmark to the real corridor ($12 low / $25 high per sq ft of footprint), keeping the existing small-job soft-cost adjustment so tiny enclosures aren't wrongly flagged.
2. **Direct cost recalibration** — bring frame material, parts, and burdened install labor per sq ft down to rates that land a standard mansard cage at roughly $8–$11/sq ft of direct cost, which is what supports a $13–$16/sq ft competitive sell price.
3. **Overhead & margin defaults** — lower the default target gross margin and overhead to a level that still pays the business (target sell price inside the market band, healthy profit line) instead of pushing the quote above market. Both stay editable in the contractor panel so margin can be raised deliberately per job.
4. **Soft costs** — trim engineering, permit and mobilization defaults to typical Florida residential screen-enclosure figures so a small 300 sq ft patio cage doesn't carry a disproportionate fixed load.
5. **Base "quality rate"** — reset the default $/sq ft quality tiers so the customer-facing turnkey rate starts inside $12–$25 rather than at $22 before multipliers.
6. **Align the other places screen enclosures are priced** so the whole site tells one story:
   - `ScreenEnclosureAddon` ($22 / $26 per sq ft today)
   - `ProductOptionsManager` screen-enclosure branch ($20–$33 per sq ft today)
   - the AI assistant catalog prompt ($15 / $28 per sq ft today)
7. **Show the market context in the proposal** — the Investment Summary already prints a Florida market note; update it to cite the $12–$25 corridor and the ~$23k / 1,500 sq ft benchmark so customers can see the quote is in-market.

Upgrade options (heavier extrusions, premium screens, insulated pans, HVHZ package, doors, add-ons) keep their relative premiums — they simply price up from a correct base, so a high-wind coastal gable still lands in the $18–$25 range instead of $30+.

## Technical notes

- Single source of truth for the numbers is `ENCLOSURE_COST_MODEL` and the quality-rate defaults in `src/data/screenEnclosureConfigurator.ts`; the calculation flow (cost lines, markup factor, itemization, competitiveness) stays exactly as-is — only the rate constants and defaults move.
- `marketRangePerSqFt` changes from `{ low: 24, high: 48 }` to the researched corridor; the `4500/area` and `9000/area` small-job adjustments get retuned to match the lower fixed-cost basis.
- Because the customer itemization is derived as `cost x markupFactor`, no UI changes are needed for the new totals to flow into the proposal, the Studio card and the cart.
- Contractor panel still exposes overhead % and target margin % sliders, and the break-even $/sq ft readout will now sit meaningfully below the market low.
