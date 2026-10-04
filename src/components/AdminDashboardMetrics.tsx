import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Star, ShoppingCart, HardHat, Gift } from 'lucide-react';
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
  totalProjects: number;
  activeProjects: number;
}

// Animated count-up hook
const useCountUp = (target: number, duration = 1100) => {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
};

const StatTile: React.FC<{
  label: string;
  value: number;
  format: 'currency' | 'integer' | 'percent';
  subline: string;
  icon: React.ElementType;
  emphasis?: boolean;
  delay?: number;
  onClick?: () => void;
}> = ({ label, value, format, subline, icon: Icon, emphasis, delay = 0, onClick }) => {
  const animated = useCountUp(value);
  const display =
    format === 'currency'
      ? `$${Math.round(animated).toLocaleString()}`
      : format === 'percent'
      ? `${Math.round(animated)}%`
      : Math.round(animated).toLocaleString();

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`
        group relative ${onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]' : ''} bg-white p-6 rounded-xl
        border ${emphasis ? 'border-neutral-200' : 'border-neutral-200'}
        overflow-hidden
        transition-all duration-300
        hover:border-neutral-200 hover:-translate-y-0.5
        hover:shadow-[0_18px_50px_-20px_rgba(201,168,76,0.5)]
        animate-fade-in
      `}
      style={{ animationDelay: `${delay}ms`, fontFamily: "'Manrope', sans-serif" }}
    >
      {emphasis && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-100 rotate-45 translate-x-10 -translate-y-10 transition-transform duration-500 group-hover:scale-110" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between mb-5">
        <span
          className="text-[12px] uppercase tracking-[0.18em] text-[#c9a84c] font-bold leading-none"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {label}
        </span>
        <Icon className="h-5 w-5 text-neutral-600 transition-transform duration-300 group-hover:scale-110" />
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <span
          className="text-4xl lg:text-5xl font-light text-[#f5f3ee] tracking-tight tabular-nums leading-none"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {display}
        </span>
        <div className={`w-12 h-1 rounded-full ${emphasis ? 'bg-[#c9a84c]' : 'bg-neutral-100'}`} />
      </div>

      <p className="relative mt-4 text-[12px] text-neutral-600 font-medium tracking-wide">
        {subline}
      </p>
    </div>
  );
};

const SkeletonTile = () => (
  <div className="bg-white p-6 rounded-xl border border-neutral-200 h-[170px] animate-pulse">
    <div className="h-3 w-24 bg-neutral-100 rounded mb-6" />
    <div className="h-10 w-32 bg-neutral-100 rounded mb-3" />
    <div className="h-3 w-20 bg-neutral-100 rounded" />
  </div>
);

const AdminDashboardMetrics: React.FC<{ onNavigate?: (section: string) => void }> = ({ onNavigate }) => {
  const go = (s: string) => (onNavigate ? () => onNavigate(s) : undefined);
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
    totalProjects: 0,
    activeProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const [ordersRes, quotesRes, referralsRes, projectsRes] = await Promise.all([
        supabase.from('product_orders').select('total_amount, payment_status'),
        supabase.from('user_quotations').select('status'),
        supabase.from('referrals').select('status, estimated_commission'),
        supabase.from('construction_projects').select('status'),
      ]);
      const projects = (projectsRes.data || []) as { status: string | null }[];
      const orders = ordersRes.data || [];
      const quotes = quotesRes.data || [];
      const referrals = referralsRes.data || [];

      const completed = orders.filter(o => o.payment_status === 'completed');
      const totalRevenue = completed.reduce((s, o) => s + (o.total_amount || 0), 0);
      const avg = completed.length ? totalRevenue / completed.length : 0;

      const convertedRefs = referrals.filter(r => r.status === 'converted');

      setMetrics({
        totalRevenue,
        averageOrderValue: avg,
        totalOrders: orders.length,
        completedOrders: completed.length,
        pendingOrders: orders.filter(o => o.payment_status === 'pending').length,
        totalQuotes: quotes.length,
        pendingQuotes: quotes.filter(q => q.status === 'pending').length,
        totalReferrals: referrals.length,
        convertedReferrals: convertedRefs.length,
        totalCommissions: convertedRefs.reduce((s, r) => s + (r.estimated_commission || 0), 0),
        totalProjects: projects.length,
        activeProjects: projects.filter(p => !['completed', 'cancelled'].includes((p.status || '').toLowerCase())).length,
      });
    } catch (e) {
      console.error('Error fetching dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonTile key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
      <StatTile
        label="Revenue"
        onClick={go('orders')}
        value={metrics.totalRevenue}
        format="currency"
        subline={`Avg order $${metrics.averageOrderValue.toFixed(0)}`}
        icon={DollarSign}
        emphasis
        delay={0}
      />
      <StatTile
        label="Quotes"
        onClick={go('quotes')}
        value={metrics.totalQuotes}
        format="integer"
        subline={`${metrics.pendingQuotes} pending`}
        icon={Star}
        delay={70}
      />
      <StatTile
        label="Orders"
        onClick={go('orders')}
        value={metrics.totalOrders}
        format="integer"
        subline={`${metrics.completedOrders} done · ${metrics.pendingOrders} queue`}
        icon={ShoppingCart}
        delay={140}
      />
      <StatTile
        label="Referrals"
        onClick={go('referrals')}
        value={metrics.totalReferrals}
        format="integer"
        subline={`${metrics.convertedReferrals} converted`}
        icon={Gift}
        delay={210}
      />
      <StatTile
        label="Projects"
        onClick={go('projects')}
        value={metrics.totalProjects}
        format="integer"
        subline={`${metrics.activeProjects} in progress`}
        icon={HardHat}
        delay={280}
      />
    </div>
  );
};

export default AdminDashboardMetrics;
