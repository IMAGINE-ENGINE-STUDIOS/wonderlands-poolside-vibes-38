import React, { useState, useEffect, useCallback } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, Star, DollarSign, Edit, Plus, Search, RefreshCw, Database, Globe, Smartphone, LogOut, Gift, Building2, Key, FileText, Activity, ChevronRight, Home, Zap, Mail, MessageSquare, Tag, Crown, HardHat, FolderOpen, ClipboardList, Briefcase, Menu, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DeliveryApiManager from '@/components/DeliveryApiManager';
import RealApiManager from '@/components/RealApiManager';
import LathamPoolsData from '@/components/LathamPoolsData';
import StandardizedProductManager from '@/components/StandardizedProductManager';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminQuotesManager from '@/components/AdminQuotesManager';
import AdminOrdersManager from '@/components/AdminOrdersManager';
import AdminDashboardMetrics from '@/components/AdminDashboardMetrics';
import AdminReferralsManager from '@/components/AdminReferralsManager';
import AdminClientManager from '@/components/AdminClientManager';
import ApiKeyManager from '@/components/ApiKeyManager';
import SampleDataSetup from '@/components/SampleDataSetup';
import SetupDemoUsers from '@/components/SetupDemoUsers';
import AdminQuoteTool from '@/components/AdminQuoteTool';
import AdminInvoiceTool from '@/components/AdminInvoiceTool';
import AdminInvoicesManager from '@/components/AdminInvoicesManager';
import { PoolCalculator } from '@/components/PoolCalculator';
import { PerformanceMonitoring } from '@/components/admin/PerformanceMonitoring';
import AdminContractorManagement from '@/components/admin/AdminContractorManagement';
import SalesRepManager from '@/components/admin/SalesRepManager';
import SalesRepCategoryManager from '@/components/admin/SalesRepCategoryManager';
import AutomationTemplatesManager from '@/components/admin/AutomationTemplatesManager';
import AutomationSequencesManager from '@/components/admin/AutomationSequencesManager';
import AutomationStatusManager from '@/components/admin/AutomationStatusManager';
import { TwilioTestPanel } from '@/components/admin/TwilioTestPanel';
import AdminPromotionsManager from '@/components/admin/AdminPromotionsManager';
import HeadOfSalesDashboard from '@/components/HeadOfSalesDashboard';
import CustomerCacheSearch from '@/components/admin/CustomerCacheSearch';
import AdminApiManagement from '@/components/admin/AdminApiManagement';
import AdminProjectManagement from '@/components/admin/projectManagement/AdminProjectManagement';
import AdminApplicationsPanel from '@/components/admin/AdminApplicationsPanel';
import AdminJobBoardManager from '@/components/admin/AdminJobBoardManager';
import NotificationBell from '@/components/NotificationBell';

