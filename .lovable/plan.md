# Fix: Browse Categories panel hidden behind the Studio sidebar

## What's happening

Confirmed in the browser at `/wonderlands-studio`: clicking the header search opens the **Browse Categories** panel, but the right-hand sidebar (Total Configuration Price + Product Categories card) paints on top of it and covers most of the panel.

Cause: the Studio header bar uses `backdrop-blur`. A backdrop filter creates its own stacking context, so the panel's `z-[200]` is trapped inside the header instead of competing with the rest of the page. The header itself has no z-index, so the sidebar — which comes later in the document — wins and draws over the panel.

## The fix

1. Give the Studio header bar in `src/pages/WonderlandsStudio.tsx` a real stacking position (`relative` + a high z-index) so everything inside it, including the search panel, sits above the page body and the sidebar.
2. Make the panel itself portal-proof: render the Browse Categories panel (and the search-results dropdown right below it) in `src/components/AdvancedSearch.tsx` so they are no longer clipped or outranked by any ancestor with a blur/transform. Position is anchored to the search field so it keeps opening directly under the input, still centered and inside the viewport on all widths.
3. Keep the panel inside the visible viewport: cap its height against available space below the header so the top row of category tiles is never cut off.

No changes to panel content, category list, styling, or search behavior — only layering and positioning.

## Technical notes

- Header container: add `relative z-[300]` to the `border-b … bg-background/95 backdrop-blur` wrapper (around line 1900) in `WonderlandsStudio.tsx`.
- `AdvancedSearch.tsx`: the section menu `Card` (line ~836) and results `Card` (line ~885) get rendered through a portal with fixed positioning derived from the input's bounding rect, replacing `absolute top-full` anchoring, with a resize/scroll listener to keep them aligned.
- Sidebar (`sticky top-4`) stays untouched.

## Verification

Re-run the Playwright check on `/wonderlands-studio`: open the search, screenshot, and confirm the panel renders fully above the sidebar and is not clipped at the top. Also verify the same panel on the main page (`/`) still opens correctly.
