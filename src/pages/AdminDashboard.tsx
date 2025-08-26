
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
import { DragDropEditor } from '@/components/DragDropEditor';
import AdminLogout from '@/components/AdminLogout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);

  // Get admin data from session
  useEffect(() => {
    const adminSession = sessionStorage.getItem('adminSession');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        setAdminData(session.adminData);
      } catch (error) {
        console.error('Error parsing admin session:', error);
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    navigate('/');
  };

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
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Calculate metrics from database (will be updated in real time)
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  const refreshData = async () => {
    // Mock refresh function
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Dashboard data refreshed",
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage products, orders, and content
                {adminData && (
                  <span className="ml-2 text-primary font-medium">
                    Welcome, {adminData.role}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={refreshData} disabled={isLoading} size="sm" className="flex-1 sm:flex-none">
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs sm:text-sm">Refresh</span>
              </Button>
              <AdminLogout adminData={adminData} onLogout={handleLogout} />
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
        <Tabs defaultValue="unified-products" className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
            <TabsList className="grid w-full grid-cols-3 sm:flex sm:flex-wrap gap-1">
              <TabsTrigger value="unified-products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Quotes</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Users</span>
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
              <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Unified Products Tab - NEW PRIMARY TAB */}
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUserManagement currentAdmin={null} />
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

          {/* Content Editor Tab */}
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

          {/* API Manager Tab */}
          <TabsContent value="api-manager" className="space-y-6">
            <RealApiManager />
          </TabsContent>

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

          {/* Delivery & Logistics Tab */}
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
        </Tabs>
      </div>

    </div>
  );
};

export default AdminDashboard;
