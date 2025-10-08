# Texture LOD (Level of Detail) System

## Overview
The Pool Builder now uses a 3-level LOD system for all textures (pavers, coping, and liner). This optimizes performance and visual quality based on the user's zoom level.

## LOD Levels

### Level 1: High (1.0x - Full Resolution)
- **Trigger**: Zoom level >= 1.5x
- **Size**: 100% of original texture
- **Use Case**: When user zooms in to see fine details
- **Performance**: Higher memory usage, better quality

### Level 2: Medium (0.5x - Half Resolution)
- **Trigger**: Zoom level between 0.75x and 1.5x
- **Size**: 50% of original texture (0.5x scale)
- **Use Case**: Normal viewing distance
- **Performance**: Balanced memory and quality

### Level 3: Low (0.25x - Quarter Resolution)
- **Trigger**: Zoom level < 0.75x
- **Size**: 25% of original texture (0.25x scale)
- **Use Case**: Zoomed out view / overview
- **Performance**: Lowest memory usage, acceptable quality

## How It Works

1. **Texture Loading** (`textureLOD.ts`)
   - When textures are selected, all 3 LOD levels are pre-loaded
   - Images are resized client-side using high-quality canvas smoothing
   - All levels are stored in `textureLODsRef` for instant switching

2. **Automatic Switching**
   - Based on `zoomLevel` state in PoolBuilder
   - Function `getLODLevel(zoomLevel)` determines which level to use
   - `getTextureForLOD()` returns the appropriate texture
   - Canvas re-renders automatically when zoom changes

3. **Fallback Chain**
   - If requested LOD isn't loaded, falls back to next available
   - Example: High → Medium → Low or Low → Medium → High

## Files Modified

- `src/utils/textureLOD.ts` - New LOD management system
- `src/components/PoolBuilder.tsx` - Integration of LOD system

## Benefits

1. **Performance**: Lower memory usage when zoomed out
2. **Quality**: Sharp textures when zoomed in
3. **Smooth UX**: Pre-loaded textures mean instant switching
4. **Scalability**: Easy to add more LOD levels if needed

## Visual Indicator

The current LOD level is displayed in the top-right corner of the canvas:
- "High (1.0x)" - Full resolution
- "Medium (0.5x)" - Half resolution  
- "Low (0.25x)" - Quarter resolution

## Future Enhancements

1. Could load different source images for each LOD (e.g., texture-high.jpg, texture-medium.jpg, texture-low.jpg)
2. Could implement progressive loading (low first, then medium, then high)
3. Could add user preference to force high quality always
4. Could implement texture compression for even better performance
