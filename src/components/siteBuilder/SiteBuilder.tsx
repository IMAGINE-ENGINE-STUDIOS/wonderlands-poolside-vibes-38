/**
 * SiteBuilder — the company Web Builder (workspace chapter "Website builder").
 * Left: pages, block library (drag onto the canvas or click to add) and layers
 * (drag to reorder, hide, duplicate, delete). Centre: live canvas on desktop /
 * tablet / phone widths with drop zones between sections. Right: inspector
 * for the selected section (content, style) or the site theme.
 * Saves to company_sites: layout.draft on save, layout.published on publish;
 * the public site at /sites/:slug reads layout.published only.
 * V2 (Imagine Engine Studios Corp.): Genius (Groq site-genius), trade templates,
 * autosave, zoom, per-device hiding, page SEO, photo library, saved sections,
 * version history (layout.history), forms with extra questions, 13 new blocks.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff, Copy, Trash2, GripVertical, ExternalLink, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import SiteRenderer from './SiteRenderer';
import { wonderlandsTemplate } from '@/lib/siteBuilder/wonderlandsTemplate';
import { TRADE_OPTIONS, tradeTemplate, sectionFrom, type Trade } from '@/lib/siteBuilder/tradeTemplates';
import SiteGenius, { applyGeniusOps, askSiteGenius } from './SiteGenius';
import { collectImages } from './siteBuilderUtils';
import SiteTextEditor from './SiteTextEditor';
import SiteDomainCard from './SiteDomainCard';
import { apexOf } from '@/lib/siteBuilder/dnsCheck';
import { hydrateDocProducts, starterCard } from '@/lib/siteBuilder/catalogCards';
import { BLOCKS, FONTS, GRADIENTS, DEFAULT_THEME, blankDoc, compressImage, newSection, uid, type BlockType, type Field, type Page, type Section, type SiteDoc, type SiteTheme, type SiteVersion } from '@/lib/siteBuilder/model';

const DEVICES = { desktop: { w: 1280, icon: Monitor }, tablet: { w: 820, icon: Tablet }, mobile: { w: 390, icon: Smartphone } } as const;
const GROUPS = ['Layout', 'Content', 'Media', 'Commerce', 'Technology'];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

interface SiteRow { id: string; slug: string; title: string; is_published: boolean; custom_domain?: string | null }

/** Collapsible card used by the Site tab. */
const SettingsGroup: React.FC<{ title: string; note?: string; open?: boolean; children: React.ReactNode }> = ({ title, note, open, children }) => (
  <details open={open} className="group rounded-xl border border-border bg-background [&_summary::-webkit-details-marker]:hidden">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5">
      <span className="min-w-0"><span className="block text-sm font-semibold">{title}</span>{note && <span className="block truncate text-[11px] text-muted-foreground">{note}</span>}</span>
      <span className="text-muted-foreground transition-transform group-open:rotate-90">›</span>
    </summary>
    <div className="space-y-3 border-t border-border px-3 py-3">{children}</div>
  </details>
);

/** Pages of the site being edited, so link fields can offer "go to page". */
const PagesCtx = React.createContext<Page[]>([]);
/** V2 media library: every photo already used in this site, reusable in any image field. */
const MediaCtx = React.createContext<string[]>([]);

/** Universal link picker: site page, on-page section, phone, email, WhatsApp or any web address. */
const LinkField: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
  const pages = React.useContext(PagesCtx);
  const v = value || '';
  const kind = v.startsWith('page:') ? 'page' : v.startsWith('#') ? 'anchor' : v.startsWith('tel:') ? 'tel' : v.startsWith('mailto:') ? 'mail' : v.startsWith('https://wa.me/') ? 'wa' : v ? 'url' : 'none';
  const set = (k: string) => onChange(k === 'page' ? `page:${pages[0]?.slug ?? ''}` : k === 'anchor' ? '#contact' : k === 'tel' ? 'tel:' : k === 'mail' ? 'mailto:' : k === 'wa' ? 'https://wa.me/' : k === 'url' ? 'https://' : '');
  const sel = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
  return <div className="space-y-1.5">
    <select disabled={disabled} className={sel} value={kind} onChange={e => set(e.target.value)}>
      <option value="none">No link</option><option value="page">Another page of this site</option><option value="anchor">A section on this page (#)</option>
      <option value="url">Web address</option><option value="tel">Phone call</option><option value="mail">Email</option><option value="wa">WhatsApp</option></select>
    {kind === 'page' ? <select disabled={disabled} className={sel} value={v.slice(5)} onChange={e => onChange(`page:${e.target.value}`)}>{pages.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}</select>
      : kind !== 'none' && <Input disabled={disabled} value={v} onChange={e => onChange(e.target.value)} />}
  </div>;
};

