import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import wonderlandsLogo from "@/assets/wonderlands-logo.png";
import heroPool from "@/assets/hero-pool-optimized.webp";
import maximaPool from "@/assets/maxima-pool.jpg";
import sunsetGrove from "@/assets/sunset-grove-kit-pool.jpg";
import poolBanner from "@/assets/pool-banner-2.jpg";
import poolTexture from "@/assets/pool-texture-sapphire.jpg";
import luxuryPool from "@/assets/deck/luxury-pool.jpg";
import luxuryOutdoor from "@/assets/deck/luxury-outdoor.jpg";
import spa from "@/assets/deck/spa.jpg";
import hotTub from "@/assets/deck/hot-tub-spa.jpg";
import firePit from "@/assets/deck/fire-pit.jpg";
import lighting from "@/assets/deck/lighting.jpg";
import pergola from "@/assets/deck/pergola.jpg";
import outdoorKitchen from "@/assets/deck/outdoor-kitchen.jpg";

/**
 * /design — 5 NEW interactive proposals
 * Each proposal includes working UX: tabs, hover-reveal, configurators,
 * carousels, parallax, scroll-reveal.
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
const COLLECTION = [
  { name: "Maxima 16×35", line: "Wonderlands Fiberglass", blurb: "Deep-end diving with integrated sun shelf.", price: 84500, img: maximaPool },
  { name: "Sunset Grove", line: "Signature Kit Pool", blurb: "Turnkey courtyard pool, 2-week install.", price: 62000, img: sunsetGrove },
  { name: "Sapphire Lagoon", line: "Custom Wonderlands", blurb: "Curved coping, gradient finish, tanning ledge.", price: 128000, img: heroPool },
  { name: "Apollo 14", line: "Wonderlands Fiberglass", blurb: "Compact statement pool with bench seating.", price: 58000, img: luxuryPool },
];

const ESCAPE_TILES = [
  { t: "Hydrotherapy Spa", img: spa },
  { t: "Hot Tub", img: hotTub },
  { t: "Fire Pit Lounge", img: firePit },
  { t: "Ambient Lighting", img: lighting },
  { t: "Shade Pergola", img: pergola },
  { t: "Outdoor Kitchen", img: outdoorKitchen },
];

const Logo = ({ invert = false }: { invert?: boolean }) => (
  <img loading="lazy" decoding="async"
    src={wonderlandsLogo}
    alt="Wonderlands"
    className={`h-9 w-auto ${invert ? "brightness-0 invert" : ""}`}
  />
);

const formatUSD = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ============================================================
 * 1. IMMERSIVE PARALLAX — scroll-reactive hero, sticky configurator preview
 * ============================================================ */
const ImmersiveParallax = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
      setScroll(t);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [active, setActive] = useState(0);
  const item = COLLECTION[active];

  return (
    <div
      ref={ref}
      className="rounded-3xl overflow-hidden relative"
      style={{ background: "#04111a", color: "#e8f4f8", fontFamily: "'Manrope', sans-serif" }}
    >
      <header className="relative z-20 flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-sm">
        <Logo invert />
        <nav className="hidden md:flex gap-8 text-sm text-white/70">
          <a className="hover:text-white transition">Collection</a>
          <a className="hover:text-white transition">Studio</a>
          <a className="hover:text-white transition">Smart Home</a>
          <a className="hover:text-white transition">Concierge</a>
        </nav>
        <button className="bg-[#f97066] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition">
          Reserve a call
        </button>
      </header>

      {/* Parallax hero */}
      <section className="relative h-[640px] overflow-hidden">
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${scroll * 80}px) scale(${1 + scroll * 0.1})` }}
        >
          <img loading="lazy" decoding="async" src={heroPool} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04111a] via-[#04111a]/40 to-[#04111a]/60" />
        </div>
        <div
          className="relative z-10 px-10 pt-32 max-w-3xl"
          style={{ transform: `translateY(${-scroll * 40}px)`, opacity: 1 - scroll * 0.7 }}
        >
          <span className="inline-flex items-center gap-2 backdrop-blur bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5eead4] animate-pulse" />
            Scroll to explore
          </span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300 }} className="text-6xl md:text-7xl leading-[0.95] mb-6">
            A pool you can <span style={{
              background: "linear-gradient(90deg,#5eead4,#f97066)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>feel</span>, before it exists.
          </h1>
          <p className="text-white/70 max-w-lg text-lg">
            Real-time 3D, intelligent automation, concierge construction. Wonderlands builds the backyard you keep imagining.
          </p>
        </div>
      </section>

      {/* Interactive collection switcher */}
      <section className="px-10 py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#5eead4] mb-4">The Collection · tap to preview</p>
          {COLLECTION.map((c, i) => (
            <button
              key={c.name}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`text-left p-5 rounded-2xl border transition-all duration-500 ${
                active === i
                  ? "bg-white/10 border-[#5eead4]/50 translate-x-2"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/5"
              }`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <span style={{ fontFamily: "'Sora', sans-serif" }} className="text-xl">{c.name}</span>
                <span className="text-sm text-white/60">{formatUSD(c.price)}</span>
              </div>
              <p className="text-xs text-white/50">{c.blurb}</p>
            </button>
          ))}
        </div>
        <div className="md:col-span-7 relative">
          <div className="sticky top-6 aspect-[4/5] md:aspect-[4/4] rounded-3xl overflow-hidden bg-black">
            <img loading="lazy" decoding="async"
              key={item.img}
              src={item.img}
              className="w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs uppercase tracking-[0.3em] text-[#5eead4] mb-1">{item.line}</p>
              <div className="flex justify-between items-end">
                <h3 style={{ fontFamily: "'Sora', sans-serif" }} className="text-3xl">{item.name}</h3>
                <button className="bg-[#f97066] text-white rounded-full px-5 py-2 text-sm hover:scale-105 transition">
                  Configure →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
 * 2. LIVING CONFIGURATOR — working price calculator with sliders
 * ============================================================ */
const LivingConfigurator = () => {
  const [shape, setShape] = useState<"Rectangle" | "Freeform" | "L-Shape">("Rectangle");
  const [size, setSize] = useState(16);
  const [length, setLength] = useState(35);
  const [finish, setFinish] = useState<"Sapphire" | "Pearl" | "Onyx">("Sapphire");
  const [deck, setDeck] = useState(400);
  const [features, setFeatures] = useState<string[]>(["LED Lighting"]);

  const sqft = size * length;
  const shellPrice = sqft * 280 * 3.5 / 10; // approximate scaled
  const deckPrice = deck * 10;
  const featurePrice = features.length * 4200;
  const total = Math.round(shellPrice + deckPrice + featurePrice + 28000);

  const finishImg = { Sapphire: poolTexture, Pearl: heroPool, Onyx: luxuryPool }[finish];
  const toggle = (f: string) =>
    setFeatures((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "#fafaf7", color: "#1a1a1a", fontFamily: "'Manrope', sans-serif" }}
    >
      <header className="flex items-center justify-between px-10 py-6 border-b border-neutral-200">
        <Logo />
        <nav className="hidden md:flex gap-8 text-sm">
          <a className="hover:text-[#0891b2] transition">Designer</a>
          <a className="hover:text-[#0891b2] transition">Collection</a>
          <a className="hover:text-[#0891b2] transition">Pricing</a>
          <a className="hover:text-[#0891b2] transition">Visit</a>
        </nav>
        <button className="bg-[#0891b2] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#0a7993] transition">
          Save my design
        </button>
      </header>

      <section className="px-10 py-12">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#0891b2] mb-3">Live Studio · try it</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }} className="text-6xl leading-[1] mb-4">
            Configure your pool. Watch the price react.
          </h1>
          <p className="text-neutral-600 text-lg">
            Move a slider, toggle a finish, swap a feature. This is the same engine inside Wonderlands Studio.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Live preview */}
          <div className="md:col-span-7">
            <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-neutral-900 shadow-xl shadow-black/10">
              <img loading="lazy" decoding="async" key={finishImg} src={finishImg} className="w-full h-full object-cover animate-fade-in" />
              <div className="absolute top-4 left-4 backdrop-blur bg-black/40 text-white text-xs px-3 py-1.5 rounded-full">
                {shape} · {size}′ × {length}′ · {finish}
              </div>
              <div className="absolute bottom-4 right-4 backdrop-blur bg-white/90 text-black rounded-2xl px-5 py-3 shadow-xl">
                <div className="text-[10px] uppercase tracking-widest text-neutral-500">Estimated</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl tabular-nums">
                  {formatUSD(total)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-neutral-500">
              {sqft} sqft pool · {deck} sqft deck · {features.length} feature{features.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Controls */}
          <div className="md:col-span-5 space-y-6 bg-white rounded-3xl p-6 border border-neutral-200">
            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Shape</div>
              <div className="flex gap-2">
                {(["Rectangle", "Freeform", "L-Shape"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setShape(s)}
                    className={`flex-1 py-2 rounded-xl text-sm border transition ${
                      shape === s ? "bg-[#0891b2] text-white border-[#0891b2]" : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-neutral-500 mb-2">
                <span>Width</span><span className="tabular-nums">{size}′</span>
              </div>
              <input type="range" min={10} max={20} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full accent-[#0891b2]" />
            </div>

            <div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-neutral-500 mb-2">
                <span>Length</span><span className="tabular-nums">{length}′</span>
              </div>
              <input type="range" min={20} max={45} value={length} onChange={(e) => setLength(+e.target.value)} className="w-full accent-[#0891b2]" />
            </div>

            <div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-neutral-500 mb-2">
                <span>Deck area</span><span className="tabular-nums">{deck} sqft</span>
              </div>
              <input type="range" min={0} max={1200} step={50} value={deck} onChange={(e) => setDeck(+e.target.value)} className="w-full accent-[#0891b2]" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Finish</div>
              <div className="grid grid-cols-3 gap-2">
                {(["Sapphire", "Pearl", "Onyx"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinish(f)}
                    className={`py-2 rounded-xl text-sm border transition ${
                      finish === f ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Features</div>
              <div className="flex flex-wrap gap-2">
                {["LED Lighting", "Heater", "Salt System", "Auto Cover", "Waterfall"].map((f) => {
                  const on = features.includes(f);
                  return (
                    <button
                      key={f}
                      onClick={() => toggle(f)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition ${
                        on ? "bg-[#f97066] text-white border-[#f97066]" : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {on ? "✓ " : "+ "}{f}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="w-full bg-[#0891b2] text-white py-3 rounded-xl font-medium hover:bg-[#0a7993] transition">
              Send me this quote →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
 * 3. SILK SCROLL — Horizontal scroll-snap gallery, editorial
 * ============================================================ */
const SilkScroll = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "#f4f0e8", color: "#1a1612", fontFamily: "'Manrope', sans-serif" }}
    >
      <header className="flex items-center justify-between px-10 py-6">
        <Logo />
        <nav className="hidden md:flex gap-10 text-sm text-[#5a5045]">
          <a className="hover:text-[#1a1612] transition">Collection</a>
          <a className="hover:text-[#1a1612] transition">Atelier</a>
          <a className="hover:text-[#1a1612] transition">Journal</a>
          <a className="hover:text-[#1a1612] transition">Visit</a>
        </nav>
        <button className="border border-[#1a1612] px-5 py-2.5 rounded-full text-sm hover:bg-[#1a1612] hover:text-white transition">
          Book a visit
        </button>
      </header>

      <section className="px-10 pt-10 pb-6 grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-7">
          <p className="text-xs uppercase tracking-[0.4em] text-[#a08868] mb-4">Vol. VI · Selected works</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }} className="text-7xl md:text-8xl leading-[0.92]">
            A slow scroll through <em>still water.</em>
          </h1>
        </div>
        <div className="md:col-span-5 text-[#5a5045] text-lg leading-relaxed">
          Drag, scroll or arrow through twelve Wonderlands commissions —
          each captured at the hour the architects loved most.
        </div>
      </section>

      <section className="relative">
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-10 py-10 scroll-smooth">
          {[
            { img: maximaPool, t: "Maxima", l: "Naples, FL" },
            { img: heroPool, t: "Sapphire Lagoon", l: "Boca Raton, FL" },
            { img: sunsetGrove, t: "Sunset Grove", l: "Sarasota, FL" },
            { img: luxuryPool, t: "Apollo 14", l: "Tampa, FL" },
            { img: luxuryOutdoor, t: "Pavilion 22", l: "Miami, FL" },
            { img: poolBanner, t: "Coral Edge", l: "Fort Myers, FL" },
          ].map((c, i) => (
            <article
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="snap-start shrink-0 w-[340px] cursor-pointer group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <img loading="lazy" decoding="async"
                  src={c.img}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent transition-opacity duration-500 ${
                  hovered === i ? "opacity-100" : "opacity-0"
                }`} />
                <div className={`absolute inset-x-0 bottom-0 p-5 text-white transition-all duration-500 ${
                  hovered === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}>
                  <p className="text-xs uppercase tracking-widest opacity-80">{c.l}</p>
                  <p className="text-sm">View commission →</p>
                </div>
              </div>
              <div className="flex justify-between items-baseline mt-4">
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-3xl">{c.t}</h3>
                <span className="text-xs text-[#a08868]">N° {String(i + 1).padStart(2, "0")}</span>
              </div>
            </article>
          ))}
        </div>
        <div className="px-10 pb-10 flex items-center justify-between text-xs text-[#a08868]">
          <span>← Drag or scroll →</span>
          <span>06 of 12</span>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
 * 4. CRYSTAL OS — Bento dashboard, tabs, mini-charts
 * ============================================================ */
const CrystalOS = () => {
  const [tab, setTab] = useState<"Design" | "Build" | "Smart Home">("Design");
  const stages = ["Excavation", "Plumbing", "Shell", "Coping", "Deck", "Water"];
  const [stage, setStage] = useState(3);

  return (
    <div
      className="rounded-3xl overflow-hidden relative"
      style={{
        background: "radial-gradient(circle at 20% 0%, #0891b244 0%, transparent 50%), #050a14",
        color: "#e8f0fa",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <header className="relative flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur">
        <Logo invert />
        <div className="hidden md:flex gap-1 bg-white/5 border border-white/10 rounded-full p-1">
          {(["Design", "Build", "Smart Home"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                tab === t ? "bg-white text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="bg-[#f97066] text-white rounded-full px-5 py-2 text-sm hover:scale-105 transition">
          Open my project
        </button>
      </header>

      <section className="relative px-8 py-12">
        <div className="max-w-3xl mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#5eead4] mb-3">Wonderlands OS · {tab}</p>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 300 }} className="text-5xl md:text-6xl tracking-tight leading-[1.05]">
            The control center for your <span className="italic" style={{ color: "#5eead4" }}>backyard.</span>
          </h1>
        </div>

        {/* Bento grid */}
        <div className="grid md:grid-cols-6 gap-4 auto-rows-[180px]">
          {/* Live build progress */}
          <div className="md:col-span-4 md:row-span-2 rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur relative overflow-hidden">
            <img loading="lazy" decoding="async" src={maximaPool} className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-white/60 mb-2">Your Project · Maxima 16×35</div>
              <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-3xl mb-6">Build day 24 of 38</div>
              <div className="flex items-center gap-1.5 mb-3">
                {stages.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setStage(i)}
                    className={`flex-1 h-1.5 rounded-full transition ${
                      i <= stage ? "bg-[#5eead4]" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs">
                {stages.map((s, i) => (
                  <span key={s} className={i === stage ? "text-[#5eead4]" : "text-white/40"}>{s}</span>
                ))}
              </div>
              <div className="mt-8 backdrop-blur bg-black/40 border border-white/10 rounded-xl p-4">
                <div className="text-xs text-white/60 mb-1">Current stage</div>
                <div className="text-lg">{stages[stage]} · on schedule ✓</div>
              </div>
            </div>
          </div>

          {/* Water temp */}
          <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-white/60">Water</div>
            <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-5xl mt-2">
              84<span className="text-xl text-white/50">°F</span>
            </div>
            <div className="mt-3 flex items-end gap-1 h-12">
              {[40, 55, 50, 70, 80, 90, 84, 88].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-[#0891b2] to-[#5eead4]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Lights */}
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-[#f97066]/30 to-[#a78bfa]/30 border border-white/10 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-white/70">Mood lights</div>
            <div className="mt-3 flex gap-2">
              {["#5eead4", "#f97066", "#a78bfa", "#fbbf24", "#ffffff"].map((c) => (
                <button key={c} className="w-7 h-7 rounded-full ring-2 ring-white/20 hover:scale-110 transition" style={{ background: c }} />
              ))}
            </div>
            <div className="mt-4 text-xs text-white/70">Currently · Sunset cycle</div>
          </div>

          {/* Quote */}
          <div className="md:col-span-3 rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur">
            <div className="text-xs uppercase tracking-widest text-white/60">Total invested</div>
            <div style={{ fontFamily: "'Sora', sans-serif" }} className="text-4xl mt-1 tabular-nums">$128,400</div>
            <div className="text-xs text-white/50 mt-1">20% deposit · 35% rough-in · 40% finish · 10% final</div>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden flex">
              <div className="bg-[#5eead4]" style={{ width: "20%" }} />
              <div className="bg-[#5eead4]/70" style={{ width: "35%" }} />
              <div className="bg-white/20" style={{ width: "40%" }} />
              <div className="bg-white/10" style={{ width: "5%" }} />
            </div>
          </div>

          {/* Next call */}
          <div className="md:col-span-3 rounded-3xl bg-white/5 border border-white/10 p-5 backdrop-blur flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/60">Your concierge</div>
              <div className="mt-1 text-lg">Jessica Grey · Wonderlands</div>
              <div className="text-xs text-white/50">Next site visit · Tomorrow 9:00 AM</div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-black rounded-xl py-2 text-sm font-medium hover:scale-105 transition">Message</button>
              <button className="flex-1 bg-[#f97066] text-white rounded-xl py-2 text-sm font-medium hover:scale-105 transition">Reschedule</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
 * 5. ZEN SPA — soft, breathing animations, calm reveal
 * ============================================================ */
const ZenSpa = () => {
  const [active, setActive] = useState(0);
  return (
    <div
      className="rounded-3xl overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg,#eaf1ee 0%,#dde7e1 100%)",
        color: "#1f2a25",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <header className="flex items-center justify-between px-10 py-6">
        <Logo />
        <nav className="hidden md:flex gap-10 text-sm text-[#4a5a52]">
          <a className="hover:text-[#1f2a25] transition">Escapes</a>
          <a className="hover:text-[#1f2a25] transition">Spa</a>
          <a className="hover:text-[#1f2a25] transition">Studio</a>
          <a className="hover:text-[#1f2a25] transition">Visit</a>
        </nav>
        <button className="bg-[#1f2a25] text-white px-5 py-2.5 rounded-full text-sm">Book a retreat</button>
      </header>

      <section className="px-10 py-20 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0891b2] opacity-50" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0891b2]" />
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-[#4a5a52]">A wonderlands escape</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }} className="text-7xl leading-[0.95] mb-8">
            Breathe in.<br/><em>Slow down.</em>
          </h1>
          <p className="text-[#4a5a52] text-lg max-w-md mb-10 leading-relaxed">
            Spa-grade pools, hydrotherapy and ambient ecosystems —
            Wonderlands designs backyards that ask nothing of you.
          </p>
          <div className="flex gap-3">
            <button className="bg-[#1f2a25] text-white px-6 py-3.5 rounded-full hover:scale-[1.02] transition">Begin a consultation</button>
            <button className="bg-white text-[#1f2a25] px-6 py-3.5 rounded-full border border-[#1f2a25]/10 hover:border-[#1f2a25]/30 transition">Watch a retreat</button>
          </div>
        </div>
        <div className="md:col-span-6">
          <div
            className="aspect-square rounded-full overflow-hidden shadow-2xl shadow-[#1f2a25]/10"
            style={{ animation: "breathe 8s ease-in-out infinite" }}
          >
            <img loading="lazy" decoding="async" src={spa} className="w-full h-full object-cover" />
          </div>
          <style>{`@keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }`}</style>
        </div>
      </section>

      {/* Escapes — interactive tile reveal */}
      <section className="px-10 pb-20">
        <div className="flex items-end justify-between mb-8">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-4xl">Six ways to disappear.</h2>
          <p className="text-sm text-[#4a5a52]">Hover or tap a tile.</p>
        </div>
        <div className="grid md:grid-cols-6 gap-3 h-[420px]">
          {ESCAPE_TILES.map((t, i) => (
            <button
              key={t.t}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative rounded-3xl overflow-hidden transition-all duration-700 group ${
                active === i ? "md:col-span-2" : "md:col-span-[0.8]"
              }`}
              style={{ flex: active === i ? "2 1 0" : "1 1 0" }}
            >
              <img loading="lazy" decoding="async" src={t.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className={`absolute inset-x-0 bottom-0 p-5 text-white text-left transition-all duration-500 ${
                active === i ? "translate-y-0" : "translate-y-2"
              }`}>
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-70">N° 0{i + 1}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-2xl">{t.t}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ============================================================
 * 6. CONCIERGE BOOKING — 3-step booking flow with live concierge card
 * ============================================================ */
const ConciergeBooking = () => {
  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState("Estate");
  const [budget, setBudget] = useState(120);
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState("10:30 AM");
  const [wa, setWa] = useState(true);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return { i, label: d.toLocaleDateString("en-US", { weekday: "short" }), num: d.getDate() };
  });
  const slots = ["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"];

  return (
    <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-gradient-to-br from-[#0a1620] to-[#04111a] text-white grid lg:grid-cols-[1.4fr_1fr]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="p-10 lg:p-14">
        <div className="text-xs uppercase tracking-[0.3em] text-[#5eead4] mb-3">Private design concierge</div>
        <h4 className="text-4xl lg:text-5xl font-light tracking-tight mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
          Book a 30-minute call with a Wonderlands designer.
        </h4>
        <div className="flex gap-2 mb-8">
          {["Property", "Budget", "Schedule"].map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className={`text-xs px-3 py-1.5 rounded-full transition ${step === i ? "bg-[#f97066] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="text-sm text-white/70 mb-2">What are we building for?</div>
            <div className="flex flex-wrap gap-2">
              {["Estate", "Modern Home", "Villa", "New Build", "Renovation"].map((t) => (
                <button key={t} onClick={() => setPropertyType(t)} className={`px-5 py-3 rounded-2xl border transition ${propertyType === t ? "bg-white text-[#04111a] border-white" : "border-white/20 hover:border-white/50"}`}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-6 bg-[#f97066] hover:bg-[#ff8278] hover:scale-[1.02] transition text-white px-6 py-3 rounded-full font-medium">Next → Budget</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="text-sm text-white/70 mb-2">Project budget (you can change later)</div>
            <div className="text-5xl font-light mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>{formatUSD(budget * 1000)}</div>
            <input type="range" min={50} max={300} step={10} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-[#f97066]" />
            <div className="flex justify-between text-xs text-white/50 mt-1"><span>$50k</span><span>$300k+</span></div>
            <button onClick={() => setStep(2)} className="mt-6 bg-[#f97066] hover:bg-[#ff8278] hover:scale-[1.02] transition text-white px-6 py-3 rounded-full font-medium">Next → Pick a time</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-sm text-white/70 mb-3">Choose a day</div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {days.map((d) => (
                <button key={d.i} onClick={() => setDay(d.i)} className={`w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition ${day === d.i ? "bg-[#5eead4] text-[#04111a]" : "bg-white/5 hover:bg-white/10"}`}>
                  <div className="text-[10px] uppercase tracking-wider">{d.label}</div>
                  <div className="text-2xl font-light">{d.num}</div>
                </button>
              ))}
            </div>
            <div className="text-sm text-white/70 mb-3">Pick a time</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {slots.map((s) => (
                <button key={s} onClick={() => setSlot(s)} className={`px-4 py-2 rounded-full text-sm transition ${slot === s ? "bg-white text-[#04111a]" : "bg-white/10 hover:bg-white/20"}`}>{s}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-4 cursor-pointer">
              <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} className="accent-[#5eead4]" />
              Send updates via WhatsApp
            </label>
            <div className="flex flex-wrap gap-3">
              <a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer" className="bg-[#f97066] hover:bg-[#ff8278] hover:scale-[1.02] transition text-white px-6 py-3 rounded-full font-medium">
                Reserve my call →
              </a>
              <button className="border border-white/30 hover:bg-white/10 transition px-6 py-3 rounded-full text-sm">Just send the brochure</button>
            </div>
          </div>
        )}
      </div>

      <aside className="bg-gradient-to-br from-white/[0.04] to-transparent p-10 lg:p-14 border-t lg:border-t-0 lg:border-l border-white/10">
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">Your concierge</div>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5eead4] to-[#0891b2] flex items-center justify-center text-2xl text-[#04111a] font-semibold mb-4">JG</div>
        <div className="text-2xl font-light mb-1" style={{ fontFamily: "Cormorant Garamond, serif" }}>Jessica Grey</div>
        <div className="text-sm text-white/60 mb-6">Lead Designer · Wonderlands</div>
        <div className="space-y-3 text-sm text-white/80 border-t border-white/10 pt-6">
          <div className="flex justify-between"><span className="text-white/50">Property</span><span>{propertyType}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Budget</span><span>{formatUSD(budget * 1000)}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Day</span><span>{days[day].label} {days[day].num}</span></div>
          <div className="flex justify-between"><span className="text-white/50">Time</span><span>{slot}</span></div>
          <div className="flex justify-between"><span className="text-white/50">WhatsApp</span><span>{wa ? "Yes" : "Email only"}</span></div>
        </div>
      </aside>
    </div>
  );
};

/* ============================================================
 * 7. LINER CATALOG — real Wonderlands liner browser with cart
 * ============================================================ */
const LINERS = [
  { name: "Paradise", type: "Glass", img: "/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png" },
  { name: "Water Lilies", type: "Glass", img: "/lovable-uploads/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.png" },
  { name: "Sail Boat", type: "Glass", img: "/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png" },
  { name: "Stormy", type: "Mosaic", img: "/lovable-uploads/ee0c59a8-87bb-4b74-b6e9-9eeba3633e9f.png" },
  { name: "Ballad", type: "Mosaic", img: "/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.png" },
  { name: "Galant", type: "Iridescent", img: "/lovable-uploads/723a9c27-b7d5-4139-bda7-4eed2d0b23e8.png" },
  { name: "Melody", type: "Iridescent", img: "/lovable-uploads/c8e3cc34-9fbe-4ece-af71-05b7e4f94332.png" },
  { name: "Soul", type: "Mosaic", img: "/lovable-uploads/7dc956df-af5c-4c6b-b2af-6bc9d6fbf179.png" },
];

const LinerCatalog = () => {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [sqft, setSqft] = useState(480);
  const filters = ["All", "Glass", "Mosaic", "Iridescent"];
  const list = filter === "All" ? LINERS : LINERS.filter((l) => l.type === filter);
  const toggle = (n: string) => setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const subtotal = selected.length * sqft * 20;

  return (
    <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="p-8 lg:p-12 border-b border-neutral-100 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#0891b2] mb-2">Wonderlands Liner Collection</div>
          <h4 className="text-4xl font-semibold tracking-tight text-neutral-900">Pick the surface of your pool.</h4>
          <p className="text-neutral-500 mt-2 text-sm max-w-md">Every liner is glass-grade, installed at <b className="text-neutral-900">$20 / sqft</b>. Toggle the ones you like — build a quote with one tap.</p>
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm transition ${filter === f ? "bg-neutral-900 text-white" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-100">
        {list.map((l) => {
          const on = selected.includes(l.name);
          return (
            <button key={l.name} onClick={() => toggle(l.name)} className="group bg-white relative aspect-square overflow-hidden text-left">
              <img loading="lazy" decoding="async" src={l.img} alt={l.name} className="w-full h-full object-cover transition group-hover:scale-110 duration-500" />
              <div className={`absolute inset-0 transition ${on ? "bg-[#0891b2]/40" : "bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/85"}`} />
              <div className="absolute top-3 right-3">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm transition ${on ? "bg-white text-[#0891b2] border-white" : "border-white/60 text-transparent group-hover:bg-white/20"}`}>✓</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-[10px] uppercase tracking-wider opacity-70">{l.type}</div>
                <div className="text-lg font-semibold">{l.name}</div>
                <div className="text-xs opacity-80 mt-0.5">$20/sqft installed</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-6 lg:p-8 bg-neutral-50 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <label className="text-xs text-neutral-500 uppercase tracking-wider">Pool surface</label>
          <input type="range" min={200} max={1200} step={20} value={sqft} onChange={(e) => setSqft(+e.target.value)} className="w-48 accent-[#0891b2]" />
          <span className="text-sm font-semibold text-neutral-900">{sqft} sqft</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-neutral-500">{selected.length} liner{selected.length === 1 ? "" : "s"} selected</div>
            <div className="text-2xl font-semibold text-neutral-900">{formatUSD(subtotal)}</div>
          </div>
          <button disabled={!selected.length} className={`px-6 py-3 rounded-full font-medium transition ${selected.length ? "bg-[#f97066] hover:bg-[#ff8278] hover:scale-[1.02] text-white" : "bg-neutral-200 text-neutral-400 cursor-not-allowed"}`}>
            Build my quote →
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * 8. POOL COMPARE — pick 2 models, see them head to head
 * ============================================================ */
const COMPARE_POOLS = [
  { name: "Maxima 16×35", line: "Wonderlands Fiberglass", size: "16 × 35 ft", sqft: 560, depth: "3.5 – 8 ft", price: 84500, weeks: 4, warranty: "25 yr", img: maximaPool },
  { name: "Apollo 14", line: "Wonderlands Fiberglass", size: "14 × 28 ft", sqft: 392, depth: "3.5 – 6 ft", price: 58000, weeks: 3, warranty: "25 yr", img: luxuryPool },
  { name: "Sunset Grove", line: "Signature Kit", size: "12 × 24 ft", sqft: 288, depth: "3.5 – 5.5 ft", price: 62000, weeks: 2, warranty: "20 yr", img: sunsetGrove },
  { name: "Sapphire Lagoon", line: "Custom Wonderlands", size: "18 × 38 ft", sqft: 684, depth: "3.5 – 7 ft", price: 128000, weeks: 6, warranty: "Lifetime", img: heroPool },
];

const PoolCompare = () => {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const max = Math.max(...COMPARE_POOLS.map((p) => p.price));
  const maxS = Math.max(...COMPARE_POOLS.map((p) => p.sqft));

  const Card = ({ idx, setIdx, side }: { idx: number; setIdx: (i: number) => void; side: "left" | "right" }) => {
    const p = COMPARE_POOLS[idx];
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col">
        <div className="relative h-56 overflow-hidden">
          <img loading="lazy" decoding="async" src={p.img} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-[10px] uppercase tracking-wider opacity-70">{p.line}</div>
            <div className="text-2xl font-semibold">{p.name}</div>
          </div>
        </div>
        <div className="p-5 space-y-3 flex-1">
          <select value={idx} onChange={(e) => setIdx(+e.target.value)} className="w-full bg-neutral-100 px-3 py-2 rounded-lg text-sm border border-neutral-200">
            {COMPARE_POOLS.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
          </select>
          <Row k="Size" v={p.size} />
          <Row k="Surface" v={`${p.sqft} sqft`} />
          <Row k="Depth" v={p.depth} />
          <Row k="Install" v={`${p.weeks} weeks`} />
          <Row k="Warranty" v={p.warranty} />
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-1"><span>Investment</span><span>{formatUSD(p.price)}</span></div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0891b2] to-[#f97066] transition-all duration-700" style={{ width: `${(p.price / max) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-1"><span>Footprint</span><span>{p.sqft} sqft</span></div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0891b2] transition-all duration-700" style={{ width: `${(p.sqft / maxS) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-neutral-100 flex gap-2">
          <Link to="/wonderlands-studio" className="flex-1 bg-neutral-900 hover:bg-[#0891b2] transition text-white text-sm px-4 py-2.5 rounded-full text-center font-medium">Configure in Studio →</Link>
          <button className="border border-neutral-200 hover:border-neutral-900 transition text-sm px-4 py-2.5 rounded-full">Quote</button>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-8 lg:p-12" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-[#0891b2] mb-2">Head to head</div>
        <h4 className="text-4xl font-semibold tracking-tight text-neutral-900">Compare two Wonderlands pools.</h4>
        <p className="text-neutral-500 mt-2 text-sm max-w-xl">Specs, footprint, install time and warranty — side by side. Configure either one in the Studio with a single click.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card idx={a} setIdx={setA} side="left" />
        <Card idx={b} setIdx={setB} side="right" />
      </div>
      <div className="mt-8 bg-gradient-to-r from-[#0891b2] to-[#f97066] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-white">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-80">Difference</div>
          <div className="text-2xl font-semibold">{formatUSD(Math.abs(COMPARE_POOLS[a].price - COMPARE_POOLS[b].price))} · {Math.abs(COMPARE_POOLS[a].sqft - COMPARE_POOLS[b].sqft)} sqft</div>
        </div>
        <a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer" className="bg-white hover:scale-[1.02] transition text-neutral-900 px-6 py-3 rounded-full font-medium">Talk it through with a designer →</a>
      </div>
    </div>
  );
};

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between text-sm border-b border-neutral-100 pb-2">
    <span className="text-neutral-500">{k}</span>
    <span className="text-neutral-900 font-medium">{v}</span>
  </div>
);

/* ============================================================
 * 9. FINISH PICKER — Crystite Crystal real finishes, live preview
 * ============================================================ */
const FINISHES = [
  { name: "Sapphire Blue", price: 3500, color: "#1e4a7a", warranty: "25 yr", img: "/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png" },
  { name: "Ocean Blue", price: 3500, color: "#2a6f8f", warranty: "25 yr", img: poolTexture },
  { name: "Caribbean", price: 3800, color: "#3aa6c4", warranty: "25 yr", img: poolTexture },
  { name: "Aqua Crystal", price: 3600, color: "#6cc5d1", warranty: "25 yr", img: poolTexture },
  { name: "Midnight", price: 4200, color: "#0e1a2b", warranty: "25 yr", img: poolTexture },
  { name: "Silver Mist", price: 3900, color: "#9fb5b9", warranty: "25 yr", img: poolTexture },
];

const FinishPicker = () => {
  const [idx, setIdx] = useState(0);
  const [sqft, setSqft] = useState(480);
  const f = FINISHES[idx];
  const total = Math.round((sqft / 480) * f.price * 3.5);

  return (
    <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-[#0a1620] text-white grid lg:grid-cols-[1.4fr_1fr]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="relative h-[420px] lg:h-auto overflow-hidden">
        <img loading="lazy" decoding="async" src={heroPool} alt="Pool" className="absolute inset-0 w-full h-full object-cover transition-all duration-700" />
        <div className="absolute inset-0 mix-blend-multiply transition-all duration-700" style={{ background: f.color, opacity: 0.55 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]">Crystite Crystal Collection</div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="text-5xl font-light tracking-tight mb-2" style={{ fontFamily: "Cormorant Garamond, serif" }}>{f.name}</div>
          <div className="flex gap-2">
            <span className="text-xs bg-white/15 backdrop-blur px-3 py-1 rounded-full">{f.warranty} warranty</span>
            <span className="text-xs bg-white/15 backdrop-blur px-3 py-1 rounded-full">UV resistant</span>
            <span className="text-xs bg-white/15 backdrop-blur px-3 py-1 rounded-full">Crystal sparkle</span>
          </div>
        </div>
      </div>

      <div className="p-8 lg:p-12">
        <div className="text-xs uppercase tracking-[0.3em] text-[#5eead4] mb-3">Pick your finish</div>
        <h4 className="text-3xl font-light mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>Watch your pool change in real time.</h4>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {FINISHES.map((c, i) => (
            <button key={c.name} onClick={() => setIdx(i)} className={`group rounded-2xl overflow-hidden border-2 transition ${idx === i ? "border-[#f97066] scale-[1.02]" : "border-white/10 hover:border-white/40"}`}>
              <div className="h-16" style={{ background: c.color }} />
              <div className="p-2 bg-white/5 text-left">
                <div className="text-xs font-medium truncate">{c.name}</div>
                <div className="text-[10px] text-white/50">{formatUSD(c.price)}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/60 mb-2"><span>Pool surface</span><span>{sqft} sqft</span></div>
          <input type="range" min={200} max={1000} step={20} value={sqft} onChange={(e) => setSqft(+e.target.value)} className="w-full accent-[#f97066]" />
        </div>

        <div className="border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex justify-between text-sm mb-2"><span className="text-white/60">Finish</span><span>{f.name}</span></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-white/60">Coverage</span><span>{sqft} sqft</span></div>
          <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-white/10">
            <span className="text-white/60 text-sm">Installed</span>
            <span className="text-3xl font-light" style={{ fontFamily: "Cormorant Garamond, serif" }}>{formatUSD(total)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="bg-[#f97066] hover:bg-[#ff8278] hover:scale-[1.02] transition text-white px-6 py-3 rounded-full font-medium">Lock this finish ✓</button>
          <Link to="/wonderlands-studio" className="border border-white/30 hover:bg-white/10 transition px-6 py-3 rounded-full text-sm">See it in Studio</Link>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
 * 10. BACKYARD BUILDER — click-to-add features, live package total
 * ============================================================ */
const ADDONS = [
  { name: "Hydrotherapy Spa", price: 12000, img: spa },
  { name: "Tanning Ledge", price: 8000, img: hotTub },
  { name: "Fire Pit Lounge", price: 4500, img: firePit },
  { name: "Ambient Lighting", price: 3200, img: lighting },
  { name: "Shade Pergola", price: 9000, img: pergola },
  { name: "Outdoor Kitchen", price: 18000, img: outdoorKitchen },
];

const BackyardBuilder = () => {
  const [base] = useState(84500);
  const [picked, setPicked] = useState<string[]>(["Ambient Lighting"]);
  const toggle = (n: string) => setPicked((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const addOnTotal = ADDONS.filter((a) => picked.includes(a.name)).reduce((s, a) => s + a.price, 0);
  const total = base + addOnTotal;
  const schedule = [
    { label: "Deposit (20%)", pct: 0.2 },
    { label: "Excavation (35%)", pct: 0.35 },
    { label: "Install (40%)", pct: 0.4 },
    { label: "Final (10%)", pct: 0.1 },
  ];

  return (
    <div className="rounded-3xl overflow-hidden border border-neutral-200 bg-white grid lg:grid-cols-[1.4fr_1fr]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="p-8 lg:p-12">
        <div className="text-xs uppercase tracking-[0.3em] text-[#0891b2] mb-2">Build your backyard</div>
        <h4 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-2">Start with Maxima 16×35. Add what you love.</h4>
        <p className="text-neutral-500 text-sm mb-8">Tap to add — your package updates instantly with a payment schedule you can share with your partner.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ADDONS.map((a) => {
            const on = picked.includes(a.name);
            return (
              <button key={a.name} onClick={() => toggle(a.name)} className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition ${on ? "border-[#f97066] scale-[1.02]" : "border-transparent hover:border-neutral-300"}`}>
                <img loading="lazy" decoding="async" src={a.img} alt={a.name} className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-110 duration-500" />
                <div className={`absolute inset-0 transition ${on ? "bg-[#f97066]/30" : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"}`} />
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm bg-white/95 text-[#0891b2] font-bold opacity-0 group-hover:opacity-100 transition" style={on ? { opacity: 1, background: "#f97066", color: "white" } : {}}>
                  {on ? "✓" : "+"}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-left">
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-xs opacity-80">+{formatUSD(a.price)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="bg-neutral-50 p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-neutral-200 flex flex-col">
        <div className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4">Your Wonderlands package</div>
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-sm py-2 border-b border-neutral-200"><span className="text-neutral-700">Maxima 16×35 (base)</span><span className="font-medium">{formatUSD(base)}</span></div>
          {ADDONS.filter((a) => picked.includes(a.name)).map((a) => (
            <div key={a.name} className="flex justify-between text-sm py-2 border-b border-neutral-100 animate-fade-in">
              <span className="text-neutral-700">{a.name}</span>
              <span className="font-medium text-[#0891b2]">+{formatUSD(a.price)}</span>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-br from-[#0a1620] to-[#04111a] text-white rounded-2xl p-5 mb-5">
          <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Total investment</div>
          <div className="text-4xl font-light mb-4" style={{ fontFamily: "Cormorant Garamond, serif" }}>{formatUSD(total)}</div>
          <div className="space-y-1.5 text-xs">
            {schedule.map((s) => (
              <div key={s.label} className="flex justify-between"><span className="opacity-70">{s.label}</span><span>{formatUSD(total * s.pct)}</span></div>
            ))}
          </div>
        </div>
        <div className="space-y-2 mt-auto">
          <button className="w-full bg-gradient-to-r from-[#0891b2] to-[#f97066] hover:scale-[1.01] transition text-white py-3.5 rounded-full font-medium">Build my backyard →</button>
          <a href="https://calendly.com/wonderlandsworlds/30min" target="_blank" rel="noreferrer" className="block text-center w-full border border-neutral-300 hover:border-neutral-900 transition py-3 rounded-full text-sm">Schedule a call instead</a>
        </div>
      </aside>
    </div>
  );
};

/* ============================================================ */
const PROPOSALS: Proposal[] = [
  {
    id: "immersive-parallax",
    name: "Immersive Parallax",
    tagline: "Scroll-reactive cinema · sticky collection preview",
    vibe: "Cinematic, dark, motion-led",
    palette: ["#04111a", "#5eead4", "#f97066", "#e8f4f8"],
    fonts: { heading: "Sora", body: "Manrope" },
    render: ImmersiveParallax,
  },
  {
    id: "living-configurator",
    name: "Living Configurator",
    tagline: "Real working price configurator on the homepage",
    vibe: "Tactile, transparent, premium tool",
    palette: ["#fafaf7", "#0891b2", "#f97066", "#1a1a1a"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: LivingConfigurator,
  },
  {
    id: "silk-scroll",
    name: "Silk Scroll",
    tagline: "Horizontal scroll-snap editorial gallery",
    vibe: "Slow, considered, gallery-luxe",
    palette: ["#f4f0e8", "#a08868", "#1a1612", "#5a5045"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: SilkScroll,
  },
  {
    id: "crystal-os",
    name: "Crystal OS",
    tagline: "Owner dashboard · live build progress · smart-home tiles",
    vibe: "Tech-forward, dashboard, app-like",
    palette: ["#050a14", "#0891b2", "#5eead4", "#f97066"],
    fonts: { heading: "Sora", body: "Inter" },
    render: CrystalOS,
  },
  {
    id: "zen-spa",
    name: "Zen Spa",
    tagline: "Breathing animations · expanding tile reveal",
    vibe: "Calm, organic, spa-grade",
    palette: ["#eaf1ee", "#0891b2", "#1f2a25", "#dde7e1"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: ZenSpa,
  },
  {
    id: "concierge-booking",
    name: "Concierge Booking",
    tagline: "3-step booking flow · live concierge card · WhatsApp opt-in",
    vibe: "Personal, premium, sales-ready",
    palette: ["#04111a", "#5eead4", "#f97066", "#e8f4f8"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: ConciergeBooking,
  },
  {
    id: "liner-catalog",
    name: "Liner Catalog",
    tagline: "Real liner browser · filters · live quote builder",
    vibe: "Product-forward, conversion-focused",
    palette: ["#ffffff", "#0891b2", "#f97066", "#1a1a1a"],
    fonts: { heading: "Inter", body: "Inter" },
    render: LinerCatalog,
  },
  {
    id: "pool-compare",
    name: "Pool Compare",
    tagline: "Two pools head-to-head · spec bars · Studio launch",
    vibe: "Decisive, transparent, retail-grade",
    palette: ["#fafafa", "#0891b2", "#f97066", "#1a1a1a"],
    fonts: { heading: "Inter", body: "Inter" },
    render: PoolCompare,
  },
  {
    id: "finish-picker",
    name: "Finish Picker",
    tagline: "Crystite Crystal swatches · live pool preview · price math",
    vibe: "Cinematic, dark, configurator-luxe",
    palette: ["#0a1620", "#1e4a7a", "#5eead4", "#f97066"],
    fonts: { heading: "Cormorant Garamond", body: "Manrope" },
    render: FinishPicker,
  },
  {
    id: "backyard-builder",
    name: "Backyard Builder",
    tagline: "Click-to-add features · live total · 20/35/40/10 schedule",
    vibe: "Playful, hands-on, closes the sale",
    palette: ["#ffffff", "#0891b2", "#f97066", "#04111a"],
    fonts: { heading: "Inter", body: "Inter" },
    render: BackyardBuilder,
  },
];

const DesignProposals = () => {
  const [active, setActive] = useState<string>(PROPOSALS[0].id);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
      />

      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img loading="lazy" decoding="async" src={wonderlandsLogo} alt="Wonderlands" className="h-8 w-auto" />
            <div>
              <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-900">← Back</Link>
              <h1 className="text-base font-semibold tracking-tight">Interactive style proposals</h1>
            </div>
          </div>
          <div className="hidden md:flex gap-1 bg-neutral-100 rounded-full p-1 overflow-x-auto">
            {PROPOSALS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActive(p.id);
                  document.getElementById(p.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
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
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">10 Directions · real Wonderlands product · interactive UX</p>
          <h2 className="text-5xl font-semibold tracking-tight mb-4">
            Ten ways to sell Wonderlands.
          </h2>
          <p className="text-neutral-600 text-lg">
            Each proposal includes working interactions — scroll, drag, configure,
            toggle. All built on real Wonderlands content and the official logo.
          </p>
        </section>

        {PROPOSALS.map((p, i) => {
          const Render = p.render;
          return (
            <section key={p.id} id={p.id} className="scroll-mt-24 animate-fade-in">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs text-neutral-500 mb-2">Proposal {String(i + 1).padStart(2, "0")}</div>
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
          Pick a direction and we'll roll it out site-wide — or mix elements from a few.
        </footer>
      </main>
    </div>
  );
};

export default DesignProposals;
