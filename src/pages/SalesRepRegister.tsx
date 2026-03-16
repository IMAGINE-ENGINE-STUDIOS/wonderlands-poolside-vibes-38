import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Lock, User, ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
});

const SalesRepRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    whatsappOptIn: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            whatsapp_opt_in: formData.whatsappOptIn,
            role: 'sales_rep',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Error",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account, then access your sales dashboard.",
      });

      // Redirect to sales rep dashboard after successful registration
      setTimeout(() => navigate('/sales-rep'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 via-blue-950 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="holographic-panel neon-border-cyan">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <UserPlus className="h-12 w-12 text-cyan-400 neon-glow-cyan" />
            </div>
            <CardTitle className="text-2xl font-bold text-center text-cyan-300 font-mono neon-glow-cyan">
              ⬡ SALES REP REGISTRATION ⬡
            </CardTitle>
            <CardDescription className="text-center text-cyan-400/60 font-mono">
              Join our sales team to manage client relationships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-cyan-300 font-mono">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 holographic-panel border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-cyan-300 font-mono">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 holographic-panel border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-300 font-mono">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 holographic-panel border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
                    placeholder="sales@wonderlands.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-cyan-300 font-mono">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 holographic-panel border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
                    placeholder="(555) 123-4567"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                <Checkbox
                  id="whatsappOptIn"
                  checked={formData.whatsappOptIn}
                  onCheckedChange={(checked) => setFormData({ ...formData, whatsappOptIn: !!checked })}
                  className="mt-0.5 border-cyan-500/40 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label htmlFor="whatsappOptIn" className="text-cyan-300/80 font-mono text-xs leading-relaxed cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5 inline mr-1 text-green-400" />
                  I'd like to receive status updates via WhatsApp. Standard messaging rates may apply.
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-cyan-300 font-mono">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 holographic-panel border-cyan-500/30 text-cyan-300 placeholder:text-cyan-400/40 font-mono"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-cyan-400/60 font-mono">
                  Minimum 8 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full holographic-panel neon-border-cyan text-cyan-300 hover:bg-cyan-500/20 font-mono text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-300 mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register as Sales Rep
                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-cyan-400/60 font-mono">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-cyan-300 hover:text-cyan-200 underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-cyan-400/60 font-mono">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesRepRegister;
