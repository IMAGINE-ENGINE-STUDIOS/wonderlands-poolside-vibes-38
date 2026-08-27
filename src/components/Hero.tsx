import * as React from "react";
const { useState } = React;
import SurveyQuoteTool from "./SurveyQuoteTool";
import AdvancedSearch from "./AdvancedSearch";
import FlipMagazine from "./flip/FlipMagazine";
import heroStill from "@/assets/hero/hero-carousel-1.webp";
import HeroVideo from "./HeroVideo";
import wonderlandsLogo from "@/assets/brand/wonderlands-logo.webp";

const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  return <>
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* Header film — same footage as the FLIP first page, with a still fallback */}
      <HeroVideo poster={heroStill} alt="Wonderlands resort pool at golden hour" />
      {/* Legibility veil for the logo and search field */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/60" aria-hidden />


      {/* Centered logo + search engine */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <img
              src={wonderlandsLogo}
              alt="Wonderlands World"
              width={300}
              height={120}
              decoding="async"
              className="mb-8 h-20 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:h-28"
            />
            <div className="w-full">
              <AdvancedSearch />
            </div>
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://calendly.com/wonderlandsworlds/30min?month=2026-08&date=2026-08-27"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary shadow-lg ring-1 ring-primary-foreground/20 backdrop-blur-sm transition hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl"
              >
                Schedule Your Consultation
                <span aria-hidden className="text-xs">→</span>
              </a>
              <span className="hidden h-5 w-px bg-primary-foreground/25 sm:block" aria-hidden />
              <a
                href="tel:+12392570637"
                className="inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-full border border-primary-foreground/20 bg-primary/10 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.25em] text-primary-foreground backdrop-blur-sm transition hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-primary/20 hover:border-primary-foreground/30"
              >
                +1 (239) 257-0637
              </a>
            </nav>
          </div>
        </div>
      </div>
    </section>

    {/* FLIP V4 — The Outdoor Annual */}
    <FlipMagazine variant="v7" hideHeader />

    <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </>;
};
export default Hero;
