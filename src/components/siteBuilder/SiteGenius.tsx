/**
 * SiteGenius — Genius inside the Website Builder V2 (Groq `site-genius`).
 * Build a whole site from one sentence, or type a command that edits the
 * current page ("add a FAQ about financing", "make the hero darker").
 * Every change lands in the draft and can be undone; nothing publishes itself.
 * Imagine Engine Studios Corp.
 */
import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { compressImage, uid, type Page, type SiteDoc, type SiteTheme } from '@/lib/siteBuilder/model';
import { isBlock, sectionFrom } from '@/lib/siteBuilder/tradeTemplates';
import { slugifyPage } from './siteBuilderUtils';

export async function askSiteGenius(mode: 'build' | 'command' | 'rewrite' | 'seo' | 'agent', prompt: string, context?: unknown, history?: { who: string; text: string }[]): Promise<any> {
  const { data, error } = await supabase.functions.invoke('site-genius', { body: { mode, prompt, context, history } });
  if (error || data?.error) throw new Error(data?.error || 'Genius is unavailable right now.');
  return data.result;
}

const toSections = (list: any[]) => (Array.isArray(list) ? list : []).filter((s) => isBlock(s?.type)).map((s) => sectionFrom({ type: s.type, props: s.props, style: s.style }));
const THEME_KEYS = ['primary', 'background', 'text', 'headingFont', 'bodyFont', 'radius', 'brand', 'phone', 'email', 'whatsapp'];

/** Compact whole-site snapshot for Genius: photos become "[photo]", long text is trimmed. */
export function siteContext(d: SiteDoc, theme: SiteTheme, openPageId: string) {
  const slim = (v: any): any => typeof v === 'string' ? (v.startsWith('data:') ? '[photo]' : v.slice(0, 300))
    : Array.isArray(v) ? v.slice(0, 30).map(slim) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, slim(x)])) : v;
  const { logo, ...t } = theme;
  return { openPage: openPageId, theme: { ...t, logo: logo ? '[logo set]' : '' },
    pages: d.pages.map((p) => ({ id: p.id, name: p.name, slug: p.slug, seo: p.seo, sections: p.sections.map((s) => ({ id: s.id, type: s.type, props: slim(s.props), style: slim(s.style) })) })) };
}

/** Applies Genius ops to a cloned doc across any page (unknown ops/types are ignored). */
export function applyGeniusOps(d: SiteDoc, pageId: string, ops: any[], setTheme: (fn: (t: SiteTheme) => SiteTheme) => void, onOpen?: (id: string) => void): SiteDoc {
  const find = (id?: string) => d.pages.find((p) => p.id === (id || pageId)) || d.pages.find((p) => p.id === pageId);
  const locate = (sid: string) => { for (const p of d.pages) { const i = p.sections.findIndex((x) => x.id === sid); if (i >= 0) return { p, i }; } return null; };
  for (const o of Array.isArray(ops) ? ops : []) {
    const page = find(o?.page); if (!page) continue;
    if (o?.op === 'add' && isBlock(o.type)) { const s = sectionFrom(o); const i = o.after ? page.sections.findIndex((x) => x.id === o.after) + 1 : page.sections.length; page.sections.splice(i > 0 ? i : page.sections.length, 0, s); }
    else if (o?.op === 'update') { const h = locate(o.id); if (h) { const s = h.p.sections[h.i]; if (o.props && typeof o.props === 'object') Object.assign(s.props, o.props); if (o.style && typeof o.style === 'object') Object.assign(s.style, o.style); } }
    else if (o?.op === 'remove') { const h = locate(o.id); if (h) h.p.sections.splice(h.i, 1); }
    else if (o?.op === 'duplicate') { const h = locate(o.id); if (h) h.p.sections.splice(h.i + 1, 0, { ...structuredClone(h.p.sections[h.i]), id: uid() }); }
    else if (o?.op === 'move') { const h = locate(o.id); if (h) { const [m] = h.p.sections.splice(h.i, 1); h.p.sections.splice(Math.max(0, Math.min(h.p.sections.length, Number(o.to) || 0)), 0, m); } }
    else if (o?.op === 'theme' && o.theme) { const t = o.theme; setTheme((cur) => ({ ...cur, ...Object.fromEntries(Object.entries(t).filter(([k, v]) => THEME_KEYS.includes(k) && v !== undefined && v !== null)) })); }
    else if (o?.op === 'addPage' && o.name) { const np: Page = { id: uid(), name: String(o.name).slice(0, 40), slug: slugifyPage(String(o.name)), sections: toSections(o.sections), seo: o.seo && typeof o.seo === 'object' ? { title: String(o.seo.title || ''), description: String(o.seo.description || '') } : undefined }; d.pages.push(np); }
    else if (o?.op === 'renamePage' && o.name) { page.name = String(o.name).slice(0, 40); if (page !== d.pages[0]) page.slug = slugifyPage(page.name); }
    else if (o?.op === 'removePage' && page !== d.pages[0]) d.pages = d.pages.filter((p) => p.id !== page.id);
    else if (o?.op === 'seo' && o.seo) page.seo = { ...page.seo, title: String(o.seo.title ?? page.seo?.title ?? '').slice(0, 70), description: String(o.seo.description ?? page.seo?.description ?? '').slice(0, 170) };
    else if (o?.op === 'open' && onOpen) onOpen(page.id);
  }
  return d;
}

