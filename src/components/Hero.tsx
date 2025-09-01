import { useState } from "react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import AnimatedLandscape from "./AnimatedLandscape";
import AdvancedSearch from "./AdvancedSearch";

const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden">
        {/* Animated Landscape Background */}
        <AnimatedLandscape />
        
        {/* Simple Search Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <AdvancedSearch />
          </div>
        </div>
      </section>
      
      <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </>
  );
};
export default Hero;