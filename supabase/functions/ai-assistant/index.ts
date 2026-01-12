import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ProductAction {
  type: "navigate" | "add_to_cart" | "calculate_quote";
  product?: {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    dimensions?: string;
    depth?: string;
  };
  items?: any[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch product data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all product data from database
    const [poolsRes, productsRes, paversRes] = await Promise.all([
      supabase.from("pools").select("*").eq("is_active", true),
      supabase.from("products").select("*").eq("is_active", true),
      supabase.from("pavers").select("*").eq("is_active", true),
    ]);

    const pools = poolsRes.data || [];
    const products = productsRes.data || [];
    const pavers = paversRes.data || [];

    // Categorize products
    const spas = products.filter((p: any) => p.category === "SPAS" || p.subcategory?.toLowerCase().includes("spa"));
    const saunas = products.filter((p: any) => p.category === "SAUNAS" || p.subcategory?.toLowerCase().includes("sauna"));
    const gates = products.filter((p: any) => p.category === "GATES" || p.subcategory?.toLowerCase().includes("gate"));
    const finishes = products.filter((p: any) => p.category === "finish" || p.type_category === "finish");
    const liners = products.filter((p: any) => p.category === "liner" || p.type_category === "liner");

    // Build comprehensive system prompt with live database data
    const systemPrompt = `You are Wonderlands AI - a concise, helpful pool & outdoor living expert.

CRITICAL RULES:
1. SHORT RESPONSES ONLY - 2-3 sentences max, then show products or ask ONE question
2. SHOW PRODUCTS IMMEDIATELY when user asks about any category
3. ONE QUESTION AT A TIME - never ask multiple questions
4. USE ACTION BLOCKS to show products users can click

PRODUCT CATALOG:

POOLS (${pools.length} models): ${pools.slice(0, 10).map((p: any) => `${p.model} $${p.price?.toLocaleString()}`).join(' | ')}

SPAS: ${spas.length > 0 ? spas.map((s: any) => `${s.name} $${s.price?.toLocaleString()}`).join(' | ') : 'Moonlight Spillover $26,000 | Pacifica Spa $24,000 | Pearl Spillover $24,000 | Tranquility Spa $28,000'}

SAUNAS: ${saunas.length > 0 ? saunas.map((s: any) => `${s.name} $${s.price?.toLocaleString()}`).join(' | ') : 'Barrel 4-Person $18,000 | Barrel 6-Person $21,600 | Traditional Indoor $22,800 | Infrared 2-Person $30,000'}

PAVERS: ${pavers.map((p: any) => `${p.name} $${p.base_price}/sqft`).join(' | ')}

ENCLOSURES: Standard $27/sqft | Premium $33/sqft
LANAIS: Standard $60/sqft | Deluxe $80/sqft | Premium $100/sqft

ACTION BLOCKS (put at END of message):

Show product: \`\`\`json
{"action":"navigate","product":{"id":"spa-1","name":"Moonlight Spillover","price":26000,"category":"Spas"}}
\`\`\`

Add to cart: \`\`\`json
{"action":"add_to_cart","product":{"id":"spa-1","name":"Moonlight Spillover","price":26000,"category":"Spas"}}
\`\`\`

EXAMPLES:

User: "I want a spa"
You: "Here are our top spas:

• **Moonlight Spillover** - $26,000 (spillover design)
• **Tranquility Spa** - $28,000 (premium jets)
• **Pacifica Spa** - $24,000 (classic style)

What size are you looking for?"

User: "Show me pools under 70k"
You: "Great budget! Here are pools under $70k:

• **Jamaica** - $46,100 (10x20)
• **Enchantment 9.24** - $60,800 (9x24)
• **St. Lucia** - $59,640 (freeform)

Want to see one in detail?"

REMEMBER: Be brief. Show options. One question only.`;


    // Call Lovable AI Gateway with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
