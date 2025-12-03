import { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, ArrowUpDown, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { PerimeterDepthPoint } from './types';

interface DepthProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  perimeterDepthPoints: PerimeterDepthPoint[];
  onPerimeterDepthPointsChange: (points: PerimeterDepthPoint[]) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  // Pool depth from selected product
  poolShallowDepth?: number;
  poolDeepDepth?: number;
}

interface LinearDepthAnchor {
  id: string;
  position: number; // 0-1 along pool length
  depth: number;
}

export function DepthProfileEditor({
  isOpen,
  onClose,
  perimeterDepthPoints,
  onPerimeterDepthPointsChange,
  selectedPointId,
  onSelectPoint,
  poolShallowDepth = 3.75,
  poolDeepDepth = 8.5,
}: DepthProfileEditorProps) {
  // Linear depth anchors for the simplified depth profile view
  const [depthAnchors, setDepthAnchors] = useState<LinearDepthAnchor[]>([
    { id: 'd1', position: 0, depth: poolShallowDepth },
    { id: 'd2', position: 0.33, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.33 },
    { id: 'd3', position: 0.67, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.67 },
    { id: 'd4', position: 1, depth: poolDeepDepth },
  ]);

  // Initialize depth anchors from perimeter depth points
  useEffect(() => {
    if (perimeterDepthPoints.length >= 4) {
      // Extract unique depths from perimeter points (assuming they're organized shallow to deep)
      const depths = perimeterDepthPoints.map(p => p.depth);
      const minDepth = Math.min(...depths);
      const maxDepth = Math.max(...depths);
      
      setDepthAnchors([
        { id: 'd1', position: 0, depth: minDepth },
        { id: 'd2', position: 0.33, depth: minDepth + (maxDepth - minDepth) * 0.33 },
        { id: 'd3', position: 0.67, depth: minDepth + (maxDepth - minDepth) * 0.67 },
        { id: 'd4', position: 1, depth: maxDepth },
      ]);
    }
  }, []);

  // Sync from product depths on mount
  useEffect(() => {
    if (poolShallowDepth && poolDeepDepth) {
      setDepthAnchors([
        { id: 'd1', position: 0, depth: poolShallowDepth },
        { id: 'd2', position: 0.33, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.33 },
        { id: 'd3', position: 0.67, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.67 },
        { id: 'd4', position: 1, depth: poolDeepDepth },
      ]);
    }
  }, [poolShallowDepth, poolDeepDepth]);

  // When depth anchors change, update perimeterDepthPoints
  const syncToPerimeterPoints = (anchors: LinearDepthAnchor[]) => {
    if (perimeterDepthPoints.length === 0) return;

    // Sort anchors by position
    const sortedAnchors = [...anchors].sort((a, b) => a.position - b.position);
    
    // Map perimeter points to new depths based on their position in the loop
    const totalPoints = perimeterDepthPoints.length;
    const newPoints = perimeterDepthPoints.map((point, index) => {
      // Calculate position along the depth profile (0-1)
      // Points 0 to half are shallow to deep, half to end are deep to shallow
      let profilePosition: number;
      const halfPoints = totalPoints / 2;
      
      if (index < halfPoints) {
        profilePosition = index / halfPoints; // 0 to 1
      } else {
        profilePosition = 1 - ((index - halfPoints) / halfPoints); // 1 to 0
      }

      // Interpolate depth from anchors
      let depth = sortedAnchors[0].depth;
      for (let i = 0; i < sortedAnchors.length - 1; i++) {
        if (profilePosition >= sortedAnchors[i].position && profilePosition <= sortedAnchors[i + 1].position) {
          const t = (profilePosition - sortedAnchors[i].position) / (sortedAnchors[i + 1].position - sortedAnchors[i].position);
          depth = sortedAnchors[i].depth + t * (sortedAnchors[i + 1].depth - sortedAnchors[i].depth);
          break;
        }
      }

      return { ...point, depth };
    });

    onPerimeterDepthPointsChange(newPoints);
  };

  const handleAnchorDepthChange = (id: string, newDepth: number) => {
    const clampedDepth = Math.max(1, Math.min(12, newDepth));
    const newAnchors = depthAnchors.map(a => 
      a.id === id ? { ...a, depth: clampedDepth } : a
    );
    setDepthAnchors(newAnchors);
    syncToPerimeterPoints(newAnchors);
  };

  const handleResetToProductDepths = () => {
    const newAnchors = [
      { id: 'd1', position: 0, depth: poolShallowDepth },
      { id: 'd2', position: 0.33, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.33 },
      { id: 'd3', position: 0.67, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.67 },
      { id: 'd4', position: 1, depth: poolDeepDepth },
    ];
    setDepthAnchors(newAnchors);
    syncToPerimeterPoints(newAnchors);
  };

  const handleAddAnchor = () => {
    if (depthAnchors.length >= 6) return; // Max 6 anchors
    
    // Add at midpoint of largest gap
    const sorted = [...depthAnchors].sort((a, b) => a.position - b.position);
    let maxGap = 0;
    let insertPos = 0.5;
    let insertDepth = (poolShallowDepth + poolDeepDepth) / 2;
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].position - sorted[i].position;
      if (gap > maxGap) {
        maxGap = gap;
        insertPos = (sorted[i].position + sorted[i + 1].position) / 2;
        insertDepth = (sorted[i].depth + sorted[i + 1].depth) / 2;
      }
    }

    const newAnchors = [
      ...depthAnchors,
      { id: `d${Date.now()}`, position: insertPos, depth: insertDepth }
    ];
    setDepthAnchors(newAnchors);
    syncToPerimeterPoints(newAnchors);
  };

  const handleRemoveAnchor = (id: string) => {
    if (depthAnchors.length <= 2) return; // Min 2 anchors (shallow and deep)
    
    const newAnchors = depthAnchors.filter(a => a.id !== id);
    setDepthAnchors(newAnchors);
    syncToPerimeterPoints(newAnchors);
  };

  if (!isOpen) return null;

  const sortedAnchors = [...depthAnchors].sort((a, b) => a.position - b.position);

  return (
    <div className="absolute top-4 left-4 w-80 bg-background/95 backdrop-blur-sm rounded-xl border shadow-xl z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Depth Profile</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Info Text */}
        <p className="text-xs text-muted-foreground">
          Adjust depth at each anchor point along the pool length
        </p>

        {/* Product Depths Reference */}
        <div className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded-lg">
          <span>Product Spec:</span>
          <span className="font-medium">{poolShallowDepth.toFixed(1)}' - {poolDeepDepth.toFixed(1)}'</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={handleResetToProductDepths}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Depth Anchor Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Depth Anchors (Shallow to Deep)</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleAddAnchor}
              disabled={depthAnchors.length >= 6}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {sortedAnchors.map((anchor, index) => (
              <div key={anchor.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground">
                    {(anchor.position * 100).toFixed(0)}%
                  </Label>
                  {sortedAnchors.length > 2 && index !== 0 && index !== sortedAnchors.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleRemoveAnchor(anchor.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={anchor.depth.toFixed(1)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        handleAnchorDepthChange(anchor.id, val);
                      }
                    }}
                    className="h-7 text-[10px] px-1.5"
                    min="1"
                    max="12"
                    step="0.1"
                  />
                  <span className="text-[10px] text-muted-foreground">ft</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Cut Visualization */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Section Cut - Depth Profile</Label>
          <div className="bg-muted/30 rounded-lg p-4 border">
            <svg width="100%" height="120" viewBox="0 0 260 120" className="overflow-visible">
              {/* Water line at 0' */}
              <line x1="10" y1="10" x2="250" y2="10" stroke="hsl(var(--primary))" strokeWidth="2" />
              <text x="5" y="12" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="end">0'</text>
              
              {/* Depth anchor points and labels */}
              {sortedAnchors.map((anchor) => {
                const x = 10 + anchor.position * 240;
                const y = 10 + anchor.depth / 12 * 100;
                return (
                  <g key={anchor.id}>
                    <circle cx={x} cy={y} r="4" fill="hsl(var(--primary))" />
                    <line 
                      x1={x} y1={y} x2={x} y2="115" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth="1" 
                      strokeDasharray="2,2" 
                      opacity="0.5" 
                    />
                    <text 
                      x={x} y={y - 8} 
                      fontSize="9" 
                      fill="hsl(var(--foreground))" 
                      textAnchor="middle" 
                      fontWeight="600"
                    >
                      {anchor.depth.toFixed(1)}'
                    </text>
                    <text 
                      x={x} y="125" 
                      fontSize="8" 
                      fill="hsl(var(--muted-foreground))" 
                      textAnchor="middle"
                    >
                      {(anchor.position * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
              
              {/* Pool floor profile path */}
              <path
                d={(() => {
                  // Start at 0% at water level
                  let pathData = `M ${10 + sortedAnchors[0].position * 240},10`;
                  
                  // Draw line to each depth point
                  sortedAnchors.forEach((anchor) => {
                    const x = 10 + anchor.position * 240;
                    const y = 10 + anchor.depth / 12 * 100;
                    pathData += ` L ${x},${y}`;
                  });
                  
                  // Connect last point back to water level at 100%
                  pathData += ` L ${10 + sortedAnchors[sortedAnchors.length - 1].position * 240},10`;
                  
                  // Close path
                  pathData += ' Z';
                  return pathData;
                })()}
                fill="hsl(var(--primary) / 0.2)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Quick Depth Sliders */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Quick Adjust</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Shallow:</span>
              <Slider
                value={[sortedAnchors[0]?.depth || poolShallowDepth]}
                min={1}
                max={6}
                step={0.25}
                onValueChange={([val]) => handleAnchorDepthChange(sortedAnchors[0]?.id, val)}
                className="flex-1"
              />
              <span className="text-xs w-10">{(sortedAnchors[0]?.depth || poolShallowDepth).toFixed(1)}'</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Deep:</span>
              <Slider
                value={[sortedAnchors[sortedAnchors.length - 1]?.depth || poolDeepDepth]}
                min={4}
                max={12}
                step={0.25}
                onValueChange={([val]) => handleAnchorDepthChange(sortedAnchors[sortedAnchors.length - 1]?.id, val)}
                className="flex-1"
              />
              <span className="text-xs w-10">{(sortedAnchors[sortedAnchors.length - 1]?.depth || poolDeepDepth).toFixed(1)}'</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-2 bg-primary/5 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="space-y-0.5">
            <li>• Drag 3D control points to fine-tune</li>
            <li>• Use sliders for quick adjustments</li>
            <li>• Reset to match product specifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
