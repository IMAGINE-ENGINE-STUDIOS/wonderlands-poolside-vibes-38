/**
 * One Meta-model chat call for Genius, served by Groq — the same pattern
 * as Startup Factory Hub: the Supabase function is the doorway, the
 * GROQ_API_KEY secret is the founder's, Groq's LPUs do the math.
 * Imagine Engine Studios Corp.
 *
 * Founder direction 2026-10-18: "use the groq then" (after the OpenRouter
 * and self-hosted detours). The chain is META-ONLY — Groq also hosts
 * non-Meta models (GPT-OSS, Qwen) and none of them are in this chain.
 * The guest's preferred model is tried first; any failure advances the
 * chain, so a pick never takes Genius offline. Muse Spark Open is a
 * limited preview on Groq: when it is unavailable the chain simply
 * advances past it.
 *
 * Chain: Muse Spark Open -> Llama 4 Maverick -> Llama 4 Scout ->
 * Llama 3.3 70B -> Llama 3.1 8B.
 *
 * The self-hosted alternative (the founder's own Ollama/vLLM server)
 * remains packaged in infra/model-server/ — switching back is a
 * transport change in this one file plus the serve ids in metaModels.ts.
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
  const chain = preferredModel && !META_CHAT_CHAIN.includes(preferredModel) ? [preferredModel, ...META_CHAT_CHAIN] : [...META_CHAT_CHAIN];
  let last: Response | null = null;
  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    let r: Response;
    try {
      r = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, model }),
      });
    } catch (e) {
      console.error(`groq unreachable: ${e instanceof Error ? e.message : e}`);
      return new Response(JSON.stringify({ error: "Model provider unreachable" }), { status: 502 });
    }
    if (r.ok) return r;
    const text = await r.text().catch(() => "");
    const gone = r.status === 404 || /model_not_found|decommissioned|does not exist/i.test(text);
    last = new Response(text, { status: r.status });
    const isPreferred = preferredModel != null && i === 0 && model === preferredModel;
    if (!gone && !isPreferred) return last;
    console.warn(`meta model ${model} unavailable (${r.status}); trying next`);
  }
  return last ?? new Response("no model", { status: 503 });
}

/** Catalog keys in flipper order, for callers that need the live list. */
export const META_MODEL_KEYS = META_MODELS.map((m) => m.key);
