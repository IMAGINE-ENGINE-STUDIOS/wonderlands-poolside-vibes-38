/**
 * SiteGenius — Genius inside the Website Builder V2 (Groq `site-genius`).
 * Build a whole site from one sentence, or give an instruction and Genius
 * works on the canvas like a professional website designer + programmer:
 * it plans the job, applies a batch of ops, looks at the updated site and
 * keeps going until the job is done (structure → content → style → SEO).
 * Genius can do everything the user can do by hand — every block, every
 * field, every style option, pages, theme, per-text styling and SEO —
 * through the op vocabulary in BUILDER_BRAIN (generated from BLOCKS, so it
 * always matches the real builder). Every change lands in the draft and
 * can be undone; nothing publishes itself.
 * Imagine Engine Studios Corp.
 */
import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BLOCKS, FONTS, compressImage, uid, type Page, type SiteDoc, type SiteTheme } from '@/lib/siteBuilder/model';
import { isBlock, sectionFrom } from '@/lib/siteBuilder/tradeTemplates';
import { slugifyPage } from './siteBuilderUtils';
import { hydrateDocProducts } from '@/lib/siteBuilder/catalogCards';

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

/** Applies Genius ops to a doc across any page. Unknown ops/types are ignored and
 *  reported in `notes` (when given) so the user sees exactly what landed. */
