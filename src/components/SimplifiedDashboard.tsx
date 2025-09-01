
import React, { useState } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Key,
  Building2,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiTokenManager from './ApiTokenManager';
import AdminOrdersManager from './AdminOrdersManager';

const SimplifiedDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isSupplier = profile?.role === 'supplier';
  const isContractor = profile?.role === 'installer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {isSupplier ? 'Supplier' : 'Contractor'} Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage your business with Wonderlands
                {profile && (
                  <span className="ml-2 text-primary font-medium">
                    Welcome, {profile.first_name} {profile.last_name}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={handleLogout} size="sm" className="flex-1 sm:flex-none">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Logout</span>
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} size="sm" className="flex-1 sm:flex-none">
                <span className="text-xs sm:text-sm">Back to Site</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Key Metrics - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="procurement" className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
            <TabsList className="grid w-full grid-cols-2 sm:flex sm:flex-wrap gap-1">
              <TabsTrigger value="procurement" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Procurement</span>
              </TabsTrigger>
              
              <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              
              <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              
              <TabsTrigger value="api-access" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Key className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">API Access</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Procurement Tab */}
          <TabsContent value="procurement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Procurement Opportunities
                </CardTitle>
                <CardDescription>
                  Browse and bid on relevant projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Building2 className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Procurement System</h3>
                  <p className="text-muted-foreground mb-4">
                    Access procurement opportunities tailored to your expertise
                  </p>
                  <Button
                    onClick={() => window.open('/procurement', '_blank')}
                    className="w-full max-w-md"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Open Procurement Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>Manage orders for your products and services</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminOrdersManager isSimplified={true} currentUser={profile} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Track your business performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">$12,450</div>
                      <p className="text-sm text-muted-foreground">Total Revenue This Month</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">8.5%</div>
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Statistics</CardTitle>
                  <CardDescription>Your order fulfillment metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Orders</span>
                      <span className="font-bold text-green-600">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Orders</span>
                      <span className="font-bold text-orange-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Fulfillment Time</span>
                      <span className="font-bold">2.3 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Access Tab */}
          <TabsContent value="api-access" className="space-y-6">
            <ApiTokenManager />
            
            {/* API Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Learn how to integrate Wonderlands services into your applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    https://bwngxlbnavnhbtahyzbf.supabase.co/rest/v1/
                  </code>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Available Endpoints:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <code>/products</code> - Access product catalog</li>
                    <li>• <code>/orders</code> - Manage your orders</li>
                    <li>• <code>/job_postings</code> - Browse procurement opportunities</li>
                    {isSupplier && <li>• <code>/supplier_products</code> - Manage your products</li>}
                    {isContractor && <li>• <code>/service_offerings</code> - Manage your services</li>}
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your API token in the Authorization header:
                  </p>
                  <code className="text-sm bg-background px-2 py-1 rounded block">
                    Authorization: Bearer YOUR_API_TOKEN
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimplifiedDashboard;
