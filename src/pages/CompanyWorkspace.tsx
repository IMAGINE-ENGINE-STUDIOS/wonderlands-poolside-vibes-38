/**
 * CompanyWorkspace — dashboard for every licensed business at /workspace.
 * Company comes from company_members (RLS isolates companies). The legacy
 * contractor record is optional: bids/projects/payouts/compliance reuse
 * ContractorWorkspace once a trade profile exists, created inline here.
 * `previewCompanyId` lets a platform admin view any company read-only.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useToast } from '@/hooks/use-toast';
import EditorialShell, { Panel, StatTile, EmptyState, Skeleton, money } from '@/components/shell/EditorialShell';
import CompanyCRM, { type CrmView } from '@/components/crm/CompanyCRM';
import SiteBuilder from '@/components/siteBuilder/SiteBuilder';
import ContractorWorkspace, { type Section } from '@/components/contractor/ContractorWorkspace';
import { MeetingsPanel } from '@/components/live/MeetingsPanel';

const CHAPTERS = [
  { key: 'today', label: 'Today', group: 'Overview' },
  { key: 'myday', label: 'My Day', group: 'CRM' },
  { key: 'pipeline', label: 'Deals pipeline', group: 'CRM' },
  { key: 'accounts', label: 'Accounts & contacts', group: 'CRM' },
  { key: 'website', label: 'Website builder', group: 'Website' },
  { key: 'clients', label: 'Clients', group: 'Business' },
  { key: 'quotes', label: 'Quotes & invoices', group: 'Business' },
  { key: 'procurement', label: 'Opportunities & bids', group: 'Projects' },
  { key: 'my-projects', label: 'Assigned projects', group: 'Projects' },
  { key: 'payouts', label: 'Payouts & work orders', group: 'Projects' },
  { key: 'messages', label: 'Messages', group: 'Projects' },
  { key: 'compliance', label: 'Licenses & agreement', group: 'Projects' },
  { key: 'tools', label: 'Marketing & builders', group: 'Tools' },
  { key: 'meetings', label: 'Meetings', group: 'Tools' },
  { key: 'settings', label: 'Company settings', group: 'Tools' },
];
const CONTRACTOR_SECTIONS = ['procurement', 'my-projects', 'payouts', 'messages', 'compliance'];

interface Company { id: string; name: string; trades: string[]; status: string; phone: string | null; email: string | null; city: string | null; state: string | null; license_number: string | null }

const CompanyWorkspace: React.FC<{ previewCompanyId?: string; actAsAdmin?: boolean }> = ({ previewCompanyId, actAsAdmin }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = usePersistentState(previewCompanyId ? 'ws_preview_tab' : 'ws_tab', 'today');
  const [company, setCompany] = useState<Company | null | undefined>(undefined);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [rows, setRows] = useState<{ clients: any[]; quotes: any[]; invoices: any[]; members: any[] } | null>(null);
  const [hasTrade, setHasTrade] = useState<boolean | null>(null);
  const [form, setForm] = useState<Partial<Company>>({});
  const readOnly = !!previewCompanyId && !actAsAdmin;

  useEffect(() => {
    if (!user && !previewCompanyId) return;
    let alive = true;
    (async () => {
      let cid = previewCompanyId;
      if (!cid && user) {
        const { data } = await supabase.from('company_members').select('company_id').eq('user_id', user.id).eq('is_active', true).order('created_at').limit(1).maybeSingle();
        cid = data?.company_id;
      }
      if (!cid) { if (alive) setCompany(null); return; }
      const { data: co } = await supabase.from('companies').select('id,name,trades,status,phone,email,city,state,license_number').eq('id', cid).maybeSingle();
      if (!alive) return;
      // Signed-out design preview: RLS hides the row, so show an empty named shell.
      const shown = (co as Company) ?? (previewCompanyId ? { id: cid, name: 'Preview company', trades: [], status: 'preview', phone: null, email: null, city: null, state: null, license_number: null } : null);
      setCompany(shown); setForm(shown ?? {});
      const c = (q: any) => q.then((r: any) => r.count ?? 0, () => 0);
      const [cl, qt, inv, pr, tr] = await Promise.all([
        c(supabase.from('clients').select('id', { count: 'exact', head: true }).eq('company_id', cid)),
        c(supabase.from('user_quotations').select('id', { count: 'exact', head: true }).eq('company_id', cid)),
        c(supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('company_id', cid).neq('payment_status', 'paid')),
        c(supabase.from('construction_projects').select('id', { count: 'exact', head: true }).eq('company_id', cid)),
        readOnly ? Promise.resolve(0) : c(supabase.from('contractors').select('id', { count: 'exact', head: true }).eq('user_id', user!.id)),
      ]);
      if (!alive) return;
      setCounts({ clients: cl, quotes: qt, invoices: inv, projects: pr });
      setHasTrade(readOnly ? true : tr > 0);
      const [a, b, d, m] = await Promise.all([
        supabase.from('clients').select('id,first_name,last_name,email,phone,status,created_at').eq('company_id', cid).order('created_at', { ascending: false }).limit(100),
        supabase.from('user_quotations').select('id,name,pool_model,status,total_quote_amount,created_at').eq('company_id', cid).order('created_at', { ascending: false }).limit(50),
        supabase.from('invoices').select('id,invoice_number,customer_name,total_amount,payment_status,due_date').eq('company_id', cid).order('created_at', { ascending: false }).limit(50),
        supabase.from('company_members').select('id,user_id,role,is_active').eq('company_id', cid),
      ]);
      if (alive) setRows({ clients: a.data ?? [], quotes: b.data ?? [], invoices: d.data ?? [], members: m.data ?? [] });
    })();
    return () => { alive = false; };
  }, [user, previewCompanyId, readOnly]);

  const createTradeProfile = async () => {
    if (!user || !company) return;
    const { error } = await supabase.from('contractors').insert({
      company_name: company.name, contact_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || company.name,
      email: user.email ?? company.email ?? '', phone: company.phone, user_id: user.id, company_id: company.id,
    });
    if (error) toast({ title: 'Could not create trade profile', description: error.message });
    else { setHasTrade(true); toast({ title: 'Trade profile created', description: 'Sent for approval. Bidding opens once Wonderlands approves it.' }); }
  };

  const saveCompany = async () => {
    if (!company) return;
    const { error } = await supabase.from('companies').update({ name: form.name, phone: form.phone, city: form.city, state: form.state, license_number: form.license_number }).eq('id', company.id);
    if (error) toast({ title: 'Not saved', description: error.message });
    else { setCompany({ ...company, ...form } as Company); toast({ title: 'Company saved' }); }
  };

  if (company === undefined) return <div className="min-h-screen bg-background p-8"><Skeleton h="h-40" /></div>;
  if (company === null) return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <EmptyState title="No company workspace" body="This account is not part of a company yet. Sign out, then create a business account to get your workspace." action={<Button onClick={async () => { await signOut(); window.location.assign('/auth?mode=signup&type=business'); }}>Sign out and create business account</Button>} />
    </div>
  );

  const date = (d: string) => new Date(d).toLocaleDateString();
  const body = () => {
    if (CONTRACTOR_SECTIONS.includes(tab)) {
      if (hasTrade === false) return <Panel kicker="Projects" title="Set up your trade profile"><p className="text-sm text-muted-foreground mb-4">One click links {company.name} to the project marketplace so you can bid and track work.</p><Button onClick={createTradeProfile}>Create trade profile</Button></Panel>;
      return <div className="[&>div]:m-0 [&>div]:min-h-0 [&>div]:rounded-2xl"><ContractorWorkspace section={tab as Section} /></div>;
    }
    if (tab === 'website') return <SiteBuilder key={company.id} companyId={company.id} companyName={company.name} readOnly={readOnly && !user} />;
    if (tab === 'meetings') return <MeetingsPanel />;
    if (['myday', 'pipeline', 'accounts'].includes(tab)) return <CompanyCRM key={company.id} companyId={company.id} view={tab as CrmView} readOnly={readOnly} userId={user?.id} />;
    if (!counts || !rows) return <div className="grid gap-4 sm:grid-cols-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>;
    switch (tab) {
      case 'clients':
        return <Panel kicker="Business" title="Clients">{rows.clients.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th className="py-2 pr-4">Name</th><th className="pr-4">Email</th><th className="pr-4">Phone</th><th className="pr-4">Status</th><th>Added</th></tr></thead>
          <tbody>{rows.clients.map(c => <tr key={c.id} className="border-t border-border"><td className="py-2 pr-4 font-medium">{c.first_name} {c.last_name}</td><td className="pr-4">{c.email}</td><td className="pr-4">{c.phone}</td><td className="pr-4 capitalize">{c.status}</td><td>{date(c.created_at)}</td></tr>)}</tbody></table></div>
        ) : <EmptyState title="No clients yet" body="Clients you add or capture through your tools appear here, visible only to your company." />}</Panel>;
      case 'quotes':
        return <div className="space-y-6">
          <Panel kicker="Business" title="Quotes">{rows.quotes.length ? <ul className="divide-y divide-border">{rows.quotes.map(q => <li key={q.id} className="py-2 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium">{q.name || q.pool_model || 'Quote'}</span><span className="text-muted-foreground">{q.status} · {money(q.total_quote_amount)} · {date(q.created_at)}</span></li>)}</ul> : <EmptyState title="No quotes yet" />}</Panel>
          <Panel title="Invoices">{rows.invoices.length ? <ul className="divide-y divide-border">{rows.invoices.map(i => <li key={i.id} className="py-2 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium">{i.invoice_number} · {i.customer_name}</span><span className="text-muted-foreground">{money(i.total_amount)} · {i.payment_status}</span><Link className="underline" to={`/invoice/${i.id}`}>View</Link></li>)}</ul> : <EmptyState title="No invoices yet" />}</Panel>
        </div>;
      case 'tools':
        return <div className="grid gap-4 sm:grid-cols-2">
          {[['SOCIALITE', 'Email, SMS, calls and social posts to your own contacts.', '/socialite'], ['Flip Builder V3', 'Build catalogues and flip books.', '/flip'], ['Web Builder', 'Build and publish your own website with Wonderlands tools.', null], ['Wonderlands Studio', 'Design and configure products with your clients in the Wonderlands Studio.', '/wonderlands-studio']].map(([t, d, h]) => (
            <Panel key={t} title={t}><p className="text-sm text-muted-foreground mb-4">{d}</p>{h ? <Button asChild variant="outline"><Link to={h as string}>Open</Link></Button> : <Button variant="outline" onClick={() => setTab('website')}>Open</Button>}</Panel>))}
        </div>;
      case 'settings':
        return <div className="space-y-6">
          <Panel kicker="Tools" title="Company settings">
            <div className="grid gap-3 sm:grid-cols-2">
              {(['name', 'phone', 'city', 'state', 'license_number'] as const).map(k => (
                <label key={k} className="text-sm"><span className="capitalize text-muted-foreground">{k.replace('_', ' ')}</span>
                  <Input disabled={readOnly} value={(form[k] as string) ?? ''} onChange={e => setForm({ ...form, [k]: e.target.value })} /></label>))}
            </div>
            {!readOnly && <Button className="mt-4" onClick={saveCompany}>Save</Button>}
          </Panel>
          <Panel title="Team">{rows.members.map(m => <p key={m.id} className="text-sm py-1 border-b border-border last:border-0"><span className="capitalize font-medium">{m.role}</span> · {m.user_id === user?.id ? 'You' : m.user_id.slice(0, 8)}{m.is_active ? '' : ' · inactive'}</p>)}</Panel>
        </div>;
      default:
        return <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatTile label="Clients" value={counts.clients} onClick={() => setTab('clients')} />
            <StatTile label="Quotes" value={counts.quotes} onClick={() => setTab('quotes')} />
            <StatTile label="Open invoices" value={counts.invoices} onClick={() => setTab('quotes')} />
            <StatTile label="Projects" value={counts.projects} />
          </div>
          <Panel kicker="Account" title={company.name}>
            <p className="text-sm text-muted-foreground">Status: <span className="capitalize text-foreground">{company.status}</span>{company.trades?.length ? ` · ${company.trades.join(', ').replace(/_/g, ' ')}` : ''}</p>
          </Panel>
        </div>;
    }
  };

  return (
    <EditorialShell
      eyebrow={actAsAdmin ? 'Company dashboard — admin acting' : readOnly ? 'Company preview' : 'Company workspace'}
      title={company.name}
      subtitle="Your clients, quotes, projects and tools — private to your company."
      chapters={CHAPTERS} active={tab} onSelect={setTab}
      actions={!previewCompanyId && <Button variant="outline" size="sm" onClick={() => signOut()}><LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Sign out</span></Button>}
    >{body()}</EditorialShell>
  );
};

export default CompanyWorkspace;
