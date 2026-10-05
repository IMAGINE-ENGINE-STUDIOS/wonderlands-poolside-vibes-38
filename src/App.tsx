import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
const Socialite = lazy(() => import("./pages/Socialite"));
import SocialiteCloudSync from "./components/socialite/SocialiteCloudSync";
import { SocialiteGate } from "./components/socialite/SocialiteAuth";
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
const SalesRepDashboard = lazy(() => import("./pages/SalesRepDashboard"));
const ContractorProfile = lazy(() => import("./pages/ContractorProfile"));
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
const UnsubscribePage = lazy(() => import("./pages/Unsubscribe"));
const DesignProposals = lazy(() => import("./pages/DesignProposals"));
const About = lazy(() => import("./pages/About"));
const Consultation = lazy(() => import("./pages/Consultation"));
const SolarBoard = lazy(() => import("./pages/SolarBoard"));
const SolarGenius = lazy(() => import("./pages/SolarGenius"));
const ProductManual = lazy(() => import("./pages/ProductManual"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BlueprintBuilder = lazy(() => import("./pages/BlueprintBuilder"));
const GlobalDesignBoard = lazy(() => import("./pages/GlobalDesignBoard"));
const ToolsGallery = lazy(() => import("./pages/ToolsGallery"));
const ToolsGallery2 = lazy(() => import("./pages/ToolsGallery2"));
const AssetGallery = lazy(() => import("./pages/AssetGallery"));
const FlipLab = lazy(() => import("./pages/FlipLab"));
const FlipPagesFile = lazy(() => import("./pages/FlipPagesFile"));
const FlipBookPublished = lazy(() => import("./pages/FlipBookPublished"));
/* Per-category configuration suites (dropdown + carousel options + board) */
const SaunaSuite = lazy(() => import("./pages/suites/SaunaSuite"));
const CategorySuite = lazy(() => import("./pages/suites/CategorySuite"));
const SpaSuite = lazy(() => import("./pages/suites/SpaSuite"));
const TanningLedgeSuite = lazy(() => import("./pages/suites/TanningLedgeSuite"));
/* Screen enclosures + lanai + fencing share one suite (three trades, one page) */
const EnclosureSuite = lazy(() => import("./pages/suites/EnclosureSuite"));
const CustomerAccount = lazy(() => import("./pages/CustomerAccount"));
const CompanyWorkspace = lazy(() => import("./pages/CompanyWorkspace"));
const AdminPreview = lazy(() => import("./pages/AdminPreview"));
const DevStaging = import.meta.env.DEV ? lazy(() => import("./pages/DevStaging")) : null;
const PublicCompanySite = lazy(() => import("./pages/PublicCompanySite"));
const TenantDomainSite = lazy(() => import("./pages/TenantDomainSite"));
/** Hosts that serve the Wonderlands app itself; any other host is a company's own domain. */
const isOwnHost = (h: string) => h === 'localhost' || h === '127.0.0.1' || /(^|\.)wonderlandsworld\.com$/.test(h) || /\.lovable\.(app|dev)$/.test(h) || /\.lovableproject\.com$/.test(h);
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
  if (typeof window !== 'undefined' && !isOwnHost(window.location.hostname)) return <Suspense fallback={null}><TenantDomainSite /></Suspense>;

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
            <Route path="/account" element={<ProtectedRoute requireAuth={true}><CustomerAccount /></ProtectedRoute>} />
            <Route path="/workspace" element={<ProtectedRoute requireAuth={true}><CompanyWorkspace /></ProtectedRoute>} />
            <Route path="/demo/command-center" element={<ProtectedRoute requireAuth={true}><AdminDashboard previewMode /></ProtectedRoute>} />
            <Route path="/admin/preview/:view" element={<ProtectedRoute requireAuth={true} requiredRoles={['main_admin']}><AdminPreview /></ProtectedRoute>} />
            {DevStaging && <Route path="/dev/command-center" element={<DevStaging />} />}
            {/* Licensed companies' public websites (published snapshot only) */}
            <Route path="/sites/:slug" element={<PublicCompanySite />} />
            <Route path="/sites/:slug/:pageSlug" element={<PublicCompanySite />} />
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
            {/* SOCIALITE — own sign in/up (same Wonderlands account). Any signed-in user;
                company sections inside are main-admin only. /admin/* aliases stay admin-only. */}
            <Route path="/socialite" element={<SocialiteGate><SocialiteCloudSync><Socialite /></SocialiteCloudSync></SocialiteGate>} />
            {["/admin/socialite", "/admin/command-center"].map((p) => (
              <Route key={p} path={p} element={<ProtectedRoute requiredRoles={['main_admin']}><SocialiteCloudSync><Socialite /></SocialiteCloudSync></ProtectedRoute>} />
            ))}
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
            <Route path="/sales-rep-login" element={<Navigate to="/auth?redirect=/sales-rep" replace />} />
            <Route 
              path="/sales-rep" 
              element={
                <ProtectedRoute requiredRoles={['sales_rep' as any]}>
                  <SalesRepDashboard />
                </ProtectedRoute>
              } 
            />
            {/* One sign-in for everyone: old contractor links forward to /auth (business sign-up creates the company). */}
            <Route path="/contractor-registration" element={<Navigate to="/auth?mode=signup&type=business" replace />} />
            <Route path="/contractor-profile/:id" element={<ProtectedRoute requireAuth={true}><ContractorProfile /></ProtectedRoute>} />
            <Route path="/contractor-login" element={<Navigate to="/auth" replace />} />
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
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            <Route path="/design" element={<DesignProposals />} />
            <Route path="/about" element={<About />} />
            <Route path="/consultation" element={<Consultation />} />
            <Route path="/solar-board" element={<SolarBoard />} />
            <Route path="/solar-genius" element={<SolarGenius />} />
            <Route path="/product-manual" element={<ProductManual />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/blueprint-builder" element={<BlueprintBuilder />} />
            <Route path="/global-design-board" element={<GlobalDesignBoard />} />
            <Route path="/studio-showroom" element={<StudioShowroom />} />
            <Route path="/studio" element={<StudioLanding />} />
            <Route path="/tools" element={<ToolsGallery />} />
            <Route path="/tools2" element={<ToolsGallery2 />} />
            <Route path="/asset-gallery" element={<AssetGallery />} />
            <Route path="/flip" element={<FlipLab />} />
            <Route path="/flip-pages" element={<FlipPagesFile />} />
            <Route path="/flip/:slug" element={<FlipBookPublished />} />
            {/* Product suites — one per category, full configuration + board */}
            <Route path="/suites/saunas" element={<SaunaSuite />} />
            <Route path="/suites/spas" element={<SpaSuite />} />
            <Route path="/suites/tanning-ledges" element={<TanningLedgeSuite />} />
            <Route path="/suites/enclosures" element={<EnclosureSuite />} />
            <Route path="/suites/lanai" element={<EnclosureSuite />} />
            <Route path="/suites/fencing" element={<EnclosureSuite />} />
            <Route path="/suites/:category" element={<CategorySuite />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
      </ProjectTypeProvider>
    </AuthProvider>
  );
};

export default App;
