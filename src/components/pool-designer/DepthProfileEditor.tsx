import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export interface DepthPoint {
  position: number; // 0-1 along pool length
  depth: number; // in feet
  id: string;
}

interface DepthProfileEditorProps {
  depthPoints: DepthPoint[];
  onChange: (points: DepthPoint[]) => void;
  selectedDepthPoint?: string | null;
  onSelectPoint?: (id: string | null) => void;
}

export function DepthProfileEditor({
  depthPoints,
  onChange,
  selectedDepthPoint,
  onSelectPoint
}: DepthProfileEditorProps) {
  
  const addDepthPoint = () => {
    const newPoint: DepthPoint = {
      position: 0.5,
      depth: 5,
      id: `d${Date.now()}`
    };
    onChange([...depthPoints, newPoint].sort((a, b) => a.position - b.position));
  };

  const removeDepthPoint = (id: string) => {
    if (depthPoints.length > 2) {
      onChange(depthPoints.filter(dp => dp.id !== id));
      if (selectedDepthPoint === id) {
        onSelectPoint?.(null);
      }
    }
  };

  const updateDepth = (id: string, newDepth: number) => {
    onChange(depthPoints.map(dp => 
      dp.id === id ? { ...dp, depth: Math.max(1, Math.min(12, newDepth)) } : dp
    ));
  };

  const updatePosition = (id: string, newPosition: number) => {
    onChange(depthPoints.map(dp => 
      dp.id === id ? { ...dp, position: Math.max(0, Math.min(1, newPosition)) } : dp
    ).sort((a, b) => a.position - b.position));
  };

  const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {/* Depth Anchor Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Depth Anchors</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addDepthPoint}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Point
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sortedDepths.map((dp, index) => (
            <div 
              key={dp.id} 
              className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                selectedDepthPoint === dp.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-muted/30 hover:border-primary/50'
              }`}
              onClick={() => onSelectPoint?.(dp.id)}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-muted-foreground font-medium">
                    Point {index + 1} ({(dp.position * 100).toFixed(0)}%)
                  </Label>
                  {depthPoints.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDepthPoint(dp.id);
                      }}
                      className="h-4 w-4 p-0 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={dp.depth.toFixed(1)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) updateDepth(dp.id, value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 text-xs px-2"
                    min="1"
                    max="12"
                    step="0.1"
                  />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">ft</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Depth Profile Visualization */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Depth Profile (Section View)</Label>
        <div className="bg-muted/30 rounded-lg p-4 border">
          <svg width="100%" height="140" viewBox="0 0 300 140" className="overflow-visible">
            {/* Water line at 0' */}
            <line x1="10" y1="15" x2="290" y2="15" stroke="hsl(var(--primary))" strokeWidth="2" />
            <text x="5" y="18" fontSize="11" fill="hsl(var(--muted-foreground))" textAnchor="end" fontWeight="500">0'</text>
            
            {/* Grid lines for depth */}
            {[2, 4, 6, 8, 10, 12].map((depth) => (
              <g key={depth} opacity="0.3">
                <line 
                  x1="10" 
                  y1={15 + (depth / 12) * 100} 
                  x2="290" 
                  y2={15 + (depth / 12) * 100} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth="1" 
                  strokeDasharray="2,2"
                />
                <text 
                  x="5" 
                  y={15 + (depth / 12) * 100 + 3} 
                  fontSize="9" 
                  fill="hsl(var(--muted-foreground))" 
                  textAnchor="end"
                >
                  {depth}'
                </text>
              </g>
            ))}
            
            {/* Depth anchor points and labels */}
            {sortedDepths.map((dp, i) => {
              const x = 10 + dp.position * 280;
              const y = 15 + (dp.depth / 12) * 100;
              const isSelected = selectedDepthPoint === dp.id;
              return (
                <g 
                  key={dp.id}
                  onClick={() => onSelectPoint?.(dp.id)}
                  className="cursor-pointer"
                >
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? 5 : 4} 
                    fill={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.8)'} 
                    stroke="white"
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all"
                  />
                  <line 
                    x1={x} 
                    y1={y} 
                    x2={x} 
                    y2="120" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth="1" 
                    strokeDasharray="2,2" 
                    opacity="0.5" 
                  />
                  <text 
                    x={x} 
                    y={y - 8} 
                    fontSize="10" 
                    fill="hsl(var(--foreground))" 
                    textAnchor="middle" 
                    fontWeight="600"
                  >
                    {dp.depth.toFixed(1)}'
                  </text>
                  <text 
                    x={x} 
                    y="135" 
                    fontSize="9" 
                    fill="hsl(var(--muted-foreground))" 
                    textAnchor="middle"
                  >
                    {(dp.position * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
            
            {/* Pool floor contour path */}
            <path
              d={(() => {
                // Start at first point at water level
                let pathData = `M ${10 + sortedDepths[0].position * 280},15`;
                // Draw through all depth points
                sortedDepths.forEach(dp => {
                  const x = 10 + dp.position * 280;
                  const y = 15 + (dp.depth / 12) * 100;
                  pathData += ` L ${x},${y}`;
                });
                // Connect last point back to water level
                pathData += ` L ${10 + sortedDepths[sortedDepths.length - 1].position * 280},15`;
                // Close the contour
                pathData += ' Z';
                return pathData;
              })()}
              fill="hsl(var(--primary)/0.15)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Selected Point Editor */}
      {selectedDepthPoint && (
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
          <Label className="text-sm font-semibold text-primary">Edit Depth Point</Label>
          {depthPoints.filter(dp => dp.id === selectedDepthPoint).map(dp => (
            <div key={dp.id} className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Position (%)</Label>
                  <Input
                    type="number"
                    value={(dp.position * 100).toFixed(0)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) updatePosition(dp.id, value / 100);
                    }}
                    className="h-8"
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Depth (ft)</Label>
                  <Input
                    type="number"
                    value={dp.depth.toFixed(1)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) updateDepth(dp.id, value);
                    }}
                    className="h-8"
                    min="1"
                    max="12"
                    step="0.1"
                  />
                </div>
              </div>
              {depthPoints.length > 2 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeDepthPoint(dp.id)}
                  className="w-full h-8"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Remove This Point
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
