import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/10">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-coral/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-primary/20 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-teal/20 rounded-full animate-float-slow"></div>
        <div className="absolute top-60 left-1/3 w-14 h-14 bg-orange/20 rounded-full animate-wiggle"></div>
        <div className="absolute bottom-40 right-10 w-18 h-18 bg-secondary/20 rounded-full animate-float"></div>
        <div className="absolute top-32 right-1/3 w-10 h-10 bg-accent/30 rounded-full animate-bounce-gentle"></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-1/4 left-1/4 text-coral/40 animate-wiggle">
          <Sparkles size={24} />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-primary/40 animate-float">
          <Sparkles size={18} />
        </div>
        <div className="absolute top-1/3 right-1/3 text-teal/40 animate-bounce-gentle">
          <Sparkles size={20} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <img 
            src="/lovable-uploads/5bfe3308-05a6-4d01-9f62-014d86ea281c.png" 
            alt="Wonderlands Logo" 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 animate-scale-in"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
          Wonderlands
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/80 mb-8 animate-fade-in-up leading-relaxed">
          Transform your backyard into your personal oasis with premium fiberglass pools and patios. 
          <br className="hidden md:block" />
          Where lifestyle meets luxury.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up">
          <Button 
            variant="gradient"
            size="lg" 
            className="hover:scale-105 transition-all duration-300 group"
          >
            Explore Our Pools
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="coral" 
            size="lg" 
            className="hover:scale-105 transition-all duration-300"
          >
            Get Free Quote
          </Button>
        </div>
        
        <div className="mt-12 animate-fade-in-up">
          <p className="text-sm text-muted-foreground mb-4">Trusted by 500+ families across the region</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="w-12 h-2 bg-gradient-to-r from-primary to-teal rounded-full"></div>
            <div className="w-12 h-2 bg-gradient-to-r from-coral to-orange rounded-full"></div>
            <div className="w-12 h-2 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;