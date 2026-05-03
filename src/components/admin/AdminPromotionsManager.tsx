import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag, Plus, Edit, Trash2, DollarSign, Package, Zap, Calendar, Loader2, Mail, Users, Search, User, Check } from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  bundle_price: number;
  original_price: number | null;
  included_items: Array<{ name: string; value?: string }>;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  highlight_text: string | null;
  image_url: string | null;
  terms_conditions: string | null;
  created_at: string;
  updated_at: string;
}

interface PromotionFormData {
  name: string;
  description: string;
  bundle_price: string;
  original_price: string;
  included_items: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  highlight_text: string;
  image_url: string;
  terms_conditions: string;
}

const defaultFormData: PromotionFormData = {
  name: '',
  description: '',
  bundle_price: '',
  original_price: '',
  included_items: '',
  start_date: '',
  end_date: '',
  is_active: true,
  highlight_text: '',
  image_url: '',
  terms_conditions: ''
};

interface ClientRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

const AdminPromotionsManager = () => {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendingPromotionId, setSendingPromotionId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>(defaultFormData);

  // Email send dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailPromotion, setEmailPromotion] = useState<Promotion | null>(null);
  const [sendMode, setSendMode] = useState<'all' | 'specific'>('all');
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions((data || []) as unknown as Promotion[]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Error",
        description: "Failed to load promotions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setFormData(defaultFormData);
    setShowDialog(true);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      bundle_price: promotion.bundle_price.toString(),
      original_price: promotion.original_price?.toString() || '',
      included_items: JSON.stringify(promotion.included_items || [], null, 2),
      start_date: promotion.start_date ? promotion.start_date.split('T')[0] : '',
      end_date: promotion.end_date ? promotion.end_date.split('T')[0] : '',
      is_active: promotion.is_active,
      highlight_text: promotion.highlight_text || '',
      image_url: promotion.image_url || '',
      terms_conditions: promotion.terms_conditions || ''
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      let includedItems = [];
      try {
        includedItems = formData.included_items ? JSON.parse(formData.included_items) : [];
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Included items must be valid JSON array",
          variant: "destructive"
        });
        return;
      }

      const promotionData = {
        name: formData.name,
        description: formData.description || null,
        bundle_price: parseFloat(formData.bundle_price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        included_items: includedItems,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        highlight_text: formData.highlight_text || null,
        image_url: formData.image_url || null,
        terms_conditions: formData.terms_conditions || null,
        updated_at: new Date().toISOString()
      };

      if (editingPromotion) {
        const { error } = await supabase
          .from('promotions')
          .update(promotionData)
          .eq('id', editingPromotion.id);
        if (error) throw error;
        toast({ title: "Success", description: "Promotion updated successfully" });
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert([promotionData]);
        if (error) throw error;
        toast({ title: "Success", description: "Promotion created successfully" });
      }

      setShowDialog(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast({
        title: "Error",
        description: "Failed to save promotion",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !promotion.is_active, updated_at: new Date().toISOString() })
        .eq('id', promotion.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Promotion ${!promotion.is_active ? 'activated' : 'deactivated'}`
      });
      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast({
        title: "Error",
        description: "Failed to update promotion",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (!confirm(`Are you sure you want to delete "${promotion.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promotion.id);

      if (error) throw error;
      
      toast({ title: "Success", description: "Promotion deleted successfully" });
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive"
      });
    }
  };

  const handleOpenEmailDialog = async (promotion: Promotion) => {
    setEmailPromotion(promotion);
    setSendMode('all');
    setSelectedClientIds([]);
    setClientSearch('');
    setEmailDialogOpen(true);

    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email')
        .not('email', 'is', null)
        .order('first_name', { ascending: true });
      if (error) throw error;
      setClients((data || []) as ClientRow[]);
    } catch (err) {
      console.error('Error loading clients:', err);
      toast({ title: 'Error', description: 'Failed to load clients', variant: 'destructive' });
    } finally {
      setLoadingClients(false);
    }
  };

  const toggleClient = (id: string) => {
    setSelectedClientIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmSendEmail = async () => {
    if (!emailPromotion) return;
    if (sendMode === 'specific' && selectedClientIds.length === 0) {
      toast({ title: 'Select clients', description: 'Pick at least one client', variant: 'destructive' });
      return;
    }

    try {
      setIsSendingEmail(true);
      setSendingPromotionId(emailPromotion.id);

      const body: Record<string, unknown> = { template_name: emailPromotion.name };
      if (sendMode === 'all') {
        body.send_to_all = true;
      } else {
        body.client_ids = selectedClientIds;
      }

      const { data, error } = await supabase.functions.invoke('send-bulk-email', { body });
      if (error) throw error;

      toast({
        title: 'Email Sent',
        description: `${data?.successful ?? data?.sent ?? 0} sent, ${data?.failed ?? 0} failed`
      });
      setEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({ title: 'Error', description: 'Failed to send email', variant: 'destructive' });
    } finally {
      setIsSendingEmail(false);
      setSendingPromotionId(null);
    }
  };

  const activePromotions = promotions.filter(p => p.is_active);
  const expiredPromotions = promotions.filter(p => p.end_date && new Date(p.end_date) < new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg holographic-panel flex items-center justify-center">
            <Tag className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cyan-300 font-mono tracking-wide">
              PROMOTIONS MANAGER
            </h2>
            <p className="text-xs text-cyan-400/60 font-mono">
              Create and manage promotional bundles
            </p>
          </div>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="holographic-panel border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-400/60 font-mono uppercase">Total Promotions</p>
                <p className="text-3xl font-bold text-cyan-300 font-mono">{promotions.length}</p>
              </div>
              <Package className="h-8 w-8 text-cyan-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-panel border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400/60 font-mono uppercase">Active</p>
                <p className="text-3xl font-bold text-green-300 font-mono">{activePromotions.length}</p>
              </div>
              <Zap className="h-8 w-8 text-green-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="holographic-panel border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-400/60 font-mono uppercase">Expired</p>
                <p className="text-3xl font-bold text-orange-300 font-mono">{expiredPromotions.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-400/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <Card className="holographic-panel border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-300 font-mono flex items-center gap-2">
            <Tag className="h-5 w-5" />
            ALL PROMOTIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
              <p className="text-cyan-400/60 font-mono text-sm mt-4">Loading promotions...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-cyan-400/40 mx-auto mb-4" />
              <p className="text-cyan-400/60 font-mono text-sm">No promotions yet</p>
              <Button 
                onClick={handleOpenCreate} 
                className="mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Promotion
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/20 hover:bg-transparent">
                    <TableHead className="text-cyan-400 font-mono bg-black/40">Name</TableHead>
                    <TableHead className="text-cyan-400 font-mono bg-black/40">Bundle Price</TableHead>
                    <TableHead className="text-cyan-400 font-mono bg-black/40">Savings</TableHead>
                    <TableHead className="text-cyan-400 font-mono bg-black/40">Status</TableHead>
                    <TableHead className="text-cyan-400 font-mono bg-black/40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => {
                    const savings = promotion.original_price 
                      ? promotion.original_price - promotion.bundle_price 
                      : 0;
                    
                    return (
                      <TableRow key={promotion.id} className="border-cyan-500/20 bg-black/20 hover:bg-cyan-500/5">
                        <TableCell>
                          <div>
                            <p className="font-medium text-cyan-300 font-mono">{promotion.name}</p>
                            {promotion.highlight_text && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs mt-1">
                                {promotion.highlight_text}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-cyan-300 font-mono">
                            <DollarSign className="h-4 w-4" />
                            {promotion.bundle_price.toLocaleString()}
                          </div>
                          {promotion.original_price && (
                            <p className="text-xs text-cyan-400/60 line-through">
                              ${promotion.original_price.toLocaleString()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {savings > 0 && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 font-mono">
                              Save ${savings.toLocaleString()}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={promotion.is_active}
                              onCheckedChange={() => handleToggleActive(promotion)}
                            />
                            <Badge className={promotion.is_active 
                              ? "bg-green-500/20 text-green-300 border-green-500/30" 
                              : "bg-red-500/20 text-red-300 border-red-500/30"
                            }>
                              {promotion.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEmailDialog(promotion)}
                              disabled={!promotion.is_active || (isSendingEmail && sendingPromotionId === promotion.id)}
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                              title="Send to All Clients"
                            >
                              {isSendingEmail && sendingPromotionId === promotion.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEdit(promotion)}
                              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(promotion)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-900 border-cyan-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono">
              {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-400 font-mono text-xs">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Bundle name"
                  className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 font-mono text-xs">Highlight Text</Label>
                <Input
                  value={formData.highlight_text}
                  onChange={(e) => setFormData({ ...formData, highlight_text: e.target.value })}
                  placeholder="e.g., SAVE $12,000!"
                  className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-400 font-mono text-xs">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Promotion description..."
                className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-400 font-mono text-xs">Bundle Price * ($)</Label>
                <Input
                  type="number"
                  value={formData.bundle_price}
                  onChange={(e) => setFormData({ ...formData, bundle_price: e.target.value })}
                  placeholder="72863"
                  className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 font-mono text-xs">Original Price ($)</Label>
                <Input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="85000"
                  className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-cyan-400 font-mono text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 font-mono text-xs">End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-400 font-mono text-xs">
                Included Items (JSON array)
              </Label>
              <Textarea
                value={formData.included_items}
                onChange={(e) => setFormData({ ...formData, included_items: e.target.value })}
                placeholder='[{"name": "Pool", "value": "16x32 ft"}]'
                className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono min-h-[100px] text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-400 font-mono text-xs">Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-cyan-400 font-mono text-xs">Terms & Conditions</Label>
              <Textarea
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                placeholder="Terms and conditions..."
                className="bg-black/40 border-cyan-500/30 text-cyan-300 font-mono min-h-[60px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-cyan-400 font-mono text-xs">Active</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="border-cyan-500/30 text-cyan-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.bundle_price}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingPromotion ? 'Update Promotion' : 'Create Promotion'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="bg-slate-900 border-cyan-500/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send "{emailPromotion?.name}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSendMode('all')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  sendMode === 'all'
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-cyan-500/20 bg-black/20 hover:border-cyan-500/40'
                }`}
              >
                <Users className="h-5 w-5 text-cyan-300 mb-2" />
                <p className="font-mono text-cyan-300 text-sm font-bold">All Customers</p>
                <p className="font-mono text-cyan-400/60 text-xs mt-1">
                  Send to every client with an email
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSendMode('specific')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  sendMode === 'specific'
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-cyan-500/20 bg-black/20 hover:border-cyan-500/40'
                }`}
              >
                <User className="h-5 w-5 text-cyan-300 mb-2" />
                <p className="font-mono text-cyan-300 text-sm font-bold">Specific Customers</p>
                <p className="font-mono text-cyan-400/60 text-xs mt-1">
                  Pick clients from the list
                </p>
              </button>
            </div>

            {sendMode === 'specific' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
                  <Input
                    placeholder="Search by name or email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10 bg-black/40 border-cyan-500/30 text-cyan-300 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400/70">
                  <span>{selectedClientIds.length} selected</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClientIds([])}
                    className="hover:text-cyan-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto border border-cyan-500/20 rounded-lg divide-y divide-cyan-500/10">
                  {loadingClients ? (
                    <div className="py-8 text-center">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-400 mx-auto" />
                    </div>
                  ) : (
                    clients
                      .filter(c => {
                        if (!clientSearch) return true;
                        const q = clientSearch.toLowerCase();
                        const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
                        return name.includes(q) || (c.email || '').toLowerCase().includes(q);
                      })
                      .slice(0, 200)
                      .map(c => {
                        const checked = selectedClientIds.includes(c.id);
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => toggleClient(c.id)}
                            className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-cyan-500/5 ${
                              checked ? 'bg-cyan-500/10' : ''
                            }`}
                          >
                            <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                              checked ? 'bg-cyan-500 border-cyan-500' : 'border-cyan-500/40'
                            }`}>
                              {checked && <Check className="h-3 w-3 text-black" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-mono text-cyan-300 truncate">
                                {c.first_name} {c.last_name}
                              </p>
                              <p className="text-xs font-mono text-cyan-400/60 truncate">{c.email}</p>
                            </div>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEmailDialogOpen(false)}
                className="border-cyan-500/30 text-cyan-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSendEmail}
                disabled={isSendingEmail || (sendMode === 'specific' && selectedClientIds.length === 0)}
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
              >
                {isSendingEmail ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Mail className="h-4 w-4 mr-2" /> Send {sendMode === 'all' ? 'to All' : `to ${selectedClientIds.length}`}</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromotionsManager;
