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
      supabase.from("pools").select("*").eq("is_active", true).order("price"),
      supabase.from("products").select("*").eq("is_active", true).order("price"),
      supabase.from("pavers").select("*").eq("is_active", true),
    ]);

    const pools = poolsRes.data || [];
    const products = productsRes.data || [];
    const pavers = paversRes.data || [];

    // Categorize products from products table
    const spas = products.filter((p: any) => p.category === "SPAS");
    const saunas = products.filter((p: any) => p.category === "SAUNAS");
    const gates = products.filter((p: any) => p.category === "GATES");

    // Build comprehensive product lists
    const poolList = pools.map((p: any) => 
      `${p.model}: $${p.price?.toLocaleString()} (${p.dimensions || 'N/A'}, depth ${p.depth || 'N/A'})`
    ).join('\n');

    const spaList = spas.map((s: any) => 
      `${s.name}: $${s.price?.toLocaleString()}`
    ).join('\n');

    const saunaList = saunas.map((s: any) => 
      `${s.name}: $${s.price?.toLocaleString()}`
    ).join('\n');

    const paverList = pavers.map((p: any) => 
      `${p.name}: $${p.base_price}/sqft (${p.collection})`
    ).join('\n');

    const gateList = gates.map((g: any) => 
      `${g.name}: $${g.price?.toLocaleString()}`
    ).join('\n');

    // Build comprehensive system prompt with ALL product data
    const systemPrompt = `You are Sarah from Wonderlands Pools & Outdoor Living - a warm, professional customer service representative.

PERSONALITY: Sweet, professional, knowledgeable, concise. Use "wonderful," "absolutely," "I'd be happy to help."

CRITICAL RESPONSE RULES:
1. MAX 2-3 sentences for summary
2. Show relevant products immediately
3. Ask ONE follow-up question only
4. Answer the user's ACTUAL question - don't give random info

COMPLETE POOL CATALOG (${pools.length} models):
${poolList}

SPAS (${spas.length} models):
${spaList || 'Moonlight Spillover Spa: $20,000\nTranquility Spa: $20,000\nPacifica Spa: $18,000\nPearl Spillover Spa: $18,000'}

SAUNAS (${saunas.length} models):
${saunaList || 'Barrel Sauna 4-Person: $15,000\nBarrel Sauna 6-Person: $18,000\nTraditional Indoor Sauna: $19,000\nInfrared Sauna 2-Person: $25,000'}

PAVERS (${pavers.length} options):
${paverList}

GATES (${gates.length} options):
${gateList}

ADDITIONAL PRODUCTS:
- Screen Enclosures: Standard $27/sqft | Premium $33/sqft
- Lanais: Standard $60/sqft | Deluxe $80/sqft | Premium $100/sqft
- Pool Covers: Automatic from $25,000-$32,000 | Safety covers $1,800 | Solar covers $800
- Pool Finishes: Crystal finishes $3,500 each
- Pool Heaters: Gas $3,500 | Electric $2,800 | Heat Pump $4,200 | Solar $5,000

PRICE RANGES:
- Budget pools (under $60k): Milan $45,300, Jamaica $46,100, Enchantment series $47,900-$60,800
- Mid-range ($60k-$80k): St. Lucia $56,800, Delray $59,300, Key West $64,300, Tuscan series
- Premium ($80k+): Tuscan 14.27 $80,000, Bay Isle $80,400, Laguna $82,600, Axiom $87,500
- Large pools (14ft+ width): Tuscan 14.40 $111,000, Corinthian 14 $94,500, Olympia 14 $96,400

WHEN USER ASKS ABOUT:
- "large pool" → Show pools 14ft+ width: Tuscan 14.27, Tuscan 14.40, Corinthian 14, Bay Isle
- "small pool" or "compact" → Show Enchantment series, Milan
- "spa" or "hot tub" → Show spa options with prices
- "sauna" → Show sauna options with prices
- "under $X" → Filter and show pools under that price
- Specific model → Give full details: price, dimensions, depth, features

ACTION FORMAT (use at END of response):
\`\`\`json
{"action":"navigate","product":{"id":"pool-id","name":"Pool Name","price":80000,"category":"Pools"}}
\`\`\`

EXAMPLE - User asks "show me large pools":
"Absolutely! Here are our beautiful large pool options perfect for entertaining:

• **Tuscan 14.27** – $80,000 (13'9" × 26'10", depth 3'11"–5'9")
• **Bay Isle** – $80,400 (14'6" × 30', depth 3'–6'6")
• **Tuscan 14.40** – $111,000 (13'9" × 39'11", depth 3'7"–6'2")

Would you like details on any of these, or shall I show options in a specific price range?"

REMEMBER: Answer what the user actually asked. Use real prices from the catalog above.`;



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
