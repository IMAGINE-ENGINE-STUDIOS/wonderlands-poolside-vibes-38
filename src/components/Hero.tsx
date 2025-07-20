import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SurveyQuoteTool from "./SurveyQuoteTool";
import InteractiveLandscape from "./InteractiveLandscape";

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
      {/* Interactive Landscape Background */}
      <InteractiveLandscape />
      
      {/* Logo at Top */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <img 
          src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
          alt="Wonderlands Professional Logo" 
          className="w-32 h-32 md:w-40 md:h-40 animate-scale-in"
        />
      </div>

      {/* Main Content Overlay */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 text-center px-4 max-w-4xl">
        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up leading-relaxed drop-shadow-lg">
          Transform your backyard into your personal oasis with premium fiberglass pools and patios. 
          <br className="hidden md:block" />
          Where lifestyle meets luxury.
        </p>
        
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
            Get Free Quote
          </Button>

          <Link to="/admin">
            <Button 
              variant="outline" 
              size="lg" 
              className="hover:scale-105 transition-all duration-300 backdrop-blur-sm border-white/30 text-white hover:bg-white/10"
            >
              <Shield className="mr-2 h-5 w-5" />
              Admin Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 animate-fade-in-up">
          <p className="text-sm text-white/70 mb-4">Trusted by 500+ families across the region</p>
          <div className="flex justify-center items-center gap-8 opacity-80">
            <div className="w-12 h-2 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
            <div className="w-12 h-2 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
            <div className="w-12 h-2 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
          </div>
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