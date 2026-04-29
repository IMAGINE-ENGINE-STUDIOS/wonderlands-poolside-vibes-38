## Add "Browse Categories" Editorial Section to Homepage

A new minimalist, luxury-architecture-magazine inspired section will be added to the main page (`/`) listing all 14 product categories from the right navigation menu. Clicking any tile updates the hash and switches the active section, mirroring the right-nav behavior.

### Where it goes

In `src/pages/Index.tsx`, between `<MissionVisionValues />` and `<main>`. It always renders (regardless of which section is active), serving as a persistent visual index/jump-bar above the catalog.

### Design — editorial, minimalist, rich

Inspired by AD/Wallpaper/Dezeen layouts:

- **Section header**: thin uppercase eyebrow ("Collections / Index"), large serif/light display heading ("Browse the Wonderlands Atelier"), a single hairline divider beneath. Generous vertical padding (py-20+).
- **Grid**: responsive editorial grid — 2 cols mobile, 3 cols tablet, 4 cols desktop. Asymmetric rhythm: every 5th tile spans 2 cols on desktop for a magazine feel (optional, kept subtle).
- **Each tile**:
  - Tall portrait aspect (aspect-[3/4]), full-bleed category banner image (reuse banners already imported in `Index.tsx`: `lathamGilmerBanner`, `saunaBanner`, `spaBanner`, `tanningLedgeBanner`, `screenEnclosureBanner`, `patioFencingBanner`, `lanaiBanner`, `paversBanner`, `grassBanner`, `landscapingBanner`, `coversBanner`, `drivewayGateBanner`; finishes/liners use existing finishes/liners assets).
  - Subtle dark gradient overlay bottom-to-top for legibility.
  - Bottom-left meta block: small numeric index ("01" — "14"), thin uppercase label, hairline rule, category name in light serif/display font.
  - Hover: image scale 1.03, overlay deepens, label slides up slightly, hairline expands. All transitions ~500ms ease-out.
  - Cursor pointer; entire tile clickable.
- **Color/style**: neutral background (uses existing theme bg), white text on tiles, no chip badges or buttons. No emojis. No icons inside tiles (icons stay only in the right-nav). Pure typography + photography.
- **Footer of section**: small centered caption ("Fourteen categories. One world.") and a hairline link "View full index ↓" that scrolls to the active catalog `<main>`.

### Behavior

- Reuses the same 14 categories defined in `Index.tsx` `CATEGORIES`.
- Click handler: `handleChange(id)` (already exists in `Index.tsx`) — passed into the new component as a prop. Updates hash + active state, scrolling smoothly to the catalog area.
- No new routes, no new data, no changes to existing cards/quotes/product images.

### Technical details

- New file: `src/components/BrowseCategoriesEditorial.tsx`
  - Props: `{ activeId: SectionId; onSelect: (id: string) => void }`
  - Imports the 14 banner assets (same imports as `Index.tsx` — extract to a small shared map if duplication is a concern; otherwise duplicate the imports locally for zero coupling).
  - Renders the grid as described. Uses Tailwind only (no new deps).
  - Active tile gets a thin accent ring (`ring-1 ring-foreground/40`) and slightly elevated label.
- `src/pages/Index.tsx`:
  - Import and render `<BrowseCategoriesEditorial activeId={active} onSelect={handleChange} />` after `<MissionVisionValues />`.
  - On select, after calling `handleChange(id)`, scroll `<main>` into view smoothly.
- No changes to: `RightNavigation.tsx`, product cards, quote tools, pricing, images.

### Out of scope

- No edits to existing sections, cards, or quotes.
- No new images uploaded — only existing banner assets reused.
- No mobile drawer/menu changes.
