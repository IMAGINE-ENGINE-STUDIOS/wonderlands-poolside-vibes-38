import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractorEmail, contractorName, projectName, taskName } = await req.json();

    if (!contractorEmail) {
      return new Response(JSON.stringify({ error: 'Missing contractor email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #475569, #334155); padding: 30px; border-radius: 12px 12px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Update on Your Project Application</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Application Status Update</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px;">Hello <strong>${contractorName || 'Contractor'}</strong>,</p>
          <p style="color: #475569;">Thank you for applying to <strong>${projectName || 'the project'}</strong>${taskName ? ` — <strong>${taskName}</strong>` : ''}.</p>
          <p style="color: #475569;">After review, we regret to inform you that your application was not selected at this time.</p>
          
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #475569; margin: 0;">We encourage you to continue applying to future opportunities available on the platform. New projects are posted regularly.</p>
          </div>
          
          <div style="margin: 25px 0; text-align: center;">
            <a href="https://wonderlands-poolside-vibes-38.lovable.app" style="background: #475569; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              View Available Projects
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Wonderlands World Experience LLC — Contractor Management System
          </p>
        </div>
      </div>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wonderlands <onboarding@resend.dev>',
        to: [contractorEmail],
        subject: `Update on Your Application — ${taskName || projectName}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Resend error:', emailResult);
      return new Response(JSON.stringify({ error: 'Failed to send email', details: emailResult }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
