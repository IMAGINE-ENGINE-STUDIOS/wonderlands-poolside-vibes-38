
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {isMainAdmin ? 'Admin Dashboard' : `${profile?.role === 'supplier' ? 'Supplier' : 'Contractor'} Dashboard`}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isMainAdmin ? 'Manage products, orders, and content' : 'Manage your business operations'}
                {profile && (
                  <span className="ml-2 text-primary font-medium">
                    Welcome, {profile.first_name} {profile.last_name} ({profile.company_name})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={refreshData} disabled={isLoading} size="sm" className="flex-1 sm:flex-none">
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs sm:text-sm">Refresh</span>
              </Button>
              <Button variant="outline" onClick={handleLogout} size="sm" className="flex-1 sm:flex-none">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Logout</span>
              </Button>
              <Link to="/" className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="w-full">
                  <span className="text-xs sm:text-sm">Back to Site</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Key Metrics */}
        <AdminDashboardMetrics />

        {/* Main Content Tabs */}
        <Tabs defaultValue={isMainAdmin ? "quotes" : "procurement"} className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
            <TabsList className="grid w-full grid-cols-3 sm:flex sm:flex-wrap gap-1">
              {/* For contractors and suppliers: limited tabs */}
              {isContractorOrSupplier && (
                <>
                  <TabsTrigger value="procurement" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Procurement</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Orders</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="api-keys" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">API Keys</span>
                  </TabsTrigger>
                </>
              )}

              {/* For main admin: full tabs */}
              {isMainAdmin && (
                <>
                  <TabsTrigger value="unified-products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Products</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="quotes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Quotes</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="quote-tool" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Quote Tool</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="invoices" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Invoices</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="invoice-tool" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Invoice Tool</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Orders</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Users</span>
                  </TabsTrigger>

                  <TabsTrigger value="referrals" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Referrals</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="api-manager" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">API</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="pool-specs" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Specs</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="delivery-logistics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Delivery</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="content-editor" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Content Editor</span>
                    <span className="sm:hidden">Content</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="procurement" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Procurement</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Stats</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="setup" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Setup</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* Products Tab - Only for main admins */}
          {isMainAdmin && (
            <TabsContent value="unified-products" className="space-y-6">
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
            </TabsContent>
          )}

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <AdminOrdersManager />
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <AdminQuotesManager />
          </TabsContent>

          {/* Quote Tool Tab */}
          <TabsContent value="quote-tool" className="space-y-6">
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
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <AdminInvoicesManager />
          </TabsContent>

          {/* Invoice Tool Tab */}
          <TabsContent value="invoice-tool" className="space-y-6">
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
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <AdminReferralsManager />
          </TabsContent>

          {/* Content Editor Tab - Only for main admins */}
          {isMainAdmin && (
            <TabsContent value="content-editor" className="space-y-6">
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
            </TabsContent>
          )}

          {/* API Manager Tab - Main Admin Only */}
          {isMainAdmin && (
            <TabsContent value="api-manager" className="space-y-6">
              <RealApiManager />
            </TabsContent>
          )}

          {/* API Keys Tab - Contractors and Suppliers */}
          {isContractorOrSupplier && (
            <TabsContent value="api-keys" className="space-y-6">
              <ApiKeyManager />
            </TabsContent>
          )}

          {/* Pool Specs Tab */}
          <TabsContent value="pool-specs" className="space-y-6">
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
          </TabsContent>

          {/* Delivery & Logistics Tab - Hidden from installers */}
          {!isInstaller && (
            <TabsContent value="delivery-logistics" className="space-y-6">
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
            </TabsContent>
          )}

          {/* Procurement Tab */}
          <TabsContent value="procurement" className="space-y-6">
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
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
          </TabsContent>
          {/* Setup Tab - Main Admin Only */}
          {isMainAdmin && (
            <TabsContent value="setup" className="space-y-6">
              <SampleDataSetup />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
