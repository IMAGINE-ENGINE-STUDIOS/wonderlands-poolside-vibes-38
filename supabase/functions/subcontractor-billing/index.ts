// SUBCONTRACTOR NETWORK billing — $50 one-time profile setup plus
// $150/month membership to keep getting jobs, charged through Stripe
// Checkout (STRIPE_SECRET_KEY). No webhook needed: the app calls `verify`
// on return from Checkout, and `status` re-reads the Stripe subscription
// at most once an hour so cancellations/renewals follow.
// Modeled on socialite-billing.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@14.21.0";
import { z } from "npm:zod@3";
import { admin, requireUser } from "../_shared/socialiteVault.ts";

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const stripe = () => new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2023-10-16", httpClient: Stripe.createFetchHttpClient() });

const Body = z.object({
  action: z.enum(["status", "checkout", "verify", "cancel"]),
  session_id: z.string().max(200).optional(),
  return_url: z.string().url().max(500).optional(),
});

const SETUP_CENTS = 5000;
const MONTHLY_CENTS = 15000;

const normalizeStatus = (s: string) =>
  s === "active" ? "active" : s === "trialing" ? "trialing" : s === "past_due" ? "past_due" : "canceled";

async function customerFor(userId: string, email: string) {
  const db = admin();
  const { data: row } = await db.from("subcontractor_memberships").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
  if (row?.stripe_customer_id) return row.stripe_customer_id as string;
  const found = email ? await stripe().customers.list({ email, limit: 1 }) : { data: [] as any[] };
  const id = found.data[0]?.id ?? (await stripe().customers.create({ email, metadata: { subcontractor_user: userId } })).id;
  await db.from("subcontractor_memberships").upsert({ user_id: userId, stripe_customer_id: id, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return id;
}

async function refresh(userId: string) {
  const db = admin();
  const { data: row } = await db.from("subcontractor_memberships").select("*").eq("user_id", userId).maybeSingle();
  if (!row) return null;
  const stale = Date.now() - new Date(row.updated_at).getTime() > 3600_000;
  if (!stale || !row.stripe_subscription_id) return row;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  try {
    const s = await stripe().subscriptions.retrieve(row.stripe_subscription_id);
    patch.status = normalizeStatus(s.status);
    patch.current_period_end = new Date(s.current_period_end * 1000).toISOString();
  } catch { /* keep last known state */ }
  const { data } = await db.from("subcontractor_memberships").update(patch).eq("user_id", userId).select("*").maybeSingle();
  return data ?? row;
}

async function companyIdFor(userId: string) {
  const db = admin();
  const { data } = await db.from("company_members").select("company_id").eq("user_id", userId).eq("is_active", true).order("created_at").limit(1).maybeSingle();
  return (data?.company_id as string) ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = await requireUser(req);
    if ("error" in auth) return json({ error: auth.error }, auth.status);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const b = parsed.data;
    const db = admin();

    if (b.action === "status") {
      const membership = await refresh(auth.userId);
      return json({ membership });
    }

    if (b.action === "checkout") {
      const returnBase = (b.return_url ?? `${req.headers.get("origin") ?? "https://wonderlandsworld.com"}/workspace`).split("?")[0];
      const customer = await customerFor(auth.userId, auth.email);
      const meta = { user_id: auth.userId, kind: "subcontractor_network" };
      const session = await stripe().checkout.sessions.create({
        mode: "subscription", customer, metadata: meta, subscription_data: { metadata: meta },
        line_items: [
          { quantity: 1, price_data: { currency: "usd", unit_amount: MONTHLY_CENTS, recurring: { interval: "month" }, product_data: { name: "Wonderlands Subcontractor Network Membership" } } },
          { quantity: 1, price_data: { currency: "usd", unit_amount: SETUP_CENTS, product_data: { name: "Subcontractor Profile Setup" } } },
        ],
        success_url: `${returnBase}?subcontractor=done&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnBase}?subcontractor=cancel`,
      });
      return json({ url: session.url });
    }

    if (b.action === "verify") {
      if (!b.session_id) return json({ error: "Missing session" }, 400);
      const s = await stripe().checkout.sessions.retrieve(b.session_id);
      if (s.metadata?.user_id !== auth.userId) return json({ error: "Not your payment" }, 403);
      if (!s.subscription) return json({ ok: false, pending: true });
      const sub = await stripe().subscriptions.retrieve(s.subscription as string);
      const company_id = await companyIdFor(auth.userId);
      await db.from("subcontractor_memberships").upsert({
        user_id: auth.userId,
        company_id,
        stripe_customer_id: s.customer as string,
        stripe_subscription_id: sub.id,
        stripe_session_id: s.id,
        status: normalizeStatus(sub.status),
        setup_paid: s.payment_status === "paid",
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      return json({ ok: true, kind: "subcontractor_network" });
    }

    if (b.action === "cancel") {
      const { data: row } = await db.from("subcontractor_memberships").select("*").eq("user_id", auth.userId).maybeSingle();
      if (row?.stripe_subscription_id) await stripe().subscriptions.update(row.stripe_subscription_id, { cancel_at_period_end: true });
      return json({ ok: true, note: "Ends at the close of the current period" });
    }

    return json({ error: "Unknown action" }, 400);
  } catch {
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
