import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import AnimatedLandscape from "./AnimatedLandscape";
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
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Landscape Background */}
      <AnimatedLandscape />
      

      {/* Clean Hero Section - No Buttons */}
    </section>
    
    <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </>;
};
export default Hero;