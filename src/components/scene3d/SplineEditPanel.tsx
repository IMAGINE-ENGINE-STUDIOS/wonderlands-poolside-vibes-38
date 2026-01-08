import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Trash2, Layers, ArrowUpDown, Sofa, Footprints, Waves, Square, Frame } from 'lucide-react';
import { PerimeterDepthPoint } from './types';
import { PoolStairConfig, ContourSeatingConfig } from './poolAssetTypes';

interface SplineEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Pool bottom spline
  perimeterDepthPoints: PerimeterDepthPoint[];
  onPerimeterDepthPointsChange: (points: PerimeterDepthPoint[]) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  // Component selection - now includes coping and deck
  selectedComponent: 'pool-floor' | 'seating' | 'stairs' | 'waterline' | 'deck' | 'coping' | null;
  onSelectComponent: (component: 'pool-floor' | 'seating' | 'stairs' | 'waterline' | 'deck' | 'coping' | null) => void;
  // Pool depth from selected model
  poolModelDepth?: number;
  poolModelShallowDepth?: number;
  // Stairs and seating for editing
  stairs?: PoolStairConfig[];
  onStairsChange?: (stairs: PoolStairConfig[]) => void;
  contourSeating?: ContourSeatingConfig[];
  onContourSeatingChange?: (seating: ContourSeatingConfig[]) => void;
  selectedAssetId?: string | null;
  // Coping and deck properties
  copingWidth?: number;
  onCopingWidthChange?: (width: number) => void;
  copingHeight?: number;
  onCopingHeightChange?: (height: number) => void;
  deckWidth?: number;
  onDeckWidthChange?: (width: number) => void;
}

