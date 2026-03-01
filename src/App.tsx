import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectTypeProvider } from "@/contexts/ProjectTypeContext";

import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import RightNavigation from "@/components/RightNavigation";
import { AIAssistantChat } from "@/components/ai/AIAssistantChat";

// Eager load critical components
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load non-critical route components
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TwilioPOC = lazy(() => import("./pages/TwilioPOC"));
const EcommerceTemplate = lazy(() => import("./pages/EcommerceTemplate"));
const AuthPage = lazy(() => import("./components/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProcurementSystem = lazy(() => import("./pages/ProcurementSystem"));
const WonderlandsStudio = lazy(() => import("./pages/WonderlandsStudio"));
const ContentEditor = lazy(() => import("./pages/ContentEditor"));
const ReferralPortal = lazy(() => import("./pages/ReferralPortal"));
const QuoteDetailPage = lazy(() => import("./pages/QuoteDetailPage"));
const InvoiceDetailPage = lazy(() => import("./pages/InvoiceDetailPage"));
const QuotationTool = lazy(() => import("./pages/QuotationTool"));
const PoolCalculatorPage = lazy(() => import("./pages/PoolCalculatorPage"));
const SalesRepRegister = lazy(() => import("./pages/SalesRepRegister"));
const SalesRepLogin = lazy(() => import("./pages/SalesRepLogin"));
const SalesRepDashboard = lazy(() => import("./pages/SalesRepDashboard"));
const ContractorRegistration = lazy(() => import("./pages/ContractorRegistration"));
const ContractorProfile = lazy(() => import("./pages/ContractorProfile"));
const ContractorLogin = lazy(() => import("./pages/ContractorLogin"));
const DesignStudio = lazy(() => import("./pages/DesignStudio"));
const InvestorDeck = lazy(() => import("./pages/InvestorDeck"));
const ConsentPage = lazy(() => import("./pages/ConsentPage"));
const ApiDocumentation = lazy(() => import("./pages/ApiDocumentation"));
const SharedProjectView = lazy(() => import("./pages/SharedProjectView"));
const InternalProjectView = lazy(() => import("./pages/InternalProjectView"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

  return (
    <AuthProvider>
      <ProjectTypeProvider>
          <AIAssistantProvider>
            <RightNavigation />
            <AIAssistantChat />
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
               path="/admin/quotes/:quoteId" 
               element={
                 <ProtectedRoute requireAuth={true}>
                   <QuoteDetailPage />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/admin/invoices/:invoiceId" 
               element={
                 <ProtectedRoute requireAuth={true}>
                   <InvoiceDetailPage />
                 </ProtectedRoute>
               } 
             />
            {/* Public invoice view route - no auth required */}
            <Route path="/invoice/:invoiceId" element={<InvoiceDetailPage />} />
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
            <Route path="/quote" element={<QuotationTool />} />
            <Route path="/pool-calculator" element={<PoolCalculatorPage />} />
            <Route path="/wonderlands-studio" element={<WonderlandsStudio />} />
            <Route path="/sales-rep-register" element={<SalesRepRegister />} />
            <Route path="/sales-rep-login" element={<SalesRepLogin />} />
            <Route 
              path="/sales-rep" 
              element={
                <ProtectedRoute requiredRoles={['sales_rep' as any]}>
                  <SalesRepDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/contractor-registration" element={<ContractorRegistration />} />
            <Route path="/contractor-profile/:id" element={<ContractorProfile />} />
            <Route path="/contractor-login" element={<ContractorLogin />} />
            <Route path="/design-studio" element={<DesignStudio />} />
            <Route path="/deck" element={<InvestorDeck />} />
            <Route path="/twilio-poc" element={<TwilioPOC />} />
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/api" element={<ApiDocumentation />} />
            <Route path="/project/:token" element={<SharedProjectView />} />
            <Route path="/project/internal/:token" element={<InternalProjectView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </AIAssistantProvider>
      </ProjectTypeProvider>
    </AuthProvider>
  );
};

export default App;
