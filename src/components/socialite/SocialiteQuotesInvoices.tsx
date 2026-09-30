/**
 * SocialiteQuotesInvoices — quotes (user_quotations) and invoices inside SOCIALITE.
 * "Create invoice" opens the shared InvoiceGenerator pre-filled from the quote;
 * after saving, the list refreshes and the quote is marked as having an invoice.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Receipt, FileText, Plus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InvoiceGenerator from "@/components/InvoiceGenerator";

interface Quote { id: string; name: string; email: string; pool_model: string | null; total_quote_amount: number | null; status: string | null; created_at: string }
interface Invoice { id: string; invoice_number: string; customer_name: string; total_amount: number; payment_status: string | null; status: string | null; invoice_date: string; quotation_id: string | null }

const money = (n: number | null | undefined) => `$${Math.round(Number(n) || 0).toLocaleString()}`;

export default function SocialiteQuotesInvoices() {
  const [tab, setTab] = useState<"quotes" | "invoices">("quotes");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [q, setQ] = useState("");
  const [gen, setGen] = useState<{ open: boolean; quoteId?: string }>({ open: false });

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from("user_quotations").select("id, name, email, pool_model, total_quote_amount, status, created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("invoices").select("id, invoice_number, customer_name, total_amount, payment_status, status, invoice_date, quotation_id").order("created_at", { ascending: false }).limit(500),
    ]);
    setQuotes((a.data as Quote[]) || []);
    setInvoices((b.data as Invoice[]) || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const invoiced = useMemo(() => new Map(invoices.filter(i => i.quotation_id).map(i => [i.quotation_id!, i])), [invoices]);
  const t = q.toLowerCase();
  const shownQuotes = quotes.filter(x => !t || `${x.name} ${x.email} ${x.pool_model}`.toLowerCase().includes(t));
  const shownInv = invoices.filter(x => !t || `${x.invoice_number} ${x.customer_name}`.toLowerCase().includes(t));
  const unpaid = invoices.filter(i => i.payment_status !== "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const paid = invoices.filter(i => i.payment_status === "paid").reduce((s, i) => s + Number(i.total_amount || 0), 0);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold">Quotes & Invoices</h1>
          <p className="text-[13px] text-zinc-500">Turn any quote into an invoice and track payments.</p>
        </div>
        <button onClick={() => setGen({ open: true })} className="px-4 py-2 rounded-full bg-white text-black text-[12px] font-semibold flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New invoice</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[["Quotes", quotes.length], ["Invoices", invoices.length], ["Unpaid", money(unpaid)], ["Paid", money(paid)]].map(([l, v]) => (
          <div key={l as string} className="rounded-[18px] border border-zinc-800 bg-[#161617] p-4">
            <div className="text-[11px] uppercase tracking-widest text-zinc-500">{l}</div>
            <div className="text-[22px] font-semibold mt-1 mono">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex p-1 rounded-full bg-zinc-900 border border-zinc-800">
          {([["quotes", "Quotes", FileText], ["invoices", "Invoices", Receipt]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium transition ${tab === id ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" className="bg-transparent outline-none text-[13px] flex-1" />
        </div>
      </div>

      <div className="rounded-[20px] border border-zinc-800 bg-[#161617] divide-y divide-zinc-900">
        {tab === "quotes" && (shownQuotes.length === 0 ? <div className="p-8 text-center text-[13px] text-zinc-500">No quotes yet.</div> : shownQuotes.map(x => {
          const inv = invoiced.get(x.id);
          return (
            <div key={x.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium truncate">{x.name} <span className="text-zinc-500 font-normal">· {x.pool_model || "Custom"}</span></div>
                <div className="text-[11.5px] text-zinc-500 truncate">{x.email} · {new Date(x.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-[13px] mono">{money(x.total_quote_amount)}</div>
              <a href={`/admin/quotes/${x.id}`} target="_blank" rel="noreferrer" aria-label="Open quote" className="w-9 h-9 rounded-full grid place-items-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"><ExternalLink className="w-4 h-4" /></a>
              {inv
                ? <a href={`/admin/invoices/${inv.id}`} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-[12px] font-semibold border bg-zinc-900 border-zinc-800 text-emerald-300">{inv.invoice_number}</a>
                : <button onClick={() => setGen({ open: true, quoteId: x.id })} className="px-4 py-2 rounded-full text-[12px] font-semibold border bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black transition">Create invoice</button>}
            </div>
          );
        }))}
        {tab === "invoices" && (shownInv.length === 0 ? <div className="p-8 text-center text-[13px] text-zinc-500">No invoices yet.</div> : shownInv.map(x => (
          <a key={x.id} href={`/admin/invoices/${x.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 hover:bg-zinc-900/60 transition">
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-medium truncate">{x.invoice_number} <span className="text-zinc-500 font-normal">· {x.customer_name}</span></div>
              <div className="text-[11.5px] text-zinc-500">{new Date(x.invoice_date).toLocaleDateString()} · {x.status}</div>
            </div>
            <span className={`text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider ${x.payment_status === "paid" ? "bg-emerald-950 text-emerald-300" : "bg-zinc-800 text-zinc-300"}`}>{x.payment_status || "unpaid"}</span>
            <div className="text-[13px] mono w-28 text-right">{money(x.total_amount)}</div>
          </a>
        )))}
      </div>

      <InvoiceGenerator isOpen={gen.open} quotationId={gen.quoteId} onClose={() => setGen({ open: false })} onCreated={() => { setGen({ open: false }); setTab("invoices"); load(); }} />
    </div>
  );
}
