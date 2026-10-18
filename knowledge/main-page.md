# The main page — search, Genius and calculators

## Surfaces

- **Hero search** (`src/components/AdvancedSearch.tsx` + `src/hooks/useInlineAISearch.ts`):
  the big search bar over the hero. A guest types what they are looking for;
  Genius answers with a summary, real product cards from the live catalog,
  a follow-up question with options (Yes/No or choices), and calculator
  shortcuts (Pavers, Screen, Fence, Lanai).
- **Floating search** (`src/components/search/FloatingAISearch.tsx`): the same
  hook in a dockable bar, also used inside the Studio.
- **Genius panel** (FLIP and site-wide): see `flip.md`.

## How an answer is produced

1. Local catalog logic first: price questions ("cheapest pool", "spas under
   $20k") and intent answers resolve in the browser from
   `src/lib/geniusKnowledge.ts` — exact figures, no model call.
2. Otherwise the `genius` Supabase function answers from the knowledge
   digest (products, rates, warranties) with the model chosen by
   `model-routing.md` (task `search`/`qa` → Llama 3.3 70B by default).
3. Product cards under the answer come from `intentProducts()` — real
   catalog entries sorted by price or size as asked.

## Conversation rules (the Yes/No contract)

- A follow-up answer is a NEW turn, not a repeat of the first question.
  Clicking Yes or No must never return the same summary and the same
  question again. (This was the reported bug: follow-ups were re-run
  through the price shortcut, which answered the original question
  verbatim and looped forever.)
- Follow-ups go to the `genius` function with the conversation so far
  (the answer given, the question asked, the guest's reply) and skip the
  local price shortcut.
- "Yes" continues the branch the question offered (more options, next step).
- "No" pivots: offer the alternative named in the question (e.g. "or start
  a design" → Design Studio) plus the standing exits — browse the FLIP
  book, run a calculator, book a consultation — without asking another
  yes/no question.
- Questions about size, area, budget or perimeter ask for text input
  instead of Yes/No buttons.
