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

    // Fetch spas, saunas, gates from database (these are accurate)
    const [productsRes, paversRes] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true).order("price"),
      supabase.from("pavers").select("*").eq("is_active", true),
    ]);

    const products = productsRes.data || [];
    const pavers = paversRes.data || [];

    // Categorize products from products table
    const spas = products.filter((p: any) => p.category === "SPAS");
    const saunas = products.filter((p: any) => p.category === "SAUNAS");
    const gates = products.filter((p: any) => p.category === "GATES");

    // CORRECT PUBLIC POOL PRICING - From PoolCatalog.tsx (the source of truth displayed to customers)
    const poolList = `COMPACT POOLS:
St. Lucia - $59,640 (12′ × 24′, depth 3′ 6″ – 5′)
Enchantment 9.17 - $57,970 (9′ 5″ × 16′ 10″, depth 3′ 6″ – 4′ 6″)
Palladium 12 - $63,470 (12′ × 24′, depth 3′ 6″ – 5′)
Palladium 14 - $81,950 (14′ × 28′, depth 3′ 6″ – 5′ 6″)
I30 - $60,060 (12′ 3″ × 31′ 6″, depth 3′ 6″ – 5′)

STANDARD POOLS:
Picasso - $73,610 (15′ 9″ × 35′, depth 3′ 6″ – 5′ 6″)
Monaco - $67,870 (12′ × 27′, depth 3′ 6″ – 5′ 6″)
D36 - $81,840 (14′ × 36′, depth 3′ 6″ – 6′)

DELUXE POOLS:
Tuscan 14.27 - $98,340 (13′ 9″ × 26′ 10″, depth 3′ 7″ – 6′ 2″)
Valencia - $85,653 (14′ 6″ × 28′, depth 3′ 7″ – 5′ 10″)
Vista Isle - $87,000 (12′ × 28′ 6″, depth 3′ 6″ – 5′ 10″)

PREMIUM POOLS:
Corinthian 12 - $92,940 (12′ × 25′, depth 3′ 6″ – 5′ 5″)
Corinthian 12 BME - $97,340 (12′ × 25′, depth 3′ 6″ – 5′ 5″)
Corinthian 14 - $113,950 (14′ × 30′, depth 3′ 6″ – 6′)
Corinthian 14 BME - $118,350 (14′ × 30′, depth 3′ 6″ – 6′)
Olympia 12 - $93,930 (12′ × 26′, depth 3′ 6″ – 5′ 6″)
Olympia 14 - $116,040 (14′ × 30′, depth 3′ 6″ – 6′)
Bay Isle - $98,440 (14′ 6″ × 30′, depth 3′ – 6′ 6″)
Laguna - $100,860 (14′ × 30′, depth 3′ 6″ – 6′)
Laguna Deluxe - $114,830 (14′ × 30′, depth 4′ – 6′)
Claremont - $101,740 (14′ × 33′, depth 3′ 6″ – 5′ 4″)
Axiom 14 - $106,250 (14′ × 30′, depth 4′ 6″ – 6′)
Providence 14 - $115,160 (14′ × 30′, depth 3′ 6″ – 6′ 1″)
Genesis - $133,860 (16′ × 40′ 2″, depth 3′ 9″ – 8′ 6″)
Tuscan 14.40 - $133,320 (13′ 9″ × 39′ 11″, depth 3′ 7″ – 6′ 2″)

GLIMMERGLASS POOLS:
Serafina - $55,034 (8′ 6″ × 14′, depth 3′ 6″ – 4′)
Coral Cove - $58,400 (9′ 6″ × 16′, depth 3′ 6″ – 4′)
Retreat - $57,630 (10′ 3″ × 18′ 5″, depth 3′ 6″ – 4′ 4″)
Regal Plunge - $63,350 (10′ × 16′, depth 4′ – 5′ 5″)
Regal - $71,600 (10′ × 20′, depth 3′ 6″ – 5′ 4″)
Caribbean - $70,566 (11′ × 20′, depth 3′ 6″ – 5′)
Neptune - $74,706 (11′ × 23′, depth 3′ 6″ – 5′ 6″)
Islander - $71,600 (12′ × 24′, depth 3′ 6″ – 5′ 6″)
Emerald - $74,706 (12′ × 25′, depth 3′ 6″ – 5′ 7″)
Roman - $82,600 (11′ × 27′, depth 3′ 6″ – 6′ 2″)
Superior - $82,600 (12′ × 25′ 8″, depth 3′ 6″ – 5′ 6″)
Capri - $79,881 (12′ × 28′, depth 3′ 6″ – 4′ 6″)
Costa Brava - $79,881 (12′ × 29′, depth 3′ 6″ – 6′)
Majestic - $78,530 (13′ × 25′ 6″, depth 3′ 6″ – 6′)
Gold Coast w/ built-in Spa - $104,600 (14′ × 28′, depth 3′ 6″ – 5′ 8″)
Atlantis - $104,600 (14′ × 32′, depth 3′ 6″ – 6′)
Extreme 27 w/ built-in Spa & Splash Deck - $93,600 (12′ 6″ × 27′, depth 3′ 6″ – 5′ 11″)
Tortola - $95,800 (14′ × 30′, depth 3′ 6″ – 6′)
Silver Shore - $82,050 (15′ × 28′, depth 3′ 6″ – 6′)
Mystic - $106,800 (15′ × 32′, depth 3′ 6″ – 6′)
Aloha - $106,800 (15′ × 34′, depth 3′ 6″ – 6′)
Bellagio - $106,800 (15′ × 34′, depth 3′ 6″ – 6′ 6″)
Extreme 38 w/ built-in Spa & Splash Deck - $126,600 (15′ 6″ × 38′, depth 3′ 6″ – 7′)
Ponce XL - $113,400 (15′ 6″ × 32′, depth 3′ 6″ – 6′)
Newport - $106,800 (16′ × 35′, depth 3′ 6″ – 6′)
Serenade w/ built-in Spa - $136,306 (16′ × 38′, depth 6′)
Beachcomber - $136,306 (16′ × 40′, depth 8′)
Vision - $136,306 (16′ × 41′, depth 6′ 6″)
Grand Cayman - $136,306 (16′ × 42′, depth 8′)`;

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

COMPLETE POOL CATALOG (50+ models with correct public pricing):
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
