/**
 * One Meta-model chat call for Genius, against the founder's SELF-HOSTED
 * model server. Imagine Engine Studios Corp.
 *
 * No OpenRouter, no Groq (founder direction 2026-10-18). The server is
 * any OpenAI-compatible endpoint (Ollama or vLLM — see
 * infra/model-server/) configured through Supabase secrets:
 *   LLM_BASE_URL  e.g. https://models.example.com/v1  (required)
 *   LLM_API_KEY   bearer key for the endpoint        (optional; Ollama
 *                 behind an authenticated proxy uses it, plain local
 *                 Ollama needs none)
 *
 * The caller's preferred model is tried first; any failure advances the
 * self-hosted fallback chain, so a model choice never takes Genius
 * offline. Chain: Llama 4 Maverick -> Llama 4 Scout -> Llama 3.3 70B ->
 * Llama 3.1 8B (whichever the server actually has answers first).
 */
import { META_MODELS } from "./metaModels.ts";

export interface LLMConfig {
  baseUrl: string | null;
  apiKey: string | null;
}

/** Read the self-hosted endpoint configuration from the environment. */
export function llmConfig(): LLMConfig {
  const base = Deno.env.get("LLM_BASE_URL")?.trim().replace(/\/$/, "") ?? "";
  return {
    baseUrl: base ? base : null,
    apiKey: Deno.env.get("LLM_API_KEY")?.trim() || null,
  };
}

export const META_CHAT_CHAIN: string[] = [
  "llama4:maverick",
  "llama4:scout",
  "llama3.3:70b",
  "llama3.1:8b",
];

export async function metaChat(cfg: LLMConfig, body: Record<string, unknown>, preferredModel?: string | null): Promise<Response> {
  if (!cfg.baseUrl) {
    return new Response(JSON.stringify({ error: "Self-hosted model endpoint is not configured (set LLM_BASE_URL)" }), { status: 500 });
  }
  const chain = preferredModel && !META_CHAT_CHAIN.includes(preferredModel) ? [preferredModel, ...META_CHAT_CHAIN] : [...META_CHAT_CHAIN];
  let last: Response | null = null;
  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    let r: Response;
    try {
      r = await fetch(`${cfg.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
        },
        body: JSON.stringify({ ...body, model }),
      });
    } catch (e) {
      // Server unreachable (offline, DNS, TLS): the next model lives on the
      // same server, so this is fatal for the call, not for the chain.
      console.error(`meta endpoint unreachable: ${e instanceof Error ? e.message : e}`);
      return new Response(JSON.stringify({ error: "Model server unreachable" }), { status: 502 });
    }
    if (r.ok) return r;
    const text = await r.text().catch(() => "");
    const gone = r.status === 404 || /model_not_found|not found|does not exist/i.test(text);
    last = new Response(text, { status: r.status });
    const isPreferred = preferredModel != null && i === 0 && model === preferredModel;
    if (!gone && !isPreferred) return last;
    console.warn(`meta model ${model} unavailable (${r.status}); trying next`);
  }
  return last ?? new Response("no model", { status: 503 });
}

/** Catalog keys in flipper order, for callers that need the live list. */
export const META_MODEL_KEYS = META_MODELS.map((m) => m.key);
