# Solar roof capture: click-only, and a real outline algorithm

## What changes for the reader

1. **Nothing is drawn until you ask for it.** Searching an address only frames the house on the aerial. No roof shapes appear. The measured planes stay in the background, unused, until you press **Click a roof plane** and click a roof.
2. **One click, one roof face.** Each click captures the single plane under the cursor — not the whole building, and never twenty overlapping boxes.
3. **Honest corners.** The captured outline follows the actual roof edges (ridge, hip, eave) instead of a rotated bounding box, and a click that would run off the roof onto a driveway, road or lawn is refused with a short message rather than dropping a nonsense shape.

## The capture algorithm

Replaces the current "rotated bounding box" and "24-spoke hull" approach.

Step 1 — seed. The click point gives a colour sample averaged over a small patch (not one pixel), so a shingle speckle or a vent shadow doesn't poison the seed.

Step 2 — bounded region grow. Flood fill from the seed with an adaptive tolerance, constrained by:
- a hard geographic radius (about 70 ft from the click), so the fill physically cannot reach the street;
- a runaway guard: if the region grows past a plausible roof-plane area, or its bounding box gets close to the radius on all sides, the whole capture is rejected;
- a gradient brake: pixels across a strong luminance edge (ridge line, gutter, wall shadow) are not crossed.

Step 3 — contour. The filled mask is walked with a marching-squares boundary trace, producing one closed ordered contour (the current code collects unordered edge pixels, which is what makes the outline scramble).

Step 4 — simplify to corners. Douglas–Peucker reduction at a tolerance tied to ground scale (about 1.5 ft), then a dominant-angle pass: the two principal roof directions are found from the longest edges, and near-parallel/near-perpendicular edges are snapped to them so the result comes back as a clean 4–8 corner plane instead of a jagged blob.

Step 5 — validate. The candidate is accepted only if it is a sane roof plane: area within a plausible range, no self-intersection, and reasonable convexity/aspect. Anything else is rejected and the reader is told to click nearer the middle of a plane.

Step 6 — measured planes take priority. If the click lands inside a Google-measured segment, that segment's azimuth, pitch and sunshine hours are used, but the **outline comes from the trace** above when the trace validates, so the shape is real and the physics stays measured. When there is no valid trace, the segment's own quadrilateral is used, scaled to its reported plan area.

Hand-trace mode is unchanged.

## Technical notes

- `src/lib/solar/roofAutoTrace.ts` — rewrite `autoTraceAt` per the steps above; add `traceRoofPlane` returning `{ path, rejected? }`, plus internal helpers for marching-squares contour, Douglas–Peucker, and dominant-angle snapping. Keep `facesFromInsights`, the Mercator helpers and `guessAzimuth` exports intact.
- `src/components/solar/SolarCalculatorBoard.tsx`
  - `loadInsights` stops writing `faces`; it only fills `measured.current`, sets `covered`/`imageryDate`, frames the measured building, and sets mode to `idle`. Toast copy becomes "Press Click a roof plane, then click each roof face."
  - `handleMapClick` (auto mode) runs the trace first, then merges measured attributes from the segment hit; on rejection it shows a short toast and adds nothing (the current unconditional `rectangleAround` fallback is removed from the auto path). A separate explicit fallback stays available through hand-trace mode.
  - The sampling frame is required for auto mode: if `frame.current` is null the button prompts to zoom in instead of dropping a rectangle.
- No pricing, BOM, cart or engine changes. `solarEngine.ts` untouched.
