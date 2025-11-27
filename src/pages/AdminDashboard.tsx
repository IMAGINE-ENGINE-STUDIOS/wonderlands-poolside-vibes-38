
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Star,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  Search,
  RefreshCw,
  Database,
  Globe,
  Smartphone,
  LogOut,
  Gift,
  Building2,
  Key,
  FileText,
  Activity,
  ChevronRight,
  Home,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DeliveryApiManager from '@/components/DeliveryApiManager';
import AdminContentEditor from '@/components/AdminContentEditor';
import RealApiManager from '@/components/RealApiManager';
import RealTimeContentEditor from '@/components/RealTimeContentEditor';
import LathamPoolsData from '@/components/LathamPoolsData';
import StandardizedProductManager from '@/components/StandardizedProductManager';
import AdminUserManagement from '@/components/AdminUserManagement';
import AdminQuotesManager from '@/components/AdminQuotesManager';
import AdminOrdersManager from '@/components/AdminOrdersManager';
import AdminDashboardMetrics from '@/components/AdminDashboardMetrics';
import AdminReferralsManager from '@/components/AdminReferralsManager';
import { DragDropEditor } from '@/components/DragDropEditor';
import ApiKeyManager from '@/components/ApiKeyManager';
import SampleDataSetup from '@/components/SampleDataSetup';
import SetupDemoUsers from '@/components/SetupDemoUsers';
import AdminQuoteTool from '@/components/AdminQuoteTool';
import AdminInvoiceTool from '@/components/AdminInvoiceTool';
import AdminInvoicesManager from '@/components/AdminInvoicesManager';
import { PoolCalculator } from '@/components/PoolCalculator';
import { PerformanceMonitoring } from '@/components/admin/PerformanceMonitoring';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Sample orders data
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      customerId: 'john.consumer@example.com',
      products: [{ name: 'Hayward Super Pump VS', quantity: 1 }],
      total: 1299,
      status: 'completed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD002', 
      customerId: 'john.consumer@example.com',
      products: [{ name: 'Polaris 360 Pool Cleaner', quantity: 2 }],
      total: 798,
      status: 'processing',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ORD003',
      customerId: 'john.consumer@example.com', 
      products: [{ name: 'Pentair FNS Plus Sand Filter', quantity: 1 }],
      total: 850,
      status: 'pending',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  // Role-based access control
  const isMainAdmin = profile?.role === 'main_admin' && profile?.email === 'rikicot@hotmail.com';
  const isSupplier = profile?.role === 'supplier';
  const isInstaller = profile?.role === 'installer';
  const isContractorOrSupplier = isSupplier || isInstaller;
  
  // Calculate metrics from database
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  const refreshData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Dashboard data refreshed",
      });
    }, 1000);
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
  if (!user || (!isMainAdmin && !isContractorOrSupplier)) {
    return null;
  }

  const [activeSection, setActiveSection] = useState(isMainAdmin ? "quotes" : "procurement");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Futuristic Header */}
      <div className="relative border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 sm:px-6 py-4 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    {isMainAdmin ? 'Command Center' : `${profile?.role === 'supplier' ? 'Supplier' : 'Contractor'} Hub`}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {profile && (
                      <span className="font-medium text-primary">
                        {profile.first_name} {profile.last_name} • {profile.company_name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData} 
                disabled={isLoading}
                className="hover:bg-primary/10 transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-destructive/10 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Link to="/">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-accent/10 transition-all duration-300 hover:scale-105"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] relative">
        {/* Futuristic Sidebar Navigation */}
        <div className="w-64 border-r border-border/50 bg-background/40 backdrop-blur-xl p-4 space-y-2 overflow-y-auto sticky top-[80px] h-[calc(100vh-80px)] hidden lg:block">
          <div className="space-y-1">
            {/* For contractors and suppliers: limited navigation */}
            {isContractorOrSupplier && (
              <>
                <NavItem 
                  icon={Building2} 
                  label="Procurement" 
                  active={activeSection === "procurement"}
                  onClick={() => setActiveSection("procurement")}
                />
                <NavItem 
                  icon={ShoppingCart} 
                  label="Orders" 
                  active={activeSection === "orders"}
                  onClick={() => setActiveSection("orders")}
                />
                <NavItem 
                  icon={BarChart3} 
                  label="Analytics" 
                  active={activeSection === "analytics"}
                  onClick={() => setActiveSection("analytics")}
                />
                <NavItem 
                  icon={Key} 
                  label="API Keys" 
                  active={activeSection === "api-keys"}
                  onClick={() => setActiveSection("api-keys")}
                />
              </>
            )}

            {/* For main admin: full navigation */}
            {isMainAdmin && (
              <>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                  Core
                </div>
                <NavItem 
                  icon={Database} 
                  label="Products" 
                  active={activeSection === "unified-products"}
                  onClick={() => setActiveSection("unified-products")}
                />
                <NavItem 
                  icon={Star} 
                  label="Quotes" 
                  active={activeSection === "quotes"}
                  onClick={() => setActiveSection("quotes")}
                />
                <NavItem 
                  icon={DollarSign} 
                  label="Quote Tool" 
                  active={activeSection === "quote-tool"}
                  onClick={() => setActiveSection("quote-tool")}
                />
                <NavItem 
                  icon={FileText} 
                  label="Invoices" 
                  active={activeSection === "invoices"}
                  onClick={() => setActiveSection("invoices")}
                />
                <NavItem 
                  icon={FileText} 
                  label="Invoice Tool" 
                  active={activeSection === "invoice-tool"}
                  onClick={() => setActiveSection("invoice-tool")}
                />
                <NavItem 
                  icon={ShoppingCart} 
                  label="Orders" 
                  active={activeSection === "orders"}
                  onClick={() => setActiveSection("orders")}
                />
                
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4">
                  Management
                </div>
                <NavItem 
                  icon={Users} 
                  label="Users" 
                  active={activeSection === "users"}
                  onClick={() => setActiveSection("users")}
                />
                <NavItem 
                  icon={Gift} 
                  label="Referrals" 
                  active={activeSection === "referrals"}
                  onClick={() => setActiveSection("referrals")}
                />
                <NavItem 
                  icon={Users} 
                  label="API Manager" 
                  active={activeSection === "api-manager"}
                  onClick={() => setActiveSection("api-manager")}
                />
                <NavItem 
                  icon={Package} 
                  label="Pool Specs" 
                  active={activeSection === "pool-specs"}
                  onClick={() => setActiveSection("pool-specs")}
                />
                <NavItem 
                  icon={TrendingUp} 
                  label="Delivery" 
                  active={activeSection === "delivery-logistics"}
                  onClick={() => setActiveSection("delivery-logistics")}
                />
                
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4">
                  Tools
                </div>
                <NavItem 
                  icon={Edit} 
                  label="Content Editor" 
                  active={activeSection === "content-editor"}
                  onClick={() => setActiveSection("content-editor")}
                />
                <NavItem 
                  icon={Building2} 
                  label="Procurement" 
                  active={activeSection === "procurement"}
                  onClick={() => setActiveSection("procurement")}
                />
                <NavItem 
                  icon={BarChart3} 
                  label="Analytics" 
                  active={activeSection === "analytics"}
                  onClick={() => setActiveSection("analytics")}
                />
                <NavItem 
                  icon={Database} 
                  label="Setup" 
                  active={activeSection === "setup"}
                  onClick={() => setActiveSection("setup")}
                />
                <NavItem 
                  icon={BarChart3} 
                  label="Pool Calculator" 
                  active={activeSection === "calculator"}
                  onClick={() => setActiveSection("calculator")}
                />
                <NavItem 
                  icon={Activity} 
                  label="Performance" 
                  active={activeSection === "performance"}
                  onClick={() => setActiveSection("performance")}
                />
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
          {/* Key Metrics */}
          <div className="mb-8">
            <AdminDashboardMetrics />
          </div>
          {/* Products Tab - Only for main admins */}
          {isMainAdmin && activeSection === "unified-products" && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Product Management
                  </CardTitle>
                  <CardDescription>
                    Manage all products, pools, and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StandardizedProductManager />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeSection === "users" && (
            <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement currentAdmin={profile} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Demo Users Setup</CardTitle>
                <CardDescription>Create demo user accounts for testing</CardDescription>
              </CardHeader>
              <CardContent>
                <SetupDemoUsers />
              </CardContent>
            </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeSection === "orders" && (
            <div className="space-y-6 animate-fade-in">
            <AdminOrdersManager />
            </div>
          )}

          {/* Quotes Tab */}
          {activeSection === "quotes" && (
            <div className="space-y-6 animate-fade-in">
            <AdminQuotesManager />
            </div>
          )}

          {/* Quote Tool Tab */}
          {activeSection === "quote-tool" && (
            <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Quote Tool
                </CardTitle>
                <CardDescription>
                  Generate pool installation quotes for customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminQuoteTool />
              </CardContent>
            </Card>
            </div>
          )}

          {/* Invoices Tab */}
          {activeSection === "invoices" && (
            <div className="space-y-6 animate-fade-in">
            <AdminInvoicesManager />
            </div>
          )}

          {/* Invoice Tool Tab */}
          {activeSection === "invoice-tool" && (
            <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Invoice Generator
                </CardTitle>
                <CardDescription>
                  Create and send professional invoices to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminInvoiceTool />
              </CardContent>
            </Card>
            </div>
          )}

          {/* Referrals Tab */}
          {activeSection === "referrals" && (
            <div className="space-y-6 animate-fade-in">
            <AdminReferralsManager />
            </div>
          )}

          {/* Content Editor Tab - Only for main admins */}
          {isMainAdmin && activeSection === "content-editor" && (
            <div className="space-y-6 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-primary" />
                    Content Editor
                  </CardTitle>
                  <CardDescription>
                    Edit website content and manage the marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Content Editor</h3>
                    <p className="text-muted-foreground mb-4">
                      Edit website content with live preview and drag-and-drop functionality.
                    </p>
                    <Button
                      onClick={() => window.open('/content-editor', '_blank')}
                      className="w-full max-w-md mb-4"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Open Content Editor (New Tab)
                    </Button>
                  </div>
                  
                  {/* Quick Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">Product Integration</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Drag and drop products from the live database directly onto any page
                      </p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">Responsive Preview</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Test your changes on desktop, tablet, and mobile devices instantly
                      </p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-sm">Live Updates</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        See your changes applied to the website in real-time
                      </p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API Manager Tab - Main Admin Only */}
          {isMainAdmin && activeSection === "api-manager" && (
            <div className="space-y-6 animate-fade-in">
              <RealApiManager />
            </div>
          )}

          {/* API Keys Tab - Contractors and Suppliers */}
          {isContractorOrSupplier && activeSection === "api-keys" && (
            <div className="space-y-6 animate-fade-in">
              <ApiKeyManager />
            </div>
          )}

          {/* Pool Specs Tab */}
          {activeSection === "pool-specs" && (
            <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Latham Pools Specifications
                </CardTitle>
                <CardDescription>
                  Complete pool specifications database with technical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LathamPoolsData />
              </CardContent>
            </Card>
            </div>
          )}

          {/* Delivery & Logistics Tab - Hidden from installers */}
          {!isInstaller && activeSection === "delivery-logistics" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-6">
                {/* Delivery API Management Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Delivery API Management
                    </CardTitle>
                    <CardDescription>
                      Manage third-party delivery service APIs and integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DeliveryApiManager />
                  </CardContent>
                </Card>

                {/* Legacy Delivery Services & Logistics Settings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Delivery Services
                      </CardTitle>
                      <CardDescription>
                        Manage delivery integrations and logistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Uber Direct', status: 'Active', deliveries: 45, avgCost: 12.50 },
                        { name: 'DoorDash Drive', status: 'Active', deliveries: 32, avgCost: 15.00 },
                        { name: 'Home Depot Delivery', status: 'Connected', deliveries: 18, avgCost: 25.00 },
                        { name: 'Lowes Delivery', status: 'Disconnected', deliveries: 0, avgCost: 0 }
                      ].map((service) => (
                        <div key={service.name} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{service.name}</p>
                            <Badge variant={service.status === 'Active' ? 'default' : 
                                           service.status === 'Connected' ? 'secondary' : 'destructive'}>
                              {service.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{service.deliveries} deliveries</span>
                            <span>Avg. ${service.avgCost}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Logistics Settings</CardTitle>
                      <CardDescription>Configure delivery zones and pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Default Delivery Radius (miles)</label>
                          <Input type="number" defaultValue="25" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Base Delivery Fee</label>
                          <Input type="number" defaultValue="15.00" step="0.01" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Per Mile Rate</label>
                          <Input type="number" defaultValue="1.50" step="0.01" className="mt-1" />
                        </div>
                      </div>
                      <Button className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Pricing
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Procurement Tab */}
          {activeSection === "procurement" && (
            <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Procurement System
                </CardTitle>
                <CardDescription>
                  Manage procurement bids, job postings, and contractor relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Procurement System</h3>
                  <p className="text-muted-foreground mb-4">
                    Access the full procurement system with enhanced bid creation and application tools.
                  </p>
                  <Button
                    onClick={() => window.open('/procurement', '_blank')}
                    className="w-full max-w-md mb-4"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Open Procurement System (New Tab)
                  </Button>
                </div>
                
                {/* Quick Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Create Bids</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Post detailed job requirements and receive competitive bids from qualified contractors
                    </p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Browse Jobs</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Find and apply to procurement opportunities with advanced filtering and search
                    </p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-sm">Manage Relationships</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Build and maintain professional relationships with contractors and suppliers
                    </p>
                  </Card>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeSection === "analytics" && (
            <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Track your pool system revenue performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${averageOrderValue.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Average Order Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Insights</CardTitle>
                  <CardDescription>Key metrics and insights for your unified database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Health</span>
                      <span className="font-bold text-green-600">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Products</span>
                      <span className="font-bold">Loading...</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Pools</span>
                      <span className="font-bold">Loading...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}
          
          {/* Setup Tab - Main Admin Only */}
          {isMainAdmin && activeSection === "setup" && (
            <div className="space-y-6 animate-fade-in">
              <SampleDataSetup />
            </div>
          )}
          
          {/* Pool Calculator Tab */}
          {isMainAdmin && activeSection === "calculator" && (
            <div className="space-y-6 animate-fade-in">
              <PoolCalculator />
            </div>
          )}

          {/* Performance Monitoring Tab */}
          {isMainAdmin && activeSection === "performance" && (
            <div className="space-y-6 animate-fade-in">
              <PerformanceMonitoring />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Navigation Item Component
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
      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
      transition-all duration-300 group relative overflow-hidden
      ${active 
        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25' 
        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
      }
    `}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse" />
    )}
    <Icon className={`h-5 w-5 relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="font-medium text-sm relative z-10">{label}</span>
    {active && (
      <ChevronRight className="h-4 w-4 ml-auto relative z-10 animate-pulse" />
    )}
  </button>
);

export default AdminDashboard;
