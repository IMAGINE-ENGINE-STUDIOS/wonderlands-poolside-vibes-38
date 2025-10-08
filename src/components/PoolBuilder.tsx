import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, Move, Lightbulb, Waves, Ruler } from 'lucide-react';

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
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

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

  // Calculate distance between two points in feet
  const calculateDistance = (p1: Point, p2: Point) => {
    const distance = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
    return distance / scale;
  };

  // Calculate perimeter in feet
  const calculatePerimeter = () => {
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      perimeter += calculateDistance(current, next) * scale;
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

    // Clear canvas with tile-like background
    ctx.fillStyle = '#E8D4B8';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw realistic tile grid
    const tileSize = scale * 2;
    ctx.strokeStyle = 'rgba(180, 150, 110, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasSize.width; i += tileSize) {
      for (let j = 0; j < canvasSize.height; j += tileSize) {
        ctx.strokeRect(i, j, tileSize, tileSize);
      }
    }

    // Draw measurement grid (lighter)
    ctx.strokeStyle = 'rgba(120, 100, 80, 0.15)';
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

    // Draw pool shape with smooth curves and realistic water
    if (points.length > 2) {
      ctx.save();
      
      // Create path for clipping
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p0 = points[(i - 1 + points.length) % points.length];
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const p3 = points[(i + 2) % points.length];

        if (i === 0) {
          ctx.moveTo(p1.x, p1.y);
        }

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
      ctx.closePath();

      // Mosaic border (darker blue tiles)
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#1a4d6d';
      ctx.stroke();
      
      // Inner mosaic border
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#2a5d7d';
      ctx.stroke();

      // Water gradient
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvasSize.width / 2);
      gradient.addColorStop(0, '#4FB3D9');
      gradient.addColorStop(0.5, '#2E86AB');
      gradient.addColorStop(1, '#1a4d6d');
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Water shimmer effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();

      ctx.restore();

      // Draw dimension lines and labels
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 1;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        const distance = calculateDistance(current, next);

        // Draw dimension line
        const angle = Math.atan2(next.y - current.y, next.x - current.x);
        const offset = 20;
        const offsetX = Math.cos(angle + Math.PI / 2) * offset;
        const offsetY = Math.sin(angle + Math.PI / 2) * offset;

        ctx.beginPath();
        ctx.moveTo(current.x + offsetX, current.y + offsetY);
        ctx.lineTo(next.x + offsetX, next.y + offsetY);
        ctx.stroke();

        // Draw dimension label with background
        const label = `${distance.toFixed(1)}'`;
        const metrics = ctx.measureText(label);
        const padding = 4;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
          midX + offsetX - metrics.width / 2 - padding,
          midY + offsetY - 8,
          metrics.width + padding * 2,
          16
        );
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(label, midX + offsetX, midY + offsetY);
      }
    }

    // Draw square anchor points
    points.forEach((point) => {
      const size = 10;
      const isSelected = selectedPoint === point.id;
      const isHovered = hoveredPoint === point.id;
      
      // Shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = isSelected || isHovered ? 6 : 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw square anchor
      ctx.fillStyle = isSelected ? '#2E86AB' : isHovered ? '#4FB3D9' : '#ffffff';
      ctx.strokeStyle = isSelected ? '#1a4d6d' : '#2E86AB';
      ctx.lineWidth = 2;
      ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });

    // Draw features with better styling
    features.forEach((feature) => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      
      if (feature.type === 'stairs') {
        // Teal stairs with tile pattern
        ctx.fillStyle = '#4FB3D9';
        ctx.strokeStyle = '#1a4d6d';
        ctx.lineWidth = 2;
        const stairWidth = 25;
        const stairHeight = 20;
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(
            feature.x - stairWidth / 2,
            feature.y - stairHeight / 2 + i * 7,
            stairWidth - i * 5,
            6
          );
          ctx.strokeRect(
            feature.x - stairWidth / 2,
            feature.y - stairHeight / 2 + i * 7,
            stairWidth - i * 5,
            6
          );
        }
      } else if (feature.type === 'light') {
        // Glowing light
        const gradient = ctx.createRadialGradient(feature.x, feature.y, 0, feature.x, feature.y, 12);
        gradient.addColorStop(0, '#FFF9E6');
        gradient.addColorStop(0.5, '#FFE87C');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (feature.type === 'jet') {
        // Water jet with ripple effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, 5 * i, 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        ctx.fillStyle = '#A0D8F1';
        ctx.strokeStyle = '#2E86AB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
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
  }, [points, features, selectedPoint, hoveredPoint, canvasSize, scale]);

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedPoint) {
      const boundedX = Math.max(0, Math.min(canvasSize.width, x));
      const boundedY = Math.max(0, Math.min(canvasSize.height, y));

      setPoints(prev => prev.map(p => 
        p.id === selectedPoint ? { ...p, x: boundedX, y: boundedY } : p
      ));
    } else {
      // Update hover state
      const hoveredPointFound = points.find(p => 
        Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10
      );
      setHoveredPoint(hoveredPointFound ? hoveredPointFound.id : null);
    }
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

  const updateDimension = (index: number, value: string) => {
    const newDistance = parseFloat(value);
    if (isNaN(newDistance) || newDistance <= 0) return;

    const current = points[index];
    const next = points[(index + 1) % points.length];
    const currentDistance = calculateDistance(current, next);
    const ratio = newDistance / currentDistance;

    const dx = (next.x - current.x) * ratio;
    const dy = (next.y - current.y) * ratio;

    setPoints(prev => prev.map((p, i) => 
      i === (index + 1) % points.length 
        ? { ...p, x: current.x + dx, y: current.y + dy }
        : p
    ));
  };

  return (
    <div ref={containerRef} className="space-y-6 w-full">
      <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-3 rounded-lg border">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              Perimeter
            </Label>
            <div className="text-2xl font-bold text-primary mt-1">
              {calculatePerimeter()}<span className="text-sm text-muted-foreground ml-1">ft</span>
            </div>
          </div>
          <div className="bg-card p-3 rounded-lg border">
            <Label className="text-xs text-muted-foreground">Area</Label>
            <div className="text-2xl font-bold text-primary mt-1">
              {calculateArea()}<span className="text-sm text-muted-foreground ml-1">sq ft</span>
            </div>
          </div>
          <div className="bg-card p-3 rounded-lg border">
            <Label className="text-xs text-muted-foreground">Corners</Label>
            <div className="text-2xl font-bold text-primary mt-1">{points.length}</div>
          </div>
          <div className="bg-card p-3 rounded-lg border">
            <Label className="text-xs text-muted-foreground">Features</Label>
            <div className="text-2xl font-bold text-primary mt-1">{features.length}</div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border-2 border-border rounded-xl shadow-2xl w-full touch-none bg-gradient-to-br from-amber-50 to-stone-100"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>

        {/* Editable Dimensions */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <Label className="text-sm font-semibold mb-3 block">Edge Dimensions (feet)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {points.map((point, index) => {
              const next = points[(index + 1) % points.length];
              const distance = calculateDistance(point, next);
              return (
                <div key={`dim-${point.id}`} className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Edge {index + 1}
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    value={distance.toFixed(1)}
                    onChange={(e) => updateDimension(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" onClick={addPoint} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" />
            Add Corner
          </Button>
          <Button 
            size="sm" 
            onClick={removePoint} 
            variant="outline"
            disabled={!selectedPoint || points.length <= 3}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove Corner
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button size="sm" onClick={() => addFeature('stairs')} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            <Move className="h-4 w-4 mr-1" />
            Add Stairs
          </Button>
          <Button size="sm" onClick={() => addFeature('light')} variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
            <Lightbulb className="h-4 w-4 mr-1" />
            Add Light
          </Button>
          <Button size="sm" onClick={() => addFeature('jet')} variant="outline" className="border-cyan-300 text-cyan-700 hover:bg-cyan-50">
            <Waves className="h-4 w-4 mr-1" />
            Add Jet
          </Button>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <div className="flex-1 space-y-1">
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 bg-white border-2 border-primary inline-block" />
                Drag square anchors to reshape your pool
              </p>
              <p className="flex items-center gap-2">
                <Ruler className="h-3 w-3" />
                Edit dimensions manually in the boxes above
              </p>
              <p className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                Add corners to create custom shapes
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
