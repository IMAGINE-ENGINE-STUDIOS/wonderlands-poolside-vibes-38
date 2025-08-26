
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import HorizontalNavigation from "@/components/HorizontalNavigation";

import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import EcommerceTemplate from "./pages/EcommerceTemplate";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProcurementSystem from "./pages/ProcurementSystem";
import PoolDetails from "./pages/PoolDetails";
import ContentEditor from "./pages/ContentEditor";
import ProtectedRoute from "./components/ProtectedRoute";
import PoolFinishes from "./pages/PoolFinishes";
import Pavers from "./pages/Pavers";
import ScreenEnclosures from "./pages/ScreenEnclosures";
import AutomaticCovers from "./pages/AutomaticCovers";
import BrandShowcase from "./pages/BrandShowcase";
import Pools from "./pages/Pools";
import QuotePreview from "./pages/QuotePreview";

const App = () => (
  <AuthProvider>
    <HorizontalNavigation />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route 
        path="/procurement" 
        element={<ProcurementSystem />} 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRoles={['main_admin']}>
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
      <Route path="/pool-finishes" element={<PoolFinishes />} />
      <Route path="/pavers" element={<Pavers />} />
      <Route path="/screen-enclosures" element={<ScreenEnclosures />} />
      <Route path="/automatic-covers" element={<AutomaticCovers />} />
      <Route path="/brand-showcase" element={<BrandShowcase />} />
      <Route path="/pools" element={<Pools />} />
      <Route path="/quote/:id" element={<QuotePreview />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

export default App;
