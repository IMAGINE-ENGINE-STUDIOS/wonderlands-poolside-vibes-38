import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  email: string;
  template_id?: string;
  template_name?: string;
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

    const { email, template_id, template_name }: TestEmailRequest = await req.json();

    if (!email) {
      throw new Error("email is required");
    }

    console.log(`Sending test email to: ${email}`);

    // Fetch template
    let template;
    if (template_id) {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("id", template_id)
        .single();
      if (error) throw error;
      template = data;
    } else if (template_name) {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("name", template_name)
        .single();
      if (error) throw error;
      template = data;
    } else {
      // Get the most recent email template
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("channel", "email")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      template = data;
    }

    if (!template) {
      throw new Error("No template found");
    }

    console.log(`Using template: ${template.name}`);

    // Replace variables with test data
    const testClient = {
      first_name: "Test",
      last_name: "User",
      email: email,
      phone: "(555) 123-4567",
      address_city: "Jacksonville",
      address_state: "Florida",
    };

    let subject = template.subject || "Test Email";
    let htmlContent = template.html_content || template.body;

    // Replace variables
    Object.entries(testClient).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, value || "");
      htmlContent = htmlContent.replace(regex, value || "");
    });

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Wonderlands Pools <sales@wonderlandsworld.com>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test email sent to ${email}`,
        template_used: template.name,
        email_id: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
