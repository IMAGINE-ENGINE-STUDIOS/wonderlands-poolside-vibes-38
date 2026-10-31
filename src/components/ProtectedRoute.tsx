
import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/contexts/AuthContext';
import { requestLogin } from '@/components/auth/LoginModal';

/**
 * In place of a protected feature while signed out: the login modal fires
 * on arrival (on top, not a page hunt) and a button reopens it if dismissed.
 */
const LoginGate = () => {
  React.useEffect(() => {
    requestLogin('Log in to open this — it takes a few seconds and you will stay right here.');
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Members area</p>
        <h1 className="mt-2 font-serif text-2xl font-light">This feature needs a log in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The login pops up right here — no hunting for a sign-in page. Once you are in, this opens automatically.
        </p>
        <button
          onClick={() => requestLogin('Log in to open this — it takes a few seconds and you will stay right here.')}
          className="mt-5 w-full rounded-full bg-foreground py-2.5 text-sm font-semibold text-background transition hover:opacity-85"
        >
          Log in
        </button>
        <div>
          <Link to="/" className="mt-3 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Back to the site
          </Link>
        </div>
      </div>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireAuth = true,
  requireEmailVerification = false 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required — the login pops up ON TOP of the
  // feature instead of bouncing the user away to find a login page
  // (founder directive 2026-10-31). Signing in re-renders this route with a
  // user and the feature simply opens.
  if (requireAuth && !user) {
    return <LoginGate />;
  }

  // Check if email verification is required
  if (requireEmailVerification && user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">
              Email Verification Required
            </h2>
            <p className="text-amber-700 mb-4">
              Please check your email and click the verification link to access this page.
            </p>
            <p className="text-sm text-amber-600">
              Didn't receive the email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && (!profile || !requiredRoles.includes(profile.role as any))) {
    // Redirect sales reps to their dashboard if they try to access admin pages
    if (profile?.role === 'sales_rep' as any && requiredRoles.includes('main_admin')) {
      return <Navigate to="/sales-rep" replace />;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Access Denied
            </h2>
            <p className="text-red-700 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-red-600">
              Required role: {requiredRoles.join(', ')}
              {profile && (
                <>
                  <br />
                  Your role: {profile.role}
                </>
              )}
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if account is active for regular users
  if (profile && !profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Account Deactivated
            </h2>
            <p className="text-gray-700 mb-4">
              Your account has been deactivated. Please contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
