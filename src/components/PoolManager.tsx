import * as React from "react";
const { useState, useEffect } = React;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X, Upload, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to get discounted price - 10% discount for all pools
const getPoolPrice = (pool: Pool) => {
  return Math.round(pool.price * 0.90); // 10% discount for all pools
};

interface Pool {
  id?: string;
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image_url?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  gala_points?: number;
  gala_category?: string;
  installation_time_weeks?: number;
  warranty_years?: string;
  heater?: boolean;
  salt_system?: boolean;
  carbon_fiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  is_active?: boolean;
}

const PoolManager = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState<Pool>({
    model: '',
    price: 0,
    category: 'standard',
    dimensions: '',
    depth: '',
    features: [],
    gala_points: 0,
    gala_category: '',
    installation_time_weeks: 0,
    warranty_years: '',
    heater: false,
    salt_system: false,
    carbon_fiber: false,
    finishes: [],
    liners: [],
    covers: [],
    is_active: true
  });

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('pools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPools(data || []);
    } catch (error) {
      console.error('Error fetching pools:', error);
      toast.error('Failed to fetch pools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePool = async () => {
    if (!formData.model || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsLoading(true);
    try {
      if (editingPool?.id) {
        // Update existing pool
        const { error } = await (supabase as any)
          .from('pools')
          .update(formData)
          .eq('id', editingPool.id);

        if (error) throw error;
        toast.success('Pool updated successfully');
      } else {
        // Create new pool
        const { error } = await (supabase as any)
          .from('pools')
          .insert([formData]);

        if (error) throw error;
        toast.success('Pool created successfully');
      }

      fetchPools();
      handleCancelEdit();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving pool:', error);
      toast.error('Failed to save pool');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePool = async (poolId: string) => {
    if (!confirm('Are you sure you want to delete this pool?')) return;

    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('pools')
        .delete()
        .eq('id', poolId);

      if (error) throw error;
      toast.success('Pool deleted successfully');
      fetchPools();
    } catch (error) {
      console.error('Error deleting pool:', error);
      toast.error('Failed to delete pool');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPool = (pool: Pool) => {
    setEditingPool(pool);
    setFormData(pool);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPool(null);
    setFormData({
      model: '',
      price: 0,
      category: 'standard',
      dimensions: '',
      depth: '',
      features: [],
      gala_points: 0,
      gala_category: '',
      installation_time_weeks: 0,
      warranty_years: '',
      heater: false,
      salt_system: false,
      carbon_fiber: false,
      finishes: [],
      liners: [],
      covers: [],
      is_active: true
    });
  };

  const handleAddNew = () => {
    handleCancelEdit();
    setShowAddModal(true);
  };

  const updateFormField = (field: keyof Pool, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof Pool, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'deluxe': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    case 'standard': return 'bg-gradient-to-r from-[hsl(var(--golden))] to-[hsl(var(--golden-light))]';
    case 'compact': return 'bg-gradient-to-r from-orange-500 to-red-500';
    default: return 'bg-gray-500';
  }
};

  const PoolForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="model">Pool Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => updateFormField('model', e.target.value)}
            placeholder="e.g., Apollo 14"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => updateFormField('price', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => updateFormField('category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={formData.dimensions || ''}
            onChange={(e) => updateFormField('dimensions', e.target.value)}
            placeholder="e.g., 14' x 28'"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="depth">Depth</Label>
          <Input
            id="depth"
            value={formData.depth || ''}
            onChange={(e) => updateFormField('depth', e.target.value)}
            placeholder="e.g., 3' - 6'"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gala_points">Gala Points</Label>
          <Input
            id="gala_points"
            type="number"
            value={formData.gala_points || 0}
            onChange={(e) => updateFormField('gala_points', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warranty_years">Warranty Years</Label>
          <Input
            id="warranty_years"
            value={formData.warranty_years || ''}
            onChange={(e) => updateFormField('warranty_years', e.target.value)}
            placeholder="e.g., 25"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installation_time">Installation Time (weeks)</Label>
          <Input
            id="installation_time"
            type="number"
            value={formData.installation_time_weeks || 0}
            onChange={(e) => updateFormField('installation_time_weeks', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-semibold">Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.heater || false}
              onCheckedChange={(checked) => updateFormField('heater', checked)}
            />
            <Label>Heater</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.salt_system || false}
              onCheckedChange={(checked) => updateFormField('salt_system', checked)}
            />
            <Label>Salt System</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.carbon_fiber || false}
              onCheckedChange={(checked) => updateFormField('carbon_fiber', checked)}
            />
            <Label>Carbon Fiber</Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="features">Additional Features (comma-separated)</Label>
          <Textarea
            id="features"
            value={formData.features?.join(', ') || ''}
            onChange={(e) => updateArrayField('features', e.target.value)}
            placeholder="e.g., LED Lighting, Automatic Cover, Spa Integration"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="finishes">Available Finishes (comma-separated)</Label>
          <Textarea
            id="finishes"
            value={formData.finishes?.join(', ') || ''}
            onChange={(e) => updateArrayField('finishes', e.target.value)}
            placeholder="e.g., Ocean Blue, Sapphire Blue, Aquamarine"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="liners">Available Liners (comma-separated)</Label>
          <Textarea
            id="liners"
            value={formData.liners?.join(', ') || ''}
            onChange={(e) => updateArrayField('liners', e.target.value)}
            placeholder="e.g., Premium Vinyl, Fiberglass, Tile"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="covers">Available Covers (comma-separated)</Label>
          <Textarea
            id="covers"
            value={formData.covers?.join(', ') || ''}
            onChange={(e) => updateArrayField('covers', e.target.value)}
            placeholder="e.g., Automatic Safety Cover, Solar Cover, Winter Cover"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => {
          handleCancelEdit();
          setShowAddModal(false);
        }}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSavePool} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Pool'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pool Management</h2>
          <p className="text-muted-foreground">Manage your pool catalog and pricing</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Pool
        </Button>
      </div>

      {/* Pool List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pools.map((pool) => (
          <Card key={pool.id} className="relative group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{pool.model}</CardTitle>
<Badge className={`${getCategoryColor(pool.category)} text-white`}>
                    {pool.category === 'standard' ? 'Wonderful' : pool.category}
                  </Badge>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" onClick={() => handleEditPool(pool)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeletePool(pool.id!)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">${getPoolPrice(pool).toLocaleString()}</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Waves className="w-4 h-4 mr-1" />
                  {pool.dimensions || 'N/A'}
                </div>
              </div>
              
              {pool.features && pool.features.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {pool.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {pool.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{pool.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Gala Points: {pool.gala_points || 0}</span>
                <span>Status: {pool.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Pool Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pool</DialogTitle>
          </DialogHeader>
          <PoolForm />
        </DialogContent>
      </Dialog>

      {/* Edit Pool Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pool: {editingPool?.model}</DialogTitle>
          </DialogHeader>
          <PoolForm />
        </DialogContent>
      </Dialog>

      {isLoading && pools.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pools...</p>
        </div>
      )}

      {!isLoading && pools.length === 0 && (
        <div className="text-center py-12">
          <Waves className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pools found</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first pool to the catalog.</p>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Pool
          </Button>
        </div>
      )}
    </div>
  );
};

export default PoolManager;