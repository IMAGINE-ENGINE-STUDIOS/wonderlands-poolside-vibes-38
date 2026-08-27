/**
 * StudioStepScenes
 * ----------------
 * Three "product in action" scenes used by the Studio editorial section on the
 * home page. Hovering (or tapping) the Draw / Compose / Quote steps swaps the
 * static banner for the matching scene.
 *
 * These are NOT illustrations or mock-ups: each image is a real screenshot of
 * the live Wonderlands tool it names —
 *   draw    → the 2D Designer drawing board (/design-studio)
 *   compose → the product configurator / feature renderer used on product cards
 *   quote   → the Quote Atelier with the live composition total (/quote)
 * Captured from the running app and stored as optimized .webp under
 * src/assets/studio. If a tool's UI changes materially, re-capture the
 * screenshot and replace the file — do not hand-draw a substitute.
 *
 * Performance notes:
 *  - No videos, no GIFs, no JS animation loops: a slow CSS pan/zoom over one
 *    lazy-loaded image, so a scene costs a single composited layer.
 *  - Only the active scene is mounted by the parent section.
 */
import * as React from "react";

import sceneDraw from "@/assets/studio/scene-draw.webp";
import sceneCompose from "@/assets/studio/scene-compose.webp";
import sceneQuote from "@/assets/studio/scene-quote.webp";

export type StudioSceneKey = "draw" | "compose" | "quote";

const SCENE_CSS = `
@keyframes wlSceneDrift {
  0%   { transform: scale(1.06) translate3d(0, 0, 0); }
  100% { transform: scale(1.14) translate3d(-2.5%, -3.5%, 0); }
}
@keyframes wlSceneDriftUp {
  0%   { transform: scale(1.1) translate3d(0, 3%, 0); }
  100% { transform: scale(1.04) translate3d(0, -3%, 0); }
}
`;

type Scene = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
  /* which drift keyframe reads best for the captured layout */
  motion: "diagonal" | "vertical";
  /* focus point of the crop, so the pan keeps the important UI in frame */
  position: string;
};

const SCENES: Record<StudioSceneKey, Scene> = {
  draw: {
    image: sceneDraw,
    alt: "The Wonderlands 2D Designer drawing board with the pool spline being traced at true scale",
    eyebrow: "Live tool — 2D Designer",
    title: "The drawing board",
    caption: "Trace the shell point by point; area, perimeter and cost update as you draw.",
    motion: "diagonal",
    position: "50% 40%",
  },
  compose: {
    image: sceneCompose,
    alt: "The Wonderlands product configurator showing finish, liner, tile, heater, cover and enclosure options with prices",
    eyebrow: "Live tool — Product configurator",
    title: "The option carousels",
    caption: "Every finish, coping, paver, heater and enclosure priced on the card itself.",
    motion: "vertical",
    position: "50% 45%",
  },
  quote: {
    image: sceneQuote,
    alt: "The Wonderlands Quote Atelier with the product console and the live turnkey composition total",
    eyebrow: "Live tool — Quote Atelier",
    title: "The quotation",
    caption: "The composition becomes a formal, itemized proposal, ready to print or sign.",
    motion: "diagonal",
    position: "50% 50%",
  },
};

const StudioStepScene: React.FC<{ scene: StudioSceneKey }> = ({ scene }) => {
  const s = SCENES[scene];

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <style>{SCENE_CSS}</style>

      {/* real screenshot of the tool, slowly drifting so it reads as "in action" */}
      <img
        src={s.image}
        alt={s.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={{
          objectPosition: s.position,
          animation: `${s.motion === "vertical" ? "wlSceneDriftUp" : "wlSceneDrift"} 14s ease-in-out infinite alternate`,
        }}
      />

      {/* editorial caption plate */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-6 md:p-8">
        <p className="text-[9px] uppercase tracking-[0.4em] text-primary-foreground/70">
          {s.eyebrow}
        </p>
        <h4 className="mt-3 font-serif text-xl font-light leading-tight text-primary-foreground md:text-2xl">
          {s.title}
        </h4>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-primary-foreground/80 md:text-sm">
          {s.caption}
        </p>
      </div>
    </div>
  );
};

export default StudioStepScene;
