import * as React from "react";
import { Link } from "react-router-dom";

import studioImage from "@/assets/pool-banner-2.webp";
import studioImageAlt from "@/assets/hero-pool-optimized.webp";

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
                className="group inline-flex items-center gap-4 border-b border-foreground/40 pb-2 text-[11px] uppercase tracking-[0.4em] text-foreground transition-colors hover:border-foreground"
              >
                Enter the Studio
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-2">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Secondary wide image */}
          <div className="relative overflow-hidden bg-background lg:col-span-12">
            <div className="relative aspect-[16/7]">
              <img
                src={studioImageAlt}
                alt="Finished Wonderlands pool and patio"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex items-center p-6 md:p-10">
                <p className="max-w-xs font-serif text-xl font-light leading-snug text-foreground md:text-2xl">
                  From first line to final water — one continuous drawing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudioEditorial;
