

# Plan: Professional Precision Input & Pricing Consolidation for 2D Designer

## Problem Analysis
1. **Grid snap causes imprecise dimensions**: The snap grid uses 6-inch (0.5ft) increments. When dragging a point, `Math.round(x / snapPixels) * snapPixels` rounds to the nearest 0.5ft, making it impossible to land on exact values like 14.0ft — it jumps to 14.0 or 14.5, and depending on origin position, lands on 14.3 or similar.
2. **No manual coordinate input**: Users cannot type exact X/Y positions or distances for spline points. A professional CAD tool needs text-box precision.
3. **Pricing constants are hardcoded and inconsistent**: `POOL_COST_PER_SQFT = 190` and `PAVER_COST_PER_SQFT = 15` are arbitrary constants inside PoolBuilder.tsx, disconnected from the actual product pricing on the main page (paverData.ts has $10-$22/sqft, pools have specific model prices).

## Implementation Steps

### Task 1: Fix Grid Snap to Allow Exact Foot Values
**File: `src/components/PoolBuilder.tsx`**
- Change `snapSize` default from `6` (inches) to `12` (1 foot) so points always land on exact foot boundaries
- Add a "Fine Snap" option: 1-inch (1/12 ft) for sub-foot precision when needed
- Ensure the snap calculation rounds to exact foot values relative to the pool center, not canvas origin — this prevents the 14.3ft problem where origin offset causes fractional results

### Task 2: Add Spline Point Coordinate Input Panel
**New file: `src/components/poolBuilder/PointCoordinateEditor.tsx`**
- Create a compact UI panel that appears when a spline point is selected (both pool and deck points)
- Shows X/Y position in feet (relative to pool center) with editable Input fields
- Shows distance to previous and next point with editable Input fields
- On value change, recalculates and updates the point position in exact pixel coordinates
- Supports both pool points and hardscape (deck) points
- New spline points added via "Add Point" also get coordinate inputs immediately

**File: `src/components/poolBuilder/SplineDrawingToolbar.tsx`**
- Add props for point coordinates (xFeet, yFeet) and onChange handlers
- Show inline X/Y input fields in edit mode next to the point label

**File: `src/components/PoolBuilder.tsx`**
- Integrate PointCoordinateEditor into the selected-point toolbar area (around line 5470)
- Pass scale, canvas center, selected point data, and update handlers
- Add handler to update point position from exact foot values: `newPixelX = centerX + feetX * scale`
- Same for hardscape points when selected
- Wire up distance-between-points editing: when user types a distance, the selected point moves along the vector to its neighbor to match exactly

### Task 3: Consolidate Pricing with Main Page Product Data
**File: `src/utils/poolBuilderPricing.ts`** (new)
- Create a centralized pricing module that imports from existing data sources:
  - Pool cost: Use the selected product's actual price from `pools`/`gilmerPools`/`PoolCatalog` rather than `$190/sqft`
  - Deck/paver cost: Import from `paverData.ts` using `getPaverPricePerSqFt()` from `paverPricing.ts` — Appian $15, Catalina $20, Catalina Grana $22, Concrete $10
  - Coping cost: Same paver pricing lookup for selected coping material
  - Feature costs: Keep existing feature costs (stairs $2500, lights $450, etc.)
  - Screen enclosure: Use `SCREEN_ENCLOSURE_PRICING` from `paverPricing.ts`

**File: `src/components/PoolBuilder.tsx`**
- Remove hardcoded `PAVER_COST_PER_SQFT = 15` and `POOL_COST_PER_SQFT = 190`
- Import pricing from the new centralized module
- Pass `selectedPaverId` and `selectedCopingId` to pricing functions to get correct per-material rates
- Pool base cost uses the selected product's actual catalog price (passed via props or URL params) instead of area × flat rate
- Update `calculateTotalCost` to use material-specific rates
- Update the `onPoolDataChange` breakdown to include material names and rates

**File: `src/pages/DesignStudio.tsx`**
- Pass the selected product's price to PoolBuilder so it can use the real base price

### Task 4: Add Deck Point Coordinate Editing
**File: `src/components/PoolBuilder.tsx`**
- When a hardscape point is selected, show the same PointCoordinateEditor panel
- Allow exact feet input for deck dimensions (width, length from pool edge)
- Deck distance inputs update hardscape points precisely

## Technical Details

**Snap fix math**: Currently `snapPixels = snapSize / 12 * scale`. With scale=10 and snapSize=6, snapPixels=5px. A point at x=143px → 143/5=28.6 → round to 29 → 29×5=145px → 145/10=14.5ft. The issue is when the pool center isn't on a snap boundary. Fix: snap relative to pool center coordinates, not canvas origin.

**Coordinate system**: Pool center = (canvasWidth/2, canvasHeight/2). Point position in feet = `(point.x - centerX) / scale`. To set exact feet: `point.x = centerX + feetValue * scale`.

**Pricing alignment**: The main page uses specific product prices (e.g., Astoria 16 = $110,338). The 2D designer should show this as the pool base price, then add deck/coping/features on top. This matches how the product cards and quote tool work.

