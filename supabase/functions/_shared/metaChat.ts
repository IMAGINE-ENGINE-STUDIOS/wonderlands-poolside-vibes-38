/**
 * One Meta-model chat call for Genius, served by Groq — the same pattern
 * as Startup Factory Hub: the Supabase function is the doorway, the
 * GROQ_API_KEY secret is the founder's, Groq's LPUs do the math.
 * Imagine Engine Studios Corp.
 *
 * The chain is META-ONLY — Groq also hosts non-Meta models (GPT-OSS,
 * Qwen) and none of them are in this chain:
 *   Muse Spark Open -> Llama 4 Maverick -> Llama 4 Scout ->
 *   Llama 3.3 70B -> Llama 3.1 8B.
 *
 * Resilience rules (learned live 2026-10-18: Groq rejects an
 * unavailable preview model with a slow HTTP 400, which killed Genius
 * when the chain stopped at the first model):
 * - The caller's preferred model goes first; ANY model-level failure
 *   advances the chain — 400/404/410/422 (model unavailable/rejected),
 *   429 (per-model rate limits differ), 5xx, and per-attempt timeouts.
 * - Only a 401 (the API key itself is invalid) stops the chain: every
 *   model would fail the same way.
 * - Each attempt is capped (25s) so one hung model cannot eat the
 *   function's whole time budget.
 */
import { META_MODELS } from "./metaModels.ts";

export interface LLMConfig {
  apiKey: string | null;
}

/** Read the Groq configuration from the environment. */
export function llmConfig(): LLMConfig {
  return { apiKey: Deno.env.get("GROQ_API_KEY")?.trim() || null };
}

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const ATTEMPT_TIMEOUT_MS = 25_000;

export const META_CHAT_CHAIN: string[] = [
  "meta-models/muse-spark-open",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

export async function metaChat(cfg: LLMConfig, body: Record<string, unknown>, preferredModel?: string | null): Promise<Response> {
  if (!cfg.apiKey) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY is not configured" }), { status: 500 });
  }
  // Sent WITHOUT response_format: several Groq-served Meta models reject
  // json_object mode (observed live as chain-wide failures), while the
  // callers' system prompts already require JSON and their parsers
  // extract it tolerantly. Everything else in the caller's body passes.
  const { response_format: _dropped, ...wireBody } = body;
  const chain = preferredModel && !META_CHAT_CHAIN.includes(preferredModel) ? [preferredModel, ...META_CHAT_CHAIN] : [...META_CHAT_CHAIN];
  let last: Response | null = null;
  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    const isLast = i === chain.length - 1;
    let r: Response;
    try {
      r = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...wireBody, model }),
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
    } catch (e) {
      const timedOut = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
      if (timedOut && !isLast) {
        console.warn(`meta model ${model} timed out; trying next`);
        continue;
      }
      console.error(`groq call failed on ${model}: ${e instanceof Error ? e.message : e}`);
      return new Response(JSON.stringify({ error: timedOut ? "Model timed out" : "Model provider unreachable" }), { status: 502 });
    }
    if (r.ok) return r;
    const text = await r.text().catch(() => "");
    last = new Response(text, { status: r.status });
    if (r.status === 401) return last; // the key itself is wrong; no model will work
    if (!isLast) {
      console.warn(`meta model ${model} unavailable (${r.status}); trying next`);
      continue;
    }
    return last;
  }
  return last ?? new Response("no model", { status: 503 });
}

/** Catalog keys in flipper order, for callers that need the live list. */
export const META_MODEL_KEYS = META_MODELS.map((m) => m.key);
