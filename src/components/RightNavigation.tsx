
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Home, Waves, Sparkles, Palette, Droplets, Shield, Grid3X3, Mountain, Settings, User } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RightNavigation = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const { getCartCount, setIsCartOpen } = useShoppingCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on special pages
  const isContentEditor = location.pathname === '/content-editor';
  const isAdminDashboard = location.pathname === '/admin';
  const isDashboard = location.pathname === '/dashboard';

  // Check user roles
  const isMainAdmin = profile?.role === 'main_admin' && user?.email === 'rikicot@hotmail.com';
  const isSupplierOrContractor = profile?.role === 'supplier' || profile?.role === 'installer';

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
      <div className={`fixed right-4 z-[70] flex flex-col gap-2 ${
        isAdminDashboard || isDashboard ? 'top-4' : 'top-1/2 transform -translate-y-1/2'
      }`}>
        {/* Conditional rendering based on current page and user role */}
        {(isContentEditor || isAdminDashboard || isDashboard) ? (
          /* Show only Home button on special pages */
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
            {/* Role-based Dashboard/Admin Buttons */}
            {isMainAdmin && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => navigate('/admin')}
                    className="relative rounded-full w-11 h-11 bg-red-600 hover:bg-red-700 shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Admin</TooltipContent>
              </Tooltip>
            )}

            {isSupplierOrContractor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="relative rounded-full w-11 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dashboard</TooltipContent>
              </Tooltip>
            )}

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
