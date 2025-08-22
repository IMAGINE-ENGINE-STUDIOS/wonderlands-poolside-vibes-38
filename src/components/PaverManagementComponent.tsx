import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Palette, Calculator } from 'lucide-react';
import { paverTypes, copingTypes, PaverType, PaverColor, calculatePaverPrice } from '@/data/paverData';
import { useToast } from '@/hooks/use-toast';

const PaverManagementComponent = () => {
  const [selectedPaverType, setSelectedPaverType] = useState<PaverType | null>(null);
  const [selectedCopingType, setSelectedCopingType] = useState<PaverType | null>(null);
  const [surfaceArea, setSurfaceArea] = useState('');
  const [editingType, setEditingType] = useState<PaverType | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const handleCalculatePrice = (type: PaverType, color: PaverColor) => {
    if (!surfaceArea || isNaN(parseFloat(surfaceArea))) {
      toast({
        title: "Invalid Surface Area",
        description: "Please enter a valid surface area",
        variant: "destructive"
      });
      return;
    }
    
    const price = calculatePaverPrice(type, color, parseFloat(surfaceArea));
    toast({
      title: "Price Calculated",
      description: `${type.name} in ${color.name}: $${price.toLocaleString()}`
    });
  };

  const PaverTypeCard = ({ type, onEdit }: { type: PaverType; onEdit: (type: PaverType) => void }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{type.name}</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(type)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{type.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Base Price:</span>
            <Badge variant="outline">${type.basePrice}/sq ft</Badge>
          </div>
          
          <div>
            <img 
              src={type.image} 
              alt={type.name}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Available Colors ({type.colors.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {type.colors.map((color) => (
                <div 
                  key={color.name}
                  className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleCalculatePrice(type, color)}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{color.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {color.priceModifier}x base
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <h5 className="text-xs font-medium mb-2">Quick Calculator</h5>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Area (sq ft)"
                  value={surfaceArea}
                  onChange={(e) => setSurfaceArea(e.target.value)}
                  className="text-xs"
                />
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (type.colors.length > 0) {
                    handleCalculatePrice(type, type.colors[0]);
                  }
                }}
              >
                <Calculator className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paver & Coping Management</h2>
          <p className="text-muted-foreground">Manage different types, colors, and pricing</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Paver/Coping Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="e.g., Premium Travertine" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description of the material" />
              </div>
              <div>
                <label className="text-sm font-medium">Base Price (per sq ft)</label>
                <Input type="number" placeholder="25.00" step="0.01" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Add Paver Type</Button>
                <Button variant="outline" className="flex-1">Add Coping Type</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Surface Area Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Surface Area Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Paver Surface Area (sq ft)</label>
              <Input
                type="number"
                placeholder="Enter surface area for pavers"
                value={surfaceArea}
                onChange={(e) => setSurfaceArea(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Price Estimate</label>
              {surfaceArea && !isNaN(parseFloat(surfaceArea)) ? (
                <div className="text-sm space-y-1">
                  <div>Basic Concrete: ${(parseFloat(surfaceArea) * 15).toLocaleString()}</div>
                  <div>Premium Stone: ${(parseFloat(surfaceArea) * 35).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Enter area for estimates</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paver & Coping Tabs */}
      <Tabs defaultValue="pavers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pavers">Pavers ({paverTypes.length})</TabsTrigger>
          <TabsTrigger value="coping">Coping ({copingTypes.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pavers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paverTypes.map((type) => (
              <PaverTypeCard 
                key={type.id} 
                type={type} 
                onEdit={setEditingType}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="coping" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {copingTypes.map((type) => (
              <PaverTypeCard 
                key={type.id} 
                type={type} 
                onEdit={setEditingType}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Sample Products Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Products Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{paverTypes.length}</div>
              <div className="text-sm text-muted-foreground">Paver Types</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{copingTypes.length}</div>
              <div className="text-sm text-muted-foreground">Coping Types</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {paverTypes.reduce((acc, type) => acc + type.colors.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Paver Colors</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {copingTypes.reduce((acc, type) => acc + type.colors.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Coping Colors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaverManagementComponent;