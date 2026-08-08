# Screen Enclosure: Full Itemization in Cart and Quote

Goal: every choice made in the screen enclosure configurator reaches the shopping list and the quote, clearly described, editable, removable — plus the drawn footprint as an image on the quote.

## What the customer gets

- The shopping list shows the enclosure as separate lines instead of one lump total: structure, aluminum extrusion profile, screen fabric, roof assembly, each door, super gutter and other add-ons, plus engineering/drawings/permits and mobilization.
- Each line can be swapped for an alternative (different fabric, profile, roof type), have its quantity changed (doors), or be removed. Prices update live.
- Editing a line in the shopping list changes the configurator itself, so the drawing, specs and totals stay in sync.
- The quote replaces pool content with an "Enclosure Specifications" block: structure type, extrusion, framed/screen area, wall height, longest span, design wind speed and pressure, HVHZ status, door count, Florida pool-barrier note.
- If a footprint was drawn, a snapshot of the plan is embedded in the quote under "Footprint Plan".
- Quote header and title read "Screen Enclosure Quotation" rather than "Pool Quotation", and pool-only inclusions/policies are omitted.
- Enclosure line items render as clean scope rows with no unrelated stock photo.

## Technical notes

- `src/data/screenEnclosureConfigurator.ts`: `estimateEnclosure` returns an `elements[]` breakdown (key, label, detail, amount, kind, quantity, removable, selectable options) alongside the totals.
- `src/components/enclosure/EnclosureConfigurator.tsx`: reports a full `EnclosureProject` (specs, compliance, elements, snapshot) upward and exposes an imperative `EnclosureEditApi` (`setElementOption`, `setElementQuantity`, `removeElement`) so cart edits drive the configurator.
- `src/components/enclosure/EnclosureDrawingBoard.tsx`: `onSnapshot` exports the 2D plan as a PNG data URL.
- `src/pages/WonderlandsStudio.tsx`: holds `enclosureProject` state and `enclosureApiRef`; maps elements into cart extras (`enc:<key>`) and into the quote extras breakdown.
- `src/components/StudioCartWidget.tsx` / `ShoppingCart.tsx`: extras support `selectedOption`, `quantity`, `options[]`; option dropdowns hide zero prices.
- `src/components/SurveyQuoteTool.tsx`: category-aware titles and inclusions, enclosure spec block with snapshot, and no fallback image for enclosure scope rows.

## Status

This work is implemented and verified end to end (footprint drawn, elements itemized in the shopping list, quote generated with the specs block and footprint snapshot). Approving confirms the scope above as the intended behaviour; no further changes are queued.
