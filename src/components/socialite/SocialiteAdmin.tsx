/**
 * SocialiteAdmin — SOCIALITE's growth hub (NOT the full /admin dashboard).
 * Only what SOCIALITE needs: Performance (campaigns, messages, posts, sales),
 * Promotions, Quotes & Invoices, Referrals and Sequences — each with send /
 * post actions wired to the same edge functions the rest of SOCIALITE uses.
 * The /admin managers are lazy-loaded below each launcher for full editing.
 */
import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SocialiteQuotesInvoices from "./SocialiteQuotesInvoices";
import { emailPromotion, loadClients, runPool, sendText, emailClients, textToHtml, FOLLOW_UPS, REFERRAL_URL, SIGN_TXT, fill, SITE } from "@/lib/socialite/clientActions";

const PromotionsManager = lazy(() => import("@/components/admin/AdminPromotionsManager"));
const ReferralsManager = lazy(() => import("@/components/AdminReferralsManager"));
const SequencesManager = lazy(() => import("@/components/admin/AutomationSequencesManager"));
const AutomationStatus = lazy(() => import("@/components/admin/AutomationStatusManager"));

type Key = "performance" | "promotions" | "quotes" | "referrals" | "sequences";
const TABS: { id: Key; label: string }[] = [
  { id: "performance", label: "Performance" },
  { id: "promotions", label: "Promotions" },
  { id: "quotes", label: "Quotes & Invoices" },
  { id: "referrals", label: "Referrals" },
  { id: "sequences", label: "Sequences" },
];
const card = "rounded-[18px] border border-zinc-800 bg-[#161617]";
const pill = "px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black transition disabled:opacity-40";
const money = (n: any) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const Skin = ({ children }: { children: React.ReactNode }) => (
  <div className="socialite-skin rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 lg:p-5">
    <Suspense fallback={<div className="text-[13px] text-zinc-500 p-6">Loading…</div>}>{children}</Suspense>
  </div>
);

