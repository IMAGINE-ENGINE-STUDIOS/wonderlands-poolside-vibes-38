import * as React from "react";
import { motion } from "framer-motion";
import { Linkedin, Waves, Palmtree, Sparkles, Moon, Palette, Hammer, Droplets, Flame, Sun, Home, Leaf, BrickWall, Lock, ShieldCheck, DoorOpen, PaintBucket, Building2, UmbrellaOff, Hotel, Globe, ArrowRight, Lightbulb, ClipboardList, FileCheck, HardHat, CookingPot, Fence, TreePine, TrendingUp, DollarSign, Users, Search, Clock, AlertTriangle, Wrench, Timer, UserX } from "lucide-react";

// Pool & asset images
import olympiaPool from "@/assets/pools/olympia-12-optimized.webp";
import bermudaPool from "@/assets/pools/bermuda.webp";
import valenciaPool from "@/assets/pools/valencia.webp";
import synergyPool from "@/assets/pools/synergy.webp";
import genesisPool from "@/assets/pools/genesis.webp";
import fijiPool from "@/assets/pools/fiji.webp";
import geometricPool from "@/assets/pools/geometric-luxury.webp";
import enchantmentPool from "@/assets/pools/enchantment-917-installed.webp";
import axiomPool from "@/assets/pools/axiom-14-deluxe-main.webp";
import lanaiDeluxe from "@/assets/enclosures/lanai-deluxe.webp";
import screenEnclosure from "@/assets/enclosures/screen-enclosure-deluxe.webp";
import fenceImg from "@/assets/fencing/aluminum-fencing.webp";
import paverImg from "@/assets/water-features/waterfalls/serenitykit.webp";
import wonderlandsHero from "@/assets/hero/wonderlands-hero.webp";
import wonderlandsLogo from "@/assets/brand/wonderlands-logo.webp";
import outdoorKitchen from "@/assets/deck/outdoor-kitchen.webp";
import saunaImg from "@/assets/deck/sauna-real.webp";
import pergolaImg from "@/assets/deck/pergola.webp";
import gardenImg from "@/assets/deck/garden.webp";
import spaImg from "@/assets/deck/hot-tub-spa.webp";
import luxuryPoolImg from "@/assets/deck/luxury-pool.webp";
import kidsParkImg from "@/assets/deck/playground.webp";
import tanningLedgeImg from "@/assets/deck/tanning-ledge.webp";
import luxuryOutdoorImg from "@/assets/deck/luxury-outdoor.webp";
import firePitImg from "@/assets/deck/fire-pit.webp";
import lightingImg from "@/assets/deck/lighting.webp";
import wonderlandsCta from "@/assets/deck/wonderlands-cta.webp";

const SectionLogo = () => (
  <img loading="lazy" decoding="async" src={wonderlandsLogo} alt="Wonderlands" className="absolute top-6 right-6 h-12 md:h-16 z-20 opacity-80" />
);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─── Sections ───────────────────────────────────────────────────

const HeroSection = () => (
  <section className="relative w-full flex items-center justify-center">
    <img loading="lazy" decoding="async"
      src={wonderlandsHero}
      alt="Wonderlands – Pools for Outdoor Living"
      className="w-full h-auto block"
    />
  </section>
);

const VisionSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark navy background matching Market Opportunity */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Subtle floating glow */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ background: "radial-gradient(ellipse at 30% 40%, hsl(200,60%,40%) 0%, transparent 50%)" }}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />




      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-20 container mx-auto px-6 text-center"
      >
        <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.4em] uppercase text-sm mb-6 font-medium">
          Our Vision
        </motion.p>
        
        <motion.h2
          variants={fadeUp}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight"
        >
          <motion.span
            className="inline-block bg-gradient-to-r from-[hsl(45,100%,75%)] via-[hsl(30,100%,70%)] to-[hsl(45,100%,75%)] bg-clip-text text-transparent"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ backgroundSize: "200% 200%" }}
          >
            Wonderful
          </motion.span>
          <br />
          <span className="text-white drop-shadow-lg">Luxury Destinations</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-16 leading-relaxed drop-shadow-md"
        >
          Where every backyard becomes a resort — and every splash tells a story.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Waves, label: "Immersive Spaces", text: "Transforming residential backyards into breathtaking outdoor environments" },
            { icon: Palmtree, label: "Florida Luxury", text: "Elevating luxury living through world-class experience design" },
            { icon: Sparkles, label: "Full Experience", text: "Pool architecture, entertainment, storytelling — all in one" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-[hsl(210,40%,15%)]/70 backdrop-blur-md rounded-3xl p-8 border border-white/15 hover:border-[hsl(45,100%,70%)]/30 transition-colors duration-500"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                <item.icon className="w-14 h-14 text-[hsl(45,100%,75%)] mb-5 mx-auto" strokeWidth={1.2} />
              </motion.div>
              <h3 className="text-white font-bold text-lg mb-2">{item.label}</h3>
              <p className="text-white/70 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(220,40%,6%)] to-transparent" />
    </section>
  );
};

const ProblemSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <SectionLogo />
    {/* Dark navy background matching Market Opportunity */}
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

    {/* Subtle stress lines - cool toned */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-[1px] origin-bottom"
        style={{
          height: "50vh",
          rotate: `${angle}deg`,
          background: "linear-gradient(0deg, transparent 0%, hsl(200,50%,40%) 50%, transparent 100%)",
        }}
        animate={{ opacity: [0, 0.05, 0], scaleY: [0.8, 1.1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
      />
    ))}

    {/* Pulsing cool glow */}
    <motion.div
      className="absolute inset-0"
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(210,40%,20%) 0%, transparent 60%)" }}
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Content */}
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-20 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(200,70%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center font-medium">
        The Problem
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 text-center leading-tight">
        A Fragmented Market
      </motion.h2>
      <motion.p variants={fadeUp} className="text-white/60 text-lg md:text-xl text-center max-w-3xl mx-auto mb-16">
        Homeowners waste months coordinating multiple contractors, losing time and money on disconnected projects.
      </motion.p>

      {/* Timeline with icons */}
      <motion.div variants={fadeUp} className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-[2px] bg-white/10" />
          <motion.div
            className="absolute top-6 left-0 h-[2px] bg-gradient-to-r from-[hsl(200,70%,55%)] to-[hsl(0,60%,55%)]"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true }}
          />
          <div className="flex justify-between relative">
            {[
              { week: "Week 1-4", task: "Find pool contractor", Icon: Search, lost: "$2,000" },
              { week: "Week 5-10", task: "Wait for permits", Icon: ClipboardList, lost: "$5,000" },
              { week: "Week 11-16", task: "Find paver installer", Icon: BrickWall, lost: "$3,500" },
              { week: "Week 17-24", task: "Coordinate landscaping", Icon: TreePine, lost: "$4,000" },
              { week: "Week 25+", task: "Still not done...", Icon: AlertTriangle, lost: "$8,000+" },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center w-1/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-[hsl(220,30%,15%)] border-2 border-[hsl(200,60%,45%)]/50 flex items-center justify-center mb-3 relative z-10"
                  animate={{ scale: [1, 1.1, 1], borderColor: ["hsl(200,60%,45%)", "hsl(0,60%,55%)", "hsl(200,60%,45%)"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <step.Icon className="w-5 h-5 text-[hsl(200,70%,70%)]" strokeWidth={2} />
                </motion.div>
                <p className="text-white/90 text-xs md:text-sm font-bold text-center">{step.week}</p>
                <p className="text-white/50 text-[10px] md:text-xs text-center mt-1">{step.task}</p>
                <motion.p
                  className="text-[hsl(0,70%,60%)] text-xs font-bold mt-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  -{step.lost}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats with icons */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { stat: "6+ months", desc: "Average time to complete a luxury outdoor project", Icon: Timer },
          { stat: "$22,500+", desc: "Lost to miscoordination, delays & change orders", Icon: DollarSign },
          { stat: "5+ vendors", desc: "That homeowners must find, vet & manage alone", Icon: UserX },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            className="bg-[hsl(220,25%,12%)]/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-[hsl(200,40%,30%)]/30 hover:border-[hsl(200,60%,50%)]/40 transition-colors"
          >
            <motion.div
              className="mx-auto mb-3"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            >
              <item.Icon className="w-10 h-10 text-[hsl(200,70%,65%)] mx-auto" strokeWidth={1.5} />
            </motion.div>
            <motion.p
              className="text-3xl md:text-4xl font-black text-white mb-2"
              animate={{ color: ["hsl(0,0%,100%)", "hsl(200,70%,75%)", "hsl(0,0%,100%)"] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            >
              {item.stat}
            </motion.p>
            <p className="text-white/65 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const MarketOpportunitySection = () => {
  const pieSegments = [
    { label: "New Construction", pct: 42, value: "$1.76B", color: "hsl(200,70%,50%)" },
    { label: "Renovation", pct: 28, value: "$1.18B", color: "hsl(25,90%,55%)" },
    { label: "Maintenance", pct: 18, value: "$756M", color: "hsl(173,58%,39%)" },
    { label: "Accessories & Tech", pct: 12, value: "$504M", color: "hsl(45,100%,60%)" },
  ];

  const growthMetrics = [
    { label: "FL Population Growth", value: "+1,000", unit: "people/day", icon: TrendingUp },
    { label: "Luxury Home Permits", value: "+34%", unit: "YoY 2024", icon: Home },
    { label: "Avg. Project Value", value: "$150K", unit: "per project", icon: DollarSign },
    { label: "Repeat Customer Rate", value: "68%", unit: "within 3 yrs", icon: Users },
  ];

  const marketBars = [
    { label: "Florida Pool & Spa", value: "$4.2B", width: 100, growth: "+8.3%" },
    { label: "Outdoor Living (SE US)", value: "$12.8B", width: 78, growth: "+11.2%" },
    { label: "Design Services", value: "$8.5B", width: 55, growth: "+15.7%" },
    { label: "Total Addressable", value: "$28B+", width: 42, growth: "+9.8%" },
  ];

  // SVG donut chart
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <section className="relative py-28 overflow-hidden">
      <SectionLogo />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container mx-auto px-6"
      >
        <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-3 text-center">Market Opportunity</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-6 text-center">
          A $28B+ Outdoor Living Market
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/50 text-center text-lg mb-16 max-w-2xl mx-auto">
          Florida leads U.S. growth in luxury outdoor construction, fueled by record migration and year-round climate demand.
        </motion.p>

        {/* Top row: KPI cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {growthMetrics.map((m) => (
            <div key={m.label} className="relative p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm overflow-hidden group">
              <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <m.icon className="w-12 h-12 text-white" />
              </div>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">{m.label}</p>
              <p className="text-3xl md:text-4xl font-black text-white leading-none">{m.value}</p>
              <p className="text-[hsl(173,58%,55%)] text-sm mt-1 font-medium">{m.unit}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Donut chart - FL Pool Market Breakdown */}
          <motion.div variants={fadeUp} className="flex flex-col items-center">
            <h3 className="text-white/70 text-sm uppercase tracking-widest mb-8">Florida Pool Market — $4.2B Breakdown</h3>
            <div className="relative">
              <svg width="220" height="220" viewBox="0 0 220 220">
                {pieSegments.map((seg, i) => {
                  const segLength = (seg.pct / 100) * circumference;
                  const offset = cumulativeOffset;
                  cumulativeOffset += segLength;
                  return (
                    <motion.circle
                      key={seg.label}
                      cx="110" cy="110" r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="28"
                      strokeDasharray={`${segLength} ${circumference - segLength}`}
                      strokeDashoffset={-offset}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                      style={{ transformOrigin: '110px 110px', transform: 'rotate(-90deg)' }}
                    />
                  );
                })}
                <text x="110" y="102" textAnchor="middle" fill="white" fontSize="28" fontWeight="900">$4.2B</text>
                <text x="110" y="124" textAnchor="middle" fill="hsl(0,0%,60%)" fontSize="11">FL POOL MARKET</text>
              </svg>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-8">
              {pieSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <div>
                    <p className="text-white/80 text-sm">{seg.label}</p>
                    <p className="text-white/40 text-xs">{seg.value} ({seg.pct}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Market size bars with growth badges */}
          <motion.div variants={fadeUp} className="space-y-6">
            <h3 className="text-white/70 text-sm uppercase tracking-widest mb-8">Addressable Market Tiers</h3>
            {marketBars.map((m, i) => (
              <div key={m.label} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <p className="text-white/80 text-sm font-medium">{m.label}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[hsl(173,58%,55%)] text-xs font-semibold bg-[hsl(173,58%,39%)]/15 px-2 py-0.5 rounded-full">{m.growth}</span>
                    <p className="text-2xl font-black text-white">{m.value}</p>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${m.width}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[hsl(200,70%,50%)] to-[hsl(25,90%,55%)]"
                  />
                </div>
              </div>
            ))}

            {/* TAM / SAM / SOM inline */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-5">Our Position</p>
              <div className="flex items-end justify-between gap-4">
                {[
                  { label: "TAM", value: "$28B+", h: "h-28", sub: "Total Market" },
                  { label: "SAM", value: "$4.2B", h: "h-20", sub: "Florida Focus" },
                  { label: "SOM", value: "$120M", h: "h-14", sub: "Year 5 Target" },
                ].map((b) => (
                  <motion.div
                    key={b.label}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex-1 flex flex-col items-center origin-bottom"
                  >
                    <p className="text-xl font-black text-white mb-2">{b.value}</p>
                    <div className={`w-full ${b.h} rounded-t-xl bg-gradient-to-t from-[hsl(200,70%,50%)]/30 to-[hsl(45,100%,60%)]/20 border border-white/10`} />
                    <p className="text-[hsl(45,100%,70%)] text-xs font-bold mt-2">{b.label}</p>
                    <p className="text-white/35 text-[10px]">{b.sub}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

const SolutionSection = () => {
  const phases = [
    {
      label: "Dream",
      Icon: Moon,
      img: geometricPool,
      tagline: "Your vision begins",
      details: ["Lifestyle consultation", "Inspiration & mood boards", "Budget planning"],
      gradient: "from-[hsl(260,60%,50%)] to-[hsl(280,50%,40%)]",
    },
    {
      label: "Design",
      Icon: Palette,
      img: luxuryPoolImg,
      tagline: "We bring it to life",
      details: ["3D immersive rendering", "Material & finish selection", "Permit-ready blueprints"],
      gradient: "from-[hsl(25,90%,55%)] to-[hsl(340,70%,50%)]",
    },
    {
      label: "Deliver",
      Icon: Hammer,
      img: luxuryOutdoorImg,
      tagline: "Turnkey perfection",
      details: ["Professional construction", "Quality inspections", "Resort-ready handoff"],
      gradient: "from-[hsl(173,58%,39%)] to-[hsl(200,70%,45%)]",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <SectionLogo />

      {/* Dark navy background matching Market Opportunity */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container mx-auto px-6"
      >
        <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-3 text-center">The Solution</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 text-center drop-shadow-lg">
          From Dream to Reality
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/70 text-center text-lg mb-16 max-w-2xl mx-auto drop-shadow">
          We don't just build pools — we craft luxury outdoor experiences from the first sketch to the final reveal.
        </motion.p>

        {/* Phase cards */}
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full h-full bg-gradient-to-r from-[hsl(260,60%,50%)] via-[hsl(25,90%,55%)] to-[hsl(173,58%,45%)] origin-left"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="group"
              >
                <div className="relative rounded-3xl overflow-hidden bg-black/40 border border-white/15 backdrop-blur-md shadow-2xl">
                  <div className="relative h-52 overflow-hidden">
                    <motion.img
                      src={phase.img}
                      alt={phase.label}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${phase.gradient} opacity-60 mix-blend-multiply`} />
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.25, type: "spring" }}
                      className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center"
                    >
                      <span className="text-white font-black text-lg">{i + 1}</span>
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                      className="absolute bottom-4 right-4"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <phase.Icon className="w-7 h-7 text-[hsl(45,100%,70%)]" strokeWidth={1.5} />
                      </div>
                    </motion.div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1">{phase.label}</h3>
                      <p className="text-[hsl(45,100%,70%)] text-sm font-medium">{phase.tagline}</p>
                    </div>
                    <div className="space-y-2">
                      {phase.details.map((d, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.8 + i * 0.25 + j * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${phase.gradient}`} />
                          <p className="text-white/60 text-sm">{d}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {i < 2 && (
                  <div className="flex justify-center py-4 md:hidden">
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="w-6 h-6 text-[hsl(45,100%,70%)] rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-black/30 border border-white/15 backdrop-blur-md shadow-lg">
            <Sparkles className="w-5 h-5 text-[hsl(45,100%,70%)]" />
            <p className="text-white/80 text-sm">
              Every project is a <span className="text-white font-bold">one-of-a-kind luxury experience</span> — not just construction.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};



const BubbleIcon = ({ icon: Icon, label, delay }: { icon: React.ElementType; label: string; delay: number }) => (
  <motion.div
    className="flex flex-col items-center text-center group"
    initial={{ scale: 0, opacity: 0 }}
    whileInView={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    <motion.div
      className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mb-3 relative"
      whileHover={{ scale: 1.2 }}
      animate={{
        boxShadow: [
          "0 0 0px 0px hsla(45,100%,70%,0)",
          "0 0 15px 5px hsla(45,100%,70%,0.25)",
          "0 0 0px 0px hsla(45,100%,70%,0)",
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, delay: delay * 0.5 }}
    >
      <Icon className="w-7 h-7 text-white/90" strokeWidth={1.5} />
      {/* Bubble pop particles on appear */}
      {[0, 1, 2, 3, 4, 5].map((p) => (
        <motion.div
          key={p}
          className="absolute w-1.5 h-1.5 bg-[hsl(45,100%,75%)] rounded-full"
          initial={{ scale: 1, opacity: 0.8, x: 0, y: 0 }}
          whileInView={{
            x: [0, Math.cos(p * 60 * Math.PI / 180) * 30],
            y: [0, Math.sin(p * 60 * Math.PI / 180) * 30],
            opacity: [0.8, 0],
            scale: [1, 0.3],
          }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
        />
      ))}
    </motion.div>
    <p className="text-white/80 text-sm font-medium">{label}</p>
  </motion.div>
);

const ApproachSection = () => {
  const mainSteps = [
    { icon: Lightbulb, label: "Idea", desc: "Your vision starts here" },
    { icon: ClipboardList, label: "Planning", desc: "Design & budgeting" },
    { icon: FileCheck, label: "Permit", desc: "Approvals & compliance" },
    { icon: HardHat, label: "Construction", desc: "Turnkey execution" },
  ];

  const constructionBranches = [
    { icon: Droplets, label: "Pools" },
    { icon: Flame, label: "Saunas" },
    { icon: TreePine, label: "Pergolas" },
    { icon: Home, label: "Screen Enclosures" },
    { icon: BrickWall, label: "Pavers" },
    { icon: CookingPot, label: "Outdoor Kitchen" },
    { icon: Fence, label: "Fencing & Gates" },
    { icon: Waves, label: "Hot Tubs & Spas" },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      <SectionLogo />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container mx-auto px-6"
      >
        <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">Our Signature Approach</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-20 text-center">
          One Stop Shop — Idea to Turnkey
        </motion.h2>

        {/* Integrated Animated Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical animated progress line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px]">
            <motion.div
              className="w-full h-full bg-gradient-to-b from-[hsl(45,100%,70%)] via-[hsl(173,58%,45%)] to-[hsl(260,60%,50%)]"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ transformOrigin: "top" }}
            />
          </div>

          {/* Steps */}
          {mainSteps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.3, ease: "easeOut" }}
                className={`relative flex items-center mb-16 last:mb-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} flex-col md:gap-12`}
              >
                {/* Content card */}
                <motion.div
                  className={`flex-1 ${isLeft ? "md:text-right" : "md:text-left"} text-center`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-8 relative overflow-hidden group">
                    {/* Accent glow on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(circle at ${isLeft ? "right" : "left"} center, hsla(45,100%,70%,0.06), transparent 70%)` }}
                    />
                    <div className="relative z-10">
                      <span className="text-[hsl(45,100%,70%)]/60 text-xs tracking-[0.3em] uppercase font-medium">Step {String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-2xl font-bold text-white mt-2 mb-2">{step.label}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Center node */}
                <div className="relative z-10 my-4 md:my-0 flex-shrink-0">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-[hsl(220,40%,8%)] border-2 border-[hsl(45,100%,70%)]/60 flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.3 + 0.2, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.15, borderColor: "hsl(45,100%,70%)" }}
                  >
                    <step.icon className="w-7 h-7 text-[hsl(45,100%,70%)]" strokeWidth={1.5} />
                  </motion.div>
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[hsl(45,100%,70%)]/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  />
                </div>

                {/* Empty spacer for opposite side */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            );
          })}
        </div>

        {/* Construction branches */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-px h-12 bg-gradient-to-b from-[hsl(45,100%,70%)]/60 to-[hsl(45,100%,70%)]/20"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ transformOrigin: "top" }}
            />
          </div>
          <p className="text-center text-[hsl(45,100%,70%)] text-xs tracking-[0.3em] uppercase mb-8">Construction Services</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {constructionBranches.map((branch, i) => (
              <BubbleIcon key={branch.label} icon={branch.icon} label={branch.label} delay={0.8 + i * 0.15} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};


const ServicesSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">Services</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Complete Outdoor Living
      </motion.h2>
      {/* Mosaic Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3" style={{ gridAutoRows: '140px' }}>
        {[
          { img: olympiaPool, label: "Fiberglass Pools", span: "col-span-2 row-span-2" },
          { img: saunaImg, label: "Saunas", span: "" },
          { img: outdoorKitchen, label: "Outdoor Kitchens", span: "col-span-2 row-span-2" },
          { img: paverImg, label: "Pavers & Hardscape", span: "" },
          { img: pergolaImg, label: "Pergolas", span: "" },
          { img: spaImg, label: "Spa & Hot Tubs", span: "col-span-2" },
          { img: gardenImg, label: "Gardens & Landscaping", span: "" },
          { img: lanaiDeluxe, label: "Lanai Enclosures", span: "" },
          { img: screenEnclosure, label: "Screen Enclosures", span: "" },
          { img: kidsParkImg, label: "Kids Play Areas", span: "" },
          { img: fenceImg, label: "Fencing & Gates", span: "" },
          { img: luxuryPoolImg, label: "Luxury Pools", span: "col-span-2 row-span-2" },
          { img: firePitImg, label: "Fire Pits & Lounge", span: "" },
          { img: lightingImg, label: "Outdoor Lighting", span: "" },
          { img: enchantmentPool, label: "Pool Finishes", span: "" },
          { img: luxuryOutdoorImg, label: "Full Construction", span: "col-span-2" },
          { img: tanningLedgeImg, label: "Tanning Ledges", span: "" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`relative group rounded-xl overflow-hidden ${item.span}`}
          >
            <img src={item.img} alt={item.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-semibold text-sm md:text-base drop-shadow-lg">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const RevenueSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
    
    {/* Animated floating orbs */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={`orb-${i}`}
        className="absolute rounded-full"
        style={{
          width: 80 + (i % 3) * 60,
          height: 80 + (i % 3) * 60,
          left: `${10 + i * 12}%`,
          top: `${20 + (i % 4) * 18}%`,
          background: i % 2 === 0
            ? 'radial-gradient(circle, hsl(200,70%,50%) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(173,60%,40%) 0%, transparent 70%)',
          opacity: 0.08,
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, (i % 2 === 0 ? 20 : -20), 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}

    {/* Subtle grid lines */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: 'linear-gradient(hsl(200,60%,60%) 1px, transparent 1px), linear-gradient(90deg, hsl(200,60%,60%) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    }} />

    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(173,60%,55%)] tracking-[0.3em] uppercase text-sm mb-4 text-center font-medium">Revenue Model</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-6 text-center">
        Multiple Revenue Streams
      </motion.h2>
      <motion.p variants={fadeUp} className="text-white/40 text-center mb-16 max-w-xl mx-auto">Diversified income across construction, distribution, design, and technology</motion.p>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {[
          { title: "Construction", amount: "$150K", sub: "avg project", desc: "Full turnkey outdoor living construction", icon: "🏗️", accent: "hsl(25,90%,60%)" },
          { title: "Dealer & Distribution", amount: "Products", sub: "marketplace", desc: "Fiberglass pools, pavers, equipment & materials", icon: "📦", accent: "hsl(200,70%,55%)" },
          { title: "Design Services", amount: "Design", sub: "studio", desc: "3D rendering, landscape architecture & permitting", icon: "🎨", accent: "hsl(280,60%,65%)" },
          { title: "SaaS Platform", amount: "Software", sub: "recurring", desc: "Pool designer, quoting engine & project management", icon: "💻", accent: "hsl(173,60%,50%)" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative p-8 rounded-2xl overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, hsl(220,40%,14%) 0%, hsl(215,35%,11%) 100%)',
              border: `1px solid hsl(210,30%,20%)`,
            }}
          >
            {/* Card accent glow */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${item.accent}, transparent)` }} />

            <div className="flex items-start gap-5">
              <div className="text-4xl flex-shrink-0">{item.icon}</div>
              <div className="space-y-2 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: item.accent }}>{item.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">{item.amount}</p>
                  <span className="text-white/30 text-sm">{item.sub}</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const TeamSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">Leadership</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        The Team
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { name: "Khalia Padilla", role: "Founder & Creative Director", linkedin: "https://www.linkedin.com/in/khaliapadilla/", initials: "KP" },
          { name: "Ricardo Font", role: "Founder & CEO", linkedin: "https://www.linkedin.com/in/ricardo-font-952034248/", initials: "RF" },
          { name: "Marino Padilla", role: "GC & Co-Founder", linkedin: "https://www.linkedin.com/in/jose-padilla-2018/", initials: "MP" },
          { name: "Betty López", role: "CFO & Co-Founder", linkedin: "https://www.linkedin.com/in/lópez-betty-a6671125/", initials: "BL" },
          { name: "Roberto Font", role: "Strategic Advisor & Co-Founder", linkedin: "", initials: "RF" },
        ].map((member, i) => (
          <motion.div key={i} variants={fadeUp} className="text-center space-y-4 p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[hsl(25,90%,55%)] to-[hsl(340,70%,50%)] flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-white">{member.initials}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{member.name}</h3>
            <p className="text-white/50 text-xs leading-relaxed">{member.role}</p>
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[hsl(25,90%,65%)] hover:text-[hsl(25,90%,80%)] transition-colors text-xs">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const GrowthSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6 max-w-4xl"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">Growth Plan</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Strategic Expansion
      </motion.h2>
      {[
        { phase: "Phase 1 · 2025", title: "Florida Foundation", items: ["Orlando & Central FL focus", "Latham builder partnerships", "Brand recognition"] },
        { phase: "Phase 2 · 2026", title: "Market Expansion", items: ["High-end real estate collabs", "South FL & Tampa expansion", "Premium product lines"] },
        { phase: "Phase 3 · 2027+", title: "Brand Scale", items: ["Franchise / licensing model", "Resort partnerships", "National luxury brand"] },
      ].map((item, i) => (
        <motion.div key={i} variants={fadeUp} className="flex gap-8 items-start mb-10">
          <div className="min-w-[140px] text-right hidden md:block">
            <p className="text-[hsl(25,90%,65%)] font-mono text-sm">{item.phase}</p>
          </div>
          <div className="w-px bg-[hsl(25,90%,55%)]/30 self-stretch hidden md:block" />
          <div>
            <p className="text-[hsl(25,90%,65%)] font-mono text-xs mb-1 md:hidden">{item.phase}</p>
            <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
            <div className="flex flex-wrap gap-3">
              {item.items.map((sub, j) => (
                <span key={j} className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-white/80 text-sm">{sub}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

const FutureSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    <img loading="lazy" decoding="async" src={synergyPool} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">The Future</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        The Future of Wonderlands
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { Icon: UmbrellaOff, title: "Branded Products", desc: "Poolside furniture, umbrellas, floats — all Wonderlands branded luxury goods" },
          { Icon: Hotel, title: "Resort Partnerships", desc: "Design & brand high-end resort pool experiences across Florida & beyond" },
          { Icon: Globe, title: "Franchise Model", desc: "License the Wonderlands experience to operators in luxury markets nationwide" },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp} className="p-10 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/10 space-y-4 text-center">
            <item.Icon className="w-12 h-12 text-[hsl(45,100%,70%)] mx-auto" strokeWidth={1.5} />
            <h3 className="text-2xl font-bold text-white">{item.title}</h3>
            <p className="text-white/70 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const CTASection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <img loading="lazy" decoding="async" src={wonderlandsCta} alt="Wonderlands" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/20" />
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-10 text-center space-y-10 max-w-3xl px-8"
    >
      <h2 className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
        Let's Build the<br />
        <span className="text-[hsl(45,100%,70%)]">Extraordinary.</span>
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-5">
        {[
          { label: "Invest", href: "mailto:investors@wonderlandsworld.com" },
          { label: "Partner", href: "mailto:partners@wonderlandsworld.com" },
          { label: "Get Started", href: "mailto:sales@wonderlandsworld.com" },
        ].map((cta, i) => (
          <a
            key={i}
            href={cta.href}
            className="px-10 py-4 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 transition-colors text-sm tracking-wider uppercase font-medium"
          >
            {cta.label}
          </a>
        ))}
      </div>
      <p className="text-white/40 text-sm mt-16">
        www.wonderlandsworld.com · +1 (407) 760-4873
      </p>
    </motion.div>
  </section>
);

// ─── Financial Model ────────────────────────────────────────────

const FinancialModelSection = () => {
  const projections = [
    { year: "Year 1", revenue: 1.5, profit: 0.49 },
    { year: "Year 2", revenue: 3.0, profit: 0.98 },
    { year: "Year 3", revenue: 4.5, profit: 1.46 },
    { year: "Year 4", revenue: 6.0, profit: 1.95 },
    { year: "Year 5", revenue: 7.5, profit: 2.44 },
  ];
  const maxRevenue = 7.5;

  const useOfFunds = [
    { label: "Sales & Marketing Team", pct: 35, color: "hsl(200,70%,50%)" },
    { label: "Builder Team & Operations", pct: 30, color: "hsl(25,90%,55%)" },
    { label: "Corporate Partnerships", pct: 20, color: "hsl(173,58%,45%)" },
    { label: "Brand & Technology", pct: 15, color: "hsl(45,100%,60%)" },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      <SectionLogo />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,6%)] via-[hsl(230,35%,10%)] to-[hsl(200,40%,8%)]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container mx-auto px-6"
      >
        <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-3 text-center">Financial Model</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-6 text-center">
          $500K Pre-Seed Round
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/50 text-center text-lg mb-16 max-w-3xl mx-auto">
          Scaling Wonderlands across all of Florida — hiring sales & marketing, building a professional construction team, and securing corporate partnerships.
        </motion.p>

        {/* Ask + Projection headline cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Pre-Seed Ask", value: "$500K", accent: true },
            { label: "Year 1 Revenue", value: "$1.5M", accent: false },
            { label: "Year 5 Revenue", value: "$7.5M", accent: false },
            { label: "Profit Margin", value: "30-35%", accent: true },
          ].map((c) => (
            <div key={c.label} className={`p-5 rounded-2xl border backdrop-blur-sm text-center ${c.accent ? 'bg-[hsl(45,100%,60%)]/10 border-[hsl(45,100%,60%)]/30' : 'bg-white/[0.04] border-white/10'}`}>
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">{c.label}</p>
              <p className={`text-3xl md:text-4xl font-black leading-none ${c.accent ? 'text-[hsl(45,100%,70%)]' : 'text-white'}`}>{c.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Revenue projection bar chart */}
          <motion.div variants={fadeUp}>
            <h3 className="text-white/70 text-sm uppercase tracking-widest mb-8">5-Year Revenue Projection</h3>
            <div className="space-y-5">
              {projections.map((p, i) => (
                <div key={p.year} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <p className="text-white/70 text-sm font-medium">{p.year}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[hsl(173,58%,55%)] text-xs font-semibold bg-[hsl(173,58%,39%)]/15 px-2 py-0.5 rounded-full">
                        ${p.profit.toFixed(1)}M profit
                      </span>
                      <p className="text-2xl font-black text-white">${p.revenue}M</p>
                    </div>
                  </div>
                  <div className="w-full h-8 rounded-lg bg-white/[0.06] overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                      className="h-full rounded-lg bg-gradient-to-r from-[hsl(200,70%,50%)] to-[hsl(25,90%,55%)] relative"
                    >
                      {/* Profit portion overlay */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(p.profit / p.revenue) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.12 }}
                        className="absolute right-0 top-0 h-full rounded-r-lg bg-[hsl(45,100%,60%)]/30"
                      />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-r from-[hsl(200,70%,50%)] to-[hsl(25,90%,55%)]" />
                <span className="text-white/40 text-xs">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-[hsl(45,100%,60%)]/40" />
                <span className="text-white/40 text-xs">Net Profit (~32.5%)</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Use of funds */}
          <motion.div variants={fadeUp}>
            <h3 className="text-white/70 text-sm uppercase tracking-widest mb-8">Use of $500K Funds</h3>
            <div className="space-y-4 mb-10">
              {useOfFunds.map((f, i) => (
                <div key={f.label} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <p className="text-white/80 text-sm font-medium">{f.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-white">${(500 * f.pct / 100).toFixed(0)}K</p>
                      <span className="text-white/40 text-xs">({f.pct}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${f.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key milestones */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
              <h4 className="text-[hsl(45,100%,70%)] text-xs uppercase tracking-widest mb-4 font-bold">Key Milestones</h4>
              <div className="space-y-3">
                {[
                  "Expand operations across all Florida regions",
                  "Hire dedicated sales & marketing team",
                  "Build professional builder network (20+ crews)",
                  "Secure 3–5 corporate & resort partnerships",
                  "Achieve $7.5M revenue by Year 5",
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[hsl(173,58%,55%)] mt-0.5 text-sm">✓</span>
                    <p className="text-white/70 text-sm">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// ─── Main Page ──────────────────────────────────────────────────

const InvestorDeck = () => (
  <div className="overflow-x-hidden">
    <HeroSection />
    <VisionSection />
    <ProblemSection />
    <SolutionSection />
    <MarketOpportunitySection />
    <ApproachSection />
    <ServicesSection />
    <RevenueSection />
    <FinancialModelSection />
    
    <TeamSection />
    <GrowthSection />
    <FutureSection />
    <CTASection />
  </div>
);

export default InvestorDeck;
