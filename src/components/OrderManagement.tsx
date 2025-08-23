import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Eye, Calendar, DollarSign, User } from 'lucide-react';

interface ProductOrder {
  id: string;
  user_id: string | null;
  product_identifier: string;
  product_name: string;
  product_category: string | null;
  product_type: string | null;
  base_price: number;
  extras_data: any;
  total_amount: number;
  quantity: number;
  stripe_session_id: string | null;
  payment_status: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: any;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderManagement = ({ isOpen, onClose }: OrderManagementProps) => {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('product_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getProductTypeIcon = (type: string | null) => {
    switch (type) {
      case 'pool': return '🏊‍♂️';
      case 'spa': return '🛁';
      case 'cart': return '🛒';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Management
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading orders...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Management ({orders.length} orders)
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 max-h-[60vh] overflow-auto">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  Orders will appear here once customers make purchases
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getProductTypeIcon(order.product_type)}</span>
                        <div>
                          <h4 className="font-semibold">{order.product_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {order.product_identifier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(order.payment_status)} text-white`}>
                          {order.payment_status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${order.total_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>{order.customer_email || 'Guest'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Qty: </span>
                        <span className="font-medium">{order.quantity}</span>
                      </div>
                    </div>

                    {order.extras_data && Array.isArray(order.extras_data) && order.extras_data.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Extras/Add-ons:</p>
                        <div className="flex flex-wrap gap-1">
                          {order.extras_data.slice(0, 3).map((extra, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {extra.name || `Extra ${idx + 1}`}
                            </Badge>
                          ))}
                          {order.extras_data.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{order.extras_data.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total revenue: ${orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString()}
            </p>
            <Button onClick={fetchOrders} variant="outline">
              Refresh Orders
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Product Name:</span>
                      <p>{selectedOrder.product_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Product ID:</span>
                      <p className="font-mono text-xs">{selectedOrder.product_identifier}</p>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <p>{selectedOrder.product_category || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p>{selectedOrder.product_type || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p>{selectedOrder.customer_email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Name:</span>
                      <p>{selectedOrder.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p>{selectedOrder.customer_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>
                      <p className="font-mono text-xs">{selectedOrder.user_id || 'Guest'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Base Price:</span>
                      <p>${selectedOrder.base_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total Amount:</span>
                      <p className="text-lg font-bold">${selectedOrder.total_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <p>{selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <span className="font-medium">Payment Status:</span>
                      <Badge className={`${getStatusColor(selectedOrder.payment_status)} text-white`}>
                        {selectedOrder.payment_status}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedOrder.stripe_session_id && (
                    <div>
                      <span className="font-medium">Stripe Session ID:</span>
                      <p className="font-mono text-xs break-all">{selectedOrder.stripe_session_id}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.extras_data && Array.isArray(selectedOrder.extras_data) && selectedOrder.extras_data.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add-ons & Extras</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedOrder.extras_data.map((extra, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{extra.name || `Extra ${idx + 1}`}</span>
                          <span>${extra.price?.toLocaleString() || '0'}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default OrderManagement;