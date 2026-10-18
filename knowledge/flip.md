# FLIP — the book on the main page

FLIP is Wonderlands' living catalog: a page-turning book of editions
(pools, spas, saunas, pavers, covers, gates, fencing, screens, turf,
solar…), each edition holding model spreads with Options, Price Sheet,
Specification, Portfolio, Estimate and Drawing Board pages.

Key code:

- `src/pages/FlipLab.tsx`, `src/components/flip/` — the book itself
- `src/lib/flipPageRegistry.ts` — the live page manifest Genius reads
- `src/lib/geniusFlipBrain.ts` — local FLIP brain: page turns, editions,
  product and price resolution in the browser, no model call
- `src/lib/flipChips.ts` — the navigation chips beside every answer
- `src/components/ai/GeniusOrb.tsx` — the Genius panel woven into FLIP,
  including the **Model flipper**: the guest can flip Genius between
  Muse Spark Open, Llama 4 Maverick, Llama 4 Scout, Llama 3.3 70B and
  Llama 3.1 8B (Code Llama shows as local-only). The pick persists and
  wins over the model router.

Genius treats FLIP as the main content: asked for a product or a price,
she flips the book to it, she does not just talk about it. Free-form
questions the local brain cannot resolve go to the `genius` function
(task `qa`, or the guest's flipped pick).
