import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGalaGoods } from '@/contexts/GalaGoodsContext';
import { Loader2, Key, ShoppingCart, Building, Package } from 'lucide-react';

export const GalaGoodsIntegration: React.FC = () => {
  const {
    api,
    user,
    businesses,
    products,
    orders,
    isLoading,
    error,
    isInitialized,
    initialize,
    login,
    logout,
    loadProducts,
    loadBusinesses,
    loadOrders,
    setError
  } = useGalaGoods();

  const [apiKey, setApiKey] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleInitialize = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your GALA-GOODS API key');
      return;
    }
    
    try {
      await initialize(apiKey);
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      await login(loginForm.email, loginForm.password);
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLoadData = async (type: 'products' | 'businesses' | 'orders') => {
    try {
      switch (type) {
        case 'products':
          await loadProducts();
          break;
        case 'businesses':
          await loadBusinesses();
          break;
        case 'orders':
          await loadOrders();
          break;
      }
    } catch (err) {
      console.error(`Failed to load ${type}:`, err);
    }
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            GALA-GOODS API Setup
          </CardTitle>
          <CardDescription>
            Enter your GALA-GOODS API key to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your GALA-GOODS API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={handleInitialize} 
            disabled={isLoading || !apiKey.trim()}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Initialize GALA-GOODS
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GALA-GOODS Integration Dashboard</CardTitle>
          <CardDescription>
            Manage your GALA-GOODS connection and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
              {user && (
                <span className="text-sm text-muted-foreground">
                  Logged in as {user.email}
                </span>
              )}
            </div>
            {user && (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!user && (
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Login to your GALA-GOODS account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products ({products.length})
              </CardTitle>
              <CardDescription>
                Manage your GALA-GOODS products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleLoadData('products')} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load Products
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <p className="font-bold mt-2">${product.price}</p>
                    {product.category && (
                      <Badge variant="secondary" className="mt-2">
                        {product.category}
                      </Badge>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Businesses ({businesses.length})
              </CardTitle>
              <CardDescription>
                View connected businesses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleLoadData('businesses')} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load Businesses
              </Button>
              
              <div className="space-y-4">
                {businesses.map((business) => (
                  <Card key={business.id} className="p-4">
                    <h4 className="font-semibold">{business.name}</h4>
                    <p className="text-sm text-muted-foreground">{business.description}</p>
                    {business.email && (
                      <p className="text-sm">{business.email}</p>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders ({orders.length})
              </CardTitle>
              <CardDescription>
                View and manage orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleLoadData('orders')} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load Orders
              </Button>
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                      <Badge 
                        variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'processing' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.products.length} items • Total: ${order.total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};