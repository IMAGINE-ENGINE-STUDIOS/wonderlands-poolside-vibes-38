# Wonderlands Solar — Total Solar Calculator

Replace the generic drawing board in the Solar category with a purpose-built solar calculator: address search, aerial imagery, roof capture, sun-exposure heat map, full system build (panels, battery, racking, electrical) and a printable report — plus a passcode-gated contractor sheet.

## The user journey

1. **Address** — type the address, autocomplete suggests, the map lands on the property.
2. **Frame the property** — pan/zoom/rotate the aerial view and lock the crop when the right roof is centred.
3. **Capture the roof** — click a roof face: the board tries to auto-outline it (Google Solar roof segments first, then on-tile edge detection). Every vertex stays draggable, and a manual Trace tool is always available for additions, dormers and obstructions.
4. **Sun study** — each captured face is shaded orange / yellow / red (best → shaded) from its azimuth, pitch, latitude and neighbouring shade, with a legend and per-face annual sun hours.
5. **Build the system** — pick the panel, choose battery, then roof type (tile / shingle / metal / flat concrete) which drives the racking and anchoring system. The board fits the maximum panel count per face automatically and shows what fits where.
6. **Report & quote** — a Client tab (production, savings, price, financing-free summary) and a **Contractor tab behind the WONDERMAGIC passcode** (string sizing, cable runs, conduit, combiner/disconnect/breakers, racking takeoff, anchor count and spacing).
7. Everything lands in the cart and the Customer Project Summary like the other suites, and auto-saves per the global UI cache.

## Sun exposure and production

Two numbers side by side, both labelled:

- **House model (instant)** — local Florida irradiance model from tilt, azimuth, latitude, shade factor, panel wattage and system derate. Always available, no network, no cost.
- **Verified (Google Solar API)** — real roof segments, pitch, azimuth and solar flux for the address when coverage exists. Shown as the authoritative figure when it returns; the house model is the fallback and the cross-check.

Outputs: kW DC / kW AC, kWh per month and per year, 25-year production with degradation, offset % against an entered or estimated utility bill, and dollar savings.

## Technical notes

- **Imagery**: Google Maps Platform (managed) connector. Browser key loads Maps JS satellite view; geocoding, Places autocomplete and the Solar API (`solar/v1/buildingInsights:findClosest`, `solar/v1/dataLayers:get`) go through an edge function on the connector gateway with input validation, auth on the endpoint, and address/coords caching so repeat lookups don't re-bill. I'll open the connect card for `google_maps` as the first step.
- **New board kind** `solar` registered in `FlipEditorBoard.tsx` `BOARDS`, so `FlipToolWidget` and the Editor Board route the Solar category (and its models) to the new board instead of the fallback site plan. The existing site board is untouched for all other categories.
- **New files** (roughly): `src/components/solar/SolarCalculatorBoard.tsx` (map + capture + tabs), `src/components/solar/RoofCanvas.tsx` (overlay polygons, vertex drag, heat-map fill, panel layout), `src/lib/solar/roofAutoTrace.ts` (Solar-API segments, then tile edge detection), `src/lib/solar/sunExposure.ts` (per-face irradiance + colour bands), `src/lib/solar/panelLayout.ts` (panel fit per face with setbacks and Florida edge clearances), `src/lib/solar/bomEstimate.ts` (racking/anchor/cable/electrical takeoff and pricing), `src/components/solar/SolarReportTabs.tsx`, plus a `solar-report` edge function for gateway calls.
- **Pricing** stays sourced from `src/data/solarData.ts`, extended with per-watt panel rates, battery, racking-per-anchor and electrical line items so nothing is invented at render time. Existing solar product images and cards are unchanged.
- **Persistence**: `usePersistentState` / `uiCache` for address, crop, roof polygons and configuration, matching the other boards; drawings keyed per board id.
- Panel layout, sun study and takeoff are memoised and run off the polygon geometry only, so the board stays responsive on mobile; the map and canvas are lazy-loaded.

## Out of scope for this pass

- Shade from specific trees modelled in 3D (neighbour shade is a factor, not a raytrace).
- Permit-package PDF generation beyond the existing print/report path.
