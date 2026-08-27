import * as React from "react";
import { Link } from "react-router-dom";

/**
 * PlatformJourney — "From Idea to Reality" six-step process plus the closing
 * company positioning and the primary CTA ("Start Your Project").
 * Presentation only.
 */

const STEPS: Array<{ num: string; title: string; copy: string }> = [
  { num: "01", title: "Imagine", copy: "Tell us what you want to create." },
  { num: "02", title: "Design", copy: "Visualize your project with Wonderlands Studio." },
  { num: "03", title: "Configure", copy: "Choose products, materials, features and upgrades." },
  { num: "04", title: "Plan", copy: "Develop pricing, project details and the path to execution." },
  { num: "05", title: "Build", copy: "Our team and network of professionals bring your project to life." },
  { num: "06", title: "Enjoy", copy: "One completed vision. One better home." },
];

const PlatformJourney: React.FC = () => {
  return (
    <section
      id="how-it-works"
      aria-label="How Wonderlands works"
      className="bg-background py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
          How It Works
        </p>
        <h2 className="mt-6 max-w-3xl font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-5xl">
          From idea to reality
        </h2>
        <div className="mt-10 h-px w-24 bg-foreground/30" />

        <ol className="mt-12 grid grid-cols-1 gap-px bg-border/40 border-t border-border/60 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.num} className="bg-background p-7 md:p-9">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                {step.num} — {step.title}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
            </li>
          ))}
        </ol>

        {/* Company positioning + CTA */}
        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-border/60 pt-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
              The Company
            </p>
            <h3 className="mt-6 max-w-2xl font-serif text-3xl font-light leading-tight text-foreground md:text-4xl">
              We are building the future of home services
            </h3>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Wonderlands is creating a new model for home improvement — combining
              technology, design, construction and energy solutions into one connected
              platform. Our goal is simple: make it easier to imagine, plan, build and
              improve your home.
            </p>
          </div>

          <div className="lg:col-span-5">
            <p className="font-serif text-2xl font-light leading-snug text-foreground md:text-3xl">
              Start your project
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Tell us what you're dreaming about. We'll help you bring it together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/studio"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-background transition hover:-translate-y-0.5"
              >
                Start My Project
              </Link>
              <Link
                to="/studio"
                className="inline-flex items-center justify-center rounded-full border border-foreground/25 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.25em] text-foreground transition hover:-translate-y-0.5 hover:border-foreground/50"
              >
                Explore Wonderlands Studio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformJourney;