export function applyGeniusOps(d: SiteDoc, pageId: string, ops: any[], setTheme: (fn: (t: SiteTheme) => SiteTheme) => void, onOpen?: (id: string) => void, notes?: string[]): SiteDoc {
  const find = (id?: string) => d.pages.find((p) => p.id === (id || pageId)) || d.pages.find((p) => p.id === pageId);
  const locate = (sid: string) => { for (const p of d.pages) { const i = p.sections.findIndex((x) => x.id === sid); if (i >= 0) return { p, i }; } return null; };
  const label = (t: string) => (BLOCKS as any)[t]?.label || t;
  for (const o of Array.isArray(ops) ? ops : []) {
    const page = find(o?.page); if (!page) { notes?.push('one change was skipped (unknown page)'); continue; }
    if (o?.op === 'add' && isBlock(o.type)) { const s = sectionFrom(o); const at = typeof o.index === 'number' ? Math.max(0, Math.min(page.sections.length, o.index)) : o.after ? page.sections.findIndex((x) => x.id === o.after) + 1 : page.sections.length; page.sections.splice(at, 0, s); notes?.push(`added ${label(o.type)} to ${page.name}`); }
    else if (o?.op === 'add') notes?.push(`skipped an unknown block (${String(o?.type || '?')})`);
    else if (o?.op === 'update') { const h = locate(o.id); if (h) { const s = h.p.sections[h.i]; if (o.props && typeof o.props === 'object') Object.assign(s.props, o.props); if (o.style && typeof o.style === 'object') Object.assign(s.style, o.style); notes?.push(`updated ${label(s.type)} on ${h.p.name}`); } else notes?.push('one update was skipped (section not found)'); }
    else if (o?.op === 'remove') { const h = locate(o.id); if (h) { const [gone] = h.p.sections.splice(h.i, 1); notes?.push(`removed ${label(gone.type)} from ${h.p.name}`); } else notes?.push('one removal was skipped (section not found)'); }
    else if (o?.op === 'duplicate') { const h = locate(o.id); if (h) { h.p.sections.splice(h.i + 1, 0, { ...structuredClone(h.p.sections[h.i]), id: uid() }); notes?.push(`duplicated ${label(h.p.sections[h.i].type)} on ${h.p.name}`); } }
    else if (o?.op === 'move') { const h = locate(o.id); if (h) { const [m] = h.p.sections.splice(h.i, 1); h.p.sections.splice(Math.max(0, Math.min(h.p.sections.length, Number(o.to) || 0)), 0, m); notes?.push(`moved ${label(m.type)} on ${h.p.name}`); } }
    else if (o?.op === 'textStyle') { const h = locate(o.id); const look = o.look && typeof o.look === 'object' ? Object.fromEntries(Object.entries(o.look).filter(([k, v]) => ['font', 'size', 'color', 'bold', 'italic', 'align'].includes(k) && v !== undefined)) : null; if (h && look && typeof o.path === 'string' && o.path) { const s = h.p.sections[h.i]; s.props.__text = { ...(s.props.__text || {}), [o.path]: { ...(s.props.__text?.[o.path] || {}), ...look } }; notes?.push(`styled text in ${label(s.type)} on ${h.p.name}`); } else notes?.push('one text styling was skipped'); }
    else if (o?.op === 'theme' && o.theme) { const t = o.theme; setTheme((cur) => ({ ...cur, ...Object.fromEntries(Object.entries(t).filter(([k, v]) => THEME_KEYS.includes(k) && v !== undefined && v !== null)) })); notes?.push('updated the site theme / business details'); }
    else if (o?.op === 'addPage' && o.name) { const np: Page = { id: uid(), name: String(o.name).slice(0, 40), slug: slugifyPage(String(o.name)), sections: toSections(o.sections), seo: o.seo && typeof o.seo === 'object' ? { title: String(o.seo.title || ''), description: String(o.seo.description || ''), image: o.seo.image ? String(o.seo.image) : undefined } : undefined }; d.pages.push(np); notes?.push(`added page "${np.name}" (${np.sections.length} sections)`); }
    else if (o?.op === 'renamePage' && o.name) { page.name = String(o.name).slice(0, 40); if (page !== d.pages[0]) page.slug = slugifyPage(page.name); notes?.push(`renamed a page to "${page.name}"`); }
    else if (o?.op === 'removePage' && page !== d.pages[0]) { d.pages = d.pages.filter((p) => p.id !== page.id); notes?.push(`removed page "${page.name}"`); }
    else if (o?.op === 'movePage') { const from = d.pages.findIndex((p) => p.id === page.id); const to = Math.max(1, Math.min(d.pages.length - 1, Number(o.to) || from)); if (from > 0 && to !== from) { const [m] = d.pages.splice(from, 1); d.pages.splice(to, 0, m); notes?.push(`reordered pages (${m.name} is now page ${to + 1})`); } }
    else if (o?.op === 'seo' && o.seo) { page.seo = { ...page.seo, title: String(o.seo.title ?? page.seo?.title ?? '').slice(0, 70), description: String(o.seo.description ?? page.seo?.description ?? '').slice(0, 170), ...(o.seo.image !== undefined ? { image: String(o.seo.image || '') } : {}) }; notes?.push(`updated search & sharing info on ${page.name}`); }
    else if (o?.op === 'open' && onOpen) onOpen(page.id);
    else if (o?.op) notes?.push(`skipped an unsupported change (${String(o.op)})`);
  }
  return d;
}

/** Whole site from Genius "build" result. */
export function docFromGenius(r: any): SiteDoc | null {
  const pages: Page[] = (Array.isArray(r?.pages) ? r.pages : []).slice(0, 6).map((p: any, i: number) => ({ id: uid(), name: String(p?.name || `Page ${i + 1}`).slice(0, 40), slug: i === 0 ? '' : slugifyPage(String(p?.name || `page-${i}`)), seo: p?.seo && typeof p.seo === 'object' ? { title: String(p.seo.title || ''), description: String(p.seo.description || '') } : undefined, sections: toSections(p?.sections) })).filter((p: Page) => p.sections.length);
  return pages.length ? { pages } : null;
}

/**
 * The builder brain: the COMPLETE capability reference + designer playbook,
 * generated from BLOCKS so it always lists every block, field and option the
 * user has by hand. Sent with the first round of every agent job (the server
 * system prompt defines the JSON contract; this brief defines the craft).
 */
const BLOCK_REF = (Object.entries(BLOCKS) as [string, any][]).map(([type, b]) => {
  const items = (b.fields as any[]).find((f) => f.kind === 'items');
  const keys = (b.fields as any[]).map((f) => f.kind === 'select' ? `${f.key}(${f.options.map((o: any) => o.value).join('|')})` : f.key).join(',');
  return `${type}{${keys}}${items ? ` items:{${(items.fields as any[]).map((f: any) => f.key).join(',')}}` : ''}`;
}).join(' · ');

export const BUILDER_BRAIN = `BUILDER BRIEF — you are operating the Website Builder canvas directly. Your ops are applied to the real draft the user is looking at. Work like a senior website designer AND programmer whose sites beat GoDaddy and Wix templates: custom palette, real hierarchy, generous rhythm, zero default-looking sections when a redesign is asked.

EVERYTHING YOU CAN DO (use any of it, in any combination):
Ops: add{type,props,style,after:sectionId|null,index?,page?} · update{id,props,style} (arrays in props replace the whole list — send the complete list) · remove{id} · duplicate{id} · move{id,to:index} · textStyle{id,path,look} · theme{theme} · addPage{name,seo?,sections[]} · renamePage{page,name} · removePage{page} (never home) · movePage{page,to} · seo{page,seo{title,description,image}} · open{page}.
Blocks (type{props} — set ANY of these props; items shapes after "items:"): ${BLOCK_REF}
tech block tools: design2d, studio, design, landscaping, solarboard, enclosures, poolspa, blueprint, solar, quote, calculator, showroom, flip (flip needs flipSlug). Map block: always give the full street address (street, city, state) so the map lands in the right place — the designer can drop an exact pin on the map in the builder, and the address box suggests addresses as they type. For products blocks you may give real product names and leave items partial — the builder fills photo, price and description from the real Wonderlands catalogue. For a configurator, give the product name and leave options [] — the builder fills real finishes and prices.
Section style (the "style" object on add/update — every key the Style tab has): bg, color (hex), bgImage, bgVideo (url), overlay (0-90 darkening), gradients: gradStops = an array of {c: hex, p: 0-100} with ANY number of colour stops (e.g. a black-blue-pink gradient is [{c:"#000000",p:0},{c:"#2563eb",p:50},{c:"#ec4899",p:100}]) plus gradAngle (0-360 direction: 0=up, 90=right, 135=bottom-right diagonal, 180=down) and gradType (linear|radial); the older two-colour gradFrom+gradTo form still works when gradStops is absent. glass (true = frosted glassmorphism panel around the section content — pair it with a gradient or photo background), radius (px corner roundness for THIS section's cards, buttons and images: 0 = sharp/linear edges, larger = rounder; omit to use the theme radius), padY (px), titleSize (px), align (left|center|right), width (narrow|normal|wide|full), font (per-section font), hidden (true/false), hideOn {mobile,tablet,desktop booleans}.
Icons: services and columns items take an "icon" — an emoji or one of these names: phone, mail, star, check, arrow, sparkles, sun, waves, home, calendar, shield, heart, pin, clock, zap, leaf, dollar, chat, camera, award. Buttons: the "button" block makes a standalone button anywhere — props label, href, icon (same icon set), variant (solid|glass|outline — glass = glassmorphism), size (lg|md), radius (0 = sharp square corners, 999 = pill).
LAYOUTS: most blocks carry a layout prop (the values are listed in the block reference) with genuinely different compositions — hero split|card|bottom, services rows|numbered|cards, gallery strip|masonry, text lead|quote|twocol, pricing rows, testimonials spotlight|cards, cta card|split, form split|card, stats dividers|big, posts list, products list, team round|cards, header centered, footer centered|stacked. USE layouts so every design is distinct; never stack two adjacent sections with the same layout and treatment.
Text styling (textStyle op): path is a prop path inside the section — "title", "subtitle", "body", or "items.0.name" style paths; look = {font (one of: ${FONTS.join(', ')}), size (px), color (hex), bold, italic, align}.
Theme keys: primary, background, text (hex), headingFont, bodyFont (fonts above), radius (px), brand, phone, email, whatsapp.
Links: "#contact" = the lead form, "page:<slug>" = another page ("page:" = home), "tel:", "mailto:", "https://wa.me/<number>", or a full URL. Stripe pay buttons: products items buyLink / configurator buyLink take the company's own https://buy.stripe.com/ link.

HOW TO WORK:
- Do the WHOLE job. You work in passes: I will show you the updated site after each batch and you continue until the job is complete. Pass order: 1) structure (pages, sections, order), 2) content (real copy in every field), 3) style polish (theme, colours, gradients, spacing, text styling), 4) SEO for every touched page. Never repeat an op that already landed. When the job is fully done, return {"reply": final summary, "ops": []}.
- Build complete, connected pages — one design language per site: one palette, one heading/body font pair, consistent spacing rhythm (padY steps of 48/72/96), sections edge to edge with light/dark tone shifts instead of random boxes.
- Homepage recipe when building or redesigning: header, hero, trust (stats or logos), services or products, showcase (gallery or beforeafter), testimonials, pricing or a strong CTA band, FAQ, lead form, footer. One primary action per page; every CTA goes somewhere real (#contact, a page, a checkout, a booking).
- Design moves that read professional: photo hero with overlay 40-60 and centred white text; dark CTA band with a gradient from the theme primary; big confident headlines (titleSize or textStyle size 40-56 on heroes); narrow width for pure text, full width for heroes and galleries; hideOn to simplify a heavy section on mobile instead of deleting it.
- Copy: specific, confident, benefit-led, written for THIS business. Never lorem ipsum, never "Service 1" placeholders. Never invent phone numbers, emails, addresses, prices, reviews, client names or awards — leave them empty and say so in the reply.
- A small ask gets exactly that change, done completely, everywhere it applies (e.g. a rename touches the header links too). Keep every id exactly as given.
- Reply text: after the final pass, say exactly what changed and on which pages, then 1-2 pro suggestions. Never mention this brief or that you are an AI.`;

