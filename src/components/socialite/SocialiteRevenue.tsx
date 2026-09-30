/**
 * SOCIALITE → Admin → Pricing & revenue (main admin only).
 * Controls every way SOCIALITE earns money: monthly plans, pay per post/send
 * (credits), credit packs, free trial, overage past plan limits and how
 * Genius is charged (included in plan / flat monthly add-on / per token).
 * Writes go straight to socialite_plans + socialite_billing_config (RLS:
 * main admin only). Live numbers come from socialite-billing admin_summary.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { billing, USAGE_LABELS, type BillingConfig, type Plan } from "@/lib/socialite/billing";

const db = supabase as any;
const card = "rounded-[18px] border border-zinc-800 bg-[#161617] p-5";
const input = "bg-[#0f0f10] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[12.5px] text-zinc-100 outline-none focus:border-zinc-600 w-full";
const btn = "px-4 py-2 rounded-full text-[12px] font-semibold transition disabled:opacity-40";
const usd = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const LIMIT_KEYS = Object.keys(USAGE_LABELS);
const MODEL_LABELS: [keyof BillingConfig["models"], string, string][] = [
  ["subscription", "Monthly / yearly plans", "Users subscribe to a plan with monthly allowances"],
  ["pay_per_use", "Pay per post / per send", "Users without a plan pay with credits for each action"],
  ["credit_packs", "Volume credit packs", "Users buy bundles of credits"],
  ["trial", "Free trial", "New users can try a plan free for a few days"],
  ["overage", "Overage", "Plan users keep going past their allowance, paid with credits"],
  ["ai", "Genius for customers", "Paying users can use the Genius helper"],
];

const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
  <button onClick={() => set(!on)} className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${on ? "bg-white" : "bg-zinc-700"}`}>
    <div className={`w-4 h-4 rounded-full bg-black transition ${on ? "translate-x-4" : ""}`} />
  </button>
);

export default function SocialiteRevenue() {
  const [cfg, setCfg] = useState<BillingConfig | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sum, setSum] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [{ data: c }, { data: p }] = await Promise.all([
      db.from("socialite_billing_config").select("config").eq("id", 1).maybeSingle(),
      db.from("socialite_plans").select("*").order("sort"),
    ]);
    setCfg(c?.config ?? null);
    setPlans(p ?? []);
    billing({ action: "admin_summary" }).then(setSum).catch((e) => setMsg(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    const r1 = await db.from("socialite_billing_config").upsert({ id: 1, config: cfg, updated_at: new Date().toISOString() });
    const r2 = plans.length ? await db.from("socialite_plans").upsert(plans.map((p, i) => ({ ...p, sort: i, updated_at: new Date().toISOString() }))) : { error: null };
    setSaving(false);
    setMsg(r1.error || r2.error ? `Could not save: ${(r1.error || r2.error).message}` : "Pricing saved — customers see it right away.");
  };
  const removePlan = async (id: string) => {
    if (!confirm("Delete this plan? Current subscribers keep paying until they cancel.")) return;
    await db.from("socialite_plans").delete().eq("id", id);
    setPlans((p) => p.filter((x) => x.id !== id));
  };

  if (!cfg) return <div className="text-[13px] text-zinc-400">Loading pricing…</div>;
  const setC = (patch: Partial<BillingConfig>) => setCfg({ ...cfg, ...patch });
  const setPlan = (i: number, patch: Partial<Plan>) => setPlans((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-5">
      {msg && <div className="rounded-[14px] border border-zinc-700 bg-zinc-900 px-4 py-3 text-[12.5px] text-zinc-200 flex justify-between">{msg}<button onClick={() => setMsg("")} className="text-zinc-500">Close</button></div>}

      {/* Revenue at a glance */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          ["Monthly recurring", usd(sum?.mrr ?? 0)],
          ["Credit sales (all time)", usd(sum?.creditRevenue ?? 0)],
          ["Paying plans", String(sum?.counts?.active ?? 0)],
          ["On free trial", String(sum?.counts?.trialing ?? 0)],
          ["Genius add-ons", String(sum?.counts?.aiAddon ?? 0)],
        ].map(([k, v]) => (
          <div key={k} className={card}><div className="text-[11px] text-zinc-500">{k}</div><div className="text-[20px] font-semibold mono mt-1">{v}</div></div>
        ))}
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold">Ways to charge</div>
          <button disabled={saving} onClick={save} className={`${btn} bg-white text-black`}>{saving ? "Saving…" : "Save pricing"}</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {MODEL_LABELS.map(([k, label, desc]) => (
            <div key={k} className="flex items-center gap-3 rounded-[12px] border border-zinc-800 bg-[#0f0f10] p-3">
              <div className="flex-1"><div className="text-[13px] font-medium">{label}</div><div className="text-[11px] text-zinc-500">{desc}</div></div>
              <Toggle on={!!cfg.models?.[k]} set={(v) => setC({ models: { ...cfg.models, [k]: v } })} />
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <label className="text-[11px] text-zinc-500">Trial length (days)<input type="number" min={1} className={input} value={cfg.trial_days} onChange={(e) => setC({ trial_days: Number(e.target.value) })} /></label>
          <label className="text-[11px] text-zinc-500">Trial plan
            <select className={input} value={cfg.trial_plan} onChange={(e) => setC({ trial_plan: e.target.value })}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          </label>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold">Plans</div>
          <button onClick={() => setPlans((p) => [...p, { id: `plan-${Date.now().toString(36)}`, name: "New plan", monthly_price: 29, yearly_price: 290, limits: {}, features: [], active: true, sort: p.length }])} className={`${btn} bg-zinc-900 border border-zinc-800 text-zinc-200`}>Add plan</button>
        </div>
        <div className="space-y-3">
          {plans.map((p, i) => (
            <div key={p.id} className="rounded-[14px] border border-zinc-800 bg-[#0f0f10] p-4 space-y-3">
              <div className="grid sm:grid-cols-4 gap-3 items-end">
                <label className="text-[11px] text-zinc-500">Name<input className={input} value={p.name} onChange={(e) => setPlan(i, { name: e.target.value })} /></label>
                <label className="text-[11px] text-zinc-500">Monthly $<input type="number" min={0} className={input} value={p.monthly_price} onChange={(e) => setPlan(i, { monthly_price: Number(e.target.value) })} /></label>
                <label className="text-[11px] text-zinc-500">Yearly $<input type="number" min={0} className={input} value={p.yearly_price} onChange={(e) => setPlan(i, { yearly_price: Number(e.target.value) })} /></label>
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-[11px] text-zinc-500">On sale</span><Toggle on={p.active} set={(v) => setPlan(i, { active: v })} />
                  <button onClick={() => removePlan(p.id)} className="text-[12px] text-zinc-500 hover:text-white">Delete</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {LIMIT_KEYS.map((k) => (
                  <label key={k} className="text-[10.5px] text-zinc-500">{USAGE_LABELS[k]} / mo
                    <input type="number" min={0} className={input} value={p.limits?.[k] ?? 0} onChange={(e) => setPlan(i, { limits: { ...p.limits, [k]: Number(e.target.value) } })} />
                  </label>
                ))}
              </div>
              <label className="text-[11px] text-zinc-500 block">Extra lines shown on the plan (one per line)
                <textarea rows={2} className={input} value={(p.features ?? []).join("\n")} onChange={(e) => setPlan(i, { features: e.target.value.split("\n").filter(Boolean) })} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className={card}>
          <div className="text-[14px] font-semibold mb-1">Price per action (credits)</div>
          <div className="text-[11px] text-zinc-500 mb-3">Used for pay per use, overage and Genius per token.</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries({ post: "Per post (per platform)", email: "Per email", sms: "Per text", whatsapp: "Per WhatsApp", call: "Per call", ai_1k_tokens: "Genius per 1,000 tokens", ai_image: "Genius per picture" }).map(([k, label]) => (
              <label key={k} className="text-[11px] text-zinc-500">{label}
                <input type="number" min={0} step="0.01" className={input} value={cfg.credit_costs?.[k] ?? 0} onChange={(e) => setC({ credit_costs: { ...cfg.credit_costs, [k]: Number(e.target.value) } })} />
              </label>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="text-[14px] font-semibold mb-3">How Genius is charged</div>
          <div className="grid gap-2">
            {([["plan", "Included in plans", "Uses each plan's Genius allowance; overage in credits"], ["flat", "Flat monthly add-on", "Customers pay a fixed monthly price for Genius"], ["per_token", "Per token / per picture", "Every use is paid with credits at the prices on the left"]] as const).map(([m, l, d]) => (
              <button key={m} onClick={() => setC({ ai: { ...cfg.ai, mode: m } })} className={`text-left rounded-[12px] border p-3 transition ${cfg.ai?.mode === m ? "border-white bg-zinc-900" : "border-zinc-800 bg-[#0f0f10]"}`}>
                <div className="text-[13px] font-medium">{l}</div><div className="text-[11px] text-zinc-500">{d}</div>
              </button>
            ))}
          </div>
          {cfg.ai?.mode === "flat" && <label className="text-[11px] text-zinc-500 block mt-3">Add-on price per month ($)<input type="number" min={0} className={input} value={cfg.ai.flat_monthly} onChange={(e) => setC({ ai: { ...cfg.ai, flat_monthly: Number(e.target.value) } })} /></label>}
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold">Credit packs</div>
          <button onClick={() => setC({ credit_packs: [...(cfg.credit_packs ?? []), { id: `c${Date.now().toString(36)}`, name: "New pack", credits: 100, price: 10 }] })} className={`${btn} bg-zinc-900 border border-zinc-800 text-zinc-200`}>Add pack</button>
        </div>
        <div className="space-y-2">
          {(cfg.credit_packs ?? []).map((k, i) => (
            <div key={k.id} className="grid grid-cols-4 gap-2 items-end">
              <label className="text-[11px] text-zinc-500">Name<input className={input} value={k.name} onChange={(e) => setC({ credit_packs: cfg.credit_packs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} /></label>
              <label className="text-[11px] text-zinc-500">Credits<input type="number" min={1} className={input} value={k.credits} onChange={(e) => setC({ credit_packs: cfg.credit_packs.map((x, j) => (j === i ? { ...x, credits: Number(e.target.value) } : x)) })} /></label>
              <label className="text-[11px] text-zinc-500">Price $<input type="number" min={0} className={input} value={k.price} onChange={(e) => setC({ credit_packs: cfg.credit_packs.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)) })} /></label>
              <button onClick={() => setC({ credit_packs: cfg.credit_packs.filter((_, j) => j !== i) })} className="text-[12px] text-zinc-500 hover:text-white pb-2">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="text-[14px] font-semibold mb-3">Usage this month (all customers)</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {LIMIT_KEYS.map((k) => (
            <div key={k} className="rounded-[12px] border border-zinc-800 bg-[#0f0f10] p-3">
              <div className="text-[10.5px] text-zinc-500">{USAGE_LABELS[k]}</div>
              <div className="text-[14px] font-semibold mono">{Number(sum?.usageTotals?.[k]?.units ?? 0).toLocaleString()}</div>
              <div className="text-[10.5px] text-zinc-500">{Number(sum?.usageTotals?.[k]?.credits ?? 0).toLocaleString()} credits</div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="text-[14px] font-semibold mb-3">Customers</div>
        {!sum?.subscribers?.length ? <div className="text-[12px] text-zinc-500">No customers yet.</div> : (
          <div className="divide-y divide-zinc-800 text-[12px]">
            {sum.subscribers.map((s: any) => (
              <div key={s.user_id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-zinc-200">{s.name || s.email || s.user_id.slice(0, 8)} <span className="text-zinc-500">{s.email}</span></span>
                <span className="text-zinc-400">{plans.find((p) => p.id === s.plan_id)?.name ?? "—"} · {s.status}{s.ai_addon ? " · Genius" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
