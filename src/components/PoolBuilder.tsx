import * as React from 'react';
const {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback
} = React;
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Minus, Plus, Trash2, Move, Lightbulb, Waves, Ruler, Home, Trees, Flower2, Droplets, Box, PenTool, Shapes, MousePointer2, FolderOpen } from 'lucide-react';
import { ShapePanel } from './poolBuilder/ShapePanel';
import { DesignerToolPanel } from './poolBuilder/DesignerToolPanel';
import { ProjectManager, setAutoSave, getAutoSave } from './poolBuilder/ProjectManager';
import { SplinePointEditor } from './poolBuilder/SplinePointEditor';
import { SplineDrawingToolbar } from './poolBuilder/SplineDrawingToolbar';
import { PointCoordinateEditor } from './poolBuilder/PointCoordinateEditor';
import { SplineDrawTutorial } from './poolBuilder/SplineDrawTutorial';
import { snapToGridRelative, calculateProjectCost, getDeckPricePerSqFt, getCopingPricePerSqFt, FEATURE_COSTS as CENTRALIZED_FEATURE_COSTS } from '@/utils/poolBuilderPricing';
import { ShapeRepository } from './ShapeRepository';
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.webp';
import poolTextureSapphire from '@/assets/textures/pool-texture-sapphire.webp';
import { paverTypes } from '@/data/paverData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadAllTextureLODs, getTextureForLOD, getLODLevel, type TextureLODSet } from '@/utils/textureLOD';
import { UnifiedPoolVisualizer } from './UnifiedPoolVisualizer';
import { poolBuilderToScene, buildTextureLibrary } from './scene3d/PoolBuilderConverter';
import { TextureBuilder, type TextureConfig } from './TextureBuilder';
import { computeNetPaverArea, isNonPaverSurface } from '@/utils/paverAreaLogic';

interface Point {
  x: number;
  y: number;
  id: string;
  curveType?: 'linear' | 'curve' | 'arc' | 'freeform';
}
interface RoofPoint {
  x: number;
  y: number;
  id: string;
}
interface PoolFeature {
  type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home' | 'shrub' | 'umbrella' | 'fence' | 'pathway'
  // New pool features
  | 'pool-seat' | 'pool-wall' | 'diving-board' | 'slide' | 'pool-cover' | 'pool-accessory'
  // New landscape features
  | 'rock' | 'boulder' | 'hedge-row' | 'plant-row' | 'landscape-light' | 'edging' | 'grass-region'
  // New water features
  | 'pond' | 'stream' | 'waterfall' | 'jumping-jet' | 'sprinkler' | 'water-curtain';
  x: number;
  y: number;
  id: string;
  angle?: number;
  steps?: number;
  wallSegment?: number;
  wallPosition?: number;
  width?: number;
  height?: number;
  length?: number;
  treeType?: 'palm' | 'oak' | 'pine' | 'willow' | 'maple' | 'cypress';
  shrubType?: 'round' | 'flowering' | 'hedge';
  pathwayType?: 'straight' | 'curved' | 'circular';
  radius?: number;
  roofPoints?: RoofPoint[];
  color?: string;
  // New feature properties
  seatWidth?: number;
  seatDepth?: number;
  wallHeight?: number;
  rockSize?: 'small' | 'medium' | 'large';
  lightColor?: string;
  lightIntensity?: number;
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
  initialDimensions?: string; // e.g., "16' × 40'"
  initialDepth?: string; // e.g., "3'9\" - 8'6\""
  startInDrawMode?: boolean; // Start with empty terrain + spline drawing mode
  externalTool?: string | null; // Tool ID from external toolbar
  externalTab?: string | null; // Tab ID from external toolbar (pool, materials, features, etc.)
  hideInternalTabs?: boolean; // Hide internal tab navigation when controlled externally
  onToolUsed?: () => void; // Callback when tool is used
  onExternalUpdate?: {
    points?: Array<{ x: number; y: number; id: string }>;
    depthPoints?: Array<{ position: number; depth: number; id: string }>;
    hardscapePoints?: Array<{ x: number; y: number; id: string }>;
    features?: Array<{ type: string; x: number; y: number; id: string; angle?: number }>;
    additionalPools?: any[];
  } | null; // External state changes from 3D viewer
  onPoolDataChange?: (data: {
    points: Point[];
    depthPoints: DepthPoint[];
    features: PoolFeature[];
    perimeter: number;
    area: number;
    deckArea: number;
    totalCost: number;
    scale: number; // pixels per foot for 3D conversion
    hardscapePoints?: HardscapePoint[]; // Deck/patio shape points
    additionalPools?: Array<{
      id: string;
      type: 'pool' | 'spa';
      points: Point[];
      shape: 'rectangle' | 'kidney' | 'freeform';
      featureType?: 'regular' | 'spillover-spa' | 'tanning-ledge';
      intersectsWith?: string;
      perimeterPosition?: number;
      isPerimeterSnapped?: boolean;
      isMerged?: boolean;
      spilloverEdges?: number[]; // Edge indices where water spills over (no coping)
    }>;
    breakdown: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      featuresCost: number;
      total: number;
    };
  }) => void;
}

// Helper function to shade colors
const shadeColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};
export function PoolBuilder({
  initialDimensions,
  initialDepth,
  startInDrawMode = true,
  externalTool,
  externalTab,
  hideInternalTabs = false,
  onToolUsed,
  onExternalUpdate,
  onPoolDataChange
}: PoolBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // LOD texture system - stores all quality levels
  const textureLODsRef = useRef<TextureLODSet | null>(null);
  const getShapePoints = (shape: 'rectangle' | 'kidney' | 'freeform'): Point[] => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    // Standard notation: 15ft width (X) × 35ft length (Y)
    const poolWidth = 15 * scale; // Width (X-axis, side to side)
    const poolLength = 35 * scale; // Length (Y-axis, front to back)

    switch (shape) {
      case 'rectangle':
        return [{
          x: centerX - poolWidth / 2,
          y: centerY - poolLength / 2,
          id: '1'
        }, {
          x: centerX + poolWidth / 2,
          y: centerY - poolLength / 2,
          id: '2'
        }, {
          x: centerX + poolWidth / 2,
          y: centerY + poolLength / 2,
          id: '3'
        }, {
          x: centerX - poolWidth / 2,
          y: centerY + poolLength / 2,
          id: '4'
        }];
      case 'kidney':
        return [{
          x: centerX - poolWidth / 2,
          y: centerY - poolLength / 3,
          id: '1'
        }, {
          x: centerX - poolWidth / 4,
          y: centerY - poolLength / 2,
          id: '2'
        }, {
          x: centerX + poolWidth / 4,
          y: centerY - poolLength / 2.5,
          id: '3'
        }, {
          x: centerX + poolWidth / 2,
          y: centerY - poolLength / 6,
          id: '4'
        }, {
          x: centerX + poolWidth / 2.5,
          y: centerY + poolLength / 4,
          id: '5'
        }, {
          x: centerX + poolWidth / 6,
          y: centerY + poolLength / 2,
          id: '6'
        }, {
          x: centerX - poolWidth / 4,
          y: centerY + poolLength / 2.5,
          id: '7'
        }, {
          x: centerX - poolWidth / 2,
          y: centerY + poolLength / 6,
          id: '8'
        }];
      case 'freeform':
        return [{
          x: centerX - poolWidth / 2,
          y: centerY - poolLength / 2.5,
          id: '1'
        }, {
          x: centerX - poolWidth / 6,
          y: centerY - poolLength / 2,
          id: '2'
        }, {
          x: centerX + poolWidth / 3,
          y: centerY - poolLength / 3,
          id: '3'
        }, {
          x: centerX + poolWidth / 2,
          y: centerY + poolLength / 6,
          id: '4'
        }, {
          x: centerX + poolWidth / 4,
          y: centerY + poolLength / 2,
          id: '5'
        }, {
          x: centerX - poolWidth / 6,
          y: centerY + poolLength / 2.2,
          id: '6'
        }, {
          x: centerX - poolWidth / 2,
          y: centerY + poolLength / 4,
          id: '7'
        }];
    }
  };

  // Generate rectangular hardscape deck measured from coping edge outward
  // North = 3ft, South = 5ft, East/West = use deckDistanceInFeet
  const generateHardscapeFromPool = (poolPoints: Point[], deckDistanceInFeet: number = 3): HardscapePoint[] => {
    // Calculate pool bounding box
    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));

    // Calculate pool dimensions in feet
    const poolWidthFeet = (maxX - minX) / scale;
    const poolLengthFeet = (maxY - minY) / scale;

    // Add coping thickness to pool dimensions (coping is measured in pixels, convert to feet)
    const copingThicknessFeet = copingThickness / scale;
    const totalCopingOnBothSides = copingThicknessFeet * 2; // both sides of pool

    // Deck distances: North (top) = 3ft, South (bottom) = 5ft, East/West = deckDistanceInFeet
    const deckNorth = 3; // 3 ft north of coping
    const deckSouth = 5; // 5 ft south of coping
    const deckEastWest = deckDistanceInFeet; // Use passed value for east/west

    // Calculate required deck dimensions
    const requiredDeckWidth = poolWidthFeet + totalCopingOnBothSides + deckEastWest * 2;
    const requiredDeckLength = poolLengthFeet + totalCopingOnBothSides + deckNorth + deckSouth;

    // Use the larger of default minimum (38x18) or calculated dimensions
    const deckWidth = Math.max(defaultDeckWidth, requiredDeckWidth);
    const deckLength = Math.max(defaultDeckLength, requiredDeckLength);

    // Calculate pool center
    const poolCenterX = (minX + maxX) / 2;
    const poolCenterY = (minY + maxY) / 2;

    // Convert deck dimensions to pixels
    const deckWidthPixels = deckWidth * scale;

    // Calculate asymmetric deck positioning
    // North edge is 3ft from coping, south edge is 5ft from coping
    const poolTopY = minY;
    const poolBottomY = maxY;
    const deckTopY = poolTopY - deckNorth * scale - copingThicknessFeet * scale;
    const deckBottomY = poolBottomY + deckSouth * scale + copingThicknessFeet * scale;

    // Generate rectangular deck with asymmetric north/south distances
    const hardscapePoints: HardscapePoint[] = [{
      x: poolCenterX - deckWidthPixels / 2,
      y: deckTopY,
      id: 'h1'
    },
    // Top-left (North)
    {
      x: poolCenterX + deckWidthPixels / 2,
      y: deckTopY,
      id: 'h2'
    },
    // Top-right (North)
    {
      x: poolCenterX + deckWidthPixels / 2,
      y: deckBottomY,
      id: 'h3'
    },
    // Bottom-right (South)
    {
      x: poolCenterX - deckWidthPixels / 2,
      y: deckBottomY,
      id: 'h4'
    } // Bottom-left (South)
    ];
    return hardscapePoints;
  };
  const [points, setPoints] = useState<Point[]>([]);
  const [hardscapePoints, setHardscapePoints] = useState<HardscapePoint[]>([]);
  const [additionalDeckPoints, setAdditionalDeckPoints] = useState<Record<string, HardscapePoint[]>>({});
  const [selectedDeckId, setSelectedDeckId] = useState<string>('main');
  const [deckOffsetsById, setDeckOffsetsById] = useState<Record<string, number>>({ main: 3 });
  const [fencePoints, setFencePoints] = useState<FencePoint[]>([]);
  const [fenceDoors, setFenceDoors] = useState<FenceDoor[]>([]);
  const [features, setFeatures] = useState<PoolFeature[]>([]);
  const [selectedHardscapePoint, setSelectedHardscapePoint] = useState<string | null>(null);
  const [isDraggingHardscape, setIsDraggingHardscape] = useState(false);
  const [selectedFencePoint, setSelectedFencePoint] = useState<string | null>(null);
  const [isDraggingFence, setIsDraggingFence] = useState(false);
  const [selectedFenceDoor, setSelectedFenceDoor] = useState<string | null>(null);
  const [smoothFence, setSmoothFence] = useState(false);
  const [fenceHeight, setFenceHeight] = useState(6); // fence height in feet
  const [fenceAddMode, setFenceAddMode] = useState(false); // mode to add fence anchors on click
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [smoothCorners, setSmoothCorners] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'rotate' | 'zoom' | 'add' | 'draw-pool' | 'draw-deck' | 'select-deck' | null>('select');
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  // Zoom constants (single source of truth)
  const WHEEL_STEP = 0.06;
  const PINCH_STEP = 0.025;
  const ZOOM_DEADZONE = 2;
  const MOMENTUM_MS = 120;
  const MAX_FRAME_STEP = 0.08;

  const wheelZoomRafRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef(0);
  const lastWheelDirRef = useRef(0);
  const momentumLockUntilRef = useRef(0);
  const pendingZoomRef = useRef<{ delta: number; clientX: number; clientY: number } | null>(null);
  const [deckOffset, setDeckOffset] = useState(3); // Main deck offset from coping edge in feet (minimum 3ft)
  const [snapPoint, setSnapPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [scale, setScale] = useState(10); // pixels per foot - reduced for larger canvas
  const [defaultDeckWidth] = useState(18); // Default deck width in feet
  const [defaultDeckLength] = useState(38); // Default deck length in feet
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showControls, setShowControls] = useState(true);
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [pendingFeature, setPendingFeature] = useState<'jet' | null>(null);
  // V2 placement modes
  const [pendingLandscapePlacement, setPendingLandscapePlacement] = useState<PoolFeature['type'] | null>(null);
  const [pendingPoolFeaturePlacement, setPendingPoolFeaturePlacement] = useState<PoolFeature['type'] | null>(null);
  const [mouseWorldPos, setMouseWorldPos] = useState<{ x: number; y: number } | null>(null);
  const [cursorPos, setCursorPos] = useState({
    x: 0,
    y: 0
  });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [draggingFeature, setDraggingFeature] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [selectedRoofPoint, setSelectedRoofPoint] = useState<string | null>(null);
  const [isDraggingRoof, setIsDraggingRoof] = useState(false);
  const [selectedPaverId, setSelectedPaverId] = useState('appian-adobe');
  const [selectedCopingId, setSelectedCopingId] = useState('appian-adobe');
  const [selectedFinishId, setSelectedFinishId] = useState('aquamarine');
  const [paverSize] = useState(24); // Larger paver size for better visibility (24 inches / 2 feet)
  const [poolShape, setPoolShape] = useState<'rectangle' | 'kidney' | 'freeform'>('freeform');
  const [copingThickness, setCopingThickness] = useState(10); // Adjusted for new scale
  const [depthPoints, setDepthPoints] = useState<DepthPoint[]>([{
    position: 0,
    depth: 3.6,
    id: 'd1'
  }, {
    position: 0.33,
    depth: 4.6,
    id: 'd2'
  }, {
    position: 0.67,
    depth: 5.6,
    id: 'd3'
  }, {
    position: 1,
    depth: 6.6,
    id: 'd4'
  }]);
  const [selectedDepthPoint, setSelectedDepthPoint] = useState<string | null>(null);
  const [isDraggingDepth, setIsDraggingDepth] = useState(false);
  const [showDepthEditor, setShowDepthEditor] = useState(false);
  const [gridSnap, setGridSnap] = useState(true); // AutoCAD-like grid snapping
  const [snapSize, setSnapSize] = useState(12); // 12 inches snap (1 foot) - exact foot values
  const [activeTab, setActiveTab] = useState('pool');
  const [showFenceEditor, setShowFenceEditor] = useState(false);
  const [customTextures, setCustomTextures] = useState<TextureConfig[]>([]);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | undefined>();


  // Spline drawing state for custom pool shapes
  interface SplinePoint extends Point {
    curveType: 'linear' | 'curve' | 'arc' | 'freeform';
    handleIn?: {
      x: number;
      y: number;
    };
    handleOut?: {
      x: number;
      y: number;
    };
  }
  const [splineDrawing, setSplineDrawing] = useState<{
    isActive: boolean;
    points: SplinePoint[];
    currentCurveType: 'linear' | 'curve' | 'arc' | 'freeform';
  }>({
    isActive: false,
    points: [],
    currentCurveType: 'linear'
  });

  // Selecting / dragging an in-progress spline point while still in draw mode
  const [selectedDrawPointId, setSelectedDrawPointId] = useState<string | null>(null);
  const [draggingDrawPointId, setDraggingDrawPointId] = useState<string | null>(null);

  // Symmetry mode for spline drawing
  const [symmetryMode, setSymmetryMode] = useState<{
    enabled: boolean;
    axes: 'horizontal' | 'vertical' | 'both';
    snapDistance: number; // pixels to snap
  }>({
    enabled: true,
    axes: 'both',
    snapDistance: 15
  });

  // Multi-pool support
  interface MergePoint {
    poolPointIndex: number; // Index on the additional pool where merge starts/ends
    mainPoolPosition: number; // 0-1 position on main pool perimeter
    id: string;
  }
  interface PoolShape {
    id: string;
    type: 'pool' | 'spa';
    points: Point[];
    shape: 'rectangle' | 'kidney' | 'freeform';
    featureType?: 'regular' | 'spillover-spa' | 'tanning-ledge'; // Type when overlapping
    intersectsWith?: string; // ID of the pool it intersects with (main pool = 'main')
    perimeterPosition?: number; // 0-1 position along main pool perimeter (for snapped features)
    isPerimeterSnapped?: boolean; // Whether this pool snaps to main pool perimeter
    mergePoints?: MergePoint[]; // Points where this pool merges with main pool (for integrated features)
    isMerged?: boolean; // Whether water bodies are merged (coping removed at intersection)
    spilloverEdges?: number[]; // Edge indices that are spillover (water flows over, no coping)
  }
  const [additionalPools, setAdditionalPools] = useState<PoolShape[]>([]);
  const [selectedAdditionalPool, setSelectedAdditionalPool] = useState<string | null>(null);
  const [draggingAdditionalPool, setDraggingAdditionalPool] = useState(false);
  const [draggingAdditionalPoolPoint, setDraggingAdditionalPoolPoint] = useState<{
    poolId: string;
    pointId: string;
  } | null>(null);

  // Pool type dialog state (for when new pool intersects deck)
  const [pendingPoolData, setPendingPoolData] = useState<{
    points: Point[];
    intersectsWith: string;
  } | null>(null);
  const [showPoolTypeDialog, setShowPoolTypeDialog] = useState(false);

  // Deck dialog state (for asking about deck around new water body outside existing deck)
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [pendingDeckData, setPendingDeckData] = useState<{
    poolId: string;
    deckPoints: HardscapePoint[];
  } | null>(null);

  // Perimeter anchor mode - for positioning spa/tanning ledge connection point
  type PerimeterAnchorMode = {
    isActive: boolean;
    featureType: 'spillover-spa' | 'tanning-ledge' | null;
    perimeterPosition: number; // 0-1 along pool perimeter
    isFixed: boolean; // true when user has clicked to fix position
  };
  const [perimeterAnchorMode, setPerimeterAnchorMode] = useState<PerimeterAnchorMode>({
    isActive: false,
    featureType: null,
    perimeterPosition: 0.25,
    isFixed: false
  });

  // ─── Auto-Save: persist every meaningful change ───
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getSerializableState = useCallback(() => ({
    points, hardscapePoints, additionalDeckPoints, selectedDeckId, deckOffsetsById,
    features, depthPoints, poolShape, selectedPaverId, selectedCopingId, selectedFinishId,
    deckOffset, additionalPools, fencePoints, fenceDoors, fenceHeight, smoothFence,
    scale, zoomLevel, gridSnap, snapSize, customTextures,
  }), [points, hardscapePoints, additionalDeckPoints, selectedDeckId, deckOffsetsById,
    features, depthPoints, poolShape, selectedPaverId, selectedCopingId, selectedFinishId,
    deckOffset, additionalPools, fencePoints, fenceDoors, fenceHeight, smoothFence,
    scale, zoomLevel, gridSnap, snapSize, customTextures]);

  // Handle external updates from 3D viewer (bidirectional sync)
  const isExternalUpdateRef = useRef(false);
  const lastExternalUpdateRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!onExternalUpdate) return;
    
    // Deduplicate by serializing
    const updateKey = JSON.stringify(onExternalUpdate);
    if (updateKey === lastExternalUpdateRef.current) return;
    lastExternalUpdateRef.current = updateKey;
    
    isExternalUpdateRef.current = true;
    
    if (onExternalUpdate.points && onExternalUpdate.points.length >= 3) {
      setPoints(onExternalUpdate.points);
    }
    if (onExternalUpdate.depthPoints && onExternalUpdate.depthPoints.length >= 2) {
      setDepthPoints(onExternalUpdate.depthPoints);
    }
    if (onExternalUpdate.hardscapePoints && onExternalUpdate.hardscapePoints.length >= 3) {
      setHardscapePoints(onExternalUpdate.hardscapePoints);
    }
    
    // Clear flag after a frame to allow normal updates
    requestAnimationFrame(() => {
      isExternalUpdateRef.current = false;
    });
  }, [onExternalUpdate]);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (points.length > 0) {
        setAutoSave(getSerializableState());
        setLastAutoSaved(new Date().toISOString());
      }
    }, 2000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [getSerializableState, points]);

  // ─── Escape key to cancel placement modes ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingLandscapePlacement) setPendingLandscapePlacement(null);
        if (pendingPoolFeaturePlacement) setPendingPoolFeaturePlacement(null);
        if (pendingFeature) setPendingFeature(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingLandscapePlacement, pendingPoolFeaturePlacement, pendingFeature]);

  useEffect(() => {
    return () => {
      if (wheelZoomRafRef.current !== null) cancelAnimationFrame(wheelZoomRafRef.current);
    };
  }, []);

  // Native wheel listener for passive:false (React onWheel can't preventDefault reliably)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // Manual zoom only: block wheel/trackpad/pinch zoom on canvas
      e.preventDefault();
      e.stopPropagation();
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleNativeWheel);
  }, [canvasSize]);

  // ─── Load auto-save on mount ───
  const loadProjectState = useCallback((data: any) => {
    if (!data) return;
    if (data.points) setPoints(data.points);
    if (data.hardscapePoints) setHardscapePoints(data.hardscapePoints);
    if (data.additionalDeckPoints) setAdditionalDeckPoints(data.additionalDeckPoints);
    if (data.selectedDeckId) setSelectedDeckId(data.selectedDeckId);
    if (data.deckOffsetsById) setDeckOffsetsById(data.deckOffsetsById);
    if (data.features) setFeatures(data.features);
    if (data.depthPoints) setDepthPoints(data.depthPoints);
    if (data.poolShape) setPoolShape(data.poolShape);
    if (data.selectedPaverId) setSelectedPaverId(data.selectedPaverId);
    if (data.selectedCopingId) setSelectedCopingId(data.selectedCopingId);
    if (data.selectedFinishId) setSelectedFinishId(data.selectedFinishId);
    if (data.deckOffset) setDeckOffset(data.deckOffset);
    if (data.additionalPools) setAdditionalPools(data.additionalPools);
    if (data.fencePoints) setFencePoints(data.fencePoints);
    if (data.fenceDoors) setFenceDoors(data.fenceDoors);
    if (data.fenceHeight) setFenceHeight(data.fenceHeight);
    if (data.smoothFence != null) setSmoothFence(data.smoothFence);
    if (data.scale) setScale(data.scale);
    // Always start at 100% zoom when loading
    setZoomLevel(1);
    if (data.gridSnap != null) setGridSnap(data.gridSnap);
    if (data.snapSize) setSnapSize(data.snapSize);
    if (data.customTextures) setCustomTextures(data.customTextures);
  }, []);

  useEffect(() => {
    const saved = getAutoSave();
    if (saved?.data && saved.data.points?.length > 0) {
      loadProjectState(saved.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const isPointInPolygon = useCallback((x: number, y: number, polygon: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;
      if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }, []);

  // Check if two polygons intersect (overlap)
  const doPolygonsIntersect = useCallback((poly1: Point[], poly2: Point[]): boolean => {
    // Check if any point of poly1 is inside poly2
    for (const p of poly1) {
      if (isPointInPolygon(p.x, p.y, poly2)) return true;
    }
    // Check if any point of poly2 is inside poly1
    for (const p of poly2) {
      if (isPointInPolygon(p.x, p.y, poly1)) return true;
    }
    // Check if edges intersect
    for (let i = 0; i < poly1.length; i++) {
      const a1 = poly1[i];
      const a2 = poly1[(i + 1) % poly1.length];
      for (let j = 0; j < poly2.length; j++) {
        const b1 = poly2[j];
        const b2 = poly2[(j + 1) % poly2.length];
        if (doLinesIntersect(a1, a2, b1, b2)) return true;
      }
    }
    return false;
  }, [isPointInPolygon]);

  // Line segment intersection check
  const doLinesIntersect = (a1: Point, a2: Point, b1: Point, b2: Point): boolean => {
    const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
    if (det === 0) return false;
    const lambda = ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det;
    const gamma = ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  };

  // Get line intersection point
  const getLineIntersection = (a1: Point, a2: Point, b1: Point, b2: Point): Point | null => {
    const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
    if (Math.abs(det) < 0.0001) return null;
    const lambda = ((b2.y - b1.y) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.y - a1.y)) / det;
    const gamma = ((a1.y - a2.y) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.y - a1.y)) / det;
    if (lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1) {
      return {
        x: a1.x + lambda * (a2.x - a1.x),
        y: a1.y + lambda * (a2.y - a1.y),
        id: `intersection-${Date.now()}`
      };
    }
    return null;
  };

  // Find intersection points between two polygons and compute merged water body
  const computeMergedWaterBody = useCallback((mainPoolPoints: Point[], spaPoints: Point[]): {
    mergedPolygon: Point[];
    mergePoints: {
      mainIndex: number;
      spaIndex: number;
      point: Point;
    }[];
    spaEdgesOutsideMain: {
      startIdx: number;
      endIdx: number;
    }[]; // Edges of spa outside main pool (need coping)
  } | null => {
    if (mainPoolPoints.length < 3 || spaPoints.length < 3) return null;
    const intersections: {
      mainSegIdx: number;
      spaSegIdx: number;
      point: Point;
      mainT: number;
      spaT: number;
    }[] = [];

    // Find all intersection points between the two polygons
    for (let i = 0; i < mainPoolPoints.length; i++) {
      const m1 = mainPoolPoints[i];
      const m2 = mainPoolPoints[(i + 1) % mainPoolPoints.length];
      for (let j = 0; j < spaPoints.length; j++) {
        const s1 = spaPoints[j];
        const s2 = spaPoints[(j + 1) % spaPoints.length];
        const det = (m2.x - m1.x) * (s2.y - s1.y) - (s2.x - s1.x) * (m2.y - m1.y);
        if (Math.abs(det) < 0.0001) continue;
        const mainT = ((s2.y - s1.y) * (s2.x - m1.x) + (s1.x - s2.x) * (s2.y - m1.y)) / det;
        const spaT = ((m1.y - m2.y) * (s2.x - m1.x) + (m2.x - m1.x) * (s2.y - m1.y)) / det;
        if (mainT > 0.001 && mainT < 0.999 && spaT > 0.001 && spaT < 0.999) {
          intersections.push({
            mainSegIdx: i,
            spaSegIdx: j,
            point: {
              x: m1.x + mainT * (m2.x - m1.x),
              y: m1.y + mainT * (m2.y - m1.y),
              id: `merge-${i}-${j}`
            },
            mainT,
            spaT
          });
        }
      }
    }
    if (intersections.length < 2) return null; // Need at least 2 intersection points to merge

    // Sort intersections by spa segment index, then by spaT
    intersections.sort((a, b) => {
      if (a.spaSegIdx !== b.spaSegIdx) return a.spaSegIdx - b.spaSegIdx;
      return a.spaT - b.spaT;
    });

    // Determine which spa edges are outside the main pool (need coping)
    const spaEdgesOutsideMain: {
      startIdx: number;
      endIdx: number;
    }[] = [];
    for (let i = 0; i < spaPoints.length; i++) {
      const midX = (spaPoints[i].x + spaPoints[(i + 1) % spaPoints.length].x) / 2;
      const midY = (spaPoints[i].y + spaPoints[(i + 1) % spaPoints.length].y) / 2;
      if (!isPointInPolygon(midX, midY, mainPoolPoints)) {
        spaEdgesOutsideMain.push({
          startIdx: i,
          endIdx: (i + 1) % spaPoints.length
        });
      }
    }

    // Build merged polygon by traversing both polygons
    const mergedPolygon: Point[] = [];
    const mergePoints: {
      mainIndex: number;
      spaIndex: number;
      point: Point;
    }[] = [];

    // Start from first main pool point that's outside the spa
    let startIdx = 0;
    for (let i = 0; i < mainPoolPoints.length; i++) {
      if (!isPointInPolygon(mainPoolPoints[i].x, mainPoolPoints[i].y, spaPoints)) {
        startIdx = i;
        break;
      }
    }
    let currentPoly: 'main' | 'spa' = 'main';
    let currentIdx = startIdx;
    const visited = new Set<string>();
    let safety = 0;
    const maxIterations = mainPoolPoints.length + spaPoints.length + intersections.length * 2;
    while (safety++ < maxIterations) {
      const key = `${currentPoly}-${currentIdx}`;
      if (visited.has(key) && mergedPolygon.length > 2) break;
      visited.add(key);
      if (currentPoly === 'main') {
        const pt = mainPoolPoints[currentIdx];
        if (!isPointInPolygon(pt.x, pt.y, spaPoints)) {
          mergedPolygon.push({
            ...pt,
            id: `merged-main-${currentIdx}`
          });
        }

        // Check for intersection on this segment
        const nextIdx = (currentIdx + 1) % mainPoolPoints.length;
        const segmentIntersections = intersections.filter(i => i.mainSegIdx === currentIdx);
        if (segmentIntersections.length > 0) {
          // Sort by mainT and take the first one
          segmentIntersections.sort((a, b) => a.mainT - b.mainT);
          const intersection = segmentIntersections[0];
          mergedPolygon.push({
            ...intersection.point
          });
          mergePoints.push({
            mainIndex: currentIdx,
            spaIndex: intersection.spaSegIdx,
            point: intersection.point
          });

          // Switch to spa polygon, continue from intersection point going along spa edges outside main
          currentPoly = 'spa';
          currentIdx = (intersection.spaSegIdx + 1) % spaPoints.length;
        } else {
          currentIdx = nextIdx;
        }
      } else {
        const pt = spaPoints[currentIdx];
        if (!isPointInPolygon(pt.x, pt.y, mainPoolPoints)) {
          mergedPolygon.push({
            ...pt,
            id: `merged-spa-${currentIdx}`
          });
        }

        // Check for intersection on this segment
        const nextIdx = (currentIdx + 1) % spaPoints.length;
        const segmentIntersections = intersections.filter(i => i.spaSegIdx === currentIdx);
        if (segmentIntersections.length > 0) {
          segmentIntersections.sort((a, b) => a.spaT - b.spaT);
          const intersection = segmentIntersections[0];
          mergedPolygon.push({
            ...intersection.point
          });
          mergePoints.push({
            mainIndex: intersection.mainSegIdx,
            spaIndex: currentIdx,
            point: intersection.point
          });

          // Switch back to main polygon
          currentPoly = 'main';
          currentIdx = (intersection.mainSegIdx + 1) % mainPoolPoints.length;
        } else {
          currentIdx = nextIdx;
        }
      }

      // Check if we've returned to start
      if (currentPoly === 'main' && currentIdx === startIdx && mergedPolygon.length > 2) {
        break;
      }
    }
    return {
      mergedPolygon,
      mergePoints,
      spaEdgesOutsideMain
    };
  }, [isPointInPolygon]);

  // Check if new pool intersects with any existing pool's WATER, COPING, or DECK
  const checkPoolAreaIntersection = useCallback((newPoolPoints: Point[]): string | null => {
    // Check main pool's water mesh (interior)
    if (points.length >= 3 && doPolygonsIntersect(newPoolPoints, points)) {
      return 'main';
    }

    // Check main pool's deck/hardscape (includes coping area)
    if (hardscapePoints.length >= 3 && doPolygonsIntersect(newPoolPoints, hardscapePoints)) {
      return 'main';
    }

    // Check additional pools' water and deck areas
    for (const pool of additionalPools) {
      if (pool.points.length >= 3) {
        // Check water mesh
        if (doPolygonsIntersect(newPoolPoints, pool.points)) {
          return pool.id;
        }
        // Check deck (for non-perimeter-snapped pools)
        if (!pool.isPerimeterSnapped) {
          const poolDeck = additionalDeckPoints[pool.id] || generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset);
          if (poolDeck.length >= 3 && doPolygonsIntersect(newPoolPoints, poolDeck)) {
            return pool.id;
          }
        }
      }
    }
    return null;
  }, [points, hardscapePoints, additionalPools, additionalDeckPoints, deckOffsetsById, doPolygonsIntersect, deckOffset]);

  // Legacy alias for backward compatibility
  const checkDeckIntersection = checkPoolAreaIntersection;

  // Check if a single click point is on any existing pool's water, coping, or deck area
  const checkClickedOnPoolArea = useCallback((x: number, y: number): string | null => {
    // Check if point is inside main pool water mesh
    if (points.length >= 3 && isPointInPolygon(x, y, points)) {
      return 'main';
    }

    // Check if point is inside main pool's deck/hardscape (includes coping)
    if (hardscapePoints.length >= 3 && isPointInPolygon(x, y, hardscapePoints)) {
      return 'main';
    }

    // Check additional pools' water and deck areas
    for (const pool of additionalPools) {
      if (pool.points.length >= 3) {
        // Check water mesh
        if (isPointInPolygon(x, y, pool.points)) {
          return pool.id;
        }
        // Check deck (for non-perimeter-snapped pools)
        if (!pool.isPerimeterSnapped) {
          const poolDeck = additionalDeckPoints[pool.id] || generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset);
          if (poolDeck.length >= 3 && isPointInPolygon(x, y, poolDeck)) {
            return pool.id;
          }
        }
      }
    }
    return null;
  }, [points, hardscapePoints, additionalPools, additionalDeckPoints, deckOffsetsById, isPointInPolygon, deckOffset]);

  // Generate deck points for portions of a new pool that extend OUTSIDE existing deck/water areas
  // Returns null if no portion extends outside, otherwise returns deck points only for outside area
  const generateDeckForOutsideArea = useCallback((newPoolPoints: Point[], deckDistanceFeet: number = 3): HardscapePoint[] | null => {
    if (newPoolPoints.length < 3) return null;

    // Generate potential deck around the new pool
    const potentialDeck = generateHardscapeFromPool(newPoolPoints, deckDistanceFeet);
    if (potentialDeck.length < 3) return null;

    // Check if any point of the potential deck is outside existing hardscape
    let hasOutsidePoints = false;
    for (const deckPt of potentialDeck) {
      const insideMainDeck = hardscapePoints.length >= 3 && isPointInPolygon(deckPt.x, deckPt.y, hardscapePoints);
      const insideMainPool = points.length >= 3 && isPointInPolygon(deckPt.x, deckPt.y, points);

      // Check if inside any additional pool's deck or water
      let insideOtherPool = false;
      for (const pool of additionalPools) {
        if (pool.points.length >= 3 && isPointInPolygon(deckPt.x, deckPt.y, pool.points)) {
          insideOtherPool = true;
          break;
        }
      }
      if (!insideMainDeck && !insideMainPool && !insideOtherPool) {
        hasOutsidePoints = true;
        break;
      }
    }
    if (!hasOutsidePoints) return null;

    // Return the full potential deck - the clipping during render will handle overlaps
    // The hardscape rendering already clips out water areas using evenodd
    return potentialDeck;
  }, [hardscapePoints, points, additionalPools, isPointInPolygon]);

  // Calculate perimeter position from a point (0-1 along pool perimeter)
  const getPerimeterPositionFromPoint = useCallback((x: number, y: number): number => {
    if (points.length < 2) return 0;
    let totalLength = 0;
    const segmentLengths: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      segmentLengths.push(len);
      totalLength += len;
    }
    let minDist = Infinity;
    let closestPosition = 0;
    let accumulated = 0;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const segmentLength = segmentLengths[i];
      const segmentDx = p2.x - p1.x;
      const segmentDy = p2.y - p1.y;
      const lengthSq = segmentDx ** 2 + segmentDy ** 2;
      if (lengthSq === 0) {
        accumulated += segmentLength;
        continue;
      }
      const t = Math.max(0, Math.min(1, ((x - p1.x) * segmentDx + (y - p1.y) * segmentDy) / lengthSq));
      const projX = p1.x + t * segmentDx;
      const projY = p1.y + t * segmentDy;
      const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closestPosition = (accumulated + t * segmentLength) / totalLength;
      }
      accumulated += segmentLength;
    }
    return Math.max(0, Math.min(1, closestPosition));
  }, [points]);

  // Get position on perimeter from 0-1 value
  const getPositionFromPerimeter = useCallback((perimeterPos: number): {
    x: number;
    y: number;
    angle: number;
  } => {
    if (points.length < 2) return {
      x: 0,
      y: 0,
      angle: 0
    };
    let totalLength = 0;
    const segmentLengths: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      segmentLengths.push(len);
      totalLength += len;
    }
    const targetDistance = perimeterPos * totalLength;
    let accumulated = 0;
    for (let i = 0; i < points.length; i++) {
      const segmentLength = segmentLengths[i];
      if (accumulated + segmentLength >= targetDistance) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const t = (targetDistance - accumulated) / segmentLength;
        const x = p1.x + t * (p2.x - p1.x);
        const y = p1.y + t * (p2.y - p1.y);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const angle = Math.atan2(dy, dx);
        return {
          x,
          y,
          angle
        };
      }
      accumulated += segmentLength;
    }
    return {
      x: points[0].x,
      y: points[0].y,
      angle: 0
    };
  }, [points]);

  // Check for outside deck and prompt user
  const checkAndPromptForOutsideDeck = useCallback((poolId: string, poolPoints: Point[]) => {
    const outsideDeck = generateDeckForOutsideArea(poolPoints, 3); // 3ft default
    if (outsideDeck) {
      setPendingDeckData({
        poolId,
        deckPoints: outsideDeck
      });
      setShowDeckDialog(true);
    }
  }, [generateDeckForOutsideArea]);

  // Handle deck dialog confirmation
  const handleDeckConfirmation = useCallback((addDeck: boolean) => {
    if (addDeck && pendingDeckData) {
      if (pendingDeckData.poolId !== 'main') {
        setAdditionalDeckPoints(prev => ({ ...prev, [pendingDeckData.poolId]: pendingDeckData.deckPoints }));
        setDeckOffsetsById(prev => ({ ...prev, [pendingDeckData.poolId]: prev[pendingDeckData.poolId] ?? 3 }));
      } else {
        // Expand existing hardscape to include new deck area
        const allDeckPoints = [...hardscapePoints, ...pendingDeckData.deckPoints];
        const minX = Math.min(...allDeckPoints.map(p => p.x));
        const maxX = Math.max(...allDeckPoints.map(p => p.x));
        const minY = Math.min(...allDeckPoints.map(p => p.y));
        const maxY = Math.max(...allDeckPoints.map(p => p.y));

        // Create expanded rectangular deck that encompasses all areas
        const expandedDeck: HardscapePoint[] = [{
          x: minX,
          y: minY,
          id: 'h1'
        }, {
          x: maxX,
          y: minY,
          id: 'h2'
        }, {
          x: maxX,
          y: maxY,
          id: 'h3'
        }, {
          x: minX,
          y: maxY,
          id: 'h4'
        }];
        setHardscapePoints(expandedDeck);
      }
    }
    setPendingDeckData(null);
    setShowDeckDialog(false);
  }, [pendingDeckData, hardscapePoints]);

  // Handle pool type selection from dialog
  const handlePoolTypeSelection = useCallback((featureType: 'regular' | 'spillover-spa' | 'tanning-ledge') => {
    if (!pendingPoolData) return;
    if (featureType === 'regular') {
      // Regular pool - add directly without perimeter snapping
      const newPoolId = Date.now().toString();
      const newPoolPoints = pendingPoolData.points;
      setAdditionalPools(prev => [...prev, {
        id: newPoolId,
        type: 'pool',
        points: newPoolPoints,
        shape: 'freeform',
        featureType: 'regular',
        intersectsWith: pendingPoolData.intersectsWith
      }]);
      setAdditionalDeckPoints(prev => ({ ...prev, [newPoolId]: generateHardscapeFromPool(newPoolPoints, 3) }));
      setDeckOffsetsById(prev => ({ ...prev, [newPoolId]: 3 }));
      setPendingPoolData(null);
      setShowPoolTypeDialog(false);
      setSplineDrawing({
        isActive: false,
        points: [],
        currentCurveType: 'linear'
      });
      setActiveTool(null);

      // Check if pool extends outside existing deck and prompt for deck
      checkAndPromptForOutsideDeck(newPoolId, newPoolPoints);
    } else {
      // Spillover spa or tanning ledge - enter perimeter anchor mode
      // Calculate initial position based on where the drawn shape was
      const centerX = pendingPoolData.points.reduce((sum, p) => sum + p.x, 0) / pendingPoolData.points.length;
      const centerY = pendingPoolData.points.reduce((sum, p) => sum + p.y, 0) / pendingPoolData.points.length;
      const initialPerimeterPos = getPerimeterPositionFromPoint(centerX, centerY);
      setPerimeterAnchorMode({
        isActive: true,
        featureType,
        perimeterPosition: initialPerimeterPos,
        isFixed: false
      });
      setPendingPoolData(null);
      setShowPoolTypeDialog(false);
      // Clear the previous spline drawing - user will draw new shape from anchor
      setSplineDrawing({
        isActive: false,
        points: [],
        currentCurveType: 'linear'
      });
      setActiveTool(null);
    }
  }, [pendingPoolData, getPerimeterPositionFromPoint, checkAndPromptForOutsideDeck]);

  // Handle perimeter anchor click to fix position and start drawing
  const handlePerimeterAnchorClick = useCallback(() => {
    if (!perimeterAnchorMode.isActive || !perimeterAnchorMode.featureType) return;
    const anchorPos = getPositionFromPerimeter(perimeterAnchorMode.perimeterPosition);

    // Fix the anchor position
    setPerimeterAnchorMode(prev => ({
      ...prev,
      isFixed: true
    }));

    // Start spline drawing from the anchor point
    const startPoint: SplinePoint = {
      x: anchorPos.x,
      y: anchorPos.y,
      id: '1',
      curveType: 'linear'
    };
    setSplineDrawing({
      isActive: true,
      points: [startPoint],
      currentCurveType: 'curve'
    });
    setActiveTool('draw-pool');
  }, [perimeterAnchorMode, getPositionFromPerimeter]);

  // Complete the perimeter-anchored pool drawing
  const completePerimeterAnchoredPool = useCallback((drawnPoints: Point[]) => {
    if (!perimeterAnchorMode.isActive || !perimeterAnchorMode.featureType) return;
    const newPoolId = Date.now().toString();
    setAdditionalPools(prev => [...prev, {
      id: newPoolId,
      type: perimeterAnchorMode.featureType === 'tanning-ledge' ? 'spa' : 'pool',
      points: drawnPoints,
      shape: 'freeform',
      featureType: perimeterAnchorMode.featureType,
      intersectsWith: 'main',
      perimeterPosition: perimeterAnchorMode.perimeterPosition,
      isPerimeterSnapped: true,
      isMerged: true // Default to merged water bodies (no coping at intersection)
    }]);

    // Reset perimeter anchor mode
    setPerimeterAnchorMode({
      isActive: false,
      featureType: null,
      perimeterPosition: 0.25,
      isFixed: false
    });
    setSplineDrawing({
      isActive: false,
      points: [],
      currentCurveType: 'linear'
    });
    setActiveTool(null);

    // Check if pool extends outside existing deck and prompt for deck
    checkAndPromptForOutsideDeck(newPoolId, drawnPoints);
  }, [perimeterAnchorMode, checkAndPromptForOutsideDeck]);

  // Update additional pool perimeter position (for drag along perimeter)
  const updateAdditionalPoolPerimeterPosition = useCallback((poolId: string, newPosition: number) => {
    setAdditionalPools(prev => prev.map(pool => {
      if (pool.id !== poolId || !pool.isPerimeterSnapped) return pool;
      const oldPos = getPositionFromPerimeter(pool.perimeterPosition || 0);
      const newPos = getPositionFromPerimeter(newPosition);

      // Calculate offset to move all points
      const offsetX = newPos.x - oldPos.x;
      const offsetY = newPos.y - oldPos.y;
      return {
        ...pool,
        perimeterPosition: newPosition,
        points: pool.points.map(p => ({
          ...p,
          x: p.x + offsetX,
          y: p.y + offsetY
        }))
      };
    }));
  }, [getPositionFromPerimeter]);

  // Update additional pool point position
  const updateAdditionalPoolPoint = useCallback((poolId: string, pointId: string, x: number, y: number) => {
    setAdditionalPools(prev => prev.map(pool => {
      if (pool.id !== poolId) return pool;
      return {
        ...pool,
        points: pool.points.map(p => p.id === pointId ? {
          ...p,
          x,
          y
        } : p)
      };
    }));
  }, []);

  // Update curve type for additional pool point
  const updateAdditionalPoolPointCurveType = useCallback((poolId: string, pointId: string, curveType: 'linear' | 'curve' | 'arc' | 'freeform') => {
    setAdditionalPools(prev => prev.map(pool => {
      if (pool.id !== poolId) return pool;
      return {
        ...pool,
        points: pool.points.map(p => p.id === pointId ? {
          ...p,
          curveType
        } : p)
      };
    }));
  }, []);

  // Delete point from additional pool
  const deleteAdditionalPoolPoint = useCallback((poolId: string, pointId: string) => {
    setAdditionalPools(prev => prev.map(pool => {
      if (pool.id !== poolId) return pool;
      if (pool.points.length <= 3) return pool; // Minimum 3 points
      return {
        ...pool,
        points: pool.points.filter(p => p.id !== pointId)
      };
    }));
  }, []);

  // Spline point editor state (for main pool and additional pools)
  const [selectedSplinePoint, setSelectedSplinePoint] = useState<{
    point: SplinePoint;
    index: number;
    screenPosition: {
      x: number;
      y: number;
    };
    poolId?: string; // If set, this is an additional pool point
  } | null>(null);

  // Pricing - use centralized rates from real product data
  const FEATURE_COSTS = CENTRALIZED_FEATURE_COSTS as Record<PoolFeature['type'], number>;
  const deckPricePerSqFt = getDeckPricePerSqFt(selectedPaverId);
  const copingPricePerSqFt = getCopingPricePerSqFt(selectedCopingId);

  // Sync external tab with internal activeTab
  useEffect(() => {
    if (externalTab) {
      // Map external category/tool to internal tab
      const tabMap: Record<string, string> = {
        'pool': 'pool',
        'pool-shape': 'shape',
        'pool-deck': 'pool',
        'materials': 'materials',
        'textures': 'textures',
        'features': 'features',
        'shape': 'shape',
        'depth': 'depth',
        'landscape': 'features',
        'water-features': 'features'
      };
      const mappedTab = tabMap[externalTab] || 'pool';
      setActiveTab(mappedTab);
    }
  }, [externalTab]);

  // Helper function to parse dimension string like "11' x 20'" or "8'6\" x 14'" or "15'6\" x 38'"
  const parseDimensionValue = (dimStr: string): number => {
    // Match formats: "11'" or "11'6\"" or "11'6"" or "8'6\""
    const feetInchMatch = dimStr.match(/(\d+)[''](?:(\d+)[""]?)?/);
    if (feetInchMatch) {
      const feet = parseInt(feetInchMatch[1]) || 0;
      const inches = feetInchMatch[2] ? parseInt(feetInchMatch[2]) : 0;
      return feet + inches / 12;
    }
    // Fallback: just parse as number
    const num = parseFloat(dimStr);
    return isNaN(num) ? 0 : num;
  };

  // Track if tutorial has been dismissed
  const [showDrawTutorial, setShowDrawTutorial] = useState(false);
  const tutorialDismissedRef = useRef(false);

  // Initialize pool and hardscape centered with actual product dimensions if provided
  useEffect(() => {
    if (points.length === 0) {
      // If startInDrawMode, show empty terrain and activate spline drawing
      if (startInDrawMode) {
        // Only show tutorial once on initial mount
        if (!tutorialDismissedRef.current) {
          setShowDrawTutorial(true);
        }
        // Set depth points with defaults
        setDepthPoints([{
          position: 0,
          depth: 3.6,
          id: 'd1'
        }, {
          position: 0.33,
          depth: 4.6,
          id: 'd2'
        }, {
          position: 0.67,
          depth: 5.6,
          id: 'd3'
        }, {
          position: 1,
          depth: 6.6,
          id: 'd4'
        }]);
        return; // Don't create default pool — user will draw it
      }

      let poolWidth = 15; // Default width in feet
      let poolLength = 35; // Default length in feet
      let parsedDepthPoints = [{
        position: 0,
        depth: 3.6,
        id: 'd1'
      }, {
        position: 0.33,
        depth: 4.6,
        id: 'd2'
      }, {
        position: 0.67,
        depth: 5.6,
        id: 'd3'
      }, {
        position: 1,
        depth: 6.6,
        id: 'd4'
      }];

      // Parse actual product dimensions if provided (e.g., "16' × 40'" or "11' x 20'" or "8'6\" x 14'")
      if (initialDimensions) {
        const parts = initialDimensions.split(/\s*[×x]\s*/i);
        if (parts.length === 2) {
          const parsedWidth = parseDimensionValue(parts[0].trim());
          const parsedLength = parseDimensionValue(parts[1].trim());
          if (parsedWidth > 0 && parsedLength > 0) {
            poolWidth = parsedWidth;
            poolLength = parsedLength;
          }
        }
      }

      if (initialDepth) {
        const depthMatch = initialDepth.match(/(\d+)[''](\d+)?[""]?\s*[-–]\s*(\d+)[''](\d+)?[""]?/);
        if (depthMatch) {
          const shallowDepth = parseInt(depthMatch[1]) + (depthMatch[2] ? parseInt(depthMatch[2]) / 12 : 0);
          const deepDepth = parseInt(depthMatch[3]) + (depthMatch[4] ? parseInt(depthMatch[4]) / 12 : 0);
          parsedDepthPoints = [{
            position: 0, depth: shallowDepth, id: 'd1'
          }, {
            position: 0.33, depth: shallowDepth + (deepDepth - shallowDepth) * 0.33, id: 'd2'
          }, {
            position: 0.67, depth: shallowDepth + (deepDepth - shallowDepth) * 0.67, id: 'd3'
          }, {
            position: 1, depth: deepDepth, id: 'd4'
          }];
        }
      }

      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      const poolWidthPixels = poolWidth * scale;
      const poolLengthPixels = poolLength * scale;

      const initialPoolPoints = [{
        x: centerX - poolWidthPixels / 2, y: centerY - poolLengthPixels / 2, id: '1', curveType: 'linear' as const
      }, {
        x: centerX + poolWidthPixels / 2, y: centerY - poolLengthPixels / 2, id: '2', curveType: 'linear' as const
      }, {
        x: centerX + poolWidthPixels / 2, y: centerY + poolLengthPixels / 2, id: '3', curveType: 'linear' as const
      }, {
        x: centerX - poolWidthPixels / 2, y: centerY + poolLengthPixels / 2, id: '4', curveType: 'linear' as const
      }];
      setPoints(initialPoolPoints);
      setDepthPoints(parsedDepthPoints);
      setHardscapePoints(generateHardscapeFromPool(initialPoolPoints, deckOffset));

      setFeatures([{
        type: 'grass', x: centerX, y: centerY + 350, id: 'grass1', radius: 150
      }, {
        type: 'tree', x: centerX - 80, y: centerY + 350, id: 'tree1', treeType: 'palm'
      }, {
        type: 'tree', x: centerX + 80, y: centerY + 350, id: 'tree2', treeType: 'oak'
      }]);
    }
  }, [canvasSize, initialDimensions, initialDepth, startInDrawMode]);

  // Available finishes
  const finishes = [{
    id: 'aquamarine',
    name: 'Aquamarine',
    image: '/textures/finishes/aquamarine-g3.webp'
  }, {
    id: 'azure',
    name: 'Azure Blue',
    image: '/textures/finishes/azure-blue-g2.webp'
  }, {
    id: 'lagoon',
    name: 'Lagoon Blue',
    image: '/textures/finishes/lagoon-blue-g2.webp'
  }, {
    id: 'ocean',
    name: 'Ocean Blue',
    image: '/textures/finishes/ocean-blue-g3.webp'
  }, {
    id: 'sapphire',
    name: 'Sapphire Blue',
    image: '/textures/finishes/sapphire-blue-g3.webp'
  }, {
    id: 'coastal',
    name: 'Coastal Bronze',
    image: '/textures/finishes/coastal-bronze-g3.webp'
  }, {
    id: 'pearl',
    name: 'Athens Pearl White',
    image: '/textures/finishes/athens-pearl-white-g3.webp'
  }];

  // Load textures with LOD system
  useEffect(() => {
    const selectedPaver = paverTypes.find(p => p.id === selectedPaverId);
    const selectedCoping = paverTypes.find(p => p.id === selectedCopingId);
    const selectedFinish = finishes.find(f => f.id === selectedFinishId);
    const paverImage = selectedPaver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.webp';
    const copingImage = selectedCoping?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.webp';
    const finishImage = selectedFinish?.image || aquamarineFinish;

    // Load all textures with LOD levels
    setTexturesLoaded(false);
    loadAllTextureLODs(paverImage, copingImage, finishImage).then(lodSet => {
      textureLODsRef.current = lodSet;
      setTexturesLoaded(true);
    }).catch(error => {
      console.error('Failed to load texture LODs:', error);
      setTexturesLoaded(false);
    });
  }, [selectedPaverId, selectedCopingId, selectedFinishId]);

  // Update canvas size to maximize screen space
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Calculate distance between two points in feet
  const calculateDistance = (p1: Point, p2: Point) => {
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
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

  // Calculate hardscape area
  // Billable paver deck = drawn deck area minus every surface that needs nothing
  // underneath it (pool, spa, tanning ledge, grass/greenland, bushes, planters,
  // gravel, sand, dirt, beach, lagoon, lake, ponds and other water features).
  const calculateHardscapeArea = useCallback(() => {
    if (hardscapePoints.length < 3) return 0;

    const exclusions: { x: number; y: number }[][] = [];
    if (points.length >= 3) exclusions.push(points.map(p => ({ x: p.x, y: p.y })));
    additionalPools.forEach(pool => {
      if (pool.points && pool.points.length >= 3) {
        exclusions.push(pool.points.map(p => ({ x: p.x, y: p.y })));
      }
    });
    // Circular/organic footprints (grass regions, planters, ponds, gravel beds…)
    features.forEach(f => {
      if (!isNonPaverSurface(f.type)) return;
      const r = f.radius ?? 0;
      if (r <= 0) return;
      const ring: { x: number; y: number }[] = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ring.push({ x: f.x + Math.cos(a) * r, y: f.y + Math.sin(a) * r });
      }
      exclusions.push(ring);
    });

    return computeNetPaverArea({
      deckPolygons: [hardscapePoints.map(p => ({ x: p.x, y: p.y }))],
      exclusionPolygons: exclusions,
      pxPerFt: scale,
    });
  }, [hardscapePoints, scale, points, additionalPools, features]);


  // Shift-constrain: force a perfectly straight segment from the last placed point,
  // snapped to the nearest 15° direction so any direction the user aims stays straight.
  const constrainToStraightLine = useCallback((lastPt: { x: number; y: number } | undefined, x: number, y: number) => {
    if (!lastPt) return { x, y };
    const dx = x - lastPt.x;
    const dy = y - lastPt.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.0001) return { x, y };
    const step = Math.PI / 12; // 15 degrees
    const angle = Math.round(Math.atan2(dy, dx) / step) * step;
    return { x: lastPt.x + Math.cos(angle) * len, y: lastPt.y + Math.sin(angle) * len };
  }, []);


  // Get symmetry-snapped position for a point (snaps to axis lines AND mirrored positions of existing points)
  const getSymmetrySnappedPosition = useCallback((x: number, y: number): {
    x: number;
    y: number;
    snappedVertical: boolean;
    snappedHorizontal: boolean;
    snappedToMirror: boolean;
    mirroredFromPoint?: {
      x: number;
      y: number;
    };
  } => {
    if (!symmetryMode.enabled) {
      return {
        x,
        y,
        snappedVertical: false,
        snappedHorizontal: false,
        snappedToMirror: false
      };
    }
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const snapDist = symmetryMode.snapDistance;
    let snappedX = x;
    let snappedY = y;
    let snappedVertical = false;
    let snappedHorizontal = false;
    let snappedToMirror = false;
    let mirroredFromPoint: {
      x: number;
      y: number;
    } | undefined;

    // First, check for mirrored positions of existing spline points
    if (splineDrawing.points.length > 0) {
      for (const pt of splineDrawing.points) {
        // Calculate mirrored positions
        const mirrorV = {
          x: 2 * centerX - pt.x,
          y: pt.y
        }; // Mirror across vertical axis
        const mirrorH = {
          x: pt.x,
          y: 2 * centerY - pt.y
        }; // Mirror across horizontal axis
        const mirrorBoth = {
          x: 2 * centerX - pt.x,
          y: 2 * centerY - pt.y
        }; // Mirror across both

        // Check snap to vertical mirror
        if (symmetryMode.axes === 'vertical' || symmetryMode.axes === 'both') {
          const distV = Math.sqrt(Math.pow(x - mirrorV.x, 2) + Math.pow(y - mirrorV.y, 2));
          if (distV < snapDist) {
            snappedX = mirrorV.x;
            snappedY = mirrorV.y;
            snappedToMirror = true;
            mirroredFromPoint = {
              x: pt.x,
              y: pt.y
            };
          }
        }

        // Check snap to horizontal mirror
        if (symmetryMode.axes === 'horizontal' || symmetryMode.axes === 'both') {
          const distH = Math.sqrt(Math.pow(x - mirrorH.x, 2) + Math.pow(y - mirrorH.y, 2));
          if (distH < snapDist) {
            snappedX = mirrorH.x;
            snappedY = mirrorH.y;
            snappedToMirror = true;
            mirroredFromPoint = {
              x: pt.x,
              y: pt.y
            };
          }
        }

        // Check snap to diagonal mirror (both axes)
        if (symmetryMode.axes === 'both') {
          const distBoth = Math.sqrt(Math.pow(x - mirrorBoth.x, 2) + Math.pow(y - mirrorBoth.y, 2));
          if (distBoth < snapDist) {
            snappedX = mirrorBoth.x;
            snappedY = mirrorBoth.y;
            snappedToMirror = true;
            mirroredFromPoint = {
              x: pt.x,
              y: pt.y
            };
          }
        }
      }
    }

    // If not snapped to a mirror point, check axis lines
    if (!snappedToMirror) {
      // Snap to vertical axis (center line)
      if ((symmetryMode.axes === 'vertical' || symmetryMode.axes === 'both') && Math.abs(x - centerX) < snapDist) {
        snappedX = centerX;
        snappedVertical = true;
      }

      // Snap to horizontal axis (center line)
      if ((symmetryMode.axes === 'horizontal' || symmetryMode.axes === 'both') && Math.abs(y - centerY) < snapDist) {
        snappedY = centerY;
        snappedHorizontal = true;
      }
    }
    return {
      x: snappedX,
      y: snappedY,
      snappedVertical,
      snappedHorizontal,
      snappedToMirror,
      mirroredFromPoint
    };
  }, [symmetryMode.enabled, symmetryMode.axes, symmetryMode.snapDistance, canvasSize.width, canvasSize.height, splineDrawing.points]);

  // Find nearest point on pool perimeter
  const findNearestWallPoint = (x: number, y: number) => {
    let minDist = Infinity;
    let nearestPoint = {
      x,
      y,
      segment: 0,
      position: 0,
      angle: 0
    };
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      // Find closest point on line segment
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / (len * len)));
      const projX = p1.x + t * dx;
      const projY = p1.y + t * dy;
      const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
      if (dist < minDist) {
        minDist = dist;
        const angle = Math.atan2(dy, dx);
        nearestPoint = {
          x: projX,
          y: projY,
          segment: i,
          position: t,
          angle
        };
      }
    }
    return nearestPoint;
  };

  // Check if point is inside pool
  const isInsidePool = (x: number, y: number) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x,
        yi = points[i].y;
      const xj = points[j].x,
        yj = points[j].y;
      const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Draw the pool shape
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !texturesLoaded) return;
    const ctx = canvas.getContext('2d', {
      alpha: false
    });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Neutral terrain background
    ctx.fillStyle = '#5A7A4A';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Apply camera transform (pan + zoom)
    ctx.save();
    ctx.translate(canvasSize.width / 2 + panOffset.x, canvasSize.height / 2 + panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvasSize.width / 2, -canvasSize.height / 2);

    // Procedural terrain detail - grass texture dots
    const terrainStep = Math.max(20, 40 / zoomLevel);
    const invZoom = 1 / zoomLevel;
    const viewLeft = -panOffset.x * invZoom + canvasSize.width / 2 * (1 - invZoom);
    const viewTop = -panOffset.y * invZoom + canvasSize.height / 2 * (1 - invZoom);
    const viewRight = viewLeft + canvasSize.width * invZoom;
    const viewBottom = viewTop + canvasSize.height * invZoom;
    const startX = Math.floor(viewLeft / terrainStep) * terrainStep;
    const startY = Math.floor(viewTop / terrainStep) * terrainStep;
    for (let tx = startX; tx < viewRight; tx += terrainStep) {
      for (let ty = startY; ty < viewBottom; ty += terrainStep) {
        // Deterministic pseudo-random based on position
        const hash = ((tx * 73856093) ^ (ty * 19349663)) & 0xFFFF;
        const shade = 74 + (hash % 20);
        ctx.fillStyle = `rgb(${shade - 10}, ${shade + 48}, ${shade - 20})`;
        const sz = 2 + (hash % 3);
        ctx.fillRect(tx + (hash % 12), ty + ((hash >> 4) % 12), sz, sz);
      }
    }

    // Draw hardscape/paver deck with custom shape
    // Apply zoom level to texture detail
    const effectiveScale = scale * zoomLevel;
    const paverSizeInFeet = paverSize / 12;
    const paverSizeInPixels = paverSizeInFeet * effectiveScale;

    // Draw hardscape deck area with editable corners (squared or smooth)
    // Get appropriate LOD texture based on zoom level
    const paverTexture = textureLODsRef.current ? getTextureForLOD(textureLODsRef.current.paver, zoomLevel) : null;
    if (paverTexture && hardscapePoints.length >= 3) {
      const img = paverTexture;

      // Create hardscape path
      ctx.save();
      ctx.beginPath();
      if (smoothCorners) {
        // Draw smooth curves between hardscape points
        for (let i = 0; i < hardscapePoints.length; i++) {
          const p0 = hardscapePoints[(i - 1 + hardscapePoints.length) % hardscapePoints.length];
          const p1 = hardscapePoints[i];
          const p2 = hardscapePoints[(i + 1) % hardscapePoints.length];
          const p3 = hardscapePoints[(i + 2) % hardscapePoints.length];
          if (i === 0) {
            ctx.moveTo(p1.x, p1.y);
          }

          // Smooth spline control points
          const tension = 0.3;
          const cp1x = p1.x + (p2.x - p0.x) * tension;
          const cp1y = p1.y + (p2.y - p0.y) * tension;
          const cp2x = p2.x - (p3.x - p1.x) * tension;
          const cp2y = p2.y - (p3.y - p1.y) * tension;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
      } else {
        // Draw straight lines for squared corners
        ctx.moveTo(hardscapePoints[0].x, hardscapePoints[0].y);
        for (let i = 1; i < hardscapePoints.length; i++) {
          ctx.lineTo(hardscapePoints[i].x, hardscapePoints[i].y);
        }
      }
      ctx.closePath();

      // Clip out main pool water area
      if (points.length >= 3) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
      }

      // Clip out all additional pools' water areas (prevent deck on water)
      additionalPools.forEach(pool => {
        if (pool.points.length >= 3) {
          ctx.moveTo(pool.points[0].x, pool.points[0].y);
          for (let i = 1; i < pool.points.length; i++) {
            ctx.lineTo(pool.points[i].x, pool.points[i].y);
          }
          ctx.closePath();
        }
      });
      ctx.clip('evenodd');

      // Find hardscape bounds
      const hsMinX = Math.min(...hardscapePoints.map(p => p.x));
      const hsMaxX = Math.max(...hardscapePoints.map(p => p.x));
      const hsMinY = Math.min(...hardscapePoints.map(p => p.y));
      const hsMaxY = Math.max(...hardscapePoints.map(p => p.y));
      const numPaversX = Math.ceil((hsMaxX - hsMinX) / paverSizeInPixels) + 1;
      const numPaversY = Math.ceil((hsMaxY - hsMinY) / paverSizeInPixels) + 1;

      // Draw pavers
      for (let i = 0; i < numPaversX; i++) {
        for (let j = 0; j < numPaversY; j++) {
          const x = hsMinX + i * paverSizeInPixels;
          const y = hsMinY + j * paverSizeInPixels;
          ctx.drawImage(img, x, y, paverSizeInPixels, paverSizeInPixels);

          // Grout lines
          ctx.strokeStyle = 'rgba(100, 80, 60, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, paverSizeInPixels, paverSizeInPixels);
        }
      }
      ctx.restore();
    }

    // Draw subtle measurement grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvasSize.width; i += scale) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvasSize.height; i += scale) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize.width, i);
      ctx.stroke();
    }

    // Helper function to draw curved pool segments based on curve type (used by final render)
    const drawPoolSegment = (ctx: CanvasRenderingContext2D, p1: {
      x: number;
      y: number;
    }, p2: {
      x: number;
      y: number;
      curveType?: 'linear' | 'curve' | 'arc' | 'freeform';
    }) => {
      const curveType = p2.curveType || 'linear';
      if (curveType === 'linear') {
        ctx.lineTo(p2.x, p2.y);
      } else if (curveType === 'curve') {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy * 0.25;
        const perpY = dx * 0.25;
        ctx.quadraticCurveTo(midX + perpX, midY + perpY, p2.x, p2.y);
      } else if (curveType === 'arc') {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy * 0.35;
        const perpY = dx * 0.35;
        ctx.quadraticCurveTo(midX + perpX, midY + perpY, p2.x, p2.y);
      } else if (curveType === 'freeform') {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy * 0.15;
        const perpY = dx * 0.15;
        const cp1x = p1.x + dx * 0.3 + perpX * 0.5;
        const cp1y = p1.y + dy * 0.3 + perpY * 0.5;
        const cp2x = p1.x + dx * 0.7 - perpX * 0.3;
        const cp2y = p1.y + dy * 0.7 - perpY * 0.3;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    };

    // Draw pool shape - use per-point curveType for freeform, straight for rectangle
    if (points.length > 2) {
      ctx.save();

      // Create path for pool outline
      ctx.beginPath();
      if (poolShape === 'rectangle') {
        // Draw with straight lines
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
      } else if (poolShape === 'freeform' && points.some(p => p.curveType)) {
        // Custom drawn pool - use individual curveTypes
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          drawPoolSegment(ctx, points[i - 1], points[i]);
        }
        // Close with first point's curveType (defines the closing segment)
        drawPoolSegment(ctx, points[points.length - 1], points[0]);
      } else {
        // Default smooth curves for kidney and legacy freeform
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
      }

      // Draw coping border - skip edges that are inside merged integrated pools
      const copingTexture = textureLODsRef.current ? getTextureForLOD(textureLODsRef.current.coping, zoomLevel) : null;

      // Find which main pool edges are inside merged integrated pools
      const mergedPools = additionalPools.filter(p => (p.featureType === 'spillover-spa' || p.featureType === 'tanning-ledge') && p.isMerged !== false && p.points.length >= 3);

      // Check each main pool edge
      const mainEdgesInMergedPools: boolean[] = [];
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        let isInsideMerged = false;
        for (const pool of mergedPools) {
          if (isPointInPolygon(midX, midY, pool.points)) {
            isInsideMerged = true;
            break;
          }
        }
        mainEdgesInMergedPools.push(isInsideMerged);
      }
      const hasMergedEdges = mainEdgesInMergedPools.some(e => e);
      if (hasMergedEdges) {
        // Draw coping only on edges NOT inside merged pools
        ctx.save();
        for (let i = 0; i < points.length; i++) {
          if (!mainEdgesInMergedPools[i]) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            if (poolShape === 'freeform' && p1.curveType) {
              drawPoolSegment(ctx, p1, p2);
            } else if (poolShape !== 'rectangle') {
              const p0 = points[(i - 1 + points.length) % points.length];
              const p3 = points[(i + 2) % points.length];
              const cp1x = p1.x + (p2.x - p0.x) / 6;
              const cp1y = p1.y + (p2.y - p0.y) / 6;
              const cp2x = p2.x - (p3.x - p1.x) / 6;
              const cp2y = p2.y - (p3.y - p1.y) / 6;
              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            } else {
              ctx.lineTo(p2.x, p2.y);
            }
            if (copingTexture) {
              ctx.lineWidth = paverSizeInPixels;
              const copingPattern = ctx.createPattern(copingTexture, 'repeat');
              if (copingPattern) {
                ctx.strokeStyle = copingPattern;
                ctx.stroke();
              }
            } else {
              ctx.lineWidth = copingThickness * 2;
              ctx.strokeStyle = '#8B7355';
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      } else if (copingTexture) {
        // No merged edges - draw full coping
        ctx.save();
        ctx.lineWidth = copingThickness * 2;
        ctx.strokeStyle = 'transparent';

        // Create a coping path
        const copingPath = new Path2D();
        if (poolShape === 'rectangle') {
          copingPath.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            copingPath.lineTo(points[i].x, points[i].y);
          }
          copingPath.closePath();
        } else {
          for (let i = 0; i < points.length; i++) {
            const p0 = points[(i - 1 + points.length) % points.length];
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            const p3 = points[(i + 2) % points.length];
            if (i === 0) {
              copingPath.moveTo(p1.x, p1.y);
            }
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            copingPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
          }
          copingPath.closePath();
        }

        // Draw continuous coping texture along perimeter using same paver size
        ctx.save();
        ctx.lineWidth = paverSizeInPixels; // Use same size as deck pavers

        // Create pattern from coping texture
        const copingPattern = ctx.createPattern(copingTexture, 'repeat');
        if (copingPattern) {
          ctx.strokeStyle = copingPattern;
          ctx.stroke();
        }

        // Add subtle shadow for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = paverSizeInPixels + 2;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      } else {
        // Fallback solid coping
        ctx.lineWidth = copingThickness * 2;
        ctx.strokeStyle = '#8B7355';
        ctx.stroke();
      }

      // Fill pool with premium liner texture at proper scale (tiny mosaic tiles)
      ctx.save();
      ctx.clip();

      // Load and use sapphire blue pool texture
      const poolTextureImg = new Image();
      poolTextureImg.src = poolTextureSapphire;
      if (poolTextureImg.complete) {
        const pattern = ctx.createPattern(poolTextureImg, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fill();
        }
      } else {
        // Fallback while loading
        const linerTexture = textureLODsRef.current ? getTextureForLOD(textureLODsRef.current.liner, zoomLevel) : null;
        if (linerTexture) {
          const pattern = ctx.createPattern(linerTexture, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fill();
          }
        } else {
          ctx.fillStyle = '#5BC5D9';
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.restore();

      // Draw depth spline in pool when Depth tab is active (AFTER clipping is restored)
      if (activeTab === 'depth' && points.length > 0) {
        // Calculate pool bounds
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        const poolWidth = maxX - minX;

        // Draw depth spline line (left to right center)
        const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
        ctx.strokeStyle = 'rgba(46, 134, 171, 0.7)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        sortedDepths.forEach((dp, i) => {
          const x = minX + dp.position * poolWidth;
          const y = centerY;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw depth anchor points with labels
        sortedDepths.forEach(dp => {
          const x = minX + dp.position * poolWidth;
          const y = centerY;
          const size = 10;
          const isSelected = selectedDepthPoint === dp.id;

          // Draw point
          ctx.fillStyle = isSelected ? '#FFD700' : '#ffffff';
          ctx.strokeStyle = isSelected ? '#FFA500' : '#2E86AB';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          // Draw depth label with background
          const feet = Math.floor(dp.depth);
          const inches = Math.round((dp.depth - feet) * 12);
          const label = `${feet}'${inches}"`;
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const metrics = ctx.measureText(label);
          const padding = 6;
          ctx.fillStyle = 'rgba(46, 134, 171, 0.95)';
          ctx.fillRect(x - metrics.width / 2 - padding, y - 25 - 10, metrics.width + padding * 2, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, x, y - 25);
        });
      }

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
        ctx.fillRect(midX + offsetX - metrics.width / 2 - padding, midY + offsetY - 8, metrics.width + padding * 2, 16);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(label, midX + offsetX, midY + offsetY);
      }
    }

    // Draw hardscape dimension lines and labels
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < hardscapePoints.length; i++) {
      const current = hardscapePoints[i];
      const next = hardscapePoints[(i + 1) % hardscapePoints.length];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      const distance = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)) / scale;

      // Draw dimension line
      const angle = Math.atan2(next.y - current.y, next.x - current.x);
      const offset = 35;
      const offsetX = Math.cos(angle + Math.PI / 2) * offset;
      const offsetY = Math.sin(angle + Math.PI / 2) * offset;
      ctx.beginPath();
      ctx.moveTo(current.x + offsetX, current.y + offsetY);
      ctx.lineTo(next.x + offsetX, next.y + offsetY);
      ctx.stroke();

      // Draw dimension label with background
      const label = `${distance.toFixed(1)}' deck`;
      const metrics = ctx.measureText(label);
      const padding = 4;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
      ctx.fillRect(midX + offsetX - metrics.width / 2 - padding, midY + offsetY - 8, metrics.width + padding * 2, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, midX + offsetX, midY + offsetY);
    }

    // Draw fence system (before hardscape for proper layering)
    if (fencePoints.length >= 2) {
      const fenceHeightPx = fenceHeight * scale;
      // Check if fence crosses pool - if so, make it red and don't build
      const fenceCrossesPool = fencePoints.some((point, index) => {
        if (index === fencePoints.length - 1) return false;
        const p1 = point;
        const p2 = fencePoints[index + 1];

        // Check if fence segment passes through pool area
        for (let i = 0; i < points.length; i++) {
          const nextI = (i + 1) % points.length;
          const poolP1 = points[i];
          const poolP2 = points[nextI];

          // Simple line intersection check
          const det = (p2.x - p1.x) * (poolP2.y - poolP1.y) - (poolP2.x - poolP1.x) * (p2.y - p1.y);
          if (Math.abs(det) < 0.01) continue;
          const lambda = ((poolP2.y - poolP1.y) * (poolP2.x - p1.x) + (poolP1.x - poolP2.x) * (poolP2.y - p1.y)) / det;
          const gamma = ((p1.y - p2.y) * (poolP2.x - p1.x) + (p2.x - p1.x) * (poolP2.y - p1.y)) / det;
          if (lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1) {
            return true; // Intersection found
          }
        }
        return false;
      });
      const fenceColor = fenceCrossesPool ? '#EF4444' : showFenceEditor ? '#3B82F6' : '#8B6F47'; // Red if crossing pool, blue when active, brown when not

      // Draw fence panels between points
      ctx.save();
      for (let i = 0; i < fencePoints.length - 1; i++) {
        const p1 = fencePoints[i];
        const p2 = fencePoints[i + 1];

        // Check if there's a door in this segment
        const segmentDoors = fenceDoors.filter(door => door.segmentIndex === i);
        if (segmentDoors.length === 0) {
          // Draw solid fence panel
          if (smoothFence) {
            // Smooth curved fence
            const cp1x = p1.x + (p2.x - p1.x) / 3;
            const cp1y = p1.y + (p2.y - p1.y) / 3;
            const cp2x = p1.x + 2 * (p2.x - p1.x) / 3;
            const cp2y = p1.y + 2 * (p2.y - p1.y) / 3;
            ctx.strokeStyle = fenceColor;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            ctx.stroke();
          } else {
            // Straight fence
            ctx.strokeStyle = fenceColor;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        } else {
          // Draw fence with door openings
          segmentDoors.forEach(door => {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            const doorWidthPx = door.width * scale;

            // Calculate door start and end positions
            const doorStartPos = Math.max(0, door.position - doorWidthPx / 2 / segmentLength);
            const doorEndPos = Math.min(1, door.position + doorWidthPx / 2 / segmentLength);

            // Draw fence before door
            if (doorStartPos > 0) {
              ctx.strokeStyle = fenceColor;
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p1.x + dx * doorStartPos, p1.y + dy * doorStartPos);
              ctx.stroke();
            }

            // Draw fence after door
            if (doorEndPos < 1) {
              ctx.strokeStyle = fenceColor;
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.moveTo(p1.x + dx * doorEndPos, p1.y + dy * doorEndPos);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }

            // Draw door as black rectangle slightly larger than spline
            const doorX = p1.x + dx * door.position;
            const doorY = p1.y + dy * door.position;
            const angle = Math.atan2(dy, dx);
            ctx.save();
            ctx.translate(doorX, doorY);
            ctx.rotate(angle);

            // Door rectangle (black, slightly larger than fence line)
            ctx.fillStyle = '#000000';
            ctx.fillRect(-doorWidthPx / 2, -8, doorWidthPx, 16);

            // Door frame outline
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 2;
            ctx.strokeRect(-doorWidthPx / 2, -8, doorWidthPx, 16);

            // Door handle
            ctx.fillStyle = '#888888';
            ctx.fillRect(-doorWidthPx / 4, -2, 4, 4);
            ctx.restore();
          });
        }

        // Draw fence posts at points
        ctx.fillStyle = '#A67C52';
        ctx.fillRect(p1.x - 4, p1.y - 4, 8, 8);
        if (i === fencePoints.length - 2) {
          ctx.fillRect(p2.x - 4, p2.y - 4, 8, 8);
        }
      }
      ctx.restore();
    }

    // Draw fence anchor points
    if (showFenceEditor && fencePoints.length > 0) {
      fencePoints.forEach(point => {
        const size = 10;
        const isSelected = selectedFencePoint === point.id;
        ctx.fillStyle = isSelected ? '#3B82F6' : '#ffffff';
        ctx.strokeStyle = isSelected ? '#2563EB' : '#3B82F6';
        ctx.lineWidth = 2;
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      });

      // Draw door markers
      fenceDoors.forEach(door => {
        if (door.segmentIndex < fencePoints.length - 1) {
          const p1 = fencePoints[door.segmentIndex];
          const p2 = fencePoints[door.segmentIndex + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const doorX = p1.x + dx * door.position;
          const doorY = p1.y + dy * door.position;
          const size = 12;
          const isSelected = selectedFenceDoor === door.id;
          ctx.fillStyle = isSelected ? '#10B981' : '#ffffff';
          ctx.strokeStyle = isSelected ? '#059669' : '#10B981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(doorX, doorY, size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Door label
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('D', doorX, doorY + 4);
        }
      });
    }

    // Draw deck spline edges with dashed orange lines
    if (hardscapePoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(hardscapePoints[0].x, hardscapePoints[0].y);
      for (let i = 1; i < hardscapePoints.length; i++) {
        ctx.lineTo(hardscapePoints[i].x, hardscapePoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1.0;

      // Dimension labels on deck edges
      for (let i = 0; i < hardscapePoints.length; i++) {
        const p1 = hardscapePoints[i];
        const p2 = hardscapePoints[(i + 1) % hardscapePoints.length];
        const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) / scale;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        ctx.fillStyle = '#D97706';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${dist.toFixed(1)}'`, mx, my - 6);
      }
      ctx.restore();
    }

    // Draw hardscape anchor points (main deck)
    hardscapePoints.forEach(point => {
      const size = 10;
      const isSelected = selectedHardscapePoint === point.id && selectedDeckId === 'main';
      ctx.fillStyle = isSelected ? '#F59E0B' : '#ffffff';
      ctx.strokeStyle = isSelected ? '#D97706' : '#F59E0B';
      ctx.lineWidth = 2;
      ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
    });

    // Draw spline points for additional pool decks (visible + editable)
    additionalPools.forEach(pool => {
      const poolDeck = additionalDeckPoints[pool.id] || (pool.featureType === 'regular' ? generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset) : []);
      if (poolDeck.length < 3) return;

      // dashed deck outline
      ctx.save();
      ctx.strokeStyle = selectedDeckId === pool.id ? '#F59E0B' : 'rgba(245, 158, 11, 0.55)';
      ctx.lineWidth = selectedDeckId === pool.id ? 2 : 1.25;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(poolDeck[0].x, poolDeck[0].y);
      for (let i = 1; i < poolDeck.length; i++) ctx.lineTo(poolDeck[i].x, poolDeck[i].y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      poolDeck.forEach(point => {
        const size = 9;
        const isSelected = selectedHardscapePoint === point.id && selectedDeckId === pool.id;
        ctx.fillStyle = isSelected ? '#F59E0B' : '#ffffff';
        ctx.strokeStyle = isSelected ? '#D97706' : '#F59E0B';
        ctx.lineWidth = 2;
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      });
    });

    // Draw anchor points for pool
    points.forEach(point => {
      const size = 10;
      const isSelected = selectedPoint === point.id;
      const isHovered = hoveredPoint === point.id;
      ctx.fillStyle = isSelected ? '#2E86AB' : isHovered ? '#4FB3D9' : '#ffffff';
      ctx.strokeStyle = isSelected ? '#1a4d6d' : '#2E86AB';
      ctx.lineWidth = 2;
      ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
    });

    // Draw snap point if in add mode
    if (activeTool === 'add' && snapPoint) {
      ctx.beginPath();
      ctx.arc(snapPoint.x, snapPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw depth profile editor when pool is selected
    if (showDepthEditor && points.length > 0) {
      const editorX = 50;
      const editorY = canvasSize.height - 200;
      const editorWidth = 400;
      const editorHeight = 150;

      // Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 2;
      ctx.fillRect(editorX, editorY, editorWidth, editorHeight);
      ctx.strokeRect(editorX, editorY, editorWidth, editorHeight);

      // Title
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Pool Depth Profile (Section View)', editorX + 10, editorY + 20);

      // Draw depth curve
      ctx.save();
      ctx.translate(editorX, editorY + editorHeight);
      ctx.scale(1, -1);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = i / 10 * (editorHeight - 30);
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(editorWidth - 10, y);
        ctx.stroke();
      }

      // Depth spline
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
      sortedDepths.forEach((dp, i) => {
        const x = 10 + dp.position * (editorWidth - 20);
        const y = 10 + dp.depth / 10 * (editorHeight - 40);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Depth anchor points
      sortedDepths.forEach(dp => {
        const x = 10 + dp.position * (editorWidth - 20);
        const y = 10 + dp.depth / 10 * (editorHeight - 40);
        const size = 8;
        const isSelected = selectedDepthPoint === dp.id;
        ctx.fillStyle = isSelected ? '#F59E0B' : '#ffffff';
        ctx.strokeStyle = isSelected ? '#D97706' : '#2E86AB';
        ctx.lineWidth = 2;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      });
      ctx.restore();

      // Depth labels
      ctx.fillStyle = '#000';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      sortedDepths.forEach(dp => {
        const x = editorX + 10 + dp.position * (editorWidth - 20);
        const y = editorY + editorHeight - 10 - dp.depth / 10 * (editorHeight - 40);
        ctx.fillText(`${dp.depth.toFixed(1)}'`, x, y - 10);
      });
    }

    // Draw landscape features first (behind pool) - DISABLED: Only pool/coping/finish visible
    // features.filter(f => f.type === 'grass' || f.type === 'home').forEach(feature => { ... });

    // Draw features with better styling - Only pool-related features (stairs, lights, jets)
    const poolFeatureTypes = ['stairs', 'light', 'jet'];
    features.filter(f => poolFeatureTypes.includes(f.type)).forEach(feature => {
      ctx.save();
      if (feature.type === 'grass') {
        // Grass patch
        const radius = feature.radius || 80;
        ctx.fillStyle = '#5A9547';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Grass texture
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * radius;
          const x = feature.x + Math.cos(angle) * dist;
          const y = feature.y + Math.sin(angle) * dist;
          ctx.fillStyle = Math.random() > 0.5 ? '#4A8538' : '#6BA557';
          ctx.fillRect(x, y, 2, 2);
        }

        // Border
        const isSelected = selectedFeature === feature.id;
        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(70, 120, 50, 0.5)';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
      } else if (feature.type === 'home') {
        // American-style house roof with ridge lines and shingles
        const isSelected = selectedFeature === feature.id;

        // Initialize roof points if not exist (American residential roof shape)
        if (!feature.roofPoints || feature.roofPoints.length === 0) {
          const width = 200;
          const height = 150;
          feature.roofPoints = [{
            x: -width / 2,
            y: 0,
            id: 'r1'
          },
          // Left base
          {
            x: -width / 2,
            y: -height / 3,
            id: 'r2'
          },
          // Left side peak
          {
            x: 0,
            y: -height / 2,
            id: 'r3'
          },
          // Top ridge peak
          {
            x: width / 2,
            y: -height / 3,
            id: 'r4'
          },
          // Right side peak
          {
            x: width / 2,
            y: 0,
            id: 'r5'
          },
          // Right base
          {
            x: width / 3,
            y: 0,
            id: 'r6'
          },
          // Right base inner
          {
            x: width / 3,
            y: height / 4,
            id: 'r7'
          },
          // Right lower section
          {
            x: 0,
            y: height / 3,
            id: 'r8'
          },
          // Bottom center
          {
            x: -width / 3,
            y: height / 4,
            id: 'r9'
          },
          // Left lower section
          {
            x: -width / 3,
            y: 0,
            id: 'r10'
          } // Left base inner
          ];
        }

        // Draw American-style roof
        ctx.save();
        ctx.translate(feature.x, feature.y);
        const roofPts = feature.roofPoints;
        if (roofPts.length > 2) {
          // Main roof outline
          ctx.beginPath();
          ctx.moveTo(roofPts[0].x, roofPts[0].y);
          for (let i = 1; i < roofPts.length; i++) {
            ctx.lineTo(roofPts[i].x, roofPts[i].y);
          }
          ctx.closePath();

          // Base roof color
          ctx.fillStyle = '#A0463D';
          ctx.fill();

          // Calculate center for ridge lines
          const centerX = roofPts.reduce((sum, p) => sum + p.x, 0) / roofPts.length;
          const centerY = roofPts.reduce((sum, p) => sum + p.y, 0) / roofPts.length;

          // Draw ridge lines emanating from center (dimensional effect)
          ctx.strokeStyle = 'rgba(120, 50, 40, 0.6)';
          ctx.lineWidth = 2.5;
          roofPts.forEach(pt => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
          });

          // Draw layered shingle texture (concentric pattern)
          const numLayers = 12;
          for (let layer = 0; layer < numLayers; layer++) {
            const ratio = (layer + 1) / (numLayers + 1);

            // Alternate shingle colors for depth
            const layerColor = layer % 2 === 0 ? `rgba(140, 60, 50, ${0.15})` : `rgba(100, 40, 35, ${0.15})`;
            ctx.strokeStyle = layerColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            roofPts.forEach((pt, i) => {
              const lx = centerX + (pt.x - centerX) * ratio;
              const ly = centerY + (pt.y - centerY) * ratio;
              if (i === 0) ctx.moveTo(lx, ly);else ctx.lineTo(lx, ly);
            });
            ctx.closePath();
            ctx.stroke();

            // Add shingle texture lines
            if (layer % 2 === 0) {
              ctx.fillStyle = layerColor;
              ctx.fill();
            }
          }

          // Add vertical shingle pattern lines
          const minX = Math.min(...roofPts.map(p => p.x));
          const maxX = Math.max(...roofPts.map(p => p.x));
          const minY = Math.min(...roofPts.map(p => p.y));
          const maxY = Math.max(...roofPts.map(p => p.y));
          ctx.strokeStyle = 'rgba(80, 40, 30, 0.15)';
          ctx.lineWidth = 0.8;
          for (let i = 0; i < 15; i++) {
            const x = minX + (maxX - minX) * (i / 15);
            ctx.beginPath();
            ctx.moveTo(x, minY);
            ctx.lineTo(x, maxY);
            ctx.stroke();
          }

          // Roof outline/edge
          ctx.beginPath();
          roofPts.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.strokeStyle = isSelected ? '#FFD700' : '#5D3A2E';
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.stroke();
        }
        ctx.restore();

        // Draw editable roof anchor points when selected
        if (isSelected && feature.roofPoints) {
          feature.roofPoints.forEach(rp => {
            const rpx = feature.x + rp.x;
            const rpy = feature.y + rp.y;
            const size = 7;
            const isRoofSelected = selectedRoofPoint === rp.id;
            ctx.fillStyle = isRoofSelected ? '#FFD700' : '#FFFFFF';
            ctx.strokeStyle = isRoofSelected ? '#FF8800' : '#333333';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(rpx, rpy, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        }
      } else if (feature.type === 'shrub') {
        // Various shrub types
        const isSelected = selectedFeature === feature.id;
        const shrubType = feature.shrubType || 'round';
        const radius = feature.radius || 30;
        if (shrubType === 'round') {
          // Round green shrub
          ctx.fillStyle = '#5A8F3D';
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, radius, 0, 2 * Math.PI);
          ctx.fill();

          // Add texture circles
          for (let i = 0; i < 5; i++) {
            const angle = i / 5 * Math.PI * 2;
            const dist = radius * 0.5;
            ctx.fillStyle = i % 2 === 0 ? '#6BA04A' : '#4F7D35';
            ctx.beginPath();
            ctx.arc(feature.x + Math.cos(angle) * dist, feature.y + Math.sin(angle) * dist, radius * 0.35, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else if (shrubType === 'flowering') {
          // Flowering shrub with colorful flowers
          ctx.fillStyle = '#5A8F3D';
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, radius, 0, 2 * Math.PI);
          ctx.fill();

          // Add flowers
          const flowerColors = ['#FF6B9D', '#FFD93D', '#9B59B6', '#FF8C42'];
          for (let i = 0; i < 8; i++) {
            const angle = i / 8 * Math.PI * 2;
            const dist = radius * 0.6;
            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.beginPath();
            ctx.arc(feature.x + Math.cos(angle) * dist, feature.y + Math.sin(angle) * dist, radius * 0.2, 0, 2 * Math.PI);
            ctx.fill();
          }
        } else if (shrubType === 'hedge') {
          // Rectangular hedge
          const width = radius * 2;
          const height = radius;
          ctx.fillStyle = '#4A7D35';
          ctx.fillRect(feature.x - width / 2, feature.y - height / 2, width, height);

          // Hedge texture
          ctx.strokeStyle = 'rgba(30, 50, 20, 0.3)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++) {
            ctx.strokeRect(feature.x - width / 2 + i * (width / 5), feature.y - height / 2, width / 5, height);
          }
        }
        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(70, 120, 50, 0.5)';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();
      } else if (feature.type === 'umbrella') {
        // Patio umbrella
        const isSelected = selectedFeature === feature.id;
        const umbrellaColor = feature.color || '#4A9FD8';

        // Umbrella pole
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(feature.x - 3, feature.y - 10, 6, 30);

        // Umbrella canopy (top-down view with segments)
        const segments = 8;
        const radius = 35;
        for (let i = 0; i < segments; i++) {
          const angle1 = i / segments * Math.PI * 2;
          const angle2 = (i + 1) / segments * Math.PI * 2;
          ctx.fillStyle = i % 2 === 0 ? umbrellaColor : shadeColor(umbrellaColor, -10);
          ctx.beginPath();
          ctx.moveTo(feature.x, feature.y);
          ctx.arc(feature.x, feature.y, radius, angle1, angle2);
          ctx.closePath();
          ctx.fill();
        }

        // Umbrella outline
        ctx.strokeStyle = isSelected ? '#FFD700' : '#2E5D7A';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (feature.type === 'fence') {
        // Fence with editable spline curve
        const isSelected = selectedFeature === feature.id;
        const fencePoints = feature.roofPoints || [{
          x: feature.x - 80,
          y: feature.y,
          id: 'fp1'
        }, {
          x: feature.x,
          y: feature.y - 20,
          id: 'fp2'
        }, {
          x: feature.x + 80,
          y: feature.y,
          id: 'fp3'
        }];

        // Draw fence spline curve
        ctx.strokeStyle = '#8B6F47';
        ctx.lineWidth = 4;
        ctx.beginPath();

        // Draw smooth curve through points
        fencePoints.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            const prevPoint = fencePoints[i - 1];
            const cp1x = prevPoint.x + (point.x - prevPoint.x) / 3;
            const cp1y = prevPoint.y + (point.y - prevPoint.y) / 3;
            const cp2x = prevPoint.x + 2 * (point.x - prevPoint.x) / 3;
            const cp2y = prevPoint.y + 2 * (point.y - prevPoint.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y);
          }
        });
        ctx.stroke();

        // Draw fence posts along the curve
        fencePoints.forEach(point => {
          ctx.fillStyle = '#A67C52';
          ctx.fillRect(point.x - 3, point.y - 15, 6, 30);
        });

        // Draw fence rails
        ctx.strokeStyle = isSelected ? '#FFD700' : '#6B5435';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        fencePoints.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y - 10);else {
            const prevPoint = fencePoints[i - 1];
            const cp1x = prevPoint.x + (point.x - prevPoint.x) / 3;
            const cp1y = prevPoint.y - 10 + (point.y - prevPoint.y) / 3;
            const cp2x = prevPoint.x + 2 * (point.x - prevPoint.x) / 3;
            const cp2y = prevPoint.y - 10 + 2 * (point.y - prevPoint.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y - 10);
          }
        });
        ctx.stroke();
        ctx.beginPath();
        fencePoints.forEach((point, i) => {
          if (i === 0) ctx.moveTo(point.x, point.y + 10);else {
            const prevPoint = fencePoints[i - 1];
            const cp1x = prevPoint.x + (point.x - prevPoint.x) / 3;
            const cp1y = prevPoint.y + 10 + (point.y - prevPoint.y) / 3;
            const cp2x = prevPoint.x + 2 * (point.x - prevPoint.x) / 3;
            const cp2y = prevPoint.y + 10 + 2 * (point.y - prevPoint.y) / 3;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, point.x, point.y + 10);
          }
        });
        ctx.stroke();

        // Draw editable anchor points for fence
        fencePoints.forEach(point => {
          const size = 8;
          const isPointSelected = selectedRoofPoint === point.id;
          ctx.fillStyle = isPointSelected ? '#FFD700' : '#ffffff';
          ctx.strokeStyle = isPointSelected ? '#FFA500' : '#8B6F47';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      } else if (feature.type === 'pathway') {
        // Decorative pathway/paver pattern
        const isSelected = selectedFeature === feature.id;
        const pathwayType = feature.pathwayType || 'straight';
        const width = feature.width || 60;
        const height = feature.height || 120;
        if (pathwayType === 'circular') {
          // Circular paver pattern
          const radius = width / 2;
          const rings = 3;
          for (let ring = 0; ring < rings; ring++) {
            const ringRadius = radius * ((ring + 1) / rings);
            const segments = 8 + ring * 4;
            for (let seg = 0; seg < segments; seg++) {
              const angle1 = seg / segments * Math.PI * 2;
              const angle2 = (seg + 1) / segments * Math.PI * 2;
              ctx.fillStyle = seg % 2 === 0 ? '#C9B8A0' : '#B5A48D';
              ctx.beginPath();
              ctx.moveTo(feature.x, feature.y);
              ctx.arc(feature.x, feature.y, ringRadius, angle1, angle2);
              if (ring > 0) {
                const prevRadius = radius * (ring / rings);
                ctx.arc(feature.x, feature.y, prevRadius, angle2, angle1, true);
              }
              ctx.closePath();
              ctx.fill();

              // Grout lines
              ctx.strokeStyle = 'rgba(100, 80, 60, 0.4)';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        } else {
          // Rectangular paver pattern
          const paverWidth = 20;
          const paverHeight = 20;
          const cols = Math.floor(width / paverWidth);
          const rows = Math.floor(height / paverHeight);
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = feature.x - width / 2 + col * paverWidth;
              const y = feature.y - height / 2 + row * paverHeight;
              ctx.fillStyle = (row + col) % 2 === 0 ? '#D4C4B0' : '#BFB0A0';
              ctx.fillRect(x, y, paverWidth - 1, paverHeight - 1);

              // Grout
              ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, paverWidth - 1, paverHeight - 1);
            }
          }
        }
        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(100, 80, 60, 0.5)';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(feature.x - width / 2, feature.y - height / 2, width, height);
      }
      ctx.restore();
    });

    // Draw features with better styling
    features.filter(f => f.type !== 'grass' && f.type !== 'home').forEach(feature => {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      const isSelected = selectedFeature === feature.id;
      if (feature.type === 'stairs') {
        // Stairs with individual steps
        const steps = feature.steps || 3;
        const stairWidth = 30;
        const stepHeight = 6;
        const angle = feature.angle || 0;
        ctx.save();
        ctx.translate(feature.x, feature.y);
        ctx.rotate(angle);
        for (let i = 0; i < steps; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#6BB6D6' : '#5BA5C6';
          ctx.strokeStyle = isSelected ? '#FFD700' : '#1a4d6d';
          ctx.lineWidth = isSelected ? 3 : 2;
          const stepWidth = stairWidth - i * 4;
          ctx.fillRect(-stepWidth / 2, -steps * stepHeight / 2 + i * stepHeight, stepWidth, stepHeight - 1);
          ctx.strokeRect(-stepWidth / 2, -steps * stepHeight / 2 + i * stepHeight, stepWidth, stepHeight - 1);
        }
        ctx.restore();
      } else if (feature.type === 'light') {
        // Simple LED light - flat rendering
        const lightColor = '#FFD700';

        // Calculate angle pointing toward pool center
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        const angleToCenter = Math.atan2(centerY - feature.y, centerX - feature.x);
        const lightAngle = feature.angle || angleToCenter;

        // Simple LED housing
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 10, 0, 2 * Math.PI);
        ctx.fill();

        // LED core
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 7, 0, 2 * Math.PI);
        ctx.fill();

        // Rim
        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 9, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (feature.type === 'jet') {
        const isInsidePoolArea = isInsidePool(feature.x, feature.y);
        const nearWall = findNearestWallPoint(feature.x, feature.y);
        const distToWall = Math.sqrt((feature.x - nearWall.x) ** 2 + (feature.y - nearWall.y) ** 2);

        // Determine jet angle - either from wall or toward center if on floor
        let jetAngle = feature.angle;
        if (!jetAngle) {
          if (distToWall < 50) {
            jetAngle = nearWall.angle + Math.PI / 2;
          } else {
            const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
            const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
            jetAngle = Math.atan2(centerY - feature.y, centerX - feature.x);
          }
        }

        // Draw jet cone pointing inward
        ctx.save();
        ctx.translate(feature.x, feature.y);
        ctx.rotate(jetAngle);
        ctx.fillStyle = 'rgba(160, 216, 241, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40, -15);
        ctx.lineTo(40, 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(46, 134, 171, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Jet body with ripples
        ctx.strokeStyle = 'rgba(160, 216, 241, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 2; i++) {
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, 8 + i * 4, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.fillStyle = '#5BA5C6';
        ctx.strokeStyle = isSelected ? '#FFD700' : '#2E86AB';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (feature.type === 'tree') {
        // Tree with different types
        const treeType = feature.treeType || 'oak';
        const isSelected = selectedFeature === feature.id;
        if (treeType === 'palm') {
          // Palm tree trunk
          ctx.fillStyle = '#8B6F47';
          ctx.fillRect(feature.x - 6, feature.y - 20, 12, 60);

          // Palm fronds
          ctx.strokeStyle = '#2D5016';
          ctx.lineWidth = 4;
          for (let i = 0; i < 8; i++) {
            const angle = i / 8 * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(feature.x, feature.y - 20);
            ctx.quadraticCurveTo(feature.x + Math.cos(angle) * 20, feature.y - 30, feature.x + Math.cos(angle) * 40, feature.y - 25);
            ctx.stroke();
          }
        } else if (treeType === 'pine') {
          // Pine tree trunk
          ctx.fillStyle = '#6B4423';
          ctx.fillRect(feature.x - 5, feature.y + 10, 10, 40);

          // Pine layers
          const layers = 4;
          for (let i = 0; i < layers; i++) {
            ctx.fillStyle = '#1C4D1F';
            ctx.beginPath();
            const y = feature.y - 10 - i * 15;
            const width = 50 - i * 8;
            ctx.moveTo(feature.x, y);
            ctx.lineTo(feature.x - width / 2, y + 20);
            ctx.lineTo(feature.x + width / 2, y + 20);
            ctx.closePath();
            ctx.fill();
          }
        } else {
          // Oak tree trunk
          ctx.fillStyle = '#5C4033';
          ctx.fillRect(feature.x - 8, feature.y, 16, 50);

          // Oak canopy
          const canopyGradient = ctx.createRadialGradient(feature.x, feature.y - 10, 0, feature.x, feature.y - 10, 45);
          canopyGradient.addColorStop(0, '#4A7C3C');
          canopyGradient.addColorStop(1, '#2D5016');
          ctx.fillStyle = canopyGradient;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y - 10, 45, 0, 2 * Math.PI);
          ctx.fill();

          // Canopy detail circles
          ctx.beginPath();
          ctx.arc(feature.x - 20, feature.y - 15, 30, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(feature.x + 20, feature.y - 15, 30, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Selection indicator
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, 60, 0, 2 * Math.PI);
          ctx.stroke();
        }
      } else if (feature.type === 'fountain') {
        // Decorative fountain
        const isSelected = selectedFeature === feature.id;

        // Fountain base
        ctx.fillStyle = '#A0826D';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y + 20, 30, 0, 2 * Math.PI);
        ctx.fill();

        // Fountain bowl
        ctx.fillStyle = '#C5B4A0';
        ctx.beginPath();
        ctx.ellipse(feature.x, feature.y + 15, 25, 8, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Water
        const waterGradient = ctx.createRadialGradient(feature.x, feature.y + 15, 0, feature.x, feature.y + 15, 20);
        waterGradient.addColorStop(0, 'rgba(160, 216, 241, 0.8)');
        waterGradient.addColorStop(1, 'rgba(91, 165, 198, 0.6)');
        ctx.fillStyle = waterGradient;
        ctx.beginPath();
        ctx.ellipse(feature.x, feature.y + 15, 20, 6, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Static water spray
        for (let i = 0; i < 5; i++) {
          const angle = i / 5 * Math.PI * 2;
          const height = 15;
          ctx.strokeStyle = 'rgba(160, 216, 241, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(feature.x, feature.y + 15);
          ctx.quadraticCurveTo(feature.x + Math.cos(angle) * 8, feature.y - height, feature.x + Math.cos(angle) * 4, feature.y + 15);
          ctx.stroke();
        }

        // Center spray
        ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(feature.x, feature.y + 15);
        ctx.lineTo(feature.x, feature.y - 20);
        ctx.stroke();

        // Selection
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y + 20, 35, 0, 2 * Math.PI);
          ctx.stroke();
        }
      } else if (feature.type === 'pool-seat') {
        const w = feature.seatWidth || 60;
        const d = feature.seatDepth || 20;
        const angle = feature.angle || 0;
        ctx.save();
        ctx.translate(feature.x, feature.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#6BB6D6';
        ctx.strokeStyle = isSelected ? '#FFD700' : '#1a4d6d';
        ctx.lineWidth = isSelected ? 3 : 2;
        const r = 4;
        ctx.beginPath();
        ctx.moveTo(-w/2 + r, -d/2);
        ctx.lineTo(w/2 - r, -d/2);
        ctx.quadraticCurveTo(w/2, -d/2, w/2, -d/2 + r);
        ctx.lineTo(w/2, d/2);
        ctx.lineTo(-w/2, d/2);
        ctx.lineTo(-w/2, -d/2 + r);
        ctx.quadraticCurveTo(-w/2, -d/2, -w/2 + r, -d/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(-w/2, d/4, w, d/4);
        ctx.restore();
      } else if (feature.type === 'pool-wall') {
        const w = feature.width || 80;
        const h = 12;
        const angle = feature.angle || 0;
        ctx.save();
        ctx.translate(feature.x, feature.y);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(-w/2 + 3, -h/2 + 3, w, h);
        ctx.fillStyle = '#B5A48D';
        ctx.strokeStyle = isSelected ? '#FFD700' : '#8B7355';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.fillRect(-w/2, -h/2, w, h);
        ctx.strokeRect(-w/2, -h/2, w, h);
        ctx.fillStyle = '#5C4033';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${(feature.wallHeight || 3)}'h`, 0, 3);
        ctx.restore();
      } else if (feature.type === 'diving-board') {
        const len = feature.length || 100;
        const angle = feature.angle || 0;
        ctx.save();
        ctx.translate(feature.x, feature.y);
        ctx.rotate(angle);
        ctx.fillStyle = '#E8DDD0';
        ctx.strokeStyle = isSelected ? '#FFD700' : '#8B7355';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.fillRect(0, -8, len * 0.7, 16);
        ctx.strokeRect(0, -8, len * 0.7, 16);
        ctx.fillStyle = '#888';
        ctx.fillRect(-8, -12, 8, 24);
        for (let i = 5; i < len * 0.65; i += 8) {
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(i, -5, 3, 10);
        }
        ctx.restore();
      } else if (feature.type === 'rock') {
        const sz = feature.rockSize === 'small' ? 12 : feature.rockSize === 'large' ? 28 : 20;
        ctx.fillStyle = '#9B8B7A';
        ctx.strokeStyle = isSelected ? '#FFD700' : '#6B5B4A';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(feature.x - sz * 0.4, feature.y - sz * 0.3);
        ctx.lineTo(feature.x + sz * 0.2, feature.y - sz * 0.5);
        ctx.lineTo(feature.x + sz * 0.5, feature.y - sz * 0.1);
        ctx.lineTo(feature.x + sz * 0.3, feature.y + sz * 0.4);
        ctx.lineTo(feature.x - sz * 0.3, feature.y + sz * 0.5);
        ctx.lineTo(feature.x - sz * 0.5, feature.y + sz * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.arc(feature.x - sz * 0.1, feature.y - sz * 0.1, sz * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (feature.type === 'boulder') {
        const sz = feature.rockSize === 'small' ? 25 : feature.rockSize === 'large' ? 50 : 35;
        const grad = ctx.createRadialGradient(feature.x - sz * 0.15, feature.y - sz * 0.15, 0, feature.x, feature.y, sz);
        grad.addColorStop(0, '#A89888');
        grad.addColorStop(1, '#6B5B4A');
        ctx.fillStyle = grad;
        ctx.strokeStyle = isSelected ? '#FFD700' : '#5A4A3A';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.ellipse(feature.x, feature.y, sz, sz * 0.75, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(feature.x + 4, feature.y + sz * 0.6, sz * 0.8, sz * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (feature.type === 'hedge-row') {
        const w = feature.width || 100;
        const h = 15;
        ctx.fillStyle = '#3A6B25';
        ctx.strokeStyle = isSelected ? '#FFD700' : '#2A5015';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.fillRect(feature.x - w / 2, feature.y - h / 2, w, h);
        ctx.strokeRect(feature.x - w / 2, feature.y - h / 2, w, h);
        for (let i = 1; i < Math.floor(w / 20); i++) {
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          const x = feature.x - w / 2 + i * 20;
          ctx.beginPath();
          ctx.moveTo(x, feature.y - h / 2);
          ctx.lineTo(x, feature.y + h / 2);
          ctx.stroke();
        }
      } else if (feature.type === 'plant-row') {
        const count = 5;
        const spacing = 18;
        const startX = feature.x - (count - 1) * spacing / 2;
        for (let i = 0; i < count; i++) {
          const cx = startX + i * spacing;
          ctx.fillStyle = i % 2 === 0 ? '#4A8538' : '#5B9649';
          ctx.beginPath();
          ctx.arc(cx, feature.y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.strokeRect(startX - 10, feature.y - 10, (count - 1) * spacing + 20, 20);
        }
      } else if (feature.type === 'landscape-light') {
        const color = feature.lightColor || '#fffacd';
        const glow = ctx.createRadialGradient(feature.x, feature.y, 0, feature.x, feature.y, 25);
        glow.addColorStop(0, color + '66');
        glow.addColorStop(1, color + '00');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, 28, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (feature.type === 'edging') {
        const w = 80;
        ctx.strokeStyle = isSelected ? '#FFD700' : '#8B7355';
        ctx.lineWidth = isSelected ? 4 : 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(feature.x - w / 2, feature.y);
        ctx.lineTo(feature.x + w / 2, feature.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (feature.type === 'grass-region') {
        const radius = feature.radius || 80;
        ctx.fillStyle = '#5A9547';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, radius, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2 + 0.3;
          const dist = (i * 7) % radius;
          ctx.fillStyle = i % 2 === 0 ? '#4A8538' : '#6BA557';
          ctx.fillRect(feature.x + Math.cos(angle) * dist, feature.y + Math.sin(angle) * dist, 2, 2);
        }
        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(70,120,50,0.5)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();
      } else if (feature.type === 'pond') {
        const rx = feature.radius || 60;
        const ry = rx * 0.7;
        const grad = ctx.createRadialGradient(feature.x, feature.y, 0, feature.x, feature.y, rx);
        grad.addColorStop(0, 'rgba(100,180,220,0.8)');
        grad.addColorStop(1, 'rgba(60,130,180,0.6)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(feature.x, feature.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.ellipse(feature.x, feature.y, rx * i / 4, ry * i / 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(feature.x, feature.y, rx + 5, ry + 5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (feature.type === 'stream') {
        ctx.strokeStyle = 'rgba(80,160,200,0.7)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(feature.x - 50, feature.y - 30);
        ctx.quadraticCurveTo(feature.x, feature.y - 10, feature.x + 20, feature.y + 20);
        ctx.quadraticCurveTo(feature.x + 40, feature.y + 40, feature.x + 60, feature.y + 30);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const t = (i + 1) / 4;
          const ax = feature.x - 50 + t * 110;
          const ay = feature.y - 30 + t * 60;
          ctx.beginPath();
          ctx.moveTo(ax - 4, ay - 3);
          ctx.lineTo(ax + 2, ay);
          ctx.lineTo(ax - 4, ay + 3);
          ctx.stroke();
        }
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, 70, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (feature.type === 'waterfall') {
        const w = 40;
        const h = 50;
        for (let i = 0; i < 4; i++) {
          const y = feature.y - h / 2 + i * (h / 4);
          const alpha = 0.3 + i * 0.15;
          ctx.fillStyle = `rgba(80,160,220,${alpha})`;
          ctx.fillRect(feature.x - w / 2, y, w, h / 5);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(feature.x, feature.y + h / 2, w / 2 + 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 3;
          ctx.strokeRect(feature.x - w / 2 - 5, feature.y - h / 2 - 5, w + 10, h + 15);
        }
      } else if (feature.type === 'jumping-jet') {
        ctx.strokeStyle = 'rgba(120,200,240,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(feature.x, feature.y);
        ctx.quadraticCurveTo(feature.x + 15, feature.y - 30, feature.x + 30, feature.y);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const t = i / 4;
          const dx = feature.x + t * 30;
          const dy = feature.y - Math.sin(t * Math.PI) * 30;
          ctx.fillStyle = 'rgba(120,200,240,0.5)';
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(feature.x + 15, feature.y - 10, 30, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (feature.type === 'sprinkler') {
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,200,240,0.4)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(feature.x + Math.cos(angle) * 6, feature.y + Math.sin(angle) * 6);
          ctx.lineTo(feature.x + Math.cos(angle) * 22, feature.y + Math.sin(angle) * 22);
          ctx.stroke();
        }
        if (isSelected) {
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, 26, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (feature.type === 'water-curtain') {
        const w = feature.width || 80;
        const h = 20;
        ctx.fillStyle = 'rgba(80,160,220,0.5)';
        ctx.fillRect(feature.x - w / 2, feature.y - h / 2, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < Math.floor(w / 8); i++) {
          const lx = feature.x - w / 2 + 4 + i * 8;
          ctx.beginPath();
          ctx.moveTo(lx, feature.y - h / 2);
          ctx.lineTo(lx, feature.y + h / 2);
          ctx.stroke();
        }
        ctx.strokeStyle = isSelected ? '#FFD700' : 'rgba(60,130,180,0.6)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeRect(feature.x - w / 2, feature.y - h / 2, w, h);
      }
      ctx.restore();
    });

    // Draw pending jet following cursor - show where it will snap
    if (pendingFeature === 'jet') {
      ctx.save();
      const nearWall = findNearestWallPoint(cursorPos.x, cursorPos.y);
      const distToWall = Math.sqrt((cursorPos.x - nearWall.x) ** 2 + (cursorPos.y - nearWall.y) ** 2);
      const isInsidePoolArea = isInsidePool(cursorPos.x, cursorPos.y);
      let previewX = cursorPos.x;
      let previewY = cursorPos.y;
      let previewAngle;

      // Show snap preview
      if (distToWall < 50 || !isInsidePoolArea) {
        previewX = nearWall.x;
        previewY = nearWall.y;
        previewAngle = nearWall.angle + Math.PI / 2;

        // Draw snap indicator line
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cursorPos.x, cursorPos.y);
        ctx.lineTo(previewX, previewY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Show it will place on floor
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        previewAngle = Math.atan2(centerY - previewY, centerX - previewX);
      }

      // Draw preview cone
      ctx.translate(previewX, previewY);
      ctx.rotate(previewAngle);
      ctx.fillStyle = 'rgba(160, 216, 241, 0.4)';
      ctx.strokeStyle = 'rgba(46, 134, 171, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, -15);
      ctx.lineTo(40, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = 'rgba(91, 165, 198, 0.7)';
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Draw North arrow in the top right corner
    const arrowX = canvasSize.width - 60;
    const arrowY = 50;
    const arrowSize = 40;
    ctx.save();

    // Arrow background circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, arrowSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // North arrow (pointing up)
    ctx.fillStyle = '#EF4444'; // Red for north pointer
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY - arrowSize / 2.5); // Top point
    ctx.lineTo(arrowX - 8, arrowY + 5); // Bottom left
    ctx.lineTo(arrowX, arrowY); // Center
    ctx.lineTo(arrowX + 8, arrowY + 5); // Bottom right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // South pointer (lighter)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + arrowSize / 2.5); // Bottom point
    ctx.lineTo(arrowX - 8, arrowY - 5); // Top left
    ctx.lineTo(arrowX, arrowY); // Center
    ctx.lineTo(arrowX + 8, arrowY - 5); // Top right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // "N" label
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', arrowX, arrowY - arrowSize / 1.5);

    // Helper function to draw curved segments based on curve type
    const drawCurvedSegment = (ctx: CanvasRenderingContext2D, p1: {
      x: number;
      y: number;
    }, p2: {
      x: number;
      y: number;
    }, curveType: 'linear' | 'curve' | 'arc' | 'freeform', isPreview = false) => {
      if (curveType === 'linear') {
        ctx.lineTo(p2.x, p2.y);
      } else if (curveType === 'curve') {
        // Smooth bezier curve
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy * 0.25;
        const perpY = dx * 0.25;
        ctx.quadraticCurveTo(midX + perpX, midY + perpY, p2.x, p2.y);
      } else if (curveType === 'arc') {
        // Circular arc
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy * 0.35;
        const perpY = dx * 0.35;
        ctx.quadraticCurveTo(midX + perpX, midY + perpY, p2.x, p2.y);
      } else if (curveType === 'freeform') {
        // Natural freeform with slight wobble
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const perpX = -dy * 0.15;
        const perpY = dx * 0.15;
        const cp1x = p1.x + dx * 0.3 + perpX * 0.5;
        const cp1y = p1.y + dy * 0.3 + perpY * 0.5;
        const cp2x = p1.x + dx * 0.7 - perpX * 0.3;
        const cp2y = p1.y + dy * 0.7 - perpY * 0.3;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    };

    // Draw symmetry guide lines when spline drawing is active
    if (splineDrawing.isActive && symmetryMode.enabled) {
      ctx.save();
      ctx.setLineDash([10, 6]);
      ctx.lineWidth = 1;
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;

      // Vertical symmetry line (for left-right symmetry)
      if (symmetryMode.axes === 'vertical' || symmetryMode.axes === 'both') {
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvasSize.height);
        ctx.stroke();

        // Draw center marker
        ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Horizontal symmetry line (for top-bottom symmetry)
      if (symmetryMode.axes === 'horizontal' || symmetryMode.axes === 'both') {
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvasSize.width, centerY);
        ctx.stroke();
      }

      // Draw mirrored ghost points for existing spline points
      if (splineDrawing.points.length > 0) {
        ctx.setLineDash([]);
        for (const pt of splineDrawing.points) {
          // Calculate mirrored positions
          const mirrorV = {
            x: 2 * centerX - pt.x,
            y: pt.y
          };
          const mirrorH = {
            x: pt.x,
            y: 2 * centerY - pt.y
          };
          const mirrorBoth = {
            x: 2 * centerX - pt.x,
            y: 2 * centerY - pt.y
          };

          // Draw vertical mirror ghost (if not on axis)
          if ((symmetryMode.axes === 'vertical' || symmetryMode.axes === 'both') && Math.abs(pt.x - centerX) > 5) {
            // Ghost point
            ctx.beginPath();
            ctx.arc(mirrorV.x, mirrorV.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.stroke();

            // Connection line to original
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(mirrorV.x, mirrorV.y);
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Draw horizontal mirror ghost (if not on axis)
          if ((symmetryMode.axes === 'horizontal' || symmetryMode.axes === 'both') && Math.abs(pt.y - centerY) > 5) {
            ctx.beginPath();
            ctx.arc(mirrorH.x, mirrorH.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.stroke();

            // Connection line
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(mirrorH.x, mirrorH.y);
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Draw diagonal mirror ghost (both axes)
          if (symmetryMode.axes === 'both' && Math.abs(pt.x - centerX) > 5 && Math.abs(pt.y - centerY) > 5) {
            ctx.beginPath();
            ctx.arc(mirrorBoth.x, mirrorBoth.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(180, 100, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.stroke();
          }
        }
        ctx.setLineDash([]);
      }

      // Draw snap indicators when cursor is near symmetry lines or mirror points
      const snappedPos = getSymmetrySnappedPosition(cursorPos.x, cursorPos.y);
      if (snappedPos.snappedVertical || snappedPos.snappedHorizontal || snappedPos.snappedToMirror) {
        ctx.setLineDash([]);

        // Highlight snap point
        ctx.beginPath();
        ctx.arc(snappedPos.x, snappedPos.y, 8, 0, Math.PI * 2);
        let snapColor = 'rgba(255, 200, 50, 0.9)';
        let snapLabel = 'SNAP';
        if (snappedPos.snappedToMirror) {
          snapColor = 'rgba(0, 255, 150, 0.9)';
          snapLabel = 'MIRROR';

          // Draw line from mirrored source point
          if (snappedPos.mirroredFromPoint) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(snappedPos.mirroredFromPoint.x, snappedPos.mirroredFromPoint.y);
            ctx.lineTo(snappedPos.x, snappedPos.y);
            ctx.strokeStyle = 'rgba(0, 255, 150, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.restore();
          }
        } else if (snappedPos.snappedVertical && snappedPos.snappedHorizontal) {
          snapColor = 'rgba(255, 200, 50, 0.9)';
          snapLabel = 'CENTER';
        } else if (snappedPos.snappedVertical) {
          snapColor = 'rgba(255, 100, 100, 0.9)';
          snapLabel = 'V-AXIS';
        } else if (snappedPos.snappedHorizontal) {
          snapColor = 'rgba(100, 100, 255, 0.9)';
          snapLabel = 'H-AXIS';
        }
        ctx.strokeStyle = snapColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Filled center for mirror snaps
        if (snappedPos.snappedToMirror) {
          ctx.fillStyle = 'rgba(0, 255, 150, 0.3)';
          ctx.fill();
        }

        // Snap label
        ctx.fillStyle = snapColor;
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(snapLabel, snappedPos.x, snappedPos.y - 12);
      }
      ctx.restore();
    }

    // Draw spline drawing preview when in draw mode
    if (splineDrawing.isActive && splineDrawing.points.length > 0) {
      ctx.save();

      // Draw preview of how the completed pool would look (filled shape preview)
      if (splineDrawing.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(splineDrawing.points[0].x, splineDrawing.points[0].y);
        for (let i = 1; i < splineDrawing.points.length; i++) {
          const prev = splineDrawing.points[i - 1];
          const curr = splineDrawing.points[i];
          drawCurvedSegment(ctx, prev, curr, curr.curveType);
        }
        // Preview closing line to first point
        const lastPoint = splineDrawing.points[splineDrawing.points.length - 1];
        const firstPoint = splineDrawing.points[0];
        drawCurvedSegment(ctx, lastPoint, firstPoint, splineDrawing.currentCurveType);
        ctx.closePath();
        ctx.fillStyle = 'rgba(46, 134, 171, 0.15)';
        ctx.fill();
      }

      // Draw wall segments with curve visualization
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splineDrawing.points[0].x, splineDrawing.points[0].y);
      for (let i = 1; i < splineDrawing.points.length; i++) {
        const prev = splineDrawing.points[i - 1];
        const curr = splineDrawing.points[i];
        drawCurvedSegment(ctx, prev, curr, curr.curveType);
      }
      ctx.stroke();

      // Always draw the closing line from last point back to first point (perimeter trace)
      if (splineDrawing.points.length >= 2) {
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = 'hsl(var(--primary) / 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const lastPt = splineDrawing.points[splineDrawing.points.length - 1];
        const firstPt = splineDrawing.points[0];
        ctx.moveTo(lastPt.x, lastPt.y);
        drawCurvedSegment(ctx, lastPt, firstPt, splineDrawing.currentCurveType);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw preview line to cursor with current curve type
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const lastPoint = splineDrawing.points[splineDrawing.points.length - 1];
      ctx.moveTo(lastPoint.x, lastPoint.y);
      drawCurvedSegment(ctx, lastPoint, cursorPos, splineDrawing.currentCurveType);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw distance measurements and curve type indicator on each segment
      for (let i = 1; i < splineDrawing.points.length; i++) {
        const prev = splineDrawing.points[i - 1];
        const curr = splineDrawing.points[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;

        // Calculate linear distance in feet
        const distPx = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
        const distFeet = (distPx / scale).toFixed(1);

        // Calculate angle for text rotation
        const angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);

        // Offset label perpendicular to the line
        const offsetDist = 20;
        const perpX = Math.cos(angle + Math.PI / 2) * offsetDist;
        const perpY = Math.sin(angle + Math.PI / 2) * offsetDist;

        // Draw distance label background
        ctx.save();
        ctx.translate(midX + perpX, midY + perpY);
        // Rotate text to be readable (flip if upside down)
        let textAngle = angle;
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
          textAngle += Math.PI;
        }
        ctx.rotate(textAngle);

        // Draw background pill
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        const textWidth = ctx.measureText(distFeet + ' ft').width + 12;
        ctx.beginPath();
        ctx.roundRect(-textWidth / 2, -10, textWidth, 20, 4);
        ctx.fill();

        // Draw distance text
        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(distFeet + ' ft', 0, 0);
        ctx.restore();

        // Small curve type badge (positioned on the line)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(midX, midY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = curr.curveType === 'linear' ? 'L' : curr.curveType === 'curve' ? 'C' : curr.curveType === 'arc' ? 'A' : 'F';
        ctx.fillText(label, midX, midY);
      }

      // Draw distance from last point to cursor (live measurement)
      if (splineDrawing.points.length >= 1) {
        const lastPt = splineDrawing.points[splineDrawing.points.length - 1];
        const distToCursorPx = Math.sqrt(Math.pow(cursorPos.x - lastPt.x, 2) + Math.pow(cursorPos.y - lastPt.y, 2));
        const distToCursorFeet = (distToCursorPx / scale).toFixed(1);
        if (distToCursorPx > 10) {
          // Only show if cursor is not too close
          const midX = (lastPt.x + cursorPos.x) / 2;
          const midY = (lastPt.y + cursorPos.y) / 2;
          const angle = Math.atan2(cursorPos.y - lastPt.y, cursorPos.x - lastPt.x);

          // Offset perpendicular to line
          const offsetDist = 25;
          const perpX = Math.cos(angle + Math.PI / 2) * offsetDist;
          const perpY = Math.sin(angle + Math.PI / 2) * offsetDist;
          ctx.save();
          ctx.translate(midX + perpX, midY + perpY);
          let textAngle = angle;
          if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
            textAngle += Math.PI;
          }
          ctx.rotate(textAngle);

          // Draw background pill for cursor distance
          ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
          const textWidth = ctx.measureText(distToCursorFeet + ' ft').width + 14;
          ctx.beginPath();
          ctx.roundRect(-textWidth / 2, -11, textWidth, 22, 5);
          ctx.fill();

          // Draw distance text
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(distToCursorFeet + ' ft', 0, 0);
          ctx.restore();
        }
      }

      // Draw closing segment distance (from last to first)
      if (splineDrawing.points.length >= 2) {
        const lastPt = splineDrawing.points[splineDrawing.points.length - 1];
        const firstPt = splineDrawing.points[0];
        const closingDistPx = Math.sqrt(Math.pow(firstPt.x - lastPt.x, 2) + Math.pow(firstPt.y - lastPt.y, 2));
        const closingDistFeet = (closingDistPx / scale).toFixed(1);
        const midX = (lastPt.x + firstPt.x) / 2;
        const midY = (lastPt.y + firstPt.y) / 2;
        const angle = Math.atan2(firstPt.y - lastPt.y, firstPt.x - lastPt.x);
        const offsetDist = 20;
        const perpX = Math.cos(angle + Math.PI / 2) * offsetDist;
        const perpY = Math.sin(angle + Math.PI / 2) * offsetDist;
        ctx.save();
        ctx.translate(midX + perpX, midY + perpY);
        let textAngle = angle;
        if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
          textAngle += Math.PI;
        }
        ctx.rotate(textAngle);

        // Draw background pill (dimmed for closing segment)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const textWidth = ctx.measureText(closingDistFeet + ' ft').width + 12;
        ctx.beginPath();
        ctx.roundRect(-textWidth / 2, -10, textWidth, 20, 4);
        ctx.fill();

        // Draw distance text (dimmed)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(closingDistFeet + ' ft', 0, 0);
        ctx.restore();
      }

      // Draw spline points
      splineDrawing.points.forEach((sp, i) => {
        const isFirst = i === 0;
        const isSelectedDrawPoint = selectedDrawPointId === sp.id;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, isFirst ? 10 : 7, 0, 2 * Math.PI);
        ctx.fillStyle = isSelectedDrawPoint ? '#F97316' : isFirst ? 'hsl(var(--primary))' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = isSelectedDrawPoint ? '#F97316' : 'hsl(var(--primary))';
        ctx.lineWidth = isSelectedDrawPoint ? 3 : 2;
        ctx.stroke();

        // Selection ring
        if (isSelectedDrawPoint) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 13, 0, 2 * Math.PI);
          ctx.strokeStyle = '#F97316';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Point number label
        ctx.fillStyle = isSelectedDrawPoint || isFirst ? '#fff' : 'hsl(var(--primary))';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((i + 1).toString(), sp.x, sp.y);

        // Show close indicator on first point when hovering near it
        if (isFirst && splineDrawing.points.length >= 3) {
          const distToFirst = Math.sqrt(Math.pow(cursorPos.x - sp.x, 2) + Math.pow(cursorPos.y - sp.y, 2));
          if (distToFirst < 15) {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 14, 0, 2 * Math.PI);
            ctx.strokeStyle = '#22C55E';
            ctx.lineWidth = 3;
            ctx.stroke();

            // "Close" label
            ctx.fillStyle = '#22C55E';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('Close', sp.x, sp.y - 22);
          }
        }
      });
      ctx.restore();
    }

    // Draw additional pools/spas (rendered with the same look as the main pool)
    additionalPools.forEach((pool, poolIndex) => {
      if (pool.points.length < 3) return;
      const isIntegrated = pool.featureType === 'spillover-spa' || pool.featureType === 'tanning-ledge';
      const isSeparatePool = pool.featureType === 'regular' || !pool.featureType;
      const isSelected = selectedAdditionalPool === pool.id;

      // Draw deck ONLY for separate/regular pools (not for integrated features like spas/tanning ledges)
      // Integrated features share the main pool's deck
      if (isSeparatePool) {
        const poolHardscapePoints = additionalDeckPoints[pool.id] || generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset);
        if (paverTexture && poolHardscapePoints.length >= 3) {
          const img = paverTexture;
          ctx.save();

          // Build deck path with water cutouts using evenodd
          ctx.beginPath();

          // Outer deck boundary (clockwise)
          ctx.moveTo(poolHardscapePoints[0].x, poolHardscapePoints[0].y);
          for (let i = 1; i < poolHardscapePoints.length; i++) {
            ctx.lineTo(poolHardscapePoints[i].x, poolHardscapePoints[i].y);
          }
          ctx.closePath();

          // Cut out this pool's water area (counter-clockwise by reversing)
          const reversedPoints = [...pool.points].reverse();
          ctx.moveTo(reversedPoints[0].x, reversedPoints[0].y);
          for (let i = 1; i < reversedPoints.length; i++) {
            ctx.lineTo(reversedPoints[i].x, reversedPoints[i].y);
          }
          ctx.closePath();

          // Cut out main pool water area
          if (points.length >= 3) {
            const reversedMain = [...points].reverse();
            ctx.moveTo(reversedMain[0].x, reversedMain[0].y);
            for (let i = 1; i < reversedMain.length; i++) {
              ctx.lineTo(reversedMain[i].x, reversedMain[i].y);
            }
            ctx.closePath();
          }

          // Cut out all other additional pools' water areas
          additionalPools.forEach((otherPool, otherIndex) => {
            if (otherIndex !== poolIndex && otherPool.points.length >= 3) {
              const reversedOther = [...otherPool.points].reverse();
              ctx.moveTo(reversedOther[0].x, reversedOther[0].y);
              for (let i = 1; i < reversedOther.length; i++) {
                ctx.lineTo(reversedOther[i].x, reversedOther[i].y);
              }
              ctx.closePath();
            }
          });
          ctx.clip('evenodd');

          // Draw paver tiles
          const hsMinX = Math.min(...poolHardscapePoints.map(p => p.x));
          const hsMaxX = Math.max(...poolHardscapePoints.map(p => p.x));
          const hsMinY = Math.min(...poolHardscapePoints.map(p => p.y));
          const hsMaxY = Math.max(...poolHardscapePoints.map(p => p.y));
          const numPaversX = Math.ceil((hsMaxX - hsMinX) / paverSizeInPixels) + 1;
          const numPaversY = Math.ceil((hsMaxY - hsMinY) / paverSizeInPixels) + 1;
          for (let i = 0; i < numPaversX; i++) {
            for (let j = 0; j < numPaversY; j++) {
              const x = hsMinX + i * paverSizeInPixels;
              const y = hsMinY + j * paverSizeInPixels;
              ctx.drawImage(img, x, y, paverSizeInPixels, paverSizeInPixels);
              ctx.strokeStyle = 'rgba(100, 80, 60, 0.2)';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, paverSizeInPixels, paverSizeInPixels);
            }
          }
          ctx.restore();
        }
      }

      // Draw pool body + coping + liner texture
      // For integrated features (merged), draw coping only on edges facing deck (outside main pool)

      // Compute which edges are outside the main pool (need coping) vs inside (no coping - water merge)
      const edgesOutsideMainPool: boolean[] = [];
      if (isIntegrated && pool.isMerged !== false) {
        for (let i = 0; i < pool.points.length; i++) {
          const p1 = pool.points[i];
          const p2 = pool.points[(i + 1) % pool.points.length];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          // Edge is outside main pool if its midpoint is NOT inside main pool
          edgesOutsideMainPool.push(!isPointInPolygon(midX, midY, points));
        }
      }
      ctx.save();
      ctx.beginPath();
      if (pool.shape === 'rectangle') {
        ctx.moveTo(pool.points[0].x, pool.points[0].y);
        for (let i = 1; i < pool.points.length; i++) {
          ctx.lineTo(pool.points[i].x, pool.points[i].y);
        }
        ctx.closePath();
      } else if (pool.shape === 'freeform' && pool.points.some(p => p.curveType)) {
        ctx.moveTo(pool.points[0].x, pool.points[0].y);
        for (let i = 1; i < pool.points.length; i++) {
          drawPoolSegment(ctx, pool.points[i - 1], pool.points[i]);
        }
        drawPoolSegment(ctx, pool.points[pool.points.length - 1], pool.points[0]);
      } else {
        for (let i = 0; i < pool.points.length; i++) {
          const p0 = pool.points[(i - 1 + pool.points.length) % pool.points.length];
          const p1 = pool.points[i];
          const p2 = pool.points[(i + 1) % pool.points.length];
          const p3 = pool.points[(i + 2) % pool.points.length];
          if (i === 0) ctx.moveTo(p1.x, p1.y);
          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
        ctx.closePath();
      }

      // Draw coping - for integrated merged features, only on deck-facing edges (excluding spillover edges)
      const copingTexture = textureLODsRef.current ? getTextureForLOD(textureLODsRef.current.coping, zoomLevel) : null;
      const spilloverEdges = pool.spilloverEdges || [];
      if (isIntegrated && pool.isMerged !== false && edgesOutsideMainPool.length > 0) {
        // Draw coping only on edges that are OUTSIDE main pool AND not spillover edges
        ctx.save();
        for (let i = 0; i < pool.points.length; i++) {
          const isSpillover = spilloverEdges.includes(i);
          if (edgesOutsideMainPool[i] && !isSpillover) {
            const p1 = pool.points[i];
            const p2 = pool.points[(i + 1) % pool.points.length];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);

            // Draw segment with curve type if applicable
            if (pool.shape === 'freeform' && p1.curveType) {
              drawPoolSegment(ctx, p1, p2);
            } else {
              ctx.lineTo(p2.x, p2.y);
            }
            if (copingTexture) {
              ctx.lineWidth = paverSizeInPixels;
              const copingPattern = ctx.createPattern(copingTexture, 'repeat');
              if (copingPattern) {
                ctx.strokeStyle = copingPattern;
                ctx.stroke();
              }
            } else {
              ctx.lineWidth = copingThickness * 2;
              ctx.strokeStyle = '#8B7355';
              ctx.stroke();
            }
          }

          // Draw spillover edge indicator (water-fall effect)
          if (isSpillover && edgesOutsideMainPool[i]) {
            const p1 = pool.points[i];
            const p2 = pool.points[(i + 1) % pool.points.length];

            // Create water-fall gradient
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(70, 180, 240, 0.9)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0.8)');
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            if (pool.shape === 'freeform' && p1.curveType) {
              drawPoolSegment(ctx, p1, p2);
            } else {
              ctx.lineTo(p2.x, p2.y);
            }
            ctx.lineWidth = 8;
            ctx.strokeStyle = gradient;
            ctx.stroke();

            // Add ripple effect lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        ctx.restore();
      } else {
        // Draw full coping for non-merged or separate pools (excluding spillover edges)
        if (copingTexture) {
          ctx.save();
          ctx.lineWidth = paverSizeInPixels;
          const copingPattern = ctx.createPattern(copingTexture, 'repeat');
          if (copingPattern) {
            ctx.strokeStyle = copingPattern;
            ctx.stroke();
          }
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = paverSizeInPixels + 2;
          ctx.globalCompositeOperation = 'destination-over';
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
          ctx.restore();
        } else {
          ctx.lineWidth = copingThickness * 2;
          ctx.strokeStyle = '#8B7355';
          ctx.stroke();
        }
      }

      // If selected, add highlight on all edges
      if (isSelected) {
        ctx.beginPath();
        ctx.moveTo(pool.points[0].x, pool.points[0].y);
        for (let i = 1; i < pool.points.length; i++) {
          if (pool.shape === 'freeform' && pool.points[i - 1].curveType) {
            drawPoolSegment(ctx, pool.points[i - 1], pool.points[i]);
          } else {
            ctx.lineTo(pool.points[i].x, pool.points[i].y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw spillover edge click indicators when spa is selected
      if (isSelected && pool.featureType === 'spillover-spa') {
        for (let i = 0; i < pool.points.length; i++) {
          if (edgesOutsideMainPool[i]) {
            const p1 = pool.points[i];
            const p2 = pool.points[(i + 1) % pool.points.length];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const isSpillover = spilloverEdges.includes(i);

            // Draw clickable spillover toggle button
            ctx.beginPath();
            ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
            ctx.fillStyle = isSpillover ? 'rgba(70, 180, 240, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            ctx.strokeStyle = isSpillover ? '#2E86AB' : '#666666';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icon
            ctx.fillStyle = isSpillover ? '#ffffff' : '#666666';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isSpillover ? '💧' : '+', midX, midY);

            // Label
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = '9px Arial';
            ctx.fillText(isSpillover ? 'Spillover' : 'Add Spillover', midX, midY + 20);
          }
        }
      }

      // Draw merge point indicators for integrated features (editable)
      if (isIntegrated && pool.isMerged !== false && isSelected) {
        for (let i = 0; i < pool.points.length; i++) {
          const isOutside = edgesOutsideMainPool[i];
          const wasOutside = edgesOutsideMainPool[(i - 1 + pool.points.length) % pool.points.length];

          // Transition points (where coping starts/ends) are merge points
          if (isOutside !== wasOutside) {
            const pt = pool.points[i];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF6B6B';
            ctx.fill();
            ctx.strokeStyle = '#CC0000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#CC0000';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⟷', pt.x, pt.y - 15);
          }
        }
      }

      // Fill water with pool texture - MUST rebuild path before clipping
      ctx.save();

      // Rebuild the pool shape path for water fill
      ctx.beginPath();
      if (pool.shape === 'rectangle') {
        ctx.moveTo(pool.points[0].x, pool.points[0].y);
        for (let i = 1; i < pool.points.length; i++) {
          ctx.lineTo(pool.points[i].x, pool.points[i].y);
        }
      } else if (pool.shape === 'freeform' && pool.points.some(p => p.curveType)) {
        ctx.moveTo(pool.points[0].x, pool.points[0].y);
        for (let i = 1; i < pool.points.length; i++) {
          drawPoolSegment(ctx, pool.points[i - 1], pool.points[i]);
        }
        drawPoolSegment(ctx, pool.points[pool.points.length - 1], pool.points[0]);
      } else {
        for (let i = 0; i < pool.points.length; i++) {
          const p0 = pool.points[(i - 1 + pool.points.length) % pool.points.length];
          const p1 = pool.points[i];
          const p2 = pool.points[(i + 1) % pool.points.length];
          const p3 = pool.points[(i + 2) % pool.points.length];
          if (i === 0) ctx.moveTo(p1.x, p1.y);
          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
      }
      ctx.closePath();
      ctx.clip();
      const poolTextureImg = new Image();
      poolTextureImg.src = poolTextureSapphire;
      if (poolTextureImg.complete) {
        const pattern = ctx.createPattern(poolTextureImg, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fill();
        }
      } else {
        const linerTexture = textureLODsRef.current ? getTextureForLOD(textureLODsRef.current.liner, zoomLevel) : null;
        if (linerTexture) {
          const pattern = ctx.createPattern(linerTexture, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fill();
          }
        } else {
          ctx.fillStyle = '#5BC5D9';
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.restore();

      // Draw anchor points for additional pools (like main pool)
      pool.points.forEach(point => {
        const size = 10;
        const isPointSelected = isSelected;
        ctx.fillStyle = isPointSelected ? '#10B981' : '#ffffff';
        ctx.strokeStyle = isPointSelected ? '#059669' : '#10B981';
        ctx.lineWidth = 2;
        ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
        ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
      });

      // Draw measurements for additional pool edges (like main pool)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = 1;
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < pool.points.length; i++) {
        const current = pool.points[i];
        const next = pool.points[(i + 1) % pool.points.length];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        const distance = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)) / scale;

        // Only show if segment is long enough
        if (distance > 2) {
          const angle = Math.atan2(next.y - current.y, next.x - current.x);
          const offset = -15; // Inside the pool
          const offsetX = Math.cos(angle + Math.PI / 2) * offset;
          const offsetY = Math.sin(angle + Math.PI / 2) * offset;

          // Draw dimension label with background
          const label = `${distance.toFixed(1)}'`;
          const metrics = ctx.measureText(label);
          const padding = 3;
          ctx.fillStyle = isIntegrated ? 'rgba(46, 134, 171, 0.85)' : 'rgba(255, 255, 255, 0.85)';
          ctx.fillRect(midX + offsetX - metrics.width / 2 - padding, midY + offsetY - 7, metrics.width + padding * 2, 14);
          ctx.fillStyle = isIntegrated ? '#ffffff' : 'rgba(0, 0, 0, 0.8)';
          ctx.fillText(label, midX + offsetX, midY + offsetY);
        }
      }

      // Draw feature type label for integrated features
      if (isIntegrated) {
        const centerX = pool.points.reduce((sum, p) => sum + p.x, 0) / pool.points.length;
        const centerY = pool.points.reduce((sum, p) => sum + p.y, 0) / pool.points.length;
        const label = pool.featureType === 'spillover-spa' ? 'Spillover Spa' : 'Tanning Ledge';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(label);
        const padding = 4;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(centerX - metrics.width / 2 - padding, centerY - 8, metrics.width + padding * 2, 16);
        ctx.fillStyle = pool.featureType === 'spillover-spa' ? '#2E86AB' : '#10B981';
        ctx.fillText(label, centerX, centerY);

        // Draw perimeter drag handle for snapped features
        if (pool.isPerimeterSnapped && pool.perimeterPosition !== undefined) {
          const perimPos = getPositionFromPerimeter(pool.perimeterPosition);
          ctx.beginPath();
          ctx.arc(perimPos.x, perimPos.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = isSelected ? '#FFD700' : '#3B82F6';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Drag indicator
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('⟷', perimPos.x, perimPos.y + 1);
        }
      }
    });

    // Draw perimeter anchor mode - red gradient draggable line on coping
    if (perimeterAnchorMode.isActive && points.length >= 3) {
      const anchorPos = getPositionFromPerimeter(perimeterAnchorMode.perimeterPosition);
      const lineLength = 30; // Length of the anchor line in pixels

      // Calculate perpendicular direction (inward from wall)
      const perpX = Math.cos(anchorPos.angle + Math.PI / 2);
      const perpY = Math.sin(anchorPos.angle + Math.PI / 2);

      // Create red gradient
      const gradient = ctx.createLinearGradient(anchorPos.x - perpX * lineLength / 2, anchorPos.y - perpY * lineLength / 2, anchorPos.x + perpX * lineLength / 2, anchorPos.y + perpY * lineLength / 2);
      gradient.addColorStop(0, '#FF4444');
      gradient.addColorStop(0.5, '#FF0000');
      gradient.addColorStop(1, '#AA0000');

      // Draw the anchor line across the coping
      ctx.save();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = perimeterAnchorMode.isFixed ? 8 : 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(anchorPos.x - perpX * lineLength / 2, anchorPos.y - perpY * lineLength / 2);
      ctx.lineTo(anchorPos.x + perpX * lineLength / 2, anchorPos.y + perpY * lineLength / 2);
      ctx.stroke();

      // Pulsing glow effect when not fixed
      if (!perimeterAnchorMode.isFixed) {
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw center dot
      ctx.beginPath();
      ctx.arc(anchorPos.x, anchorPos.y, perimeterAnchorMode.isFixed ? 6 : 8, 0, 2 * Math.PI);
      ctx.fillStyle = perimeterAnchorMode.isFixed ? '#00FF00' : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = perimeterAnchorMode.isFixed ? '#008800' : '#FF0000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Instruction label
      const label = perimeterAnchorMode.isFixed ? `Draw ${perimeterAnchorMode.featureType === 'spillover-spa' ? 'Spa' : 'Tanning Ledge'} shape` : `Drag to position, click to fix`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const metrics = ctx.measureText(label);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(anchorPos.x - metrics.width / 2 - 6, anchorPos.y - 35, metrics.width + 12, 20);
      ctx.fillStyle = perimeterAnchorMode.isFixed ? '#008800' : '#CC0000';
      ctx.fillText(label, anchorPos.x, anchorPos.y - 22);

      // Feature type badge
      const typeBadge = perimeterAnchorMode.featureType === 'spillover-spa' ? '🌊 Spa' : '☀️ Ledge';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      const badgeMetrics = ctx.measureText(typeBadge);
      ctx.fillRect(anchorPos.x - badgeMetrics.width / 2 - 4, anchorPos.y + 15, badgeMetrics.width + 8, 18);
      ctx.fillStyle = '#333';
      ctx.fillText(typeBadge, anchorPos.x, anchorPos.y + 27);
      ctx.restore();
    }
    ctx.restore();
    // Close camera transform
    ctx.restore();
  }, [points, features, selectedPoint, hoveredPoint, canvasSize, scale, pendingFeature, cursorPos, selectedFeature, texturesLoaded, paverSize, copingThickness, selectedPaverId, selectedCopingId, selectedFinishId, poolShape, hardscapePoints, additionalDeckPoints, deckOffsetsById, selectedDeckId, selectedHardscapePoint, selectedRoofPoint, showDepthEditor, depthPoints, selectedDepthPoint, zoomLevel, panOffset, splineDrawing, selectedDrawPointId, additionalPools, selectedAdditionalPool, getPositionFromPerimeter, perimeterAnchorMode]);

  // Memoize perimeter and area calculations
  const poolPerimeter = useMemo(() => parseFloat(calculatePerimeter()), [points]);
  const poolArea = useMemo(() => parseFloat(calculateArea()), [points]);

  // Pool shell rate: $280/sqft for custom/concrete pools
  const POOL_SHELL_RATE = 280;

  // Calculate total project cost
  const calculateTotalCost = useCallback(() => {
    // Pool cost - $280 per sqft for custom/concrete pool shell
    const poolCost = poolArea * POOL_SHELL_RATE;

    // Hardscape/deck cost - uses real paver rate from selected material
    const deckArea = calculateHardscapeArea();
    const deckCost = deckArea * deckPricePerSqFt;

    // Calculate coping perimeter and cost
    const copingPerimeterFeet = poolPerimeter;
    const copingWidthFeet = paverSize / 12;
    const copingArea = copingPerimeterFeet * copingWidthFeet;
    const copingCost = copingArea * copingPricePerSqFt;

    // Features cost with individual breakdown
    const featuresCost = features.reduce((total, feature) => {
      return total + (FEATURE_COSTS[feature.type] || 0);
    }, 0);
    return {
      poolCost,
      deckCost,
      copingCost,
      featuresCost,
      total: poolCost + deckCost + copingCost + featuresCost,
      // Extended breakdown data
      poolArea,
      poolRate: POOL_SHELL_RATE,
      deckArea,
      deckRate: deckPricePerSqFt,
      copingArea,
      copingRate: copingPricePerSqFt,
      featuresList: features.map(f => ({ type: f.type, cost: FEATURE_COSTS[f.type] || 0 })),
    };
  }, [poolArea, poolPerimeter, features, calculateHardscapeArea, paverSize, deckPricePerSqFt, copingPricePerSqFt]);
  const projectCost = useMemo(() => calculateTotalCost(), [calculateTotalCost]);

  // Notify parent of pool data changes (separate from drawing)
  // Skip when update originated from external (3D viewer) to prevent loops
  useEffect(() => {
    if (isExternalUpdateRef.current) return;
    if (onPoolDataChange) {
      const cost = calculateTotalCost();
      onPoolDataChange({
        points,
        depthPoints,
        scale,
        features,
        perimeter: poolPerimeter,
        area: poolArea,
        deckArea: calculateHardscapeArea(),
        hardscapePoints,
        additionalPools,
        totalCost: cost.total,
        breakdown: cost
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, depthPoints, features, poolPerimeter, poolArea, hardscapePoints, additionalPools]);

  // Convert screen (mouse) coordinates to world (canvas) coordinates, accounting for pan+zoom
  const screenToWorld = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    const x = (screenX - canvasSize.width / 2 - panOffset.x) / zoomLevel + canvasSize.width / 2;
    const y = (screenY - canvasSize.height / 2 - panOffset.y) / zoomLevel + canvasSize.height / 2;
    return { x, y };
  }, [canvasSize, panOffset, zoomLevel]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    let x = world.x;
    let y = world.y;

    // Apply grid snapping relative to canvas center for exact foot values
    if (gridSnap) {
      const cX = canvasSize.width / 2;
      const cY = canvasSize.height / 2;
      x = snapToGridRelative(x, cX, scale, snapSize);
      y = snapToGridRelative(y, cY, scale, snapSize);
    }

    // V2: Handle landscape click-to-place
    if (pendingLandscapePlacement) {
      createLandscapeFeatureAt(pendingLandscapePlacement, x, y);
      setPendingLandscapePlacement(null);
      return;
    }

    // V2: Handle pool structure click-on-edge placement
    if (pendingPoolFeaturePlacement) {
      createPoolFeatureAt(pendingPoolFeaturePlacement, x, y);
      setPendingPoolFeaturePlacement(null);
      return;
    }

    // Handle perimeter anchor mode - click to fix position or drag to move
    if (perimeterAnchorMode.isActive && !perimeterAnchorMode.isFixed) {
      // Check if clicking on/near the anchor point
      const anchorPos = getPositionFromPerimeter(perimeterAnchorMode.perimeterPosition);
      const distToAnchor = Math.sqrt(Math.pow(anchorPos.x - x, 2) + Math.pow(anchorPos.y - y, 2));
      if (distToAnchor < 25) {
        // Fix the anchor and start drawing
        handlePerimeterAnchorClick();
        return;
      }
    }

    // Add fence point when in fence add mode
    if (fenceAddMode && showFenceEditor) {
      const newPoint: FencePoint = {
        id: `fence-${Date.now()}`,
        x,
        y
      };
      setFencePoints([...fencePoints, newPoint]);
      setFenceAddMode(false); // Auto-disable after adding point
      return;
    }

    // Check if clicked on depth point in depth editor
    if (showDepthEditor && points.length > 0) {
      const editorX = 50;
      const editorY = canvasSize.height - 200;
      const editorWidth = 400;
      const editorHeight = 150;
      const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
      for (const dp of sortedDepths) {
        const dpx = editorX + 10 + dp.position * (editorWidth - 20);
        const dpy = editorY + editorHeight - 10 - dp.depth / 10 * (editorHeight - 40);
        if (Math.sqrt(Math.pow(dpx - (e.clientX - rect.left), 2) + Math.pow(dpy - (e.clientY - rect.top), 2)) < 10) {
          setSelectedDepthPoint(dp.id);
          return;
        }
      }
    }

    // Check if clicked on roof point (for selected house)
    if (selectedFeature) {
      const house = features.find(f => f.id === selectedFeature && f.type === 'home');
      if (house && house.roofPoints) {
        const clickedRoofPoint = house.roofPoints.find(rp => {
          const rpx = house.x + rp.x;
          const rpy = house.y + rp.y;
          return Math.sqrt(Math.pow(rpx - x, 2) + Math.pow(rpy - y, 2)) < 10;
        });
        if (clickedRoofPoint) {
          setSelectedRoofPoint(clickedRoofPoint.id);
          return;
        }
      }
    }

    // Check if clicked on spillover edge toggle button for selected spa
    if (selectedAdditionalPool) {
      const selectedPool = additionalPools.find(p => p.id === selectedAdditionalPool);
      if (selectedPool && selectedPool.featureType === 'spillover-spa') {
        // Compute which edges are outside main pool
        const edgesOutsideMainPool: boolean[] = [];
        for (let i = 0; i < selectedPool.points.length; i++) {
          const p1 = selectedPool.points[i];
          const p2 = selectedPool.points[(i + 1) % selectedPool.points.length];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          edgesOutsideMainPool.push(!isPointInPolygon(midX, midY, points));
        }

        // Check if clicked on any spillover toggle button
        for (let i = 0; i < selectedPool.points.length; i++) {
          if (edgesOutsideMainPool[i]) {
            const p1 = selectedPool.points[i];
            const p2 = selectedPool.points[(i + 1) % selectedPool.points.length];
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            if (Math.sqrt(Math.pow(midX - x, 2) + Math.pow(midY - y, 2)) < 15) {
              // Toggle spillover edge
              const currentSpilloverEdges = selectedPool.spilloverEdges || [];
              const newSpilloverEdges = currentSpilloverEdges.includes(i) ? currentSpilloverEdges.filter(e => e !== i) : [...currentSpilloverEdges, i];
              setAdditionalPools(pools => pools.map(p => p.id === selectedPool.id ? {
                ...p,
                spilloverEdges: newSpilloverEdges
              } : p));
              return;
            }
          }
        }
      }
    }

    // Check if clicked on additional pool point or perimeter drag handle
    for (const pool of additionalPools) {
      // Check perimeter drag handle for snapped features
      if (pool.isPerimeterSnapped && pool.perimeterPosition !== undefined) {
        const perimPos = getPositionFromPerimeter(pool.perimeterPosition);
        if (Math.sqrt(Math.pow(perimPos.x - x, 2) + Math.pow(perimPos.y - y, 2)) < 12) {
          setSelectedAdditionalPool(pool.id);
          setDraggingAdditionalPool(true);
          setSelectedPoint(null);
          setSelectedFeature(null);
          setSelectedHardscapePoint(null);
          return;
        }
      }

      // Check pool points
      const clickedPoolPoint = pool.points.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
      if (clickedPoolPoint) {
        setSelectedAdditionalPool(pool.id);
        setSelectedPoint(null);
        setSelectedFeature(null);
        setSelectedHardscapePoint(null);
        return;
      }
    }

    // Check if clicked on hardscape point (main deck)
    const clickedHardscapePoint = hardscapePoints.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
    if (clickedHardscapePoint) {
      setSelectedDeckId('main');
      setSelectedHardscapePoint(clickedHardscapePoint.id);
      setSelectedPoint(null);
      setSelectedFeature(null);
      setSelectedRoofPoint(null);
      setSelectedDepthPoint(null);
      setSelectedAdditionalPool(null);
      return;
    }

    // Check if clicked on additional deck point (new decks editable)
    for (const pool of additionalPools) {
      const poolDeck = additionalDeckPoints[pool.id] || (pool.featureType === 'regular' ? generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset) : []);
      const clickedPoolDeckPoint = poolDeck.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
      if (clickedPoolDeckPoint) {
        setSelectedDeckId(pool.id);
        setSelectedHardscapePoint(clickedPoolDeckPoint.id);
        setSelectedPoint(null);
        setSelectedFeature(null);
        setSelectedRoofPoint(null);
        setSelectedDepthPoint(null);
        setSelectedAdditionalPool(pool.id);
        return;
      }
    }

    // Select deck area (tool or direct click) so offset edits target selected deck only
    if ((activeTool === 'select-deck' || activeTool === 'select') && hardscapePoints.length >= 3 && isPointInPolygon(x, y, hardscapePoints)) {
      setSelectedDeckId('main');
      if (activeTool === 'select-deck') setActiveTool('select');
      return;
    }
    for (const pool of additionalPools) {
      const poolDeck = additionalDeckPoints[pool.id] || (pool.featureType === 'regular' ? generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset) : []);
      if (poolDeck.length >= 3 && isPointInPolygon(x, y, poolDeck)) {
        setSelectedDeckId(pool.id);
        setSelectedAdditionalPool(pool.id);
        if (activeTool === 'select-deck') setActiveTool('select');
        return;
      }
    }

    // If placing jet, snap it to nearest wall or place on pool floor
    if (pendingFeature === 'jet') {
      const nearWall = findNearestWallPoint(x, y);
      const distToWall = Math.sqrt((x - nearWall.x) ** 2 + (y - nearWall.y) ** 2);
      const isInsidePoolArea = isInsidePool(x, y);
      let jetX, jetY, jetAngle;

      // Snap to wall if within 50 pixels or outside pool
      if (distToWall < 50 || !isInsidePoolArea) {
        jetX = nearWall.x;
        jetY = nearWall.y;
        jetAngle = nearWall.angle + Math.PI / 2; // Point inward
      } else {
        // Place on pool floor (inside pool)
        jetX = x;
        jetY = y;
        // Calculate angle pointing toward center of pool
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        jetAngle = Math.atan2(centerY - y, centerX - x);
      }
      const newJet: PoolFeature = {
        type: 'jet',
        x: jetX,
        y: jetY,
        id: Date.now().toString(),
        angle: jetAngle
      };
      setFeatures([...features, newJet]);
      setPendingFeature(null);
      return;
    }

    // Check if clicked on a feature
    const clickedFeature = features.find(f => Math.sqrt((f.x - x) ** 2 + (f.y - y) ** 2) < 15);
    if (clickedFeature) {
      setSelectedFeature(clickedFeature.id);
      setSelectedPoint(null);
      return;
    }

    // Check if clicked on a point
    const clickedPoint = points.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
    if (clickedPoint) {
      setSelectedPoint(clickedPoint.id);
      setSelectedFeature(null);
      setSelectedHardscapePoint(null);
      setSelectedRoofPoint(null);
    } else {
      setSelectedPoint(null);
      setSelectedFeature(null);
      setSelectedHardscapePoint(null);
      setSelectedRoofPoint(null);
    }
  };

  // Touch event handlers for mobile/iPad support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return; // Only handle single touch
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();

    // Create a synthetic mouse event
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as React.MouseEvent<HTMLCanvasElement>;
    handleCanvasMouseDown(mouseEvent);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const touch = e.touches[0];

    // Create a synthetic mouse event
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
      stopPropagation: () => {}
    } as React.MouseEvent<HTMLCanvasElement>;
    handleCanvasMouseMove(mouseEvent);
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleCanvasMouseUp();
  };
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pendingFeature || pendingLandscapePlacement || pendingPoolFeaturePlacement) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    let x = world.x;
    let y = world.y;

    // If in spline drawing mode (draw-pool), handle spline point interactions
    if (activeTool === 'draw-pool') {
      // Ensure splineDrawing is active
      if (!splineDrawing.isActive) {
        setSplineDrawing(prev => ({
          ...prev,
          isActive: true
        }));
      }

      // Apply symmetry snapping to coordinates for spline drawing
      const snapped = getSymmetrySnappedPosition(x, y);
      x = snapped.x;
      y = snapped.y;

      // Shift held: lock the new segment to a perfectly straight line
      const shiftStraight = e.shiftKey && splineDrawing.points.length > 0;
      if (shiftStraight) {
        const locked = constrainToStraightLine(splineDrawing.points[splineDrawing.points.length - 1], x, y);
        x = locked.x;
        y = locked.y;
      }

      // During active drawing, DON'T open the point editor - just add/close points
      // The point editor is only available AFTER the pool is completed

      const newSplinePoint = {
        x,
        y,
        id: Date.now().toString(),
        curveType: shiftStraight ? ('linear' as const) : splineDrawing.currentCurveType
      };


      // Check if this is the FIRST point and it's on an existing pool area
      // Show the dialog immediately so user knows they're creating an integrated feature
      if (splineDrawing.points.length === 0 && !perimeterAnchorMode.isActive) {
        const clickedPoolId = checkClickedOnPoolArea(x, y);
        if (clickedPoolId) {
          // Show dialog immediately when starting to draw on an existing pool
          // Store the first point and show dialog
          setPendingPoolData({
            points: [{
              x,
              y,
              id: '1',
              curveType: splineDrawing.currentCurveType
            }],
            intersectsWith: clickedPoolId
          });
          setShowPoolTypeDialog(true);
          // Don't add the point yet - wait for dialog selection
          return;
        }
      }

      // Check if clicking near first point to close the shape
      if (splineDrawing.points.length >= 3) {
        const firstPoint = splineDrawing.points[0];
        const distToFirst = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
        if (distToFirst < 15) {
          // Close the shape - update first point's curveType to current selection for closing segment
          const newPoolPoints = splineDrawing.points.map((sp, i) => ({
            x: sp.x,
            y: sp.y,
            id: (i + 1).toString(),
            // First point defines closing segment curve - use current curve type
            curveType: i === 0 ? splineDrawing.currentCurveType : sp.curveType
          }));

          // Check if we're in perimeter anchor mode (drawing spa/tanning ledge)
          if (perimeterAnchorMode.isActive && perimeterAnchorMode.isFixed) {
            completePerimeterAnchoredPool(newPoolPoints);
            return;
          }
          
          // If no main pool exists yet, set this as the main pool
          if (points.length === 0) {
            setPoints(newPoolPoints);
            setHardscapePoints(generateHardscapeFromPool(newPoolPoints, deckOffset));
            setDeckOffsetsById(prev => ({ ...prev, main: deckOffset }));
            setSplineDrawing({ isActive: false, points: [], currentCurveType: 'linear' });
            setActiveTool(null);
            return;
          }
          
          const intersectingPoolId = checkDeckIntersection(newPoolPoints);
          if (intersectingPoolId) {
            setPendingPoolData({ points: newPoolPoints, intersectsWith: intersectingPoolId });
            setShowPoolTypeDialog(true);
          } else {
            const newPoolId = Date.now().toString();
            setAdditionalPools(prev => [...prev, {
              id: newPoolId, type: 'pool', points: newPoolPoints, shape: 'freeform', featureType: 'regular'
            }]);
            setAdditionalDeckPoints(prev => ({ ...prev, [newPoolId]: generateHardscapeFromPool(newPoolPoints, 3) }));
            setDeckOffsetsById(prev => ({ ...prev, [newPoolId]: 3 }));
            setSplineDrawing({ isActive: false, points: [], currentCurveType: 'linear' });
            setActiveTool(null);
          }
          return;
        }
      }

      // Clicking an already-placed spline point selects it (and starts dragging it)
      // instead of adding a new point — lets users fix a point mid-drawing.
      const hitIndex = splineDrawing.points.findIndex(
        sp => Math.sqrt(Math.pow(x - sp.x, 2) + Math.pow(y - sp.y, 2)) < 12
      );
      if (hitIndex !== -1) {
        const hitId = splineDrawing.points[hitIndex].id;
        setSelectedDrawPointId(hitId);
        setDraggingDrawPointId(hitId);
        return;
      }

      setSelectedDrawPointId(null);
      setSplineDrawing(prev => ({
        ...prev,
        points: [...prev.points, newSplinePoint]
      }));
      return;
    }

    // Allow editing pool points AFTER drawing is complete (when not in draw mode)
    // Check if clicking on a pool control point for curve editing
    if (activeTool === 'select' && !splineDrawing.isActive) {
      // If a spline point is already selected, clicking it again should start dragging it
      // (important for newly inserted anchors that start coincident with an existing point)
      if (selectedSplinePoint) {
        const distToSelected = Math.sqrt(Math.pow(x - selectedSplinePoint.point.x, 2) + Math.pow(y - selectedSplinePoint.point.y, 2));
        if (distToSelected < 12) {
          if (selectedSplinePoint.poolId) {
            setDraggingAdditionalPoolPoint({
              poolId: selectedSplinePoint.poolId,
              pointId: selectedSplinePoint.point.id
            });
            setSelectedAdditionalPool(selectedSplinePoint.poolId);
          } else {
            setSelectedPoint(selectedSplinePoint.point.id);
            setIsDragging(true);
          }
          return;
        }
      }

      // Check main pool points
      if (points.length > 0) {
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          const dist = Math.sqrt(Math.pow(x - pt.x, 2) + Math.pow(y - pt.y, 2));
          if (dist < 12) {
            // Found a point - create spline point data from it
            const splinePoint: SplinePoint = {
              x: pt.x,
              y: pt.y,
              id: pt.id,
              curveType: pt.curveType || 'linear'
            };
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              setSelectedSplinePoint({
                point: splinePoint,
                index: i,
                screenPosition: {
                  x: rect.left + pt.x * zoomLevel,
                  y: rect.top + pt.y * zoomLevel
                }
              });
            }
            return;
          }
        }
      }

      // Check additional pool points (spas, tanning ledges, new pools)
      for (const pool of additionalPools) {
        for (let i = 0; i < pool.points.length; i++) {
          const pt = pool.points[i];
          const dist = Math.sqrt(Math.pow(x - pt.x, 2) + Math.pow(y - pt.y, 2));
          if (dist < 12) {
            const splinePoint: SplinePoint = {
              x: pt.x,
              y: pt.y,
              id: pt.id,
              curveType: pt.curveType || 'linear'
            };
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              setSelectedSplinePoint({
                point: splinePoint,
                index: i,
                screenPosition: {
                  x: rect.left + pt.x * zoomLevel,
                  y: rect.top + pt.y * zoomLevel
                },
                poolId: pool.id
              });
            }
            return;
          }
        }
      }
    }

    // If in add mode, add a new point at the snapped location
    if (activeTool === 'add' && snapPoint) {
      const newPoint = {
        x: snapPoint.x,
        y: snapPoint.y,
        id: Date.now().toString()
      };

      // Find the closest edge to insert the point
      let closestEdgeIndex = 0;
      let minDistance = Infinity;
      for (let i = 0; i < points.length; i++) {
        const nextI = (i + 1) % points.length;
        const edge = {
          x1: points[i].x,
          y1: points[i].y,
          x2: points[nextI].x,
          y2: points[nextI].y
        };
        const distance = Math.sqrt(Math.pow(snapPoint.x - (edge.x1 + edge.x2) / 2, 2) + Math.pow(snapPoint.y - (edge.y1 + edge.y2) / 2, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestEdgeIndex = i;
        }
      }
      const updatedPoints = [...points];
      updatedPoints.splice(closestEdgeIndex + 1, 0, newPoint);
      setPoints(updatedPoints);
      setActiveTool(null);
      setSnapPoint(null);
      return;
    }

    // Check for roof point drag (for selected house)
    if (selectedFeature) {
      const house = features.find(f => f.id === selectedFeature && f.type === 'home');
      if (house && house.roofPoints) {
        const clickedRoofPoint = house.roofPoints.find(rp => {
          const rpx = house.x + rp.x;
          const rpy = house.y + rp.y;
          return Math.sqrt(Math.pow(rpx - x, 2) + Math.pow(rpy - y, 2)) < 10;
        });
        if (clickedRoofPoint) {
          setSelectedRoofPoint(clickedRoofPoint.id);
          setIsDraggingRoof(true);
          return;
        }
      }
    }

    // Check for depth point drag in depth editor
    if (showDepthEditor && points.length > 0) {
      const editorX = 50;
      const editorY = canvasSize.height - 200;
      const editorWidth = 400;
      const editorHeight = 150;
      const sortedDepths = [...depthPoints].sort((a, b) => a.position - b.position);
      for (const dp of sortedDepths) {
        const dpx = editorX + 10 + dp.position * (editorWidth - 20);
        const dpy = editorY + editorHeight - 10 - dp.depth / 10 * (editorHeight - 40);
        if (Math.sqrt(Math.pow(dpx - x, 2) + Math.pow(dpy - y, 2)) < 10) {
          setSelectedDepthPoint(dp.id);
          setIsDraggingDepth(true);
          return;
        }
      }
    }

    // Check for fence point drag
    if (showFenceEditor) {
      const clickedFencePoint = fencePoints.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
      if (clickedFencePoint) {
        setSelectedFencePoint(clickedFencePoint.id);
        setIsDraggingFence(true);
        return;
      }

      // Check for door marker click
      for (const door of fenceDoors) {
        if (door.segmentIndex < fencePoints.length - 1) {
          const p1 = fencePoints[door.segmentIndex];
          const p2 = fencePoints[door.segmentIndex + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const doorX = p1.x + dx * door.position;
          const doorY = p1.y + dy * door.position;
          if (Math.sqrt(Math.pow(doorX - x, 2) + Math.pow(doorY - y, 2)) < 12) {
            setSelectedFenceDoor(door.id);
            return;
          }
        }
      }
    }

    // Check for additional pool point drag (but not if we opened SplinePointEditor)
    if (!selectedSplinePoint) {
      for (const pool of additionalPools) {
        const clickedPoolPoint = pool.points.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
        if (clickedPoolPoint) {
          setDraggingAdditionalPoolPoint({
            poolId: pool.id,
            pointId: clickedPoolPoint.id
          });
          setSelectedAdditionalPool(pool.id);
          return;
        }
      }
    }

    // Check for hardscape point drag (main + selected additional deck)
    const clickedHardscapePoint = hardscapePoints.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
    if (clickedHardscapePoint) {
      setSelectedDeckId('main');
      setSelectedHardscapePoint(clickedHardscapePoint.id);
      setIsDraggingHardscape(true);
      return;
    }

    for (const pool of additionalPools) {
      const poolDeck = additionalDeckPoints[pool.id] || (pool.featureType === 'regular' ? generateHardscapeFromPool(pool.points, deckOffsetsById[pool.id] ?? deckOffset) : []);
      const clickedPoolDeckPoint = poolDeck.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
      if (clickedPoolDeckPoint) {
        setSelectedDeckId(pool.id);
        setSelectedHardscapePoint(clickedPoolDeckPoint.id);
        setSelectedAdditionalPool(pool.id);
        setIsDraggingHardscape(true);
        return;
      }
    }

    // Check for feature drag
    const clickedFeature = features.find(f => Math.sqrt((f.x - x) ** 2 + (f.y - y) ** 2) < 15);
    if (clickedFeature) {
      setSelectedFeature(clickedFeature.id);
      setDraggingFeature(true);
      return;
    }
    const clickedPoint = points.find(p => Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10);
    if (clickedPoint) {
      setSelectedPoint(clickedPoint.id);
      setIsDragging(true);
    }
  };
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    let x = world.x;
    let y = world.y;

    // Apply symmetry snapping during spline drawing
    if (activeTool === 'draw-pool' && splineDrawing.isActive) {
      const snapped = getSymmetrySnappedPosition(x, y);
      x = snapped.x;
      y = snapped.y;
      // Shift held: preview a perfectly straight segment from the last point
      if (e.shiftKey && splineDrawing.points.length > 0) {
        const locked = constrainToStraightLine(splineDrawing.points[splineDrawing.points.length - 1], x, y);
        x = locked.x;
        y = locked.y;
      }

      setCursorPos({
        x,
        y
      });
      // Dragging a previously placed spline point while still drawing
      if (draggingDrawPointId) {
        setSplineDrawing(prev => ({
          ...prev,
          points: prev.points.map(sp => sp.id === draggingDrawPointId ? { ...sp, x, y } : sp)
        }));
      }
      return;
    }

    // Handle perimeter anchor mode dragging - update position as mouse moves
    if (perimeterAnchorMode.isActive && !perimeterAnchorMode.isFixed) {
      const newPerimeterPos = getPerimeterPositionFromPoint(x, y);
      setPerimeterAnchorMode(prev => ({
        ...prev,
        perimeterPosition: newPerimeterPos
      }));
      return;
    }

    // If in add mode, calculate snap point on pool perimeter
    if (activeTool === 'add') {
      let closestPoint = {
        x,
        y
      };
      let minDistance = Infinity;
      for (let i = 0; i < points.length; i++) {
        const nextI = (i + 1) % points.length;
        const p1 = points[i];
        const p2 = points[nextI];

        // Calculate closest point on line segment
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lengthSquared = dx * dx + dy * dy;
        let t = ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
        const projectedX = p1.x + t * dx;
        const projectedY = p1.y + t * dy;
        const distance = Math.sqrt(Math.pow(x - projectedX, 2) + Math.pow(y - projectedY, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = {
            x: projectedX,
            y: projectedY
          };
        }
      }
      setSnapPoint(closestPoint);
      setCursorPos({
        x,
        y
      });
      return;
    }

    // Update cursor position for pending features
    setCursorPos({
      x,
      y
    });

    // Apply grid snapping relative to canvas center
    let snappedX = x;
    let snappedY = y;
    if (gridSnap) {
      const cX = canvasSize.width / 2;
      const cY = canvasSize.height / 2;
      snappedX = snapToGridRelative(x, cX, scale, snapSize);
      snappedY = snapToGridRelative(y, cY, scale, snapSize);
    }
    if (isDraggingDepth && selectedDepthPoint && showDepthEditor) {
      const editorX = 50;
      const editorY = canvasSize.height - 200;
      const editorWidth = 400;
      const editorHeight = 150;

      // Calculate new position and depth
      const relX = x - editorX - 10;
      const relY = editorY + editorHeight - y - 10;
      const newPosition = Math.max(0, Math.min(1, relX / (editorWidth - 20)));
      const newDepth = Math.max(1, Math.min(10, relY / (editorHeight - 40) * 10));
      setDepthPoints(prev => prev.map(dp => dp.id === selectedDepthPoint ? {
        ...dp,
        position: newPosition,
        depth: newDepth
      } : dp));
    } else if (isDraggingRoof && selectedRoofPoint && selectedFeature) {
      const house = features.find(f => f.id === selectedFeature && f.type === 'home');
      if (house && house.roofPoints) {
        const relativeX = x - house.x;
        const relativeY = y - house.y;
        setFeatures(prev => prev.map(f => f.id === selectedFeature && f.type === 'home' && f.roofPoints ? {
          ...f,
          roofPoints: f.roofPoints.map(rp => rp.id === selectedRoofPoint ? {
            ...rp,
            x: relativeX,
            y: relativeY
          } : rp)
        } : f));
      }
    } else if (isDraggingFence && selectedFencePoint) {
      // Snap fence point to fence line when dragging
      const selectedIndex = fencePoints.findIndex(p => p.id === selectedFencePoint);

      // If it's a middle point (not first or last), constrain it to the line between neighbors
      if (selectedIndex > 0 && selectedIndex < fencePoints.length - 1) {
        const p1 = fencePoints[selectedIndex - 1];
        const p2 = fencePoints[selectedIndex + 1];

        // Calculate closest point on line segment between neighbors
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lengthSquared = dx * dx + dy * dy;
        let t = ((snappedX - p1.x) * dx + (snappedY - p1.y) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
        const projectedX = p1.x + t * dx;
        const projectedY = p1.y + t * dy;
        setFencePoints(prev => prev.map(p => p.id === selectedFencePoint ? {
          ...p,
          x: projectedX,
          y: projectedY
        } : p));
      } else {
        // First or last point - allow free movement
        const boundedX = Math.max(0, Math.min(canvasSize.width, snappedX));
        const boundedY = Math.max(0, Math.min(canvasSize.height, snappedY));
        setFencePoints(prev => prev.map(p => p.id === selectedFencePoint ? {
          ...p,
          x: boundedX,
          y: boundedY
        } : p));
      }
    } else if (isDraggingHardscape && selectedHardscapePoint) {
      const boundedX = Math.max(0, Math.min(canvasSize.width, snappedX));
      const boundedY = Math.max(0, Math.min(canvasSize.height, snappedY));
      if (selectedDeckId === 'main') {
        setHardscapePoints(prev => prev.map(p => p.id === selectedHardscapePoint ? {
          ...p,
          x: boundedX,
          y: boundedY
        } : p));
      } else {
        setAdditionalDeckPoints(prev => {
          const current = prev[selectedDeckId] || [];
          return {
            ...prev,
            [selectedDeckId]: current.map(p => p.id === selectedHardscapePoint ? { ...p, x: boundedX, y: boundedY } : p)
          };
        });
      }
    } else if (draggingFeature && selectedFeature) {
      const feature = features.find(f => f.id === selectedFeature);
      if (!feature) return;
      if (feature.type === 'light' || feature.type === 'stairs') {
        // Snap to wall
        const wallPoint = findNearestWallPoint(x, y);
        setFeatures(prev => prev.map(f => f.id === selectedFeature ? {
          ...f,
          x: wallPoint.x,
          y: wallPoint.y,
          wallSegment: wallPoint.segment,
          wallPosition: wallPoint.position,
          angle: wallPoint.angle + Math.PI / 2
        } : f));
      } else if (feature.type === 'tree') {
        // Snap trees to grass areas
        const grassAreas = features.filter(f => f.type === 'grass');
        let snappedToGrass = false;
        for (const grass of grassAreas) {
          const distToGrass = Math.sqrt((x - grass.x) ** 2 + (y - grass.y) ** 2);
          if (distToGrass < (grass.radius || 80)) {
            setFeatures(prev => prev.map(f => f.id === selectedFeature ? {
              ...f,
              x,
              y
            } : f));
            snappedToGrass = true;
            break;
          }
        }
        if (!snappedToGrass) {
          setFeatures(prev => prev.map(f => f.id === selectedFeature ? {
            ...f,
            x,
            y
          } : f));
        }
      } else if (feature.type === 'home') {
        // Houses can be freely moved anywhere
        setFeatures(prev => prev.map(f => f.id === selectedFeature ? {
          ...f,
          x,
          y
        } : f));
      } else {
        // Other features can be placed anywhere
        setFeatures(prev => prev.map(f => f.id === selectedFeature ? {
          ...f,
          x,
          y
        } : f));
      }
    } else if (isDragging && selectedPoint) {
      const boundedX = Math.max(0, Math.min(canvasSize.width, snappedX));
      const boundedY = Math.max(0, Math.min(canvasSize.height, y));
      setPoints(prev => prev.map(p => p.id === selectedPoint ? {
        ...p,
        x: boundedX,
        y: boundedY
      } : p));
    } else if (draggingAdditionalPoolPoint) {
      // Drag additional pool point
      const boundedX = Math.max(0, Math.min(canvasSize.width, snappedX));
      const boundedY = Math.max(0, Math.min(canvasSize.height, y));
      updateAdditionalPoolPoint(draggingAdditionalPoolPoint.poolId, draggingAdditionalPoolPoint.pointId, boundedX, boundedY);
    } else {
      // Update hover state
      const hoveredPointFound = points.find(p => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10);
      setHoveredPoint(hoveredPointFound ? hoveredPointFound.id : null);
    }
  };
  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggingFeature(false);
    setIsDraggingHardscape(false);
    setIsDraggingRoof(false);
    setIsDraggingDepth(false);
    setIsDraggingFence(false);
    setDraggingAdditionalPoolPoint(null);
    setDraggingDrawPointId(null);
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
  // Landscape features that use click-to-place outside pool
  const landscapeFeatureTypes: PoolFeature['type'][] = ['tree', 'fountain', 'grass', 'shrub', 'umbrella', 'pathway', 'rock', 'boulder', 'hedge-row', 'plant-row', 'landscape-light', 'edging', 'grass-region', 'pond', 'stream', 'waterfall', 'sprinkler', 'water-curtain'];
  // Pool structure features that snap to wall with click-to-place
  const poolStructureFeatureTypes: PoolFeature['type'][] = ['light', 'pool-seat', 'pool-wall', 'stairs', 'diving-board', 'slide', 'pool-accessory', 'pool-cover'];

  const addFeature = (type: PoolFeature['type']) => {
    if (type === 'jet' || type === 'jumping-jet') {
      setPendingFeature('jet');
      return;
    }

    // V2: Landscape features enter click-to-place mode
    if (landscapeFeatureTypes.includes(type)) {
      // Toggle off if same type already pending
      if (pendingLandscapePlacement === type) {
        setPendingLandscapePlacement(null);
      } else {
        setPendingLandscapePlacement(type);
        setPendingPoolFeaturePlacement(null);
      }
      return;
    }

    // V2: Pool structure features enter click-on-edge mode
    if (poolStructureFeatureTypes.includes(type)) {
      if (pendingPoolFeaturePlacement === type) {
        setPendingPoolFeaturePlacement(null);
      } else {
        setPendingPoolFeaturePlacement(type);
        setPendingLandscapePlacement(null);
      }
      return;
    }

    // Fallback: home, fence, etc. - place immediately
    const newFeature: PoolFeature = {
      type,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      id: Date.now().toString(),
      width: type === 'home' ? 200 : undefined,
      height: type === 'home' ? 150 : undefined,
    };
    setFeatures([...features, newFeature]);
    setSelectedFeature(newFeature.id);
    onToolUsed?.();
  };

  // Create a landscape feature at specific world coordinates
  const createLandscapeFeatureAt = (type: PoolFeature['type'], x: number, y: number) => {
    const newFeature: PoolFeature = {
      type,
      x,
      y,
      id: Date.now().toString(),
      treeType: type === 'tree' ? 'oak' : undefined,
      radius: type === 'grass' || type === 'grass-region' ? 80 : type === 'pond' ? 60 : undefined,
      width: type === 'hedge-row' ? 100 : type === 'water-curtain' ? 80 : undefined,
      rockSize: type === 'rock' || type === 'boulder' ? (type === 'boulder' ? 'large' : 'medium') : undefined,
      lightColor: type === 'landscape-light' ? '#fffacd' : undefined,
    };
    setFeatures(prev => [...prev, newFeature]);
    setSelectedFeature(newFeature.id);
    onToolUsed?.();
  };

  // Create a pool structure feature snapped to wall at world coordinates
  const createPoolFeatureAt = (type: PoolFeature['type'], x: number, y: number) => {
    const wallPoint = findNearestWallPoint(x, y);
    let newFeature: PoolFeature;
    if (type === 'pool-seat') {
      newFeature = { type, x: wallPoint.x, y: wallPoint.y, id: Date.now().toString(), angle: wallPoint.angle + Math.PI / 2, wallSegment: wallPoint.segment, wallPosition: wallPoint.position, seatWidth: 6 * scale, seatDepth: 2 * scale };
    } else if (type === 'pool-wall') {
      newFeature = { type, x: wallPoint.x, y: wallPoint.y, id: Date.now().toString(), angle: wallPoint.angle + Math.PI / 2, wallSegment: wallPoint.segment, wallPosition: wallPoint.position, width: 8 * scale, wallHeight: 3 };
    } else if (type === 'diving-board') {
      newFeature = { type, x: wallPoint.x, y: wallPoint.y, id: Date.now().toString(), angle: wallPoint.angle + Math.PI / 2, wallSegment: wallPoint.segment, wallPosition: wallPoint.position, length: 10 * scale };
    } else if (type === 'light') {
      newFeature = { type, x: wallPoint.x, y: wallPoint.y, id: Date.now().toString(), angle: wallPoint.angle + Math.PI / 2, wallSegment: wallPoint.segment, wallPosition: wallPoint.position };
    } else {
      newFeature = { type, x: wallPoint.x, y: wallPoint.y, id: Date.now().toString(), steps: type === 'stairs' ? 3 : undefined, angle: wallPoint.angle + Math.PI / 2, wallSegment: wallPoint.segment, wallPosition: wallPoint.position };
    }
    setFeatures(prev => [...prev, newFeature]);
    setSelectedFeature(newFeature.id);
    onToolUsed?.();
  };

  // Handle external tool selection from DesignStudio toolbar
  useEffect(() => {
    if (!externalTool) return;

    // Panel-switching tools (these switch tabs, not add features)
    const panelTools: Record<string, string> = {
      'pool-shape': 'shape',
      'pool-deck': 'pool',
      'pool-depth': 'depth',
      'pool-materials': 'materials'
    };
    if (panelTools[externalTool]) {
      setActiveTab(panelTools[externalTool]);
      if (externalTool === 'pool-shape') {
        setActiveTool('draw-pool');
      } else if (externalTool === 'pool-deck') {
        setActiveTool('draw-deck');
      }
      return;
    }

    // Map toolbar tool IDs to feature types
    const toolToFeatureMap: Record<string, PoolFeature['type']> = {
      'pool-stairs': 'stairs',
      'pool-seat': 'pool-seat',
      'pool-wall': 'pool-wall',
      'pool-light': 'light',
      'pool-jet': 'jet',
      'diving-board': 'diving-board',
      'pool-slide': 'slide',
      'pool-accessory': 'pool-accessory',
      'pool-cover': 'pool-cover',
      // Landscape
      'grass-region': 'grass-region',
      'pathway': 'pathway',
      'edging': 'edging',
      'tree': 'tree',
      'shrub': 'shrub',
      'hedge-row': 'hedge-row',
      'plant-row': 'plant-row',
      'rock': 'rock',
      'boulder': 'boulder',
      'landscape-light': 'landscape-light',
      // Water features
      'fountain': 'fountain',
      'pond': 'pond',
      'stream': 'stream',
      'waterfall': 'waterfall',
      'jumping-jet': 'jumping-jet',
      'sprinkler': 'sprinkler',
      'water-curtain': 'water-curtain'
    };
    const featureType = toolToFeatureMap[externalTool];
    if (featureType) {
      addFeature(featureType);
    }
  }, [externalTool]);
  const addStairStep = () => {
    if (!selectedFeature) return;
    setFeatures(prev => prev.map(f => f.id === selectedFeature && f.type === 'stairs' ? {
      ...f,
      steps: (f.steps || 3) + 1
    } : f));
  };
  const removeStairStep = () => {
    if (!selectedFeature) return;
    setFeatures(prev => prev.map(f => f.id === selectedFeature && f.type === 'stairs' && (f.steps || 3) > 1 ? {
      ...f,
      steps: (f.steps || 3) - 1
    } : f));
  };
  const removeFeature = () => {
    if (!selectedFeature) return;
    setFeatures(prev => prev.filter(f => f.id !== selectedFeature));
    setSelectedFeature(null);
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
    setPoints(prev => prev.map((p, i) => i === (index + 1) % points.length ? {
      ...p,
      x: current.x + dx,
      y: current.y + dy
    } : p));
  };
  // handleWheelZoom is now a native event listener registered in useEffect above

  return <div ref={containerRef} className="h-screen w-screen flex flex-col bg-background relative overflow-hidden">

      {/* Canvas area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Main Canvas - fills viewport */}
        <div className="w-full h-full">
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} onClick={handleCanvasClick} onMouseDown={(e) => {
              // Middle-click or space+click for panning
              if (e.button === 1) {
                e.preventDefault();
                setIsPanning(true);
                panStartRef.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y };
                return;
              }
              handleCanvasMouseDown(e);
            }} onMouseMove={(e) => {
              if (isPanning) {
                const dx = e.clientX - panStartRef.current.x;
                const dy = e.clientY - panStartRef.current.y;
                setPanOffset({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
                return;
              }
              handleCanvasMouseMove(e);
              // Track mouse world position for ghost preview
              if (pendingLandscapePlacement || pendingPoolFeaturePlacement) {
                const canvas = canvasRef.current;
                if (canvas) {
                  const rect = canvas.getBoundingClientRect();
                  const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
                  setMouseWorldPos(world);
                }
              }
            }} onMouseUp={(e) => {
              if (isPanning) { setIsPanning(false); return; }
              handleCanvasMouseUp();
            }} onMouseLeave={() => { setIsPanning(false); handleCanvasMouseUp(); }}
            
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} className="block" style={{
            cursor: isPanning ? 'grabbing' : pendingLandscapePlacement || pendingPoolFeaturePlacement ? 'crosshair' : activeTool === 'draw-pool' ? 'crosshair' : fenceAddMode ? 'crosshair' : pendingFeature === 'jet' ? 'crosshair' : activeTool === 'add' ? 'crosshair' : 'grab',
            pointerEvents: 'auto',
            touchAction: 'none',
          }} />
        </div>
          
          {/* Spline Point Editor Toolbar - replaces popup when point is selected */}
          {selectedSplinePoint && !splineDrawing.isActive && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <SplineDrawingToolbar currentCurveType={selectedSplinePoint.point.curveType} pointCount={selectedSplinePoint.poolId ? additionalPools.find(p => p.id === selectedSplinePoint.poolId)?.points.length || 0 : points.length} onCurveTypeChange={curveType => {
            const pointId = selectedSplinePoint.point.id;
            if (selectedSplinePoint.poolId) {
              updateAdditionalPoolPointCurveType(selectedSplinePoint.poolId, pointId, curveType);
              setSelectedSplinePoint(prev => prev ? {
                ...prev,
                point: {
                  ...prev.point,
                  curveType
                }
              } : null);
            } else {
              setPoints(prev => prev.map(p => p.id === pointId ? {
                ...p,
                curveType
              } : p));
              setSelectedSplinePoint(prev => prev ? {
                ...prev,
                point: {
                  ...prev.point,
                  curveType
                }
              } : null);
            }
          }} onCancel={() => setSelectedSplinePoint(null)} onComplete={() => setSelectedSplinePoint(null)} canComplete={true} isEditMode={true} pointLabel={`Point ${selectedSplinePoint.index + 1}`} onAddPoint={() => {
            // Add a new point after the selected one WITHOUT changing the shape immediately.
            // We insert the new anchor coincident with the currently-selected point.
            // The outline only changes once the user drags the new anchor.
            const currentIndex = selectedSplinePoint.index;
            const newPointId = Date.now().toString();
            const newPointIndex = currentIndex + 1;
            if (selectedSplinePoint.poolId) {
              // Additional pool
              const pool = additionalPools.find(p => p.id === selectedSplinePoint.poolId);
              if (!pool) return;
              const currentPt = pool.points[currentIndex];
              const newPoint = {
                x: currentPt.x,
                y: currentPt.y,
                id: newPointId,
                curveType: 'linear' as const
              };
              setAdditionalPools(prev => prev.map(p => {
                if (p.id !== selectedSplinePoint.poolId) return p;
                const newPoints = [...p.points];
                newPoints.splice(currentIndex + 1, 0, newPoint);
                return {
                  ...p,
                  points: newPoints
                };
              }));
              setSelectedAdditionalPool(selectedSplinePoint.poolId);
              const canvas = canvasRef.current;
              if (canvas) {
                const rect = canvas.getBoundingClientRect();
                setSelectedSplinePoint({
                  point: {
                    x: currentPt.x,
                    y: currentPt.y,
                    id: newPointId,
                    curveType: 'linear'
                  },
                  index: newPointIndex,
                  screenPosition: {
                    x: rect.left + currentPt.x * zoomLevel,
                    y: rect.top + currentPt.y * zoomLevel
                  },
                  poolId: selectedSplinePoint.poolId
                });
              }
            } else {
              // Main pool
              const currentPt = points[currentIndex];
              const newPoint = {
                x: currentPt.x,
                y: currentPt.y,
                id: newPointId,
                curveType: 'linear' as const
              };
              setPoints(prev => {
                const newPoints = [...prev];
                newPoints.splice(currentIndex + 1, 0, newPoint);
                return newPoints;
              });

              // Keep it selected (but do NOT start dragging until the user clicks+drags)
              setSelectedPoint(newPointId);
              const canvas = canvasRef.current;
              if (canvas) {
                const rect = canvas.getBoundingClientRect();
                setSelectedSplinePoint({
                  point: {
                    x: currentPt.x,
                    y: currentPt.y,
                    id: newPointId,
                    curveType: 'linear'
                  },
                  index: newPointIndex,
                  screenPosition: {
                    x: rect.left + currentPt.x * zoomLevel,
                    y: rect.top + currentPt.y * zoomLevel
                  }
                });
              }
            }
          }} onDeletePoint={() => {
            const pointId = selectedSplinePoint.point.id;
            if (selectedSplinePoint.poolId) {
              deleteAdditionalPoolPoint(selectedSplinePoint.poolId, pointId);
            } else {
              if (points.length > 3) {
                setPoints(prev => prev.filter(p => p.id !== pointId));
              }
            }
            setSelectedSplinePoint(null);
          }} canDelete={selectedSplinePoint.poolId ? (additionalPools.find(p => p.id === selectedSplinePoint.poolId)?.points.length || 0) > 3 : points.length > 3} />
            </div>}

          {/* Coordinate Input Panel for selected spline point */}
          {selectedSplinePoint && !splineDrawing.isActive && (() => {
            const ptsList = selectedSplinePoint.poolId
              ? (additionalPools.find(p => p.id === selectedSplinePoint.poolId)?.points || [])
              : points;
            const idx = selectedSplinePoint.index;
            const prevPt = idx > 0 ? ptsList[idx - 1] : ptsList[ptsList.length - 1];
            const nextPt = idx < ptsList.length - 1 ? ptsList[idx + 1] : ptsList[0];
            const currentPt = ptsList[idx];
            if (!currentPt) return null;
            return (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
                <PointCoordinateEditor
                  pointX={currentPt.x}
                  pointY={currentPt.y}
                  centerX={canvasSize.width / 2}
                  centerY={canvasSize.height / 2}
                  scale={scale}
                  label={`Point ${idx + 1}`}
                  prevPoint={prevPt}
                  nextPoint={nextPt}
                  onPositionChange={(newX, newY) => {
                    if (selectedSplinePoint.poolId) {
                      updateAdditionalPoolPoint(selectedSplinePoint.poolId, currentPt.id, newX, newY);
                    } else {
                      setPoints(prev => prev.map(p => p.id === currentPt.id ? { ...p, x: newX, y: newY } : p));
                    }
                    setSelectedSplinePoint(prev => prev ? { ...prev, point: { ...prev.point, x: newX, y: newY } } : null);
                  }}
                />
              </div>
            );
          })()}

          {/* Coordinate Input Panel for selected hardscape/deck point */}
          {selectedHardscapePoint && !splineDrawing.isActive && (() => {
            const idx = hardscapePoints.findIndex(p => p.id === selectedHardscapePoint);
            const currentPt = hardscapePoints[idx];
            if (!currentPt || idx < 0) return null;
            const prevPt = idx > 0 ? hardscapePoints[idx - 1] : hardscapePoints[hardscapePoints.length - 1];
            const nextPt = idx < hardscapePoints.length - 1 ? hardscapePoints[idx + 1] : hardscapePoints[0];
            return (
              <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
                <PointCoordinateEditor
                  pointX={currentPt.x}
                  pointY={currentPt.y}
                  centerX={canvasSize.width / 2}
                  centerY={canvasSize.height / 2}
                  scale={scale}
                  label={`Deck P${idx + 1}`}
                  prevPoint={prevPt}
                  nextPoint={nextPt}
                  onPositionChange={(newX, newY) => {
                    setHardscapePoints(prev => prev.map(p => p.id === currentPt.id ? { ...p, x: newX, y: newY } : p));
                  }}
                />
              </div>
            );
          })()}
          
          {/* Spline Drawing Toolbar - Floating in canvas */}
          {splineDrawing.isActive && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <SplineDrawingToolbar
                currentCurveType={selectedDrawPointId ? (splineDrawing.points.find(sp => sp.id === selectedDrawPointId)?.curveType || splineDrawing.currentCurveType) : splineDrawing.currentCurveType}
                pointCount={splineDrawing.points.length}
                isEditMode={!!selectedDrawPointId}
                pointLabel={selectedDrawPointId ? `Point ${splineDrawing.points.findIndex(sp => sp.id === selectedDrawPointId) + 1}` : undefined}
                canAddPoint={false}
                canDelete={!!selectedDrawPointId}
                onDeletePoint={() => {
                  if (!selectedDrawPointId) return;
                  setSplineDrawing(prev => ({
                    ...prev,
                    points: prev.points.filter(sp => sp.id !== selectedDrawPointId)
                  }));
                  setSelectedDrawPointId(null);
                  setDraggingDrawPointId(null);
                }}
                onCurveTypeChange={type => {
            if (selectedDrawPointId) {
              setSplineDrawing(prev => ({
                ...prev,
                points: prev.points.map(sp => sp.id === selectedDrawPointId ? { ...sp, curveType: type } : sp),
                currentCurveType: type
              }));
              return;
            }
            setSplineDrawing(prev => ({
              ...prev,
              currentCurveType: type
            }));
          }} onCancel={() => {
            setSplineDrawing({
              isActive: false,
              points: [],
              currentCurveType: 'linear'
            });
            setActiveTool(null);
          }} onComplete={() => {
            if (splineDrawing.points.length >= 3) {
              // Update first point's curveType to current selection for closing segment
              const newPoolPoints = splineDrawing.points.map((sp, i) => ({
                x: sp.x,
                y: sp.y,
                id: (i + 1).toString(),
                // First point defines closing segment curve - use current curve type
                curveType: i === 0 ? splineDrawing.currentCurveType : sp.curveType
              }));

              // Check if we're in perimeter anchor mode (drawing spa/tanning ledge)
              if (perimeterAnchorMode.isActive && perimeterAnchorMode.isFixed) {
                completePerimeterAnchoredPool(newPoolPoints);
                return;
              }
              
              // If no main pool exists yet, set this as the main pool
              if (points.length === 0) {
                setPoints(newPoolPoints);
                setHardscapePoints(generateHardscapeFromPool(newPoolPoints, deckOffset));
                setDeckOffsetsById(prev => ({ ...prev, main: deckOffset }));
                setSplineDrawing({ isActive: false, points: [], currentCurveType: 'linear' });
                setActiveTool(null);
                return;
              }
              
              const intersectingPoolId = checkDeckIntersection(newPoolPoints);
              if (intersectingPoolId) {
                setPendingPoolData({ points: newPoolPoints, intersectsWith: intersectingPoolId });
                setShowPoolTypeDialog(true);
              } else {
                const newPoolId = Date.now().toString();
                setAdditionalPools(prev => [...prev, {
                  id: newPoolId, type: 'pool', points: newPoolPoints, shape: 'freeform', featureType: 'regular'
                }]);
                setSplineDrawing({ isActive: false, points: [], currentCurveType: 'linear' });
                setActiveTool(null);
                checkAndPromptForOutsideDeck(newPoolId, newPoolPoints);
              }
            }
          }} canComplete={splineDrawing.points.length >= 3} />
            </div>}

          {/* Draw Pool Tutorial Overlay */}
          <SplineDrawTutorial
            visible={showDrawTutorial && points.length === 0}
            onDismiss={() => {
              setShowDrawTutorial(false);
              tutorialDismissedRef.current = true;
            }}
            onStartDrawing={() => {
              setShowDrawTutorial(false);
              tutorialDismissedRef.current = true;
              setActiveTool('draw-pool');
              setSplineDrawing({ isActive: true, points: [], currentCurveType: 'linear' });
            }}
          />
        </div>


        {/* Floating Designer Tool Panel */}
        <DesignerToolPanel
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          poolShape={poolShape}
          setPoolShape={setPoolShape}
          onShapeSelect={(shape) => {
            setPoolShape(shape);
            const newPoolPoints = getShapePoints(shape).map(p => ({ ...p, curveType: 'linear' as const }));
            setPoints(newPoolPoints);
            setHardscapePoints(generateHardscapeFromPool(newPoolPoints, deckOffset));
            setDeckOffsetsById(prev => ({ ...prev, main: deckOffset }));
            setFeatures([]);
          }}
          selectedFinishId={selectedFinishId}
          setSelectedFinishId={setSelectedFinishId}
          selectedCopingId={selectedCopingId}
          setSelectedCopingId={setSelectedCopingId}
          selectedPaverId={selectedPaverId}
          setSelectedPaverId={setSelectedPaverId}
          finishes={finishes}
          deckOffset={selectedDeckId === 'main' ? (deckOffsetsById.main ?? deckOffset) : (deckOffsetsById[selectedDeckId] ?? 3)}
          setDeckOffset={(v) => {
            setDeckOffsetsById(prev => ({ ...prev, [selectedDeckId]: v, ...(selectedDeckId === 'main' ? { main: v } : {}) }));
            if (selectedDeckId === 'main') {
              setDeckOffset(v);
              setHardscapePoints(generateHardscapeFromPool(points, v));
            } else {
              const pool = additionalPools.find(p => p.id === selectedDeckId);
              if (pool) setAdditionalDeckPoints(prev => ({ ...prev, [selectedDeckId]: generateHardscapeFromPool(pool.points, v) }));
            }
          }}
          onRegenerateDeck={() => {
            if (selectedDeckId === 'main') {
              const offset = deckOffsetsById.main ?? deckOffset;
              setHardscapePoints(generateHardscapeFromPool(points, offset));
            } else {
              const pool = additionalPools.find(p => p.id === selectedDeckId);
              if (!pool) return;
              const offset = deckOffsetsById[selectedDeckId] ?? 3;
              setAdditionalDeckPoints(prev => ({ ...prev, [selectedDeckId]: generateHardscapeFromPool(pool.points, offset) }));
            }
          }}
          onAddFeature={(type) => addFeature(type as PoolFeature['type'])}
          selectedFeature={selectedFeature}
          onRemoveFeature={removeFeature}
          onAddStairStep={addStairStep}
          onRemoveStairStep={removeStairStep}
          featureType={selectedFeature ? features.find(f => f.id === selectedFeature)?.type : undefined}
          depthPoints={depthPoints}
          setDepthPoints={setDepthPoints}
          gridSnap={gridSnap}
          setGridSnap={setGridSnap}
          snapSize={snapSize}
          setSnapSize={setSnapSize}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          projectCost={projectCost}
          customTextures={customTextures}
          setCustomTextures={setCustomTextures}
          isSplineDrawing={splineDrawing.isActive}
          onStartDrawPool={() => {
            setActiveTool('draw-pool');
            setSplineDrawing({ isActive: true, points: [], currentCurveType: 'linear' });
          }}
          onStartDrawDeck={() => setActiveTool(activeTool === 'draw-deck' ? null : 'draw-deck')}
          poolWidth={points.length > 0 ? (Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x))) / scale : undefined}
          poolLength={points.length > 0 ? (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y))) / scale : undefined}
          poolArea={poolArea}
          deckArea={calculateHardscapeArea()}
          scale={scale}
          selectedFeatureData={selectedFeature ? (() => {
            const f = features.find(feat => feat.id === selectedFeature);
            if (!f) return undefined;
            return {
              type: f.type,
              steps: f.steps,
              seatWidth: f.seatWidth,
              seatDepth: f.seatDepth,
              wallHeight: f.wallHeight,
              width: f.width,
              length: f.length,
              rockSize: f.rockSize,
              treeType: f.treeType,
              lightColor: f.lightColor,
              lightIntensity: f.lightIntensity,
              x: f.x,
              y: f.y,
            };
          })() : undefined}
          onUpdateFeature={(updates) => {
            if (!selectedFeature) return;
            setFeatures(prev => prev.map(f => f.id === selectedFeature ? { ...f, ...updates } : f));
          }}
          pendingPlacement={pendingLandscapePlacement || pendingPoolFeaturePlacement || null}
        />

        {/* Project Manager Button - Top Left */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowProjectManager(true)}
            className="h-8 bg-background/95 backdrop-blur shadow-lg text-xs gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Projects
          </Button>
          {lastAutoSaved && (
            <span className="text-[9px] text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded shadow-sm">
              Saved {new Date(lastAutoSaved).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Project Manager Dialog */}
        <ProjectManager
          isOpen={showProjectManager}
          onOpenChange={setShowProjectManager}
          onSaveProject={getSerializableState}
          onLoadProject={loadProjectState}
          lastSaved={lastAutoSaved}
        />


        {/* V2 Placement Mode Banner */}
        {(pendingLandscapePlacement || pendingPoolFeaturePlacement) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur text-sm font-medium">
            <span className="animate-pulse">⊕</span>
            <span>Click on {pendingPoolFeaturePlacement ? 'pool edge' : 'scene'} to place{' '}
              <span className="capitalize font-bold">{(pendingLandscapePlacement || pendingPoolFeaturePlacement || '').replace(/-/g, ' ')}</span>
            </span>
            <button onClick={() => { setPendingLandscapePlacement(null); setPendingPoolFeaturePlacement(null); }} className="ml-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded px-2 py-0.5 text-xs">ESC</button>
          </div>
        )}

        {showFenceEditor ? <div className="absolute bottom-8 left-8 z-20 bg-background/95 backdrop-blur p-3 rounded-lg border shadow-lg max-w-xs space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold">Fence Builder</Label>
              <Button size="sm" variant="ghost" onClick={() => {
            setShowFenceEditor(false);
            setFenceAddMode(false);
          }} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>
            
            <div className="flex gap-1.5">
              <Button size="sm" onClick={() => {
            // Toggle add mode without creating initial point
            setFenceAddMode(!fenceAddMode);
          }} variant={fenceAddMode ? "default" : "outline"} className="flex-1 h-8 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                {fenceAddMode ? 'Click Canvas' : fencePoints.length === 0 ? 'Create' : 'Add Anchor'}
              </Button>
              <Button size="sm" onClick={() => {
            if (selectedFencePoint && fencePoints.length > 2) {
              setFencePoints(prev => prev.filter(p => p.id !== selectedFencePoint));
              setSelectedFencePoint(null);
            }
          }} variant="outline" disabled={!selectedFencePoint || fencePoints.length <= 2} className="flex-1 h-8 text-xs">
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
              <Button size="sm" onClick={() => {
            // Add division to selected fence segment
            if (selectedFencePoint && fencePoints.length >= 2) {
              const selectedIndex = fencePoints.findIndex(p => p.id === selectedFencePoint);
              if (selectedIndex >= 0 && selectedIndex < fencePoints.length - 1) {
                const p1 = fencePoints[selectedIndex];
                const p2 = fencePoints[selectedIndex + 1];
                const midPoint = {
                  x: (p1.x + p2.x) / 2,
                  y: (p1.y + p2.y) / 2,
                  id: `f${Date.now()}`
                };
                const newPoints = [...fencePoints];
                newPoints.splice(selectedIndex + 1, 0, midPoint);
                setFencePoints(newPoints);
              }
            }
          }} variant="outline" disabled={!selectedFencePoint || fencePoints.length < 2} className="flex-1 h-8 text-xs" title="Add division point to selected segment">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </Button>
            </div>
            
            <div className="flex gap-1.5">
              <Button size="sm" variant={smoothFence ? "outline" : "default"} onClick={() => setSmoothFence(false)} className="flex-1 h-7 text-[10px]">
                Straight
              </Button>
              <Button size="sm" variant={smoothFence ? "default" : "outline"} onClick={() => setSmoothFence(true)} className="flex-1 h-7 text-[10px]">
                Curved
              </Button>
            </div>
            
            <div className="space-y-1">
              <Label className="text-[10px]">Height: {fenceHeight}'</Label>
              <div className="flex items-center gap-2">
                <Input type="range" min="3" max="10" step="0.5" value={fenceHeight} onChange={e => setFenceHeight(parseFloat(e.target.value))} className="flex-1 h-2" />
                <span className="text-xs w-8 text-center">{fenceHeight}'</span>
              </div>
            </div>
            
            <div className="border-t pt-2 space-y-2">
              <Label className="text-[10px] font-medium">Doors ({fenceDoors.length})</Label>
              <div className="flex gap-1.5">
                <Button size="sm" onClick={() => {
              if (fencePoints.length >= 2) {
                const newDoor: FenceDoor = {
                  segmentIndex: 0,
                  position: 0.5,
                  width: 3,
                  id: `door_${Date.now()}`
                };
                setFenceDoors([...fenceDoors, newDoor]);
                setSelectedFenceDoor(newDoor.id);
              }
            }} variant="outline" disabled={fencePoints.length < 2} className="flex-1 h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Door
                </Button>
                <Button size="sm" onClick={() => {
              if (selectedFenceDoor) {
                setFenceDoors(prev => prev.filter(d => d.id !== selectedFenceDoor));
                setSelectedFenceDoor(null);
              }
            }} variant="outline" disabled={!selectedFenceDoor} className="flex-1 h-7 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            
            {selectedFenceDoor && fenceDoors.find(d => d.id === selectedFenceDoor) && <div className="p-2 bg-muted/50 rounded space-y-1.5 border-t">
                <Label className="text-[10px] font-medium">Door Settings</Label>
                {(() => {
            const door = fenceDoors.find(d => d.id === selectedFenceDoor)!;
            return <>
                      <div className="space-y-1">
                        <Label className="text-[9px] text-muted-foreground">
                          Segment: {door.segmentIndex + 1}/{fencePoints.length - 1}
                        </Label>
                        <Input type="range" min="0" max={Math.max(0, fencePoints.length - 2)} step="1" value={door.segmentIndex} onChange={e => {
                  setFenceDoors(prev => prev.map(d => d.id === selectedFenceDoor ? {
                    ...d,
                    segmentIndex: parseInt(e.target.value)
                  } : d));
                }} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] text-muted-foreground">
                          Position: {(door.position * 100).toFixed(0)}%
                        </Label>
                        <Input type="range" min="0" max="1" step="0.01" value={door.position} onChange={e => {
                  setFenceDoors(prev => prev.map(d => d.id === selectedFenceDoor ? {
                    ...d,
                    position: parseFloat(e.target.value)
                  } : d));
                }} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] text-muted-foreground">
                          Width: {door.width}'
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input type="range" min="2" max="8" step="0.5" value={door.width} onChange={e => {
                    setFenceDoors(prev => prev.map(d => d.id === selectedFenceDoor ? {
                      ...d,
                      width: parseFloat(e.target.value)
                    } : d));
                  }} className="flex-1 h-2" />
                          <span className="text-xs w-8 text-center">{door.width}'</span>
                        </div>
                      </div>
                    </>;
          })()}
              </div>}
            
            <Button size="sm" onClick={() => {
          setFencePoints([]);
          setFenceDoors([]);
          setSelectedFencePoint(null);
          setSelectedFenceDoor(null);
        }} variant="destructive" disabled={fencePoints.length === 0} className="w-full h-7 text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div> : (/* Pool Design Add/Remove Corner Buttons */
      <div className="absolute bottom-8 left-8 flex gap-2 z-20">
            <Button size="sm" onClick={() => {
          setActiveTool(activeTool === 'add' ? null : 'add');
          setSnapPoint(null);
        }} variant="outline" className={`h-9 w-9 p-0 bg-background/95 shadow-lg ${activeTool === 'add' ? 'bg-primary text-primary-foreground' : ''}`} title="Add Point - Click on pool perimeter">
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={removePoint} variant="outline" disabled={!selectedPoint || points.length <= 3} className="h-9 w-9 p-0 bg-background/95 shadow-lg">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>)}
      
      {/* Pool Type Selection Dialog - Shows when new pool intersects existing */}
      <Dialog open={showPoolTypeDialog} onOpenChange={setShowPoolTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">What type of pool feature is this?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            This new shape overlaps with an existing pool. Please select the type of feature you're creating:
          </p>
          <div className="grid gap-3">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 text-left" onClick={() => handlePoolTypeSelection('spillover-spa')}>
              <span className="font-semibold flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Spillover Spa
              </span>
              <span className="text-xs text-muted-foreground">
                Water flows over the edge into the main pool. Coping will be trimmed at water intersection.
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 text-left" onClick={() => handlePoolTypeSelection('tanning-ledge')}>
              <span className="font-semibold flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Tanning Ledge / Baja Shelf
              </span>
              <span className="text-xs text-muted-foreground">
                Shallow area integrated with the pool. No coping at the intersection.
              </span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1 text-left" onClick={() => handlePoolTypeSelection('regular')}>
              <span className="font-semibold flex items-center gap-2">
                <Box className="h-4 w-4" />
                Separate Pool (Keep Both)
              </span>
              <span className="text-xs text-muted-foreground">
                Two independent pools that happen to overlap. Full coping on both.
              </span>
            </Button>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="ghost" onClick={() => {
            setShowPoolTypeDialog(false);
            setPendingPoolData(null);
            setSplineDrawing({
              isActive: false,
              points: [],
              currentCurveType: 'linear'
            });
            setActiveTool(null);
          }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Deck Confirmation Dialog - Shows when new water body extends outside existing deck */}
      <Dialog open={showDeckDialog} onOpenChange={setShowDeckDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add deck around this water body?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Part of this water body extends outside the existing deck area. Would you like to add a deck around the outside portions? (3ft from perimeter by default)
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => handleDeckConfirmation(false)}>
              No Deck
            </Button>
            <Button onClick={() => handleDeckConfirmation(true)}>
              Add Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}