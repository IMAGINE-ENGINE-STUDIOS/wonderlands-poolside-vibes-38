import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Briefcase } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLogin from "./AdminLogin";

const Header = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const isContentEditor = location.pathname === '/content-editor';

  const handleAdminAccess = () => {
    setShowAdminLogin(true);
  };

  const handleLoginSuccess = (adminSession: any) => {
    // Session is already stored securely in AdminLogin component
    // Just redirect to dashboard
    window.location.href = '/admin';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Company Logo - Left Corner, 20% Larger */}
          <img 
            src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2-optimized.png"
            alt="Wonderlands Professional Logo" 
            className={`${
              isContentEditor 
                ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28' 
                : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
            } transition-all duration-300`}
          />
          
          {/* Navigation Links */}
          {!isContentEditor && (
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/pool-finishes">
                <Button variant="ghost" size="sm">Pool Finishes</Button>
              </Link>
              <Link to="/pavers">
                <Button variant="ghost" size="sm">Pavers</Button>
              </Link>
              <Link to="/screen-enclosures">
                <Button variant="ghost" size="sm">Screen Enclosures</Button>
              </Link>
              <Link to="/automatic-covers">
                <Button variant="ghost" size="sm">Automatic Covers</Button>
              </Link>
              <Link to="/brand-showcase">
                <Button variant="ghost" size="sm">Brand Showcase</Button>
              </Link>
            </nav>
          )}
          
          {/* Simplified Auth - Only when not logged in and not in content editor */}
          {!isContentEditor && !user ? (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="transition-all duration-300 hover:scale-105"
                  title="Sign in to your account"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <AdminLogin 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Header;