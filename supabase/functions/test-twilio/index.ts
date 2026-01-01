import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  testType: "sms" | "whatsapp" | "credentials";
  to?: string; // Required for sms/whatsapp tests
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testType, to }: TestRequest = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const phoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const whatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    // Check if credentials are configured
    const credentialStatus = {
      TWILIO_ACCOUNT_SID: !!accountSid,
      TWILIO_AUTH_TOKEN: !!authToken,
      TWILIO_PHONE_NUMBER: !!phoneNumber,
      TWILIO_WHATSAPP_NUMBER: !!whatsappNumber,
    };

    const allConfigured = Object.values(credentialStatus).every(Boolean);

    if (testType === "credentials") {
      // Just verify credentials are set
      if (!allConfigured) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Some Twilio credentials are missing",
            credentials: credentialStatus,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify credentials with Twilio API
      const verifyUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`;
      const verifyResponse = await fetch(verifyUrl, {
        headers: {
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
      });

      if (!verifyResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Twilio credentials are invalid",
            credentials: credentialStatus,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const accountData = await verifyResponse.json();
      return new Response(
        JSON.stringify({
          success: true,
          message: "All Twilio credentials are valid!",
          credentials: credentialStatus,
          account: {
            friendlyName: accountData.friendly_name,
            status: accountData.status,
            type: accountData.type,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SMS or WhatsApp test - requires a phone number
    if (!to) {
      return new Response(
        JSON.stringify({ success: false, message: "Phone number (to) is required for SMS/WhatsApp tests" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!allConfigured) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Twilio credentials not fully configured",
          credentials: credentialStatus,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const statusCallbackUrl = `https://bwngxlbnavnhbtahyzbf.supabase.co/functions/v1/twilio-status-webhook`;

    const formData = new URLSearchParams();
    
    if (testType === "sms") {
      formData.append("To", to);
      formData.append("From", phoneNumber!);
      formData.append("Body", "🎉 Twilio SMS test successful! Your credentials are working correctly.");
    } else if (testType === "whatsapp") {
      const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
      const formattedFrom = whatsappNumber!.startsWith("whatsapp:") ? whatsappNumber! : `whatsapp:${whatsappNumber}`;
      formData.append("To", formattedTo);
      formData.append("From", formattedFrom);
      formData.append("Body", "🎉 Twilio WhatsApp test successful! Your credentials are working correctly.");
    }
    
    formData.append("StatusCallback", statusCallbackUrl);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio test error:", result);
      return new Response(
        JSON.stringify({
          success: false,
          message: result.message || "Failed to send test message",
          error: result,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Test ${testType} sent successfully:`, result.sid);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test ${testType.toUpperCase()} sent successfully!`,
        messageSid: result.sid,
        status: result.status,
        to: result.to,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Test endpoint error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
