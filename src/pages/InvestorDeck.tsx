/**
 * Investor Deck (/deck) — editorial magazine layout, no emojis.
 * Figures come from the partner spreadsheets (100 Pools model + Software Sales model).
 * Update the data arrays below when the models change.
 */
import { Link } from "react-router-dom";
import wonderlandsHero from "@/assets/hero/wonderlands-hero.webp";
import luxuryPoolImg from "@/assets/deck/luxury-pool.webp";
import outdoorKitchen from "@/assets/deck/outdoor-kitchen.webp";
import luxuryOutdoorImg from "@/assets/deck/luxury-outdoor.webp";
import firePitImg from "@/assets/deck/fire-pit.webp";
import lanaiDeluxe from "@/assets/enclosures/lanai-deluxe.webp";

const usd = (n: number) =>
  n >= 1e6 ? `$${parseFloat((n / 1e6).toFixed(2))}M` : n >= 1e3 ? `$${parseFloat((n / 1e3).toFixed(1))}K` : `$${n}`;

const MIX = [
  { cat: "Pool Construction", n: 30, avg: 90000, rev: 2700000, m: "35%", gp: 945000 },
  { cat: "Pool Renovation", n: 20, avg: 40000, rev: 800000, m: "35%", gp: 280000 },
  { cat: "Outdoor Living", n: 10, avg: 60000, rev: 600000, m: "35%", gp: 210000 },
  { cat: "Outdoor Kitchens", n: 10, avg: 40000, rev: 400000, m: "35%", gp: 140000 },
  { cat: "Pavers", n: 10, avg: 20000, rev: 200000, m: "30%", gp: 60000 },
  { cat: "Saunas / Spas", n: 10, avg: 15000, rev: 150000, m: "30%", gp: 45000 },
  { cat: "Landscaping", n: 5, avg: 25000, rev: 125000, m: "30%", gp: 37500 },
  { cat: "Design Services", n: 5, avg: 5000, rev: 25000, m: "60%", gp: 15000 },
];

const SCENARIOS = [
  { name: "100 mixed projects", avg: 50000, rev: 5000000, gp: 1750000 },
  { name: "100 pools at $90K", avg: 90000, rev: 9000000, gp: 3150000 },
  { name: "100 pools at $100K", avg: 100000, rev: 10000000, gp: 3500000 },
  { name: "100 premium pools at $120K", avg: 120000, rev: 12000000, gp: 4200000 },
];

// Combined revenue = construction (consumer) + other streams already in the 100 Pools model (total − consumer) + software with add-ons.
const YEARS = [
  { y: "2025–26 actual", p: 4, build: 178675, other: 0, saas: 0 },
  { y: "Year 1", p: 100, build: 5000000, other: 977500, saas: 648000 },
  { y: "Year 2", p: 175, build: 8750000, other: 2662500, saas: 1620000 },
  { y: "Year 3", p: 275, build: 13750000, other: 6100000, saas: 3645000 },
  { y: "Year 4", p: 425, build: 21250000, other: 12200000, saas: 7290000 },
  { y: "Year 5", p: 650, build: 32500000, other: 22175000, saas: 12960000 },
].map((r) => ({ ...r, rev: r.build + r.other + r.saas }));
const FIVE_YEAR_TOTAL = YEARS.slice(1).reduce((t, r) => t + r.rev, 0);

const PACKAGES = [
  { name: "Starter Studio", price: 5000, seats: 2, gp: 4000, y1: 10000 },
  { name: "Pro Business", price: 15000, seats: 5, gp: 12000, y1: 20000 },
  { name: "Enterprise GC", price: 50000, seats: 15, gp: 40000, y1: 55000 },
];

const SAAS_SCALE = [
  { c: 100, rev: 1350000, mrr: 112500 },
  { c: 250, rev: 3375000, mrr: 281250 },
  { c: 500, rev: 6750000, mrr: 562500 },
  { c: 1000, rev: 13500000, mrr: 1125000 },
  { c: 2500, rev: 33750000, mrr: 2812500 },
];

