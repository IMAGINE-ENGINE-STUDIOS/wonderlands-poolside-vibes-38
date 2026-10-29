/**
 * AdminPreview — /admin/preview/:view (main_admin only, route-guarded).
 * Loads any user-type dashboard — company workspace, customer account or
 * sales rep — for a chosen record. Default mode is "act as admin": the
 * dashboard is fully working (book meetings, use every tool) with actions
 * running under the admin's own account; untick it for a read-only preview.
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CompanyWorkspace from './CompanyWorkspace';
import CustomerAccount from './CustomerAccount';
import SalesRepDashboard from './SalesRepDashboard';

const AdminPreview = () => {
  const { view } = useParams();
  const [options, setOptions] = useState<{ id: string; label: string; email?: string; name?: string }[]>([]);
  const [pick, setPick] = useState('');
  const [actAsAdmin, setActAsAdmin] = useState(true);

  useEffect(() => {
    if (view === 'workspace') {
      supabase.from('companies').select('id,name').order('created_at', { ascending: false }).limit(200)
        .then(({ data }) => { const o = (data ?? []).map(c => ({ id: c.id, label: c.name })); setOptions(o); setPick(o[0]?.id ?? ''); });
    } else if (view === 'sales-rep') {
      supabase.from('profiles').select('id,email,first_name').eq('role', 'sales_rep').order('created_at', { ascending: false }).limit(200)
        .then(({ data }) => { const o = (data ?? []).map(p => ({ id: p.id, label: p.email ?? p.id, email: p.email ?? '', name: p.first_name ?? '' })); setOptions(o); setPick(o[0]?.id ?? ''); });
    } else {
      supabase.from('profiles').select('id,email,first_name').eq('role', 'consumer').order('created_at', { ascending: false }).limit(200)
        .then(({ data }) => { const o = (data ?? []).map(p => ({ id: p.id, label: p.email ?? p.id, email: p.email ?? '', name: p.first_name ?? '' })); setOptions(o); setPick(o[0]?.id ?? ''); });
    }
  }, [view]);

  const sel = options.find(o => o.id === pick);
  return (
    <div>
      <div className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2 text-sm">
        <span className="font-semibold">User dashboards</span>
        <Link to="/admin/preview/workspace" className={view === 'workspace' ? 'underline' : 'text-muted-foreground'}>Company workspace</Link>
        <Link to="/admin/preview/account" className={view === 'account' ? 'underline' : 'text-muted-foreground'}>Customer account</Link>
        <Link to="/admin/preview/sales-rep" className={view === 'sales-rep' ? 'underline' : 'text-muted-foreground'}>Sales rep</Link>
        <label className="flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" checked={actAsAdmin} onChange={e => setActAsAdmin(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          Act as admin (fully working)
        </label>
        <select className="ml-auto max-w-xs rounded border border-border bg-background px-2 py-1" value={pick} onChange={e => setPick(e.target.value)} aria-label="Choose record">
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <Link to="/admin" className="underline">Back to Command Center</Link>
        <span className="w-full text-xs text-muted-foreground">
          {actAsAdmin
            ? 'Acting as admin — fully working: book meetings, use every tool; actions run under your admin account.'
            : 'Read-only preview'}
        </span>
      </div>
      {!sel ? <p className="p-8 text-muted-foreground">Nothing to load yet.</p>
        : view === 'workspace' ? <CompanyWorkspace key={sel.id} previewCompanyId={sel.id} actAsAdmin={actAsAdmin} />
        : view === 'sales-rep' ? <SalesRepDashboard key={sel.id} previewRepId={sel.id} />
        : <CustomerAccount key={sel.id} previewUserId={sel.id} previewEmail={sel.email} previewName={sel.name} actAsAdmin={actAsAdmin} />}
    </div>
  );
};

export default AdminPreview;
