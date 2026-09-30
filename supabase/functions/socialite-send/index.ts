// SOCIALITE "My contacts" sender — any signed-in user can email / text / WhatsApp
// the contacts THEY uploaded (socialite_contacts, owner-checked here).
// Email via Resend; SMS/WhatsApp reuse send-sms / send-whatsapp. Max 200 per request.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { admin, requireUser } from "../_shared/socialiteVault.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const Body = z.object({
  channel: z.enum(["email", "sms", "whatsapp"]),
  contact_ids: z.array(z.string().uuid()).min(1).max(200),
  subject: z.string().trim().max(200).optional().default("A message for you"),
  message: z.string().trim().min(1).max(5000),
});
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireUser(req);
    if ("error" in auth) return json({ error: auth.error }, auth.status);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
    const { channel, contact_ids, subject, message } = parsed.data;
    const db = admin();
    const { data: contacts } = await db.from("socialite_contacts").select("id, name, email, phone").in("id", contact_ids).eq("owner_id", auth.userId);
    const list = (contacts ?? []).filter((c) => (channel === "email" ? c.email : c.phone));
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let ok = 0;
    const sentIds: string[] = [];
    const queue = [...list];
    const worker = async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
        const first = (c.name || "").split(" ")[0] || "there";
        const text = message.replace(/\{first_name\}/g, first);
        try {
          if (channel === "email") {
            if (!resendKey) throw new Error("Email not configured");
            const html = `<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1f2937;font-size:16px;line-height:1.7;padding:24px;">${esc(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;">${p.replace(/\n/g, "<br/>")}</p>`).join("")}</div>`;
            const r = await fetch("https://api.resend.com/emails", {
              method: "POST", headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ from: "SOCIALITE <sales@wonderlandsworld.com>", to: [c.email], subject, html, reply_to: auth.email || undefined }),
            });
            if (!r.ok) throw new Error(await r.text());
          } else {
            const { data, error } = await db.functions.invoke(channel === "sms" ? "send-sms" : "send-whatsapp", { body: { to: c.phone, message: text, recipientType: "contact", recipientName: c.name } });
            if (error || data?.success === false) throw new Error("send failed");
          }
          ok++; sentIds.push(c.id);
        } catch { /* counted as failed */ }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, list.length) }, worker));
    if (sentIds.length) await db.from("socialite_contacts").update({ last_sent_at: new Date().toISOString(), last_channel: channel }).in("id", sentIds);
    return json({ successful: ok, failed: contact_ids.length - ok });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
