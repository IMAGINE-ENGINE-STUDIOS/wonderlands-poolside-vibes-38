import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import InteractiveLandscape from "./InteractiveLandscape";

interface HeroTemplateProps {
  logo: string;
  logoAlt: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  trustBadgeText: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  showQuoteModal?: boolean;
  QuoteComponent?: React.ComponentType<any>;
}

const HeroTemplate = ({
  logo,
  logoAlt,
  title,
  subtitle,
  primaryButtonText,
  secondaryButtonText,
  trustBadgeText,
  onPrimaryClick,
  onSecondaryClick,
  showQuoteModal = false,
  QuoteComponent
}: HeroTemplateProps) => {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden">
        {/* Interactive Landscape Background */}
        <InteractiveLandscape />
        
        {/* Logo at Top */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
          <img 
            src={logo}
            alt={logoAlt} 
            className="w-32 h-32 md:w-40 md:h-40 animate-scale-in"
          />
        </div>

        {/* Main Content Overlay */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 text-center px-4 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up leading-tight drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up leading-relaxed drop-shadow-lg">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
            <Button 
              variant="gradient"
              size="lg" 
              className="hover:scale-105 transition-all duration-300 group backdrop-blur-sm"
              onClick={onPrimaryClick}
            >
              {primaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="coral" 
              size="lg" 
              className="hover:scale-105 transition-all duration-300 backdrop-blur-sm"
              onClick={onSecondaryClick}
            >
              {secondaryButtonText}
            </Button>
          </div>
          
          <div className="mt-12 animate-fade-in-up">
            <p className="text-sm text-white/70 mb-4">{trustBadgeText}</p>
            <div className="flex justify-center items-center gap-8 opacity-80">
              <div className="w-12 h-2 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
              <div className="w-12 h-2 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
              <div className="w-12 h-2 bg-gradient-to-r from-white/60 to-white/40 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
      
      {QuoteComponent && showQuoteModal && <QuoteComponent />}
    </>
  );
};

export default HeroTemplate;