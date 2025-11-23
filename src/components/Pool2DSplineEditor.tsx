import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Plus, Circle, Square } from 'lucide-react';

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
  const [points, setPoints] = useState<Point2D[]>(initialPoints || [
    { x: 200, y: 200, id: '1', type: 'linear' },
    { x: 600, y: 200, id: '2', type: 'linear' },
    { x: 600, y: 400, id: '3', type: 'linear' },
    { x: 200, y: 400, id: '4', type: 'linear' }
  ]);
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  useEffect(() => {
    drawCanvas();
  }, [points, hoveredPoint, hoveredSegment, draggedPoint]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
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

  const selectedPoint = points.find(p => p.id === (hoveredPoint || draggedPoint));

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pool Shape Designer</h3>
          <div className="flex gap-2 text-xs">
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
        </div>

        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            className="border border-border rounded-lg cursor-crosshair shadow-lg"
          />
        </div>

        {selectedPoint && (
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
