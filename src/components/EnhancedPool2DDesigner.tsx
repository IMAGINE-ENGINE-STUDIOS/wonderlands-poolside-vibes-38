import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { X, Plus, Save, Upload, Ruler, Maximize2, Minimize2, DollarSign, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { paverTypes } from '@/data/paverData';

export type PointType = 'linear' | 'curve' | 'smooth' | 'corner';

export interface Point2D {
  x: number;
  y: number;
  id: string;
  type: PointType;
}

export interface DepthPoint {
  position: number; // 0-1 along pool length
  depth: number; // in feet
  id: string;
}

export interface DeckPoint {
  x: number;
  y: number;
  id: string;
}

interface EnhancedPool2DDesignerProps {
  initialDimensions?: { width: number; length: number; depth: number };
  onDesignChange?: (design: {
    poolPoints: Point2D[];
    deckPoints: DeckPoint[];
    depthPoints: DepthPoint[];
    finish: string;
    paver: string;
    coping: string;
    deckWidth: number;
    copingWidth: number;
    measurements: {
      poolPerimeter: number;
      poolArea: number;
      deckArea: number;
    };
    costs: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      total: number;
    };
  }) => void;
  width?: number;
  height?: number;
  gridSize?: number;
  backgroundColor?: string;
  availableFinishes?: Array<{ id: string; name: string; image: string }>;
  availablePavers?: Array<{ id: string; name: string; image: string }>;
}

