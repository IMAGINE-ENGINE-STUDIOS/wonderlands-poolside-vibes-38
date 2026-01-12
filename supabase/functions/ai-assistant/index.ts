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
    const systemPrompt = `You are Wonderlands AI, an expert pool and outdoor living consultant for Wonderlands Pools & Outdoor Living. You have complete access to our current product inventory and pricing. Be helpful, friendly, and guide customers to the right products for their needs.

CURRENT PRODUCT CATALOG (LIVE DATA):

=== POOLS (${pools.length} models available) ===
${pools.map((p: any) => `• ${p.model}: $${p.price?.toLocaleString() || 'Call for price'} | Dimensions: ${p.dimensions || 'N/A'} | Depth: ${p.depth || 'N/A'} | Category: ${p.category} | Warranty: ${p.warranty_years || 'Lifetime'} | Installation: ${p.installation_time_weeks || '16'} weeks`).join('\n')}

=== SPAS (${spas.length} models) ===
${spas.map((s: any) => `• ${s.name}: $${s.price?.toLocaleString() || 'Call for price'} | ${s.description || ''}`).join('\n') || 'Contact us for spa options'}

=== SAUNAS (${saunas.length} models) ===
${saunas.map((s: any) => `• ${s.name}: $${s.price?.toLocaleString() || 'Call for price'} | ${s.description || ''}`).join('\n') || 'Contact us for sauna options'}

=== PAVERS (${pavers.length} collections) ===
${pavers.map((p: any) => `• ${p.name}: $${p.base_price}/sq ft | Collection: ${p.collection} | Category: ${p.category}`).join('\n')}

=== DRIVEWAY GATES ===
${gates.map((g: any) => `• ${g.name}: $${g.price?.toLocaleString() || 'Call for price'}`).join('\n') || 'Contact us for gate options'}

=== POOL FINISHES ===
${finishes.slice(0, 15).map((f: any) => `• ${f.name}: $${f.price?.toLocaleString() || 'Included'}`).join('\n') || 'Various finish options available'}

=== POOL LINERS ===
${liners.slice(0, 15).map((l: any) => `• ${l.name}: $${l.price?.toLocaleString() || 'Included'}`).join('\n') || 'Various liner options available'}

=== SCREEN ENCLOSURES ===
• Standard Screen Enclosure: $27/sq ft (includes basic frame and screen)
• Premium Screen Enclosure: $33/sq ft (reinforced frame, premium mesh)

=== LANAIS ===
• Standard Lanai: $60/sq ft (5-year warranty)
• Deluxe Lanai: $80/sq ft (10-year warranty)
• Premium Lanai: $100/sq ft (Lifetime warranty)

=== ADDITIONAL SERVICES ===
• Pool Finishes: Various colors and textures available
• Automatic Pool Covers: Starting at $15,000
• Tanning Ledges: $3,000 - $8,000
• Water Features: $2,000 - $15,000
• LED Lighting Packages: $1,500 - $5,000

CAPABILITIES:
When a user wants to take action, respond with a JSON action block at the END of your message:

1. To navigate user to a product:
\`\`\`json
{"action":"navigate","product":{"id":"pool-id","name":"Pool Name","price":50000,"category":"Pools","dimensions":"12x24","depth":"3-6ft","image":"image-url"}}
\`\`\`

2. To add to cart:
\`\`\`json
{"action":"add_to_cart","product":{"id":"product-id","name":"Product Name","price":50000,"category":"Category","image":"image-url"}}
\`\`\`

3. To calculate a quote:
\`\`\`json
{"action":"calculate_quote","items":[{"name":"Item 1","price":50000},{"name":"Item 2","price":5000}]}
\`\`\`

GUIDELINES:
- Be conversational and helpful, not robotic
- Ask clarifying questions about backyard size, budget, preferences
- Recommend products that fit their needs
- Explain features and benefits
- Calculate totals when discussing multiple items
- Guide them through the selection process
- When they're ready, help them add to cart or view products
- Always be accurate with pricing from the database
- If a product isn't in the catalog, say so honestly
- For technical questions about dimensions, capacity, or installation, provide specific details`;

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
