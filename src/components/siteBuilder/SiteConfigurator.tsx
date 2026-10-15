/**
 * SiteConfigurator — public/editor rendering of the "Configurable product"
 * block: photo, specs, included equipment, option groups (pick one / pick many)
 * with photos and prices, live configuration total, Instant Quote + Stripe pay.
 * Mirrors the home-page product card technology. Every text is tagged with
 * data-edit (T helper) so it is double-click editable in the builder.
 * Imagine Engine Studios Corp.
 */
import * as React from 'react';
import type { SiteTheme } from '@/lib/siteBuilder/model';

type TFn = (path: string, base?: React.CSSProperties) => Record<string, any>;
interface Props { p: Record<string, any>; theme: SiteTheme; T: TFn; H: React.CSSProperties; href: (h?: string) => string | undefined }

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const num = (v: any) => { const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0; };

const SiteConfigurator: React.FC<Props> = ({ p, theme, T, H, href }) => {
  const options: any[] = Array.isArray(p.options) ? p.options : [];
  const groups = React.useMemo(() => [...new Set(options.map((o) => o.group || 'Options'))], [options]);
  const [picked, setPicked] = React.useState<Record<number, boolean>>({});
  const [open, setOpen] = React.useState<string | null>(groups[0] ?? null);
  const toggle = (i: number) => setPicked((cur) => {
    const o = options[i]; const next = { ...cur };
    if (o.pick !== 'many') options.forEach((x, k) => { if ((x.group || 'Options') === (o.group || 'Options') && k !== i) delete next[k]; });
    next[i] = !cur[i]; return next;
  });
  // Per-sqft options are shown but not added (area is set in the quote).
  const total = num(p.price) + options.reduce((t, o, i) => t + (picked[i] && !o.unit ? num(o.price) : 0), 0);
  const specs = [['size', 'Size'], ['depth', 'Depth'], ['installation', 'Installation'], ['warranty', 'Warranty']].filter(([k]) => p[k]);
  const line = '1px solid rgba(0,0,0,.12)';

  return (
    <article style={{ border: line, background: '#fff', color: '#0a0a0a', textAlign: 'left', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
      <div style={{ position: 'relative', minHeight: 320, background: 'rgba(0,0,0,.05)' }}>
        {p.image ? <img src={p.image} alt={p.name} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, border: '1px dashed rgba(0,0,0,.2)', display: 'grid', placeItems: 'center', fontSize: 13, opacity: .6 }}>Product photo</div>}
        {p.badge && <span {...T('badge', { position: 'absolute', top: 14, left: 14, background: theme.primary, color: '#fff', fontSize: 11, padding: '4px 10px', letterSpacing: '.12em', textTransform: 'uppercase' })}>{p.badge}</span>}
      </div>
      <div style={{ padding: 26, display: 'grid', gap: 16, alignContent: 'start' }}>
        <div>
          <h3 {...T('name', { ...H, fontSize: 36 })}>{p.name}</h3>
          <p {...T('price', { fontWeight: 700, fontSize: 20, marginTop: 6 })}>{num(p.price) ? money(num(p.price)) : 'Price on request'}</p>
          {p.note && <p {...T('note', { fontSize: 12, opacity: .6, marginTop: 4 })}>{p.note}</p>}
          {p.description && <p {...T('description', { fontSize: 14, opacity: .8, marginTop: 10, whiteSpace: 'pre-line' })}>{p.description}</p>}
        </div>
        {specs.length > 0 && <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, borderTop: line, paddingTop: 12 }}>
          {specs.map(([k, l]) => <div key={k}><dt style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55 }}>{l}</dt><dd {...T(k, { fontWeight: 600, fontSize: 14 })}>{p[k]}</dd></div>)}
        </dl>}
        {p.included && <div><p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .55 }}>Included</p><p {...T('included', { fontSize: 14 })}>{p.included}</p></div>}
        <div style={{ display: 'grid', gap: 8 }}>
          {groups.map((g) => <div key={g} style={{ border: line }}>
            <button type="button" onClick={() => setOpen(open === g ? null : g)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '12px 14px', fontWeight: 600, fontSize: 14 }}>
              <span>{g}</span><span style={{ opacity: .5 }}>{open === g ? '−' : '+'}</span></button>
            {open === g && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8, padding: '0 14px 14px' }}>
              {options.map((o, i) => (o.group || 'Options') !== g ? null : <div key={i} role="button" tabIndex={0} onClick={() => toggle(i)} onKeyDown={(e) => e.key === 'Enter' && toggle(i)}
                style={{ border: picked[i] ? `2px solid ${theme.primary}` : line, padding: 8, cursor: 'pointer', textAlign: 'center' }}>
                {o.image ? <img src={o.image} alt={o.name} loading="lazy" style={{ width: '100%', height: 64, objectFit: 'cover', marginBottom: 6 }} /> : null}
                <p {...T(`options.${i}.name`, { fontSize: 12, fontWeight: 500 })}>{o.name}</p>
                {o.detail && <p {...T(`options.${i}.detail`, { fontSize: 11, color: theme.primary, fontWeight: 600 })}>{o.detail}</p>}
                {num(o.price) > 0 && <p {...T(`options.${i}.price`, { fontSize: 12, fontWeight: 600 })}>+{money(num(o.price))}{o.unit || ''}</p>}
              </div>)}
            </div>}
          </div>)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {p.quoteLabel && <a href={href(p.quoteHref || '#contact')} style={{ flex: 1, textAlign: 'center', border: `1px solid ${theme.primary}`, color: theme.primary, padding: '12px 16px', fontWeight: 600 }}>{p.quoteLabel}</a>}
          {/^https:\/\//.test(p.buyLink || '') && <a href={p.buyLink} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', background: theme.primary, color: '#fff', padding: '12px 16px', fontWeight: 600 }}>{p.buyLabel || 'Checkout'} {money(total)}</a>}
        </div>
        <div style={{ borderTop: line, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, opacity: .7 }}>Total Configuration Price</span><span style={{ ...H, fontSize: 28, fontWeight: 700 }}>{total ? money(total) : '—'}</span>
        </div>
      </div>
    </article>
  );
};

export default SiteConfigurator;
