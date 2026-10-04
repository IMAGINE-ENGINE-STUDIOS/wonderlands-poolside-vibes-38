// Licensed companies — platform-admin list of every tenant (companies + member counts).
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AdminCompanies = () => {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => {
    Promise.all([
      supabase.from('companies').select('id,name,trades,status,city,state,is_platform_owner,created_at').order('created_at', { ascending: false }),
      supabase.from('company_members').select('company_id'),
    ]).then(([c, m]) => {
      const n: Record<string, number> = {};
      (m.data ?? []).forEach((x: any) => { n[x.company_id] = (n[x.company_id] ?? 0) + 1; });
      setRows((c.data ?? []).map((x: any) => ({ ...x, members: n[x.id] ?? 0 })));
    });
  }, []);
  if (!rows) return <div className="h-32 rounded-2xl bg-muted animate-pulse" />;
  if (!rows.length) return <p className="text-muted-foreground">No companies yet.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-muted-foreground"><th className="p-3">Company</th><th className="p-3">Trades</th><th className="p-3">Location</th><th className="p-3">Status</th><th className="p-3">Members</th><th className="p-3">Since</th></tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.id} className="border-t border-border">
            <td className="p-3 font-medium">{r.name}{r.is_platform_owner ? ' (platform)' : ''}</td>
            <td className="p-3">{(r.trades ?? []).join(', ').replace(/_/g, ' ') || '—'}</td>
            <td className="p-3">{[r.city, r.state].filter(Boolean).join(', ') || '—'}</td>
            <td className="p-3 capitalize">{r.status}</td>
            <td className="p-3 tabular-nums">{r.members}</td>
            <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
          </tr>))}
        </tbody>
      </table>
      <p className="p-3 text-xs text-muted-foreground">Open any company read-only in <Link className="underline" to="/admin/preview/workspace">company preview</Link>.</p>
    </div>
  );
};
export default AdminCompanies;
