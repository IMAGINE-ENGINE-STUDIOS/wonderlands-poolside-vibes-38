import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Settings
} from "lucide-react";
import AdminLogin from "./AdminLogin";

const HorizontalNavigation = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isContentEditor = location.pathname === '/content-editor';

  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/pools", label: "Pools", icon: Waves },
    { path: "/pavers", label: "Pavers", icon: Square },
    { path: "/pool-finishes", label: "Pool Finishes", icon: Palette },
    { path: "/screen-enclosures", label: "Screen Enclosures", icon: Shield },
    { path: "/automatic-covers", label: "Automatic Covers", icon: Sun },
    { path: "/brand-showcase", label: "Brand Showcase", icon: Star },
  ];

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
                Back
              </Button>
            )}
            
            {/* Larger Logo with Link */}
            <Link to="/" className="flex items-center">
              <div className="w-20 h-20 rounded-md bg-background p-2 flex items-center justify-center border">
                <img 
                  src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2-optimized.png"
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
            <div className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={location.pathname === item.path ? "default" : "ghost"} 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* User Actions */}
          {!isContentEditor && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={openCart}
                className="flex items-center gap-2"
              >
                <CartIcon className="w-4 h-4" />
                Cart
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={openOrders}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Orders
              </Button>

              {!user ? (
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              ) : (
                profile?.role === 'main_admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAdminAccess}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
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