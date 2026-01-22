import * as React from "react";
const { useState, useEffect } = React;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShoppingCart, Home, Waves, Sparkles, Palette, Droplets, Shield, Grid3X3, Mountain, Settings, Bot } from "lucide-react";
import { useShoppingCart } from "./ShoppingCartProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import MiniCart from "./MiniCart";

const RightNavigation = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const { getCartCount, setIsCartOpen } = useShoppingCart();
  const { user } = useAuth();
  const { openChat } = useAIAssistant();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the main page - only show full navigation on main page
  const isMainPage = location.pathname === '/';
  const isWonderlandsStudio = location.pathname === '/wonderlands-studio';
  const isQuoteOpen = typeof document !== 'undefined' && document.body.dataset.quoteOpen === 'true';

  useEffect(() => {
    // Skip scroll handling if on Wonderlands Studio page
    if (isWonderlandsStudio) return;
    
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
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
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isWonderlandsStudio]);
  
  // Hide navigation completely on Wonderlands Studio page (home button is in header)
  if (isWonderlandsStudio) {
    return null;
  }

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
      <div className={`fixed right-4 z-[70] flex flex-col gap-2 ${
        !isMainPage ? 'top-24' : 'top-1/2 transform -translate-y-1/2'
      }`}>
        {/* Conditional rendering based on current page */}
        {(!isMainPage || isQuoteOpen) ? (
          /* Show only Home button on non-main pages or when quote modal open */
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate('/')}
                className="relative rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Home</TooltipContent>
          </Tooltip>
        ) : (
          <>
            {/* AI Assistant Button - Hidden for now */}

            {/* Admin Dashboard Button - Only show to logged in users */}
            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => navigate('/admin')}
                    className="relative rounded-full w-11 h-11 bg-secondary hover:bg-secondary/90 shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Admin Dashboard</TooltipContent>
              </Tooltip>
            )}

            {/* Shopping Cart Button with Mini Preview */}
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      className="relative rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-lg"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {getCartCount() > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-coral text-white min-w-5 h-5 flex items-center justify-center text-xs">
                          {getCartCount()}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">Cart</TooltipContent>
              </Tooltip>
              <PopoverContent side="left" align="start" className="p-0">
                <MiniCart onViewFullCart={() => setIsCartOpen(true)} />
              </PopoverContent>
            </Popover>

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
                  <TooltipContent side="left">{item.label}</TooltipContent>
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
