import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Truck,
  MapPin,
  DollarSign,
  Users
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
  type: 'retail' | 'delivery';
}

interface DeliveryOrder {
  id: string;
  customerName: string;
  address: string;
  items: string[];
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered';
  service: string;
  estimatedTime: string;
  cost: number;
}

const WorkingApiManager = () => {
  const { toast } = useToast();
  const [connections, setConnections] = useState<ApiConnection[]>([
    {
      id: 'home-depot',
      name: 'Home Depot',
      status: 'connected',
      lastSync: '2024-01-22 14:30',
      productsCount: 1250,
      features: ['Product Sync', 'Inventory', 'Pricing', 'Images'],
      type: 'retail'
    },
    {
      id: 'lowes',
      name: "Lowe's",
      status: 'disconnected',
      lastSync: 'Never',
      productsCount: 0,
      features: ['Product Sync', 'Inventory', 'Pricing', 'Images'],
      type: 'retail'
    },
    {
      id: 'target',
      name: 'Target',
      status: 'connected',
      lastSync: '2024-01-22 13:15',
      productsCount: 890,
      features: ['Product Sync', 'Pricing', 'Images'],
      type: 'retail'
    },
    {
      id: 'walmart',
      name: 'Walmart',
      status: 'error',
      lastSync: '2024-01-21 16:45',
      productsCount: 0,
      errorMessage: 'API key expired',
      features: ['Product Sync', 'Inventory', 'Pricing'],
      type: 'retail'
    },
    {
      id: 'uber-direct',
      name: 'Uber Direct',
      status: 'connected',
      lastSync: '2024-01-22 15:00',
      productsCount: 0,
      features: ['Same-day Delivery', 'Real-time Tracking', 'Cost Calculation', 'Driver Assignment'],
      type: 'delivery'
    },
    {
      id: 'uber-eats',
      name: 'Uber Eats Delivery',
      status: 'connected',
      lastSync: '2024-01-22 14:45',
      productsCount: 0,
      features: ['Food Delivery', 'Express Delivery', 'Real-time Tracking'],
      type: 'delivery'
    },
    {
      id: 'doordash',
      name: 'DoorDash Drive',
      status: 'pending',
      lastSync: 'Connecting...',
      productsCount: 0,
      features: ['Delivery', 'Real-time Tracking', 'Cost Calculation'],
      type: 'delivery'
    }
  ]);

  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      address: '123 Main St, Orlando, FL',
      items: ['Pool Filter', 'Chlorine Tablets'],
      status: 'pending',
      service: 'uber-direct',
      estimatedTime: '45 min',
      cost: 12.50
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      address: '456 Oak Ave, Tampa, FL',
      items: ['Pool Vacuum', 'Test Strips'],
      status: 'assigned',
      service: 'uber-direct',
      estimatedTime: '25 min',
      cost: 15.00
    }
  ]);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [selectedDeliveryService, setSelectedDeliveryService] = useState('uber-direct');

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
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'pending' as const }
        : conn
    ));

    toast({
      title: "Testing Connection",
      description: `Verifying ${connections.find(c => c.id === connectionId)?.name} API connection...`,
    });

    // Simulate API test
    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connected' as const, lastSync: new Date().toLocaleString(), errorMessage: undefined }
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
    const connection = connections.find(c => c.id === connectionId);
    
    toast({
      title: "Syncing Data",
      description: `Fetching latest data from ${connection?.name}...`,
    });

    setTimeout(() => {
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { 
              ...conn, 
              lastSync: new Date().toLocaleString(),
              productsCount: conn.type === 'retail' ? conn.productsCount + Math.floor(Math.random() * 50) : conn.productsCount
            }
          : conn
      ));
      
      toast({
        title: "Sync Complete",
        description: `${connection?.name} data updated successfully`,
      });
    }, 3000);
  };

  const assignDeliveryToUber = (orderId: string) => {
    setDeliveryOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'assigned' as const, service: selectedDeliveryService }
        : order
    ));

    toast({
      title: "Delivery Assigned",
      description: `Order ${orderId} assigned to ${connections.find(c => c.id === selectedDeliveryService)?.name}`,
    });
  };

  const testAllConnections = async () => {
    toast({
      title: "Testing All Connections",
      description: "Running connection tests for all APIs...",
    });

    for (const connection of connections) {
      if (connection.status !== 'pending') {
        await new Promise(resolve => setTimeout(resolve, 500));
        handleTestConnection(connection.id);
      }
    }
  };

  const retailConnections = connections.filter(c => c.type === 'retail');
  const deliveryConnections = connections.filter(c => c.type === 'delivery');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="retail" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="retail">Retail APIs</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Services</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="retail" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {retailConnections.map((connection) => (
              <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
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
                        {connection.status === 'pending' ? 'Testing...' : 'Test'}
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
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Service Connections */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delivery Service APIs</h3>
              {deliveryConnections.map((connection) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
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
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Delivery Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delivery Management</h3>
              
              {/* Delivery Service Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assign Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Select value={selectedDeliveryService} onValueChange={setSelectedDeliveryService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery service" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryConnections.filter(c => c.status === 'connected').map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deliveryOrders.map((order) => (
                      <div key={order.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{order.id}</span>
                          <Badge variant={order.status === 'delivered' ? 'default' : 
                                        order.status === 'assigned' ? 'secondary' : 'outline'}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {order.customerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.address}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {order.items.join(', ')}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${order.cost}
                          </div>
                        </div>
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => assignDeliveryToUber(order.id)}
                          >
                            Assign to {connections.find(c => c.id === selectedDeliveryService)?.name}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
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
                <Button className="flex-1" onClick={testAllConnections}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test All Connections
                </Button>
                <Button variant="outline" className="flex-1">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkingApiManager;