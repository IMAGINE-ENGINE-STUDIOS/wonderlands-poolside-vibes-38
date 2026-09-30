// SOCIALITE scheduler — runs every 5 minutes (pg_cron). Sends every
// socialite_scheduled row whose send_at has passed:
//   kind=post     payload {text, platforms[], media[]}      → publishAll
//   kind=email    payload = send-bulk-email body            → send-bulk-email
//   kind=sms|whatsapp payload {messages:[{to,message,recipientName}]} → send-sms / send-whatsapp
// Rows are claimed (pending→sending) before work so a row is never sent twice.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { admin } from "../_shared/socialiteVault.ts";
import { publishAll } from "../_shared/socialitePublish.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const call = async (fn: string, body: unknown) => {
  const r = await fetch(`${URL_}/functions/v1/${fn}`, { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json().catch(() => ({ ok: r.ok }));
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const db = admin();
  const { data: due } = await db.from("socialite_scheduled").select("*").eq("status", "pending").lte("send_at", new Date().toISOString()).order("send_at").limit(25);
  const done: string[] = [];
  for (const row of due ?? []) {
    const { data: claimed } = await db.from("socialite_scheduled").update({ status: "sending" }).eq("id", row.id).eq("status", "pending").select("id");
    if (!claimed?.length) continue;
    let result: any;
    try {
      const p = row.payload ?? {};
      if (row.kind === "post") result = await publishAll(String(p.text ?? ""), p.platforms ?? [], p.media ?? [], row.created_by);
      else if (row.kind === "email") result = await call("send-bulk-email", p);
      else if (row.kind === "sms" || row.kind === "whatsapp") {
        const fn = row.kind === "sms" ? "send-sms" : "send-whatsapp";
        let sent = 0, failed = 0;
        for (const m of p.messages ?? []) {
          const r = await call(fn, { ...m, recipientType: "client" });
          r?.success === false || r?.error ? failed++ : sent++;
        }
        result = { success: failed === 0, sent, failed };
      } else result = { success: false, error: "Unknown kind" };
    } catch (e) { result = { success: false, error: (e as Error).message }; }
    const ok = result?.success !== false && !result?.error;
    await db.from("socialite_scheduled").update({ status: ok ? "sent" : "failed", result }).eq("id", row.id);
    done.push(row.id);
  }
  return json({ processed: done.length });
});
