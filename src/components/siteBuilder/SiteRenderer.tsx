/**
 * SiteRenderer — draws one page of a company site from the builder document.
 * Used by the editor canvas (editable=true wraps each section for selection)
 * and by the public site page. Colors/fonts come from the company's own theme
 * (user content), so inline styles are intentional here.
 */
import React, { useState } from 'react';
import type { Page, Section, SiteTheme } from '@/lib/siteBuilder/model';
import { TECH_TOOLS, loadFonts, resolveLink } from '@/lib/siteBuilder/model';

export interface LeadInput { name: string; email: string; phone: string; message: string }

interface Props {
  page: Page; theme: SiteTheme;
  onLead?: (lead: LeadInput) => Promise<boolean>;
  wrap?: (s: Section, node: React.ReactNode) => React.ReactNode;
  /** Turns a page slug into a URL ('' = home). Editor passes nothing (links inert). */
  pageHref?: (slug: string) => string;
}

const W = { narrow: 760, normal: 1120, wide: 1360, full: 99999 } as const;

const videoEmbed = (u: string) => {
  const yt = u.match(/(?:youtu\.be\/|v=)([\w-]{6,})/); if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = u.match(/vimeo\.com\/(\d+)/); if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
};

const LeadForm: React.FC<{ p: any; theme: SiteTheme; onLead?: Props['onLead'] }> = ({ p, theme, onLead }) => {
  const [v, setV] = useState({ name: '', email: '', phone: '', message: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const inp = { borderRadius: theme.radius / 2, border: '1px solid rgba(0,0,0,.15)', padding: '12px 14px', width: '100%', background: '#fff', color: '#0a0a0a' } as React.CSSProperties;
  if (state === 'sent') return <p style={{ fontSize: 18 }}>Thank you — we'll be in touch shortly.</p>;
  return (
    <form className="grid gap-3 max-w-xl mx-auto text-left" onSubmit={async e => {
      e.preventDefault(); if (!onLead) return; if (!v.name.trim() || (!v.email.trim() && !v.phone.trim())) { setState('error'); return; }
      setState('sending'); setState((await onLead(v)) ? 'sent' : 'error');
    }}>
      <input style={inp} placeholder="Name" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} maxLength={120} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input style={inp} type="email" placeholder="Email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} maxLength={200} />
        <input style={inp} placeholder="Phone" value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} maxLength={40} />
      </div>
      <textarea style={{ ...inp, minHeight: 110 }} placeholder="Tell us about your project" value={v.message} onChange={e => setV({ ...v, message: e.target.value })} maxLength={2000} />
      {state === 'error' && <p style={{ fontSize: 13 }}>Please add your name and an email or phone.</p>}
      <button disabled={!onLead || state === 'sending'} style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '14px 20px', fontWeight: 600 }}>{state === 'sending' ? 'Sending…' : p.buttonLabel || 'Send'}</button>
    </form>
  );
};

