/**
 * AdminCommandSearch — main-admin ⌘K / Ctrl+K search across clients, quotes,
 * invoices, projects, contractors and procurement listings. Selecting a result
 * opens the matching Command Center section. Debounced 250ms, 5 rows per table.
 */
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Hit { id: string; label: string; sub?: string; section: string; group: string; }

const clean = (s: string) => s.replace(/[%,()]/g, ' ').trim();

async function runSearch(q: string): Promise<Hit[]> {
  const t = `%${clean(q)}%`;
  const [c, qu, inv, pr, co, pl] = await Promise.all([
    supabase.from('clients').select('id, first_name, last_name, email').or(`first_name.ilike.${t},last_name.ilike.${t},email.ilike.${t},phone.ilike.${t}`).limit(5),
    supabase.from('user_quotations').select('id, name, email').or(`name.ilike.${t},email.ilike.${t}`).limit(5),
    supabase.from('invoices').select('id, invoice_number, customer_name').or(`invoice_number.ilike.${t},customer_name.ilike.${t},customer_email.ilike.${t}`).limit(5),
    supabase.from('construction_projects').select('id, project_name').ilike('project_name', t).limit(5),
    supabase.from('contractors').select('id, company_name, email').or(`company_name.ilike.${t},email.ilike.${t}`).limit(5),
    supabase.from('procurement_listings').select('id, title').ilike('title', t).limit(5),
  ]);
  const hits: Hit[] = [];
  (c.data ?? []).forEach((r) => hits.push({ id: r.id, label: `${r.first_name} ${r.last_name}`.trim(), sub: r.email, section: 'clients', group: 'Clients' }));
  (qu.data ?? []).forEach((r) => hits.push({ id: r.id, label: r.name, sub: r.email, section: 'quotes', group: 'Quotes' }));
  (inv.data ?? []).forEach((r) => hits.push({ id: r.id, label: r.invoice_number, sub: r.customer_name, section: 'invoices', group: 'Invoices' }));
  (pr.data ?? []).forEach((r) => hits.push({ id: r.id, label: r.project_name, section: 'projects', group: 'Projects' }));
  (co.data ?? []).forEach((r) => hits.push({ id: r.id, label: r.company_name, sub: r.email, section: 'contractors', group: 'Contractors' }));
  (pl.data ?? []).forEach((r) => hits.push({ id: r.id, label: r.title, section: 'procurement', group: 'Procurement' }));
  return hits;
}

const AdminCommandSearch: React.FC<{ onNavigate: (section: string) => void }> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (clean(q).length < 2) { setHits([]); return; }
    let alive = true;
    setBusy(true);
    const t = setTimeout(async () => {
      const r = await runSearch(q).catch(() => []);
      if (alive) { setHits(r); setBusy(false); }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  const groups = [...new Set(hits.map((h) => h.group))];

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Search the Command Center"
        className="hidden md:flex items-center gap-2 rounded-lg border border-[#c9a84c]/20 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f3ee]/60 hover:border-[#c9a84c]/50 transition-colors">
        <Search className="h-4 w-4 text-[#c9a84c]" />
        <span>Search clients, quotes, projects…</span>
        <kbd className="ml-2 rounded border border-[#c9a84c]/30 px-1.5 text-[10px] text-[#c9a84c]">⌘K</kbd>
      </button>
      <button onClick={() => setOpen(true)} aria-label="Search" className="md:hidden p-2.5 rounded-lg border border-[#c9a84c]/20 bg-[#1a1a1a] text-[#f0d78c]">
        <Search className="h-4 w-4" />
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a name, email, invoice number…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty>{clean(q).length < 2 ? 'Type at least 2 letters.' : busy ? 'Searching…' : 'No matches.'}</CommandEmpty>
          {groups.map((g) => (
            <CommandGroup key={g} heading={g}>
              {hits.filter((h) => h.group === g).map((h) => (
                <CommandItem key={`${g}-${h.id}`} value={`${g} ${h.label} ${h.sub ?? ''} ${h.id}`}
                  onSelect={() => { onNavigate(h.section); setOpen(false); }}>
                  <span className="truncate">{h.label}</span>
                  {h.sub && <span className="ml-2 truncate text-xs opacity-60">{h.sub}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default AdminCommandSearch;
