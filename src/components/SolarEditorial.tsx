import * as React from "react";

import solarRoofArray from "@/assets/solar/solar-roof-array.jpg";
import solarBatteryWall from "@/assets/solar/solar-battery-wall.jpg";
import solarPoolHeating from "@/assets/solar/solar-pool-heating.jpg";
import solarInverterCharger from "@/assets/solar/solar-inverter-charger.jpg";

/**
 * "Design your solar system" — the energy twin of StudioEditorial. Same
 * magazine grid, rhythm and typography; solar content. Sits directly under the
 * pool design block, i.e. under the flipbook on the main page.
 */
const STEPS: { num: string; title: string; text: string; image: string; alt: string }[] = [
  {
    num: "01",
    title: "Survey",
    text: "Roof planes, azimuth and shade are modelled before a single panel is quoted.",
    image: solarRoofArray,
    alt: "All-black solar array set flush to a Florida tile roof",
  },
  {
    num: "02",
    title: "Size",
    text: "Array, WonderWall battery, solar pool heating and EV charging matched to your load.",
    image: solarBatteryWall,
    alt: "Wall-mounted WonderWall home battery storage",
  },
  {
    num: "03",
    title: "Quote",
    text: "Installed turnkey price, with incentives and net metering confirmed in writing.",
    image: solarPoolHeating,
    alt: "Solar pool heating collectors plumbed into the pump loop",
  },
];

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const SolarEditorial: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState<string | null>(null);
  const active = STEPS.find((s) => s.num === activeStep);

  return (
    <section aria-label="Design your solar system" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            The Studio — Energy Room
          </p>
          <h2 className="max-w-4xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Design your solar system, plainly and precisely
          </h2>
          <div className="mt-8 h-px w-24 bg-foreground/30" />
        </div>

        <div className="grid grid-cols-1 gap-px bg-border/40 lg:grid-cols-12">
          {/* Primary image */}
          <div className="relative overflow-hidden bg-background lg:order-2 lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-[16/11]">
              <img
                src={solarInverterCharger}
                alt="Wonderlands Solar hardware — hybrid inverter and wall charger"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {active && (
                <img
                  key={active.num}
                  src={active.image}
                  alt={active.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full animate-fade-in object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-primary-foreground/70">
                  Arrays · Batteries · Pool Heating · Charging
                </p>
                <h3 className="font-serif text-2xl font-light leading-tight text-primary-foreground md:text-3xl">
                  Wonderlands Solar
                </h3>
              </div>
            </div>
          </div>

          {/* Editorial copy column */}
          <div className="flex flex-col justify-between bg-background p-7 md:p-10 lg:col-span-5">
            <div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Power the pool, the spa and the house from the roof above them. We model
                the roof, size the array and the battery to the way you actually live,
                then hand back one installed price — permit, interconnection and
                inspection included.
              </p>

              <dl className="mt-10 divide-y divide-border/60 border-t border-border/60">
                {STEPS.map((step) => {
                  const isActive = activeStep === step.num;
                  return (
                    <div
                      key={step.num}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onMouseEnter={() => setActiveStep(step.num)}
                      onMouseLeave={() => setActiveStep(null)}
                      onFocus={() => setActiveStep(step.num)}
                      onBlur={() => setActiveStep(null)}
                      onClick={() => setActiveStep(isActive ? null : step.num)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveStep(isActive ? null : step.num);
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
                        {step.num}
                      </dt>
                      <dd>
                        <p className="font-serif text-lg font-light text-foreground">{step.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollTo("solar")}
                className="group relative inline-flex items-center gap-4 overflow-hidden rounded-none border border-foreground bg-background px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-foreground transition-all duration-500 hover:text-background"
              >
                <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-foreground transition-transform duration-500 group-hover:scale-x-100" />
                Explore Wonderlands Solar
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

              <button
                type="button"
                onClick={() => scrollTo("solar-quote")}
                className="inline-flex items-center rounded-none border border-border/70 px-8 py-4 text-[11px] uppercase tracking-[0.35em] text-muted-foreground transition-colors duration-300 hover:border-foreground/40 hover:text-foreground"
              >
                Get a solar quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolarEditorial;
