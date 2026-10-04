import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Package, DollarSign, ShoppingCart, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductOrder {
  id: string;
  user_id?: string;
  product_identifier: string;
  product_name: string;
  product_category?: string;
  base_price: number;
  total_amount: number;
  quantity: number;
  payment_status?: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: any;
  order_notes?: string;
  extras_data?: any;
  created_at: string;
  updated_at: string;
}

const AdminOrdersManager = () => {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'pending': return 'bg-amber-500/20 text-black border-amber-500/50';
      case 'processing': return 'bg-neutral-100 text-black border-neutral-200';
      case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'cancelled': return 'bg-gray-500/20 text-black border-gray-500/50';
      default: return 'bg-gray-500/20 text-black border-gray-500/50';
    }
  };

  const handleViewOrder = (order: ProductOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Calculate metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.payment_status === 'completed').length;
  const pendingOrders = orders.filter(o => o.payment_status === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.payment_status === 'completed')
    .reduce((sum, o) => sum + o.total_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Statistics - Command Center Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-neutral-100 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs  text-black uppercase tracking-wider">Total</span>
              <ShoppingCart className="h-5 w-5 text-black" />
            </div>
            <div className="text-3xl font-bold text-black neon-glow-cyan">{totalOrders}</div>
            <div className="h-1 w-full bg-neutral-50 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 data-stream"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs  text-green-400 uppercase tracking-wider">Completed</span>
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-300" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.6)'}}>{completedOrders}</div>
            <div className="h-1 w-full bg-green-900/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 data-stream"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs  text-black uppercase tracking-wider">Pending</span>
              <Calendar className="h-5 w-5 text-black" />
            </div>
            <div className="text-3xl font-bold text-black" style={{textShadow: '0 0 20px rgba(251, 191, 36, 0.6)'}}>{pendingOrders}</div>
            <div className="h-1 w-full bg-amber-900/30 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 data-stream"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform">
          <div className="absolute top-0 right-0 w-20 h-20 bg-neutral-100 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs  text-black uppercase tracking-wider">Revenue</span>
              <DollarSign className="h-5 w-5 text-black" />
            </div>
            <div className="text-2xl font-bold text-blue-100 neon-glow-blue">${totalRevenue.toLocaleString()}</div>
            <div className="h-1 w-full bg-neutral-50 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 data-stream"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table - Command Center Style */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-xl font-bold text-black  tracking-wide uppercase neon-glow-cyan mb-4">⬡ Orders Database ⬡</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
              <Input
                placeholder="SEARCH: ORDER ID / PRODUCT / CUSTOMER..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-neutral-200 text-black placeholder:text-neutral-500  text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white border-neutral-200 text-black  text-sm">
                  <SelectValue placeholder="FILTER STATUS" />
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-200">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="bg-white border-neutral-200 text-black hover:bg-neutral-100 ">
                <Download className="h-4 w-4 mr-2" />
                EXPORT
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-neutral-200 hover:bg-transparent">
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Order ID</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Product</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Qty</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Total</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-black  text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-b border-neutral-200 hover:bg-neutral-100 transition-colors">
                    <TableCell className=" text-xs text-black">
                      {order.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-black">{order.customer_name || 'N/A'}</p>
                        <p className="text-xs text-neutral-600 ">{order.customer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-black">{order.product_name}</p>
                        <p className="text-xs text-neutral-600 ">{order.product_category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-black ">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="font-bold text-black ">
                      ${order.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.payment_status || 'pending')}  text-xs uppercase`}>
                        {order.payment_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-black ">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="hover:bg-neutral-100 text-black"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-neutral-600 ">
              {orders.length === 0 ? 'NO ORDERS FOUND' : 'NO ORDERS MATCH SEARCH CRITERIA'}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className=" text-sm">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedOrder.payment_status || 'pending')}>
                        {selectedOrder.payment_status || 'pending'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{new Date(selectedOrder.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.customer_phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {selectedOrder.delivery_address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Address</p>
                      <div className="bg-muted/50 p-3 rounded-md text-sm">
                        {typeof selectedOrder.delivery_address === 'string' 
                          ? selectedOrder.delivery_address 
                          : JSON.stringify(selectedOrder.delivery_address, null, 2)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Product Name</p>
                      <p className="font-medium">{selectedOrder.product_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{selectedOrder.product_category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium">{selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Base Price</p>
                      <p className="font-medium">${selectedOrder.base_price.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-primary">${selectedOrder.total_amount.toLocaleString()}</p>
                  </div>

                  {selectedOrder.extras_data && Object.keys(selectedOrder.extras_data).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Extras/Add-ons</p>
                      <div className="bg-muted/50 p-3 rounded-md text-sm">
                        <pre>{JSON.stringify(selectedOrder.extras_data, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  {selectedOrder.order_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Order Notes</p>
                      <p className="font-medium">{selectedOrder.order_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersManager;