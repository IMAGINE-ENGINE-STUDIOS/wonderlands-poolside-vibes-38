// Daily campaign sender.
// Scheduled by pg_cron at 14:00 and 15:00 UTC; it only sends when it is 10:00
// in New York (covers both summer and winter time). Each day it picks the
// next active campaign in `daily_email_rotation` after the one sent last, so
// consecutive days always get a different email. `daily_email_sends` has one
// row per date, so a day can never be sent twice.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(url, serviceKey);

  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
    }).formatToParts(now).map((p) => [p.type, p.value]),
  );
  const nyDate = `${parts.year}-${parts.month}-${parts.day}`;
  if (Number(parts.hour) !== 10) return json({ skipped: true, reason: `Not 10:00 in New York (hour ${parts.hour})` });

  const { data: rotation } = await supabase
    .from("daily_email_rotation")
    .select("campaign_key, title, subject, html")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("campaign_key", { ascending: true });
  if (!rotation?.length) return json({ skipped: true, reason: "No campaigns in the daily rotation" });

  const { data: last } = await supabase
    .from("daily_email_sends")
    .select("campaign_key")
    .order("send_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  const lastIdx = last ? rotation.findIndex((r) => r.campaign_key === last.campaign_key) : -1;
  const pick = rotation[(lastIdx + 1) % rotation.length];

  // Claim today — the primary key on send_date makes a second run exit here.
  const { error: claimErr } = await supabase
    .from("daily_email_sends")
    .insert({ send_date: nyDate, campaign_key: pick.campaign_key, title: pick.title });
  if (claimErr) return json({ skipped: true, reason: `Already sent for ${nyDate}` });

  try {
    const res = await fetch(`${url}/functions/v1/send-bulk-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({ send_to_all: true, custom_subject: pick.subject, custom_html: pick.html, template_name: pick.title }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`[${res.status}] ${JSON.stringify(result)}`);
    await supabase
      .from("daily_email_sends")
      .update({ status: "sent", successful: result.successful ?? 0, failed: result.failed ?? 0 })
      .eq("send_date", nyDate);
    return json({ sent: true, campaign: pick.title, ...result });
  } catch (e) {
    console.error("daily campaign send failed", e);
    await supabase.from("daily_email_sends").update({ status: "failed" }).eq("send_date", nyDate);
    return json({ sent: false, error: String(e) }, 500);
  }
});
