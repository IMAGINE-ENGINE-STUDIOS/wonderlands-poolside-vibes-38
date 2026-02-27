

# Plan: Fix Build Error + V2 Swimming Pool & Landscape Tools

## 1. Fix Build Error (Line 6281)

**File: `src/components/PoolBuilder.tsx`**
- The `return` statement at line 5628 uses `return <div>...</div>;` syntax. The TS error at line 6281 (`</div>;`) indicates a mismatched brace or tag earlier in the JSX is causing the parser to exit the return prematurely.
- Fix: Wrap the entire return in parentheses: `return (` at line 5628 and `</div>);` at line 6281. Also audit for any stray closing braces/tags between lines 5628-6281 that break the JSX tree.

## 2. Landscape Tools: Click-to-Place Outside Pool (V2)

**Current behavior:** `addFeature()` places landscape items at canvas center with random offset. They're treated the same as pool-anchored features.

**New behavior:**
- When user clicks a landscape button (tree, shrub, rock, boulder, hedge-row, plant-row, grass-region, landscape-light, edging, pathway), set a `pendingLandscapePlacement` state with the feature type.
- Show a cursor indicator (crosshair or ghost icon) while placement mode is active.
- On next canvas click, place the feature at the clicked world coordinates (using `screenToWorld`). No pool-area restriction.
- After placement, feature remains draggable via existing mouse-down/move logic. Drag moves feature freely across the scene (already partially works for open-area features).
- Add visual feedback: highlight the feature being placed with a ghost preview at cursor position during placement mode.

**File: `src/components/PoolBuilder.tsx`**
- Add state: `pendingLandscapePlacement: PoolFeature['type'] | null`
- In `handleCanvasClick`: if `pendingLandscapePlacement` is set, create feature at click world coords, clear pending state.
- In canvas `onMouseMove` render loop: if pending placement active, draw ghost preview at cursor position.
- Ensure all landscape features use world coordinates and render correctly with pan/zoom transforms.

## 3. Swimming Pool Tools V2

**File: `src/components/PoolBuilder.tsx`**
- Pool-structure features (stairs, seat, wall, diving-board, light, jet) keep wall-snap behavior but improve:
  - After clicking button, enter placement mode where user clicks on pool edge to place.
  - Show ghost preview snapped to nearest wall point as cursor moves along pool perimeter.
  - `pendingPoolFeaturePlacement` state for this mode.

## 4. Drag-and-Drop for All Placed Features

**File: `src/components/PoolBuilder.tsx`**
- Ensure existing feature drag logic works in world coordinates with `screenToWorld`.
- Landscape features: unrestricted drag anywhere on scene.
- Pool features: constrained drag along pool perimeter (wall-mounted) or free drag (open-area).
- Visual feedback during drag: slight opacity change, position coordinates tooltip.

## 5. DesignerToolPanel V2 Updates

**File: `src/components/poolBuilder/DesignerToolPanel.tsx`**
- Add visual indicator on landscape buttons showing "Click to place" mode when active.
- Show active placement mode label (e.g., "Click on scene to place Tree").
- Cancel placement with Escape key or clicking the same button again.

## Files to Modify
1. `src/components/PoolBuilder.tsx` — fix build error, add placement modes, world-coord drag
2. `src/components/poolBuilder/DesignerToolPanel.tsx` — placement mode UI feedback

## Estimated Scope
- Build error fix: ~2 lines
- Landscape click-to-place: ~60 lines
- Pool feature placement mode: ~40 lines  
- Drag improvements: ~30 lines
- UI feedback: ~20 lines

