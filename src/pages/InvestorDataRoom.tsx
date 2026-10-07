/**
 * /investors — Wonderlands investor data room.
 * Visitors sign a mutual NDA (name, last name, email, drawn signature) via the
 * sign_investor_nda RPC before the room opens. Access is remembered on this
 * device; signed records are readable by main admins only.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import deckDoc from '@/assets/investors/deck.pdf.asset.json';
import platformDoc from '@/assets/investors/platform.pdf.asset.json';
import gtmDoc from '@/assets/investors/gtm.pdf.asset.json';
import planDoc from '@/assets/investors/plan.pdf.asset.json';
import deck100Doc from '@/assets/investors/deck100.html.asset.json';
import { INVESTOR_SHEETS } from '@/data/investorSheets';
import xlPools from '@/assets/investors/xl-pools.html.asset.json';
import xlCap from '@/assets/investors/xl-captable.html.asset.json';
import xlSoft from '@/assets/investors/xl-software.html.asset.json';

const DOCS = [
  { title: 'Investor Deck — 100 Pools (latest numbers)', meta: 'HTML', body: 'Current investor deck with updated figures.', url: deck100Doc.url, html: 'deck100' as const },
  { title: '100 Pools — Financial Model', meta: 'Spreadsheet', body: '$5M plan, $5M vs $10M, 5-year projection, dashboard.', url: xlPools.url, sheet: 'pools' as const },
  { title: 'Software Sales — Financial Model', meta: 'Spreadsheet', body: 'SaaS packages, scale and 5-year projection.', url: xlSoft.url, sheet: 'software' as const },
  { title: 'Cap Table — 25% Each (spreadsheet)', meta: 'Spreadsheet', body: 'Partner ownership table.', url: xlCap.url, sheet: 'captable' as const },
  { title: 'Investor Deck v6', meta: 'PDF · 12 pages', body: 'High-Value Studio — $50k/yr, $2.5M 2027.', url: deckDoc.url },
  { title: 'One Platform Mastery', meta: 'PDF · 16 pages', body: 'The full platform, module by module.', url: platformDoc.url },
  { title: 'Go-To-Market Strategy 2026', meta: 'PDF · 10 pages', body: 'Channels, launch sequence and targets.', url: gtmDoc.url },
  { title: 'Business Plan', meta: 'PDF · 25 pages', body: 'Wonderlands Worlds Experience business plan.', url: planDoc.url },
];

/** Cap table — from the uploaded "25% Each" sheet. */
const PARTNERS = [
  { name: 'Ricardo', pct: 25, units: 25, color: 'hsl(var(--primary))' },
  { name: 'Khalia', pct: 25, units: 25, color: 'hsl(188 60% 55%)' },
  { name: 'Roberto', pct: 25, units: 25, color: 'hsl(8 90% 70%)' },
  { name: 'Jose', pct: 25, units: 25, color: 'hsl(40 80% 60%)' },
];
const SCENARIOS = [
  { key: 'mixed', label: '$5M valuation · mixed', valuation: 5_000_000, gross: 1_730_000, margin: '34.65%', grossShare: 433_125 },
  { key: 'pure', label: '$10M valuation · pure', valuation: 10_000_000, gross: 3_500_000, margin: '35%', grossShare: 875_000 },
];
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function CapTable() {
  const [sc, setSc] = useState(SCENARIOS[0]);
  let acc = 0;
  const conic = PARTNERS.map((p) => { const a = acc; acc += p.pct; return `${p.color} ${a}% ${acc}%`; }).join(',');
  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <div className="flex flex-col items-center">
        <div className="relative h-56 w-56 rounded-full" style={{ background: `conic-gradient(${conic})` }}>
          <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-background">
            <span className="font-serif text-4xl font-light">100%</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">100 units</span>
          </div>
        </div>
        <div className="mt-6 grid w-full grid-cols-2 gap-2">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.name} · {p.pct}%
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-4 inline-flex rounded-full border border-border p-1">
          {SCENARIOS.map((s) => (
            <button key={s.key} type="button" onClick={() => setSc(s)}
              className={`rounded-full px-4 py-1.5 text-xs ${sc.key === s.key ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <tr><th className="p-3">Partner</th><th className="p-3">Ownership</th><th className="p-3">Units</th><th className="p-3">Voting</th><th className="p-3">Profit</th><th className="p-3 text-right">Equity value</th><th className="p-3 text-right">Gross share</th></tr>
            </thead>
            <tbody>
              {PARTNERS.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.pct}%</td><td className="p-3">{p.units}</td><td className="p-3">{p.pct}%</td><td className="p-3">{p.pct}%</td>
                  <td className="p-3 text-right tabular-nums">{usd(sc.valuation * p.pct / 100)}</td>
                  <td className="p-3 text-right tabular-nums">{usd(sc.grossShare)}</td>
                </tr>
              ))}
              <tr className="border-t border-border bg-muted/30 font-medium">
                <td className="p-3">Total</td><td className="p-3">100%</td><td className="p-3">100</td><td className="p-3">100%</td><td className="p-3">100%</td>
                <td className="p-3 text-right tabular-nums">{usd(sc.valuation)}</td><td className="p-3 text-right tabular-nums">{usd(sc.grossShare * 4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Based on 100 pools: {usd(sc.gross)} gross at {sc.margin}. Equal partnership: no majority holder; decisions need 51% (3 partners) or unanimity per the operating agreement.
        </p>
      </div>
    </div>
  );
}

const NDA_VERSION = 'v1-2026-10';
const ACCESS_KEY = 'wl_investor_nda';

const NDA_TEXT = [
  ['Purpose', 'Wonderlands World ("Wonderlands") will share confidential business, financial, technical and product information ("Confidential Information") so that you can evaluate a possible investment.'],
  ['Confidentiality', 'You agree to keep Confidential Information strictly confidential, to use it only for that evaluation, and not to disclose it to anyone except your advisers who are bound by equal duties of confidentiality.'],
  ['No copying or reverse engineering', 'You will not copy, distribute, screenshot for distribution, or reverse engineer any software, design, pricing model or document made available in this data room.'],
  ['Exclusions', 'These duties do not apply to information that is public through no fault of yours, that you already lawfully held, or that you must disclose by law (with prompt notice to Wonderlands).'],
  ['Term', 'These obligations last three (3) years from the date you sign. On request you will return or destroy all Confidential Information.'],
  ['No obligation', 'Nothing here obliges either party to make or accept an investment, and no licence to any intellectual property is granted.'],
  ['Governing law', 'This agreement is governed by the laws of the State of Florida, USA.'],
  ['Electronic signature', 'By typing your name and drawing your signature you agree that your electronic signature is legally binding, as under the U.S. ESIGN Act and the Florida Uniform Electronic Transaction Act.'],
];

const ROOM = [
  { n: '01', title: 'Investor deck', body: 'The Wonderlands story, market, model and roadmap.', to: '/deck' },
  { n: '02', title: 'Platform technology', body: 'Architecture, stack and the systems behind every tool.', to: '/technology' },
  { n: '03', title: 'Command Center preview', body: 'The operating system for licensed companies, shown with no private data.', to: '/demo/command-center' },
  { n: '04', title: 'Design Studio', body: '2D to 3D pool and backyard design, live.', to: '/design-studio' },
  { n: '05', title: 'FLIP books', body: 'Interactive product catalogues and the Flip Builder.', to: '/flip' },
  { n: '06', title: 'Solar Genius', body: 'Roof capture, solar sizing and quoting.', to: '/solar-genius' },
  { n: '07', title: 'Studio showroom', body: 'Every product category and trade suite.', to: '/studio' },
  { n: '08', title: 'Book a call with the founder', body: 'Thirty minutes with Ricardo.', href: 'https://calendly.com/wonderlandsworlds/30min' },
];


/** Subcontractor network (from CONTRACTORS.xlsx). */
const SUBS = [
  { name: 'BAM Shotcrete Inc.', trade: 'Shotcrete', web: 'https://bamshotcrete.com', phone: '(623) 462-0230', area: 'Various locations', email: '' },
  { name: 'Prestige Shotcrete', trade: 'Shotcrete', web: 'https://prestige-gunite.com', phone: '(407) 468-0344', area: 'Tampa, Orlando, Fort Myers, Venice, East Coast', email: '' },
  { name: 'High Pressure Shotcrete', trade: 'Shotcrete', web: 'https://www.highpressureshotcretefl.com', phone: '(352) 354-2002', area: 'Ocala', email: '' },
  { name: 'Kennedy Concrete', trade: 'Shotcrete', web: 'https://kennedyconcrete.com', phone: '(407) 708-9175', area: 'Central Florida, East and West', email: '' },
  { name: 'Preferred Materials, Inc.', trade: 'Shotcrete', web: 'https://preferredmaterials.com', phone: '(855) 591-4375', area: 'Various locations', email: '' },
  { name: 'Elite Gunite, LLC', trade: 'Shotcrete', web: 'https://www.elitegunite.net', phone: '(813) 756-6926', area: 'Various locations', email: 'estimates@elitegunite.net' },
  { name: 'Davis Concrete', trade: 'Shotcrete', web: 'https://www.davisconcreteinc.com', phone: '1-800-910-6928', area: 'Clearwater, Bradenton, Tampa, Lakeland', email: 'info@davisconcreteinc.com' },
  { name: 'Spray Rock Building Systems', trade: 'Shotcrete', web: 'https://sprayrock.com', phone: '(954) 205-9577', area: '—', email: 'larry@sprayrock.com' },
  { name: 'El Plomero Latino Inc.', trade: 'Plumbing', web: 'https://elplomerolatino.com', phone: '(407) 362-7654', area: 'Orlando, Orange, Osceola and Seminole Counties', email: '' },
  { name: 'D&J Pool Prep', trade: 'Pool builder', web: '', phone: '(407) 879-5103', area: 'Central Florida', email: '' },
  { name: 'SIROME LLC', trade: 'Electrical', web: '', phone: '(407) 618-9291', area: 'Central Florida', email: '' },
  { name: 'Victor Bandera', trade: 'Pool builder', web: '', phone: '(407) 684-3292', area: 'Central Florida', email: '' },
  { name: 'Trullis Pools', trade: 'Pool builder', web: 'https://www.trullispools.com', phone: '(407) 373-9870', area: 'Central Florida', email: '' },
  { name: 'V & V Tools', trade: 'Pavers', web: '', phone: '(407) 910-9716', area: 'Central Florida', email: '' },
  { name: 'Total Pavers', trade: 'Pavers', web: 'https://totalbrickpavers.com', phone: '', area: 'Central Florida', email: '' },
];

/** In-page, view-only reader: PDF toolbar hidden, right-click blocked, no download links. */
// HTML documents bundled as text (lazy) so they render in-page instead of downloading.
const HTML_DOCS = {
  deck100: () => import('@/assets/investors/html/deck100.html?raw'),
};

function DocumentViewer() {
  const [active, setActive] = useState(0);
  const doc = DOCS[active];
  const isPdf = doc.url.toLowerCase().endsWith('.pdf');
  const src = isPdf ? `${doc.url}#toolbar=0&navpanes=0&statusbar=0&view=FitH` : undefined;
  // HTML files are served as downloads, so fetch their text and embed it via srcDoc.
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    if (isPdf || doc.sheet) return;
    let alive = true;
    setHtml(null);
    (doc.html ? HTML_DOCS[doc.html]().then((m) => m.default) : fetch(doc.url).then((r) => r.text())).then((t) => {
      if (!alive) return;
      const base = '<base target="_blank">';
      setHtml(t.includes('<head>') ? t.replace('<head>', `<head>${base}`) : base + t);
    }).catch(() => alive && setHtml('<p style="font-family:serif;padding:24px">This document could not be loaded.</p>'));
    return () => { alive = false; };
  }, [doc.url, isPdf]);
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]" onContextMenu={(e) => e.preventDefault()}>
      <div className="divide-y divide-border border-y border-border">
        {DOCS.map((d, i) => (
          <button key={d.title} type="button" onClick={() => setActive(i)}
            className={`flex w-full items-start gap-3 py-4 text-left transition-opacity ${i === active ? '' : 'opacity-50 hover:opacity-100'}`}>
            <span className="w-6 text-[11px] tabular-nums text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0">
              <span className="block font-serif text-lg font-light leading-tight">{d.title}</span>
              <span className="block text-[11px] text-muted-foreground">{d.meta}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="select-none border border-border bg-card">
        {doc.sheet ? (
          <div className="h-[80vh] overflow-auto p-6">
            {INVESTOR_SHEETS[doc.sheet].map((sh) => (
              <div key={sh.title} className="mb-12">
                <h3 className="mb-4 border-b border-border pb-2 font-serif text-2xl font-light">{sh.title}</h3>
                <table className="w-full text-xs">
                  <tbody>
                    {sh.rows.map((r, i) => (
                      <tr key={i} className="border-b border-border/60">
                        {r.map((c, j) => <td key={j} className={`px-2 py-2 align-top ${j === 0 ? 'font-medium' : 'tabular-nums'}`}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : <iframe key={doc.url} title={doc.title} src={src}
          {...(isPdf ? {} : { srcDoc: html ?? '<p style="font-family:serif;padding:24px;color:#888">Loading…</p>', sandbox: 'allow-scripts allow-popups allow-popups-to-escape-sandbox' })}
          className="h-[80vh] w-full" />}
        <p className="border-t border-border px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Confidential · view only · covered by your NDA</p>
      </div>
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    c.width = r.width * 2; c.height = r.height * 2;
    const ctx = c.getContext('2d')!;
    ctx.scale(2, 2); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#111';
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const clear = () => {
    const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    dirty.current = false; onChange(null);
  };

  return (
    <div>
      <canvas
        ref={ref}
        className="h-40 w-full touch-none rounded-xl border border-border bg-background"
        onPointerDown={(e) => { drawing.current = true; const [x, y] = pos(e); const ctx = ref.current!.getContext('2d')!; ctx.beginPath(); ctx.moveTo(x, y); }}
        onPointerMove={(e) => { if (!drawing.current) return; const [x, y] = pos(e); const ctx = ref.current!.getContext('2d')!; ctx.lineTo(x, y); ctx.stroke(); dirty.current = true; }}
        onPointerUp={() => { drawing.current = false; if (dirty.current) onChange(ref.current!.toDataURL('image/png')); }}
        onPointerLeave={() => { if (drawing.current && dirty.current) onChange(ref.current!.toDataURL('image/png')); drawing.current = false; }}
      />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>Sign with your mouse or finger</span>
        <button type="button" onClick={clear} className="underline">Clear</button>
      </div>
    </div>
  );
}

export default function InvestorDataRoom() {
  const [access, setAccess] = useState<{ name: string } | null>(() => {
    try { const v = JSON.parse(localStorage.getItem(ACCESS_KEY) || 'null'); return v?.version === NDA_VERSION ? v : null; } catch { return null; }
  });
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [sig, setSig] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { document.title = 'Investor Data Room — Wonderlands'; }, []);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const valid = first.trim() && last.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) && sig && agree;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.rpc('sign_investor_nda' as any, {
      _first: first.trim(), _last: last.trim(), _email: email.trim(), _signature: sig, _version: NDA_VERSION, _ua: navigator.userAgent,
    });
    setBusy(false);
    if (error) { setErr('We couldn’t record your signature. Please check your details and try again.'); return; }
    const v = { name: `${first.trim()} ${last.trim()}`, version: NDA_VERSION };
    localStorage.setItem(ACCESS_KEY, JSON.stringify(v));
    setAccess(v);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link to="/" className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Wonderlands World</Link>
          <span className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Private · Confidential</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 lg:pt-24">
        <p className="mb-4 text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Issue Nº 01 — Investors</p>
        <h1 className="font-serif text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          The Data Room
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {access
            ? `Welcome, ${access.name}. Everything below is shared under the NDA you signed.`
            : 'A private edition for prospective investors. Please read and sign the non-disclosure agreement to enter.'}
        </p>
      </section>

      {access ? (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {ROOM.map((r) => {
              const inner = (
                <div className="group h-full bg-background p-8 transition-colors hover:bg-muted/40">
                  <p className="text-[11px] tabular-nums text-muted-foreground">{r.n}</p>
                  <h2 className="mt-3 font-serif text-3xl font-light tracking-tight">{r.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-foreground group-hover:underline">Open →</p>
                </div>
              );
              return r.href
                ? <a key={r.n} href={r.href} target="_blank" rel="noreferrer">{inner}</a>
                : <Link key={r.n} to={r.to!}>{inner}</Link>;
            })}
          </div>

          <div className="mt-20 border-t border-border/60 pt-10">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Section II — Ownership</p>
            <h2 className="mb-10 mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">Cap Table</h2>
            <CapTable />
          </div>

          <a href="https://www.meta.ai/share/a/be06d155-2c94-462b-8bdc-2750a055824c" target="_blank" rel="noreferrer"
            className="mt-20 flex flex-col items-center justify-between gap-4 bg-foreground px-8 py-10 text-background transition-opacity hover:opacity-90 sm:flex-row">
            <span>
              <span className="block text-[10px] uppercase tracking-[0.5em] opacity-70">Confidential</span>
              <span className="mt-2 block font-serif text-4xl font-light tracking-tight sm:text-5xl">Current Financials</span>
            </span>
            <span className="border border-background px-8 py-4 text-xs uppercase tracking-[0.35em]">Open financials →</span>
          </a>

          <div className="mt-20 border-t border-border/60 pt-10">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Section III — Library</p>
            <h2 className="mb-10 mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">Documents</h2>
            <DocumentViewer />
          </div>

          <div className="mt-20 border-t border-border/60 pt-10">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Section — Build network</p>
            <h2 className="mb-10 mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">Subcontractors</h2>
            <div className="overflow-x-auto border-y border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border text-left text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  <tr><th className="py-3 font-normal">Company</th><th className="font-normal">Trade</th><th className="font-normal">Area</th><th className="font-normal">Phone</th><th className="font-normal">Contact</th></tr>
                </thead>
                <tbody>
                  {SUBS.map((c) => (
                    <tr key={c.name} className="border-b border-border/60 align-top">
                      <td className="py-4 font-serif text-lg">{c.web ? <a href={c.web} target="_blank" rel="noreferrer" className="hover:underline">{c.name}</a> : c.name}</td>
                      <td className="py-4">{c.trade}</td>
                      <td className="max-w-[260px] py-4 text-muted-foreground">{c.area}</td>
                      <td className="py-4 tabular-nums">{c.phone ? <a href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`} className="hover:underline">{c.phone}</a> : '—'}</td>
                      <td className="py-4">{c.email ? <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-20 border-t border-border/60 pt-10">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Section IV — Try it live</p>
            <h2 className="mb-4 mt-3 font-serif text-4xl font-light tracking-tight sm:text-5xl">Demo accounts</h2>
            <p className="mb-8 text-sm text-muted-foreground">All three use the password <span className="font-mono text-foreground">Investor!2026</span>. Sign in at <Link to="/auth" className="underline">/auth</Link>.</p>
            <div className="divide-y divide-border border-y border-border">
              {[
                { role: 'Contractor', email: 'investor.contractor@wonderlandsworld.com', body: 'Opens the "Sunrise Outdoor Living (Demo)" company workspace.' },
                { role: 'Homeowner', email: 'investor.homeowner@wonderlandsworld.com', body: 'Opens the customer account page.' },
                { role: 'Sales rep', email: 'investor.salesrep@wonderlandsworld.com', body: 'Opens the sales rep dashboard. It shows no clients, so real Wonderlands customers stay private.' },
              ].map((a) => (
                <div key={a.email} className="flex flex-wrap items-baseline gap-4 py-5">
                  <span className="w-28 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{a.role}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm">{a.email}</p>
                    <p className="text-xs text-muted-foreground">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[1.2fr_1fr]">
          <article className="border-t border-border/60 pt-8">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Mutual Non-Disclosure Agreement · {NDA_VERSION}</p>
            <h2 className="mt-3 font-serif text-3xl font-light">Confidentiality first.</h2>
            <ol className="mt-8 space-y-6">
              {NDA_TEXT.map(([h, b], i) => (
                <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-2">
                  <span className="text-[11px] tabular-nums text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-sm font-medium">{h}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </article>

          <form onSubmit={submit} className="h-fit space-y-5 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-8">
            <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Sign to enter</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="f">First name</Label><Input id="f" value={first} onChange={(e) => setFirst(e.target.value)} maxLength={80} required /></div>
              <div className="space-y-1.5"><Label htmlFor="l">Last name</Label><Input id="l" value={last} onChange={(e) => setLast(e.target.value)} maxLength={80} required /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="e">Email</Label><Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} required /></div>
            <div className="space-y-1.5"><Label>Signature</Label><SignaturePad onChange={setSig} /></div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
              I have read and agree to the NDA. Signed electronically on {today}.
            </label>
            {err && <p className="text-xs text-muted-foreground">{err}</p>}
            <Button type="submit" className="w-full" disabled={!valid || busy}>{busy ? 'Signing…' : 'Sign NDA & enter'}</Button>
          </form>
        </section>
      )}

      <footer className="border-t border-border/60 py-8 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        Wonderlands World · Confidential
      </footer>
    </div>
  );
}
