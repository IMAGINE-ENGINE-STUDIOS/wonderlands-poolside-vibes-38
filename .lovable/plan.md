# Apply raceband banner style to remaining sub-category headers

## Goal

Convert the last few product sub-category headers that still use the old large gradient `<h2>`/`<h3>` style into the thin glossy `RacebandBanner` already used everywhere else.

## What changes for the user

Three remaining headers will be replaced with the thin raceband:

- **Best Sellers** (homepage `DealsSection`) — currently a large gradient title flanked by pulsing stars.
- **Latham Tanning Ledges** sub-header — currently a blue/cyan gradient `<h3>`.
- **Glimmerglass Tanning Ledges** sub-header — currently a purple/pink gradient `<h3>`.

After the change, these headers will look identical in style to all other product section headers (thin band, gloss highlight, brand colors).

## Files to edit

1. `src/components/DealsSection.tsx` — replace the `Best Sellers` header block (lines ~119–131) with `<RacebandBanner title="Best Sellers" subtitle="Our most popular products across all categories — trusted by hundreds of happy customers" variant="coral" />`. Add the `RacebandBanner` import.
2. `src/components/TanningLedgeSection.tsx` — replace the two `<h3>` sub-headers (lines 98–100 and 115–117) with `<RacebandBanner title="Latham Tanning Ledges" ... variant="primary" />` and `<RacebandBanner title="Glimmerglass Tanning Ledges" ... variant="teal" />`. (Import already present.)

## Technical details

- No data, no logic changes — purely presentational header swap.
- Bottom `SectionBanner` images on the main pool catalog stay untouched per previous instruction.
- All Wonderlands / Latham / Glimmerglass main banners on `PoolCatalog`, `GilmerPoolsSection`, `GilmerSpasSection` are already on the raceband style — nothing to do there.
