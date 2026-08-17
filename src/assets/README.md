# src/assets — Asset Library

Every binary/media file used by the app lives here, grouped by **business domain**
(not by file type). Each subfolder has its own `README.md` explaining what belongs
in it and which modules consume it.

## Rules (non-negotiable)

1. **ES6 imports only.** Always `import img from '@/assets/<folder>/<file>.webp'`.
   Never reference assets with a static string path — Vite will not fingerprint or
   bundle them and they break in production builds.
2. **Prefer `.webp`** in code. `.png/.jpg/.jpeg` originals are kept next to the
   `.webp` variant as the source of truth for re-exports, but components should
   import the optimized `.webp`.
3. **All `<img>` tags are `loading="lazy"`** unless the image is above the fold.
4. **No loose files at the root of `src/assets`.** Put it in a domain folder, and if
   no folder fits, create one *with* a `README.md`.
5. **Product imagery is brand-scoped.** GlimmerGlass images may never be shown for a
   Latham/Pebble Tec product and vice-versa (see `pools/README.md`).
6. Large media (video, PDFs, fonts) is externalized to the CDN as
   `*.asset.json` pointers via `lovable-assets` — see `hero/hero-beach.mp4.asset.json`.

## Folder map

| Folder | Contents |
| --- | --- |
| `banners/` | Wide section banner images used by the main-page category banners and search navigation. |
| `brand/` | Wonderlands logo / wordmark. Brand-only, never used as product imagery. |
| `cold-plunges/` | Cold Plunge product category imagery (Cedar Barrel, Stainless, Hot-Cold Duo). |
| `covers/` | Pool safety/automatic cover options (LifeSaver colors, "no cover"). |
| `deck/` | Deck & outdoor-living add-ons: pergolas, fire pits, kitchens, spas, saunas, lighting, playgrounds. |
| `enclosures/` | Screen enclosures and lanai tiers used by the enclosure configurator + quotes. |
| `equipment/` | Mechanical equipment options (heaters, spa jets). |
| `fencing/` | Aluminum fencing panels + fence textures for the fence configurator and 3D. |
| `finishes/` | Interior finish swatches (gelcoat / G3 / plaster families). |
| `hero/` | Landing-page hero stills, hero carousel frames and CDN hero video pointers. |
| `landscaping/` | Vegetation / landscaping category and subcategory tiles. |
| `pavers/` | Paver and hardscape material swatches (Belgard, Gloca, travertine, porcelain). |
| `pools/` | All pool product photography. See `pools/README.md` for brand subfolders (`glimmerglass/`, `concrete/`). |
| `water-features/` | Waterfall / water feature add-on products (`waterfalls/`). Never pool photography. |
| `tanning-ledges/` | Tanning ledge product imagery (brand-specific). |
| `textures/` | Tiling textures consumed by the 3D scene (water, waterline, surfaces). |
| `tools/` | UI screenshots of Wonderlands tools (studio, blueprint, calculators) used in FLIP/showroom cards. |
| `turf/` | Artificial grass color variants for the grass drawing board and 3D terrain. |
