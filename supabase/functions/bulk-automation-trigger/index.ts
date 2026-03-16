import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 Bulk automation trigger started at", new Date().toISOString());

    // Parse optional exclusion list from body
    let excludeNames: string[] = [];
    try {
      const body = await req.json();
      excludeNames = body.exclude_names || [];
    } catch {
      // Default exclusion: Becky Oldfield
      excludeNames = ["Becky Oldfield"];
    }

    console.log("Excluding clients:", excludeNames);

    // Fetch all clients
    const { data: allClients, error: clientsError } = await supabase
      .from("clients")
      .select("id, first_name, last_name, email, phone");

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch clients" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter out excluded clients
    const eligibleClients = (allClients || []).filter(client => {
      const fullName = `${client.first_name} ${client.last_name}`.trim();
      return !excludeNames.some(excluded => 
        fullName.toLowerCase() === excluded.toLowerCase()
      );
    });

    console.log(`Found ${allClients?.length || 0} total clients, ${eligibleClients.length} eligible after exclusions`);

    // Check which clients already have active automations
    const { data: existingAutomations } = await supabase
      .from("client_automations")
      .select("client_id")
      .in("status", ["pending", "in_progress"]);

    const automatedClientIds = new Set(
      (existingAutomations || []).map(a => a.client_id)
    );

    // Get the default welcome sequence
    const { data: sequence } = await supabase
      .from("automation_sequences")
      .select("id")
      .eq("is_active", true)
      .eq("trigger_event", "new_client")
      .limit(1)
      .single();

    if (!sequence) {
      console.error("No active welcome sequence found");
      return new Response(
        JSON.stringify({ error: "No active automation sequence found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];
    let triggered = 0;
    let skipped = 0;

    for (const client of eligibleClients) {
      // Skip if already has an active automation
      if (automatedClientIds.has(client.id)) {
        console.log(`Skipping ${client.first_name} ${client.last_name} - already has active automation`);
        skipped++;
        continue;
      }

      // Trigger automation via the process-client-automation function
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/process-client-automation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              client_id: client.id,
              trigger_event: "new_client",
            }),
          }
        );

        const result = await response.json();
        triggered++;
        results.push({
          client: `${client.first_name} ${client.last_name}`,
          status: response.ok ? "triggered" : "failed",
          details: result,
        });

        console.log(`✅ Automation triggered for ${client.first_name} ${client.last_name}`);
      } catch (error: any) {
        console.error(`❌ Failed to trigger for ${client.first_name} ${client.last_name}:`, error.message);
        results.push({
          client: `${client.first_name} ${client.last_name}`,
          status: "error",
          error: error.message,
        });
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const summary = {
      total_clients: allClients?.length || 0,
      eligible: eligibleClients.length,
      triggered,
      skipped,
      excluded: excludeNames,
      timestamp: new Date().toISOString(),
    };

    console.log("📊 Bulk automation summary:", summary);

    return new Response(
      JSON.stringify({ success: true, summary, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Bulk automation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
