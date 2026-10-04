/**
 * AdminPreview — /admin/preview/:view (main_admin only, route-guarded).
 * Renders CompanyWorkspace or CustomerAccount for a chosen company/customer,
 * read-only, so each solution can be checked without signing in as that user.
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CompanyWorkspace from './CompanyWorkspace';
import CustomerAccount from './CustomerAccount';

const AdminPreview = () => {
  const { view } = useParams();
  const [options, setOptions] = useState<{ id: string; label: string; email?: string; name?: string }[]>([]);
  const [pick, setPick] = useState('');

  useEffect(() => {
    if (view === 'workspace') {
      supabase.from('companies').select('id,name').order('created_at', { ascending: false }).limit(200)
        .then(({ data }) => { const o = (data ?? []).map(c => ({ id: c.id, label: c.name })); setOptions(o); setPick(o[0]?.id ?? ''); });
    } else {
      supabase.from('profiles').select('id,email,first_name').eq('role', 'consumer').order('created_at', { ascending: false }).limit(200)
        .then(({ data }) => { const o = (data ?? []).map(p => ({ id: p.id, label: p.email ?? p.id, email: p.email ?? '', name: p.first_name ?? '' })); setOptions(o); setPick(o[0]?.id ?? ''); });
    }
  }, [view]);

  const sel = options.find(o => o.id === pick);
  return (
    <div>
      <div className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-2 text-sm">
        <span className="font-semibold">Preview</span>
        <Link to="/admin/preview/workspace" className={view === 'workspace' ? 'underline' : 'text-muted-foreground'}>Company workspace</Link>
        <Link to="/admin/preview/account" className={view === 'account' ? 'underline' : 'text-muted-foreground'}>Customer account</Link>
        <select className="ml-auto max-w-xs rounded border border-border bg-background px-2 py-1" value={pick} onChange={e => setPick(e.target.value)} aria-label="Choose record">
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <Link to="/admin" className="underline">Back to Command Center</Link>
      </div>
      {!sel ? <p className="p-8 text-muted-foreground">Nothing to preview yet.</p>
        : view === 'workspace' ? <CompanyWorkspace key={sel.id} previewCompanyId={sel.id} />
        : <CustomerAccount key={sel.id} previewUserId={sel.id} previewEmail={sel.email} previewName={sel.name} />}
    </div>
  );
};

export default AdminPreview;
