# pools/

All pool product photography. **Brand scoping is a hard rule**: a product book, card
or quote may only show imagery of that exact model from that exact brand. Never fall
back to another pool's photo, and never use finish swatches as a product photo — use a
text-only layout instead (see `src/lib/flipProductGallery.ts`).

## Subfolders (one per brand)

- `wonderlands/` — **Wonderlands World** custom concrete (gunite) pools: Maxima,
  Madre Perla, Pacific Ridge, Cape Coral/Wonderpalace. Our own brand and the flagship
  pool category.
- `latham/` — **Latham** fiberglass models: Apollo, Ariel, Astoria, Axiom, Bermuda,
  Cancún Deluxe, Cape Cod, Coral, Enchantment, Fiji, Genesis, Jamaica, Olympia,
  St. Lucia, Synergy, Tuscan, Valencia.
- `glimmerglass/` — **GlimmerGlass** fiberglass models, filenames prefixed `gilmer-*`
  (Serafina, Aloha, Atlantis, Regal, Roman, Ponce XL, ...). Gelcoat finishes are
  exclusive to this brand.
- `shapes/` — unbranded shape/style reference photos; never shown as a named product.

Brand truth is `src/data/poolProductLookup.ts` (`brand` field). Folder = brand, always.

History / notes:

- The old `kits/` folder was removed: Cancún Deluxe went to `latham/`, Maxima to
  `wonderlands/`, and the Castle Rock / Serenity / Sunset Grove "kits" to
  `../water-features/waterfalls/` because they are waterfalls, not pools.
- The interim `concrete/` folder was folded into `wonderlands/` — concrete *is* the
  Wonderlands brand line, so there is no separate concrete folder.
- The stray `latham-cape-cod-12.jpg` was deleted; Cape Cod 12 uses `latham/cape-cod.webp`.

## Consumers

`src/data/poolProductLookup.ts`, `src/data/gilmerPools.ts`, the FLIP product books,
Wonderlands Studio, the Quote Atelier console and the Genius product knowledge base —
all of which read pricing/images from the same lookup so Studio, FLIP and quotes stay
in sync (pool shell base $250/sqft, 3.5x multiplier).
