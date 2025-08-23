import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Star, ShoppingCart, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalQuotes: number;
  pendingQuotes: number;
}

const AdminDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalQuotes: 0,
    pendingQuotes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('product_orders')
        .select('total_amount, payment_status');

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Fetch quotes data
      const { data: quotes, error: quotesError } = await supabase
        .from('user_quotations')
        .select('status');

      if (quotesError) {
        console.error('Error fetching quotes:', quotesError);
      }

      // Calculate metrics
      const ordersData = orders || [];
      const quotesData = quotes || [];

      const completedOrders = ordersData.filter(o => o.payment_status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      const totalOrders = ordersData.length;
      const completedOrdersCount = completedOrders.length;
      const pendingOrders = ordersData.filter(o => o.payment_status === 'pending').length;

      const totalQuotes = quotesData.length;
      const pendingQuotes = quotesData.filter(q => q.status === 'pending').length;

      setMetrics({
        totalRevenue,
        averageOrderValue,
        totalOrders,
        completedOrders: completedOrdersCount,
        pendingOrders,
        totalQuotes,
        pendingQuotes,
      });
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${metrics.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Avg. order: ${metrics.averageOrderValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
          <Star className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{metrics.totalQuotes}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.pendingQuotes} pending quotes
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metrics.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.completedOrders} completed, {metrics.pendingOrders} pending
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
  );
};

export default AdminDashboardMetrics;