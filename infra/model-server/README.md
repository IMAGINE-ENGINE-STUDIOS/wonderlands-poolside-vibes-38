# Wonderlands model server — self-hosted Meta models (alternative path)

> **Current production path (2026-10-18): Groq.** The founder settled on
> Groq through the Supabase doorway (the Startup Factory Hub pattern), so
> the functions call Groq, not this server. This package remains the
> owned-hardware alternative: if Wonderlands ever moves off Groq, this
> is the drop-in replacement — same OpenAI-compatible API, models on a
> GPU server the founder owns, configured via `LLM_BASE_URL`/`LLM_API_KEY`
> in the transport file (`supabase/functions/_shared/metaChat.ts`).

## Why the models cannot live "in Supabase"

Supabase Edge Functions are small serverless functions (no GPU, strict
memory/CPU limits). They cannot load or run LLM weights — no Supabase
product can. What Supabase does hold is the *configuration*: two secrets
(`LLM_BASE_URL`, `LLM_API_KEY`) pointing at your model server. The
models live on the server; Supabase is the doorway, exactly like it is
for every other backend call the site makes.

## The models

| Model | Serve id (Ollama) | Size | Runs on |
|---|---|---|---|
| Llama 3.1 8B | `llama3.1:8b` | 4.9 GB | Any consumer RTX |
| Code Llama 7B | `codellama:7b` | ~4 GB | Any consumer RTX |
| Code Llama 13B | `codellama:13b` | ~8 GB | High-end RTX |
| Code Llama 34B | `codellama:34b` | ~20 GB | 24 GB+ VRAM (quantized) |
| Llama 3.3 70B | `llama3.3:70b` | ~43 GB | Server GPU / multi-GPU |
| Code Llama 70B | `codellama:70b` | ~40 GB | Server GPU / multi-GPU |
| Llama 4 Scout | `llama4:scout` | large (109B MoE) | Datacenter GPUs |
| Llama 4 Maverick | `llama4:maverick` | large (400B MoE) | Datacenter GPUs |
| **Muse Spark Open** | — | **816B (~1 TB)** | **Cannot be self-hosted.** Catalogued as hosted-only; the self-hosted chain answers instead. |

The fallback chain (in `supabase/functions/_shared/metaChat.ts`) tries
Maverick → Scout → 3.3 70B → 3.1 8B and uses whichever your server
actually has — a small server simply answers with its biggest model.

## Setup

1. On the GPU machine (Linux + NVIDIA driver + Docker + NVIDIA Container
   Toolkit):
   ```bash
   cd infra/model-server
   cp .env.example .env   # set MODEL_DOMAIN + a long random MODEL_API_KEY
   docker compose up -d
   ./pull-models.sh rtx          # or workstation / datacenter
   docker compose --profile tls up -d
   ```
2. Point a DNS record for `MODEL_DOMAIN` at the machine (the Caddy proxy
   gets a real HTTPS certificate automatically).
3. In the Wonderlands Supabase project → Edge Functions → Secrets:
   - `LLM_BASE_URL` = `https://<MODEL_DOMAIN>/v1`
   - `LLM_API_KEY` = the `MODEL_API_KEY` from `.env`
4. Publish in Lovable. Verify from any terminal:
   ```bash
   curl https://<project>.supabase.co/functions/v1/genius \
     -H "apikey: <anon key>" -H "Authorization: Bearer <anon key>" \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"cheapest pool?"}]}'
   ```

## Security rules

- **Never expose Ollama's port 11434 publicly.** It has no auth. The
  Caddy proxy (bearer key + HTTPS) is the only public door, or keep the
  server on a private network (Tailscale) and give Supabase a Tailscale
  Funnel URL as `LLM_BASE_URL`.
- The website's visitors never talk to the model server directly — only
  the Supabase functions do, server-to-server.
- Rotate `MODEL_API_KEY` by changing `.env`, restarting the proxy, and
  updating the Supabase secret.

## vLLM instead of Ollama

For datacenter GPUs, vLLM serves the same OpenAI-compatible API with
higher throughput. Start it with `--served-model-name` matching the
catalog, or change the serve ids in ONE place —
`supabase/functions/_shared/metaModels.ts` (+ its browser copy) — to the
Hugging Face ids (`meta-llama/Llama-4-Scout-17B-16E-Instruct`,
`meta-llama/Llama-4-Maverick-17B-128E-Instruct`,
`meta-llama/Llama-3.3-70B-Instruct`, `meta-llama/Meta-Llama-3.1-8B-Instruct`,
`codellama/CodeLlama-7b-Instruct-hf`, …) and pass vLLM's `--api-key` as
`LLM_API_KEY`.