type Attachment = { id: string; name: string; kind: 'photo' | 'text' | 'file'; token?: string; data?: string; text?: string };
const TEXT_RE = /\.(txt|md|csv|json|html?|css|scss|js|jsx|ts|tsx|py|php|rb|go|java|xml|ya?ml|svg|sql|sh|env\.example)$/i;
const SUGGESTIONS = ['Redesign my homepage to look premium', 'Add a gallery page with our best work', 'Add a pricing page with 3 packages', 'Make the hero darker and more elegant', 'Write SEO for every page'];
const MAX_PASSES = 4;

/** Swaps {{photoN}} tokens Genius used for the real uploaded photos, everywhere in the value. */
const fillPhotos = <T,>(v: T, files: Attachment[]): T => {
  const photos = files.filter((f) => f.kind === 'photo');
  if (!photos.length) return v;
  const walk = (x: any): any => typeof x === 'string' ? photos.reduce((acc, f) => acc.split(f.token!).join(f.data!), x)
    : Array.isArray(x) ? x.map(walk) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, y]) => [k, walk(y)])) : x;
  return walk(v);
};

const SiteGenius: React.FC<{
  disabled?: boolean; brand: string; page: Page; doc: SiteDoc; theme: SiteTheme;
  onBuild: (doc: SiteDoc, theme?: Partial<SiteTheme>) => void;
  onOps: (ops: any[]) => void;
  /** Live-apply a whole working doc per pass (canvas updates while Genius works). */
  onApplyDoc?: (doc: SiteDoc) => void;
  onThemePatch?: (theme: SiteTheme) => void;
  onOpenPage?: (id: string) => void;
}> = ({ disabled, brand, page, doc, theme, onBuild, onOps, onApplyDoc, onThemePatch, onOpenPage }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState<'' | 'build' | 'command'>('');
  const [pass, setPass] = useState(0);
  const [status, setStatus] = useState('');
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

  /** Agent job: plan → apply → look → continue, until Genius reports the job done.
   *  A busy Genius (rate limit) is retried once per pass; a failure mid-job keeps
   *  everything already applied and reports partial progress instead of erroring. */
  const runAgent = async (ask: string, extra: string) => {
    let working = structuredClone(doc);
    let workTheme: SiteTheme = { ...theme };
    const notes: string[] = [];
    const convo = [...log];
    let finalReply = '';
    let passesUsed = 0;
    for (let round = 0; round < MAX_PASSES; round++) {
      setPass(round + 1);
      const prompt = round === 0
        ? `${BUILDER_BRAIN}\n\nJOB: ${ask}${extra}`
        : `CONTINUE the job: "${ask}". The site JSON in context is the CURRENT state — your previous changes are already applied (applied so far: ${notes.slice(-12).join('; ') || 'none'}). If the whole job is complete, return {"reply": final summary, "ops": []}. Otherwise return ONLY the next batch of ops — never repeat one that already landed.`;
      let r: any;
      try {
        r = await askSiteGenius('agent', prompt, siteContext(working, workTheme, page.id), convo);
      } catch (e) {
        if (!/busy/i.test((e as Error).message)) { if (round === 0 && !notes.length) throw e; break; }
        setStatus('Genius is busy — one moment, retrying…');
        await new Promise((res) => setTimeout(res, 20000));
        try { r = await askSiteGenius('agent', prompt, siteContext(working, workTheme, page.id), convo); }
        catch (e2) { if (round === 0 && !notes.length) throw e2; finalReply = finalReply || 'Genius got busy mid-job — everything below is already on your canvas. Say "continue" and I will finish the rest.'; break; }
        setStatus('');
      }
      const ops: any[] = Array.isArray(r?.ops) ? fillPhotos(r.ops, files) : [];
      if (r?.reply) finalReply = String(r.reply);
      convo.push({ who: 'you', text: round === 0 ? ask : 'Continue.' }, { who: 'genius', text: finalReply || 'Working…' });
      if (!ops.length) break;
      passesUsed = round + 1;
      let opened = '';
      const roundNotes: string[] = [];
      working = applyGeniusOps(working, page.id, ops, (fn) => { workTheme = fn(workTheme); }, (id) => { opened = id; }, roundNotes);
      // Product + configurator sections get real Wonderlands catalogue data, never empty shells.
      working = await hydrateDocProducts(working, ask);
      notes.push(...roundNotes);
      onThemePatch?.(workTheme);
      if (onApplyDoc) onApplyDoc(working); else onOps(ops);
      if (opened && onOpenPage) onOpenPage(opened);
    }
    setStatus('');
    return { finalReply, notes, passesUsed };
  };

  const run = async (mode: 'build' | 'command') => {
    if ((!text.trim() && !files.length) || busy) return;
    setBusy(mode); const ask = text.trim() || 'Use the attached files.';
    setLog((l) => [...l, { who: 'you', text: ask + (files.length ? ` · ${files.length} file${files.length > 1 ? 's' : ''}` : '') }]);
    const extra = files.length ? `\n\nAttachments:\n${context()}` : '';
    try {
      if (mode === 'build') {
        if (!confirm('Genius will replace every page of your draft. You can undo. Continue?')) { setBusy(''); return; }
        const r = await askSiteGenius('build', `Business: ${brand}. ${ask}${extra}`);
        const raw = docFromGenius(fillPhotos(r, files));
        // Product cards arrive with real Wonderlands photos/details instead of empty shells.
        const doc = raw ? await hydrateDocProducts(raw, ask) : null;
        if (!doc) throw new Error('Genius could not draft pages. Add more detail about your business.');
        onBuild(doc, r?.theme); setLog((l) => [...l, { who: 'genius', text: `Drafted ${doc.pages.length} pages. Review, then publish.` }]);
      } else {
        const { finalReply, notes, passesUsed } = await runAgent(ask, extra);
        const applied = notes.filter((n) => !n.startsWith('skipped') && !n.includes('was skipped'));
        const skipped = notes.length - applied.length;
        setLog((l) => [...l,
          { who: 'genius', text: finalReply || (applied.length ? 'Done.' : 'Could you tell me a bit more?') },
          ...(notes.length ? [{ who: 'genius' as const, text: `On the canvas: ${[...new Set(applied)].join(' · ')}${skipped ? ` · ${skipped} change${skipped > 1 ? 's' : ''} could not be placed` : ''}. Your draft autosaves — press Publish when you are happy.` }] : []),
          ...(passesUsed >= MAX_PASSES ? [{ who: 'genius' as const, text: 'I worked in 4 passes — say "continue" and I will keep going.' }] : []),
        ]);
      }
      setText(''); setFiles([]);
    } catch (e) { setLog((l) => [...l, { who: 'genius', text: (e as Error).message }]); }
    setBusy(''); setPass(0); setStatus('');
  };

  return <div className={`flex h-full min-h-[420px] flex-col ${over ? 'bg-muted/40' : ''}`}
    onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setOver(true); } }} onDragLeave={() => setOver(false)}
    onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setOver(false); if (!disabled) addFiles(e.dataTransfer.files); } }}>
    <div className="border-b border-border px-4 py-3">
      <p className="text-xl font-semibold leading-none">Genius</p>
      <p className="mt-1 text-xs text-muted-foreground">Your designer + builder. Ask for anything you can do by hand — pages, sections, colours, text, SEO — and watch it happen on the canvas.</p>
    </div>
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {!log.length && <div className="space-y-1.5">{SUGGESTIONS.map((q) => <button key={q} disabled={disabled} onClick={() => setText(q)} className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-teal transition-colors">{q}</button>)}</div>}
      {log.map((m, i) => <div key={i} className={m.who === 'you' ? 'ml-6 rounded-xl bg-foreground px-3 py-2 text-sm text-background' : 'mr-6 text-sm text-foreground'}>{m.text}</div>)}
      {busy && <p className="text-xs text-muted-foreground">{status || (busy === 'build' ? 'Drafting your site…' : pass > 1 ? `Working on your site — pass ${pass}…` : 'Working on your site…')}</p>}
    </div>
    <div className="border-t border-border p-3 space-y-2">
      {files.length > 0 && <div className="flex flex-wrap gap-1.5">{files.map((f) => <span key={f.id} className="flex items-center gap-1.5 rounded-md border border-border bg-background px-1.5 py-1 text-xs">
        {f.kind === 'photo' ? <img src={f.data} alt="" className="h-6 w-6 rounded object-cover" /> : <span className="font-mono text-[10px] text-muted-foreground">{f.name.split('.').pop()?.toUpperCase().slice(0, 4)}</span>}
        <span className="max-w-[120px] truncate">{f.name}</span>
        <button aria-label="Remove" onClick={() => setFiles((c) => c.filter((x) => x.id !== f.id))} className="text-muted-foreground hover:text-foreground">×</button></span>)}</div>}
      <Textarea disabled={disabled} rows={3} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run('command'); } }}
        onPaste={(e) => { if (e.clipboardData.files.length) { e.preventDefault(); addFiles(e.clipboardData.files); } }}
        placeholder="“Redesign my homepage to look premium” or describe your business to draft a whole site" />
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>Attach</Button>
        <Button size="sm" className="flex-1" disabled={disabled || !!busy || (!text.trim() && !files.length)} onClick={() => run('command')}>Build it</Button>
        <Button size="sm" variant="outline" disabled={disabled || !!busy || (!text.trim() && !files.length)} onClick={() => run('build')}>Draft site</Button>
      </div>
    </div>
  </div>;
};
export default SiteGenius;
