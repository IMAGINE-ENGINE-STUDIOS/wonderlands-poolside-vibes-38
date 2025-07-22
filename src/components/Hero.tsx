import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Download } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SurveyQuoteTool from "./SurveyQuoteTool";
import AnimatedLandscape from "./AnimatedLandscape";

const Hero = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('pool-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Landscape Background */}
      <AnimatedLandscape />
      

      {/* Main Action Buttons - Near Logo */}
      <div className="absolute top-48 left-1/2 transform -translate-x-1/2 z-20 text-center px-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
          <Button 
            variant="gradient"
            size="lg" 
            className="hover:scale-105 transition-all duration-300 group backdrop-blur-sm"
            onClick={scrollToCatalog}
          >
            Explore Our Pools
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="coral" 
            size="lg" 
            className="hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            onClick={() => setShowQuoteModal(true)}
          >
            Upload Your House Survey
          </Button>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center px-4 max-w-4xl">
        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up leading-relaxed drop-shadow-lg">
          Transform your backyard into your personal oasis with premium fiberglass pools and patios. 
          <br className="hidden md:block" />
          Where lifestyle meets luxury.
        </p>
        
        <div className="mt-12 animate-fade-in-up">
          <p className="text-sm text-white/70 mb-4">Trusted by 500+ families across the region</p>
        </div>
      </div>
    </section>
    
    <SurveyQuoteTool 
      pool={null}
      isOpen={showQuoteModal}
      onClose={() => setShowQuoteModal(false)}
    />
    </>
  );
};

export default Hero;