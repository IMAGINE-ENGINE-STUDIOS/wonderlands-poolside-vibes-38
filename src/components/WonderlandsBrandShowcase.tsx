import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Waves, Sun } from "lucide-react";

const brandImages = [
  {
    id: 1,
    url: "/lovable-uploads/96a7bfbb-d930-451c-a0cd-1d8297bb7512.png",
    title: "Pool Paradise",
    description: "Create your perfect backyard oasis with Wonderlands premium pool accessories and vibrant outdoor furniture."
  },
  {
    id: 2,
    url: "/lovable-uploads/57670513-84aa-4ae5-86ee-6a95737004b5.png",
    title: "Luxury Lifestyle",
    description: "Experience the ultimate in pool luxury with our colorful floats and premium poolside comfort."
  },
  {
    id: 3,
    url: "/lovable-uploads/2ad9f663-7ae0-4ea4-8ae6-cf232b78f58e.png",
    title: "Evening Elegance",
    description: "Transform your outdoor space into an illuminated wonderland with our branded ambient lighting."
  },
  {
    id: 4,
    url: "/lovable-uploads/ed2e7763-9e47-4400-9fee-f7dff2ccb0ee.png",
    title: "Poolside Essentials",
    description: "From towels to inflatables, everything you need for the perfect pool day experience."
  },
  {
    id: 5,
    url: "/lovable-uploads/eaf313f5-2a7b-4b5e-a94b-da9d4104de79.png",
    title: "Fun Collection",
    description: "Dive into fun with our complete collection of pool accessories, goggles, and water toys."
  }
];

const WonderlandsBrandShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brandImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('brand-showcase');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const currentImage = brandImages[currentIndex];

  return (
    <section id="brand-showcase" className="relative py-24 overflow-hidden bg-gradient-to-br from-primary/5 via-teal/5 to-coral/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-primary/10 animate-bounce">
          <Sparkles size={60} />
        </div>
        <div className="absolute top-32 right-16 text-teal/10 animate-pulse">
          <Waves size={80} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-coral/10 animate-bounce" style={{ animationDelay: '1s' }}>
          <Sun size={70} />
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-teal to-coral bg-clip-text text-transparent">
            Experience Wonderlands
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dive into a world of vibrant colors, premium quality, and endless summer fun. 
            Our brand represents the perfect blend of luxury and playfulness.
          </p>
        </div>

        {/* Dynamic Image Showcase */}
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image Container */}
            <div className="relative h-[600px] rounded-3xl overflow-hidden group">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform group-hover:scale-105"
                style={{ backgroundImage: `url(${currentImage.url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Image Navigation Dots */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                {brandImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className={`space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                  {currentImage.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentImage.description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 my-8">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Premium Quality</h4>
                  <p className="text-sm text-muted-foreground">Durable materials built to last</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-teal/10 to-teal/5 border border-teal/20">
                  <h4 className="font-semibold text-teal mb-2">Vibrant Colors</h4>
                  <p className="text-sm text-muted-foreground">Eye-catching designs that pop</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-coral/10 to-coral/5 border border-coral/20">
                  <h4 className="font-semibold text-coral mb-2">Family Fun</h4>
                  <p className="text-sm text-muted-foreground">Perfect for all ages</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange/10 to-orange/5 border border-orange/20">
                  <h4 className="font-semibold text-orange mb-2">Complete Sets</h4>
                  <p className="text-sm text-muted-foreground">Everything you need included</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  variant="gradient" 
                  size="lg" 
                  className="group"
                  onClick={() => window.open('https://calendly.com/wonderlandsworlds/30min', '_blank')}
                >
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg">
                  View Our Catalog
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Stats */}
        <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-teal mb-2">500+</div>
            <div className="text-muted-foreground">Pool Installations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-coral mb-2">15+</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange mb-2">100%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WonderlandsBrandShowcase;