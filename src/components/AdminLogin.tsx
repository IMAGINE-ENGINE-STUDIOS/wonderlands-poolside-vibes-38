import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Shield } from "lucide-react";
import { validateEmail, rateLimiter, generateCSRFToken } from "@/utils/validation";

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (adminData: any) => void;
}

const AdminLogin = ({ isOpen, onClose, onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        toast({
          title: "Invalid Email",
          description: emailValidation.errors.join(', '),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check rate limiting
      if (!rateLimiter.isAllowed(email, 5, 15 * 60 * 1000)) {
        toast({
          title: "Too Many Attempts",
          description: "Please wait 15 minutes before trying again",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // For demo purposes, check against demo credentials
      const demoCredentials = [
        { email: "admin@wonderlandspools.com", password: "admin123!", role: "super_admin" },
        { email: "rikicot@hotmail.com", password: "Crrrmg77", role: "main_admin" }
      ];

      const matchedCredential = demoCredentials.find(
        cred => cred.email === emailValidation.sanitizedValue && cred.password === password
      );

      if (!matchedCredential) {
        toast({
          title: "Login Failed",
          description: "Invalid credentials or account not found",
          variant: "destructive",
        });
        return;
      }

      const adminData = {
        id: crypto.randomUUID(),
        email: matchedCredential.email,
        role: matchedCredential.role,
        created_at: new Date().toISOString()
      };
      
      // Generate secure session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      // Store session in sessionStorage for demo
      const adminSession = {
        token: sessionToken,
        adminData,
        expiresAt: expiresAt.toISOString()
      };
      
      sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${adminData.role}!`,
      });

      onLoginSuccess(adminSession);
      onClose();
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Dashboard Login
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">Administrator Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Super Admin: admin@wonderlandspools.com / admin123!</p>
                <p className="text-xs text-muted-foreground">Main Admin: rikicot@hotmail.com / Crrrmg77</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLogin;
