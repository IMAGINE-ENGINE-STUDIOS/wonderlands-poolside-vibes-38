/**
 * One Meta-model chat call for FLIP's Genius. Imagine Engine Studios Corp.
 *
 * Groq-free by design: every model is Meta's, served through OpenRouter's
 * OpenAI-compatible API (OPENROUTER_API_KEY). The guest's flipped-to model
 * is tried first; if it fails for any reason the Meta-only fallback chain
 * below answers, so a model choice never takes Genius offline. A retired
 * model (404 / model_not_found) also advances the chain.
 *
 * Chain order: Muse Spark Open -> Llama 4 Maverick -> Llama 4 Scout ->
 * Llama 3.3 70B.
 */
import { META_MODELS } from "./metaModels.ts";

export const META_CHAT_CHAIN: string[] = [
  "meta/muse-spark-open",
  "meta-llama/llama-4-maverick",
  "meta-llama/llama-4-scout",
  "meta-llama/llama-3.3-70b-instruct",
];

export async function metaChat(apiKey: string, body: Record<string, unknown>, preferredModel?: string | null): Promise<Response> {
  const chain = preferredModel && !META_CHAT_CHAIN.includes(preferredModel) ? [preferredModel, ...META_CHAT_CHAIN] : [...META_CHAT_CHAIN];
  let last: Response | null = null;
  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model }),
    });
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
