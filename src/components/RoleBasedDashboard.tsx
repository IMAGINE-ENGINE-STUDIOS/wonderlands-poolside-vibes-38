import React from 'react';
import MainAdminDashboard from './dashboards/MainAdminDashboard';

const RoleBasedDashboard = () => {
  // Remove authentication requirements - make dashboard accessible to everyone
  return <MainAdminDashboard />;
};

export default RoleBasedDashboard;