import { useRef, useEffect, useState } from 'react';

export interface PoolPoint {
  x: number;
  y: number;
  id: string;
  type: 'linear' | 'curve' | 'smooth' | 'corner';
}

export interface DeckPoint {
  x: number;
  y: number;
  id: string;
}

interface Pool2DCanvasProps {
  width: number;
  height: number;
  poolPoints: PoolPoint[];
  deckPoints: DeckPoint[];
  scale: number;
  gridSize: number;
  onPoolPointsChange: (points: PoolPoint[]) => void;
  onDeckPointsChange: (points: DeckPoint[]) => void;
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  showGrid?: boolean;
  smoothCorners?: boolean;
}

export function Pool2DCanvas({
  width,
  height,
  poolPoints,
  deckPoints,
  scale,
  gridSize,
  onPoolPointsChange,
  onDeckPointsChange,
  selectedPointId,
  onSelectPoint,
  showGrid = true,
  smoothCorners = true
}: Pool2DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Grid
    if (showGrid) {
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
    }

    // Deck
    if (deckPoints.length >= 3) {
      ctx.beginPath();
      deckPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(180, 160, 140, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Pool shape with spline
    if (poolPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(46, 134, 171, 0.2)';

      if (smoothCorners) {
        // Smooth spline through points
        for (let i = 0; i < poolPoints.length; i++) {
          const curr = poolPoints[i];
          const next = poolPoints[(i + 1) % poolPoints.length];
          const prev = poolPoints[(i - 1 + poolPoints.length) % poolPoints.length];

          if (i === 0) {
            ctx.moveTo(curr.x, curr.y);
          }

          // Calculate control points for smooth curve
          const tension = 0.3;
          const cp1x = curr.x + (next.x - prev.x) * tension;
          const cp1y = curr.y + (next.y - prev.y) * tension;

          if (curr.type === 'smooth' || curr.type === 'curve') {
            ctx.quadraticCurveTo(cp1x, cp1y, next.x, next.y);
          } else {
            ctx.lineTo(next.x, next.y);
          }
        }
      } else {
        // Linear connections
        poolPoints.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Pool control points
    poolPoints.forEach((pt) => {
      const isSelected = pt.id === selectedPointId;
      const isHovered = pt.id === hoveredPoint;
      const size = isSelected ? 12 : isHovered ? 10 : 8;

      // Point color by type
      let fillColor = '#ffffff';
      if (pt.type === 'curve') fillColor = '#60a5fa';
      else if (pt.type === 'smooth') fillColor = '#a78bfa';
      else if (pt.type === 'corner') fillColor = '#fb923c';

      ctx.fillStyle = isSelected ? '#2E86AB' : fillColor;
      ctx.strokeStyle = isSelected ? '#1a4d6d' : '#2E86AB';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Point label
      if (isSelected || isHovered) {
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const index = poolPoints.findIndex(p => p.id === pt.id) + 1;
        ctx.fillText(`${index}`, pt.x, pt.y - size - 5);
      }
    });

    // Deck control points (simplified)
    deckPoints.forEach((pt) => {
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
      ctx.strokeRect(pt.x - 4, pt.y - 4, 8, 8);
    });

  }, [width, height, poolPoints, deckPoints, scale, gridSize, showGrid, smoothCorners, selectedPointId, hoveredPoint]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a pool point
    const clickedPoint = poolPoints.find(pt => 
      Math.sqrt((pt.x - x) ** 2 + (pt.y - y) ** 2) < 12
    );

    if (clickedPoint) {
      setIsDragging(true);
      setDragOffset({ x: clickedPoint.x - x, y: clickedPoint.y - y });
      onSelectPoint(clickedPoint.id);
    } else {
      onSelectPoint(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && selectedPointId) {
      // Move the selected point
      const newX = x + dragOffset.x;
      const newY = y + dragOffset.y;
      
      onPoolPointsChange(poolPoints.map(pt =>
        pt.id === selectedPointId ? { ...pt, x: newX, y: newY } : pt
      ));
    } else {
      // Update hover state
      const hoveredPt = poolPoints.find(pt =>
        Math.sqrt((pt.x - x) ** 2 + (pt.y - y) ** 2) < 12
      );
      setHoveredPoint(hoveredPt ? hoveredPt.id : null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="rounded-lg shadow-lg cursor-crosshair border border-border"
      style={{ maxWidth: '100%', maxHeight: '100%' }}
    />
  );
}
