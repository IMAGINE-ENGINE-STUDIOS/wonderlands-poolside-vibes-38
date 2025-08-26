
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  Home, 
  Waves, 
  Square, 
  Palette, 
  Shield, 
  Sun, 
  Star,
  ShoppingCart as CartIcon,
  Package,
  User,
  Settings,
  Menu,
  MoreHorizontal
} from "lucide-react";
import AdminLogin from "./AdminLogin";

const HorizontalNavigation = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isContentEditor = location.pathname === '/content-editor';

  const navigationItems = [
    { path: "/", label: "Home", icon: Home, showIconOnly: true },
    { path: "/pools", label: "Pools", icon: Waves },
    { path: "/pavers", label: "Pavers", icon: Square },
    { path: "/pool-finishes", label: "Pool Finishes", icon: Palette },
    { path: "/screen-enclosures", label: "Screen Enclosures", icon: Shield },
    { path: "/automatic-covers", label: "Automatic Covers", icon: Sun },
    { path: "/brand-showcase", label: "Brand Showcase", icon: Star },
  ];

  // Determine how many nav items to show based on screen size
  const getVisibleItems = () => {
    if (isMobile) return 2; // Home + 1 other
    // Estimate based on screen width - accounting for logo, back button, and user actions
    const screenWidth = window.innerWidth;
    if (screenWidth < 1024) return 3; // Tablet
    if (screenWidth < 1280) return 4; // Small desktop
    return navigationItems.length; // Large desktop - show all
  };

  const visibleItemCount = getVisibleItems();
  const visibleItems = navigationItems.slice(0, visibleItemCount);
  const overflowItems = navigationItems.slice(visibleItemCount);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAdminAccess = () => {
    setShowAdminLogin(true);
  };

  const handleLoginSuccess = () => {
    window.location.href = '/admin';
  };

  const openCart = () => {
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  const openOrders = () => {
    window.dispatchEvent(new CustomEvent('open-orders'));
  };

  const renderNavButton = (item: typeof navigationItems[0]) => {
    const isActive = location.pathname === item.path;
    const showLabel = !item.showIconOnly && (!isMobile || isActive);
    
    return (
      <Link key={item.path} to={item.path}>
        <Button 
          variant={isActive ? "default" : "ghost"} 
          size="sm"
          className="flex items-center gap-2"
          title={item.label}
        >
          <item.icon className="w-4 h-4" />
          {showLabel && <span className="hidden sm:inline">{item.label}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo and Go Back */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            
            {/* Logo with white background - reduced ~15% */}
            <Link to="/" className="flex items-center">
              <div className="rounded-lg bg-white p-1 flex items-center justify-center border shadow-sm w-[82px] h-[82px] sm:w-[96px] sm:h-[96px] md:w-[120px] md:h-[120px]">
                <img 
                  src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
                  alt="Wonderlands Professional Logo"
                  className="w-full h-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {!isContentEditor && (
            <div className="flex items-center gap-1">
              {/* Visible navigation items */}
              {visibleItems.map(renderNavButton)}
              
              {/* Overflow dropdown menu */}
              {overflowItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="hidden sm:inline">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48 bg-background border border-border shadow-lg z-50">
                    {overflowItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link 
                          to={item.path} 
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted rounded-sm"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* User Actions */}
          {!isContentEditor && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={openCart}
                className="flex items-center gap-2"
                title="Shopping Cart"
              >
                <CartIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Cart</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={openOrders}
                className="flex items-center gap-2"
                title="Orders"
              >
                <Package className="w-4 h-4" />
                <span className="hidden lg:inline">Orders</span>
              </Button>

              {!user ? (
                <Link to="/auth">
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              ) : (
                profile?.role === 'main_admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAdminAccess}
                    className="flex items-center gap-2"
                    title="Admin"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </nav>

      <AdminLogin 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default HorizontalNavigation;
