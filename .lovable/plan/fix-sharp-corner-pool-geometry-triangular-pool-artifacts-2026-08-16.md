# Fix sharp-corner pool geometry (triangular pool artifacts)

## What the images show

1. Coping reads as three separate straight bars that overlap/miss at the tips instead of one mitred triangular ring.
2Empty notches at the tips, between coping and deck.
3. Thin dark lines "behind" the coping (z-fighting).
4. Pool wall visible inside the water, roughly a foot past the waterline at the corners.

## Confirmed causes (from the code)

1. **Coping corners** — `src/components/scene3d/CopingGeometry.tsx` builds its outer ring with `generateOffsetCurve` (`src/utils/curveUtils.ts`), which averages the two neighbour normals and offsets by a fixed distance. It has **no miter compensation** (`1/cos(half-angle)`), so at a 30-60 degree tip the outer ring falls far short of `copingWidth` perpendicular. That is the collapsed / "two straight lines intersecting" tip.

2. **Pool walls poking into the water** — in `PoolMesh` (`src/components/Pool3DScene.tsx`, wall loop around lines 400-500) every edge is extruded **independently**: `outerP1/outerP2` use that edge's own normal, no shared corner vertex, no corner cap. At a sharp corner the neighbouring 0.75 ft (9 in) thick slabs cross each other, and one slab's face ends up visible inside the pool — the "wall a foot inside" and the loose fin in the close-up.

3. **Waterline stopping short at the tips** — `matchedOffsetRing` in `src/utils/polygonGeometry.ts` clamps the miter scale (`Math.min(3, 1/max(0.34,|cos|))`). On sharp tips the clamp kicks in, so the band's inner edge does not reach the corner and bare wall shows through.

4. **Empty corner notches** — the deck/grass cutout comes from `offsetPolygonSingle` (`resolveDeckBoundaries` in `src/utils/deckSurface.ts`), whose Minkowski sweep **rounds** convex corners, while the coping is mitred straight. The rounded hole is larger than the mitred coping at each tip, leaving an unpaved gap.

5. **Dark lines behind coping** — coping spans y `0 -> copingHeight` while pool walls and the waterline top sit at y `1/36` (0.33 in), so coplanar/overlapping faces z-fight along the inner coping edge.

## Fix plan

**A. One shared mitred-ring helper** (`src/utils/polygonGeometry.ts`)
- Add `mitredOffsetRing(ring, dist, {maxMiter})`: true bisector offset with full `1/cos` miter, and on tips sharper than the miter limit emit **two** vertices (a bevel) instead of clamping short. Returns a vertex-index map so callers can keep 1:1 banding.
- Raise/remove the hard clamp in `matchedOffsetRing` by routing it through the new helper.

**B. Coping** (`CopingGeometry.tsx`)
- Replace `generateOffsetCurve` with `mitredOffsetRing`, using the bevel-aware index map so the inner and outer rings stay paired. Corners become exact mitres, no overlap and no collapse.

**C. Pool walls** (`PoolMesh` in `Pool3DScene.tsx`)
- Build the outer wall ring once with `mitredOffsetRing(normalizedPoints, +wallThickness)` and index the quads against the shared corner vertices instead of per-edge offsets. This removes the crossing slabs and the fin, so nothing extends past the waterline into the water.

**D. Deck/grass cutout** (`deckSurface.ts`)
- Use the same mitred ring for the coping-edge (`inner`) boundary so the hole matches the coping exactly; keep the boolean subtraction for the outer hardscape. Containment safety checks stay.

**E. Z-fighting**
- Align levels: waterline top and wall top at `1/36`, coping bottom at `1/36` (not 0) with a small overlap epsilon (~0.005 ft) so faces are never coplanar. Keep coping top at `1/36 + copingHeight`.

**F. Verification**
- Node script asserting, for a triangle, an L-shape and a circle: coping band perpendicular width equals `copingWidth` within 1% at every sample (including tips), no wall vertex lies inside the pool ring, and deck hole area equals coping outer area within 0.5%.
- Playwright screenshots of `/design-studio` at the same top and corner angles as the reported images.

Scope: geometry only — no texture, pricing, or UI changes.
