
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShoppingCartProvider } from "@/contexts/ShoppingCartContext";
import Index from "./pages/Index";
import Pools from "./pages/Pools";
import Spas from "./pages/Spas";
import TanningLedges from "./pages/TanningLedges";
import Pavers from "./pages/Pavers";
import ScreenEnclosures from "./pages/ScreenEnclosures";
import AutomaticCovers from "./pages/AutomaticCovers";
import PoolFinishes from "./pages/PoolFinishes";
import AdminDashboard from "./pages/AdminDashboard";
import ContentEditor from "./pages/ContentEditor";
import BrandShowcase from "./pages/BrandShowcase";
import EcommerceTemplate from "./pages/EcommerceTemplate";
import ProcurementSystem from "./pages/ProcurementSystem";
import PoolDetails from "./pages/PoolDetails";
import QuotePreview from "./pages/QuotePreview";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthPage from "./components/AuthPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ShoppingCartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pools" element={<Pools />} />
              <Route path="/spas" element={<Spas />} />
              <Route path="/tanning-ledges" element={<TanningLedges />} />
              <Route path="/pavers" element={<Pavers />} />
              <Route path="/screen-enclosures" element={<ScreenEnclosures />} />
              <Route path="/automatic-covers" element={<AutomaticCovers />} />
              <Route path="/pool-finishes" element={<PoolFinishes />} />
              <Route path="/pool/:id" element={<PoolDetails />} />
              <Route path="/quote-preview" element={<QuotePreview />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/content-editor" element={
                <ProtectedRoute>
                  <ContentEditor />
                </ProtectedRoute>
              } />
              <Route path="/brand-showcase" element={<BrandShowcase />} />
              <Route path="/ecommerce-template" element={<EcommerceTemplate />} />
              <Route path="/procurement" element={<ProcurementSystem />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ShoppingCartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
