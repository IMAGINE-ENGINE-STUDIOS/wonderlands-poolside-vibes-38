// SOCIALITE publisher — posts to a Facebook Page and Instagram Business account via Meta Graph API v20.
// Keys come from the encrypted vault (entered in SOCIALITE → Accounts). Main admin only.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getCredential, requireMainAdmin } from "../_shared/socialiteVault.ts";

const G = "https://graph.facebook.com/v20.0";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireMainAdmin(req);
    if ("error" in auth) return json({ success: false, error: auth.error }, auth.status);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.slice(0, 63000) : "";
    const platforms: string[] = Array.isArray(body?.platforms) ? body.platforms : [];
    const media: string[] = (Array.isArray(body?.media) ? body.media : []).filter((m: unknown) => typeof m === "string" && /^https:\/\//.test(m as string));
    if (!text && !media.length) return json({ success: false, error: "Nothing to post" }, 400);

    const fb = await getCredential("facebook");
    const ig = await getCredential("instagram");
    const results: Record<string, unknown> = {};

    for (const p of platforms) {
      if (p === "facebook") {
        if (!fb?.accountId) { results.facebook = { error: "Facebook not connected" }; continue; }
        const url = media[0] ? `${G}/${fb.accountId}/photos` : `${G}/${fb.accountId}/feed`;
        const q = new URLSearchParams({ access_token: fb.token, ...(media[0] ? { url: media[0], caption: text } : { message: text }) });
        results.facebook = await (await fetch(url, { method: "POST", body: q })).json();
      } else if (p === "instagram") {
        const token = ig?.token || fb?.token;
        if (!ig?.accountId || !token) results.instagram = { error: "Instagram not connected" };
        else if (!media[0]) results.instagram = { error: "Instagram needs an image" };
        else {
          const c = await (await fetch(`${G}/${ig.accountId}/media`, { method: "POST", body: new URLSearchParams({ image_url: media[0], caption: text, access_token: token }) })).json();
          results.instagram = c.id
            ? await (await fetch(`${G}/${ig.accountId}/media_publish`, { method: "POST", body: new URLSearchParams({ creation_id: c.id, access_token: token }) })).json()
            : c;
        }
      } else {
        results[p] = { error: "Publishing to this platform isn't available yet" };
      }
    }
    const errs = Object.entries(results).filter(([, r]: any) => r?.error).map(([k, r]: any) => `${k}: ${typeof r.error === "string" ? r.error : r.error.message}`);
    return json({ success: !errs.length && Object.keys(results).length > 0, results, error: errs.join(" · ") || undefined });
  } catch (e) {
    return json({ success: false, error: (e as Error).message }, 500);
  }
});
