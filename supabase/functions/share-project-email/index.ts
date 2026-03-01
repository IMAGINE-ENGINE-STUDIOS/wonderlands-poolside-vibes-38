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

    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Wonderlands World <sales@wonderlandsworld.com>',
        to: [email],
        subject: `Your Project: ${projectName} — View Progress`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); padding: 40px 40px 32px; text-align: center;">
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 700; color: #67e8f9; letter-spacing: -0.5px;">
                🏗️ Wonderlands World
              </h1>
              <p style="margin: 0; font-size: 13px; color: #67e8f9aa; letter-spacing: 2px; text-transform: uppercase;">
                Construction Project Update
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                ${currentDate}
              </p>
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #111827;">
                ${projectName}
              </h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #374151;">
                Hello! Your construction project has been shared with you. You can track real-time progress, view completed milestones, and access all project documents through your personal dashboard.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);">
                    <a href="${shareUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                      View Your Project →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Features -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="font-size: 18px;">📊</td>
                        <td style="font-size: 14px; color: #374151; font-weight: 500;">Track progress across all project phases</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="font-size: 18px;">📄</td>
                        <td style="font-size: 14px; color: #374151; font-weight: 500;">View & download project documents</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="32" style="font-size: 18px;">✅</td>
                        <td style="font-size: 14px; color: #374151; font-weight: 500;">See completed milestones in real time</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 0 40px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdfa; border-radius: 8px; border: 1px solid #ccfbf1;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 12px; color: #0d9488; line-height: 1.5;">
                      🔒 <strong>Private Link</strong> — This is a secure link to your project. Only people with this link can view the project details. Do not share it publicly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #374151;">
                Wonderlands World Experience LLC
              </p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #9ca3af;">
                Building dreams, one project at a time.
              </p>
              <p style="margin: 0; font-size: 11px; color: #d1d5db;">
                Questions? Contact us at <a href="mailto:sales@wonderlandsworld.com" style="color: #0891b2; text-decoration: none;">sales@wonderlandsworld.com</a>
                 or call <a href="tel:+12392570637" style="color: #0891b2; text-decoration: none;">+1 (239) 257-0637</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
