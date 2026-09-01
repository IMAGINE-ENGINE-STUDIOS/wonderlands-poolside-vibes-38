# Fix the drawing spread and the roof capture tool

Two separate defects, both confirmed by testing the live app.

## What is actually wrong

**1. The drawing board is rendered twice and cut in half**

`src/components/flip/FlipToolWidget.tsx` builds a "spread" by mounting the *same
board twice* — once for the left leaf, once for the right — each at 200% page
width and shifted so each leaf shows one half (lines 404-430). Consequences:

- Two independent live boards run at once. For the Total Solar Calculator that
  means two slippy maps, two address bars, two tile fetchers and two writers to
  the same cached session key — the boards fight each other and re-render in a
  loop ("driving itself crazy").
- Each instance draws its own header, toolbar and side panel, so half of each
  copy is clipped by the gutter and controls land off-leaf.
- Double tile/canvas work on every pan — the frame rate problem.

**2. The roof plane tracer refuses almost every click**

Tested at `1234 Cape Coral Pkwy E, Cape Coral, FL` (geocode and Google measured
data both returned fine — the panel shows "MEASURED"). Four clicks on four
distinct roof planes produced **0 faces**; every one was refused with "That fill
ran past the roof". Causes found in the code:

- **Sampling frame is smaller than the map.** `composeAerialFrame(..., 640)`
  builds a 640x640 bitmap, but the on-screen map measured 832x640. Clicks
  outside the middle 640px band are off the bitmap, and everything is sampled
  from a differently framed image than the reader sees.
- **Flood fill is the wrong primary method** on hazy Esri imagery, where roof
  and parking lot/driveway share the same grey. The fill escapes, trips the
  3200 sq ft cap and the click is thrown away.
- **The measured Google roof segments are never used for capture.** They are
  loaded, kept in a ref, and only consulted *after* a successful trace — so when
  the trace fails (which is most of the time) the real, surveyed plane under the
  cursor is discarded.
- Validation is absolute: 4-10 corners, area ratio, aspect ratio; a single miss
  throws the whole capture away instead of falling back to something usable.
- Stale garbage persists: captured faces live in a cached session, so nonsense
  faces (the 26 faces with 100,000+ SF areas seen earlier) survive reloads.

## The fix

### A. One board per spread

- In `FlipToolWidget`, stop mounting two copies. The spread keeps its paper look
  but the board mounts **once**, spanning both leaves from the right-leaf part,
  positioned across the gutter; the left leaf renders the static plate (title,
  live price, legend) only. Solar, enclosure, fence, grass and site boards all
  go through the same single-mount path.
- Keep the existing flip-lock behaviour and the outer flip margins unchanged.
- Verify with a screenshot that the toolbar, map and side panel are all reachable
  and that only one map instance exists.

### B. Make roof capture actually work

1. **Frame parity** — compose the sampling bitmap at the map's measured size
   (with a margin) and at the same zoom, and recompose on resize, so every
   visible pixel is clickable and pixel↔lat/lng math matches the view exactly.
2. **Measured-first capture** — when the click falls inside a Google-measured
   roof segment, capture that segment (real azimuth, pitch, sunshine hours) and
   refine its outline from the photo only when the refinement passes. This alone
   makes covered addresses (most of Florida) reliable.
3. **Better tracing where there is no measured data** — replace the raw colour
   flood with an edge-aware plane grow: local plane statistics (mean/variance in
   a small window) instead of a single seed colour, edge map as a hard barrier,
   then the existing Moore contour → Douglas-Peucker → dominant-angle snap.
   Relax the corner cap (up to 12) and, when simplification is untidy, fall back
   to the best-fit oriented rectangle of the captured mask rather than refusing.
4. **Never dead-end** — if capture still fails, drop an editable 4-corner plane
   snapped to the roof's dominant angle at the click, and tell the reader to drag
   the corners. Every outline stays draggable, as now.
5. **Sanity guard on saved faces** — reject/repair faces whose plan area is
   outside a believable range (e.g. > 20,000 sq ft per plane) and purge the
   cached nonsense faces once on load, so the "102,544 SF · 4410 panels" rows
   cannot come back.

### C. Test and prove it

Drive the app with Playwright: search a real address, click each roof plane,
screenshot the result, and confirm faces are captured with plausible areas and
panel counts; then open the same board inside the flip spread and screenshot it
whole. Both screenshots go in the reply.

## Files touched

- `src/components/flip/FlipToolWidget.tsx` — single-mount spread
- `src/components/solar/SolarCalculatorBoard.tsx` — frame sizing, measured-first
  capture, fallback plane, stale-face purge
- `src/components/solar/AerialCanvas.tsx` — report its measured size for frame parity
- `src/lib/solar/roofAutoTrace.ts` — edge-aware plane grow, rectangle fallback,
  relaxed validation
