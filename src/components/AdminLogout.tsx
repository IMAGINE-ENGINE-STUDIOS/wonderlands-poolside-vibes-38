import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { clearSecureSession } from "@/utils/validation";

interface AdminLogoutProps {
  adminData?: any;
  onLogout: () => void;
}

const AdminLogout = ({ adminData, onLogout }: AdminLogoutProps) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Get current session
      const sessionData = sessionStorage.getItem('adminSession');
      
      if (sessionData && adminData) {
        const session = JSON.parse(sessionData);
        
        // Delete session from database
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('token', session.token);
        
        // Log the logout action
        await supabase.rpc('log_admin_action', {
          p_admin_user_id: adminData.id,
          p_action: 'logout',
          p_details: { ip_address: '127.0.0.1', user_agent: navigator.userAgent }
        });
      }
      
      // Clear secure session
      clearSecureSession();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      
      onLogout();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear session even if server cleanup fails
      clearSecureSession();
      onLogout();
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default AdminLogout;