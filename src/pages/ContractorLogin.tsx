import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HardHat, Mail, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ContractorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if contractor exists with this email
      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !contractor) {
        toast.error("No contractor account found with this email");
        setLoading(false);
        return;
      }

      if (contractor.status === 'pending') {
        toast.info("Your account is pending approval. Please wait for admin review.");
        setLoading(false);
        return;
      }

      if (contractor.status === 'rejected') {
        toast.error("Your contractor application was not approved.");
        setLoading(false);
        return;
      }

      if (contractor.status === 'suspended') {
        toast.error("Your contractor account has been suspended. Please contact support.");
        setLoading(false);
        return;
      }

      // Navigate to contractor profile
      toast.success("Welcome back!");
      navigate(`/contractor-profile/${contractor.id}`);
    } catch (err) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-950/10 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-emerald-500/30 bg-card/80 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-4">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
            Contractor Login
          </CardTitle>
          <CardDescription>
            Access your contractor dashboard and manage your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't have a contractor account?
            </p>
            <Link to="/contractor-registration">
              <Button variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                Register as Contractor
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorLogin;
