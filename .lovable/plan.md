

# Full 2D ↔ 3D Integration Plan

## Current State

The system has **one-way** data flow: 2D PoolBuilder → `onPoolDataChange` → DesignStudio state → `productToScene()` → 3D `UnifiedPoolVisualizer`. Changes made in 3D (spline edits, texture changes, feature placement, depth anchors) are **not propagated back** to the 2D designer. Additionally, the terrain grass cutout only accounts for the pool + coping area but **ignores the deck area entirely**, causing grass to render inside the deck.

## Architecture Changes

```text
┌─────────────┐   onPoolDataChange    ┌──────────────┐   productToScene   ┌───────────────────────┐
│ PoolBuilder  │ ─────────────────────→│ DesignStudio │ ─────────────────→│ UnifiedPoolVisualizer │
│   (2D)       │ ←─────────────────────│   (state)    │ ←─────────────────│       (3D)            │
└─────────────┘   on3DSceneChange      └──────────────┘   onSceneChange   └───────────────────────┘
      NEW CALLBACK                                           ALREADY EXISTS
```

## Implementation Steps

### 1. Wire `onSceneChange` in DesignStudio to update 2D state

Currently the `onSceneChange` callback in `DesignStudio.tsx` line 374 is a no-op (`// Handle scene updates if needed`). Implement it to:
- Convert 3D scene pool points back to 2D pixel coordinates (multiply by `scale`)
- Update `poolBuilderData`, `customPoolShape`, and `selectedExtras` from the returned scene
- Update depth profile, features, and deck points from 3D changes

### 2. Add `onExternalUpdate` prop to PoolBuilder

Add a new prop to `PoolBuilder` that accepts externally-changed data (pool points, depth points, features, hardscape points) from 3D edits. When this prop changes:
- Update internal `points`, `depthPoints`, `features`, `hardscapePoints` state
- Skip triggering `onPoolDataChange` for externally-sourced updates to avoid infinite loops
- Use a ref flag (`isExternalUpdateRef`) to distinguish internal vs external changes

### 3. Bidirectional feature sync

The `PoolBuilderConverter.ts` already converts 2D features → 3D features. Add the reverse:
- Create `scene3DToPoolBuilder()` function in `PoolBuilderConverter.ts`
- Convert Scene3D pool points (feet) back to pixel coordinates (multiply by scale)
- Convert Scene3D features back to PoolBuilder feature format
- Convert Scene3D depth anchors back to PoolBuilder depth points
- Convert Scene3D hardscape/deck points back to pixel coordinates

### 4. Fix terrain cutting to include deck area

The `GrassTerrainFallback` component (Pool3DScene.tsx ~line 706) currently only cuts a hole for pool + coping. Modify it to:
- Accept `hardscapePoints` (deck boundary) as an additional prop
- When hardscapePoints exist, use them as the terrain cutout boundary instead of just pool + coping offset
- When hardscapePoints don't exist, fall back to pool + coping + deckWidth offset
- Pass `hardscapePoints` from `Pool3DScene` props down to `GrassTerrainFallback`

### 5. Prevent update loops

Since both viewports will now update each other, add guards:
- Use a `lastUpdateSource` ref in DesignStudio (`'2d' | '3d' | null`)
- When 2D triggers `onPoolDataChange`, set source to `'2d'` and skip forwarding back to 2D
- When 3D triggers `onSceneChange`, set source to `'3d'` and skip forwarding back to 3D
- Clear source after a `requestAnimationFrame` to allow subsequent real edits

### 6. Ensure viewport switch preserves state

When toggling between 2D and 3D views in DesignStudio:
- On switch to 3D: latest 2D data is already flowing via `productToScene` — no change needed
- On switch to 2D: apply any 3D changes back to PoolBuilder via the new `onExternalUpdate` prop
- Store a `lastScene3D` ref that gets applied when switching back to 2D

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/DesignStudio.tsx` | Wire `onSceneChange`, add loop guards, add `onExternalUpdate` data flow |
| `src/components/PoolBuilder.tsx` | Add `onExternalUpdate` prop, handle external state injection |
| `src/components/scene3d/PoolBuilderConverter.ts` | Add `scene3DToPoolBuilder()` reverse converter |
| `src/components/Pool3DScene.tsx` | Pass `hardscapePoints` to terrain, update `GrassTerrainFallback` to cut deck hole |

## Technical Details

- **Coordinate conversion**: PoolBuilder uses pixels (scale = 10 px/ft). 3D uses feet. Conversion: `feet = pixels / scale`, `pixels = feet * scale`.
- **Terrain hole calculation**: Use `generateOffsetCurve` on deck outer boundary (or hardscapePoints) instead of just pool + coping for the grass cutout. The deck border geometry already receives `deckWidth` and `copingWidth` — the terrain must match.
- **Loop prevention**: Debounce with `requestAnimationFrame` + source tracking. Never forward an update back to the viewport that originated it.

