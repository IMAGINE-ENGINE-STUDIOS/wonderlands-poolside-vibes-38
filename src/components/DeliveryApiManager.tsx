import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Loader2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface ApiConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  apiKey?: string;
  lastSync?: string;
  features: string[];
  errorMessage?: string;
  isEnabled: boolean;
}

interface DeliveryEstimate {
  service: string;
  estimatedTime: string;
  estimatedCost: number;
  available: boolean;
}

const DeliveryApiManager = () => {
  const [connections, setConnections] = useState<ApiConnection[]>([
    {
      id: 'uber-eats',
      name: 'Uber Eats',
      status: 'disconnected',
      features: ['Order Tracking', 'Price Estimates', 'Delivery Status'],
      isEnabled: false
    },
    {
      id: 'doordash',
      name: 'DoorDash',
      status: 'disconnected',
      features: ['Real-time Tracking', 'Batch Orders', 'Customer Support'],
      isEnabled: false
    },
    {
      id: 'grubhub',
      name: 'GrubHub',
      status: 'disconnected',
      features: ['Route Optimization', 'Delivery Windows', 'Analytics'],
      isEnabled: false
    },
    {
      id: 'postmates',
      name: 'Postmates',
      status: 'disconnected',
      features: ['Express Delivery', 'Package Tracking', 'Insurance'],
      isEnabled: false
    }
  ]);

  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryEstimates, setDeliveryEstimates] = useState<DeliveryEstimate[]>([]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'testing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'testing': return 'secondary';
      default: return 'outline';
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'testing' }
          : conn
      )
    );

    // Simulate API test
    setTimeout(() => {
      const hasApiKey = apiKeys[connectionId];
      const newStatus = hasApiKey ? 'connected' : 'error';
      const errorMessage = hasApiKey ? undefined : 'API key required';

      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { 
                ...conn, 
                status: newStatus,
                lastSync: newStatus === 'connected' ? new Date().toISOString() : undefined,
                errorMessage 
              }
            : conn
        )
      );
    }, 2000);
  };

  const handleUpdateApiKey = (connectionId: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [connectionId]: value }));
  };

  const handleSaveApiKey = async (connectionId: string) => {
    const apiKey = apiKeys[connectionId];
    if (!apiKey?.trim()) return;

    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, apiKey: apiKey.trim() }
          : conn
      )
    );

    // Test connection after saving
    await handleTestConnection(connectionId);
  };

  const toggleConnection = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, isEnabled: !conn.isEnabled }
          : conn
      )
    );
  };

  const getDeliveryEstimates = async () => {
    setIsLoading(true);
    // Simulate API calls to get delivery estimates
    setTimeout(() => {
      const estimates: DeliveryEstimate[] = [
        {
          service: 'Uber Eats',
          estimatedTime: '25-35 min',
          estimatedCost: 4.99,
          available: (connections.find(c => c.id === 'uber-eats')?.status === 'connected') || false
        },
        {
          service: 'DoorDash',
          estimatedTime: '30-40 min',
          estimatedCost: 3.99,
          available: (connections.find(c => c.id === 'doordash')?.status === 'connected') || false
        },
        {
          service: 'GrubHub',
          estimatedTime: '35-45 min',
          estimatedCost: 5.49,
          available: (connections.find(c => c.id === 'grubhub')?.status === 'connected') || false
        },
        {
          service: 'Postmates',
          estimatedTime: '20-30 min',
          estimatedCost: 6.99,
          available: (connections.find(c => c.id === 'postmates')?.status === 'connected') || false
        }
      ];
      setDeliveryEstimates(estimates);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    getDeliveryEstimates();
  }, [connections]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Delivery API Manager</h2>
          <p className="text-muted-foreground">Connect and manage third-party delivery service APIs</p>
        </div>
        <Button onClick={getDeliveryEstimates} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Estimates
        </Button>
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">API Connections</TabsTrigger>
          <TabsTrigger value="estimates">Delivery Estimates</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {connections.map((connection) => (
              <Card key={connection.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {connection.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(connection.status)}>
                        {getStatusIcon(connection.status)}
                        <span className="ml-1 capitalize">{connection.status}</span>
                      </Badge>
                      <Switch
                        checked={connection.isEnabled}
                        onCheckedChange={() => toggleConnection(connection.id)}
                        disabled={connection.status !== 'connected'}
                      />
                    </div>
                  </div>
                  <CardDescription>
                    {connection.features.join(' • ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connection.errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{connection.errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`api-key-${connection.id}`}>API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`api-key-${connection.id}`}
                        type="password"
                        placeholder="Enter API key"
                        value={apiKeys[connection.id] || ''}
                        onChange={(e) => handleUpdateApiKey(connection.id, e.target.value)}
                      />
                      <Button
                        onClick={() => handleSaveApiKey(connection.id)}
                        disabled={!apiKeys[connection.id]?.trim()}
                        size="sm"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(connection.id)}
                      disabled={connection.status === 'testing' || !connection.apiKey}
                    >
                      {connection.status === 'testing' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={`https://${connection.id.replace('-', '')}.com/developers`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        API Docs
                      </a>
                    </Button>
                  </div>

                  {connection.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(connection.lastSync).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="estimates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Real-time Delivery Estimates
              </CardTitle>
              <CardDescription>
                Compare delivery times and costs across all connected services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading estimates...</span>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {deliveryEstimates.map((estimate) => (
                    <Card key={estimate.service} className={`${!estimate.available ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{estimate.service}</h4>
                          {!estimate.available && (
                            <Badge variant="outline">Not Connected</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{estimate.estimatedTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${estimate.estimatedCost}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Standard delivery area</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global API Settings
              </CardTitle>
              <CardDescription>
                Configure global settings for all delivery API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Sync Interval (minutes)</Label>
                  <Input id="sync-interval" type="number" defaultValue="15" min="5" max="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input id="timeout" type="number" defaultValue="30" min="10" max="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-retries">Max Retry Attempts</Label>
                  <Input id="max-retries" type="number" defaultValue="3" min="1" max="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests/min)</Label>
                  <Input id="rate-limit" type="number" defaultValue="100" min="10" max="1000" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-connection-issues">Notify on connection issues</Label>
                    <Switch id="notify-connection-issues" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-rate-limits">Notify on rate limit warnings</Label>
                    <Switch id="notify-rate-limits" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-retry">Enable automatic retry</Label>
                    <Switch id="auto-retry" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Save Settings</Button>
                <Button variant="outline">Test All Connections</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryApiManager;