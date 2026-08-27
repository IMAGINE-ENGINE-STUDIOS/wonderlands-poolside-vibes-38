/**
 * StudioStepScenes
 * ----------------
 * Three "product in action" scenes used by the Studio editorial section on the
 * home page. Hovering (or tapping) the Draw / Compose / Quote steps swaps the
 * static banner for the matching scene.
 *
 * These are NOT illustrations or mock-ups: each scene is a real screen recording
 * of the live Wonderlands tool it names, captured from the running app —
 *   draw    → the 2D Designer drawing board (/design-studio) being opened and
 *             used to trace a pool shell at true scale
 *   compose → a product card being configured: finish carousels, liner, pavers,
 *             enclosure and additional features, with the total updating
 *   quote   → the formal QUOTE document (not the Atelier) being reviewed,
 *             edited and converted with the Invoice / Print / Pay actions
 *
 * Files live in src/assets/studio (scene-*.mp4, muted + looping) with the
 * matching scene-*.webp still used as the poster frame so the first paint is
 * instant. If a tool's UI changes materially, re-capture the recording and
 * replace the file — do not hand-draw a substitute.
 *
 * Performance notes:
 *  - Only the active scene is mounted by the parent section, so at most one
 *    video decodes at a time.
 *  - preload="none" + poster: nothing downloads until the step is hovered.
 *  - Motion is reduced to a slow CSS drift when the video cannot autoplay
 *    (reduced-motion users or restrictive browsers keep the poster image).
 */
import * as React from "react";

import sceneDrawPoster from "@/assets/studio/scene-draw.webp";
import sceneComposePoster from "@/assets/studio/scene-compose.webp";
import sceneQuotePoster from "@/assets/studio/scene-quote.webp";
import sceneDrawVideo from "@/assets/studio/scene-draw.mp4";
import sceneComposeVideo from "@/assets/studio/scene-compose.mp4";
import sceneQuoteVideo from "@/assets/studio/scene-quote.mp4";
/* VP9 fallback for builds without the H.264 decoder */
import sceneDrawWebm from "@/assets/studio/scene-draw.webm";
import sceneComposeWebm from "@/assets/studio/scene-compose.webm";
import sceneQuoteWebm from "@/assets/studio/scene-quote.webm";

export type StudioSceneKey = "draw" | "compose" | "quote";

const SCENE_CSS = `
@keyframes wlSceneDrift {
  0%   { transform: scale(1.02) translate3d(0, 0, 0); }
  100% { transform: scale(1.08) translate3d(-1.5%, -2%, 0); }
}
`;

type Scene = {
  video: string;
  videoWebm: string;
  poster: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
  /* focus point of the crop, so the important UI stays in frame */
  position: string;
};

const SCENES: Record<StudioSceneKey, Scene> = {
  draw: {
    video: sceneDrawVideo,
    videoWebm: sceneDrawWebm,
    poster: sceneDrawPoster,
    alt: "Screen recording of the Wonderlands 2D Designer opening and a pool shell being traced at true scale",
    eyebrow: "Live tool — 2D Designer",
    title: "The drawing board",
    caption: "Trace the shell point by point; area, perimeter and cost update as you draw.",
    position: "50% 45%",
  },
  compose: {
    video: sceneComposeVideo,
    videoWebm: sceneComposeWebm,
    poster: sceneComposePoster,
    alt: "Screen recording of a Wonderlands product card being configured — finishes, liner, pavers, enclosure and features with live pricing",
    eyebrow: "Live tool — Product configurator",
    title: "The option carousels",
    caption: "Every finish, coping, paver, heater and enclosure priced on the card itself.",
    position: "18% 40%",
  },
  quote: {
    video: sceneQuoteVideo,
    videoWebm: sceneQuoteWebm,
    poster: sceneQuotePoster,
    alt: "Screen recording of the Wonderlands quote document being reviewed, edited and converted into an invoice",
    eyebrow: "Live tool — The quote document",
    title: "The quotation",
    caption: "The composition becomes a formal, itemized proposal — print, sign or convert to an invoice.",
    position: "50% 50%",
  },
};

const StudioStepScene: React.FC<{ scene: StudioSceneKey }> = ({ scene }) => {
  const s = SCENES[scene];
  const ref = React.useRef<HTMLVideoElement | null>(null);

  /* Autoplay defensively: some browsers reject play() until a gesture, in which
     case the poster frame simply stays visible. */
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;
    el.play().catch(() => {
      /* keep the poster — no error surfaced to the visitor */
    });
  }, [scene]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <style>{SCENE_CSS}</style>

      {/* real screen recording of the tool being used */}
      <video
        ref={ref}
        key={s.video}
        poster={s.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={s.alt}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={{
          objectPosition: s.position,
          animation: "wlSceneDrift 18s ease-in-out infinite alternate",
        }}
      >
        <source src={s.videoWebm} type="video/webm" />
        <source src={s.video} type="video/mp4" />
      </video>

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
