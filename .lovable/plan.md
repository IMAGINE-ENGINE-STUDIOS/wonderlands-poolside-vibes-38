# Landscaping Studio — full revamp

Done already: the "Life Warranty" and "Fiber Construction" buttons are removed from the Glimmerglass section.

## Goal
Turn the landscaping section and the /landscaping page into one landscaping studio, built from the tools the site already has: the planting drawing board, the plant catalog, Genius, the 3D studio, the quote and the cart.

## Experience (one studio, four chapters)

```text
[ I. Inspire ] -> [ II. Design ] -> [ III. Choose plants ] -> [ IV. Estimate & book ]
```

1. **Inspire** — editorial opening with looks you can start from (Tropical Poolside, Modern Minimal, Coastal Native, Formal Topiary, Themed Patio). Picking one loads a starting plan on the board.
2. **Design** — the existing planting drawing board, embedded full width:
   - draw beds (mulch, shell, rock, sod), set plants, sweep drifts, hedge runs, mass-plant a bed
   - "Import my pool / yard" pulls the pool and deck outline from the 2D designer so planting fits around them
   - "View in 3D" opens the plan in the 3D studio, with trees and palms at real size compared to the pool
   - live take-off strip: bed sq ft, edging ft, mulch cu yd, plant count, irrigation points
3. **Choose plants** — the catalog redesigned as a filterable library:
   - filters: category, sun/shade, height, salt tolerance, flowering, pet safe, price
   - each card keeps its photo and outline; adds mature size, spacing, bloom color chip
   - "Place on plan" (drops onto the board) and "Add to quote"
   - plant detail sheet with container sizes and pricing
4. **Estimate & book** — the existing ledger rebuilt around the drawing:
   - service tiers stay (Themed Patio by agent, Full Yard Makeover $15/sq ft, Luxury $20+/sq ft)
   - lines filled automatically from the plan: plants by species and size, bed surfaces, edging, prep, irrigation
   - Print / PDF in the existing quote style, Add to cart, Submit, Book a consult (Calendly link)

**Genius for landscaping** — a bar on the board: "plant a privacy hedge along the back fence", "add three palms by the pool", "make it low-maintenance". Genius edits only what was asked, places real catalog plants at real spacing, and explains choices. Runs on Groq.

**Showroom** — a landscaping widget with a starting screen, like the 2D and 3D ones.

## Pages
- Home section: compact version (Inspire + catalog preview + "Open the studio").
- /landscaping: full studio, all four chapters, plan saved automatically and per account.

## Technical details
- Reuse `LandscapeDrawingBoard`, `landscapeEstimate.ts`, `plantSpecs.ts`; no new canvas engine.
- Add `landscaping` discipline to `quoteDisciplines.ts` (title, inclusions, warranties: plant establishment, irrigation, workmanship). Quote styling untouched.
- Filters derive traits from `plantSpecs` (height, form) plus a small keyword table for salt/sun/pet-safe.
- Look presets = static layouts in `src/lib/landscape/presets.ts`.
- Pool import reads the shared design project (`globalDesignProject.ts`); 3D handoff via `SceneConverter` using `realScale.ts` sizes.
- Genius: new `landscape-genius` edge function on Groq returning edit ops (add/remove plantings, beds, fills); local phrase parser as fallback.
- Plan persisted with `usePersistentState`, synced for signed-in users.
- Heavy board and 3D lazy-loaded; catalog virtualized for speed. Product images, card outlines and catalog order unchanged.

## Needs your input
- Prices for irrigation, edging and bed prep are the current ones in the code; tell me if they should change.
