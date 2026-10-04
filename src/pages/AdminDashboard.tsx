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
import ContractorWorkspace, { type Section as WorkspaceSection } from '@/components/contractor/ContractorWorkspace';
import AdminCommandSearch from '@/components/admin/AdminCommandSearch';
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
import AdminActionQueue from '@/components/admin/AdminActionQueue';
import AdminTechnologyHub from '@/components/admin/AdminTechnologyHub';
import AdminCompanies from '@/components/admin/AdminCompanies';

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
        ? 'cc-nav-active bg-neutral-100 text-black font-semibold'
        : 'text-neutral-700 hover:text-black hover:bg-neutral-50'}
    `}
    style={{ fontFamily: "'Manrope', sans-serif" }}
  >
    <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${active ? 'text-black' : 'text-neutral-500 group-hover:text-black'}`} />
    <span className="text-[13px] font-medium tracking-wide truncate">{label}</span>
    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#0891b2]" />}
  </button>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = usePersistentState("admin_activeSection", "today");
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
    // Businesses have their own page; the Command Center is platform-admin only.
    if (isContractorOrSupplier) navigate('/workspace', { replace: true });
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

  // Company figures load only for main admins viewing Analytics (no duplicate
  // fetch alongside AdminDashboardMetrics; never fetched for contractors).
  useEffect(() => {
    if (isMainAdmin && activeSection === 'analytics') fetchDatabaseMetrics();
  }, [fetchDatabaseMetrics, isMainAdmin, activeSection]);

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
      clients: 'Clients', 'customer-cache': 'Customer DB', contractors: 'Contractors', projects: 'Projects', 'my-projects': 'My Projects', compliance: 'Compliance', payouts: 'Payouts & Work Orders', messages: 'Messages',
      applications: 'Applications', 'job-board': 'Job Board', referrals: 'Referrals',
      'api-manager': 'API Management', 'delivery-logistics': 'Delivery', 'content-editor': 'Content Editor',
      procurement: 'Procurement', analytics: 'Analytics', setup: 'Setup', calculator: 'Pool Calculator',
      performance: 'Performance', 'automation-templates': 'Message Templates',
      'automation-sequences': 'Sequences', 'automation-status': 'Status Monitor', 'api-keys': 'API Keys', 'tech-hub': 'Technology Hub', today: 'Today', companies: 'Licensed companies',
    };
    return map[activeSection] ?? 'Dashboard';
  })();

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 lg:p-7 flex flex-col gap-1 border-b border-neutral-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative h-10 w-10 bg-black rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>W</span>
          </div>
          <div>
            <h1 className="text-black font-bold text-lg tracking-tight leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>
              {isMainAdmin ? 'Command' : profile?.role === 'supplier' ? 'Supplier' : 'Contractor'}
            </h1>
            <span className="text-[10px] text-neutral-500 tracking-[0.18em] uppercase font-semibold">Wonderlands · Admin</span>
          </div>
        </div>
        {profile && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0891b2]" />
            <span className="text-[11px] text-neutral-700 tracking-wide truncate" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {profile.first_name} {profile.last_name}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {isContractorOrSupplier && (
          <div>
            <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
              Workspace
            </h3>
            <div className="space-y-0.5">
              <NavItem icon={Building2} label="Opportunities & Bids" active={activeSection === "procurement"} onClick={() => { setActiveSection("procurement"); setMobileNavOpen(false); }} />
              <NavItem icon={HardHat} label="My Projects" active={activeSection === "my-projects"} onClick={() => { setActiveSection("my-projects"); setMobileNavOpen(false); }} />
              <NavItem icon={DollarSign} label="Payouts & Work Orders" active={activeSection === "payouts"} onClick={() => { setActiveSection("payouts"); setMobileNavOpen(false); }} />
              <NavItem icon={MessageSquare} label="Messages" active={activeSection === "messages"} onClick={() => { setActiveSection("messages"); setMobileNavOpen(false); }} />
              <NavItem icon={ClipboardList} label="Compliance" active={activeSection === "compliance"} onClick={() => { setActiveSection("compliance"); setMobileNavOpen(false); }} />
              <NavItem icon={Key} label="API Keys" active={activeSection === "api-keys"} onClick={() => { setActiveSection("api-keys"); setMobileNavOpen(false); }} />
            </div>
          </div>
        )}

        {isMainAdmin && (
          <>
            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                Core Systems
              </h3>
              <div className="space-y-0.5">
                <NavItem icon={Activity} label="Today" active={activeSection === "today"} onClick={() => { setActiveSection("today"); setMobileNavOpen(false); }} />
                <NavItem icon={Building2} label="Licensed companies" active={activeSection === "companies"} onClick={() => { setActiveSection("companies"); setMobileNavOpen(false); }} />
                <NavItem icon={Briefcase} label="Preview company workspace" active={false} onClick={() => navigate('/admin/preview/workspace')} />
                <NavItem icon={Users} label="Preview customer account" active={false} onClick={() => navigate('/admin/preview/account')} />
                <NavItem icon={Database} label="Products" active={activeSection === "unified-products"} onClick={() => { setActiveSection("unified-products"); setMobileNavOpen(false); }} />
                <NavItem icon={Star} label="Quotes" active={activeSection === "quotes"} onClick={() => { setActiveSection("quotes"); setMobileNavOpen(false); }} />
                <NavItem icon={DollarSign} label="Quote Tool" active={activeSection === "quote-tool"} onClick={() => { setActiveSection("quote-tool"); setMobileNavOpen(false); }} />
                <NavItem icon={FileText} label="Invoices" active={activeSection === "invoices"} onClick={() => { setActiveSection("invoices"); setMobileNavOpen(false); }} />
                <NavItem icon={FileText} label="Invoice Tool" active={activeSection === "invoice-tool"} onClick={() => { setActiveSection("invoice-tool"); setMobileNavOpen(false); }} />
                <NavItem icon={ShoppingCart} label="Orders" active={activeSection === "orders"} onClick={() => { setActiveSection("orders"); setMobileNavOpen(false); }} />
              </div>
            </div>

            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
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
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                Operations
              </h3>
              <div className="space-y-0.5">
                <NavItem icon={Globe} label="Technology Hub" active={activeSection === "tech-hub"} onClick={() => { setActiveSection("tech-hub"); setMobileNavOpen(false); }} />
                <NavItem icon={Edit} label="Content Editor" active={activeSection === "content-editor"} onClick={() => { setActiveSection("content-editor"); setMobileNavOpen(false); }} />
                <NavItem icon={Building2} label="Procurement" active={activeSection === "procurement"} onClick={() => { setActiveSection("procurement"); setMobileNavOpen(false); }} />
                <NavItem icon={BarChart3} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setMobileNavOpen(false); }} />
                <NavItem icon={Database} label="Setup" active={activeSection === "setup"} onClick={() => { setActiveSection("setup"); setMobileNavOpen(false); }} />
                <NavItem icon={BarChart3} label="Pool Calculator" active={activeSection === "calculator"} onClick={() => { setActiveSection("calculator"); setMobileNavOpen(false); }} />
                <NavItem icon={Activity} label="Performance" active={activeSection === "performance"} onClick={() => { setActiveSection("performance"); setMobileNavOpen(false); }} />
              </div>
            </div>

            <div>
              <h3 className="px-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-3 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
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
      className="cc-paper min-h-screen flex bg-white text-black relative"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isMainAdmin && <AdminCommandSearch onNavigate={setActiveSection} />}
              <div className="hidden sm:block">
                <NotificationBell recipientType="admin" recipientId="system" variant="admin" />
              </div>
              <button
                onClick={refreshData}
                disabled={isLoading}
                title="Refresh"
                className="p-2.5 rounded-lg border border-neutral-200 bg-white text-black hover:bg-neutral-100 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link to="/" title="Home">
                <button className="p-2.5 rounded-lg border border-neutral-200 bg-white text-black hover:bg-neutral-100 transition-all duration-200">
                  <Home className="h-4 w-4" />
                </button>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2.5 rounded-lg border border-neutral-200 bg-white text-black hover:bg-black hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
          {/* Live figures + action queue — main admin only (company figures) */}
          {isMainAdmin && activeSection === 'today' && <>
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Live figures
                </div>
                <p className="text-sm text-neutral-700 mt-1">Every number comes straight from your records</p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0891b2] animate-pulse" />
                Synced
              </div>
            </div>
            <AdminDashboardMetrics onNavigate={setActiveSection} />
          </div>
          <AdminActionQueue onNavigate={setActiveSection} />
          </>}

          {isMainAdmin && activeSection === 'today' && <AdminTechnologyHub />}
          {isMainAdmin && activeSection === 'companies' && <AdminCompanies />}

          {/* Products Tab - Only for main admins */}
          {isMainAdmin && activeSection === "unified-products" && <div className="space-y-6 animate-fade-in">
              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Database className="h-5 w-5 text-black" />
                    Product Management
                  </CardTitle>
                  <CardDescription className="text-neutral-600">
                    Manage all products, pools, and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StandardizedProductManager />
                </CardContent>
              </Card>
            </div>}

          {/* Users Tab */}
          {activeSection === "users" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-black">Users</CardTitle>
                <CardDescription className="text-neutral-600">Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement currentAdmin={profile} />
              </CardContent>
            </Card>
            
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-black">Demo Users Setup</CardTitle>
                <CardDescription className="text-neutral-600">Create demo user accounts for testing</CardDescription>
              </CardHeader>
              <CardContent>
                <SetupDemoUsers />
              </CardContent>
            </Card>
            </div>}

          {/* Orders Tab */}
          {activeSection === "orders" && <div className="space-y-6 animate-fade-in">
            <AdminOrdersManager />
            </div>}

          {/* Quotes Tab */}
          {activeSection === "quotes" && <div className="space-y-6 animate-fade-in">
            <AdminQuotesManager />
            </div>}

          {/* Quote Tool Tab */}
          {activeSection === "quote-tool" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <DollarSign className="h-5 w-5 text-black" />
                  Quote Tool
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Generate pool installation quotes for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminQuoteTool />
              </CardContent>
            </Card>
            </div>}

          {/* Invoices Tab */}
          {activeSection === "invoices" && <div className="space-y-6 animate-fade-in">
            <AdminInvoicesManager />
            </div>}

          {/* Invoice Tool Tab */}
          {activeSection === "invoice-tool" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <FileText className="h-5 w-5 text-black" />
                  Invoice Generator
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Create and send professional invoices to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminInvoiceTool />
              </CardContent>
            </Card>
            </div>}

          {/* Sales Reps Tab */}
          {activeSection === "sales-reps" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="h-5 w-5 text-black" />
                  Sales Representatives
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Manage sales representatives and their assigned clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesRepManager />
              </CardContent>
            </Card>
          </div>}

          {/* Sales Categories Tab */}
          {activeSection === "sales-categories" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Crown className="h-5 w-5 text-black" />
                  Sales Team Categories
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Assign categories (BDR, AE, CSM, Regional Sales, Head of Sales) to define commission rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesRepCategoryManager />
              </CardContent>
            </Card>
          </div>}

          {/* Head of Sales Dashboard */}
          {activeSection === "head-of-sales" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Crown className="h-5 w-5 text-black" />
                  Head of Sales Dashboard
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Assign sales teams to clients and track commissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeadOfSalesDashboard />
              </CardContent>
            </Card>
          </div>}

          {/* Promotions Tab */}
          {activeSection === "promotions" && <div className="animate-fade-in">
            <AdminPromotionsManager />
          </div>}

          {/* Clients Tab */}
          {activeSection === "clients" && <div className="animate-fade-in">
            <AdminClientManager />
          </div>}

          {/* Contractors Tab */}
          {activeSection === "contractors" && <div className="space-y-6 animate-fade-in">
            <AdminContractorManagement />
          </div>}

          {/* Projects Tab */}
          {activeSection === "projects" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <HardHat className="h-5 w-5 text-black" />
                  Project Management
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Track construction progress, manage phases, and share with clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminProjectManagement />
              </CardContent>
            </Card>
          </div>}

          {/* Referrals Tab */}
          {activeSection === "referrals" && <div className="space-y-6 animate-fade-in">
            <AdminReferralsManager />
            </div>}

          {/* Customer Cache Database */}
          {isMainAdmin && activeSection === "customer-cache" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Database className="h-5 w-5 text-black" />
                  Customer Database
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  All unique customers from quote submissions (passcode protected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerCacheSearch />
              </CardContent>
            </Card>
          </div>}

          {/* Content Editor Tab - Only for main admins */}
          {isMainAdmin && activeSection === "content-editor" && <div className="space-y-6 animate-fade-in">
              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Edit className="h-5 w-5 text-black" />
                    Content Editor
                  </CardTitle>
                  <CardDescription className="text-neutral-600">
                    Edit website content and manage the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Globe className="h-16 w-16 text-black mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-black">Content Editor</h3>
                    <p className="text-neutral-600 mb-4">
                      Edit website content with live preview and drag-and-drop functionality.
                    </p>
                    <Button onClick={() => window.open('/content-editor', '_blank')} className="w-full max-w-md mb-4 bg-black hover:bg-neutral-800 text-white">
                      <Edit className="mr-2 h-4 w-4" />
                      Open Content Editor (New Tab)
                    </Button>
                  </div>
                  
                  {/* Quick Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="p-4 border border-neutral-200 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-black" />
                        <span className="font-medium text-sm text-black">Product Integration</span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Drag and drop products from the live database directly onto any page
                      </p>
                    </Card>
                    <Card className="p-4 border border-neutral-200 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-black" />
                        <span className="font-medium text-sm text-black">Responsive Preview</span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Test your changes on desktop, tablet, and mobile devices instantly
                      </p>
                    </Card>
                    <Card className="p-4 border border-neutral-200 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 text-black" />
                        <span className="font-medium text-sm text-black">Live Updates</span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        See your changes applied to the website in real-time
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>}

          {/* API Manager Tab - Main Admin Only */}
          {isMainAdmin && activeSection === "api-manager" && <div className="space-y-6 animate-fade-in">
              <AdminApiManagement />
            </div>}

          {/* API Keys Tab - Contractors and Suppliers */}
          {isContractorOrSupplier && activeSection === "api-keys" && <div className="space-y-6 animate-fade-in">
              <ApiKeyManager />
            </div>}

          {/* Pool Specs Tab */}
          {activeSection === "pool-specs" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Package className="h-5 w-5 text-black" />
                  Latham Pools Specifications
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Complete pool specifications database with technical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LathamPoolsData />
              </CardContent>
            </Card>
            </div>}

          {/* Delivery & Logistics Tab - Hidden from installers */}
          {!isInstaller && activeSection === "delivery-logistics" && <div className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                {/* Delivery API Management Section */}
                <Card className="border border-neutral-200 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black">
                      <TrendingUp className="h-5 w-5 text-black" />
                      Delivery API Management
                    </CardTitle>
                    <CardDescription className="text-neutral-600">
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

          {/* Contractor / supplier workspace (light theme, owner-scoped) */}
          {isContractorOrSupplier && ["procurement", "my-projects", "compliance", "payouts", "messages"].includes(activeSection) && (
            <ContractorWorkspace section={activeSection as WorkspaceSection} />
          )}

          {/* Procurement Tab (main admin) */}
          {!isContractorOrSupplier && activeSection === "procurement" && <div className="space-y-6 animate-fade-in">
            <Card className="border border-neutral-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Building2 className="h-5 w-5 text-black" />
                  Procurement System
                </CardTitle>
                <CardDescription className="text-neutral-600">
                  Manage procurement bids, job postings, and contractor relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Building2 className="h-16 w-16 text-black mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-black">Procurement System</h3>
                  <p className="text-neutral-600 mb-4">
                    Access the full procurement system with enhanced bid creation and application tools.
                  </p>
                  <Button onClick={() => window.open('/procurement', '_blank')} className="w-full max-w-md mb-4 bg-black hover:bg-neutral-800 text-white">
                    <Building2 className="mr-2 h-4 w-4" />
                    Open Procurement System (New Tab)
                  </Button>
                </div>
                
                {/* Quick Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card className="p-4 border border-neutral-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-black" />
                      <span className="font-medium text-sm text-black">Create Bids</span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Post detailed job requirements and receive competitive bids from qualified contractors
                    </p>
                  </Card>
                  <Card className="p-4 border border-neutral-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-black" />
                      <span className="font-medium text-sm text-black">Browse Jobs</span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Find and apply to procurement opportunities with advanced filtering and search
                    </p>
                  </Card>
                  <Card className="p-4 border border-neutral-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-black" />
                      <span className="font-medium text-sm text-black">Manage Relationships</span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Build and maintain professional relationships with contractors and suppliers
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
            </div>}

          {/* Analytics Tab */}
          {isMainAdmin && activeSection === "analytics" && <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-black">Revenue Analytics</CardTitle>
                  <CardDescription className="text-neutral-600">Track your pool system revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-black">${dbMetrics.totalRevenue.toLocaleString()}</div>
                      <p className="text-sm text-neutral-600">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black font-mono">${dbMetrics.averageOrderValue.toFixed(2)}</div>
                      <p className="text-sm text-neutral-600">Average Order Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-black">Database Insights</CardTitle>
                  <CardDescription className="text-neutral-600">Key metrics and insights for your unified database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-700">Total Products</span>
                      <span className="font-bold text-black">{dbMetrics.totalProducts}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-700">Active Pools</span>
                      <span className="font-bold text-black">{dbMetrics.activePools}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>}
          
          {/* Setup Tab - Main Admin Only */}
          {isMainAdmin && activeSection === "setup" && <div className="space-y-6 animate-fade-in">
              <SampleDataSetup />
            </div>}
          
          {/* Pool Calculator Tab */}
          {isMainAdmin && activeSection === "calculator" && <div className="space-y-6 animate-fade-in">
              <PoolCalculator />
            </div>}

          {/* Performance Monitoring Tab */}
          {isMainAdmin && activeSection === "performance" && <div className="space-y-6 animate-fade-in">
              <PerformanceMonitoring />
            </div>}

          {/* Automation Templates Tab */}
          {isMainAdmin && activeSection === "automation-templates" && <div className="space-y-6 animate-fade-in">
              <AutomationTemplatesManager />
            </div>}

          {/* Automation Sequences Tab */}
          {isMainAdmin && activeSection === "automation-sequences" && <div className="space-y-6 animate-fade-in">
              <AutomationSequencesManager />
            </div>}

          {/* Automation Status Tab */}
          {isMainAdmin && activeSection === "automation-status" && <div className="space-y-6 animate-fade-in">
              <TwilioTestPanel />
              <AutomationStatusManager />
            </div>}

          {isMainAdmin && activeSection === "tech-hub" && <div className="space-y-6 animate-fade-in">
              <AdminTechnologyHub />
            </div>}

          {/* Job Board Tab */}
          {isMainAdmin && activeSection === "job-board" && <div className="space-y-6 animate-fade-in">
              <Card className="border border-neutral-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Briefcase className="h-5 w-5 text-black" />
                    Job Board Management
                  </CardTitle>
                  <CardDescription className="text-neutral-600">
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