import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_city?: string;
  address_state?: string;
  status?: string;
}

// Replace template variables with actual values
function replaceVariables(text: string, client: ClientData): string {
  const firstName = client.first_name || '';
  const lastName = client.last_name || '';
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  
  return text
    .replace(/{first_name}/g, firstName)
    .replace(/{last_name}/g, lastName)
    .replace(/{full_name}/g, fullName.trim())
    .replace(/{email}/g, client.email || '')
    .replace(/{phone}/g, client.phone || '')
    .replace(/{address_city}/g, client.address_city || '')
    .replace(/{address_state}/g, client.address_state || '');
}

// Send email using Resend
async function sendEmail(
  to: string,
  subject: string,
  body: string,
  htmlContent?: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const resend = new Resend(resendApiKey);
    const response = await resend.emails.send({
      from: "Wonderlands World <noreply@wonderlandsworld.com>",
      to: [to],
      subject: subject,
      html: htmlContent || `<p>${body}</p>`,
    });

    console.log("Email sent:", response);
    return { success: true, externalId: response.data?.id };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

// Send SMS using Twilio
async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: "Twilio credentials not configured" };
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
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "SMS send failed" };
    }

    console.log("SMS sent:", data.sid);
    return { success: true, externalId: data.sid };
  } catch (error: any) {
    console.error("SMS send error:", error);
    return { success: false, error: error.message };
  }
}

// Send WhatsApp using Twilio
async function sendWhatsApp(
  to: string,
  message: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const whatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!accountSid || !authToken || !whatsappNumber) {
      return { success: false, error: "Twilio WhatsApp credentials not configured" };
    }

    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = whatsappNumber.startsWith("whatsapp:") 
      ? whatsappNumber 
      : `whatsapp:${whatsappNumber}`;

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
          Body: message,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "WhatsApp send failed" };
    }

    console.log("WhatsApp sent:", data.sid);
    return { success: true, externalId: data.sid };
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return { success: false, error: error.message };
  }
}

