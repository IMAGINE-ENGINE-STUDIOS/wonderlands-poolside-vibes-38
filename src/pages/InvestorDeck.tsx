import * as React from "react";
import { motion } from "framer-motion";
import { Linkedin, Waves, Palmtree, Sparkles, Moon, Palette, Hammer, Droplets, Flame, Sun, Home, Leaf, BrickWall, Lock, ShieldCheck, DoorOpen, PaintBucket, Building2, UmbrellaOff, Hotel, Globe, ArrowRight, Lightbulb, ClipboardList, FileCheck, HardHat, CookingPot, Fence, TreePine, TrendingUp, DollarSign, Users, Search, Clock, AlertTriangle, Wrench, Timer, UserX } from "lucide-react";

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
import outdoorKitchen from "@/assets/deck/outdoor-kitchen.jpg";
import saunaImg from "@/assets/deck/sauna-real.jpg";
import pergolaImg from "@/assets/deck/pergola.jpg";
import gardenImg from "@/assets/deck/garden.jpg";
import spaImg from "@/assets/deck/hot-tub-spa.jpg";
import luxuryPoolImg from "@/assets/deck/luxury-pool.jpg";
import kidsParkImg from "@/assets/deck/playground.jpg";
import tanningLedgeImg from "@/assets/deck/tanning-ledge.jpg";
import luxuryOutdoorImg from "@/assets/deck/luxury-outdoor.jpg";
import firePitImg from "@/assets/deck/fire-pit.jpg";
import lightingImg from "@/assets/deck/lighting.jpg";
import wonderlandsCta from "@/assets/deck/wonderlands-cta.png";

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

