
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import crypto from 'crypto';

interface ApiToken {
  id: string;
  name: string;
  token_hash: string;
  scopes: string[];
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
}

const ApiTokenManager = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadTokens = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_api_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Error",
        description: "Failed to load API tokens",
        variant: "destructive",
      });
    }
  };

  const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  const hashToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  };

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTokenName.trim()) return;

    setIsLoading(true);

    try {
      const token = generateToken();
      const tokenHash = hashToken(token);

      const { error } = await supabase
        .from('user_api_tokens')
        .insert({
          user_id: user.id,
          name: newTokenName,
          token_hash: tokenHash,
          scopes: ['read', 'write'], // Default scopes
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        });

      if (error) throw error;

      setGeneratedToken(token);
      setNewTokenName("");
      setShowCreateModal(false);
      setShowToken(true);
      loadTokens();

      toast({
        title: "Token Created",
        description: "Your API token has been generated successfully",
      });

    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Error",
        description: "Failed to create API token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;

      toast({
        title: "Token Deleted",
        description: "API token has been deleted successfully",
      });

      loadTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: "Error",
        description: "Failed to delete API token",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Token copied to clipboard",
    });
  };

  useEffect(() => {
    loadTokens();
  }, [user]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access Tokens
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Generate API tokens to integrate Wonderlands services into your applications
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Token
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {token.scopes.map(scope => (
                        <span key={scope} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      token.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {token.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(token.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteToken(token.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {tokens.length === 0 && (
            <div className="text-center py-8">
              <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Tokens</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API token to start integrating with Wonderlands services
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Token Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Token</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={createToken} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Token Name</label>
              <Input
                placeholder="e.g., My App Integration"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Choose a descriptive name to help you identify this token
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Token"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show Generated Token Modal */}
      <Dialog open={showToken} onOpenChange={setShowToken}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your API Token</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Important</span>
              </div>
              <p className="text-sm text-yellow-700">
                This is the only time you'll see this token. Save it in a secure location.
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">API Token</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={generatedToken}
                  readOnly
                  type="text"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedToken)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <Button onClick={() => setShowToken(false)} className="w-full">
                I've Saved My Token
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiTokenManager;
