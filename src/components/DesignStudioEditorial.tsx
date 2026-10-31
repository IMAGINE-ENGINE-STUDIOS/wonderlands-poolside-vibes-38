import * as React from "react";
import { Link } from "react-router-dom";

import drawImage from "@/assets/studio/scene-draw.webp";
import StudioStepScene from "@/components/studio/StudioStepScenes";

/**
 * Design Studio 2D — the drawing-board product plate for the home page.
 *
 * Sibling of StudioEditorial (Wonderlands Studio configurator) and
 * SolarEditorial: same magazine grid, rhythm and typography. The base image
 * and the hover scene are the real captures of the live 2D Designer
 * (/design-studio) that already ship in src/assets/studio — the poster frame
 * of the "draw" step scene. No substitute imagery.
 */
const STEPS: { num: string; title: string; text: string }[] = [
  {
    num: "01",
    title: "Draw to scale",
    text: "Trace the pool point by point with spline drawing. Symmetry guides keep the shape honest and every edge shows its live measurement as you draw.",
  },
  {
    num: "02",
    title: "Shape the site",
    text: "Set the depth profile, merge a spa or tanning ledge into the shell, then place the deck, fencing and features from the real catalog at their true sizes.",
  },
  {
    num: "03",
    title: "Price the drawing",
    text: "Area, perimeter and deck square footage roll into a priced breakdown of the design — and the same drawing opens in 3D, unchanged.",
  },
];

const DesignStudioEditorial: React.FC = () => {
  /* hovering or tapping a step plays the real 2D Designer recording */
  const [active, setActive] = React.useState(false);

  return (
    <section id="design-studio-2d" aria-label="Design Studio 2D" className="bg-background py-20 pb-8 md:py-28 md:pb-10">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            The Studio — Drawing Room
          </p>
          <h2 className="max-w-4xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Draw it in 2D. See it in 3D.
          </h2>
          <p className="mt-7 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Design Studio 2D is the drawing board of the platform. Sketch your
            pool and yard at true scale, dress the site with real catalog pieces
            and read the price of the drawing as you work — one design drives
            both the 2D plan and the 3D view, so what you draw is what you see
            standing in the yard.
          </p>

          <div className="mt-8 h-px w-24 bg-foreground/30" />
        </div>

        <div className="grid grid-cols-1 gap-px bg-border/40 lg:grid-cols-12">
          {/* Primary image — real capture of the 2D Designer */}
          <div className="relative overflow-hidden bg-background lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-[16/11]">
              <img
                src={drawImage}
                alt="The Wonderlands 2D Designer drawing board — a pool shell traced with spline points, live measurements and a priced breakdown"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-primary-foreground/70">
                  2D Plan · 3D View · One Design
                </p>
                <h3 className="font-serif text-2xl font-light leading-tight text-primary-foreground md:text-3xl">
                  Design Studio 2D
                </h3>
              </div>

              {/* real screen recording of the tool — mounted while a step is active */}
              {active && (
                <div className="absolute inset-0 animate-fade-in">
                  <StudioStepScene scene="draw" />
                </div>
              )}
            </div>
          </div>

          {/* Editorial copy column */}
          <div className="flex flex-col justify-between bg-background p-7 md:p-10 lg:col-span-5">
            <div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                A true-scale canvas for the whole property. Draw the shell, cut
                the depth, lay the deck and fence lines, and let the board keep
                the measurements — and the money — in view while you work.
              </p>

              <dl className="mt-10 divide-y divide-border/60 border-t border-border/60">
                {STEPS.map((step) => (
                  <div
                    key={step.num}
                    role="button"
                    tabIndex={0}
                    aria-pressed={active}
                    onMouseEnter={() => setActive(true)}
                    onMouseLeave={() => setActive(false)}
                    onFocus={() => setActive(true)}
                    onBlur={() => setActive(false)}
                    onClick={() => setActive(!active)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(!active);
                      }
                    }}
                    className={`flex cursor-pointer gap-5 py-5 pr-3 transition-colors duration-300 ${
                      active ? "bg-muted/40" : "hover:bg-muted/25"
                    }`}
                  >
                    <dt
                      className={`w-8 pt-1 text-[10px] tracking-[0.3em] transition-colors duration-300 ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.num}
                    </dt>
                    <dd>
                      <p className="font-serif text-lg font-light text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/design-studio"
                className="group relative inline-flex items-center gap-4 overflow-hidden rounded-none border border-blue-700 bg-background px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-blue-700 transition-all duration-500 hover:border-blue-700 hover:text-white"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-blue-700 transition-transform duration-500 group-hover:scale-x-100" />
                Open Design Studio 2D
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-none border border-blue-700/40 transition-colors duration-500 group-hover:border-white/40">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="transition-transform duration-500 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                to="/design-studio?view=3d"
                className="inline-flex items-center rounded-none border border-border/70 px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-muted-foreground transition-colors duration-300 hover:border-foreground/40 hover:text-foreground"
              >
                See it in 3D
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignStudioEditorial;
