## Add Landscaping Category

Add a new top-level category "Landscaping" to the main page featuring the full plant/tree catalog you provided, with prices multiplied by 3, and product images sourced from the internet.

### What gets built

1. **Data file** `src/data/landscapingData.ts`
   - Type `LandscapingPlant` with: `id`, `name`, `category` (Shrubs / Trees / Palms / Grasses / Groundcover / Vines / Flowering / Tropicals), `image`, `sizes` (array of `{ size: '1 gal' | '3 gal' | '7 gal' | '15 gal' | '30 gal' | '45 gal' | 'B&B', basePrice, finalPrice }`).
   - All ~200 plants encoded from your list. `finalPrice = basePrice * 3` computed once at module load.
   - Helper `getMinPrice(plant)` for card display ("Starting at $X").

2. **Image sourcing**
   - Use Lovable AI Gateway `google/gemini-2.5-flash-image` to generate clean white-background product photos for each plant (consistent style, like a nursery catalog). Saved as webp under `src/assets/landscaping/`.
   - Reason: real-internet image URLs (Google/nursery sites) are unreliable, often hotlink-blocked, and inconsistent in size/style. AI-generated nursery shots give a uniform, professional grid. Each is generated once, committed as an asset, ES6-imported (per project memory).
   - To keep build time reasonable, we generate per unique plant (~180 images). Done in a one-off script.

3. **Section component** `src/components/LandscapingSection.tsx`
   - Light theme, matching `ArtificialGrassSection` styling (consistent with project's light public UI — no cyan/blue text).
   - Top: search input + category filter chips (Shrubs, Trees, Palms, Grasses, Flowering, Vines, Tropicals, Groundcover).
   - Responsive grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`.
   - Card: square image, name, "Starting at $X" (lowest final price across sizes), "View Sizes" button.
   - Click → modal showing all available sizes with their final prices and "Add to Cart" per size (uses existing `useShoppingCart`).
   - Quantity selector inside modal.
   - Lazy-loaded via `React.lazy` like other sections.

4. **Wire into main page** `src/pages/Index.tsx`
   - Add `"landscaping"` to `SectionId` union and `CATEGORIES` array (icon: `Trees` from lucide).
   - Add lazy import + `case "landscaping"` in `renderActive` with a `SectionBanner` (generated landscaping banner image) below the grid, matching the new thin-band pattern.

5. **Right navigation** `src/components/RightNavigation.tsx`
   - Add `{ id: "landscaping", label: "Landscaping", icon: Trees }` to `NAV_ITEMS` so the floating side rail includes it.

6. **Banner asset**
   - Generate `src/assets/banners/landscaping-banner.jpg` (lush Florida landscape, palms + flowering shrubs).

### Pricing (3× markup, examples)

| Plant | Size | Base | Final |
|---|---|---|---|
| Abelia (Light Pink) | 3 gal | $11.95 | **$35.85** |
| Bird of Paradise (White) | 30 gal | $115 | **$345** |
| Crape Myrtle MULTI Natchez | 30 gal | $215 | **$645** |
| Italian Cypress | 45 gal | $425 | **$1,275** |
| Palm, Reclinata | B&B | $2,500 | **$7,500** |
| Live Oak | 45 gal | $450 | **$1,350** |

Multi-trunk / standard variants and "OR" alternative pricing are kept as separate SKUs. Succulent special pricing ($3.50/2", $6.50/4", $9.50/6") is encoded as its own size set.

### Out of scope (confirm if you want them)
- Persisting landscaping products to the Supabase `products` table (currently file-based like `artificialGrassData.ts`).
- Admin CRUD for landscaping plants.
- Adding to Quote Manager / invoice line-item search index.

Once approved, I'll generate the images, build the data file, wire up the section, and add the nav entries.