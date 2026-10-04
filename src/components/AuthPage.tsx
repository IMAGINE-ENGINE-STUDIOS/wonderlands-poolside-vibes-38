
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PasswordResetModal from '@/components/PasswordResetModal';

const AuthPage = () => {
  const { signIn, signUp, signInWithGoogle, signInWithMicrosoft, signOut, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Intended destination (set by ProtectedRoute). Without one, staff go to /admin and customers home.
  const requested: string | undefined = location.state?.from?.pathname;

  // Redirect once the profile is loaded — by role, so customers never land on the staff-only /admin.
  useEffect(() => {
    if (!loading && user && profile) {
      const role = profile.role as string;
      if (role === 'sales_rep') {
        navigate('/sales-rep', { replace: true });
      } else if (role === 'main_admin' || role === 'supplier') {
        navigate(requested || '/admin', { replace: true });
      } else {
        navigate(requested && !requested.startsWith('/admin') ? requested : '/account', { replace: true });
      }
    }
  }, [user, profile, loading, navigate, requested]);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: (new URLSearchParams(window.location.search).get('type') === 'business' ? 'supplier' : 'consumer') as 'consumer' | 'supplier' | 'installer',
    companyName: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "You have been signed in successfully!"
        });
        // Redirect happens in the effect above once the profile (role) loads.
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [signUpError, setSignUpError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    const email = signUpData.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSignUpError('Please enter a valid email address.');
      return;
    }
    if (signUpData.password.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }
    if ((signUpData.role === 'supplier' || signUpData.role === 'installer') && !signUpData.companyName.trim()) {
      setSignUpError('Company name is required for business accounts.');
      return;
    }

    setIsLoading(true);
    try {
      // Names are optional — fall back to the part of the email before "@".
      const fallback = email.split('@')[0];
      const userData = {
        first_name: signUpData.firstName.trim() || fallback,
        last_name: signUpData.lastName.trim(),
        role: signUpData.role,
        // Business sign-ups get their own private company workspace (created server-side).
        ...((signUpData.role === 'supplier' || signUpData.role === 'installer') && { account_type: 'business', company_name: signUpData.companyName.trim() })
      };

      const { error } = await signUp(email, signUpData.password, userData);
      if (error) {
        setSignUpError(error.message);
        return;
      }
      toast({ title: 'Account created', description: 'Taking you to your account…' });
      // If no session came back (email confirmation on), sign in directly so the user lands on their page.
      await signIn(email, signUpData.password);
      const dest = signUpData.role === 'consumer' ? (requested && !requested.startsWith('/admin') ? requested : '/account') : '/admin';
      navigate(dest, { replace: true });
    } catch {
      setSignUpError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    try {
      const { error } = provider === 'google' ?
      await signInWithGoogle() :
      await signInWithMicrosoft();

      if (error) {
        toast({
          title: "OAuth Error",
          description: error.message,
          variant: "destructive"
        });
      }
      // Note: OAuth redirects, so we don't show success toast here
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during OAuth login.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>);
  }

  // Show already-logged-in state instead of immediately redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Already Signed In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              You are signed in as <strong>{user.email}</strong>
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => {
                const r = profile?.role as string;
                const dest = r === 'sales_rep' ? '/sales-rep' : (r === 'main_admin' || r === 'supplier') ? '/admin' : (requested && !requested.startsWith('/admin') ? requested : '/account');
                navigate(dest, { replace: true });
              }}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={async () => {
                await signOut();
              }}>
                Sign Out & Switch Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to Wonderland</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={new URLSearchParams(window.location.search).get('mode') === 'signup' ? 'signup' : 'signin'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              {/* OAuth Buttons */}
              {/* OAuth buttons hidden for now */}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required />
                  
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required />
                  
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowPasswordReset(true)}>
                    
                    Forgot your password?
                  </Button>
                </div>
              </form>

              {/* Demo Credentials */}
              







              
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} noValidate className="space-y-4">
                {signUpError && <div role="alert" className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">{signUpError}</div>}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="First name (optional)"
                      value={signUpData.firstName}
                      onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                      />
                    
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Last name (optional)"
                      value={signUpData.lastName}
                      onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                      />
                    
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required />
                  
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={signUpData.role} onValueChange={(value: 'consumer' | 'supplier' | 'installer') => setSignUpData({ ...signUpData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">Homeowner</SelectItem>
                      <SelectItem value="supplier">Business / Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(signUpData.role === 'supplier' || signUpData.role === 'installer') &&
                <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                    id="company-name"
                    placeholder="Enter your company name"
                    value={signUpData.companyName}
                    onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })}
                    required />
                  
                  </div>
                }
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required />
                  
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    required />
                  
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)} />
      
    </div>);

};

export default AuthPage;