# Plan: Add Spa Button + V1 Feature Development for 2D Designer

## Current Feature Audit

### DesignerToolPanel Buttons Status

| Button/Feature | Status | Notes |
|---|---|---|
| Select tool | ✅ Working | Drag pool/deck points |
| Draw Pool | ✅ Working | Spline drawing |
| Draw Deck | ✅ Working | Spline drawing for deck |
| Add Point | ✅ Working | Adds control point |
| Grid Snap | ✅ Working | Precision snapping |
| Zoom +/- | ✅ Working | Canvas zoom |
| Pool Shape presets | ✅ Working | rect/kidney/freeform |
| Pool Finish select | ✅ Working | Interior texture |
| Coping select | ✅ Working | Coping material |
| Deck Pavers select | ✅ Working | Deck texture |
| Deck Offset | ✅ Working | Offset + regenerate |
| Stairs | ✅ Working | Stair feature |
| Light | ✅ Working | Pool light |
| Jet | ✅ Working | Water jet |
| Fountain | ⚠️ Partial | Added but no rendering |
| **Spa** | ❌ Missing | **NEW - needs dedicated button** |
| Depth Profile | ✅ Working | Depth anchors + SVG |
| Cost Estimate | ✅ Working | Real-time breakdown |
| Custom Textures | ⚠️ Partial | Builder exists, integration unclear |

### Feature Types Defined but NOT in Panel

| Feature | Category | V1 Priority |
|---|---|---|
| **Spa (attached/detached)** | Pool | 🔴 HIGH |
| Tanning Ledge | Pool | 🟡 MEDIUM (exists in dialog but no button) |
| Diving Board | Pool | 🟡 MEDIUM |
| Pool Seat/Bench | Pool | 🟡 MEDIUM |
| Waterfall | Water | 🟡 MEDIUM |
| Water Curtain | Water | 🟢 LOW |
| Jumping Jet | Water | 🟢 LOW |
| Tree/Shrub/Rock | Landscape | 🟢 LOW (rendering exists) |

## Implementation Tasks

### Task 1: Add Spa Button with Attached/Detached Dialog
- Add "Spa" button to Features section in DesignerToolPanel
- On click → dialog asks: **Attached** (anchored to pool perimeter, spillover) vs **Detached** (standalone with own deck)
- Attached: reuses `perimeterAnchorMode` with `featureType: 'spillover-spa'`, auto-generates 8×8ft rounded shape
- Detached: creates standalone `additionalPool` with `type: 'spa'`, places offset from main pool, prompts for deck

### Task 2: Add Tanning Ledge Button
- Direct button in Features section
- Uses existing `perimeterAnchorMode` with `featureType: 'tanning-ledge'`
- Auto-generates shallow shelf shape (10×4ft default)

### Task 3: Add Diving Board Feature
- Button in Features section
- Creates `PoolFeature` with `type: 'diving-board'`
- Snaps to pool edge, renders as elongated board rectangle with spring end
- Canvas rendering: filled rectangle + dotted spring lines

### Task 4: Add Pool Seat/Bench Feature
- Button in Features section  
- Creates `PoolFeature` with `type: 'pool-seat'`
- Places inside pool along wall, renders as filled rectangle
- Configurable width/depth

### Task 5: Add Waterfall Feature
- Button in Features section
- Creates `PoolFeature` with `type: 'waterfall'`
- Places on pool edge, renders as cascading blue lines
- Configurable width

### Task 6: Organize Features into Sub-groups
- Restructure Features section with labeled groups:
  - **Pool**: Stairs, Light, Jet, Spa, Tanning Ledge, Seat, Diving Board
  - **Water**: Fountain, Waterfall, Water Curtain
  - Keep panel compact with icon grid layout

### Task 7: Wire Up Canvas Rendering for New Features
- Add rendering cases in main draw loop for:
  - Diving board, pool seat, waterfall, fountain (improve existing)
- Each feature gets proper 2D top-down visualization

## Technical Notes
- Spa uses existing `additionalPools` array with `PoolShape` interface
- Attached spa = `perimeterAnchorMode` → `spillover-spa` (existing system)
- All new features use existing `PoolFeature` type and `features` state
- Canvas rendering in draw loop at ~line 2344
