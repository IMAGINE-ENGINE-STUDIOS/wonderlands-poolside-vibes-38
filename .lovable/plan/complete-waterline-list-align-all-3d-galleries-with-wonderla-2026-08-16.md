# Complete waterline list + align all 3D galleries with Wonderlands Studio

## What is wrong today

The waterline panel shows only "Ballad" because of a data-shape mismatch, and the 3D galleries are built from hardcoded lists that have drifted from the Studio catalog.

Verified in the code:
- `src/pages/DesignStudio.tsx` (lines ~519-540) builds the waterline list as one hardcoded "Ballad" entry plus `poolLinersData.filter(l => l.type === 'Glass')` and `... l.type === 'Porcelain'`. The liner records in `src/data/consolidatedProducts.ts` have no `type` field — they use `subcategory: "Glass" | "Porcelain" | "Premium Border" | "Italian Stone"`. Both filters return zero rows, so only the hardcoded Ballad tile survives.
- `src/data/consolidatedProducts.ts` actually holds 16 liners (Paradise, Water Lilies, Sail Boat, Stormy, Ballad, Galant, Melody, Soul, Glacier, Tikal, Port Royal, Alexandria, San Marino, Firenze, Naples, Milan) plus 3 pool tiles (Mountain, Carnegie, Panama) and 12 pool finishes.
- `src/components/scene3d/PoolBuilderConverter.ts` (lines ~258-350) hardcodes its own waterline array of 12 entries (missing San Marino, Firenze, Naples, Milan and the 3 pool tiles) and hardcodes "premium liner" finish paths, so the Pool Builder 3D route and the Design Studio route disagree.
- `src/components/Scene3DControlPanel.tsx` (lines ~120-133) filters finishes against hardcoded slugs (`sapphire-blue-g3`, `crystal-blue-g3`, ...) that do not exist in the catalog image URLs, so its finish gallery can come back empty or wrong for a given pool category.

## The fix

1. Create one shared texture-library builder (`src/data/textureLibrary.ts`) derived from the real catalog:
   - `waterlines`: all liners grouped by `subcategory` — Glass, Porcelain, Premium Border, Italian Stone — plus the 3 pool tiles, each keeping name, image, and appropriate roughness/metalness per material family.
   - `finishes`: all `poolFinishes` entries (plus any custom textures already supported).
   - `pavers` / `coping`: all `paverTypes` from `src/data/paverData.ts` (single source, same names as Studio).
   - Entries carry the catalog `id`, `name`, `subcategory` and price so galleries can group and label exactly as the Studio does.
2. Point every consumer at that builder: `DesignStudio.tsx`, `PoolBuilderConverter.buildTextureLibrary`, and the panels (`ComponentControlPanel.tsx`, `Scene3DControlPanel.tsx`). Remove the hardcoded arrays and the broken `l.type` filters.
3. Group the waterline and finish grids by subcategory headings (Glass Tiles, Porcelain Tiles, Premium Border, Italian Stone) so the profile of options matches the Studio's category/product structure instead of one flat list.
4. Replace the invalid slug-based finish filter in `Scene3DControlPanel.tsx` with catalog-id matching, and keep the existing brand rules intact: Wonderlands Collection stays fiberglass-only, gelcoat remains GlimmerGlass-exclusive.
5. Verify in the browser: open the 3D view, select Waterline and confirm all 19 options render with images and correct group labels; then check Pool Finish, Coping and Deck Pavers gallery counts match the Studio catalog counts.

## Notes

Data/wiring only — no pricing changes, no product images changed, no changes to product-card styling or quote layout.
