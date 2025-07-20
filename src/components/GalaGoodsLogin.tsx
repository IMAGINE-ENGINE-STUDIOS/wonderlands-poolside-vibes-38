import React, { useState } from 'react';
import { LogIn, User, Settings, ShoppingCart, Package, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGalaGoods } from '@/contexts/GalaGoodsContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export const GalaGoodsLogin: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const { 
    user, 
    isLoading, 
    error, 
    isInitialized,
    products,
    orders,
    businesses,
    login, 
    logout, 
    initialize,
    loadProducts,
    loadOrders,
    loadBusinesses,
    setError 
  } = useGalaGoods();
  
  const { toast } = useToast();

  const handleInitialize = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your GALA-GOODS API key",
        variant: "destructive",
      });
      return;
    }

    try {
      await initialize(apiKey);
      toast({
        title: "API Initialized",
        description: "GALA-GOODS API connection established",
      });
    } catch (err) {
      toast({
        title: "Initialization Failed",
        description: error || "Failed to initialize GALA-GOODS API",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(email, password);
      setIsLoginOpen(false);
      setEmail('');
      setPassword('');
      toast({
        title: "Login Successful",
        description: "Welcome to GALA-GOODS",
      });
    } catch (err) {
      toast({
        title: "Login Failed",
        description: error || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setIsDashboardOpen(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out of GALA-GOODS",
    });
  };

  const loadData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadBusinesses(),
      ]);
      toast({
        title: "Data Loaded",
        description: "GALA-GOODS data has been refreshed",
      });
    } catch (err) {
      toast({
        title: "Load Failed",
        description: "Failed to load GALA-GOODS data",
        variant: "destructive",
      });
    }
  };

  // If not initialized, show initialization dialog
  if (!isInitialized) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              <Settings className="h-4 w-4 mr-2" />
              Setup GALA-GOODS
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Initialize GALA-GOODS API</DialogTitle>
              <DialogDescription>
                Enter your API key to connect to GALA-GOODS services
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your GALA-GOODS API key"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              <Button 
                onClick={handleInitialize} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Initializing...' : 'Initialize API'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If not logged in, show login button
  if (!user) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              <LogIn className="h-4 w-4 mr-2" />
              GALA-GOODS Login
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login to GALA-GOODS</DialogTitle>
              <DialogDescription>
                Access your GALA-GOODS account and manage your e-commerce data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              <Button 
                onClick={handleLogin} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If logged in, show user dashboard
  return (
    <div className="fixed top-4 left-4 z-50">
      <Sheet open={isDashboardOpen} onOpenChange={setIsDashboardOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
            <User className="h-4 w-4 mr-2" />
            {user.name || user.email}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>GALA-GOODS Dashboard</SheetTitle>
            <SheetDescription>
              Manage your e-commerce data and connections
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* User Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Name:</span> {user.name || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                {user.walletAddress && (
                  <div className="text-sm">
                    <span className="font-medium">Wallet:</span> {user.walletAddress}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Data Overview
                  <Button variant="ghost" size="sm" onClick={loadData} disabled={isLoading}>
                    <Database className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Products</span>
                  </div>
                  <Badge variant="secondary">{products.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Orders</span>
                  </div>
                  <Badge variant="secondary">{orders.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Businesses</span>
                  </div>
                  <Badge variant="secondary">{businesses.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={loadData}
                disabled={isLoading}
              >
                <Database className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-2 h-auto p-0 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};