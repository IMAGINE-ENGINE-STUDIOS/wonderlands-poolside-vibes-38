import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Monitor, Tablet, AlertCircle, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PerformanceMetric {
  id: string;
  created_at: string;
  device_type: string;
  browser: string;
  os: string;
  page_url: string;
  load_time_ms: number;
  error_message?: string;
  error_type?: string;
  connection_type?: string;
}

interface Stats {
  avg_load_time: number;
  error_count: number;
  total_visits: number;
  mobile_percentage: number;
}

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [timeRange, deviceFilter]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const hoursMap: { [key: string]: number } = { "24h": 24, "7d": 168, "30d": 720 };
      const hours = hoursMap[timeRange];
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from("performance_metrics")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(100);

      if (deviceFilter !== "all") {
        query = query.eq("device_type", deviceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMetrics(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: PerformanceMetric[]) => {
    if (data.length === 0) {
      setStats({ avg_load_time: 0, error_count: 0, total_visits: 0, mobile_percentage: 0 });
      return;
    }

    const loadTimes = data.filter((m) => m.load_time_ms).map((m) => m.load_time_ms);
    const avgLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
      : 0;

    const errorCount = data.filter((m) => m.error_message).length;
    const mobileCount = data.filter((m) => m.device_type === "mobile").length;
    const mobilePercentage = (mobileCount / data.length) * 100;

    setStats({
      avg_load_time: avgLoadTime,
      error_count: errorCount,
      total_visits: data.length,
      mobile_percentage: mobilePercentage,
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Monitoring</h2>
          <p className="text-muted-foreground">Track app performance and errors on mobile devices</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="mobile">Mobile Only</SelectItem>
              <SelectItem value="tablet">Tablet Only</SelectItem>
              <SelectItem value="desktop">Desktop Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? Math.round(stats.avg_load_time) : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">Average page load time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.error_count || 0}</div>
            <p className="text-xs text-muted-foreground">Total errors tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_visits || 0}</div>
            <p className="text-xs text-muted-foreground">Page views tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Traffic</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? Math.round(stats.mobile_percentage) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Mobile device usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Page Loads</CardTitle>
              <CardDescription>Latest performance measurements across devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : metrics.filter((m) => !m.error_message).length === 0 ? (
                  <p className="text-center text-muted-foreground">No data available</p>
                ) : (
                  metrics
                    .filter((m) => !m.error_message)
                    .slice(0, 20)
                    .map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          {getDeviceIcon(metric.device_type)}
                          <div>
                            <p className="font-medium">{metric.page_url}</p>
                            <p className="text-sm text-muted-foreground">
                              {metric.browser} on {metric.os} • {metric.connection_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={metric.load_time_ms > 3000 ? "destructive" : "secondary"}
                          >
                            {metric.load_time_ms}ms
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(metric.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Log</CardTitle>
              <CardDescription>JavaScript and network errors tracked in production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : metrics.filter((m) => m.error_message).length === 0 ? (
                  <p className="text-center text-muted-foreground">No errors found</p>
                ) : (
                  metrics
                    .filter((m) => m.error_message)
                    .map((metric) => (
                      <div
                        key={metric.id}
                        className="flex items-start gap-3 border-b pb-3 last:border-0"
                      >
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="destructive">{metric.error_type}</Badge>
                            {getDeviceIcon(metric.device_type)}
                            <span className="text-sm text-muted-foreground">
                              {metric.browser} on {metric.os}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{metric.error_message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metric.page_url} •{" "}
                            {format(new Date(metric.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
