import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Channel = 'email' | 'sms' | 'whatsapp' | 'voice';
type RecipientType = 'client' | 'sales_rep' | 'contractor' | 'admin';

interface NotificationRequest {
  channels: Channel[];
  recipientType: RecipientType;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  htmlContent?: string;
  mediaUrl?: string;
}

async function sendEmail(email: string, name: string, subject: string, message: string, htmlContent?: string) {
  const html = htmlContent || `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #f97316, #14b8a6); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header"><h2>${subject}</h2></div>
        <div class="content">
          <p>Hello ${name},</p>
          <p>${message}</p>
        </div>
        <div class="footer"><p>&copy; ${new Date().getFullYear()} All rights reserved.</p></div>
      </body>
    </html>
  `;

  return await resend.emails.send({
    from: "Notifications <onboarding@resend.dev>",
    to: [email],
    subject: subject || "Notification",
    html,
  });
}

async function sendSMS(to: string, message: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio SMS credentials not configured");
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append("To", to);
  formData.append("From", fromNumber);
  formData.append("Body", message);

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  return await response.json();
}

async function sendWhatsApp(to: string, message: string, mediaUrl?: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const whatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

  if (!accountSid || !authToken || !whatsappNumber) {
    throw new Error("Twilio WhatsApp credentials not configured");
  }

  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const formattedFrom = whatsappNumber.startsWith("whatsapp:") ? whatsappNumber : `whatsapp:${whatsappNumber}`;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append("To", formattedTo);
  formData.append("From", formattedFrom);
  formData.append("Body", message);
  
  if (mediaUrl) {
    formData.append("MediaUrl", mediaUrl);
  }

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  return await response.json();
}

async function makeVoiceCall(to: string, message: string) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio voice credentials not configured");
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  
  const formData = new URLSearchParams();
  formData.append("To", to);
  formData.append("From", fromNumber);
  formData.append("Twiml", `<Response><Say voice="alice">${message}</Say></Response>`);

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  return await response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: NotificationRequest = await req.json();
    const { channels, recipientType, recipientName, recipientEmail, recipientPhone, subject, message, htmlContent, mediaUrl } = request;

    if (!channels || channels.length === 0) {
      throw new Error("At least one channel is required");
    }

    if (!message) {
      throw new Error("Message is required");
    }

    console.log(`Sending notification via ${channels.join(', ')} to ${recipientType}: ${recipientName}`);

    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            if (!recipientEmail) throw new Error("Email address required for email channel");
            results.email = await sendEmail(recipientEmail, recipientName, subject || "Notification", message, htmlContent);
            console.log("Email sent successfully");
            break;
          case 'sms':
            if (!recipientPhone) throw new Error("Phone number required for SMS channel");
            results.sms = await sendSMS(recipientPhone, message);
            console.log("SMS sent successfully");
            break;
          case 'whatsapp':
            if (!recipientPhone) throw new Error("Phone number required for WhatsApp channel");
            results.whatsapp = await sendWhatsApp(recipientPhone, message, mediaUrl);
            console.log("WhatsApp sent successfully");
            break;
          case 'voice':
            if (!recipientPhone) throw new Error("Phone number required for voice channel");
            results.voice = await makeVoiceCall(recipientPhone, message);
            console.log("Voice call initiated successfully");
            break;
        }
      } catch (channelError: any) {
        console.error(`Error with ${channel}:`, channelError);
        errors[channel] = channelError.message;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: Object.keys(errors).length === 0, 
        results,
        errors: Object.keys(errors).length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
