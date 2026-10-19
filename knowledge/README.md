# Wonderlands Knowledge Base

The single home for what Wonderlands' AI (Genius) knows and how it works.
Code reads the live data files in `src/data/` — this folder is the human-readable
knowledge layer on top of them: products, surfaces, rules and model logic.
When a fact here and a data file disagree, the data file wins and this folder
must be corrected.

## Contents

- `products-pools.md` — every pool, spa, sauna, tanning ledge, cover and gate in
  the live catalog (name, brand, dimensions, depth, price), generated from
  `src/data/poolProductLookup.ts`.
- `products-more.md` — the remaining ranges (pavers, screens, fences, turf,
  landscaping, solar) and where their live data lives.
- `main-page.md` — the homepage: hero search, Genius answers, calculators, and
  the conversation rules (including how Yes/No follow-ups must behave).
- `design-studio.md` — the Design Studio specification: 2D designer, 3D MODE,
  what Genius must be able to draw, move and restyle, and the placement rules.
- `solar-genius.md` — Solar Genius surfaces and data.
- `flip.md` — the FLIP book: structure, editions, and how Genius reads it.
- `landscaping/` — the landscaping library: every plant Wonderlands sells
  (`products-landscaping.md`, from `src/data/landscapingData.ts`), the 1:1
  real-world scale logic for 3D models (`scale-table.md`), the placement law
  with the planter refinement (`placement-law.md`), named design patterns
  (`landscape-patterns.md`), and the example-image library index
  (`examples/README.md`).
- `model-routing.md` — the comprehensive logic for choosing which Meta model
  answers which kind of user request. Implemented in
  `src/lib/modelRouter.ts` and `supabase/functions/_shared/modelRouter.ts`.

## Rules for every AI surface

1. Quote only real catalog data — never invent a product, price or dimension.
2. Every price includes delivery and installation, as described.
3. Local, deterministic answers first (price lookups, page turns, design-bus
   commands); a model is called only when the local layer cannot answer.
4. Meta models only in the Genius path, served by Groq through the
   Supabase doorway (the Startup Factory Hub pattern; `GROQ_API_KEY`
   secret). No OpenRouter. The self-hosted alternative stays packaged in
   `infra/model-server/` for owned-hardware builds.
5. A user's explicit model pick (the FLIP model flipper) always wins over the
   router; the router only decides when no pick was made.
