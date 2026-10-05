/**
 * SiteBuilder — the company Web Builder (workspace chapter "Website builder").
 * Left: pages, block library (drag onto the canvas or click to add) and layers
 * (drag to reorder, hide, duplicate, delete). Centre: live canvas on desktop /
 * tablet / phone widths with drop zones between sections. Right: inspector
 * for the selected section (content, style) or the site theme.
 * Saves to company_sites: layout.draft on save, layout.published on publish;
 * the public site at /sites/:slug reads layout.published only.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, EyeOff, Copy, Trash2, GripVertical, ExternalLink, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import SiteRenderer from './SiteRenderer';
import { BLOCKS, FONTS, DEFAULT_THEME, blankDoc, compressImage, newSection, uid, type BlockType, type Field, type Page, type Section, type SiteDoc, type SiteTheme } from '@/lib/siteBuilder/model';

const DEVICES = { desktop: { w: 1280, icon: Monitor }, tablet: { w: 820, icon: Tablet }, mobile: { w: 390, icon: Smartphone } } as const;
const GROUPS = ['Layout', 'Content', 'Media', 'Commerce', 'Technology'];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

interface SiteRow { id: string; slug: string; title: string; is_published: boolean }

const ImageField: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
  const ref = useRef<HTMLInputElement>(null);
  return <div className="space-y-2">
    {value && <img src={value} alt="" className="h-20 w-full object-cover rounded-md border border-border" />}
    <div className="flex gap-2">
      <Input disabled={disabled} placeholder="Image link" value={value?.startsWith('data:') ? '(uploaded photo)' : value || ''} onChange={e => onChange(e.target.value)} />
      <Button disabled={disabled} type="button" variant="outline" size="sm" onClick={() => ref.current?.click()}>Upload</Button>
      {value && <Button disabled={disabled} type="button" variant="ghost" size="sm" onClick={() => onChange('')}>Clear</Button>}
    </div>
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
    {f.kind === 'textarea' ? <Textarea disabled={disabled} rows={4} value={value ?? ''} onChange={e => onChange(e.target.value)} />
      : f.kind === 'image' ? <ImageField disabled={disabled} value={value} onChange={onChange} />
      : f.kind === 'select' ? <select disabled={disabled} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={String(value ?? '')} onChange={e => onChange(e.target.value)}>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      : f.kind === 'color' ? <input disabled={disabled} type="color" className="h-10 w-full rounded-md border border-input" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} />
      : <Input disabled={disabled} type={f.kind === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={e => onChange(f.kind === 'number' ? Number(e.target.value) : e.target.value)} />}
    {extra}
  </label>;
};

const SiteBuilder: React.FC<{ companyId: string; companyName: string; readOnly?: boolean }> = ({ companyId, companyName, readOnly }) => {
  const { toast } = useToast();
  const [site, setSite] = useState<SiteRow | null | undefined>(undefined);
  const [doc, setDoc] = useState<SiteDoc>(blankDoc);
  const [theme, setTheme] = useState<SiteTheme>({ ...DEFAULT_THEME, brand: companyName });
  const [past, setPast] = useState<SiteDoc[]>([]);
  const [future, setFuture] = useState<SiteDoc[]>([]);
  const [pageId, setPageId] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [panel, setPanel] = useState<'content' | 'style' | 'theme'>('content');
  const [device, setDevice] = useState<keyof typeof DEVICES>('desktop');
  const [drag, setDrag] = useState<{ kind: 'new'; type: BlockType } | { kind: 'move'; id: string } | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flips, setFlips] = useState<{ slug: string; title: string }[]>([]);
  const [catalog, setCatalog] = useState<any[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from('company_sites').select('id,slug,title,is_published,layout,theme').eq('company_id', companyId).order('created_at').limit(1).maybeSingle();
      const f = await supabase.from('flip_books').select('slug,title').eq('company_id', companyId).order('updated_at', { ascending: false }).limit(100);
      if (!alive) return;
      setFlips(f.data ?? []);
      if (data) {
        const l: any = data.layout ?? {};
        const d: SiteDoc = l.draft?.pages?.length ? l.draft : l.published?.pages?.length ? l.published : blankDoc();
        setDoc(d); setPageId(d.pages[0].id); setTheme({ ...DEFAULT_THEME, brand: companyName, ...(data.theme as any) });
        setSite({ id: data.id, slug: data.slug, title: data.title, is_published: data.is_published });
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
  const addBlock = (type: BlockType) => { const s = newSection(type); const i = section ? page.sections.indexOf(section) + 1 : page.sections.length; editPage(p => { p.sections.splice(i, 0, s); }); setSel(s.id); setPanel('content'); };

  const persist = async (publish: boolean) => {
    if (readOnly) return;
    setBusy(true);
    const layout: any = { draft: doc };
    if (publish) layout.published = doc;
    else if (site) { const { data } = await supabase.from('company_sites').select('layout').eq('id', site.id).maybeSingle(); layout.published = (data?.layout as any)?.published ?? null; }
    const patch: any = { layout, theme, title: theme.brand || companyName };
    if (publish) { patch.is_published = true; patch.published_at = new Date().toISOString(); }
    let res;
    if (site) res = await supabase.from('company_sites').update(patch).eq('id', site.id).select('id,slug,title,is_published').single();
    else res = await supabase.from('company_sites').insert({ ...patch, company_id: companyId, slug: `${slugify(companyName) || 'site'}-${uid().slice(0, 4)}` }).select('id,slug,title,is_published').single();
    setBusy(false);
    if (res.error) { toast({ title: 'Not saved', description: res.error.message }); return; }
    setSite(res.data as SiteRow); setDirty(false);
    toast({ title: publish ? 'Site published' : 'Draft saved', description: publish ? `Live at /sites/${res.data.slug}` : 'Visitors still see your last published version.' });
  };
  const unpublish = async () => { if (!site) return; const { error } = await supabase.from('company_sites').update({ is_published: false }).eq('id', site.id); if (!error) setSite({ ...site, is_published: false }); toast({ title: error ? 'Not changed' : 'Site taken offline' }); };
  const changeSlug = async (v: string) => {
    if (!site) return; const s = slugify(v); if (!s || s === site.slug) return;
    const { error } = await supabase.from('company_sites').update({ slug: s }).eq('id', site.id);
    if (error) toast({ title: 'Address taken', description: 'Try another web address.' }); else setSite({ ...site, slug: s });
  };

  const loadCatalog = async () => { const { data } = await supabase.from('products').select('id,name,price,description,image_url,category').eq('is_active', true).order('name').limit(500); setCatalog(data ?? []); };

  const wrap = useCallback((s: Section, node: React.ReactNode) => {
    const i = page.sections.indexOf(s);
    return <div className={`relative group ${sel === s.id ? 'outline outline-2 outline-teal -outline-offset-2' : 'hover:outline hover:outline-1 hover:outline-teal/60 -outline-offset-1'}`}
      onClick={e => { e.preventDefault(); setSel(s.id); if (panel === 'theme') setPanel('content'); }}
      draggable={!readOnly} onDragStart={e => { e.stopPropagation(); setDrag({ kind: 'move', id: s.id }); }} onDragEnd={() => { setDrag(null); setDropAt(null); }}
      onDragOver={e => { if (!drag) return; e.preventDefault(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setDropAt(e.clientY < r.top + r.height / 2 ? i : i + 1); }}
      onDrop={e => { e.preventDefault(); if (dropAt !== null) insertAt(dropAt); }}>
      {dropAt === i && drag && <div className="absolute -top-1 inset-x-0 h-1.5 bg-teal z-20 rounded" />}
      <span className="absolute top-2 left-2 z-20 hidden group-hover:block rounded bg-foreground px-2 py-0.5 text-[11px] text-background">{BLOCKS[s.type].label}</span>
      <div className="pointer-events-none [&_iframe]:pointer-events-none">{node}</div>
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
    { key: 'overlay', label: 'Darken photo/video (0–90)', kind: 'number' }, { key: 'padY', label: 'Top & bottom space (px)', kind: 'number' },
    { key: 'titleSize', label: 'Title size (px)', kind: 'number' },
    { key: 'align', label: 'Alignment', kind: 'select', options: ['left', 'center', 'right'].map(v => ({ value: v, label: v })) },
    { key: 'width', label: 'Width', kind: 'select', options: ['narrow', 'normal', 'wide', 'full'].map(v => ({ value: v, label: v })) },
    { key: 'font', label: 'Font for this section', kind: 'select', options: [{ value: '', label: 'Site font' }, ...FONTS.map(f => ({ value: f, label: f }))] },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={page.id} onChange={e => { setPageId(e.target.value); setSel(null); }}>{doc.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        {!readOnly && <Button size="sm" variant="ghost" onClick={() => { const n = prompt('Page name'); if (!n) return; const p: Page = { id: uid(), name: n, slug: slugify(n), sections: [newSection('text')] }; commit(d => { d.pages.push(p); return d; }); setPageId(p.id); }}><Plus className="h-4 w-4 mr-1" />Page</Button>}
        <div className="flex rounded-md border border-border">{(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map(k => { const I = DEVICES[k].icon; return <button key={k} aria-label={k} onClick={() => setDevice(k)} className={`px-2.5 py-1.5 ${device === k ? 'bg-muted' : ''}`}><I className="h-4 w-4" /></button>; })}</div>
        <Button size="sm" variant="ghost" disabled={!past.length} onClick={undo} aria-label="Undo"><Undo2 className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" disabled={!future.length} onClick={redo} aria-label="Redo"><Redo2 className="h-4 w-4" /></Button>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {site && <span className="text-muted-foreground">/sites/<input disabled={readOnly} defaultValue={site.slug} onBlur={e => changeSlug(e.target.value)} className="w-32 bg-transparent border-b border-border focus:outline-none" /></span>}
          <span className="text-xs text-muted-foreground">{site?.is_published ? 'Live' : 'Not published'}{dirty ? ' · unsaved changes' : ''}</span>
          {site?.is_published && <Button size="sm" variant="outline" asChild><a href={`/sites/${site.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 mr-1" />View</a></Button>}
          {!readOnly && <><Button size="sm" variant="outline" disabled={busy} onClick={() => persist(false)}>Save draft</Button>
            <Button size="sm" disabled={busy} onClick={() => persist(true)}>Publish</Button>
            {site?.is_published && <Button size="sm" variant="ghost" onClick={unpublish}>Unpublish</Button>}</>}
        </div>
      </div>

      <div className="grid lg:grid-cols-[230px_minmax(0,1fr)_300px] min-h-[720px]">
        {/* Library + layers */}
        <aside className="border-b lg:border-b-0 lg:border-r border-border p-3 space-y-5 overflow-y-auto lg:max-h-[calc(100vh-160px)]">
          {GROUPS.map(g => <div key={g}><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-2">{g}</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">{(Object.keys(BLOCKS) as BlockType[]).filter(k => BLOCKS[k].group === g).map(k =>
              <button key={k} disabled={readOnly} draggable={!readOnly} onDragStart={() => setDrag({ kind: 'new', type: k })} onDragEnd={() => { setDrag(null); setDropAt(null); }} onClick={() => addBlock(k)}
                className="rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-teal transition-colors cursor-grab">{BLOCKS[k].label}</button>)}</div></div>)}
          <div><p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mb-2">Layers</p>
            <ul className="space-y-1">{page.sections.map((s, i) => <li key={s.id} draggable={!readOnly} onDragStart={() => setDrag({ kind: 'move', id: s.id })} onDragEnd={() => { setDrag(null); setDropAt(null); }} onDragOver={e => e.preventDefault()} onDrop={() => { setDropAt(i); insertAt(i); }}
              className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-sm ${sel === s.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button className="flex-1 truncate text-left" onClick={() => { setSel(s.id); setPanel('content'); }}>{BLOCKS[s.type].label}</button>
              {!readOnly && <><button aria-label="Hide" onClick={() => editSection(s.id, x => { x.style.hidden = !x.style.hidden; })}>{s.style.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                <button aria-label="Duplicate" onClick={() => editPage(p => { p.sections.splice(i + 1, 0, { ...structuredClone(s), id: uid() }); })}><Copy className="h-3.5 w-3.5" /></button>
                <button aria-label="Delete" onClick={() => { editPage(p => { p.sections = p.sections.filter(x => x.id !== s.id); }); if (sel === s.id) setSel(null); }}><Trash2 className="h-3.5 w-3.5" /></button></>}
            </li>)}</ul></div>
        </aside>

        {/* Canvas */}
        <div className="bg-muted/40 overflow-auto p-4" onClick={e => { if (e.target === e.currentTarget) setSel(null); }}>
          <div className="mx-auto bg-background shadow-sm transition-[max-width] duration-300" style={{ maxWidth: DEVICES[device].w }}
            onDragOver={e => { if (drag && !page.sections.length) { e.preventDefault(); setDropAt(0); } }} onDrop={() => { if (!page.sections.length) insertAt(0); }}>
            {page.sections.length ? <SiteRenderer page={page} theme={theme} wrap={wrap} /> : <div className="p-16 text-center text-muted-foreground">Drag a block here to start this page.</div>}
          </div>
        </div>

        {/* Inspector */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border p-3 overflow-y-auto lg:max-h-[calc(100vh-160px)]">
          <div className="flex rounded-md border border-border mb-4 text-sm">{(['content', 'style', 'theme'] as const).map(k => <button key={k} onClick={() => setPanel(k)} className={`flex-1 py-1.5 capitalize ${panel === k ? 'bg-muted font-semibold' : ''}`}>{k === 'theme' ? 'Site' : k}</button>)}</div>
          {panel === 'theme' ? <div className="space-y-3">
            {([['brand', 'Business name', 'text'], ['phone', 'Phone', 'text'], ['email', 'Email', 'text']] as const).map(([k, l]) => <FieldEditor key={k} disabled={readOnly} f={{ key: k, label: l, kind: 'text' }} value={(theme as any)[k]} onChange={v => { setTheme({ ...theme, [k]: v }); setDirty(true); }} />)}
            <FieldEditor disabled={readOnly} f={{ key: 'logo', label: 'Logo', kind: 'image' }} value={theme.logo} onChange={v => { setTheme({ ...theme, logo: v }); setDirty(true); }} />
            {([['primary', 'Brand colour'], ['background', 'Page background'], ['text', 'Text colour']] as const).map(([k, l]) => <FieldEditor key={k} disabled={readOnly} f={{ key: k, label: l, kind: 'color' }} value={theme[k]} onChange={v => { setTheme({ ...theme, [k]: v }); setDirty(true); }} />)}
            {([['headingFont', 'Heading font'], ['bodyFont', 'Body font']] as const).map(([k, l]) => <FieldEditor key={k} disabled={readOnly} f={{ key: k, label: l, kind: 'select', options: FONTS.map(f => ({ value: f, label: f })) }} value={theme[k]} onChange={v => { setTheme({ ...theme, [k]: v }); setDirty(true); }} />)}
            <FieldEditor disabled={readOnly} f={{ key: 'radius', label: 'Corner roundness (px)', kind: 'number' }} value={theme.radius} onChange={v => { setTheme({ ...theme, radius: v }); setDirty(true); }} />
            {!readOnly && doc.pages.length > 1 && <div className="pt-2 border-t border-border space-y-2"><FieldEditor f={{ key: 'pn', label: 'This page name', kind: 'text' }} value={page.name} onChange={v => editPage(p => { p.name = v; p.slug = page === doc.pages[0] ? '' : slugify(v); })} />
              {page !== doc.pages[0] && <Button size="sm" variant="outline" onClick={() => { commit(d => { d.pages = d.pages.filter(p => p.id !== page.id); return d; }); setPageId(doc.pages[0].id); }}>Delete page</Button>}</div>}
          </div>
          : !section ? <p className="text-sm text-muted-foreground">Click a section on the page to edit it, or open Site for colours, fonts and logo.</p>
          : panel === 'content' ? <div className="space-y-3">
            <p className="font-semibold">{BLOCKS[section.type].label}</p>
            {(BLOCKS[section.type].fields as Field[]).map(f => f.key === 'flipSlug'
              ? (flipField ? <label key={f.key} className="block space-y-1"><span className="text-xs font-medium text-muted-foreground">FLIP book</span><select disabled={readOnly} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={section.props.flipSlug} onChange={e => editSection(section.id, s => { s.props.flipSlug = e.target.value; })}><option value="">Choose…</option>{flips.map(b => <option key={b.slug} value={b.slug}>{b.title}</option>)}</select>{!flips.length && <span className="text-xs text-muted-foreground">Build one in Flip Builder V3 first.</span>}</label> : null)
              : <FieldEditor key={f.key} f={f} disabled={readOnly} value={section.props[f.key]} onChange={v => editSection(section.id, s => { s.props[f.key] = v; })}
                  extra={section.type === 'products' && f.key === 'items' && !readOnly ? <div className="space-y-2">
                    {catalog === null ? <Button size="sm" variant="outline" onClick={loadCatalog}>Add from Wonderlands catalogue</Button>
                      : <select className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value="" onChange={e => { const p = catalog.find(x => x.id === e.target.value); if (!p) return; editSection(section.id, s => { s.props.items = [...(s.props.items || []), { name: p.name, price: p.price ? `$${Number(p.price).toLocaleString()}` : '', description: p.description ?? '', image: p.image_url ?? '', badge: '', buttonLabel: 'Ask for a quote', buttonHref: '#contact' }]; }); }}>
                          <option value="">Pick a product to add…</option>{catalog.map(p => <option key={p.id} value={p.id}>{p.name}{p.category ? ` · ${p.category}` : ''}</option>)}</select>}
                  </div> : undefined} />)}
          </div>
          : <div className="space-y-3">{styleFields.map(f => <FieldEditor key={f.key} f={f} disabled={readOnly} value={(st as any)[f.key]} onChange={v => setStyle(f.key, v)} />)}
            {!readOnly && <Button size="sm" variant="ghost" onClick={() => editSection(section.id, s => { s.style = {}; })}>Reset style</Button>}</div>}
        </aside>
      </div>
    </div>
  );
};

export default SiteBuilder;
