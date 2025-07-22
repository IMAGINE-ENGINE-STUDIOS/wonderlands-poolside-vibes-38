import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 right-0 z-50 p-4">
      <div className="flex items-center gap-4">
        {/* Company Logo */}
        <img 
          src="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
          alt="Wonderlands Professional Logo" 
          className="w-16 h-16 md:w-20 md:h-20"
        />
        
        {/* Admin Dashboard Link */}
        <Link to="/admin">
          <Button 
            variant="outline" 
            size="sm" 
            className="transition-all duration-300"
          >
            <Shield className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;