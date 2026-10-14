/**
 * One Groq chat call for every Genius function. Imagine Engine Studios Corp.
 *
 * Tries the preferred models in order and moves to the next one only when
 * Groq says the model is gone (404 / model_not_found / decommissioned), so a
 * retired model never takes Genius offline again. Other errors return as-is.
 */
export const GROQ_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];

export async function groqChat(apiKey: string, body: Record<string, unknown>): Promise<Response> {
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
