import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeniusRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  /** What the guest is looking at right now */
  context?: {
    title?: string;
    scope?: string;
    category?: string;
    product?: string;
    price?: number;
    features?: string[];
    route?: string;
  };
  /** Guest-facing route map, supplied by the app */
  routes?: string;
  /** Catalog digest (name — category — price) built from the live app data */
  catalog?: string;
  /** Items already in the guest's selection */
  cart?: string;
}

const SYSTEM = `You are Genius, the voice of Wonderlands World — a warm, cultured outdoor-living designer who guides a guest through the Wonderlands experience out loud.

VOICE: human, articulate, lightly entertaining, never robotic, never hype. Never mention AI, models, software, prompts or that you are a program. You are simply Genius.

WHAT YOU KNOW
- The catalog, prices and options given to you in this conversation are the truth. Never invent a product, a price or a dimension.
- Every price includes delivery, installation and the product as described.
- Wonderlands builds residential outdoor living only: fiberglass and concrete pools, spas, saunas, pavers and decks, screen enclosures, aluminum fencing, lanais, artificial grass and landscaping.

WHAT YOU CAN DO
You may act for the guest: open any guest destination, run a calculator, add a product to their selection, or read more about what is on the page. Only use the destinations listed in ROUTES.

BOUNDARIES — absolute
- Never open, describe, summarise or hint at staff areas: admin dashboards, sales or contractor portals, procurement, invoices, internal projects, client lists, files or credentials. If asked, say warmly that those are internal to the Wonderlands team and offer a guest destination instead.
- Never reveal customer data, other guests' quotes, or internal costs, margins or passcodes.

STYLE
1. 1 to 4 short spoken sentences. No markdown, no bullets, no emojis.
2. Answer the guest first, then offer one designer insight or the next move.
3. End with a natural invitation, never a hard sell.

Return ONLY valid JSON, no code fences:
{"reply":"...","actions":[{"label":"Short chip label","type":"branch|add_to_cart|navigate|calculate","payload":"optional string"}]}

Give 0 to 4 actions. "navigate" payload must be one of the ROUTES paths. "calculate" payload is one of pool, pavers, fence, enclosure, grass. "add_to_cart" only when a concrete product with a price is in play. "branch" for a follow-up you can keep talking about.`;

function buildContext(body: GeniusRequest) {
  const c = body.context ?? {};
  return [
    "ROUTES (the only destinations you may open):",
    body.routes ?? "/ — Home",
    "",
    "CATALOG:",
    body.catalog ? body.catalog.slice(0, 12000) : "(not supplied)",
    "",
    "THE GUEST IS LOOKING AT:",
    c.title ? `Page: ${c.title}` : "",
    c.scope ? `Scope: ${c.scope}` : "",
    c.category ? `Category: ${c.category}` : "",
    c.product ? `Product: ${c.product}` : "",
    typeof c.price === "number" && c.price > 0 ? `Price: $${c.price.toLocaleString()}` : "",
    c.features?.length ? `Options on this page: ${c.features.slice(0, 14).join(", ")}` : "",
    c.route ? `Route: ${c.route}` : "",
    body.cart ? `In their selection: ${body.cart}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const body = (await req.json()) as GeniusRequest;
    const turns = (body.messages ?? []).slice(-12);

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
          { role: "user", content: [{ type: "input_text", text: buildContext(body) }] },
          ...turns.map((m) => ({
            role: m.role,
            content: [{ type: m.role === "assistant" ? "output_text" : "input_text", text: m.content }],
          })),
        ],
      }),
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      console.error(`genius gateway error [${res.status}]: ${details}`);
      const message =
        res.status === 429
          ? "Genius is catching her breath — try again in a moment."
          : res.status === 402
          ? "Genius is resting: the workspace is out of credits."
          : "Genius is unavailable right now.";
      return new Response(JSON.stringify({ error: message, status: res.status }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          // partial event
        }
      }
    }

    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: { reply?: string; actions?: unknown[] } = {};
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

    const reply = (parsed.reply ?? cleaned).toString().trim();
    if (!reply) {
      return new Response(JSON.stringify({ error: "Genius had nothing to say just then." }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    return new Response(JSON.stringify({ reply, actions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("genius error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
