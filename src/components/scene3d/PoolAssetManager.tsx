import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Footprints, 
  Armchair, 
  Droplets,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Lightbulb,
  Spline,
  Palette,
  Link,
  Unlink
} from 'lucide-react';
import { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './poolAssetTypes';
import { PoolLightConfig, TextureConfig } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PoolAssetManagerProps {
  isOpen: boolean;
  onToggle: () => void;
  stairs: PoolStairConfig[];
  onStairsChange: (stairs: PoolStairConfig[]) => void;
  chairs: PoolChairConfig[];
  onChairsChange: (chairs: PoolChairConfig[]) => void;
  contourSeating: ContourSeatingConfig[];
  onContourSeatingChange: (seating: ContourSeatingConfig[]) => void;
  lights: PoolLightConfig[];
  onLightsChange: (lights: PoolLightConfig[]) => void;
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
  poolFinishTexture: string;
  isNightMode: boolean;
  availableFinishes?: TextureConfig[];
  onRequestFuseStairSeating?: (stairId: string, seatingId: string) => void;
}

export function PoolAssetManager({
  isOpen,
  onToggle,
  stairs,
  onStairsChange,
  chairs,
  onChairsChange,
  contourSeating,
  onContourSeatingChange,
  lights,
  onLightsChange,
  selectedAssetId,
  onSelectAsset,
  poolFinishTexture,
  isNightMode,
  availableFinishes = [],
  onRequestFuseStairSeating
}: PoolAssetManagerProps) {
  const [activeTab, setActiveTab] = useState('stairs');
  const [showTextureSync, setShowTextureSync] = useState(false);
  const [pendingTextureSync, setPendingTextureSync] = useState<string | null>(null);
  const [showTextureMenu, setShowTextureMenu] = useState<string | null>(null);
  const [showFusionSuggestion, setShowFusionSuggestion] = useState(false);
  const [fusionPair, setFusionPair] = useState<{ stairId: string; seatingId: string } | null>(null);

  // Watch for pool finish texture changes - prompt to sync assets
  const [lastPoolFinish, setLastPoolFinish] = useState(poolFinishTexture);
  
  useEffect(() => {
    if (poolFinishTexture !== lastPoolFinish && lastPoolFinish) {
      // Check if any assets use the old texture
      const assetsUsingOldTexture = [
        ...stairs.filter(s => s.textureUrl === lastPoolFinish),
        ...contourSeating.filter(s => s.textureUrl === lastPoolFinish)
      ];
      
      if (assetsUsingOldTexture.length > 0) {
        setPendingTextureSync(poolFinishTexture);
        setShowTextureSync(true);
      }
    }
    setLastPoolFinish(poolFinishTexture);
  }, [poolFinishTexture, lastPoolFinish, stairs, contourSeating]);

  // Handle texture sync confirmation
  const handleConfirmTextureSync = useCallback(() => {
    if (!pendingTextureSync) return;
    
    // Update all stairs using old texture
    onStairsChange(stairs.map(s => 
      s.textureUrl === lastPoolFinish ? { ...s, textureUrl: pendingTextureSync } : s
    ));
    
    // Update all contour seating using old texture
    onContourSeatingChange(contourSeating.map(s => 
      s.textureUrl === lastPoolFinish ? { ...s, textureUrl: pendingTextureSync } : s
    ));
    
    setShowTextureSync(false);
    setPendingTextureSync(null);
  }, [pendingTextureSync, lastPoolFinish, stairs, contourSeating, onStairsChange, onContourSeatingChange]);

  // Check for fusion opportunity when selecting assets
  useEffect(() => {
    if (!selectedAssetId) return;
    
    // Check if stair and seating are adjacent (within 5% position)
    const selectedStair = stairs.find(s => s.id === selectedAssetId);
    const selectedSeating = contourSeating.find(s => s.id === selectedAssetId);
    
    if (selectedStair) {
      const adjacentSeating = contourSeating.find(s => 
        Math.abs(s.startPosition - selectedStair.wallPosition) < 0.05 ||
        Math.abs(s.endPosition - selectedStair.wallPosition) < 0.05
      );
      if (adjacentSeating && onRequestFuseStairSeating) {
        setFusionPair({ stairId: selectedStair.id, seatingId: adjacentSeating.id });
        setShowFusionSuggestion(true);
      }
    } else if (selectedSeating) {
      const adjacentStair = stairs.find(s =>
        Math.abs(selectedSeating.startPosition - s.wallPosition) < 0.05 ||
        Math.abs(selectedSeating.endPosition - s.wallPosition) < 0.05
      );
      if (adjacentStair && onRequestFuseStairSeating) {
        setFusionPair({ stairId: adjacentStair.id, seatingId: selectedSeating.id });
        setShowFusionSuggestion(true);
      }
    }
  }, [selectedAssetId, stairs, contourSeating, onRequestFuseStairSeating]);

  // Add new stair - 5ft width, split style
  const handleAddStair = useCallback((shape: 'linear' | 'curved') => {
    const newStair: PoolStairConfig = {
      id: `stair-${Date.now()}`,
      wallPosition: 0.1 + Math.random() * 0.2,
      shape,
      width: 5, // Default 5 feet width
      numSteps: 4,
      stepHeight: 0.625, // 7.5 inches
      stepDepth: 0.917, // 11 inches
      textureUrl: poolFinishTexture,
      cornerRadius: shape === 'curved' ? 1.0 : 0.5 // Split stair style with rounded corners
    };
    onStairsChange([...stairs, newStair]);
    onSelectAsset(newStair.id);
  }, [stairs, onStairsChange, onSelectAsset, poolFinishTexture]);

  // Add new chair/bench - uses pool finish texture by default
  const handleAddChair = useCallback((preset: 'lounge' | 'bench' | 'corner') => {
    const presets = {
      lounge: { width: 2.5, depth: 6, height: 1.5, name: 'Tanning Ledge' },
      bench: { width: 6, depth: 1.5, height: 1.0, name: 'Pool Bench' },
      corner: { width: 2, depth: 2, height: 1.0, name: 'Corner Seat' } // 1 foot below water
    };
    
    const p = presets[preset];
    const newChair: PoolChairConfig = {
      id: `chair-${Date.now()}`,
      wallPosition: 0.3 + Math.random() * 0.2,
      width: p.width,
      depth: p.depth,
      height: p.height, // This is depth below water for top surface
      cornerRadius: 0.3,
      textureUrl: poolFinishTexture, // Use pool finish texture
      snapToWall: true,
      followFloor: true,
      name: p.name
    };
    onChairsChange([...chairs, newChair]);
    onSelectAsset(newChair.id);
  }, [chairs, onChairsChange, onSelectAsset, poolFinishTexture]);

  // Add new light - default to gradient color mode
  const handleAddLight = useCallback(() => {
    const newLight: PoolLightConfig = {
      id: `light-${Date.now()}`,
      wallPosition: Math.random() * 0.8 + 0.1,
      depthFromSurface: 2.0,
      color: '#ffffff',
      colorMode: 'gradient', // Default to gradient
      intensity: 2,
      isOn: isNightMode,
      angle: 0
    };
    onLightsChange([...lights, newLight]);
    onSelectAsset(newLight.id);
  }, [lights, onLightsChange, onSelectAsset, isNightMode]);

  // Add contour seating
  const handleAddContourSeating = useCallback(() => {
    const newSeating: ContourSeatingConfig = {
      id: `contour-${Date.now()}`,
      startPosition: 0.1 + Math.random() * 0.1,
      endPosition: 0.3 + Math.random() * 0.1,
      width: 1.5, // 1.5 feet into pool
      height: 1.0, // 1 foot below water
      textureUrl: poolFinishTexture
    };
    onContourSeatingChange([...contourSeating, newSeating]);
    onSelectAsset(newSeating.id);
  }, [contourSeating, onContourSeatingChange, onSelectAsset, poolFinishTexture]);

  // Delete selected asset
  const handleDeleteSelected = useCallback(() => {
    if (!selectedAssetId) return;
    
    if (selectedAssetId.startsWith('stair-')) {
      onStairsChange(stairs.filter(s => s.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('chair-')) {
      onChairsChange(chairs.filter(c => c.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('light-')) {
      onLightsChange(lights.filter(l => l.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('contour-')) {
      onContourSeatingChange(contourSeating.filter(s => s.id !== selectedAssetId));
    }
    onSelectAsset(null);
  }, [selectedAssetId, stairs, chairs, lights, contourSeating, onStairsChange, onChairsChange, onLightsChange, onContourSeatingChange, onSelectAsset]);

  // Get selected items for editing
  const selectedStair = stairs.find(s => s.id === selectedAssetId);
  const selectedChair = chairs.find(c => c.id === selectedAssetId);
  const selectedLight = lights.find(l => l.id === selectedAssetId);
  const selectedContour = contourSeating.find(s => s.id === selectedAssetId);

  // Update stair property
  const updateStair = useCallback((id: string, updates: Partial<PoolStairConfig>) => {
    onStairsChange(stairs.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [stairs, onStairsChange]);

  // Update chair property
  const updateChair = useCallback((id: string, updates: Partial<PoolChairConfig>) => {
    onChairsChange(chairs.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [chairs, onChairsChange]);

  // Update light property
  const updateLight = useCallback((id: string, updates: Partial<PoolLightConfig>) => {
    onLightsChange(lights.map(l => l.id === id ? { ...l, ...updates } : l));
  }, [lights, onLightsChange]);

  // Update contour seating property
  const updateContour = useCallback((id: string, updates: Partial<ContourSeatingConfig>) => {
    onContourSeatingChange(contourSeating.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [contourSeating, onContourSeatingChange]);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="absolute top-4 right-4 z-50 bg-background/95 backdrop-blur-sm shadow-lg border-primary/20 hover:border-primary/50"
      >
        <Footprints className="h-4 w-4 mr-2 text-primary" />
        <span className="font-medium">Pool Assets</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-50 w-80 bg-background/98 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Footprints className="h-4 w-4 text-primary" />
          Pool Assets
        </h3>
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-7 w-7 p-0 hover:bg-primary/10">
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-2">
        <TabsList className="grid grid-cols-4 w-full h-9 bg-muted/30">
          <TabsTrigger value="stairs" className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Footprints className="h-3 w-3 mr-1" />
            Stairs
          </TabsTrigger>
          <TabsTrigger value="chairs" className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Armchair className="h-3 w-3 mr-1" />
            Seating
          </TabsTrigger>
          <TabsTrigger value="lights" className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lightbulb className="h-3 w-3 mr-1" />
            Lights
          </TabsTrigger>
          <TabsTrigger value="jets" className="text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Droplets className="h-3 w-3 mr-1" />
            Jets
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
                      max={12}
                      step={0.5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Min Steps: {selectedStair.numSteps} (auto-extends to floor)</Label>
                    <Slider
                      value={[selectedStair.numSteps]}
                      onValueChange={([v]) => updateStair(selectedStair.id, { numSteps: v })}
                      min={2}
                      max={12}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Step Height: {(selectedStair.stepHeight * 12).toFixed(1)}" ({selectedStair.stepHeight.toFixed(2)} ft)</Label>
                    <Slider
                      value={[selectedStair.stepHeight]}
                      onValueChange={([v]) => updateStair(selectedStair.id, { stepHeight: v })}
                      min={0.5}
                      max={0.833}
                      step={0.042}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Step Depth: {(selectedStair.stepDepth * 12).toFixed(1)}" ({selectedStair.stepDepth.toFixed(2)} ft)</Label>
                    <Slider
                      value={[selectedStair.stepDepth]}
                      onValueChange={([v]) => updateStair(selectedStair.id, { stepDepth: v })}
                      min={0.75}
                      max={1.25}
                      step={0.042}
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

                  {/* Texture Controls */}
                  <div className="space-y-2">
                    <Label className="text-xs">Texture</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => setShowTextureMenu(selectedStair.id)}
                      >
                        <Palette className="h-3 w-3 mr-1" />
                        Change Finish
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => updateStair(selectedStair.id, { textureUrl: poolFinishTexture })}
                        title="Match pool finish"
                      >
                        <Link className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Stairs start 1ft below water. Drag in 3D view to reposition.
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
              <div className="grid grid-cols-2 gap-2">
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddContourSeating}
                  className="text-xs flex-col h-auto py-2 border-dashed"
                >
                  <Spline className="h-4 w-4 mb-1" />
                  Contour
                </Button>
              </div>

              {/* Contour Seating List */}
              {contourSeating.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Contour Seating</Label>
                  {contourSeating.map((seating, idx) => (
                    <div
                      key={seating.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedAssetId === seating.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => onSelectAsset(seating.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Spline className="h-3 w-3" />
                          Contour #{idx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {seating.width}ft wide
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Contour Controls */}
              {selectedContour && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg mt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Edit Contour Seating</Label>
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Start Position: {(selectedContour.startPosition * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[selectedContour.startPosition]}
                      onValueChange={([v]) => updateContour(selectedContour.id, { startPosition: v })}
                      min={0}
                      max={0.95}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">End Position: {(selectedContour.endPosition * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[selectedContour.endPosition]}
                      onValueChange={([v]) => updateContour(selectedContour.id, { endPosition: v })}
                      min={0.05}
                      max={1}
                      step={0.01}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Width: {selectedContour.width.toFixed(1)} ft into pool</Label>
                    <Slider
                      value={[selectedContour.width]}
                      onValueChange={([v]) => updateContour(selectedContour.id, { width: v })}
                      min={1}
                      max={4}
                      step={0.25}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Depth: {selectedContour.height.toFixed(1)} ft below water</Label>
                    <Slider
                      value={[selectedContour.height]}
                      onValueChange={([v]) => updateContour(selectedContour.id, { height: v })}
                      min={0.5}
                      max={3}
                      step={0.25}
                    />
                  </div>

                  {/* Texture Controls */}
                  <div className="space-y-2">
                    <Label className="text-xs">Texture</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => setShowTextureMenu(selectedContour.id)}
                      >
                        <Palette className="h-3 w-3 mr-1" />
                        Change Finish
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => updateContour(selectedContour.id, { textureUrl: poolFinishTexture })}
                        title="Match pool finish"
                      >
                        <Link className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Follows pool wall contour. Top surface 1ft below water, extends to floor.
                  </p>
                </div>
              )}

              {/* Chairs List */}
              {chairs.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Individual Seating</Label>
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
                </div>
              )}

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
                    <Label className="text-xs">Top Surface Depth: {selectedChair.height.toFixed(1)} ft below water</Label>
                    <Slider
                      value={[selectedChair.height]}
                      onValueChange={([v]) => updateChair(selectedChair.id, { height: v })}
                      min={0.5}
                      max={4}
                      step={0.25}
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

                  <p className="text-xs text-muted-foreground">
                    Drag in 3D view to reposition
                  </p>
                </div>
              )}

              {chairs.length === 0 && contourSeating.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No seating added. Click above to add.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* LIGHTS TAB */}
        <TabsContent value="lights" className="mt-2">
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-2">
              {/* Add Light Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddLight}
                className="w-full text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Pool Light
              </Button>

              {/* Lights List */}
              {lights.map((light, idx) => (
                <div
                  key={light.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    selectedAssetId === light.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectAsset(light.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <Lightbulb className={`h-3 w-3 ${light.isOn ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                      Light #{idx + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {light.depthFromSurface}ft deep
                    </span>
                  </div>
                </div>
              ))}

              {/* Selected Light Controls */}
              {selectedLight && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg mt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Edit Light</Label>
                    <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Light On</Label>
                    <Switch
                      checked={selectedLight.isOn}
                      onCheckedChange={(v) => updateLight(selectedLight.id, { isOn: v })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Depth: {selectedLight.depthFromSurface.toFixed(1)} ft below water</Label>
                    <Slider
                      value={[selectedLight.depthFromSurface]}
                      onValueChange={([v]) => updateLight(selectedLight.id, { depthFromSurface: v })}
                      min={0.5}
                      max={6}
                      step={0.25}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Intensity: {selectedLight.intensity.toFixed(1)}</Label>
                    <Slider
                      value={[selectedLight.intensity]}
                      onValueChange={([v]) => updateLight(selectedLight.id, { intensity: v })}
                      min={0.5}
                      max={5}
                      step={0.25}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Light Angle: {(selectedLight.angle || 0).toFixed(0)}°</Label>
                    <Slider
                      value={[selectedLight.angle || 0]}
                      onValueChange={([v]) => updateLight(selectedLight.id, { angle: v })}
                      min={-45}
                      max={45}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground">Adjust light beam direction</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Color Mode</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedLight.colorMode === 'white' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => updateLight(selectedLight.id, { colorMode: 'white', color: '#ffffff' })}
                      >
                        White
                      </Button>
                      <Button
                        variant={selectedLight.colorMode === 'gradient' ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => updateLight(selectedLight.id, { colorMode: 'gradient' })}
                      >
                        Color Cycle
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Drag in 3D view to reposition along wall
                  </p>
                </div>
              )}

              {lights.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No lights added. Click above to add.
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
      </Tabs>

      {/* Texture Sync Dialog */}
      <AlertDialog open={showTextureSync} onOpenChange={setShowTextureSync}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Asset Textures?</AlertDialogTitle>
            <AlertDialogDescription>
              The pool finish has changed. Would you like to update stairs and seating to match the new pool finish?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTextureSync(false)}>
              No, Keep Current
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTextureSync}>
              Yes, Sync Textures
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fusion Suggestion Dialog */}
      <AlertDialog open={showFusionSuggestion} onOpenChange={setShowFusionSuggestion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Fuse Stair & Seating?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This stair and seating are adjacent. Would you like to fuse them into a single unified geometry for a seamless look?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowFusionSuggestion(false);
              setFusionPair(null);
            }}>
              Keep Separate
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (fusionPair && onRequestFuseStairSeating) {
                onRequestFuseStairSeating(fusionPair.stairId, fusionPair.seatingId);
              }
              setShowFusionSuggestion(false);
              setFusionPair(null);
            }}>
              Fuse Together
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Texture Selection Menu */}
      {showTextureMenu && availableFinishes.length > 0 && (
        <div className="absolute top-16 left-4 z-20 w-48 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium">Select Texture</Label>
            <Button variant="ghost" size="sm" onClick={() => setShowTextureMenu(null)} className="h-6 w-6 p-0">×</Button>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {availableFinishes.map(finish => (
                <Button
                  key={finish.url}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => {
                    if (showTextureMenu.startsWith('stair-')) {
                      onStairsChange(stairs.map(s => 
                        s.id === showTextureMenu ? { ...s, textureUrl: finish.url } : s
                      ));
                    } else if (showTextureMenu.startsWith('contour-')) {
                      onContourSeatingChange(contourSeating.map(s => 
                        s.id === showTextureMenu ? { ...s, textureUrl: finish.url } : s
                      ));
                    }
                    setShowTextureMenu(null);
                  }}
                >
                  <div className="w-4 h-4 rounded mr-2 border" style={{
                    backgroundImage: `url(${finish.url})`,
                    backgroundSize: 'cover'
                  }} />
                  {finish.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
