import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  tracking_number?: string;
  created_at: string;
  products?: {
    name: string;
    image_url?: string;
  };
}

const ConsumerOrders = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
    }
  }, [profile?.id]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (name, image_url)
        `)
        .eq('consumer_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 border-green-600';
      case 'processing':
        return 'text-blue-600 border-blue-600';
      case 'shipped':
        return 'text-purple-600 border-purple-600';
      case 'cancelled':
        return 'text-red-600 border-red-600';
      default:
        return 'text-yellow-600 border-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No orders found</p>
        <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            {order.products?.image_url && (
              <img
                src={order.products.image_url}
                alt={order.products?.name}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div>
              <p className="font-medium">{order.products?.name || 'Product'}</p>
              <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground">
                Quantity: {order.quantity} × ${order.unit_price}
              </p>
              {order.tracking_number && (
                <p className="text-xs text-muted-foreground">
                  Tracking: {order.tracking_number}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${order.total_amount}</p>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConsumerOrders;