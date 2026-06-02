
import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/contexts/AuthContext';

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

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
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
