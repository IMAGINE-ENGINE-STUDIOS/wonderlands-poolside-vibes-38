import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Home, Waves, Sparkles, Palette, Droplets, Shield, Grid3X3, Mountain } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";

const RightNavigation = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const { getCartCount, setIsCartOpen } = useShoppingCart();

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero",
        "pools",
        "spas",
        "finishes",
        "liners",
        "covers",
        "screen-enclosures",
        "pavers",
      ];

      let currentSection = "hero";
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = sectionId;
          }
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "pools", label: "Pools", icon: Waves },
    { id: "spas", label: "Spas", icon: Sparkles },
    { id: "finishes", label: "Finishes", icon: Palette },
    { id: "liners", label: "Liners", icon: Droplets },
    { id: "covers", label: "Covers", icon: Shield },
    { id: "screen-enclosures", label: "Screen Enclosures", icon: Grid3X3 },
    { id: "pavers", label: "Pavers", icon: Mountain },
  ];

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
      {/* Shopping Cart Button */}
      <Button
        onClick={() => setIsCartOpen(true)}
        className="relative rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg"
      >
        <ShoppingCart className="h-5 w-5" />
        {getCartCount() > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-coral text-white min-w-5 h-5 flex items-center justify-center text-xs">
            {getCartCount()}
          </Badge>
        )}
      </Button>

      {/* Navigation Items */}
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <Button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            variant={isActive ? "default" : "outline"}
            className="rounded-full w-12 h-12 shadow-lg transition-all duration-300"
            title={item.label}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
};

export default RightNavigation;