const SwimmerCharacter = () => {
  // Realistic swimmer doing a relaxed breaststroke from bottom-right corner across
  return (
    <motion.div
      className="absolute bottom-[15%] right-[-5%] z-10"
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [-0, -300, -600, -900],
        y: [0, -40, -20, -60],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
        {/* Water line around swimmer */}
        <motion.path
          d="M10 55 Q30 48 50 55 Q70 62 90 55 Q110 48 130 55 Q150 62 170 55 Q185 50 200 55"
          stroke="hsl(195,90%,75%)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          animate={{ d: [
            "M10 55 Q30 48 50 55 Q70 62 90 55 Q110 48 130 55 Q150 62 170 55 Q185 50 200 55",
            "M10 55 Q30 62 50 55 Q70 48 90 55 Q110 62 130 55 Q150 48 170 55 Q185 60 200 55",
            "M10 55 Q30 48 50 55 Q70 62 90 55 Q110 48 130 55 Q150 62 170 55 Q185 50 200 55",
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Head */}
        <motion.ellipse
          cx="120" cy="42" rx="10" ry="11"
          fill="hsl(28,55%,65%)"
          animate={{ cy: [42, 40, 42] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Hair */}
        <motion.ellipse
          cx="120" cy="35" rx="9" ry="5"
          fill="hsl(30,30%,25%)"
          animate={{ cy: [35, 33, 35] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Swim cap detail */}
        <motion.path
          d="M111 38 Q120 28 129 38"
          fill="hsl(200,80%,50%)"
          animate={{ d: ["M111 38 Q120 28 129 38", "M111 36 Q120 26 129 36", "M111 38 Q120 28 129 38"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Torso - slightly submerged */}
        <motion.ellipse
          cx="100" cy="52" rx="22" ry="8"
          fill="hsl(28,55%,62%)"
          animate={{ ry: [8, 9, 8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Swim trunks / suit */}
        <motion.rect
          x="78" y="48" width="20" height="10" rx="5"
          fill="hsl(340,65%,50%)"
          animate={{ y: [48, 47, 48] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Right arm - breaststroke motion */}
        <motion.path
          d="M118 48 Q140 35 150 50"
          stroke="hsl(28,55%,62%)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: [
              "M118 48 Q140 35 150 50",
              "M118 48 Q145 42 135 55",
              "M118 48 Q130 55 115 58",
              "M118 48 Q140 35 150 50",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Right hand */}
        <motion.circle
          cx="150" cy="50" r="4"
          fill="hsl(28,55%,60%)"
          animate={{
            cx: [150, 135, 115, 150],
            cy: [50, 55, 58, 50],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Left arm - breaststroke motion (opposite phase) */}
        <motion.path
          d="M82 48 Q60 35 50 50"
          stroke="hsl(28,55%,62%)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: [
              "M82 48 Q60 35 50 50",
              "M82 48 Q55 42 65 55",
              "M82 48 Q70 55 85 58",
              "M82 48 Q60 35 50 50",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Left hand */}
        <motion.circle
          cx="50" cy="50" r="4"
          fill="hsl(28,55%,60%)"
          animate={{
            cx: [50, 65, 85, 50],
            cy: [50, 55, 58, 50],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Legs - gentle kick */}
        <motion.path
          d="M78 54 Q65 65 60 75"
          stroke="hsl(28,55%,60%)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: [
              "M78 54 Q65 65 60 75",
              "M78 54 Q68 68 65 72",
              "M78 54 Q62 62 55 78",
              "M78 54 Q65 65 60 75",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M80 56 Q70 68 68 78"
          stroke="hsl(28,55%,60%)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: [
              "M80 56 Q70 68 68 78",
              "M80 56 Q62 62 55 75",
              "M80 56 Q72 70 72 74",
              "M80 56 Q70 68 68 78",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Splash / wake behind swimmer */}
        <motion.g opacity="0.5">
          {[0, 1, 2, 3].map((j) => (
            <motion.circle
              key={j}
              cx={55 - j * 15}
              cy={55}
              r={2 + j}
              fill="white"
              animate={{
                opacity: [0.6, 0.2, 0],
                r: [2 + j, 4 + j * 2, 6 + j * 3],
                cx: [55 - j * 15, 45 - j * 18, 35 - j * 20],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: j * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
};

const VisionSection = () => {
  const waterRipples = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep water gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200,80%,55%)] via-[hsl(200,70%,40%)] to-[hsl(210,60%,15%)]" />
      
      {/* Animated water surface light caustics */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, hsl(190,90%,70%) 0%, transparent 50%), radial-gradient(ellipse at 70% 40%, hsl(195,80%,65%) 0%, transparent 40%), radial-gradient(ellipse at 50% 80%, hsl(200,70%,50%) 0%, transparent 60%)",
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated light beams through water */}
      <div className="absolute inset-0 overflow-hidden">
        {[15, 35, 55, 75].map((left, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-[2px] opacity-20"
            style={{
              left: `${left}%`,
              height: "100%",
              background: "linear-gradient(180deg, hsl(190,90%,80%) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.1, 0.3, 0.1], scaleX: [1, 2, 1] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
          />
        ))}
      </div>

      {/* Gentle water surface wave lines */}
      <div className="absolute top-[30%] left-0 right-0">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-full h-[1px] bg-white/10"
            style={{ top: i * 40 }}
            animate={{ scaleX: [0.95, 1.05, 0.95], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Realistic swimmer in bottom-right corner */}
      <SwimmerCharacter />

      {/* Second swimmer further away (smaller, top-left) */}
      <motion.div
        className="absolute top-[55%] left-[-3%] z-10 scale-50 opacity-40"
        initial={{ x: 0 }}
        animate={{ x: [0, 200, 400, 600] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <svg width="200" height="100" viewBox="0 0 200 100" fill="none">
          <ellipse cx="120" cy="42" rx="10" ry="11" fill="hsl(28,55%,65%)" />
          <ellipse cx="120" cy="35" rx="9" ry="5" fill="hsl(25,40%,20%)" />
          <ellipse cx="100" cy="52" rx="22" ry="8" fill="hsl(28,55%,62%)" />
          <rect x="78" y="48" width="20" height="10" rx="5" fill="hsl(200,70%,40%)" />
          <motion.path
            d="M118 48 Q140 35 150 50"
            stroke="hsl(28,55%,62%)" strokeWidth="5" strokeLinecap="round" fill="none"
            animate={{ d: ["M118 48 Q140 35 150 50", "M118 48 Q130 55 115 58", "M118 48 Q140 35 150 50"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Underwater bubbles rising */}
      {Array.from({ length: 12 }, (_, i) => {
        const size = 4 + (i % 4) * 3;
        const leftPos = 20 + (i * 5.5) % 60;
        const dur = 4 + (i % 3) * 2;
        const del = (i * 0.8) % 6;
        return (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/20 backdrop-blur-sm"
            style={{ width: size, height: size, left: `${leftPos}%`, bottom: "-5%" }}
            animate={{
              y: [0, -800],
              x: [0, ((i % 2 === 0 ? 1 : -1) * 30)],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{ duration: dur, repeat: Infinity, delay: del, ease: "easeOut" }}
          />
        );
      })}

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-20 container mx-auto px-6 text-center"
      >
        <motion.p variants={fadeUp} className="text-[hsl(190,90%,85%)] tracking-[0.4em] uppercase text-sm mb-6 font-medium">
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
          <span className="text-white">Luxury Destinations</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-16 leading-relaxed"
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
              className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/15 hover:border-[hsl(45,100%,70%)]/30 transition-colors duration-500"
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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[hsl(210,60%,10%)] to-transparent" />
    </section>
  );
};

const WaitingCharacter = () => (
  <div className="absolute bottom-[12%] left-[6%] z-30 md:left-[4%]">
    <svg width="160" height="220" viewBox="0 0 160 220" fill="none">
      {/* Shadow */}
      <ellipse cx="80" cy="212" rx="35" ry="6" fill="hsl(0,0%,0%)" opacity="0.2" />

      {/* Legs - sitting on invisible chair, crossed */}
      <motion.line x1="65" y1="155" x2="50" y2="200" stroke="hsl(220,30%,40%)" strokeWidth="6" strokeLinecap="round"
        animate={{ x2: [50, 48, 50] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <line x1="85" y1="155" x2="100" y2="195" stroke="hsl(220,30%,40%)" strokeWidth="6" strokeLinecap="round" />
      {/* Foot tapping impatiently */}
      <motion.rect x="40" y="197" width="18" height="7" rx="3" fill="hsl(25,35%,35%)"
        animate={{ rotate: [0, -10, 0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: "50px 200px" }}
      />
      <rect x="93" y="192" width="18" height="7" rx="3" fill="hsl(25,35%,35%)" />

      {/* Body / Polo */}
      <path d="M58 95 Q80 88 102 95 L105 155 H55 Z" fill="hsl(45,85%,55%)" />
      <path d="M65 95 Q80 91 95 95 L93 103 Q80 98 67 103 Z" fill="hsl(45,75%,48%)" />
      <path d="M55 148 H105 L105 158 H55 Z" fill="hsl(220,30%,40%)" />

      {/* Left arm - resting on knee, holding phone */}
      <motion.g animate={{ rotate: [0, -1, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: "60px 100px" }}>
        <line x1="58" y1="100" x2="45" y2="145" stroke="hsl(28,55%,62%)" strokeWidth="5.5" strokeLinecap="round" />
        <rect x="38" y="140" width="14" height="20" rx="2" fill="hsl(220,10%,18%)" />
        <rect x="40" y="142" width="10" height="15" rx="1" fill="hsl(210,50%,55%)" />
      </motion.g>

      {/* Right arm - checking watch */}
      <motion.g
        animate={{ rotate: [0, 20, 0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 100px" }}
      >
        <line x1="100" y1="100" x2="120" y2="125" stroke="hsl(28,55%,62%)" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="120" y1="125" x2="110" y2="115" stroke="hsl(28,55%,62%)" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="110" cy="115" r="6" stroke="hsl(45,60%,55%)" strokeWidth="1.5" fill="hsl(0,0%,95%)" />
        <line x1="110" y1="115" x2="110" y2="111" stroke="hsl(0,0%,20%)" strokeWidth="1" />
        <motion.line x1="110" y1="115" x2="113" y2="115" stroke="hsl(0,70%,50%)" strokeWidth="0.8"
          animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "110px 115px" }}
        />
      </motion.g>

      {/* Head */}
      <ellipse cx="80" cy="76" rx="18" ry="20" fill="hsl(28,55%,65%)" />
      <path d="M62 67 Q70 50 80 48 Q90 50 98 67" fill="hsl(25,30%,22%)" />
      {/* Frustrated eyebrows */}
      <line x1="70" y1="70" x2="76" y2="72" stroke="hsl(25,30%,22%)" strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="70" x2="84" y2="72" stroke="hsl(25,30%,22%)" strokeWidth="2" strokeLinecap="round" />
      {/* Eyes - looking at watch */}
      <circle cx="74" cy="76" r="2.5" fill="hsl(220,40%,25%)" />
      <circle cx="86" cy="76" r="2.5" fill="hsl(220,40%,25%)" />
      {/* Frown */}
      <motion.path d="M73 88 Q80 84 87 88" stroke="hsl(0,40%,40%)" strokeWidth="1.5" strokeLinecap="round" fill="none"
        animate={{ d: ["M73 88 Q80 84 87 88", "M73 89 Q80 85 87 89", "M73 88 Q80 84 87 88"] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Sweat drops */}
      <motion.path d="M100 62 Q102 57 104 62 Q102 67 100 62" fill="hsl(200,80%,70%)"
        animate={{ opacity: [0, 1, 0], y: [0, 8, 16] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.path d="M105 70 Q106.5 66 108 70 Q106.5 74 105 70" fill="hsl(200,80%,70%)"
        animate={{ opacity: [0, 0.8, 0], y: [0, 6, 12] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      />
    </svg>

    {/* Thought bubble */}
    <motion.div
      className="absolute -top-2 left-[130px] md:left-[140px]"
      animate={{ opacity: [0, 1, 1, 0], y: [5, 0, 0, -5] }}
      transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
    >
      <div className="bg-white rounded-2xl px-4 py-2 text-[11px] font-bold text-[hsl(0,60%,40%)] shadow-xl whitespace-nowrap border border-[hsl(45,80%,60%)]">
        Where's the contractor?!
      </div>
      <div className="absolute -bottom-1 left-4 w-3 h-3 bg-white rounded-full border border-[hsl(45,80%,60%)]" />
      <div className="absolute -bottom-3 left-2 w-2 h-2 bg-white rounded-full" />
    </motion.div>
  </div>
);

const AnimatedClock = () => (
  <div className="absolute top-[10%] right-[6%] z-10 hidden md:block">
    <motion.svg width="100" height="100" viewBox="0 0 100 100"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="50" cy="50" r="45" stroke="hsl(45,100%,70%)" strokeWidth="2" fill="none" opacity="0.3" />
      <circle cx="50" cy="50" r="45" stroke="hsl(45,90%,55%)" strokeWidth="2" fill="none" opacity="0.6"
        strokeDasharray="283" strokeDashoffset="70" />
    </motion.svg>
    <motion.div className="absolute top-0 left-0 w-full h-full"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute top-[50%] left-[50%] w-[2px] h-[30px] bg-[hsl(45,90%,55%)]/70 origin-bottom -translate-x-1/2 -translate-y-full rounded" />
    </motion.div>
    <motion.div className="absolute top-0 left-0 w-full h-full"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute top-[50%] left-[50%] w-[2px] h-[20px] bg-white/50 origin-bottom -translate-x-1/2 -translate-y-full rounded" />
    </motion.div>
    <motion.p className="text-center text-[hsl(45,90%,70%)] text-xs mt-2 font-medium"
      animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
    >
      Time wasted
    </motion.p>
  </div>
);

const ProblemSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <SectionLogo />
    {/* Yellow-toned gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(45,70%,12%)] via-[hsl(40,50%,10%)] to-[hsl(35,40%,8%)]" />

    {/* Animated stress lines - warm yellow */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <motion.div
        key={i}
        className="absolute top-1/2 left-1/2 w-[1px] origin-bottom"
        style={{
          height: "50vh",
          rotate: `${angle}deg`,
          background: "linear-gradient(0deg, transparent 0%, hsl(45,80%,45%) 50%, transparent 100%)",
        }}
        animate={{ opacity: [0, 0.06, 0], scaleY: [0.8, 1.1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
      />
    ))}

    {/* Pulsing warm glow */}
    <motion.div
      className="absolute inset-0"
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(45,60%,25%) 0%, transparent 60%)" }}
      animate={{ opacity: [0.1, 0.2, 0.1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />

    {/* Character visible in front */}
    <WaitingCharacter />

    {/* Clock */}
    <AnimatedClock />

    {/* Content */}
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative z-20 container mx-auto px-6"
    >
      <motion.p variants={fadeUp} className="text-[hsl(45,90%,70%)] tracking-[0.3em] uppercase text-sm mb-4 text-center font-medium">
        The Problem
      </motion.p>
      <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 text-center leading-tight">
        A Fragmented Market
      </motion.h2>
      <motion.p variants={fadeUp} className="text-white/60 text-lg md:text-xl text-center max-w-3xl mx-auto mb-16">
        Homeowners waste months coordinating multiple contractors, losing time and money on disconnected projects.
      </motion.p>

      {/* Timeline with icons instead of emojis */}
      <motion.div variants={fadeUp} className="max-w-4xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-[2px] bg-white/10" />
          <motion.div
            className="absolute top-6 left-0 h-[2px] bg-gradient-to-r from-[hsl(45,90%,55%)] to-[hsl(30,80%,50%)]"
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
                  className="w-12 h-12 rounded-full bg-[hsl(45,50%,18%)] border-2 border-[hsl(45,80%,50%)]/50 flex items-center justify-center mb-3 relative z-10"
                  animate={{ scale: [1, 1.1, 1], borderColor: ["hsl(45,80%,50%)", "hsl(30,80%,55%)", "hsl(45,80%,50%)"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <step.Icon className="w-5 h-5 text-[hsl(45,90%,70%)]" strokeWidth={2} />
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

      {/* Stats with icons instead of emojis */}
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
            className="bg-[hsl(45,30%,10%)]/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-[hsl(45,60%,30%)]/30 hover:border-[hsl(45,80%,50%)]/40 transition-colors"
          >
            <motion.div
              className="mx-auto mb-3"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            >
              <item.Icon className="w-10 h-10 text-[hsl(45,90%,65%)] mx-auto" strokeWidth={1.5} />
            </motion.div>
            <motion.p
              className="text-3xl md:text-4xl font-black text-white mb-2"
              animate={{ color: ["hsl(0,0%,100%)", "hsl(45,90%,70%)", "hsl(0,0%,100%)"] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            >
              {item.stat}
            </motion.p>
            <p className="text-white/65 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Bottom gradient */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(40,30%,6%)] to-transparent" />
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

  // Stars for night sky
  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 17 + 7) % 100,
    y: (i * 13 + 3) % 60,
    size: 1 + (i % 3),
    delay: (i * 0.3) % 4,
  }));

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <SectionLogo />

      {/* === ANIMATED SKY: Night → Sunrise → Day === */}
      {/* Night sky base */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, hsl(230,40%,8%) 0%, hsl(240,30%,15%) 40%, hsl(250,25%,20%) 100%)" }}
        initial={{ opacity: 1 }}
        whileInView={{ opacity: [1, 0.6, 0] }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
      />

      {/* Sunrise gradient */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, hsl(30,80%,55%) 0%, hsl(25,90%,60%) 25%, hsl(40,95%,65%) 50%, hsl(45,100%,75%) 100%)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.8, 0.3] }}
        viewport={{ once: true }}
        transition={{ duration: 4, delay: 1.5, ease: "easeInOut" }}
      />

      {/* Day sky */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, hsl(200,75%,55%) 0%, hsl(195,70%,60%) 40%, hsl(190,60%,70%) 70%, hsl(45,50%,85%) 100%)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.5, delay: 3.5, ease: "easeIn" }}
      />

      {/* Stars that fade out */}
      {stars.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          initial={{ opacity: 0.8 }}
          whileInView={{ opacity: [0.8, 1, 0] }}
          viewport={{ once: true }}
          transition={{ duration: 2, delay: 1.5 + star.delay * 0.3, ease: "easeIn" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        />
      ))}

      {/* Moon fading */}
      <motion.div
        className="absolute top-[10%] right-[15%]"
        initial={{ opacity: 0.9, y: 0 }}
        whileInView={{ opacity: [0.9, 0.5, 0], y: [0, -20, -60] }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 1.5, ease: "easeIn" }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="hsl(50,80%,90%)" />
          <circle cx="38" cy="25" r="20" fill="hsl(230,40%,8%)" />
        </svg>
      </motion.div>

      {/* Sun rising */}
      <motion.div
        className="absolute top-[20%] right-[20%]"
        initial={{ opacity: 0, y: 100, scale: 0.5 }}
        whileInView={{ opacity: [0, 0.3, 1], y: [100, 40, 0], scale: [0.5, 0.8, 1] }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 2.5, ease: "easeOut" }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <motion.circle
            cx="50" cy="50" r="35"
            fill="hsl(45,100%,65%)"
            animate={{ r: [35, 37, 35] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Sun rays */}
          {Array.from({ length: 12 }, (_, i) => (
            <motion.line
              key={i}
              x1="50" y1="8" x2="50" y2="2"
              stroke="hsl(45,100%,70%)"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${i * 30} 50 50)`}
              animate={{ opacity: [0.4, 1, 0.4], strokeWidth: [1.5, 2.5, 1.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </svg>
        {/* Sun glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(45,100%,70%) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Horizon glow during sunrise */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[40%]"
        style={{ background: "linear-gradient(0deg, hsl(25,90%,60%) 0%, transparent 100%)" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.6, 0.2] }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 2, ease: "easeInOut" }}
      />

      {/* Patio/landscape silhouette that appears in daylight */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 4, ease: "easeOut" }}
      >
        <svg viewBox="0 0 1200 300" className="w-full h-auto" preserveAspectRatio="xMidYMax slice">
          {/* Ground / lawn */}
          <rect x="0" y="200" width="1200" height="100" fill="hsl(120,35%,35%)" />
          
          {/* Pool */}
          <motion.rect
            x="350" y="210" width="300" height="60" rx="20"
            fill="hsl(195,80%,55%)"
            animate={{ fill: ["hsl(195,80%,55%)", "hsl(195,80%,60%)", "hsl(195,80%,55%)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Pool water shimmer lines */}
          {[0, 1, 2, 3].map((j) => (
            <motion.line
              key={j}
              x1={380 + j * 60} y1="230" x2={410 + j * 60} y2="230"
              stroke="hsl(195,90%,80%)" strokeWidth="1.5" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3], x1: [380 + j * 60, 385 + j * 60, 380 + j * 60] }}
              transition={{ duration: 2, repeat: Infinity, delay: j * 0.4 }}
            />
          ))}
          {/* Pool border / coping */}
          <rect x="345" y="205" width="310" height="70" rx="22" stroke="hsl(40,20%,85%)" strokeWidth="3" fill="none" />

          {/* Patio deck */}
          <rect x="250" y="195" width="500" height="10" rx="2" fill="hsl(30,40%,55%)" />
          
          {/* Pergola structure */}
          <rect x="700" y="130" width="8" height="70" fill="hsl(25,35%,40%)" />
          <rect x="900" y="130" width="8" height="70" fill="hsl(25,35%,40%)" />
          <rect x="690" y="125" width="228" height="8" rx="2" fill="hsl(25,35%,45%)" />
          {/* Pergola slats */}
          {[0, 1, 2, 3, 4].map((s) => (
            <rect key={s} x={710 + s * 40} y="120" width="20" height="5" rx="1" fill="hsl(25,35%,42%)" />
          ))}

          {/* Outdoor kitchen counter */}
          <rect x="720" y="170" width="160" height="30" rx="4" fill="hsl(220,10%,40%)" />
          <rect x="730" y="165" width="30" height="8" rx="2" fill="hsl(0,0%,30%)" /> {/* grill */}
          
          {/* Lounge chairs */}
          <rect x="270" y="185" width="50" height="12" rx="3" fill="hsl(30,50%,65%)" />
          <rect x="270" y="180" width="15" height="8" rx="2" fill="hsl(30,50%,60%)" />
          <rect x="180" y="185" width="50" height="12" rx="3" fill="hsl(30,50%,65%)" />
          <rect x="180" y="180" width="15" height="8" rx="2" fill="hsl(30,50%,60%)" />

          {/* Umbrella */}
          <line x1="210" y1="140" x2="210" y2="185" stroke="hsl(25,30%,35%)" strokeWidth="3" />
          <motion.path
            d="M180 145 Q210 120 240 145"
            fill="hsl(0,65%,55%)" stroke="none"
            animate={{ d: ["M180 145 Q210 120 240 145", "M180 143 Q210 118 240 143", "M180 145 Q210 120 240 145"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Palm trees */}
          <line x1="100" y1="120" x2="100" y2="200" stroke="hsl(30,40%,35%)" strokeWidth="6" strokeLinecap="round" />
          <motion.path
            d="M100 120 Q120 90 140 110" stroke="hsl(140,50%,35%)" strokeWidth="4" fill="none" strokeLinecap="round"
            animate={{ d: ["M100 120 Q120 90 140 110", "M100 120 Q125 88 145 108", "M100 120 Q120 90 140 110"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M100 120 Q80 85 60 105" stroke="hsl(140,50%,35%)" strokeWidth="4" fill="none" strokeLinecap="round"
            animate={{ d: ["M100 120 Q80 85 60 105", "M100 120 Q75 83 55 103", "M100 120 Q80 85 60 105"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.path
            d="M100 125 Q130 100 145 125" stroke="hsl(140,45%,40%)" strokeWidth="3" fill="none" strokeLinecap="round"
            animate={{ d: ["M100 125 Q130 100 145 125", "M100 125 Q135 98 150 123", "M100 125 Q130 100 145 125"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Second palm */}
          <line x1="1100" y1="130" x2="1100" y2="200" stroke="hsl(30,40%,35%)" strokeWidth="5" strokeLinecap="round" />
          <motion.path
            d="M1100 130 Q1120 100 1140 120" stroke="hsl(140,50%,35%)" strokeWidth="3.5" fill="none" strokeLinecap="round"
            animate={{ d: ["M1100 130 Q1120 100 1140 120", "M1100 130 Q1125 98 1145 118", "M1100 130 Q1120 100 1140 120"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M1100 130 Q1080 95 1060 115" stroke="hsl(140,50%,35%)" strokeWidth="3.5" fill="none" strokeLinecap="round"
            animate={{ d: ["M1100 130 Q1080 95 1060 115", "M1100 130 Q1075 93 1055 113", "M1100 130 Q1080 95 1060 115"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />

          {/* Fence */}
          {Array.from({ length: 8 }, (_, f) => (
            <rect key={f} x={20 + f * 18} y="175" width="4" height="25" rx="1" fill="hsl(30,25%,50%)" />
          ))}
          <rect x="15" y="182" width="150" height="3" rx="1" fill="hsl(30,25%,48%)" />

          {/* Landscape lights (tiny glowing dots) */}
          {[280, 370, 460, 660, 750, 850].map((lx, li) => (
            <motion.circle
              key={li}
              cx={lx} cy="198" r="2"
              fill="hsl(45,100%,75%)"
              animate={{ opacity: [0.4, 1, 0.4], r: [2, 3, 2] }}
              transition={{ duration: 2, repeat: Infinity, delay: li * 0.1 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Dark overlay for text readability during day */}
      <motion.div
        className="absolute inset-0 bg-black/40 z-[6]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0, 0.5] }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 4 }}
      />

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
              d="M 60 160 C 180 120, 280 200, 400 160 S 620 120, 740 160 S 880 200, 940 160"
              stroke="hsl(45,100%,70%)"
              strokeWidth="2.5"
              strokeDasharray="10 6"
              opacity="0.35"
              fill="none"
            />
          </svg>

          {/* Main steps zigzag */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-6">
            {mainSteps.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp}
                className={`flex flex-col items-center text-center ${i % 2 === 1 ? "md:mt-12" : ""}`}
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
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {[
          { title: "Construction", amount: "$150,000", desc: "Average project — full turnkey outdoor living construction", highlight: true },
          { title: "Dealer & Distribution", amount: "Products", desc: "Fiberglass pools, pavers, equipment & materials distribution to contractors and homeowners" },
          { title: "Design Services", amount: "Design", desc: "3D rendering, concept design, landscape architecture & permitting consultation" },
          { title: "SaaS Platform", amount: "Software", desc: "Pool designer, quoting engine & project management tools for dealers and builders" },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeUp} className={`p-8 rounded-3xl backdrop-blur-sm border space-y-3 ${item.highlight ? 'bg-white/10 border-[hsl(45,100%,70%)]/30' : 'bg-white/[0.06] border-white/10'}`}>
            <p className="text-[hsl(25,90%,65%)] text-sm uppercase tracking-wider font-medium">{item.title}</p>
            <p className="text-4xl font-black text-white">{item.amount}</p>
            <p className="text-white/60 text-sm">{item.desc}</p>
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
    <img src={wonderlandsCta} alt="Wonderlands" className="absolute inset-0 w-full h-full object-cover" />
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
    <PositioningSection />
    <TeamSection />
    <GrowthSection />
    <FutureSection />
    <CTASection />
  </div>
);

export default InvestorDeck;
