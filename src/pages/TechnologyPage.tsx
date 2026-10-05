/**
 * TechnologyPage — public technical whitepaper at /technology.
 * Describes the platform architecture with a radial language chart.
 * Intentionally shows NO source code and no repository links.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Lang = { name: string; pct: number; color: string; role: string; scope: string };

// Approximate share of the codebase by language (lines of code).
const LANGS: Lang[] = [
  { name: 'TypeScript', pct: 78, color: 'hsl(189 94% 37%)', role: 'Application, 3D engine & edge services', scope: 'Interface, state, geometry, pricing, serverless functions — one strictly typed language end to end.' },
  { name: 'SQL / PL/pgSQL', pct: 12, color: 'hsl(4 93% 69%)', role: 'Data, security & business rules', scope: 'Multi-tenant schema, row-level security, sealed server procedures, scheduled jobs.' },
  { name: 'CSS / Design tokens', pct: 6, color: 'hsl(222 47% 20%)', role: 'Design system', scope: 'Semantic tokens, fluid typography, hardware-accelerated motion, light/dark theming.' },
  { name: 'HTML, GLSL & config', pct: 4, color: 'hsl(40 60% 55%)', role: 'Documents, shaders & pipeline', scope: 'Document shell, WebGL shader routines, build and deployment configuration.' },
];

const SECTIONS: { n: string; title: string; intro: string; items: [string, string][] }[] = [
  { n: '01', title: 'Client & presentation tier', intro: 'A single-page application compiled to optimized, code-split modules and served from a global edge network.', items: [
    ['React 18', 'Concurrent rendering, lazy-loaded chapters and suspense boundaries keep every screen responsive.'],
    ['Vite 5 build pipeline', 'Native ES modules, tree-shaking and vendor chunking for fast first paint.'],
    ['Tailwind CSS + semantic tokens', 'One design language across storefront, studios, workspaces and the Command Center.'],
    ['Radix UI primitives', 'Accessible dialogs, menus and controls with full keyboard support.'],
    ['TanStack Query v5', 'Cached, deduplicated data fetching with background revalidation.'],
    ['React Hook Form + Zod', 'Validated forms with typed schemas shared across the app.'],
    ['Framer Motion', 'Physically based transitions, page flips and editorial motion.'],
  ]},
  { n: '02', title: '3D spatial & design engine', intro: 'Real-time, in-browser engineering of pools, decks, terrain and outdoor spaces at 60 frames per second.', items: [
    ['Three.js + React Three Fiber', 'Declarative WebGL scene graph powering the 3D Pool Studio.'],
    ['Constructive solid geometry', 'Boolean mesh solvers cut pools, steps and seating into terrain live.'],
    ['Mitred ring offsets', 'Exact coping, wall and deck borders with clean corner joints.'],
    ['Procedural UV mapping', 'True 1×1 ft tile, paver and waterline texture scale on every surface.'],
    ['Bidirectional 2D ↔ 3D sync', '10 px per foot blueprint plane mirrored into the 3D model.'],
    ['Polygon triangulation & clipping', 'Robust handling of free-form shapes and deck cut-outs.'],
    ['Geospatial imaging', 'Cesium, Leaflet and aerial tiles for roof tracing and solar layout.'],
  ]},
  { n: '03', title: 'Data & security architecture', intro: 'A managed PostgreSQL core designed for licensed companies that must never see each other\'s data.', items: [
    ['PostgreSQL', 'Relational core for products, quotes, invoices, CRM, projects and sites.'],
    ['Tenant isolation', 'Every business record carries a company key enforced by the database itself.'],
    ['Row-level security', 'Access policies evaluated on every query — not just in the interface.'],
    ['Sealed server procedures', 'Public visitors reach data only through narrow, audited entry points.'],
    ['Role model', 'Platform admin, company owner, staff, sales team and customer roles.'],
    ['Encrypted secrets', 'Provider keys are stored server-side and never sent to the browser.'],
    ['Object storage', 'Private, owner-scoped buckets for files, knowledge and media.'],
  ]},
  { n: '04', title: 'Serverless edge runtime', intro: 'Over forty TypeScript micro-services run on a distributed Deno edge runtime.', items: [
    ['Edge functions', 'Checkout, notifications, publishing, insights and API endpoints.'],
    ['Scheduler', 'Timed sends and posts fire every five minutes, even with the browser closed.'],
    ['Metering', 'One billing engine enforces plan limits, credits and overage.'],
    ['Shield', 'Caps, duplicates, opt-outs and quiet hours protect sending accounts.'],
    ['Public API v1', 'Hashed bearer keys, scopes and rate limiting with a JavaScript SDK.'],
  ]},
  { n: '05', title: 'Commerce & communications', intro: 'Production-grade integrations that move money and messages.', items: [
    ['Stripe', 'Checkout, subscriptions, payment links and verified returns.'],
    ['Twilio', 'Voice, SMS and WhatsApp with mandatory opt-in.'],
    ['Resend', 'Transactional and campaign email with branded templates.'],
    ['Genius', 'Pluggable intelligence layer with per-company knowledge.'],
    ['PDF & print', 'High-DPI quotes, invoices and signed documents.'],
  ]},
  { n: '06', title: 'Platform products', intro: 'Everything above composes into one licensed platform.', items: [
    ['Website Builder V2', 'Multi-page drag-and-drop sites, custom domains, live publishing.'],
    ['Company CRM', 'Pipeline, accounts, contacts, activities and weighted forecast.'],
    ['FLIP', 'Interactive catalogue books with in-page cart and actions.'],
    ['Quote Atelier', 'Configured, priced and printable proposals.'],
    ['SOCIALITE', 'Social publishing, campaigns and outreach console.'],
    ['Command Center', 'Platform-wide operations and real-data telemetry.'],
  ]},
];

function Donut({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  const R = 120, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[340px]" role="img" aria-label="Languages used">
      <g transform="rotate(-90 160 160)">
        {LANGS.map((l, i) => {
          const len = (l.pct / 100) * C;
          const el = (
            <circle key={l.name} cx="160" cy="160" r={R} fill="none" stroke={l.color}
              strokeWidth={active === i ? 44 : 34} strokeDasharray={`${len - 3} ${C - len + 3}`}
              strokeDashoffset={-offset} className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} />
          );
          offset += len;
          return el;
        })}
      </g>
      <text x="160" y="152" textAnchor="middle" className="fill-foreground" style={{ fontSize: 44, fontFamily: 'Cormorant Garamond, serif' }}>{LANGS[active].pct}%</text>
      <text x="160" y="182" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 14, letterSpacing: 2 }}>{LANGS[active].name.toUpperCase()}</text>
    </svg>
  );
}

export default function TechnologyPage() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    document.title = 'Technology & Architecture | Wonderlands';
    const m = document.querySelector('meta[name="description"]');
    m?.setAttribute('content', 'The engineering behind Wonderlands: languages, 3D engine, multi-tenant security, edge runtime and integrations.');
  }, []);
  const serif = { fontFamily: 'Cormorant Garamond, serif' };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-12">
        <Link to="/" className="text-xs tracking-[0.3em] text-muted-foreground hover:text-foreground">WONDERLANDS</Link>
        <p className="mt-10 text-xs tracking-[0.3em] text-muted-foreground">TECHNICAL WHITEPAPER</p>
        <h1 className="mt-3 text-5xl md:text-7xl leading-[0.95]" style={serif}>The technology<br />behind Wonderlands</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">A proprietary, multi-tenant platform for construction, outdoor-living and design companies — from 3D engineering and quoting to CRM, websites and payments.</p>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12 grid md:grid-cols-2 gap-12 items-center border-t border-border">
        <div className="flex justify-center"><Donut active={active} setActive={setActive} /></div>
        <div>
          <p className="text-xs tracking-[0.3em] text-muted-foreground">LANGUAGES</p>
          <h2 className="mt-2 text-4xl" style={serif}>Built in two core languages</h2>
          <ul className="mt-6 space-y-2">
            {LANGS.map((l, i) => (
              <li key={l.name}>
                <button onMouseEnter={() => setActive(i)} onClick={() => setActive(i)}
                  className={`w-full text-left rounded-xl border p-4 transition ${active === i ? 'border-foreground bg-card shadow-sm' : 'border-border'}`}>
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ background: l.color }} />
                    <span className="font-medium">{l.name}</span>
                    <span className="ml-auto tabular-nums text-muted-foreground">{l.pct}%</span>
                  </div>
                  {active === i && <p className="mt-2 text-sm text-muted-foreground"><span className="text-foreground">{l.role}.</span> {l.scope}</p>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border">
        {[['40+', 'Edge services'], ['60 fps', '3D rendering'], ['100%', 'Typed code'], ['Per-company', 'Data isolation']].map(([v, k]) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-6">
            <div className="text-3xl" style={serif}>{v}</div>
            <div className="mt-1 text-sm text-muted-foreground">{k}</div>
          </div>
        ))}
      </section>

      {SECTIONS.map((s) => (
        <section key={s.n} className="mx-auto max-w-6xl px-6 py-14 border-t border-border grid md:grid-cols-[1fr_2fr] gap-10">
          <div>
            <p className="text-xs tracking-[0.3em] text-muted-foreground">{s.n}</p>
            <h2 className="mt-2 text-3xl md:text-4xl" style={serif}>{s.title}</h2>
            <p className="mt-4 text-muted-foreground">{s.intro}</p>
          </div>
          <dl className="grid sm:grid-cols-2 gap-4">
            {s.items.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border bg-card p-5">
                <dt className="font-medium">{t}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <footer className="mx-auto max-w-6xl px-6 py-12 border-t border-border text-sm text-muted-foreground">
        © {new Date().getFullYear()} Wonderlands. Proprietary platform — source code is not publicly available.
      </footer>
    </main>
  );
}
