import { useState, useCallback, useEffect } from 'react';
import { 
  Package, 
  X, 
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
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as THREE from 'three';
import { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './scene3d/poolAssetTypes';
import { PoolLightConfig, TextureConfig } from './scene3d/types';
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

interface Asset3D {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'cylinder';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

interface AssetManagerProps {
  // Original 3D assets
  onAddAsset?: (asset: Asset3D) => void;
  assets?: Asset3D[];
  onRemoveAsset?: (id: string) => void;
  // Pool assets
  stairs?: PoolStairConfig[];
  onStairsChange?: (stairs: PoolStairConfig[]) => void;
  chairs?: PoolChairConfig[];
  onChairsChange?: (chairs: PoolChairConfig[]) => void;
  contourSeating?: ContourSeatingConfig[];
  onContourSeatingChange?: (seating: ContourSeatingConfig[]) => void;
  lights?: PoolLightConfig[];
  onLightsChange?: (lights: PoolLightConfig[]) => void;
  selectedAssetId?: string | null;
  onSelectAsset?: (id: string | null) => void;
  poolFinishTexture?: string;
  isNightMode?: boolean;
  availableFinishes?: TextureConfig[];
  onRequestFuseStairSeating?: (stairId: string, seatingId: string) => void;
}

export function AssetManager({ 
  onAddAsset, 
  assets = [], 
  onRemoveAsset,
  stairs = [],
  onStairsChange,
  chairs = [],
  onChairsChange,
  contourSeating = [],
  onContourSeatingChange,
  lights = [],
  onLightsChange,
  selectedAssetId,
  onSelectAsset,
  poolFinishTexture = '',
  isNightMode = false,
  availableFinishes = [],
  onRequestFuseStairSeating
}: AssetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stairs');
  const [showTextureSync, setShowTextureSync] = useState(false);
  const [pendingTextureSync, setPendingTextureSync] = useState<string | null>(null);
  const [showTextureMenu, setShowTextureMenu] = useState<string | null>(null);
  const [showFusionSuggestion, setShowFusionSuggestion] = useState(false);
  const [fusionPair, setFusionPair] = useState<{ stairId: string; seatingId: string } | null>(null);
  const [lastPoolFinish, setLastPoolFinish] = useState(poolFinishTexture);

  // Check if pool assets mode is enabled
  const hasPoolAssets = onStairsChange || onChairsChange || onContourSeatingChange || onLightsChange;

  // Watch for pool finish texture changes
  useEffect(() => {
    if (poolFinishTexture !== lastPoolFinish && lastPoolFinish) {
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

  const handleConfirmTextureSync = useCallback(() => {
    if (!pendingTextureSync) return;
    
    onStairsChange?.(stairs.map(s => 
      s.textureUrl === lastPoolFinish ? { ...s, textureUrl: pendingTextureSync } : s
    ));
    
    onContourSeatingChange?.(contourSeating.map(s => 
      s.textureUrl === lastPoolFinish ? { ...s, textureUrl: pendingTextureSync } : s
    ));
    
    setShowTextureSync(false);
    setPendingTextureSync(null);
  }, [pendingTextureSync, lastPoolFinish, stairs, contourSeating, onStairsChange, onContourSeatingChange]);

  // Add new stair
  const handleAddStair = useCallback((shape: 'linear' | 'curved') => {
    const newStair: PoolStairConfig = {
      id: `stair-${Date.now()}`,
      wallPosition: 0.1 + Math.random() * 0.2,
      shape,
      width: 5,
      numSteps: 4,
      stepHeight: 0.625,
      stepDepth: 0.917,
      textureUrl: poolFinishTexture,
      cornerRadius: shape === 'curved' ? 1.0 : 0.5
    };
    onStairsChange?.([...stairs, newStair]);
    onSelectAsset?.(newStair.id);
  }, [stairs, onStairsChange, onSelectAsset, poolFinishTexture]);

  // Add new chair/bench
  const handleAddChair = useCallback((preset: 'lounge' | 'bench' | 'corner') => {
    const presets = {
      lounge: { width: 2.5, depth: 6, height: 1.5, name: 'Tanning Ledge' },
      bench: { width: 6, depth: 1.5, height: 1.0, name: 'Pool Bench' },
      corner: { width: 2, depth: 2, height: 1.0, name: 'Corner Seat' }
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
    onChairsChange?.([...chairs, newChair]);
    onSelectAsset?.(newChair.id);
  }, [chairs, onChairsChange, onSelectAsset, poolFinishTexture]);

  // Add new light
  const handleAddLight = useCallback(() => {
    const newLight: PoolLightConfig = {
      id: `light-${Date.now()}`,
      wallPosition: Math.random() * 0.8 + 0.1,
      depthFromSurface: 2.0,
      color: '#ffffff',
      colorMode: 'gradient',
      intensity: 2,
      isOn: isNightMode,
      angle: 0
    };
    onLightsChange?.([...lights, newLight]);
    onSelectAsset?.(newLight.id);
  }, [lights, onLightsChange, onSelectAsset, isNightMode]);

  // Add contour seating
  const handleAddContourSeating = useCallback(() => {
    const newSeating: ContourSeatingConfig = {
      id: `contour-${Date.now()}`,
      startPosition: 0.1 + Math.random() * 0.1,
      endPosition: 0.3 + Math.random() * 0.1,
      width: 1.5,
      height: 1.0,
      textureUrl: poolFinishTexture
    };
    onContourSeatingChange?.([...contourSeating, newSeating]);
    onSelectAsset?.(newSeating.id);
  }, [contourSeating, onContourSeatingChange, onSelectAsset, poolFinishTexture]);

  // Delete selected asset
  const handleDeleteSelected = useCallback(() => {
    if (!selectedAssetId) return;
    
    if (selectedAssetId.startsWith('stair-')) {
      onStairsChange?.(stairs.filter(s => s.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('chair-')) {
      onChairsChange?.(chairs.filter(c => c.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('light-')) {
      onLightsChange?.(lights.filter(l => l.id !== selectedAssetId));
    } else if (selectedAssetId.startsWith('contour-')) {
      onContourSeatingChange?.(contourSeating.filter(s => s.id !== selectedAssetId));
    }
    onSelectAsset?.(null);
  }, [selectedAssetId, stairs, chairs, lights, contourSeating, onStairsChange, onChairsChange, onLightsChange, onContourSeatingChange, onSelectAsset]);

  // Get selected items
  const selectedStair = stairs.find(s => s.id === selectedAssetId);
  const selectedChair = chairs.find(c => c.id === selectedAssetId);
  const selectedLight = lights.find(l => l.id === selectedAssetId);
  const selectedContour = contourSeating.find(s => s.id === selectedAssetId);

  // Update functions
  const updateStair = useCallback((id: string, updates: Partial<PoolStairConfig>) => {
    onStairsChange?.(stairs.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [stairs, onStairsChange]);

  const updateChair = useCallback((id: string, updates: Partial<PoolChairConfig>) => {
    onChairsChange?.(chairs.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [chairs, onChairsChange]);

  const updateLight = useCallback((id: string, updates: Partial<PoolLightConfig>) => {
    onLightsChange?.(lights.map(l => l.id === id ? { ...l, ...updates } : l));
  }, [lights, onLightsChange]);

  const updateContour = useCallback((id: string, updates: Partial<ContourSeatingConfig>) => {
    onContourSeatingChange?.(contourSeating.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [contourSeating, onContourSeatingChange]);

  // Original add cube function
  const addCube = () => {
    const newAsset: Asset3D = {
      id: `cube-${Date.now()}`,
      name: 'Cube',
      type: 'cube',
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [2, 2, 2],
      color: '#8b5a3c'
    };
    onAddAsset?.(newAsset);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border-primary/20 hover:border-primary/50 hover:bg-primary/10"
        title="Asset Manager"
      >
        <Package className="h-5 w-5 text-primary" />
      </Button>
    );
  }

  return (
    <>
      <div className="absolute bottom-20 right-4 z-50 w-80 bg-background/98 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl max-h-[calc(100vh-160px)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Asset Manager
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0 hover:bg-primary/10">
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {hasPoolAssets ? (
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddStair('linear')} className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Linear Stair
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddStair('curved')} className="text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Curved Stair
                    </Button>
                  </div>

                  {stairs.map((stair, idx) => (
                    <div
                      key={stair.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedAssetId === stair.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => onSelectAsset?.(stair.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {stair.shape === 'curved' ? 'Curved' : 'Linear'} Stair #{idx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">{stair.numSteps} steps</span>
                      </div>
                    </div>
                  ))}

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
                        <Label className="text-xs">Steps: {selectedStair.numSteps}</Label>
                        <Slider
                          value={[selectedStair.numSteps]}
                          onValueChange={([v]) => updateStair(selectedStair.id, { numSteps: v })}
                          min={2}
                          max={12}
                          step={1}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Step Height: {(selectedStair.stepHeight * 12).toFixed(1)}"</Label>
                        <Slider
                          value={[selectedStair.stepHeight]}
                          onValueChange={([v]) => updateStair(selectedStair.id, { stepHeight: v })}
                          min={0.5}
                          max={0.833}
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

                      <p className="text-xs text-muted-foreground">
                        Drag in 3D view to reposition.
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

            {/* SEATING TAB */}
            <TabsContent value="chairs" className="mt-2">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddChair('lounge')} className="text-xs flex-col h-auto py-2">
                      <Armchair className="h-4 w-4 mb-1" />
                      Lounge
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddChair('bench')} className="text-xs flex-col h-auto py-2">
                      <Armchair className="h-4 w-4 mb-1" />
                      Bench
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddChair('corner')} className="text-xs flex-col h-auto py-2">
                      <Armchair className="h-4 w-4 mb-1" />
                      Corner
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddContourSeating} className="text-xs flex-col h-auto py-2 border-dashed">
                      <Spline className="h-4 w-4 mb-1" />
                      Contour
                    </Button>
                  </div>

                  {contourSeating.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Contour Seating</Label>
                      {contourSeating.map((seating, idx) => (
                        <div
                          key={seating.id}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            selectedAssetId === seating.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => onSelectAsset?.(seating.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium flex items-center gap-1">
                              <Spline className="h-3 w-3" />
                              Contour #{idx + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">{seating.width}ft wide</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                        <Label className="text-xs">Width: {selectedContour.width.toFixed(1)} ft</Label>
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
                    </div>
                  )}

                  {chairs.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Individual Seating</Label>
                      {chairs.map((chair, idx) => (
                        <div
                          key={chair.id}
                          className={`p-2 border rounded cursor-pointer transition-colors ${
                            selectedAssetId === chair.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => onSelectAsset?.(chair.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{chair.name || `Seating #${idx + 1}`}</span>
                            <span className="text-xs text-muted-foreground">{chair.width}x{chair.depth} ft</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                        <Label className="text-xs">Top Depth: {selectedChair.height.toFixed(1)} ft below water</Label>
                        <Slider
                          value={[selectedChair.height]}
                          onValueChange={([v]) => updateChair(selectedChair.id, { height: v })}
                          min={0.5}
                          max={4}
                          step={0.25}
                        />
                      </div>
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
                  <Button variant="outline" size="sm" onClick={handleAddLight} className="w-full text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Pool Light
                  </Button>

                  {lights.map((light, idx) => (
                    <div
                      key={light.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedAssetId === light.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => onSelectAsset?.(light.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium flex items-center gap-2">
                          <Lightbulb className={`h-3 w-3 ${light.isOn ? 'text-yellow-400' : ''}`} />
                          Light #{idx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">{light.isOn ? 'On' : 'Off'}</span>
                      </div>
                    </div>
                  ))}

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
                        <Label className="text-xs">Depth: {selectedLight.depthFromSurface.toFixed(1)} ft</Label>
                        <Slider
                          value={[selectedLight.depthFromSurface]}
                          onValueChange={([v]) => updateLight(selectedLight.id, { depthFromSurface: v })}
                          min={0.5}
                          max={6}
                          step={0.25}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Color</Label>
                        <input
                          type="color"
                          value={selectedLight.color}
                          onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
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
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-2">
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Jets coming soon. Configure water features here.
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-64">
            <div className="p-3 space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Add 3D Objects</p>
                <Button variant="outline" size="sm" className="w-full" onClick={addCube}>
                  + Add Cube
                </Button>
              </div>

              {assets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Placed Assets ({assets.length})</p>
                  <div className="space-y-1">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted"
                      >
                        <span className="text-xs">{asset.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onRemoveAsset?.(asset.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assets.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No assets placed yet. Click "Add Cube" to start.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Texture Sync Dialog */}
      <AlertDialog open={showTextureSync} onOpenChange={setShowTextureSync}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sync Asset Textures?</AlertDialogTitle>
            <AlertDialogDescription>
              The pool finish has changed. Update stairs and seating to match the new finish?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowTextureSync(false)}>
              Keep Current
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmTextureSync}>
              Sync Textures
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Component to render 3D assets in the scene
export function Asset3DRenderer({ asset }: { asset: Asset3D }) {
  const geometry = asset.type === 'cube' 
    ? new THREE.BoxGeometry(asset.scale[0], asset.scale[1], asset.scale[2])
    : asset.type === 'sphere'
    ? new THREE.SphereGeometry(asset.scale[0] / 2, 32, 32)
    : new THREE.CylinderGeometry(asset.scale[0] / 2, asset.scale[0] / 2, asset.scale[1], 32);

  return (
    <mesh
      geometry={geometry}
      position={asset.position}
      rotation={asset.rotation}
    >
      <meshStandardMaterial color={asset.color} />
    </mesh>
  );
}
