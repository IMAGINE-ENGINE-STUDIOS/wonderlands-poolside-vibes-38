import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, AlertCircle, Settings, RotateCw, Key, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApiConfiguration {
  id?: string;
  service_name: string;
  service_type: 'retail' | 'delivery';
  api_key?: string;
  api_secret?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync?: string;
  products_count?: number;
  features?: string[];
  error_message?: string;
  is_enabled?: boolean;
  config_data?: any;
}

const RealApiManager = () => {
  const [apiConfigs, setApiConfigs] = useState<ApiConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiConfiguration | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKeyForm, setApiKeyForm] = useState({ api_key: '', api_secret: '' });

  useEffect(() => {
    fetchApiConfigurations();
  }, []);

  const fetchApiConfigurations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('api_configurations')
        .select('*')
        .order('service_name');

      if (error) throw error;
      setApiConfigs(data || []);
    } catch (error) {
      console.error('Error fetching API configurations:', error);
      toast.error('Failed to fetch API configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!editingApi?.id) return;

    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('api_configurations')
        .update({
          api_key: apiKeyForm.api_key,
          api_secret: apiKeyForm.api_secret,
          status: 'pending'
        })
        .eq('id', editingApi.id);

      if (error) throw error;
      
      toast.success('API key updated successfully');
      setShowApiKeyDialog(false);
      setApiKeyForm({ api_key: '', api_secret: '' });
      fetchApiConfigurations();
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (apiConfig: ApiConfiguration) => {
    setIsLoading(true);
    try {
      // Update status to pending
      await (supabase as any)
        .from('api_configurations')
        .update({ status: 'pending' })
        .eq('id', apiConfig.id);

      // Simulate API test (replace with actual API testing logic)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update with test result
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      await (supabase as any)
        .from('api_configurations')
        .update({ 
          status: isSuccess ? 'connected' : 'error',
          error_message: isSuccess ? null : 'Connection failed - please check your API credentials',
          last_sync: isSuccess ? new Date().toISOString() : undefined
        })
        .eq('id', apiConfig.id);

      toast.success(isSuccess ? 'Connection test successful' : 'Connection test failed');
      fetchApiConfigurations();
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async (apiConfig: ApiConfiguration) => {
    if (apiConfig.status !== 'connected') {
      toast.error('API must be connected before syncing');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate data sync (replace with actual sync logic)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newProductCount = Math.floor(Math.random() * 500) + 100;
      await (supabase as any)
        .from('api_configurations')
        .update({ 
          last_sync: new Date().toISOString(),
          products_count: newProductCount
        })
        .eq('id', apiConfig.id);

      toast.success(`Synced ${newProductCount} products successfully`);
      fetchApiConfigurations();
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = async (apiConfig: ApiConfiguration) => {
    try {
      await (supabase as any)
        .from('api_configurations')
        .update({ is_enabled: !apiConfig.is_enabled })
        .eq('id', apiConfig.id);

      toast.success(`${apiConfig.service_name} ${!apiConfig.is_enabled ? 'enabled' : 'disabled'}`);
      fetchApiConfigurations();
    } catch (error) {
      console.error('Error toggling API status:', error);
      toast.error('Failed to update API status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const retailApis = apiConfigs.filter(api => api.service_type === 'retail');
  const deliveryApis = apiConfigs.filter(api => api.service_type === 'delivery');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">API Management</h2>
        <p className="text-muted-foreground">Manage external API connections and integrations</p>
      </div>

      <Tabs defaultValue="retail" className="space-y-6">
        <TabsList>
          <TabsTrigger value="retail">Retail APIs ({retailApis.length})</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Services ({deliveryApis.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="retail" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retailApis.map((apiConfig) => (
              <Card key={apiConfig.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg capitalize">
                      {apiConfig.service_name.replace('-', ' ')}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(apiConfig.status)}
                      <Switch
                        checked={apiConfig.is_enabled || false}
                        onCheckedChange={() => handleToggleEnabled(apiConfig)}
                      />
                    </div>
                  </div>
                  <Badge className={getStatusColor(apiConfig.status)}>
                    {apiConfig.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  {apiConfig.features && (
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {apiConfig.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {apiConfig.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{apiConfig.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Products: {apiConfig.products_count || 0}</p>
                    {apiConfig.last_sync && (
                      <p>Last sync: {new Date(apiConfig.last_sync).toLocaleString()}</p>
                    )}
                    {apiConfig.error_message && (
                      <p className="text-red-600 text-xs">{apiConfig.error_message}</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(apiConfig)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncData(apiConfig)}
                      disabled={isLoading || apiConfig.status !== 'connected'}
                    >
                      <RotateCw className="w-3 h-3 mr-1" />
                      Sync
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingApi(apiConfig);
                        setApiKeyForm({
                          api_key: apiConfig.api_key || '',
                          api_secret: apiConfig.api_secret || ''
                        });
                        setShowApiKeyDialog(true);
                      }}
                    >
                      <Key className="w-3 h-3 mr-1" />
                      API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryApis.map((apiConfig) => (
              <Card key={apiConfig.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg capitalize">
                      {apiConfig.service_name.replace('-', ' ')}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(apiConfig.status)}
                      <Switch
                        checked={apiConfig.is_enabled || false}
                        onCheckedChange={() => handleToggleEnabled(apiConfig)}
                      />
                    </div>
                  </div>
                  <Badge className={getStatusColor(apiConfig.status)}>
                    {apiConfig.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  {apiConfig.features && (
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {apiConfig.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {apiConfig.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{apiConfig.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {apiConfig.last_sync && (
                      <p>Last sync: {new Date(apiConfig.last_sync).toLocaleString()}</p>
                    )}
                    {apiConfig.error_message && (
                      <p className="text-red-600 text-xs">{apiConfig.error_message}</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(apiConfig)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingApi(apiConfig);
                        setApiKeyForm({
                          api_key: apiConfig.api_key || '',
                          api_secret: apiConfig.api_secret || ''
                        });
                        setShowApiKeyDialog(true);
                      }}
                    >
                      <Key className="w-3 h-3 mr-1" />
                      API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update API Credentials - {editingApi?.service_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={apiKeyForm.api_key}
                onChange={(e) => setApiKeyForm(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="Enter API key"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api_secret">API Secret (if required)</Label>
              <Input
                id="api_secret"
                type="password"
                value={apiKeyForm.api_secret}
                onChange={(e) => setApiKeyForm(prev => ({ ...prev, api_secret: e.target.value }))}
                placeholder="Enter API secret (optional)"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateApiKey} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading && apiConfigs.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading API configurations...</p>
        </div>
      )}
    </div>
  );
};

export default RealApiManager;