// Wonderlands password reset sender — Imagine Engine Studios Corp.
// Generates a Supabase recovery link server-side and emails it through Resend
// from sales@wonderlandsworld.com so reset emails never come from Supabase.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED = ["https://www.wonderlandsworld.com", "https://wonderlandsworld.com", "https://wonderlands-poolside-vibes-38.lovable.app"];
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { email, origin } = await req.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return json({ error: "Invalid email" }, 400);
    const base = ALLOWED.includes(origin) || /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(String(origin)) ? origin : ALLOWED[0];

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${base}/auth/reset-password` } });
    // Same answer whether or not the account exists, so emails can't be probed.
    if (error || !data?.properties?.action_link) {
      // Logged server-side only (never returned) so failures are visible in function logs.
      console.error(`generateLink failed for reset: ${error?.message ?? 'no action_link'}`);
      return json({ ok: true });
    }

    const link = data.properties.action_link;
    const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f6f7f9;padding:24px;color:#0f172a">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(90deg,#0891b2,#f97066);padding:24px;color:#fff;text-align:center"><h2 style="margin:0">Reset your Wonderlands password</h2></div>
<div style="padding:24px"><p>We received a request to reset your password. Click the button below to choose a new one.</p>
<p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#0891b2;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a></p>
<p style="font-size:13px;color:#64748b">If you didn't ask for this, you can ignore this email.</p>
<p style="font-size:13px;color:#64748b">Ricardo · +1 (239) 257-0637 · wonderlandsworlds@gmail.com</p></div></div></body></html>`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Wonderlands World <sales@wonderlandsworld.com>", to: [email], subject: "Reset your Wonderlands password", html }),
    });
    if (!r.ok) { const t = await r.text(); console.error(`Resend failed [${r.status}]: ${t}`); return json({ error: "Email failed", status: r.status, details: t }, 502); }
    console.log(`Reset email sent via Resend: ${(await r.json().catch(() => ({})))?.id ?? 'ok'}`);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});
