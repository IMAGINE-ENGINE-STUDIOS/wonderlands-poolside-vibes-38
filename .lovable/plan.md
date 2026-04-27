

## Convert Homepage Long-Scroll into Dynamic Category Switcher

Replace the current vertical-scroll homepage (where all 16+ product sections stack on top of each other) with a **single-viewport tabbed experience**. The hero stays at top; below it, a sticky horizontal category bar lets users switch between sections instantly — only one section renders at a time, no page growth.

### What the user sees

**Top of page (unchanged):**
- Header
- Hero with search

**New: Sticky Category Bar** (directly below Hero, sticks to top on scroll):
A horizontal scrollable pill bar with all product categories:

```text
[ Pools ] [ Saunas ] [ Spas ] [ Tanning Ledges ] [ Screen Enclosures ]
[ Patio Fencing ] [ Lanai ] [ Pavers ] [ Artificial Grass ] [ Covers ]
[ Driveway Gates ] [ Finishes ] [ Liners ]
```

- Active category: filled teal pill (brand primary)
- Inactive: outlined pill, hover shows teal tint
- Horizontally scrollable on mobile (no wrap), centered on desktop
- Each pill has a small icon (reusing lucide icons already in the project)

**Active section area (below the bar):**
- Only the **selected category** renders — its existing `SectionBanner` + section component (e.g. `SaunaSection`, `PaversSection`) shown in full
- Smooth fade transition (200ms) when switching categories
- Section content keeps its current layout, cards, quote tools, everything — nothing inside the sections changes

**Footer:** unchanged, appears at the bottom of the active section.

### Behavior

- Default category on load: **Pools** (first item).
- Clicking a pill swaps the visible section instantly (client-side only, no route change).
- URL hash syncs: clicking "Saunas" updates URL to `/#saunas`; loading `/#pavers` directly opens the Pavers tab. This preserves existing deep links from the search menu, footer, and SEO sitemap.
- Search-menu navigation (existing `AdvancedSearch` dropdown that links to `#section-id`) continues to work — the page intercepts hash changes and switches the active tab instead of scrolling.
- The previously visible "scroll through everything" experience is gone — page is now ~1 viewport tall plus the active section.

### Performance

- Only the active section's component is mounted at a time (others unmount → no wasted renders, no background image loading, no 3D/heavy-component memory usage).
- Lazy-load each section component with `React.lazy()` so the initial bundle only ships the Pools section + the lightweight category bar.
- Banner images for inactive sections are not requested until that tab is opened.

### Technical implementation

**1. New component** — `src/components/CategoryTabBar.tsx`
- Receives `categories: { id, label, icon }[]`, `activeId`, `onChange(id)`
- Sticky positioned (`sticky top-[64px] z-40`) below header
- Horizontal flex with `overflow-x-auto` on mobile
- Pills use existing `Button` variants — no new design tokens

**2. Refactor** — `src/pages/Index.tsx`
- Replace the long vertical stack with:
  ```tsx
  const SECTIONS = [
    { id: 'pools', label: 'Pools', icon: Waves, banner: null, Component: lazy(() => import('@/components/PoolCatalog')) },
    { id: 'saunas', label: 'Saunas', icon: Flame, banner: saunaBanner, Component: lazy(...) },
    // ...one entry per existing section
  ];
  const [active, setActive] = useState(getInitialFromHash());
  // sync URL hash ↔ active state
  ```
- Render: `<Header /><Hero /><CategoryTabBar .../><Suspense><ActiveBanner /><ActiveSection /></Suspense><Footer />`
- Keep all existing imports of section components — just wrapped in `lazy()`.
- Keep `<Helmet>` SEO block exactly as is.

**3. Hash navigation hook** — small inline `useEffect` in `Index.tsx` listening to `hashchange` to update `active`. No new file needed.

**4. Special "Pools" tab handling**
- The current Pools area contains `PoolCatalog` + the Latham/Gilmer banner + `GilmerPoolsSection`. Group these three into a single Pools tab so the existing pool browsing experience stays intact.

**5. Preserve sub-section anchors**
- Inside each tab's section, existing `id="..."` anchors on the `<SectionBanner>` remain. Hash like `#pavers` opens the Pavers tab; in-section scroll position resets to top.

### What stays the same

- Header, Hero, Footer — untouched
- Every individual section component (`PaversSection`, `SaunaSection`, `SpaCatalog`, `ArtificialGrassSection`, etc.) — untouched
- Product cards, quote tools, banner styling — untouched
- SEO meta, sitemap, brand colors — untouched
- Search menu and existing hash links — continue to work, now switch tabs instead of scrolling
- Order of categories matches current vertical order (no randomization)

