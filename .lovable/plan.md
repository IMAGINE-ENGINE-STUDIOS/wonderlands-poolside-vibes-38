# Screen Enclosure Studio — Professional Redesign + 2D Drawing Board

Rebuild the Screen Enclosure configurator in Wonderlands Studio to the same professional standard as the Aluminum Fence configurator: a top-view 2D drawing board, a spec-driven configuration panel, Florida-code compliance checks, and printable installer / architect / permit sheets.

## What the user gets

**1. 2D Studio Drawing Board (top view)**
- Same canvas conventions as the pool 2D studio and fence board: 10px = 1 ft, 1 ft snap grid, click to place corners, drag corners to reshape, close the shape to form the cage footprint.
- Live readouts: enclosed area (sq ft), perimeter (linear ft), wall panel count, corner count, longest clear span.
- Mark segments as: screen wall, kick-plate wall, door opening, or attached-to-house wall (no framing/screen charged on house-attached runs).
- Optional pool/deck outline reference so the cage can be traced around the pool.
- Rectangle preset (W × L) for fast starts, plus reset/undo.

**2. Professional configuration panel**
- Enclosure type: standard screen room, mansard, gable, super-gable, 2-story.
- Height / eave height, roof pitch, and roof style (mansard, gable, hip flat-pan).
- Frame: extrusion size (2x2, 2x3, 2x4, 2x5, 2x6), wall thickness (0.044 / 0.055 / 0.070), Super Gutter, chair rail, kick plate.
- Screen: 18/14 standard fiberglass, no-see-um, Florida Glass, Super Screen, TuffScreen, pet-resistant — with light/airflow notes.
- Doors: single swing, double swing, sliding, pet door — each with FBC self-closing/self-latching requirement flag when the cage acts as the pool barrier.
- Quality tier stays tied to existing catalog pricing ($22 / $24 / $26 per sq ft) so the studio, cart, search and quote prices remain in sync; frame/screen/door/add-on upcharges are added on top explicitly and itemized.

**3. Compliance + permit output (Florida)**
- Checks: pool-barrier requirements (48" min barrier, self-closing/self-latching doors, no climbable gaps) per FBC-R R4501.17 / F.S. 515; wind-load design pressure by exposure and wind speed zone (ASCE 7, Risk Category II) including HVHZ; screen-enclosure allowance as an "open structure"; setback and drainage notes.
- Warnings surface inline as compliance items (no red production error styling), each with the code reference.

**4. Three professional spec sheets (printable)**
- Installer: footing/anchor schedule, tapcon spacing, extrusion sizes, spans, panel schedule from the drawn segments, screen splice notes.
- Architect / engineer: design wind pressures, span tables used, member sizes, roof pitch, load path to slab, drawing notes.
- Permit submittal: required documents (site plan, engineered drawings, Florida Product Approval / NOA numbers, energy/barrier affidavit), plus the calculated footprint and areas.
- Print action reuses `window.print()` (same pattern as the quote tool).

**5. Studio integration**
- Configurator total feeds the studio total, cart line item, instant quote, and checkout exactly like the fence configurator does — one itemized line with the sq-ft footprint plus itemized add-ons.
- Existing pool-feature "Screen Enclosure" add-on (`screenEnclosure*` extras) keeps working unchanged; this redesign applies to the standalone Screen Enclosures category.

## Technical notes

- New `src/data/screenEnclosureConfigurator.ts` — types, option catalogs (types, roof styles, extrusions, screens, doors, add-ons), pricing math, `checkEnclosureCompliance()`, `buildEnclosureSpec()` returning the three spec sheets. Mirrors `src/data/fenceConfigurator.ts`.
- New `src/components/enclosure/EnclosureDrawingBoard.tsx` — canvas top-view board at 10px/ft with grid snap, corner drag, segment typing, and area/perimeter geometry (shoelace for area). Mirrors `FenceDrawingBoard.tsx`.
- New `src/components/enclosure/EnclosureConfigurator.tsx` — tabs for Draw / Configure / Specs & Permits, `onTotalChange(total, summary)` callback. Mirrors `FenceConfigurator.tsx`.
- `src/pages/WonderlandsStudio.tsx` (~line 2105) — extend the standalone-category branch: render `EnclosureConfigurator` when `selectedProduct.type === 'screen-enclosure'`, storing `enclosureTotal` + `categoryQuantity` (sq ft) in `selectedExtras`, and include `enclosureTotal` in total/cart/quote calculations alongside the existing `fenceTotal` handling.
- Base per-sq-ft rates read from `studioScreenEnclosures` in `src/data/studioCategoryProducts.ts` — no price changes to existing catalog values.
- Styling uses existing semantic tokens only; product images untouched.
