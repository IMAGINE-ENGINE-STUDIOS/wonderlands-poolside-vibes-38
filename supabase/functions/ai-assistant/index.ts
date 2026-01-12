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

    // Use correct paver pricing from paverData.ts (not database)
    const paverList = `APPIAN COLLECTION - $20/sqft:
Appian Adobe, Appian Amaretto, Appian Harvest Blend, Appian Knightsbridge, Appian Napoli, Appian Rio, Appian Slate, Appian Titanium, Appian Charco

CATALINA GRANA COLLECTION - $27/sqft:
Catalina Grana Amaretto, Catalina Grana Napoli, Catalina Grana Rio, Catalina Grana Scandina Gray, Catalina Grana Slate, Catalina Grana Titanium

CATALINA COLLECTION - $20/sqft:
Catalina Napoli, Catalina Slate, Catalina Titanium

CORALINA PORCELAIN - $25/sqft:
Coralina Blanco (24x24 matte porcelain)

PREMIUM TRAVERTINE - $50/sqft:
Travertine Light, Travertine Dark, Travertine Misty, Travertine Steel, Travertine Pearly, Travertine Silver, Travertine Rustic, Travertine Classic, Travertine Tumbled, Travertine Honed`;

    const gateList = gates.map((g: any) => 
      `${g.name}: $${g.price?.toLocaleString()}`
    ).join('\n');

    // Build comprehensive system prompt with ALL product data
    const systemPrompt = `You are Sarah from Wonderlands Pools & Outdoor Living - a warm, professional customer service representative.

PERSONALITY: Sweet, professional, knowledgeable, concise.

CRITICAL FORMATTING RULES:
1. NEVER use markdown formatting like ** or * in your responses
2. Write product names cleanly: "Moonlight Spillover Spa" NOT "**Moonlight Spillover Spa**"
3. MAX 1 sentence summary, then list products simply
4. Format product lists as: Product Name - $X,XXX (details)
5. End with ONE short follow-up question

COMPLETE POOL CATALOG (${pools.length} models):
${poolList}

SPAS (${spas.length} models):
${spaList || 'Moonlight Spillover Spa - $20,000\nTranquility Spa - $20,000\nPacifica Spa - $18,000\nPearl Spillover Spa - $18,000'}

SAUNAS (${saunas.length} models):
${saunaList || 'Barrel Sauna 4-Person - $15,000\nBarrel Sauna 6-Person - $18,000\nTraditional Indoor Sauna - $19,000\nInfrared Sauna 2-Person - $25,000'}

PAVERS (Correct pricing by collection):
${paverList}

GATES (${gates.length} options):
${gateList}

PRICING FOR CALCULATIONS:
- Screen Enclosures: Standard $27/sqft, Premium $33/sqft
- Lanais: Standard $60/sqft, Deluxe $80/sqft, Premium $100/sqft
- Pool Covers: Automatic $25,000-$32,000, Safety $1,800, Solar $800
- Fencing: Aluminum pool-code $45/linear ft, Premium $65/linear ft
- Installation labor: Typically 15-20% of material cost

WHEN USER ASKS ABOUT CALCULATIONS:
- Pavers: Ask for length x width in feet, multiply for sqft, then multiply by paver price
- Screen enclosure: Ask for length x width x height, calculate wall area + roof area
- Fencing: Ask for perimeter in linear feet
- Lanai: Ask for length x width for sqft

=== WONDERLANDS STUDIO KNOWLEDGE ===
Wonderlands Studio is our interactive 3D product configurator where customers design their dream outdoor living space.

WHAT IS WONDERLANDS STUDIO:
- A 3D visualization platform where customers can see their pool/spa in realistic detail
- Real-time price calculator that updates as they add options
- Complete product customization center

HOW TO CONFIGURE PRODUCTS IN WONDERLANDS STUDIO:
1. SELECT YOUR PRODUCT: The main product (pool, spa, sauna) appears in 3D view
2. CHOOSE FINISHES: Click "Pool Finishes" tab to browse interior colors and textures
3. ADD POOL LINERS: Select decorative liners for waterline tiles
4. SELECT HEATING: Choose from Pentair heaters (MasterTemp gas or UltraTemp heat pumps)
5. ADD POOL COVER: Pick automatic safety covers (Eclipse, CS3000, Infinity 4000, Atom)
6. CUSTOMIZE DECK: Select pavers for pool deck from our collections
7. ADD FEATURES: Include tanning ledges, screen enclosures, fencing

STUDIO SECTIONS/TABS:
- Pools: Browse all pool models with 3D preview
- Spas: Hot tubs and spillover spas
- Tanning Ledges: In-pool sun shelves
- Saunas: Barrel and traditional saunas
- Scenes: Pre-designed backyard scenes
- Build-A-Pool: Custom pool shape designer

COST BREAKDOWN:
The studio shows real-time pricing with:
- Base product price
- Selected extras (heater, cover, finish upgrades)
- Paver deck area calculations
- Total project estimate

ADDING TO CART:
Once configured, click "Add to Cart" to save the complete configuration with all selected options and pricing.

WHEN USER SELECTS A PRODUCT AND NAVIGATES TO STUDIO:
Guide them warmly: "Great choice! You're now in Wonderlands Studio where you can fully customize your [product]. Use the tabs on the left to select finishes, add a heater, or include a safety cover. The price updates in real-time as you configure. Need help with any options?"

RESPONSE FORMAT:
Keep summary to 1 short sentence. List 2-4 products cleanly without markdown. Ask one question.

EXAMPLE - User asks "show me large pools":
"Wonderful! Here are our spacious large pool options:

Tuscan 14.27 - $80,000 (13'9" x 26'10")
Bay Isle - $80,400 (14'6" x 30')
Tuscan 14.40 - $111,000 (13'9" x 39'11")
Olympia 14 - $96,400 (14' x 30')

What size backyard are you working with?"

EXAMPLE - User asks about pavers:
"I would be happy to help you calculate paver costs! Our Appian Collection ranges from $28-$36 per square foot.

What are the dimensions of the area you would like to pave?"

EXAMPLE - User navigated to a product in studio:
"Excellent choice! You can now customize this in Wonderlands Studio. Browse the finish options on the left, add a heater for year-round swimming, or include an automatic safety cover. Is there anything specific you would like help configuring?"

REMEMBER: No markdown symbols. Clean text only. Short and helpful.`;




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
