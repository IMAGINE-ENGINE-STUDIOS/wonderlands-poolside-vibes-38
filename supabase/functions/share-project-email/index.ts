const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, projectName, shareUrl } = await req.json();

    if (!email || !projectName || !shareUrl) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Wonderlands <onboarding@resend.dev>',
        to: [email],
        subject: `Your Project Update: ${projectName}`,
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #67e8f9;">
            <h1 style="font-size: 24px; margin-bottom: 8px;">🏗️ ${projectName}</h1>
            <p style="color: #67e8f9aa; font-size: 14px; margin-bottom: 24px;">
              You've been invited to view your construction project progress.
            </p>
            <a href="${shareUrl}" style="display: inline-block; padding: 12px 24px; background: #0891b2; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Project Progress →
            </a>
            <p style="color: #67e8f955; font-size: 11px; margin-top: 32px;">
              This is a private link. Only people with this link can view the project.
            </p>
            <hr style="border-color: #67e8f922; margin: 24px 0;" />
            <p style="color: #67e8f933; font-size: 10px;">Wonderlands World Experience LLC</p>
          </div>
        `,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend error:', result);
      return new Response(JSON.stringify({ error: result.message || 'Email send failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
