import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * SolarBoard — the Total Solar Calculator on its own full page.
 *
 * The same board printed inside the FLIP brochure, given a dedicated route so
 * it can be worked at full width: address search, aerial roof tracing, panel
 * layout, production and the contractor report. Nothing here can turn a page,
 * so the map keeps the arrow keys, the keypad and the scroll wheel.
 */

const SolarCalculatorBoard = React.lazy(
  () => import("@/components/solar/SolarCalculatorBoard"),
);

const SolarBoard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Total Solar Calculator | Wonderlands Solar</title>
        <meta
          name="description"
          content="Trace your own roof from aerial imagery and build a complete solar project: panel layout, production estimate, battery, racking and full bill of materials."
        />
        <link rel="canonical" href="https://www.wonderlandsworld.com/solar-board" />
        <meta property="og:title" content="Total Solar Calculator | Wonderlands Solar" />
        <meta
          property="og:description"
          content="Aerial roof tracing, sun-exposure mapping, panel layout and a full solar project estimate."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="mx-auto max-w-[1600px] px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.42em] text-muted-foreground">
              Wonderlands Solar — Drawing Board
            </p>
            <h1 className="mt-5 font-serif text-4xl font-light leading-[1.05] tracking-tight text-foreground md:text-5xl">
              Total Solar Calculator
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Search the property, frame the aerial, then trace the roof planes. Each
              face is scored for sun exposure, panels are laid out to fit, and the
              production, racking and bill of materials follow automatically.
            </p>
          </div>
          <Link
            to="/#solar"
            className="inline-flex items-center gap-2 border-b border-foreground/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground transition hover:border-foreground"
          >
            Wonderlands Solar
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-10 h-px w-24 bg-foreground/30" />

        <div className="mt-10">
          <React.Suspense
            fallback={
              <div className="flex h-[520px] items-center justify-center border border-border/60 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Bringing up the board…
              </div>
            }
          >
            <SolarCalculatorBoard height={640} />
          </React.Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SolarBoard;
