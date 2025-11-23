import { PoolPoint } from './Pool2DCanvas';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Circle, Square } from 'lucide-react';

interface PoolShapeEditorProps {
  poolPoints: PoolPoint[];
  onChange: (points: PoolPoint[]) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  scale: number;
}

export function PoolShapeEditor({
  poolPoints,
  onChange,
  selectedPointId,
  onSelectPoint,
  scale
}: PoolShapeEditorProps) {
  
  const addPoint = () => {
    const newId = `p${Date.now()}`;
    const lastPoint = poolPoints[poolPoints.length - 1];
    const newPoint: PoolPoint = {
      x: lastPoint.x + 50,
      y: lastPoint.y,
      id: newId,
      type: 'linear'
    };
    onChange([...poolPoints, newPoint]);
    onSelectPoint(newId);
  };

  const removePoint = (id: string) => {
    if (poolPoints.length > 3) {
      onChange(poolPoints.filter(pt => pt.id !== id));
      if (selectedPointId === id) {
        onSelectPoint(null);
      }
    }
  };

  const changePointType = (id: string, type: PoolPoint['type']) => {
    onChange(poolPoints.map(pt =>
      pt.id === id ? { ...pt, type } : pt
    ));
  };

  const calculatePerimeter = () => {
    let perimeter = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      const dist = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      perimeter += dist;
    }
    return (perimeter / scale).toFixed(1);
  };

  const calculateArea = () => {
    let area = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      area += curr.x * next.y - next.x * curr.y;
    }
    const sqPixels = Math.abs(area / 2);
    return (sqPixels / (scale * scale)).toFixed(1);
  };

  const selectedPoint = poolPoints.find(pt => pt.id === selectedPointId);

  return (
    <div className="space-y-4">
      {/* Pool Metrics */}
      <Card className="p-3">
        <h4 className="font-medium text-sm mb-3">Pool Metrics</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Points:</span>
            <Badge variant="secondary">{poolPoints.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Perimeter:</span>
            <span className="font-medium">{calculatePerimeter()} ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Area:</span>
            <span className="font-medium">{calculateArea()} sq ft</span>
          </div>
        </div>
      </Card>

      {/* Add/Remove Points */}
      <Card className="p-3">
        <h4 className="font-medium text-sm mb-3">Shape Controls</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={addPoint}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Point
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => selectedPointId && removePoint(selectedPointId)}
            disabled={!selectedPointId || poolPoints.length <= 3}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      </Card>

      {/* Selected Point Editor */}
      {selectedPoint && (
        <Card className="p-3 border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">
              Point {poolPoints.findIndex(p => p.id === selectedPoint.id) + 1}
            </h4>
            {poolPoints.length > 3 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removePoint(selectedPoint.id)}
                className="h-7"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Point Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['linear', 'curve', 'smooth', 'corner'] as const).map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedPoint.type === type ? 'default' : 'outline'}
                    onClick={() => changePointType(selectedPoint.id, type)}
                    className="text-xs capitalize h-8"
                  >
                    {type === 'linear' && <Square className="w-3 h-3 mr-1" />}
                    {type === 'curve' && <Circle className="w-3 h-3 mr-1" />}
                    {type === 'smooth' && <Circle className="w-3 h-3 mr-1" />}
                    {type === 'corner' && <Square className="w-3 h-3 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <strong>Tip:</strong> Drag points on canvas to reshape the pool. Use different types for varied curves.
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="p-3">
        <h4 className="font-medium text-sm mb-2">Point Types</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border-2 border-primary"></div>
            <span>Linear</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Curve</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Smooth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span>Corner</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
