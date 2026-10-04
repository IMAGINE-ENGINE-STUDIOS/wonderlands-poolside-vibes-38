/**
 * CustomerAccount — homeowner dashboard at /account (replaces ConsumerDashboard).
 * Real data only: the user's quotes, orders and invoices (RLS-scoped, matched
 * by user_id or email). `previewUserId`/`previewEmail` let a platform admin
 * view any customer read-only from /admin/preview/account.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { usePersistentState } from '@/hooks/usePersistentState';
import EditorialShell, { Panel, StatTile, EmptyState, Skeleton, money } from '@/components/shell/EditorialShell';
import ConsumerPreferences from '@/components/ConsumerPreferences';
import PromotionsBanner from '@/components/PromotionsBanner';

const CHAPTERS = [
  { key: 'home', label: 'Welcome' },
  { key: 'quotes', label: 'My quotes' },
  { key: 'orders', label: 'Orders & tracking' },
  { key: 'invoices', label: 'Invoices & payments' },
  { key: 'offers', label: 'Offers' },
  { key: 'addresses', label: 'Addresses & preferences' },
];
const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

interface Props { previewUserId?: string; previewEmail?: string; previewName?: string }

const CustomerAccount: React.FC<Props> = ({ previewUserId, previewEmail, previewName }) => {
  const { user, profile, signOut } = useAuth();
  const uid = previewUserId ?? user?.id;
  const email = (previewEmail ?? user?.email ?? '').toLowerCase();
  const name = previewName ?? (profile?.first_name || email.split('@')[0]);
  const [tab, setTab] = usePersistentState(previewUserId ? 'acct_preview_tab' : 'acct_tab', 'home');
  const [data, setData] = useState<{ quotes: any[]; orders: any[]; invoices: any[] } | null>(null);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    const or = email ? `user_id.eq.${uid},email.eq.${email}` : `user_id.eq.${uid}`;
    const orC = email ? `user_id.eq.${uid},customer_email.eq.${email}` : `user_id.eq.${uid}`;
    Promise.all([
      supabase.from('user_quotations').select('id,pool_model,pool_category,status,total_quote_amount,created_at').or(or).order('created_at', { ascending: false }).limit(50),
      supabase.from('product_orders').select('id,product_name,quantity,total_amount,payment_status,created_at').or(orC).order('created_at', { ascending: false }).limit(50),
      supabase.from('invoices').select('id,invoice_number,total_amount,paid_amount,payment_status,due_date,created_at').or(orC).order('created_at', { ascending: false }).limit(50),
    ]).then(([q, o, i]) => { if (alive) setData({ quotes: q.data ?? [], orders: o.data ?? [], invoices: i.data ?? [] }); });
    return () => { alive = false; };
  }, [uid, email]);

  const due = data?.invoices.reduce((s, i) => s + Math.max(0, (i.total_amount ?? 0) - (i.paid_amount ?? 0)), 0) ?? 0;
  const date = (d: string) => new Date(d).toLocaleDateString();

  const body = () => {
    if (!data && tab !== 'offers' && tab !== 'addresses') return <div className="grid gap-4 sm:grid-cols-3"><Skeleton /><Skeleton /><Skeleton /></div>;
    switch (tab) {
      case 'quotes':
        return <Panel kicker="Chapter 02" title="My quotes">{data!.quotes.length ? (
          <ul className="divide-y divide-border">{data!.quotes.map(q => (
            <li key={q.id} className="py-3 flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-medium">{q.pool_model || q.pool_category || 'Project quote'}</span>
              <span className="text-muted-foreground">{q.status ?? 'pending'} · {money(q.total_quote_amount)} · {date(q.created_at)}</span>
            </li>))}</ul>
        ) : <EmptyState title="No quotes yet" body="Design your project and save a quote — it will appear here." action={<Button asChild variant="outline"><Link to="/">Start a design</Link></Button>} />}</Panel>;
      case 'orders':
        return <Panel kicker="Chapter 03" title="Orders & tracking">{data!.orders.length ? (
          <ul className="space-y-4">{data!.orders.map(o => {
            const at = Math.max(0, STEPS.indexOf(o.payment_status ?? 'pending'));
            return (
              <li key={o.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium">{o.product_name}{o.quantity > 1 ? ` × ${o.quantity}` : ''}</span><span className="text-muted-foreground">{money(o.total_amount)} · {date(o.created_at)}</span></div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{STEPS.map((s, i) => (
                  <span key={s} className={`flex items-center gap-1.5 text-xs capitalize ${i <= at ? 'text-foreground' : 'text-muted-foreground'}`}><span className={`h-2 w-2 rounded-full ${i <= at ? 'bg-teal' : 'bg-muted'}`} />{s}</span>))}</div>
              </li>);
          })}</ul>
        ) : <EmptyState title="No orders yet" body="Products you buy will show here with their live status." />}</Panel>;
      case 'invoices':
        return <Panel kicker="Chapter 04" title="Invoices & payments">{data!.invoices.length ? (
          <ul className="divide-y divide-border">{data!.invoices.map(i => (
            <li key={i.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{i.invoice_number}</span>
              <span className="text-muted-foreground">{money(i.total_amount)} · {i.payment_status ?? 'unpaid'}{i.due_date ? ` · due ${date(i.due_date)}` : ''}</span>
              <Link to={`/invoice/${i.id}`} className="text-sm underline">View</Link>
            </li>))}</ul>
        ) : <EmptyState title="No invoices" body="Invoices sent to you will appear here, ready to pay." />}</Panel>;
      case 'offers':
        return <Panel kicker="Chapter 05" title="Offers"><PromotionsBanner /></Panel>;
      case 'addresses':
        return <Panel kicker="Chapter 06" title="Addresses & preferences"><ConsumerPreferences /></Panel>;
      default:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Quotes" value={data!.quotes.length} onClick={() => setTab('quotes')} />
              <StatTile label="Orders" value={data!.orders.length} onClick={() => setTab('orders')} />
              <StatTile label="Balance due" value={money(due)} onClick={() => setTab('invoices')} />
            </div>
            <Panel kicker="Next step" title="Talk to a designer">
              <p className="text-sm text-muted-foreground mb-4">Book a free 30-minute consultation to turn your ideas into a plan.</p>
              <Button asChild><a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer">Book consultation</a></Button>
            </Panel>
          </div>
        );
    }
  };

  return (
    <EditorialShell
      eyebrow={previewUserId ? 'Customer preview' : 'My account'}
      title={`Welcome, ${name}`}
      subtitle="Your quotes, orders and invoices in one place."
      chapters={CHAPTERS} active={tab} onSelect={setTab}
      actions={!previewUserId && <Button variant="outline" size="sm" onClick={() => signOut()}><LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Sign out</span></Button>}
    >{body()}</EditorialShell>
  );
};

export default CustomerAccount;
