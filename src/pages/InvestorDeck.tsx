import * as React from "react";
const { useState, useEffect, useCallback } = React;
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize, Minimize, Circle } from "lucide-react";

const TOTAL_SLIDES = 13;

// ─── Slide Components ───────────────────────────────────────────

const CoverSlide = () => (
  <div className="relative w-full h-full bg-[hsl(220,30%,8%)] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,12%)] via-[hsl(200,30%,10%)] to-[hsl(30,60%,15%)] opacity-80" />
    <div className="absolute inset-0 bg-[url('/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png')] bg-center bg-no-repeat bg-contain opacity-5" />
    <div className="relative z-10 text-center space-y-8">
      <img
        src="/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png"
        alt="Wonderlands Logo"
        className="h-32 mx-auto drop-shadow-2xl"
      />
      <div className="space-y-3">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          WONDERLANDS
        </h1>
        <p className="text-lg md:text-2xl tracking-[0.3em] uppercase text-[hsl(45,100%,70%)]">
          Luxury Outdoor Entertainment
        </p>
      </div>
      <p className="text-white/40 text-sm tracking-widest uppercase mt-12">
        Investor Presentation 2025
      </p>
    </div>
  </div>
);

const VisionSlide = () => (
  <DeckSlide
    label="VISION"
    title="We Design Destinations, Not Backyards"
    dark
  >
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {[
        { icon: "✦", text: "Transform residential spaces into immersive outdoor environments" },
        { icon: "◆", text: "Elevate Florida luxury living through experience design" },
        { icon: "▲", text: "Combine pool architecture, storytelling & entertainment design" },
      ].map((item, i) => (
        <div key={i} className="text-center space-y-4">
          <span className="text-3xl text-[hsl(45,100%,65%)]">{item.icon}</span>
          <p className="text-white/80 text-lg leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const ProblemSlide = () => (
  <DeckSlide label="THE PROBLEM" title="A Fragmented Market" dark>
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {[
        { stat: "87%", desc: "of luxury homeowners say their outdoor space lacks cohesion" },
        { stat: "5+", desc: "contractors needed for a single outdoor project" },
        { stat: "0", desc: "brands offering end-to-end luxury outdoor experiences" },
      ].map((item, i) => (
        <div key={i} className="text-center space-y-4 p-6 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-5xl font-bold text-[hsl(45,100%,65%)]">{item.stat}</p>
          <p className="text-white/70">{item.desc}</p>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const OpportunitySlide = () => (
  <DeckSlide label="THE OPPORTUNITY" title="Florida's Luxury Outdoor Market Is Exploding" dark>
    <div className="grid md:grid-cols-2 gap-10 mt-12">
      <div className="space-y-6">
        {[
          "High net-worth relocation to Florida at all-time highs",
          "Year-round outdoor living climate",
          "Demand for Instagram-worthy luxury spaces",
          "$4.2B+ residential pool market in Florida",
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-4">
            <span className="text-[hsl(45,100%,65%)] mt-1">→</span>
            <p className="text-white/80 text-lg">{text}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border-4 border-[hsl(45,100%,65%)]/30 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl font-bold text-[hsl(45,100%,65%)]">$4.2B+</p>
            <p className="text-white/60 text-sm mt-2">FL Pool Market</p>
          </div>
        </div>
      </div>
    </div>
  </DeckSlide>
);

const SolutionSlide = () => (
  <DeckSlide label="THE SOLUTION" title="The Wonderlands Experience" dark>
    <div className="mt-12 space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        {["Dream", "Design", "Deliver"].map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 && <span className="text-[hsl(45,100%,65%)] text-3xl hidden md:block">→</span>}
            <div className="w-48 h-48 rounded-full border-2 border-[hsl(45,100%,65%)]/40 bg-white/5 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{step}</p>
                <p className="text-[hsl(45,100%,65%)] text-sm mt-1">Step {i + 1}</p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="grid md:grid-cols-5 gap-4 text-center">
        {[
          "Concept & Storytelling",
          "Pool Selection & Customization",
          "Patio & Entertainment Layout",
          "Branded Experience Elements",
          "Seamless Contractor Coordination",
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-white/80 text-sm">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </DeckSlide>
);

const ApproachSlide = () => (
  <DeckSlide label="OUR SIGNATURE APPROACH" title="One Stop Shop — From Idea to Turnkey" dark>
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {[
        {
          num: "01",
          title: "One Stop Shop",
          desc: "All patio solutions under one roof — pools, spas, pavers, enclosures, fencing, gates, and more.",
        },
        {
          num: "02",
          title: "Luxury Design",
          desc: "Every project is a bespoke creation, tailored to the homeowner's lifestyle and aesthetic.",
        },
        {
          num: "03",
          title: "Immersive Entertainment",
          desc: "We design spaces that feel like private resorts — complete with lighting, sound, and ambiance.",
        },
      ].map((item, i) => (
        <div key={i} className="space-y-4 p-8 rounded-2xl border border-[hsl(45,100%,65%)]/20 bg-white/5">
          <span className="text-[hsl(45,100%,65%)] text-sm font-mono">{item.num}</span>
          <h3 className="text-2xl font-bold text-white">{item.title}</h3>
          <p className="text-white/70 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const ServicesSlide = () => (
  <DeckSlide label="SERVICES" title="Complete Outdoor Living Solutions" dark>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
      {[
        "Fiberglass Pools", "Hot Tubs & Spas", "Saunas", "Tanning Ledges",
        "Screen Enclosures", "Lanai", "Pavers", "Aluminum Fencing",
        "Automatic Covers", "Driveway Gates", "Pool Finishes", "Construction",
      ].map((service, i) => (
        <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/5 text-center hover:border-[hsl(45,100%,65%)]/40 transition-colors">
          <p className="text-white/90 font-medium">{service}</p>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const AestheticSlide = () => (
  <DeckSlide label="BRAND AESTHETIC" title="A Lifestyle Brand, Not a Contractor" dark>
    <div className="grid md:grid-cols-2 gap-8 mt-12">
      <div className="space-y-6">
        {[
          "Cinematic sunset pool photography",
          "Fantasy-inspired design details",
          "Waterfall & water feature artistry",
          "Ambient & architectural lighting",
          "Resort-level poolside lifestyle",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[hsl(45,100%,65%)]" />
            <p className="text-white/80 text-lg">{item}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          "from-[hsl(30,60%,20%)] to-[hsl(20,70%,15%)]",
          "from-[hsl(200,40%,15%)] to-[hsl(220,30%,10%)]",
          "from-[hsl(45,80%,30%)] to-[hsl(35,70%,20%)]",
          "from-[hsl(180,30%,15%)] to-[hsl(160,40%,10%)]",
        ].map((grad, i) => (
          <div key={i} className={`aspect-square rounded-2xl bg-gradient-to-br ${grad} border border-white/10`} />
        ))}
      </div>
    </div>
  </DeckSlide>
);

const RevenueSlide = () => (
  <DeckSlide label="REVENUE MODEL" title="Multiple Revenue Streams" dark>
    <div className="grid md:grid-cols-2 gap-8 mt-12">
      {[
        { title: "Design Consultation", amount: "$2,500 – $10,000", desc: "Per project concept & design fee" },
        { title: "Project Oversight", amount: "8 – 15%", desc: "Of total project value" },
        { title: "Partner Commissions", amount: "10 – 20%", desc: "Product markups & partner referrals" },
        { title: "Premium Branding", amount: "$5,000+", desc: "Branded experience packages" },
      ].map((item, i) => (
        <div key={i} className="p-8 rounded-2xl border border-white/10 bg-white/5 space-y-3">
          <p className="text-[hsl(45,100%,65%)] text-sm uppercase tracking-wider">{item.title}</p>
          <p className="text-4xl font-bold text-white">{item.amount}</p>
          <p className="text-white/60">{item.desc}</p>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const PositioningSlide = () => (
  <DeckSlide label="MARKET POSITIONING" title="Redefining the Category" dark>
    <div className="grid md:grid-cols-2 gap-16 mt-12">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white/40 line-through">We Are NOT</h3>
        <div className="space-y-4">
          {["A pool installer", "A landscaper", "A general contractor"].map((item, i) => (
            <p key={i} className="text-white/40 text-xl flex items-center gap-3">
              <span className="text-red-400">✕</span> {item}
            </p>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-[hsl(45,100%,65%)]">We ARE</h3>
        <div className="space-y-4">
          {[
            "A luxury outdoor experience design brand",
            "A one-stop-shop from idea to turnkey",
            "A lifestyle company for Florida's elite",
          ].map((item, i) => (
            <p key={i} className="text-white text-xl flex items-center gap-3">
              <span className="text-[hsl(45,100%,65%)]">✓</span> {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  </DeckSlide>
);

const GrowthSlide = () => (
  <DeckSlide label="GROWTH PLAN" title="Strategic Expansion" dark>
    <div className="space-y-8 mt-12">
      {[
        { phase: "Phase 1", time: "2025", title: "Florida Foundation", items: ["Orlando & Central Florida focus", "Strategic partnerships with Latham builders", "Build brand recognition"] },
        { phase: "Phase 2", time: "2026", title: "Market Expansion", items: ["High-end real estate collaborations", "South Florida & Tampa expansion", "Launch premium product lines"] },
        { phase: "Phase 3", time: "2027+", title: "Brand Scale", items: ["Franchise or licensing model", "Resort partnerships", "National luxury outdoor brand"] },
      ].map((item, i) => (
        <div key={i} className="flex gap-8 items-start">
          <div className="text-right min-w-[100px]">
            <p className="text-[hsl(45,100%,65%)] font-mono text-sm">{item.phase}</p>
            <p className="text-white/40 text-xs">{item.time}</p>
          </div>
          <div className="w-px bg-[hsl(45,100%,65%)]/30 self-stretch" />
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <div className="flex flex-wrap gap-3">
              {item.items.map((sub, j) => (
                <span key={j} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm">{sub}</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const FutureSlide = () => (
  <DeckSlide label="THE FUTURE" title="The Future of Wonderlands" dark>
    <div className="grid md:grid-cols-3 gap-8 mt-12">
      {[
        { title: "Branded Products", desc: "Poolside furniture, umbrellas, floats — all Wonderlands branded luxury goods" },
        { title: "Resort Partnerships", desc: "Design & brand high-end resort pool experiences across Florida & beyond" },
        { title: "Franchise Model", desc: "License the Wonderlands experience to operators in luxury markets nationwide" },
      ].map((item, i) => (
        <div key={i} className="p-8 rounded-2xl border border-[hsl(45,100%,65%)]/20 bg-gradient-to-b from-white/5 to-transparent space-y-4">
          <h3 className="text-2xl font-bold text-white">{item.title}</h3>
          <p className="text-white/70 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </DeckSlide>
);

const CTASlide = () => (
  <div className="relative w-full h-full bg-[hsl(220,30%,8%)] flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(45,80%,20%)]/20 via-transparent to-[hsl(200,40%,15%)]/20" />
    <div className="relative z-10 text-center space-y-10 max-w-3xl px-8">
      <p className="text-[hsl(45,100%,65%)] tracking-[0.3em] uppercase text-sm">Let's Build Something Extraordinary</p>
      <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
        The Extraordinary<br />
        <span className="text-[hsl(45,100%,65%)]">Starts Here.</span>
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
        {[
          { label: "Investment Opportunity", href: "mailto:investors@wonderlandsworld.com" },
          { label: "Partnership", href: "mailto:partners@wonderlandsworld.com" },
          { label: "Client Onboarding", href: "mailto:sales@wonderlandsworld.com" },
        ].map((cta, i) => (
          <a
            key={i}
            href={cta.href}
            className="px-8 py-3 rounded-full border border-[hsl(45,100%,65%)]/40 text-white hover:bg-[hsl(45,100%,65%)]/10 transition-colors text-sm tracking-wider uppercase"
          >
            {cta.label}
          </a>
        ))}
      </div>
      <p className="text-white/30 text-xs mt-16">www.wonderlandsworld.com · +1 (407) 760-4873</p>
    </div>
  </div>
);

// ─── Layout Wrapper ─────────────────────────────────────────────

const DeckSlide = ({
  label,
  title,
  children,
  dark,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) => (
  <div className={`relative w-full h-full flex flex-col justify-center px-12 md:px-24 py-16 overflow-hidden ${dark ? "bg-[hsl(220,30%,8%)]" : "bg-background"}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(45,80%,20%)]/5 via-transparent to-[hsl(200,40%,15%)]/5" />
    <div className="relative z-10">
      <p className="text-[hsl(45,100%,65%)] tracking-[0.3em] uppercase text-xs mb-4">{label}</p>
      <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{title}</h2>
      {children}
    </div>
  </div>
);

// ─── Slides Array ───────────────────────────────────────────────

const slides = [
  CoverSlide,
  VisionSlide,
  ProblemSlide,
  OpportunitySlide,
  SolutionSlide,
  ApproachSlide,
  ServicesSlide,
  AestheticSlide,
  RevenueSlide,
  PositioningSlide,
  GrowthSlide,
  FutureSlide,
  CTASlide,
];

// ─── Main Deck Page ─────────────────────────────────────────────

const InvestorDeck = () => {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goNext = useCallback(() => setCurrent((c) => Math.min(c + 1, TOTAL_SLIDES - 1)), []);
  const goPrev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "f" || e.key === "F") setIsFullscreen((v) => !v);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const SlideComponent = slides[current];

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-[9999]" : "min-h-screen"} bg-[hsl(220,30%,8%)] flex flex-col`}>
      {/* Slide viewport */}
      <div className="flex-1 relative overflow-hidden" onClick={goNext}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <SlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls bar */}
      <div className="h-16 bg-[hsl(220,30%,6%)] border-t border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={goPrev} disabled={current === 0} className="p-2 text-white/60 hover:text-white disabled:opacity-20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white/50 text-sm font-mono min-w-[60px] text-center">
            {current + 1} / {TOTAL_SLIDES}
          </span>
          <button onClick={goNext} disabled={current === TOTAL_SLIDES - 1} className="p-2 text-white/60 hover:text-white disabled:opacity-20 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="hidden md:flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-[hsl(45,100%,65%)] w-6" : "bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>

        <button
          onClick={() => setIsFullscreen((v) => !v)}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default InvestorDeck;
