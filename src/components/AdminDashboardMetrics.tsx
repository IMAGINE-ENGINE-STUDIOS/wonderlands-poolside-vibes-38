import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Star, ShoppingCart, Database, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalQuotes: number;
  pendingQuotes: number;
  totalReferrals: number;
  convertedReferrals: number;
  totalCommissions: number;
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
    totalReferrals: 0,
    convertedReferrals: 0,
    totalCommissions: 0,
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

      // Fetch referrals data
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status, estimated_commission');

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      }

      // Calculate metrics
      const ordersData = orders || [];
      const quotesData = quotes || [];
      const referralsData = referrals || [];

      const completedOrders = ordersData.filter(o => o.payment_status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      const totalOrders = ordersData.length;
      const completedOrdersCount = completedOrders.length;
      const pendingOrders = ordersData.filter(o => o.payment_status === 'pending').length;

      const totalQuotes = quotesData.length;
      const pendingQuotes = quotesData.filter(q => q.status === 'pending').length;

      const totalReferrals = referralsData.length;
      const convertedReferrals = referralsData.filter(r => r.status === 'converted').length;
      const totalCommissions = referralsData
        .filter(r => r.status === 'converted')
        .reduce((sum, r) => sum + (r.estimated_commission || 0), 0);

      setMetrics({
        totalRevenue,
        averageOrderValue,
        totalOrders,
        completedOrders: completedOrdersCount,
        pendingOrders,
        totalQuotes,
        pendingQuotes,
        totalReferrals,
        convertedReferrals,
        totalCommissions,
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Revenue Panel */}
      <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">Revenue</span>
            <DollarSign className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold neon-glow-cyan text-cyan-300 mb-1">
            ${metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 data-stream"></div>
            </div>
          </div>
          <p className="text-xs text-cyan-400/60 mt-2 font-mono">
            AVG ${metrics.averageOrderValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quotes Panel */}
      <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Quotes</span>
            <Star className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-300 mb-1" style={{textShadow: '0 0 20px rgba(251, 191, 36, 0.6)'}}>
            {metrics.totalQuotes}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-full bg-amber-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 data-stream"></div>
            </div>
          </div>
          <p className="text-xs text-amber-400/60 mt-2 font-mono">
            {metrics.pendingQuotes} PENDING
          </p>
        </div>
      </div>

      {/* Orders Panel */}
      <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-blue-400 tracking-wider uppercase">Orders</span>
            <ShoppingCart className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold neon-glow-blue text-blue-300 mb-1">
            {metrics.totalOrders}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-full bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 data-stream"></div>
            </div>
          </div>
          <p className="text-xs text-blue-400/60 mt-2 font-mono">
            {metrics.completedOrders} DONE / {metrics.pendingOrders} QUEUE
          </p>
        </div>
      </div>

      {/* Referrals Panel */}
      <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-pink-400 tracking-wider uppercase">Referrals</span>
            <Gift className="h-5 w-5 text-pink-400" />
          </div>
          <div className="text-3xl font-bold text-pink-300 mb-1" style={{textShadow: '0 0 20px rgba(236, 72, 153, 0.6)'}}>
            {metrics.totalReferrals}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-full bg-pink-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 data-stream"></div>
            </div>
          </div>
          <p className="text-xs text-pink-400/60 mt-2 font-mono">
            {metrics.convertedReferrals} CONVERTED
          </p>
        </div>
      </div>

      {/* System Health Panel */}
      <div className="holographic-panel rounded-lg p-4 relative overflow-hidden group hover:scale-105 transition-transform duration-300 pulse-glow">
        <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-green-400 tracking-wider uppercase">System</span>
            <Database className="h-5 w-5 text-green-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-green-300 mb-1" style={{textShadow: '0 0 20px rgba(34, 197, 94, 0.6)'}}>
            100%
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-full bg-green-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-green-400/60 mt-2 font-mono">
            ALL SYSTEMS NOMINAL
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMetrics;