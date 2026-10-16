# Design Studio + 3D Studio: Finish-Everything Plan

## Missing steps from this session

1. **Per-pool tile size controls** – each extra pool/spa defaults to main-pool texture scales, but the header has no control to change finish, coping, waterline or deck scale for the selected body.
2. **Waterline pricing** – extra pool/spa waterlines are not priced. New rule: **$4,500 flat per pool or spa waterline** (main pool included, one charge per body).
3. **Quote pictures and descriptions** – quotes sent from the studios don't use the real product photos and descriptions from the main site for everything in the scene.
4. **2D Draw Deck → canonical deck state** – drawn decks render with the pool-deck slab in 3D, but in 2D they still sit in a separate list and don't use the pool's `setDeck` path. Edit and erase behave differently from the pool deck.
5. **Not tested in the browser** – these were never clicked through end to end: extra pools/spas in 3D, the body picker, per-body water toggle, Genius named-body edits, vinyl fence colors, curved splines (outward and flipped), and the Back to 2D button.
6. **Extra-body leftovers** – check for green lines at the waterline, gaps between coping and deck, and straight vs. curved points on Pool 2+ against the main pool, using the same densified outline.
7. **Rates still pending** – extra pool/spa shells use a temporary $250/sqft until you confirm the real rates.

## What gets built

### A. Per-body texture scale (header)
- The header body picker (Main / Pool 2 / Spa 1…) already targets the active body. Add a **Tile size** popover with four sliders: Finish, Coping, Waterline, Deck. They write to that body's `SceneScales` override.
- Each slider has a "Match main pool" reset. With no override, the body keeps following the main pool.
- Genius gets the same option: "make Spa 1 coping tiles bigger".

### B. Waterline pricing
- Add `WATERLINE_FLAT_PER_BODY = 4500` to the shared site rate list (one source).
- `board3DTakeoff.ts` adds one "Waterline tile – {body}" line per pool/spa that has a waterline finish. The header take-off and the quote use the same lines.

### C. Quotes use main-site images and descriptions
- New resolver `lib/design/sceneQuoteCatalog.ts`. It maps every take-off line (pool model, finish, coping, waterline, pavers/deck, turf, fence type, screen, spa) to its product entry in the existing catalog/search index (the same source as the main page). It returns that entry's image import (webp) and description.
- The quote hand-off from the 2D and 3D studios passes `{ image, description }` per line. The quote layout and styles stay exactly as they are; only the data feeding them changes.
- Anything without a catalog match shows its name only, with no made-up photo.

### D. Drawn deck = pool deck everywhere
- In 2D, Draw Deck creates entries in PoolBuilder's deck collection (the same structure and edit handles as the attached deck). The pool's own deck is never overwritten.
- The `SiteElementsLayer` deck list becomes a read view of that collection, so right-click edit, move, texture and erase all go through one path.
- The 3D cut order stays the same: turf, then drawn decks, then the pool's own deck last.

### E. Extra-body parity check
- Extra bodies use the same densified ring for shell, coping, waterline and deck cut. Make sure the green lawn cut uses the coping's outer mitred ring, so no grass shows at the waterline.

### F. End-to-end check (browser)
- Draw a main pool, Pool 2 (curved), Spa 1, two decks, turf, and a vinyl fence. Then switch to 3D and:
  - check every body renders correctly
  - use the picker and focus the camera on each body
  - toggle water, change depth and change tile size per body
  - ask Genius to edit Spa 1
  - check the take-off total includes 3 × $4,500 waterline
  - open the quote and confirm each line has the right photo and description
  - press Back to 2D

## Technical details
- Files: `StudioDock.tsx` (tile size popover), `board3D.ts` (`Water3D.scales?`), `BoardElements3D.tsx` (reads per-body scales), `board3DTakeoff.ts` plus the site rate lists (waterline), new `sceneQuoteCatalog.ts`, the studio → quote hand-off, PoolBuilder deck collection, `SiteElementsLayer.tsx`, and `siteElementsTo3D`.
- Save the $4,500 waterline rule to project memory, and update `designStudio/AGENTS.md` with the deck-collection and quote-catalog rules.
- No product images, quote styles or card outlines get changed. Credits: Imagine Engine Studios Corp headers in new files.

## Open item
- Real per-sqft rates for extra pool/spa shells (currently a temporary $250/sqft).
