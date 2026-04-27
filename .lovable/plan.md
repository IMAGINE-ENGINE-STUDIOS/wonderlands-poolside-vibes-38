## Goal

Replace the big in-page banners for the **pool collection categories** ("Wonderlands World Collection", "Latham Pools Collection", and the large Astoria/Maxima photo between them) with **thin glossy latex-style raceband banners** — matching the same modern, slim look already used for the section banners on the rest of the home page.

---

## What changes for the user

- The huge centered "Wonderlands World Collection" title block (with subtitle, animated orbs, sparkles, wave SVG) becomes a slim **glossy gradient pill banner** (~48–56px tall) with the title and subtitle inline.
- The full-width Astoria/Maxima image strip between the two pool collections is removed.
- The "Latham Pools Collection" title block becomes the same kind of slim raceband banner.
- The two pool grids stay exactly as they are — no change to the cards, products, images, or layout. Only the section headers shrink.

The result: a clean, modern raceband UI that visually matches the new section banners under each product category.

---

## Technical plan

### 1. New component: `src/components/RacebandBanner.tsx`
- Props: `title`, optional `subtitle`, optional `variant` ("primary" | "coral" | "teal").
- A full-width pill (`rounded-full`, `h-12 md:h-14`) using a horizontal gradient (teal/coral/primary HSL tokens — design-system only, no hardcoded colors).
- Subtle glossy latex sheen: a soft `white/40 → transparent` highlight on the top half and a faint `black/15` shadow on the bottom for depth.
- Title in bold uppercase white text on the left, optional subtitle separated by a thin vertical divider.
- Accessible, lazy-friendly, no images required.

### 2. Edit `src/components/PoolCatalog.tsx`
- **Wonderlands World Collection block (around lines 1009–1055):**
  - Remove the decorative wrapper (gradient orbs, floating Droplets/Sparkles, wave SVG) and the giant centered `<h2>` title block.
  - Replace with `<RacebandBanner title="Wonderlands World Collection" subtitle="Premium Concrete Infinity Pools — The Pinnacle of Luxury" variant="primary" />`.
  - Keep the pool grid (`pools.filter(...).map(...)`) exactly as is.
- **Astoria/Maxima image between collections (lines 1057–1064):** remove entirely.
- **Latham Pools Collection header (lines 1066–1070):** replace with `<RacebandBanner title="Latham Pools Collection" subtitle="Fiberglass Pools with Lifetime Warranty" variant="coral" />`.
- Keep the Latham grid, pagination, and results info untouched.

### 3. No other files changed
- Pool cards, product images, quote logic, and card outlines remain untouched (per project rules).
- The raceband uses only Tailwind semantic tokens (`primary`, `teal`, `coral`) defined in `index.css` / `tailwind.config.ts`.

---

## Files
- **Create:** `src/components/RacebandBanner.tsx`
- **Edit:** `src/components/PoolCatalog.tsx` (swap two collection headers, delete the in-between image strip)

No new dependencies, no DB changes.
