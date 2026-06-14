import { useState } from "react";
import { Link } from "react-router-dom";
import wonderlandsLogo from "@/assets/wonderlands-logo.png";
import heroPool from "@/assets/hero-pool-optimized.webp";
import maximaPool from "@/assets/maxima-pool.jpg";
import sunsetGrove from "@/assets/sunset-grove-kit-pool.jpg";
import poolBanner from "@/assets/pool-banner-2.jpg";
import hero1 from "@/assets/hero-carousel-1.jpg";
import hero2 from "@/assets/hero-carousel-2.jpg";
import hero3 from "@/assets/hero-carousel-3.jpg";
import poolTexture from "@/assets/pool-texture-sapphire.jpg";

/**
 * /design — 5 luxury, relaxation & technology proposals
 * All proposals share the Wonderlands logo and use real Wonderlands content.
 */

type Proposal = {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  palette: string[];
  fonts: { heading: string; body: string };
  render: () => JSX.Element;
};

/* ---------- Shared Wonderlands content ---------- */
const COLLECTIONS = [
  {
    name: "Maxima",
    line: "Wonderlands Fiberglass",
    blurb: "A 16×35 statement pool with deep-end diving and an integrated sun shelf.",
    price: "from $84,500",
    img: maximaPool,
  },
  {
    name: "Sunset Grove",
    line: "Signature Kit Pool",
    blurb: "A turnkey courtyard pool engineered for two-week installation.",
    price: "from $62,000",
    img: sunsetGrove,
  },
  {
    name: "Sapphire Lagoon",
    line: "Custom Wonderlands Build",
    blurb: "Curved coping, gradient finish and integrated tanning ledge.",
    price: "from $128,000",
    img: heroPool,
  },
];

const FEATURES = [
  { k: "Real-time 3D", v: "Design your pool in the browser, see costs update live." },
  { k: "Lifetime shell warranty", v: "Wonderlands fiberglass shells, warrantied for life." },
  { k: "14-day installation", v: "From excavation to first swim, on a fixed schedule." },
  { k: "Smart automation", v: "Heat, lights, jets and chemistry — all from your phone." },
];

const Logo = ({ invert = false }: { invert?: boolean }) => (
  <div className="flex items-center gap-3">
    <img
      src={wonderlandsLogo}
      alt="Wonderlands"
      className={`h-9 w-auto ${invert ? "brightness-0 invert" : ""}`}
    />
  </div>
);

/* ============================================================
 * 1. SERENE NOIR — Cinematic dark luxury
 * ============================================================ */
