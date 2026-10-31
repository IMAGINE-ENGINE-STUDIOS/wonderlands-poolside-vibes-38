/**
 * SiteRenderer — draws one page of a company site from the builder document.
 * Used by the editor canvas (editable=true wraps each section for selection)
 * and by the public site page. Colors/fonts come from the company's own theme
 * (user content), so inline styles are intentional here.
 */
import React, { useEffect, useRef, useState } from 'react';
import SiteConfigurator from './SiteConfigurator';
import SiteMap from './SiteMap';
import type { Page, Section, SiteTheme } from '@/lib/siteBuilder/model';
import { TECH_TOOLS, loadFonts, resolveLink } from '@/lib/siteBuilder/model';
import { appPath } from '@/lib/live/liveTypes';

export interface LeadInput { name: string; email: string; phone: string; message: string }
const hideCls = (h?: { mobile?: boolean; tablet?: boolean; desktop?: boolean }) => [h?.mobile && 'max-sm:hidden', h?.tablet && 'sm:max-lg:hidden', h?.desktop && 'lg:hidden'].filter(Boolean).join(' ') || undefined;
/** Per-text look set with the on-canvas text editor (section.props.__text[path]). */
export interface TextLook { font?: string; size?: number; color?: string; bold?: boolean; italic?: boolean; align?: 'left' | 'center' | 'right' }
const loaded = new Set<string>();
const loadFont = (f?: string) => { if (!f || loaded.has(f) || typeof document === 'undefined') return; loaded.add(f); const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@400;700&display=swap`; document.head.appendChild(l); };
export const textStyle = (t?: TextLook): React.CSSProperties => { if (!t) return {}; loadFont(t.font); return { ...(t.font ? { fontFamily: `'${t.font}'` } : {}), ...(t.size ? { fontSize: t.size } : {}), ...(t.color ? { color: t.color } : {}), ...(t.bold ? { fontWeight: 700 } : {}), ...(t.italic ? { fontStyle: 'italic' } : {}), ...(t.align ? { textAlign: t.align } : {}) }; };
const Faq: React.FC<{ items: any[]; H: React.CSSProperties }> = ({ items, H }) => <div style={{ textAlign: 'left', maxWidth: 820, margin: '0 auto' }}>{items.map((f, i) => <details key={i} style={{ borderBottom: '1px solid rgba(0,0,0,.12)', padding: '18px 0' }}><summary style={{ ...H, fontSize: 22, cursor: 'pointer' }}>{f.q}</summary><p style={{ marginTop: 10, opacity: .8, whiteSpace: 'pre-line' }}>{f.a}</p></details>)}</div>;
const BeforeAfter: React.FC<{ p: any; r: number }> = ({ p, r }) => { const [x, setX] = useState(50); return <div style={{ position: 'relative', height: p.height || 480, borderRadius: r, overflow: 'hidden', background: 'rgba(0,0,0,.06)' }}>{p.after && <img src={p.after} alt="After" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}{p.before && <img src={p.before} alt="Before" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', clipPath: `inset(0 ${100 - x}% 0 0)` }} />}<div style={{ position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 3, background: '#fff' }} /><input aria-label="Compare" type="range" min={0} max={100} value={x} onChange={e => setX(+e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize' }} /></div>; };

type TFn = (path: string, base?: React.CSSProperties) => Record<string, any>;

/* ---- Motion kit (batch 2): ONE shared approach for every animated layout —
 * IntersectionObserver for in-view triggers, CSS keyframes (injected once)
 * for marquees and auto-scrolls. Honours prefers-reduced-motion. ---- */
const ensureMotionCss = () => {
  if (typeof document === 'undefined' || document.getElementById('sb-motion-css')) return;
  const st = document.createElement('style'); st.id = 'sb-motion-css';
  st.textContent = '@keyframes sb-mq-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
    + '@keyframes sb-mq-y{from{transform:translateY(0)}to{transform:translateY(-50%)}}'
    + '.sb-mq{overflow:hidden}.sb-mq-track{display:flex;width:max-content;animation:sb-mq-x 30s linear infinite}'
    + '.sb-mq-col{display:flex;flex-direction:column;animation:sb-mq-y 44s linear infinite}'
    + '.sb-mq:hover .sb-mq-track,.sb-mq:hover .sb-mq-col{animation-play-state:paused}'
    + '.sb-logo-mq img{filter:grayscale(1);opacity:.75;transition:filter .3s,opacity .3s}'
    + '.sb-logo-mq:hover img{filter:none;opacity:1}'
    + '@media (max-width:767px){.sb-mq-col{animation:none}.sb-wall-col{max-height:none!important;mask-image:none!important;-webkit-mask-image:none!important}}'
    + '@media (prefers-reduced-motion: reduce){.sb-mq-track,.sb-mq-col{animation:none}}';
  document.head.appendChild(st);
};
const useInView = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null); const [inView, setInView] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el); return () => io.disconnect(); }, []);
  return { ref, inView };
};
/** Animates the number inside a stat value ("250+", "$1.5M", "98%") from zero when scrolled into view. Unparseable values render as-is. */
const CountUpText: React.FC<{ raw: string }> = ({ raw }) => {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [disp, setDisp] = useState(raw);
  useEffect(() => {
    if (!inView) return;
    const m = String(raw).match(/^(\D*?)([\d][\d,]*\.?\d*)(.*)$/s);
    if (!m) return;
    const pre = m[1], numS = m[2], suf = m[3]; const target = parseFloat(numS.replace(/,/g, ''));
    if (!Number.isFinite(target)) return;
    const dec = (numS.split('.')[1] || '').length; const comma = numS.includes(',');
    const fmt = (val: number) => { let s = dec ? val.toFixed(dec) : String(Math.round(val)); if (comma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return `${pre}${s}${suf}`; };
    setDisp(fmt(0));
    const t0 = performance.now(); const dur = 1500; let raf = 0;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setDisp(fmt(target * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, raw]);
  return <span ref={ref}>{disp}</span>;
};
/** FAQ accordion with motion: the + rotates into a × and the answer slides open (grid-rows transition). */
const FaqMotion: React.FC<{ items: any[]; H: React.CSSProperties; primary: string }> = ({ items, H, primary }) => {
  const [open, setOpen] = useState(0);
  return <div style={{ textAlign: 'left', maxWidth: 820, margin: '0 auto' }}>{items.map((f, i) => { const isOpen = open === i; return <div key={i} style={{ borderBottom: '1px solid rgba(127,127,127,.2)' }}>
    <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '18px 0', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}>
      <span style={{ ...H, fontSize: 22 }}>{f.q}</span>
      <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(127,127,127,.4)', display: 'grid', placeItems: 'center', fontSize: 18, lineHeight: 1, color: primary, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform .3s' }}>+</span></button>
    <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows .38s ease' }}><div style={{ overflow: 'hidden' }}><p style={{ paddingBottom: 18, opacity: .82, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{f.a}</p></div></div>
  </div>; })}</div>;
};

/* ---- Frames (batch 3): one shared frame kit — browser chrome and device
 * bezels — reused by the tech tool, embed and (via facade) video blocks. ---- */
const BrowserFrame: React.FC<{ label: string; radius: number; children: React.ReactNode }> = ({ label, radius, children }) => (
  <div style={{ border: '1px solid rgba(0,0,0,.16)', borderRadius: radius, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 48px rgba(0,0,0,.13)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#eef0f2', borderBottom: '1px solid rgba(0,0,0,.08)' }}>
      <span style={{ display: 'flex', gap: 6 }}>{['#ff5f57', '#febc2e', '#28c840'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}</span>
      <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#555', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 999, padding: '3px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ width: 51 }} />
    </div>{children}</div>
);
const DeviceFrame: React.FC<{ kind: 'tablet' | 'phone'; radius: number; children: React.ReactNode }> = ({ kind, radius, children }) => (
  <div style={{ background: '#101014', padding: kind === 'phone' ? 12 : 16, borderRadius: kind === 'phone' ? 38 : 24, maxWidth: kind === 'phone' ? 400 : 880, margin: '0 auto', boxShadow: '0 30px 60px rgba(0,0,0,.28)' }}>
    <div style={{ borderRadius: Math.max(6, radius), overflow: 'hidden', background: '#fff' }}>{children}</div></div>
);
const framed = (frame: string | undefined, label: string, radius: number, node: React.ReactNode) => frame === 'browser' ? <BrowserFrame label={label} radius={radius}>{node}</BrowserFrame>
  : frame === 'tablet' || frame === 'phone' ? <DeviceFrame kind={frame} radius={radius}>{node}</DeviceFrame> : node;
/** Click-to-load facade for embeds: poster first — the third-party page loads only when tapped (speed + privacy). */
const EmbedFacade: React.FC<{ poster: string; height: number; radius: number; label: string; children: React.ReactNode }> = ({ poster, height, radius, label, children }) => {
  const [on, setOn] = useState(false);
  if (on) return <>{children}</>;
  return <button type="button" onClick={() => setOn(true)} aria-label={`Load ${label}`} style={{ position: 'relative', display: 'block', width: '100%', height, border: 0, padding: 0, cursor: 'pointer', borderRadius: radius, overflow: 'hidden', background: '#0a0a0a' }}>
    <img src={poster} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .85 }} />
    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.25)' }}>
      <span style={{ background: '#fff', color: '#0a0a0a', borderRadius: 999, padding: '13px 26px', fontWeight: 700, fontSize: 15, boxShadow: '0 16px 32px rgba(0,0,0,.35)' }}>Open — {label}</span></span></button>;
};
/** Video block: identical to before without a poster; with one, a facade — the player loads only after the tap. */
const VideoBlock: React.FC<{ p: any; theme: SiteTheme }> = ({ p, theme }) => {
  const [play, setPlay] = useState(false);
  if (!p.url) return <div style={{ aspectRatio: '16/9', background: 'rgba(0,0,0,.06)', borderRadius: theme.radius }} />;
  const e = videoEmbed(p.url);
  if (p.poster && !play) return <button type="button" onClick={() => setPlay(true)} aria-label="Play video" style={{ position: 'relative', display: 'block', width: '100%', border: 0, padding: 0, cursor: 'pointer', borderRadius: theme.radius, overflow: 'hidden', background: '#000' }}>
    <img src={p.poster} alt={p.title || 'Video'} loading="lazy" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', opacity: .92 }} />
    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><span style={{ width: 76, height: 76, borderRadius: '50%', background: theme.primary, display: 'grid', placeItems: 'center', boxShadow: '0 18px 36px rgba(0,0,0,.35)' }}><span style={{ width: 0, height: 0, borderLeft: '20px solid #fff', borderTop: '12px solid transparent', borderBottom: '12px solid transparent', marginLeft: 5 }} /></span></span></button>;
  if (e) return <iframe src={play && p.poster ? `${e}${e.includes('?') ? '&' : '?'}autoplay=1` : e} title={p.title || 'Video'} style={{ width: '100%', aspectRatio: '16/9', border: 0, borderRadius: theme.radius }} allowFullScreen loading="lazy" allow="autoplay; fullscreen" />;
  return <video src={p.url} controls autoPlay={play && !!p.poster} style={{ width: '100%', borderRadius: theme.radius }} />;
};

/* ---- Pricing (batch 4): the cards/rows layouts, plus a Monthly/Yearly
 * switch that appears only when at least one package carries a yearly price.
 * Without yearly prices the rendering is exactly the previous one. ---- */
const PricingSection: React.FC<{ p: any; theme: SiteTheme; T: TFn; H: React.CSSProperties; L: (h?: string) => any; ext: (h?: string) => any; titleNode: React.ReactNode }> = ({ p, theme, T, H, L, ext, titleNode }) => {
  const items: any[] = p.items || [];
  const hasToggle = items.some(c => String(c.priceYearly || '').trim());
  const [yearly, setYearly] = useState(false);
  const priceOf = (c: any) => yearly && String(c.priceYearly || '').trim() ? c.priceYearly : c.price;
  const periodOf = (c: any) => yearly && String(c.priceYearly || '').trim() ? (c.periodYearly || 'year') : c.period;
  const toggle = hasToggle ? <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}><div style={{ display: 'inline-flex', background: 'rgba(127,127,127,.14)', borderRadius: 999, padding: 4 }}>{([['Monthly', false], ['Yearly', true]] as const).map(([label, val]) => <button key={label} type="button" onClick={() => setYearly(val)} style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '8px 20px', fontWeight: 600, fontSize: 14, background: yearly === val ? theme.primary : 'transparent', color: yearly === val ? '#fff' : 'inherit' }}>{label}</button>)}</div></div> : null;
  if (p.layout === 'rows') return <>{titleNode}{toggle}<div>{items.map((c: any, i: number) => { const f = c.featured === 'yes'; const price = priceOf(c); const period = periodOf(c); return <div key={i} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" style={{ textAlign: 'left', padding: '24px 4px', borderTop: i ? '1px solid rgba(127,127,127,.22)' : undefined }}>
    <div style={{ maxWidth: 620 }}><h3 {...T(`items.${i}.name`, { ...H, fontSize: 25, color: f ? theme.primary : undefined })}>{c.name}{f && <span style={{ marginLeft: 10, fontSize: 11, background: theme.primary, color: '#fff', borderRadius: 999, padding: '3px 9px', verticalAlign: 'middle' }}>POPULAR</span>}</h3>
    <p style={{ opacity: .75, marginTop: 6, fontSize: 15 }}>{String(c.features || '').split('\n').filter(Boolean).join(' · ')}</p></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>{price && <p style={{ fontSize: 30, fontWeight: 700 }}>{price}<span style={{ fontSize: 13, opacity: .6, fontWeight: 400 }}>{period ? ` / ${period}` : ''}</span></p>}{c.ctaLabel && <a href={L(c.ctaHref) || '#'} {...ext(c.ctaHref)} style={{ background: f ? theme.primary : 'transparent', color: f ? '#fff' : theme.primary, border: `1px solid ${theme.primary}`, borderRadius: theme.radius, padding: '10px 18px', fontWeight: 600 }}>{c.ctaLabel}</a>}</div></div>; })}</div></>;
  return <>{titleNode}{toggle}<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((c: any, i: number) => { const f = c.featured === 'yes'; const price = priceOf(c); const period = periodOf(c); return <div key={i} style={{ textAlign: 'left', border: f ? `2px solid ${theme.primary}` : '1px solid rgba(0,0,0,.12)', borderRadius: theme.radius, padding: 26, background: '#fff', color: '#0a0a0a' }}><h3 {...T(`items.${i}.name`, { ...H, fontSize: 26 })}>{c.name}</h3>{price && <p style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>{price}<span style={{ fontSize: 14, opacity: .6, fontWeight: 400 }}>{period ? ` / ${period}` : ''}</span></p>}<ul style={{ margin: '16px 0', display: 'grid', gap: 8 }}>{String(c.features || '').split('\n').filter(Boolean).map((x: string, k: number) => <li key={k} style={{ fontSize: 15 }}>— {x}</li>)}</ul>{c.ctaLabel && <a href={L(c.ctaHref) || '#'} {...ext(c.ctaHref)} style={{ display: 'inline-block', background: f ? theme.primary : 'transparent', color: f ? '#fff' : theme.primary, border: `1px solid ${theme.primary}`, borderRadius: theme.radius, padding: '10px 18px', fontWeight: 600 }}>{c.ctaLabel}</a>}</div>; })}</div></>;
};

/* ---- Galleries (batch 5): grid / strip / masonry as before, plus coverflow
 * and an opt-in lightbox (props.lightbox === 'yes', public pages only). ---- */
const Coverflow: React.FC<{ items: any[]; theme: SiteTheme; T: TFn }> = ({ items, theme, T }) => {
  const [act, setAct] = useState(0); const n = items.length;
  if (!n) return null;
  const cur = items[Math.min(act, n - 1)];
  const arrow: React.CSSProperties = { width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(127,127,127,.4)', background: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, flexShrink: 0 };
  return <div>
    <div style={{ position: 'relative', height: 320, perspective: 1100, overflow: 'hidden' }}>
      {items.map((g: any, i: number) => { let off = i - act; if (off > n / 2) off -= n; if (off < -n / 2) off += n; const abs = Math.abs(off); if (abs > 2) return null;
        return <button key={i} type="button" aria-label={g.caption || `Photo ${i + 1}`} onClick={() => setAct(i)} style={{ position: 'absolute', left: '50%', top: '50%', width: 'min(500px, 74%)', aspectRatio: '4/3', transform: `translate(-50%,-50%) translateX(${off * 60}%) rotateY(${-off * 42}deg) scale(${1 - abs * 0.16})`, zIndex: 10 - abs, transition: 'transform .5s cubic-bezier(.2,.7,.2,1)', border: 0, padding: 0, background: 'none', cursor: 'pointer', opacity: 1 - abs * 0.22 }}>
          {g.src ? <img src={g.src} alt={g.caption || 'Photo'} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: theme.radius, boxShadow: '0 30px 60px rgba(0,0,0,.35)', display: 'block' }} /> : <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: theme.radius, background: 'rgba(127,127,127,.18)' }} />}</button>; })}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 10 }}>
      <button type="button" aria-label="Previous photo" onClick={() => setAct((act - 1 + n) % n)} style={arrow}>‹</button>
      {cur.caption ? <p {...T(`items.${Math.min(act, n - 1)}.caption`, { fontSize: 14, opacity: .75, minWidth: 120, textAlign: 'center' })}>{cur.caption}</p> : <span style={{ fontSize: 13, opacity: .6 }}>{Math.min(act, n - 1) + 1} / {n}</span>}
      <button type="button" aria-label="Next photo" onClick={() => setAct((act + 1) % n)} style={arrow}>›</button>
    </div></div>;
};
const GalleryBlock: React.FC<{ p: any; theme: SiteTheme; T: TFn; titleNode: React.ReactNode; img: (src: string, alt: string, style?: React.CSSProperties) => React.ReactNode; linked: (h: string | undefined, node: React.ReactNode) => React.ReactNode; lbOn: boolean }> = ({ p, theme, T, titleNode, img, linked, lbOn }) => {
  const items: any[] = p.items || [];
  const [lb, setLb] = useState<number | null>(null);
  const lbOpen = lb !== null;
  useEffect(() => { if (!lbOpen) return; const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setLb(null); else if (e.key === 'ArrowRight') setLb(v => v === null ? v : (v + 1) % items.length); else if (e.key === 'ArrowLeft') setLb(v => v === null ? v : (v - 1 + items.length) % items.length); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [lbOpen, items.length]);
  const pic = (g: any, i: number, style: React.CSSProperties) => lbOn && g.src
    ? <span role="button" aria-label={g.caption || 'Enlarge photo'} onClick={() => setLb(i)} style={{ display: 'block', cursor: 'zoom-in' }}>{img(g.src, g.caption || 'Photo', style)}</span>
    : linked(g.link, img(g.src, g.caption || 'Photo', style));
  const cap = (g: any, i: number) => g.caption ? <figcaption {...T(`items.${i}.caption`, { fontSize: 13, marginTop: 6, opacity: .7 })}>{g.caption}</figcaption> : null;
  const navBtn: React.CSSProperties = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.12)', border: 0, color: '#fff', width: 44, height: 44, borderRadius: '50%', fontSize: 20, cursor: 'pointer' };
  const overlay = lb !== null && items[lb] ? <div role="dialog" aria-modal="true" onClick={() => setLb(null)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <button type="button" aria-label="Close" onClick={() => setLb(null)} style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 0, color: '#fff', fontSize: 30, cursor: 'pointer', lineHeight: 1 }}>×</button>
    {items.length > 1 && <><button type="button" aria-label="Previous photo" onClick={e => { e.stopPropagation(); setLb((lb - 1 + items.length) % items.length); }} style={{ ...navBtn, left: 14 }}>‹</button>
    <button type="button" aria-label="Next photo" onClick={e => { e.stopPropagation(); setLb((lb + 1) % items.length); }} style={{ ...navBtn, right: 14 }}>›</button></>}
    <img src={items[lb].src} alt={items[lb].caption || 'Photo'} onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: theme.radius }} />
    {items[lb].caption && <p style={{ color: '#fff', opacity: .85, marginTop: 14, fontSize: 15 }}>{items[lb].caption}</p>}
  </div> : null;
  if (p.layout === 'coverflow') return <>{titleNode}<Coverflow items={items} theme={theme} T={T} />{overlay}</>;
  if (p.layout === 'strip') return <>{titleNode}<div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>{items.map((g: any, i: number) => <figure key={i} style={{ minWidth: 330, flexShrink: 0 }}>{pic(g, i, { aspectRatio: '16/10' })}{cap(g, i)}</figure>)}</div>{overlay}</>;
  if (p.layout === 'masonry') return <>{titleNode}<div className="columns-2 md:columns-3" style={{ columnGap: 16 }}>{items.map((g: any, i: number) => <figure key={i} style={{ breakInside: 'avoid', marginBottom: 16 }}>{pic(g, i, { height: 'auto', aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '4/3' : '1/1' })}{cap(g, i)}</figure>)}</div>{overlay}</>;
  return <>{titleNode}<div className="grid gap-4 grid-cols-2 md:grid-cols-3">{items.map((g: any, i: number) => <figure key={i}>{pic(g, i, { aspectRatio: '4/3' })}{cap(g, i)}</figure>)}</div>{overlay}</>;
};
/** Parallax photo band: the photo is taller than the band and drifts against the scroll (rAF-throttled). */
const ParallaxImage: React.FC<{ p: any; theme: SiteTheme; T: TFn }> = ({ p, theme, T }) => {
  const ref = useRef<HTMLDivElement>(null); const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => { let raf = 0;
    const upd = () => { raf = 0; const el = ref.current, im = imgRef.current; if (!el || !im) return; const r = el.getBoundingClientRect(); const vh = window.innerHeight || 800; const prog = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)); im.style.transform = `translateY(${prog * -36}px)`; };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); }; }, []);
  const h = p.height || 480;
  return <div ref={ref} style={{ position: 'relative', height: h, borderRadius: theme.radius, overflow: 'hidden', background: 'rgba(0,0,0,.06)' }}>
    {p.src ? <img ref={imgRef} src={p.src} alt={p.caption || 'Image'} loading="lazy" style={{ position: 'absolute', left: 0, right: 0, top: -44, width: '100%', height: h + 88, objectFit: 'cover', willChange: 'transform' }} /> : null}
    {p.caption && <p {...T('caption', { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '36px 22px 16px', fontSize: 15, color: '#fff', background: 'linear-gradient(transparent, rgba(0,0,0,.72))', zIndex: 1 })}>{p.caption}</p>}</div>;
};
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
  /** Two-step layout: step 1 = contact details, step 2 = project questions + send, with a progress bar. */
  const two = p.layout === 'twostep';
  const [step, setStep] = useState(1);
  const [err1, setErr1] = useState(false);
  const inp = { borderRadius: theme.radius / 2, border: '1px solid rgba(0,0,0,.15)', padding: '12px 14px', width: '100%', background: '#fff', color: '#0a0a0a' } as React.CSSProperties;
  if (state === 'sent') return <p style={{ fontSize: 18 }}>{p.thanks || "Thank you — we'll be in touch shortly."}</p>;
  return (
    <form className="grid gap-3 max-w-xl mx-auto text-left" onSubmit={async e => {
      e.preventDefault(); if (!onLead || hp) return; if (!v.name.trim() || (!v.email.trim() && !v.phone.trim()) || extra.some(q => q.required === 'yes' && !ex[q.label]?.trim())) { setState('error'); return; }
      setState('sending'); const answers = extra.filter(q => ex[q.label]).map(q => `${q.label}: ${ex[q.label]}`).join('\n');
      const ok = await onLead({ ...v, message: [v.message, answers].filter(Boolean).join('\n\n') }); setState(ok ? 'sent' : 'error');
      if (ok && p.redirect && typeof window !== 'undefined' && /^(https:|\/|#)/.test(p.redirect)) window.location.href = p.redirect;
    }}>
      {two && <div style={{ marginBottom: 4 }}><div style={{ display: 'flex', gap: 6 }}>{[1, 2].map(n => <span key={n} style={{ flex: 1, height: 5, borderRadius: 99, background: step >= n ? theme.primary : 'rgba(127,127,127,.25)', transition: 'background .3s' }} />)}</div><p style={{ fontSize: 12, opacity: .65, marginTop: 8 }}>Step {step} of 2 — {step === 1 ? 'Your details' : 'Your project'}</p></div>}
      {(!two || step === 1) && <>
      <input style={inp} placeholder="Name" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} maxLength={120} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input style={inp} type="email" placeholder="Email" value={v.email} onChange={e => setV({ ...v, email: e.target.value })} maxLength={200} />
        <input style={inp} placeholder="Phone" value={v.phone} onChange={e => setV({ ...v, phone: e.target.value })} maxLength={40} />
      </div>
      {two && <>{err1 && <p style={{ fontSize: 13 }}>Please add your name and an email or phone to continue.</p>}<button type="button" onClick={() => { if (!v.name.trim() || (!v.email.trim() && !v.phone.trim())) { setErr1(true); return; } setErr1(false); setStep(2); }} style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '14px 20px', fontWeight: 600 }}>Continue</button></>}
      </>}
      {(!two || step === 2) && <>
      {extra.map((q, i) => q.type === 'select' ? <select key={i} style={inp} value={ex[q.label] ?? ''} onChange={e => setEx({ ...ex, [q.label]: e.target.value })}><option value="">{q.label}{q.required === 'yes' ? ' *' : ''}</option>{String(q.options || '').split(',').map((o: string) => o.trim()).filter(Boolean).map((o: string) => <option key={o}>{o}</option>)}</select>
        : <input key={i} style={inp} type={q.type === 'date' ? 'date' : 'text'} placeholder={`${q.label}${q.required === 'yes' ? ' *' : ''}`} value={ex[q.label] ?? ''} onChange={e => setEx({ ...ex, [q.label]: e.target.value })} maxLength={300} />)}
      <input aria-hidden tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1 }} />
      <textarea style={{ ...inp, minHeight: 110 }} placeholder="Tell us about your project" value={v.message} onChange={e => setV({ ...v, message: e.target.value })} maxLength={2000} />
      {state === 'error' && <p style={{ fontSize: 13 }}>Please add your name, an email or phone, and the required answers.</p>}
      {two ? <div style={{ display: 'flex', gap: 10 }}><button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', color: 'inherit', border: '1px solid rgba(127,127,127,.4)', borderRadius: theme.radius, padding: '14px 20px', fontWeight: 600 }}>Back</button><button disabled={!onLead || state === 'sending'} style={{ flex: 1, background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '14px 20px', fontWeight: 600 }}>{state === 'sending' ? 'Sending…' : p.buttonLabel || 'Send'}</button></div>
      : <button disabled={!onLead || state === 'sending'} style={{ background: theme.primary, color: '#fff', borderRadius: theme.radius, padding: '14px 20px', fontWeight: 600 }}>{state === 'sending' ? 'Sending…' : p.buttonLabel || 'Send'}</button>}
      </>}
    </form>
  );
};

const SiteRenderer: React.FC<Props> = ({ page, theme, onLead, wrap, pageHref, device, onMapPin }) => {
  loadFonts(theme); ensureMotionCss();
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
        if (p.layout === 'ticker') { const words = String(p.ticker || '').split(/[·•|]/).map((w: string) => w.trim()).filter(Boolean);
          const halfEl = (k: number) => <span key={k} style={{ display: 'flex', alignItems: 'baseline' }}>{[0, 1, 2].flatMap(r => words.map((w: string, i: number) => <span key={`${r}-${i}`} style={{ ...H, fontSize: 30, whiteSpace: 'nowrap', padding: '0 20px', opacity: i % 2 ? .45 : .95 }}>{w}<span style={{ color: theme.primary }}> ·</span></span>))}</span>;
          return <div style={{ minHeight: p.minHeight || 560, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{eb}{h1}{sub}{btns}
            {words.length > 0 && <div className="sb-mq" style={{ marginTop: 52, borderTop: '1px solid rgba(127,127,127,.3)', paddingTop: 22, maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}><div className="sb-mq-track" style={{ animationDuration: '28s' }}>{halfEl(0)}{halfEl(1)}</div></div>}</div>; }
        return <div style={{ minHeight: p.minHeight || 560, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{eb}{h1}{sub}{btns}</div>; }
      case 'text': { const body = String(p.body || '');
        if (p.layout === 'lead') return <>{title(p.title)}<p {...T('body', { whiteSpace: 'pre-line', fontSize: 21, lineHeight: 1.8 })}>{body.slice(0, 1) && <span style={{ ...H, float: 'left', fontSize: '4.4em', lineHeight: .78, paddingRight: 14, paddingTop: 6, color: theme.primary }}>{body.slice(0, 1)}</span>}{body.slice(1)}</p></>;
        if (p.layout === 'quote') return <div style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto' }}><p style={{ ...H, fontSize: 64, color: theme.primary, lineHeight: .6, marginBottom: 18 }}>“</p><p {...T('body', { ...H, whiteSpace: 'pre-line', fontSize: 30, fontStyle: 'italic', lineHeight: 1.45 })}>{body}</p>{p.title && <p {...T('title', { marginTop: 22, fontSize: 13, letterSpacing: '.28em', textTransform: 'uppercase', opacity: .7 })}>{p.title}</p>}</div>;
        if (p.layout === 'twocol') return <>{title(p.title)}<p {...T('body', { whiteSpace: 'pre-line', fontSize: 17, lineHeight: 1.75, columnCount: 2, columnGap: 44 })} className="max-lg:[column-count:1]">{body}</p></>;
        return <>{title(p.title)}<p {...T('body', { whiteSpace: 'pre-line', fontSize: 18, lineHeight: 1.7 })}>{p.body}</p></>; }
      case 'image': { if (p.layout === 'parallax') return <>{linked(p.link, <ParallaxImage p={p} theme={theme} T={T} />)}</>;
        if (p.layout === 'framed') return <div style={{ background: '#fff', padding: 14, borderRadius: theme.radius, border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 24px 48px rgba(0,0,0,.14)' }}>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480, borderRadius: Math.max(4, theme.radius - 6) }))}{p.caption && <p {...T('caption', { marginTop: 12, fontSize: 14, color: '#0a0a0a', opacity: .65 })}>{p.caption}</p>}</div>;
        if (p.layout === 'overlay') return <div style={{ position: 'relative', borderRadius: theme.radius, overflow: 'hidden' }}>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480, borderRadius: 0 }))}{p.caption && <p {...T('caption', { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '36px 22px 16px', fontSize: 15, color: '#fff', background: 'linear-gradient(transparent, rgba(0,0,0,.72))' })}>{p.caption}</p>}</div>;
        return <>{linked(p.link, img(p.src, p.caption || 'Image', { height: p.height || 480 }))}{p.caption && <p {...T('caption', { marginTop: 10, fontSize: 14, opacity: .7 })}>{p.caption}</p>}</>; }
      case 'gallery': return <GalleryBlock p={p} theme={theme} T={T} titleNode={title(p.title)} img={img} linked={linked} lbOn={p.lightbox === 'yes' && !wrap} />;
      case 'video': return <>{title(p.title)}<VideoBlock p={p} theme={theme} /></>;
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
        if (p.layout === 'wall') { const cols: { t: any; i: number }[][] = [[], [], []]; items.forEach((t: any, i: number) => cols[i % 3].push({ t, i })); const live = cols.filter(c => c.length);
          const card = ({ t, i }: { t: any; i: number }) => <div key={i} style={{ background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 20, marginBottom: 14 }}>{t.stars ? <p style={{ color: theme.primary, fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>{'★'.repeat(Math.max(1, Math.min(5, parseInt(t.stars, 10) || 5)))}</p> : null}<p {...T(`items.${i}.quote`, { ...H, fontSize: 17, fontStyle: 'italic', lineHeight: 1.5 })}>“{t.quote}”</p><footer {...T(`items.${i}.name`, { marginTop: 8, opacity: .7, fontSize: 13 })}>— {t.name}</footer></div>;
          return <>{title(p.title)}<div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>{live.map((col, ci) => <div key={ci} className="sb-wall-col" style={{ overflow: 'hidden', maxHeight: 540, maskImage: 'linear-gradient(#000 76%, transparent)', WebkitMaskImage: 'linear-gradient(#000 76%, transparent)' }}><div className="sb-mq-col" style={{ animationDuration: `${44 + ci * 10}s` }}>{[0, 1].map(h => <div key={h} aria-hidden={h === 1 || undefined}>{col.map(card)}</div>)}</div></div>)}</div></>; }
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
      case 'tech': { const t = TECH_TOOLS.find(x => x.value === p.tool) ?? TECH_TOOLS[0]; const raw = t.value === 'flip' ? (p.flipSlug ? `/flip/${p.flipSlug}` : '/live-flip') : t.path; const src = appPath(raw);
        return <>{title(p.title)}{framed(p.frame, p.title || t.label, theme.radius, <iframe src={src} title={p.title || t.label} loading="lazy" style={{ width: '100%', height: p.height || 760, border: 0, borderRadius: p.frame && p.frame !== 'none' ? 0 : theme.radius, background: '#fff', display: 'block' }} allow="fullscreen; clipboard-write; camera; microphone" />)}</>; }
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
      case 'faq': { if (p.layout === 'motion') return <>{title(p.title)}<FaqMotion items={p.items || []} H={H} primary={theme.primary} /></>;
        if (p.layout === 'twocol' || p.layout === 'cards') return <>{title(p.title)}<div className="grid gap-6 md:grid-cols-2">{(p.items || []).map((c: any, i: number) => <div key={i} style={p.layout === 'cards' ? { textAlign: 'left', background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 24 } : { textAlign: 'left' }}><h3 {...T(`items.${i}.q`, { ...H, fontSize: 21, marginBottom: 8 })}>{c.q}</h3><p {...T(`items.${i}.a`, { opacity: .82, lineHeight: 1.6, whiteSpace: 'pre-line' })}>{c.a}</p></div>)}</div></>;
        return <>{title(p.title)}<Faq items={p.items || []} H={H} /></>; }
      case 'pricing': return <PricingSection p={p} theme={theme} T={T} H={H} L={L} ext={ext} titleNode={title(p.title)} />;
      case 'team': { const card = p.layout === 'cards'; const round = p.layout === 'round'; return <>{title(p.title)}<div className="grid gap-6 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i} style={card ? { background: 'rgba(127,127,127,.055)', border: '1px solid rgba(127,127,127,.16)', borderRadius: theme.radius, padding: 20 } : undefined}>{img(c.photo, c.name, { aspectRatio: '1/1', marginBottom: 12, borderRadius: round ? '50%' : theme.radius, ...(round ? { maxWidth: 150, margin: '0 auto 12px' } : {}) })}<h3 {...T(`items.${i}.name`, { ...H, fontSize: 22 })}>{c.name}</h3><p {...T(`items.${i}.role`, { opacity: .7, fontSize: 14 })}>{c.role}</p>{c.bio && <p style={{ opacity: .8, fontSize: 14, marginTop: 6 }}>{c.bio}</p>}</div>)}</div></>; }
      case 'stats': { if (p.layout === 'countup') return <>{title(p.title)}<div className="grid gap-8 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i}><p {...T(`items.${i}.value`, { ...H, fontSize: 76, color: theme.primary, lineHeight: 1 })}><CountUpText raw={c.value || '—'} /></p><p {...T(`items.${i}.label`, { opacity: .75, marginTop: 8, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 12 })}>{c.label}</p></div>)}</div></>;
        if (p.layout === 'dividers') return <>{title(p.title)}<div className="grid gap-6 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i} style={{ textAlign: 'left', borderLeft: `3px solid ${theme.primary}`, paddingLeft: 18 }}><p {...T(`items.${i}.value`, { ...H, fontSize: 48 })}>{c.value || '—'}</p><p {...T(`items.${i}.label`, { opacity: .75, marginTop: 4 })}>{c.label}</p></div>)}</div></>;
        if (p.layout === 'big') return <>{title(p.title)}<div className="grid gap-8 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i}><p {...T(`items.${i}.value`, { ...H, fontSize: 76, color: theme.primary, lineHeight: 1 })}>{c.value || '—'}</p><p {...T(`items.${i}.label`, { opacity: .75, marginTop: 8, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 12 })}>{c.label}</p></div>)}</div></>;
        return <>{title(p.title)}<div className="grid gap-6 grid-cols-2 lg:grid-cols-4">{(p.items || []).map((c: any, i: number) => <div key={i}><p {...T(`items.${i}.value`, { ...H, fontSize: 52, color: theme.primary })}>{c.value || '—'}</p><p {...T(`items.${i}.label`, { opacity: .75 })}>{c.label}</p></div>)}</div></>; }
      case 'logos': { if (p.layout === 'marquee') { const cell = (c: any, i: number) => <span key={i} className="sb-logo-mq" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 32px' }}>{linked(c.link, c.logo ? <img src={c.logo} alt={c.name} loading="lazy" style={{ height: 44, width: 'auto' }} /> : <span style={{ ...H, fontSize: 24, opacity: .75, whiteSpace: 'nowrap' }}>{c.name}</span>)}</span>;
          const halfEl = (k: number) => <span key={k} style={{ display: 'flex', alignItems: 'center' }}>{(p.items || []).map(cell)}</span>;
          return <>{title(p.title, 28)}<div className="sb-mq" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}><div className="sb-mq-track" style={{ animationDuration: '34s', alignItems: 'center' }}>{halfEl(0)}{halfEl(1)}</div></div></>; }
        if (p.layout === 'grid') return <>{title(p.title, 28)}<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{(p.items || []).map((c: any, i: number) => <div key={i} style={{ border: '1px solid rgba(127,127,127,.18)', borderRadius: theme.radius, padding: '26px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 96 }}>{linked(c.link, c.logo ? <img src={c.logo} alt={c.name} loading="lazy" style={{ height: 42, width: 'auto', opacity: .85 }} /> : <span style={{ ...H, fontSize: 21, opacity: .7 }}>{c.name}</span>)}</div>)}</div></>;
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
      case 'embed': { if (!/^https:\/\//.test(p.url || '')) return <>{title(p.title)}<p style={{ opacity: .6 }}>Add a page link (https://…).</p></>;
        const ifr = <iframe title={p.title || 'Embedded page'} loading="lazy" src={p.url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style={{ width: '100%', height: p.height || 500, border: 0, borderRadius: p.frame && p.frame !== 'none' ? 0 : theme.radius, display: 'block' }} />;
        if (p.poster) return <>{title(p.title)}<EmbedFacade poster={p.poster} height={p.height || 500} radius={theme.radius} label={p.title || 'Embedded page'}>{framed(p.frame, p.title || p.url, theme.radius, ifr)}</EmbedFacade></>;
        return <>{title(p.title)}{framed(p.frame, p.title || p.url, theme.radius, ifr)}</>; }
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
