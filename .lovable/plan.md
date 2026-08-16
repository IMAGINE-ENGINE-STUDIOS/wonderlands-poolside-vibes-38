# Fix the strange diagonal shade on the paver deck

## What is happening

The dark diagonal band on the pavers is not from the geometry cutting tool — it is a shadow artifact the deck casts onto itself.

Confirmed in the code:
- `src/components/scene3d/DeckGeometry.tsx` (line 96) renders the deck slab with both `castShadow` and `receiveShadow`, and its material uses `side: THREE.DoubleSide`. A flat, double-sided surface that both casts and receives shadows shadows itself, and the artifact follows the triangulation of the deck ring — which is exactly the soft diagonal line seen in the screenshot.
- `src/components/UnifiedPoolVisualizer.tsx` (lines 1570-1581) configures the day sun light with a 100ft-wide shadow camera and no `shadow-bias` / `shadow-normalBias`, so shadow-map precision on the deck is low and acne is amplified.
- `src/components/scene3d/DeckBorderGeometry.tsx` (line 104) has the same `castShadow` + `receiveShadow` combination on the border band.

## The fix

1. Deck surfaces stop casting shadows onto themselves:
   - `DeckGeometry.tsx`: keep `receiveShadow`, drop `castShadow` from the flat deck slab (a ground-level slab has nothing below it to shadow).
   - `DeckBorderGeometry.tsx`: same treatment for the border band.
2. Tighten shadow quality on the day sun in `UnifiedPoolVisualizer.tsx`:
   - Add `shadow-normalBias` (~0.03) and a small negative `shadow-bias` to eliminate residual acne.
   - Reduce the shadow camera bounds from +/-50 to a tighter frustum around the design area so 2048px of shadow map covers far fewer feet per texel.
3. Apply the same bias settings to the night moon light so the artifact does not reappear at night.
4. Verify with a Playwright screenshot of the 3D studio at a similar low camera angle over the deck, confirming the diagonal band is gone while real shadows (walls, coping, dropped objects) still land on the pavers.

## Notes

No geometry, pricing, or business logic changes — only shadow flags and light shadow parameters. Real object shadows on the deck are preserved because the deck keeps `receiveShadow`.
