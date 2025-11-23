import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Square, Circle, Trash2, Undo2, Redo2, Grid3x3, 
  Move, Plus, Maximize2, Minimize2, Ruler, DollarSign,
  Waves, Layers, Save, Upload, Eye, EyeOff, Box, Droplets
} from 'lucide-react';
import { paverTypes } from '@/data/paverData';
import { useToast } from '@/hooks/use-toast';
import { DepthProfileEditor, type DepthPoint } from './DepthProfileEditor';

export interface PoolPoint {
  x: number;
  y: number;
  id: string;
}

export interface DeckPoint {
  x: number;
  y: number;
  id: string;
}

interface Sims4StylePoolDesignerProps {
  initialDimensions?: { width: number; length: number; depth: number };
  onDesignChange?: (design: {
    poolPoints: PoolPoint[];
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
  onOpen3DView?: () => void;
}

type BuildMode = 'select' | 'draw' | 'rectangle' | 'circle' | 'erase';

export function Sims4StylePoolDesigner({
  initialDimensions,
  onDesignChange,
  onOpen3DView
}: Sims4StylePoolDesignerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scale = 10; // pixels per foot
  const gridSize = 50; // 5 feet grid

  // State
  const [canvasSize, setCanvasSize] = useState({
    width: 1400,
    height: 900
  });

  const [buildMode, setBuildMode] = useState<BuildMode>('draw');
  const [poolPoints, setPoolPoints] = useState<PoolPoint[]>([]);
  const [deckPoints, setDeckPoints] = useState<DeckPoint[]>([]);
  const [depthPoints, setDepthPoints] = useState<DepthPoint[]>([
    { position: 0, depth: 3.6, id: 'd1' },
    { position: 0.5, depth: 5.0, id: 'd2' },
    { position: 1, depth: 6.6, id: 'd3' }
  ]);

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedDepthPointId, setSelectedDepthPointId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showDeck, setShowDeck] = useState(true);
  const [showDepth, setShowDepth] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive sizing based on fullscreen mode
  useEffect(() => {
    const updateCanvasSize = () => {
      if (isFullscreen) {
        setCanvasSize({
          width: window.innerWidth - 450,
          height: window.innerHeight - 150
        });
      } else {
        setCanvasSize({
          width: Math.min(1400, window.innerWidth - 500),
          height: Math.min(900, window.innerHeight - 300)
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isFullscreen]);

  // Handle fullscreen and responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (isFullscreen) {
        setCanvasSize({
          width: window.innerWidth - 400,
          height: window.innerHeight - 100
        });
      } else {
        setCanvasSize({
          width: Math.min(window.innerWidth - 400, 1400),
          height: Math.min(window.innerHeight - 200, 900)
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);
  
  const [deckWidth, setDeckWidth] = useState(5); // feet
  const [copingWidth, setCopingWidth] = useState(1.1); // feet
  
  const [selectedFinishId, setSelectedFinishId] = useState('aquamarine');
  const [selectedPaverId, setSelectedPaverId] = useState('appian-adobe');
  const [selectedCopingId, setSelectedCopingId] = useState('appian-adobe');

  const [history, setHistory] = useState<PoolPoint[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Pricing
  const POOL_COST_PER_SQFT = 190;
  const PAVER_COST_PER_SQFT = 15;
  const COPING_COST_PER_LINFT = 45;

  // Snap to grid
  const snapPoint = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  // Generate deck from pool
  const generateDeckPoints = useCallback((poolPts: PoolPoint[], deckWidthFeet: number): DeckPoint[] => {
    if (poolPts.length < 3) return [];
    
    const xs = poolPts.map(p => p.x);
    const ys = poolPts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const deckWidthPx = deckWidthFeet * scale;

    return [
      { x: minX - deckWidthPx, y: minY - deckWidthPx, id: 'deck1' },
      { x: maxX + deckWidthPx, y: minY - deckWidthPx, id: 'deck2' },
      { x: maxX + deckWidthPx, y: maxY + deckWidthPx, id: 'deck3' },
      { x: minX - deckWidthPx, y: maxY + deckWidthPx, id: 'deck4' }
    ];
  }, [scale]);

  // Update deck when pool changes
  useEffect(() => {
    if (poolPoints.length >= 3) {
      setDeckPoints(generateDeckPoints(poolPoints, deckWidth));
    }
  }, [poolPoints, deckWidth, generateDeckPoints]);

  // Calculate measurements
  const measurements = useCallback(() => {
    if (poolPoints.length < 3) return { poolPerimeter: 0, poolArea: 0, deckArea: 0 };

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
      deckArea = Math.abs(deckArea / 2) - poolArea;
    }

    return {
      poolPerimeter: poolPerimeter / scale,
      poolArea: poolArea / (scale * scale),
      deckArea: deckArea / (scale * scale)
    };
  }, [poolPoints, deckPoints, scale]);

  const costs = useCallback(() => {
    const m = measurements();
    const poolCost = m.poolArea * POOL_COST_PER_SQFT;
    const deckCost = m.deckArea * PAVER_COST_PER_SQFT;
    const copingCost = m.poolPerimeter * COPING_COST_PER_LINFT;

    return {
      poolCost,
      deckCost,
      copingCost,
      total: poolCost + deckCost + copingCost
    };
  }, [measurements]);

  // Emit design changes
  useEffect(() => {
    if (poolPoints.length >= 3) {
      onDesignChange?.({
        poolPoints,
        deckPoints,
        depthPoints,
        finish: selectedFinishId,
        paver: selectedPaverId,
        coping: selectedCopingId,
        deckWidth,
        copingWidth,
        measurements: measurements(),
        costs: costs()
      });
    }
  }, [poolPoints, deckPoints, depthPoints, selectedFinishId, selectedPaverId, selectedCopingId, deckWidth, copingWidth]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Grid (Sims 4 style)
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasSize.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasSize.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
      }
      
      // Major grid lines every 5 squares (25 feet)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      for (let x = 0; x <= canvasSize.width; x += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasSize.height; y += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
      }
    }

    // Deck (if visible)
    if (showDeck && deckPoints.length >= 3) {
      ctx.beginPath();
      deckPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(139, 111, 78, 0.3)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(139, 111, 78, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Pool shape
    if (poolPoints.length >= 3) {
      ctx.beginPath();
      poolPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      
      // Pool water (Sims 4 blue)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
      gradient.addColorStop(0, 'rgba(46, 134, 171, 0.4)');
      gradient.addColorStop(1, 'rgba(16, 78, 139, 0.6)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Pool edge (bright highlight like Sims 4)
      ctx.strokeStyle = '#4FB3D9';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner glow
      ctx.strokeStyle = 'rgba(79, 179, 217, 0.3)';
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    // Pool edges (lines between points)
    if (poolPoints.length >= 2) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let i = 0; i < poolPoints.length; i++) {
        const curr = poolPoints[i];
        const next = poolPoints[(i + 1) % poolPoints.length];
        
        ctx.beginPath();
        ctx.moveTo(curr.x, curr.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
        
        // Distance label (Sims 4 style)
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        const distance = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2) / scale;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(midX - 25, midY - 10, 50, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${distance.toFixed(1)}'`, midX, midY + 4);
      }
    }

    // Pool points (Sims 4 style markers)
    poolPoints.forEach((pt, index) => {
      const isSelected = pt.id === selectedPointId;
      const size = isSelected ? 14 : 10;
      
      // Outer glow
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size + 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(255, 215, 0, 0.3)' : 'rgba(79, 179, 217, 0.3)';
      ctx.fill();
      
      // Main circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#FFD700' : '#4FB3D9';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Point number
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), pt.x, pt.y + 3);
    });

    // Draw preview for rectangle/circle mode
    if ((buildMode === 'rectangle' || buildMode === 'circle') && dragStart && isDrawing) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = dragStart.x;
      const currentY = dragStart.y;
      
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      if (buildMode === 'rectangle') {
        ctx.strokeRect(
          Math.min(currentX, dragStart.x),
          Math.min(currentY, dragStart.y),
          Math.abs(currentX - dragStart.x),
          Math.abs(currentY - dragStart.y)
        );
      } else {
        const radius = Math.sqrt((currentX - dragStart.x) ** 2 + (currentY - dragStart.y) ** 2);
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

  }, [canvasSize, poolPoints, deckPoints, showGrid, showDeck, selectedPointId, buildMode, dragStart, isDrawing, gridSize, snapToGrid]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (buildMode === 'draw') {
      // Click to add point
      const snapped = snapPoint(x, y);
      const newPoint: PoolPoint = {
        x: snapped.x,
        y: snapped.y,
        id: `p${Date.now()}`
      };
      
      const newPoints = [...poolPoints, newPoint];
      setPoolPoints(newPoints);
      
      // Save to history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newPoints]);
      setHistoryIndex(prev => prev + 1);
      
    } else if (buildMode === 'select') {
      // Check if clicked on a point
      const clickedPoint = poolPoints.find(pt =>
        Math.sqrt((pt.x - x) ** 2 + (pt.y - y) ** 2) < 15
      );

      if (clickedPoint) {
        setSelectedPointId(clickedPoint.id);
        setIsDragging(true);
      } else {
        setSelectedPointId(null);
      }
      
    } else if (buildMode === 'rectangle' || buildMode === 'circle') {
      const snapped = snapPoint(x, y);
      setDragStart(snapped);
      setIsDrawing(true);
      
    } else if (buildMode === 'erase') {
      // Delete point
      const clickedPoint = poolPoints.find(pt =>
        Math.sqrt((pt.x - x) ** 2 + (pt.y - y) ** 2) < 15
      );
      
      if (clickedPoint && poolPoints.length > 3) {
        const newPoints = poolPoints.filter(pt => pt.id !== clickedPoint.id);
        setPoolPoints(newPoints);
        setHistory(prev => [...prev.slice(0, historyIndex + 1), newPoints]);
        setHistoryIndex(prev => prev + 1);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (isDragging && selectedPointId && buildMode === 'select') {
      const snapped = snapPoint(x, y);
      setPoolPoints(prev => prev.map(pt =>
        pt.id === selectedPointId ? { ...pt, x: snapped.x, y: snapped.y } : pt
      ));
    }
  };

  const handleMouseUp = () => {
    if (isDragging && selectedPointId) {
      // Save to history after dragging
      setHistory(prev => [...prev.slice(0, historyIndex + 1), poolPoints]);
      setHistoryIndex(prev => prev + 1);
    }
    
    if (isDrawing && dragStart && (buildMode === 'rectangle' || buildMode === 'circle')) {
      // Complete shape
      createShape(buildMode);
    }
    
    setIsDragging(false);
    setIsDrawing(false);
    setDragStart(null);
  };

  const createShape = (shape: 'rectangle' | 'circle') => {
    if (!dragStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get current mouse position from last event
    // For now, use dragStart as both start and end
    const width = 200;
    const height = 150;
    
    if (shape === 'rectangle') {
      const newPoints: PoolPoint[] = [
        { x: dragStart.x, y: dragStart.y, id: `p${Date.now()}_1` },
        { x: dragStart.x + width, y: dragStart.y, id: `p${Date.now()}_2` },
        { x: dragStart.x + width, y: dragStart.y + height, id: `p${Date.now()}_3` },
        { x: dragStart.x, y: dragStart.y + height, id: `p${Date.now()}_4` },
      ];
      setPoolPoints(newPoints);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newPoints]);
      setHistoryIndex(prev => prev + 1);
    } else if (shape === 'circle') {
      const numPoints = 12;
      const radius = 100;
      const newPoints: PoolPoint[] = [];
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        newPoints.push({
          x: dragStart.x + Math.cos(angle) * radius,
          y: dragStart.y + Math.sin(angle) * radius,
          id: `p${Date.now()}_${i}`
        });
      }
      
      setPoolPoints(newPoints);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newPoints]);
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setPoolPoints(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setPoolPoints(history[historyIndex + 1]);
    }
  };

  const clearPool = () => {
    setPoolPoints([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  const m = measurements();
  const c = costs();

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background" : "w-full min-h-[800px]"}>
      <Card className="h-full flex flex-col">
        {/* Top Toolbar - Sims 4 Style */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Waves className="w-3 h-3" />
              Pool Designer
            </Badge>
            
            {poolPoints.length >= 3 && (
              <>
                <Badge variant="outline" className="gap-1">
                  <Ruler className="w-3 h-3" />
                  {m.poolArea.toFixed(0)} sq ft
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  ${c.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={buildMode === 'select' ? 'default' : 'outline'}
              onClick={() => setBuildMode('select')}
              className="h-8"
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={buildMode === 'draw' ? 'default' : 'outline'}
              onClick={() => setBuildMode('draw')}
              className="h-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={buildMode === 'rectangle' ? 'default' : 'outline'}
              onClick={() => setBuildMode('rectangle')}
              className="h-8"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={buildMode === 'circle' ? 'default' : 'outline'}
              onClick={() => setBuildMode('circle')}
              className="h-8"
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={buildMode === 'erase' ? 'default' : 'outline'}
              onClick={() => setBuildMode('erase')}
              className="h-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="mx-1 h-6" />
            
            <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0} className="h-8">
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8">
              <Redo2 className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="mx-1 h-6" />
            
            <Button
              size="sm"
              variant={showGrid ? 'default' : 'outline'}
              onClick={() => setShowGrid(!showGrid)}
              className="h-8"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={showDeck ? 'default' : 'outline'}
              onClick={() => setShowDeck(!showDeck)}
              className="h-8"
            >
              <Layers className="w-4 h-4" />
            </Button>
            
            {onOpen3DView && (
              <>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button size="sm" onClick={onOpen3DView} className="h-8 gap-1">
                  <Box className="w-4 h-4" />
                  3D View
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas */}
          <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 bg-muted/20">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="rounded-lg shadow-2xl border-2 border-border cursor-crosshair"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>

          {/* Right Panel */}
          <div className="w-80 border-l p-4 overflow-y-auto bg-background">
            <div className="space-y-4">
              {/* Instructions */}
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="space-y-2 text-sm">
                  <div className="font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    How to Build
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• <strong>Draw:</strong> Click to add corner points</li>
                    <li>• <strong>Select:</strong> Drag points to reshape</li>
                    <li>• <strong>Rectangle/Circle:</strong> Quick shapes</li>
                    <li>• <strong>Erase:</strong> Click points to delete</li>
                  </ul>
                </div>
              </Card>

              {/* Depth Profile */}
              {poolPoints.length >= 3 && (
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Pool Depth
                    </h4>
                    <Button
                      size="sm"
                      variant={showDepth ? 'default' : 'outline'}
                      onClick={() => setShowDepth(!showDepth)}
                      className="h-7"
                    >
                      {showDepth ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                  </div>
                  {showDepth && (
                    <DepthProfileEditor
                      depthPoints={depthPoints}
                      onChange={setDepthPoints}
                      selectedDepthPoint={selectedDepthPointId}
                      onSelectPoint={setSelectedDepthPointId}
                    />
                  )}
                </Card>
              )}

              {/* Deck Settings */}
              {poolPoints.length >= 3 && (
                <Card className="p-3">
                  <h4 className="font-semibold text-sm mb-3">Deck & Coping</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Deck Width: {deckWidth.toFixed(1)} ft</Label>
                      <Slider
                        value={[deckWidth]}
                        onValueChange={([v]) => setDeckWidth(v)}
                        min={3}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Coping Width: {copingWidth.toFixed(1)} ft</Label>
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
              )}

              {/* Cost Breakdown */}
              {poolPoints.length >= 3 && (
                <Card className="p-3">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cost Estimate
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pool:</span>
                      <span className="font-medium">${c.poolCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deck:</span>
                      <span className="font-medium">${c.deckCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coping:</span>
                      <span className="font-medium">${c.copingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${c.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearPool}
                  disabled={poolPoints.length === 0}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Pool
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
