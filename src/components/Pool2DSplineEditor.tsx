import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Plus, Circle, Square, Maximize2, Minimize2, Save, Upload, Ruler } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type PointType = 'linear' | 'curve' | 'smooth' | 'corner';

export interface Point2D {
  x: number;
  y: number;
  id: string;
  type: PointType;
}

interface Pool2DSplineEditorProps {
  initialPoints?: Point2D[];
  onPointsChange?: (points: Point2D[]) => void;
  width?: number;
  height?: number;
  gridSize?: number;
  backgroundColor?: string;
}

export function Pool2DSplineEditor({
  initialPoints,
  onPointsChange,
  width = 800,
  height = 600,
  gridSize = 20,
  backgroundColor = '#f5f5f5'
}: Pool2DSplineEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [points, setPoints] = useState<Point2D[]>(initialPoints || [
    { x: 200, y: 200, id: '1', type: 'linear' },
    { x: 600, y: 200, id: '2', type: 'linear' },
    { x: 600, y: 400, id: '3', type: 'linear' },
    { x: 200, y: 400, id: '4', type: 'linear' }
  ]);
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [showMeasurements, setShowMeasurements] = useState(true);

  const canvasWidth = isFullscreen ? window.innerWidth : width;
  const canvasHeight = isFullscreen ? window.innerHeight : height;

  // Conversion: 1 pixel = 0.1 feet (or ~0.03 meters)
  const pixelsToFeet = (pixels: number) => pixels * 0.1;
  const pixelsToMeters = (pixels: number) => pixels * 0.03048;
  const convertPixels = (pixels: number) => unit === 'feet' ? pixelsToFeet(pixels) : pixelsToMeters(pixels);

  const calculateDimensions = () => {
    if (points.length < 3) return { width: 0, length: 0, perimeter: 0 };

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const length = Math.max(...ys) - Math.min(...ys);

    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const dist = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      perimeter += dist;
    }

    return {
      width: convertPixels(width),
      length: convertPixels(length),
      perimeter: convertPixels(perimeter)
    };
  };

  useEffect(() => {
    drawCanvas();
  }, [points, hoveredPoint, hoveredSegment, draggedPoint, isFullscreen, canvasWidth, canvasHeight]);

  useEffect(() => {
    if (isFullscreen) {
      const handleResize = () => drawCanvas();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isFullscreen]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw pool shape with curves
    if (points.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';

      for (let i = 0; i < points.length; i++) {
        const curr = points[i];
        const next = points[(i + 1) % points.length];

        if (i === 0) {
          ctx.moveTo(curr.x, curr.y);
        }

        if (curr.type === 'curve' || curr.type === 'smooth') {
          // Use quadratic curve
          const prev = points[(i - 1 + points.length) % points.length];
          const nextNext = points[(i + 2) % points.length];
          
          // Calculate control points for smooth curves
          const cp1x = curr.x + (next.x - prev.x) * 0.25;
          const cp1y = curr.y + (next.y - prev.y) * 0.25;
          const cp2x = next.x - (nextNext.x - curr.x) * 0.25;
          const cp2y = next.y - (nextNext.y - curr.y) * 0.25;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        } else {
          ctx.lineTo(next.x, next.y);
        }
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw segment hover highlights
    if (hoveredSegment !== null && hoveredSegment < points.length) {
      const curr = points[hoveredSegment];
      const next = points[(hoveredSegment + 1) % points.length];
      
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 5;
      ctx.moveTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();

      // Draw add point indicator
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(midX, midY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw control points
    points.forEach((point, i) => {
      const isHovered = hoveredPoint === point.id;
      const isDragged = draggedPoint === point.id;
      const size = isDragged ? 12 : isHovered ? 10 : 8;

      // Point color based on type
      let color = '#22c55e'; // linear - green
      if (point.type === 'curve') color = '#06b6d4'; // cyan
      if (point.type === 'smooth') color = '#a855f7'; // purple
      if (point.type === 'corner') color = '#f97316'; // orange
      if (isDragged) color = '#ef4444'; // red
      if (isHovered) color = '#fbbf24'; // yellow

      ctx.fillStyle = color;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;

      // Draw shape based on type
      if (point.type === 'corner') {
        // Square for corner
        ctx.fillRect(point.x - size, point.y - size, size * 2, size * 2);
        ctx.strokeRect(point.x - size, point.y - size, size * 2, size * 2);
      } else {
        // Circle for other types
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw point number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((i + 1).toString(), point.x, point.y);
    });

    // Draw measurements
    if (showMeasurements && points.length >= 3) {
      const dims = calculateDimensions();
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;

      // Width measurement (top)
      const widthText = `${dims.width.toFixed(1)} ${unit}`;
      const widthX = (minX + maxX) / 2;
      const widthY = minY - 30;
      ctx.strokeText(widthText, widthX, widthY);
      ctx.fillText(widthText, widthX, widthY);

      // Draw width line
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(minX, minY - 20);
      ctx.lineTo(maxX, minY - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Length measurement (left)
      const lengthText = `${dims.length.toFixed(1)} ${unit}`;
      const lengthX = minX - 40;
      const lengthY = (minY + maxY) / 2;
      ctx.save();
      ctx.translate(lengthX, lengthY);
      ctx.rotate(-Math.PI / 2);
      ctx.strokeText(lengthText, 0, 0);
      ctx.fillText(lengthText, 0, 0);
      ctx.restore();

      // Draw length line
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(minX - 30, minY);
      ctx.lineTo(minX - 30, maxY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Perimeter (bottom right)
      const perimeterText = `Perimeter: ${dims.perimeter.toFixed(1)} ${unit}`;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#059669';
      ctx.strokeText(perimeterText, maxX - 100, maxY + 40);
      ctx.fillText(perimeterText, maxX - 100, maxY + 40);
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const findPointAtPosition = (x: number, y: number): string | null => {
    for (const point of points) {
      const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      if (distance < 15) return point.id;
    }
    return null;
  };

  const findSegmentAtPosition = (x: number, y: number): number | null => {
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      
      // Check if point is near the line segment
      const distance = pointToLineDistance(x, y, curr.x, curr.y, next.x, next.y);
      if (distance < 10) return i;
    }
    return null;
  };

  const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    const pointId = findPointAtPosition(x, y);
    
    if (pointId) {
      setDraggedPoint(pointId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (draggedPoint) {
      // Update dragged point position
      setPoints(prev => prev.map(p => 
        p.id === draggedPoint ? { ...p, x, y } : p
      ));
    } else {
      // Update hover states
      const pointId = findPointAtPosition(x, y);
      setHoveredPoint(pointId);
      
      if (!pointId) {
        const segmentIndex = findSegmentAtPosition(x, y);
        setHoveredSegment(segmentIndex);
      } else {
        setHoveredSegment(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (draggedPoint) {
      onPointsChange?.(points);
    }
    setDraggedPoint(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    // Check if clicking on segment to add point
    if (hoveredSegment !== null) {
      const curr = points[hoveredSegment];
      const next = points[(hoveredSegment + 1) % points.length];
      const newPoint: Point2D = {
        x: (curr.x + next.x) / 2,
        y: (curr.y + next.y) / 2,
        id: `${Date.now()}`,
        type: 'linear'
      };
      
      const newPoints = [...points];
      newPoints.splice(hoveredSegment + 1, 0, newPoint);
      setPoints(newPoints);
      onPointsChange?.(newPoints);
    }
  };

  const deletePoint = (pointId: string) => {
    if (points.length <= 3) {
      alert('Pool must have at least 3 points');
      return;
    }
    const newPoints = points.filter(p => p.id !== pointId);
    setPoints(newPoints);
    onPointsChange?.(newPoints);
  };

  const changePointType = (pointId: string, type: PointType) => {
    const newPoints = points.map(p => p.id === pointId ? { ...p, type } : p);
    setPoints(newPoints);
    onPointsChange?.(newPoints);
  };

  const saveShape = () => {
    const shapeData = {
      points,
      timestamp: new Date().toISOString(),
      dimensions: calculateDimensions()
    };
    const blob = new Blob([JSON.stringify(shapeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pool-shape-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Shape Saved",
      description: "Pool shape has been downloaded successfully."
    });
  };

  const loadShape = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.points && Array.isArray(data.points)) {
          setPoints(data.points);
          onPointsChange?.(data.points);
          toast({
            title: "Shape Loaded",
            description: "Pool shape has been loaded successfully."
          });
        } else {
          throw new Error('Invalid shape file format');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load shape file. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedPoint = points.find(p => p.id === (hoveredPoint || draggedPoint));

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : "space-y-4"}>
      <Card className={isFullscreen ? "h-full rounded-none border-0" : "p-4"}>
        <div className={`flex justify-between items-center ${isFullscreen ? 'p-4 border-b border-border' : 'mb-4'}`}>
          <h3 className="text-lg font-semibold">Pool Shape Designer</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={showMeasurements ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMeasurements(!showMeasurements)}
              >
                <Ruler className="w-4 h-4 mr-1" />
                Measurements
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnit(unit === 'feet' ? 'meters' : 'feet')}
              >
                {unit === 'feet' ? 'ft' : 'm'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveShape}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1" />
                Load
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={loadShape}
                className="hidden"
              />
            </div>
            <div className="flex gap-2 text-xs border-l border-border pl-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Linear</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span>Curve</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Smooth</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500"></div>
                <span>Corner</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className={`relative ${isFullscreen ? 'flex items-center justify-center h-[calc(100%-5rem)]' : 'inline-block'}`}>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            className="border border-border rounded-lg cursor-crosshair shadow-lg"
          />
        </div>

        {selectedPoint && !isFullscreen && (
          <Card className="mt-4 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">
                Point {points.findIndex(p => p.id === selectedPoint.id) + 1}
              </h4>
              {points.length > 3 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePoint(selectedPoint.id)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground mb-3">
              Position: X: {Math.round(selectedPoint.x)}px, Y: {Math.round(selectedPoint.y)}px
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Point Type:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['linear', 'curve', 'smooth', 'corner'] as PointType[]).map(type => (
                  <Button
                    key={type}
                    variant={selectedPoint.type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => changePointType(selectedPoint.id, type)}
                    className="text-xs capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Click on segments to add points • Drag points to move • Change type for curves
            </p>
          </Card>
        )}
      </Card>
    </div>
  );
}
