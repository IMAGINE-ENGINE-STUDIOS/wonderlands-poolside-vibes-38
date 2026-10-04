/**
 * DevStaging — /dev/command-center (registered ONLY in dev builds, never in
 * the published site). Lets the design of the Command Center, company
 * workspace and customer account be reviewed without signing in. Data is
 * still protected by RLS, so signed-out views show their real empty states.
 */
import React from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import AdminDashboard from './AdminDashboard';
import CompanyWorkspace from './CompanyWorkspace';
import CustomerAccount from './CustomerAccount';

const VIEWS = [
  { id: 'command', label: 'Command Center' },
  { id: 'workspace', label: 'Company workspace' },
  { id: 'account', label: 'Customer account' },
] as const;

const DevStaging = () => {
  const [view, setView] = usePersistentState<string>('dev_staging_view', 'command');
  return (
    <div className="bg-white">
      <div className="sticky top-0 z-[60] flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-4 py-2 text-sm text-black">
        <span className="font-semibold mr-2">Design staging</span>
        {VIEWS.map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`rounded-full border px-3 py-1 ${view === v.id ? 'bg-black text-white border-black' : 'border-neutral-300 hover:bg-neutral-100'}`}>
            {v.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-neutral-500">Preview only · not on the live site</span>
      </div>
      {view === 'command' && <AdminDashboard previewMode />}
      {view === 'workspace' && <CompanyWorkspace previewCompanyId="00000000-0000-0000-0000-000000000000" />}
      {view === 'account' && <CustomerAccount previewUserId="00000000-0000-0000-0000-000000000000" previewEmail="preview@example.com" previewName="Preview" />}
    </div>
  );
};

export default DevStaging;
