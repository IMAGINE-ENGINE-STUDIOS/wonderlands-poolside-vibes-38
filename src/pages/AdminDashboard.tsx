
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import DeliveryApiManager from '@/components/DeliveryApiManager';
import AdminContentEditor from '@/components/AdminContentEditor';
import RealApiManager from '@/components/RealApiManager';
import RealTimeContentEditor from '@/components/RealTimeContentEditor';
import LathamPoolsData from '@/components/LathamPoolsData';
import StandardizedProductManager from '@/components/StandardizedProductManager';
import AdminUserManagement from '@/components/AdminUserManagement';
import { DragDropEditor } from '@/components/DragDropEditor';

const AdminDashboard = () => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [editorActive, setEditorActive] = useState(false);
  

  // Mock GALA points data (in real implementation, this would come from API)
  const galaPointsData = {
    totalPoints: 125000,
    activeUsers: 450,
    pointsDistributed: 95000,
    pendingRewards: 30000
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  // Filter orders based on search and filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

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
              <p className="text-xs sm:text-sm text-muted-foreground">Manage products, orders, and content</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={refreshData} disabled={isLoading} size="sm" className="flex-1 sm:flex-none">
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs sm:text-sm">Refresh</span>
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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg. order: ${averageOrderValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">24</div>
              <p className="text-xs text-muted-foreground">
                18 pending quotes
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedOrders} completed, {pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Health</CardTitle>
              <Database className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">100%</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="unified-products" className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
            <TabsList className="grid w-full grid-cols-2 sm:flex sm:flex-wrap gap-1">
              <TabsTrigger value="unified-products" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Products</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Track and manage orders</CardDescription>
                
                {/* Search and Filter */}
                <div className="flex flex-col gap-2 sm:gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by ID or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>{order.customerId.slice(0, 8)}...</TableCell>
                        <TableCell>{order.products.length} items</TableCell>
                        <TableCell className="font-bold">${order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'processing' ? 'secondary' :
                            order.status === 'pending' ? 'outline' : 'destructive'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {orders.length === 0 ? 'No orders found' : 'No orders match your search criteria'}
                  </div>
                )}
              </CardContent>
            </Card>
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

          {/* Pavers Tab */}
          <TabsContent value="pavers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Paver & Coping Management
                </CardTitle>
                <CardDescription>
                  Manage different paver types, colors, and pricing options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaverManagementComponent />
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
