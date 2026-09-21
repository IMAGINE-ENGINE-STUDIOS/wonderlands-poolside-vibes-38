# FLIP V8: Calm, arrow-only reading

## What will change
- Add a V8 edition and make it the version shown on the home page.
- Remove animated page-curl/riffle transitions from V8, including category and product opening effects.
- Turn pages only through the visible previous/next arrows; disable swiping, dragging, page-corner gestures, wheel navigation, and automatic hover selection in V8.
- Keep the existing pages, product images, prices, quotes, card outlines, search, cart, and Genius features unchanged.
- Calm the index by removing pointer parallax, wheel controls, hover-driven category changes, long zooms, and intense crossfades while preserving clear arrow browsing and category entry.

## Technical details
- Extend the magazine variant type and inherited feature flags to include `v8`.
- Gate `PageFlipTransMotion`, category/product transition playback, mouse page-turn events, swipe gestures, and page corners behind pre-V8 behavior.
- Add a V8-specific calm mode to the existing index instead of duplicating product data or randomizing entries.
- Retain keyboard left/right arrows as an accessible equivalent to the on-screen arrows.
- Verify the home-page FLIP at desktop and mobile sizes, then confirm the preview build is healthy.