// Make voice call using Twilio
async function makeVoiceCall(
  to: string,
  message: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: "Twilio credentials not configured" };
    }

    const twiml = `<Response><Say voice="alice">${message}</Say></Response>`;
    const twimlUrl = `http://twimlets.com/echo?Twiml=${encodeURIComponent(twiml)}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Url: twimlUrl,
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || "Voice call failed" };
    }

    console.log("Voice call initiated:", data.sid);
    return { success: true, externalId: data.sid };
  } catch (error: any) {
    console.error("Voice call error:", error);
    return { success: false, error: error.message };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Running scheduled outreach check...");

    // Find all pending automations where next_action_at is due
    const { data: pendingAutomations, error: fetchError } = await supabase
      .from("client_automations")
      .select(`
        *,
        client:clients(*),
        sequence:automation_sequences(*)
      `)
      .eq("status", "in_progress")
      .lte("next_action_at", new Date().toISOString())
      .order("next_action_at", { ascending: true })
      .limit(50); // Process 50 at a time

    if (fetchError) {
      console.error("Error fetching pending automations:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch pending automations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!pendingAutomations || pendingAutomations.length === 0) {
      console.log("No pending automations to process");
      return new Response(
        JSON.stringify({ message: "No pending automations", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pendingAutomations.length} pending automations`);
    const results: any[] = [];

    for (const automation of pendingAutomations) {
      const client = automation.client;
      if (!client) {
        console.log(`Client not found for automation ${automation.id}, skipping`);
        continue;
      }

      // Get the current step
      const { data: currentStep, error: stepError } = await supabase
        .from("automation_steps")
        .select("*, template:message_templates(*)")
        .eq("sequence_id", automation.sequence_id)
        .eq("step_order", automation.current_step)
        .eq("is_active", true)
        .single();

      if (stepError || !currentStep) {
        console.log(`Step ${automation.current_step} not found for automation ${automation.id}`);
        // Mark as completed if no more steps
        await supabase
          .from("client_automations")
          .update({ status: "completed", next_action_at: null })
          .eq("id", automation.id);
        continue;
      }

      const template = currentStep.template;
      if (!template) {
        console.log(`No template for step ${automation.current_step}, moving to next`);
        // Move to next step
        await moveToNextStep(supabase, automation, currentStep);
        continue;
      }

      const messageBody = replaceVariables(template.body, client);
      const messageSubject = template.subject ? replaceVariables(template.subject, client) : undefined;
      const htmlContent = template.html_content ? replaceVariables(template.html_content, client) : undefined;

      const stepResults: any[] = [];

      // Send to each channel
      for (const channel of currentStep.channels) {
        let sendResult: { success: boolean; externalId?: string; error?: string };
        let recipient: string;

        switch (channel) {
          case "email":
            recipient = client.email;
            sendResult = await sendEmail(recipient, messageSubject || "Message from Wonderlands World", messageBody, htmlContent);
            break;
          case "sms":
            if (!client.phone) {
              console.log("No phone for SMS, skipping");
              continue;
            }
            recipient = client.phone;
            sendResult = await sendSMS(recipient, messageBody);
            break;
          case "whatsapp":
            if (!client.phone) {
              console.log("No phone for WhatsApp, skipping");
              continue;
            }
            recipient = client.phone;
            sendResult = await sendWhatsApp(recipient, messageBody);
            break;
          case "voice":
            if (!client.phone) {
              console.log("No phone for voice, skipping");
              continue;
            }
            recipient = client.phone;
            sendResult = await makeVoiceCall(recipient, messageBody);
            break;
          default:
            continue;
        }

        // Log the communication
        await supabase.from("communication_logs").insert({
          client_id: client.id,
          client_automation_id: automation.id,
          template_id: template.id,
          channel: channel,
          recipient: recipient,
          subject: messageSubject,
          message_content: messageBody,
          status: sendResult.success ? "sent" : "failed",
          external_id: sendResult.externalId,
          error_message: sendResult.error,
          sent_at: sendResult.success ? new Date().toISOString() : null,
        });

        stepResults.push({ channel, success: sendResult.success, error: sendResult.error });
      }

      // Update client status and last_contacted_at if any message was sent successfully
      const successfulSends = stepResults.filter(r => r.success);
      if (successfulSends.length > 0) {
        const updateData: any = { 
          last_contacted_at: new Date().toISOString() 
        };
        // Only update status to 'contacted' if current status is 'new'
        if (client.status === 'new') {
          updateData.status = 'contacted';
        }
        await supabase
          .from("clients")
          .update(updateData)
          .eq("id", client.id);
        console.log(`Updated client ${client.id} last_contacted_at${client.status === 'new' ? ' and status to contacted' : ''}`);
      }

      // Move to next step
      await moveToNextStep(supabase, automation, currentStep);

      results.push({
        automation_id: automation.id,
        client_id: client.id,
        step: automation.current_step,
        results: stepResults,
      });
    }

    console.log("Scheduled outreach complete:", results);

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Scheduled outreach error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

async function moveToNextStep(supabase: any, automation: any, currentStep: any) {
  // Find next step
  const { data: nextStep } = await supabase
    .from("automation_steps")
    .select("*")
    .eq("sequence_id", automation.sequence_id)
    .eq("is_active", true)
    .gt("step_order", currentStep.step_order)
    .order("step_order", { ascending: true })
    .limit(1)
    .single();

  if (nextStep) {
    const nextTime = new Date(Date.now() + nextStep.delay_hours * 60 * 60 * 1000).toISOString();
    await supabase
      .from("client_automations")
      .update({
        current_step: nextStep.step_order,
        last_action_at: new Date().toISOString(),
        next_action_at: nextTime,
      })
      .eq("id", automation.id);
  } else {
    // No more steps, mark as completed
    await supabase
      .from("client_automations")
      .update({
        status: "completed",
        last_action_at: new Date().toISOString(),
        next_action_at: null,
      })
      .eq("id", automation.id);
  }
}

serve(handler);
