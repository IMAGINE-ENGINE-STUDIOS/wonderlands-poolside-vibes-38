

## Add Artificial Grass Section + Instant Quote Tool

Create a dedicated **Artificial Grass** section on the homepage (styled like the Spa/Sauna sections) showcasing all 5 grass color options, with an instant quote tool that calculates pricing based on square footage at $25/sq ft.

### What the user sees

**On the homepage** (`/`): A new "Artificial Grass" section appears between the Pavers and Covers sections, with:
- A section banner (matching style of other sections)
- Grid of 5 grass color cards: Light Green, Dark Green, Natural Green, Emerald, Olive
- Each card shows the grass texture image, color name, and "$25/sq ft" pricing
- An **"Instant Quote"** button on each card that opens a modal

**Instant Quote modal**:
- Shows selected grass color with image preview
- Square footage input (number field)
- Live price calculation: `sqft × $25`
- Total displayed prominently
- "Request Full Quote" button → opens existing `SurveyQuoteTool` with the grass pre-loaded as a custom product (price + image flow through to the final quote, just like the Sauna/Gilmer Spa sections already do)

**Header navigation**: Add "Artificial Grass" link to the search/navigation menu pointing to `#artificial-grass`.

### Technical implementation

**1. New data file** — `src/data/artificialGrassData.ts`
```ts
import grassLightGreen from '@/assets/grass-light-green.avif';
// ...other 4 imports
export const PRICE_PER_SQFT = 25;
export const artificialGrassOptions = [
  { id: 'light-green', name: 'Light Green', image: grassLightGreen },
  { id: 'dark-green', name: 'Dark Green', image: grassDarkGreen },
  { id: 'natural-green', name: 'Natural Green', image: grassNaturalGreen },
  { id: 'emerald', name: 'Emerald', image: grassEmerald },
  { id: 'olive', name: 'Olive', image: grassOlive },
];
```

**2. New component** — `src/components/ArtificialGrassSection.tsx`
- Mirrors structure of `SaunaSection.tsx` / `GilmerSpasSection.tsx`
- Renders 4-column responsive grid of grass cards
- Each card uses existing card outline pattern (no new styles)
- Manages `showQuoteModal`, `selectedGrass`, `sqft` state
- Opens `SurveyQuoteTool` with `customProduct` prop (existing pattern from `GilmerSpasSection`):
  ```ts
  customProduct={{
    name: `Artificial Grass - ${selectedGrass.name} (${sqft} sq ft)`,
    price: sqft * 25,
    type: 'grass',
    image: selectedGrass.image
  }}
  ```

**3. New banner component reuse** — `src/components/Index.tsx`
- Add a `SectionBanner` for grass + lazy-loaded `ArtificialGrassSection`
- Position: between PaversSection and CoversSection
- Uses existing `paversBanner` style pattern; banner image: reuse one of the grass textures (no new asset needed)

**4. Quote integration**
- The `SurveyQuoteTool` already accepts `customProduct` prop and renders it with the correct image and price (verified — same path used by Sauna/Spa sections).
- No changes needed to `SurveyQuoteTool.tsx` itself.

**5. Search menu link** — `src/components/Header.tsx` (or wherever the section nav lives)
- Add "Artificial Grass" entry pointing to `#artificial-grass` so it follows the existing search-menu-section-navigation rule.

### What stays the same

- No changes to product card outlines, quote tool styling, or other product images
- No new images created — reuses the 5 existing grass `.avif` assets
- No DB changes
- No changes to pricing constants in pool product cards (still $25/sq ft, consistent)
- No randomization — grass colors render in fixed order: Light → Dark → Natural → Emerald → Olive

