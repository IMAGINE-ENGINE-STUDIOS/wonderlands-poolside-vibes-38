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

  const handleLoginSuccess = (adminData: any) => {
    // Store admin session and redirect to dashboard
    localStorage.setItem('adminSession', JSON.stringify(adminData));
    window.location.href = '/admin';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-end gap-4">
          {/* Admin Dashboard Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="transition-all duration-300 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
            onClick={handleAdminAccess}
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Button>
          
          {/* Company Logo - Top Right Corner */}
          <img 
            src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
            alt="Wonderlands Professional Logo" 
            className="w-16 h-16 md:w-20 md:h-20"
          />
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