import * as React from "react";
const { useState } = React;
import SurveyQuoteTool from "./SurveyQuoteTool";
import AdvancedSearch from "./AdvancedSearch";
import heroVideo from "@/assets/hero-beach.mp4.asset.json";
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
      {/* Legibility overlay */}
      <div className="absolute inset-0 bg-background/40" />

      {/* Centered Search Engine */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <AdvancedSearch />
          </div>
        </div>
      </div>
    </section>

    
    <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </>;
};
export default Hero;