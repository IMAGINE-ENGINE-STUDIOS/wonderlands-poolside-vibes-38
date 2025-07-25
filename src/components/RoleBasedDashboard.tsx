import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainAdminDashboard from './dashboards/MainAdminDashboard';
import SupplierDashboard from './dashboards/SupplierDashboard';
import ConsumerDashboard from './dashboards/ConsumerDashboard';

const RoleBasedDashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  switch (profile.role) {
    case 'main_admin':
      return <MainAdminDashboard />;
    case 'supplier':
      return <SupplierDashboard />;
    case 'consumer':
      return <ConsumerDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Unknown Role</h2>
            <p className="text-muted-foreground">Your account role is not recognized.</p>
          </div>
        </div>
      );
  }
};

export default RoleBasedDashboard;