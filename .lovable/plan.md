# Studio landing canvas + search that flies to the corner

## What changes

**1. No more empty state.** The "Select a product to start configuring" placeholder in the Studio canvas is replaced by a real landing surface: a gallery of every pool in the catalog (Wonderlands + Gilmer), sorted least to most expensive per the existing rule, using the same product card outline and images already in use. Each card selects that pool and drops straight into the configurator.

The landing also carries a short header ("Design your pool" + one line of copy) and a row of category shortcuts (Spas, Saunas, Tanning Ledges, Screen Enclosures, Fencing, and the rest) so the landing reflects the active category — pick Saunas and the gallery shows saunas, not pools. Pools is the default.

**2. Search moves to the center.** While nothing is selected, the search field renders large and centered above the gallery. The moment a product is selected, it animates smoothly back up into its header corner slot, and animates back to center if the selection is cleared. It stays a single search instance, so typing, focus, and the Browse Categories panel keep working in both positions.

## Technical notes

- New `src/components/studio/StudioLandingCanvas.tsx`: takes the already-computed product list from `getFilteredProducts()`, the active category, and callbacks for select/category-change. Renders the gallery grid (price ascending) and the category shortcut row. No new data source, no new images, no randomization.
- `src/pages/WonderlandsStudio.tsx` line ~3580: swap the empty `Card` for `<StudioLandingCanvas />`.
- Search relocation: wrap the existing single `<AdvancedSearch variant="slim" />` in a `framer-motion` element with a shared `layoutId`, rendered into the centered landing slot when `!selectedProduct` and into the header slot when a product is selected. Framer Motion's shared-layout transition handles the fly-to-corner animation (spring, ~400ms); the header keeps its width reserved so nothing jumps. Variant switches to the full (non-slim) look while centered.
- Header layering fix from the previous pass still applies so the Browse Categories panel stays above the sidebar in both positions.

## Verification

Playwright on `/wonderlands-studio`: screenshot the landing (centered search + pool gallery), click a pool, screenshot again to confirm the search has settled in the header corner and the configurator is showing; then check a non-pool category shortcut renders the right gallery.