export function EnhancedPool2DDesigner({
  initialDimensions,
  onDesignChange,
  width = 1000,
  height = 700,
  gridSize = 20,
  backgroundColor = '#f5f5f5',
  availableFinishes = [
    { id: 'aquamarine', name: 'Aquamarine', image: '/textures/finishes/aquamarine-g3.jpg' },
    { id: 'sapphire', name: 'Sapphire Blue', image: '/textures/finishes/sapphire-blue-g3.jpg' },
  ],
  availablePavers = paverTypes
}: EnhancedPool2DDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Responsive canvas sizing based on viewport
  const [containerSize, setContainerSize] = useState({ 
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 400, 1000) : width, 
    height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 200, 700) : height 
  });
  
  const scale = 10; // pixels per foot
  const POOL_COST_PER_SQFT = 190;
  const PAVER_COST_PER_SQFT = 15;
  const COPING_COST_PER_LINFT = 45;

  // Initialize pool points from dimensions or default
  const getInitialPoolPoints = (): Point2D[] => {
    if (initialDimensions) {
      const poolWidth = initialDimensions.width * scale;
      const poolLength = initialDimensions.length * scale;
      const centerX = width / 2;
      const centerY = height / 2;
      
      return [
        { x: centerX - poolLength / 2, y: centerY - poolWidth / 2, id: '1', type: 'linear' },
        { x: centerX + poolLength / 2, y: centerY - poolWidth / 2, id: '2', type: 'linear' },
        { x: centerX + poolLength / 2, y: centerY + poolWidth / 2, id: '3', type: 'linear' },
        { x: centerX - poolLength / 2, y: centerY + poolWidth / 2, id: '4', type: 'linear' }
      ];
    }
    
    return [
      { x: 200, y: 200, id: '1', type: 'linear' },
      { x: 600, y: 200, id: '2', type: 'linear' },
      { x: 600, y: 400, id: '3', type: 'linear' },
      { x: 200, y: 400, id: '4', type: 'linear' }
    ];
  };

  const [poolPoints, setPoolPoints] = useState<Point2D[]>(getInitialPoolPoints());
  const [deckPoints, setDeckPoints] = useState<DeckPoint[]>([]);
  const [depthPoints, setDepthPoints] = useState<DepthPoint[]>([
    { position: 0, depth: initialDimensions?.depth ? initialDimensions.depth * 0.5 : 3.75, id: 'd1' },
    { position: 0.5, depth: initialDimensions?.depth ? initialDimensions.depth * 0.75 : 5.0, id: 'd2' },
    { position: 1, depth: initialDimensions?.depth || 6.5, id: 'd3' }
  ]);
  
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [draggedDeckPoint, setDraggedDeckPoint] = useState<string | null>(null);
  const [draggedDepthPoint, setDraggedDepthPoint] = useState<string | null>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [deckWidth, setDeckWidth] = useState(5); // feet
  const [copingWidth, setCopingWidth] = useState(1.1); // feet
  
  const [selectedFinishId, setSelectedFinishId] = useState(availableFinishes[0]?.id || 'aquamarine');
  const [selectedPaverId, setSelectedPaverId] = useState(availablePavers[0]?.id || 'appian-adobe');
  const [selectedCopingId, setSelectedCopingId] = useState(availablePavers[0]?.id || 'appian-adobe');
  
  const [activeTab, setActiveTab] = useState<'pool' | 'deck' | 'depth' | 'textures' | 'cost'>('pool');

  const canvasWidth = isFullscreen ? window.innerWidth : containerSize.width;
  const canvasHeight = isFullscreen ? window.innerHeight : containerSize.height;
  
  // Resize observer + viewport resize handler for true responsiveness
  useEffect(() => {
    const updateSize = () => {
      if (isFullscreen) return;
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ 
          width: rect.width, 
          height: Math.min(rect.height, window.innerHeight - 200) 
        });
      } else {
        // Fallback based on viewport
        const availableWidth = window.innerWidth > 1024 ? window.innerWidth - 400 : window.innerWidth - 40;
        const availableHeight = window.innerHeight - 250;
        setContainerSize({ 
          width: Math.min(availableWidth, 1200), 
          height: Math.min(availableHeight, 800) 
        });
      }
    };
    
    updateSize();
    
    const resizeObserver = containerRef.current ? new ResizeObserver(updateSize) : null;
    if (resizeObserver && containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateSize);
    
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [isFullscreen]);

  // Conversion functions
  const pixelsToFeet = (pixels: number) => pixels / scale;
  const feetToPixels = (feet: number) => feet * scale;
  const convertPixels = (pixels: number) => unit === 'feet' ? pixelsToFeet(pixels) : pixelsToFeet(pixels) * 0.3048;
  
  // Area conversion function - CRITICAL: area needs scale squared
  const convertArea = (areaInPixels: number) => {
    const areaInSqFt = areaInPixels / (scale * scale);
    return unit === 'feet' ? areaInSqFt : areaInSqFt * 0.09290304; // 1 sq ft = 0.09290304 sq m
  };

  // Generate deck points from pool points
  const generateDeckPoints = useCallback((poolPts: Point2D[], deckWidthFeet: number): DeckPoint[] => {
    const xs = poolPts.map(p => p.x);
    const ys = poolPts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const deckWidthPx = feetToPixels(deckWidthFeet);
    
    return [
      { x: minX - deckWidthPx, y: minY - deckWidthPx, id: 'deck1' },
      { x: maxX + deckWidthPx, y: minY - deckWidthPx, id: 'deck2' },
      { x: maxX + deckWidthPx, y: maxY + deckWidthPx, id: 'deck3' },
      { x: minX - deckWidthPx, y: maxY + deckWidthPx, id: 'deck4' }
    ];
  }, [scale]);

  // Update deck when pool or deckWidth changes
  useEffect(() => {
    setDeckPoints(generateDeckPoints(poolPoints, deckWidth));
  }, [poolPoints, deckWidth, generateDeckPoints]);

  // Calculate measurements
  const measurements = useMemo(() => {
    // Pool perimeter
    let poolPerimeter = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      const dist = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      poolPerimeter += dist;
    }
    
    // Pool area (shoelace formula)
    let poolArea = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      poolArea += curr.x * next.y - next.x * curr.y;
    }
    poolArea = Math.abs(poolArea / 2);
    
    // Deck area
    let deckArea = 0;
    if (deckPoints.length >= 3) {
      for (let i = 0; i < deckPoints.length; i++) {
        const curr = deckPoints[i];
        const next = deckPoints[(i + 1) % deckPoints.length];
        deckArea += curr.x * next.y - next.x * curr.y;
      }
      deckArea = Math.abs(deckArea / 2) - poolArea; // Subtract pool area
    }
    
    return {
      poolPerimeter: convertPixels(poolPerimeter),
      poolArea: convertArea(poolArea),  // Use correct area conversion
      deckArea: convertArea(deckArea)   // Use correct area conversion
    };
  }, [poolPoints, deckPoints, unit]);

  // Calculate costs
  const costs = useMemo(() => {
    const poolCost = measurements.poolArea * POOL_COST_PER_SQFT;
    const deckCost = measurements.deckArea * PAVER_COST_PER_SQFT;
    const copingCost = measurements.poolPerimeter * COPING_COST_PER_LINFT;
    
    return {
      poolCost,
      deckCost,
      copingCost,
      total: poolCost + deckCost + copingCost
    };
  }, [measurements]);

  // Emit design changes
  useEffect(() => {
    onDesignChange?.({
      poolPoints,
      deckPoints,
      depthPoints,
      finish: selectedFinishId,
      paver: selectedPaverId,
      coping: selectedCopingId,
      deckWidth,
      copingWidth,
      measurements,
      costs
    });
  }, [poolPoints, deckPoints, depthPoints, selectedFinishId, selectedPaverId, selectedCopingId, deckWidth, copingWidth, measurements, costs]);

  useEffect(() => {
    drawCanvas();
  }, [poolPoints, deckPoints, depthPoints, hoveredPoint, hoveredSegment, draggedPoint, draggedDeckPoint, draggedDepthPoint, activeTab, showMeasurements, isFullscreen]);

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

    // Draw deck
    if (deckPoints.length >= 3 && activeTab !== 'pool') {
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      
      deckPoints.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw deck control points
      if (activeTab === 'deck') {
        deckPoints.forEach((point) => {
          const isDragged = draggedDeckPoint === point.id;
          const size = isDragged ? 10 : 7;
          
          ctx.fillStyle = '#64748b';
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    }

    // Draw pool shape with curves
    if (poolPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';

      for (let i = 0; i < poolPoints.length; i++) {
        const curr = poolPoints[i];
        const next = poolPoints[(i + 1) % poolPoints.length];

        if (i === 0) {
          ctx.moveTo(curr.x, curr.y);
        }

        if (curr.type === 'curve' || curr.type === 'smooth') {
          const prev = poolPoints[(i - 1 + poolPoints.length) % poolPoints.length];
          const nextNext = poolPoints[(i + 2) % poolPoints.length];
          
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
    if (hoveredSegment !== null && hoveredSegment < poolPoints.length && activeTab === 'pool') {
      const curr = poolPoints[hoveredSegment];
      const next = poolPoints[(hoveredSegment + 1) % poolPoints.length];
      
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 5;
      ctx.moveTo(curr.x, curr.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();

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

    // Draw pool control points
    if (activeTab === 'pool') {
      poolPoints.forEach((point, i) => {
        const isHovered = hoveredPoint === point.id;
        const isDragged = draggedPoint === point.id;
        const size = isDragged ? 12 : isHovered ? 10 : 8;

        let color = '#22c55e';
        if (point.type === 'curve') color = '#06b6d4';
        if (point.type === 'smooth') color = '#a855f7';
        if (point.type === 'corner') color = '#f97316';
        if (isDragged) color = '#ef4444';
        if (isHovered) color = '#fbbf24';

        ctx.fillStyle = color;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;

        if (point.type === 'corner') {
          ctx.fillRect(point.x - size, point.y - size, size * 2, size * 2);
          ctx.strokeRect(point.x - size, point.y - size, size * 2, size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((i + 1).toString(), point.x, point.y);
      });
    }

    // Draw depth profile (bottom of canvas)
    if (activeTab === 'depth' && depthPoints.length > 0) {
      const depthGraphY = canvasHeight - 150;
      const depthGraphHeight = 120;
      const depthGraphX = 50;
      const depthGraphWidth = canvasWidth - 100;
      
      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(depthGraphX - 10, depthGraphY - 10, depthGraphWidth + 20, depthGraphHeight + 20);
      
      // Grid lines
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = depthGraphY + (depthGraphHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(depthGraphX, y);
        ctx.lineTo(depthGraphX + depthGraphWidth, y);
        ctx.stroke();
        
        // Depth labels
        const depth = 8 - (i * 2);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${depth}ft`, depthGraphX - 5, y + 4);
      }
      
      // Depth profile line
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      
      const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
      sortedDepths.forEach((pt, i) => {
        const x = depthGraphX + pt.position * depthGraphWidth;
        const y = depthGraphY + depthGraphHeight - ((pt.depth / 8) * depthGraphHeight);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Depth control points
      sortedDepths.forEach((pt) => {
        const x = depthGraphX + pt.position * depthGraphWidth;
        const y = depthGraphY + depthGraphHeight - ((pt.depth / 8) * depthGraphHeight);
        const isDragged = draggedDepthPoint === pt.id;
        const size = isDragged ? 10 : 7;
        
        ctx.fillStyle = isDragged ? '#ef4444' : '#3b82f6';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Depth value
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${pt.depth.toFixed(1)}ft`, x, y - 15);
      });
      
      // Title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Pool Depth Profile', depthGraphX + depthGraphWidth / 2, depthGraphY - 20);
    }

    // Draw measurements
    if (showMeasurements && poolPoints.length >= 3) {
      const xs = poolPoints.map(p => p.x);
      const ys = poolPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      const width = maxX - minX;
      const length = maxY - minY;

      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#2563eb';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;

      // Width measurement
      const widthText = `${convertPixels(width).toFixed(1)} ${unit}`;
      ctx.strokeText(widthText, (minX + maxX) / 2, minY - 30);
      ctx.fillText(widthText, (minX + maxX) / 2, minY - 30);

      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(minX, minY - 20);
      ctx.lineTo(maxX, minY - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Length measurement
      const lengthText = `${convertPixels(length).toFixed(1)} ${unit}`;
      ctx.save();
      ctx.translate(minX - 40, (minY + maxY) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.strokeText(lengthText, 0, 0);
      ctx.fillText(lengthText, 0, 0);
      ctx.restore();

      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(minX - 30, minY);
      ctx.lineTo(minX - 30, maxY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Area
      const areaText = `Area: ${measurements.poolArea.toFixed(1)} sq ${unit}`;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#059669';
      ctx.strokeText(areaText, maxX - 100, maxY + 40);
      ctx.fillText(areaText, maxX - 100, maxY + 40);
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

  const findPointAtPosition = (x: number, y: number, points: Array<{ x: number; y: number; id: string }>): string | null => {
    for (const point of points) {
      const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
      if (distance < 15) return point.id;
    }
    return null;
  };

  const findSegmentAtPosition = (x: number, y: number): number | null => {
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      
      const distance = pointToLineDistance(x, y, curr.x, curr.y, next.x, next.y);
      if (distance < 10) return i;
    }
    return null;
  };

  const findDepthPointAt = (x: number, y: number): string | null => {
    const depthGraphY = canvasHeight - 150;
    const depthGraphHeight = 120;
    const depthGraphX = 50;
    const depthGraphWidth = canvasWidth - 100;
    
    for (const pt of depthPoints) {
      const px = depthGraphX + pt.position * depthGraphWidth;
      const py = depthGraphY + depthGraphHeight - ((pt.depth / 8) * depthGraphHeight);
      
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist < 15) return pt.id;
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
    
    if (activeTab === 'pool') {
      const pointId = findPointAtPosition(x, y, poolPoints);
      if (pointId) {
        setDraggedPoint(pointId);
      }
    } else if (activeTab === 'deck') {
      const pointId = findPointAtPosition(x, y, deckPoints);
      if (pointId) {
        setDraggedDeckPoint(pointId);
      }
    } else if (activeTab === 'depth') {
      const pointId = findDepthPointAt(x, y);
      if (pointId) {
        setDraggedDepthPoint(pointId);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (draggedPoint && activeTab === 'pool') {
      setPoolPoints(prev => prev.map(p => 
        p.id === draggedPoint ? { ...p, x, y } : p
      ));
    } else if (draggedDeckPoint && activeTab === 'deck') {
      setDeckPoints(prev => prev.map(p => 
        p.id === draggedDeckPoint ? { ...p, x, y } : p
      ));
    } else if (draggedDepthPoint && activeTab === 'depth') {
      const depthGraphY = canvasHeight - 150;
      const depthGraphHeight = 120;
      const depthGraphX = 50;
      const depthGraphWidth = canvasWidth - 100;
      
      const position = Math.max(0, Math.min(1, (x - depthGraphX) / depthGraphWidth));
      const depth = Math.max(2, Math.min(10, 8 - ((y - depthGraphY) / depthGraphHeight) * 8));
      
      setDepthPoints(prev => prev.map(p => 
        p.id === draggedDepthPoint ? { ...p, position, depth } : p
      ).sort((a, b) => a.position - b.position));
    } else {
      if (activeTab === 'pool') {
        const pointId = findPointAtPosition(x, y, poolPoints);
        setHoveredPoint(pointId);
        
        if (!pointId) {
          const segmentIndex = findSegmentAtPosition(x, y);
          setHoveredSegment(segmentIndex);
        } else {
          setHoveredSegment(null);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedPoint(null);
    setDraggedDeckPoint(null);
    setDraggedDepthPoint(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (hoveredSegment !== null && activeTab === 'pool') {
      const curr = poolPoints[hoveredSegment];
      const next = poolPoints[(hoveredSegment + 1) % poolPoints.length];
      const newPoint: Point2D = {
        x: (curr.x + next.x) / 2,
        y: (curr.y + next.y) / 2,
        id: `${Date.now()}`,
        type: 'linear'
      };
      
      const newPoints = [...poolPoints];
      newPoints.splice(hoveredSegment + 1, 0, newPoint);
      setPoolPoints(newPoints);
    }
  };

  const deletePoint = (pointId: string) => {
    if (poolPoints.length <= 3) {
      toast({
        title: "Cannot Delete",
        description: "Pool must have at least 3 points",
        variant: "destructive"
      });
      return;
    }
    setPoolPoints(poolPoints.filter(p => p.id !== pointId));
  };

  const changePointType = (pointId: string, type: PointType) => {
    setPoolPoints(poolPoints.map(p => p.id === pointId ? { ...p, type } : p));
  };

  const saveShape = () => {
    const designData = {
      poolPoints,
      deckPoints,
      depthPoints,
      finish: selectedFinishId,
      paver: selectedPaverId,
      coping: selectedCopingId,
      deckWidth,
      copingWidth,
      measurements,
      costs,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pool-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Design Saved",
      description: "Pool design has been downloaded successfully."
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
        
        if (data.poolPoints) setPoolPoints(data.poolPoints);
        if (data.deckPoints) setDeckPoints(data.deckPoints);
        if (data.depthPoints) setDepthPoints(data.depthPoints);
        if (data.finish) setSelectedFinishId(data.finish);
        if (data.paver) setSelectedPaverId(data.paver);
        if (data.coping) setSelectedCopingId(data.coping);
        if (data.deckWidth) setDeckWidth(data.deckWidth);
        if (data.copingWidth) setCopingWidth(data.copingWidth);
        
        toast({
          title: "Design Loaded",
          description: "Pool design has been loaded successfully."
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load design file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedPoint = poolPoints.find(p => p.id === (hoveredPoint || draggedPoint));

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto" : "w-full min-h-screen"}>
      <Card className={isFullscreen ? "min-h-screen rounded-none border-0 p-3 sm:p-4" : "p-3 sm:p-6"}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 pb-3 border-b">
          <div className="flex items-center gap-2 sm:gap-4">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-lg sm:text-xl font-bold">Pool Design Studio</h2>
            {initialDimensions && (
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                {initialDimensions.width}' × {initialDimensions.length}'
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setUnit(unit === 'feet' ? 'meters' : 'feet')}>
              <span className="text-xs sm:text-sm font-medium">{unit === 'feet' ? 'ft' : 'm'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={saveShape}>
              <Save className="w-4 h-4 mr-1 hidden sm:inline" />
              <span className="hidden sm:inline text-sm">Save</span>
              <Save className="w-4 h-4 sm:hidden" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1 hidden sm:inline" />
              <span className="hidden sm:inline text-sm">Load</span>
              <Upload className="w-4 h-4 sm:hidden" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
          
          <input ref={fileInputRef} type="file" accept=".json" onChange={loadShape} className="hidden" />
        </div>

        {/* Main Content - Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] xl:grid-cols-[300px,1fr] gap-4">
          {/* Left Panel - Scrollable Controls */}
          <div className="space-y-3 max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto pr-2"  style={{ scrollbarWidth: 'thin' }}>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-5 w-full text-xs sm:text-sm">
                <TabsTrigger value="pool" className="px-1 sm:px-3">Pool</TabsTrigger>
                <TabsTrigger value="deck" className="px-1 sm:px-3">Deck</TabsTrigger>
                <TabsTrigger value="depth" className="px-1 sm:px-3">Depth</TabsTrigger>
                <TabsTrigger value="textures" className="px-1 sm:px-3">Finish</TabsTrigger>
                <TabsTrigger value="cost" className="px-1 sm:px-3">Cost</TabsTrigger>
              </TabsList>

              <TabsContent value="pool" className="space-y-4 mt-4">
                <Card className="p-3">
                  <h4 className="font-medium mb-2">Pool Shape</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Points:</span>
                      <Badge>{poolPoints.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Perimeter:</span>
                      <span>{measurements.poolPerimeter.toFixed(1)} {unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Area:</span>
                      <span>{measurements.poolArea.toFixed(1)} sq {unit}</span>
                    </div>
                  </div>
                </Card>

                {selectedPoint && (
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Point {poolPoints.findIndex(p => p.id === selectedPoint.id) + 1}</h4>
                      {poolPoints.length > 3 && (
                        <Button variant="destructive" size="sm" onClick={() => deletePoint(selectedPoint.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Point Type:</Label>
                      <div className="grid grid-cols-2 gap-2">
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
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="deck" className="space-y-4 mt-4">
                <Card className="p-3">
                  <h4 className="font-medium mb-3">Deck Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Deck Width: {deckWidth.toFixed(1)} ft</Label>
                      <Slider
                        value={[deckWidth]}
                        onValueChange={([v]) => setDeckWidth(v)}
                        min={3}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Deck Area:</span>
                        <span>{measurements.deckArea.toFixed(1)} sq ft</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="depth" className="space-y-4 mt-4">
                <Card className="p-3">
                  <h4 className="font-medium mb-3">Depth Profile</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Drag points on the depth graph below to adjust pool depth
                  </p>
                  <div className="space-y-2 text-sm">
                    {depthPoints.map((pt, idx) => (
                      <div key={pt.id} className="flex justify-between items-center">
                        <span>Point {idx + 1}:</span>
                        <Badge variant="secondary">{pt.depth.toFixed(1)} ft</Badge>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => {
                      const newDepthPoint: DepthPoint = {
                        position: 0.5,
                        depth: 5,
                        id: `d${Date.now()}`
                      };
                      setDepthPoints([...depthPoints, newDepthPoint].sort((a, b) => a.position - b.position));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Depth Point
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="textures" className="space-y-4 mt-4">
                <Card className="p-3">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Pool Finish</Label>
                      <Select value={selectedFinishId} onValueChange={setSelectedFinishId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFinishes.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Deck Pavers</Label>
                      <Select value={selectedPaverId} onValueChange={setSelectedPaverId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePavers.slice(0, 10).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Coping</Label>
                      <Select value={selectedCopingId} onValueChange={setSelectedCopingId}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePavers.slice(0, 10).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Coping Width: {copingWidth.toFixed(1)} ft</Label>
                      <Slider
                        value={[copingWidth]}
                        onValueChange={([v]) => setCopingWidth(v)}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="cost" className="space-y-4 mt-4">
                <Card className="p-3">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cost Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pool Construction:</span>
                      <span className="font-medium">${costs.poolCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>({measurements.poolArea.toFixed(1)} sq ft × ${POOL_COST_PER_SQFT}/sq ft)</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Deck Pavers:</span>
                      <span className="font-medium">${costs.deckCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>({measurements.deckArea.toFixed(1)} sq ft × ${PAVER_COST_PER_SQFT}/sq ft)</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Coping:</span>
                      <span className="font-medium">${costs.copingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>({measurements.poolPerimeter.toFixed(1)} lin ft × ${COPING_COST_PER_LINFT}/lin ft)</span>
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">${costs.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Legend */}
            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2">Legend</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Linear</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span>Curve</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Smooth</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500"></div>
                  <span>Corner</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Canvas - Fully Responsive Container */}
          <div 
            ref={containerRef}
            className="relative flex items-center justify-center bg-muted rounded-lg w-full min-h-[400px] sm:min-h-[500px]"
            style={{ 
              height: isFullscreen 
                ? 'calc(100vh - 100px)' 
                : 'clamp(400px, calc(100vh - 300px), 800px)' 
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleClick}
              className="cursor-crosshair shadow-lg rounded-lg max-w-full max-h-full"
              style={{ 
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
