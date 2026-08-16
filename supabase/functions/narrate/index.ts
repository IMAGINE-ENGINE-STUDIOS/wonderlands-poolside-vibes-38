import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NarrateContext {
  scope?: string; // "index" | "category" | "product" | "feature" | "page"
  title?: string;
  category?: string;
  product?: string;
  price?: number;
  features?: string[];
  route?: string;
  history?: string[];
}

const SYSTEM = `You are the Wonderlands World narrator — a warm, articulate outdoor-living designer who reads a luxury magazine aloud to a guest.

VOICE: cultured, human, lightly entertaining. Never robotic. Never salesy hype. Never mention AI, models, or software.

RULES
1. 2 to 4 short sentences. Spoken language, no markdown, no bullet points, no emojis.
2. Describe what is actually on the page in front of the guest, then give one designer insight they would not know.
3. All prices include delivery, installation and the product as described.
4. End with a natural invitation, never a hard sell.

Return ONLY valid JSON, no code fences:
{"script":"...","actions":[{"label":"Short chip label","type":"branch|add_to_cart|navigate|calculate","payload":"optional string"}]}

Give 2 to 4 actions. Use "branch" for "tell me more" style follow-ups, "add_to_cart" only when a concrete product is on the page, "navigate" with a payload path like /wonderlands-studio, "calculate" with a payload of pool, pavers, fence, enclosure or grass.`;

function buildPrompt(ctx: NarrateContext) {
  const lines = [
    `Scope: ${ctx.scope ?? "page"}`,
    ctx.title ? `Page title: ${ctx.title}` : "",
    ctx.category ? `Category: ${ctx.category}` : "",
    ctx.product ? `Product: ${ctx.product}` : "",
    typeof ctx.price === "number" && ctx.price > 0 ? `Price: $${ctx.price.toLocaleString()}` : "",
    ctx.features?.length ? `Options on this page: ${ctx.features.slice(0, 12).join(", ")}` : "",
    ctx.route ? `Route: ${ctx.route}` : "",
    ctx.history?.length ? `Already narrated: ${ctx.history.slice(-3).join(" | ")}` : "",
  ].filter(Boolean);
  return `Narrate this page for the guest.\n${lines.join("\n")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const ctx = (await req.json()) as NarrateContext;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        stream: true,
        store: false,
        instructions: SYSTEM,
        input: [
          { role: "user", content: [{ type: "input_text", text: buildPrompt(ctx) }] },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`narrate gateway error [${res.status}]: ${body}`);
      const message =
        res.status === 429
          ? "The narrator is catching her breath. Try again in a moment."
          : res.status === 402
          ? "Narration credits are exhausted."
          : "The narrator is unavailable right now.";
      return new Response(JSON.stringify({ error: message, status: res.status, details: body }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Consume the SSE stream server-side and return the assembled JSON script.
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const raw = buffer.slice(0, idx).replace(/\r$/, "");
        buffer = buffer.slice(idx + 1);
        if (!raw.startsWith("data:")) continue;
        const payload = raw.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && !text) {
            text = evt.response?.output_text ?? "";
          }
        } catch {
          // partial event, ignore
        }
      }
    }

    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: { script?: string; actions?: unknown[] } = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch { /* fall through */ }
      }
    }

    const script = (parsed.script ?? cleaned).toString().trim();
    if (!script) {
      return new Response(
        JSON.stringify({ error: "The narrator had nothing to say for this page." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const actions = Array.isArray(parsed.actions)
      ? parsed.actions
          .filter((a: any) => a && typeof a.label === "string")
          .slice(0, 4)
          .map((a: any) => ({
            label: String(a.label).slice(0, 40),
            type: ["branch", "add_to_cart", "navigate", "calculate"].includes(a.type) ? a.type : "branch",
            payload: typeof a.payload === "string" ? a.payload : undefined,
          }))
      : [];

    return new Response(JSON.stringify({ script, actions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("narrate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
