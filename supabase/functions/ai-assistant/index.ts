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

PREMIUM TRAVERTINE - $22/sqft:
Travertine Light, Travertine Dark, Travertine Misty, Travertine Steel, Travertine Pearly, Travertine Silver, Travertine Rustic, Travertine Classic, Travertine Tumbled, Travertine Honed`;

    const gateList = gates.map((g: any) => 
      `${g.name}: $${g.price?.toLocaleString()}`
    ).join('\n');

    // Build comprehensive system prompt with ALL product data
    const systemPrompt = `You are Sarah from Wonderlands Pools & Outdoor Living - a warm, professional customer service representative.

PERSONALITY: Sweet, professional, knowledgeable, ultra-concise.

=== CRITICAL RULES ===
1. ANSWER ONLY WHAT THE CUSTOMER ASKS - never add extra products or categories
2. NEVER use markdown: no **, no *, no parentheses for dimensions
3. Keep responses SHORT - max 2 sentences of explanation
4. When showing products, list ONLY the product name and price
5. Dimensions are shown in the product cards automatically - DON'T write them in text

=== RESPONSE FORMAT ===
Your text response should be a brief 1-2 sentence answer. Product details are shown visually in cards below your message, so don't repeat specs in text.

BAD RESPONSE (too long, includes codes/dimensions):
"Here are some pools: Tuscan 14.40 - $133,320 (13′ 9″ × 39′ 11′, depth 3′ 7″ – 6′ 2″)"

GOOD RESPONSE (short, lets cards show details):
"Here are our large family pools that fit your needs. Would you like to see these in our 3D Studio?"

=== PRODUCT CATALOG ===
POOLS:
${poolList}

GILMER SPAS:
- Moonlight Spillover: $26,000 (8'x8'x3'3", dealer $21,000)
- Pacifica Spa: $24,000 (7'6"x7'6"x3', dealer $19,000)
- Pearl Spillover: $24,000 (7'6"x7'6"x3', dealer $19,000)
- Tranquility Spa: $28,000 (9'x9'x3'8", dealer $22,500)

PREMIUM SPAS (for sauna packages):
- Mystic: $24,000 (7' x 7' x 34")
- Serenity: $22,000 (6' x 6' x 32")
- Tranquility: $20,000 (5' x 5' x 30")

SAUNAS:
- Barrel Sauna 4-Person: $18,000 (4 persons, 6kW heater, 8ft L x 6ft Dia)
- Barrel Sauna 6-Person: $21,600 (6 persons, 8kW heater, 10ft L x 7ft Dia)
- Traditional Indoor Sauna 4-Person: $22,800 (4 persons, 6kW heater, 7ft x 6ft x 7ft H)
- Infrared Sauna 2-Person: $30,000 (2 persons, Infrared heater, 5ft x 4ft x 6.5ft H)

PAVERS:
${paverList}

GATES: ${gateList}

DRIVEWAY GATES (Prague Style, includes installation):
- 12ft x 6ft: $7,820
- 14ft x 6ft: $6,785
- 16ft x 6ft: $8,050
- 18ft x 6ft: $8,970
- Automatic Gate Opener: +$2,300

TANNING LEDGES:
- Genesis: $26,400 (8' x 12', depth 6" to 12")
- Hermosa: $28,800 (6' x 10', depth 6" to 10")
- Rectangle: $30,000 (8' x 14', depth 8" to 12")
- Semicircle: $27,600 (7' x 9', depth 6" to 10")

=== PRICING ===
- Screen Enclosures: Standard $15/sqft, Premium $28/sqft
- Lanais: Standard $60/sqft, Deluxe $80/sqft, Premium $100/sqft
- Pool Covers: Automatic $25,000-$32,000, Safety $1,800, Solar $800
- Patio Fencing: 36" Aluminum $40/linear ft, 46" Aluminum $50/linear ft, 56" Aluminum $60/linear ft
- Pool Heaters: Heat Pump Standard $3,500, Heat Pump Premium $4,500, Pentair MasterTemp 125 $2,300, Pentair UltraTemp 90 $5,175
- Pool Finishes: Crystite Crystal +$3,500, Mini Pebbles +$4,200
- Pool Liners: Glass/Porcelain/Italian Stone $20/sqft installed, $15/sheet material
- Pool Tiles: Mountain/Carnegie/Panama $15,000 each

=== CONFIGURATION FLOW ===
When a customer asks about a product:
1. Answer their question with the matching product and price
2. Ask if they want to add extras one-by-one (spa, heater, deck pavers, screen enclosure)
3. After configuration, provide a full quote breakdown
4. NEVER offer unrelated products - stay focused on what the customer asked for

=== WONDERLANDS STUDIO ===
Our 3D configurator where customers customize their pool with:
- Interior finishes and colors
- Heating systems
- Safety covers
- Deck pavers
- Real-time pricing

When user reaches studio: "You can now customize your pool! Use the tabs to select finishes, add heating, or include a cover. Need help with any option?"

REMEMBER: Be brief. Product images and specs show automatically in cards. Don't repeat dimensions in text.`;





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
