

# Comprehensive Plan: Deck Spline Editing, Selection Tool & Feature Implementation

## Current State Analysis

**What works:**
- Pool spline points are visible and editable (drawn at lines 2246-2255)
- Hardscape/deck anchor points ARE drawn (lines 2234-2243) as yellow squares
- PointCoordinateEditor exists and shows for both pool points and deck points when selected
- Mouse events handle hardscape point selection and dragging
- Feature types are defined in `featureTypes.ts` with categories: Pool, Landscape, Water Features, Utilities
- `addFeature()` places features but many only render as generic circles or don't render at all

**What's broken/missing:**
1. Deck offset input modifies ALL decks simultaneously -- no deck selection mechanism
2. Many features in the toolbar have `addFeature()` handlers but NO canvas rendering (pool-seat, pool-wall, diving-board, slide, rock, boulder, hedge-row, plant-row, landscape-light, edging, grass-region, pond, stream, waterfall, jumping-jet, sprinkler, water-curtain)
3. The DesignerToolPanel only shows 4 feature buttons (stairs, light, jet, fountain) instead of the full catalog

---

## Implementation Plan

### Phase 1: Deck Selection & Per-Deck Offset Editing

**File: `src/components/PoolBuilder.tsx`**
- Add `selectedDeckId` state: `'main' | poolId | null` to track which deck is selected
- When clicking on deck area, identify which deck was clicked (main hardscape or additional pool's deck)
- Deck offset input in DesignerToolPanel only modifies the selected deck
- Show visual highlight (dashed border) on the selected deck
- Add "Select Deck" mode that highlights clickable deck regions

**File: `src/components/poolBuilder/DesignerToolPanel.tsx`**
- Replace single deck offset input with a "Select a deck to edit" prompt when no deck is selected
- Show deck name/ID and offset input only for the selected deck
- Add a "Select Deck" button that activates deck selection mode

### Phase 2: Comprehensive Feature Rendering on Canvas

**File: `src/components/PoolBuilder.tsx`** (canvas draw section ~lines 2770+)

Add 2D canvas rendering for every feature type that currently lacks it:

**Pool Features:**
- `pool-seat`: Rounded rectangle along pool wall, colored bench shape with depth shading
- `pool-wall`: Raised wall rectangle along pool perimeter with shadow/height indicator
- `diving-board`: Rectangle extending outward from pool edge with spring detail
- `slide`: Curved path from deck into pool with ladder indicator
- `pool-cover`: Semi-transparent overlay on pool area
- `pool-accessory`: Generic icon marker

**Landscape Features:**
- `rock`: Irregular polygon shape with grey/brown fill and texture
- `boulder`: Larger irregular circle with shadow and texture
- `hedge-row`: Long green rectangle with periodic vertical divisions
- `plant-row`: Series of small green circles in a line
- `landscape-light`: Small circle with radial glow effect
- `edging`: Thin line with decorative border pattern
- `grass-region`: Filled green polygon/circle with grass texture dots

**Water Features:**
- `pond`: Elliptical blue shape with ripple rings
- `stream`: Curved blue path with flow arrows
- `waterfall`: Stacked horizontal lines with blue gradient (cascade effect)
- `jumping-jet`: Arc line from deck into pool with droplet dots
- `sprinkler`: Circle with radial spray lines
- `water-curtain`: Vertical blue rectangle with horizontal flow lines

### Phase 3: Full Feature Menu in DesignerToolPanel

**File: `src/components/poolBuilder/DesignerToolPanel.tsx`**
- Replace the 4-button "Features" section with categorized sub-sections matching `featureTypes.ts`:
  - **Pool Structure**: Stairs, Seat, Wall, Diving Board, Slide, Cover
  - **Landscape**: Grass Region, Pathway, Edging, Tree, Shrub, Hedge Row, Plant Row, Rock, Boulder, Path Light
  - **Water Features**: Fountain, Pond, Stream, Waterfall, Deck Jet, Sprinkler, Water Curtain
- Add "Spa" button (attached/detached) using the existing perimeter anchor system
- Each button uses appropriate Lucide icon and triggers `onAddFeature(type)`
- Add new props for spa creation: `onAddSpa: (attached: boolean) => void`

**File: `src/components/PoolBuilder.tsx`**
- Add `onAddSpa` handler that:
  - If attached: enters perimeter anchor mode with `featureType: 'spillover-spa'`
  - If detached: enters draw-pool mode for standalone spa

### Phase 4: Feature Properties Panel

**File: `src/components/poolBuilder/DesignerToolPanel.tsx`**
- When a feature is selected, show contextual properties panel:
  - Common: position X/Y (feet), delete button
  - Stairs: step count +/- 
  - Seat: width, depth sliders
  - Wall: width, height
  - Diving board: length
  - Tree: type selector (palm, oak, pine, etc.)
  - Lights: color picker, intensity
  - Rock/Boulder: size selector (S/M/L)
  - Pathway: type selector, width/length
  - Water features: flow rate/intensity (visual only)

### Phase 5: Deck Spline Visibility Enhancement

**File: `src/components/PoolBuilder.tsx`**
- Draw deck spline edges with dashed orange lines connecting anchor points (currently only dots are shown)
- Add dimension labels on deck edges (already exists at lines 2035-2067, verify it's working)
- Ensure newly drawn pools auto-generate deck with visible, selectable spline points

---

## Technical Notes

- The `PoolFeature` interface already supports all needed types (lines 44-73)
- `FEATURE_COSTS` in `poolBuilderPricing.ts` already maps costs for many feature types
- Canvas rendering at ~line 2770 filters features and draws them -- new types just need drawing code added
- The `addFeature()` function already handles placement logic for all types (lines 4879-4977)
- Deck selection requires minimal state: just tracking which deck entity is "active" for offset changes

## Files to Modify
1. `src/components/PoolBuilder.tsx` -- deck selection state, feature rendering, spa handler
2. `src/components/poolBuilder/DesignerToolPanel.tsx` -- full feature menu, deck selection UI, feature properties
3. `src/utils/poolBuilderPricing.ts` -- ensure all feature types have costs

## Estimated Scope
- Phase 1 (Deck selection): ~100 lines changed
- Phase 2 (Feature rendering): ~400 lines of canvas drawing code
- Phase 3 (Menu rebuild): ~200 lines in DesignerToolPanel
- Phase 4 (Properties): ~150 lines
- Phase 5 (Deck splines): ~30 lines