/** Whole site from Genius "build" result. */
export function docFromGenius(r: any): SiteDoc | null {
  const pages: Page[] = (Array.isArray(r?.pages) ? r.pages : []).slice(0, 6).map((p: any, i: number) => ({ id: uid(), name: String(p?.name || `Page ${i + 1}`).slice(0, 40), slug: i === 0 ? '' : slugifyPage(String(p?.name || `page-${i}`)), seo: p?.seo && typeof p.seo === 'object' ? { title: String(p.seo.title || ''), description: String(p.seo.description || '') } : undefined, sections: toSections(p?.sections) })).filter((p: Page) => p.sections.length);
  return pages.length ? { pages } : null;
}

type Attachment = { id: string; name: string; kind: 'photo' | 'text' | 'file'; token?: string; data?: string; text?: string };
const TEXT_RE = /\.(txt|md|csv|json|html?|css|scss|js|jsx|ts|tsx|py|php|rb|go|java|xml|ya?ml|svg|sql|sh|env\.example)$/i;
const SUGGESTIONS = ['Add a FAQ about financing', 'Make the hero darker and more elegant', 'Add a team section', 'Rewrite the headline for a luxury pool builder'];

/** Swaps {{photoN}} tokens Genius used for the real uploaded photos, everywhere in the value. */
const fillPhotos = <T,>(v: T, files: Attachment[]): T => {
  const photos = files.filter((f) => f.kind === 'photo');
  if (!photos.length) return v;
  const walk = (x: any): any => typeof x === 'string' ? photos.reduce((acc, f) => acc.split(f.token!).join(f.data!), x)
    : Array.isArray(x) ? x.map(walk) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, y]) => [k, walk(y)])) : x;
  return walk(v);
};

