# Pebble Tec swatch → pop-up product flip book

Clicking a Pebble Tec finish swatch on the main page currently only fires an optional `onSelect` callback, so nothing opens. This plan makes each swatch open the product flip book as an overlay on top of the finishes view, and makes the arrow past the last page continue into the next finish down the list.

## What the user gets

1. Click any Pebble Tec swatch → the product dossier flip book opens as a pop-up widget over the page (dimmed, blurred backdrop; the page stays where it was underneath). Close with the X or Escape.
2. The book contains that finish: plate photograph, collection, "concrete shells only" note, surface-area pricing line, the finish visualiser tool page, and the order page — the same dossier layout used everywhere else in FLIP.
3. On the last page, pressing Next (arrow button, keyboard right arrow, or corner flip) does not dead-end: it loads the **next finish in the same list order** and reopens the book at page 1. Likewise Previous on the first page steps back to the previous finish, so the reader can walk the whole collection without leaving the pop-up.
4. Order follows the list exactly as displayed (current collection filter respected, same sequence, no shuffling).

## Technical notes

- `src/components/PebbleTecConcreteFinishes.tsx`
  - Add local state for the open finish index and build a flat, memoised array of the currently visible finishes (collection filter applied, same order as rendered) so the index maps 1:1 to what the reader sees.
  - Swatch `onClick` keeps calling the existing `onSelect` prop and additionally opens the book.
  - Render `FlipProductBook` in overlay mode (its default, non-`inline`) when an index is set, mapping the finish into the existing `ConsoleEntry` shape (`id`, `name`, `image`, `color` fallback for the swatch, `priceLabel` from `PEBBLE_TEC_PRICE_LABEL`, `brand: "Pebble Tec"`, `meta` from the finish note) and a `ProductBookCategory` of `{ id: "finishes", label: "<collection> — Pebble Tec" }` so the existing `TOOLS.finishes` visualiser page is used.
  - Pass a `key` derived from the finish id so the book remounts (page resets to 0) when advancing.
- `src/components/flip/FlipProductBook.tsx`
  - Add two optional props, `onNextEntry` / `onPrevEntry`. When present and the reader is on the final page, the Next control (button, ArrowRight handler, and `onFlip` end detection) calls `onNextEntry()` instead of doing nothing; symmetrically for Previous on page 0.
  - Existing behaviour is untouched when the props are absent, so the magazine and dossier edition consumers are unaffected.
- No pricing, data, or product-image changes; no changes to the card outline or quote styling.
