
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, ShoppingCart as CartIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserProfileModal from "./UserProfileModal";
import { Badge } from "@/components/ui/badge";
import { useShoppingCart } from "./ShoppingCart";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const { items } = useShoppingCart();
  
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Pools", path: "/pools" },
    { name: "Spas", path: "/spas" },
    { name: "Tanning Ledges", path: "/tanning-ledges" },
    { name: "Pavers", path: "/pavers" },
    { name: "Screen Enclosures", path: "/screen-enclosures" },
    { name: "Automatic Covers", path: "/automatic-covers" },
    { name: "Pool Finishes", path: "/pool-finishes" }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/86d04882-f51e-4b4b-9c89-34031c370138.png"
                alt="Wonderlands"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.path) 
                      ? "text-primary border-b-2 border-primary pb-1" 
                      : "text-gray-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Shopping Cart */}
              <Link to="/quote-preview" className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <CartIcon className="h-5 w-5" />
                  {items.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {items.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Profile */}
              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile menu trigger */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                          isActive(item.path)
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <UserProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

export default Header;
