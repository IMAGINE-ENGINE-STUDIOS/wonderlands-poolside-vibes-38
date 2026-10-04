// Command Center action queue — live counts of items waiting on an admin.
// Every number is a head-only count query (no rows downloaded). Clicking an item
// opens the existing management section via onNavigate(sectionKey).
import React, { useEffect, useState } from 'react';
import { Star, HardHat, Users, ShoppingCart, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Item = { key: string; label: string; hint: string; section: string; icon: React.ElementType; count: number };

const AdminActionQueue: React.FC<{ onNavigate: (section: string) => void }> = ({ onNavigate }) => {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const c = (q: any) => q.then((r: any) => r.count ?? 0, () => 0);
      const [quotes, contractors, leads, orders] = await Promise.all([
        c(supabase.from('user_quotations').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
        c(supabase.from('contractors').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
        c(supabase.from('clients').select('id', { count: 'exact', head: true }).is('assigned_sales_rep_id', null)),
        c(supabase.from('product_orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending')),
      ]);
      if (!alive) return;
      setItems([
        { key: 'q', label: 'Quotes to review', hint: 'Pending customer quotes', section: 'quotes', icon: Star, count: quotes },
        { key: 'c', label: 'Contractor applications', hint: 'Waiting for approval', section: 'contractors', icon: HardHat, count: contractors },
        { key: 'l', label: 'Unassigned clients', hint: 'No sales rep yet', section: 'clients', icon: Users, count: leads },
        { key: 'o', label: 'Pending orders', hint: 'Payment not completed', section: 'orders', icon: ShoppingCart, count: orders },
      ]);
    };
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const open = items?.filter(i => i.count > 0) ?? [];

  return (
    <div className="mb-10">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#2bb3a3] font-bold mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
        Needs attention
      </div>
      <p className="text-xs text-neutral-600 mb-4">Items waiting on you — click to open</p>
      {!items ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[72px] rounded-lg bg-white border border-neutral-200 animate-pulse" />)}
        </div>
      ) : open.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600">
          All clear — nothing is waiting for review.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {open.map(({ key, label, hint, section, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => onNavigate(section)}
              className="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-left transition-colors hover:border-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2bb3a3]"
            >
              <Icon className="h-5 w-5 shrink-0 text-[#2bb3a3]" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#f5f3ee] truncate">{label}</div>
                <div className="text-[11px] text-neutral-600 truncate">{hint}</div>
              </div>
              <span className="text-xl font-light tabular-nums text-[#f5f3ee]" style={{ fontFamily: "'Sora', sans-serif" }}>{count}</span>
              <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-[#2bb3a3]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminActionQueue;
