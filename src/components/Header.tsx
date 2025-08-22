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
          {/* Company Logo - Top Left on Mobile, Top Right on Desktop */}
          <img 
            src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
            alt="Wonderlands Professional Logo" 
            className={`${isContentEditor ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24' : 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'} order-1 sm:order-2`}
          />
          
          {/* Navigation and Auth Buttons */}
          <div className={`flex items-center gap-2 order-2 sm:order-1 ${isContentEditor ? 'opacity-0 pointer-events-none' : ''}`}>
            {!isContentEditor && (
              <>
                {/* Catalog Navigation Button */}
                <Button 
                  variant="gradient" 
                  size="sm" 
                  className="transition-all duration-300 bg-gradient-to-r from-primary to-teal text-white hover:scale-105 text-xs sm:text-sm"
                  onClick={() => {
                    const poolSection = document.getElementById('pool-catalog');
                    if (poolSection) {
                      poolSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  title="Browse our pool catalog"
                >
                  <span className="hidden sm:inline">View Catalog</span>
                  <span className="sm:hidden">Pools</span>
                </Button>

                <Link to="/procurement">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-xs sm:text-sm"
                    title="Access procurement and job posting system"
                  >
                    <Briefcase className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Procurement</span>
                    <span className="sm:hidden">Jobs</span>
                  </Button>
                </Link>
              </>
            )}
            
            {!isContentEditor && (
              <>
                {user ? (
                  <>
                    <Link to="/dashboard">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-xs sm:text-sm"
                        title="View your personal dashboard"
                      >
                        <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                        <span className="sm:hidden">Profile</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-xs sm:text-sm"
                      onClick={signOut}
                      title="Sign out of your account"
                    >
                      <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Logout</span>
                      <span className="sm:hidden">Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-xs sm:text-sm"
                        title="Sign in to your account"
                      >
                        <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Sign In</span>
                        <span className="sm:hidden">Login</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-xs sm:text-sm"
                      onClick={handleAdminAccess}
                      title="Access admin dashboard"
                    >
                      <Shield className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Admin Dashboard</span>
                      <span className="sm:hidden">Admin</span>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
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