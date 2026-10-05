
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

/** Sign-in portals shown on /auth. All share one login; the account's role picks the real destination. */
type PortalId = 'company' | 'customer' | 'admin' | 'sales';
const PORTALS: { id: PortalId; label: string; note: string; path: string }[] = [
  { id: 'company', label: 'Company', note: 'Contractors & businesses', path: '/workspace' },
  { id: 'customer', label: 'Customer', note: 'Homeowners', path: '/account' },
  { id: 'admin', label: 'Admin', note: 'Wonderlands Command Center', path: '/admin' },
  { id: 'sales', label: 'Sales team', note: 'Sales representatives', path: '/sales-rep' },
];
/** Investor demo account — sees the Command Center layout with no company data. */
const INVESTOR_DEMO_EMAIL = 'investor.admin@wonderlandsworld.com';

export const destinationFor = (role: string | undefined, email: string | undefined, requested?: string) => {
  if (email?.toLowerCase() === INVESTOR_DEMO_EMAIL) return '/demo/command-center';
  if (role === 'sales_rep') return '/sales-rep';
  if (role === 'main_admin') return requested || '/admin';
  if (role === 'supplier' || role === 'installer') return requested && !requested.startsWith('/admin') ? requested : '/workspace';
  return requested && !requested.startsWith('/admin') ? requested : '/account';
};

const AuthPage = () => {
  const { signIn, signUp, signInWithGoogle, signInWithMicrosoft, signOut, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Intended destination (set by ProtectedRoute). Without one, staff go to /admin and customers home.
  const requested: string | undefined = location.state?.from?.pathname;

  const [portal, setPortal] = useState<PortalId>(() => {
    const t = new URLSearchParams(window.location.search).get('portal') as PortalId | null;
    return PORTALS.some(p => p.id === t) ? (t as PortalId) : 'company';
  });
  const [signInNote, setSignInNote] = useState<string | null>(null);
  const [justSignedIn, setJustSignedIn] = useState(false);

  // Redirect once the profile is loaded — by role, so customers never land on the staff-only /admin.
  useEffect(() => {
    if (!loading && user && profile) {
      const dest = destinationFor(profile.role as string, user.email, requested);
      if (justSignedIn) {
        const picked = PORTALS.find(p => p.id === portal)!;
        if (!dest.startsWith(picked.path)) {
          toast({ title: 'Signed in', description: `This account opens ${PORTALS.find(p => dest.startsWith(p.path))?.label ?? 'your account'}.` });
        }
      }
      navigate(dest, { replace: true });
    }
  }, [user, profile, loading, navigate, requested]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setSignInNote(null);
    if (!signInData.email.trim() || !signInData.password) {
      setSignInNote('Enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signIn(signInData.email.trim(), signInData.password);
      if (error) {
        setSignInNote(/invalid/i.test(error.message) ? 'That email and password don’t match. Check them or use “Forgot your password?”.' : error.message);
      } else {
        setJustSignedIn(true);
      }
    } catch {
      setSignInNote('Something went wrong. Please try again.');
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
      const dest = signUpData.role === 'consumer' ? (requested && !requested.startsWith('/admin') ? requested : '/account') : '/workspace';
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
                const dest = destinationFor(profile?.role as string, user.email, requested);
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
              {/* Portal picker — one sign-in for everyone; the account's role decides the destination. */}
              <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-2">
                {PORTALS.map(p => (
                  <button key={p.id} type="button" role="radio" aria-checked={portal === p.id} onClick={() => setPortal(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${portal === p.id ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                    <span className="block text-sm font-semibold text-black">{p.label}</span>
                    <span className="block text-[11px] text-neutral-600 leading-snug">{p.note}</span>
                  </button>
                ))}
              </div>

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
                {signInNote && <div role="alert" className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">{signInNote}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : `Sign in to ${PORTALS.find(p => p.id === portal)?.label}`}
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