const ImageField: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
  const ref = useRef<HTMLInputElement>(null);
  const media = React.useContext(MediaCtx);
  const [lib, setLib] = useState(false);
  return <div className="space-y-2">
    {value && <img src={value} alt="" className="h-20 w-full object-cover rounded-md border border-border" />}
    <div className="flex gap-2">
      <Input disabled={disabled} placeholder="Image link" value={value?.startsWith('data:') ? '(uploaded photo)' : value || ''} onChange={e => onChange(e.target.value)} />
      <Button disabled={disabled} type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>Upload</Button>
      {value && <Button disabled={disabled} type="button" variant="ghost" size="sm" onClick={() => onChange('')}>Clear</Button>}
    </div>
    {!disabled && media.length > 0 && <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setLib(v => !v)}>{lib ? 'Hide photo library' : `Photo library (${media.length})`}</button>}
    {lib && <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">{media.map(m => <button type="button" key={m.slice(0, 80) + m.length} onClick={() => { onChange(m); setLib(false); }} className="aspect-square overflow-hidden rounded border border-border hover:border-teal"><img src={m} alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}</div>}
    <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) onChange(await compressImage(f)); e.target.value = ''; }} />
  </div>;
};

const FieldEditor: React.FC<{ f: Field; value: any; onChange: (v: any) => void; disabled?: boolean; extra?: React.ReactNode }> = ({ f, value, onChange, disabled, extra }) => {
  const label = <span className="text-xs font-medium text-muted-foreground">{f.label}</span>;
  if (f.kind === 'items') {
    const list: any[] = value || [];
    return <div className="space-y-2">{label}{extra}
      {list.map((it, i) => <details key={i} className="rounded-lg border border-border p-2">
        <summary className="cursor-pointer text-sm flex items-center justify-between gap-2"><span className="truncate">{it.name || it.title || it.caption || it.quote || `Item ${i + 1}`}</span>
          {!disabled && <span className="flex gap-1" onClick={e => e.preventDefault()}>
            <button aria-label="Move up" onClick={() => { if (!i) return; const n = [...list]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}><ArrowUp className="h-3.5 w-3.5" /></button>
            <button aria-label="Move down" onClick={() => { if (i === list.length - 1) return; const n = [...list]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; onChange(n); }}><ArrowDown className="h-3.5 w-3.5" /></button>
            <button aria-label="Duplicate" onClick={() => { const n = [...list]; n.splice(i + 1, 0, { ...it }); onChange(n); }}><Copy className="h-3.5 w-3.5" /></button>
            <button aria-label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}><Trash2 className="h-3.5 w-3.5" /></button></span>}
        </summary>
        <div className="mt-2 space-y-2">{f.fields.map(sf => <FieldEditor key={sf.key} f={sf} value={it[sf.key]} disabled={disabled} onChange={v => onChange(list.map((x, j) => j === i ? { ...x, [sf.key]: v } : x))} />)}</div>
      </details>)}
      {!disabled && <Button size="sm" variant="outline" onClick={() => onChange([...list, { ...f.blank }])}><Plus className="h-4 w-4 mr-1" />Add</Button>}
    </div>;
  }
  return <label className="block space-y-1">{label}
    {f.kind === 'textarea' ? <><Textarea disabled={disabled} rows={4} value={value ?? ''} onChange={e => onChange(e.target.value)} />
        {!disabled && value && <button type="button" className="text-xs text-teal underline" onClick={async e => { e.preventDefault(); const how = prompt('How should Genius rewrite it? (e.g. shorter, friendlier, more luxurious, in Spanish)'); if (!how) return; try { const r = await askSiteGenius('rewrite', `${how}:\n${value}`); if (r?.text) onChange(String(r.text)); } catch (er) { alert((er as Error).message); } }}>Rewrite with Genius</button>}</>
      : f.kind === 'image' ? <ImageField disabled={disabled} value={value} onChange={onChange} />
      : f.kind === 'select' ? <select disabled={disabled} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={String(value ?? '')} onChange={e => onChange(e.target.value)}>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      : f.kind === 'url' ? <LinkField disabled={disabled} value={value} onChange={onChange} />
      : f.kind === 'color' ? <input disabled={disabled} type="color" className="h-10 w-full rounded-md border border-input" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} />
      : <Input disabled={disabled} type={f.kind === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={e => onChange(f.kind === 'number' ? Number(e.target.value) : e.target.value)} />}
    {extra}
  </label>;
};

