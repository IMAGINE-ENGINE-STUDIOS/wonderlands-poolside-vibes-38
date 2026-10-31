/**
 * SiteRenderer — draws one page of a company site from the builder document.
 * Used by the editor canvas (editable=true wraps each section for selection)
 * and by the public site page. Colors/fonts come from the company's own theme
 * (user content), so inline styles are intentional here.
 */
import React, { useState } from 'react';
import SiteConfigurator from './SiteConfigurator';
import SiteMap from './SiteMap';
import type { Page, Section, SiteTheme } from '@/lib/siteBuilder/model';
import { TECH_TOOLS, loadFonts, resolveLink } from '@/lib/siteBuilder/model';

export interface LeadInput { name: string; email: string; phone: string; message: string }
const hideCls = (h?: { mobile?: boolean; tablet?: boolean; desktop?: boolean }) => [h?.mobile && 'max-sm:hidden', h?.tablet && 'sm:max-lg:hidden', h?.desktop && 'lg:hidden'].filter(Boolean).join(' ') || undefined;
/** Per-text look set with the on-canvas text editor (section.props.__text[path]). */
export interface TextLook { font?: string; size?: number; color?: string; bold?: boolean; italic?: boolean; align?: 'left' | 'center' | 'right' }
const loaded = new Set<string>();
const loadFont = (f?: string) => { if (!f || loaded.has(f) || typeof document === 'undefined') return; loaded.add(f); const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@400;700&display=swap`; document.head.appendChild(l); };
export const textStyle = (t?: TextLook): React.CSSProperties => { if (!t) return {}; loadFont(t.font); return { ...(t.font ? { fontFamily: `'${t.font}'` } : {}), ...(t.size ? { fontSize: t.size } : {}), ...(t.color ? { color: t.color } : {}), ...(t.bold ? { fontWeight: 700 } : {}), ...(t.italic ? { fontStyle: 'italic' } : {}), ...(t.align ? { textAlign: t.align } : {}) }; };
const Faq: React.FC<{ items: any[]; H: React.CSSProperties }> = ({ items, H }) => <div style={{ textAlign: 'left', maxWidth: 820, margin: '0 auto' }}>{items.map((f, i) => <details key={i} style={{ borderBottom: '1px solid rgba(0,0,0,.12)', padding: '18px 0' }}><summary style={{ ...H, fontSize: 22, cursor: 'pointer' }}>{f.q}</summary><p style={{ marginTop: 10, opacity: .8, whiteSpace: 'pre-line' }}>{f.a}</p></details>)}</div>;
const BeforeAfter: React.FC<{ p: any; r: number }> = ({ p, r }) => { const [x, setX] = useState(50); return <div style={{ position: 'relative', height: p.height || 480, borderRadius: r, overflow: 'hidden', background: 'rgba(0,0,0,.06)' }}>{p.after && <img src={p.after} alt="After" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}{p.before && <img src={p.before} alt="Before" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: `inset(0 ${100 - x}% 0 0)` }} />}<div style={{ position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 3, background: '#fff' }} /><input aria-label="Compare" type="range" min={0} max={100} value={x} onChange={e => setX(+e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize' }} /></div>; };

interface Props {
  page: Page; theme: SiteTheme;
  onLead?: (lead: LeadInput) => Promise<boolean>;
  wrap?: (s: Section, node: React.ReactNode) => React.ReactNode;
  /** Turns a page slug into a URL ('' = home). Editor passes nothing (links inert). */
  pageHref?: (slug: string) => string;
  /** Editor canvas device (public pages use CSS breakpoints instead). */
  device?: 'desktop' | 'tablet' | 'mobile';
  /** Editor only: the designer dropped/moved the pin on a map section. Never passed on public pages. */
  onMapPin?: (sectionId: string, lat: number, lng: number) => void;
}

const W = { narrow: 760, normal: 1120, wide: 1360, full: 99999 } as const;

const videoEmbed = (u: string) => {
  const yt = u.match(/(?:youtu\.be\/|v=)([\w-]{6,})/); if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = u.match(/vimeo\.com\/(\d+)/); if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
};

const LeadForm: React.FC<{ p: any; theme: SiteTheme; onLead?: Props['onLead'] }> = ({ p, theme, onLead }) => {
  const [v, setV] = useState({ name: '', email: '', phone: '', message: '' });
  const [ex, setEx] = useState<Record<string, string>>({});
  const [hp, setHp] = useState('');
  const extra: any[] = p.extra || [];
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const inp = { borderRadius: theme.radius / 2, border: '1px solid rgba(0,0,0,.15)', padding: '12px 14px', width: '100%', background: '#fff', color: '#0a0a0a' } as React.CSSProperties;
  if (state === 'sent') return <p style={{ fontSize: 18 }}>{p.thanks || "Thank you — we'll be in touch shortly."}</p>;
  return (
    <form className="grid gap-3 max-w-xl mx-auto text-left" onSubmit={async e => {
      e.preventDefault(); if (!onLead || hp) return; if (!v.name.trim() || (!v.email.trim() && !v.phone.trim()) || extra.some(q => q.required === 'yes' && !ex[q.label]?.trim())) { setState('error'); return; }
      setState('sending'); const answers = extra.filter(q => ex[q.label]).map(q => `${q.label}: ${ex[q.label]}`).join('\n');
      const ok = await onLead({ ...v, message: [v.message, answers].filter(Boolean).join('\n\n') }); setState(ok ? 'sent' : 'error');
      if (ok && p.redirect && typeof window !== 'undefined' && /^(https:|\/|#)/.test(p.redirect)) window.location.href = p.redirect;
    }}>
      <input style={inp} placeholder="Name" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} maxLength={120} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input style={inp} type="email" placeholder="Email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} maxLength={200} />
        <input style={inp} placeholder="Phone" value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} maxLength={40} />
      </div>
      {extra.map((q, i) => q.type === 'select' ? <select key={i} style={inp} value={ex[q.label] ?? ''} onChange={e => setEx({ ...ex, [q.label]: e.target.value })}><option value="">{q.label}{q.required === 'yes' ? ' *' : ''}</option>{String(q.options || '').split(',').map((o: string) => o.trim()).filter(Boolean).map((o: string) => <option key={o}>{o}</option>)}</select>
        : <input key={i} style={inp} type={q.type === 'date' ? 'date' : 'text'} placeholder={`${q.label}${q.required === 'yes' ? ' *' : ''}`} value={ex[q.label] ?? ''} onChange={e => setEx({ ...ex, [q.label]: e.target.value })} maxLength={300} />)}
      <input aria-hidden tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      <textarea style={{ ...inp, minHeight: 110 }} placeholder="Tell us about your project" value={v.message} onChange={e => setV({ ...v, message: e.target.value })} maxLength={2000} />
      {state === 'error' && <p style={{ fontSize: 13 }}>Please add your name, an email or phone, and the required answers.</p>}
      <button disabled={!onLead || state === 'sending'} style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '14px 20px', fontWeight: 600 }}>{state === 'sending' ? 'Sending…' : p.buttonLabel || 'Send'}</button>
    </form>
  );
};

const SiteRenderer: React.FC<Props> = ({ page, theme, onLead, wrap, pageHref, device, onMapPin }) => {
  loadFonts(theme);
  const L = (h?: string) => resolveLink(h, pageHref ?? (() => '#')) || undefined;
  const ext = (h?: string) => h && /^https?:/.test(h) ? { target: '_blank', rel: 'noreferrer' } : {};
  const linked = (h: string | undefined, node: React.ReactNode) => h ? <a href={L(h)} {...ext(h)} style={{ display: 'block' }}>{node}</a> : node;
  const H: React.CSSProperties = { fontFamily: `'${theme.headingFont}', serif`, lineHeight: 1.05, letterSpacing: '-0.01em' };
  const btn = (label: string, href: string, ghost = false) => label ? <a href={L(href) || '#'} {...ext(href)} style={{ background: ghost ? 'transparent' : theme.primary, color: ghost ? 'inherit' : '#fff', border: ghost ? '1px solid currentColor' : 0, borderRadius: theme.radius, padding: '14px 26px', fontWeight: 600, display: 'inline-block', margin: '4px 6px' }}>{label}</a> : null;
  const img = (src: string, alt: string, style?: React.CSSProperties) => src ? <img src={src} alt={alt} loading="lazy" decoding="async" style={{ width: '100%', objectFit: 'cover', borderRadius: theme.radius, ...style }} /> : <div style={{ background: 'rgba(0,0,0,.06)', borderRadius: theme.radius, ...style }} />;

  const body = (s: Section) => {
    const p = s.props; const ts = s.style.titleSize;
    // T(path, base): tags editable text (double-click in the editor) and applies its own font/size/colour.
    const T = (path: string, base?: React.CSSProperties) => ({ 'data-edit': path, style: { ...base, ...textStyle(p.__text?.[path]) } });
    const title = (t: string, size = 44) => t ? <h2 {...T('title', { ...H, fontSize: ts || size, marginBottom: 20 })}>{t}</h2> : null;
    switch (s.type) {
      case 'hero': { const eb = p.eyebrow && <p {...T('eyebrow', { letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 12, opacity: .85 })}>{p.eyebrow}</p>;
        const h1 = <h1 {...T('title', { ...H, fontSize: ts || 'clamp(40px,7vw,88px)', margin: '16px 0' })}>{p.title}</h1>;
        const sub = p.subtitle && <p {...T('subtitle', { fontSize: 19, opacity: .9, maxWidth: 640, margin: s.style.align === 'center' ? '0 auto 28px' : '0 0 28px' })}>{p.subtitle}</p>;
        const btns = <div>{btn(p.ctaLabel, p.ctaHref)}{btn(p.cta2Label, p.cta2Href, true)}</div>;
        if (p.layout === 'split') return <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]" style={{ minHeight: p.minHeight || 560 }}>
          <div style={{ textAlign: 'left' }}>{eb}{h1}{p.subtitle && <p {...T('subtitle', { fontSize: 19, opacity: .9, maxWidth: 560, margin: '0 0 28px' })}>{p.subtitle}</p>}{btns}</div>
          <div>{p.image ? <img src={p.image} alt="" style={{ width: '100%', height: Math.min(560, (p.minHeight || 560) * 0.82), objectFit: 'cover', borderRadius: theme.radius * 1.5 }} /> : <div style={{ height: 420, borderRadius: theme.radius * 1.5, background: 'rgba(127,127,127,.15)' }} />}</div></div>;
        if (p.layout === 'card') return <div style={{ minHeight: p.minHeight || 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,.13)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.28)', borderRadius: theme.radius * 1.6, padding: '48px 44px', maxWidth: 760, textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,.25)' }}>{eb}{h1}{sub}{btns}</div></div>;
        if (p.layout === 'bottom') return <div style={{ minHeight: p.minHeight || 660, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'left', paddingBottom: 12 }}>
          {eb}{h1}{p.subtitle && <p {...T('subtitle', { fontSize: 19, opacity: .92, maxWidth: 620, margin: '0 0 28px' })}>{p.subtitle}</p>}{btns}</div>;
        return <div style={{ minHeight: p.minHeight || 560, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{eb}{h1}{sub}{btns}</div>; }
      case 'text': { const body = String(p.body || '');
        if (p.layout === 'lead') return <>{title(p.title)}<p {...T('body', { whiteSpace: 'pre-line', fontSize: 21, lineHeight: 1.8 })}>{body.slice(0, 1) && <span style={{ ...H, float: 'left', fontSize: '4.4em', lineHeight: .78, paddingRight: 14, paddingTop: 6, color: theme.primary }}>{body.slice(0, 1)}</span>}{body.slice(1)}</p></>;
        if (p.layout === 'quote') return <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto' }}><p style={{ ...H, fontSize: 64, color: theme.primary, lineHeight: .6, marginBottom: 18 }}>“</p><p {...T('body', { ...H, whiteSpace: 'pre-line', fontSize: 30, fontStyle: 'italic', lineHeight: 1.45 })}>{body}</p>{p.title && <p {...T('title', { marginTop: 22, fontSize: 13, letterSpacing: '.28em', textTransform: 'uppercase', opacity: .7 })}>{p.title}</p>}</div>;
        if (p.layout === 'twocol') return <>{title(p.title)}<p {...T('body', { whiteSpace: 'pre-line', fontSize: 17, lineHeight: 1.75, columnCount: 2, columnGap: 44 })} className="max-lg:[column-count:1]">{body}</p></>;
        return <>{title(p.title)}<p {...T('body', { whiteSpace: 'pre-line', fontSize: 18, lineHeight: 1.7 })}>{p.body}</p></>; }
      case 'image': { if (p.layout === 'framed') return <div style={{ background: '#fff', padding: 14, borderRadius: theme.radius, border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 24px 48px rgba(0,0,0,.14)' }}>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480, borderRadius: Math.max(4, theme.radius - 6) }))}{p.caption && <p {...T('caption', { marginTop: 12, fontSize: 14, color: '#0a0a0a', opacity: .65 })}>{p.caption}</p>}</div>;
        if (p.layout === 'overlay') return <div style={{ position: 'relative', borderRadius: theme.radius, overflow: 'hidden' }}>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480, borderRadius: 0 }))}{p.caption && <p {...T('caption', { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '36px 22px 16px', fontSize: 15, color: '#fff', background: 'linear-gradient(transparent, rgba(0,0,0,.72))' })}>{p.caption}</p>}</div>;
        return <>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480 }))}{p.caption && <p {...T('caption', { marginTop: 10, fontSize: 14, opacity: .7 })}>{p.caption}</p>}</>; }
      case 'gallery': { const fig = (g: any, i: number, extra?: React.CSSProperties) => <figure key={i} style={extra}>{linked(g.link, img(g.src, g.caption || 'Photo', { aspectRatio: '4/3' }))}{g.caption && <figcaption {...T(`items.${i}.caption`, { fontSize: 13, marginTop: 6, opacity: .7 })}>{g.caption}</figcaption>}</figure>;
        if (p.layout === 'strip') return <>{title(p.title)}<div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>{(p.items || []).map((g: any, i: number) => <figure key={i} style={{ minWidth: 330, flexShrink: 0 }}>{linked(g.link, img(g.src, g.caption || 'Photo', { aspectRatio: '16/10' }))}{g.caption && <figcaption {...T(`items.${i}.caption`, { fontSize: 13, marginTop: 6, opacity: .7 })}>{g.caption}</figcaption>}</figure>)}</div></>;
        if (p.layout === 'masonry') return <>{title(p.title)}<div className="columns-2 md:columns-3" style={{ columnGap: 16 }}>{(p.items || []).map((g: any, i: number) => <figure key={i} style={{ breakInside: 'avoid', marginBottom: 16 }}>{linked(g.link, img(g.src, g.caption || 'Photo', { height: 'auto', aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '4/3' : '1/1' }))}{g.caption && <figcaption {...T(`items.${i}.caption`, { fontSize: 13, marginTop: 6, opacity: .7 })}>{g.caption}</figcaption>}</figure>)}</div></>;
        return <>{title(p.title)}<div className="grid gap-4 grid-cols-2 md:grid-cols-3">{(p.items || []).map((g: any, i: number) => fig(g, i))}</div></>; }
      case 'video': { const e = p.url ? videoEmbed(p.url) : null; return <>{title(p.title)}{p.url ? (e ? <iframe src={e} title={p.title || 'Video'} style={{ width: '100%', aspectRatio: '16/9', borderRadius: theme.radius }} allowFullScreen loading="lazy" /> : <video src={p.url} controls style={{ width: '100%', borderRadius: theme.radius }} />) : <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,.06)', borderRadius: theme.radius }} />}</>; }
      case 'services': { const items = p.items || [];
        if (p.layout === 'cards') return <>{title(p.title)}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((c: any, i: number) => <div key={i} style={{ textAlign: 'left', background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 24 }}>{linked(c.link, <>{c.image && img(c.image, c.title, { aspectRatio: '4/3', marginBottom: 16 })}<h3 {...T(`items.${i}.title`, { ...H, fontSize: 25 })}>{c.title}</h3></>)}<p {...T(`items.${i}.body`, { opacity: .8, marginTop: 8, whiteSpace: 'pre-line' })}>{c.body}</p></div>)}</div></>;
        if (p.layout === 'rows') return <>{title(p.title)}<div className="grid gap-12">{items.map((c: any, i: number) => <div key={i} className={`flex flex-col gap-6 md:items-center ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'}`} style={{ textAlign: 'left' }}>
          <div style={{ flex: '1 1 46%' }}>{c.image ? img(c.image, c.title, { aspectRatio: '4/3' }) : <div style={{ aspectRatio: '4/3', borderRadius: theme.radius, background: 'rgba(127,127,127,.12)' }} />}</div>
          <div style={{ flex: '1 1 54%' }}>{linked(c.link, <h3 {...T(`items.${i}.title`, { ...H, fontSize: 30 })}>{c.title}</h3>)}<p {...T(`items.${i}.body`, { opacity: .82, marginTop: 10, fontSize: 17, lineHeight: 1.65, whiteSpace: 'pre-line' })}>{c.body}</p></div></div>)}</div></>;
        if (p.layout === 'numbered') return <>{title(p.title)}<div>{items.map((c: any, i: number) => <div key={i} className="flex gap-6" style={{ textAlign: 'left', padding: '26px 0', borderTop: i ? '1px solid rgba(127,127,127,.2)' : undefined }}>
          <span style={{ ...H, fontSize: 44, color: theme.primary, lineHeight: 1, minWidth: 74 }}>{String(i + 1).padStart(2, '0')}</span>
          <div>{linked(c.link, <h3 {...T(`items.${i}.title`, { ...H, fontSize: 27 })}>{c.title}</h3>)}<p {...T(`items.${i}.body`, { opacity: .8, marginTop: 6, maxWidth: 640, whiteSpace: 'pre-line' })}>{c.body}</p></div></div>)}</div></>;
        return <>{title(p.title)}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((c: any, i: number) => <div key={i} style={{ textAlign: 'left' }}>{linked(c.link, <>{c.image && img(c.image, c.title, { aspectRatio: '4/3', marginBottom: 14 })}<h3 {...T(`items.${i}.title`, { ...H, fontSize: 26 })}>{c.title}</h3></>)}<p {...T(`items.${i}.body`, { opacity: .8, marginTop: 8, whiteSpace: 'pre-line' })}>{c.body}</p></div>)}</div></>; }
      case 'products': { const cols = Number(p.columns) || 3;
        if (p.layout === 'list') return <>{title(p.title)}<div className="grid gap-5">{(p.items || []).map((c: any, i: number) => <article key={i} className="flex flex-col sm:flex-row gap-5" style={{ border: '1px solid rgba(0,0,0,.1)', borderRadius: theme.radius, overflow: 'hidden', background: '#fff', color: '#0a0a0a', textAlign: 'left', position: 'relative' }}>
          {c.badge && <span style={{ position: 'absolute', top: 12, left: 12, background: theme.primary, color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 999, zIndex: 1 }}>{c.badge}</span>}
          <div style={{ flex: '0 0 240px' }}>{c.image ? img(c.image, c.name, { aspectRatio: '4/3', borderRadius: 0, height: '100%' }) : <div style={{ height: '100%', minHeight: 150, background: 'rgba(0,0,0,.05)' }} />}</div>
          <div style={{ padding: '18px 18px 18px 0', flex: 1 }} className="max-sm:!pl-[18px]"><h3 {...T(`items.${i}.name`, { ...H, fontSize: 24 })}>{c.name}</h3>{c.price && <p {...T(`items.${i}.price`, { fontWeight: 700, marginTop: 6 })}>{c.price}</p>}{c.description && <p {...T(`items.${i}.description`, { opacity: .75, fontSize: 14, marginTop: 8 })}>{c.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 14 }}>{c.buttonLabel && <a href={L(c.buttonHref || '#contact')} {...ext(c.buttonHref)} style={{ color: theme.primary, fontWeight: 600 }}>{c.buttonLabel} →</a>}
            {c.buyLink && /^https:\/\//.test(c.buyLink) && <a href={c.buyLink} target="_blank" rel="noreferrer" style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>{c.buyLabel || 'Buy now'}</a>}</div></div></article>)}</div></>;
        return <>{title(p.title)}<style>{`@media(min-width:1024px){#s-${s.id} .pgrid{grid-template-columns:repeat(${cols},minmax(0,1fr))}}`}</style>
        <div className="pgrid grid gap-6 grid-cols-1 sm:grid-cols-2">{(p.items || []).map((c: any, i: number) => <article key={i} style={{ border: '1px solid rgba(0,0,0,.1)', borderRadius: theme.radius, overflow: 'hidden', background: '#fff', color: '#0a0a0a', textAlign: 'left', position: 'relative' }}>
          {c.badge && <span style={{ position: 'absolute', top: 12, left: 12, background: theme.primary, color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 999 }}>{c.badge}</span>}
          {c.image ? img(c.image, c.name, { aspectRatio: '4/3', borderRadius: 0 }) : <div style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.05)', border: '1px dashed rgba(0,0,0,.18)', fontSize: 13, opacity: .6 }}>{wrap ? 'Add a product photo in Section → items' : ''}</div>}
          <div style={{ padding: 18 }}><h3 {...T(`items.${i}.name`, { ...H, fontSize: 24 })}>{c.name}</h3>{c.price && <p {...T(`items.${i}.price`, { fontWeight: 700, marginTop: 6 })}>{c.price}</p>}{c.description && <p {...T(`items.${i}.description`, { opacity: .75, fontSize: 14, marginTop: 8 })}>{c.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 14 }}>{c.buttonLabel && <a href={L(c.buttonHref || '#contact')} {...ext(c.buttonHref)} style={{ color: theme.primary, fontWeight: 600 }}>{c.buttonLabel} →</a>}
            {c.buyLink && /^https:\/\//.test(c.buyLink) && <a href={c.buyLink} target="_blank" rel="noreferrer" style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>{c.buyLabel || 'Buy now'}</a>}</div></div></article>)}</div></>; }
      case 'configurator': return <>{title(p.title)}<SiteConfigurator p={p} theme={theme} T={T} H={H} href={L} /></>;
      case 'testimonials': { const items = p.items || []; const q = (t: any, i: number, size: number) => <blockquote key={i} style={{ textAlign: 'left' }}><p {...T(`items.${i}.quote`, { ...H, fontSize: size, fontStyle: 'italic' })}>“{t.quote}”</p><footer {...T(`items.${i}.name`, { marginTop: 10, opacity: .7 })}>— {t.name}</footer></blockquote>;
        if (p.layout === 'cards') return <>{title(p.title)}<div className="grid gap-6 md:grid-cols-2">{items.map((t: any, i: number) => <div key={i} style={{ background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 26 }}>{q(t, i, 21)}</div>)}</div></>;
        if (p.layout === 'spotlight' && items.length) return <>{title(p.title)}<div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}><blockquote><p {...T('items.0.quote', { ...H, fontSize: 34, fontStyle: 'italic', lineHeight: 1.35 })}>“{items[0].quote}”</p><footer {...T('items.0.name', { marginTop: 14, opacity: .7 })}>— {items[0].name}</footer></blockquote></div>{items.length > 1 && <div className="grid gap-6 md:grid-cols-2" style={{ marginTop: 44 }}>{items.slice(1).map((t: any, j: number) => q(t, j + 1, 20))}</div>}</>;
        return <>{title(p.title)}<div className="grid gap-6 md:grid-cols-2">{items.map((t: any, i: number) => q(t, i, 24))}</div></>; }
      case 'cta': { if (p.layout === 'card') return <div style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius * 1.6, padding: '52px 44px', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,.22)', maxWidth: 980, margin: '0 auto' }}>
          {p.title && <h2 {...T('title', { ...H, fontSize: ts || 44, marginBottom: 16, color: '#fff' })}>{p.title}</h2>}<p {...T('body', { fontSize: 18, opacity: .92, marginBottom: 28 })}>{p.body}</p>
          {p.ctaLabel && <a href={L(p.ctaHref) || '#'} {...ext(p.ctaHref)} style={{ background: '#fff', color: theme.primary, borderRadius: theme.radius, padding: '14px 28px', fontWeight: 700, display: 'inline-block' }}>{p.ctaLabel}</a>}</div>;
        if (p.layout === 'split') return <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between" style={{ textAlign: 'left' }}>
          <div style={{ maxWidth: 660 }}>{title(p.title, 42)}<p {...T('body', { fontSize: 18, opacity: .85 })}>{p.body}</p></div>{btn(p.ctaLabel, p.ctaHref)}</div>;
        return <>{title(p.title, 48)}<p {...T('body', { fontSize: 18, opacity: .85, marginBottom: 26 })}>{p.body}</p>{btn(p.ctaLabel, p.ctaHref)}</>; }
      case 'form': { if (p.layout === 'split') return <div id={p.anchor || 'contact'} className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div style={{ textAlign: 'left' }}>{title(p.title, 40)}<p {...T('body', { opacity: .82, fontSize: 17, lineHeight: 1.65 })}>{p.body}</p>{(theme.phone || theme.email) && <p style={{ marginTop: 18, opacity: .75, fontSize: 15 }}>{[theme.phone, theme.email].filter(Boolean).join(' · ')}</p>}</div>
          <div><LeadForm p={p} theme={theme} onLead={onLead} /></div></div>;
        if (p.layout === 'card') return <div id={p.anchor || 'contact'}>{title(p.title)}<p {...T('body', { opacity: .8, marginBottom: 24 })}>{p.body}</p>
          <div style={{ background: '#fff', color: '#0a0a0a', borderRadius: theme.radius * 1.4, padding: '34px 30px', maxWidth: 660, margin: '0 auto', boxShadow: '0 30px 60px rgba(0,0,0,.18)', border: '1px solid rgba(0,0,0,.06)' }}><LeadForm p={p} theme={theme} onLead={onLead} /></div></div>;
        return <div id={p.anchor || 'contact'}>{title(p.title)}<p {...T('body', { opacity: .8, marginBottom: 24 })}>{p.body}</p><LeadForm p={p} theme={theme} onLead={onLead} /></div>; }
      case 'tech': { const t = TECH_TOOLS.find(x => x.value === p.tool) ?? TECH_TOOLS[0]; const src = t.value === 'flip' ? (p.flipSlug ? `/flip/${p.flipSlug}` : '') : t.path;
        return <>{title(p.title)}{src ? <iframe src={src} title={p.title || t.label} loading="lazy" style={{ width: '100%', height: p.height || 760, border: 0, borderRadius: theme.radius, background: '#fff' }} allow="fullscreen; clipboard-write" /> : <p style={{ opacity: .6 }}>Pick a FLIP book for this block.</p>}</>; }
      case 'header': { const brand = <a href={L('page:')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...H, fontSize: 24 }}>{theme.logo && <img src={theme.logo} alt={theme.brand || 'Logo'} style={{ height: 40, width: 'auto' }} />}{theme.brand}</a>;
        const links = (p.links || []).map((l: any, i: number) => <a key={i} href={L(l.href)} {...ext(l.href)} style={{ fontSize: 15, fontWeight: 500 }}>{l.label}</a>);
        const ctaB = p.ctaLabel && <a href={L(p.ctaHref) || '#'} style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '10px 18px', fontWeight: 600, fontSize: 14 }}>{p.ctaLabel}</a>;
        if (p.layout === 'centered') return <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>{brand}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 24 }}>{links}{ctaB}</div></nav>;
        return <nav style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>{brand}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 22 }}>{links}{ctaB}</div></nav>; }
      case 'footer': { const linkRow = <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>{(p.links || []).map((l: any, i: number) => <a key={i} href={L(l.href)} {...ext(l.href)} style={{ opacity: .8 }}>{l.label}</a>)}</div>;
        const copy = <p style={{ opacity: .5, fontSize: 12 }}>© {new Date().getFullYear()} {theme.brand}</p>;
        if (p.layout === 'centered') return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, fontSize: 14, textAlign: 'center' }}><p style={{ ...H, fontSize: 26 }}>{theme.brand}</p>{p.text && <p {...T('text', { opacity: .7, whiteSpace: 'pre-line', maxWidth: 520 })}>{p.text}</p>}{linkRow}<p style={{ opacity: .6 }}>{[theme.phone, theme.email].filter(Boolean).join(' · ')}</p>{copy}</div>;
        if (p.layout === 'stacked') return <div style={{ fontSize: 14 }}><p style={{ ...H, fontSize: 'clamp(44px,8vw,96px)', lineHeight: 1, letterSpacing: '-0.02em' }}>{theme.brand}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18, marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(127,127,127,.25)' }}><div>{p.text && <p {...T('text', { opacity: .7, whiteSpace: 'pre-line', maxWidth: 420 })}>{p.text}</p>}<p style={{ opacity: .6, marginTop: 6 }}>{[theme.phone, theme.email].filter(Boolean).join(' · ')}</p></div>{linkRow}</div>
          <div style={{ marginTop: 16 }}>{copy}</div></div>;
        return <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, fontSize: 14 }}><div><p style={{ ...H, fontSize: 22 }}>{theme.brand}</p>{p.text && <p {...T('text', { opacity: .7, marginTop: 8, whiteSpace: 'pre-line', maxWidth: 420 })}>{p.text}</p>}<p style={{ opacity: .6, marginTop: 8 }}>{[theme.phone, theme.email].filter(Boolean).join(' · ')}</p></div>
          {linkRow}<p style={{ width: '100%', opacity: .5, fontSize: 12 }}>© {new Date().getFullYear()} {theme.brand}</p></div>; }
      case 'columns': { const cols = Number(p.columns) || 3; const card = p.layout === 'cards'; return <>{title(p.title)}<style>{`@media(min-width:1024px){#s-${s.id} .cgrid{grid-template-columns:repeat(${cols},minmax(0,1fr))}}`}</style><div className="cgrid grid gap-6 sm:grid-cols-2">{(p.items || []).map((c: any, i: number) => <div key={i} style={card ? { textAlign: 'left', background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 24 } : { textAlign: 'left' }}>{c.image && img(c.image, c.title, { aspectRatio: '4/3', marginBottom: 12 })}<h3 {...T(`items.${i}.title`, { ...H, fontSize: 24 })}>{c.title}</h3><p {...T(`items.${i}.body`, { opacity: .8, marginTop: 8, whiteSpace: 'pre-line' })}>{c.body}</p></div>)}</div></>; }
      case 'faq': { if (p.layout === 'twocol' || p.layout === 'cards') return <>{title(p.title)}<div className="grid gap-6 md:grid-cols-2">{(p.items || []).map((c: any, i: number) => <div key={i} style={p.layout === 'cards' ? { textAlign: 'left', background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 24 } : { textAlign: 'left' }}><h3 {...T(`items.${i}.q`, { ...H, fontSize: 21, marginBottom: 8 })}>{c.q}</h3><p {...T(`items.${i}.a`, { opacity: .82, lineHeight: 1.6, whiteSpace: 'pre-line' })}>{c.a}</p></div>)}</div></>;
        return <>{title(p.title)}<Faq items={p.items || []} H={H} /></>; }
      case 'pricing': { if (p.layout === 'rows') return <>{title(p.title)}<div>{(p.items || []).map((c: any, i: number) => { const f = c.featured === 'yes'; return <div key={i} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" style={{ textAlign: 'left', padding: '24px 4px', borderTop: i ? '1px solid rgba(127,127,127,.22)' : undefined }}>
          <div style={{ maxWidth: 620 }}><h3 {...T(`items.${i}.name`, { ...H, fontSize: 25, color: f ? theme.primary : undefined })}>{c.name}{f && <span style={{ marginLeft: 10, fontSize: 11, background: theme.primary, color: '#fff', borderRadius: 999, padding: '3px 9px', verticalAlign: 'middle' }}>POPULAR</span>}</h3>
          <p style={{ opacity: .75, marginTop: 6, fontSize: 15 }}>{String(c.features || '').split('\n').filter(Boolean).join(' · ')}</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>{c.price && <p style={{ fontSize: 30, fontWeight: 700 }}>{c.price}<span style={{ fontSize: 13, opacity: .6, fontWeight: 400 }}>{c.period ? ` / ${c.period}` : ''}</span></p>}{c.ctaLabel && <a href={L(c.ctaHref) || '#'} {...ext(c.ctaHref)} style={{ background: f ? theme.primary : 'transparent', color: f ? '#fff' : theme.primary, border: `1px solid ${theme.primary}`, borderRadius: theme.radius, padding: '10px 18px', fontWeight: 600 }}>{c.ctaLabel}</a>}</div></div>; })}</div></>;
        return <>{title(p.title)}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{(p.items || []).map((c: any, i: number) => { const f = c.featured === 'yes'; return <div key={i} style={{ textAlign: 'left', border: f ? `2px solid ${theme.primary}` : '1px solid rgba(0,0,0,.12)', borderRadius: theme.radius, padding: 26, background: '#fff', color: '#0a0a0a' }}><h3 {...T(`items.${i}.name`, { ...H, fontSize: 26 })}>{c.name}</h3>{c.price && <p style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>{c.price}<span style={{ fontSize: 14, opacity: .6, fontWeight: 400 }}>{c.period ? ` / ${c.period}` : ''}</span></p>}<ul style={{ margin: '16px 0', display: 'grid', gap: 8 }}>{String(c.features || '').split('\n').filter(Boolean).map((x: string, k: number) => <li key={k} style={{ fontSize: 15 }}>— {x}</li>)}</ul>{c.ctaLabel && <a href={L(c.ctaHref) || '#'} {...ext(c.ctaHref)} style={{ display: 'inline-block', background: f ? theme.primary : 'transparent', color: f ? '#fff' : theme.primary, border: `1px solid ${theme.primary}`, borderRadius: theme.radius, padding: '10px 18px', fontWeight: 600 }}>{c.ctaLabel}</a>}</div>; })}</div></>; }
      case 'team': { const card = p.layout === 'cards'; const round = p.layout === 'round'; return <>{title(p.title)}<div className="grid gap-6 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i} style={card ? { background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 20 } : undefined}>{img(c.photo, c.name, { aspectRatio: '1/1', marginBottom: 12, borderRadius: round ? '50%' : theme.radius, ...(round ? { maxWidth: 150, margin: '0 auto 12px' } : {}) })}<h3 {...T(`items.${i}.name`, { ...H, fontSize: 22 })}>{c.name}</h3><p {...T(`items.${i}.role`, { opacity: .7, fontSize: 14 })}>{c.role}</p>{c.bio && <p style={{ opacity: .8, fontSize: 14, marginTop: 6 }}>{c.bio}</p>}</div>)}</div></>; }
      case 'stats': { if (p.layout === 'dividers') return <>{title(p.title)}<div className="grid gap-6 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i} style={{ textAlign: 'left', borderLeft: `3px solid ${theme.primary}`, paddingLeft: 18 }}><p {...T(`items.${i}.value`, { ...H, fontSize: 48 })}>{c.value || '—'}</p><p {...T(`items.${i}.label`, { opacity: .75, marginTop: 4 })}>{c.label}</p></div>)}</div></>;
        if (p.layout === 'big') return <>{title(p.title)}<div className="grid gap-8 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i}><p {...T(`items.${i}.value`, { ...H, fontSize: 76, color: theme.primary, lineHeight: 1 })}>{c.value || '—'}</p><p {...T(`items.${i}.label`, { opacity: .75, marginTop: 8, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 12 })}>{c.label}</p></div>)}</div></>;
        return <>{title(p.title)}<div className="grid gap-6 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i}><p {...T(`items.${i}.value`, { ...H, fontSize: 52, color: theme.primary })}>{c.value || '—'}</p><p {...T(`items.${i}.label`, { opacity: .75 })}>{c.label}</p></div>)}</div></>; }
      case 'logos': { if (p.layout === 'grid') return <>{title(p.title, 28)}<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{(p.items || []).map((c: any, i: number) => <div key={i} style={{ border: '1px solid rgba(127,127,127,.18)', borderRadius: theme.radius, padding: '26px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 96 }}>{linked(c.link, c.logo ? <img src={c.logo} alt={c.name} loading="lazy" style={{ height: 42, width: 'auto', opacity: .85 }} /> : <span style={{ ...H, fontSize: 21, opacity: .7 }}>{c.name}</span>)}</div>)}</div></>;
        return <>{title(p.title, 28)}<div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, alignItems: 'center', justifyContent: 'center' }}>{(p.items || []).map((c: any, i: number) => linked(c.link, c.logo ? <img key={i} src={c.logo} alt={c.name} loading="lazy" style={{ height: 44, width: 'auto', opacity: .85 }} /> : <span key={i} style={{ ...H, fontSize: 22, opacity: .7 }}>{c.name}</span>))}</div></>; }
      case 'posts': { if (p.layout === 'list') return <>{title(p.title)}<div className="grid gap-8">{(p.items || []).map((c: any, i: number) => <article key={i} className="flex flex-col sm:flex-row gap-6" style={{ textAlign: 'left' }}>
          <div style={{ flex: '0 0 260px' }}>{linked(c.link, img(c.image, c.title, { aspectRatio: '16/10' }))}</div>
          <div>{linked(c.link, <h3 {...T(`items.${i}.title`, { ...H, fontSize: 26 })}>{c.title}</h3>)}{c.date && <p style={{ fontSize: 12, opacity: .6, marginTop: 5 }}>{c.date}</p>}<p {...T(`items.${i}.excerpt`, { opacity: .8, marginTop: 8, lineHeight: 1.6 })}>{c.excerpt}</p></div></article>)}</div></>;
        return <>{title(p.title)}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{(p.items || []).map((c: any, i: number) => <article key={i} style={{ textAlign: 'left' }}>{linked(c.link, <>{img(c.image, c.title, { aspectRatio: '16/10', marginBottom: 12 })}<h3 {...T(`items.${i}.title`, { ...H, fontSize: 24 })}>{c.title}</h3></>)}{c.date && <p style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{c.date}</p>}<p {...T(`items.${i}.excerpt`, { opacity: .8, marginTop: 8 })}>{c.excerpt}</p></article>)}</div></>; }
      case 'beforeafter': return <>{title(p.title)}<BeforeAfter p={p} r={theme.radius} /></>;
      case 'map': { const hasPin = typeof p.lat === 'number' && typeof p.lng === 'number';
        // Builder (wrap set): the live map opens in the page — click/drag sets the pin.
        // Published: the same map with a static pin when one is set; address-only sites keep the classic embed.
        if (wrap || hasPin) return <>{title(p.title)}<SiteMap address={p.address} lat={hasPin ? p.lat : null} lng={hasPin ? p.lng : null} zoom={p.zoom} height={p.height} radius={theme.radius} color={theme.primary} editable={!!wrap} onPin={wrap ? (la, ln) => onMapPin?.(s.id, la, ln) : undefined} /></>;
        return <>{title(p.title)}{p.address ? <iframe title={p.title || 'Map'} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.address)}&output=embed`} style={{ width: '100%', height: p.height || 380, border: 0, borderRadius: theme.radius }} /> : <p style={{ opacity: .6 }}>Add an address to show the map.</p>}</>; }
      case 'booking': return <>{title(p.title)}{p.body && <p {...T('body', { opacity: .8, marginBottom: 20 })}>{p.body}</p>}{/^https:\/\//.test(p.url || '') ? <iframe title={p.title || 'Booking'} loading="lazy" src={p.url} style={{ width: '100%', height: p.height || 700, border: 0, borderRadius: theme.radius, background: '#fff' }} /> : <p style={{ opacity: .6 }}>Add your booking link (https://…).</p>}</>;
      case 'embed': return <>{title(p.title)}{/^https:\/\//.test(p.url || '') ? <iframe title={p.title || 'Embedded page'} loading="lazy" src={p.url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style={{ width: '100%', height: p.height || 500, border: 0, borderRadius: theme.radius }} /> : <p style={{ opacity: .6 }}>Add a page link (https://…).</p>}</>;
      case 'spacer': return <div style={{ height: p.height || 64 }} />;
    }
  };

  return (
    <div style={{ background: theme.background, color: theme.text, fontFamily: `'${theme.bodyFont}', sans-serif` }}>
      {page.sections.filter(s => (!s.style.hidden || wrap) && !(device && s.style.hideOn?.[device] && !wrap)).map(s => {
        const st = { ...s.style, bgImage: s.style.bgImage || (s.type === 'hero' && s.props.layout !== 'split' ? s.props.image : '') }; const full = st.width === 'full';
        const node = (
          <section id={`s-${s.id}`} key={s.id} className={device ? undefined : hideCls(s.style.hideOn)} style={{ ...(s.type === 'header' && s.props.sticky !== 'no' && !wrap ? { position: 'sticky', top: 0, zIndex: 40 } : { position: 'relative' }), background: st.gradFrom && st.gradTo ? (st.gradType === 'radial' ? `radial-gradient(circle, ${st.gradFrom}, ${st.gradTo})` : `linear-gradient(${st.gradAngle ?? 135}deg, ${st.gradFrom}, ${st.gradTo})`) : st.bg || undefined, color: st.color || undefined, textAlign: st.align || 'left', padding: `${st.padY ?? (s.type === 'spacer' ? 0 : s.type === 'header' ? 16 : s.type === 'footer' ? 48 : 80)}px 24px`, ...(s.type === 'header' && !st.bg && !st.gradFrom ? { background: theme.background, borderBottom: '1px solid rgba(0,0,0,.08)' } : {}), overflow: 'hidden', fontFamily: st.font ? `'${st.font}'` : undefined, opacity: st.hidden || (device && st.hideOn?.[device]) ? .35 : 1 }}>
            {st.bgImage && <img src={st.bgImage} alt="" aria-hidden loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            {st.bgVideo && <video src={st.bgVideo} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            {(st.bgImage || st.bgVideo) && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${(st.overlay ?? 30) / 100})` }} />}
            <div style={{ position: 'relative', maxWidth: full ? 1280 : W[st.width || 'normal'], margin: '0 auto' }}>{body(s)}</div>
          </section>);
        return wrap ? <React.Fragment key={s.id}>{wrap(s, node)}</React.Fragment> : node;
      })}
    </div>
  );
};

export default SiteRenderer;
