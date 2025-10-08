import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Minus, Plus, Trash2, Move, Lightbulb, Waves, Ruler, Home, Trees, Flower2, Droplets } from 'lucide-react';
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import { paverTypes } from '@/data/paverData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadAllTextureLODs, getTextureForLOD, getLODLevel, type TextureLODSet } from '@/utils/textureLOD';

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
}

// Helper function to shade colors
const shadeColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

export function PoolBuilder({ onPoolDataChange }: PoolBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // LOD texture system - stores all quality levels
  const textureLODsRef = useRef<TextureLODSet | null>(null);
  
  const getShapePoints = (shape: 'rectangle' | 'kidney' | 'freeform'): Point[] => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    // 15ft width = 150px, 35ft length = 350px at scale of 10
    const poolWidth = 15 * scale; // 150px
    const poolLength = 35 * scale; // 350px
    
    switch (shape) {
      case 'rectangle':
        return [
          { x: centerX - poolLength / 2, y: centerY - poolWidth / 2, id: '1' },
          { x: centerX + poolLength / 2, y: centerY - poolWidth / 2, id: '2' },
          { x: centerX + poolLength / 2, y: centerY + poolWidth / 2, id: '3' },
          { x: centerX - poolLength / 2, y: centerY + poolWidth / 2, id: '4' },
        ];
      case 'kidney':
        return [
          { x: centerX - poolLength / 2, y: centerY - poolWidth / 3, id: '1' },
          { x: centerX - poolLength / 4, y: centerY - poolWidth / 2, id: '2' },
          { x: centerX + poolLength / 4, y: centerY - poolWidth / 2.5, id: '3' },
          { x: centerX + poolLength / 2, y: centerY - poolWidth / 6, id: '4' },
          { x: centerX + poolLength / 2.5, y: centerY + poolWidth / 4, id: '5' },
          { x: centerX + poolLength / 6, y: centerY + poolWidth / 2, id: '6' },
          { x: centerX - poolLength / 4, y: centerY + poolWidth / 2.5, id: '7' },
          { x: centerX - poolLength / 2, y: centerY + poolWidth / 6, id: '8' },
        ];
      case 'freeform':
        return [
          { x: centerX - poolLength / 2, y: centerY - poolWidth / 2.5, id: '1' },
          { x: centerX - poolLength / 6, y: centerY - poolWidth / 2, id: '2' },
          { x: centerX + poolLength / 3, y: centerY - poolWidth / 3, id: '3' },
          { x: centerX + poolLength / 2, y: centerY + poolWidth / 6, id: '4' },
          { x: centerX + poolLength / 4, y: centerY + poolWidth / 2, id: '5' },
          { x: centerX - poolLength / 6, y: centerY + poolWidth / 2.2, id: '6' },
          { x: centerX - poolLength / 2, y: centerY + poolWidth / 4, id: '7' },
        ];
    }
  };

  // Generate rectangular hardscape deck that's minimum 38x18ft and always 3ft larger than pool
  const generateHardscapeFromPool = (poolPoints: Point[], deckDistanceInFeet: number = 3): HardscapePoint[] => {
    // Calculate pool bounding box
    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));
    
    // Calculate pool dimensions in feet
    const poolWidthFeet = (maxX - minX) / scale;
    const poolLengthFeet = (maxY - minY) / scale;
    
    // Calculate required deck dimensions (pool + 6ft for 3ft on each side)
    const requiredDeckWidth = poolWidthFeet + 6;
    const requiredDeckLength = poolLengthFeet + 6;
    
    // Use the larger of default minimum (38x18) or pool + 6ft
    const deckWidth = Math.max(defaultDeckWidth, requiredDeckWidth);
    const deckLength = Math.max(defaultDeckLength, requiredDeckLength);
    
    // Calculate pool center
    const poolCenterX = (minX + maxX) / 2;
    const poolCenterY = (minY + maxY) / 2;
    
    // Convert deck dimensions to pixels
    const deckWidthPixels = deckWidth * scale;
    const deckLengthPixels = deckLength * scale;
    
    // Generate rectangular deck centered on pool
    const hardscapePoints: HardscapePoint[] = [
      { x: poolCenterX - deckWidthPixels / 2, y: poolCenterY - deckLengthPixels / 2, id: 'h1' }, // Top-left
      { x: poolCenterX + deckWidthPixels / 2, y: poolCenterY - deckLengthPixels / 2, id: 'h2' }, // Top-right
      { x: poolCenterX + deckWidthPixels / 2, y: poolCenterY + deckLengthPixels / 2, id: 'h3' }, // Bottom-right
      { x: poolCenterX - deckWidthPixels / 2, y: poolCenterY + deckLengthPixels / 2, id: 'h4' }  // Bottom-left
    ];
    
    return hardscapePoints;
  };

  const [points, setPoints] = useState<Point[]>([]);
  const [hardscapePoints, setHardscapePoints] = useState<HardscapePoint[]>([]);
  const [features, setFeatures] = useState<PoolFeature[]>([]);
  const [selectedHardscapePoint, setSelectedHardscapePoint] = useState<string | null>(null);
  const [isDraggingHardscape, setIsDraggingHardscape] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [smoothCorners, setSmoothCorners] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'rotate' | 'zoom' | 'add' | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [deckOffset, setDeckOffset] = useState(3); // Deck offset in feet (minimum 3ft)
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(10); // pixels per foot - reduced for larger canvas
  const [defaultDeckWidth] = useState(18); // Default deck width in feet
  const [defaultDeckLength] = useState(38); // Default deck length in feet
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth - 20, 
    height: window.innerHeight - 100 
  });
  const [showControls, setShowControls] = useState(true);
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [pendingFeature, setPendingFeature] = useState<'jet' | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [draggingFeature, setDraggingFeature] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [selectedRoofPoint, setSelectedRoofPoint] = useState<string | null>(null);
  const [isDraggingRoof, setIsDraggingRoof] = useState(false);
  const [selectedPaverId, setSelectedPaverId] = useState('appian-adobe');
  const [selectedCopingId, setSelectedCopingId] = useState('appian-adobe');
  const [selectedFinishId, setSelectedFinishId] = useState('aquamarine');
  const [paverSize] = useState(12); // Reduced paver size for finer texture at larger scale (12 inches)
  const [poolShape, setPoolShape] = useState<'rectangle' | 'kidney' | 'freeform'>('rectangle');
  const [copingThickness, setCopingThickness] = useState(10); // Adjusted for new scale
  const [depthPoints, setDepthPoints] = useState<DepthPoint[]>([
    { position: 0, depth: 3.6, id: 'd1' },
    { position: 0.33, depth: 4.6, id: 'd2' },
    { position: 0.67, depth: 5.6, id: 'd3' },
    { position: 1, depth: 6.6, id: 'd4' }
  ]);
  const [selectedDepthPoint, setSelectedDepthPoint] = useState<string | null>(null);
  const [isDraggingDepth, setIsDraggingDepth] = useState(false);
  const [showDepthEditor, setShowDepthEditor] = useState(false);
  const [gridSnap, setGridSnap] = useState(true); // AutoCAD-like grid snapping
  const [snapSize, setSnapSize] = useState(6); // 6 inches snap (0.5 feet)
  const [activeTab, setActiveTab] = useState('pool');

  // Pricing constants
  const PAVER_COST_PER_SQFT = 15;
  const POOL_COST_PER_SQFT = 190;
  const FEATURE_COSTS = {
    stairs: 2500,
    light: 450,
    jet: 850,
    tree: 350,
    fountain: 3500,
    grass: 0,
    home: 0,
    shrub: 75,
    umbrella: 400,
    fence: 150,
    pathway: 0
  };

  // Initialize pool and hardscape centered with default decorations
  useEffect(() => {
    if (points.length === 0) {
      const initialPoolPoints = getShapePoints('rectangle');
      setPoints(initialPoolPoints);
      
      // Generate hardscape deck that follows pool with default 3ft offset
      setHardscapePoints(generateHardscapeFromPool(initialPoolPoints, deckOffset));
      
      // Add default decorations: trees, grass area, and fence
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      
      setFeatures([
        // Grass area at bottom
        { type: 'grass', x: centerX, y: centerY + 350, id: 'grass1', radius: 150 },
        // Trees in grass area
        { type: 'tree', x: centerX - 80, y: centerY + 350, id: 'tree1', treeType: 'palm' },
        { type: 'tree', x: centerX + 80, y: centerY + 350, id: 'tree2', treeType: 'oak' },
        // Default fence at top
        { 
          type: 'fence', 
          x: centerX, 
          y: centerY - 350, 
          id: 'fence1',
          roofPoints: [
            { x: centerX - 200, y: centerY - 350, id: 'fp1' },
            { x: centerX, y: centerY - 370, id: 'fp2' },
            { x: centerX + 200, y: centerY - 350, id: 'fp3' }
          ]
        }
      ]);
    }
  }, [canvasSize]);

  // Available finishes
  const finishes = [
    { id: 'aquamarine', name: 'Aquamarine', image: '/src/assets/finishes/aquamarine-g3.jpg' },
    { id: 'azure', name: 'Azure Blue', image: '/src/assets/finishes/azure-blue-g2.jpg' },
    { id: 'lagoon', name: 'Lagoon Blue', image: '/src/assets/finishes/lagoon-blue-g2.jpg' },
    { id: 'ocean', name: 'Ocean Blue', image: '/src/assets/finishes/ocean-blue-g3.jpg' },
    { id: 'sapphire', name: 'Sapphire Blue', image: '/src/assets/finishes/sapphire-blue-g3.jpg' },
    { id: 'coastal', name: 'Coastal Bronze', image: '/src/assets/finishes/coastal-bronze-g3.jpg' },
    { id: 'pearl', name: 'Athens Pearl White', image: '/src/assets/finishes/athens-pearl-white-g3.jpg' },
  ];

  // Load textures with LOD system
  useEffect(() => {
    const selectedPaver = paverTypes.find(p => p.id === selectedPaverId);
    const selectedCoping = paverTypes.find(p => p.id === selectedCopingId);
    const selectedFinish = finishes.find(f => f.id === selectedFinishId);
    
    const paverImage = selectedPaver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
    const copingImage = selectedCoping?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
    const finishImage = selectedFinish?.image || aquamarineFinish;
    
    // Load all textures with LOD levels
    setTexturesLoaded(false);
    loadAllTextureLODs(paverImage, copingImage, finishImage).then((lodSet) => {
      textureLODsRef.current = lodSet;
      setTexturesLoaded(true);
    }).catch((error) => {
      console.error('Failed to load texture LODs:', error);
      setTexturesLoaded(false);
    });
  }, [selectedPaverId, selectedCopingId, selectedFinishId]);


  // Update canvas size to maximize screen space
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth - 20;
      const height = window.innerHeight - 100;
      setCanvasSize({ width, height });
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

  // Calculate hardscape area
  const calculateHardscapeArea = useCallback(() => {
    if (hardscapePoints.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < hardscapePoints.length; i++) {
      const current = hardscapePoints[i];
      const next = hardscapePoints[(i + 1) % hardscapePoints.length];
      area += current.x * next.y - next.x * current.y;
    }
    const sqPixels = Math.abs(area / 2);
    const hardscapeAreaSqFt = sqPixels / (scale * scale);
    const poolAreaSqFt = parseFloat(calculateArea());
    return Math.max(0, hardscapeAreaSqFt - poolAreaSqFt);
  }, [hardscapePoints, scale, points]);

  // Find nearest point on pool perimeter
  const findNearestWallPoint = (x: number, y: number) => {
    let minDist = Infinity;
    let nearestPoint = { x, y, segment: 0, position: 0, angle: 0 };

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
        nearestPoint = { x: projX, y: projY, segment: i, position: t, angle };
      }
    }
    
    return nearestPoint;
  };

  // Check if point is inside pool
  const isInsidePool = (x: number, y: number) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x, yi = points[i].y;
      const xj = points[j].x, yj = points[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Draw the pool shape
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !texturesLoaded) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw grass background - flat color
    ctx.fillStyle = '#4A7C3C';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

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
      ctx.clip();
      
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

    // Draw pool shape - straight lines for rectangle, curves for others
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
      } else {
        // Draw with smooth curves for kidney and freeform
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

      // Draw coping border with individual paver bricks
      const copingTexture = textureLODsRef.current ? getTextureForLOD(textureLODsRef.current.coping, zoomLevel) : null;
      if (copingTexture) {
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
      
      // Simple flat water texture
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
        sortedDepths.forEach((dp) => {
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
          ctx.fillRect(
            x - metrics.width / 2 - padding,
            y - 25 - 10,
            metrics.width + padding * 2,
            20
          );
          
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
      const distance = Math.sqrt(
        Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
      ) / scale;

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
      ctx.fillRect(
        midX + offsetX - metrics.width / 2 - padding,
        midY + offsetY - 8,
        metrics.width + padding * 2,
        16
      );
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, midX + offsetX, midY + offsetY);
    }

    // Draw hardscape anchor points
    hardscapePoints.forEach((point) => {
      const size = 10;
      const isSelected = selectedHardscapePoint === point.id;
      
      ctx.fillStyle = isSelected ? '#F59E0B' : '#ffffff';
      ctx.strokeStyle = isSelected ? '#D97706' : '#F59E0B';
      ctx.lineWidth = 2;
      ctx.fillRect(point.x - size / 2, point.y - size / 2, size, size);
      ctx.strokeRect(point.x - size / 2, point.y - size / 2, size, size);
    });

    // Draw anchor points for pool
    points.forEach((point) => {
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
        const y = (i / 10) * (editorHeight - 30);
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
        const y = 10 + (dp.depth / 10) * (editorHeight - 40);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Depth anchor points
      sortedDepths.forEach((dp) => {
        const x = 10 + dp.position * (editorWidth - 20);
        const y = 10 + (dp.depth / 10) * (editorHeight - 40);
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
      sortedDepths.forEach((dp) => {
        const x = editorX + 10 + dp.position * (editorWidth - 20);
        const y = editorY + editorHeight - 10 - (dp.depth / 10) * (editorHeight - 40);
        ctx.fillText(`${dp.depth.toFixed(1)}'`, x, y - 10);
      });
    }

    // Draw landscape features first (behind pool)
    features.filter(f => f.type === 'grass' || f.type === 'home').forEach((feature) => {
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
        // House with editable roof (like roof.jpg reference)
        const isSelected = selectedFeature === feature.id;
        
        // Initialize roof points if not exist (complex multi-section roof)
        if (!feature.roofPoints || feature.roofPoints.length === 0) {
          const width = 200;
          const height = 150;
          feature.roofPoints = [
            { x: -width/2, y: -height/2, id: 'r1' },
            { x: -width/4, y: -height/2, id: 'r2' },
            { x: width/4, y: -height/2, id: 'r3' },
            { x: width/2, y: -height/2, id: 'r4' },
            { x: width/2, y: 0, id: 'r5' },
            { x: width/2, y: height/2, id: 'r6' },
            { x: width/4, y: height/2, id: 'r7' },
            { x: -width/4, y: height/2, id: 'r8' },
            { x: -width/2, y: height/2, id: 'r9' },
            { x: -width/2, y: 0, id: 'r10' }
          ];
        }
        
        // Draw roof with splines
        ctx.save();
        ctx.translate(feature.x, feature.y);
        
        // Create roof shape
        ctx.beginPath();
        const roofPts = feature.roofPoints;
        if (roofPts.length > 2) {
          ctx.moveTo(roofPts[0].x, roofPts[0].y);
          for (let i = 1; i < roofPts.length; i++) {
            ctx.lineTo(roofPts[i].x, roofPts[i].y);
          }
          ctx.closePath();
          
          // Roof gradient fill
          const roofGradient = ctx.createLinearGradient(
            -100, -75, 100, 75
          );
          roofGradient.addColorStop(0, '#8B4513');
          roofGradient.addColorStop(0.3, '#A0522D');
          roofGradient.addColorStop(0.6, '#8B4513');
          roofGradient.addColorStop(1, '#704214');
          
          ctx.fillStyle = roofGradient;
          ctx.fill();
          
          // Roof sections - create visual depth like the reference
          ctx.strokeStyle = 'rgba(60, 40, 20, 0.4)';
          ctx.lineWidth = 2;
          
          // Draw ridge lines to create multi-section appearance
          for (let i = 1; i < roofPts.length - 1; i += 2) {
            ctx.beginPath();
            ctx.moveTo(roofPts[i].x, roofPts[i].y);
            ctx.lineTo(roofPts[i+1]?.x || roofPts[i].x, roofPts[i+1]?.y || roofPts[i].y);
            ctx.stroke();
          }
          
          // Shingle pattern
          ctx.strokeStyle = 'rgba(40, 30, 15, 0.25)';
          ctx.lineWidth = 0.8;
          for (let i = 0; i < 20; i++) {
            const progress = i / 20;
            const minX = Math.min(...roofPts.map(p => p.x));
            const maxX = Math.max(...roofPts.map(p => p.x));
            const minY = Math.min(...roofPts.map(p => p.y));
            const maxY = Math.max(...roofPts.map(p => p.y));
            
            const y = minY + (maxY - minY) * progress;
            ctx.beginPath();
            ctx.moveTo(minX, y);
            ctx.lineTo(maxX, y);
            ctx.stroke();
          }
          
          // Roof outline
          ctx.strokeStyle = isSelected ? '#FFD700' : '#5D4E37';
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw roof anchor points when selected
        if (isSelected && feature.roofPoints) {
          feature.roofPoints.forEach((rp) => {
            const rpx = feature.x + rp.x;
            const rpy = feature.y + rp.y;
            const size = 8;
            const isRoofSelected = selectedRoofPoint === rp.id;
            
            ctx.fillStyle = isRoofSelected ? '#2E86AB' : '#ffffff';
            ctx.strokeStyle = isRoofSelected ? '#1a4d6d' : '#2E86AB';
            ctx.lineWidth = 2;
            ctx.fillRect(rpx - size / 2, rpy - size / 2, size, size);
            ctx.strokeRect(rpx - size / 2, rpy - size / 2, size, size);
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
            const angle = (i / 5) * Math.PI * 2;
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
            const angle = (i / 8) * Math.PI * 2;
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
          const angle1 = (i / segments) * Math.PI * 2;
          const angle2 = ((i + 1) / segments) * Math.PI * 2;
          
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
        const fencePoints = feature.roofPoints || [
          { x: feature.x - 80, y: feature.y, id: 'fp1' },
          { x: feature.x, y: feature.y - 20, id: 'fp2' },
          { x: feature.x + 80, y: feature.y, id: 'fp3' }
        ];
        
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
          if (i === 0) ctx.moveTo(point.x, point.y - 10);
          else {
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
          if (i === 0) ctx.moveTo(point.x, point.y + 10);
          else {
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
              const angle1 = (seg / segments) * Math.PI * 2;
              const angle2 = ((seg + 1) / segments) * Math.PI * 2;
              
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
    features.filter(f => f.type !== 'grass' && f.type !== 'home').forEach((feature) => {
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
          ctx.fillRect(
            -stepWidth / 2,
            -steps * stepHeight / 2 + i * stepHeight,
            stepWidth,
            stepHeight - 1
          );
          ctx.strokeRect(
            -stepWidth / 2,
            -steps * stepHeight / 2 + i * stepHeight,
            stepWidth,
            stepHeight - 1
          );
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
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(feature.x, feature.y - 20);
            ctx.quadraticCurveTo(
              feature.x + Math.cos(angle) * 20,
              feature.y - 30,
              feature.x + Math.cos(angle) * 40,
              feature.y - 25
            );
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
          const canopyGradient = ctx.createRadialGradient(
            feature.x, feature.y - 10, 0,
            feature.x, feature.y - 10, 45
          );
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
        const waterGradient = ctx.createRadialGradient(
          feature.x, feature.y + 15, 0,
          feature.x, feature.y + 15, 20
        );
        waterGradient.addColorStop(0, 'rgba(160, 216, 241, 0.8)');
        waterGradient.addColorStop(1, 'rgba(91, 165, 198, 0.6)');
        ctx.fillStyle = waterGradient;
        ctx.beginPath();
        ctx.ellipse(feature.x, feature.y + 15, 20, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Static water spray
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const height = 15;
          ctx.strokeStyle = 'rgba(160, 216, 241, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(feature.x, feature.y + 15);
          ctx.quadraticCurveTo(
            feature.x + Math.cos(angle) * 8,
            feature.y - height,
            feature.x + Math.cos(angle) * 4,
            feature.y + 15
          );
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

  }, [points, features, selectedPoint, hoveredPoint, canvasSize, scale, pendingFeature, cursorPos, selectedFeature, texturesLoaded, paverSize, copingThickness, selectedPaverId, selectedCopingId, selectedFinishId, poolShape, hardscapePoints, selectedHardscapePoint, selectedRoofPoint, showDepthEditor, depthPoints, selectedDepthPoint, zoomLevel]);

  // Memoize perimeter and area calculations
  const poolPerimeter = useMemo(() => parseFloat(calculatePerimeter()), [points]);
  const poolArea = useMemo(() => parseFloat(calculateArea()), [points]);

  // Calculate total project cost
  const calculateTotalCost = useCallback(() => {
    // Pool cost
    const poolCost = poolArea * POOL_COST_PER_SQFT;
    
    // Hardscape/deck cost
    const deckArea = calculateHardscapeArea();
    const deckCost = deckArea * PAVER_COST_PER_SQFT;
    
    // Calculate coping perimeter and cost
    const copingPerimeterFeet = poolPerimeter;
    const copingWidthFeet = paverSize / 12; // Convert inches to feet
    const copingArea = copingPerimeterFeet * copingWidthFeet;
    const copingCost = copingArea * PAVER_COST_PER_SQFT;
    
    // Features cost
    const featuresCost = features.reduce((total, feature) => {
      return total + (FEATURE_COSTS[feature.type] || 0);
    }, 0);
    
    return {
      poolCost,
      deckCost,
      copingCost,
      featuresCost,
      total: poolCost + deckCost + copingCost + featuresCost
    };
  }, [poolArea, poolPerimeter, features, calculateHardscapeArea, paverSize]);

  const projectCost = useMemo(() => calculateTotalCost(), [calculateTotalCost]);

  // Notify parent of pool data changes (separate from drawing)
  useEffect(() => {
    if (onPoolDataChange) {
      const cost = calculateTotalCost();
      onPoolDataChange({
        points,
        features,
        perimeter: poolPerimeter,
        area: poolArea,
        deckArea: calculateHardscapeArea(),
        totalCost: cost.total,
        breakdown: cost
      });
    }
  }, [points, features, poolPerimeter, poolArea, onPoolDataChange, calculateTotalCost, calculateHardscapeArea]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Apply grid snapping for AutoCAD-like precision
    if (gridSnap) {
      const snapPixels = (snapSize / 12) * scale; // Convert inches to pixels
      x = Math.round(x / snapPixels) * snapPixels;
      y = Math.round(y / snapPixels) * snapPixels;
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
        const dpy = editorY + editorHeight - 10 - (dp.depth / 10) * (editorHeight - 40);
        
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

    // Check if clicked on hardscape point
    const clickedHardscapePoint = hardscapePoints.find(p => 
      Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
    );

    if (clickedHardscapePoint) {
      setSelectedHardscapePoint(clickedHardscapePoint.id);
      setSelectedPoint(null);
      setSelectedFeature(null);
      setSelectedRoofPoint(null);
      setSelectedDepthPoint(null);
      return;
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
    const clickedFeature = features.find(f => 
      Math.sqrt((f.x - x) ** 2 + (f.y - y) ** 2) < 15
    );

    if (clickedFeature) {
      setSelectedFeature(clickedFeature.id);
      setSelectedPoint(null);
      return;
    }

    // Check if clicked on a point
    const clickedPoint = points.find(p => 
      Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
    );

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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pendingFeature) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If in add mode, add a new point at the snapped location
    if (activeTool === 'add' && snapPoint) {
      const newPoint = { x: snapPoint.x, y: snapPoint.y, id: Date.now().toString() };
      
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
        
        const distance = Math.sqrt(
          Math.pow(snapPoint.x - (edge.x1 + edge.x2) / 2, 2) +
          Math.pow(snapPoint.y - (edge.y1 + edge.y2) / 2, 2)
        );
        
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
        const dpy = editorY + editorHeight - 10 - (dp.depth / 10) * (editorHeight - 40);
        
        if (Math.sqrt(Math.pow(dpx - x, 2) + Math.pow(dpy - y, 2)) < 10) {
          setSelectedDepthPoint(dp.id);
          setIsDraggingDepth(true);
          return;
        }
      }
    }

    // Check for hardscape point drag
    const clickedHardscapePoint = hardscapePoints.find(p => 
      Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
    );

    if (clickedHardscapePoint) {
      setSelectedHardscapePoint(clickedHardscapePoint.id);
      setIsDraggingHardscape(true);
      return;
    }

    // Check for feature drag
    const clickedFeature = features.find(f => 
      Math.sqrt((f.x - x) ** 2 + (f.y - y) ** 2) < 15
    );

    if (clickedFeature) {
      setSelectedFeature(clickedFeature.id);
      setDraggingFeature(true);
      return;
    }

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

    // If in add mode, calculate snap point on pool perimeter
    if (activeTool === 'add') {
      let closestPoint = { x, y };
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
        
        const distance = Math.sqrt(
          Math.pow(x - projectedX, 2) + Math.pow(y - projectedY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = { x: projectedX, y: projectedY };
        }
      }

      setSnapPoint(closestPoint);
      setCursorPos({ x, y });
      return;
    }

    // Update cursor position for pending features
    setCursorPos({ x, y });

    // Apply grid snapping
    let snappedX = x;
    let snappedY = y;
    if (gridSnap) {
      const snapPixels = (snapSize / 12) * scale;
      snappedX = Math.round(x / snapPixels) * snapPixels;
      snappedY = Math.round(y / snapPixels) * snapPixels;
    }

    if (isDraggingDepth && selectedDepthPoint && showDepthEditor) {
      const editorX = 50;
      const editorY = canvasSize.height - 200;
      const editorWidth = 400;
      const editorHeight = 150;
      
      // Calculate new position and depth
      const relX = x - editorX - 10;
      const relY = (editorY + editorHeight - y) - 10;
      
      const newPosition = Math.max(0, Math.min(1, relX / (editorWidth - 20)));
      const newDepth = Math.max(1, Math.min(10, relY / (editorHeight - 40) * 10));
      
      setDepthPoints(prev => prev.map(dp =>
        dp.id === selectedDepthPoint
          ? { ...dp, position: newPosition, depth: newDepth }
          : dp
      ));
    } else if (isDraggingRoof && selectedRoofPoint && selectedFeature) {
      const house = features.find(f => f.id === selectedFeature && f.type === 'home');
      if (house && house.roofPoints) {
        const relativeX = x - house.x;
        const relativeY = y - house.y;
        
        setFeatures(prev => prev.map(f => 
          f.id === selectedFeature && f.type === 'home' && f.roofPoints
            ? {
                ...f,
                roofPoints: f.roofPoints.map(rp =>
                  rp.id === selectedRoofPoint
                    ? { ...rp, x: relativeX, y: relativeY }
                    : rp
                )
              }
            : f
        ));
      }
    } else if (isDraggingHardscape && selectedHardscapePoint) {
      const boundedX = Math.max(0, Math.min(canvasSize.width, snappedX));
      const boundedY = Math.max(0, Math.min(canvasSize.height, snappedY));

      setHardscapePoints(prev => prev.map(p => 
        p.id === selectedHardscapePoint ? { ...p, x: boundedX, y: boundedY } : p
      ));
    } else if (draggingFeature && selectedFeature) {
      const feature = features.find(f => f.id === selectedFeature);
      if (!feature) return;

      if (feature.type === 'light' || feature.type === 'stairs') {
        // Snap to wall
        const wallPoint = findNearestWallPoint(x, y);
        setFeatures(prev => prev.map(f => 
          f.id === selectedFeature 
            ? { 
                ...f, 
                x: wallPoint.x, 
                y: wallPoint.y,
                wallSegment: wallPoint.segment,
                wallPosition: wallPoint.position,
                angle: wallPoint.angle + Math.PI / 2
              } 
            : f
        ));
      } else if (feature.type === 'tree') {
        // Snap trees to grass areas
        const grassAreas = features.filter(f => f.type === 'grass');
        let snappedToGrass = false;
        
        for (const grass of grassAreas) {
          const distToGrass = Math.sqrt((x - grass.x) ** 2 + (y - grass.y) ** 2);
          if (distToGrass < (grass.radius || 80)) {
            setFeatures(prev => prev.map(f => 
              f.id === selectedFeature ? { ...f, x, y } : f
            ));
            snappedToGrass = true;
            break;
          }
        }
        
        if (!snappedToGrass) {
          setFeatures(prev => prev.map(f => 
            f.id === selectedFeature ? { ...f, x, y } : f
          ));
        }
      } else {
        // Other features can be placed anywhere
        setFeatures(prev => prev.map(f => 
          f.id === selectedFeature ? { ...f, x, y } : f
        ));
      }
    } else if (isDragging && selectedPoint) {
      const boundedX = Math.max(0, Math.min(canvasSize.width, snappedX));
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
    setDraggingFeature(false);
    setIsDraggingHardscape(false);
    setIsDraggingRoof(false);
    setIsDraggingDepth(false);
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

  const addFeature = (type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home' | 'shrub' | 'umbrella' | 'fence' | 'pathway') => {
    if (type === 'jet') {
      setPendingFeature('jet');
      return;
    }

    let newFeature: PoolFeature;
    
    if (type === 'tree' || type === 'fountain' || type === 'grass' || type === 'home' || type === 'shrub' || type === 'umbrella' || type === 'fence' || type === 'pathway') {
      // Place in open area
      newFeature = {
        type,
        x: canvasSize.width / 2 + Math.random() * 100 - 50,
        y: canvasSize.height / 2 + Math.random() * 100 - 50,
        id: Date.now().toString(),
        treeType: type === 'tree' ? 'oak' : undefined,
        radius: type === 'grass' ? 80 : undefined,
        width: type === 'home' ? 200 : undefined,
        height: type === 'home' ? 150 : undefined,
      };
    } else if (type === 'light') {
      // Lights snap to walls and point inward
      const wallPoint = findNearestWallPoint(canvasSize.width / 2, canvasSize.height / 2);
      
      newFeature = {
        type,
        x: wallPoint.x,
        y: wallPoint.y,
        id: Date.now().toString(),
        angle: wallPoint.angle + Math.PI / 2, // Point inward
        wallSegment: wallPoint.segment,
        wallPosition: wallPoint.position
      };
    } else {
      // Stairs snap to walls
      const wallPoint = findNearestWallPoint(canvasSize.width / 2, canvasSize.height / 2);
      
      newFeature = {
        type,
        x: wallPoint.x,
        y: wallPoint.y,
        id: Date.now().toString(),
        steps: type === 'stairs' ? 3 : undefined,
        angle: wallPoint.angle + Math.PI / 2,
        wallSegment: wallPoint.segment,
        wallPosition: wallPoint.position
      };
    }
    
    setFeatures([...features, newFeature]);
    setSelectedFeature(newFeature.id);
  };

  const addStairStep = () => {
    if (!selectedFeature) return;
    setFeatures(prev => prev.map(f => 
      f.id === selectedFeature && f.type === 'stairs'
        ? { ...f, steps: (f.steps || 3) + 1 }
        : f
    ));
  };

  const removeStairStep = () => {
    if (!selectedFeature) return;
    setFeatures(prev => prev.map(f => 
      f.id === selectedFeature && f.type === 'stairs' && (f.steps || 3) > 1
        ? { ...f, steps: (f.steps || 3) - 1 }
        : f
    ));
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

    setPoints(prev => prev.map((p, i) => 
      i === (index + 1) % points.length 
        ? { ...p, x: current.x + dx, y: current.y + dy }
        : p
    ));
  };

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Top Control Bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowControls(!showControls)}>
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </Button>
        </div>

        
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-1 text-xs">
            <Ruler className="h-3 w-3" />
            <span className="font-bold">{calculatePerimeter()}</span>
            <span className="text-muted-foreground">ft</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold">{calculateArea()}</span>
            <span className="text-muted-foreground">sq ft pool</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold">{points.length}</span>
            <span className="text-muted-foreground">corners</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold">{features.length}</span>
            <span className="text-muted-foreground">features</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold">{calculateHardscapeArea().toFixed(1)}</span>
            <span className="text-muted-foreground">sq ft deck</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            <span className="text-muted-foreground">Total:</span>
            <span className="text-lg">${projectCost.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Collapsible Controls Panel */}
      {showControls && (
        <div className="border-b bg-background/95 backdrop-blur">
          <Tabs defaultValue="pool" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger value="pool" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Pool Design
              </TabsTrigger>
              <TabsTrigger value="materials" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Materials
              </TabsTrigger>
              <TabsTrigger value="features" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Features
              </TabsTrigger>
              <TabsTrigger value="shape" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Shape
              </TabsTrigger>
              <TabsTrigger value="depth" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Depth
              </TabsTrigger>
              <TabsTrigger value="landscape" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Landscape
              </TabsTrigger>
            </TabsList>

            {/* Pool Design Tab */}
            <TabsContent value="pool" className="mt-0 p-2 space-y-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setSmoothCorners(!smoothCorners)}
                    variant={smoothCorners ? "default" : "outline"}
                    className="h-7 text-[10px]"
                  >
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h18v18H3z" strokeLinejoin={smoothCorners ? "round" : "miter"} />
                    </svg>
                    {smoothCorners ? 'Smooth' : 'Squared'}
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Deck Size:</Label>
                  <Input
                    type="number"
                    value={deckOffset}
                    onChange={(e) => {
                      const newOffset = Math.max(3, parseFloat(e.target.value) || 3);
                      setDeckOffset(newOffset);
                      setHardscapePoints(generateHardscapeFromPool(points, newOffset));
                    }}
                    className="h-7 w-20 text-xs"
                    min="3"
                    step="0.5"
                  />
                  <span className="text-xs text-muted-foreground">ft</span>
                </div>
              </div>
            </TabsContent>

            {/* Shape Tab */}
            <TabsContent value="shape" className="mt-0 p-2 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={poolShape === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => {
                    setPoolShape('rectangle');
                    const newPoolPoints = getShapePoints('rectangle');
                    setPoints(newPoolPoints);
                    setHardscapePoints(generateHardscapeFromPool(newPoolPoints, deckOffset));
                    setFeatures([]);
                  }}
                  className="h-8 text-xs"
                >
                  Rectangle
                </Button>
                <Button
                  size="sm"
                  variant={poolShape === 'kidney' ? 'default' : 'outline'}
                  onClick={() => {
                    setPoolShape('kidney');
                    const newPoolPoints = getShapePoints('kidney');
                    setPoints(newPoolPoints);
                    setHardscapePoints(generateHardscapeFromPool(newPoolPoints, deckOffset));
                    setFeatures([]);
                  }}
                  className="h-8 text-xs"
                >
                  Kidney
                </Button>
                <Button
                  size="sm"
                  variant={poolShape === 'freeform' ? 'default' : 'outline'}
                  onClick={() => {
                    setPoolShape('freeform');
                    const newPoolPoints = getShapePoints('freeform');
                    setPoints(newPoolPoints);
                    setHardscapePoints(generateHardscapeFromPool(newPoolPoints, deckOffset));
                    setFeatures([]);
                  }}
                  className="h-8 text-xs"
                >
                  Freeform
                </Button>
              </div>
            </TabsContent>

            {/* Depth Tab */}
            <TabsContent value="depth" className="mt-0 p-3 space-y-3">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Depth Profile</Label>
                  <p className="text-xs text-muted-foreground">Adjust depth at each anchor point</p>
                </div>

                {/* Depth Anchor Controls */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Depth Anchors (Shallow to Deep)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {depthPoints.sort((a, b) => a.position - b.position).map((dp, index) => (
                      <div key={dp.id} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Anchor {index + 1} ({(dp.position * 100).toFixed(0)}%)
                        </Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={dp.depth.toFixed(1)}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') return;
                              const newDepth = Math.max(1, Math.min(12, parseFloat(value)));
                              setDepthPoints(prev => prev.map(d => 
                                d.id === dp.id ? { ...d, depth: newDepth } : d
                              ));
                            }}
                            className="h-8 text-xs"
                            min="1"
                            max="12"
                            step="0.1"
                          />
                          <span className="text-xs text-muted-foreground">ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Cut Visualization */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Section Cut - Depth Profile</Label>
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <svg width="100%" height="120" viewBox="0 0 300 120" className="overflow-visible">
                      {/* Pool outline */}
                      <rect x="10" y="10" width="280" height="100" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="3,3" />
                      
                      {/* Water line */}
                      <line x1="10" y1="10" x2="290" y2="10" stroke="hsl(var(--primary))" strokeWidth="2" />
                      <text x="5" y="12" fontSize="10" fill="hsl(var(--muted-foreground))" textAnchor="end">0'</text>
                      
                      {/* Depth profile curve */}
                      <path
                        d={`M ${10 + depthPoints.sort((a, b) => a.position - b.position).map((dp, i) => {
                          const x = 10 + dp.position * 280;
                          const y = 10 + (dp.depth / 12) * 100;
                          return i === 0 ? `${x},${y}` : `L ${x},${y}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                      />
                      
                      {/* Depth anchor points and labels */}
                      {depthPoints.sort((a, b) => a.position - b.position).map((dp, i) => {
                        const x = 10 + dp.position * 280;
                        const y = 10 + (dp.depth / 12) * 100;
                        return (
                          <g key={dp.id}>
                            <circle cx={x} cy={y} r="3" fill="hsl(var(--primary))" />
                            <line x1={x} y1={y} x2={x} y2="115" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                            <text x={x} y={y - 6} fontSize="9" fill="hsl(var(--foreground))" textAnchor="middle" fontWeight="600">
                              {dp.depth.toFixed(1)}'
                            </text>
                            <text x={x} y="125" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="middle">
                              {(dp.position * 100).toFixed(0)}%
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Pool floor fill */}
                      <path
                        d={`M 10,110 ${depthPoints.sort((a, b) => a.position - b.position).map(dp => {
                          const x = 10 + dp.position * 280;
                          const y = 10 + (dp.depth / 12) * 100;
                          return `L ${x},${y}`;
                        }).join(' ')} L 290,110 Z`}
                        fill="hsl(var(--primary)/0.1)"
                        stroke="none"
                      />
                    </svg>
                  </div>
                </div>

                {selectedDepthPoint && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <Label className="text-xs font-medium">Depth Point Editor</Label>
                    {depthPoints.filter(dp => dp.id === selectedDepthPoint).map(dp => (
                      <div key={dp.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs flex-1">Position: {(dp.position * 100).toFixed(0)}%</Label>
                          <Input
                            type="number"
                            value={(dp.position * 100).toFixed(0)}
                            onChange={(e) => {
                              const newPos = Math.max(0, Math.min(100, parseFloat(e.target.value))) / 100;
                              setDepthPoints(prev => prev.map(d => 
                                d.id === dp.id ? { ...d, position: newPos } : d
                              ));
                            }}
                            className="h-7 w-20"
                            min="0"
                            max="100"
                            step="1"
                          />
                        </div>
                         <div className="flex items-center gap-2">
                           <Label className="text-xs flex-1">Depth: {dp.depth.toFixed(1)}'</Label>
                           <Input
                             type="number"
                             value={dp.depth.toFixed(1)}
                             onChange={(e) => {
                               const newDepth = Math.max(1, Math.min(9, parseFloat(e.target.value)));
                               setDepthPoints(prev => prev.map(d => 
                                 d.id === dp.id ? { ...d, depth: newDepth } : d
                               ));
                             }}
                             className="h-7 w-20"
                             min="1"
                             max="9"
                             step="0.5"
                           />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const maxId = Math.max(...depthPoints.map(d => parseInt(d.id.replace('d', ''))));
                              setDepthPoints([...depthPoints, {
                                id: `d${maxId + 1}`,
                                position: 0.5,
                                depth: 5
                              }]);
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Point
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              if (depthPoints.length > 2) {
                                setDepthPoints(prev => prev.filter(d => d.id !== selectedDepthPoint));
                                setSelectedDepthPoint(null);
                              }
                            }}
                            variant="outline"
                            disabled={depthPoints.length <= 2}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials" className="mt-0 p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Pool Finish</Label>
                  <Select value={selectedFinishId} onValueChange={setSelectedFinishId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50 bg-background">
                      {finishes.map((finish) => (
                        <SelectItem key={finish.id} value={finish.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded border bg-cover bg-center"
                              style={{ backgroundImage: `url(${finish.image})` }}
                            />
                            <span>{finish.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Coping Pavers</Label>
                  <Select value={selectedCopingId} onValueChange={setSelectedCopingId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50 bg-background">
                      {paverTypes.filter(p => p.category === 'paver').map((paver) => (
                        <SelectItem key={paver.id} value={paver.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded border bg-cover bg-center"
                              style={{ backgroundImage: `url(${paver.image})` }}
                            />
                            <span>{paver.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Deck Pavers</Label>
                  <Select value={selectedPaverId} onValueChange={setSelectedPaverId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] z-50 bg-background">
                      {paverTypes.filter(p => p.category === 'paver').map((paver) => (
                        <SelectItem key={paver.id} value={paver.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-5 h-5 rounded border bg-cover bg-center"
                              style={{ backgroundImage: `url(${paver.image})` }}
                            />
                            <span>{paver.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="mt-0 p-2 space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                <Button size="sm" onClick={() => addFeature('stairs')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Move className="h-4 w-4" />
                  <span className="text-[10px]">Stairs</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('light')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Lightbulb className="h-4 w-4" />
                  <span className="text-[10px]">Light</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => addFeature('jet')} 
                  variant="outline"
                  disabled={pendingFeature === 'jet'}
                  className="h-auto py-2 flex-col gap-0.5"
                >
                  <Waves className="h-4 w-4" />
                  <span className="text-[10px]">Jet</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('fountain')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Droplets className="h-4 w-4" />
                  <span className="text-[10px]">Fountain</span>
                </Button>
              </div>

              {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'stairs' && (
                <div className="p-2 bg-muted/50 rounded space-y-1.5">
                  <Label className="text-[10px] font-medium">Stairs</Label>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={addStairStep} variant="outline" className="flex-1 h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Step
                    </Button>
                    <Button size="sm" onClick={removeStairStep} variant="outline" className="flex-1 h-7 text-xs">
                      <Minus className="h-3 w-3 mr-1" />
                      Step
                    </Button>
                  </div>
                </div>
              )}

              {selectedFeature && (
                <Button size="sm" onClick={removeFeature} variant="destructive" className="w-full h-7 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              )}
            </TabsContent>

            {/* Landscape Tab */}
            <TabsContent value="landscape" className="mt-0 p-2 space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                <Button size="sm" onClick={() => addFeature('tree')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Trees className="h-4 w-4" />
                  <span className="text-[10px]">Tree</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('shrub')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Flower2 className="h-4 w-4" />
                  <span className="text-[10px]">Shrub</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('grass')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Flower2 className="h-4 w-4" />
                  <span className="text-[10px]">Grass</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('home')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <Home className="h-4 w-4" />
                  <span className="text-[10px]">House</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('umbrella')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C7.03 2 3 6.03 3 11h18c0-4.97-4.03-9-9-9z" />
                    <line x1="12" y1="11" x2="12" y2="22" />
                  </svg>
                  <span className="text-[10px]">Umbrella</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('fence')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="6" width="3" height="12" />
                    <rect x="10" y="6" width="3" height="12" />
                    <rect x="17" y="6" width="3" height="12" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                    <line x1="2" y1="14" x2="22" y2="14" />
                  </svg>
                  <span className="text-[10px]">Fence</span>
                </Button>
                <Button size="sm" onClick={() => addFeature('pathway')} variant="outline" className="h-auto py-2 flex-col gap-0.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="5" width="4" height="4" />
                    <rect x="11" y="7" width="4" height="4" />
                    <rect x="5" y="11" width="4" height="4" />
                    <rect x="11" y="13" width="4" height="4" />
                    <rect x="17" y="9" width="4" height="4" />
                  </svg>
                  <span className="text-[10px]">Path</span>
                </Button>
              </div>

              {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'tree' && (
                <div className="p-2 bg-muted/50 rounded space-y-1.5">
                  <Label className="text-[10px] font-medium">Tree Type</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['oak', 'palm', 'pine', 'willow', 'maple', 'cypress'].map(treeType => (
                      <Button 
                        key={treeType}
                        size="sm" 
                        onClick={() => {
                          setFeatures(prev => prev.map(f => 
                            f.id === selectedFeature ? { ...f, treeType: treeType as any } : f
                          ));
                        }} 
                        variant="outline"
                        className="capitalize h-7 text-[10px]"
                      >
                        {treeType}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'shrub' && (
                <div className="p-2 bg-muted/50 rounded space-y-1.5">
                  <Label className="text-[10px] font-medium">Shrub Type</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['round', 'flowering', 'hedge'].map(shrubType => (
                      <Button 
                        key={shrubType}
                        size="sm" 
                        onClick={() => {
                          setFeatures(prev => prev.map(f => 
                            f.id === selectedFeature ? { ...f, shrubType: shrubType as any } : f
                          ));
                        }} 
                        variant="outline"
                        className="capitalize h-7 text-[10px]"
                      >
                        {shrubType}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'pathway' && (
                <div className="p-2 bg-muted/50 rounded space-y-1.5">
                  <Label className="text-[10px] font-medium">Path Type</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['straight', 'curved', 'circular'].map(pathType => (
                      <Button 
                        key={pathType}
                        size="sm" 
                        onClick={() => {
                          setFeatures(prev => prev.map(f => 
                            f.id === selectedFeature ? { ...f, pathwayType: pathType as any } : f
                          ));
                        }} 
                        variant="outline"
                        className="capitalize h-7 text-[10px]"
                      >
                        {pathType}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'fence' && (
                <div className="p-2 bg-muted/50 rounded space-y-1.5">
                  <Label className="text-[10px] font-medium">Fence Points</Label>
                  <div className="flex gap-1.5">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const fence = features.find(f => f.id === selectedFeature);
                        if (!fence) return;
                        const points = fence.roofPoints || [
                          { x: fence.x - 40, y: fence.y, id: 'fp1' },
                          { x: fence.x + 40, y: fence.y, id: 'fp2' }
                        ];
                        const newId = `fp${points.length + 1}`;
                        setFeatures(prev => prev.map(f => 
                          f.id === selectedFeature 
                            ? { ...f, roofPoints: [...points, { x: fence.x, y: fence.y, id: newId }] } 
                            : f
                        ));
                      }}
                      variant="outline" 
                      className="flex-1 h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Point
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setFeatures(prev => prev.map(f => {
                          if (f.id === selectedFeature && f.roofPoints && f.roofPoints.length > 2) {
                            return { ...f, roofPoints: f.roofPoints.slice(0, -1) };
                          }
                          return f;
                        }));
                      }}
                      variant="outline" 
                      className="flex-1 h-7 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}

              {selectedFeature && (
                <Button size="sm" onClick={removeFeature} variant="destructive" className="w-full h-7 text-xs">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              )}

            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Canvas with Legend */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden relative">
        {/* Main Canvas */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="border-2 border-border rounded-lg shadow-2xl touch-none bg-gradient-to-br from-background to-muted/10"
              style={{ 
                cursor: pendingFeature === 'jet' ? 'crosshair' 
                  : activeTool === 'add' ? 'crosshair'
                  : activeTool === 'select' ? 'default' 
                  : activeTool === 'rotate' ? 'grab' 
                  : 'zoom-in' 
              }}
            />
          </div>
        </div>


        {/* Tool Buttons - Top Left of Canvas */}
        <div className="absolute top-8 left-8 flex items-center gap-2 z-20 bg-background/95 backdrop-blur p-2 rounded-lg border shadow-lg scale-[0.8] opacity-20 hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="sm" 
            variant={activeTool === 'select' ? "default" : "outline"}
            onClick={() => setActiveTool('select')}
            className="h-8 w-8 p-0"
            title="Select"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
            </svg>
          </Button>
          <Button 
            size="sm" 
            variant={activeTool === 'rotate' ? "default" : "outline"}
            onClick={() => setActiveTool('rotate')}
            className="h-8 w-8 p-0"
            title="Rotate"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          </Button>
          <div className="h-4 w-px bg-border" />
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"/>
            </svg>
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </Button>
        </div>

        {/* Add/Remove Corner Buttons */}
        <div className="absolute bottom-8 left-8 flex gap-2 z-20">
          <Button 
            size="sm" 
            onClick={() => {
              setActiveTool(activeTool === 'add' ? null : 'add');
              setSnapPoint(null);
            }}
            variant="outline" 
            className={`h-9 w-9 p-0 bg-background/95 shadow-lg ${activeTool === 'add' ? 'bg-primary text-primary-foreground' : ''}`}
            title="Add Point - Click on pool perimeter"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={removePoint} 
            variant="outline"
            disabled={!selectedPoint || points.length <= 3}
            className="h-9 w-9 p-0 bg-background/95 shadow-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
