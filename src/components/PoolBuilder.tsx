import * as React from 'react';
const { useState, useRef, useEffect, useMemo, useCallback } = React;
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Minus, Plus, Trash2, Move, Lightbulb, Waves, Ruler, Home, Trees, Flower2, Droplets, Box } from 'lucide-react';
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import poolTextureSapphire from '@/assets/pool-texture-sapphire.jpg';
import { paverTypes } from '@/data/paverData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadAllTextureLODs, getTextureForLOD, getLODLevel, type TextureLODSet } from '@/utils/textureLOD';
import { UnifiedPoolVisualizer } from './UnifiedPoolVisualizer';
import { poolBuilderToScene, buildTextureLibrary } from './scene3d/PoolBuilderConverter';
import { TextureBuilder, type TextureConfig } from './TextureBuilder';
import { useIsMobile } from '@/hooks/use-mobile';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface RoofPoint {
  x: number;
  y: number;
  id: string;
}

interface PoolFeature {
  type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home' | 'shrub' | 'umbrella' | 'fence' | 'pathway';
  x: number;
  y: number;
  id: string;
  angle?: number;
  steps?: number;
  wallSegment?: number;
  wallPosition?: number;
  width?: number;
  height?: number;
  treeType?: 'palm' | 'oak' | 'pine' | 'willow' | 'maple' | 'cypress';
  shrubType?: 'round' | 'flowering' | 'hedge';
  pathwayType?: 'straight' | 'curved' | 'circular';
  radius?: number;
  roofPoints?: RoofPoint[];
  color?: string;
}

interface DepthPoint {
  position: number; // 0-1 along pool length
  depth: number; // in feet
  id: string;
}

interface HardscapePoint {
  x: number;
  y: number;
  id: string;
}

interface FencePoint {
  x: number;
  y: number;
  id: string;
}

interface FenceDoor {
  segmentIndex: number; // which fence segment (between two points)
  position: number; // 0-1 position along the segment
  width: number; // door width in feet
  id: string;
}

interface PoolBuilderProps {
  onPoolDataChange?: (data: {
    points: Point[];
    features: PoolFeature[];
    perimeter: number;
    area: number;
    deckArea: number;
    totalCost: number;
    breakdown: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      featuresCost: number;
      total: number;
    };
  }) => void;
  productDimensions?: string; // e.g. "14' x 28'"
  productDepth?: string; // e.g. "4' - 6'"
}

const GRID_SIZE = 600;
const PIXELS_PER_FOOT = 20;

const FEATURE_COSTS = {
  stairs: 2500,
  light: 350,
  jet: 450,
  tree: 500,
  fountain: 3500,
  grass: 0,
  home: 0,
  shrub: 150,
  umbrella: 800,
  fence: 50,
  pathway: 25,
};

const POOL_COST_PER_SQ_FT = 75;
const DECK_COST_PER_SQ_FT = 15;
const COPING_COST_PER_LINEAR_FT = 25;

