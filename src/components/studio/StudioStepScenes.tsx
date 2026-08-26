/**
 * StudioStepScenes
 * ----------------
 * Three lightweight, looping "product in action" scenes used by the Studio
 * editorial section on the home page. Hovering (or tapping) the Draw / Compose /
 * Quote steps swaps the static banner for the matching scene.
 *
 * Performance notes:
 *  - No videos, no GIFs, no JS animation loops. Everything is CSS keyframes +
 *    inline SVG, so a scene costs a few composited layers and nothing else.
 *  - Only the active scene is mounted, and images are the optimized .webp
 *    variants imported through ES6 (project asset standard).
 */
import * as React from "react";

import poolFinishA from "@/assets/finishes/aquamarine-g3.webp";
import poolFinishB from "@/assets/finishes/lagoon-blue-g2.webp";
import poolFinishC from "@/assets/finishes/athens-pearl-white-g3.webp";
import paverA from "@/assets/pavers/coralina-blanco.webp";
import paverB from "@/assets/pavers/gloca-mirage-ideal.webp";
import productShot from "@/assets/pools/wonderlands/pacific-ridge.webp";

export type StudioSceneKey = "draw" | "compose" | "quote";

/* Scene-local keyframes. Kept here so the section is self-contained. */
const SCENE_CSS = `
@keyframes wlTrace { to { stroke-dashoffset: 0; } }
@keyframes wlFill { 0%,55% { opacity: 0; } 100% { opacity: 1; } }
@keyframes wlNode { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.5); opacity: 1; } }
@keyframes wlPen {
  0%   { transform: translate(14%, 68%); }
  25%  { transform: translate(76%, 62%); }
  50%  { transform: translate(78%, 26%); }
  75%  { transform: translate(20%, 24%); }
  100% { transform: translate(14%, 68%); }
}
@keyframes wlSlide {
  0%,22%    { transform: translateX(0); }
  28%,50%   { transform: translateX(-100%); }
  56%,78%   { transform: translateX(-200%); }
  84%,100%  { transform: translateX(0); }
}
@keyframes wlCycle3 {
  0%,26%   { opacity: 1; }
  33%,93%  { opacity: 0; }
  100%     { opacity: 1; }
}
@keyframes wlRing {
  0%,20%   { opacity: 1; }
  27%,100% { opacity: 0; }
}
@keyframes wlCaret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes wlTypeIn { 0%,8% { width: 0; } 40%,100% { width: 100%; } }
@keyframes wlRowFlash { 0%,30% { background-color: transparent; } 45%,70% { background-color: hsl(var(--primary) / .14); } 100% { background-color: transparent; } }
@keyframes wlPress {
  0%,72%  { transform: scale(1); }
  80%     { transform: scale(.94); }
  88%,100%{ transform: scale(1); }
}
@keyframes wlRise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

const Frame: React.FC<{ label: string; title: string; children: React.ReactNode }> = ({
  label,
  title,
  children,
}) => (
  <div className="absolute inset-0 overflow-hidden bg-[#0b0e12]">
    <style>{SCENE_CSS}</style>
    {children}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-6 md:p-8">
      <p className="mb-2 text-[9px] uppercase tracking-[0.4em] text-white/60">{label}</p>
      <h3 className="font-serif text-2xl font-light leading-tight text-white md:text-3xl">{title}</h3>
    </div>
  </div>
);

/* ---------------------------------------------------------------- 01 Draw */
const DrawScene: React.FC = () => (
  <Frame label="2D Drawing Board" title="Traced at true scale">
    {/* blueprint grid */}
    <div
      className="absolute inset-0 opacity-[0.28]"
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(var(--primary) / .5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / .5) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
    <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {/* deck outline draws first, then the shell, then the water fills in */}
      <rect
        x="38"
        y="40"
        width="324"
        height="200"
        fill="none"
        stroke="hsl(var(--primary) / .55)"
        strokeWidth="1.5"
        strokeDasharray="6 5"
        style={{ strokeDashoffset: 1100, animation: "wlTrace 3.6s linear infinite" }}
        pathLength={1100}
      />
      <path
        d="M92 88 H286 Q318 88 318 118 V182 Q318 210 286 210 H128 Q92 210 92 178 Z"
        fill="hsl(var(--primary) / .22)"
        style={{ animation: "wlFill 3.6s ease-in-out infinite" }}
      />
      <path
        d="M92 88 H286 Q318 88 318 118 V182 Q318 210 286 210 H128 Q92 210 92 178 Z"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinejoin="round"
        pathLength={1000}
        strokeDasharray={1000}
        style={{ strokeDashoffset: 1000, animation: "wlTrace 3.6s ease-in-out infinite" }}
      />
      {/* vertex handles */}
      {[
        [92, 88],
        [286, 88],
        [318, 148],
        [286, 210],
        [128, 210],
        [92, 140],
      ].map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="4.5"
          fill="#fff"
          style={{
            transformOrigin: `${x}px ${y}px`,
            animation: `wlNode 3.6s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      {/* dimension line */}
      <g style={{ animation: "wlRise .5s ease-out .8s both" }}>
        <line x1="92" y1="236" x2="318" y2="236" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
        <text x="205" y="232" textAnchor="middle" fill="#fff" fillOpacity=".8" fontSize="10" letterSpacing="2">
          28' 0"
        </text>
      </g>
    </svg>
    {/* pen cursor gliding round the shell */}
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute h-3 w-3 rounded-full border border-white/70 bg-white/20 backdrop-blur-sm"
        style={{ animation: "wlPen 3.6s ease-in-out infinite" }}
      />
    </div>
  </Frame>
);

