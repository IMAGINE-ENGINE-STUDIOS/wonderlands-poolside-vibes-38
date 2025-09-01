import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Home, Waves, Sparkles, Palette, Droplets, Shield, Grid3X3, Mountain, Settings } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { useNavigate, useLocation } from "react-router-dom";

const RightNavigation = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const { getCartCount, setIsCartOpen } = useShoppingCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the content editor page
  const isContentEditor = location.pathname === '/content-editor';

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
    <TooltipProvider>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-[70] flex flex-col gap-2">
        {/* Conditional rendering based on current page */}
        {isContentEditor ? (
          /* Show only Home button on Content Editor page */
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate('/')}
                className="relative rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>
        ) : (
          <>
            {/* Admin Dashboard Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => navigate('/admin')}
                  className="relative rounded-full w-11 h-11 bg-secondary hover:bg-secondary/90 shadow-lg"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Admin</TooltipContent>
            </Tooltip>

            {/* Shopping Cart Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsCartOpen(true)}
                  className="relative rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getCartCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-coral text-white min-w-5 h-5 flex items-center justify-center text-xs">
                      {getCartCount()}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cart</TooltipContent>
            </Tooltip>

            {/* Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => scrollToSection(item.id)}
                      variant={isActive ? "default" : "outline"}
                      className="rounded-full w-11 h-11 shadow-lg transition-all duration-300"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RightNavigation;