const SiteBuilder: React.FC<{ companyId: string; companyName: string; readOnly?: boolean; embedded?: boolean }> = ({ companyId, companyName, readOnly, embedded = false }) => {
  const { toast } = useToast();
  const [site, setSite] = useState<SiteRow | null | undefined>(undefined);
  const [doc, setDoc] = useState<SiteDoc>(() => wonderlandsTemplate(companyName));
  const [domain, setDomain] = useState('');
  const [theme, setTheme] = useState<SiteTheme>({ ...DEFAULT_THEME, brand: companyName });
  const [past, setPast] = useState<SiteDoc[]>([]);
  const [future, setFuture] = useState<SiteDoc[]>([]);
  const [pageId, setPageId] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [panel, setPanel] = useState<'blocks' | 'layers' | 'content' | 'style' | 'theme'>('blocks');
  const [device, setDevice] = useState<keyof typeof DEVICES>('desktop');
  const [drag, setDrag] = useState<{ kind: 'new'; type: BlockType } | { kind: 'move'; id: string } | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [full, setFull] = useState(!embedded);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<SiteVersion[]>([]);
  const [saved, setSaved] = useState<Section[]>(() => { try { return JSON.parse(localStorage.getItem(`sb.saved.${companyId}`) || '[]'); } catch { return []; } });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [flips, setFlips] = useState<{ slug: string; title: string }[]>([]);
  const [catalog, setCatalog] = useState<any[] | null>(null);
  /** Text being edited on the canvas (double-click): section id, prop path like 'title' or 'items.2.name'. */
  const [textEdit, setTextEdit] = useState<{ sid: string; path: string; rect: DOMRect } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from('company_sites').select('id,slug,title,is_published,layout,theme,custom_domain').eq('company_id', companyId).order('created_at').limit(1).maybeSingle();
      const f = await supabase.from('flip_books').select('slug,title').eq('company_id', companyId).order('updated_at', { ascending: false }).limit(100);
      if (!alive) return;
      setFlips(f.data ?? []);
      if (data) {
        const l: any = data.layout ?? {};
        const d: SiteDoc = l.draft?.pages?.length ? l.draft : l.published?.pages?.length ? l.published : wonderlandsTemplate(companyName);
        setDoc(d); setPageId(d.pages[0].id); setHistory(Array.isArray(l.history) ? l.history : []); setTheme({ ...DEFAULT_THEME, brand: companyName, ...(data.theme as any) });
        setSite({ id: data.id, slug: data.slug, title: data.title, is_published: data.is_published, custom_domain: (data as any).custom_domain }); setDomain((data as any).custom_domain ?? '');
      } else { setSite(null); setPageId(doc.pages[0].id); }
    })();
    return () => { alive = false; };
  }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const page = doc.pages.find(p => p.id === pageId) ?? doc.pages[0];
  const section = page?.sections.find(s => s.id === sel) ?? null;

  const commit = useCallback((fn: (d: SiteDoc) => SiteDoc) => {
    if (readOnly) return;
    setDoc(d => { setPast(p => [...p.slice(-49), d]); setFuture([]); return fn(structuredClone(d)); });
    setDirty(true);
  }, [readOnly]);
  const editPage = (fn: (p: Page) => void) => commit(d => { const p = d.pages.find(x => x.id === page.id)!; fn(p); return d; });
  const editSection = (id: string, fn: (s: Section) => void) => editPage(p => { const s = p.sections.find(x => x.id === id); if (s) fn(s); });
  const undo = () => { if (!past.length) return; setFuture(f => [doc, ...f]); setDoc(past[past.length - 1]); setPast(p => p.slice(0, -1)); setDirty(true); };
  const redo = () => { if (!future.length) return; setPast(p => [...p, doc]); setDoc(future[0]); setFuture(f => f.slice(1)); setDirty(true); };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement; if (/INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { editPage(p => { p.sections = p.sections.filter(s => s.id !== sel); }); setSel(null); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });

  const insertAt = (index: number) => {
    if (!drag) return;
    if (drag.kind === 'new') { const s = newSection(drag.type); editPage(p => { p.sections.splice(index, 0, s); }); setSel(s.id); setPanel('content'); }
    else editPage(p => { const from = p.sections.findIndex(s => s.id === drag.id); if (from < 0) return; const [m] = p.sections.splice(from, 1); p.sections.splice(from < index ? index - 1 : index, 0, m); });
    setDrag(null); setDropAt(null);
  };
  const addBlock = (type: BlockType) => { const s = newSection(type); const i = section ? page.sections.indexOf(section) + 1 : page.sections.length; editPage(p => { p.sections.splice(i, 0, s); }); setSel(s.id); setPanel('content');
    if (type === 'configurator') import('@/lib/siteBuilder/configuratorPresets').then(m => m.configuratorProps(s.props)).then(props => editPage(p => { const t = p.sections.find(x => x.id === s.id); if (t) t.props = props; })); };

  const persist = async (publish: boolean, silent = false) => {
    if (readOnly) return;
    setBusy(true);
    const layout: any = { draft: doc };
    const prev: any = site ? (await supabase.from('company_sites').select('layout').eq('id', site.id).maybeSingle()).data?.layout ?? {} : {};
    layout.published = publish ? doc : prev.published ?? null;
    // Version history: keep the last 10 published snapshots.
    layout.history = publish ? [{ at: new Date().toISOString(), doc, theme }, ...(prev.history ?? [])].slice(0, 10) : prev.history ?? [];
    const patch: any = { layout, theme, title: theme.brand || companyName };
    if (publish) { patch.is_published = true; patch.published_at = new Date().toISOString(); }
    let res;
    if (site) res = await supabase.from('company_sites').update(patch).eq('id', site.id).select('id,slug,title,is_published,custom_domain').single();
    else res = await supabase.from('company_sites').insert({ ...patch, company_id: companyId, slug: `${slugify(companyName) || 'site'}-${uid().slice(0, 4)}` }).select('id,slug,title,is_published,custom_domain').single();
    setBusy(false);
    if (res.error) { toast({ title: 'Not saved', description: res.error.message }); return; }
    setSite(res.data as SiteRow); setDirty(false); setLastSaved(new Date()); setHistory(layout.history);
    if (silent) return;
    toast({ title: publish ? 'Site published' : 'Draft saved', description: publish ? `Live at /sites/${res.data.slug}` : 'Visitors still see your last published version.' });
  };
  // Autosave the draft 4 s after the last change (visitors still see the published site).
  useEffect(() => { if (!dirty || readOnly || busy || !site) return; const t = setTimeout(() => persist(false, true), 4000); return () => clearTimeout(t); }, [doc, theme, dirty]); // eslint-disable-line react-hooks/exhaustive-deps
  const unpublish = async () => { if (!site) return; const { error } = await supabase.from('company_sites').update({ is_published: false }).eq('id', site.id); if (!error) setSite({ ...site, is_published: false }); toast({ title: error ? 'Not changed' : 'Site taken offline' }); };
  const changeSlug = async (v: string) => {
    if (!site) return; const s = slugify(v); if (!s || s === site.slug) return;
    const { error } = await supabase.from('company_sites').update({ slug: s }).eq('id', site.id);
    if (error) toast({ title: 'Address taken', description: 'Try another web address.' }); else setSite({ ...site, slug: s });
  };

  const saveDomain = async () => {
    if (!site) { toast({ title: 'Save the site first', description: 'Press Save draft once, then add your domain.' }); return; }
    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (d && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) { toast({ title: 'Check the address', description: 'Example: www.mybusiness.com' }); return; }
    const { error } = await supabase.from('company_sites').update({ custom_domain: d || null } as any).eq('id', site.id);
    if (error) toast({ title: 'Not saved', description: error.message.includes('duplicate') ? 'That domain is already used by another site.' : error.message });
    else { setSite({ ...site, custom_domain: d || null }); setDomain(d); toast({ title: d ? 'Domain saved' : 'Domain removed' }); }
  };
  const applyTrade = (t: Trade) => { if (!confirm('Replace every page with this template? You can undo.')) return; const d = tradeTemplate(t, theme.brand || companyName); commit(() => d); setPageId(d.pages[0].id); setSel(null); };
  const restoreVersion = (v: SiteVersion) => { if (!confirm(`Restore the version published ${new Date(v.at).toLocaleString()}? You can undo.`)) return; commit(() => structuredClone(v.doc)); if (v.theme) setTheme(v.theme); setPageId(v.doc.pages[0].id); setSel(null); };
  const saveSection = (s: Section) => { const n = [...saved, structuredClone(s)].slice(-20); setSaved(n); localStorage.setItem(`sb.saved.${companyId}`, JSON.stringify(n)); toast({ title: 'Section saved', description: 'Find it under Saved sections.' }); };
  const media = useMemo(() => [...collectImages(doc), ...(theme.logo ? [theme.logo] : [])].slice(0, 60), [doc, theme.logo]);
  const applyTemplate = () => { if (!confirm('Replace every page with the Wonderlands template? You can undo.')) return; const t = wonderlandsTemplate(theme.brand || companyName); commit(() => t); setPageId(t.pages[0].id); setSel(null); };
  // Product cards: catalogue items keep their real photo; absolute URL so published/custom-domain sites load it too.
  const absImg = (u?: string | null) => !u ? '' : /^(https?:|data:|blob:)/.test(u) ? u : `${window.location.origin}${u.startsWith('/') ? '' : '/'}${u}`;
  const toCard = (p: any) => ({ name: p.name, price: p.price ? `$${Number(p.price).toLocaleString()}` : '', description: p.description ?? '', image: absImg(p.image_url), badge: '', buttonLabel: 'Ask for a quote', buttonHref: '#contact', buyLabel: 'Buy now', buyLink: '' });
  const blankCard = () => starterCard((section?.props.items?.length || 0) + 1);
  const bulkAdd = () => {
    if (!section) return;
    const txt = prompt('One product per line:\nName | Price | Description | Image link (price, description and image are optional)');
    if (!txt) return;
    const rows = txt.split('\n').map(l => l.split('|').map(x => x.trim())).filter(r => r[0]);
    editSection(section.id, s => { s.props.items = [...(s.props.items || []), ...rows.map(([name, price = '', description = '', image = '']) => ({ ...blankCard(), name, price: price && !price.startsWith('$') && !isNaN(Number(price.replace(/,/g, ''))) ? `$${Number(price.replace(/,/g, '')).toLocaleString()}` : price, description, image }))]; });
  };
  const importCategory = (cat: string) => { if (!section || !catalog) return; const list = catalog.filter(p => p.category === cat); editSection(section.id, s => { s.props.items = [...(s.props.items || []), ...list.map(toCard)]; }); };
  // Same catalogue (with photos) the suites and FLIP use — the products table has no reliable images.
  const loadCatalog = async () => {
    const [{ ITEMS }, { loadCategoryEntries }] = await Promise.all([import('@/components/FlipIndex'), import('@/components/flip/flipConsoleData')]);
    const lists = await Promise.all(ITEMS.map(async (it: any) => (await loadCategoryEntries(it.id).catch(() => [])).map(e => ({ id: `${it.id}:${e.id}`, name: e.name, price: e.price, description: e.meta ?? e.brand ?? '', image_url: e.image, category: it.label }))));
    setCatalog(lists.flat().filter(p => p.image_url));
  };

  const wrap = useCallback((s: Section, node: React.ReactNode) => {
    const i = page.sections.indexOf(s);
    return <div className={`relative group ${sel === s.id ? 'outline outline-2 outline-teal -outline-offset-2' : 'hover:outline hover:outline-1 hover:outline-teal/60 -outline-offset-1'}`}
      onClick={e => { e.preventDefault(); setSel(s.id); if (panel !== 'style') setPanel('content'); }}
      draggable={!readOnly} onDragStart={e => { e.stopPropagation(); setDrag({ kind: 'move', id: s.id }); }} onDragEnd={() => { setDrag(null); setDropAt(null); }}
      onDragOver={e => { if (!drag) return; e.preventDefault(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setDropAt(e.clientY < r.top + r.height / 2 ? i : i + 1); }}
      onDrop={e => { e.preventDefault(); if (dropAt !== null) insertAt(dropAt); }}
      onDoubleClick={e => { if (readOnly) return; const el = (e.target as HTMLElement).closest('[data-edit]') as HTMLElement | null; if (!el) return; e.preventDefault(); setSel(s.id); setTextEdit({ sid: s.id, path: el.dataset.edit!, rect: el.getBoundingClientRect() }); }}>
      {dropAt === i && drag && <div className="absolute -top-1 inset-x-0 h-1.5 bg-teal z-20 rounded" />}
      <span className="absolute top-2 left-2 z-20 hidden group-hover:block rounded bg-foreground px-2 py-0.5 text-[11px] text-background">{BLOCKS[s.type].label}</span>
      <div className="[&_iframe]:pointer-events-none [&_a]:cursor-default [&_[data-edit]]:cursor-text" onSubmitCapture={e => e.preventDefault()}>{node}</div>
      {dropAt === i + 1 && drag && i === page.sections.length - 1 && <div className="absolute -bottom-1 inset-x-0 h-1.5 bg-teal z-20 rounded" />}
    </div>;
  }, [page, sel, drag, dropAt, panel, readOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const flipField = useMemo(() => section?.type === 'tech' && section.props.tool === 'flip', [section]);

  if (site === undefined) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;

  const st = section?.style ?? {};
  const setStyle = (k: string, v: any) => section && editSection(section.id, s => { (s.style as any)[k] = v === '' ? undefined : v; });
  const styleFields: Field[] = [
    { key: 'bg', label: 'Background colour', kind: 'color' }, { key: 'color', label: 'Text colour', kind: 'color' },
    { key: 'bgImage', label: 'Background photo', kind: 'image' }, { key: 'bgVideo', label: 'Background video link', kind: 'url' },
    { key: 'gradFrom', label: 'Gradient start colour', kind: 'color' }, { key: 'gradTo', label: 'Gradient end colour', kind: 'color' },
    { key: 'gradAngle', label: 'Gradient angle (0–360°)', kind: 'number' },
    { key: 'gradType', label: 'Gradient shape', kind: 'select', options: [{ value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }] },
    { key: 'overlay', label: 'Darken photo/video (0–90)', kind: 'number' }, { key: 'padY', label: 'Top & bottom space (px)', kind: 'number' },
    { key: 'titleSize', label: 'Title size (px)', kind: 'number' },
    { key: 'align', label: 'Alignment', kind: 'select', options: ['left', 'center', 'right'].map(v => ({ value: v, label: v })) },
    { key: 'width', label: 'Width', kind: 'select', options: ['narrow', 'normal', 'wide', 'full'].map(v => ({ value: v, label: v })) },
    { key: 'font', label: 'Font for this section', kind: 'select', options: [{ value: '', label: 'Site font' }, ...FONTS.map(f => ({ value: f, label: f }))] },
  ];

  return (
    <PagesCtx.Provider value={doc.pages}><MediaCtx.Provider value={media}>
    <div className={!embedded && full ? "fixed inset-0 z-50 bg-card overflow-auto" : "rounded-2xl border border-border bg-card overflow-hidden"}>
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={page.id} onChange={e => { setPageId(e.target.value); setSel(null); }}>{doc.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        {!readOnly && <Button size="sm" variant="ghost" onClick={() => { const n = prompt('Page name'); if (!n) return; const p: Page = { id: uid(), name: n, slug: slugify(n), sections: [newSection('text')] }; commit(d => { d.pages.push(p); return d; }); setPageId(p.id); }}><Plus className="h-4 w-4 mr-1" />Page</Button>}
        {!readOnly && <Button size="sm" variant="ghost" onClick={() => { const p: Page = { ...structuredClone(page), id: uid(), name: `${page.name} copy`, slug: slugify(`${page.name}-copy-${uid().slice(0, 3)}`) }; p.sections.forEach(x => { x.id = uid(); }); commit(d => { d.pages.splice(d.pages.findIndex(x => x.id === page.id) + 1, 0, p); return d; }); setPageId(p.id); }}><Copy className="h-4 w-4 mr-1" />Duplicate page</Button>}
        {!readOnly && <Button size="sm" variant="ghost" onClick={applyTemplate}>Wonderlands template</Button>}
        {!readOnly && <select aria-label="Trade templates" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value="" onChange={e => e.target.value && applyTrade(e.target.value as Trade)}><option value="">Templates…</option>{TRADE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>}
        <select aria-label="Zoom" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={zoom} onChange={e => setZoom(Number(e.target.value))}>{[50, 75, 90, 100, 125, 150].map(z => <option key={z} value={z}>{z}%</option>)}</select>
        <div className="flex rounded-md border border-border">{(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map(k => { const I = DEVICES[k].icon; return <button key={k} aria-label={k} onClick={() => setDevice(k)} className={`px-2.5 py-1.5 ${device === k ? 'bg-muted' : ''}`}><I className="h-4 w-4" /></button>; })}</div>
        {!embedded && <Button size="sm" variant="outline" onClick={() => setFull(f => !f)}>{full ? "Exit full screen" : "Full screen"}</Button>}
        <Button size="sm" variant="ghost" disabled={!past.length} onClick={undo} aria-label="Undo"><Undo2 className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" disabled={!future.length} onClick={redo} aria-label="Redo"><Redo2 className="h-4 w-4" /></Button>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {site && <span className="text-muted-foreground">/sites/<input disabled={readOnly} defaultValue={site.slug} onBlur={e => changeSlug(e.target.value)} className="w-32 bg-transparent border-b border-border focus:outline-none" /></span>}
          <span className="text-xs text-muted-foreground">{site?.is_published ? 'Live' : 'Not published'}{dirty ? ' · unsaved changes' : lastSaved ? ` · saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
          {site?.is_published && <Button size="sm" variant="outline" asChild><a href={`/sites/${site.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" />View</a></Button>}
          {!readOnly && <><Button size="sm" variant="outline" disabled={busy} onClick={() => persist(false)}>Save draft</Button>
            <Button size="sm" disabled={busy} onClick={() => persist(true)}>Publish</Button>
            {site?.is_published && <Button size="sm" variant="ghost" onClick={unpublish}>Unpublish</Button>}</>}
        </div>
      </div>

      <div className={`grid lg:grid-cols-[340px_minmax(0,1fr)_340px] ${full ? "h-[calc(100vh-53px)]" : "min-h-[calc(100vh-220px)]"}`}>
        {/* Genius — the whole left side */}
        <aside className="border-b lg:border-b-0 lg:border-r border-border overflow-hidden flex flex-col min-h-0">
          <SiteGenius disabled={readOnly} brand={theme.brand || companyName} page={page} doc={doc} theme={theme}
            onBuild={(d, t) => { commit(() => d); if (t) setTheme(cur => ({ ...cur, ...Object.fromEntries(Object.entries(t).filter(([k, v]) => ['primary', 'headingFont', 'bodyFont'].includes(k) && typeof v === 'string')) })); setPageId(d.pages[0].id); setSel(null); }}
            onOps={async ops => { let open = ""; const next = applyGeniusOps(structuredClone(doc), page.id, ops, fn => { setTheme(fn); setDirty(true); }, id => { open = id; });
              // Genius product sections get real Wonderlands catalogue cards (photo, name, price, description).
              const filled = await hydrateDocProducts(next, JSON.stringify(ops).slice(0, 400)); commit(() => filled); if (open) { setPageId(open); setSel(null); } }} />
        </aside>

        {/* Canvas */}
        <div className="bg-muted/40 overflow-auto p-4" onClick={e => { if (e.target === e.currentTarget) setSel(null); }}>
          <div className="mx-auto bg-background shadow-sm transition-[max-width] duration-300" style={{ maxWidth: DEVICES[device].w, zoom: zoom / 100 } as React.CSSProperties}
            onDragOver={e => { if (drag && !page.sections.length) { e.preventDefault(); setDropAt(0); } }} onDrop={() => { if (!page.sections.length) insertAt(0); }}>
            {page.sections.length ? <SiteRenderer page={page} theme={theme} wrap={wrap} device={device} /> : <div className="p-16 text-center text-muted-foreground">Drag a block here to start this page.</div>}
          </div>
        </div>

        {/* Inspector */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border p-3 overflow-y-auto">
          <div className="flex rounded-md border border-border mb-4 text-xs">{(['blocks', 'layers', 'content', 'style', 'theme'] as const).map(k => <button key={k} onClick={() => setPanel(k)} className={`flex-1 py-1.5 capitalize ${panel === k ? 'bg-muted font-semibold' : ''}`}>{k === 'theme' ? 'Site' : k === 'content' ? 'Section' : k}</button>)}</div>
          {panel === 'blocks' ? <div className="space-y-5">
          {saved.length > 0 && <div><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-2">Saved sections</p>
            <div className="grid gap-1.5">{saved.map((x, i) => <div key={i} className="flex items-center gap-1"><button disabled={readOnly} onClick={() => { const c = { ...structuredClone(x), id: uid() }; editPage(p => { p.sections.push(c); }); setSel(c.id); }} className="flex-1 truncate rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-teal">{x.props.title || BLOCKS[x.type]?.label}</button>
              <button aria-label="Forget" onClick={() => { const n = saved.filter((_, j) => j !== i); setSaved(n); localStorage.setItem(`sb.saved.${companyId}`, JSON.stringify(n)); }}><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div></div>}
          {GROUPS.map(g => <div key={g}><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-2">{g}</p>
            <div className="grid grid-cols-2  gap-1.5">{(Object.keys(BLOCKS) as BlockType[]).filter(k => BLOCKS[k].group === g).map(k =>
              <button key={k} disabled={readOnly} draggable={!readOnly} onDragStart={() => setDrag({ kind: 'new', type: k })} onDragEnd={() => { setDrag(null); setDropAt(null); }} onClick={() => addBlock(k)}
                className="rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-teal transition-colors cursor-grab">{BLOCKS[k].label}</button>)}</div></div>)}
          </div>
          : panel === 'layers' ? <div>
          <div><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-2">Layers</p>
            <ul className="space-y-1">{page.sections.map((s, i) => <li key={s.id} draggable={!readOnly} onDragStart={() => setDrag({ kind: 'move', id: s.id })} onDragEnd={() => { setDrag(null); setDropAt(null); }} onDragOver={e => e.preventDefault()} onDrop={() => { setDropAt(i); insertAt(i); }}
              className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-sm ${sel === s.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button className="flex-1 truncate text-left" onClick={() => { setSel(s.id); setPanel('content'); }}>{BLOCKS[s.type].label}</button>
              {!readOnly && <><button aria-label="Hide" onClick={() => editSection(s.id, x => { x.style.hidden = !x.style.hidden; })}>{s.style.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                <button aria-label="Duplicate" onClick={() => editPage(p => { p.sections.splice(i + 1, 0, { ...structuredClone(s), id: uid() }); })}><Copy className="h-3.5 w-3.5" /></button>
                <button aria-label="Delete" onClick={() => { editPage(p => { p.sections = p.sections.filter(x => x.id !== s.id); }); if (sel === s.id) setSel(null); }}><Trash2 className="h-3.5 w-3.5" /></button></>}
            </li>)}</ul></div>
          </div>
          : panel === 'theme' ? <div className="space-y-3">
            {/* Site tab V2: web address first, then business, brand, this page, versions. */}
            <SettingsGroup title="Web address" note={site?.custom_domain ? apexOf(site.custom_domain) : 'Free address + your own domain'} open>
              <SiteDomainCard slug={site?.slug} published={!!site?.is_published} saved={site?.custom_domain} domain={domain} readOnly={readOnly} setDomain={setDomain} onSave={saveDomain} onSlug={changeSlug} />
            </SettingsGroup>
            <SettingsGroup title="Business details" note="Name, phone, email, WhatsApp">
            {([['brand', 'Business name', 'text'], ['phone', 'Phone', 'text'], ['email', 'Email', 'text'], ['whatsapp', 'WhatsApp number', 'text']] as const).map(([k, l]) => <FieldEditor key={k} disabled={readOnly} f={{ key: k, label: l, kind: 'text' }} value={(theme as any)[k]} onChange={v => { setTheme({ ...theme, [k]: v }); setDirty(true); }} />)}
            </SettingsGroup>
            <SettingsGroup title="Brand look" note="Logo, colours, fonts, corners">
            <FieldEditor disabled={readOnly} f={{ key: 'logo', label: 'Logo', kind: 'image' }} value={theme.logo} onChange={v => { setTheme({ ...theme, logo: v }); setDirty(true); }} />
            {([['primary', 'Brand colour'], ['background', 'Page background'], ['text', 'Text colour']] as const).map(([k, l]) => <FieldEditor key={k} disabled={readOnly} f={{ key: k, label: l, kind: 'color' }} value={theme[k]} onChange={v => { setTheme({ ...theme, [k]: v }); setDirty(true); }} />)}
            {([['headingFont', 'Heading font'], ['bodyFont', 'Body font']] as const).map(([k, l]) => <FieldEditor key={k} disabled={readOnly} f={{ key: k, label: l, kind: 'select', options: FONTS.map(f => ({ value: f, label: f })) }} value={theme[k]} onChange={v => { setTheme({ ...theme, [k]: v }); setDirty(true); }} />)}
            <FieldEditor disabled={readOnly} f={{ key: 'radius', label: 'Corner roundness (px)', kind: 'number' }} value={theme.radius} onChange={v => { setTheme({ ...theme, radius: v }); setDirty(true); }} />
            </SettingsGroup>
            <SettingsGroup title="This page" note={page.name}>
            {!readOnly && <div className="space-y-2"><FieldEditor f={{ key: 'pn', label: 'This page name', kind: 'text' }} value={page.name} onChange={v => editPage(p => { p.name = v; p.slug = page === doc.pages[0] ? '' : slugify(v); })} />
              <p className="text-xs font-medium text-muted-foreground pt-1">Search & sharing</p>
              <FieldEditor f={{ key: 'st', label: 'Search title', kind: 'text' }} value={page.seo?.title} onChange={v => editPage(p => { p.seo = { ...p.seo, title: v }; })} />
              <FieldEditor f={{ key: 'sd', label: 'Search description', kind: 'textarea' }} value={page.seo?.description} onChange={v => editPage(p => { p.seo = { ...p.seo, description: v }; })} />
              <FieldEditor f={{ key: 'si', label: 'Sharing photo', kind: 'image' }} value={page.seo?.image} onChange={v => editPage(p => { p.seo = { ...p.seo, image: v }; })} />
              <Button size="sm" variant="outline" onClick={async () => { try { const r = await askSiteGenius('seo', `Business: ${theme.brand || companyName}. Page: ${page.name}.`, { sections: page.sections.map(x => ({ type: x.type, title: x.props.title, text: String(x.props.subtitle || x.props.body || '').slice(0, 200) })) }); editPage(p => { p.seo = { ...p.seo, title: String(r?.title || '').slice(0, 70), description: String(r?.description || '').slice(0, 170) }; }); } catch (e) { toast({ title: 'Genius', description: (e as Error).message }); } }}>Suggest with Genius</Button>
              {page !== doc.pages[0] && <Button size="sm" variant="outline" onClick={() => { commit(d => { d.pages = d.pages.filter(p => p.id !== page.id); return d; }); setPageId(doc.pages[0].id); }}>Delete page</Button>}</div>}
            </SettingsGroup>
            {history.length > 0 && <SettingsGroup title="Published versions" note={`${history.length} saved`}>
            <div className="space-y-2">
              {history.map((v, i) => <div key={v.at} className="flex items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">{i === 0 ? 'Live · ' : ''}{new Date(v.at).toLocaleString()}</span>{!readOnly && <Button size="sm" variant="ghost" onClick={() => restoreVersion(v)}>Restore</Button>}</div>)}</div>
            </SettingsGroup>}
          </div>
          : !section ? <p className="text-sm text-muted-foreground">Click a section on the page to edit it, or open Site for colours, fonts and logo.</p>
          : panel === 'content' ? <div className="space-y-3">
            <div className="flex items-center justify-between"><p className="font-semibold">{BLOCKS[section.type].label}</p>{!readOnly && <Button size="sm" variant="ghost" onClick={() => saveSection(section)}>Save section</Button>}</div>
            {(BLOCKS[section.type].fields as Field[]).map(f => f.key === 'flipSlug'
              ? (flipField ? <label key={f.key} className="block space-y-1"><span className="text-xs font-medium text-muted-foreground">FLIP book</span><select disabled={readOnly} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={section.props.flipSlug} onChange={e => editSection(section.id, s => { s.props.flipSlug = e.target.value; })}><option value="">Choose…</option>{flips.map(b => <option key={b.slug} value={b.slug}>{b.title}</option>)}</select>{!flips.length && <span className="text-xs text-muted-foreground">Build one in Flip Builder V3 first.</span>}</label> : null)
              : <FieldEditor key={f.key} f={f} disabled={readOnly} value={section.props[f.key]} onChange={v => editSection(section.id, s => { s.props[f.key] = v; })}
                  extra={section.type === 'products' && f.key === 'items' && !readOnly ? <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editSection(section.id, s => { s.props.items = [...(s.props.items || []), blankCard()]; })}>Blank product card</Button>
                      <Button size="sm" variant="outline" onClick={bulkAdd}>Bulk add</Button>
                    </div>
                    {catalog === null ? <Button size="sm" variant="outline" onClick={loadCatalog}>Add from Wonderlands catalogue</Button>
                      : <select className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value="" onChange={e => { const p = catalog.find(x => x.id === e.target.value); if (!p) return; editSection(section.id, s => { s.props.items = [...(s.props.items || []), toCard(p)]; }); }}>
                          <option value="">Pick a product to add…</option>{catalog.map(p => <option key={p.id} value={p.id}>{p.name}{p.category ? ` · ${p.category}` : ''}</option>)}</select>}
                    {catalog && <select className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value="" onChange={e => e.target.value && importCategory(e.target.value)}><option value="">Add a whole category…</option>{[...new Set(catalog.map(p => p.category).filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}</select>}
                  </div> : undefined} />)}
          </div>
          : <div className="space-y-3">
            {!readOnly && <div><span className="text-xs font-medium text-muted-foreground">Colour presets</span><div className="mt-1 grid grid-cols-6 gap-1.5">{GRADIENTS.map(g => <button key={g.name} title={g.name} aria-label={g.name} onClick={() => editSection(section.id, s => { s.style.gradFrom = g.from; s.style.gradTo = g.to; s.style.gradAngle = s.style.gradAngle ?? 135; })} className="h-8 rounded-md border border-border" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />)}</div></div>}
            <div><span className="text-xs font-medium text-muted-foreground">Hide on</span><div className="mt-1 flex gap-3 text-sm">{(['mobile', 'tablet', 'desktop'] as const).map(k => <label key={k} className="flex items-center gap-1.5 capitalize"><input type="checkbox" disabled={readOnly} checked={!!st.hideOn?.[k]} onChange={e => editSection(section.id, s => { s.style.hideOn = { ...s.style.hideOn, [k]: e.target.checked }; })} />{k}</label>)}</div></div>
            {styleFields.map(f => <FieldEditor key={f.key} f={f} disabled={readOnly} value={(st as any)[f.key]} onChange={v => setStyle(f.key, v)} />)}
            {!readOnly && <Button size="sm" variant="ghost" onClick={() => editSection(section.id, s => { s.style = {}; })}>Reset style</Button>}</div>}
        </aside>
      </div>
    </div>
    {textEdit && (() => { const s = page.sections.find(x => x.id === textEdit.sid); if (!s) return null;
      const keys = textEdit.path.split('.'); const get = (o: any) => keys.reduce((a, k) => a?.[k], o);
      const put = (o: any, v: any) => { let t = o; for (const k of keys.slice(0, -1)) t = t[k] ??= {}; t[keys[keys.length - 1]] = v; };
      return <SiteTextEditor rect={textEdit.rect} value={String(get(s.props) ?? '')} look={s.props.__text?.[textEdit.path] ?? {}}
        onChange={v => editSection(s.id, x => put(x.props, v))}
        onLook={l => editSection(s.id, x => { x.props.__text = { ...x.props.__text, [textEdit.path]: l }; })}
        onClose={() => setTextEdit(null)} />; })()}
    </MediaCtx.Provider></PagesCtx.Provider>
  );
};

export default SiteBuilder;
