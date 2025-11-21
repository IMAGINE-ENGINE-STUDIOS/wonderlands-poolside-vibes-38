import * as React from "react";
const { useState, useEffect } = React;
import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Briefcase, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OptimizedImage } from "./OptimizedImage";
import AdminLogin from "./AdminLogin";
const Header = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const location = useLocation();
  const isContentEditor = location.pathname === '/content-editor';

  // Dark mode toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const handleAdminAccess = () => {
    setShowAdminLogin(true);
  };
  const handleLoginSuccess = (adminSession: any) => {
    // Session is already stored securely in AdminLogin component
    // Just redirect to dashboard
    window.location.href = '/admin';
  };
  return <>
      {/* Dark Mode Toggle - Top Left Corner */}
      <div className="fixed top-4 left-24 sm:left-28 md:left-32 z-[100]">
        <Button onClick={() => setIsDarkMode(!isDarkMode)} variant="outline" size="sm" title="Toggle Dark Mode" className="transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm mx-0 px-px">
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <header className={`fixed top-0 left-0 right-0 p-2 sm:p-4 ${isContentEditor ? 'z-30 pointer-events-none' : 'z-50'}`}>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Company Logo - Left Corner, 20% Larger */}
          <OptimizedImage src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png" alt="Wonderlands Professional Logo" className={`${isContentEditor ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'} transition-all duration-300`} sizeConfig="logoLarge" priority={true} />
          
          {/* Navigation Menu */}
          {!isContentEditor}
          
          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* Simplified Auth - Only when not logged in and not in content editor */}
            {!isContentEditor && !user && <Link to="/auth">
                
              </Link>}
          </div>
        </div>
      </header>

      <AdminLogin isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLoginSuccess={handleLoginSuccess} />
    </>;
};
export default Header;