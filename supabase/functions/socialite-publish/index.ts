// SOCIALITE "Post now" — main admin only. Platform logic lives in _shared/socialitePublish.ts.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireMainAdmin } from "../_shared/socialiteVault.ts";
import { publishAll } from "../_shared/socialitePublish.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const OK = ["facebook", "instagram", "threads", "x", "tiktok", "youtube"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireMainAdmin(req);
    if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);
    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.slice(0, 63000) : "";
    const platforms = (Array.isArray(body?.platforms) ? body.platforms : []).filter((p: unknown) => OK.includes(p as string));
    const media = (Array.isArray(body?.media) ? body.media : []).filter((m: unknown) => typeof m === "string" && /^https:\/\//.test(m as string));
    if (!text && !media.length) return json({ success: false, error: "Nothing to post" }, 400);
    return json(await publishAll(text, platforms, media));
  } catch (e) {
    return json({ success: false, error: (e as Error).message }, 500);
  }
});
