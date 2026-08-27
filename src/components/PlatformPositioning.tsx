import * as React from "react";
import { Link } from "react-router-dom";

/**
 * PlatformPositioning — the homepage's first statement after the hero film.
 *
 * Presentation only. It carries the platform positioning (technology-powered
 * home services) so the page no longer reads as a single-trade pool company.
 * Editorial language matches About.tsx: uppercase eyebrows, serif display
 * headlines, thin rules, no icons.
 */

const ONE_ITEMS: Array<{ num: string; title: string; copy: string }> = [
  { num: "01", title: "One Vision", copy: "Design your entire project in one place." },
  { num: "02", title: "One Platform", copy: "Visualize, configure and price your project with Wonderlands Studio." },
  { num: "03", title: "One Team", copy: "Connect with the professionals and specialists needed to bring it to life." },
  { num: "04", title: "One Experience", copy: "From the first idea to the finished project, Wonderlands coordinates the journey." },
];

const PlatformPositioning: React.FC = () => {
  return (
    <section
      id="platform"
      aria-label="Wonderlands platform positioning"
      className="bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          Wonderlands — Home Transformation Platform
        </p>

        <h2 className="mt-6 max-w-4xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Everything your home needs. One platform.
        </h2>

        <p className="mt-7 text-xs uppercase tracking-[0.34em] text-foreground/60">
          Design. Build. Power. Transform.
        </p>

        <div className="mt-10 h-px w-24 bg-foreground/30" />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base lg:col-span-7">
            Wonderlands is a technology-powered home services company bringing together
            home transformation, outdoor living, solar and energy solutions through one
            seamless platform. From designing your dream backyard to building a pool,
            transforming your patio, installing solar or upgrading your home's
            environment — the design, products, professionals and technology live in one
            place.
          </p>

          <div className="lg:col-span-5">
            <p className="font-serif text-2xl font-light leading-snug text-foreground md:text-3xl">
              More than a contractor. A better way to build.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Home projects shouldn't require homeowners to coordinate multiple
              contractors, designers, suppliers and installers. Wonderlands brings
              everything together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/studio"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-background transition hover:-translate-y-0.5"
              >
                Start My Project
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-foreground/25 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground transition hover:-translate-y-0.5 hover:border-foreground/50"
              >
                Explore Our Services
              </Link>
            </div>
          </div>
        </div>

        {/* One Vision / Platform / Team / Experience */}
        <dl className="mt-16 grid grid-cols-1 gap-px border-t border-border/60 bg-border/40 sm:grid-cols-2 lg:grid-cols-4">
          {ONE_ITEMS.map((item) => (
            <div key={item.title} className="bg-background p-7 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">{item.num}</p>
              <dt className="mt-5 font-serif text-xl font-light text-foreground">{item.title}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.copy}</dd>
            </div>
          ))}
        </dl>

        {/* Differentiator plate */}
        <div className="mt-16 border border-border/70 p-8 md:p-14">
          <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
            The Difference
          </p>
          <h3 className="mt-6 max-w-3xl font-serif text-3xl font-light leading-tight text-foreground md:text-5xl">
            Why coordinate everything yourself?
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "One pool contractor.",
                "One landscaper.",
                "One paver company.",
                "One solar company.",
                "One electrician.",
                "One designer.",
              ].map((line) => (
                <li key={line} className="border-b border-border/50 pb-2">{line}</li>
              ))}
            </ul>
            <div className="flex flex-col justify-center">
              <p className="font-serif text-3xl font-light leading-tight text-foreground md:text-4xl">
                Or one Wonderlands.
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Wonderlands simplifies complex home projects by bringing multiple
                services, products and professionals together through one
                technology-powered experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPositioning;
