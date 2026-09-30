// SOCIALITE publisher — posts to a Facebook Page and Instagram Business account via Meta Graph API v20.
// Requires secrets: META_PAGE_ID, META_PAGE_ACCESS_TOKEN, META_IG_USER_ID (optional). Main admin only.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const G = "https://graph.facebook.com/v20.0";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: u } = await sb.auth.getUser();
    if (!u?.user) return json({ success: false, error: "Sign in required" }, 401);
    const { data: isAdmin } = await sb.rpc("is_main_admin");
    if (!isAdmin) return json({ success: false, error: "Admins only" }, 403);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.slice(0, 63000) : "";
    const platforms: string[] = Array.isArray(body?.platforms) ? body.platforms : [];
    const media: string[] = (Array.isArray(body?.media) ? body.media : []).filter((m: unknown) => typeof m === "string" && /^https:\/\//.test(m as string));
    if (!text && !media.length) return json({ success: false, error: "Nothing to post" }, 400);

    const pageId = Deno.env.get("META_PAGE_ID");
    const token = Deno.env.get("META_PAGE_ACCESS_TOKEN");
    const igId = Deno.env.get("META_IG_USER_ID");
    if (!pageId || !token) return json({ success: false, error: "Facebook is not connected yet" });

    const results: Record<string, unknown> = {};
    if (platforms.includes("facebook")) {
      const url = media[0] ? `${G}/${pageId}/photos` : `${G}/${pageId}/feed`;
      const p = new URLSearchParams({ access_token: token, ...(media[0] ? { url: media[0], caption: text } : { message: text }) });
      results.facebook = await (await fetch(url, { method: "POST", body: p })).json();
    }
    if (platforms.includes("instagram")) {
      if (!igId) results.instagram = { error: "Instagram not connected" };
      else if (!media[0]) results.instagram = { error: "Instagram needs an image" };
      else {
        const c = await (await fetch(`${G}/${igId}/media`, { method: "POST", body: new URLSearchParams({ image_url: media[0], caption: text, access_token: token }) })).json();
        results.instagram = c.id
          ? await (await fetch(`${G}/${igId}/media_publish`, { method: "POST", body: new URLSearchParams({ creation_id: c.id, access_token: token }) })).json()
          : c;
      }
    }
    const failed = Object.values(results).some((r: any) => r?.error);
    return json({ success: !failed && Object.keys(results).length > 0, results, error: failed ? "Some platforms failed" : undefined });
  } catch (e) {
    return json({ success: false, error: (e as Error).message }, 500);
  }
});
