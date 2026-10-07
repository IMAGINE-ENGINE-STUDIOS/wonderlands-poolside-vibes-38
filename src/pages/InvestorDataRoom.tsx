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