const SiteRenderer: React.FC<Props> = ({ page, theme, onLead, wrap, pageHref }) => {
  loadFonts(theme);
  const L = (h?: string) => resolveLink(h, pageHref ?? (() => '#')) || undefined;
  const ext = (h?: string) => h && /^https?:/.test(h) ? { target: '_blank', rel: 'noreferrer' } : {};
  const linked = (h: string | undefined, node: React.ReactNode) => h ? <a href={L(h)} {...ext(h)} style={{ display: 'block' }}>{node}</a> : node;
  const H: React.CSSProperties = { fontFamily: `'${theme.headingFont}', serif`, lineHeight: 1.05, letterSpacing: '-0.01em' };
  const btn = (label: string, href: string, ghost = false) => label ? <a href={L(href) || '#'} {...ext(href)} style={{ background: ghost ? 'transparent' : theme.primary, color: ghost ? 'inherit' : '#fff', border: ghost ? '1px solid currentColor' : 0, borderRadius: theme.radius, padding: '14px 26px', fontWeight: 600, display: 'inline-block', margin: '4px 6px' }}>{label}</a> : null;
  const img = (src: string, alt: string, style?: React.CSSProperties) => src ? <img src={src} alt={alt} loading="lazy" decoding="async" style={{ width: '100%', objectFit: 'cover', borderRadius: theme.radius, ...style }} /> : <div style={{ background: 'rgba(0,0,0,.06)', borderRadius: theme.radius, ...style }} />;

  const body = (s: Section) => {
    const p = s.props; const ts = s.style.titleSize;
    const title = (t: string, size = 44) => t ? <h2 style={{ ...H, fontSize: ts || size, marginBottom: 20 }}>{t}</h2> : null;
    switch (s.type) {
      case 'hero': return <div style={{ minHeight: p.minHeight || 560, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {p.eyebrow && <p style={{ letterSpacing: '.3em', textTransform: 'uppercase', fontSize: 12, opacity: .85 }}>{p.eyebrow}</p>}
        <h1 style={{ ...H, fontSize: ts || 'clamp(40px,7vw,88px)', margin: '16px 0' }}>{p.title}</h1>
        {p.subtitle && <p style={{ fontSize: 19, opacity: .9, maxWidth: 640, margin: s.style.align === 'center' ? '0 auto 28px' : '0 0 28px' }}>{p.subtitle}</p>}
        <div>{btn(p.ctaLabel, p.ctaHref)}{btn(p.cta2Label, p.cta2Href, true)}</div></div>;
      case 'text': return <>{title(p.title)}<p style={{ whiteSpace: 'pre-line', fontSize: 18, lineHeight: 1.7 }}>{p.body}</p></>;
      case 'image': return <>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480 }))}{p.caption && <p style={{ marginTop: 10, fontSize: 14, opacity: .7 }}>{p.caption}</p>}</>;
      case 'gallery': return <>{title(p.title)}<div className="grid gap-4 grid-cols-2 md:grid-cols-3">{(p.items || []).map((g: any, i: number) => <figure key={i}>{linked(g.link, img(g.src, g.caption || 'Photo', { aspectRatio: '4/3' }))}{g.caption && <figcaption style={{ fontSize: 13, marginTop: 6, opacity: .7 }}>{g.caption}</figcaption>}</figure>)}</div></>;
      case 'video': { const e = p.url ? videoEmbed(p.url) : null; return <>{title(p.title)}{p.url ? (e ? <iframe src={e} title={p.title || 'Video'} style={{ width: '100%', aspectRatio: '16/9', borderRadius: theme.radius }} allowFullScreen loading="lazy" /> : <video src={p.url} controls style={{ width: '100%', borderRadius: theme.radius }} />) : <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,.06)', borderRadius: theme.radius }} />}</>; }
      case 'services': return <>{title(p.title)}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{(p.items || []).map((c: any, i: number) => <div key={i} style={{ textAlign: 'left' }}>{linked(c.link, <>{c.image && img(c.image, c.title, { aspectRatio: '4/3', marginBottom: 14 })}<h3 style={{ ...H, fontSize: 26 }}>{c.title}</h3></>)}<p style={{ opacity: .8, marginTop: 8, whiteSpace: 'pre-line' }}>{c.body}</p></div>)}</div></>;
      case 'products': { const cols = Number(p.columns) || 3; return <>{title(p.title)}<style>{`@media(min-width:1024px){#s-${s.id} .pgrid{grid-template-columns:repeat(${cols},minmax(0,1fr))}}`}</style>
        <div className="pgrid grid gap-6 grid-cols-1 sm:grid-cols-2">{(p.items || []).map((c: any, i: number) => <article key={i} style={{ border: '1px solid rgba(0,0,0,.1)', borderRadius: theme.radius, overflow: 'hidden', background: '#fff', color: '#0a0a0a', textAlign: 'left', position: 'relative' }}>
          {c.badge && <span style={{ position: 'absolute', top: 12, left: 12, background: theme.primary, color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 999 }}>{c.badge}</span>}
          {img(c.image, c.name, { aspectRatio: '4/3', borderRadius: 0 })}
          <div style={{ padding: 18 }}><h3 style={{ ...H, fontSize: 24 }}>{c.name}</h3>{c.price && <p style={{ fontWeight: 700, marginTop: 6 }}>{c.price}</p>}{c.description && <p style={{ opacity: .75, fontSize: 14, marginTop: 8 }}>{c.description}</p>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginTop: 14 }}>{c.buttonLabel && <a href={L(c.buttonHref || '#contact')} {...ext(c.buttonHref)} style={{ color: theme.primary, fontWeight: 600 }}>{c.buttonLabel} →</a>}
            {c.buyLink && /^https:\/\//.test(c.buyLink) && <a href={c.buyLink} target="_blank" rel="noreferrer" style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>{c.buyLabel || 'Buy now'}</a>}</div></div></article>)}</div></>; }
      case 'testimonials': return <>{title(p.title)}<div className="grid gap-6 md:grid-cols-2">{(p.items || []).map((t: any, i: number) => <blockquote key={i} style={{ textAlign: 'left' }}><p style={{ ...H, fontSize: 24, fontStyle: 'italic' }}>“{t.quote}”</p><footer style={{ marginTop: 10, opacity: .7 }}>— {t.name}</footer></blockquote>)}</div></>;
      case 'cta': return <>{title(p.title, 48)}<p style={{ fontSize: 18, opacity: .85, marginBottom: 26 }}>{p.body}</p>{btn(p.ctaLabel, p.ctaHref)}</>;
      case 'form': return <div id={p.anchor || 'contact'}>{title(p.title)}<p style={{ opacity: .8, marginBottom: 24 }}>{p.body}</p><LeadForm p={p} theme={theme} onLead={onLead} /></div>;
      case 'tech': { const t = TECH_TOOLS.find(x => x.value === p.tool) ?? TECH_TOOLS[0]; const src = t.value === 'flip' ? (p.flipSlug ? `/flip/${p.flipSlug}` : '') : t.path;
        return <>{title(p.title)}{src ? <iframe src={src} title={p.title || t.label} loading="lazy" style={{ width: '100%', height: p.height || 760, border: 0, borderRadius: theme.radius, background: '#fff' }} allow="fullscreen; clipboard-write" /> : <p style={{ opacity: .6 }}>Pick a FLIP book for this block.</p>}</>; }
      case 'spacer': return <div style={{ height: p.height || 64 }} />;
    }
  };

  return (
    <div style={{ background: theme.background, color: theme.text, fontFamily: `'${theme.bodyFont}', sans-serif` }}>
      {page.sections.filter(s => !s.style.hidden || wrap).map(s => {
        const st = { ...s.style, bgImage: s.style.bgImage || (s.type === 'hero' ? s.props.image : '') }; const full = st.width === 'full';
        const node = (
          <section id={`s-${s.id}`} key={s.id} style={{ position: 'relative', background: st.gradFrom && st.gradTo ? (st.gradType === 'radial' ? `radial-gradient(circle, ${st.gradFrom}, ${st.gradTo})` : `linear-gradient(${st.gradAngle ?? 135}deg, ${st.gradFrom}, ${st.gradTo})`) : st.bg || undefined, color: st.color || undefined, textAlign: st.align || 'left', padding: `${st.padY ?? (s.type === 'spacer' ? 0 : 80)}px 24px`, overflow: 'hidden', fontFamily: st.font ? `'${st.font}'` : undefined, opacity: st.hidden ? .35 : 1 }}>
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
