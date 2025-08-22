
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import EcommerceTemplate from "./pages/EcommerceTemplate";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/AuthPage";
import ProcurementSystem from "./pages/ProcurementSystem";
import PoolDetails from "./pages/PoolDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/procurement" element={<ProcurementSystem />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/template" element={<EcommerceTemplate />} />
            <Route path="/pool/:poolId" element={<PoolDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
