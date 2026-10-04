/**
 * CompanyCRM — the company CRM inside /workspace (and the admin preview).
 * Views: 'pipeline' (drag-and-drop deal board + forecast), 'accounts'
 * (accounts, contacts, timeline, 1-click lead conversion from clients) and
 * 'myday' (tasks due today/overdue + activity logger).
 * Data: crm_accounts / crm_contacts / crm_deals / crm_activities, all scoped
 * by company_id and protected by RLS (is_company_member). No sample rows.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Panel, StatTile, EmptyState, Skeleton, money } from '@/components/shell/EditorialShell';
import { Phone, Mail, MessageCircle, ArrowRightLeft, CheckCircle2, Trash2 } from 'lucide-react';

export type CrmView = 'pipeline' | 'accounts' | 'myday';

export const STAGES = [
  { key: 'lead', label: 'Lead in', p: 10 },
  { key: 'contact', label: 'Contact made', p: 20 },
  { key: 'site_visit', label: 'Site visit', p: 40 },
  { key: 'proposal', label: 'Proposal sent', p: 60 },
  { key: 'negotiation', label: 'Negotiation', p: 80 },
  { key: 'won', label: 'Won', p: 100 },
  { key: 'lost', label: 'Lost', p: 0 },
] as const;
const stageOf = (s: string) => STAGES.find(x => x.key === s) ?? STAGES[0];
const ACT_TYPES = ['call', 'email', 'site_visit', 'task', 'note'];

interface Deal { id: string; title: string; stage: string; amount: number; probability: number; expected_close_date: string | null; account_id: string | null; contact_id: string | null; assigned_to: string | null; updated_at: string }
interface Account { id: string; name: string; type: string; phone: string | null; email: string | null; billing_address: string | null; source_client_id: string | null; assigned_to: string | null }
interface Contact { id: string; account_id: string | null; first_name: string | null; last_name: string | null; phone: string | null; email: string | null; is_primary: boolean }
interface Activity { id: string; type: string; subject: string; description: string | null; due_date: string | null; status: string; deal_id: string | null; account_id: string | null; created_at: string }
interface Member { user_id: string; role: string }

const CompanyCRM: React.FC<{ companyId: string; view: CrmView; readOnly?: boolean; userId?: string }> = ({ companyId, view, readOnly, userId }) => {
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [acts, setActs] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [docs, setDocs] = useState<{ quotes: any[]; invoices: any[] }>({ quotes: [], invoices: [] });
  const [drag, setDrag] = useState<string | null>(null);
  const [openDeal, setOpenDeal] = useState<Deal | null>(null);
  const [openAcc, setOpenAcc] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [newDeal, setNewDeal] = useState({ title: '', amount: '', account_id: '', close: '' });
  const [newAct, setNewAct] = useState({ type: 'call', subject: '', due: '' });

  const err = (e: any) => e && toast({ title: 'Not saved', description: e.message });

  const load = useCallback(async () => {
    const [d, a, c, ac, cl, m] = await Promise.all([
      supabase.from('crm_deals').select('id,title,stage,amount,probability,expected_close_date,account_id,contact_id,assigned_to,updated_at').eq('company_id', companyId).order('position').limit(1000),
      supabase.from('crm_accounts').select('id,name,type,phone,email,billing_address,source_client_id,assigned_to').eq('company_id', companyId).order('updated_at', { ascending: false }).limit(1000),
      supabase.from('crm_contacts').select('id,account_id,first_name,last_name,phone,email,is_primary').eq('company_id', companyId).limit(1000),
      supabase.from('crm_activities').select('id,type,subject,description,due_date,status,deal_id,account_id,created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(500),
      supabase.from('clients').select('id,first_name,last_name,email,phone,address,city,state,zip_code,project_type,budget_range,status').eq('company_id', companyId).order('created_at', { ascending: false }).limit(300),
      supabase.from('company_members').select('user_id,role').eq('company_id', companyId).eq('is_active', true),
    ]);
    setDeals((d.data as Deal[]) ?? []); setAccounts((a.data as Account[]) ?? []); setContacts((c.data as Contact[]) ?? []);
    setActs((ac.data as Activity[]) ?? []); setLeads(cl.data ?? []); setMembers((m.data as Member[]) ?? []);
  }, [companyId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!openDeal) return;
    Promise.all([
      supabase.from('user_quotations').select('id,name,pool_model,total_quote_amount,status').eq('deal_id', openDeal.id),
      supabase.from('invoices').select('id,invoice_number,total_amount,payment_status').eq('deal_id', openDeal.id),
    ]).then(([a, b]) => setDocs({ quotes: a.data ?? [], invoices: b.data ?? [] }));
  }, [openDeal?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const accName = (id: string | null) => accounts.find(a => a.id === id)?.name ?? '—';
  const memberLabel = (id: string | null) => { if (!id) return 'Unassigned'; const m = members.find(x => x.user_id === id); return id === userId ? 'You' : m ? `${m.role} · ${id.slice(0, 4)}` : id.slice(0, 6); };
  const converted = useMemo(() => new Set(accounts.map(a => a.source_client_id).filter(Boolean)), [accounts]);
  const openLeads = leads.filter(l => !converted.has(l.id));

  const open = (deals ?? []).filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const pipeline = open.reduce((s, d) => s + Number(d.amount || 0), 0);
  const weighted = open.reduce((s, d) => s + Number(d.amount || 0) * (d.probability / 100), 0);
  const wonSum = (deals ?? []).filter(d => d.stage === 'won').reduce((s, d) => s + Number(d.amount || 0), 0);
  const closed = (deals ?? []).filter(d => d.stage === 'won' || d.stage === 'lost').length;
  const winRate = closed ? Math.round(((deals ?? []).filter(d => d.stage === 'won').length / closed) * 100) : 0;

  /* ---------- mutations ---------- */
  const moveDeal = async (id: string, stage: string) => {
    const s = stageOf(stage);
    setDeals(ds => ds!.map(d => d.id === id ? { ...d, stage, probability: s.p } : d));
    const { error } = await supabase.from('crm_deals').update({ stage, probability: s.p }).eq('id', id);
    if (error) { err(error); load(); return; }
    await supabase.from('crm_activities').insert({ company_id: companyId, deal_id: id, type: 'note', subject: `Moved to ${s.label}`, status: 'done' });
  };
  const patchDeal = async (id: string, patch: Partial<Deal>) => {
    setDeals(ds => ds!.map(d => d.id === id ? { ...d, ...patch } : d));
    setOpenDeal(o => o && o.id === id ? { ...o, ...patch } : o);
    err((await supabase.from('crm_deals').update(patch).eq('id', id)).error);
  };
  const addDeal = async () => {
    if (!newDeal.title.trim()) return;
    const { error } = await supabase.from('crm_deals').insert({ company_id: companyId, title: newDeal.title.trim(), amount: Number(newDeal.amount) || 0, account_id: newDeal.account_id || null, expected_close_date: newDeal.close || null, stage: 'lead', probability: 10, assigned_to: userId ?? null });
    if (error) return err(error);
    setNewDeal({ title: '', amount: '', account_id: '', close: '' }); load();
  };
  const deleteDeal = async (id: string) => { err((await supabase.from('crm_deals').delete().eq('id', id)).error); setOpenDeal(null); load(); };

  const convertLead = async (l: any) => {
    const name = `${l.first_name ?? ''} ${l.last_name ?? ''}`.trim() || l.email || 'New account';
    const addr = [l.address, l.city, l.state, l.zip_code].filter(Boolean).join(', ') || null;
    const { data: acc, error } = await supabase.from('crm_accounts').insert({ company_id: companyId, name, type: 'residential', phone: l.phone, email: l.email, billing_address: addr, source_client_id: l.id, assigned_to: userId ?? null }).select('id').single();
    if (error || !acc) return err(error);
    const { data: con } = await supabase.from('crm_contacts').insert({ company_id: companyId, account_id: acc.id, first_name: l.first_name, last_name: l.last_name, phone: l.phone, email: l.email, is_primary: true }).select('id').single();
    const { data: deal } = await supabase.from('crm_deals').insert({ company_id: companyId, account_id: acc.id, contact_id: con?.id ?? null, title: `${name} — ${l.project_type || 'Project'}`, stage: 'lead', probability: 10, assigned_to: userId ?? null }).select('id').single();
    await supabase.from('crm_activities').insert({ company_id: companyId, account_id: acc.id, deal_id: deal?.id ?? null, type: 'task', subject: `Call ${name}`, due_date: new Date().toISOString(), status: 'pending' });
    toast({ title: 'Lead converted', description: `${name} is now an account with a contact and a deal.` });
    load();
  };

  const logActivity = async (extra: { deal_id?: string | null; account_id?: string | null }) => {
    if (!newAct.subject.trim()) return;
    const isTask = newAct.type === 'task' || !!newAct.due;
    const { error } = await supabase.from('crm_activities').insert({ company_id: companyId, type: newAct.type, subject: newAct.subject.trim(), due_date: newAct.due ? new Date(newAct.due).toISOString() : null, status: isTask ? 'pending' : 'done', ...extra });
    if (error) return err(error);
    setNewAct({ type: 'call', subject: '', due: '' }); load();
  };
  const completeAct = async (id: string) => { setActs(a => a.map(x => x.id === id ? { ...x, status: 'done' } : x)); err((await supabase.from('crm_activities').update({ status: 'done' }).eq('id', id)).error); };

  if (!deals) return <div className="grid gap-4 sm:grid-cols-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>;

  const actForm = (extra: { deal_id?: string | null; account_id?: string | null }) => !readOnly && (
    <div className="flex flex-wrap gap-2 mb-4">
      <select className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={newAct.type} onChange={e => setNewAct({ ...newAct, type: e.target.value })}>{ACT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select>
      <Input className="flex-1 min-w-[160px]" placeholder="What happened / what to do" value={newAct.subject} onChange={e => setNewAct({ ...newAct, subject: e.target.value })} />
      <Input className="w-auto" type="datetime-local" value={newAct.due} onChange={e => setNewAct({ ...newAct, due: e.target.value })} aria-label="Due" />
      <Button onClick={() => logActivity(extra)}>Log</Button>
    </div>
  );
  const timeline = (list: Activity[]) => list.length ? (
    <ol className="space-y-2">{list.map(a => (
      <li key={a.id} className="flex items-start gap-3 text-sm border-l-2 border-border pl-3">
        <div className="flex-1"><p className="font-medium">{a.subject}</p><p className="text-xs text-muted-foreground capitalize">{a.type.replace('_', ' ')} · {new Date(a.created_at).toLocaleString()}{a.due_date ? ` · due ${new Date(a.due_date).toLocaleString()}` : ''} · {a.status}</p></div>
        {a.status !== 'done' && !readOnly && <button onClick={() => completeAct(a.id)} aria-label="Mark done"><CheckCircle2 className="h-4 w-4 text-teal" /></button>}
      </li>))}</ol>
  ) : <p className="text-sm text-muted-foreground">No activity yet.</p>;

  /* ---------- deal drawer ---------- */
  const dealDrawer = openDeal && (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm" onClick={() => setOpenDeal(null)}>
      <aside className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between gap-2"><div><p className="text-[10px] uppercase tracking-[0.25em] text-coral font-semibold">Deal</p><h3 className="text-xl font-semibold">{openDeal.title}</h3><p className="text-sm text-muted-foreground">{accName(openDeal.account_id)}</p></div><Button variant="outline" size="sm" onClick={() => setOpenDeal(null)}>Close</Button></div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label>Stage<select disabled={readOnly} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2" value={openDeal.stage} onChange={e => { moveDeal(openDeal.id, e.target.value); setOpenDeal({ ...openDeal, stage: e.target.value, probability: stageOf(e.target.value).p }); }}>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
          <label>Amount<Input disabled={readOnly} type="number" defaultValue={openDeal.amount} onBlur={e => patchDeal(openDeal.id, { amount: Number(e.target.value) || 0 })} /></label>
          <label>Probability %<Input disabled={readOnly} type="number" min={0} max={100} defaultValue={openDeal.probability} key={openDeal.stage} onBlur={e => patchDeal(openDeal.id, { probability: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></label>
          <label>Close date<Input disabled={readOnly} type="date" defaultValue={openDeal.expected_close_date ?? ''} onBlur={e => patchDeal(openDeal.id, { expected_close_date: e.target.value || null })} /></label>
          <label className="col-span-2">Assigned to<select disabled={readOnly} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2" value={openDeal.assigned_to ?? ''} onChange={e => patchDeal(openDeal.id, { assigned_to: e.target.value || null })}><option value="">Unassigned</option>{members.map(m => <option key={m.user_id} value={m.user_id}>{memberLabel(m.user_id)}</option>)}</select></label>
        </div>
        <div><p className="font-semibold mb-2">Quotes & invoices</p>
          {docs.quotes.length + docs.invoices.length ? <ul className="text-sm space-y-1">
            {docs.quotes.map(x => <li key={x.id}>Quote · {x.name || x.pool_model || 'Quote'} · {money(x.total_quote_amount)} · {x.status}</li>)}
            {docs.invoices.map(x => <li key={x.id}>Invoice {x.invoice_number} · {money(x.total_amount)} · {x.payment_status} · <a className="underline" href={`/invoice/${x.id}`}>View</a></li>)}
          </ul> : <p className="text-sm text-muted-foreground">No quotes or invoices linked to this deal yet.</p>}
        </div>
        <div><p className="font-semibold mb-2">Timeline</p>{actForm({ deal_id: openDeal.id, account_id: openDeal.account_id })}{timeline(acts.filter(a => a.deal_id === openDeal.id))}</div>
        {!readOnly && <Button variant="outline" onClick={() => deleteDeal(openDeal.id)}><Trash2 className="h-4 w-4 mr-2" />Delete deal</Button>}
      </aside>
    </div>
  );

  /* ---------- views ---------- */
  if (view === 'pipeline') return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Open pipeline" value={money(pipeline)} hint={`${open.length} deals`} />
        <StatTile label="Weighted forecast" value={money(weighted)} hint="Amount × probability" />
        <StatTile label="Won" value={money(wonSum)} />
        <StatTile label="Win rate" value={`${winRate}%`} hint={`${closed} closed`} />
      </div>
      {!readOnly && <Panel kicker="CRM" title="New deal">
        <div className="flex flex-wrap gap-2">
          <Input className="flex-1 min-w-[180px]" placeholder="Deal title" value={newDeal.title} onChange={e => setNewDeal({ ...newDeal, title: e.target.value })} />
          <Input className="w-32" type="number" placeholder="Amount" value={newDeal.amount} onChange={e => setNewDeal({ ...newDeal, amount: e.target.value })} />
          <select className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={newDeal.account_id} onChange={e => setNewDeal({ ...newDeal, account_id: e.target.value })}><option value="">No account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <Input className="w-auto" type="date" value={newDeal.close} onChange={e => setNewDeal({ ...newDeal, close: e.target.value })} aria-label="Close date" />
          <Button onClick={addDeal}>Add deal</Button>
        </div>
      </Panel>}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {STAGES.map(s => {
            const col = deals.filter(d => d.stage === s.key);
            const sum = col.reduce((t, d) => t + Number(d.amount || 0), 0);
            return (
              <div key={s.key} className={`w-64 shrink-0 rounded-2xl border border-border bg-muted/40 p-3 ${drag ? 'ring-1 ring-transparent hover:ring-teal' : ''}`}
                onDragOver={e => { if (!readOnly) e.preventDefault(); }} onDrop={() => { if (drag) moveDeal(drag, s.key); setDrag(null); }}>
                <div className="flex justify-between items-baseline mb-3"><p className="text-sm font-semibold">{s.label}</p><p className="text-xs text-muted-foreground tabular-nums">{col.length} · {money(sum)}</p></div>
                <div className="space-y-2 min-h-[60px]">
                  {col.map(d => (
                    <button key={d.id} draggable={!readOnly} onDragStart={() => setDrag(d.id)} onDragEnd={() => setDrag(null)} onClick={() => setOpenDeal(d)}
                      className="w-full text-left rounded-xl border border-border bg-card p-3 shadow-sm hover:border-teal transition-colors">
                      <p className="text-sm font-medium leading-snug">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{accName(d.account_id)}</p>
                      <div className="flex justify-between mt-2 text-xs"><span className="tabular-nums font-semibold">{money(d.amount)}</span><span className="text-muted-foreground">{d.probability}% · {memberLabel(d.assigned_to)}</span></div>
                      <p className="text-[11px] text-muted-foreground mt-1">{Math.max(0, Math.floor((Date.now() - new Date(d.updated_at).getTime()) / 86400000))} days in stage{d.expected_close_date ? ` · close ${d.expected_close_date}` : ''}</p>
                    </button>))}
                </div>
              </div>);
          })}
        </div>
      </div>
      {!deals.length && <EmptyState title="No deals yet" body="Add a deal above or convert a lead under Accounts & contacts." />}
      {dealDrawer}
    </div>
  );

  if (view === 'accounts') {
    const list = accounts.filter(a => !q || `${a.name} ${a.email} ${a.phone}`.toLowerCase().includes(q.toLowerCase()));
    const acc = accounts.find(a => a.id === openAcc);
    return (
      <div className="space-y-6">
        <Panel kicker="CRM" title={`Leads to convert (${openLeads.length})`}>
          {openLeads.length ? <ul className="divide-y divide-border">{openLeads.slice(0, 50).map(l => (
            <li key={l.id} className="py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span><span className="font-medium">{l.first_name} {l.last_name}</span> <span className="text-muted-foreground">· {l.email || l.phone} {l.project_type ? `· ${l.project_type}` : ''}</span></span>
              {!readOnly && <Button size="sm" variant="outline" onClick={() => convertLead(l)}><ArrowRightLeft className="h-4 w-4 mr-2" />Convert</Button>}
            </li>))}</ul> : <p className="text-sm text-muted-foreground">Every client is already an account.</p>}
        </Panel>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Panel title={`Accounts (${accounts.length})`}>
            <Input className="mb-3" placeholder="Search accounts" value={q} onChange={e => setQ(e.target.value)} />
            {list.length ? <ul className="divide-y divide-border max-h-[560px] overflow-y-auto">{list.map(a => (
              <li key={a.id}><button onClick={() => setOpenAcc(a.id)} className={`w-full text-left py-2 px-2 rounded-lg ${openAcc === a.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                <p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground capitalize">{a.type} · {deals.filter(d => d.account_id === a.id).length} deals</p></button></li>))}</ul>
              : <EmptyState title="No accounts yet" body="Convert a lead above to create your first account." />}
          </Panel>
          <Panel title={acc ? acc.name : 'Account profile'}>
            {acc ? <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{[acc.email, acc.phone, acc.billing_address].filter(Boolean).join(' · ') || 'No contact details'}</p>
              <div><p className="font-semibold mb-2">Contacts</p>{contacts.filter(c => c.account_id === acc.id).map(c => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 py-1 text-sm"><span className="font-medium">{c.first_name} {c.last_name}{c.is_primary ? ' · primary' : ''}</span>
                  {c.phone && <a href={`tel:${c.phone}`} aria-label="Call"><Phone className="h-4 w-4" /></a>}
                  {c.email && <a href={`mailto:${c.email}`} aria-label="Email"><Mail className="h-4 w-4" /></a>}
                  {c.phone && <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>}
                </div>))}</div>
              <div><p className="font-semibold mb-2">Deals</p>{deals.filter(d => d.account_id === acc.id).map(d => <button key={d.id} onClick={() => setOpenDeal(d)} className="block text-sm underline">{d.title} · {stageOf(d.stage).label} · {money(d.amount)}</button>)}</div>
              <div><p className="font-semibold mb-2">Timeline</p>{actForm({ account_id: acc.id })}{timeline(acts.filter(a => a.account_id === acc.id))}</div>
            </div> : <p className="text-sm text-muted-foreground">Pick an account to see its contacts, deals and history.</p>}
          </Panel>
        </div>
        {dealDrawer}
      </div>
    );
  }

  // My Day
  const endToday = new Date(); endToday.setHours(23, 59, 59, 999);
  const pending = acts.filter(a => a.status !== 'done' && a.due_date);
  const overdue = pending.filter(a => new Date(a.due_date!) < new Date(new Date().setHours(0, 0, 0, 0)));
  const today = pending.filter(a => !overdue.includes(a) && new Date(a.due_date!) <= endToday);
  const upcoming = pending.filter(a => new Date(a.due_date!) > endToday).sort((a, b) => a.due_date!.localeCompare(b.due_date!)).slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-3"><StatTile label="Overdue" value={overdue.length} /><StatTile label="Due today" value={today.length} /><StatTile label="Upcoming" value={upcoming.length} /></div>
      <Panel kicker="My Day" title="Log a call, visit or task">{actForm({})}</Panel>
      <Panel title="Overdue">{timeline(overdue)}</Panel>
      <Panel title="Today">{timeline(today)}</Panel>
      <Panel title="Upcoming">{timeline(upcoming)}</Panel>
    </div>
  );
};

export default CompanyCRM;
