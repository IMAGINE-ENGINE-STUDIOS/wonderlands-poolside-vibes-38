import * as React from "react";
const { useState } = React;
import SurveyQuoteTool from "./SurveyQuoteTool";
import AdvancedSearch from "./AdvancedSearch";
import FlipMagazine from "./flip/FlipMagazine";
import heroVideo from "@/assets/hero/hero-beach-uhd.mp4.asset.json";
import wonderlandsLogo from "@/assets/brand/wonderlands-logo.webp";

const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  return <>
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* Full-bleed background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

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
