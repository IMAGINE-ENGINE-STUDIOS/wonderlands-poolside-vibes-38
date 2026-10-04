/**
 * ContractorWorkspace — the contractor/supplier side of /admin.
 * Resolves the signed-in user's contractor record (user_id, then email) and
 * reuses the existing ContractorProcurementTab / ContractorCurrentProjectsTab.
 * Light theme only (no cyan). Data is owner-scoped by RLS; no sample rows.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ContractorProcurementTab from './ContractorProcurementTab';
import ContractorCurrentProjectsTab from './ContractorCurrentProjectsTab';
import ContractorPayoutsTab from './ContractorPayoutsTab';
import ContractorMessagesTab from './ContractorMessagesTab';

export type Section = 'procurement' | 'my-projects' | 'compliance' | 'payouts' | 'messages';

interface ContractorRow {
  id: string;
  company_name: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected' | null;
  agreement_signed: boolean | null;
  agreement_signed_at: string | null;
}

interface LicenseRow {
  id: string;
  license_type: string;
  license_number: string | null;
  issuing_authority: string | null;
  expiration_date: string | null;
  is_verified: boolean | null;
}

const STATUS_COPY: Record<string, string> = {
  pending: 'Your application is under review. You can browse opportunities; bidding opens once you are approved.',
  suspended: 'Your account is suspended. Contact Wonderlands to restore access.',
  rejected: 'Your application was not approved. Contact Wonderlands for details.',
};

const ContractorWorkspace: React.FC<{ section: Section }> = ({ section }) => {
  const { user } = useAuth();
  const [contractor, setContractor] = useState<ContractorRow | null>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const cols = 'id, company_name, status, agreement_signed, agreement_signed_at';
      let { data } = await supabase.from('contractors').select(cols).eq('user_id', user.id).maybeSingle();
      if (!data && user.email) {
        ({ data } = await supabase.from('contractors').select(cols).eq('email', user.email).maybeSingle());
      }
      if (!alive) return;
      setContractor((data as ContractorRow) ?? null);
      if (data) {
        const { data: lic } = await supabase
          .from('contractor_licenses')
          .select('id, license_type, license_number, issuing_authority, expiration_date, is_verified')
          .eq('contractor_id', data.id);
        if (alive) setLicenses((lic as LicenseRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user]);

  const shell = 'space-y-6 animate-fade-in bg-slate-50 text-slate-900 -m-6 p-6 min-h-screen';

  if (loading) {
    return <div className={shell}><div className="h-32 rounded-xl bg-slate-200 animate-pulse" /></div>;
  }

  if (!contractor) {
    return (
      <div className={shell}>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">No contractor profile yet</h2>
          <p className="text-slate-600 mb-6">Register your company to see opportunities, submit bids and track your projects.</p>
          <Button asChild><Link to="/contractor-registration">Register your company</Link></Button>
        </div>
      </div>
    );
  }

  const status = contractor.status ?? 'pending';
  const blocked = status === 'suspended' || status === 'rejected';

  return (
    <div className={shell}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-neutral-600">Company</p>
          <h2 className="text-lg font-semibold truncate">{contractor.company_name}</h2>
        </div>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-800">{status}</span>
      </div>

      {STATUS_COPY[status] && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {STATUS_COPY[status]}{' '}
          {status === 'pending' && <Link to={`/contractor-profile/${contractor.id}`} className="underline font-medium">Complete your profile</Link>}
        </div>
      )}

      {blocked ? null : section === 'procurement' ? (
        <ContractorProcurementTab contractorId={contractor.id} contractorStatus={status} />
      ) : section === 'my-projects' ? (
        <ContractorCurrentProjectsTab contractorId={contractor.id} />
      ) : section === 'payouts' ? (
        <ContractorPayoutsTab contractorId={contractor.id} />
      ) : section === 'messages' ? (
        <ContractorMessagesTab contractorId={contractor.id} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold mb-3">Subcontractor agreement</h3>
            {contractor.agreement_signed ? (
              <p className="text-sm text-slate-700">Signed{contractor.agreement_signed_at ? ` on ${new Date(contractor.agreement_signed_at).toLocaleDateString()}` : ''}.</p>
            ) : (
              <p className="text-sm text-slate-700">Not signed yet. <Link to={`/contractor-profile/${contractor.id}`} className="underline font-medium">Sign it in your profile</Link>.</p>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Licenses</h3>
              <Link to={`/contractor-profile/${contractor.id}`} className="text-sm underline">Manage</Link>
            </div>
            {licenses.length === 0 ? (
              <p className="text-sm text-slate-600">No licenses on file.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {licenses.map((l) => {
                  const expired = l.expiration_date && new Date(l.expiration_date) < new Date();
                  return (
                    <li key={l.id} className="py-2 flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-medium">{l.license_type}{l.license_number ? ` · ${l.license_number}` : ''}</span>
                      <span className={expired ? 'text-amber-700 font-medium' : 'text-slate-600'}>
                        {l.is_verified ? 'Verified' : 'Unverified'}
                        {l.expiration_date ? ` · ${expired ? 'expired' : 'expires'} ${new Date(l.expiration_date).toLocaleDateString()}` : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorWorkspace;
