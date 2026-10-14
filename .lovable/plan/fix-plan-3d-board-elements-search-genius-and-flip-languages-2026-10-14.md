# Fix plan: 3D board elements, search Genius and FLIP languages

## 1. Pools and spas cut the turf (and every deck) like the ground
- Today the lawn ("ground") gets a hole per pool, but turf and deck pieces from the board are flat surfaces drawn on top, so they cover the water and flicker.
- Fix: turf/deck surfaces get the same cut as the ground. They are cut by every pool/spa outline plus its coping width, using the same mitred ring the main pool uses. The surface also sits a hair above the lawn so it doesn't flicker.
- Check with a screenshot before and after: two pools over turf, plus one over a deck.

## 2. Extra pools and spas = the main pool's own technology
- Stop drawing extras with the separate simplified "Water" mesh.
- Each extra board pool/spa becomes an entry in the studio's own extra water bodies list (the main pool's system). It gets the same shell, real finish photo, waterline band, coping profile and height, deck tuck-under, lights and depth profile, each with its own settings.
- **Stairs and seats:** each extra pool gets its own stairs/seats lists, built by the same generators the main pool uses (floor-aware stairs, perimeter-following seats) on its own outline.
- **Deck interaction:** the deck surface cuts and tucks under every water body's coping, using the same logic the studio already uses for the main pool.
- Remove the old simplified mesh once the new one works, so there is one way to build a pool.

## 3. One set of widgets, not a new one
- Delete the custom pool settings panel for extras.
- Clicking an extra pool selects it in the studio's existing pool panels (finish, waterline, coping, depth, zero entry, stairs, seats, lights). The panel title shows which pool is being edited, and every change goes to that pool only.
- Fences and screen enclosures keep a small panel, but in the same panel style as the main widgets.

## 4. Fence and screen colors update in 3D
- Find out why color edits don't show: either the edit doesn't trigger a redraw, or the color is dropped when the board is sent to 3D again.
- Fix both. Color and height edits redraw at once, and they are kept when the board is sent to 3D again (same "keep previous 3D settings" rule extras already use).

## 5. Prices for finish, depth and zero entry on extra pools
- Use the same pricing the main pool uses for finish, depth and zero entry. Any option with no rate yet is listed in a short message for you, and nothing is invented.
- These amounts go into the board take-off and the quote.

## 6. Home page search Genius not answering
- Reproduce in the browser: type a question and press Enter, then capture what the page shows and the Genius request.
- Fix the broken step (request, response handling or display) so Genius answers on Enter, with the local catalog answer as a backup. Genius stays on Groq.

## 7. FLIP narrator on the main page works in every language
- Reproduce with Spanish, French and Portuguese questions and narration.
- Make sure every FLIP narrator entry point detects the language, translates the reply through Genius translate, and uses a native voice for that language. Product matching (opening the right page) works on the English-normalised question.
- Test each language end to end in the browser: the right page opens, and the reply text and voice are in that language.

## Order
1, 4 (quick fixes) → 2 + 3 (shared pool system and widgets) → 5 → 6 → 7, each checked in the browser with screenshots.

## Technical notes
- Board extras map to the studio's extra water bodies by item id, and applyBoard3DToItems keeps writing outlines back. The shared board rule in AGENTS.md is updated.
- Board surfaces and terrain cutouts share one list of holes.
- Credits: Imagine Engine Studios Corp.
