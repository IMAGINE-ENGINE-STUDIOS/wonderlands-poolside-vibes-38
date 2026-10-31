/**
 * One chat call for every Genius function. Imagine Engine Studios Corp.
 *
 * Primary brain (2026-10-30, founder direction "implement the llama" for
 * Foss Theory's Genius): Llama 3.3 70B fp8-fast on Workers AI in the
 * founder's Cloudflare account, served by the genius-brain Worker
 * (Workers AI binding — no API token in the serving path). This backend
 * also powers fosstheory.com/app/, so both surfaces get the same brain.
 * GENIUS_BRAIN_URL + GENIUS_BRAIN_KEY secrets configure it; while either
 * is unset, or the Worker errors, the call falls through to Groq.
 *
 * Groq fallback: tries the preferred models in order and moves to the
 * next one only when Groq says the model is gone (404 / model_not_found /
 * decommissioned), so a retired model never takes Genius offline. Note
 * her Groq key has NO access to Meta/Llama models (proven 2026-10-18 —
 * Groq moved Llama to the Enterprise tier), so on Groq alone the chain
 * lands on gpt-oss; Llama only truly serves via the brain above.
 */
export const GROQ_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];
export const BRAIN_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

async function brainChat(body: Record<string, unknown>): Promise<Response | null> {
  const url = Deno.env.get("GENIUS_BRAIN_URL");
  const key = Deno.env.get("GENIUS_BRAIN_KEY");
  if (!url || !key) return null;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: BRAIN_MODEL }),
    });
    if (r.ok) return r;
    console.warn(`genius brain unavailable (${r.status}); falling back to Groq chain`);
    await r.text().catch(() => "");
    return null;
  } catch (e) {
    console.warn("genius brain unreachable; falling back to Groq chain", e);
    return null;
  }
}

export async function groqChat(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  const brain = await brainChat(body);
  if (brain) return brain;
  let last: Response | null = null;
  for (const model of GROQ_MODELS) {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model }),
    });
    if (r.ok) return r;
    const text = await r.text().catch(() => "");
    const gone = r.status === 404 || /model_not_found|decommissioned|does not exist/i.test(text);
    last = new Response(text, { status: r.status });
    if (!gone) return last;
    console.warn(`groq model ${model} unavailable (${r.status}); trying next`);
  }
  return last ?? new Response("no model", { status: 503 });
}
