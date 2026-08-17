# pools/glimmerglass/

GlimmerGlass fiberglass pool models. Files keep their historical `gilmer-` prefix so
existing data modules (`src/data/gilmerPools.ts`, `src/data/gilmerSpas.ts`) and the
`Gilmer*` components stay consistent — do not rename them without updating those.

- Each model ships as `gilmer-<model>.png` (source) + `gilmer-<model>.webp` (import this).
- Previously these lived loose in `src/assets/` next to tool screenshots; they were
  moved here so pool photography lives with the rest of the pools.
- GlimmerGlass restrictions: gelcoat finishes are exclusive to this brand, and the
  Wonderlands Collection cannot be built "on concrete".
