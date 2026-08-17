# textures/

Tiling textures consumed directly by the 3D scene (water, waterline, surfaces).

- Authored to tile seamlessly; the 3D pipeline maps them at 1x1 ft (waterline uses a
  2x repeat for 0.5 ft sections).
- Registered through `src/data/textureLibrary.ts`, the single source of truth for all
  3D texture galleries.

