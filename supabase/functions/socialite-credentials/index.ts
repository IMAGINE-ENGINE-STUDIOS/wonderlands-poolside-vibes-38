// SOCIALITE credentials — main admin saves/removes social keys from the website UI.
// Tokens are verified against the provider, encrypted, and never returned to the browser.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { admin, encrypt, requireMainAdmin } from "../_shared/socialiteVault.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const PLATFORMS = ["facebook", "instagram", "threads", "x", "tiktok", "youtube"] as const;

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status") }),
  z.object({
    action: z.literal("save"),
    platform: z.enum(PLATFORMS),
    account_id: z.string().trim().max(200).optional().default(""),
    extra_id: z.string().trim().max(200).optional().default(""),
    token: z.string().trim().min(10).max(4000),
  }),
  z.object({ action: z.literal("remove"), platform: z.enum(PLATFORMS) }),
]);

async function verify(platform: string, accountId: string, token: string): Promise<{ ok: boolean; name?: string; error?: string }> {
  try {
    if (platform === "facebook") {
      if (!accountId) return { ok: false, error: "Page ID is required" };
      const r = await (await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(accountId)}?fields=name&access_token=${encodeURIComponent(token)}`)).json();
      return r.error ? { ok: false, error: r.error.message } : { ok: true, name: r.name };
    }
    if (platform === "instagram") {
      if (!accountId) return { ok: false, error: "Instagram Business account ID is required" };
      const r = await (await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(accountId)}?fields=username&access_token=${encodeURIComponent(token)}`)).json();
      return r.error ? { ok: false, error: r.error.message } : { ok: true, name: r.username };
    }
    return { ok: true }; // other platforms: stored for when publishing is added
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = await requireMainAdmin(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
  const b = parsed.data;
  const db = admin();

  if (b.action === "status") {
    const { data } = await db.from("socialite_credentials").select("platform, account_id, token_hint, verified_name, updated_at");
    return json({ accounts: data ?? [] });
  }
  if (b.action === "remove") {
    await db.from("socialite_credentials").delete().eq("platform", b.platform);
    return json({ ok: true });
  }
  const v = await verify(b.platform, b.account_id, b.token);
  if (!v.ok) return json({ ok: false, error: v.error || "The key was rejected" });
  const { error } = await db.from("socialite_credentials").upsert({
    platform: b.platform,
    account_id: b.account_id || null,
    extra_id: b.extra_id || null,
    token_cipher: await encrypt(b.token),
    token_hint: `••••${b.token.slice(-4)}`,
    verified_name: v.name ?? null,
    updated_by: auth.userId,
    updated_at: new Date().toISOString(),
  });
  if (error) return json({ ok: false, error: "Could not save" }, 500);
  return json({ ok: true, name: v.name ?? null });
});
