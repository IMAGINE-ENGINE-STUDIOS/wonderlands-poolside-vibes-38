// platform-lead-notify — emails the Wonderlands owner when a visitor submits a
// flagship form (Solar, Quote Atelier). Recipient is fixed server-side; only
// fires when submit_wonderlands_lead filed that name in the last 5 minutes.
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const OWNER = "wonderlandsworlds@gmail.com";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const esc = (s: unknown) => String(s ?? "").slice(0, 2000).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const { name, email, phone, message, source } = await req.json();
    if (!name || typeof name !== "string") return json({ ok: false }, 400);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cid } = await db.rpc("platform_company_id");
    const since = new Date(Date.now() - 5 * 60_000).toISOString();
    const { count } = await db.from("crm_accounts").select("id", { count: "exact", head: true })
      .eq("company_id", cid).eq("name", name.trim().slice(0, 120)).gte("created_at", since);
    if (!count) return json({ ok: false, reason: "no_recent_lead" });
    const row = (k: string, v: unknown) => v ? `<tr><td style="padding:6px 12px 6px 0;color:#555">${k}</td><td style="padding:6px 0;color:#111">${esc(v)}</td></tr>` : "";
    const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;color:#111;background:#fff">
      <p style="font:600 11px Arial;letter-spacing:.25em;text-transform:uppercase;color:#777">New ${esc(source || "website")} lead</p>
      <h1 style="font-weight:500;font-size:30px;margin:8px 0 20px">${esc(name)}</h1>
      <table style="font:14px Arial;border-collapse:collapse">${row("Email", email)}${row("Phone", phone)}${row("Form", source)}</table>
      ${message ? `<p style="font:14px/1.6 Arial;background:#fafafa;border:1px solid #eee;padding:16px;margin-top:20px;white-space:pre-line">${esc(message)}</p>` : ""}
      <p style="margin-top:28px"><a href="https://www.wonderlandsworld.com/admin" style="background:#111;color:#fff;padding:12px 22px;text-decoration:none;font:600 14px Arial;border-radius:6px">Open Command Center</a></p>
      <p style="font:12px Arial;color:#888;margin-top:24px">The lead is already in Clients and the CRM pipeline.</p></div>`;
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const r = await resend.emails.send({ from: "Website leads <noreply@wonderlandsworld.com>", to: [OWNER], subject: `New ${String(source || "website")} lead: ${name.slice(0, 80)}`, html, reply_to: email || undefined } as any);
    return json({ ok: !(r as any)?.error });
  } catch (e) {
    console.error("platform-lead-notify", e);
    return json({ ok: false }, 500);
  }
});
