import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_REP = {
  first_name: "Wonderlands",
  last_name: "Sales Team",
  email: "sales@wonderlandsworld.com",
  phone: "+1 (239) 257-0637",
  title: "Sales Representative",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { client_id } = await req.json().catch(() => ({}));

    if (!client_id || typeof client_id !== "string") {
      return new Response(JSON.stringify({ rep: DEFAULT_REP, default: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: client } = await supabase
      .from("clients")
      .select("assigned_sales_rep_id")
      .eq("id", client_id)
      .maybeSingle();

    if (!client?.assigned_sales_rep_id) {
      return new Response(JSON.stringify({ rep: DEFAULT_REP, default: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, sales_category")
      .eq("id", client.assigned_sales_rep_id)
      .maybeSingle();

    if (!profile) {
      return new Response(JSON.stringify({ rep: DEFAULT_REP, default: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        rep: {
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: profile.email || DEFAULT_REP.email,
          phone: DEFAULT_REP.phone,
          title: profile.sales_category === "head_of_sales" ? "Head of Sales" : "Sales Representative",
        },
        default: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ rep: DEFAULT_REP, default: true, error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
