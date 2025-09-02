import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Briefcase, Moon, Sun, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import FixedEditorStudio from "./FixedEditorStudio";

const Header = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showEditorStudio, setShowEditorStudio] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isContentEditor = location.pathname === '/content-editor';

  // Dark mode toggle effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for editor studio open requests from search
  useEffect(() => {
    const handleOpenEditor = (e: any) => {
      const product = e.detail?.product;
      setPendingProduct(product || null);
      setShowEditorStudio(true);
    };

    window.addEventListener('openEditorStudio', handleOpenEditor);
    return () => window.removeEventListener('openEditorStudio', handleOpenEditor);
  }, []);

  // When editor opens and there is a pending product, forward to studio
  useEffect(() => {
    if (showEditorStudio && pendingProduct) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('editorStudioAddProduct', { detail: { product: pendingProduct } }));
        setPendingProduct(null);
      }, 100);
    }
  }, [showEditorStudio, pendingProduct]);

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
      {/* Dark Mode Toggle - Top Left Corner */}
      {!showEditorStudio && (
        <div className="fixed top-4 left-24 sm:left-28 md:left-32 z-[100]">
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            variant="outline"
            size="sm"
            className="transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <header className={`fixed top-0 left-0 right-0 p-2 sm:p-4 ${
        isContentEditor ? 'z-30 pointer-events-none' : 'z-50'
      }`}>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Company Logo - Left Corner, 20% Larger */}
          <img 
            src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
            alt="Wonderlands Professional Logo" 
            className={`${
              isContentEditor 
                ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28' 
                : 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24'
            } transition-all duration-300`}
          />
          
          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {/* When Editor Studio is open: show only Home button */}
            {showEditorStudio ? (
              <Button 
                variant="default" 
                size="sm" 
                className="transition-all duration-300 hover:scale-105"
                title="Go Home"
                onClick={() => {
                  setShowEditorStudio(false);
                  navigate('/');
                }}
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
            ) : (
              // Authentication-based navigation
              !isContentEditor && (
                <>
                  {!user ? (
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
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* User menu based on role */}
                      {profile?.role === 'main_admin' && (
                        <Link to="/admin">
                          <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                            <Shield className="w-4 h-4 mr-1" />
                            Admin
                          </Button>
                        </Link>
                      )}
                      
                      {(profile?.role === 'supplier' || profile?.role === 'installer') && (
                        <Link to="/procurement">
                          <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                            <Briefcase className="w-4 h-4 mr-1" />
                            Jobs
                          </Button>
                        </Link>
                      )}
                      
                      <Button 
                        onClick={signOut}
                        variant="ghost" 
                        size="sm" 
                        className="transition-all duration-300 hover:scale-105"
                        title="Sign out"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      </header>

      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <FixedEditorStudio
        isOpen={showEditorStudio}
        onClose={() => setShowEditorStudio(false)}
      />
    </>
  );
};

export default Header;