export function SplineEditPanel({
  isOpen,
  onClose,
  perimeterDepthPoints,
  onPerimeterDepthPointsChange,
  selectedPointId,
  onSelectPoint,
  selectedComponent,
  onSelectComponent,
  poolModelDepth = 6,
  poolModelShallowDepth = 3.75,
  stairs = [],
  onStairsChange,
  contourSeating = [],
  onContourSeatingChange,
  selectedAssetId,
  copingWidth = 1.0,
  onCopingWidthChange,
  copingHeight = 0.5,
  onCopingHeightChange,
  deckWidth = 8,
  onDeckWidthChange
}: SplineEditPanelProps) {
  const [uniformDepth, setUniformDepth] = useState(poolModelDepth);

  // Sync uniform depth with pool model depth
  useEffect(() => {
    if (poolModelDepth) {
      setUniformDepth(poolModelDepth);
    }
  }, [poolModelDepth]);

  if (!isOpen) return null;

  const selectedPoint = perimeterDepthPoints.find(p => p.id === selectedPointId);
  const selectedStair = stairs.find(s => s.id === selectedAssetId);
  const selectedSeating = contourSeating.find(s => s.id === selectedAssetId);

  const handleAddPointBetween = (index: number) => {
    if (perimeterDepthPoints.length < 2) return;
    
    const p1 = perimeterDepthPoints[index];
    const p2 = perimeterDepthPoints[(index + 1) % perimeterDepthPoints.length];
    
    const newPoint: PerimeterDepthPoint = {
      x: (p1.x + p2.x) / 2,
      z: (p1.z + p2.z) / 2,
      depth: (p1.depth + p2.depth) / 2,
      id: `perimeter-depth-${Date.now()}`,
      type: 'smooth'
    };
    
    const newPoints = [
      ...perimeterDepthPoints.slice(0, index + 1),
      newPoint,
      ...perimeterDepthPoints.slice(index + 1)
    ];
    onPerimeterDepthPointsChange(newPoints);
  };

  const handleRemovePoint = () => {
    if (!selectedPointId || perimeterDepthPoints.length <= 3) return;
    
    const newPoints = perimeterDepthPoints.filter(p => p.id !== selectedPointId);
    onPerimeterDepthPointsChange(newPoints);
    onSelectPoint(null);
  };

  const handleSetUniformDepth = () => {
    const newPoints = perimeterDepthPoints.map(p => ({
      ...p,
      depth: uniformDepth
    }));
    onPerimeterDepthPointsChange(newPoints);
  };

  const handleSyncToPoolModel = () => {
    // Create gradient from shallow to deep
    const newPoints = perimeterDepthPoints.map((p, i, arr) => {
      const normalizedPos = i / arr.length;
      let depth: number;
      if (normalizedPos <= 0.5) {
        depth = poolModelShallowDepth + (poolModelDepth - poolModelShallowDepth) * (normalizedPos * 2);
      } else {
        depth = poolModelDepth - (poolModelDepth - poolModelShallowDepth) * ((normalizedPos - 0.5) * 2);
      }
      return { ...p, depth };
    });
    onPerimeterDepthPointsChange(newPoints);
  };

  const handlePointDepthChange = (depth: number) => {
    if (!selectedPointId) return;
    
    const newPoints = perimeterDepthPoints.map(p =>
      p.id === selectedPointId ? { ...p, depth } : p
    );
    onPerimeterDepthPointsChange(newPoints);
  };

  // Stair spline editing
  const handleStairCornerRadiusChange = (radius: number) => {
    if (!selectedStair || !onStairsChange) return;
    const updated = stairs.map(s => 
      s.id === selectedStair.id ? { ...s, cornerRadius: radius, shape: 'curved' as const } : s
    );
    onStairsChange(updated);
  };

  const handleStairWidthChange = (width: number) => {
    if (!selectedStair || !onStairsChange) return;
    const updated = stairs.map(s => 
      s.id === selectedStair.id ? { ...s, width } : s
    );
    onStairsChange(updated);
  };

  // Seating spline editing
  const handleSeatingWidthChange = (width: number) => {
    if (!selectedSeating || !onContourSeatingChange) return;
    const updated = contourSeating.map(s => 
      s.id === selectedSeating.id ? { ...s, width } : s
    );
    onContourSeatingChange(updated);
  };

  const handleSeatingHeightChange = (height: number) => {
    if (!selectedSeating || !onContourSeatingChange) return;
    const updated = contourSeating.map(s => 
      s.id === selectedSeating.id ? { ...s, height } : s
    );
    onContourSeatingChange(updated);
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 w-80 bg-background/98 backdrop-blur-md border border-orange-500/50 rounded-xl shadow-2xl z-40 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-500/30 bg-orange-500/10">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-base">Spline Editor</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Component Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground">Edit Component</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSelectComponent('pool-floor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'pool-floor' 
                  ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              Floor
            </button>
            <button
              onClick={() => onSelectComponent('coping')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'coping' 
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Frame className="w-4 h-4" />
              Coping
            </button>
            <button
              onClick={() => onSelectComponent('deck')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'deck' 
                  ? 'bg-orange-500/20 border border-orange-500 text-orange-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Square className="w-4 h-4" />
              Deck
            </button>
            <button
              onClick={() => onSelectComponent('stairs')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'stairs' 
                  ? 'bg-purple-500/20 border border-purple-500 text-purple-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Footprints className="w-4 h-4" />
              Stairs
            </button>
            <button
              onClick={() => onSelectComponent('seating')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'seating' 
                  ? 'bg-green-500/20 border border-green-500 text-green-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Sofa className="w-4 h-4" />
              Seating
            </button>
            <button
              onClick={() => onSelectComponent('waterline')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'waterline' 
                  ? 'bg-blue-500/20 border border-blue-500 text-blue-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Waves className="w-4 h-4" />
              Water
            </button>
          </div>
        </div>

        {/* Pool Floor Controls */}
        {selectedComponent === 'pool-floor' && (
          <>
            {/* Sync with Pool Model */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">Pool Model Depth</Label>
                <span className="text-sm font-bold text-cyan-400">
                  {poolModelShallowDepth.toFixed(1)}' - {poolModelDepth.toFixed(1)}'
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncToPoolModel}
                className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              >
                Sync to Model Depth Profile
              </Button>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold">Point Controls</Label>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const idx = selectedPointId 
                      ? perimeterDepthPoints.findIndex(p => p.id === selectedPointId)
                      : 0;
                    handleAddPointBetween(idx >= 0 ? idx : 0);
                  }}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Point
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePoint}
                  disabled={!selectedPointId || perimeterDepthPoints.length <= 3}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                {perimeterDepthPoints.length} control points around perimeter
              </div>
            </div>

            {/* Selected Point Controls */}
            {selectedPoint && (
              <div className="border-t border-border pt-4 space-y-3">
                <Label className="text-xs font-semibold text-cyan-400">
                  Point #{perimeterDepthPoints.findIndex(p => p.id === selectedPointId) + 1}
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Depth</Label>
                    <span className="text-sm font-mono text-cyan-400">{selectedPoint.depth.toFixed(1)} ft</span>
                  </div>
                  <Slider
                    value={[selectedPoint.depth]}
                    onValueChange={(value) => handlePointDepthChange(value[0])}
                    min={1}
                    max={12}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="text-xs text-muted-foreground font-mono">
                  Position: ({selectedPoint.x.toFixed(1)}, {selectedPoint.z.toFixed(1)})
                </div>
              </div>
            )}

            {/* Uniform Depth Tool */}
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold">Custom Uniform Depth</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">All Points Depth</Label>
                  <span className="text-xs text-muted-foreground">{uniformDepth.toFixed(1)} ft</span>
                </div>
                <Slider
                  value={[uniformDepth]}
                  onValueChange={(value) => setUniformDepth(value[0])}
                  min={1}
                  max={12}
                  step={0.5}
                  className="w-full"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetUniformDepth}
                className="w-full"
              >
                Apply Uniform Depth
              </Button>
            </div>
          </>
        )}

        {/* Stairs Controls */}
        {selectedComponent === 'stairs' && (
          <div className="space-y-3">
            {selectedStair ? (
              <>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <Label className="text-xs font-semibold text-purple-400 mb-2 block">
                    Editing: {selectedStair.shape === 'curved' ? 'Curved' : 'Linear'} Stair
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Width</Label>
                        <span className="text-sm font-mono text-purple-400">{selectedStair.width.toFixed(1)} ft</span>
                      </div>
                      <Slider
                        value={[selectedStair.width]}
                        onValueChange={(value) => handleStairWidthChange(value[0])}
                        min={2}
                        max={12}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Corner Radius</Label>
                        <span className="text-sm font-mono text-purple-400">{(selectedStair.cornerRadius || 0).toFixed(1)} ft</span>
                      </div>
                      <Slider
                        value={[selectedStair.cornerRadius || 0]}
                        onValueChange={(value) => handleStairCornerRadiusChange(value[0])}
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set greater than 0 for rounded corners
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <p className="text-xs text-purple-400">
                  Select a stair in the 3D view or Pool Asset Manager to edit its spline properties.
                </p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {stairs.length} stairs in scene. Drag stairs in 3D view to reposition.
            </div>
          </div>
        )}

        {/* Seating Controls */}
        {selectedComponent === 'seating' && (
          <div className="space-y-3">
            {selectedSeating ? (
              <>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <Label className="text-xs font-semibold text-green-400 mb-2 block">
                    Editing: Contour Seating
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Width (into pool)</Label>
                        <span className="text-sm font-mono text-green-400">{selectedSeating.width.toFixed(1)} ft</span>
                      </div>
                      <Slider
                        value={[selectedSeating.width]}
                        onValueChange={(value) => handleSeatingWidthChange(value[0])}
                        min={0.5}
                        max={4}
                        step={0.25}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Depth Below Water</Label>
                        <span className="text-sm font-mono text-green-400">{selectedSeating.height.toFixed(1)} ft</span>
                      </div>
                      <Slider
                        value={[selectedSeating.height]}
                        onValueChange={(value) => handleSeatingHeightChange(value[0])}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-xs text-green-400">
                  Select contour seating in the 3D view or Pool Asset Manager to edit its spline properties.
                </p>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              {contourSeating.length} seating sections in scene. Seating follows pool wall contours.
            </div>
          </div>
        )}

        {/* Coping Controls */}
        {selectedComponent === 'coping' && (
          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <Label className="text-xs font-semibold text-amber-400 mb-2 block">Coping Dimensions</Label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Width</Label>
                    <span className="text-sm font-mono text-amber-400">{copingWidth.toFixed(1)} ft</span>
                  </div>
                  <Slider
                    value={[copingWidth]}
                    onValueChange={(value) => onCopingWidthChange?.(value[0])}
                    min={0.5}
                    max={3}
                    step={0.25}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Height</Label>
                    <span className="text-sm font-mono text-amber-400">{copingHeight.toFixed(2)} ft</span>
                  </div>
                  <Slider
                    value={[copingHeight]}
                    onValueChange={(value) => onCopingHeightChange?.(value[0])}
                    min={0.25}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Coping follows pool perimeter. Use Texture panel to change material.
            </div>
          </div>
        )}

        {/* Deck Controls */}
        {selectedComponent === 'deck' && (
          <div className="space-y-3">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <Label className="text-xs font-semibold text-orange-400 mb-2 block">Deck Width</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Width from Coping</Label>
                  <span className="text-sm font-mono text-orange-400">{deckWidth.toFixed(0)} ft</span>
                </div>
                <Slider
                  value={[deckWidth]}
                  onValueChange={(value) => onDeckWidthChange?.(value[0])}
                  min={3}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Deck surrounds the pool. Use Texture panel to change paver material.
            </div>
          </div>
        )}

        {/* Waterline Controls */}
        {selectedComponent === 'waterline' && (
          <div className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                Waterline follows the pool perimeter automatically. 
                Use the Texture panel to change waterline tile texture.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Waterline is 0.5ft tall, positioned at water surface level.
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border-t border-border pt-4">
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
            <p className="text-xs text-foreground font-medium mb-1">
              Editing Tips:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Click cyan spheres to select depth points</li>
              <li>• Drag vertically to change individual depth</li>
              <li>• Select stairs/seating in 3D view to edit</li>
              <li>• Camera rotation is locked for editing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
