# Screen Enclosure: Full Configuration Into Cart, Quote, and a Drawing Snapshot

## What's broken today (verified in code)

- `EnclosureConfigurator` reports only two numbers up to the studio: `onTotalChange(total, { areaSqFt, perimeterFt, description })`, stored as `selectedExtras.enclosureTotal` + `categoryQuantity`. Nothing about type, roof, extrusion, screen fabric, doors, add-ons, wind/HVHZ, or engineering leaves the component.
- `buildCurrentExtras()` in `WonderlandsStudio.tsx` only builds pool-style extras (finish, heater, liner, pavers, the legacy `screenEnclosure` checkbox, etc.). For a standalone screen-enclosure product it returns an empty array, so `handleAddToCart` adds one line with `extras: []` — the cart shows no features and nothing is editable or removable.
- The quote receives `pool.price = selectedProduct.price`, which for a screen enclosure is the catalog **$/sq ft rate** ($22), plus an empty `extrasBreakdown`. That is exactly what the open quote shows: "Base Price: $22 / Total Investment $22".
- The drawn footprint lives only inside `EnclosureDrawingBoard`'s canvas; nothing is exported, so no quote or cart can show it.

## What to build

### 1. Enclosure reports its full configuration
Extend the configurator's callback payload from a bare total to a structured project object:
- Header numbers: footprint area, perimeter, screen wall length, longest span, wall/mean roof height, wind speed, exposure, HVHZ flag, design pressure.
- One line per configured element, each with a label, a human description, and its price contribution (derived from the existing estimate's itemization so the parts always sum to the estimate total):
  - Structure type (mansard / gable / super gable / 2-story / screen room)
  - Roof assembly (screen, Florida glass band, insulated pan)
  - Aluminum extrusion / structural profile
  - Screen fabric (brand, mesh, warranty)
  - Each door type with quantity and self-latching/barrier status
  - Each selected add-on with its quantity/measure basis
  - Engineering, drawings, permits and inspections
  - Mobilization, equipment, site conditions
- The compliance result (errors/warnings/notes) and the installer/permit spec rows, so the quote can print the technical scope.
- A PNG snapshot of the drawing board plus its takeoff numbers when a footprint has been drawn.

### 2. Drawing snapshot
Add a snapshot export to `EnclosureDrawingBoard`: after each render it produces a data-URL of the canvas (footprint, dimensions, doors, house line, labels) and reports it upward with the takeoff. The configurator caches it with the rest of the config (existing `localStorage` cache) so it survives reloads, and passes it along in the payload. If nothing has been drawn, no snapshot is emitted and the manual-area path still works.

### 3. Cart: every element as its own editable line
In `WonderlandsStudio.tsx`, when the selected product is a screen enclosure, build the cart extras from the enclosure payload instead of the pool feature list:
- Each configuration element above becomes a cart extra with its own name, description and price, so each one can be individually removed or quantity-edited like any other feature.
- Where the element has alternatives (structure type, roof, extrusion, screen fabric, door models), attach the option list so the existing cart dropdown can swap it — a swap writes back into the configurator state and the price recalculates live through the estimator.
- Removing a required element from the cart clears it in the configurator (e.g. drop an add-on, drop a door), keeping the two views in sync via the existing live-sync effect.
- The base cart line becomes the engineered shell (structure + screen + labor), priced as the estimate total minus the itemized extras, so the cart total still equals the configurator total exactly.
- The drawing snapshot rides on the cart item so it can be shown in the cart panel as a small thumbnail and carried into checkout.

### 4. Quote: real total, full description, snapshot
- Pass the enclosure project as the quote's product so the base price is the engineered project total, never the $/sq ft rate. Product line reads e.g. "Mansard Pool Cage — 1,240 sq ft footprint" with dimensions/perimeter in place of pool dimensions/depth.
- Feed the itemized elements as the quote's extras breakdown, each with its description, so the quote document lists everything that was configured and the amounts sum to the project total.
- Add an enclosure specification block to the quote document: structure and code data (wind speed, exposure, design pressure, HVHZ, sealed-drawings requirement), screen fabric and warranty, doors and barrier compliance, and the engineering/permit scope.
- Render the drawing snapshot in the quote document under a "Footprint Plan" heading, sized for print, and omit the whole block when no drawing exists.
- All of this stays inside the existing quote layout and print styles — no restyling of the quote.

## Technical notes

- Files touched: `src/components/enclosure/EnclosureDrawingBoard.tsx` (snapshot export), `src/components/enclosure/EnclosureConfigurator.tsx` (richer `onProjectChange` payload), `src/data/screenEnclosureConfigurator.ts` (expose the itemization as labelled elements with option lists — calculation logic unchanged), `src/pages/WonderlandsStudio.tsx` (enclosure-aware `buildCurrentExtras`, cart item, quote props), `src/components/SurveyQuoteTool.tsx` (enclosure spec block + footprint image, additive rendering only).
- The existing `onTotalChange` contract stays working so the fence configurator and other standalone categories are unaffected.
- Snapshot is stored as a compressed data URL; if `localStorage` rejects the size, the config still saves and only the image is dropped.
- Prices are always derived from `estimateEnclosure`, so the cart, the studio total and the quote cannot drift from the configurator.
