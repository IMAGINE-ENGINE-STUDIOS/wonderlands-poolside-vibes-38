# Pool Design Cache & Auto-Save System

## Overview
This system provides automatic saving and caching of pool designs across the 2D designer and 3D viewer, allowing users to navigate freely without losing their work.

## Features

### 1. Automatic Saving
- **Auto-save interval**: Every 5 seconds
- **Silent background saves**: No interruption to user workflow
- **Visual indicator**: Shows save status and time since last save

### 2. Cache Management
- **LocalStorage-based**: Stores scenes in browser localStorage
- **Product-specific**: Separate cache for each product/pool
- **Auto-cleanup**: Removes caches older than 7 days
- **Cache keys**: Uses product ID or model name for identification

### 3. State Persistence
- **Scene state**: Pool points, depth, features, textures
- **Texture library**: All selected finishes, pavers, coping
- **View mode**: Remembers last view (2D/3D)
- **Custom shapes**: Preserves custom pool designs from 2D builder

### 4. Cross-View Synchronization
- **2D ↔ 3D sync**: Changes in 2D designer reflect in 3D viewer
- **Feature sync**: Stairs, lights, jets, and other features stay synchronized
- **Texture sync**: Material selections persist across views

## Usage

### For Users
1. **Design in 2D**: Use the Pool Builder to create custom shapes
2. **View in 3D**: Switch to 3D viewer to see your design rendered
3. **Navigate freely**: Switch between products, tabs, or pages
4. **Return anytime**: Your design is automatically restored

### Auto-Save Indicator
Located in the top-right corner of the 3D viewer:
- **Green checkmark**: Saved successfully
- **Pulsing icon**: Currently saving
- **Time display**: Shows when last saved (e.g., "Saved 15s ago")

## Technical Implementation

### Components Created
1. **`useSceneCache` hook** (`src/hooks/useSceneCache.ts`)
   - Manages localStorage operations
   - Handles auto-save timer
   - Provides save/load/clear functions

2. **`SceneContext` & `SceneProvider`** (`src/contexts/SceneContext.tsx`)
   - Global state management for scenes
   - Wraps visualizers with cache functionality
   - Shares state between 2D and 3D views

3. **`AutoSaveIndicator`** (`src/components/AutoSaveIndicator.tsx`)
   - Visual feedback component
   - Shows save status and timing
   - Responsive design

### Integration Points
- **WonderlandsStudio**: Wraps 3D viewers in SceneProvider
- **PoolBuilder**: Can be wrapped for 2D cache (future enhancement)
- **UnifiedPoolVisualizer**: Receives scene updates from context

## Cache Storage Structure
```typescript
{
  scene: Scene3D,           // Full scene configuration
  timestamp: number,        // When saved (milliseconds)
  productId?: string,       // Product identifier
  productModel?: string     // Model name
}
```

## Configuration

### Adjustable Settings
- **Auto-save interval**: Default 5000ms (5 seconds)
- **Cache expiration**: Default 7 days
- **Enable/disable auto-save**: Pass `autoSave={false}` to SceneProvider

### Example Usage
```tsx
<SceneProvider
  initialScene={scene}
  initialTextureLibrary={textureLibrary}
  productId="madre-perla-pool"
  autoSave={true}
>
  <YourViewer />
</SceneProvider>
```

## Benefits
- ✅ No lost work from accidental navigation
- ✅ Seamless 2D ↔ 3D workflow
- ✅ Automatic cleanup prevents storage bloat
- ✅ Product-specific caching for multiple designs
- ✅ Visual confirmation of save status
- ✅ Zero user interaction required

## Future Enhancements
- Export/import designs as files
- Cloud sync for cross-device access
- Design history/versioning
- Share designs via URL
- Compare multiple designs side-by-side
