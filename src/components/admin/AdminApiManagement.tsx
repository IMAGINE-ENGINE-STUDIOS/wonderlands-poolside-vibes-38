import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Key, Copy, Trash2, Plus, RefreshCw, Shield, Globe, Activity, AlertTriangle, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ApiToken {
  id: string;
  user_id: string;
  name: string;
  token_hash: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

interface TokenWithProfile extends ApiToken {
  user_email?: string;
  user_name?: string;
}

const AdminApiManagement = () => {
  const [tokens, setTokens] = useState<TokenWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllTokens = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tokensData, error } = await supabase
        .from('user_api_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each unique user_id
      const userIds = [...new Set((tokensData || []).map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      const enriched: TokenWithProfile[] = (tokensData || []).map(t => {
        const profile = profileMap.get(t.user_id);
        return {
          ...t,
          user_email: profile?.email || 'Unknown',
          user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
        };
      });

      setTokens(enriched);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      toast({ title: "Error", description: "Failed to fetch API tokens", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllTokens();
  }, [fetchAllTokens]);

  const toggleTokenStatus = async (tokenId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .update({ is_active: !currentStatus })
        .eq('id', tokenId);

      if (error) throw error;
      await fetchAllTokens();
      toast({ title: "Success", description: `Token ${!currentStatus ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update token", variant: "destructive" });
    }
  };

  const deleteToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
      await fetchAllTokens();
      toast({ title: "Success", description: "Token deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete token", variant: "destructive" });
    }
  };

  const generateAdminKey = async () => {
    if (!newKeyName.trim()) return;
    setGeneratingKey(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const token = `wl_${Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('')}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('user_api_tokens')
        .insert({
          user_id: user.id,
          name: newKeyName.trim(),
          token_hash: tokenHash,
          scopes: ['read'],
          expires_at: null,
        });

      if (error) throw error;
      setGeneratedToken(token);
      setNewKeyName('');
      await fetchAllTokens();
      toast({ title: "Success", description: "API key generated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate key", variant: "destructive" });
    } finally {
      setGeneratingKey(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const activeTokens = tokens.filter(t => t.is_active);
  const recentlyUsed = tokens.filter(t => t.last_used_at && new Date(t.last_used_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const expiringSoon = tokens.filter(t => t.expires_at && new Date(t.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const apiBaseUrl = 'https://bwngxlbnavnhbtahyzbf.supabase.co/functions/v1/public-api';

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="holographic-panel border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Key className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-cyan-300 font-mono">{tokens.length}</p>
                <p className="text-xs text-cyan-400/60 font-mono uppercase">Total Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="holographic-panel border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-300 font-mono">{activeTokens.length}</p>
                <p className="text-xs text-green-400/60 font-mono uppercase">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="holographic-panel border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-300 font-mono">{recentlyUsed.length}</p>
                <p className="text-xs text-blue-400/60 font-mono uppercase">Used (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="holographic-panel border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-orange-300 font-mono">{expiringSoon.length}</p>
                <p className="text-xs text-orange-400/60 font-mono uppercase">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate New Key */}
      <Card className="holographic-panel border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
            <Plus className="h-5 w-5 text-cyan-400" />
            Generate New API Key
          </CardTitle>
          <CardDescription className="text-cyan-400/60 font-mono">
            Create a new read-only API key for external application access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Application name (e.g., 'Partner Website', 'Mobile App')"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-black/40 border-cyan-500/30 text-cyan-200 placeholder:text-cyan-400/40 font-mono"
            />
            <Button
              onClick={generateAdminKey}
              disabled={generatingKey || !newKeyName.trim()}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>

          {generatedToken && (
            <Card className="border-green-500/40 bg-green-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-300 text-sm font-mono">⚠ Copy this key now — it won't be shown again</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-black/60 border border-green-500/30 rounded text-sm font-mono text-green-300 break-all">
                    {generatedToken}
                  </code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedToken)} className="border-green-500/30 text-green-300">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setGeneratedToken(null)} className="mt-2 text-cyan-400/60">
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* All Connected Applications */}
      <Card className="holographic-panel border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-cyan-300 font-mono">
                <Globe className="h-5 w-5 text-cyan-400" />
                Connected Applications
              </CardTitle>
              <CardDescription className="text-cyan-400/60 font-mono">
                All API keys across all users and applications
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAllTokens} disabled={loading} className="border-cyan-500/30 text-cyan-400">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-16 w-16 text-cyan-400/30 mx-auto mb-4" />
              <p className="text-cyan-400/60 font-mono">No API keys have been generated yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/20">
                    <TableHead className="text-cyan-400 font-mono text-xs">Application</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-xs">Owner</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-xs">Scopes</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-xs">Status</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-xs">Created</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-xs">Last Used</TableHead>
                    <TableHead className="text-cyan-400 font-mono text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id} className="border-cyan-500/10 hover:bg-cyan-500/5">
                      <TableCell className="font-mono text-cyan-200 text-sm">{token.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-cyan-300 font-mono">{token.user_name}</p>
                          <p className="text-xs text-cyan-400/50 font-mono">{token.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {token.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={token.is_active}
                            onCheckedChange={() => toggleTokenStatus(token.id, token.is_active)}
                          />
                          <Badge variant={token.is_active ? "default" : "secondary"} className={token.is_active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}>
                            {token.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-cyan-400/60 font-mono">
                        {new Date(token.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {token.last_used_at ? (
                          <span className="text-cyan-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(token.last_used_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-cyan-400/40">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteToken(token.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="holographic-panel border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-300 font-mono">
            <Zap className="h-5 w-5 text-blue-400" />
            Public API Documentation
          </CardTitle>
          <CardDescription className="text-blue-400/60 font-mono">
            Share this with developers integrating with your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm font-mono">
          <div>
            <p className="text-cyan-400/60 mb-1">Base URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-black/60 border border-cyan-500/20 rounded text-cyan-300 break-all">
                {apiBaseUrl}
              </code>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiBaseUrl)} className="text-cyan-400">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <p className="text-cyan-400/60 mb-1">Authentication:</p>
            <code className="block p-2 bg-black/60 border border-cyan-500/20 rounded text-cyan-300">
              Authorization: Bearer wl_your_api_key
            </code>
          </div>
          <div>
            <p className="text-cyan-400/60 mb-2">Endpoints (GET only):</p>
            <div className="space-y-1">
              {[
                { path: '/products', desc: 'All products with filtering' },
                { path: '/products/:id', desc: 'Single product by ID' },
                { path: '/pools', desc: 'All pools with filtering' },
                { path: '/pools/:id', desc: 'Single pool by ID' },
                { path: '/pavers', desc: 'All pavers with filtering' },
                { path: '/pavers/:id', desc: 'Single paver by ID' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 p-2 bg-black/30 rounded border border-cyan-500/10">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">GET</Badge>
                  <code className="text-cyan-300">{ep.path}</code>
                  <span className="text-cyan-400/40 ml-auto">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-cyan-400/60 mb-1">Query Parameters:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { param: 'page', desc: 'Page number (default: 1)' },
                { param: 'limit', desc: 'Items per page (max: 100)' },
                { param: 'category', desc: 'Filter by category' },
                { param: 'search', desc: 'Search by name/model' },
              ].map((qp) => (
                <div key={qp.param} className="p-2 bg-black/30 rounded border border-cyan-500/10">
                  <code className="text-cyan-300">{qp.param}</code>
                  <p className="text-xs text-cyan-400/40">{qp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApiManagement;
