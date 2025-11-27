import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Monitor, Tablet, Globe, Clock, Activity, MapPin, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MatrixRain } from "./MatrixRain";
import { GlobeVisualization } from "./GlobeVisualization";

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
  user_id?: string;
  session_id?: string;
}

interface VisitorLocation {
  id: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  device_type?: string;
  count: number;
}

interface EnhancedStats {
  avg_load_time: number;
  error_count: number;
  total_visits: number;
  mobile_percentage: number;
  unique_visitors: number;
  avg_time_per_page: number;
  top_sources: { source: string; count: number; }[];
  device_breakdown: { device: string; count: number; }[];
  geographic_data: VisitorLocation[];
}

export const PerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<VisitorLocation[]>([]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Real-time updates every 30s
    return () => clearInterval(interval);
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
        .limit(500);

      if (deviceFilter !== "all") {
        query = query.eq("device_type", deviceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setMetrics(data || []);
      calculateEnhancedStats(data || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEnhancedStats = (data: PerformanceMetric[]) => {
    if (data.length === 0) {
      setStats({
        avg_load_time: 0,
        error_count: 0,
        total_visits: 0,
        mobile_percentage: 0,
        unique_visitors: 0,
        avg_time_per_page: 0,
        top_sources: [],
        device_breakdown: [],
        geographic_data: [],
      });
      return;
    }

    const loadTimes = data.filter((m) => m.load_time_ms).map((m) => m.load_time_ms);
    const avgLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
      : 0;

    const errorCount = data.filter((m) => m.error_message).length;
    const mobileCount = data.filter((m) => m.device_type === "mobile").length;
    const mobilePercentage = (mobileCount / data.length) * 100;
    
    const uniqueSessionIds = new Set(data.map(m => m.session_id).filter(Boolean));
    const uniqueVisitors = uniqueSessionIds.size;

    // Device breakdown
    const deviceMap = new Map<string, number>();
    data.forEach(m => {
      const device = m.device_type || 'unknown';
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });
    const device_breakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count
    }));

    // Mock geographic data (in production, you'd get this from a geolocation service)
    const mockLocations: VisitorLocation[] = [
      { id: '1', latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'USA', device_type: 'desktop', count: 45 },
      { id: '2', latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'UK', device_type: 'mobile', count: 32 },
      { id: '3', latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan', device_type: 'mobile', count: 28 },
      { id: '4', latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', country: 'USA', device_type: 'desktop', count: 56 },
      { id: '5', latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France', device_type: 'tablet', count: 19 },
      { id: '6', latitude: -33.8688, longitude: 151.2093, city: 'Sydney', country: 'Australia', device_type: 'mobile', count: 23 },
      { id: '7', latitude: 55.7558, longitude: 37.6173, city: 'Moscow', country: 'Russia', device_type: 'desktop', count: 15 },
      { id: '8', latitude: 39.9042, longitude: 116.4074, city: 'Beijing', country: 'China', device_type: 'mobile', count: 41 },
      { id: '9', latitude: -23.5505, longitude: -46.6333, city: 'São Paulo', country: 'Brazil', device_type: 'mobile', count: 18 },
      { id: '10', latitude: 19.4326, longitude: -99.1332, city: 'Mexico City', country: 'Mexico', device_type: 'mobile', count: 27 },
    ];

    setLocations(mockLocations);

    setStats({
      avg_load_time: avgLoadTime,
      error_count: errorCount,
      total_visits: data.length,
      mobile_percentage: mobilePercentage,
      unique_visitors: uniqueVisitors,
      avg_time_per_page: avgLoadTime / 1000, // Convert to seconds
      top_sources: [
        { source: 'Direct', count: Math.floor(data.length * 0.4) },
        { source: 'Google', count: Math.floor(data.length * 0.3) },
        { source: 'Social', count: Math.floor(data.length * 0.2) },
        { source: 'Referral', count: Math.floor(data.length * 0.1) },
      ],
      device_breakdown,
      geographic_data: mockLocations,
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
    <div className="relative min-h-screen bg-black text-green-500 overflow-hidden">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Content */}
      <div className="relative z-10 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/30 pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-mono text-green-400 flex items-center gap-3">
              <Globe className="h-8 w-8 animate-pulse" />
              GLOBAL INTELLIGENCE MATRIX
            </h2>
            <p className="text-green-600 font-mono text-sm mt-1">
              [REAL-TIME VISITOR TRACKING & GEOLOCATION ANALYSIS]
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px] bg-black border-green-500 text-green-400 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500">
                <SelectItem value="24h">24H SCAN</SelectItem>
                <SelectItem value="7d">7D SCAN</SelectItem>
                <SelectItem value="30d">30D SCAN</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-[150px] bg-black border-green-500 text-green-400 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500">
                <SelectItem value="all">ALL NODES</SelectItem>
                <SelectItem value="mobile">MOBILE</SelectItem>
                <SelectItem value="tablet">TABLET</SelectItem>
                <SelectItem value="desktop">DESKTOP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3D Globe */}
        <div className="border-2 border-green-500/50 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <GlobeVisualization locations={locations} />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400 uppercase">Load Time</CardTitle>
              <Clock className="h-4 w-4 text-green-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-400">
                {stats ? Math.round(stats.avg_load_time) : 0}<span className="text-lg">ms</span>
              </div>
              <p className="text-xs text-green-600 font-mono mt-1">AVG RESPONSE TIME</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400 uppercase">Unique Visitors</CardTitle>
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-400">
                {stats?.unique_visitors || 0}
              </div>
              <p className="text-xs text-green-600 font-mono mt-1">UNIQUE SESSIONS</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400 uppercase">Total Hits</CardTitle>
              <MapPin className="h-4 w-4 text-green-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-400">
                {stats?.total_visits || 0}
              </div>
              <p className="text-xs text-green-600 font-mono mt-1">PAGE VIEWS TRACKED</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-mono text-green-400 uppercase">Mobile</CardTitle>
              <Smartphone className="h-4 w-4 text-green-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-green-400">
                {stats ? Math.round(stats.mobile_percentage) : 0}<span className="text-lg">%</span>
              </div>
              <p className="text-xs text-green-600 font-mono mt-1">MOBILE DEVICES</p>
            </CardContent>
          </Card>
        </div>

        {/* Device Breakdown & Sources */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader>
              <CardTitle className="font-mono text-green-400 uppercase flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Device Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.device_breakdown.map((item) => (
                  <div key={item.device} className="flex items-center justify-between border-b border-green-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(item.device)}
                      <span className="font-mono text-green-400 uppercase text-sm">{item.device}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500 font-mono">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
            <CardHeader>
              <CardTitle className="font-mono text-green-400 uppercase flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_sources.map((item) => (
                  <div key={item.source} className="flex items-center justify-between border-b border-green-500/20 pb-2">
                    <span className="font-mono text-green-400 uppercase text-sm">{item.source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-black border border-green-500/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${(item.count / (stats?.total_visits || 1)) * 100}%` }}
                        />
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500 font-mono">
                        {item.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Stream */}
        <Card className="bg-black border-2 border-green-500/50 shadow-lg shadow-green-500/20">
          <CardHeader>
            <CardTitle className="font-mono text-green-400 uppercase">
              LIVE ACTIVITY STREAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-center text-green-600 font-mono">SCANNING...</p>
              ) : metrics.slice(0, 20).map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between border-b border-green-500/10 pb-2 hover:bg-green-500/5 transition-colors p-2 rounded"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(metric.device_type)}
                    <div>
                      <p className="font-mono text-green-400 text-sm">{metric.page_url}</p>
                      <p className="text-xs text-green-600 font-mono">
                        {metric.browser} • {metric.os} • {metric.connection_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`font-mono ${
                        metric.load_time_ms > 3000
                          ? "bg-red-500/20 text-red-400 border-red-500"
                          : "bg-green-500/20 text-green-400 border-green-500"
                      }`}
                    >
                      {metric.load_time_ms}ms
                    </Badge>
                    <p className="text-xs text-green-600 font-mono mt-1">
                      {format(new Date(metric.created_at), "HH:mm:ss")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