export function PoolBuilder({ onPoolDataChange, productDimensions, productDepth }: PoolBuilderProps) {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [features, setFeatures] = useState<PoolFeature[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTool, setCurrentTool] = useState<'point' | 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home' | 'shrub' | 'umbrella' | 'fence' | 'pathway' | null>(null);
  const [deckWidth, setDeckWidth] = useState(4);
  const [copingWidth, setCopingWidth] = useState(1);
  const [depthPoints, setDepthPoints] = useState<DepthPoint[]>([
    { position: 0, depth: 4, id: 'depth-0' },
    { position: 1, depth: 6, id: 'depth-1' },
  ]);
  const [selectedDepthPoint, setSelectedDepthPoint] = useState<string | null>(null);
  const [hardscapePoints, setHardscapePoints] = useState<HardscapePoint[]>([]);
  const [selectedHardscapePoint, setSelectedHardscapePoint] = useState<string | null>(null);
  const [fencePoints, setFencePoints] = useState<FencePoint[]>([]);
  const [selectedFencePoint, setSelectedFencePoint] = useState<string | null>(null);
  const [fenceDoors, setFenceDoors] = useState<FenceDoor[]>([]);
  const [selectedFenceDoor, setSelectedFenceDoor] = useState<string | null>(null);
  const [fenceHeight, setFenceHeight] = useState(6);
  const [selectedPaverType, setSelectedPaverType] = useState(paverTypes[0].id);
  const [poolFinish, setPoolFinish] = useState<string>(aquamarineFinish);
  const [copingMaterial, setCopingMaterial] = useState<string>('travertine');
  const [poolTextureLODs, setPoolTextureLODs] = useState<TextureLODSet | null>(null);
  const [deckTextureLODs, setDeckTextureLODs] = useState<TextureLODSet | null>(null);
  const [copingTextureLODs, setCopingTextureLODs] = useState<TextureLODSet | null>(null);
  const [currentLOD, setCurrentLOD] = useState<'high' | 'medium' | 'low'>('high');
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [selectedRoofPoint, setSelectedRoofPoint] = useState<{ featureId: string; pointId: string } | null>(null);
  const [poolLength, setPoolLength] = useState(28);
  const [poolWidth, setPoolWidth] = useState(14);
  const [shallowDepth, setShallowDepth] = useState(4);
  const [deepDepth, setDeepDepth] = useState(6);

  // Parse product dimensions and depth if provided
  useEffect(() => {
    if (productDimensions) {
      const match = productDimensions.match(/(\d+)'?\s*x\s*(\d+)'?/i);
      if (match) {
        const width = parseInt(match[1]);
        const length = parseInt(match[2]);
        setPoolWidth(width);
        setPoolLength(length);
      }
    }
  }, [productDimensions]);

  useEffect(() => {
    if (productDepth) {
      const match = productDepth.match(/(\d+)'?\s*-\s*(\d+)'?/i);
      if (match) {
        const shallow = parseInt(match[1]);
        const deep = parseInt(match[2]);
        setShallowDepth(shallow);
        setDeepDepth(deep);
        setDepthPoints([
          { position: 0, depth: shallow, id: 'depth-0' },
          { position: 1, depth: deep, id: 'depth-1' },
        ]);
      }
    }
  }, [productDepth]);

  useEffect(() => {
    const loadTextures = async () => {
      try {
        const poolLODs = await loadAllTextureLODs(poolFinish);
        const selectedPaver = paverTypes.find(p => p.id === selectedPaverType);
        const deckLODs = selectedPaver ? await loadAllTextureLODs(selectedPaver.image) : null;
        const copingLODs = await loadAllTextureLODs(poolTextureSapphire);

        setPoolTextureLODs(poolLODs);
        setDeckTextureLODs(deckLODs);
        setCopingTextureLODs(copingLODs);
        setTexturesLoaded(true);
      } catch (error) {
        console.error('Failed to load textures:', error);
      }
    };

    loadTextures();
  }, [poolFinish, selectedPaverType]);

  useEffect(() => {
    const handleResize = () => {
      const lod = getLODLevel();
      setCurrentLOD(lod);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (points.length === 0) {
      const centerX = GRID_SIZE / 2;
      const centerY = GRID_SIZE / 2;
      const widthPx = poolWidth * PIXELS_PER_FOOT;
      const lengthPx = poolLength * PIXELS_PER_FOOT;

      const initialPoints: Point[] = [
        { x: centerX - widthPx / 2, y: centerY - lengthPx / 2, id: 'p1' },
        { x: centerX + widthPx / 2, y: centerY - lengthPx / 2, id: 'p2' },
        { x: centerX + widthPx / 2, y: centerY + lengthPx / 2, id: 'p3' },
        { x: centerX - widthPx / 2, y: centerY + lengthPx / 2, id: 'p4' },
      ];
      setPoints(initialPoints);
    }
  }, [poolWidth, poolLength]);

  const calculatePerimeter = useCallback((pts: Point[]) => {
    if (pts.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter / PIXELS_PER_FOOT;
  }, []);

  const calculateArea = useCallback((pts: Point[]) => {
    if (pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      area += (p1.x * p2.y - p2.x * p1.y);
    }
    area = Math.abs(area) / 2;
    return area / (PIXELS_PER_FOOT * PIXELS_PER_FOOT);
  }, []);

  const calculateDeckArea = useCallback((pts: Point[], deckW: number) => {
    const poolArea = calculateArea(pts);
    const perimeter = calculatePerimeter(pts);
    const deckArea = perimeter * deckW + (Math.PI * deckW * deckW);
    return deckArea;
  }, [calculateArea, calculatePerimeter]);

  const calculateCosts = useCallback((pts: Point[], feats: PoolFeature[], deckW: number, copingW: number) => {
    const poolArea = calculateArea(pts);
    const perimeter = calculatePerimeter(pts);
    const deckArea = calculateDeckArea(pts, deckW);

    const poolCost = poolArea * POOL_COST_PER_SQ_FT;
    const deckCost = deckArea * DECK_COST_PER_SQ_FT;
    const copingCost = perimeter * COPING_COST_PER_LINEAR_FT;
    const featuresCost = feats.reduce((sum, f) => sum + (FEATURE_COSTS[f.type] || 0), 0);

    return {
      poolCost,
      deckCost,
      copingCost,
      featuresCost,
      total: poolCost + deckCost + copingCost + featuresCost,
    };
  }, [calculateArea, calculatePerimeter, calculateDeckArea]);

  useEffect(() => {
    if (onPoolDataChange && points.length > 0) {
      const perimeter = calculatePerimeter(points);
      const area = calculateArea(points);
      const deckArea = calculateDeckArea(points, deckWidth);
      const breakdown = calculateCosts(points, features, deckWidth, copingWidth);

      onPoolDataChange({
        points,
        features,
        perimeter,
        area,
        deckArea,
        totalCost: breakdown.total,
        breakdown,
      });
    }
  }, [points, features, deckWidth, copingWidth, onPoolDataChange, calculatePerimeter, calculateArea, calculateDeckArea, calculateCosts]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i += PIXELS_PER_FOOT) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, GRID_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(GRID_SIZE, i);
      ctx.stroke();
    }

    if (hardscapePoints.length > 2) {
      ctx.fillStyle = 'rgba(156, 163, 175, 0.2)';
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hardscapePoints[0].x, hardscapePoints[0].y);
      for (let i = 1; i < hardscapePoints.length; i++) {
        ctx.lineTo(hardscapePoints[i].x, hardscapePoints[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (fencePoints.length > 1) {
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fencePoints[0].x, fencePoints[0].y);
      for (let i = 1; i < fencePoints.length; i++) {
        ctx.lineTo(fencePoints[i].x, fencePoints[i].y);
      }
      ctx.stroke();
    }

    if (points.length > 2) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    if (points.length > 1) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.lineWidth = deckWidth * PIXELS_PER_FOOT;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    points.forEach((point) => {
      ctx.fillStyle = selectedPoint === point.id ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    hardscapePoints.forEach((point) => {
      ctx.fillStyle = selectedHardscapePoint === point.id ? '#ef4444' : '#9ca3af';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    fencePoints.forEach((point) => {
      ctx.fillStyle = selectedFencePoint === point.id ? '#ef4444' : '#78716c';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    features.forEach((feature) => {
      const isSelected = selectedFeature === feature.id;
      ctx.save();
      ctx.translate(feature.x, feature.y);
      if (feature.angle) {
        ctx.rotate((feature.angle * Math.PI) / 180);
      }

      switch (feature.type) {
        case 'stairs':
          ctx.fillStyle = isSelected ? '#ef4444' : '#8b5cf6';
          ctx.fillRect(-15, -20, 30, 40);
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < (feature.steps || 3); i++) {
            ctx.fillRect(-12, -15 + i * 10, 24, 2);
          }
          break;
        case 'light':
          ctx.fillStyle = isSelected ? '#ef4444' : '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'jet':
          ctx.fillStyle = isSelected ? '#ef4444' : '#06b6d4';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
            ctx.stroke();
          }
          break;
        case 'tree':
          ctx.fillStyle = isSelected ? '#ef4444' : '#10b981';
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-3, 0, 6, 15);
          break;
        case 'fountain':
          ctx.fillStyle = isSelected ? '#ef4444' : '#3b82f6';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(0, -25);
          ctx.stroke();
          break;
        case 'grass':
          ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)';
          ctx.fillRect(-30, -30, 60, 60);
          break;
        case 'home':
          if (feature.roofPoints && feature.roofPoints.length > 2) {
            ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.5)' : 'rgba(120, 113, 108, 0.5)';
            ctx.strokeStyle = isSelected ? '#ef4444' : '#78716c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(feature.roofPoints[0].x - feature.x, feature.roofPoints[0].y - feature.y);
            for (let i = 1; i < feature.roofPoints.length; i++) {
              ctx.lineTo(feature.roofPoints[i].x - feature.x, feature.roofPoints[i].y - feature.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.5)' : 'rgba(120, 113, 108, 0.5)';
            ctx.strokeStyle = isSelected ? '#ef4444' : '#78716c';
            ctx.lineWidth = 2;
            ctx.fillRect(-25, -25, 50, 50);
            ctx.strokeRect(-25, -25, 50, 50);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(-30, -25);
            ctx.lineTo(0, -40);
            ctx.lineTo(30, -25);
            ctx.closePath();
            ctx.fill();
          }
          break;
        case 'shrub':
          ctx.fillStyle = isSelected ? '#ef4444' : '#22c55e';
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'umbrella':
          ctx.fillStyle = isSelected ? '#ef4444' : '#f97316';
          ctx.beginPath();
          ctx.arc(0, -10, 15, 0, Math.PI, true);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(0, 10);
          ctx.stroke();
          break;
        case 'pathway':
          ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(168, 162, 158, 0.3)';
          ctx.strokeStyle = isSelected ? '#ef4444' : '#a8a29e';
          ctx.lineWidth = 2;
          const pathWidth = (feature.width || 4) * PIXELS_PER_FOOT;
          const pathLength = (feature.height || 10) * PIXELS_PER_FOOT;
          ctx.fillRect(-pathWidth / 2, -pathLength / 2, pathWidth, pathLength);
          ctx.strokeRect(-pathWidth / 2, -pathLength / 2, pathWidth, pathLength);
          break;
      }

      ctx.restore();
    });

    if (selectedFeature) {
      const feature = features.find(f => f.id === selectedFeature);
      if (feature && feature.type === 'home' && feature.roofPoints) {
        feature.roofPoints.forEach((point) => {
          ctx.fillStyle = selectedRoofPoint?.pointId === point.id ? '#ef4444' : '#78716c';
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  }, [points, features, selectedPoint, selectedFeature, deckWidth, hardscapePoints, selectedHardscapePoint, fencePoints, selectedFencePoint, selectedRoofPoint]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = GRID_SIZE / rect.width;
    const scaleY = GRID_SIZE / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    if (selectedFeature) {
      const feature = features.find(f => f.id === selectedFeature);
      if (feature && feature.type === 'home' && feature.roofPoints) {
        for (const point of feature.roofPoints) {
          const dx = x - point.x;
          const dy = y - point.y;
          if (Math.sqrt(dx * dx + dy * dy) < 10) {
            setSelectedRoofPoint({ featureId: feature.id, pointId: point.id });
            setIsDragging(true);
            return;
          }
        }
      }
    }

    for (const point of hardscapePoints) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        setSelectedHardscapePoint(point.id);
        setSelectedPoint(null);
        setSelectedFeature(null);
        setSelectedFencePoint(null);
        setIsDragging(true);
        return;
      }
    }

    for (const point of fencePoints) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        setSelectedFencePoint(point.id);
        setSelectedPoint(null);
        setSelectedFeature(null);
        setSelectedHardscapePoint(null);
        setIsDragging(true);
        return;
      }
    }

    for (const point of points) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < 10) {
        setSelectedPoint(point.id);
        setSelectedFeature(null);
        setSelectedHardscapePoint(null);
        setSelectedFencePoint(null);
        setIsDragging(true);
        return;
      }
    }

    for (const feature of features) {
      const dx = x - feature.x;
      const dy = y - feature.y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        setSelectedFeature(feature.id);
        setSelectedPoint(null);
        setSelectedHardscapePoint(null);
        setSelectedFencePoint(null);
        setIsDragging(true);
        return;
      }
    }

    if (currentTool === 'point') {
      const newPoint: Point = {
        x,
        y,
        id: `p${Date.now()}`,
      };
      setPoints([...points, newPoint]);
    } else if (currentTool === 'fence') {
      const newPoint: FencePoint = {
        x,
        y,
        id: `f${Date.now()}`,
      };
      setFencePoints([...fencePoints, newPoint]);
    } else if (currentTool && currentTool !== 'point') {
      const newFeature: PoolFeature = {
        type: currentTool,
        x,
        y,
        id: `feat${Date.now()}`,
        angle: 0,
        steps: currentTool === 'stairs' ? 3 : undefined,
        width: currentTool === 'pathway' ? 4 : currentTool === 'home' ? 20 : undefined,
        height: currentTool === 'pathway' ? 10 : currentTool === 'home' ? 20 : undefined,
        treeType: currentTool === 'tree' ? 'palm' : undefined,
        shrubType: currentTool === 'shrub' ? 'round' : undefined,
        pathwayType: currentTool === 'pathway' ? 'straight' : undefined,
        roofPoints: currentTool === 'home' ? [
          { x: x - 25, y: y - 25, id: `roof${Date.now()}-1` },
          { x: x + 25, y: y - 25, id: `roof${Date.now()}-2` },
          { x: x + 25, y: y + 25, id: `roof${Date.now()}-3` },
          { x: x - 25, y: y + 25, id: `roof${Date.now()}-4` },
        ] : undefined,
      };
      setFeatures([...features, newFeature]);
      setCurrentTool(null);
    } else {
      const newPoint: HardscapePoint = {
        x,
        y,
        id: `h${Date.now()}`,
      };
      setHardscapePoints([...hardscapePoints, newPoint]);
    }

    setSelectedPoint(null);
    setSelectedFeature(null);
    setSelectedHardscapePoint(null);
    setSelectedFencePoint(null);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);

    if (selectedFeature) {
      const feature = features.find(f => f.id === selectedFeature);
      if (feature && feature.type === 'home' && feature.roofPoints) {
        for (const point of feature.roofPoints) {
          const dx = x - point.x;
          const dy = y - point.y;
          if (Math.sqrt(dx * dx + dy * dy) < 15) {
            setSelectedRoofPoint({ featureId: feature.id, pointId: point.id });
            setIsDragging(true);
            return;
          }
        }
      }
    }

    for (const point of hardscapePoints) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        setSelectedHardscapePoint(point.id);
        setSelectedPoint(null);
        setSelectedFeature(null);
        setSelectedFencePoint(null);
        setIsDragging(true);
        return;
      }
    }

    for (const point of fencePoints) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        setSelectedFencePoint(point.id);
        setSelectedPoint(null);
        setSelectedFeature(null);
        setSelectedHardscapePoint(null);
        setIsDragging(true);
        return;
      }
    }

    for (const point of points) {
      const dx = x - point.x;
      const dy = y - point.y;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        setSelectedPoint(point.id);
        setSelectedFeature(null);
        setSelectedHardscapePoint(null);
        setSelectedFencePoint(null);
        setIsDragging(true);
        return;
      }
    }

    for (const feature of features) {
      const dx = x - feature.x;
      const dy = y - feature.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        setSelectedFeature(feature.id);
        setSelectedPoint(null);
        setSelectedHardscapePoint(null);
        setSelectedFencePoint(null);
        setIsDragging(true);
        return;
      }
    }

    if (currentTool === 'point') {
      const newPoint: Point = {
        x,
        y,
        id: `p${Date.now()}`,
      };
      setPoints([...points, newPoint]);
    } else if (currentTool === 'fence') {
      const newPoint: FencePoint = {
        x,
        y,
        id: `f${Date.now()}`,
      };
      setFencePoints([...fencePoints, newPoint]);
    } else if (currentTool && currentTool !== 'point') {
      const newFeature: PoolFeature = {
        type: currentTool,
        x,
        y,
        id: `feat${Date.now()}`,
        angle: 0,
        steps: currentTool === 'stairs' ? 3 : undefined,
        width: currentTool === 'pathway' ? 4 : currentTool === 'home' ? 20 : undefined,
        height: currentTool === 'pathway' ? 10 : currentTool === 'home' ? 20 : undefined,
        treeType: currentTool === 'tree' ? 'palm' : undefined,
        shrubType: currentTool === 'shrub' ? 'round' : undefined,
        pathwayType: currentTool === 'pathway' ? 'straight' : undefined,
        roofPoints: currentTool === 'home' ? [
          { x: x - 25, y: y - 25, id: `roof${Date.now()}-1` },
          { x: x + 25, y: y - 25, id: `roof${Date.now()}-2` },
          { x: x + 25, y: y + 25, id: `roof${Date.now()}-3` },
          { x: x - 25, y: y + 25, id: `roof${Date.now()}-4` },
        ] : undefined,
      };
      setFeatures([...features, newFeature]);
      setCurrentTool(null);
    } else {
      const newPoint: HardscapePoint = {
        x,
        y,
        id: `h${Date.now()}`,
      };
      setHardscapePoints([...hardscapePoints, newPoint]);
    }

    setSelectedPoint(null);
    setSelectedFeature(null);
    setSelectedHardscapePoint(null);
    setSelectedFencePoint(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const { x, y } = getCanvasCoordinates(e);

    if (selectedRoofPoint) {
      setFeatures(features.map(f => {
        if (f.id === selectedRoofPoint.featureId && f.roofPoints) {
          return {
            ...f,
            roofPoints: f.roofPoints.map(p =>
              p.id === selectedRoofPoint.pointId ? { ...p, x, y } : p
            ),
          };
        }
        return f;
      }));
    } else if (selectedPoint) {
      setPoints(points.map(p => (p.id === selectedPoint ? { ...p, x, y } : p)));
    } else if (selectedFeature) {
      setFeatures(features.map(f => (f.id === selectedFeature ? { ...f, x, y } : f)));
    } else if (selectedHardscapePoint) {
      setHardscapePoints(hardscapePoints.map(p => (p.id === selectedHardscapePoint ? { ...p, x, y } : p)));
    } else if (selectedFencePoint) {
      setFencePoints(fencePoints.map(p => (p.id === selectedFencePoint ? { ...p, x, y } : p)));
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDragging) return;

    const { x, y } = getCanvasCoordinates(e);

    if (selectedRoofPoint) {
      setFeatures(features.map(f => {
        if (f.id === selectedRoofPoint.featureId && f.roofPoints) {
          return {
            ...f,
            roofPoints: f.roofPoints.map(p =>
              p.id === selectedRoofPoint.pointId ? { ...p, x, y } : p
            ),
          };
        }
        return f;
      }));
    } else if (selectedPoint) {
      setPoints(points.map(p => (p.id === selectedPoint ? { ...p, x, y } : p)));
    } else if (selectedFeature) {
      setFeatures(features.map(f => (f.id === selectedFeature ? { ...f, x, y } : f)));
    } else if (selectedHardscapePoint) {
      setHardscapePoints(hardscapePoints.map(p => (p.id === selectedHardscapePoint ? { ...p, x, y } : p)));
    } else if (selectedFencePoint) {
      setFencePoints(fencePoints.map(p => (p.id === selectedFencePoint ? { ...p, x, y } : p)));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const deleteSelected = () => {
    if (selectedPoint) {
      setPoints(points.filter(p => p.id !== selectedPoint));
      setSelectedPoint(null);
    } else if (selectedFeature) {
      setFeatures(features.filter(f => f.id !== selectedFeature));
      setSelectedFeature(null);
    } else if (selectedHardscapePoint) {
      setHardscapePoints(hardscapePoints.filter(p => p.id !== selectedHardscapePoint));
      setSelectedHardscapePoint(null);
    } else if (selectedFencePoint) {
      setFencePoints(fencePoints.filter(p => p.id !== selectedFencePoint));
      setSelectedFencePoint(null);
    }
  };

  const addDepthPoint = () => {
    const newPosition = depthPoints.length > 0 ? 0.5 : 0;
    const newDepth = 5;
    const newPoint: DepthPoint = {
      position: newPosition,
      depth: newDepth,
      id: `depth-${Date.now()}`,
    };
    setDepthPoints([...depthPoints, newPoint].sort((a, b) => a.position - b.position));
  };

  const updateDepthPoint = (id: string, field: 'position' | 'depth', value: number) => {
    setDepthPoints(
      depthPoints.map(p => (p.id === id ? { ...p, [field]: value } : p)).sort((a, b) => a.position - b.position)
    );
  };

  const deleteDepthPoint = (id: string) => {
    setDepthPoints(depthPoints.filter(p => p.id !== id));
  };

  const addFenceDoor = () => {
    if (fencePoints.length < 2) return;
    const newDoor: FenceDoor = {
      segmentIndex: 0,
      position: 0.5,
      width: 3,
      id: `door-${Date.now()}`,
    };
    setFenceDoors([...fenceDoors, newDoor]);
  };

  const updateFenceDoor = (id: string, field: keyof FenceDoor, value: number) => {
    setFenceDoors(fenceDoors.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const deleteFenceDoor = (id: string) => {
    setFenceDoors(fenceDoors.filter(d => d.id !== id));
  };

  const perimeter = useMemo(() => calculatePerimeter(points), [points, calculatePerimeter]);
  const area = useMemo(() => calculateArea(points), [points, calculateArea]);
  const deckArea = useMemo(() => calculateDeckArea(points, deckWidth), [points, deckWidth, calculateDeckArea]);
  const costs = useMemo(() => calculateCosts(points, features, deckWidth, copingWidth), [points, features, deckWidth, copingWidth, calculateCosts]);

  const sceneData = useMemo(() => {
    if (!texturesLoaded || !poolTextureLODs || !deckTextureLODs || !copingTextureLODs) {
      return null;
    }

    const poolTexture = getTextureForLOD(poolTextureLODs, currentLOD);
    const deckTexture = getTextureForLOD(deckTextureLODs, currentLOD);
    const copingTexture = getTextureForLOD(copingTextureLODs, currentLOD);

    const textureLibrary = buildTextureLibrary({
      poolFinish: poolTexture,
      deckPaver: deckTexture,
      copingMaterial: copingTexture,
    });

    return poolBuilderToScene(
      {
        points,
        features,
        deckWidth,
        copingWidth,
        depthPoints,
        hardscapePoints,
        fencePoints,
        fenceDoors,
        fenceHeight,
      },
      textureLibrary
    );
  }, [points, features, deckWidth, copingWidth, depthPoints, hardscapePoints, fencePoints, fenceDoors, fenceHeight, texturesLoaded, poolTextureLODs, deckTextureLODs, copingTextureLODs, currentLOD]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pool Dimensions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Width (ft)</Label>
                <Input
                  type="number"
                  value={poolWidth}
                  onChange={(e) => setPoolWidth(Number(e.target.value))}
                  min={8}
                  max={40}
                />
              </div>
              <div>
                <Label>Length (ft)</Label>
                <Input
                  type="number"
                  value={poolLength}
                  onChange={(e) => setPoolLength(Number(e.target.value))}
                  min={12}
                  max={60}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Depth Profile</h3>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <Label>Shallow End (ft)</Label>
                <Input
                  type="number"
                  value={shallowDepth}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setShallowDepth(val);
                    setDepthPoints(prev => prev.map((p, i) => i === 0 ? { ...p, depth: val } : p));
                  }}
                  min={3}
                  max={6}
                  step={0.5}
                />
              </div>
              <div>
                <Label>Deep End (ft)</Label>
                <Input
                  type="number"
                  value={deepDepth}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDeepDepth(val);
                    setDepthPoints(prev => prev.map((p, i) => i === prev.length - 1 ? { ...p, depth: val } : p));
                  }}
                  min={4}
                  max={12}
                  step={0.5}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={currentTool === 'point' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'point' ? null : 'point')}
            >
              <Move className="w-4 h-4 mr-2" />
              Add Point
            </Button>
            <Button
              variant={currentTool === 'stairs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'stairs' ? null : 'stairs')}
            >
              <Box className="w-4 h-4 mr-2" />
              Stairs
            </Button>
            <Button
              variant={currentTool === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'light' ? null : 'light')}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Light
            </Button>
            <Button
              variant={currentTool === 'jet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'jet' ? null : 'jet')}
            >
              <Waves className="w-4 h-4 mr-2" />
              Jet
            </Button>
            <Button
              variant={currentTool === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'tree' ? null : 'tree')}
            >
              <Trees className="w-4 h-4 mr-2" />
              Tree
            </Button>
            <Button
              variant={currentTool === 'shrub' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'shrub' ? null : 'shrub')}
            >
              <Flower2 className="w-4 h-4 mr-2" />
              Shrub
            </Button>
            <Button
              variant={currentTool === 'fountain' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'fountain' ? null : 'fountain')}
            >
              <Droplets className="w-4 h-4 mr-2" />
              Fountain
            </Button>
            <Button
              variant={currentTool === 'home' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'home' ? null : 'home')}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant={currentTool === 'fence' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool(currentTool === 'fence' ? null : 'fence')}
            >
              <Ruler className="w-4 h-4 mr-2" />
              Fence
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelected}
              disabled={!selectedPoint && !selectedFeature && !selectedHardscapePoint && !selectedFencePoint}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">2D Designer</h3>
          <canvas
            ref={canvasRef}
            width={GRID_SIZE}
            height={GRID_SIZE}
            className="border border-gray-300 rounded-lg w-full touch-none"
            style={{ touchAction: 'none' }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleCanvasTouchStart}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>Click to add points or features. Drag to move them.</p>
            <p>Pool perimeter: {perimeter.toFixed(1)} ft</p>
            <p>Pool area: {area.toFixed(1)} sq ft</p>
            <p>Deck area: {deckArea.toFixed(1)} sq ft</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">3D Viewer</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: GRID_SIZE }}>
            {sceneData && <UnifiedPoolVisualizer sceneData={sceneData} />}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="deck">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="deck">Deck</TabsTrigger>
            <TabsTrigger value="coping">Coping</TabsTrigger>
            <TabsTrigger value="finish">Finish</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="depth">Depth</TabsTrigger>
          </TabsList>

          <TabsContent value="deck" className="space-y-4">
            <div>
              <Label>Deck Width (ft)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeckWidth(Math.max(2, deckWidth - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={deckWidth}
                  onChange={(e) => setDeckWidth(Number(e.target.value))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeckWidth(Math.min(10, deckWidth + 1))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Paver Type</Label>
              <Select value={selectedPaverType} onValueChange={setSelectedPaverType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paverTypes.map((paver) => (
                    <SelectItem key={paver.id} value={paver.id}>
                      {paver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TextureBuilder
              onTextureChange={(config: TextureConfig) => {
                console.log('Deck texture config:', config);
              }}
            />
          </TabsContent>

          <TabsContent value="coping" className="space-y-4">
            <div>
              <Label>Coping Width (ft)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCopingWidth(Math.max(0.5, copingWidth - 0.5))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={copingWidth}
                  onChange={(e) => setCopingWidth(Number(e.target.value))}
                  className="w-20 text-center"
                  step="0.5"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCopingWidth(Math.min(3, copingWidth + 0.5))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Coping Material</Label>
              <Select value={copingMaterial} onValueChange={setCopingMaterial}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travertine">Travertine</SelectItem>
                  <SelectItem value="limestone">Limestone</SelectItem>
                  <SelectItem value="granite">Granite</SelectItem>
                  <SelectItem value="concrete">Concrete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="finish" className="space-y-4">
            <div>
              <Label>Pool Finish</Label>
              <Select value={poolFinish} onValueChange={setPoolFinish}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={aquamarineFinish}>Aquamarine</SelectItem>
                  <SelectItem value={poolTextureSapphire}>Sapphire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            {selectedFeature && (
              <div className="space-y-4">
                <h4 className="font-semibold">Selected Feature</h4>
                {(() => {
                  const feature = features.find(f => f.id === selectedFeature);
                  if (!feature) return null;

                  return (
                    <div className="space-y-2">
                      <div>
                        <Label>Type</Label>
                        <Badge>{feature.type}</Badge>
                      </div>

                      {feature.type === 'stairs' && (
                        <div>
                          <Label>Number of Steps</Label>
                          <Input
                            type="number"
                            value={feature.steps || 3}
                            onChange={(e) => {
                              setFeatures(features.map(f =>
                                f.id === selectedFeature ? { ...f, steps: Number(e.target.value) } : f
                              ));
                            }}
                            min={2}
                            max={8}
                          />
                        </div>
                      )}

                      {(feature.type === 'home' || feature.type === 'pathway') && (
                        <>
                          <div>
                            <Label>Width (ft)</Label>
                            <Input
                              type="number"
                              value={feature.width || 10}
                              onChange={(e) => {
                                setFeatures(features.map(f =>
                                  f.id === selectedFeature ? { ...f, width: Number(e.target.value) } : f
                                ));
                              }}
                              min={4}
                              max={50}
                            />
                          </div>
                          <div>
                            <Label>Height (ft)</Label>
                            <Input
                              type="number"
                              value={feature.height || 10}
                              onChange={(e) => {
                                setFeatures(features.map(f =>
                                  f.id === selectedFeature ? { ...f, height: Number(e.target.value) } : f
                                ));
                              }}
                              min={4}
                              max={50}
                            />
                          </div>
                        </>
                      )}

                      {feature.type === 'tree' && (
                        <div>
                          <Label>Tree Type</Label>
                          <Select
                            value={feature.treeType || 'palm'}
                            onValueChange={(value) => {
                              setFeatures(features.map(f =>
                                f.id === selectedFeature ? { ...f, treeType: value as any } : f
                              ));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="palm">Palm</SelectItem>
                              <SelectItem value="oak">Oak</SelectItem>
                              <SelectItem value="pine">Pine</SelectItem>
                              <SelectItem value="willow">Willow</SelectItem>
                              <SelectItem value="maple">Maple</SelectItem>
                              <SelectItem value="cypress">Cypress</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {feature.type === 'shrub' && (
                        <div>
                          <Label>Shrub Type</Label>
                          <Select
                            value={feature.shrubType || 'round'}
                            onValueChange={(value) => {
                              setFeatures(features.map(f =>
                                f.id === selectedFeature ? { ...f, shrubType: value as any } : f
                              ));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="round">Round</SelectItem>
                              <SelectItem value="flowering">Flowering</SelectItem>
                              <SelectItem value="hedge">Hedge</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label>Rotation (degrees)</Label>
                        <Input
                          type="number"
                          value={feature.angle || 0}
                          onChange={(e) => {
                            setFeatures(features.map(f =>
                              f.id === selectedFeature ? { ...f, angle: Number(e.target.value) } : f
                            ));
                          }}
                          min={0}
                          max={360}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">All Features</h4>
              <div className="space-y-2">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedFeature(feature.id)}
                  >
                    <span className="capitalize">{feature.type}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFeatures(features.filter(f => f.id !== feature.id));
                        if (selectedFeature === feature.id) {
                          setSelectedFeature(null);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="depth" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Depth Profile</h4>
              <Button onClick={addDepthPoint} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Point
              </Button>
            </div>

            <div className="space-y-2">
              {depthPoints.map((point) => (
                <div key={point.id} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1">
                    <Label className="text-xs">Position (0-1)</Label>
                    <Input
                      type="number"
                      value={point.position}
                      onChange={(e) => updateDepthPoint(point.id, 'position', Number(e.target.value))}
                      min={0}
                      max={1}
                      step={0.1}
                      className="h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Depth (ft)</Label>
                    <Input
                      type="number"
                      value={point.depth}
                      onChange={(e) => updateDepthPoint(point.id, 'depth', Number(e.target.value))}
                      min={3}
                      max={12}
                      step={0.5}
                      className="h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDepthPoint(point.id)}
                    disabled={depthPoints.length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Pool Construction:</span>
            <span className="font-semibold">${costs.poolCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Deck:</span>
            <span className="font-semibold">${costs.deckCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Coping:</span>
            <span className="font-semibold">${costs.copingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Features:</span>
            <span className="font-semibold">${costs.featuresCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-bold text-lg">
            <span>Total:</span>
            <span>${costs.total.toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
