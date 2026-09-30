// SOCIALITE "My contacts" sender — any signed-in user can email / text / WhatsApp
// the contacts THEY uploaded (socialite_contacts, owner-checked here).
// Email via Resend; SMS/WhatsApp reuse send-sms / send-whatsapp. Max 200 per request.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { requireUser } from "../_shared/socialiteVault.ts";
import { sendToContacts } from "../_shared/contactSend.ts";
import { meter } from "../_shared/socialiteBilling.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const Body = z.object({
  channel: z.enum(["email", "sms", "whatsapp"]),
  contact_ids: z.array(z.string().uuid()).min(1).max(200),
  subject: z.string().trim().max(200).optional().default("A message for you"),
  message: z.string().trim().min(1).max(5000),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireUser(req);
    if ("error" in auth) return json({ error: auth.error }, auth.status);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
    const { channel, contact_ids, subject, message } = parsed.data;
    // Commercial metering: one unit per recipient, checked before sending.
    const check = await meter(auth.userId, auth.isAdmin, channel, contact_ids.length, {}, true);
    if (!check.ok) return json({ error: check.reason, billing: true }, 402);
    const result: any = await sendToContacts(auth.userId, auth.email, channel, contact_ids, subject, message);
    const sent = Number(result?.successful ?? 0) || 0;
    if (sent > 0) await meter(auth.userId, auth.isAdmin, channel, sent, { requested: contact_ids.length });
    return json(result);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
