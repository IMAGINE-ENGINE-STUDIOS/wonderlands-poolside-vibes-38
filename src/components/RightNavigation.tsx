import * as React from "react";
const { useState } = React;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShoppingCart, Home, LayoutDashboard } from "lucide-react";
import { useShoppingCart } from "./ShoppingCartProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MiniCart from "./MiniCart";

/**
 * RightNavigation — floating right rail.
 *
 * NOTE (Aug 2026): the per-category shortcut buttons were removed on request.
 * The main page now renders every category section inline (see src/pages/Index.tsx),
 * so this rail only exposes the Cart and, for signed-in staff, the Admin Dashboard.
 * On non-home routes it collapses to a single "Home" button.
 */
const RightNavigation = () => {
  const { getCartCount, setIsCartOpen } = useShoppingCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMainPage = location.pathname === "/";
  const isWonderlandsStudio = location.pathname === "/wonderlands-studio";
  const [isQuoteOpen] = useState<boolean>(
    () => typeof document !== "undefined" && document.body.dataset.quoteOpen === "true"
  );

  if (isWonderlandsStudio) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`fixed right-4 z-[70] flex flex-col gap-2 ${
          !isMainPage ? "top-24" : "top-1/2 transform -translate-y-1/2"
        } max-h-[90vh] overflow-y-auto scrollbar-hide`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {!isMainPage || isQuoteOpen ? (
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
                    className="relative rounded-full w-11 h-11 bg-coral text-white hover:bg-coral/90 shadow-lg shadow-coral/30 ring-1 ring-white/20"
                  >
                    <LayoutDashboard className="h-4 w-4" />
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
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RightNavigation;
