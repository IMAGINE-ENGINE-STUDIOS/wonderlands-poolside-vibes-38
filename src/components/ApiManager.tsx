import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Key,
  Wifi,
  Package,
  RefreshCw,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string;
  productsCount: number;
  apiKey?: string;
  errorMessage?: string;
  features: string[];
}

const ApiManager = () => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<ApiConnection[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'disconnected',
      lastSync: 'Never',
      productsCount: 0,
      features: ['Payments', 'Checkout', 'Subscriptions', 'Webhooks']
    },
    {
      id: 'home-depot',
      name: 'Home Depot',
      status: 'connected',
      lastSync: '2024-01-22 14:30',
      productsCount: 1250,
      features: ['Product Sync', 'Inventory', 'Pricing', 'Images']
    },
    {
      id: 'lowes',
      name: "Lowe's",
      status: 'disconnected',
      lastSync: 'Never',
      productsCount: 0,
      features: ['Product Sync', 'Inventory', 'Pricing', 'Images']
    },
    {
      id: 'target',
      name: 'Target',
      status: 'connected',
      lastSync: '2024-01-22 13:15',
      productsCount: 890,
      features: ['Product Sync', 'Pricing', 'Images']
    },
    {
      id: 'walmart',
      name: 'Walmart',
      status: 'error',
      lastSync: '2024-01-21 16:45',
      productsCount: 0,
      errorMessage: 'API key expired',
      features: ['Product Sync', 'Inventory', 'Pricing']
    },
    {
      id: 'uber',
      name: 'Uber Direct',
      status: 'connected',
      lastSync: '2024-01-22 15:00',
      productsCount: 0,
      features: ['Delivery', 'Real-time Tracking', 'Cost Calculation']
    },
    {
      id: 'doordash',
      name: 'DoorDash Drive',
      status: 'pending',
      lastSync: 'Connecting...',
      productsCount: 0,
      features: ['Delivery', 'Real-time Tracking', 'Cost Calculation']
    }
  ]);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'error':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    toast({
      title: "Testing Connection",
      description: "Verifying API connection...",
    });

    // Simulate API test
    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connected' as const, lastSync: new Date().toLocaleString() }
          : conn
      ));
      
      toast({
        title: "Connection Successful",
        description: "API connection verified successfully",
      });
    }, 2000);
  };

  const handleUpdateApiKey = (connectionId: string) => {
    const newKey = apiKeys[connectionId];
    if (!newKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive"
      });
      return;
    }

    // Update the connection
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, apiKey: newKey, status: 'pending' as const }
        : conn
    ));

    setEditingKey(null);
    setApiKeys(prev => ({ ...prev, [connectionId]: '' }));

    toast({
      title: "API Key Updated",
      description: "Testing new connection...",
    });

    // Simulate connection test
    setTimeout(() => {
      handleTestConnection(connectionId);
    }, 1000);
  };

  const handleSync = async (connectionId: string) => {
    toast({
      title: "Syncing Data",
      description: "Fetching latest product data...",
    });

    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { 
              ...conn, 
              lastSync: new Date().toLocaleString(),
              productsCount: conn.productsCount + Math.floor(Math.random() * 50)
            }
          : conn
      ));
      
      toast({
        title: "Sync Complete",
        description: "Product data updated successfully",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {connection.id === 'stripe' ? 
                    <CreditCard className="h-5 w-5 text-primary" /> : 
                    <Package className="h-5 w-5 text-primary" />
                  }
                  {connection.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(connection.status)}
                  <Badge variant={getStatusColor(connection.status)}>
                    {connection.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Last sync: {connection.lastSync}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {connection.errorMessage && (
                <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {connection.errorMessage}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products</span>
                  <span className="font-medium">{connection.productsCount}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Features:</span>
                  <div className="flex flex-wrap gap-1">
                    {connection.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {/* API Key Management */}
                {editingKey === connection.id ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Enter API key..."
                        value={apiKeys[connection.id] || ''}
                        onChange={(e) => setApiKeys(prev => ({
                          ...prev,
                          [connection.id]: e.target.value
                        }))}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateApiKey(connection.id)}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingKey(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setEditingKey(connection.id)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {connection.apiKey ? 'Update API Key' : 'Set API Key'}
                  </Button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestConnection(connection.id)}
                    disabled={connection.status === 'pending'}
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSync(connection.id)}
                    disabled={connection.status !== 'connected'}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Global API Settings
          </CardTitle>
          <CardDescription>
            Configure global settings for all API integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sync Interval (minutes)</label>
              <Input type="number" defaultValue="60" min="5" max="1440" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Request Timeout (seconds)</label>
              <Input type="number" defaultValue="30" min="5" max="300" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Products per Sync</label>
              <Input type="number" defaultValue="1000" min="100" max="10000" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-retry Failed Requests</label>
              <div className="flex items-center gap-2 pt-2">
                <Switch defaultChecked />
                <span className="text-sm text-muted-foreground">Enable</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Test All Connections
            </Button>
            <Button variant="outline" className="flex-1">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManager;