const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, projectName, milestoneName, shareUrl } = await req.json();

    if (!email || !projectName || !milestoneName) {
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
        subject: `✅ Milestone Completed: ${milestoneName} — ${projectName}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdfa;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 40%, #f97066 100%); padding: 32px 40px; text-align: center;">
              {/* Brand logo now lives under /logo instead of /images for cleaner public asset organization. */}
              <img src="https://wonderlands-poolside-vibes-38.lovable.app/logo/wonderlands-logo.png" alt="Wonderlands World" width="80" height="80" style="display: block; margin: 0 auto 12px; border-radius: 50%; background: #ffffff; padding: 6px;" />
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">
                Milestone Completed! ✅
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                ${currentDate}
              </p>
              <h2 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #0891b2;">
                ${projectName}
              </h2>
              
              <!-- Milestone Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px; border: 2px solid #0891b2; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f0fdfa; padding: 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="font-size: 28px; vertical-align: middle;">✅</td>
                        <td style="vertical-align: middle;">
                          <p style="margin: 0 0 4px; font-size: 12px; color: #0891b2; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Completed Milestone</p>
                          <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0891b2;">${milestoneName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #374151;">
                Great news! A milestone in your construction project has been completed. Log in to your dashboard to see the full progress update and view any related documents.
              </p>

              <!-- CTA Button -->
              ${shareUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #f97066 0%, #fb923c 100%);">
                    <a href="${shareUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                      View Project Progress →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid #ccfbf1; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #0891b2;">
                Wonderlands World Experience LLC
              </p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280;">
                Building dreams, one project at a time.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                Questions? Contact us at <a href="mailto:sales@wonderlandsworld.com" style="color: #f97066; text-decoration: none;">sales@wonderlandsworld.com</a>
                 or call <a href="tel:+12392570637" style="color: #f97066; text-decoration: none;">+1 (239) 257-0637</a>
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
