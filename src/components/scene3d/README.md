# Unified 3D Scene Visualizer

A comprehensive 3D visualization system for pools, spas, tanning ledges, and related products with advanced editing capabilities.

## Components

### `UnifiedPoolVisualizer.tsx`
Main component that orchestrates the entire 3D scene visualization.

**Features:**
- Interactive 3D canvas with pool, deck, and features rendering
- Object selection and manipulation
- Camera presets (Top, Front, Side, Isometric)
- Auto-rotate animation
- Real-time texture updates
- Annotation system

**Usage:**
```tsx
<UnifiedPoolVisualizer
  scene={scene3DData}
  textureLibrary={textureLibrary}
  onSceneChange={(updatedScene) => handleSceneUpdate(updatedScene)}
/>
```

### `Scene3DControlPanel.tsx`
Right-side collapsible control panel for scene editing.

**Features:**
- Transform mode selection (Move, Rotate, Scale)
- Texture editor with category tabs (Finishes, Pavers, Coping)
- Annotation creation (text + price)
- Animation controls
- Scene statistics

### `Scene3DAnnotations.tsx`
3D sticky notes that can be attached to objects.

**Features:**
- Color-coded notes (yellow = pending, green = confirmed)
- Price display
- Confirmation toggle
- Delete functionality
- Always faces camera

## Data Structures

### `Scene3D`
Complete scene representation including:
- Pool geometry (points, depth, shape, finish)
- Deck geometry (points, paver, coping textures)
- Features (stairs, lights, trees, etc.)
- Annotations (notes with positions and prices)
- Camera state

### `TextureConfig`
Texture definition with:
- URL path
- Name
- Scale and repeat values
- Material properties (roughness, metalness, color)

## Utilities

### `SceneConverter.ts`
**Functions:**
- `productToScene()` - Convert product configurator data to Scene3D
- `parseDimensions()` - Extract dimensions from strings
- `parseDepth()` - Extract depth values
- `getFinishTextureUrl()` - Map finish names to URLs
- `getPaverTextureUrl()` - Map paver names to URLs
- `exportScene()` - Export scene to JSON
- `importScene()` - Import scene from JSON

## Integration

The visualizer is integrated with:
- **WonderlandsStudio** - Product configurator
- **PoolBuilder** - Custom pool designer (compatible data format)

## Controls

### Mouse/Touch:
- **Click object** - Select for editing
- **Drag** - Rotate view (OrbitControls)
- **Scroll** - Zoom in/out
- **Double-click** - Focus on object

### Keyboard Shortcuts (planned):
- `E` - Transform mode: Translate
- `R` - Transform mode: Rotate
- `S` - Transform mode: Scale
- `C` - Center camera on selected object

## Future Enhancements

1. **Drag-and-drop objects** - Use TransformControls for manual positioning
2. **Multi-object selection** - Shift+click to select multiple items
3. **Scene templates** - Save/load preset configurations
4. **Export to quote** - Generate detailed quotes from scene
5. **Collision detection** - Prevent object overlap
6. **Undo/Redo** - Scene history management
7. **Custom materials** - Upload user textures
8. **Lighting controls** - Adjust ambient/directional lights
9. **Post-processing** - Add bloom, SSAO, etc.
10. **AR preview** - View scene in augmented reality

## Performance Considerations

- Uses texture caching from `textureCache.ts`
- Lazy texture loading based on zoom level (LOD system)
- Instanced meshes for repeated elements
- Frustum culling for off-screen objects
- Optimized shadow maps (2048x2048)

## Architecture Notes

- Reuses existing `Pool3DViewer` for rendering pool geometry
- Converts between Scene3D format and Pool3DViewer format
- Maintains backward compatibility with existing components
- Designed for extensibility - easy to add new object types
