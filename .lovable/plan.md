# Design Your Solar System — editorial section

Add a second editorial panel directly under the flipbook, right after the existing "Design your pool, plainly and precisely" block, dedicated to designing a solar system. Same magazine layout, rhythm and typography — solar content.

## What the user sees

- Heading: "Design your solar system, plainly and precisely", with the same eyebrow / hairline rule treatment ("The Studio — Energy Room").
- Left: large solar image (existing `src/assets/solar` art) with a dark gradient and caption "Wonderlands Solar".
- Right: short standfirst plus three numbered steps, hover/tap to swap the left image to that step's solar photo:
  - 01 Survey — roof planes, azimuth and shade modelled before a panel is quoted.
  - 02 Size — array, WonderWall battery, solar pool heating and EV charging matched to the load.
  - 03 Quote — installed turnkey price with incentives and net metering confirmed in writing.
- Two actions: "Explore Wonderlands Solar" (scrolls to the `#solar` collection) and "Get a solar quote" (scrolls to the solar lead form).

## Technical notes

- New `src/components/SolarEditorial.tsx`, structurally mirroring `src/components/StudioEditorial.tsx` (same grid, borders, semantic tokens, button treatment). No new dependencies.
- Images via ES6 imports from `@/assets/solar/` (roof array, battery wall, pool heating, inverter/charger); `loading="lazy"`, `decoding="async"`.
- Step image swap done with local state only — no extra animation library; reuses the existing `animate-fade-in` utility.
- Rendered in `src/pages/Index.tsx` immediately after `<StudioEditorial />` (eager, same as the pool block, so it sits under the flipbook).
- The solar lead form target gets an anchor id on its wrapper in `WonderlandsSolarSection.tsx` so the second CTA can link to it.
- No pricing, data or business logic changes; `solarData.ts` stays the single source for copy that references packages.
