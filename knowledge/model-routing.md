# Model routing — how Genius chooses the right Meta model for the task

Implemented in `supabase/functions/_shared/modelRouter.ts` (server) and
`src/lib/modelRouter.ts` (browser mirror). Every model is Meta's, served
by Groq through the Supabase functions (`GROQ_API_KEY` secret) — the
Startup Factory Hub pattern. The catalog itself lives in `metaModels.ts`.
Muse Spark Open routes as a limited Groq preview; when the preview is
unavailable the Meta-only chain advances past it automatically.

## The cascade (cheapest first)

0. **No model at all.** Deterministic local layers answer first and cost
   nothing: catalog price questions (`answerPriceQuestion`), intent answers
   (`answerIntent`), FLIP page turns and product lookups (the flip brain),
   design-bus commands (resize, clear, describe), cart and booking flows.
   A model is only called for what the local layer cannot resolve.
1. **The user's pick wins.** If the guest flipped to a model in FLIP, that
   model is used, with the Meta-only chain as its safety net.
2. **The router picks by task** when there is no explicit pick:

| Task | Model | Why |
|---|---|---|
| `agentic` — multi-step work, tool use, code, "do X then Y then Z" | Muse Spark Open | Built for end-to-end agentic workflows; 42B active, strongest tool use |
| `vision` — the request includes an image, photo or screenshot | Llama 4 Maverick | Natively multimodal, strongest Llama vision + reasoning |
| `vision-agentic` — image plus a multi-step job | Muse Spark Open | Multimodal and agentic |
| `scene3d` — building or restyling a 3D scene, complex landscaping composition | Llama 4 Maverick | Spatial composition + multimodal grounding; Spark as fallback |
| `design` — Design Studio help beyond the local design bus (complex layouts, multi-object plans) | Llama 4 Maverick (complex) / Llama 4 Scout (simple) | Maverick for multi-object spatial plans; Scout for quick single-object help |
| `search` / `qa` — product questions, prices, comparisons, explanations | Llama 3.3 70B | Most reliable catalog Q&A voice; the established Genius default |
| `bulk` — summarising or digesting long documents / whole catalogs | Llama 4 Scout | Longest context (1.3M tokens), low cost |
| `quick` — one-line facts, chips, classifications, translations of short strings | Llama 3.1 8B | Smallest, fastest, cheapest; enough for a one-liner |
| `local` — self-hosted builds (Ollama) | llama3.1:8b / codellama:* per task | Code tasks route to Code Llama sizes by GPU: 7B (consumer), 13B (high-end), 34B/70B (server) |

3. **Fallback is always Meta-only.** If the chosen model fails, the chain
   answers in this order: Muse Spark Open → Llama 4 Maverick → Llama 4
   Scout → Llama 3.3 70B. A failure never surfaces to the guest as a dead end.

## Complexity signals the router reads

- Image attached or referenced ("this photo", an upload) → vision class.
- Multiple verbs / steps, "and then", tool or code words → agentic class.
- "3D", "scene", "landscape it", "make it beautiful", several objects at
  once → scene3d / complex design.
- A single object + a single action in the Design Studio → simple design.
- Length of pasted material > ~8k characters → bulk.
- Everything else on a product surface → qa.

## Explaining products

Product explanations are `qa` (Llama 3.3 70B) grounded in the knowledge
digest — the model narrates, but every name, price, dimension and warranty
must come from the catalog digest, never from the model's own memory.
