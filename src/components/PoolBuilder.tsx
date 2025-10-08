import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, Move, Lightbulb, Waves } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface PoolFeature {
  type: 'stairs' | 'light' | 'jet';
  x: number;
  y: number;
  id: string;
}

interface PoolBuilderProps {
  onPoolDataChange?: (data: {
    points: Point[];
    features: PoolFeature[];
    perimeter: number;
    area: number;
  }) => void;
}

export function PoolBuilder({ onPoolDataChange }: PoolBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([
    { x: 100, y: 100, id: '1' },
    { x: 300, y: 100, id: '2' },
    { x: 300, y: 250, id: '3' },
    { x: 100, y: 250, id: '4' },
  ]);
  const [features, setFeatures] = useState<PoolFeature[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(10); // pixels per foot
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 32, 800);
        const height = Math.min(width * 0.75, 500);
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Calculate perimeter in feet
  const calculatePerimeter = () => {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const distance = Math.sqrt(
        Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
      );
      perimeter += distance;
    }
    return (perimeter / scale).toFixed(1);
  };

  // Calculate area in square feet
  const calculateArea = () => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      area += current.x * next.y - next.x * current.y;
    }
    const sqPixels = Math.abs(area / 2);
    return (sqPixels / (scale * scale)).toFixed(1);
  };

  // Draw the pool shape
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    ctx.strokeStyle = 'hsl(var(--muted))';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvasSize.width; i += scale) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvasSize.height; i += scale) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize.width, i);
      ctx.stroke();
    }

    // Draw pool shape with smooth curves (Catmull-Rom spline)
    if (points.length > 2) {
      ctx.fillStyle = 'hsla(var(--primary), 0.2)';
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;

      ctx.beginPath();
      
      // Draw smooth curve through points
      for (let i = 0; i < points.length; i++) {
        const p0 = points[(i - 1 + points.length) % points.length];
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const p3 = points[(i + 2) % points.length];

        if (i === 0) {
          ctx.moveTo(p1.x, p1.y);
        }

        // Catmull-Rom to Bezier conversion
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw points
    points.forEach((point) => {
      ctx.fillStyle = selectedPoint === point.id ? 'hsl(var(--primary))' : 'hsl(var(--background))';
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });

    // Draw features
    features.forEach((feature) => {
      ctx.save();
      if (feature.type === 'stairs') {
        ctx.fillStyle = 'hsl(var(--chart-1))';
        ctx.fillRect(feature.x - 10, feature.y - 10, 20, 20);
      } else if (feature.type === 'light') {
        ctx.fillStyle = 'hsl(var(--chart-2))';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      } else if (feature.type === 'jet') {
        ctx.fillStyle = 'hsl(var(--chart-3))';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    });

    // Notify parent of changes
    if (onPoolDataChange) {
      onPoolDataChange({
        points,
        features,
        perimeter: parseFloat(calculatePerimeter()),
        area: parseFloat(calculateArea())
      });
    }
  }, [points, features, selectedPoint, canvasSize, scale]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a point
    const clickedPoint = points.find(p => 
      Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
    );

    if (clickedPoint) {
      setSelectedPoint(clickedPoint.id);
    } else {
      setSelectedPoint(null);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedPoint = points.find(p => 
      Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
    );

    if (clickedPoint) {
      setSelectedPoint(clickedPoint.id);
      setIsDragging(true);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasSize.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvasSize.height, e.clientY - rect.top));

    setPoints(prev => prev.map(p => 
      p.id === selectedPoint ? { ...p, x, y } : p
    ));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const addPoint = () => {
    const newId = (Math.max(...points.map(p => parseInt(p.id))) + 1).toString();
    const lastPoint = points[points.length - 1];
    setPoints([...points, { 
      x: lastPoint.x + 50, 
      y: lastPoint.y, 
      id: newId 
    }]);
  };

  const removePoint = () => {
    if (points.length > 3 && selectedPoint) {
      setPoints(points.filter(p => p.id !== selectedPoint));
      setSelectedPoint(null);
    }
  };

  const addFeature = (type: 'stairs' | 'light' | 'jet') => {
    const newFeature: PoolFeature = {
      type,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      id: Date.now().toString()
    };
    setFeatures([...features, newFeature]);
  };

  return (
    <div ref={containerRef} className="space-y-4 w-full">
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-xs">Perimeter</Label>
            <Badge variant="outline" className="w-full justify-center mt-1">
              {calculatePerimeter()} ft
            </Badge>
          </div>
          <div>
            <Label className="text-xs">Area</Label>
            <Badge variant="outline" className="w-full justify-center mt-1">
              {calculateArea()} sq ft
            </Badge>
          </div>
          <div>
            <Label className="text-xs">Points</Label>
            <Badge variant="outline" className="w-full justify-center mt-1">
              {points.length}
            </Badge>
          </div>
          <div>
            <Label className="text-xs">Features</Label>
            <Badge variant="outline" className="w-full justify-center mt-1">
              {features.length}
            </Badge>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-border rounded-lg cursor-crosshair w-full touch-none"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={addPoint} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Point
          </Button>
          <Button 
            size="sm" 
            onClick={removePoint} 
            variant="outline"
            disabled={!selectedPoint || points.length <= 3}
          >
            <Minus className="h-4 w-4 mr-1" />
            Remove Point
          </Button>
          <Button size="sm" onClick={() => addFeature('stairs')} variant="outline">
            <Move className="h-4 w-4 mr-1" />
            Add Stairs
          </Button>
          <Button size="sm" onClick={() => addFeature('light')} variant="outline">
            <Lightbulb className="h-4 w-4 mr-1" />
            Add Light
          </Button>
          <Button size="sm" onClick={() => addFeature('jet')} variant="outline">
            <Waves className="h-4 w-4 mr-1" />
            Add Jet
          </Button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>• Click and drag points to reshape the pool</p>
          <p>• Add/remove points to create custom angles</p>
          <p>• Grid squares = 1 foot × 1 foot</p>
        </div>
      </Card>
    </div>
  );
}
