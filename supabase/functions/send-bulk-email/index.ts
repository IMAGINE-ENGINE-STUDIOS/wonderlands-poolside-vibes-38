import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  template_name: string;
  client_ids?: string[];
  send_to_all?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { template_name, client_ids, send_to_all }: BulkEmailRequest = await req.json();

    if (!template_name) {
      throw new Error("template_name is required");
    }

    console.log(`Starting bulk email with template: ${template_name}`);

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from("message_templates")
      .select("*")
      .eq("name", template_name)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${template_name}`);
    }

    console.log(`Template loaded: ${template.name}`);

    // Fetch clients
    let clientsQuery = supabase
      .from("clients")
      .select("id, first_name, last_name, email, phone, address_city, address_state");

    if (client_ids && client_ids.length > 0) {
      clientsQuery = clientsQuery.in("id", client_ids);
    }

    const { data: clients, error: clientsError } = await clientsQuery;

    if (clientsError) {
      throw new Error(`Failed to fetch clients: ${clientsError.message}`);
    }

    if (!clients || clients.length === 0) {
      throw new Error("No clients found");
    }

    console.log(`Found ${clients.length} clients to email`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send email to each client
    for (const client of clients) {
      try {
        if (!client.email) {
          console.log(`Skipping client ${client.first_name} - no email`);
          results.failed++;
          results.errors.push(`${client.first_name}: No email address`);
          continue;
        }

        // Replace variables in template
        let subject = template.subject || "Special Offer from Wonderlands World";
        let htmlContent = template.html_content || template.body;

        const variables: Record<string, string> = {
          first_name: client.first_name || "Valued Customer",
          last_name: client.last_name || "",
          email: client.email || "",
          phone: client.phone || "",
          address_city: client.address_city || "",
          address_state: client.address_state || "",
        };

        // Replace all {{variable}} patterns
        Object.entries(variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          subject = subject.replace(regex, value);
          htmlContent = htmlContent.replace(regex, value);
        });

        console.log(`Sending to ${client.email} (${client.first_name})...`);

        const emailResponse = await resend.emails.send({
          from: "Wonderlands Pools <sales@wonderlandsworld.com>",
          to: [client.email],
          subject: subject,
          html: htmlContent,
        });

        if (emailResponse.error) {
          console.error(`Failed to send to ${client.email}:`, emailResponse.error);
          results.failed++;
          results.errors.push(`${client.email}: ${emailResponse.error.message}`);
        } else {
          console.log(`✅ Sent to ${client.email} - ID: ${emailResponse.data?.id}`);
          results.successful++;

          // Log communication
          await supabase.from("communication_logs").insert({
            client_id: client.id,
            channel: "email",
            recipient: client.email,
            subject: subject,
            message_content: htmlContent,
            template_id: template.id,
            status: "sent",
            sent_at: new Date().toISOString(),
            external_id: emailResponse.data?.id,
          });
        }

        // Delay to avoid rate limiting (Resend allows 2 requests/second)
        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (clientError: any) {
        console.error(`Error sending to ${client.email}:`, clientError);
        results.failed++;
        results.errors.push(`${client.email}: ${clientError.message}`);
      }
    }

    console.log(`Bulk email complete: ${results.successful} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Bulk email complete: ${results.successful} sent, ${results.failed} failed`,
        total_clients: clients.length,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors.slice(0, 10), // Only return first 10 errors
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in bulk email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
