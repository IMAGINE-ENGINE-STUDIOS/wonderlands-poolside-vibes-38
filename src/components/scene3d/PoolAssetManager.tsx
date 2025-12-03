import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Footprints, 
  Armchair, 
  Waves, 
  Droplets,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Move
} from 'lucide-react';
import { PoolStairConfig, PoolChairConfig, PoolAsset } from './poolAssetTypes';

interface PoolAssetManagerProps {
  isOpen: boolean;
  onToggle: () => void;
  stairs: PoolStairConfig[];
  onStairsChange: (stairs: PoolStairConfig[]) => void;
  chairs: PoolChairConfig[];
  onChairsChange: (chairs: PoolChairConfig[]) => void;
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
  poolFinishTexture: string;
}

export function PoolAssetManager({
  isOpen,
  onToggle,
  stairs,
  onStairsChange,
  chairs,
  onChairsChange,
  selectedAssetId,
  onSelectAsset,
  poolFinishTexture
}: PoolAssetManagerProps) {
  const [activeTab, setActiveTab] = useState('stairs');

  // Add new stair
  const handleAddStair = useCallback((shape: 'linear' | 'curved') => {
    const newStair: PoolStairConfig = {
      id: `stair-${Date.now()}`,
      wallPosition: 0.1 + Math.random() * 0.2,
      shape,
      width: 2, // Default 2 feet width
      numSteps: 4,
      stepHeight: 0.625, // 7.5 inches
      stepDepth: 0.917, // 11 inches
      textureUrl: poolFinishTexture,
      cornerRadius: shape === 'curved' ? 1.0 : 0 // Default 1 foot radius for curved
    };
    onStairsChange([...stairs, newStair]);
    onSelectAsset(newStair.id);
  }, [stairs, onStairsChange, onSelectAsset, poolFinishTexture]);

  // Add new chair/bench
  const handleAddChair = useCallback((preset: 'lounge' | 'bench' | 'corner') => {
    const presets = {
      lounge: { width: 2.5, depth: 6, height: 1.5, name: 'Tanning Ledge' },
      bench: { width: 6, depth: 1.5, height: 1.2, name: 'Pool Bench' },
      corner: { width: 2, depth: 2, height: 1.0, name: 'Corner Seat' } // 1 foot below water, 2x2 ft
    };
    
    const p = presets[preset];
    const newChair: PoolChairConfig = {
      id: `chair-${Date.now()}`,
      wallPosition: 0.3 + Math.random() * 0.2,
      width: p.width,
      depth: p.depth,
      height: p.height,
      cornerRadius: 0.3,
      textureUrl: poolFinishTexture,
      snapToWall: true,
      followFloor: true,
      name: p.name
    };
    onChairsChange([...chairs, newChair]);
    onSelectAsset(newChair.id);
  }, [chairs, onChairsChange, onSelectAsset, poolFinishTexture]);

  // Delete selected asset
  const handleDeleteSelected = useCallback(() => {
    if (!selectedAssetId) return;
    
    if (selectedAssetId.startsWith('stair-')) {
      onStairsChange(stairs.filter(s => s.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('chair-')) {
      onChairsChange(chairs.filter(c => c.id !== selectedAssetId));
    }
    onSelectAsset(null);
  }, [selectedAssetId, stairs, chairs, onStairsChange, onChairsChange, onSelectAsset]);

  // Get selected stair/chair for editing
  const selectedStair = stairs.find(s => s.id === selectedAssetId);
  const selectedChair = chairs.find(c => c.id === selectedAssetId);

  // Update stair property
  const updateStair = useCallback((id: string, updates: Partial<PoolStairConfig>) => {
    onStairsChange(stairs.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [stairs, onStairsChange]);

  // Update chair property
  const updateChair = useCallback((id: string, updates: Partial<PoolChairConfig>) => {
    onChairsChange(chairs.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [chairs, onChairsChange]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
      >
        <Waves className="h-4 w-4 mr-2" />
        Pool Assets
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 w-80 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Waves className="h-4 w-4" />
          Pool Assets
        </h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-2">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="stairs" className="text-xs">
            <Footprints className="h-3 w-3 mr-1" />
            Stairs
          </TabsTrigger>
          <TabsTrigger value="chairs" className="text-xs">
            <Armchair className="h-3 w-3 mr-1" />
            Seating
          </TabsTrigger>
          <TabsTrigger value="jets" className="text-xs">
            <Droplets className="h-3 w-3 mr-1" />
            Jets
          </TabsTrigger>
          <TabsTrigger value="other" className="text-xs">
            <Move className="h-3 w-3 mr-1" />
            Other
          </TabsTrigger>
        </TabsList>

        {/* STAIRS TAB */}
        <TabsContent value="stairs" className="mt-2">
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-2">
              {/* Add Stair Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddStair('linear')}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Linear Stair
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddStair('curved')}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Curved Stair
                </Button>
              </div>

              {/* Stairs List */}
              {stairs.map((stair, idx) => (
                <div
                  key={stair.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    selectedAssetId === stair.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectAsset(stair.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {stair.shape === 'curved' ? 'Curved' : 'Linear'} Stair #{idx + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stair.numSteps} steps
                    </span>
                  </div>
                </div>
              ))}

              {/* Selected Stair Controls */}
              {selectedStair && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg mt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Edit Stair</Label>
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Width: {selectedStair.width.toFixed(1)} ft</Label>
                    <Slider
                      value={[selectedStair.width]}
                      onValueChange={([v]) => updateStair(selectedStair.id, { width: v })}
                      min={2}
                      max={10}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Steps: {selectedStair.numSteps}</Label>
                    <Slider
                      value={[selectedStair.numSteps]}
                      onValueChange={([v]) => updateStair(selectedStair.id, { numSteps: v })}
                      min={2}
                      max={8}
                      step={1}
                    />
                  </div>

                  {selectedStair.shape === 'curved' && (
                    <div className="space-y-2">
                      <Label className="text-xs">Corner Radius: {selectedStair.cornerRadius?.toFixed(1)} ft</Label>
                      <Slider
                        value={[selectedStair.cornerRadius || 0.5]}
                        onValueChange={([v]) => updateStair(selectedStair.id, { cornerRadius: v })}
                        min={0.2}
                        max={2}
                        step={0.1}
                      />
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Drag in 3D view to reposition along wall
                  </p>
                </div>
              )}

              {stairs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No stairs added. Click above to add.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* CHAIRS/SEATING TAB */}
        <TabsContent value="chairs" className="mt-2">
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-2">
              {/* Add Chair Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddChair('lounge')}
                  className="text-xs flex-col h-auto py-2"
                >
                  <Armchair className="h-4 w-4 mb-1" />
                  Lounge
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddChair('bench')}
                  className="text-xs flex-col h-auto py-2"
                >
                  <Armchair className="h-4 w-4 mb-1" />
                  Bench
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleAddChair('corner')}
                  className="text-xs flex-col h-auto py-2"
                >
                  <Armchair className="h-4 w-4 mb-1" />
                  Corner
                </Button>
              </div>

              {/* Chairs List */}
              {chairs.map((chair, idx) => (
                <div
                  key={chair.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    selectedAssetId === chair.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectAsset(chair.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{chair.name || `Seating #${idx + 1}`}</span>
                    <span className="text-xs text-muted-foreground">
                      {chair.width}x{chair.depth} ft
                    </span>
                  </div>
                </div>
              ))}

              {/* Selected Chair Controls */}
              {selectedChair && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg mt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Edit {selectedChair.name}</Label>
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Width: {selectedChair.width.toFixed(1)} ft</Label>
                    <Slider
                      value={[selectedChair.width]}
                      onValueChange={([v]) => updateChair(selectedChair.id, { width: v })}
                      min={1}
                      max={10}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Depth: {selectedChair.depth.toFixed(1)} ft</Label>
                    <Slider
                      value={[selectedChair.depth]}
                      onValueChange={([v]) => updateChair(selectedChair.id, { depth: v })}
                      min={1}
                      max={8}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Height: {selectedChair.height.toFixed(1)} ft</Label>
                    <Slider
                      value={[selectedChair.height]}
                      onValueChange={([v]) => updateChair(selectedChair.id, { height: v })}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Corner Radius: {selectedChair.cornerRadius.toFixed(1)} ft</Label>
                    <Slider
                      value={[selectedChair.cornerRadius]}
                      onValueChange={([v]) => updateChair(selectedChair.id, { cornerRadius: v })}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Snap to Wall</Label>
                    <Switch
                      checked={selectedChair.snapToWall}
                      onCheckedChange={(v) => updateChair(selectedChair.id, { snapToWall: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Follow Floor Depth</Label>
                    <Switch
                      checked={selectedChair.followFloor}
                      onCheckedChange={(v) => updateChair(selectedChair.id, { followFloor: v })}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Drag in 3D view to reposition
                  </p>
                </div>
              )}

              {chairs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No seating added. Click above to add.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* JETS TAB */}
        <TabsContent value="jets" className="mt-2">
          <div className="p-4 text-center text-muted-foreground">
            <Droplets className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Jets & bubblers coming soon</p>
          </div>
        </TabsContent>

        {/* OTHER TAB */}
        <TabsContent value="other" className="mt-2">
          <div className="p-4 text-center text-muted-foreground">
            <Move className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">More pool features coming soon</p>
            <p className="text-xs mt-1">Handrails, ladders, drains...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