const TEAM = [
  { name: "Ricardo Font", role: "Founder & CEO", url: "https://www.linkedin.com/in/ricardo-font-952034248/" },
  { name: "Khalia Padilla", role: "Founder & Creative Director", url: "https://www.linkedin.com/in/khaliapadilla/" },
  { name: "Marino Padilla", role: "GC & Co-Founder", url: "https://www.linkedin.com/in/jose-padilla-2018/" },
  { name: "Betty López", role: "CFO & Co-Founder", url: "https://www.linkedin.com/in/lópez-betty-a6671125/" },
  { name: "Roberto Font", role: "Strategic Advisor & Co-Founder", url: "" },
];

const Kicker = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">
    <span className="tabular-nums">{n}</span> <span className="mx-2">—</span> {children}
  </p>
);

const Chapter = ({ n, kicker, title, lede, children }: { n: string; kicker: string; title: React.ReactNode; lede?: string; children?: React.ReactNode }) => (
  <section className="border-t border-border px-6 py-24 md:py-32">
    <div className="mx-auto max-w-6xl">
      <Kicker n={n}>{kicker}</Kicker>
      <h2 className="mt-6 max-w-4xl font-serif text-5xl font-light leading-[1.02] tracking-tight md:text-7xl">{title}</h2>
      {lede && <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>}
      {children && <div className="mt-16">{children}</div>}
    </div>
  </section>
);

const Figure = ({ v, l }: { v: string; l: string }) => (
  <div className="border-t border-foreground pt-4">
    <p className="font-serif text-5xl font-light tracking-tight md:text-6xl">{v}</p>
    <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{l}</p>
  </div>
);

const Bar = ({ pct }: { pct: number }) => (
  <div className="h-px w-full bg-border"><div className="h-px bg-foreground" style={{ width: `${pct}%` }} /></div>
);

