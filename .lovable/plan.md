# Compact option tiles across all product cards

## Goal

Replace the remaining "long rectangle" option lists inside product configurators with the same compact, well-proportioned square tiles already used everywhere else (finishes, pavers, tiles, waterlines). Each option will become a small card with a properly sized image on top and the name/price below.

## What changes for the user

Inside the product cards (Pools, Tanning Ledges, Saunas), three option lists currently render as full-width horizontal bars with a tiny image squeezed on the left:

- **Pool Cover Type** (in pool configurators)
- **Heater Model** in Tanning Ledge cards
- **Heater Model** in Sauna cards

These three lists will be redesigned as compact tile carousels — same look as the existing finish/paver/tile pickers — so the product image gets proper space and proportions feel consistent across the catalog.

Everything else (finishes, pavers, tiles, waterlines, pool heaters in pool cards, etc.) is already compact and will not be touched.

## Files to edit

1. `src/components/PoolProductCard.tsx` — Cover Type block (~lines 1291–1319): swap the `grid-cols-1` full-width buttons for a 2-column carousel of square tiles (image on top, surname + price below). Color swatch sub-grid below stays unchanged.
2. `src/components/TanningLedgeProductCard.tsx` — Heater Model block (~lines 396–408): same conversion to 2-column compact tile carousel with proper image area.
3. `src/components/SaunaProductCard.tsx` — Heater Model block (~lines 353–370): same conversion to 2-column compact tiles (uses a heater icon since no image is provided).

## Technical details

- Reuse the existing pattern: `Carousel` + `CarouselContent` + `CarouselItem className="pl-1 basis-1/2"`, item content = `p-3 border rounded-lg ... flex flex-col` with a `w-full h-16 rounded-md` image area on top and centered name/price below.
- Selected state keeps the existing accent color per card (primary for pool covers, coral for heaters).
- No data changes, no new dependencies, no logic changes — purely presentational restructuring of three blocks.
- All other option lists (which already use the square-tile carousel pattern) remain untouched per the project rule "Do not change the outline of the product card" and to avoid regressions.
