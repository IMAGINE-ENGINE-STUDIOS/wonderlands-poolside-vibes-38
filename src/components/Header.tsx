import * as React from "react";
const { useState, useEffect } = React;
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OptimizedImage } from "./OptimizedImage";
// Single sign-in gateway: everyone uses /auth (the old demo-password admin pop-up was removed).
const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();
  const isContentEditor = location.pathname === '/content-editor';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return <>
      <div className="fixed top-4 left-24 sm:left-28 md:left-32 z-[100]">
        <Button onClick={() => setIsDarkMode(!isDarkMode)} variant="outline" size="sm" title="Toggle Dark Mode" className="transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm mx-0 px-px">
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <header className={`fixed top-0 left-0 right-0 p-2 sm:p-4 ${isContentEditor ? 'z-30 pointer-events-none' : 'z-50'}`}>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <OptimizedImage src="/wonderlands-branding/02222bf9-70e0-46ee-9772-cacbabb3e9c2.webp" alt="Wonderlands Professional Logo" className={`${isContentEditor ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28' : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'} transition-all duration-300`} sizeConfig="logoLarge" priority={true} />
          <div className="flex items-center gap-2">
            {!isContentEditor && !user && <Button asChild variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <Link to="/auth">Sign in</Link>
              </Button>}
            {!isContentEditor && user && <Button asChild variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
                <Link to={profile?.role === 'main_admin' || profile?.role === 'supplier' ? '/admin' : (profile?.role as string) === 'sales_rep' ? '/sales-rep' : '/account'}>My account</Link>
              </Button>}
          </div>
        </div>
      </header>
    </>;
};
export default Header;
