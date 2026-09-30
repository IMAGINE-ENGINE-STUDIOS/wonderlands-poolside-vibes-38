/**
 * SocialiteClients — client hub inside SOCIALITE.
 * "Client hub": pick a client → see their quotes, invoices and message history,
 * and send email / SMS / WhatsApp, quotes, invoices, follow-ups, promotions and
 * referral invites. Can also message many selected clients at once.
 * "Manage list": the /admin client manager (map, ZIP filter, reps, stages).
 */
import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Search, Mail, MessageSquare, MessageCircle, Send, FileText, Receipt, Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import {
  SClient, Channel, loadClients, sendToClient, emailQuote, emailInvoice, emailPromotion,
  runPool, FOLLOW_UPS, SIGN_TXT, fill, SITE,
} from "@/lib/socialite/clientActions";

const AdminClientManager = lazy(() => import("@/components/AdminClientManager"));
const money = (n: any) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const card = "rounded-[18px] border border-zinc-800 bg-[#161617]";
const pill = "px-3 py-1.5 rounded-full text-[12px] font-medium border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-white hover:text-black transition disabled:opacity-40";

export default function SocialiteClients() {
  const [tab, setTab] = useState<"hub" | "manage">("hub");
  return (
    <div className="p-4 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-100">Clients</h1>
          <p className="text-[13px] text-zinc-500">Message clients, send quotes, invoices, promotions and follow-ups.</p>
        </div>
        <div className="inline-flex p-1 rounded-full bg-zinc-900 border border-zinc-800">
          {([["hub", "Client hub"], ["manage", "Manage list"]] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-full text-[12.5px] font-medium ${tab === id ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>
      </div>
      {tab === "hub" ? <ClientHub /> : (
        <div className="socialite-skin rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 lg:p-5">
          <Suspense fallback={<div className="text-[13px] text-zinc-500 p-6">Loading clients…</div>}><AdminClientManager /></Suspense>
        </div>
      )}
    </div>
  );
}

function ClientHub() {
  const [clients, setClients] = useState<SClient[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<SClient | null>(null);
  useEffect(() => { loadClients().then(setClients); }, []);
  const t = q.toLowerCase();
  const shown = useMemo(() => clients.filter(c => !t || `${c.first_name} ${c.last_name} ${c.email} ${c.phone} ${c.address_city}`.toLowerCase().includes(t)).slice(0, 300), [clients, t]);
  const toggle = (id: string) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const picked = clients.filter(c => sel.has(c.id));

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-4">
      <div className={`${card} flex flex-col max-h-[760px]`}>
        <div className="p-3 border-b border-zinc-900 space-y-2">
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2">
            <Search className="w-4 h-4 text-zinc-500" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${clients.length} clients`} className="bg-transparent outline-none text-[13px] flex-1" />
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-zinc-500">
            <span>{sel.size} selected</span>
            <div className="flex gap-3">
              <button onClick={() => setSel(new Set(shown.map(c => c.id)))} className="hover:text-white">Select shown</button>
              <button onClick={() => setSel(new Set())} className="hover:text-white">Clear</button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto divide-y divide-zinc-900">
          {shown.length === 0 && <div className="p-6 text-center text-[13px] text-zinc-500">No clients found.</div>}
          {shown.map(c => (
            <div key={c.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${active?.id === c.id ? "bg-zinc-900" : "hover:bg-zinc-900/50"}`} onClick={() => setActive(c)}>
              <input type="checkbox" checked={sel.has(c.id)} onClick={e => e.stopPropagation()} onChange={() => toggle(c.id)} className="accent-white" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium truncate">{c.first_name} {c.last_name}</div>
                <div className="text-[11px] text-zinc-500 truncate">{c.email}{c.phone ? ` · ${c.phone}` : ""}</div>
              </div>
              {c.status && <span className="text-[10px] uppercase tracking-wider text-zinc-500">{c.status}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 min-w-0">
        {sel.size > 1 && <BulkSend clients={picked} />}
        {active ? <ClientDetail key={active.id} c={active} /> : sel.size <= 1 && (
          <div className={`${card} p-10 text-center text-[13px] text-zinc-500`}>Pick a client to see their quotes, invoices and history — or tick several to message them together.</div>
        )}
      </div>
    </div>
  );
}

function MessageBox({ onSend, allowEmail = true, busyText }: { onSend: (ch: Channel, text: string, subject: string) => Promise<void>; allowEmail?: boolean; busyText?: string }) {
  const [ch, setCh] = useState<Channel>(allowEmail ? "email" : "sms");
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("A note from Wonderlands");
  const [sign, setSign] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const go = async () => {
    if (!text.trim()) return;
    setBusy(true); setNote("");
    try { await onSend(ch, ch !== "email" && sign ? `${text}\n${SIGN_TXT}` : text, subject); setNote("Sent."); setText(""); }
    catch (e: any) { setNote(e?.message || "Couldn't send."); }
    setBusy(false);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {([["email", "Email", Mail], ["sms", "SMS", MessageSquare], ["whatsapp", "WhatsApp", MessageCircle]] as const).filter(x => allowEmail || x[0] !== "email").map(([id, l, I]) => (
          <button key={id} onClick={() => setCh(id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${ch === id ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}><I className="w-3.5 h-3.5" />{l}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FOLLOW_UPS.map(f => <button key={f.label} className={pill} onClick={() => { setText(f.text); setSubject(f.subject); }}>{f.label}</button>)}
      </div>
      {ch === "email" && <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] outline-none" placeholder="Subject" />}
      <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Write a message — {first_name} fills in each client's name" className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-[13px] outline-none resize-y" />
      <div className="flex items-center gap-3">
        {ch !== "email" && <label className="flex items-center gap-2 text-[12px] text-zinc-400"><input type="checkbox" checked={sign} onChange={e => setSign(e.target.checked)} className="accent-white" />Add signature</label>}
        <span className="text-[12px] text-zinc-500 flex-1">{busy ? busyText || "Sending…" : note}</span>
        <button disabled={busy || !text.trim()} onClick={go} className="px-4 py-2 rounded-full bg-white text-black text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-40"><Send className="w-3.5 h-3.5" />Send</button>
      </div>
    </div>
  );
}

function BulkSend({ clients }: { clients: SClient[] }) {
  const [prog, setProg] = useState("");
  return (
    <div className={`${card} p-4 space-y-3`}>
      <div className="text-[14px] font-semibold">Message {clients.length} selected clients</div>
      <MessageBox busyText={prog} onSend={async (ch, text, subject) => {
        if (!confirm(`Send this ${ch} to ${clients.length} clients?`)) throw new Error("Cancelled");
        const r = await runPool(clients, c => sendToClient(c, ch, text, subject), (d, ok) => setProg(`${d}/${clients.length} · ${ok} sent`));
        if (r.failed) throw new Error(`${r.ok} sent, ${r.failed} failed`);
      }} />
    </div>
  );
}

function ClientDetail({ c }: { c: SClient }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [gen, setGen] = useState<{ open: boolean; quoteId?: string }>({ open: false });
  const [note, setNote] = useState("");

  const load = async () => {
    const [a, b, l, p] = await Promise.all([
      supabase.from("user_quotations").select("*").ilike("email", c.email).order("created_at", { ascending: false }),
      supabase.from("invoices").select("id, invoice_number, customer_name, customer_email, customer_phone, total_amount, payment_status, status, invoice_date, quotation_id").ilike("customer_email", c.email).order("created_at", { ascending: false }),
      supabase.from("communication_logs").select("id, channel, subject, message_content, status, created_at").eq("client_id", c.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("promotions").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    ]);
    setQuotes(a.data || []); setInvoices(b.data || []); setLogs(l.data || []); setPromos(p.data || []);
  };
  useEffect(() => { load(); }, [c.id]);

  const act = async (label: string, fn: () => Promise<any>) => {
    setNote(`${label}…`);
    try { await fn(); setNote(`${label} — sent.`); load(); } catch (e: any) { setNote(e?.message || `${label} failed.`); }
  };
  const text = (msg: string) => act("Text", () => sendToClient(c, "sms", `${msg}\n${SIGN_TXT}`));

  return (
    <div className="space-y-4">
      <div className={`${card} p-5 flex flex-wrap items-center gap-4`}>
        <div className="flex-1 min-w-0">
          <div className="text-[18px] font-semibold">{c.first_name} {c.last_name}</div>
          <div className="text-[12.5px] text-zinc-500">{c.email}{c.phone ? ` · ${c.phone}` : " · no phone"}{c.address_city ? ` · ${c.address_city}` : ""}{c.email_unsubscribed ? " · unsubscribed from email" : ""}</div>
        </div>
        <a href={`/quote`} target="_blank" rel="noreferrer" className={pill}><Plus className="w-3.5 h-3.5 inline mr-1" />Build quote</a>
        <button onClick={() => setGen({ open: true })} className={pill}><Plus className="w-3.5 h-3.5 inline mr-1" />New invoice</button>
      </div>
      {note && <div className="text-[12px] text-zinc-400 px-1">{note}</div>}

      <div className={`${card} p-5`}><div className="text-[13px] font-semibold mb-3">Send a message</div><MessageBox onSend={(ch, t, s) => sendToClient(c, ch, t, s)} /></div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className={`${card} divide-y divide-zinc-900`}>
          <div className="p-4 text-[13px] font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Quotes ({quotes.length})</div>
          {quotes.length === 0 && <div className="p-4 text-[12.5px] text-zinc-500">No quotes for this client.</div>}
          {quotes.map(x => {
            const inv = invoices.find(i => i.quotation_id === x.id);
            return (
              <div key={x.id} className="p-4 space-y-2">
                <div className="flex items-center gap-2"><div className="flex-1 text-[13px] truncate">{x.pool_model || "Custom"} <span className="text-zinc-500">· {new Date(x.created_at).toLocaleDateString()}</span></div><span className="mono text-[13px]">{money(x.total_quote_amount)}</span></div>
                <div className="flex flex-wrap gap-1.5">
                  <button className={pill} onClick={() => act("Quote email", () => emailQuote(x, c.id))}>Email quote</button>
                  <button className={pill} disabled={!c.phone} onClick={() => text(fill(`Hi {first_name}, your Wonderlands quote (${x.pool_model || "custom project"}, ${money(x.total_quote_amount)}) is ready. Want to go over it? Reply here.`, c))}>Text follow-up</button>
                  <a className={pill} href={`/admin/quotes/${x.id}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 inline" /></a>
                  {inv ? <span className="px-3 py-1.5 text-[12px] text-emerald-300">{inv.invoice_number}</span> : <button className={pill} onClick={() => setGen({ open: true, quoteId: x.id })}>Create invoice</button>}
                </div>
              </div>
            );
          })}
        </div>
        <div className={`${card} divide-y divide-zinc-900`}>
          <div className="p-4 text-[13px] font-semibold flex items-center gap-2"><Receipt className="w-4 h-4" />Invoices ({invoices.length})</div>
          {invoices.length === 0 && <div className="p-4 text-[12.5px] text-zinc-500">No invoices for this client.</div>}
          {invoices.map(x => (
            <div key={x.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2"><div className="flex-1 text-[13px] truncate">{x.invoice_number} <span className="text-zinc-500">· {x.payment_status || "unpaid"}</span></div><span className="mono text-[13px]">{money(x.total_amount)}</span></div>
              <div className="flex flex-wrap gap-1.5">
                <button className={pill} onClick={() => act("Invoice email", () => emailInvoice(x, c.id))}>Email invoice</button>
                <button className={pill} disabled={!c.phone} onClick={() => text(fill(`Hi {first_name}, a friendly reminder about invoice ${x.invoice_number} (${money(x.total_amount)}). Reply here with any questions.`, c))}>Text reminder</button>
                <a className={pill} href={`/admin/invoices/${x.id}`} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 inline" /></a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-4">
        <div className={`${card} p-4 space-y-3`}>
          <div className="text-[13px] font-semibold">Promotions & referrals</div>
          {promos.length === 0 && <div className="text-[12.5px] text-zinc-500">No active promotions.</div>}
          {promos.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="flex-1 text-[12.5px] truncate">{p.name} <span className="text-zinc-500">· {money(p.bundle_price)}</span></div>
              <button className={pill} onClick={() => act("Promotion", () => emailPromotion(p, [c.id]))}>Email</button>
              <button className={pill} disabled={!c.phone} onClick={() => text(fill(`Hi {first_name}, a special offer for you: ${p.name}${p.bundle_price ? ` — ${money(p.bundle_price)}` : ""}. Details: ${SITE}`, c))}>Text</button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
            <div className="flex-1 text-[12.5px]">Referral invite</div>
            <button className={pill} onClick={() => act("Referral invite", () => sendToClient(c, "email", FOLLOW_UPS[3].text, FOLLOW_UPS[3].subject))}>Email</button>
            <button className={pill} disabled={!c.phone} onClick={() => text(fill(FOLLOW_UPS[3].text, c))}>Text</button>
          </div>
        </div>
        <div className={`${card} p-4`}>
          <div className="text-[13px] font-semibold mb-3">History</div>
          {logs.length === 0 ? <div className="text-[12.5px] text-zinc-500">Nothing sent yet.</div> : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {logs.map(l => (
                <div key={l.id} className="text-[12px]">
                  <span className="uppercase tracking-wider text-zinc-500 mr-2">{l.channel}</span>
                  <span className={l.status === "failed" ? "text-zinc-500 line-through" : "text-zinc-300"}>{l.subject || l.message_content?.slice(0, 80)}</span>
                  <span className="text-zinc-600 ml-2">{new Date(l.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InvoiceGenerator isOpen={gen.open} quotationId={gen.quoteId} onClose={() => setGen({ open: false })} onCreated={() => { setGen({ open: false }); load(); }} />
    </div>
  );
}
