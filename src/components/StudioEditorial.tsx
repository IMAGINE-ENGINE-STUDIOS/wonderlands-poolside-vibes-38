import * as React from "react";
import { Link } from "react-router-dom";

import HeroCategoryMarquee from "@/components/HeroCategoryMarquee";
import studioImage from "@/assets/pool-banner-2.webp";

const STEPS = [
  { num: "01", title: "Draw", text: "Trace your pool, deck and patio at true scale on an infinite canvas." },
  { num: "02", title: "Compose", text: "Layer finishes, coping, pavers, lighting and enclosures." },
  { num: "03", title: "Quote", text: "See live pricing and turn the design into a formal proposal." },
];

const StudioEditorial: React.FC = () => {
  return (
    <section aria-label="Wonderlands Studio" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            The Studio — Design Room
          </p>
          <h2 className="max-w-4xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Design your pool, plainly and precisely
          </h2>
          <div className="mt-8 h-px w-24 bg-foreground/30" />
        </div>

        <div className="grid grid-cols-1 gap-px bg-border/40 lg:grid-cols-12">
          {/* Primary image */}
          <div className="relative overflow-hidden bg-background lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-[16/11]">
              <img
                src={studioImage}
                alt="Pool design composed in Wonderlands Studio"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-primary-foreground/70">
                  2D & 3D Designer
                </p>
                <h3 className="font-serif text-2xl font-light leading-tight text-primary-foreground md:text-3xl">
                  Wonderlands Studio
                </h3>
              </div>
            </div>
          </div>

          {/* Editorial copy column */}
          <div className="flex flex-col justify-between bg-background p-7 md:p-10 lg:col-span-5">
            <div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                A drawing board for your backyard. Sketch the shell, cut the terrain,
                place steps, seating and lights, then dress every surface — all with
                real measurements and real pricing behind the scenes.
              </p>

              <dl className="mt-10 divide-y divide-border/60 border-t border-border/60">
                {STEPS.map((step) => (
                  <div key={step.num} className="flex gap-5 py-5">
                    <dt className="w-8 pt-1 text-[10px] tracking-[0.3em] text-muted-foreground">
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

            <div className="mt-10">
              <Link
                to="/studio"
                className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full border border-primary/70 bg-background px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-primary transition-all duration-500 hover:border-primary hover:text-primary-foreground"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
                Enter the Studio
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 transition-colors duration-500 group-hover:border-primary-foreground/40">
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
            </div>
          </div>
        </div>
      </div>

      {/* Category carousel — full bleed edge-to-edge */}
      <div className="mt-16 md:mt-24">
        <HeroCategoryMarquee />
      </div>
    </section>
  );
};

export default StudioEditorial;
