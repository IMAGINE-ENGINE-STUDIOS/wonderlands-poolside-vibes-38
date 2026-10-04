// Technology Hub — integrated studio workstation.
// Each production studio opens INSIDE the Command Center (same-origin embed),
// so the menu and context stay on screen. "Recent work" shelves read real rows only.
import React, { useEffect, useState } from 'react';
import { Waves, Sun, BookOpen, Map, Ruler, Edit, Send, FolderOpen, Building2, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TOOLS = [
  { to: '/wonderlands-studio', name: '3D Studio', desc: 'Pool, deck and terrain designer', icon: Waves },
  { to: '/solar-genius', name: 'Solar Studio', desc: 'Roof tracing, panels and savings', icon: Sun },
  { to: '/flip', name: 'Flip Builder V3', desc: 'Magazines, catalogs, campaigns', icon: BookOpen },
  { to: '/global-design-board', name: 'Design Board', desc: 'Site planning for every trade', icon: Map },
  { to: '/blueprint-builder', name: 'Blueprint Builder', desc: 'Import and scale plans', icon: Ruler },
  { to: '/content-editor', name: 'Content Editor', desc: 'Website pages, live preview', icon: Edit },
  { to: '/socialite', name: 'SOCIALITE', desc: 'Social, email, SMS and calls', icon: Send },
  { to: '/procurement', name: 'Procurement', desc: 'Needs and contractor bids', icon: Building2 },
  { to: '/files', name: 'Repository', desc: 'Documents and shared galleries', icon: FolderOpen },
];

type Row = { id: string; label: string; sub: string; href: string };

const AdminTechnologyHub = () => {
  const [active, setActive] = useState(TOOLS[0]);
  const [full, setFull] = useState(false);
  const [books, setBooks] = useState<Row[]>([]);
  const [quotes, setQuotes] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const [b, q] = await Promise.all([
        supabase.from('flip_books').select('*').order('updated_at', { ascending: false }).limit(5),
        supabase.from('user_quotations').select('*').order('created_at', { ascending: false }).limit(5),
      ]);
      setBooks(((b.data as any[]) ?? []).map((r) => ({
        id: r.id, label: r.title ?? r.name ?? 'Untitled book', sub: r.status ?? (r.published ? 'Published' : 'Draft'),
        href: r.slug ? `/flip/${r.slug}` : '/flip',
      })));
      setQuotes(((q.data as any[]) ?? []).map((r) => ({
        id: r.id, label: r.customer_name ?? r.client_name ?? r.email ?? 'Quote',
        sub: r.total_amount != null ? `$${Number(r.total_amount).toLocaleString()}` : (r.status ?? ''),
        href: `/quote/${r.id}`,
      })));
    })();
  }, []);

  const Shelf = ({ title, rows, empty }: { title: string; rows: Row[]; empty: string }) => (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] font-bold mb-3">{title}</div>
      {rows.length === 0 ? <p className="text-sm">{empty}</p> : (
        <ul className="divide-y divide-neutral-100">
          {rows.map((r) => (
            <li key={r.id}>
              <a href={r.href} target="_blank" rel="noopener" className="flex justify-between gap-3 py-2 text-sm hover:underline">
                <span className="truncate font-medium">{r.label}</span><span className="shrink-0">{r.sub}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <section className="mt-10 space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] font-bold">Technology Hub</div>
        <h2 className="font-serif text-3xl mt-1">Every studio, inside the Command Center</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TOOLS.map((t) => {
          const Icon = t.icon; const on = t.to === active.to;
          return (
            <button key={t.to} onClick={() => setActive(t)}
              className={`shrink-0 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${on ? 'border-black shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}>
              <Icon className="h-4 w-4" />{t.name}
            </button>
          );
        })}
      </div>

      <div className={`${full ? 'fixed inset-4 z-[60]' : 'relative'} rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm`}>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-neutral-200">
          <div className="min-w-0">
            <div className="font-semibold">{active.name}</div>
            <div className="text-xs truncate">{active.desc}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFull((f) => !f)} aria-label={full ? 'Exit full screen' : 'Full screen'} className="p-2 rounded-md border border-neutral-200 hover:bg-neutral-50">
              {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <a href={active.to} target="_blank" rel="noopener" aria-label="Open in new tab" className="p-2 rounded-md border border-neutral-200 hover:bg-neutral-50">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
        <iframe key={active.to} src={active.to} title={active.name} loading="lazy"
          className={`w-full bg-white ${full ? 'h-[calc(100%-57px)]' : 'h-[720px]'}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Shelf title="Recent flip books" rows={books} empty="No flip books yet." />
        <Shelf title="Recent quotes" rows={quotes} empty="No quotes yet." />
      </div>
    </section>
  );
};

export default AdminTechnologyHub;
