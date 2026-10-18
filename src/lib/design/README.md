# Studio document and surface ownership

Copyright Imagine Engine Studios Corp.

`studioProject` builds one versioned document for autosave and the project library.
It keeps the complete 2D board, 3D scene and ID-keyed water/surface details together.
`studioMaterials` captures defaults per entity, never references another pool's mutable selections.
`boardNetArea` provides identical net regions for drawing, 3D slabs and take-off:
pools/coping cut decks; all decks cut turf; earlier same-kind surfaces retain ownership.
Adjacent surfaces share exact clipping boundaries, not expanded cutters or approximate snapping.

Copyright Imagine Engine Studios Corp. Precision board handles and insertion tests
use `utils/studioSplineControls`; `utils/poolTerrainOpening` unions raw water with
its exact outward tuck, avoiding centroid-directed offsets around concave pools.