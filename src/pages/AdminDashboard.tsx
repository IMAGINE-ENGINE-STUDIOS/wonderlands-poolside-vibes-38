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
  Cpu
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
import PoolManager from '@/components/PoolManager';
import RealTimeContentEditor from '@/components/RealTimeContentEditor';
import ImaginalyFullEditor from '@/components/ImaginalyFullEditor';
import LathamPoolsData from '@/components/LathamPoolsData';

const AdminDashboard = () => {
  // Mock data for demonstration
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [adminSession, setAdminSession] = useState(null);

  // Check for admin session on component mount
  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      try {
        setAdminSession(JSON.parse(session));
      } catch (error) {
        console.error('Failed to parse admin session:', error);
        localStorage.removeItem('adminSession');
      }
    }
  }, []);

  // Remove data loading effect since GALA-GOODS is removed

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

  if (!adminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Pool Systems Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome back, {adminSession.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/">
                <Button variant="outline">Back to Site</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {businesses.length} businesses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <TabsList className="flex flex-wrap gap-1">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
               <TabsTrigger value="pool-manager" className="flex items-center gap-2">
                 <Package className="h-4 w-4" />
                 Pool Manager
               </TabsTrigger>
               <TabsTrigger value="api-manager" className="flex items-center gap-2">
                 <Users className="h-4 w-4" />
                 API Manager
               </TabsTrigger>
               <TabsTrigger value="3d-editor" className="flex items-center gap-2">
                 <Cpu className="h-4 w-4" />
                 3D Editor
               </TabsTrigger>
               <TabsTrigger value="pool-specs" className="flex items-center gap-2">
                 <Package className="h-4 w-4" />
                 Pool Specs
               </TabsTrigger>
              <TabsTrigger value="delivery-logistics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Delivery & Logistics
              </TabsTrigger>
              <TabsTrigger value="content-editor" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Content Editor
              </TabsTrigger>
               <TabsTrigger value="delivery-apis" className="flex items-center gap-2">
                 <Star className="h-4 w-4" />
                 Delivery APIs
               </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and manage all pool installation orders</CardDescription>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by ID or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-[180px]">
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
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Product Catalog
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
                <CardDescription>Manage your pool product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <Badge variant="secondary">${product.price}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {product.description || 'No description available'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Stock: {product.stock || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Category: {product.category || 'Uncategorized'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found. Add your first product to get started.
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
                  Content Management System
                </CardTitle>
                <CardDescription>
                  Edit all text content, manage sections, add text boxes, and change images across your entire website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowContentEditor(true)}
                    className="w-full h-16 text-lg"
                  >
                    <Edit className="h-6 w-6 mr-3" />
                    Launch Real-Time Content Editor
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Edit className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">Edit Text</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Modify any text content on your website with our visual editor
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Plus className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold">Add Sections</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add new content sections and customizable text boxes anywhere
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        <h3 className="font-semibold">Manage Images</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload and replace images throughout your website easily
                      </p>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pool Manager Tab */}
          <TabsContent value="pool-manager" className="space-y-6">
            <PoolManager />
          </TabsContent>

          {/* API Manager Tab */}
          <TabsContent value="api-manager" className="space-y-6">
            <RealApiManager />
          </TabsContent>

          {/* 3D Editor Tab */}
          <TabsContent value="3d-editor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Advanced 3D Pool Editor
                </CardTitle>
                <CardDescription>
                  Professional 3D editor with skybox support, shader management, and file uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImaginalyFullEditor />
              </CardContent>
            </Card>
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
          </TabsContent>

          {/* Delivery APIs Tab */}
          <TabsContent value="delivery-apis" className="space-y-6">
            <DeliveryApiManager />
          </TabsContent>

          {/* GALA Points Tab */}
          <TabsContent value="gala-points" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Points Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Points Pool</span>
                    <span className="text-lg font-bold text-amber-600">
                      {galaPointsData.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Points Distributed</span>
                    <span className="text-lg font-bold text-green-600">
                      {galaPointsData.pointsDistributed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending Rewards</span>
                    <span className="text-lg font-bold text-blue-600">
                      {galaPointsData.pendingRewards.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Users</span>
                    <span className="text-lg font-bold">
                      {galaPointsData.activeUsers}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Points Management</CardTitle>
                  <CardDescription>Manage GALA points distribution and rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Reward Campaign
                  </Button>
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Points Analytics
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage User Points
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Track your GALA-GOODS revenue performance</CardDescription>
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
                  <CardTitle>Business Insights</CardTitle>
                  <CardDescription>Key metrics and insights for your platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-bold">
                        {orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Businesses</span>
                      <span className="font-bold">{businesses.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Products per Business</span>
                      <span className="font-bold">
                        {businesses.length > 0 ? (products.length / businesses.length).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Content Editor Modal */}
      <RealTimeContentEditor 
        isOpen={showContentEditor} 
        onClose={() => setShowContentEditor(false)} 
      />
    </div>
  );
};

export default AdminDashboard;