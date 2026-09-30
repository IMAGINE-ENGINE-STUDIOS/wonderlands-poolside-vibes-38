// SOCIALITE commercial metering — one place that decides whether a user may
// post / send / use Genius, and records what it cost.
// Order: main admin → free. Active/trialing plan → use monthly allowance.
// Past the allowance (or no plan) → pay with credits if the admin enabled
// pay-per-use / overage. Otherwise the action is refused with a clear reason.
import { admin } from "./socialiteVault.ts";

export type MeterKind = "posts" | "email" | "sms" | "whatsapp" | "call" | "ai_tokens" | "ai_image";

// credit_costs keys per kind (ai_tokens is priced per 1,000 tokens)
const COST_KEY: Record<MeterKind, string> = {
  posts: "post", email: "email", sms: "sms", whatsapp: "whatsapp", call: "call", ai_tokens: "ai_1k_tokens", ai_image: "ai_image",
};

export async function loadBilling() {
  const sb = admin();
  const { data } = await sb.from("socialite_billing_config").select("config").eq("id", 1).maybeSingle();
  return (data?.config ?? {}) as any;
}

export async function creditBalance(userId: string) {
  const { data } = await admin().from("socialite_credit_ledger").select("delta").eq("user_id", userId);
  return (data ?? []).reduce((s, r: any) => s + Number(r.delta || 0), 0);
}

const monthStart = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); };

export async function usedThisPeriod(userId: string, kind: MeterKind) {
  const { data } = await admin().from("socialite_usage").select("units").eq("user_id", userId).eq("kind", kind).gte("created_at", monthStart());
  return (data ?? []).reduce((s, r: any) => s + Number(r.units || 0), 0);
}

export async function activePlan(userId: string) {
  const sb = admin();
  const { data: sub } = await sb.from("socialite_subscriptions").select("*").eq("user_id", userId).maybeSingle();
  const now = Date.now();
  const live = sub && (sub.status === "active" || (sub.status === "trialing" && sub.trial_ends_at && new Date(sub.trial_ends_at).getTime() > now));
  if (!live || !sub?.plan_id) return { sub, plan: null as any };
  const { data: plan } = await sb.from("socialite_plans").select("*").eq("id", sub.plan_id).maybeSingle();
  return { sub, plan };
}

/**
 * Checks and records usage. Returns { ok:true } or { ok:false, reason }.
 * `units` for ai_tokens is the raw token count.
 */
export async function meter(userId: string, isAdmin: boolean, kind: MeterKind, units: number, meta: Record<string, unknown> = {}, dryRun = false) {
  const sb = admin();
  if (isAdmin) {
    if (!dryRun) await sb.from("socialite_usage").insert({ user_id: userId, kind, units, credits: 0, meta: { ...meta, admin: true } });
    return { ok: true as const, credits: 0 };
  }
  const cfg = await loadBilling();
  const models = cfg.models ?? {};
  const { sub, plan } = await activePlan(userId);

  // Genius in flat mode needs the add-on subscription
  if ((kind === "ai_tokens" || kind === "ai_image") && cfg.ai?.mode === "flat" && !sub?.ai_addon) {
    return { ok: false as const, reason: "Genius needs the Genius add-on. Open Plan & billing to add it." };
  }

  const limit = plan ? Number(plan.limits?.[kind] ?? 0) : 0;
  const used = plan ? await usedThisPeriod(userId, kind) : 0;
  const free = Math.max(0, Math.min(units, limit - used));
  const over = units - free;
  // flat AI add-on: tokens beyond the plan are included (fair use = plan allowance x10)
  const flatAi = (kind === "ai_tokens" || kind === "ai_image") && cfg.ai?.mode === "flat" && sub?.ai_addon;
  const perTokenAi = (kind === "ai_tokens" || kind === "ai_image") && cfg.ai?.mode === "per_token";

  let credits = 0;
  if (over > 0 && !flatAi) {
    const canPay = perTokenAi || (plan ? models.overage : models.pay_per_use);
    if (!canPay) return { ok: false as const, reason: plan ? `Monthly ${kind.replace("_", " ")} allowance used up. Upgrade your plan.` : "Choose a plan or buy credits to continue." };
    const rate = Number(cfg.credit_costs?.[COST_KEY[kind]] ?? 0);
    const billable = perTokenAi ? units : over;
    credits = kind === "ai_tokens" ? (billable / 1000) * rate : billable * rate;
    credits = Math.round(credits * 1000) / 1000;
    if (credits > 0) {
      const bal = await creditBalance(userId);
      if (bal < credits) return { ok: false as const, reason: `Not enough credits (needs ${credits}, you have ${Math.floor(bal)}). Buy credits in Plan & billing.` };
    }
  }
  if (dryRun) return { ok: true as const, credits };
  await sb.from("socialite_usage").insert({ user_id: userId, kind, units, credits, meta });
  if (credits > 0) await sb.from("socialite_credit_ledger").insert({ user_id: userId, delta: -credits, reason: `${kind} x${units}` });
  return { ok: true as const, credits };
}
