import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, RefreshCw, Search } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  user_id: string | null;
  customer_email: string | null;
}

interface AdminOrdersManagerProps {
  isSimplified?: boolean;
  currentUser?: any;
}

const AdminOrdersManager = ({ isSimplified = false, currentUser }: AdminOrdersManagerProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const toUiStatus = (paymentStatus?: string): 'pending' | 'processing' | 'completed' | 'cancelled' => {
    const status = (paymentStatus || '').toLowerCase();
    if (status === 'paid' || status === 'succeeded' || status === 'completed') return 'completed';
    if (status === 'failed' || status === 'canceled' || status === 'cancelled') return 'cancelled';
    if (status === 'processing') return 'processing';
    return 'pending';
  };

  const loadOrders = async () => {
    try {
      let query = supabase
        .from('product_orders')
        .select('id, created_at, total_amount, payment_status, user_id, customer_email')
        .order('created_at', { ascending: false });

      // If simplified view, only show orders for current user's products/services
      if (isSimplified && currentUser) {
        if (currentUser.role === 'supplier') {
          // For suppliers, show orders for their products
          // This would need to be joined with products table in a real implementation
          query = query.eq('user_id', currentUser.id);
        } else if (currentUser.role === 'installer') {
          // For contractors, show orders for their services
          // This would also need proper filtering in a real implementation
          query = query.eq('user_id', currentUser.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedOrders: Order[] = (data || []).map(row => ({
        id: row.id,
        order_number: String(row.id).slice(0, 8).toUpperCase(),
        created_at: row.created_at,
        status: toUiStatus(row.payment_status),
        total_amount: Number(row.total_amount || 0),
        user_id: row.user_id,
        customer_email: row.customer_email,
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isSimplified, currentUser]);

  const refreshOrders = async () => {
    setIsLoading(true);
    await loadOrders();
    setIsLoading(false);
    toast({
      title: "Orders Refreshed",
      description: "Order data has been updated.",
    });
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const searchMatch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return statusMatch && searchMatch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {isSimplified ? 'Your Orders' : 'Order Management'}
            </CardTitle>
            <CardDescription>
              {isSimplified 
                ? 'Track and manage orders for your products and services'
                : 'Monitor and manage all customer orders'
              }
            </CardDescription>
          </div>
          {!isSimplified && (
            <Button onClick={refreshOrders} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Input
              type="text"
              placeholder="Search order number or customer email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>{order.customer_email || 'N/A'}</TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === 'completed' ? 'secondary' :
                    order.status === 'cancelled' ? 'destructive' : 'default'
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-4">
            <Search className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No orders found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersManager;