// Navigation Item Component — Noir & Gold
const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-md
      transition-all duration-200 group relative overflow-hidden
      ${active
        ? 'bg-[#c9a84c]/12 text-[#f0d78c] border-r-2 border-[#c9a84c]'
        : 'text-[#f5f3ee]/65 hover:text-[#f0d78c] hover:bg-[#c9a84c]/[0.06] hover:translate-x-0.5'}
    `}
    style={{ fontFamily: "'Manrope', sans-serif" }}
  >
    <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${active ? 'text-[#c9a84c]' : 'text-[#f5f3ee]/40 group-hover:text-[#c9a84c]'}`} />
    <span className="text-[13px] font-medium tracking-wide truncate">{label}</span>
    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c9a84c] shadow-[0_0_8px_rgba(201,168,76,0.6)]" />}
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = usePersistentState("admin_activeSection", "quotes");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { toast } = useToast();
  
  // Real database metrics
  const [dbMetrics, setDbMetrics] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalProducts: 0,
    activePools: 0
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Role-based access control
  const isMainAdmin = profile?.role === 'main_admin';
  const isSupplier = profile?.role === 'supplier';
  const isInstaller = profile?.role === 'installer';
  const isContractorOrSupplier = isSupplier || isInstaller;

  useEffect(() => {
    if (isContractorOrSupplier) {
      setActiveSection((current) => current === "quotes" ? "procurement" : current);
      return;
    }

    if (isMainAdmin) {
      setActiveSection((current) => current === "procurement" ? "quotes" : current);
    }
  }, [isContractorOrSupplier, isMainAdmin]);

  // Fetch real metrics from database
  const fetchDatabaseMetrics = useCallback(async () => {
    try {
      const [ordersRes, productsRes, poolsRes] = await Promise.all([
        supabase.from('product_orders').select('total_amount'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('pools').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const avgValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      setDbMetrics({
        totalRevenue,
        averageOrderValue: avgValue,
        totalProducts: productsRes.count || 0,
        activePools: poolsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }, []);

  useEffect(() => {
    fetchDatabaseMetrics();
  }, [fetchDatabaseMetrics]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await fetchDatabaseMetrics();
      toast({
        title: "Success",
        description: "Dashboard data refreshed from database"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Redirect non-admin users or wrong admin
  useEffect(() => {
    if (profile && !isMainAdmin && !isContractorOrSupplier) {
      navigate('/');
    }
  }, [profile, isMainAdmin, isContractorOrSupplier, navigate]);

  // Don't render anything if not authorized
  if (!user || !isMainAdmin && !isContractorOrSupplier) {
    return null;
  }

  const sectionLabel = (() => {
    const map: Record<string, string> = {
      'unified-products': 'Products', quotes: 'Quotes', 'quote-tool': 'Quote Tool', invoices: 'Invoices',
      'invoice-tool': 'Invoice Tool', orders: 'Orders', users: 'Users', promotions: 'Promotions',
      'sales-reps': 'Sales Reps', 'sales-categories': 'Sales Categories', 'head-of-sales': 'Head of Sales',
      clients: 'Clients', 'customer-cache': 'Customer DB', contractors: 'Contractors', projects: 'Projects',
      applications: 'Applications', 'job-board': 'Job Board', referrals: 'Referrals',
      'api-manager': 'API Management', 'delivery-logistics': 'Delivery', 'content-editor': 'Content Editor',
      procurement: 'Procurement', analytics: 'Analytics', setup: 'Setup', calculator: 'Pool Calculator',
      performance: 'Performance', 'automation-templates': 'Message Templates',
      'automation-sequences': 'Sequences', 'automation-status': 'Status Monitor', 'api-keys': 'API Keys',
    };
    return map[activeSection] ?? 'Dashboard';
  })();

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 lg:p-7 flex flex-col gap-1 border-b border-[#c9a84c]/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative h-10 w-10 bg-gradient-to-br from-[#c9a84c] to-[#8a6f2a] rounded-md flex items-center justify-center shadow-[0_0_24px_rgba(201,168,76,0.25)]">
            <Zap className="h-5 w-5 text-[#0d0d0d]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[#f5f3ee] font-bold text-lg tracking-tight leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>
              {isMainAdmin ? 'Command' : profile?.role === 'supplier' ? 'Supplier' : 'Contractor'}
            </h1>
            <span className="text-[10px] text-[#c9a84c]/70 tracking-[0.18em] uppercase font-semibold">Wonderlands · Admin</span>
          </div>
        </div>
        {profile && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shadow-[0_0_6px_rgba(201,168,76,0.7)]" />
            <span className="text-[11px] text-[#f0d78c]/80 tracking-wide truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {profile.first_name} {profile.last_name}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {isContractorOrSupplier && (
          <div>
            <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-[#c9a84c] mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
              Workspace
            </h3>
            <div className="space-y-0.5">
              <NavItem icon={Building2} label="Procurement" active={activeSection === "procurement"} onClick={() => { setActiveSection("procurement"); setMobileNavOpen(false); }} />
              <NavItem icon={ShoppingCart} label="Orders" active={activeSection === "orders"} onClick={() => { setActiveSection("orders"); setMobileNavOpen(false); }} />
              <NavItem icon={BarChart3} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setMobileNavOpen(false); }} />
              <NavItem icon={Key} label="API Keys" active={activeSection === "api-keys"} onClick={() => { setActiveSection("api-keys"); setMobileNavOpen(false); }} />
            </div>
          </div>
        )}

        {isMainAdmin && (
          <>
            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-[#c9a84c] mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                Core Systems
              </h3>
              <div className="space-y-0.5">
                <NavItem icon={Database} label="Products" active={activeSection === "unified-products"} onClick={() => { setActiveSection("unified-products"); setMobileNavOpen(false); }} />
                <NavItem icon={Star} label="Quotes" active={activeSection === "quotes"} onClick={() => { setActiveSection("quotes"); setMobileNavOpen(false); }} />
                <NavItem icon={DollarSign} label="Quote Tool" active={activeSection === "quote-tool"} onClick={() => { setActiveSection("quote-tool"); setMobileNavOpen(false); }} />
                <NavItem icon={FileText} label="Invoices" active={activeSection === "invoices"} onClick={() => { setActiveSection("invoices"); setMobileNavOpen(false); }} />
                <NavItem icon={FileText} label="Invoice Tool" active={activeSection === "invoice-tool"} onClick={() => { setActiveSection("invoice-tool"); setMobileNavOpen(false); }} />
                <NavItem icon={ShoppingCart} label="Orders" active={activeSection === "orders"} onClick={() => { setActiveSection("orders"); setMobileNavOpen(false); }} />
              </div>
            </div>

            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-[#f0d78c]/60 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                Management
              </h3>
              <div className="space-y-0.5">
                <NavItem icon={Users} label="Users" active={activeSection === "users"} onClick={() => { setActiveSection("users"); setMobileNavOpen(false); }} />
                <NavItem icon={Tag} label="Promotions" active={activeSection === "promotions"} onClick={() => { setActiveSection("promotions"); setMobileNavOpen(false); }} />
                <NavItem icon={Users} label="Sales Reps" active={activeSection === "sales-reps"} onClick={() => { setActiveSection("sales-reps"); setMobileNavOpen(false); }} />
                <NavItem icon={Crown} label="Sales Categories" active={activeSection === "sales-categories"} onClick={() => { setActiveSection("sales-categories"); setMobileNavOpen(false); }} />
                <NavItem icon={DollarSign} label="Head of Sales" active={activeSection === "head-of-sales"} onClick={() => { setActiveSection("head-of-sales"); setMobileNavOpen(false); }} />
                <NavItem icon={Users} label="Clients" active={activeSection === "clients"} onClick={() => { setActiveSection("clients"); setMobileNavOpen(false); }} />
                <NavItem icon={Database} label="Customer DB" active={activeSection === "customer-cache"} onClick={() => { setActiveSection("customer-cache"); setMobileNavOpen(false); }} />
                <NavItem icon={Building2} label="Contractors" active={activeSection === "contractors"} onClick={() => { setActiveSection("contractors"); setMobileNavOpen(false); }} />
                <NavItem icon={HardHat} label="Projects" active={activeSection === "projects"} onClick={() => { setActiveSection("projects"); setMobileNavOpen(false); }} />
                <NavItem icon={ClipboardList} label="Applications" active={activeSection === "applications"} onClick={() => { setActiveSection("applications"); setMobileNavOpen(false); }} />
                <NavItem icon={Briefcase} label="Job Board" active={activeSection === "job-board"} onClick={() => { setActiveSection("job-board"); setMobileNavOpen(false); }} />
                <NavItem icon={FolderOpen} label="Repository" active={false} onClick={() => window.open('/files', '_blank')} />
                <NavItem icon={Gift} label="Referrals" active={activeSection === "referrals"} onClick={() => { setActiveSection("referrals"); setMobileNavOpen(false); }} />
                <NavItem icon={Globe} label="API Management" active={activeSection === "api-manager"} onClick={() => { setActiveSection("api-manager"); setMobileNavOpen(false); }} />
                <NavItem icon={TrendingUp} label="Delivery" active={activeSection === "delivery-logistics"} onClick={() => { setActiveSection("delivery-logistics"); setMobileNavOpen(false); }} />
              </div>
            </div>

            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-[#f0d78c]/60 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                Operations
              </h3>
              <div className="space-y-0.5">
                <NavItem icon={Edit} label="Content Editor" active={activeSection === "content-editor"} onClick={() => { setActiveSection("content-editor"); setMobileNavOpen(false); }} />
                <NavItem icon={Building2} label="Procurement" active={activeSection === "procurement"} onClick={() => { setActiveSection("procurement"); setMobileNavOpen(false); }} />
                <NavItem icon={BarChart3} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setMobileNavOpen(false); }} />
                <NavItem icon={Database} label="Setup" active={activeSection === "setup"} onClick={() => { setActiveSection("setup"); setMobileNavOpen(false); }} />
                <NavItem icon={BarChart3} label="Pool Calculator" active={activeSection === "calculator"} onClick={() => { setActiveSection("calculator"); setMobileNavOpen(false); }} />
                <NavItem icon={Activity} label="Performance" active={activeSection === "performance"} onClick={() => { setActiveSection("performance"); setMobileNavOpen(false); }} />
              </div>
            </div>

            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-[#f0d78c]/60 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                Automation
              </h3>
              <div className="space-y-0.5">
                <NavItem icon={Mail} label="Message Templates" active={activeSection === "automation-templates"} onClick={() => { setActiveSection("automation-templates"); setMobileNavOpen(false); }} />
                <NavItem icon={Zap} label="Sequences" active={activeSection === "automation-sequences"} onClick={() => { setActiveSection("automation-sequences"); setMobileNavOpen(false); }} />
                <NavItem icon={MessageSquare} label="Status Monitor" active={activeSection === "automation-status"} onClick={() => { setActiveSection("automation-status"); setMobileNavOpen(false); }} />
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );

  return (
    <div
      className="min-h-screen flex bg-[#0d0d0d] text-[#f5f3ee] relative"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Ambient gold glow accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-[#c9a84c]/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-[#c9a84c]/[0.04] rounded-full blur-[140px]" />
      </div>

      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      {/* SIDEBAR — Floating Gold Frame */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-4 left-0 z-50
          h-screen lg:h-[calc(100vh-2rem)]
          w-[280px] lg:ml-4 lg:my-4
          bg-[#141414]/95 lg:bg-[#1a1a1a]
          border-r lg:border border-[#c9a84c]/25
          lg:rounded-2xl
          backdrop-blur-xl
          flex flex-col
          shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(201,168,76,0.08)]
          transition-transform duration-300 ease-out
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shrink-0
        `}
      >
        <SidebarContent />
      </aside>

      {/* MAIN COLUMN */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0d0d0d]/85 border-b border-[#c9a84c]/10">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-md text-[#f0d78c] hover:bg-[#c9a84c]/10 transition-colors"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#c9a84c]/70 font-semibold" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {isMainAdmin ? 'Command Center' : `${profile?.role === 'supplier' ? 'Supplier' : 'Contractor'} Hub`}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f3ee] truncate" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {sectionLabel}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:block">
                <NotificationBell recipientType="admin" recipientId="system" variant="admin" />
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                title="Refresh"
                className="p-2.5 rounded-lg border border-[#c9a84c]/20 bg-[#1a1a1a] text-[#f0d78c] hover:bg-[#c9a84c]/15 hover:border-[#c9a84c]/50 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link to="/" title="Home">
                <button className="p-2.5 rounded-lg border border-[#c9a84c]/20 bg-[#1a1a1a] text-[#f0d78c] hover:bg-[#c9a84c]/15 hover:border-[#c9a84c]/50 transition-all duration-200">
                  <Home className="h-4 w-4" />
                </button>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2.5 rounded-lg border border-[#c9a84c]/20 bg-[#1a1a1a] text-[#f0d78c] hover:bg-[#c9a84c] hover:text-[#0d0d0d] hover:border-[#c9a84c] transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {/* Live Telemetry */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-[#c9a84c] font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Live Telemetry
                </div>
                <p className="text-xs text-[#f5f3ee]/40 mt-1">Real-time pulse across the operation</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] text-[#c9a84c]/60 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
                Synced
              </div>
            </div>
            <AdminDashboardMetrics />
          </div>

          {/* Products Tab - Only for main admins */}
          {isMainAdmin && activeSection === "unified-products" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <Card className="holographic-panel border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                    <Database className="h-5 w-5 text-cyan-400" />
                    Product Management
                  </CardTitle>
                  <CardDescription className="text-cyan-400/60 font-mono">
                    Manage all products, pools, and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StandardizedProductManager />
                </CardContent>
              </Card>
            </div>}

          {/* Users Tab */}
          {activeSection === "users" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 font-mono">Users</CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement currentAdmin={profile} />
              </CardContent>
            </Card>
            
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-300 font-mono">Demo Users Setup</CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">Create demo user accounts for testing</CardDescription>
              </CardHeader>
              <CardContent>
                <SetupDemoUsers />
              </CardContent>
            </Card>
            </div>}

          {/* Orders Tab */}
          {activeSection === "orders" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminOrdersManager />
            </div>}

          {/* Quotes Tab */}
          {activeSection === "quotes" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminQuotesManager />
            </div>}

          {/* Quote Tool Tab */}
          {activeSection === "quote-tool" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <DollarSign className="h-5 w-5 text-cyan-400" />
                  Quote Tool
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Generate pool installation quotes for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminQuoteTool />
              </CardContent>
            </Card>
            </div>}

          {/* Invoices Tab */}
          {activeSection === "invoices" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminInvoicesManager />
            </div>}

          {/* Invoice Tool Tab */}
          {activeSection === "invoice-tool" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  Invoice Generator
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Create and send professional invoices to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminInvoiceTool />
              </CardContent>
            </Card>
            </div>}

          {/* Sales Reps Tab */}
          {activeSection === "sales-reps" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Sales Representatives
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Manage sales representatives and their assigned clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesRepManager />
              </CardContent>
            </Card>
          </div>}

          {/* Sales Categories Tab */}
          {activeSection === "sales-categories" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <Crown className="h-5 w-5 text-amber-400" />
                  Sales Team Categories
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Assign categories (BDR, AE, CSM, Regional Sales, Head of Sales) to define commission rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesRepCategoryManager />
              </CardContent>
            </Card>
          </div>}

          {/* Head of Sales Dashboard */}
          {activeSection === "head-of-sales" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <Crown className="h-5 w-5 text-amber-400" />
                  Head of Sales Dashboard
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Assign sales teams to clients and track commissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeadOfSalesDashboard />
              </CardContent>
            </Card>
          </div>}

          {/* Promotions Tab */}
          {activeSection === "promotions" && <div className="animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminPromotionsManager />
          </div>}

          {/* Clients Tab */}
          {activeSection === "clients" && <div className="animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminClientManager />
          </div>}

          {/* Contractors Tab */}
          {activeSection === "contractors" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminContractorManagement />
          </div>}

          {/* Projects Tab */}
          {activeSection === "projects" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <HardHat className="h-5 w-5 text-cyan-400" />
                  Project Management
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Track construction progress, manage phases, and share with clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminProjectManagement />
              </CardContent>
            </Card>
          </div>}

          {/* Referrals Tab */}
          {activeSection === "referrals" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <AdminReferralsManager />
            </div>}

          {/* Customer Cache Database */}
          {isMainAdmin && activeSection === "customer-cache" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <Database className="h-5 w-5 text-cyan-400" />
                  Customer Database
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  All unique customers from quote submissions (passcode protected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerCacheSearch />
              </CardContent>
            </Card>
          </div>}

          {/* Content Editor Tab - Only for main admins */}
          {isMainAdmin && activeSection === "content-editor" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <Card className="holographic-panel border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                    <Edit className="h-5 w-5 text-cyan-400" />
                    Content Editor
                  </CardTitle>
                  <CardDescription className="text-cyan-400/60 font-mono">
                    Edit website content and manage the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Globe className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-cyan-300 font-mono">Content Editor</h3>
                    <p className="text-cyan-400/60 font-mono mb-4">
                      Edit website content with live preview and drag-and-drop functionality.
                    </p>
                    <Button onClick={() => window.open('/content-editor', '_blank')} className="w-full max-w-md mb-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                      <Edit className="mr-2 h-4 w-4" />
                      Open Content Editor (New Tab)
                    </Button>
                  </div>
                  
                  {/* Quick Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="p-4 holographic-panel border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-sm text-cyan-300 font-mono">Product Integration</span>
                      </div>
                      <p className="text-xs text-cyan-400/60 font-mono">
                        Drag and drop products from the live database directly onto any page
                      </p>
                    </Card>
                    <Card className="p-4 holographic-panel border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-green-400" />
                        <span className="font-medium text-sm text-cyan-300 font-mono">Responsive Preview</span>
                      </div>
                      <p className="text-xs text-cyan-400/60 font-mono">
                        Test your changes on desktop, tablet, and mobile devices instantly
                      </p>
                    </Card>
                    <Card className="p-4 holographic-panel border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 text-purple-400" />
                        <span className="font-medium text-sm text-cyan-300 font-mono">Live Updates</span>
                      </div>
                      <p className="text-xs text-cyan-400/60 font-mono">
                        See your changes applied to the website in real-time
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>}

          {/* API Manager Tab - Main Admin Only */}
          {isMainAdmin && activeSection === "api-manager" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <AdminApiManagement />
            </div>}

          {/* API Keys Tab - Contractors and Suppliers */}
          {isContractorOrSupplier && activeSection === "api-keys" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <ApiKeyManager />
            </div>}

          {/* Pool Specs Tab */}
          {activeSection === "pool-specs" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <Package className="h-5 w-5 text-cyan-400" />
                  Latham Pools Specifications
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Complete pool specifications database with technical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LathamPoolsData />
              </CardContent>
            </Card>
            </div>}

          {/* Delivery & Logistics Tab - Hidden from installers */}
          {!isInstaller && activeSection === "delivery-logistics" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <div className="space-y-6">
                {/* Delivery API Management Section */}
                <Card className="holographic-panel border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                      <TrendingUp className="h-5 w-5 text-cyan-400" />
                      Delivery API Management
                    </CardTitle>
                    <CardDescription className="text-cyan-400/60 font-mono">
                      Manage third-party delivery service APIs and integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DeliveryApiManager />
                  </CardContent>
                </Card>

                {/* Logistics settings are now managed through DeliveryApiManager above */}
              </div>
            </div>}

          {/* Applications Tab */}
          {isMainAdmin && activeSection === "applications" && <AdminApplicationsPanel />}

          {/* Procurement Tab */}
          {activeSection === "procurement" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <Card className="holographic-panel border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                  Procurement System
                </CardTitle>
                <CardDescription className="text-cyan-400/60 font-mono">
                  Manage procurement bids, job postings, and contractor relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Building2 className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-cyan-300 font-mono">Procurement System</h3>
                  <p className="text-cyan-400/60 font-mono mb-4">
                    Access the full procurement system with enhanced bid creation and application tools.
                  </p>
                  <Button onClick={() => window.open('/procurement', '_blank')} className="w-full max-w-md mb-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                    <Building2 className="mr-2 h-4 w-4" />
                    Open Procurement System (New Tab)
                  </Button>
                </div>
                
                {/* Quick Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card className="p-4 holographic-panel border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-sm text-cyan-300 font-mono">Create Bids</span>
                    </div>
                    <p className="text-xs text-cyan-400/60 font-mono">
                      Post detailed job requirements and receive competitive bids from qualified contractors
                    </p>
                  </Card>
                  <Card className="p-4 holographic-panel border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-sm text-cyan-300 font-mono">Browse Jobs</span>
                    </div>
                    <p className="text-xs text-cyan-400/60 font-mono">
                      Find and apply to procurement opportunities with advanced filtering and search
                    </p>
                  </Card>
                  <Card className="p-4 holographic-panel border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="font-medium text-sm text-cyan-300 font-mono">Manage Relationships</span>
                    </div>
                    <p className="text-xs text-cyan-400/60 font-mono">
                      Build and maintain professional relationships with contractors and suppliers
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
            </div>}

          {/* Analytics Tab */}
          {activeSection === "analytics" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="holographic-panel border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-300 font-mono">Revenue Analytics</CardTitle>
                  <CardDescription className="text-cyan-400/60 font-mono">Track your pool system revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-300 font-mono">${dbMetrics.totalRevenue.toLocaleString()}</div>
                      <p className="text-sm text-cyan-400/60 font-mono">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 font-mono">${dbMetrics.averageOrderValue.toFixed(2)}</div>
                      <p className="text-sm text-cyan-400/60 font-mono">Average Order Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="holographic-panel border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-cyan-300 font-mono">Database Insights</CardTitle>
                  <CardDescription className="text-cyan-400/60 font-mono">Key metrics and insights for your unified database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyan-400/80 font-mono">Database Health</span>
                      <span className="font-bold text-green-400 font-mono">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyan-400/80 font-mono">Total Products</span>
                      <span className="font-bold text-cyan-300 font-mono">{dbMetrics.totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-cyan-400/80 font-mono">Active Pools</span>
                      <span className="font-bold text-cyan-300 font-mono">{dbMetrics.activePools}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>}
          
          {/* Setup Tab - Main Admin Only */}
          {isMainAdmin && activeSection === "setup" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <SampleDataSetup />
            </div>}
          
          {/* Pool Calculator Tab */}
          {isMainAdmin && activeSection === "calculator" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <PoolCalculator />
            </div>}

          {/* Performance Monitoring Tab */}
          {isMainAdmin && activeSection === "performance" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <PerformanceMonitoring />
            </div>}

          {/* Automation Templates Tab */}
          {isMainAdmin && activeSection === "automation-templates" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <AutomationTemplatesManager />
            </div>}

          {/* Automation Sequences Tab */}
          {isMainAdmin && activeSection === "automation-sequences" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <AutomationSequencesManager />
            </div>}

          {/* Automation Status Tab */}
          {isMainAdmin && activeSection === "automation-status" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <TwilioTestPanel />
              <AutomationStatusManager />
            </div>}

          {/* Job Board Tab */}
          {isMainAdmin && activeSection === "job-board" && <div className="space-y-6 animate-fade-in bg-[#0a0a0f] -m-6 p-6 min-h-screen">
              <Card className="holographic-panel border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                    <Briefcase className="h-5 w-5 text-cyan-400" />
                    Job Board Management
                  </CardTitle>
                  <CardDescription className="text-cyan-400/60 font-mono">
                    Manage career postings for Construction Workers and Pool Cleaners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminJobBoardManager />
                </CardContent>
              </Card>
            </div>}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;