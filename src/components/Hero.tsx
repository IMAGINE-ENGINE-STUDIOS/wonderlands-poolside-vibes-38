import * as React from "react";
const { useState } = React;
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import AnimatedLandscape from "./AnimatedLandscape";
import AdvancedSearch from "./AdvancedSearch";
const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('pool-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <>
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/20 to-teal/30">
      {/* Animated Landscape Background */}
      <AnimatedLandscape />
      

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