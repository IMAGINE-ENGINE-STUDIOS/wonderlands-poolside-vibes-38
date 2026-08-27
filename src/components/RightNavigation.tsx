import * as React from "react";
const { useState } = React;
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Home, LayoutDashboard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * RightNavigation — floating right rail.
 *
 * NOTE (Aug 2026): the per-category shortcut buttons were removed on request.
 * The main page now renders every category section inline (see src/pages/Index.tsx),
 * so this rail only exposes, for signed-in staff, the Admin Dashboard — the cart
 * lives solely in the Studio cart / FLIP Order Desk.
 * On non-home routes it collapses to a single "Home" button.
 */
const RightNavigation = () => {
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

            {/* The cart lives in one place only — the Order Desk / Studio cart.
                The duplicate floating cart button was removed here on request. */}
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RightNavigation;
