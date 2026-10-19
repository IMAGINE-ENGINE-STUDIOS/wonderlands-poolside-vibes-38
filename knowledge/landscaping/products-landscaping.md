# Wonderlands product knowledge — landscaping (plants, beds, looks)

Source of truth: `src/data/landscapingData.ts` (the `/landscaping` plant
catalog), `src/lib/landscape/landscapeEstimate.ts` (bed fills and rates) and
`src/lib/landscape/presets.ts` (the designed looks). Genius quotes plants,
beds and landscaping work ONLY from this file and those sources — never
from memory, never an invented species or price.

How plant pricing works in the data: the catalog stores a base price per
container size; the retail price the guest pays is **base × 3**
(`LANDSCAPING_MARKUP`), and it is the price of one plant, installed
(`resolvePick` in `src/lib/landscape/plantSpecs.ts` calls it "Retail price
of one plant, installed"). Every price below is that retail price.
Container sizes run 1 gal → 45 gal and B&B (balled & burlapped, field-grown);
succulents are sold by pot diameter (2" / 4" / 6").

The catalog holds **234 priced plant entries** in 10 categories.
Entries that share a base name (e.g. "Ligustrum - Green", "Ligustrum -
Recurve") appear on one card in the app as variants of that plant.

## Palms (27)

| Plant | Sizes — retail price each, installed |
|---|---|
| Palm, Adonidia (Double/Triple) | 15 gal $195 · 30 gal $405 · 45 gal $675 · B&B $975 |
| Palm, Areca | 7 gal $75 · 15 gal $135 · 30 gal $345 · 45 gal $735 · B&B $975 |
| Palm, Areca B&B XL | B&B $1,125 |
| Palm, Bismark | 15 gal $555 · 30 gal $1,050 · 45 gal $1,650 · B&B $2,250 |
| Palm, Bottle (Single) | 15 gal $195 · 30 gal $405 · 45 gal $555 · B&B $975 |
| Palm, Bottle (Triple) | 30 gal $675 |
| Palm, Cabbage/Sabal | B&B $1,275 |
| Palm, Canary Island Date (Pineapple) | 7 gal $149.85 · 15 gal $375 · 30 gal $825 · 45 gal $1,155 |
| Palm, Cardboard | 3 gal $74.85 · 7 gal $209.85 |
| Palm, Cat | 7 gal $75 · 15 gal $135 |
| Palm, Chinese Fan | 7 gal $75 · 15 gal $135 · 30 gal $225 · 45 gal $495 · B&B $1,155 |
| Palm, European Fan | 7 gal $150 · 15 gal $509.85 · 30 gal $570 · 45 gal $675 · B&B $10,350 |
| Palm, Fishtail | 7 gal $75 · 15 gal $285 · 30 gal $555 · 45 gal $855 |
| Palm, Foxtail (Double) | 15 gal $405 · 30 gal $555 · 45 gal $1,155 |
| Palm, Foxtail (Single) | 7 gal $135 · 15 gal $405 · 30 gal $555 · 45 gal $975 |
| Palm, Foxtail (Triple) | 15 gal $450 · 30 gal $555 · 45 gal $1,155 |
| Palm, Majesty | 7 gal $75 |
| Palm, Pindo | 30 gal $555 |
| Palm, Ponytail | 7 gal $135 · 15 gal $345 |
| Palm, Queen | 7 gal $135 · 15 gal $315 · 30 gal $555 · 45 gal $975 |
| Palm, Raphis | 15 gal $285 |
| Palm, Reclinata | B&B $7,500 |
| Palm, Roebellini (Triple) | 7 gal $165 · 15 gal $285 · 30 gal $675 · 45 gal $735 |
| Palm, Sylvester | 15 gal $435 · 30 gal $675 · 45 gal $1,275 |
| Palm, Traveler's | 30 gal $675 |
| Palm, Windmill | 7 gal $239.85 · 15 gal $435 · 30 gal $675 |
| Sago Palm | 7 gal $75 · 15 gal $165 · 30 gal $405 |

## Trees (28)

| Plant | Sizes — retail price each, installed |
|---|---|
| Bald Cypress | 30 gal $555 · 45 gal $975 |
| Bottlebrush Red Cluster (Standard) | 15 gal $405 · 30 gal $735 · 45 gal $1,125 |
| Crape Myrtle MULTI - Natchez, Muskogee, Tuscarora | 15 gal $285 · 30 gal $645 · 45 gal $1,050 |
| Crape Myrtle STD - Natchez, Muskogee, Tuscarora | 30 gal $750 · 45 gal $1,185 |
| Crape Myrtle MULTI - Dynamite, Double Feature, Enduring Summer | 15 gal $345 · 30 gal $675 · 45 gal $1,125 |
| Crape Myrtle MULTI - Ebony | 15 gal $375 · 30 gal $645 · 45 gal $1,185 |
| Crape Myrtle STD - Ebony | 30 gal $450 · 45 gal $825 |
| Elm - Drake | 30 gal $555 |
| Elm - Winged | 30 gal $555 · 45 gal $1,155 |
| Golden Rain Tree | 30 gal $555 |
| Holly - Eagleston | 30 gal $555 · 45 gal $975 |
| Holly - Weeping Yaupon | 30 gal $675 |
| Italian Cypress | 3 gal $85.50 · 7 gal $195 · 15 gal $375 · 30 gal $975 · 45 gal $1,275 |
| Jacaranda | 15 gal $210 · 30 gal $435 |
| Japanese Blueberry | 15 gal $345 · 30 gal $555 · 45 gal $975 |
| Laurel Oak | 30 gal $735 · 45 gal $1,350 |
| Leyland Cypress | 7 gal $97.50 · 15 gal $195 · 30 gal $555 · 45 gal $975 |
| Live Oak | 30 gal $735 · 45 gal $1,350 |
| Magnolia - DD Blanchard | 30 gal $555 · 45 gal $975 |
| Magnolia - Little Gem | 15 gal $405 · 30 gal $555 · 45 gal $975 |
| Majestic Beauty (Indian Hawthorne standard) | 15 gal $435 · 30 gal $675 |
| Purple Leaf Plum | 15 gal $195 · 30 gal $405 |
| Red Cedar | 15 gal $195 · 30 gal $435 |
| Red Maple | 30 gal $555 |
| Royal Poinciana | 15 gal $210 · 30 gal $405 |
| Slash Pine | 30 gal $405 · 45 gal $555 |
| Sweet Gum | 30 gal $555 · 45 gal $975 |
| Sycamore | 30 gal $555 · 45 gal $975 |

## Shrubs (42)

| Plant | Sizes — retail price each, installed |
|---|---|
| Arboricola - Trinette | 3 gal $44.85 · 7 gal $97.50 |
| Anise (Yellow) | 3 gal $44.85 · 7 gal $97.50 |
| Bottlebrush Better John (Dwarf) | 3 gal $68.85 |
| Bottlebrush Red Cluster (Bush) | 3 gal $50.85 · 7 gal $112.50 · 15 gal $195 · 30 gal $675 |
| Burfordii Holly (Dwarf) | 3 gal $44.85 · 7 gal $97.50 |
| Buttonwood | 3 gal $44.85 |
| Cast Iron Plant | 3 gal $59.85 |
| Clusia (Autograph Plant) | 3 gal $50.85 · 15 gal $165 |
| Coco Plum | 3 gal $50.85 · 7 gal $135 |
| Copper Plant (Red) | 3 gal $50.85 · 15 gal $195 |
| Duranta Shrub (Purple) | 3 gal $44.85 |
| Duranta Shrub (White) | 3 gal $44.85 |
| Eleagnus (Silverthorn) | 3 gal $44.85 · 7 gal $97.50 |
| Eleagnus Variegated | 3 gal $44.85 · 7 gal $115.50 |
| False Rosemary | 3 gal $44.85 |
| Goldmound | 3 gal $44.85 |
| Ilex Schilling (12"x14") | 3 gal $44.85 · 7 gal $97.50 |
| Indian Hawthorn | 3 gal $44.85 · 7 gal $97.50 |
| Japanese Boxwood | 3 gal $44.85 |
| Juniper - Blue Point | 3 gal $59.85 |
| Ligustrum - Green | 3 gal $44.85 · 7 gal $97.50 · 15 gal $195 · 30 gal $555 · 45 gal $975 |
| Ligustrum - Howardii (Variegated) | 3 gal $44.85 · 30 gal $555 · 45 gal $975 |
| Ligustrum - Jack Frost | 3 gal $44.85 · 7 gal $97.50 · 30 gal $555 · 45 gal $975 |
| Ligustrum - Recurve | 3 gal $44.85 · 30 gal $555 · 45 gal $975 |
| Ligustrum - Sunshine | 3 gal $74.85 · 30 gal $555 |
| Loropetalum 'Cerise Charm' | 3 gal $59.85 · 7 gal $98.85 · 15 gal $225 |
| Loropetalum (Standard) | 15 gal $345 |
| Nandina Domestica | 3 gal $44.85 · 7 gal $97.50 |
| Pittosporum (Green) | 3 gal $44.85 · 15 gal $195 |
| Pittosporum (Variegated) | 3 gal $44.85 |
| Podocarpus | 3 gal $44.85 · 7 gal $97.50 · 15 gal $195 · 30 gal $555 |
| Podocarpus Pringles (Dwarf) | 3 gal $50.85 |
| Podocarpus XL | 30 gal $675 |
| Sea Grape | 3 gal $44.85 |
| Serissa | 3 gal $44.85 |
| Simpson Stopper | 3 gal $44.85 |
| Texas Sage | 3 gal $44.85 |
| Viburnum - Dwarf Walters | 3 gal $44.85 |
| Viburnum - Odoratissimum | 3 gal $44.85 · 7 gal $97.50 · 15 gal $195 · 30 gal $555 |
| Viburnum - Suspensum | 3 gal $44.85 · 7 gal $97.50 |
| Viburnum - Walters Regular | 3 gal $44.85 · 7 gal $97.50 · 15 gal $195 |
| Wax Myrtle | 3 gal $44.85 · 7 gal $97.50 · 15 gal $195 · 30 gal $555 |

## Flowering (64)

| Plant | Sizes — retail price each, installed |
|---|---|
| Abelia (Light Pink) | 3 gal $35.85 |
| African Iris (Yellow & White) | 3 gal $44.85 |
| Agapanthus (Blue) | 1 gal $14.85 · 3 gal $44.85 |
| Allamanda (Bush) | 3 gal $44.85 |
| Allamanda (Dwarf) | 3 gal $44.85 |
| Apostle Iris | 3 gal $50.85 |
| Azalea Red & Lav. Formosa, GG Gerb, Fashion | 3 gal $44.85 · 7 gal $97.50 |
| Azalea ENCORE | 3 gal $74.85 |
| Bougainvillea (Standard) | 15 gal $285 · 30 gal $345 · 45 gal $750 |
| Bougainvillea Bush | 3 gal $59.85 · 7 gal $134.85 · 15 gal $239.85 |
| Buddleia (Butterfly Bush) | 1 gal $20.85 · 3 gal $50.85 |
| Bulbine (Yellow) | 1 gal $14.85 |
| Camellia | 3 gal $89.85 · 7 gal $197.85 · 15 gal $299.85 |
| Canna Lily | 1 gal $20.85 · 3 gal $59.85 |
| Cigar Plant | 3 gal $44.85 |
| Clerodendrum - Starburst | 3 gal $50.85 |
| Crinum Lily: Queen Emma & Green | 3 gal $89.85 · 7 gal $195 · 15 gal $255 |
| Crossandra | 3 gal $44.85 |
| Desert Rose | 3 gal $59.85 · 7 gal $112.50 |
| Dipladenia Bush (Red, Pink, White) | 3 gal $59.85 |
| Duranta - Purple Shower (Standard) | 7 gal $165 |
| Fire Bush (Dwarf) | 3 gal $44.85 |
| Fire Cracker | 3 gal $44.85 |
| Gardenia (Dwarf Bush, Frost proof) | 3 gal $50.85 · 7 gal $127.50 |
| Gardenia (Regular Bush) | 3 gal $50.85 · 7 gal $135 |
| Gardenia (Standard) | 7 gal $135 · 15 gal $165 · 30 gal $585 |
| Hibiscus Bush (Basic) | 3 gal $50.85 · 7 gal $112.50 |
| Hibiscus Bush (Fiesta) | 3 gal $50.85 |
| Hibiscus Bush (Hollywood) | 3 gal $59.85 |
| Hibiscus Standard (Basic) | 7 gal $120 · 15 gal $405 |
| Hibiscus Standard (Premium & Fiesta) | 7 gal $135 |
| Ixora (Dwarf Taiwanese) | 3 gal $44.85 |
| Ixora (Dwarf Yellow) | 3 gal $44.85 |
| Ixora (Maui Red) | 3 gal $44.85 · 7 gal $97.50 |
| Ixora (Yellow) | 3 gal $44.85 |
| Jasmine - Night Blooming | 3 gal $44.85 |
| Jatropha | 3 gal $44.85 · 7 gal $135 · 15 gal $330 |
| Jatropha (Standard) | 7 gal $209.85 · 15 gal $509.85 |
| Lantana (Assorted) | 1 gal $14.85 |
| Mexican Heather (Purple) | 1 gal $17.85 |
| Mexican Petunia (Dwarf Purple, Pink, White) | 1 gal $14.85 |
| Mexican Petunia (Regular Purple) | 1 gal $14.85 · 3 gal $44.85 |
| Milkweed | 1 gal $20.85 · 3 gal $44.85 |
| Oleander - Calypso (Dark Pink) | 3 gal $50.85 · 30 gal $555 |
| Oleander - Cardinal Red (Multi-trunk) | 3 gal $44.85 · 30 gal $555 |
| Oleander - Cardinal Red (Shrub) | 3 gal $44.85 |
| Oleander - Petite Pink (Shrub) | 3 gal $44.85 |
| Oleander - White | 3 gal $44.85 |
| Oleander (Standard) | 7 gal $105 |
| Panama Rose | 3 gal $44.85 |
| Pentas (Red, White, Pink) | 1 gal $14.85 |
| Plumbago (Blue) | 3 gal $44.85 |
| Plumbago (White) | 3 gal $44.85 |
| Plumeria | 3 gal $59.85 · 7 gal $179.85 |
| Porterweed (Blue & Red) | 1 gal $14.85 · 3 gal $50.85 |
| Rose - Knock Out: Dbl Red, Dbl Pink, Sun Yellow | 3 gal $68.85 |
| Rose - Drift Rose | 3 gal $83.85 |
| Ruellia (Purple & White) | 3 gal $44.85 |
| Society Garlic | 1 gal $14.85 |
| Soiree (Pink, White & Lavender) | 1 gal $14.85 |
| Thryallis | 1 gal $17.85 · 3 gal $44.85 |
| Tibouchina (Dwarf) | 3 gal $44.85 |
| Tibouchina (Regular) | 3 gal $44.85 |
| Tibouchina (Standard) | 7 gal $120 |

## Tropicals (36)

| Plant | Sizes — retail price each, installed |
|---|---|
| Bird of Paradise (Orange) | 7 gal $97.50 · 15 gal $165 |
| Bird of Paradise (White) | 7 gal $97.50 · 15 gal $165 · 30 gal $345 · 45 gal $585 |
| Bromeliad | 3 gal $44.85 · 7 gal $97.50 · 15 gal $195 |
| Cordyline - Auntie Lou | 3 gal $44.85 |
| Cordyline - Australis | 3 gal $44.85 |
| Cordyline - Black Magic | 3 gal $44.85 · 7 gal $97.50 |
| Cordyline - Exotica | 3 gal $44.85 · 7 gal $134.85 |
| Cordyline - Glauca (Green) | 3 gal $44.85 |
| Cordyline - Maria | 3 gal $44.85 |
| Cordyline - Red Sensation | 3 gal $44.85 |
| Cordyline - Red Sister | 3 gal $44.85 · 7 gal $98.85 |
| Croton - Gold Dust | 3 gal $44.85 · 7 gal $128.85 |
| Croton - Magnificent | 3 gal $50.85 · 7 gal $128.85 |
| Croton - Mammy | 3 gal $44.85 · 7 gal $112.50 |
| Croton - Petra | 1 gal $22.50 · 3 gal $44.85 · 7 gal $112.50 |
| Dracaena (Carmen) | 3 gal $50.85 |
| Dracaena (Lemon Lime) | 3 gal $50.85 |
| Dracaena (Warneckei) | 3 gal $50.85 |
| Dracaena (Marginata) | 3 gal $50.85 |
| Dracaena (Song of India) | 3 gal $44.85 |
| Elephant Ear | 3 gal $50.85 · 7 gal $135 · 15 gal $225 |
| Fern (Asparagus) | 3 gal $44.85 |
| Fern (Foxtail) | 3 gal $44.85 |
| Fern (Kimberly/Boston) | 1 gal $20.85 · 3 gal $44.85 |
| Fern (Macho) | 1 gal $20.85 · 3 gal $44.85 |
| Fiddle Leaf Fig | 3 gal $50.85 · 7 gal $180 · 15 gal $345 |
| Ginger (Triostar) | 3 gal $50.85 |
| Ginger (Variegated) | 3 gal $50.85 |
| Heliconia (Orange) | 3 gal $59.85 |
| Spathiphyllum (Peace Lily) | 1 gal $20.85 · 3 gal $74.85 |
| Sanchezia (Zebra Plant) | 3 gal $50.85 |
| Snake Plant (Sansevieria) | 3 gal $50.85 |
| Split Leaf | 3 gal $50.85 · 7 gal $97.50 |
| Staghorn | 3 gal $59.85 |
| Succulents (Mixed Varieties) | 2" $10.50 · 4" $19.50 · 6" $28.50 |
| Xanadu | 3 gal $50.85 · 7 gal $97.50 |

## Grasses (11)

| Plant | Sizes — retail price each, installed |
|---|---|
| Aztec Grass | 1 gal $14.85 |
| Fakahatchee (Dwarf) | 3 gal $44.85 |
| Fakahatchee (Regular) | 3 gal $44.85 |
| Lemon Grass | 3 gal $44.85 |
| Liriope (Super Blue) | 1 gal $14.85 · 3 gal $44.85 |
| Mondo Grass (Dwarf) | 1 gal $14.85 |
| Muhly Grass | 3 gal $44.85 |
| Pampas Grass | 3 gal $44.85 · 7 gal $97.50 |
| Red Fountain Grass | 3 gal $44.85 |
| Sea Oats | 3 gal $44.85 |
| White Fountain Grass | 3 gal $44.85 |

## Groundcover (11)

| Plant | Sizes — retail price each, installed |
|---|---|
| Blue Daze | 1 gal $14.85 |
| Flax Lily | 1 gal $14.85 · 3 gal $44.85 |
| Jasmine Minima (Green) | 1 gal $14.85 |
| Jasmine Minima (Summer Sunset) | 1 gal $14.85 |
| Jasmine Minima (Variegated) | 1 gal $14.85 |
| Joseph's Coat | 1 gal $14.85 · 3 gal $44.85 |
| Juniper - Blue Pacific | 3 gal $44.85 |
| Juniper - Parsonii | 3 gal $44.85 |
| Oyster Plant (Bi-Color) | 1 gal $14.85 |
| Oyster Plant (Tri-Color) | 1 gal $14.85 |
| Perennial Peanut | 1 gal $14.85 |

## Vines (9)

| Plant | Sizes — retail price each, installed |
|---|---|
| Bougainvillea Trellis | 3 gal $74.85 · 7 gal $195 · 15 gal $345 · 30 gal $885 |
| Honeysuckle Staked (Coral) | 3 gal $68.85 |
| Jasmine - Confederate (Green & Variegated) | 1 gal $14.85 · 3 gal $44.85 |
| Jasmine - Confederate (Staked) | 3 gal $59.85 |
| Jasmine - Downy | 3 gal $44.85 |
| Jasmine - Star | 3 gal $44.85 |
| Jasmine - Sweet (Standard) | 7 gal $105 |
| Mandevilla Trellis (Red, Pink, White) | 3 gal $80.85 |
| Mexican Flame Vine | 3 gal $50.85 |

## Fruit Trees (3)

| Plant | Sizes — retail price each, installed |
|---|---|
| Banana - fruit bearing (Double Mahoi) | 3 gal $44.85 · 7 gal $89.85 · 15 gal $134.85 |
| Loquat - fruit bearing | 15 gal $239.85 · 30 gal $555 |
| Mulberry - fruit bearing (Everbearing) | 7 gal $120 · 15 gal $255 · 30 gal $555 |

## Topiary (3)

| Plant | Sizes — retail price each, installed |
|---|---|
| Eugenia Topiary (2 ball) | 3 gal $105 · 7 gal $225 |
| Eugenia Topiary (3 ball) | 3 gal $120 · 7 gal $255 |
| Podocarpus Topiary / Trellis | 15 gal $509.85 · 30 gal $1,050 |

## Bed fills (priced per sq ft of bed, installed)

From `BED_FILLS` in `src/lib/landscape/landscapeEstimate.ts`. A bed's price
is its area × (fill rate + $0.75/sq ft bed prep, soil amendment and haul-off),
plus edging where the design has it.

| Fill | Rate |
|---|---|
| Pine bark mulch | $1.35/sq ft |
| Black mulch | $1.55/sq ft |
| Crushed shell | $2.10/sq ft |
| River rock | $4.25/sq ft |
| Lava rock | $3.75/sq ft |
| St. Augustine sod | $1.15/sq ft |
| Planting bed only (prepared soil, no fill) | $0.85/sq ft |

Landscape rates Genius may quote (same source):

- Bed edging, installed: **$6.50 per ft**
- Irrigation (drip / bubbler zone extension): **$14 per plant**
- Mulch read-out assumes 3 in depth
- Landscaping design packages (from `products-more.md`): **Full Yard Makeover $15/sq ft**; **Luxury Landscaping $20+/sq ft**; Themed Patio priced by the designer

## Designed looks (the /landscaping starting points)

From `LANDSCAPE_LOOKS` in `src/lib/landscape/presets.ts` — recipes of real
catalog plants and bed fills, applied to a yard or around a drawn pool:

| Look | What it is |
|---|---|
| Tropical Poolside | Palms, bird of paradise and bold foliage framing the water; mulch beds |
| Modern Minimal | River-rock beds, grasses in rhythm, one sculptural tree (crape myrtle) |
| Coastal Native | Salt-hardy Florida natives, crushed-shell beds, coco plum hedge |
| Formal Topiary | Clipped podocarpus hedges, symmetry, black-mulch structure |
| Themed Patio | Green walls, luxury design, matured trees — composed with an agent (agent-quoted) |

Planting plans also draw on `src/lib/landscape/plantSpecs.ts` for each
plant's mature canopy, height and spacing — see `scale-table.md` and
`placement-law.md` in this pack for how Genius must size and site them.