const InvestorDeck = () => {
  const maxYear = YEARS[YEARS.length - 1].rev;
  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Masthead */}
      <header className="flex items-center justify-between border-b border-border px-6 py-5 text-[10px] uppercase tracking-[0.45em]">
        <Link to="/" className="hover:opacity-60">Wonderlands World</Link>
        <span className="hidden text-muted-foreground sm:inline">Investor Edition · 2026</span>
        <Link to="/investors" className="hover:opacity-60">Data Room</Link>
      </header>

      {/* Cover */}
      <section className="px-6 pb-16 pt-20 md:pt-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground">The Investor Issue</p>
          <h1 className="mt-6 font-serif text-[16vw] font-light leading-[0.88] tracking-tight md:text-[10rem]">
            Wonder<em className="italic">lands</em>
          </h1>
          <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <p className="font-serif text-2xl font-light leading-snug md:text-3xl">
              Luxury outdoor living, built and sold on our own technology — one hundred projects to a five-million-dollar year.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A Florida design-build house for pools, outdoor kitchens and resort backyards, paired with a software platform licensed to contractors nationwide.
            </p>
          </div>
        </div>
        <figure className="mx-auto mt-16 max-w-6xl">
          <img src={wonderlandsHero} alt="Wonderlands resort backyard" loading="lazy" className="aspect-[21/9] w-full object-cover" />
          <figcaption className="mt-3 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Plate I — The Wonderlands experience</figcaption>
        </figure>
      </section>

      {/* At a glance */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Figure v={usd(YEARS[1].rev)} l="Year 1 · all revenue models" />
          <Figure v="$5M" l="Year 1 · 100 mixed projects" />
          <Figure v={usd(YEARS[5].rev)} l="Year 5 · all revenue models" />
          <Figure v={usd(FIVE_YEAR_TOTAL)} l="Five-year cumulative revenue" />
        </div>
      </section>

      <Chapter n="01" kicker="The problem" title={<>A fragmented market, <em className="italic">months</em> lost.</>}
        lede="Homeowners coordinate a pool builder, a paver crew, a kitchen fabricator, a landscaper and a permit office — separately. Projects stall between trades and budgets drift.">
        <div className="grid gap-px bg-border md:grid-cols-4">
          {[["Weeks 1–4", "Find a pool contractor"], ["Weeks 5–10", "Wait for permits"], ["Weeks 11–16", "Hire hardscape and decks"], ["Weeks 17+", "Kitchens, lighting, landscape"]].map(([w, t]) => (
            <div key={w} className="bg-background p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{w}</p>
              <p className="mt-3 font-serif text-2xl font-light">{t}</p>
            </div>
          ))}
        </div>
      </Chapter>

      <Chapter n="02" kicker="The solution" title={<>One house. Every trade. <em className="italic">One contract.</em></>}
        lede="Wonderlands designs in 3D, quotes instantly and builds the entire backyard under a single agreement — pool, deck, kitchen, enclosure, spa and landscape.">
        <div className="grid gap-8 md:grid-cols-3">
          {[[luxuryPoolImg, "Pools & spas"], [outdoorKitchen, "Outdoor kitchens"], [lanaiDeluxe, "Enclosures & lanais"]].map(([src, t], i) => (
            <figure key={t}>
              <img src={src} alt={t} loading="lazy" className="aspect-[4/5] w-full object-cover" />
              <figcaption className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                <span>{t}</span><span>Plate {["II", "III", "IV"][i]}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Chapter>

      <Chapter n="03" kicker="The 100-project year" title={<>Five million dollars, <em className="italic">itemised.</em></>}
        lede="One hundred projects at an average ticket of $50,000, blended margin 34.65%.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-foreground text-left text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr><th className="py-3 font-normal">Category</th><th className="font-normal">Projects</th><th className="font-normal">Avg ticket</th><th className="font-normal">Revenue</th><th className="font-normal">Margin</th><th className="font-normal">Gross profit</th></tr>
            </thead>
            <tbody>
              {MIX.map((r) => (
                <tr key={r.cat} className="border-b border-border">
                  <td className="py-4 font-serif text-lg">{r.cat}</td>
                  <td className="tabular-nums">{r.n}</td><td className="tabular-nums">{usd(r.avg)}</td>
                  <td className="tabular-nums">{r.rev.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</td>
                  <td className="tabular-nums">{r.m}</td>
                  <td className="tabular-nums">{r.gp.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
              <tr className="border-b border-foreground font-medium">
                <td className="py-4 font-serif text-lg">Total</td><td>100</td><td>$50K</td><td>$5,000,000</td><td>34.65%</td><td>$1,732,500</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Chapter>

      <Chapter n="04" kicker="Scenarios" title={<>The same hundred, <em className="italic">priced up.</em></>}
        lede="Holding volume at one hundred projects, a pools-only mix lifts revenue to $10M at a 35% gross margin.">
        <div className="grid gap-px bg-border md:grid-cols-4">
          {SCENARIOS.map((s) => (
            <div key={s.name} className="bg-background p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{s.name}</p>
              <p className="mt-6 font-serif text-5xl font-light">{usd(s.rev)}</p>
              <p className="mt-2 text-sm text-muted-foreground">Gross {usd(s.gp)} · avg {usd(s.avg)}</p>
            </div>
          ))}
        </div>
      </Chapter>

      <Chapter n="05" kicker="Combined five-year projection" title={<>Every revenue model, <em className="italic">one line.</em></>}
        lede="Construction, the other income streams in the 100 Pools model, and software subscriptions with add-ons — added together on the mixed-project path. On the pools-only path Year 5 reaches $111.5M combined.">
        <div className="mb-8 flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-2 w-6 bg-foreground" />Construction</span>
          <span className="flex items-center gap-2"><span className="h-2 w-6 bg-foreground/50" />Other model streams</span>
          <span className="flex items-center gap-2"><span className="h-2 w-6 bg-foreground/20" />Software</span>
        </div>
        <div className="space-y-6">
          {YEARS.map((y) => (
            <div key={y.y} className="grid grid-cols-[110px_1fr_110px] items-center gap-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{y.y}</p>
              <div className="flex h-2" style={{ width: `${Math.max(1, (y.rev / maxYear) * 100)}%` }}>
                <div className="bg-foreground" style={{ flex: y.build }} />
                <div className="bg-foreground/50" style={{ flex: y.other }} />
                <div className="bg-foreground/20" style={{ flex: y.saas }} />
              </div>
              <p className="text-right font-serif text-2xl font-light tabular-nums">{usd(y.rev)}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-foreground text-left text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr><th className="py-3 font-normal">Year</th><th className="font-normal">Projects</th><th className="font-normal">Construction</th><th className="font-normal">Other streams</th><th className="font-normal">Software</th><th className="font-normal">Combined</th></tr>
            </thead>
            <tbody>
              {YEARS.map((y) => (
                <tr key={y.y} className="border-b border-border tabular-nums">
                  <td className="py-4 font-serif text-lg">{y.y}</td><td>{y.p}</td><td>{usd(y.build)}</td><td>{y.other ? usd(y.other) : "—"}</td><td>{y.saas ? usd(y.saas) : "—"}</td><td className="font-medium">{usd(y.rev)}</td>
                </tr>
              ))}
              <tr className="border-b border-foreground font-medium"><td className="py-4 font-serif text-lg" colSpan={5}>Five-year total (Years 1–5)</td><td>{usd(FIVE_YEAR_TOTAL)}</td></tr>
            </tbody>
          </table>
        </div>
      </Chapter>

      <figure className="px-6">
        <img src={luxuryOutdoorImg} alt="Evening outdoor living" loading="lazy" className="mx-auto aspect-[21/9] w-full max-w-6xl object-cover" />
      </figure>

      <Chapter n="06" kicker="The platform" title={<>Software, sold to <em className="italic">every contractor.</em></>}
        lede="The tools we build with — 3D design, quoting, CRM, invoicing and website builder — licensed to contractors at an 80% gross margin, plus a $5,000 setup fee.">
        <div className="grid gap-px bg-border md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.name} className="bg-background p-8">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{p.seats} seats</p>
              <p className="mt-4 font-serif text-3xl font-light">{p.name}</p>
              <p className="mt-6 font-serif text-5xl font-light">{usd(p.price)}<span className="text-base text-muted-foreground"> / year</span></p>
              <p className="mt-3 text-sm text-muted-foreground">Gross {usd(p.gp)} · Year-one value {usd(p.y1)}</p>
            </div>
          ))}
        </div>
        <p className="mt-16 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Scale · mix 40% Starter / 50% Pro / 10% Enterprise</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-foreground text-left text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr><th className="py-3 font-normal">Customers</th><th className="font-normal">Annual revenue</th><th className="font-normal">Gross (80%)</th><th className="font-normal">MRR</th></tr>
            </thead>
            <tbody>
              {SAAS_SCALE.map((s) => (
                <tr key={s.c} className="border-b border-border">
                  <td className="py-4 font-serif text-lg tabular-nums">{s.c.toLocaleString()}</td>
                  <td className="tabular-nums">{usd(s.rev)}</td><td className="tabular-nums">{usd(s.rev * 0.8)}</td><td className="tabular-nums">{usd(s.mrr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Chapter>

      <Chapter n="07" kicker="The masthead" title={<>The people <em className="italic">behind it.</em></>}>
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
          {TEAM.map((t) => (
            <div key={t.name} className="bg-background p-6">
              <p className="font-serif text-2xl font-light">{t.name}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{t.role}</p>
              {t.url && <a href={t.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs underline underline-offset-4 hover:opacity-60">LinkedIn</a>}
            </div>
          ))}
        </div>
      </Chapter>

      {/* Closing */}
      <section className="relative">
        <img src={firePitImg} alt="" loading="lazy" className="h-[70vh] w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-background">
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-80">Join us</p>
          <h2 className="mt-6 max-w-3xl font-serif text-5xl font-light leading-tight md:text-7xl">Build the backyard <em className="italic">economy</em> with us.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-[0.35em]">
            <a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer" className="border border-background px-8 py-4 hover:bg-background hover:text-foreground">Book a call</a>
            <Link to="/investors" className="border border-background px-8 py-4 hover:bg-background hover:text-foreground">Enter the data room</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        Wonderlands World · Confidential investor material · Figures are projections
      </footer>
    </main>
  );
};

export default InvestorDeck;
