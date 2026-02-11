import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Copy, Eye, EyeOff, Trash2, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ApiKey {
  id: string;
  name: string;
  token_hash: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('user_api_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate a random token
      const token = `wl_${Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')}`;
      
      // Hash the token for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('user_api_tokens')
        .insert({
          user_id: user?.id,
          name: newKeyName.trim(),
          token_hash: tokenHash,
          scopes: ['read', 'write'],
          expires_at: null // No expiration for now
        });

      if (error) throw error;

      setGeneratedToken(token);
      setNewKeyName('');
      await fetchApiKeys();
      
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchApiKeys();
      toast({
        title: "Success",
        description: "API key deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const maskToken = (token: string) => {
    return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Generate and manage API keys for integrating with Wonderlands World API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generate New API Key */}
          <div className="flex gap-3">
            <Input
              placeholder="Enter API key name (e.g., 'Mobile App', 'Website Integration')"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={generateApiKey} 
              disabled={loading || !newKeyName.trim()}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Key
            </Button>
          </div>

          {/* Show Generated Token */}
          {generatedToken && (
            <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg">
                  New API Key Generated
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Copy this key now - you won't be able to see it again
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-white dark:bg-gray-900 border rounded text-sm font-mono break-all">
                    {generatedToken}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGeneratedToken(null)}
                  className="mt-2"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          )}

          {/* API Keys Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your API Keys</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApiKeys}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {apiKeys.length === 0 ? (
              <Card className="p-8 text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No API keys generated yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate your first API key to start integrating with our platform
                </p>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Scopes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm">
                              {showToken === apiKey.id ? apiKey.token_hash : maskToken(apiKey.token_hash)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowToken(showToken === apiKey.id ? null : apiKey.id)}
                            >
                              {showToken === apiKey.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {apiKey.scopes.map((scope) => (
                              <Badge key={scope} variant="secondary" className="text-xs">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(apiKey.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {apiKey.last_used_at 
                            ? new Date(apiKey.last_used_at).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>

          {/* API Documentation */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200 text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300 space-y-3">
              <p><strong>Base URL:</strong></p>
              <code className="block p-2 bg-white dark:bg-gray-900 rounded text-sm break-all">
                https://bwngxlbnavnhbtahyzbf.supabase.co/functions/v1/public-api
              </code>
              <p><strong>Authentication:</strong> Include your API key in the Authorization header:</p>
              <code className="block p-2 bg-white dark:bg-gray-900 rounded text-sm">
                Authorization: Bearer wl_your_api_key_here
              </code>
              <p><strong>Available Endpoints (GET only):</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code>/public-api/products</code> — List all products</li>
                <li><code>/public-api/products/:id</code> — Get product by ID</li>
                <li><code>/public-api/pools</code> — List all pools</li>
                <li><code>/public-api/pools/:id</code> — Get pool by ID</li>
                <li><code>/public-api/pavers</code> — List all pavers</li>
                <li><code>/public-api/pavers/:id</code> — Get paver by ID</li>
              </ul>
              <p><strong>Query Params:</strong> <code>page</code>, <code>limit</code> (max 100), <code>category</code>, <code>search</code></p>
              <p className="text-sm">
                Example: <code>GET /public-api/pools?category=fiberglass&limit=10&page=1</code>
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;