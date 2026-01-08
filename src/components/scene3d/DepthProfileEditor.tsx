import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, ArrowUpDown, RefreshCw, Plus, Trash2, Link2 } from 'lucide-react';
import { LinearDepthAnchor, PerimeterDepthPoint } from './types';

interface DepthProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  linearDepthAnchors: LinearDepthAnchor[];
  onLinearDepthAnchorsChange: (anchors: LinearDepthAnchor[]) => void;
  selectedAnchorId: string | null;
  onSelectAnchor: (id: string | null) => void;
  // Pool depth from selected product
  poolShallowDepth?: number;
  poolDeepDepth?: number;
  // Perimeter depth points from spline editor
  perimeterDepthPoints?: PerimeterDepthPoint[];
  onPerimeterDepthPointsChange?: (points: PerimeterDepthPoint[]) => void;
}

export function DepthProfileEditor({
  isOpen,
  onClose,
  linearDepthAnchors,
  onLinearDepthAnchorsChange,
  selectedAnchorId,
  onSelectAnchor,
  poolShallowDepth = 3.75,
  poolDeepDepth = 8.5,
  perimeterDepthPoints = [],
  onPerimeterDepthPointsChange,
}: DepthProfileEditorProps) {
  // Initialize anchors from props or defaults
  const [anchors, setAnchors] = useState<LinearDepthAnchor[]>(() => {
    if (linearDepthAnchors.length >= 2) {
      return [...linearDepthAnchors].sort((a, b) => a.position - b.position);
    }
    return [
      { id: 'd1', position: 0, depth: poolShallowDepth },
      { id: 'd2', position: 0.33, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.33 },
      { id: 'd3', position: 0.67, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.67 },
      { id: 'd4', position: 1, depth: poolDeepDepth },
    ];
  });

  // Sync from props when they change externally
  useEffect(() => {
    if (linearDepthAnchors.length >= 2) {
      setAnchors([...linearDepthAnchors].sort((a, b) => a.position - b.position));
    }
  }, [linearDepthAnchors]);

  // Update parent when anchors change
  const updateAnchors = (newAnchors: LinearDepthAnchor[]) => {
    const sorted = [...newAnchors].sort((a, b) => a.position - b.position);
    setAnchors(sorted);
    onLinearDepthAnchorsChange(sorted);
  };

  const handleAnchorDepthChange = (id: string, newDepth: number) => {
    const clampedDepth = Math.max(1, Math.min(12, newDepth));
    const newAnchors = anchors.map(a => 
      a.id === id ? { ...a, depth: clampedDepth } : a
    );
    updateAnchors(newAnchors);
  };

  const handleAnchorPositionChange = (id: string, newPosition: number) => {
    const anchor = anchors.find(a => a.id === id);
    if (!anchor) return;
    
    // Don't allow moving first (0%) or last (100%) anchors
    const sorted = [...anchors].sort((a, b) => a.position - b.position);
    if (anchor.id === sorted[0].id || anchor.id === sorted[sorted.length - 1].id) {
      return;
    }
    
    const clampedPos = Math.max(0.01, Math.min(0.99, newPosition));
    const newAnchors = anchors.map(a => 
      a.id === id ? { ...a, position: clampedPos } : a
    );
    updateAnchors(newAnchors);
  };

  const handleResetToProductDepths = () => {
    const newAnchors = [
      { id: 'd1', position: 0, depth: poolShallowDepth },
      { id: 'd2', position: 0.33, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.33 },
      { id: 'd3', position: 0.67, depth: poolShallowDepth + (poolDeepDepth - poolShallowDepth) * 0.67 },
      { id: 'd4', position: 1, depth: poolDeepDepth },
    ];
    updateAnchors(newAnchors);
  };

  const handleAddAnchor = () => {
    if (anchors.length >= 6) return; // Max 6 anchors
    
    // Add at midpoint of largest gap
    const sorted = [...anchors].sort((a, b) => a.position - b.position);
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
      ...anchors,
      { id: `d${Date.now()}`, position: insertPos, depth: insertDepth }
    ];
    updateAnchors(newAnchors);
  };

  const handleRemoveAnchor = (id: string) => {
    if (anchors.length <= 2) return; // Min 2 anchors (shallow and deep)
    
    // Don't remove first or last anchor
    const sorted = [...anchors].sort((a, b) => a.position - b.position);
    if (id === sorted[0].id || id === sorted[sorted.length - 1].id) {
      return;
    }
    
    const newAnchors = anchors.filter(a => a.id !== id);
    updateAnchors(newAnchors);
  };

  // Sync linear depth anchors to perimeter spline points
  const handleSyncToSplinePoints = () => {
    if (!onPerimeterDepthPointsChange || perimeterDepthPoints.length === 0) return;
    
    const sortedAnchors = [...anchors].sort((a, b) => a.position - b.position);
    
    // Apply depth gradient to perimeter points based on their position
    const updatedPoints = perimeterDepthPoints.map((point, index) => {
      // Normalize position along perimeter (0-1)
      const normalizedPos = index / perimeterDepthPoints.length;
      
      // Find the two anchors this position falls between
      let depth = sortedAnchors[0].depth;
      for (let i = 0; i < sortedAnchors.length - 1; i++) {
        const a1 = sortedAnchors[i];
        const a2 = sortedAnchors[i + 1];
        if (normalizedPos >= a1.position && normalizedPos <= a2.position) {
          const t = (normalizedPos - a1.position) / (a2.position - a1.position);
          depth = a1.depth + t * (a2.depth - a1.depth);
          break;
        }
      }
      if (normalizedPos > sortedAnchors[sortedAnchors.length - 1].position) {
        depth = sortedAnchors[sortedAnchors.length - 1].depth;
      }
      
      return { ...point, depth };
    });
    
    onPerimeterDepthPointsChange(updatedPoints);
  };

  // Sync from perimeter spline points to linear depth anchors
  const handleSyncFromSplinePoints = () => {
    if (perimeterDepthPoints.length < 2) return;
    
    // Calculate average depth at shallow end (first quarter) and deep end (last quarter)
    const pointCount = perimeterDepthPoints.length;
    const quarterCount = Math.max(1, Math.floor(pointCount / 4));
    
    let shallowSum = 0;
    let deepSum = 0;
    
    for (let i = 0; i < quarterCount; i++) {
      shallowSum += perimeterDepthPoints[i].depth;
      deepSum += perimeterDepthPoints[pointCount - 1 - i].depth;
    }
    
    const avgShallow = shallowSum / quarterCount;
    const avgDeep = deepSum / quarterCount;
    
    // Create new anchors based on spline point depths
    const newAnchors = [
      { id: 'd1', position: 0, depth: avgShallow },
      { id: 'd2', position: 0.33, depth: avgShallow + (avgDeep - avgShallow) * 0.33 },
      { id: 'd3', position: 0.67, depth: avgShallow + (avgDeep - avgShallow) * 0.67 },
      { id: 'd4', position: 1, depth: avgDeep },
    ];
    
    updateAnchors(newAnchors);
  };

  if (!isOpen) return null;

  const sortedAnchors = [...anchors].sort((a, b) => a.position - b.position);
  const shallowAnchor = sortedAnchors[0];
  const deepAnchor = sortedAnchors[sortedAnchors.length - 1];

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
          Linear depth profile from shallow end (0%) to deep end (100%)
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

        {/* Spline Sync Controls */}
        {perimeterDepthPoints.length > 0 && onPerimeterDepthPointsChange && (
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-500" />
              <Label className="text-xs font-medium text-cyan-600">Spline Point Sync</Label>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Sync depth profile with {perimeterDepthPoints.length} perimeter spline points
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10"
                onClick={handleSyncToSplinePoints}
              >
                Apply to Splines
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10"
                onClick={handleSyncFromSplinePoints}
              >
                Load from Splines
              </Button>
            </div>
          </div>
        )}

        {/* Depth Anchor Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Depth Anchors</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleAddAnchor}
              disabled={anchors.length >= 6}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {sortedAnchors.map((anchor, index) => {
              const isEndpoint = index === 0 || index === sortedAnchors.length - 1;
              const label = index === 0 ? 'Shallow End' : index === sortedAnchors.length - 1 ? 'Deep End' : `Point ${index}`;
              
              return (
                <div 
                  key={anchor.id} 
                  className={`p-2 rounded-lg border ${selectedAnchorId === anchor.id ? 'border-primary bg-primary/5' : 'border-border/50'}`}
                  onClick={() => onSelectAnchor(anchor.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {(anchor.position * 100).toFixed(0)}%
                      </span>
                      {!isEndpoint && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAnchor(anchor.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={anchor.depth.toFixed(1)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          handleAnchorDepthChange(anchor.id, val);
                        }
                      }}
                      className="h-7 text-xs w-16"
                      min="1"
                      max="12"
                      step="0.1"
                    />
                    <span className="text-xs text-muted-foreground">ft</span>
                    {!isEndpoint && (
                      <>
                        <div className="flex-1" />
                        <Input
                          type="number"
                          value={(anchor.position * 100).toFixed(0)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) / 100;
                            if (!isNaN(val)) {
                              handleAnchorPositionChange(anchor.id, val);
                            }
                          }}
                          className="h-7 text-xs w-14"
                          min="1"
                          max="99"
                          step="1"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Cut Visualization */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Section Cut - Shallow to Deep</Label>
          <div className="bg-muted/30 rounded-lg p-4 border">
            <svg width="100%" height="120" viewBox="0 0 260 120" className="overflow-visible">
              {/* Water line at 0' */}
              <line x1="10" y1="10" x2="250" y2="10" stroke="hsl(var(--primary))" strokeWidth="2" />
              <text x="5" y="12" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="end">0'</text>
              
              {/* Labels */}
              <text x="10" y="8" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="start">Shallow</text>
              <text x="250" y="8" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="end">Deep</text>
              
              {/* Pool floor profile path */}
              <path
                d={(() => {
                  // Start at shallow end at water level
                  let pathData = `M 10,10`;
                  
                  // Draw down to first anchor
                  pathData += ` L 10,${10 + sortedAnchors[0].depth / 12 * 100}`;
                  
                  // Draw line to each depth point
                  sortedAnchors.forEach((anchor) => {
                    const x = 10 + anchor.position * 240;
                    const y = 10 + anchor.depth / 12 * 100;
                    pathData += ` L ${x},${y}`;
                  });
                  
                  // Connect last point back up to water level
                  pathData += ` L 250,10`;
                  
                  // Close path
                  pathData += ' Z';
                  return pathData;
                })()}
                fill="hsl(var(--primary) / 0.2)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              
              {/* Depth anchor points and labels */}
              {sortedAnchors.map((anchor) => {
                const x = 10 + anchor.position * 240;
                const y = 10 + anchor.depth / 12 * 100;
                const isSelected = selectedAnchorId === anchor.id;
                return (
                  <g key={anchor.id}>
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isSelected ? "6" : "4"} 
                      fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"} 
                      stroke={isSelected ? "white" : "none"}
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectAnchor(anchor.id)}
                    />
                    <text 
                      x={x} y={y - 10} 
                      fontSize="9" 
                      fill="hsl(var(--foreground))" 
                      textAnchor="middle" 
                      fontWeight="600"
                    >
                      {anchor.depth.toFixed(1)}'
                    </text>
                  </g>
                );
              })}
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
                value={[shallowAnchor?.depth || poolShallowDepth]}
                min={1}
                max={6}
                step={0.25}
                onValueChange={([val]) => shallowAnchor && handleAnchorDepthChange(shallowAnchor.id, val)}
                className="flex-1"
              />
              <span className="text-xs w-10">{(shallowAnchor?.depth || poolShallowDepth).toFixed(1)}'</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16">Deep:</span>
              <Slider
                value={[deepAnchor?.depth || poolDeepDepth]}
                min={4}
                max={12}
                step={0.25}
                onValueChange={([val]) => deepAnchor && handleAnchorDepthChange(deepAnchor.id, val)}
                className="flex-1"
              />
              <span className="text-xs w-10">{(deepAnchor?.depth || poolDeepDepth).toFixed(1)}'</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="p-2 bg-primary/5 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Tips:</p>
          <ul className="space-y-0.5">
            <li>• Depth runs linearly from shallow to deep end</li>
            <li>• Add anchors for custom slope transitions</li>
            <li>• Click anchors in visualization to select</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
