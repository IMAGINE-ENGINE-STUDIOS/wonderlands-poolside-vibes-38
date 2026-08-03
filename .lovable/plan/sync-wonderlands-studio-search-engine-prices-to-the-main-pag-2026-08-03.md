# Sync Wonderlands Studio + Search Engine prices to the main page

Verified against the code: all pool model prices already match between the main page catalog and the search index (81 matching entries, zero differences), and covers, pavers, screen enclosures, liners, finishes, saunas, tanning ledges and driveway gates all read from the same shared data files. Three real mismatches remain.

## 1. Heaters (Studio and Latham pool card are 20% higher)

The main page categories (GlimmerGlass pools, spas, saunas, tanning ledges, pool details) show the Pentair list prices, and the shared feature config used to compute totals also uses them:

| Heater | Main page | Studio / Latham card |
|---|---|---|
| MasterTemp 125 | $2,300 | $2,760 |
| MasterTemp 250 | $3,680 | $4,416 |
| MasterTemp 400 | $4,830 | $5,796 |
| UltraTemp 90 | $5,175 | $6,210 |
| UltraTemp 110 | $6,325 | $7,590 |
| UltraTemp 140 | $7,475 | $8,970 |

Bring the Studio and the Latham pool card down to the main page prices. This also removes a live bug: the Studio *displays* $2,760 but its running total already charges $2,300, so the quote never matched the label.

## 2. Waterline tiles (Studio invents a per-sqft rate)

The main page Tiles section sells each tile at a fixed catalog price (Mountain / Carnegie / Panama $15,000, Genesis $22,000, Hermosa $24,000). The Studio instead shows "$45/sqft × pool perimeter" in the swatch, breakdown and quote, while its total again charges the catalog price. Switch the Studio tile display, breakdown and quote lines to the catalog price so label, total and quote agree.

## 3. Search index gaps

- The 8 Latham spas on the main page (Mystic, Regal, Royal, Shasta and each Spillover version, $13,213–$18,638) are missing from the search lookup, so search shows no price card for them. Add them with catalog price, dimensions and image.
- The lookup lists "Moonlight Spillover Spa" — the real product is **Moondance Spillover** ($20,000). Correct the key and name so search matches the catalog.

## Technical notes

- `src/pages/WonderlandsStudio.tsx` — heater price list; replace `calculateTileCost` (perimeter × $45) with a catalog lookup against `poolTilesData`; update the two extras-breakdown builders, the tile carousel label and the summary row.
- `src/components/PoolProductCard.tsx` — heater price list back to list prices.
- `src/data/poolProductLookup.ts` — add the 8 Latham spa entries, fix the Moondance Spillover entry.

No other category prices change; everything else already resolves to the same shared data the main page renders.
