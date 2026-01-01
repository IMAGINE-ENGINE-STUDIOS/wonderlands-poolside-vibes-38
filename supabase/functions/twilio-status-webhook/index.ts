import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Twilio status to our message_status enum
const mapTwilioStatus = (twilioStatus: string): string => {
  const statusMap: Record<string, string> = {
    queued: "pending",
    sending: "pending",
    sent: "sent",
    delivered: "delivered",
    undelivered: "failed",
    failed: "failed",
    read: "opened", // WhatsApp read receipts
  };
  return statusMap[twilioStatus.toLowerCase()] || "sent";
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Twilio sends status callbacks as form-urlencoded
    const formData = await req.formData();
    
    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;
    const to = formData.get("To") as string;
    const from = formData.get("From") as string;

    console.log(`Twilio webhook received - SID: ${messageSid}, Status: ${messageStatus}`);

    if (!messageSid || !messageStatus) {
      console.error("Missing required fields: MessageSid or MessageStatus");
      return new Response("Missing required fields", { status: 400 });
    }

    // Initialize Supabase client with service role for database updates
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const mappedStatus = mapTwilioStatus(messageStatus);
    const now = new Date().toISOString();

    // Build update object based on status
    const updateData: Record<string, unknown> = {
      status: mappedStatus,
    };

    // Set delivered_at timestamp when message is delivered
    if (messageStatus === "delivered") {
      updateData.delivered_at = now;
    }

    // Set opened_at timestamp for WhatsApp read receipts
    if (messageStatus === "read") {
      updateData.opened_at = now;
    }

    // Store error information if failed
    if (errorCode || errorMessage) {
      updateData.error_message = `${errorCode || ""}: ${errorMessage || "Unknown error"}`.trim();
    }

    // Update communication_logs by external_id (Twilio SID)
    const { data, error } = await supabase
      .from("communication_logs")
      .update(updateData)
      .eq("external_id", messageSid)
      .select();

    if (error) {
      console.error("Database update error:", error);
      // Still return 200 to Twilio to prevent retries
    } else {
      console.log(`Updated ${data?.length || 0} records for SID: ${messageSid} to status: ${mappedStatus}`);
    }

    // Twilio expects a 200 response
    return new Response("OK", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    // Return 200 anyway to prevent Twilio retries for parsing errors
    return new Response("OK", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
};

serve(handler);
