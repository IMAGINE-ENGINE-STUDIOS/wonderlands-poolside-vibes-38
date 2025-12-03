import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Trash2, Layers, ArrowUpDown, Sofa } from 'lucide-react';
import { PerimeterDepthPoint } from './types';

interface SplineEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Pool bottom spline
  perimeterDepthPoints: PerimeterDepthPoint[];
  onPerimeterDepthPointsChange: (points: PerimeterDepthPoint[]) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  // Component selection
  selectedComponent: 'pool-floor' | 'seating' | 'stairs' | null;
  onSelectComponent: (component: 'pool-floor' | 'seating' | 'stairs' | null) => void;
  // Pool depth from selected model
  poolModelDepth?: number;
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
  poolModelDepth = 6
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
    const newPoints = perimeterDepthPoints.map(p => ({
      ...p,
      depth: poolModelDepth
    }));
    onPerimeterDepthPointsChange(newPoints);
  };

  const handlePointDepthChange = (depth: number) => {
    if (!selectedPointId) return;
    
    const newPoints = perimeterDepthPoints.map(p =>
      p.id === selectedPointId ? { ...p, depth } : p
    );
    onPerimeterDepthPointsChange(newPoints);
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 w-80 bg-background/98 backdrop-blur-md border border-orange-500/50 rounded-xl shadow-2xl z-40 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-500/30 bg-orange-500/10">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-base">Pool Depth Editor</h3>
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
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onSelectComponent('pool-floor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedComponent === 'pool-floor' 
                  ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' 
                  : 'bg-muted hover:bg-muted/80 border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              Pool Floor Depth
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
              Contour Seating
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
                <span className="text-sm font-bold text-cyan-400">{poolModelDepth.toFixed(1)} ft</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncToPoolModel}
                className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
              >
                Sync All Points to Model Depth
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

        {/* Seating Controls */}
        {selectedComponent === 'seating' && (
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs text-green-400">
                Seating contours follow the pool wall. Use the Pool Asset Manager to adjust seating start/end positions and width.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              Seating automatically extends from water surface to pool floor following the wall contour.
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
              <li>• Use "Sync to Model" for accurate pool depth</li>
              <li>• Camera rotation is locked for editing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}