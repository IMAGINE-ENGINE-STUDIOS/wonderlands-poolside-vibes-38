import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Minus, Move, Edit3, Layers, Trash2 } from 'lucide-react';
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
}

export function SplineEditPanel({
  isOpen,
  onClose,
  perimeterDepthPoints,
  onPerimeterDepthPointsChange,
  selectedPointId,
  onSelectPoint,
  selectedComponent,
  onSelectComponent
}: SplineEditPanelProps) {
  const [uniformDepth, setUniformDepth] = useState(5);

  if (!isOpen) return null;

  const selectedPoint = perimeterDepthPoints.find(p => p.id === selectedPointId);

  const handleAddPoint = () => {
    if (perimeterDepthPoints.length < 2) return;
    
    // Add a point between first and second point
    const p1 = perimeterDepthPoints[0];
    const p2 = perimeterDepthPoints[1];
    
    const newPoint: PerimeterDepthPoint = {
      x: (p1.x + p2.x) / 2,
      z: (p1.z + p2.z) / 2,
      depth: (p1.depth + p2.depth) / 2,
      id: `perimeter-depth-${Date.now()}`,
      type: 'smooth'
    };
    
    const newPoints = [p1, newPoint, ...perimeterDepthPoints.slice(1)];
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

  const handlePointDepthChange = (depth: number) => {
    if (!selectedPointId) return;
    
    const newPoints = perimeterDepthPoints.map(p =>
      p.id === selectedPointId ? { ...p, depth } : p
    );
    onPerimeterDepthPointsChange(newPoints);
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 w-72 bg-background/98 backdrop-blur-md border border-orange-500/50 rounded-xl shadow-2xl z-40 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-orange-500/30 bg-orange-500/10">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-orange-500" />
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
          <Label className="text-xs font-semibold text-muted-foreground">Select Component</Label>
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
          </div>
        </div>

        {/* Pool Floor Controls */}
        {selectedComponent === 'pool-floor' && (
          <>
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold">Point Controls</Label>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPoint}
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
                {perimeterDepthPoints.length} control points
              </div>
            </div>

            {/* Selected Point Controls */}
            {selectedPoint && (
              <div className="border-t border-border pt-4 space-y-3">
                <Label className="text-xs font-semibold text-cyan-400">
                  Selected Point: {selectedPoint.id.split('-').pop()}
                </Label>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Depth</Label>
                    <span className="text-xs text-muted-foreground">{selectedPoint.depth.toFixed(1)} ft</span>
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

                <div className="text-xs text-muted-foreground">
                  Position: ({selectedPoint.x.toFixed(1)}, {selectedPoint.z.toFixed(1)})
                </div>
              </div>
            )}

            {/* Uniform Depth Tool */}
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold">Set Uniform Depth</Label>
              
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

        {/* Instructions */}
        <div className="border-t border-border pt-4">
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
            <p className="text-xs text-foreground font-medium mb-1">
              Editing Tips:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Click cyan spheres to select points</li>
              <li>• Drag vertically to change depth</li>
              <li>• Camera rotation is locked</li>
              <li>• Scroll to zoom, drag to pan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