const SereneNoir = () => (
  <div
    className="rounded-3xl overflow-hidden border border-[#1a1a1a]"
    style={{ background: "#070707", color: "#e8e4d8", fontFamily: "'Manrope', sans-serif" }}
  >
    <header className="flex items-center justify-between px-10 py-6 border-b border-white/5">
      <Logo invert />
      <nav className="hidden md:flex gap-10 text-[11px] tracking-[0.3em] uppercase text-white/60">
        <a>Collection</a><a>Designer</a><a>Atelier</a><a>Concierge</a>
      </nav>
      <button className="text-[11px] tracking-[0.3em] uppercase border border-[#c9a84c] text-[#c9a84c] px-5 py-2.5 hover:bg-[#c9a84c] hover:text-black transition-all duration-500">
        Reserve a call
      </button>
    </header>

    <section className="relative">
      <div className="absolute inset-0">
        <img src={heroPool} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-transparent" />
      </div>
      <div className="relative px-10 py-32 max-w-3xl">
        <p className="text-[10px] tracking-[0.5em] text-[#c9a84c] mb-8">EST · MMXIX · FLORIDA</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }} className="text-7xl md:text-[5.5rem] leading-[0.95] mb-8">
          The quiet luxury<br/>of <em style={{ color: "#c9a84c" }}>still water.</em>
        </h1>
        <p className="text-white/70 max-w-lg mb-10 leading-relaxed text-lg">
          Wonderlands commissions hand-finished fiberglass pools and integrated
          smart-water systems for residences that ask for more than a pool.
        </p>
        <div className="flex gap-3">
          <button className="bg-[#c9a84c] text-black px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase">Begin a commission</button>
          <button className="border border-white/20 px-7 py-3.5 text-[11px] tracking-[0.3em] uppercase text-white/80">View atelier</button>
        </div>
      </div>
    </section>

    <section className="px-10 py-20 grid md:grid-cols-3 gap-px bg-white/5">
      {COLLECTIONS.map((c, i) => (
        <div key={c.name} className="bg-[#070707] p-8 group cursor-pointer">
          <div className="aspect-[4/5] overflow-hidden mb-6">
            <img src={c.img} className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 transition duration-1000" />
          </div>
          <p className="text-[10px] tracking-[0.4em] text-[#c9a84c] mb-2">N° 0{i + 1} · {c.line}</p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl font-light mb-2">{c.name}</h3>
          <p className="text-sm text-white/50 mb-4">{c.blurb}</p>
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/80">{c.price}</p>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 2. ATELIER BLANC — Soft daylight luxury, spa-like calm
 * ============================================================ */
const AtelierBlanc = () => (
  <div
    className="rounded-3xl overflow-hidden"
    style={{
      background: "linear-gradient(180deg,#fbf8f3 0%,#f0ebe2 100%)",
      color: "#2a2520",
      fontFamily: "'Manrope', sans-serif",
    }}
  >
    <header className="flex items-center justify-between px-10 py-6">
      <Logo />
      <nav className="hidden md:flex gap-10 text-sm text-[#5a5045]">
        <a>Collection</a><a>Studio</a><a>Journal</a><a>Visit</a>
      </nav>
      <button className="bg-[#2a2520] text-white px-6 py-2.5 rounded-full text-sm tracking-wide">
        Book a consultation
      </button>
    </header>

    <section className="px-10 py-16 grid md:grid-cols-12 gap-10 items-end">
      <div className="md:col-span-6">
        <span className="inline-block bg-[#0891b2]/10 text-[#0891b2] px-3 py-1 rounded-full text-xs font-medium tracking-wide mb-6">
          Wonderlands · Residential commissions
        </span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }} className="text-7xl md:text-[5.5rem] leading-[0.95] mb-8">
          A pool that breathes <em>with the house.</em>
        </h1>
        <p className="text-[#5a5045] max-w-md mb-10 text-lg leading-relaxed">
          Considered geometry, hand-tuned chemistry, and a 3D studio that lets you
          shape every inch before a single shovel hits the ground.
        </p>
        <div className="flex gap-3">
          <button className="bg-[#f97066] text-white px-6 py-3.5 rounded-full font-medium">Open the studio →</button>
          <button className="bg-white px-6 py-3.5 rounded-full font-medium border border-[#2a2520]/10">Browse the collection</button>
        </div>
      </div>
      <div className="md:col-span-6 relative">
        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden">
          <img src={maximaPool} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl shadow-black/5 p-5 w-56">
          <div style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl">2,400+</div>
          <div className="text-xs text-[#5a5045] mt-1">commissions delivered across Florida</div>
        </div>
      </div>
    </section>

    <section className="px-10 pb-16 grid md:grid-cols-3 gap-5">
      {COLLECTIONS.map((c) => (
        <article key={c.name} className="bg-white rounded-3xl overflow-hidden hover:-translate-y-1 transition duration-500 shadow-sm">
          <img src={c.img} className="w-full aspect-[5/4] object-cover" />
          <div className="p-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#0891b2] mb-2">{c.line}</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl mb-2">{c.name}</h3>
            <p className="text-sm text-[#5a5045] mb-4">{c.blurb}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{c.price}</span>
              <span className="text-sm text-[#f97066]">Configure →</span>
            </div>
          </div>
        </article>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 3. AURORA TECH — Glassmorphic 3D studio, app-like
 * ============================================================ */
const AuroraTech = () => (
  <div
    className="rounded-3xl overflow-hidden relative"
    style={{
      background:
        "radial-gradient(ellipse at top left,#0891b288 0%,transparent 55%),radial-gradient(ellipse at bottom right,#f9706655 0%,transparent 55%),#050b18",
      color: "#e8edf3",
      fontFamily: "'Inter', sans-serif",
    }}
  >
    <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
      backgroundSize: "44px 44px",
    }} />

    <header className="relative flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <Logo invert />
      <nav className="hidden md:flex gap-7 text-sm text-white/70">
        <a>Designer</a><a>Catalog</a><a>Automation</a><a>Pricing</a>
      </nav>
      <button className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium">Launch studio →</button>
    </header>

    <section className="relative px-8 py-24 text-center">
      <div className="inline-flex items-center gap-2 backdrop-blur bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs mb-8">
        <span className="w-2 h-2 rounded-full bg-[#0891b2] animate-pulse" />
        Wonderlands Studio · real-time 3D · live pricing
      </div>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600 }} className="text-6xl md:text-7xl tracking-tight max-w-4xl mx-auto leading-[1.02] mb-6">
        Design your backyard{" "}
        <span style={{
          background: "linear-gradient(90deg,#0891b2,#f97066)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>before we build it.</span>
      </h1>
      <p className="text-white/60 max-w-xl mx-auto mb-10 text-lg">
        Drop in your pool, shape the deck, swap finishes — watch the quote update
        in real time. From idea to signed invoice in an afternoon.
      </p>
      <div className="flex gap-3 justify-center">
        <button className="bg-white text-black rounded-full px-6 py-3 font-medium">Open Wonderlands Studio</button>
        <button className="backdrop-blur bg-white/5 border border-white/10 rounded-full px-6 py-3">See it in action</button>
      </div>

      <div className="mt-16 max-w-5xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <img src={heroPool} className="w-full aspect-[16/8] object-cover opacity-90" />
      </div>
    </section>

    <section className="relative px-8 pb-16 grid md:grid-cols-3 gap-4">
      {COLLECTIONS.map((c) => (
        <div key={c.name} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition duration-500">
          <div className="aspect-video rounded-xl overflow-hidden mb-4">
            <img src={c.img} className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-between items-baseline mb-1">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm" style={{
              background: "linear-gradient(90deg,#0891b2,#f97066)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{c.price}</div>
          </div>
          <p className="text-xs text-white/50">{c.blurb}</p>
        </div>
      ))}
    </section>

    <section className="relative px-8 pb-16 grid md:grid-cols-4 gap-px bg-white/10 mx-8 rounded-2xl overflow-hidden">
      {FEATURES.map((f) => (
        <div key={f.k} className="bg-[#050b18] p-6 backdrop-blur">
          <div className="text-sm font-semibold mb-2" style={{
            background: "linear-gradient(90deg,#0891b2,#f97066)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>{f.k}</div>
          <div className="text-xs text-white/60">{f.v}</div>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 4. EDITORIAL CALM — Magazine, slow, considered
 * ============================================================ */
const EditorialCalm = () => (
  <div
    className="rounded-3xl overflow-hidden border border-[#1a1a1a]"
    style={{ background: "#f5f3ee", color: "#0d0d0d", fontFamily: "'Manrope', sans-serif" }}
  >
    <header className="flex items-center justify-between px-10 py-6 border-b border-black/80">
      <Logo />
      <nav className="hidden md:flex gap-8 text-sm">
        <a className="underline underline-offset-4">Vol. VI</a>
        <a>Collection</a><a>Stories</a><a>Studio</a>
      </nav>
      <div className="text-xs uppercase tracking-[0.25em]">June · 2026</div>
    </header>

    <section className="grid md:grid-cols-12">
      <div className="md:col-span-7 p-12 border-r border-black/80">
        <p className="text-xs uppercase tracking-[0.3em] mb-6">Cover Story · The Maxima Commission</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }} className="text-7xl md:text-[6.5rem] leading-[0.92] mb-10">
          On the quiet<br/>luxury<br/><em>of water.</em>
        </h1>
        <div className="grid grid-cols-2 gap-8 max-w-2xl">
          <p className="text-sm leading-relaxed">
            Twelve Florida residences, each centered on a Wonderlands pool —
            a study in how water became the most considered room of the house.
          </p>
          <p className="text-sm leading-relaxed">
            Featuring commissions from the Wonderlands atelier, with material
            studies from the in-house design team and a guide to the new
            Sapphire Lagoon finish.
          </p>
        </div>
        <button className="mt-10 text-sm underline underline-offset-4">Read the issue →</button>
      </div>
      <div className="md:col-span-5 relative border-b md:border-b-0 border-black/80">
        <img src={heroPool} className="w-full h-full object-cover" />
      </div>
    </section>

    <section className="grid md:grid-cols-3 divide-x divide-black/80 border-t border-black/80">
      {COLLECTIONS.map((c, i) => (
        <article key={c.name} className="p-8">
          <div className="flex justify-between text-xs uppercase tracking-[0.25em] mb-4">
            <span>0{i + 1}</span><span>{c.line}</span>
          </div>
          <div className="aspect-[4/3] overflow-hidden mb-5">
            <img src={c.img} className="w-full h-full object-cover" />
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl mb-2">{c.name}</h3>
          <p className="text-sm text-[#5a5a5a] mb-4">{c.blurb}</p>
          <p className="text-xs uppercase tracking-[0.25em]">{c.price}</p>
        </article>
      ))}
    </section>

    <section className="border-t border-black/80 px-10 py-12 grid md:grid-cols-4 gap-10">
      {FEATURES.map((f, i) => (
        <div key={f.k}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl mb-2">0{i + 1}</div>
          <div className="text-sm font-semibold mb-1">{f.k}</div>
          <div className="text-xs text-[#5a5a5a] leading-relaxed">{f.v}</div>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 5. COASTAL OBSIDIAN — Deep ocean, teal & coral, immersive
 * ============================================================ */
const CoastalObsidian = () => (
  <div
    className="rounded-3xl overflow-hidden relative"
    style={{
      background: "linear-gradient(180deg,#031b25 0%,#072c3a 60%,#031b25 100%)",
      color: "#e8f4f8",
      fontFamily: "'Manrope', sans-serif",
    }}
  >
    <header className="relative flex items-center justify-between px-10 py-6 border-b border-white/10">
      <Logo invert />
      <nav className="hidden md:flex gap-8 text-sm text-white/70">
        <a>Pools</a><a>Spas</a><a>Studio</a><a>Smart Home</a>
      </nav>
      <button className="bg-[#f97066] text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-[#f97066]/30">
        Get a quote
      </button>
    </header>

    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={poolTexture} className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#031b25] via-transparent to-[#031b25]/60" />
      </div>
      <div className="relative px-10 py-28 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0891b2]" /> Wonderlands · est. 2019
          </span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300 }} className="text-6xl md:text-7xl leading-[0.95] mb-8">
            Backyards that feel like a <span style={{
              background: "linear-gradient(90deg,#5eead4,#f97066)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>private coastline.</span>
          </h1>
          <p className="text-white/70 max-w-lg mb-10 text-lg leading-relaxed">
            Architectural pools, intelligent automation, and a concierge build
            process — engineered for the Florida home.
          </p>
          <div className="flex gap-3">
            <button className="bg-[#f97066] text-white rounded-full px-7 py-3.5 font-medium">Design mine →</button>
            <button className="backdrop-blur bg-white/5 border border-white/20 rounded-full px-7 py-3.5">Watch a build</button>
          </div>
        </div>
        <div className="md:col-span-5 grid grid-cols-2 gap-3">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden col-span-1 row-span-2">
            <img src={maximaPool} className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img src={sunsetGrove} className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden">
            <img src={poolBanner} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <section className="relative px-10 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#5eead4] mb-2">The Collection</p>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300 }} className="text-4xl">Selected commissions</h2>
        </div>
        <a className="text-sm text-white/70 underline underline-offset-4">View all →</a>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {COLLECTIONS.map((c) => (
          <div key={c.name} className="group rounded-3xl overflow-hidden bg-white/5 backdrop-blur border border-white/10 hover:border-[#5eead4]/40 transition duration-500">
            <div className="aspect-[5/4] overflow-hidden">
              <img src={c.img} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" />
            </div>
            <div className="p-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#5eead4] mb-2">{c.line}</p>
              <h3 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl mb-2">{c.name}</h3>
              <p className="text-sm text-white/60 mb-4">{c.blurb}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">{c.price}</span>
                <span className="text-[#f97066]">Configure →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="relative px-10 pb-16 grid md:grid-cols-4 gap-3">
      {FEATURES.map((f) => (
        <div key={f.k} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5">
          <div className="text-sm font-semibold text-[#5eead4] mb-1">{f.k}</div>
          <div className="text-xs text-white/60">{f.v}</div>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================ */
const PROPOSALS: Proposal[] = [
  {
    id: "serene-noir",
    name: "Serene Noir",
    tagline: "Cinematic dark luxury · concierge commissions",
    vibe: "Atelier, quiet, hand-finished",
    palette: ["#070707", "#1a1a1a", "#c9a84c", "#e8e4d8"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: SereneNoir,
  },
  {
    id: "atelier-blanc",
    name: "Atelier Blanc",
    tagline: "Soft daylight luxury · spa-like calm",
    vibe: "Warm, considered, residential",
    palette: ["#fbf8f3", "#f0ebe2", "#0891b2", "#f97066"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: AtelierBlanc,
  },
  {
    id: "aurora-tech",
    name: "Aurora Tech",
    tagline: "Glassmorphic 3D studio · app-like, futuristic",
    vibe: "Tech-forward, premium, instant",
    palette: ["#050b18", "#0891b2", "#f97066", "#e8edf3"],
    fonts: { heading: "Sora", body: "Inter" },
    render: AuroraTech,
  },
  {
    id: "editorial-calm",
    name: "Editorial Calm",
    tagline: "Magazine, slow, considered · brand storytelling",
    vibe: "Cultured, slow, narrative",
    palette: ["#f5f3ee", "#e8e4dd", "#0d0d0d", "#5a5a5a"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: EditorialCalm,
  },
  {
    id: "coastal-obsidian",
    name: "Coastal Obsidian",
    tagline: "Deep ocean teal & coral · immersive residential",
    vibe: "Florida-luxe, immersive, on-brand",
    palette: ["#031b25", "#072c3a", "#5eead4", "#f97066"],
    fonts: { heading: "Sora", body: "Manrope" },
    render: CoastalObsidian,
  },
];

const DesignProposals = () => {
  const [active, setActive] = useState<string>(PROPOSALS[0].id);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
      />

      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={wonderlandsLogo} alt="Wonderlands" className="h-8 w-auto" />
            <div>
              <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-900">← Back</Link>
              <h1 className="text-base font-semibold tracking-tight">Website style proposals</h1>
            </div>
          </div>
          <div className="hidden md:flex gap-1 bg-neutral-100 rounded-full p-1">
            {PROPOSALS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActive(p.id);
                  document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`px-4 py-1.5 rounded-full text-sm transition ${
                  active === p.id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-20">
        <section className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">5 Directions · luxury · relaxation · technology</p>
          <h2 className="text-5xl font-semibold tracking-tight mb-4">
            Five complete looks, built around Wonderlands.
          </h2>
          <p className="text-neutral-600 text-lg">
            Each proposal uses real Wonderlands content — the Maxima, Sunset Grove
            and Sapphire Lagoon commissions — and shares the same logo, so you
            can judge purely on tone, motion and feel.
          </p>
        </section>

        {PROPOSALS.map((p, i) => {
          const Render = p.render;
          return (
            <section key={p.id} id={p.id} className="scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs text-neutral-500 mb-2">Proposal 0{i + 1}</div>
                  <h3 className="text-3xl font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-neutral-600 mt-1">{p.tagline}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex gap-1.5">
                    {p.palette.map((c) => (
                      <div
                        key={c}
                        className="w-7 h-7 rounded-full border border-neutral-200"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-neutral-500">
                    <div><b className="text-neutral-900">Aa</b> {p.fonts.heading}</div>
                    <div>{p.fonts.body}</div>
                  </div>
                </div>
              </div>
              <Render />
              <div className="mt-3 text-xs text-neutral-500 italic">{p.vibe}</div>
            </section>
          );
        })}

        <footer className="border-t border-neutral-200 pt-8 pb-16 text-sm text-neutral-500">
          Tell us which direction to roll out site-wide — or mix elements from a few.
        </footer>
      </main>
    </div>
  );
};

export default DesignProposals;
