import * as React from "react";
const { useState, useEffect } = React;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ShoppingCart,
  Home,
  Waves,
  Flame,
  Droplet,
  Sun,
  Shield,
  Fence,
  Home as HomeIcon,
  Grid3x3,
  Sprout,
  Umbrella,
  DoorOpen,
  Palette,
  Layers,
  Settings,
} from "lucide-react";
import { useShoppingCart } from "./ShoppingCartProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MiniCart from "./MiniCart";

const NAV_ITEMS = [
  { id: "pools", label: "Pools", icon: Waves },
  { id: "saunas", label: "Saunas", icon: Flame },
  { id: "spas", label: "Spas", icon: Droplet },
  { id: "tanning-ledges", label: "Tanning Ledges", icon: Sun },
  { id: "screen-enclosures", label: "Screen Enclosures", icon: Shield },
  { id: "patio-fencing", label: "Patio Fencing", icon: Fence },
  { id: "lanai", label: "Lanai", icon: HomeIcon },
  { id: "pavers", label: "Pavers", icon: Grid3x3 },
  { id: "artificial-grass", label: "Artificial Grass", icon: Sprout },
  { id: "covers", label: "Covers", icon: Umbrella },
  { id: "driveway-gates", label: "Driveway Gates", icon: DoorOpen },
  { id: "finishes", label: "Finishes", icon: Palette },
  { id: "liners", label: "Liners", icon: Layers },
];

const RightNavigation = () => {
  const [activeHash, setActiveHash] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.hash.replace("#", "") || "pools" : "pools"
  );
  const { getCartCount, setIsCartOpen } = useShoppingCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMainPage = location.pathname === "/";
  const isWonderlandsStudio = location.pathname === "/wonderlands-studio";
  const isQuoteOpen =
    typeof document !== "undefined" && document.body.dataset.quoteOpen === "true";

  useEffect(() => {
    if (!isMainPage) return;
    const onHashChange = () => {
      setActiveHash(window.location.hash.replace("#", "") || "pools");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [isMainPage]);

  if (isWonderlandsStudio) return null;

  const goToCategory = (id: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    if (window.location.hash === `#${id}`) {
      // Force re-trigger by clearing then setting
      history.replaceState(null, "", "/");
      window.location.hash = id;
    } else {
      window.location.hash = id;
    }
    setActiveHash(id);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`fixed right-4 z-[70] flex flex-col gap-2 ${
          !isMainPage ? "top-24" : "top-1/2 transform -translate-y-1/2"
        } max-h-[90vh] overflow-y-auto scrollbar-hide`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {(!isMainPage || isQuoteOpen) ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => navigate("/")}
                className="relative rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Home</TooltipContent>
          </Tooltip>
        ) : (
          <>
            {user && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => navigate("/admin")}
                    className="relative rounded-full w-11 h-11 bg-secondary hover:bg-secondary/90 shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Admin Dashboard</TooltipContent>
              </Tooltip>
            )}

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button className="relative rounded-full w-11 h-11 bg-primary hover:bg-primary/90 shadow-lg">
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

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeHash === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => goToCategory(item.id)}
                      variant={isActive ? "default" : "outline"}
                      className={`rounded-full w-11 h-11 shadow-lg transition-all duration-300 ${
                        isActive ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
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
