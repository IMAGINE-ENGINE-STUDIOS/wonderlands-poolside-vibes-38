// SOCIALITE public REST API (v1). Auth: `Authorization: Bearer sk_live_...`.
// Only the key owner's own SOCIALITE data is reachable (their contacts, posts,
// scheduled sends, usage). Company data (clients, quotes, invoices, products)
// is never exposed. Hardening: hashed keys, scopes, 60 req/min per key,
// 64 KB body cap, strict validation, generic errors, no-store/no-sniff headers.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { admin } from "../_shared/socialiteVault.ts";
import { resolveKey, sha256 } from "../_shared/socialiteApiAuth.ts";
import { publishAll } from "../_shared/socialitePublish.ts";
import { sendToContacts } from "../_shared/contactSend.ts";
import { meter, activePlan, creditBalance, usedThisPeriod, type MeterKind } from "../_shared/socialiteBilling.ts";

const H = {
  ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
};
const RATE = 60;
const PLATFORMS = ["facebook", "instagram", "x", "youtube", "tiktok", "threads", "linkedin"] as const;

const ContactIn = z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(255).optional(), phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/).optional() })
  .refine((c) => c.email || c.phone, "email or phone required");
const ContactsIn = z.object({ contacts: z.array(ContactIn).min(1).max(500) });
const When = { send_at: z.string().datetime({ offset: true }).optional(), timezone: z.string().max(64).optional().default("UTC") };
const PostIn = z.object({ text: z.string().trim().min(1).max(5000), platforms: z.array(z.enum(PLATFORMS)).min(1), media: z.array(z.string().url().max(2000)).max(10).optional().default([]), ...When });
const MsgIn = z.object({ channel: z.enum(["email", "sms", "whatsapp"]), contact_ids: z.array(z.string().uuid()).min(1).max(200), subject: z.string().trim().max(200).optional().default("A message for you"), message: z.string().trim().min(1).max(5000), ...When });

