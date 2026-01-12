import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  email: string;
  phone: string;
  testMessage?: string;
}

interface ChannelResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

// Test Email via Resend
async function testEmail(email: string, message: string): Promise<ChannelResult> {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const resend = new Resend(resendApiKey);
    const response = await resend.emails.send({
      from: "Wonderlands World <noreply@wonderlandsworld.com>",
      to: [email],
      subject: "🧪 Test Email - Wonderlands World Automation",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #f97316, #14b8a6); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
              .content { background: #f9fafb; padding: 20px; border-radius: 8px; }
              .success { color: #059669; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header"><h2>🧪 Test Email</h2></div>
            <div class="content">
              <p class="success">✅ Email channel is working!</p>
              <p>${message}</p>
              <p>Sent at: ${new Date().toISOString()}</p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} Wonderlands World. All rights reserved.</p></div>
          </body>
        </html>
      `,
    });

    console.log("Test email sent:", response);
    return { success: true, messageSid: response.data?.id };
  } catch (error: any) {
    console.error("Test email error:", error);
    return { success: false, error: error.message };
  }
}

// Test SMS via Twilio
async function testSMS(phone: string, message: string): Promise<ChannelResult> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: "Twilio SMS credentials not configured" };
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: `🧪 Test SMS: ${message} - Sent at ${new Date().toLocaleTimeString()}`,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "SMS send failed" };
    }

    console.log("Test SMS sent:", data.sid);
    return { success: true, messageSid: data.sid };
  } catch (error: any) {
    console.error("Test SMS error:", error);
    return { success: false, error: error.message };
  }
}

// Test WhatsApp via Twilio
async function testWhatsApp(phone: string, message: string): Promise<ChannelResult> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const whatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!accountSid || !authToken || !whatsappNumber) {
      return { success: false, error: "Twilio WhatsApp credentials not configured" };
    }

    const formattedTo = phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
    const formattedFrom = whatsappNumber.startsWith("whatsapp:") ? whatsappNumber : `whatsapp:${whatsappNumber}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: formattedFrom,
          Body: `🧪 Test WhatsApp: ${message} - Sent at ${new Date().toLocaleTimeString()}`,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "WhatsApp send failed" };
    }

    console.log("Test WhatsApp sent:", data.sid);
    return { success: true, messageSid: data.sid };
  } catch (error: any) {
    console.error("Test WhatsApp error:", error);
    return { success: false, error: error.message };
  }
}

// Test Voice Call via Twilio
async function testVoiceCall(phone: string, message: string): Promise<ChannelResult> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: "Twilio voice credentials not configured" };
    }

    const twiml = `<Response><Say voice="alice">This is a test call from Wonderlands World. ${message}</Say></Response>`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Twiml: twiml,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "Voice call failed" };
    }

    console.log("Test voice call initiated:", data.sid);
    return { success: true, messageSid: data.sid };
  } catch (error: any) {
    console.error("Test voice call error:", error);
    return { success: false, error: error.message };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone, testMessage = "Your automation system is working correctly!" }: TestRequest = await req.json();

    if (!email || !phone) {
      return new Response(
        JSON.stringify({ error: "Both email and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Testing all channels - Email: ${email}, Phone: ${phone}`);

    // Run all tests in parallel
    const [emailResult, smsResult, whatsappResult, voiceResult] = await Promise.all([
      testEmail(email, testMessage),
      testSMS(phone, testMessage),
      testWhatsApp(phone, testMessage),
      testVoiceCall(phone, testMessage),
    ]);

    const results = {
      email: emailResult,
      sms: smsResult,
      whatsapp: whatsappResult,
      voice: voiceResult,
    };

    const allSuccess = emailResult.success && smsResult.success && whatsappResult.success && voiceResult.success;
    const successCount = [emailResult, smsResult, whatsappResult, voiceResult].filter(r => r.success).length;

    console.log("Test results:", results);

    return new Response(
      JSON.stringify({
        success: allSuccess,
        message: allSuccess 
          ? "All 4 channels tested successfully!" 
          : `${successCount}/4 channels succeeded`,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Test all channels error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
