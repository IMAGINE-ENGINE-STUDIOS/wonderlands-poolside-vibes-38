import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import heroImage from "@/assets/hero/hero-carousel-1.webp";
import outdoorImage from "@/assets/banners/latham-gilmer-banner.webp";
import solarImage from "@/assets/solar/solar-roof-array.jpg";
import studioImage from "@/assets/banners/lanai-banner.webp";
import landscapingImage from "@/assets/banners/landscaping-banner.webp";

/**
 * About — editorial positioning page.
 *
 * Presentation-only page (no business logic). It carries the platform
 * positioning: Wonderlands is a technology-powered home services platform,
 * not a single-trade pool contractor. Layout follows the site's editorial
 * language: thin rules, uppercase eyebrows, serif display headlines,
 * full-bleed imagery between text plates.
 */

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">{children}</p>
);

const Rule = () => <div className="my-12 h-px w-full bg-border" aria-hidden />;

const PILLAR_OUTDOOR = [
  "Pools & Spas",
  "Patios & Pavers",
  "Outdoor Kitchens",
  "Pergolas & Lanais",
  "Screen Enclosures",
  "Landscaping & Turf",
  "Fencing & Gates",
  "Outdoor Lighting",
  "And More",
];

const PILLAR_SOLAR = [
  "Solar Panels",
  "Battery Storage",
  "EV Charging",
  "Energy Solutions",
  "Solar Integration",
];

const ONE_ITEMS: Array<{ title: string; copy: string }> = [
  { title: "One Vision", copy: "Design your entire project in one place." },
  { title: "One Platform", copy: "Visualize, configure and price your project with Wonderlands Studio." },
  { title: "One Team", copy: "Connect with the professionals and specialists needed to bring it to life." },
  { title: "One Experience", copy: "From the first idea to the finished project, Wonderlands coordinates the journey." },
];

const STUDIO_STEPS: Array<{ title: string; copy: string }> = [
  { title: "Design", copy: "Visualize your project." },
  { title: "Configure", copy: "Select products, materials and options." },
  { title: "Price", copy: "Understand your project and available options." },
  { title: "Plan", copy: "Generate the information needed to move toward execution." },
  { title: "Build", copy: "Connect the digital project to the professionals bringing it to life." },
];

const HOW_IT_WORKS: Array<{ n: string; title: string; copy: string }> = [
  { n: "01", title: "Imagine", copy: "Tell us what you want to create." },
  { n: "02", title: "Design", copy: "Visualize your project with Wonderlands Studio." },
  { n: "03", title: "Configure", copy: "Choose products, materials, features and upgrades." },
  { n: "04", title: "Plan", copy: "Develop pricing, project details and the path to execution." },
  { n: "05", title: "Build", copy: "Our team and network of professionals bring your project to life." },
  { n: "06", title: "Enjoy", copy: "One completed vision. One better home." },
];

const STACK = [
  "Start with a pool.",
  "Add a patio.",
  "Add an outdoor kitchen.",
  "Add landscaping.",
  "Add lighting.",
  "Add solar.",
  "Add battery storage.",
  "Add an EV charger.",
];

