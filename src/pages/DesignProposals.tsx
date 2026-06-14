import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * /design — 5 full website style proposals
 * Each proposal is a self-contained preview block with its own
 * palette, typography, hero, nav, product card and footer mock.
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

/* ---------- Shared mock data ---------- */
const POOL_IMG =
  "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=70&auto=format&fit=crop";
const SPA_IMG =
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=70&auto=format&fit=crop";
const DECK_IMG =
  "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=1200&q=70&auto=format&fit=crop";

/* ============================================================
 * 1. NOIR & GOLD — Editorial luxury
 * ============================================================ */
const NoirGold = () => (
  <div
    className="rounded-3xl overflow-hidden border border-[#2a2418]"
    style={{ background: "#0d0d0d", color: "#f0e6cf", fontFamily: "'Manrope', sans-serif" }}
  >
    <header className="flex items-center justify-between px-10 py-6 border-b border-[#2a2418]">
      <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl tracking-[0.3em]">
        WONDER<span style={{ color: "#c9a84c" }}>·</span>LANDS
      </div>
      <nav className="hidden md:flex gap-8 text-xs tracking-[0.25em] uppercase text-[#a89878]">
        <a>Collection</a><a>Atelier</a><a>Journal</a><a>Concierge</a>
      </nav>
      <button className="text-xs tracking-[0.3em] uppercase border border-[#c9a84c] text-[#c9a84c] px-5 py-2 hover:bg-[#c9a84c] hover:text-black transition">
        Reserve
      </button>
    </header>

    <section className="relative px-10 py-24 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <p className="text-xs tracking-[0.4em] text-[#c9a84c] mb-6">EST · MMXIX</p>
        <h1
          style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300 }}
          className="text-6xl md:text-7xl leading-[0.95] mb-8"
        >
          The art of <em style={{ color: "#c9a84c", fontStyle: "italic" }}>still water</em>.
        </h1>
        <p className="text-[#a89878] max-w-md mb-10 leading-relaxed">
          Hand-finished pools and sculpted spas, commissioned for residences that
          refuse the ordinary.
        </p>
        <div className="flex gap-4">
          <button className="bg-[#c9a84c] text-black px-7 py-3 text-xs tracking-[0.3em] uppercase">Begin a commission</button>
          <button className="border border-[#2a2418] px-7 py-3 text-xs tracking-[0.3em] uppercase">View atelier</button>
        </div>
      </div>
      <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
        <img src={POOL_IMG} alt="" className="w-full h-full object-cover grayscale contrast-110" />
        <div className="absolute inset-0 ring-1 ring-[#c9a84c]/40" />
      </div>
    </section>

    <section className="px-10 pb-20 grid md:grid-cols-3 gap-px bg-[#2a2418]">
      {[POOL_IMG, SPA_IMG, DECK_IMG].map((src, i) => (
        <div key={i} className="bg-[#0d0d0d] p-8 group cursor-pointer">
          <div className="aspect-square overflow-hidden mb-6">
            <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          </div>
          <p className="text-[10px] tracking-[0.4em] text-[#c9a84c] mb-2">N° 0{i + 1}</p>
          <h3 style={{ fontFamily: "'Sora', sans-serif" }} className="text-2xl font-light">
            {["Maison Blanc", "Spa Lumière", "Promenade"][i]}
          </h3>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 2. CORAL DAYLIGHT — Warm, optimistic, Florida-modern
 * ============================================================ */
const CoralDaylight = () => (
  <div
    className="rounded-3xl overflow-hidden"
    style={{
      background: "linear-gradient(180deg, #fff7f0 0%, #ffe7d6 100%)",
      color: "#2a1a14",
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <header className="flex items-center justify-between px-8 py-5">
      <div
        style={{ fontFamily: "'Instrument Serif', serif" }}
        className="text-3xl"
      >
        wonderlands<span style={{ color: "#f97066" }}>.</span>
      </div>
      <nav className="hidden md:flex gap-7 text-sm font-medium">
        <a>Pools</a><a>Spas</a><a>Studio</a><a>Stories</a>
      </nav>
      <button className="bg-[#2a1a14] text-white px-5 py-2.5 rounded-full text-sm font-semibold">
        Get a quote
      </button>
    </header>

    <section className="px-8 pt-12 pb-20">
      <div className="grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-7">
          <span className="inline-block bg-[#f97066]/15 text-[#c44030] px-3 py-1 rounded-full text-xs font-semibold mb-6">
            ☀ Florida · Custom builds
          </span>
          <h1
            style={{ fontFamily: "'Instrument Serif', serif" }}
            className="text-7xl md:text-8xl leading-[0.9] mb-6"
          >
            Backyards that <em style={{ color: "#f97066" }}>feel like a vacation</em>.
          </h1>
          <p className="text-lg text-[#5a4035] max-w-lg mb-8">
            Designed in 3D, built in weeks, warrantied for life. Coastal-grade pools, spas and decks.
          </p>
          <div className="flex gap-3">
            <button className="bg-[#f97066] text-white px-6 py-3.5 rounded-full font-semibold shadow-lg shadow-[#f97066]/30">
              Design mine →
            </button>
            <button className="bg-white px-6 py-3.5 rounded-full font-semibold border border-[#2a1a14]/10">
              Watch the build
            </button>
          </div>
        </div>
        <div className="md:col-span-5 relative">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden">
            <img src={POOL_IMG} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 w-48">
            <div className="text-3xl font-bold">2,400+</div>
            <div className="text-xs text-[#5a4035]">happy backyards</div>
          </div>
          <div className="absolute -top-4 -right-4 bg-[#f97066] text-white rounded-full w-20 h-20 flex items-center justify-center text-xs font-bold text-center rotate-12">
            FROM<br/>$48k
          </div>
        </div>
      </div>
    </section>

    <section className="px-8 pb-12 grid md:grid-cols-3 gap-5">
      {[
        { t: "Wonderlands Pools", p: "from $48,000", img: POOL_IMG },
        { t: "Signature Spas", p: "from $12,000", img: SPA_IMG },
        { t: "Travertine Decks", p: "from $22/sqft", img: DECK_IMG },
      ].map((c, i) => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden hover:-translate-y-1 transition shadow-sm">
          <img src={c.img} className="w-full aspect-[5/4] object-cover" />
          <div className="p-5">
            <h3 className="font-bold text-lg">{c.t}</h3>
            <p className="text-sm text-[#f97066] font-semibold">{c.p}</p>
          </div>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 3. AQUA BRUTALIST — Bold, raw, neo-brutalist
 * ============================================================ */
const AquaBrutalist = () => (
  <div
    className="rounded-3xl overflow-hidden border-4 border-black"
    style={{ background: "#e8f4f1", color: "#0a0a0a", fontFamily: "'Space Grotesk', sans-serif" }}
  >
    <header className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#0891b2] text-white">
      <div className="text-2xl font-black tracking-tight">▌WONDERLANDS</div>
      <nav className="hidden md:flex gap-1">
        {["POOLS", "SPAS", "STUDIO", "BUILDS"].map((n) => (
          <a key={n} className="px-3 py-1.5 font-bold text-sm border-2 border-transparent hover:border-white hover:bg-black">
            {n}
          </a>
        ))}
      </nav>
      <button className="bg-[#f97066] text-black px-5 py-2 font-black border-2 border-black shadow-[4px_4px_0_0_#000]">
        QUOTE →
      </button>
    </header>

    <section className="p-6 grid md:grid-cols-2 gap-6">
      <div className="bg-[#f97066] border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
        <div className="text-xs font-black bg-black text-[#f97066] inline-block px-2 py-1 mb-4">
          NEW · 2026
        </div>
        <h1 className="text-6xl md:text-7xl font-black leading-[0.85] mb-5 uppercase">
          Build a<br/>damn good<br/>pool.
        </h1>
        <p className="font-bold mb-6 text-lg">No fluff. No salespeople. Configure → quote → built.</p>
        <button className="bg-black text-white px-6 py-3 font-black uppercase border-4 border-black hover:bg-white hover:text-black">
          Start configurator
        </button>
      </div>
      <div className="grid grid-rows-2 gap-6">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
          <div className="text-7xl font-black">280<span className="text-2xl">$/sqft</span></div>
          <div className="font-bold uppercase text-sm">Flat shell pricing</div>
        </div>
        <div className="bg-[#0891b2] text-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
          <div className="text-7xl font-black">14<span className="text-2xl">days</span></div>
          <div className="font-bold uppercase text-sm">Avg install time</div>
        </div>
      </div>
    </section>

    <section className="p-6 pt-0 grid md:grid-cols-3 gap-6">
      {[POOL_IMG, SPA_IMG, DECK_IMG].map((src, i) => (
        <div key={i} className="bg-white border-4 border-black shadow-[6px_6px_0_0_#000]">
          <div className="aspect-square overflow-hidden border-b-4 border-black">
            <img src={src} className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex justify-between items-center">
            <div className="font-black uppercase">Model 0{i + 1}</div>
            <div className="font-black text-[#f97066]">→</div>
          </div>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 4. GLASS AURORA — Glassmorphic, futuristic, premium tech
 * ============================================================ */
const GlassAurora = () => (
  <div
    className="rounded-3xl overflow-hidden relative"
    style={{
      background:
        "radial-gradient(ellipse at top left, #4ade8055 0%, transparent 50%), radial-gradient(ellipse at bottom right, #a78bfa55 0%, transparent 50%), #0a0a18",
      color: "#e8e8f0",
      fontFamily: "'Inter', sans-serif",
    }}
  >
    <div className="absolute inset-0 opacity-30" style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
      backgroundSize: "40px 40px",
    }} />

    <header className="relative flex items-center justify-between px-8 py-5 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4ade80] to-[#a78bfa]" />
        <div className="font-semibold tracking-tight">Wonderlands</div>
      </div>
      <nav className="hidden md:flex gap-6 text-sm text-white/70">
        <a>Designer</a><a>Catalog</a><a>Cloud</a><a>Pricing</a>
      </nav>
      <button className="bg-white/10 backdrop-blur border border-white/20 rounded-full px-5 py-2 text-sm hover:bg-white/20">
        Launch app
      </button>
    </header>

    <section className="relative px-8 py-20 text-center">
      <div className="inline-flex items-center gap-2 backdrop-blur bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs mb-8">
        <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
        Real-time 3D pool designer · v6
      </div>
      <h1 className="text-6xl md:text-7xl font-semibold tracking-tight max-w-4xl mx-auto leading-[1.05] mb-6">
        Design your pool in{" "}
        <span style={{
          background: "linear-gradient(90deg,#4ade80,#a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>3D, instantly.</span>
      </h1>
      <p className="text-white/60 max-w-xl mx-auto mb-10">
        A live configurator, accurate pricing, and a quote in your inbox — all before the contractor calls back.
      </p>
      <div className="flex gap-3 justify-center">
        <button className="bg-white text-black rounded-full px-6 py-3 font-medium">Open the studio →</button>
        <button className="backdrop-blur bg-white/5 border border-white/10 rounded-full px-6 py-3">Watch demo</button>
      </div>
    </section>

    <section className="relative px-8 pb-12 grid md:grid-cols-3 gap-4">
      {[
        { t: "Pools", v: "120+", img: POOL_IMG },
        { t: "Spas", v: "40+", img: SPA_IMG },
        { t: "Deck materials", v: "60+", img: DECK_IMG },
      ].map((c, i) => (
        <div key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
          <div className="aspect-video rounded-xl overflow-hidden mb-3">
            <img src={c.img} className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-between items-baseline">
            <div className="font-medium">{c.t}</div>
            <div className="text-2xl font-semibold" style={{
              background: "linear-gradient(90deg,#4ade80,#a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{c.v}</div>
          </div>
        </div>
      ))}
    </section>
  </div>
);

/* ============================================================
 * 5. PAPER & INK — Swiss editorial, magazine grid
 * ============================================================ */
const PaperInk = () => (
  <div
    className="rounded-3xl overflow-hidden border border-[#1a1a1a]"
    style={{ background: "#f5f3ee", color: "#0d0d0d", fontFamily: "'Work Sans', sans-serif" }}
  >
    <header className="flex items-center justify-between px-10 py-6 border-b border-black">
      <div style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl italic">
        Wonderlands
      </div>
      <nav className="hidden md:flex gap-8 text-sm">
        <a className="underline underline-offset-4">Issue 06</a>
        <a>Index</a><a>Archive</a><a>Studio</a>
      </nav>
      <div className="text-xs uppercase tracking-widest">June · 2026</div>
    </header>

    <section className="grid md:grid-cols-12 gap-0 border-b border-black">
      <div className="md:col-span-7 p-10 border-r border-black">
        <p className="text-xs uppercase tracking-[0.3em] mb-6">Cover Story · Vol. VI</p>
        <h1
          style={{ fontFamily: "'DM Serif Display', serif" }}
          className="text-7xl md:text-[6rem] leading-[0.95] mb-8"
        >
          On the<br/>quiet luxury<br/><em>of water.</em>
        </h1>
        <div className="grid grid-cols-2 gap-6 max-w-xl">
          <p className="text-sm leading-relaxed">
            A photo essay across twelve Florida residences exploring how the
            pool became the most considered room of the house.
          </p>
          <p className="text-sm leading-relaxed">
            Featuring commissions from the Wonderlands atelier, with material
            studies by the in-house design team.
          </p>
        </div>
        <button className="mt-10 text-sm underline underline-offset-4">Read the issue →</button>
      </div>
      <div className="md:col-span-5 relative">
        <img src={POOL_IMG} className="w-full h-full object-cover" />
      </div>
    </section>

    <section className="grid md:grid-cols-3 divide-x divide-black border-b border-black">
      {[
        { n: "01", t: "Pools", img: POOL_IMG, sub: "Twelve commissions" },
        { n: "02", t: "Spas", img: SPA_IMG, sub: "A study in heat" },
        { n: "03", t: "Decks", img: DECK_IMG, sub: "Stone, sun, shadow" },
      ].map((c) => (
        <article key={c.n} className="p-8">
          <div className="flex justify-between text-xs uppercase tracking-widest mb-4">
            <span>{c.n}</span><span>Editorial</span>
          </div>
          <div className="aspect-[4/3] overflow-hidden mb-5">
            <img src={c.img} className="w-full h-full object-cover" />
          </div>
          <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl mb-1">{c.t}</h3>
          <p className="text-sm text-[#5a5a5a]">{c.sub}</p>
        </article>
      ))}
    </section>
  </div>
);

/* ============================================================ */
const PROPOSALS: Proposal[] = [
  {
    id: "noir-gold",
    name: "Noir & Gold",
    tagline: "Editorial luxury · for the highest-end commissions",
    vibe: "Hand-finished, atelier, concierge",
    palette: ["#0d0d0d", "#1a1a1a", "#c9a84c", "#f0d78c"],
    fonts: { heading: "Sora", body: "Manrope" },
    render: NoirGold,
  },
  {
    id: "coral-daylight",
    name: "Coral Daylight",
    tagline: "Warm, optimistic, Florida-modern · best mass appeal",
    vibe: "Sunny, friendly, residential",
    palette: ["#fff7f0", "#ffe7d6", "#f97066", "#2a1a14"],
    fonts: { heading: "Instrument Serif", body: "DM Sans" },
    render: CoralDaylight,
  },
  {
    id: "aqua-brutalist",
    name: "Aqua Brutalist",
    tagline: "Bold, raw, no-fluff · for the configurator-first audience",
    vibe: "Confident, direct, conversion-machine",
    palette: ["#e8f4f1", "#0891b2", "#f97066", "#000000"],
    fonts: { heading: "Space Grotesk", body: "Space Grotesk" },
    render: AquaBrutalist,
  },
  {
    id: "glass-aurora",
    name: "Glass Aurora",
    tagline: "Glassmorphic, futuristic · premium SaaS / 3D studio feel",
    vibe: "Tech-forward, app-like, modern",
    palette: ["#0a0a18", "#4ade80", "#a78bfa", "#e8e8f0"],
    fonts: { heading: "Inter", body: "Inter" },
    render: GlassAurora,
  },
  {
    id: "paper-ink",
    name: "Paper & Ink",
    tagline: "Swiss editorial, magazine grid · brand-storytelling forward",
    vibe: "Cultured, slow, considered",
    palette: ["#f5f3ee", "#e8e4dd", "#0d0d0d", "#5a5a5a"],
    fonts: { heading: "DM Serif Display", body: "Work Sans" },
    render: PaperInk,
  },
];

const DesignProposals = () => {
  const [active, setActive] = useState<string>(PROPOSALS[0].id);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Google fonts for previews */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600&family=Manrope:wght@400;600;700&family=Instrument+Serif&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;700;900&family=Inter:wght@400;500;600;700&family=DM+Serif+Display&family=Work+Sans:wght@400;500;600&display=swap"
      />

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-900">← Back</Link>
            <h1 className="text-xl font-semibold tracking-tight">Website style proposals</h1>
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
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">5 Directions</p>
          <h2 className="text-5xl font-semibold tracking-tight mb-4">
            Five complete looks for the entire site.
          </h2>
          <p className="text-neutral-600 text-lg">
            Each proposal includes a header, hero, product grid and visual language —
            ready to be applied across every page. Pick one and we'll roll it out site-wide.
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
