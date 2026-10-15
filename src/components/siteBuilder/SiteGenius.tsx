/**
 * SiteGenius — Genius inside the Website Builder V2 (Groq `site-genius`).
 * Build a whole site from one sentence, or type a command that edits the
 * current page ("add a FAQ about financing", "make the hero darker").
 * Every change lands in the draft and can be undone; nothing publishes itself.
 * Imagine Engine Studios Corp.
 */
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { uid, type Page, type SiteDoc, type SiteTheme } from '@/lib/siteBuilder/model';
import { isBlock, sectionFrom } from '@/lib/siteBuilder/tradeTemplates';
import { slugifyPage } from './siteBuilderUtils';

export async function askSiteGenius(mode: 'build' | 'command' | 'rewrite' | 'seo', prompt: string, context?: unknown): Promise<any> {
  const { data, error } = await supabase.functions.invoke('site-genius', { body: { mode, prompt, context } });
  if (error || data?.error) throw new Error(data?.error || 'Genius is unavailable right now.');
  return data.result;
}

const toSections = (list: any[]) => (Array.isArray(list) ? list : []).filter((s) => isBlock(s?.type)).map((s) => sectionFrom({ type: s.type, props: s.props, style: s.style }));

/** Applies a Genius command result to a cloned doc (unknown ops/types are ignored). */
export function applyGeniusOps(d: SiteDoc, pageId: string, ops: any[], setTheme: (fn: (t: SiteTheme) => SiteTheme) => void): SiteDoc {
  const page = d.pages.find((p) => p.id === pageId); if (!page) return d;
  for (const o of Array.isArray(ops) ? ops : []) {
    if (o?.op === 'add' && isBlock(o.type)) { const s = sectionFrom(o); const i = o.after ? page.sections.findIndex((x) => x.id === o.after) + 1 : page.sections.length; page.sections.splice(i > 0 ? i : page.sections.length, 0, s); }
    else if (o?.op === 'update') { const s = page.sections.find((x) => x.id === o.id); if (s) { if (o.props && typeof o.props === 'object') Object.assign(s.props, o.props); if (o.style && typeof o.style === 'object') Object.assign(s.style, o.style); } }
    else if (o?.op === 'remove') page.sections = page.sections.filter((x) => x.id !== o.id);
    else if (o?.op === 'move') { const from = page.sections.findIndex((x) => x.id === o.id); if (from >= 0) { const [m] = page.sections.splice(from, 1); page.sections.splice(Math.max(0, Math.min(page.sections.length, Number(o.to) || 0)), 0, m); } }
    else if (o?.op === 'theme' && o.theme) { const t = o.theme; setTheme((cur) => ({ ...cur, ...Object.fromEntries(Object.entries(t).filter(([k]) => ['primary', 'background', 'text', 'headingFont', 'bodyFont', 'radius'].includes(k))) })); }
    else if (o?.op === 'addPage' && o.name) d.pages.push({ id: uid(), name: String(o.name).slice(0, 40), slug: slugifyPage(String(o.name)), sections: toSections(o.sections) });
  }
  return d;
}

/** Whole site from Genius "build" result. */
export function docFromGenius(r: any): SiteDoc | null {
  const pages: Page[] = (Array.isArray(r?.pages) ? r.pages : []).slice(0, 6).map((p: any, i: number) => ({ id: uid(), name: String(p?.name || `Page ${i + 1}`).slice(0, 40), slug: i === 0 ? '' : slugifyPage(String(p?.name || `page-${i}`)), seo: p?.seo && typeof p.seo === 'object' ? { title: String(p.seo.title || ''), description: String(p.seo.description || '') } : undefined, sections: toSections(p?.sections) })).filter((p: Page) => p.sections.length);
  return pages.length ? { pages } : null;
}

const SiteGenius: React.FC<{
  disabled?: boolean; brand: string; page: Page;
  onBuild: (doc: SiteDoc, theme?: Partial<SiteTheme>) => void;
  onOps: (ops: any[]) => void;
}> = ({ disabled, brand, page, onBuild, onOps }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<'' | 'build' | 'command'>('');
  const [note, setNote] = useState('');
  const run = async (mode: 'build' | 'command') => {
    if (!text.trim() || busy) return;
    setBusy(mode); setNote('');
    try {
      if (mode === 'build') {
        if (!confirm('Genius will replace every page of your draft. You can undo. Continue?')) { setBusy(''); return; }
        const r = await askSiteGenius('build', `Business: ${brand}. ${text}`);
        const doc = docFromGenius(r);
        if (!doc) throw new Error('Genius could not draft pages. Add more detail about your business.');
        onBuild(doc, r?.theme); setNote(`Drafted ${doc.pages.length} pages. Review, then publish.`);
      } else {
        const ctx = { page: page.name, sections: page.sections.map((s) => ({ id: s.id, type: s.type, props: Object.fromEntries(Object.entries(s.props).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 120) : Array.isArray(v) ? `${v.length} items` : v])) })) };
        const r = await askSiteGenius('command', text, ctx);
        onOps(r?.ops ?? []); setNote(r?.summary || 'Done.');
      }
      setText('');
    } catch (e) { setNote((e as Error).message); }
    setBusy('');
  };
  return <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Genius</p>
    <Textarea disabled={disabled} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="“Add a FAQ about financing” or describe your business to draft a whole site" />
    <div className="flex gap-2">
      <Button size="sm" className="flex-1" disabled={disabled || !!busy || !text.trim()} onClick={() => run('command')}>{busy === 'command' ? 'Working…' : 'Edit this page'}</Button>
      <Button size="sm" variant="outline" className="flex-1" disabled={disabled || !!busy || !text.trim()} onClick={() => run('build')}>{busy === 'build' ? 'Drafting…' : 'Draft whole site'}</Button>
    </div>
    {note && <p className="text-xs text-muted-foreground">{note}</p>}
  </div>;
};
export default SiteGenius;
