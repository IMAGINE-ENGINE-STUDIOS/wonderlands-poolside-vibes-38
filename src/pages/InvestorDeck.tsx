import * as React from "react";
import { motion } from "framer-motion";
import { Linkedin, Waves, Palmtree, Sparkles, Moon, Palette, Hammer, Droplets, Flame, Sun, Home, Leaf, BrickWall, Lock, ShieldCheck, DoorOpen, PaintBucket, Building2, UmbrellaOff, Hotel, Globe, ArrowRight, Lightbulb, ClipboardList, FileCheck, HardHat, CookingPot, Fence, TreePine } from "lucide-react";

// Pool & asset images
import olympiaPool from "@/assets/pools/olympia-12-optimized.webp";
import bermudaPool from "@/assets/pools/bermuda.jpg";
import valenciaPool from "@/assets/pools/valencia.jpg";
import synergyPool from "@/assets/pools/synergy.jpg";
import genesisPool from "@/assets/pools/genesis.jpg";
import fijiPool from "@/assets/pools/fiji.jpg";
import geometricPool from "@/assets/pools/geometric-luxury.jpg";
import enchantmentPool from "@/assets/pools/enchantment-917-installed.jpg";
import axiomPool from "@/assets/pools/axiom-14-deluxe-main.jpg";
import lanaiDeluxe from "@/assets/lanai-deluxe.jpg";
import screenEnclosure from "@/assets/screen-enclosure-deluxe.jpeg";
import fenceImg from "@/assets/aluminum-fencing.jpg";
import paverImg from "@/assets/serenitykit.jpg";
import wonderlandsHero from "@/assets/wonderlands-hero.png";
import wonderlandsLogo from "@/assets/wonderlands-logo.png";

const SectionLogo = () => (
  <img src={wonderlandsLogo} alt="Wonderlands" className="absolute top-6 right-6 h-12 md:h-16 z-20 opacity-80" />
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
    <img
      src={wonderlandsHero}
      alt="Wonderlands – Pools for Outdoor Living"
      className="w-full h-auto block"
    />
  </section>
);

const VisionSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(173,58%,30%)] via-[hsl(200,50%,25%)] to-[hsl(220,40%,15%)]" />
    <img src={bermudaPool} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6 text-center"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4">Vision</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 leading-tight">
        We Design Destinations,<br />Not Backyards
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-10">
        {[
          { icon: Waves, text: "Transform residential spaces into immersive outdoor environments" },
          { icon: Palmtree, text: "Elevate Florida luxury living through experience design" },
          { icon: Sparkles, text: "Combine pool architecture, storytelling & entertainment" },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <item.icon className="w-12 h-12 text-[hsl(45,100%,70%)] mb-4 mx-auto" strokeWidth={1.5} />
            <p className="text-white/85 text-lg leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const ProblemSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(12,76%,45%)] to-[hsl(27,87%,50%)]" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-white/70 tracking-[0.3em] uppercase text-sm mb-4 text-center">The Problem</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        A Fragmented Market
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { stat: "87%", desc: "of luxury homeowners say their outdoor space lacks cohesion" },
          { stat: "5+", desc: "contractors needed for a single outdoor project" },
          { stat: "0", desc: "brands offering end-to-end luxury outdoor experiences" },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp} className="bg-black/20 backdrop-blur-sm rounded-3xl p-10 text-center border border-white/10">
            <p className="text-6xl font-black text-white mb-3">{item.stat}</p>
            <p className="text-white/80 text-lg">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const OpportunitySection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,40%,12%)] to-[hsl(260,50%,18%)]" />
    <img src={fijiPool} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">The Opportunity</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Florida's Luxury Market Is Exploding
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div variants={fadeUp} className="space-y-6">
          {[
            "High net-worth relocation to Florida at all-time highs",
            "Year-round outdoor living climate",
            "Demand for Instagram-worthy luxury spaces",
            "$4.2B+ residential pool market in Florida",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="text-[hsl(25,90%,60%)] text-2xl mt-0.5">→</span>
              <p className="text-white/85 text-xl">{text}</p>
            </div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="w-72 h-72 rounded-full bg-gradient-to-br from-[hsl(25,90%,55%)] to-[hsl(340,70%,50%)] flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <p className="text-6xl font-black text-white">$4.2B+</p>
              <p className="text-white/70 mt-2">FL Pool Market</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  </section>
);

const SolutionSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(173,58%,25%)] via-[hsl(190,50%,20%)] to-[hsl(210,40%,15%)]" />
    <img src={enchantmentPool} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6 text-center"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4">The Solution</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16">
        The Wonderlands Experience
      </motion.h2>
      {/* Dream → Design → Deliver */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-16">
        {[
          { label: "Dream", Icon: Moon },
          { label: "Design", Icon: Palette },
          { label: "Deliver", Icon: Hammer },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && <ArrowRight className="text-[hsl(25,90%,60%)] w-10 h-10 hidden md:block" />}
            <div className="w-52 h-52 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex flex-col items-center justify-center gap-3">
              <step.Icon className="w-10 h-10 text-[hsl(45,100%,70%)]" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-white">{step.label}</p>
            </div>
          </React.Fragment>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          "Concept & Storytelling",
          "Pool Selection & Customization",
          "Patio & Entertainment Layout",
          "Branded Experience Elements",
          "Seamless Construction",
        ].map((item, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <p className="text-white/85 text-sm font-medium">{item}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  </section>
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
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(25,85%,50%)] via-[hsl(340,65%,45%)] to-[hsl(280,50%,30%)]" />
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 container mx-auto px-6"
      >
        <motion.p variants={fadeUp} className="text-white/70 tracking-[0.3em] uppercase text-sm mb-4 text-center">Our Signature Approach</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-20 text-center">
          One Stop Shop — Idea to Turnkey
        </motion.h2>

        {/* Curvy Roadmap */}
        <motion.div variants={fadeUp} className="relative max-w-5xl mx-auto">
          {/* SVG curvy path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 1000 320" fill="none" preserveAspectRatio="none">
            <path
              d="M 80 80 C 200 80, 200 240, 380 240 S 560 80, 680 80 S 860 240, 920 240"
              stroke="hsl(45,100%,70%)"
              strokeWidth="3"
              strokeDasharray="12 8"
              opacity="0.4"
              fill="none"
            />
          </svg>

          {/* Main steps zigzag */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-6">
            {mainSteps.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp}
                className={`flex flex-col items-center text-center ${i % 2 === 1 ? "md:mt-24" : ""}`}
              >
                <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm border-2 border-[hsl(45,100%,70%)]/50 flex items-center justify-center mb-4 shadow-lg shadow-black/20">
                  <step.icon className="w-9 h-9 text-[hsl(45,100%,70%)]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{step.label}</h3>
                <p className="text-white/60 text-sm">{step.desc}</p>
                {i < mainSteps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-[hsl(45,100%,70%)]/50 mt-4 md:hidden" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Construction branches */}
          <motion.div variants={fadeUp} className="mt-20">
            <div className="flex justify-center mb-6">
              <div className="w-px h-12 bg-gradient-to-b from-[hsl(45,100%,70%)]/60 to-[hsl(45,100%,70%)]/20" />
            </div>
            <p className="text-center text-[hsl(45,100%,70%)] text-xs tracking-[0.3em] uppercase mb-8">Construction Services</p>

            <div className="relative">
              <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[hsl(45,100%,70%)]/30 to-transparent" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {constructionBranches.map((branch) => (
                  <motion.div key={branch.label} variants={fadeUp} className="flex flex-col items-center text-center group">
                    <div className="hidden md:block w-px h-4 bg-[hsl(45,100%,70%)]/30 mb-2" />
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3 group-hover:bg-white/20 group-hover:border-[hsl(45,100%,70%)]/40 transition-all duration-300">
                      <branch.icon className="w-6 h-6 text-white/90" strokeWidth={1.5} />
                    </div>
                    <p className="text-white/80 text-sm font-medium">{branch.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};


const PoolShowcaseSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200,50%,12%)] to-[hsl(173,50%,15%)]" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">Our Collection</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Premium Pool Models
      </motion.h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { img: olympiaPool, name: "Olympia" },
          { img: bermudaPool, name: "Bermuda" },
          { img: synergyPool, name: "Synergy" },
          { img: genesisPool, name: "Genesis" },
          { img: valenciaPool, name: "Valencia" },
          { img: fijiPool, name: "Fiji" },
          { img: enchantmentPool, name: "Enchantment" },
          { img: axiomPool, name: "Axiom Deluxe" },
        ].map((pool, i) => (
          <motion.div key={i} variants={fadeUp} className="group relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img src={pool.img} alt={pool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-white font-bold text-lg drop-shadow-lg">{pool.name}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const ServicesSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260,50%,25%)] via-[hsl(280,40%,20%)] to-[hsl(220,40%,12%)]" />
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
      <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-3 auto-rows-[180px] md:auto-rows-[200px]">
        {[
          { img: olympiaPool, label: "Fiberglass Pools", span: "md:col-span-2 md:row-span-2" },
          { img: lanaiDeluxe, label: "Lanai", span: "" },
          { img: screenEnclosure, label: "Screen Enclosures", span: "" },
          { img: bermudaPool, label: "Hot Tubs & Spas", span: "" },
          { img: paverImg, label: "Pavers", span: "" },
          { img: fenceImg, label: "Fencing & Gates", span: "md:col-span-2" },
          { img: enchantmentPool, label: "Pool Finishes", span: "" },
          { img: valenciaPool, label: "Tanning Ledges", span: "" },
          { img: genesisPool, label: "Outdoor Kitchen", span: "" },
          { img: axiomPool, label: "Full Construction", span: "" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className={`relative group rounded-2xl overflow-hidden ${item.span}`}
          >
            <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-bold text-lg drop-shadow-lg">{item.label}</p>
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
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(173,58%,25%)] to-[hsl(200,45%,15%)]" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,100%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center">Revenue Model</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Multiple Revenue Streams
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-8">
        {[
          { title: "Design Consultation", amount: "$2,500 – $10,000", desc: "Per project concept & design fee" },
          { title: "Project Oversight", amount: "8 – 15%", desc: "Of total project value" },
          { title: "Partner Commissions", amount: "10 – 20%", desc: "Product markups & referrals" },
          { title: "Premium Branding", amount: "$5,000+", desc: "Branded experience packages" },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp} className="p-10 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-3">
            <p className="text-[hsl(25,90%,65%)] text-sm uppercase tracking-wider font-medium">{item.title}</p>
            <p className="text-5xl font-black text-white">{item.amount}</p>
            <p className="text-white/60">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

const PositioningSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(25,85%,50%)] to-[hsl(12,76%,40%)]" />
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-10 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-white/70 tracking-[0.3em] uppercase text-sm mb-4 text-center">Market Positioning</motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold text-white mb-16 text-center">
        Redefining the Category
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
        <motion.div variants={fadeUp} className="space-y-6 p-10 rounded-3xl bg-black/20 border border-white/10">
          <h3 className="text-2xl font-bold text-white/50 line-through">We Are NOT</h3>
          {["A pool installer", "A landscaper", "A general contractor"].map((item, i) => (
            <p key={i} className="text-white/50 text-xl">✕ {item}</p>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} className="space-y-6 p-10 rounded-3xl bg-white/10 border border-[hsl(45,100%,65%)]/30">
          <h3 className="text-2xl font-bold text-[hsl(45,100%,70%)]">We ARE</h3>
          {[
            "A luxury outdoor experience design brand",
            "A one-stop-shop from idea to turnkey",
            "A lifestyle company for Florida's elite",
          ].map((item, i) => (
            <p key={i} className="text-white text-xl">✓ {item}</p>
          ))}
        </motion.div>
      </div>
    </motion.div>
  </section>
);

const TeamSection = () => (
  <section className="relative py-32 overflow-hidden">
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,40%,12%)] to-[hsl(260,40%,18%)]" />
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
          <motion.div key={i} variants={fadeUp} className="text-center space-y-4 p-6 rounded-3xl bg-white/5 border border-white/10">
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
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(173,50%,20%)] to-[hsl(200,40%,12%)]" />
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
                <span key={j} className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-sm">{sub}</span>
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
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260,50%,22%)] via-[hsl(280,45%,18%)] to-[hsl(220,40%,12%)]" />
    <img src={synergyPool} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" />
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
          <motion.div key={i} variants={fadeUp} className="p-10 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-4 text-center">
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
    <SectionLogo />
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(25,90%,50%)] via-[hsl(340,70%,45%)] to-[hsl(260,60%,25%)]" />
    <img src={geometricPool} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" />
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-10 text-center space-y-10 max-w-3xl px-8"
    >
      <img
        src="/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png"
        alt="Wonderlands Logo"
        className="h-24 mx-auto drop-shadow-2xl"
      />
      <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
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

// ─── Main Page ──────────────────────────────────────────────────

const InvestorDeck = () => (
  <div className="overflow-x-hidden">
    <HeroSection />
    <VisionSection />
    <ProblemSection />
    <OpportunitySection />
    <SolutionSection />
    <ApproachSection />
    <PoolShowcaseSection />
    <ServicesSection />
    <RevenueSection />
    <PositioningSection />
    <TeamSection />
    <GrowthSection />
    <FutureSection />
    <CTASection />
  </div>
);

export default InvestorDeck;