const COORDINATE = [
  "One pool contractor.",
  "One landscaper.",
  "One paver company.",
  "One solar company.",
  "One electrician.",
  "One designer.",
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Wonderlands | Technology-Powered Home Services Platform</title>
        <meta
          name="description"
          content="Wonderlands is a technology-powered home services platform helping homeowners design, build, transform and power their homes — outdoor living, pools, solar and energy — in one connected experience."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/about" />
        <meta property="og:title" content="About Wonderlands | One Platform for Everything Your Home Needs" />
        <meta
          property="og:description"
          content="Design. Build. Power. Transform. One technology-powered platform for outdoor living, home improvement, solar and energy."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main>
        {/* Masthead */}
        <section className="relative isolate flex min-h-[78vh] items-end overflow-hidden">
          <img
            src={heroImage}
            alt="Wonderlands outdoor living environment at golden hour"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" aria-hidden />
          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 pb-20 md:px-12">
            <Eyebrow>Wonderlands</Eyebrow>
            <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
              Everything Your Home Needs. One Platform.
            </h1>
            <p className="mt-6 text-xs uppercase tracking-[0.42em] text-muted-foreground">
              Design. Build. Power. Transform.
            </p>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Wonderlands is a technology-powered home services company bringing together outdoor living, home
              improvement, solar and energy solutions through one seamless platform.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              From designing your dream backyard to building a pool, transforming your patio, installing solar, or
              upgrading your home's outdoor environment — Wonderlands brings the design, products, professionals and
              technology together in one place.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/#pools"
                className="border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Explore Our Services
              </Link>
              <Link
                to="/studio"
                className="border border-border bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85"
              >
                Design Your Project
              </Link>
            </div>
          </div>
        </section>

        {/* More than a contractor */}
        <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-12">
          <Eyebrow>The Wonderlands Difference</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
            More Than a Contractor. A Better Way to Build.
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Home projects shouldn't require homeowners to coordinate multiple contractors, designers, suppliers and
            installers. Wonderlands brings everything together.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {ONE_ITEMS.map((item) => (
              <article key={item.title} className="bg-background p-8">
                <h3 className="font-serif text-xl tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Pillar — Outdoor Living */}
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-stretch lg:grid-cols-2">
            <div className="order-2 px-6 py-20 md:px-12 lg:order-1">
              <Eyebrow>Outdoor Living</Eyebrow>
              <h2 className="mt-6 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                Turn Your Outdoor Space Into Your Favorite Place.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Create a complete outdoor environment designed around the way you live.
              </p>
              <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
                {PILLAR_OUTDOOR.map((label) => (
                  <li
                    key={label}
                    className="border-b border-border pb-3 text-sm tracking-wide text-foreground/90"
                  >
                    {label}
                  </li>
                ))}
              </ul>
              <Link
                to="/#pools"
                className="mt-10 inline-block border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Explore Outdoor Living →
              </Link>
            </div>
            <div className="order-1 min-h-[320px] lg:order-2">
              <img
                src={outdoorImage}
                alt="Luxury pool and patio outdoor living design"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </section>

        {/* Pillar — Solar & Energy */}
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-stretch lg:grid-cols-2">
            <div className="min-h-[320px]">
              <img
                src={solarImage}
                alt="Rooftop solar array on a Florida home"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="px-6 py-20 md:px-12">
              <Eyebrow>Solar &amp; Energy</Eyebrow>
              <h2 className="mt-6 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                Power Your Home. Protect Your Future.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Make your home more energy independent with integrated solar and energy solutions.
              </p>
              <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
                {PILLAR_SOLAR.map((label) => (
                  <li key={label} className="border-b border-border pb-3 text-sm tracking-wide text-foreground/90">
                    {label}
                  </li>
                ))}
              </ul>
              <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">
                And because Wonderlands also designs and builds outdoor spaces, your energy solutions can be considered
                as part of the entire property transformation.
              </p>
              <Link
                to="/#solar"
                className="mt-10 inline-block border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Explore Solar &amp; Energy →
              </Link>
            </div>
          </div>
        </section>

        {/* Studio */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-12">
            <Eyebrow>Wonderlands Studio</Eyebrow>
            <h2 className="mt-6 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
              See It. Configure It. Price It. Build It.
            </h2>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-muted-foreground">
              The technology behind the Wonderlands experience.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                  Wonderlands Studio transforms the traditional home-improvement process into a digital experience.
                </p>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Homeowners can explore ideas, visualize their projects, configure products and options, understand
                  pricing and move from concept toward construction — all through one connected platform.
                </p>
                <ol className="mt-10 space-y-4">
                  {STUDIO_STEPS.map((step) => (
                    <li key={step.title} className="flex gap-6 border-b border-border pb-4">
                      <span className="w-24 shrink-0 text-[11px] uppercase tracking-[0.28em] text-foreground">
                        {step.title}
                      </span>
                      <span className="text-sm text-muted-foreground">{step.copy}</span>
                    </li>
                  ))}
                </ol>
                <Link
                  to="/studio"
                  className="mt-10 inline-block border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Explore Wonderlands Studio →
                </Link>
              </div>
              <div className="min-h-[360px]">
                <img
                  src={studioImage}
                  alt="Designed outdoor lanai visualized in Wonderlands Studio"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* One platform, endless possibilities */}
        <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-12">
          <Eyebrow>One Platform. Endless Possibilities.</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
            Wonderlands is designed to bring different home projects together instead of treating them as separate jobs.
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STACK.map((line) => (
              <div key={line} className="bg-background p-8 font-serif text-lg tracking-tight text-foreground">
                {line}
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Build the home you actually want — all through one connected experience.
          </p>
        </section>

        {/* How it works */}
        <section className="border-y border-border">
          <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-12">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="mt-6 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
              From Idea to Reality
            </h2>
            <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {HOW_IT_WORKS.map((step) => (
                <article key={step.n} className="border-t border-border pt-6">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">{step.n}</p>
                  <h3 className="mt-3 font-serif text-2xl tracking-tight text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Differentiator */}
        <section className="relative isolate overflow-hidden">
          <img
            src={landscapingImage}
            alt="Complete landscaped outdoor property transformation"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-background/85" aria-hidden />
          <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-24 md:px-12">
            <h2 className="max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
              Why Coordinate Everything Yourself?
            </h2>
            <ul className="mt-12 space-y-3">
              {COORDINATE.map((line) => (
                <li key={line} className="font-serif text-xl tracking-tight text-muted-foreground md:text-2xl">
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-10 font-serif text-2xl tracking-tight text-foreground md:text-4xl">Or one Wonderlands.</p>
            <Rule />
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Wonderlands simplifies complex home projects by bringing multiple services, products and professionals
              together through one technology-powered experience.
            </p>
          </div>
        </section>

        {/* Company positioning */}
        <section className="mx-auto max-w-[1600px] px-6 py-24 md:px-12">
          <Eyebrow>The Company</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-serif text-3xl leading-tight tracking-tight text-foreground md:text-5xl">
            We Are Building the Future of Home Services
          </h2>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Wonderlands is creating a new model for home improvement — combining technology, design, construction and
            energy solutions into one connected platform.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.32em] text-muted-foreground">Our goal is simple</p>
          <p className="mt-4 max-w-2xl font-serif text-2xl leading-snug tracking-tight text-foreground md:text-3xl">
            Make it easier to imagine, plan, build and improve your home.
          </p>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-[1600px] px-6 py-24 text-center md:px-12">
            <h2 className="font-serif text-3xl tracking-tight text-foreground md:text-5xl">Start Your Project</h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Tell us what you're dreaming about. We'll help you bring it together.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/quote"
                className="border border-border bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85"
              >
                Start My Project →
              </Link>
              <Link
                to="/studio"
                className="border border-foreground px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Explore Wonderlands Studio →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
