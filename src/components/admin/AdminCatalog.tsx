/** Admin Catalog — the Wonderlands product catalog inside the admin dashboard.
 *  Backed by public.admin_catalog_products (seeded with the 114-product pack
 *  posted to Facebook Marketplace in October 2026, each row carrying its
 *  Marketplace status). Read-only v1: browse by category/brand, search, filter
 *  by Marketplace status, and export the table back out as a Meta Commerce
 *  Manager data feed (CSV) for the Page Shop catalog. */
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Download, ImageOff, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string | null;
  dimensions: string | null;
  depth: string | null;
  price_cents: number;
  image_url: string | null;
  description: string | null;
  website_link: string;
  marketplace_status: 'live' | 'flagged' | 'review';
  sort_order: number;
};

const CATEGORY_ORDER = ['Pool', 'Spa', 'Tanning Ledge', 'Sauna', 'Gate', 'Cover'];
const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'review', label: 'In review' },
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number]['key'];

const money = (cents: number) =>
  (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const statusBadge = (status: CatalogProduct['marketplace_status']) => {
  if (status === 'live')
    return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100">Live</Badge>;
  if (status === 'flagged')
    return <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100">Flagged</Badge>;
  return <Badge className="bg-sky-100 text-sky-800 border border-sky-200 hover:bg-sky-100">In review</Badge>;
};

/** Rebuild the Marketplace/feed title for a row (same shape as the Meta feed). */
function feedTitle(p: CatalogProduct): string {
  const price = (p.price_cents / 100).toLocaleString('en-US');
  const base = p.name.replace(/\s*\((?:Latham Spa)\)\s*$/, '');
  switch (p.category) {
    case 'Pool':
      return p.brand === 'Wonderlands'
        ? `${base} Pool by Wonderlands — $${price} installed`
        : `${base} Fiberglass Pool by ${p.brand ?? ''} — $${price} installed`;
    case 'Spa':
      return `${base} Spa by ${p.brand ?? ''} — $${price} installed`;
    case 'Tanning Ledge':
      return `${base.includes('Tanning Ledge') ? base : `${base} Tanning Ledge`} by ${p.brand ?? ''} — $${price} installed`;
    case 'Gate':
      return `${base.replace('×', ' × ')} — $${price} installed`;
    default:
      return `${base} — $${price} installed`;
  }
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

function exportMetaFeed(rows: CatalogProduct[]) {
  const header = 'id,title,description,availability,condition,price,link,image_link,brand';
  const lines = rows.map((p) =>
    [
      p.sku,
      feedTitle(p),
      p.description ?? '',
      'in stock',
      'new',
      `${(p.price_cents / 100).toFixed(2)} USD`,
      p.website_link,
      p.image_url ?? '',
      'Wonderlands World',
    ]
      .map((c) => csvCell(String(c)))
      .join(','),
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meta-catalog-feed.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminCatalog() {
  const [rows, setRows] = useState<CatalogProduct[] | null>(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    (supabase as any)
      .from('admin_catalog_products')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data, error }: { data: CatalogProduct[] | null; error: unknown }) => {
        if (error) {
          setSetupNeeded(true);
          return;
        }
        setRows(data ?? []);
      });
  }, []);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = { all: 0, live: 0, flagged: 0, review: 0 };
    for (const r of rows ?? []) {
      c.all += 1;
      c[r.marketplace_status] += 1;
    }
    return c;
  }, [rows]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = (rows ?? []).filter(
      (r) =>
        (status === 'all' || r.marketplace_status === status) &&
        (!q || r.name.toLowerCase().includes(q) || (r.brand ?? '').toLowerCase().includes(q) || r.sku.toLowerCase().includes(q)),
    );
    return CATEGORY_ORDER.map((category) => {
      const inCategory = visible.filter((r) => r.category === category);
      const brands: { brand: string; items: CatalogProduct[] }[] = [];
      for (const r of inCategory) {
        const b = r.brand ?? 'Wonderlands World';
        const group = brands.find((g) => g.brand === b) ?? { brand: b, items: [] };
        if (!brands.includes(group)) brands.push(group);
        group.items.push(r);
      }
      return { category, brands, total: inCategory.length };
    }).filter((g) => g.total > 0);
  }, [rows, query, status]);

  if (setupNeeded) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-5 text-[13px] text-amber-900 animate-fade-in">
        Catalog setup is one step away: the <span className="font-mono">admin_catalog_products</span> table is not in this
        database yet. Run the migration{' '}
        <span className="font-mono">supabase/migrations/20261023120000_admin_catalog.sql</span> (in the repo) in the Supabase
        SQL editor, then reload this page. It is a new table only — it does not depend on any other migration.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border border-neutral-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-black">
                <BookOpen className="h-5 w-5 text-black" />
                Product Catalog
              </CardTitle>
              <CardDescription className="text-neutral-600">
                Every Wonderlands product in one place — the same 114 products posted to Facebook Marketplace, with each
                listing&apos;s current Marketplace status. Export the Meta feed to load or refresh the Page Shop catalog.
              </CardDescription>
            </div>
            <Button
              onClick={() => rows && exportMetaFeed(rows)}
              disabled={!rows?.length}
              className="bg-black text-white hover:bg-neutral-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Meta feed (CSV)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by product name, brand or SKU…"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatus(f.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    status === f.key
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:text-black'
                  }`}
                >
                  {f.label} · {counts[f.key]}
                </button>
              ))}
            </div>
          </div>

          {rows === null && <p className="text-sm text-neutral-500">Loading catalog…</p>}
          {rows !== null && groups.length === 0 && (
            <p className="text-sm text-neutral-500">No products match this search and filter.</p>
          )}

          {groups.map(({ category, brands, total }) => (
            <div key={category}>
              <div className="mb-3 flex items-baseline gap-3 border-b border-neutral-200 pb-2">
                <h3 className="text-lg text-black" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                  {category === 'Pool' ? 'Pools' : category === 'Spa' ? 'Spas' : `${category}s`}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold">
                  {total} product{total === 1 ? '' : 's'}
                </span>
              </div>
              {brands.map(({ brand, items }) => (
                <div key={brand} className="mb-5">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold">{brand}</div>
                  <div className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
                    {items.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            loading="lazy"
                            className="h-12 w-16 shrink-0 rounded border border-neutral-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-400">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-black">{p.name}</div>
                          <div className="truncate text-xs text-neutral-500">
                            {p.sku}
                            {p.dimensions ? ` · ${p.dimensions}` : ''}
                            {p.depth ? ` · ${p.depth} deep` : ''}
                          </div>
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-black">{money(p.price_cents)}</div>
                        <div className="shrink-0">{statusBadge(p.marketplace_status)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