class ApiError extends Error { constructor(public status: number, msg: string) { super(msg); } }
const need = (scopes: string[], s: string) => { if (!scopes.includes(s)) throw new ApiError(403, `This key lacks the "${s}" permission`); };
async function body<T>(req: Request, schema: z.ZodType<T>) {
  const txt = await req.text();
  if (txt.length > 65536) throw new ApiError(413, "Request body too large");
  let raw: unknown; try { raw = JSON.parse(txt || "null"); } catch { throw new ApiError(400, "Body must be JSON"); }
  const p = schema.safeParse(raw);
  if (!p.success) throw new ApiError(422, JSON.stringify(p.error.flatten().fieldErrors));
  return p.data;
}
const future = (iso?: string) => { if (!iso) return null; const t = new Date(iso).getTime(); if (t < Date.now() + 60_000) throw new ApiError(422, "send_at must be at least 1 minute in the future"); return new Date(t).toISOString(); };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });
  const reply = (b: unknown, s = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(b), { status: s, headers: { ...H, ...extra } });
  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/socialite-api/, "") || "/";
  if (path === "/" || path === "/v1") return reply({ name: "SOCIALITE API", version: "v1", docs: "Open SOCIALITE → API" });

  const key = await resolveKey(req);
  if (!key) return reply({ error: "Invalid or missing API key" }, 401);
  const db = admin();

  // Rate limit: RATE requests per rolling minute per key.
  const { count } = await db.from("socialite_api_requests").select("id", { count: "exact", head: true }).eq("key_id", key.id).neq("status", 429).gte("created_at", new Date(Date.now() - 60_000).toISOString());
  const used = count ?? 0;
  const rl = { "X-RateLimit-Limit": String(RATE), "X-RateLimit-Remaining": String(Math.max(0, RATE - used - 1)) };
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const log = async (status: number) => {
    await db.from("socialite_api_requests").insert({ key_id: key.id, owner_id: key.owner_id, method: req.method, path: path.slice(0, 120), status, ip_hash: ip ? (await sha256(ip)).slice(0, 16) : null });
    await db.from("socialite_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);
  };
  if (used >= RATE) { await log(429); return reply({ error: "Rate limit exceeded. Try again in a minute." }, 429, { ...rl, "Retry-After": "60" }); }

  const owner = key.owner_id;
  const { data: prof } = await db.from("profiles").select("role").eq("id", owner).maybeSingle();
  const isAdmin = prof?.role === "main_admin";
  let status = 200;
  try {
    const m = req.method;
    const seg = path.split("/").filter(Boolean); // ["v1", resource, id?]
    if (seg[0] !== "v1") throw new ApiError(404, "Not found");
    const [, res, id] = seg;
    let out: unknown;

    if (res === "me" && m === "GET") {
      need(key.scopes, "read");
      const { plan, sub } = await activePlan(owner);
      out = { plan: plan ? { name: plan.name } : null, status: sub?.status ?? "none", credits: Math.floor(await creditBalance(owner)), scopes: key.scopes };
    } else if (res === "usage" && m === "GET") {
      need(key.scopes, "read");
      const kinds: MeterKind[] = ["posts", "email", "sms", "whatsapp", "ai_tokens", "ai_image"];
      out = { period: "month", usage: Object.fromEntries(await Promise.all(kinds.map(async (k) => [k, await usedThisPeriod(owner, k)]))) };
    } else if (res === "contacts" && m === "GET" && !id) {
      need(key.scopes, "read");
      const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? 50)));
      const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
      const { data } = await db.from("socialite_contacts").select("id, name, email, phone, source, last_sent_at, created_at").eq("owner_id", owner).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      out = { data: data ?? [], limit, offset };
    } else if (res === "contacts" && m === "POST") {
      need(key.scopes, "write");
      const b = await body(req, ContactsIn);
      const rows = b.contacts.map((c) => ({ owner_id: owner, name: c.name, email: c.email ?? null, phone: c.phone ?? null, source: "api" }));
      const { data, error } = await db.from("socialite_contacts").insert(rows).select("id, name, email, phone");
      if (error) throw new ApiError(400, "Could not save contacts");
      status = 201; out = { data };
    } else if (res === "contacts" && m === "DELETE" && id) {
      need(key.scopes, "write");
      await db.from("socialite_contacts").delete().eq("id", id).eq("owner_id", owner);
      out = { deleted: true };
    } else if (res === "posts" && m === "POST") {
      need(key.scopes, "send");
      const b = await body(req, PostIn);
      const at = future(b.send_at);
      if (at) {
        const chk = await meter(owner, isAdmin, "posts", b.platforms.length, {}, true);
        if (!chk.ok) throw new ApiError(402, chk.reason);
        const { data } = await db.from("socialite_scheduled").insert({ kind: "post", created_by: owner, send_at: at, timezone: b.timezone, payload: { text: b.text, platforms: b.platforms, media: b.media } }).select("id, send_at, status").single();
        status = 202; out = { scheduled: data };
      } else {
        const pre = await meter(owner, isAdmin, "posts", b.platforms.length, {}, true);
        if (!pre.ok) throw new ApiError(402, pre.reason);
        const r: any = await publishAll(b.text, b.platforms, b.media, owner);
        const okCount = Array.isArray(r?.results) ? r.results.filter((x: any) => x?.success).length : (r?.success ? b.platforms.length : 0);
        if (okCount) await meter(owner, isAdmin, "posts", okCount, { via: "api" });
        out = { result: r };
      }
    } else if (res === "messages" && m === "POST") {
      need(key.scopes, "send");
      const b = await body(req, MsgIn);
      const at = future(b.send_at);
      if (at) {
        const chk = await meter(owner, isAdmin, b.channel, b.contact_ids.length, {}, true);
        if (!chk.ok) throw new ApiError(402, chk.reason);
        const { data } = await db.from("socialite_scheduled").insert({ kind: "contact", created_by: owner, send_at: at, timezone: b.timezone, payload: { channel: b.channel, contact_ids: b.contact_ids, subject: b.subject, message: b.message } }).select("id, send_at, status").single();
        status = 202; out = { scheduled: data };
      } else {
        const pre = await meter(owner, isAdmin, b.channel, b.contact_ids.length, {}, true);
        if (!pre.ok) throw new ApiError(402, pre.reason);
        const r = await sendToContacts(owner, "", b.channel, b.contact_ids, b.subject, b.message);
        if (r.successful) await meter(owner, isAdmin, b.channel, r.successful, { via: "api" });
        out = { successful: r.successful, failed: r.failed };
      }
    } else if (res === "scheduled" && m === "GET") {
      need(key.scopes, "read");
      const { data } = await db.from("socialite_scheduled").select("id, kind, send_at, timezone, status, created_at").eq("created_by", owner).order("send_at", { ascending: true }).limit(200);
      out = { data: data ?? [] };
    } else if (res === "scheduled" && m === "DELETE" && id) {
      need(key.scopes, "write");
      await db.from("socialite_scheduled").update({ status: "cancelled" }).eq("id", id).eq("created_by", owner).eq("status", "pending");
      out = { cancelled: true };
    } else throw new ApiError(404, "Not found");

    await log(status);
    return reply(out, status, rl);
  } catch (e) {
    status = e instanceof ApiError ? e.status : 500;
    await log(status);
    return reply({ error: e instanceof ApiError ? e.message : "Something went wrong" }, status, rl);
  }
});
