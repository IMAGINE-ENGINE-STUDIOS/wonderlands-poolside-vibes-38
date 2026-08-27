import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollRestoration from "./components/ScrollRestoration";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectTypeProvider } from "@/contexts/ProjectTypeContext";

import RightNavigation from "@/components/RightNavigation";
import { AIAssistantChat } from "@/components/ai/AIAssistantChat";

// Eager load critical components
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";

const lazyWithRetry = <T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  cacheKey: string
) => lazy(async () => {
  try {
    const component = await importer();
    sessionStorage.removeItem(cacheKey);
    return component;
  } catch (error) {
    const hasRetried = sessionStorage.getItem(cacheKey) === 'true';

    if (!hasRetried && typeof window !== 'undefined') {
      sessionStorage.setItem(cacheKey, 'true');
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      window.location.reload();
    }

    throw error;
  }
});

// Lazy load non-critical route components
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"), 'admin-dashboard-import-retry');
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
const StudioShowroom = lazy(() => import("./pages/StudioShowroom"));
const StudioLanding = lazy(() => import("./pages/StudioLanding"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const InvestorDeck = lazy(() => import("./pages/InvestorDeck"));
const ConsentPage = lazy(() => import("./pages/ConsentPage"));
const ApiDocumentation = lazy(() => import("./pages/ApiDocumentation"));
const SharedProjectView = lazy(() => import("./pages/SharedProjectView"));
const InternalProjectView = lazy(() => import("./pages/InternalProjectView"));
const GalleryFilesPage = lazy(() => import("./pages/GalleryFilesPage"));
const LandscapingPage = lazy(() => import("./pages/LandscapingPage"));
const SharedGalleryView = lazy(() => import("./pages/SharedGalleryView"));
const OfferPage = lazy(() => import("./pages/OfferPage"));
const DesignProposals = lazy(() => import("./pages/DesignProposals"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BlueprintBuilder = lazy(() => import("./pages/BlueprintBuilder"));
const ToolsGallery = lazy(() => import("./pages/ToolsGallery"));
const ToolsGallery2 = lazy(() => import("./pages/ToolsGallery2"));
const AssetGallery = lazy(() => import("./pages/AssetGallery"));
const FlipLab = lazy(() => import("./pages/FlipLab"));
const FlipPagesFile = lazy(() => import("./pages/FlipPagesFile"));
const FlipBookPublished = lazy(() => import("./pages/FlipBookPublished"));
/* Per-category configuration suites (dropdown + carousel options + board) */
const SaunaSuite = lazy(() => import("./pages/suites/SaunaSuite"));
const SpaSuite = lazy(() => import("./pages/suites/SpaSuite"));
const TanningLedgeSuite = lazy(() => import("./pages/suites/TanningLedgeSuite"));
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
        <ScrollRestoration />
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
                <ProtectedRoute requireAuth={true} requiredRoles={['main_admin', 'supplier', 'installer']}>
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
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/deck" element={<InvestorDeck />} />
            <Route path="/twilio-poc" element={<TwilioPOC />} />
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/api" element={<ApiDocumentation />} />
            <Route path="/project/:token" element={<SharedProjectView />} />
            <Route path="/project/internal/:token" element={<InternalProjectView />} />
            <Route 
              path="/files" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <GalleryFilesPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/gallery/:token" element={<SharedGalleryView />} />
            <Route path="/landscaping" element={<LandscapingPage />} />
            <Route path="/Landscaping" element={<LandscapingPage />} />
            <Route path="/offer/:id" element={<OfferPage />} />
            <Route path="/design" element={<DesignProposals />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/blueprint-builder" element={<BlueprintBuilder />} />
            <Route path="/studio-showroom" element={<StudioShowroom />} />
            <Route path="/studio" element={<StudioLanding />} />
            <Route path="/tools" element={<ToolsGallery />} />
            <Route path="/tools2" element={<ToolsGallery2 />} />
            <Route path="/asset-gallery" element={<AssetGallery />} />
            <Route path="/flip" element={<FlipLab />} />
            <Route path="/flip-pages" element={<FlipPagesFile />} />
            {/* Product suites — one per category, full configuration + board */}
            <Route path="/suites/saunas" element={<SaunaSuite />} />
            <Route path="/suites/spas" element={<SpaSuite />} />
            <Route path="/suites/tanning-ledges" element={<TanningLedgeSuite />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
      </ProjectTypeProvider>
    </AuthProvider>
  );
};

export default App;
