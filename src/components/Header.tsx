import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLogin from "./AdminLogin";

const Header = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 order-1 sm:order-2"
          />
          
          {/* Admin Dashboard Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-xs sm:text-sm order-2 sm:order-1"
            onClick={handleAdminAccess}
          >
            <Shield className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Admin Dashboard</span>
            <span className="sm:hidden">Admin</span>
          </Button>
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