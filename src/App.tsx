
import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShoppingCartProvider } from "@/components/ShoppingCartProvider";
import RightNavigation from "@/components/RightNavigation";

// Eager load critical components
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load non-critical route components with better chunking
const AdminDashboard = lazy(() => 
  import("./pages/AdminDashboard").then(module => ({ default: module.default }))
);
const EcommerceTemplate = lazy(() => 
  import("./pages/EcommerceTemplate").then(module => ({ default: module.default }))
);
const AuthPage = lazy(() => 
  import("./components/AuthPage").then(module => ({ default: module.default }))
);
const ResetPasswordPage = lazy(() => 
  import("./pages/ResetPasswordPage").then(module => ({ default: module.default }))
);
const ProcurementSystem = lazy(() => 
  import("./pages/ProcurementSystem").then(module => ({ default: module.default }))
);
const PoolDetails = lazy(() => 
  import("./pages/PoolDetails").then(module => ({ default: module.default }))
);
const ContentEditor = lazy(() => 
  import("./pages/ContentEditor").then(module => ({ default: module.default }))
);
const ReferralPortal = lazy(() => 
  import("./pages/ReferralPortal").then(module => ({ default: module.default }))
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => {
  // Runtime check for production debugging
  useEffect(() => {
    if (import.meta.env.PROD && window.location.pathname.includes('/src/')) {
      console.error('🚨 Production app is trying to load source files:', window.location.pathname);
    }
  }, []);

  return (
    <AuthProvider>
      <ShoppingCartProvider>
        <RightNavigation />
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </ShoppingCartProvider>
    </AuthProvider>
  );
};

export default App;
