
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShoppingCartProvider } from "@/components/ShoppingCartProvider";
import RightNavigation from "@/components/RightNavigation";

import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import EcommerceTemplate from "./pages/EcommerceTemplate";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProcurementSystem from "./pages/ProcurementSystem";
import PoolDetails from "./pages/PoolDetails";
import ContentEditor from "./pages/ContentEditor";
import ReferralPortal from "./pages/ReferralPortal";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <ShoppingCartProvider>
      <RightNavigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route 
          path="/procurement" 
          element={<ProcurementSystem />} 
        />
        <Route path="/referral" element={<ReferralPortal />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAuth={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/content-editor" 
          element={
            <ProtectedRoute requiredRoles={['main_admin']}>
              <ContentEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/template" 
          element={
            <ProtectedRoute requiredRoles={['main_admin']}>
              <EcommerceTemplate />
            </ProtectedRoute>
          } 
        />
        <Route path="/pool/:poolId" element={<PoolDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ShoppingCartProvider>
  </AuthProvider>
);

export default App;
