import * as React from "react";

import coverImage from "@/assets/covers/lifesaver-teal.webp";

/**
 * "The Energy Ledger" — editorial companion to AutomaticCoversSection.
 * Answers, in magazine language, how much energy an automatic pool cover
 * actually saves: evaporation is ~70% of a pool's heat loss, so covering the
 * water is the single largest efficiency move a pool owner can make.
 * Figures are industry-standard US DOE / APSP ranges.
 */
const LEDGER: { num: string; figure: string; title: string; text: string }[] = [
  {
    num: "01",
    figure: "50–70%",
    title: "Heating energy saved",
    text: "Evaporation causes roughly 70% of a pool's total heat loss. A closed automatic cover stops it almost entirely, cutting heater runtime by half or more across the season.",
  },
  {
    num: "02",
    figure: "30–50%",
    title: "Water & chemistry saved",
    text: "A covered pool loses inches less water per month to evaporation — and because the water stays put, so do the chemicals dissolved in it. Expect 30–50% lower top-offs and sanitizer use.",
  },
  {
    num: "03",
    figure: "~8–10°F",
    title: "Free temperature gain",
    text: "Acting as a passive solar blanket, a closed cover holds daytime warmth overnight — typically keeping the water 8–10°F warmer than an uncovered pool, with zero heater runtime.",
  },
];

const PoolCoverEnergyEditorial: React.FC = () => {
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <section aria-label="How much energy an automatic pool cover saves" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            The Energy Ledger — Automatic Covers
          </p>
          <h2 className="max-w-4xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            How much energy does an automatic cover save?
          </h2>
          <div className="mt-8 h-px w-24 bg-foreground/30" />
        </div>

        <div className="grid grid-cols-1 gap-px bg-border/40 lg:grid-cols-12">
          {/* Editorial copy column */}
          <div className="flex flex-col justify-between bg-background p-7 md:p-10 lg:col-span-7">
            <div>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                More than any heater upgrade or pump swap — the cover is the
                efficiency system. An uncovered pool loses most of its heat to
                the sky overnight; a covered one simply doesn't. Press the
                button at dusk and the energy you already paid for stays in the
                water.
              </p>

              <dl className="mt-10 divide-y divide-border/60 border-t border-border/60">
                {LEDGER.map((row) => {
                  const isActive = active === row.num;
                  return (
                    <div
                      key={row.num}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onMouseEnter={() => setActive(row.num)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(row.num)}
                      onBlur={() => setActive(null)}
                      onClick={() => setActive(isActive ? null : row.num)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActive(isActive ? null : row.num);
                        }
                      }}
                      className={`flex cursor-pointer gap-5 py-5 pr-3 transition-colors duration-300 ${
                        isActive ? "bg-muted/40" : "hover:bg-muted/25"
                      }`}
                    >
                      <dt
                        className={`w-8 pt-1 text-[10px] tracking-[0.3em] transition-colors duration-300 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {row.num}
                      </dt>
                      <dd>
                        <p className="font-serif text-2xl font-light text-foreground md:text-3xl">
                          {row.figure}
                          <span className="ml-3 align-middle text-sm tracking-wide text-muted-foreground">
                            {row.title}
                          </span>
                        </p>
                        <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
                          {row.text}
                        </p>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("covers")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="group relative inline-flex items-center gap-4 overflow-hidden rounded-none border border-foreground bg-background px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-foreground transition-all duration-500 hover:text-background"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-foreground transition-transform duration-500 group-hover:scale-x-100" />
                Explore automatic covers
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-none border border-foreground/40 transition-colors duration-500 group-hover:border-background/40">
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
              </button>
            </div>
          </div>

          {/* Image plate */}
          <div className="relative overflow-hidden bg-background lg:col-span-5">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
              <img
                src={coverImage}
                alt="Automatic safety cover closed over a residential pool, holding in heat"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-primary-foreground/70">
                  Closed at dusk · Warm at dawn
                </p>
                <h3 className="font-serif text-2xl font-light leading-tight text-primary-foreground md:text-3xl">
                  The cheapest heat is the heat you keep
                </h3>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          Savings ranges per U.S. Department of Energy & APSP studies on covered residential pools
        </p>
      </div>
    </section>
  );
};

export default PoolCoverEnergyEditorial;