/* ------------------------------------------------------------- 02 Compose */
const COMPOSE_TILES = [
  { name: "Aquamarine", image: poolFinishA, price: "Included" },
  { name: "Lagoon Blue", image: poolFinishB, price: "+$2,400" },
  { name: "Athens Pearl", image: poolFinishC, price: "+$3,150" },
  { name: "Coralina Paver", image: paverA, price: "+$25 / sqft" },
  { name: "Gloca Mirage", image: paverB, price: "+$18 / sqft" },
];

const ComposeScene: React.FC = () => (
  <Frame label="Product Cards" title="Composed option by option">
    <img
      src={productShot}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-25 blur-[2px]"
    />
    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
      {/* a product card mock, mid-configuration */}
      <div className="w-full max-w-sm border border-white/20 bg-black/55 p-4 backdrop-blur-md">
        <div className="relative mb-3 h-24 overflow-hidden">
          {COMPOSE_TILES.slice(0, 3).map((t, i) => (
            <img
              key={t.name}
              src={t.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ animation: `wlCycle3 4.8s ease-in-out ${i * 1.6}s infinite` }}
            />
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.35em] text-white/55">Pool finish</p>
        <p className="mb-3 font-serif text-lg font-light text-white">Pacific Ridge</p>

        {/* carousel of option tiles: the selection ring walks along the row */}
        <div className="overflow-hidden">
          <div className="flex gap-2" style={{ animation: "wlSlide 9s ease-in-out infinite" }}>
            {COMPOSE_TILES.map((t, i) => (
              <div key={t.name} className="relative w-1/2 shrink-0 border border-white/15 p-2">
                <span
                  className="pointer-events-none absolute inset-0 border border-primary bg-primary/15"
                  style={{ animation: `wlRing 9s ease-in-out ${i * 1.8}s infinite` }}
                />
                <div className="mb-2 h-12 overflow-hidden">
                  <img
                    src={t.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="truncate text-center text-[10px] text-white/85">{t.name}</p>
                <p className="text-center text-[10px] font-semibold text-primary">{t.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Frame>
);

/* --------------------------------------------------------------- 03 Quote */
const QUOTE_ROWS = [
  { label: "Pool shell — 14 × 28", value: "$98,000" },
  { label: "Travertine deck — 640 sqft", value: "$16,400" },
  { label: "Screen enclosure", value: "$21,750" },
];

const QuoteScene: React.FC = () => (
  <Frame label="Quote Atelier" title="Edited, then issued">
    <div className="absolute inset-0 bg-gradient-to-br from-[#11161c] to-[#05070a]" />
    <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md border border-white/15 bg-white/[0.05] p-5 backdrop-blur-md">
        <div className="mb-4 flex items-baseline justify-between border-b border-white/15 pb-3">
          <p className="text-[9px] uppercase tracking-[0.35em] text-white/55">Proposal 1042</p>
          <p className="text-[9px] uppercase tracking-[0.35em] text-primary">Editing</p>
        </div>

        {QUOTE_ROWS.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-2 py-2 text-[11px] text-white/80"
            style={{ animation: `wlRowFlash 6s ease-in-out ${i * 2}s infinite` }}
          >
            <span className="truncate pr-3">{r.label}</span>
            <span className="flex items-center gap-1 font-mono tabular-nums text-white">
              {/* the figure types itself in, with a blinking caret */}
              <span
                className="inline-block overflow-hidden whitespace-nowrap"
                style={{ animation: `wlTypeIn 6s steps(8, end) ${i * 2}s infinite` }}
              >
                {r.value}
              </span>
              <span
                className="inline-block h-3 w-px bg-primary"
                style={{ animation: `wlCaret .9s steps(1, end) infinite` }}
              />
            </span>
          </div>
        ))}

        <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/50">Total</p>
            <p className="font-serif text-2xl font-light text-white">$136,150</p>
          </div>
          <span
            className="border border-primary px-4 py-2 text-[9px] uppercase tracking-[0.3em] text-primary"
            style={{ animation: "wlPress 6s ease-in-out infinite" }}
          >
            Save changes
          </span>
        </div>
      </div>
    </div>
  </Frame>
);

const SCENES: Record<StudioSceneKey, React.FC> = {
  draw: DrawScene,
  compose: ComposeScene,
  quote: QuoteScene,
};

export const StudioStepScene: React.FC<{ scene: StudioSceneKey }> = ({ scene }) => {
  const Scene = SCENES[scene];
  return <Scene />;
};

export default StudioStepScene;
