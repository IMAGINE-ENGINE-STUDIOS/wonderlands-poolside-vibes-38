/**
 * ContractorPayoutsTab — owner-scoped earnings & work orders for a contractor.
 * Figures derive only from contractor_project_tasks (proposed_price/status).
 * Light theme, no cyan. No sample rows.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TaskRow {
  id: string;
  task_name: string;
  status: string;
  proposed_price: number | null;
  due_date: string | null;
  project_id: string | null;
}

type Filter = 'all' | 'open' | 'completed';
const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const ContractorPayoutsTab: React.FC<{ contractorId: string }> = ({ contractorId }) => {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [projects, setProjects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from('contractor_project_tasks')
        .select('id, task_name, status, proposed_price, due_date, project_id')
        .eq('contractor_id', contractorId)
        .order('due_date', { ascending: true, nullsFirst: false });
      const rows = (data as TaskRow[]) ?? [];
      const ids = [...new Set(rows.map((r) => r.project_id).filter(Boolean))] as string[];
      let names: Record<string, string> = {};
      if (ids.length) {
        const { data: p } = await supabase.from('construction_projects').select('id, project_name').in('id', ids);
        names = Object.fromEntries((p ?? []).map((x) => [x.id, x.project_name]));
      }
      if (!alive) return;
      setTasks(rows);
      setProjects(names);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [contractorId]);

  const totals = useMemo(() => {
    let earned = 0, pending = 0;
    for (const t of tasks) {
      const v = Number(t.proposed_price) || 0;
      if (t.status === 'completed') earned += v; else pending += v;
    }
    return { earned, pending, total: earned + pending };
  }, [tasks]);

  const visible = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'completed' ? t.status === 'completed' : t.status !== 'completed');

  if (loading) return <div className="h-40 rounded-xl bg-slate-200 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Earned (completed work)', totals.earned],
          ['Pending (open work)', totals.pending],
          ['Total contracted', totals.total],
        ].map(([label, v]) => (
          <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-600">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{money(v as number)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <h3 className="font-semibold">Work orders</h3>
          <div className="flex gap-1" role="tablist" aria-label="Filter work orders">
            {(['all', 'open', 'completed'] as Filter[]).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === f ? 'bg-white text-black' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No work orders yet. Accepted bids appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-neutral-600">
                <tr><th className="p-3">Project</th><th className="p-3">Task</th><th className="p-3">Due</th><th className="p-3">Status</th><th className="p-3 text-right">Payout</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td className="p-3">{(t.project_id && projects[t.project_id]) || '—'}</td>
                    <td className="p-3 font-medium">{t.task_name}</td>
                    <td className="p-3">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}</td>
                    <td className="p-3"><span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs capitalize">{t.status.replace('_', ' ')}</span></td>
                    <td className="p-3 text-right font-semibold">{money(Number(t.proposed_price) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorPayoutsTab;
