# pools/

All pool product photography. **Brand scoping is a hard rule**: a product book, card
or quote may only show imagery of that exact model from that exact brand. Never fall
back to another pool's photo, and never use finish swatches as a product photo — use a
text-only layout instead (see `src/lib/flipProductGallery.ts`).

## Subfolders

- `glimmerglass/` — GlimmerGlass fiberglass models, filenames prefixed `gilmer-*`
  (Serafina, Aloha, Atlantis, Regal, Roman, Ponce XL, ...). Moved here out of the
  loose `src/assets` root so brand imagery is no longer mixed with tool screenshots.
  GlimmerGlass has its own finish set (gelcoat is GlimmerGlass-exclusive).
- `concrete/` — Wonderlands custom concrete (gunite) models, e.g. Maxima. Concrete is
  the flagship pool category and the one the pool books open on.

Removed: the old `kits/` folder. It mixed unrelated products, so its contents were
re-homed — Cancun Deluxe moved to this folder, Maxima to `concrete/`, and the Castle
Rock / Serenity / Sunset Grove "kits" to `../water-features/waterfalls/` because they
are waterfalls, not pools. The stray `latham-cape-cod-12.jpg` was deleted and Cape Cod
12 now imports `cape-cod.webp` from this folder.

## Flat files (root of this folder)

Latham and Wonderlands model photography, one set per model with optional variants:

- `<model>.webp` — primary/hero shot used on cards and the product book cover.
- `<model>-main` / `-perspective` / `-installed` / `-gallery-N` — additional angles for
  product book spreads.
- `<model>-specs` — the manufacturer spec/dimension drawing.
- `<model>-optimized` / `-new` — newer or size-optimized re-exports; prefer these.

Model families present: Apollo, Ariel, Astoria, Axiom, Bermuda, Cape Cod, Coral,
Enchantment (917/921/924), Fiji, Genesis, Jamaica, Madre Perla, Olympia, Pacific Ridge,
St. Lucia, Synergy, Tuscan (1120/1324/1427), Valencia, Wonderpalace, plus generic shape
references (`freeform-beach-entry`, `geometric-luxury`, `kidney-spa-modern`,
`l-shaped-elegant`) used only for shape/style illustration, never as a named product.

## Consumers

`src/data/poolProductLookup.ts`, `src/data/gilmerPools.ts`, the FLIP product books,
Wonderlands Studio, the Quote Atelier console and the Genius product knowledge base —
all of which read pricing/images from the same lookup so Studio, FLIP and quotes stay
in sync (pool shell base $250/sqft, 3.5x multiplier).
