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
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGalaGoods } from '@/contexts/GalaGoodsContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { GalaGoodsIntegration } from '@/components/GalaGoodsIntegration';

const AdminDashboard = () => {
  const { 
    user,
    products, 
    orders, 
    businesses,
    isLoading,
    loadProducts,
    loadOrders,
    loadBusinesses
  } = useGalaGoods();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadProducts(),
          loadOrders(),
          loadBusinesses()
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, []);

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
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadBusinesses()
      ]);
      toast({
        title: "Success",
        description: "Dashboard data refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    }
  };

  if (!user) {
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
                GALA-GOODS Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Welcome back, {user.name || user.email}</p>
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
              <CardTitle className="text-sm font-medium">GALA Points</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{galaPointsData.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {galaPointsData.activeUsers} active users
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="gala-goods" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Gala Goods
            </TabsTrigger>
            <TabsTrigger value="gala-points" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              GALA Points
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Track and manage all orders in the GALA-GOODS ecosystem</CardDescription>
                
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
                <CardDescription>Manage your GALA-GOODS product inventory</CardDescription>
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

          {/* Gala Goods Tab */}
          <TabsContent value="gala-goods" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  GALA-GOODS Integration
                </CardTitle>
                <CardDescription>
                  Manage your GALA-GOODS API integration and access platform features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GalaGoodsIntegration />
              </CardContent>
            </Card>
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
    </div>
  );
};

export default AdminDashboard;