export default function SocialiteAdmin() {
  const [tab, setTab] = useState<Key>(() => {
    const s = localStorage.getItem("pf_admin_tab") as Key; return TABS.some(t => t.id === s) ? s : "performance";
  });
  const pick = (k: Key) => { setTab(k); localStorage.setItem("pf_admin_tab", k); };
  return (
    <div className={tab === "quotes" ? "" : "p-4 lg:p-8 space-y-5"}>
      <div className={tab === "quotes" ? "px-4 lg:px-8 pt-4 lg:pt-8 space-y-5" : "space-y-5"}>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-100">Admin</h1>
          <p className="text-[13px] text-zinc-500">Promotions, quotes, invoices, referrals, sequences and results — all sendable from SOCIALITE.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => pick(t.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition ${tab === t.id ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      {tab === "performance" && <Performance />}
      {tab === "promotions" && <><PromoLauncher /><Skin><PromotionsManager /></Skin></>}
      {tab === "quotes" && <SocialiteQuotesInvoices />}
      {tab === "referrals" && <><ReferralLauncher /><Skin><ReferralsManager /></Skin></>}
      {tab === "sequences" && <><Skin><SequencesManager /></Skin><Skin><AutomationStatus /></Skin></>}
    </div>
  );
}

/* ---------- Performance: real numbers only ---------- */
function Performance() {
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    Promise.all([
      supabase.from("daily_email_sends").select("campaign_key, title, successful, failed, send_date").order("send_date", { ascending: false }).limit(60),
      supabase.from("communication_logs").select("channel, status").gte("created_at", since).limit(5000),
      supabase.from("user_quotations").select("id, total_quote_amount", { count: "exact" }).limit(1000),
      supabase.from("invoices").select("quotation_id, total_amount, payment_status").limit(1000),
      supabase.from("referrals").select("status", { count: "exact" }).limit(1000),
      supabase.from("socialite_scheduled").select("kind, status").limit(2000),
    ]).then(([e, l, q, i, r, s]) => setD({ e: e.data || [], l: l.data || [], q: q.data || [], qc: q.count || 0, i: i.data || [], r: r.data || [], s: s.data || [] }));
  }, []);
  const posts = useMemo(() => { try { return JSON.parse(localStorage.getItem("pf_queue") || "[]") as any[]; } catch { return []; } }, []);
  if (!d) return <div className="text-[13px] text-zinc-500">Loading…</div>;

  const byCampaign = new Map<string, { title: string; ok: number; fail: number; days: number }>();
  d.e.forEach((x: any) => { const v = byCampaign.get(x.campaign_key) || { title: x.title || x.campaign_key, ok: 0, fail: 0, days: 0 }; v.ok += x.successful; v.fail += x.failed; v.days++; byCampaign.set(x.campaign_key, v); });
  const ch = (c: string) => { const r = d.l.filter((x: any) => x.channel === c); return { sent: r.filter((x: any) => x.status !== "failed").length, failed: r.filter((x: any) => x.status === "failed").length }; };
  const published = posts.filter(p => p.status === "published");
  const eng = published.reduce((a, p) => ({ likes: a.likes + (p.engagement?.likes || 0), comments: a.comments + (p.engagement?.comments || 0), shares: a.shares + (p.engagement?.shares || 0) }), { likes: 0, comments: 0, shares: 0 });
  const invoicedQ = new Set(d.i.filter((x: any) => x.quotation_id).map((x: any) => x.quotation_id)).size;
  const paid = d.i.filter((x: any) => x.payment_status === "paid").reduce((s: number, x: any) => s + Number(x.total_amount || 0), 0);
  const Stat = ({ l, v, s }: { l: string; v: any; s?: string }) => (
    <div className={`${card} p-4`}><div className="text-[11px] uppercase tracking-widest text-zinc-500">{l}</div><div className="text-[22px] font-semibold mt-1 mono">{v}</div>{s && <div className="text-[11.5px] text-zinc-500 mt-0.5">{s}</div>}</div>
  );
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat l="Posts published" v={published.length} s={`${posts.filter(p => p.status === "scheduled").length} waiting`} />
        <Stat l="Post engagement" v={eng.likes + eng.comments + eng.shares} s={`${eng.likes} likes · ${eng.comments} comments · ${eng.shares} shares`} />
        <Stat l="Quotes → invoices" v={`${invoicedQ}/${d.qc}`} s={d.qc ? `${Math.round((invoicedQ / d.qc) * 100)}% converted` : "no quotes yet"} />
        <Stat l="Paid revenue" v={money(paid)} s={`${d.r.length} referrals received`} />
        {(["email", "sms", "whatsapp", "voice"] as const).map(c => { const v = ch(c); return <Stat key={c} l={`${c === "voice" ? "Calls" : c.toUpperCase()} · 30 days`} v={v.sent} s={`${v.failed} failed`} />; })}
      </div>
      <div className={`${card} divide-y divide-zinc-900`}>
        <div className="p-4 text-[13px] font-semibold">Email campaigns</div>
        {byCampaign.size === 0 && <div className="p-4 text-[12.5px] text-zinc-500">No campaign sends yet.</div>}
        {[...byCampaign.entries()].map(([k, v]) => (
          <div key={k} className="p-4 flex items-center gap-4 text-[13px]">
            <div className="flex-1 truncate">{v.title}</div>
            <span className="text-zinc-500">{v.days} sends</span>
            <span className="mono">{v.ok} delivered</span>
            <span className="mono text-zinc-500 w-20 text-right">{v.fail} failed</span>
          </div>
        ))}
      </div>
      <div className={`${card} p-4 text-[13px]`}>
        <div className="font-semibold mb-2">Send Times</div>
        <div className="flex flex-wrap gap-4 text-zinc-400">
          {["pending", "sent", "failed"].map(s => <span key={s}>{s}: <span className="mono text-zinc-100">{d.s.filter((x: any) => x.status === s).length}</span></span>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Promotions: email / text / post ---------- */
function PromoLauncher() {
  const [promos, setPromos] = useState<any[]>([]);
  const [note, setNote] = useState("");
  useEffect(() => { supabase.from("promotions").select("*").order("created_at", { ascending: false }).then(r => setPromos(r.data || [])); }, []);
  const run = async (label: string, fn: () => Promise<string>) => { setNote(`${label}…`); try { setNote(await fn()); } catch (e: any) { setNote(e?.message || `${label} failed`); } };
  const promoText = (p: any) => `${p.name}${p.highlight_text ? ` — ${p.highlight_text}` : ""}${p.bundle_price ? ` · ${money(p.bundle_price)}` : ""}. ${p.description || ""}`.trim();
  return (
    <div className={`${card} divide-y divide-zinc-900`}>
      <div className="p-4 flex items-center justify-between"><div className="text-[13px] font-semibold">Send a promotion</div><span className="text-[12px] text-zinc-500">{note}</span></div>
      {promos.length === 0 && <div className="p-4 text-[12.5px] text-zinc-500">No promotions yet — create one below.</div>}
      {promos.map(p => (
        <div key={p.id} className="p-4 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] text-[13px] truncate">{p.name} <span className="text-zinc-500">· {money(p.bundle_price)}{p.is_active ? "" : " · inactive"}</span></div>
          <button className={pill} onClick={() => confirm(`Email "${p.name}" to all clients?`) && run("Emailing", async () => { const r = await emailPromotion(p, "all"); return `Emailed ${r?.successful ?? 0} clients`; })}>Email all clients</button>
          <button className={pill} onClick={() => confirm(`Text "${p.name}" to every client with a phone?`) && run("Texting", async () => {
            const cs = (await loadClients()).filter(c => c.phone);
            const r = await runPool(cs, c => sendText(c, "sms", fill(`Hi {first_name}, ${promoText(p)} ${SITE}\n${SIGN_TXT}`, c)));
            return `Texted ${r.ok}, ${r.failed} failed`;
          })}>Text all clients</button>
          <button className={pill} onClick={() => run("Posting", async () => {
            const media = p.image_url?.startsWith("https://") ? [p.image_url] : [];
            const { data, error } = await supabase.functions.invoke("socialite-publish", { body: { text: `${promoText(p)}\n${SITE}`, platforms: ["facebook", "instagram"], media } });
            if (error) throw new Error("Connect Facebook & Instagram in Accounts first");
            return `Posted: ${JSON.stringify((data as any)?.results ?? "done").slice(0, 80)}`;
          })}>Post to Facebook & Instagram</button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Referrals: invite clients to refer ---------- */
function ReferralLauncher() {
  const [note, setNote] = useState("");
  const inv = FOLLOW_UPS[3];
  const run = async (fn: () => Promise<string>) => { setNote("Sending…"); try { setNote(await fn()); } catch (e: any) { setNote(e?.message || "Failed"); } };
  return (
    <div className={`${card} p-4 flex flex-wrap items-center gap-2`}>
      <div className="flex-1 min-w-[220px]">
        <div className="text-[13px] font-semibold">Invite clients to refer</div>
        <div className="text-[12px] text-zinc-500">Sends your referral link ({REFERRAL_URL}). {note}</div>
      </div>
      <button className={pill} onClick={() => confirm("Email the referral invite to all clients?") && run(async () => {
        const ids = (await loadClients()).filter(c => !c.email_unsubscribed).map(c => c.id);
        const r = await emailClients(ids, inv.subject, textToHtml(inv.text.replace(/\{first_name\}/g, "{{first_name}}")));
        return `Emailed ${r?.successful ?? ids.length} clients`;
      })}>Email all clients</button>
      <button className={pill} onClick={() => confirm("Text the referral invite to every client with a phone?") && run(async () => {
        const cs = (await loadClients()).filter(c => c.phone);
        const r = await runPool(cs, c => sendText(c, "sms", `${fill(inv.text, c)}\n${SIGN_TXT}`));
        return `Texted ${r.ok}, ${r.failed} failed`;
      })}>Text all clients</button>
    </div>
  );
}
