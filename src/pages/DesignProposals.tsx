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
  <img
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
          <img src={heroPool} className="w-full h-full object-cover" />
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
            <img
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
              <img key={finishImg} src={finishImg} className="w-full h-full object-cover animate-fade-in" />
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
                <img
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
            <img src={maximaPool} className="absolute inset-0 w-full h-full object-cover opacity-30" />
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
            <img src={spa} className="w-full h-full object-cover" />
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
              <img src={t.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
            <img src={wonderlandsLogo} alt="Wonderlands" className="h-8 w-auto" />
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
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">5 New Directions · interactive UX</p>
          <h2 className="text-5xl font-semibold tracking-tight mb-4">
            Five looks you can actually use.
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
          Pick a direction and we'll roll it out site-wide — or mix elements from a few.
        </footer>
      </main>
    </div>
  );
};

export default DesignProposals;