const SiteGenius: React.FC<{
  disabled?: boolean; brand: string; page: Page;
  onBuild: (doc: SiteDoc, theme?: Partial<SiteTheme>) => void;
  onOps: (ops: any[]) => void;
}> = ({ disabled, brand, page, onBuild, onOps }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<'' | 'build' | 'command'>('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [log, setLog] = useState<{ who: 'you' | 'genius'; text: string }[]>([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (list: FileList | File[]) => {
    const next: Attachment[] = [];
    for (const f of Array.from(list).slice(0, 10)) {
      const id = uid();
      if (f.type.startsWith('image/') && !/svg/.test(f.type)) {
        try { const n = files.filter((x) => x.kind === 'photo').length + next.filter((x) => x.kind === 'photo').length + 1; next.push({ id, name: f.name, kind: 'photo', token: `{{photo${n}}}`, data: await compressImage(f) }); } catch { next.push({ id, name: f.name, kind: 'file' }); }
      } else if (f.type.startsWith('text/') || TEXT_RE.test(f.name) || /json|javascript|xml/.test(f.type)) {
        next.push({ id, name: f.name, kind: 'text', text: (await f.text()).slice(0, 6000) });
      } else next.push({ id, name: f.name, kind: 'file' });
    }
    setFiles((cur) => [...cur, ...next]);
  };

  const context = () => files.map((f) => f.kind === 'photo' ? `Uploaded photo "${f.name}" — to use it, put exactly ${f.token} as an image/src/photo value.`
    : f.kind === 'text' ? `File "${f.name}":\n${f.text}` : `Attached file "${f.name}" (contents not readable, use only its name).`).join('\n\n');

  const run = async (mode: 'build' | 'command') => {
    if ((!text.trim() && !files.length) || busy) return;
    setBusy(mode); const ask = text.trim() || 'Use the attached files.';
    setLog((l) => [...l, { who: 'you', text: ask + (files.length ? ` · ${files.length} file${files.length > 1 ? 's' : ''}` : '') }]);
    const extra = files.length ? `\n\nAttachments:\n${context()}` : '';
    try {
      if (mode === 'build') {
        if (!confirm('Genius will replace every page of your draft. You can undo. Continue?')) { setBusy(''); return; }
        const r = await askSiteGenius('build', `Business: ${brand}. ${ask}${extra}`);
        const doc = docFromGenius(fillPhotos(r, files));
        if (!doc) throw new Error('Genius could not draft pages. Add more detail about your business.');
        onBuild(doc, r?.theme); setLog((l) => [...l, { who: 'genius', text: `Drafted ${doc.pages.length} pages. Review, then publish.` }]);
      } else {
        const ctx = { page: page.name, sections: page.sections.map((s) => ({ id: s.id, type: s.type, props: Object.fromEntries(Object.entries(s.props).map(([k, v]) => [k, typeof v === 'string' ? (v.startsWith('data:') ? '[photo]' : v.slice(0, 120)) : Array.isArray(v) ? `${v.length} items` : v])) })) };
        const r = await askSiteGenius('command', ask + extra, ctx);
        onOps(fillPhotos(r?.ops ?? [], files)); setLog((l) => [...l, { who: 'genius', text: r?.summary || 'Done.' }]);
      }
      setText(''); setFiles([]);
    } catch (e) { setLog((l) => [...l, { who: 'genius', text: (e as Error).message }]); }
    setBusy('');
  };

  return <div className={`flex h-full min-h-[420px] flex-col ${over ? 'bg-muted/40' : ''}`}
    onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true); } }} onDragLeave={() => setOver(false)}
    onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setOver(false); if (!disabled) addFiles(e.dataTransfer.files); } }}>
    <div className="border-b border-border px-4 py-3">
      <p className="text-xl font-semibold leading-none">Genius</p>
      <p className="mt-1 text-xs text-muted-foreground">Tell me what to change, or drop photos, documents or code.</p>
    </div>
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {!log.length && <div className="space-y-1.5">{SUGGESTIONS.map((q) => <button key={q} disabled={disabled} onClick={() => setText(q)} className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-teal transition-colors">{q}</button>)}</div>}
      {log.map((m, i) => <div key={i} className={m.who === 'you' ? 'ml-6 rounded-xl bg-foreground px-3 py-2 text-sm text-background' : 'mr-6 text-sm text-foreground'}>{m.text}</div>)}
      {busy && <p className="text-xs text-muted-foreground">{busy === 'build' ? 'Drafting your site…' : 'Working on this page…'}</p>}
    </div>
    <div className="border-t border-border p-3 space-y-2">
      {files.length > 0 && <div className="flex flex-wrap gap-1.5">{files.map((f) => <span key={f.id} className="flex items-center gap-1.5 rounded-md border border-border bg-background px-1.5 py-1 text-xs">
        {f.kind === 'photo' ? <img src={f.data} alt="" className="h-6 w-6 rounded object-cover" /> : <span className="font-mono text-[10px] text-muted-foreground">{f.name.split('.').pop()?.toUpperCase().slice(0, 4)}</span>}
        <span className="max-w-[120px] truncate">{f.name}</span>
        <button aria-label="Remove" onClick={() => setFiles((c) => c.filter((x) => x.id !== f.id))} className="text-muted-foreground hover:text-foreground">×</button></span>)}</div>}
      <Textarea disabled={disabled} rows={3} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run('command'); } }}
        onPaste={(e) => { if (e.clipboardData.files.length) { e.preventDefault(); addFiles(e.clipboardData.files); } }}
        placeholder="“Add a FAQ about financing” or describe your business to draft a whole site" />
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>Attach</Button>
        <Button size="sm" className="flex-1" disabled={disabled || !!busy || (!text.trim() && !files.length)} onClick={() => run('command')}>Edit this page</Button>
        <Button size="sm" variant="outline" disabled={disabled || !!busy || (!text.trim() && !files.length)} onClick={() => run('build')}>Draft site</Button>
      </div>
    </div>
  </div>;
};
export default SiteGenius;
