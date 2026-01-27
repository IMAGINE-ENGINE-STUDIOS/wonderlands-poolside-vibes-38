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
  assigned_sales_rep_id?: string;
}

interface SalesRepData {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface AutomationRequest {
  client_id: string;
  trigger_event?: string;
}

// Replace template variables with actual values
function replaceVariables(text: string, client: ClientData, salesRep?: SalesRepData | null): string {
  const firstName = client.first_name || '';
  const lastName = client.last_name || '';
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  
  // Build sales rep name
  const salesRepFirstName = salesRep?.first_name || '';
  const salesRepLastName = salesRep?.last_name || '';
  const salesRepName = salesRepLastName 
    ? `${salesRepFirstName} ${salesRepLastName}`.trim() 
    : salesRepFirstName || 'Your Sales Representative';
  const salesRepEmail = salesRep?.email || 'sales@wonderlandsworld.com';
  
  return text
    .replace(/{first_name}/g, firstName)
    .replace(/{last_name}/g, lastName)
    .replace(/{full_name}/g, fullName.trim())
    .replace(/{email}/g, client.email || '')
    .replace(/{phone}/g, client.phone || '')
    .replace(/{address_city}/g, client.address_city || '')
    .replace(/{address_state}/g, client.address_state || '')
    .replace(/{sales_rep_name}/g, salesRepName)
    .replace(/{sales_rep_email}/g, salesRepEmail)
    .replace(/{{first_name}}/g, firstName)
    .replace(/{{last_name}}/g, lastName)
    .replace(/{{full_name}}/g, fullName.trim())
    .replace(/{{email}}/g, client.email || '')
    .replace(/{{phone}}/g, client.phone || '')
    .replace(/{{address_city}}/g, client.address_city || '')
    .replace(/{{address_state}}/g, client.address_state || '')
    .replace(/{{sales_rep_name}}/g, salesRepName)
    .replace(/{{sales_rep_email}}/g, salesRepEmail);
}

// Generate email signature with sales rep info
function generateSalesRepSignature(salesRep?: SalesRepData | null): string {
  if (!salesRep) {
    return `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-weight: 600; color: #1f2937;">The Wonderlands World Team</p>
        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">sales@wonderlandsworld.com</p>
        <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">+1 (239) 257-0637</p>
      </div>
    `;
  }
  
  const salesRepFirstName = salesRep.first_name || '';
  const salesRepLastName = salesRep.last_name || '';
  const salesRepName = salesRepLastName 
    ? `${salesRepFirstName} ${salesRepLastName}`.trim() 
    : salesRepFirstName || 'Your Sales Representative';
  
  return `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-weight: 600; color: #1f2937;">${salesRepName}</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Sales Representative - Wonderlands World</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${salesRep.email}</p>
      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">+1 (239) 257-0637</p>
    </div>
  `;
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
    const from = "Wonderlands World <noreply@wonderlandsworld.com>";

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: htmlContent || `<p>${body}</p>`,
      text: body,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message || String(error) };
    }

    console.log("Email sent:", data);
    return { success: true, externalId: data?.id };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error?.message || "Email send error" };
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

    // Create TwiML for text-to-speech
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

    const { client_id, trigger_event = "new_client" }: AutomationRequest = await req.json();

    if (!client_id) {
      return new Response(
        JSON.stringify({ error: "client_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing automation for client: ${client_id}, trigger: ${trigger_event}`);

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      console.error("Client not found:", clientError);
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch assigned sales rep info if available
    let salesRep: SalesRepData | null = null;
    if (client.assigned_sales_rep_id) {
      const { data: repData, error: repError } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", client.assigned_sales_rep_id)
        .single();
      
      if (!repError && repData) {
        salesRep = repData;
        console.log(`Found assigned sales rep: ${repData.first_name} ${repData.last_name}`);
      }
    }

    // Find an active automation sequence matching the trigger
    const { data: sequences, error: seqError } = await supabase
      .from("automation_sequences")
      .select("*")
      .eq("is_active", true)
      .eq("trigger_event", trigger_event)
      .order("created_at", { ascending: true })
      .limit(1);

    const sequence = sequences?.[0];

    if (seqError || !sequence) {
      console.log("No active automation sequence found for trigger:", trigger_event);
      return new Response(
        JSON.stringify({ message: "No automation sequence configured for this trigger" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if client already has an active automation for this sequence
    if (trigger_event === "manual_trigger") {
      const { data: existingAutomation } = await supabase
        .from("client_automations")
        .select("id")
        .eq("client_id", client.id)
        .eq("sequence_id", sequence.id)
        .in("status", ["pending", "in_progress"])
        .limit(1);

      if (existingAutomation && existingAutomation.length > 0) {
        console.log("Client already has active automation for this sequence");
        return new Response(
          JSON.stringify({ message: "Client already has an active automation" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get all steps for this sequence
    const { data: steps, error: stepsError } = await supabase
      .from("automation_steps")
      .select("*, template:message_templates(*)")
      .eq("sequence_id", sequence.id)
      .eq("is_active", true)
      .order("step_order", { ascending: true });

    if (stepsError || !steps || steps.length === 0) {
      console.log("No automation steps found for sequence:", sequence.id);
      return new Response(
        JSON.stringify({ message: "No automation steps configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client automation record
    const firstStep = steps[0];
    const nextActionAt = firstStep.delay_hours > 0
      ? new Date(Date.now() + firstStep.delay_hours * 60 * 60 * 1000).toISOString()
      : null;

    const { data: clientAutomation, error: automationError } = await supabase
      .from("client_automations")
      .insert({
        client_id: client.id,
        sequence_id: sequence.id,
        current_step: 1,
        status: "in_progress",
        next_action_at: nextActionAt,
      })
      .select()
      .single();

    if (automationError) {
      console.error("Failed to create client automation:", automationError);
      return new Response(
        JSON.stringify({ error: "Failed to start automation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];

    // Process immediate steps (delay_hours = 0)
    for (const step of steps) {
      if (step.delay_hours > 0) {
        // Schedule for later
        console.log(`Step ${step.step_order} scheduled for ${step.delay_hours} hours later`);
        break;
      }

      const template = step.template;
      if (!template) {
        console.log(`Step ${step.step_order} has no template, skipping`);
        continue;
      }

      const messageBody = replaceVariables(template.body, client, salesRep);
      const messageSubject = template.subject ? replaceVariables(template.subject, client, salesRep) : undefined;
      let htmlContent = template.html_content ? replaceVariables(template.html_content, client, salesRep) : undefined;
      
      // Add sales rep signature to HTML emails
      if (htmlContent) {
        // Insert signature before closing body tag if exists, otherwise append
        const signature = generateSalesRepSignature(salesRep);
        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace('</body>', `${signature}</body>`);
        } else {
          htmlContent = htmlContent + signature;
        }
      }

      // Send to each channel in this step
      for (const channel of step.channels) {
        let sendResult: { success: boolean; externalId?: string; error?: string };
        let recipient: string;

        switch (channel) {
          case "email":
            recipient = client.email;
            sendResult = await sendEmail(recipient, messageSubject || "Message from Wonderlands World", messageBody, htmlContent);
            break;
          case "sms":
            if (!client.phone) {
              console.log("No phone number for SMS, skipping");
              continue;
            }
            recipient = client.phone;
            sendResult = await sendSMS(recipient, messageBody);
            break;
          case "whatsapp":
            if (!client.phone) {
              console.log("No phone number for WhatsApp, skipping");
              continue;
            }
            recipient = client.phone;
            sendResult = await sendWhatsApp(recipient, messageBody);
            break;
          case "voice":
            if (!client.phone) {
              console.log("No phone number for voice call, skipping");
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
          client_automation_id: clientAutomation.id,
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

        results.push({
          step: step.step_order,
          channel,
          success: sendResult.success,
          error: sendResult.error,
        });
      }
    }

    // Update client status and last_contacted_at if any message was sent successfully
    const successfulSends = results.filter(r => r.success);
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

    // Update automation with last action
    const nextPendingStep = steps.find(s => s.delay_hours > 0);
    if (nextPendingStep) {
      const nextTime = new Date(Date.now() + nextPendingStep.delay_hours * 60 * 60 * 1000).toISOString();
      await supabase
        .from("client_automations")
        .update({
          current_step: nextPendingStep.step_order,
          last_action_at: new Date().toISOString(),
          next_action_at: nextTime,
        })
        .eq("id", clientAutomation.id);
    } else {
      // All immediate steps done, mark as completed if no more steps
      await supabase
        .from("client_automations")
        .update({
          status: "completed",
          last_action_at: new Date().toISOString(),
          next_action_at: null,
        })
        .eq("id", clientAutomation.id);
    }

    console.log("Automation processing complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        client_automation_id: clientAutomation.id,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Automation processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
