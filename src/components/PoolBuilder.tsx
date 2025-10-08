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

interface Point {
  x: number;
  y: number;
  id: string;
}

interface PoolFeature {
  type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home';
  x: number;
  y: number;
  id: string;
  angle?: number;
  steps?: number;
  wallSegment?: number;
  wallPosition?: number;
  width?: number;
  height?: number;
  treeType?: 'palm' | 'oak' | 'pine';
  radius?: number;
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

export function PoolBuilder({ onPoolDataChange }: PoolBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paverTextureRef = useRef<HTMLImageElement | null>(null);
  const linerTextureRef = useRef<HTMLImageElement | null>(null);
  const getShapePoints = (shape: 'rectangle' | 'kidney' | 'freeform'): Point[] => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    switch (shape) {
      case 'rectangle':
        return [
          { x: centerX - 100, y: centerY - 75, id: '1' },
          { x: centerX + 100, y: centerY - 75, id: '2' },
          { x: centerX + 100, y: centerY + 75, id: '3' },
          { x: centerX - 100, y: centerY + 75, id: '4' },
        ];
      case 'kidney':
        return [
          { x: centerX - 120, y: centerY - 60, id: '1' },
          { x: centerX - 40, y: centerY - 80, id: '2' },
          { x: centerX + 80, y: centerY - 70, id: '3' },
          { x: centerX + 120, y: centerY - 20, id: '4' },
          { x: centerX + 100, y: centerY + 40, id: '5' },
          { x: centerX + 40, y: centerY + 80, id: '6' },
          { x: centerX - 60, y: centerY + 70, id: '7' },
          { x: centerX - 120, y: centerY + 20, id: '8' },
        ];
      case 'freeform':
        return [
          { x: centerX - 110, y: centerY - 70, id: '1' },
          { x: centerX - 20, y: centerY - 90, id: '2' },
          { x: centerX + 90, y: centerY - 60, id: '3' },
          { x: centerX + 110, y: centerY + 10, id: '4' },
          { x: centerX + 70, y: centerY + 80, id: '5' },
          { x: centerX - 30, y: centerY + 85, id: '6' },
          { x: centerX - 110, y: centerY + 30, id: '7' },
        ];
    }
  };

  const [points, setPoints] = useState<Point[]>([]);
  const [hardscapePoints, setHardscapePoints] = useState<HardscapePoint[]>([]);
  const [features, setFeatures] = useState<PoolFeature[]>([]);
  const [selectedHardscapePoint, setSelectedHardscapePoint] = useState<string | null>(null);
  const [isDraggingHardscape, setIsDraggingHardscape] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(15); // pixels per foot - increased for better visibility
  const [canvasSize, setCanvasSize] = useState({ 
    width: window.innerWidth - 20, 
    height: window.innerHeight - 80 
  });
  const [showControls, setShowControls] = useState(true);
  const [editingDimension, setEditingDimension] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [pendingFeature, setPendingFeature] = useState<'jet' | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [draggingFeature, setDraggingFeature] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [selectedPaverId, setSelectedPaverId] = useState('appian-adobe');
  const [selectedCopingId, setSelectedCopingId] = useState('appian-adobe');
  const [selectedFinishId, setSelectedFinishId] = useState('aquamarine');
  const [paverSize] = useState(24); // Standard paver size in inches (2ft x 2ft)
  const [poolShape, setPoolShape] = useState<'rectangle' | 'kidney' | 'freeform'>('rectangle');
  const [lightHue, setLightHue] = useState(0); // For color-changing LED lights
  const [copingThickness, setCopingThickness] = useState(15); // 1 foot = 15 pixels at scale 15
  const [waterAnimationTime, setWaterAnimationTime] = useState(0);

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
    home: 0
  };

  // Initialize pool and hardscape centered
  useEffect(() => {
    if (points.length === 0) {
      setPoints(getShapePoints('rectangle'));
      
      // Initialize hardscape deck around pool
      const deckWidth = 100; // 100px deck around pool
      setHardscapePoints([
        { x: canvasSize.width / 2 - 200, y: canvasSize.height / 2 - 175, id: 'h1' },
        { x: canvasSize.width / 2 + 200, y: canvasSize.height / 2 - 175, id: 'h2' },
        { x: canvasSize.width / 2 + 200, y: canvasSize.height / 2 + 175, id: 'h3' },
        { x: canvasSize.width / 2 - 200, y: canvasSize.height / 2 + 175, id: 'h4' },
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

  // Load textures with high quality
  const copingTextureRef = useRef<HTMLImageElement | null>(null);
  
  useEffect(() => {
    const paverImg = new Image();
    const linerImg = new Image();
    const copingImg = new Image();
    
    const selectedPaver = paverTypes.find(p => p.id === selectedPaverId);
    const selectedCoping = paverTypes.find(p => p.id === selectedCopingId);
    const selectedFinish = finishes.find(f => f.id === selectedFinishId);
    
    const paverImage = selectedPaver?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
    const copingImage = selectedCoping?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png';
    const finishImage = selectedFinish?.image || aquamarineFinish;
    
    // Enable high quality image rendering
    paverImg.crossOrigin = "anonymous";
    linerImg.crossOrigin = "anonymous";
    copingImg.crossOrigin = "anonymous";
    
    paverImg.src = paverImage;
    linerImg.src = finishImage;
    copingImg.src = copingImage;
    
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 3) {
        paverTextureRef.current = paverImg;
        linerTextureRef.current = linerImg;
        copingTextureRef.current = copingImg;
        setTexturesLoaded(true);
      }
    };
    
    paverImg.onload = checkLoaded;
    linerImg.onload = checkLoaded;
    copingImg.onload = checkLoaded;
    paverImg.onerror = checkLoaded;
    linerImg.onerror = checkLoaded;
    copingImg.onerror = checkLoaded;
  }, [selectedPaverId, selectedCopingId, selectedFinishId]);

  // Animate LED lights color changing
  useEffect(() => {
    const interval = setInterval(() => {
      setLightHue((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Animate water movement - use ref to avoid triggering re-renders
  useEffect(() => {
    let animationTime = 0;
    let animationId: number;
    
    const animate = () => {
      animationTime += 0.02;
      setWaterAnimationTime(animationTime);
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Update canvas size to fill screen
  useEffect(() => {
    const updateCanvasSize = () => {
      const width = window.innerWidth - 20;
      const height = window.innerHeight - 80;
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
  const calculateHardscapeArea = () => {
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
  };

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

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw grass background
    ctx.fillStyle = '#4A7C3C';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Add grass texture variation
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * canvasSize.width;
      const y = Math.random() * canvasSize.height;
      const grassShade = Math.random() > 0.5 ? '#3D6B31' : '#568A44';
      ctx.fillStyle = grassShade;
      ctx.fillRect(x, y, 2, 2);
    }

    // Draw hardscape/paver deck with custom shape

    const paverSizeInFeet = paverSize / 12;
    const paverSizeInPixels = paverSizeInFeet * scale;

    // Draw hardscape deck area with custom shape
    if (paverTextureRef.current && hardscapePoints.length >= 3) {
      const img = paverTextureRef.current;
      
      // Create hardscape path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(hardscapePoints[0].x, hardscapePoints[0].y);
      for (let i = 1; i < hardscapePoints.length; i++) {
        ctx.lineTo(hardscapePoints[i].x, hardscapePoints[i].y);
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
          
          // Add subtle ambient occlusion
          const aoGradient = ctx.createRadialGradient(
            x + paverSizeInPixels / 2, y + paverSizeInPixels / 2, paverSizeInPixels * 0.3,
            x + paverSizeInPixels / 2, y + paverSizeInPixels / 2, paverSizeInPixels * 0.7
          );
          aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
          ctx.fillStyle = aoGradient;
          ctx.fillRect(x, y, paverSizeInPixels, paverSizeInPixels);
          
          // Grout lines
          ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
          ctx.lineWidth = 1.5;
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
      if (copingTextureRef.current) {
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
        const copingPattern = ctx.createPattern(copingTextureRef.current, 'repeat');
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
      
      if (linerTextureRef.current) {
        // Increase texture scale for better visibility
        const tileSizeInFeet = 0.15; // Larger tiles - ~1.8 inches
        const pixelsPerTile = tileSizeInFeet * scale;
        
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = pixelsPerTile;
        tileCanvas.height = pixelsPerTile;
        const tileCtx = tileCanvas.getContext('2d');
        
        if (tileCtx) {
          tileCtx.drawImage(
            linerTextureRef.current,
            0, 0, 
            linerTextureRef.current.width / 10,
            linerTextureRef.current.height / 10,
            0, 0,
            pixelsPerTile,
            pixelsPerTile
          );
          
          tileCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          tileCtx.lineWidth = 0.5;
          tileCtx.strokeRect(0, 0, pixelsPerTile, pixelsPerTile);
          
          const pattern = ctx.createPattern(tileCanvas, 'repeat');
          
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fill();
          }
        }
      } else {
        ctx.fillStyle = '#5BC5D9';
        ctx.fill();
      }
      
      // Animated water wave effects
      const time = waterAnimationTime;
      
      // Multiple wave layers for realistic water movement
      for (let layer = 0; layer < 3; layer++) {
        ctx.save();
        
        // Create gradient for wave highlights
        const waveGradient = ctx.createLinearGradient(
          0, 
          0, 
          canvasSize.width, 
          canvasSize.height
        );
        
        const wavePhase = time * (1 + layer * 0.3);
        const waveOpacity = 0.03 + Math.sin(wavePhase) * 0.02;
        
        waveGradient.addColorStop(0, `rgba(255, 255, 255, ${waveOpacity})`);
        waveGradient.addColorStop(0.5, `rgba(255, 255, 255, ${waveOpacity * 1.5})`);
        waveGradient.addColorStop(1, `rgba(255, 255, 255, ${waveOpacity})`);
        
        ctx.fillStyle = waveGradient;
        ctx.fill();
        
        ctx.restore();
      }
      
      // Caustic light patterns (underwater light refraction)
      for (let i = 0; i < 8; i++) {
        const causticPhase = time * 0.5 + i * Math.PI / 4;
        const causticX = canvasSize.width / 2 + Math.sin(causticPhase) * 100;
        const causticY = canvasSize.height / 2 + Math.cos(causticPhase * 1.3) * 80;
        
        const causticGradient = ctx.createRadialGradient(
          causticX, causticY, 0,
          causticX, causticY, 40
        );
        
        const causticOpacity = (Math.sin(causticPhase * 2) + 1) * 0.02;
        causticGradient.addColorStop(0, `rgba(200, 240, 255, ${causticOpacity})`);
        causticGradient.addColorStop(0.5, `rgba(180, 230, 255, ${causticOpacity * 0.5})`);
        causticGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = causticGradient;
        ctx.beginPath();
        ctx.arc(causticX, causticY, 40, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Shimmering wave highlights moving across surface
      const shimmerCount = 5;
      for (let i = 0; i < shimmerCount; i++) {
        const shimmerPhase = time * 0.8 + i * (Math.PI * 2 / shimmerCount);
        const shimmerProgress = (Math.sin(shimmerPhase) + 1) / 2;
        const shimmerX = shimmerProgress * canvasSize.width;
        
        const shimmerGradient = ctx.createRadialGradient(
          shimmerX, canvasSize.height / 2, 0,
          shimmerX, canvasSize.height / 2, 60
        );
        
        const shimmerOpacity = Math.sin(shimmerPhase) * 0.08;
        shimmerGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.max(0, shimmerOpacity)})`);
        shimmerGradient.addColorStop(0.7, `rgba(255, 255, 255, ${Math.max(0, shimmerOpacity * 0.3)})`);
        shimmerGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = shimmerGradient;
        ctx.fill();
      }
      
      // Ripple effects for surface movement
      const rippleCount = 3;
      for (let i = 0; i < rippleCount; i++) {
        const ripplePhase = time * 1.2 + i * (Math.PI * 2 / rippleCount);
        const rippleRadius = 30 + Math.sin(ripplePhase) * 15;
        const rippleOpacity = (Math.cos(ripplePhase) + 1) * 0.015;
        
        const rippleX = canvasSize.width * (0.3 + i * 0.2);
        const rippleY = canvasSize.height * (0.4 + Math.sin(ripplePhase * 0.5) * 0.2);
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${rippleOpacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rippleX, rippleY, rippleRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      ctx.restore();
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
        // House roof top-down view
        const width = feature.width || 200;
        const height = feature.height || 150;
        const isSelected = selectedFeature === feature.id;
        
        // Roof structure (top-down)
        const roofGradient = ctx.createLinearGradient(
          feature.x - width / 2, feature.y - height / 2,
          feature.x + width / 2, feature.y + height / 2
        );
        roofGradient.addColorStop(0, '#8B6F47');
        roofGradient.addColorStop(0.5, '#A0826D');
        roofGradient.addColorStop(1, '#6B5435');
        
        ctx.fillStyle = roofGradient;
        ctx.fillRect(feature.x - width / 2, feature.y - height / 2, width, height);
        
        // Roof tiles/shingles pattern
        ctx.strokeStyle = 'rgba(60, 40, 20, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 15; i++) {
          const yPos = feature.y - height / 2 + (i * height / 15);
          ctx.beginPath();
          ctx.moveTo(feature.x - width / 2, yPos);
          ctx.lineTo(feature.x + width / 2, yPos);
          ctx.stroke();
        }
        
        // Ridge line
        ctx.strokeStyle = '#6B5435';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(feature.x - width / 2, feature.y);
        ctx.lineTo(feature.x + width / 2, feature.y);
        ctx.stroke();
        
        // Border
        ctx.strokeStyle = isSelected ? '#FFD700' : '#5D4E37';
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
        // LED color-changing light with advanced physics AND directional cone
        const hue = lightHue;
        const lightColor = `hsl(${hue}, 100%, 60%)`;
        const lightColorBright = `hsl(${hue}, 100%, 80%)`;
        const lightColorDim = `hsl(${hue}, 80%, 40%)`;
        
        // Calculate angle pointing toward pool center
        const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        const angleToCenter = Math.atan2(centerY - feature.y, centerX - feature.x);
        const lightAngle = feature.angle || angleToCenter;
        
        // Draw directional light cone pointing inward
        ctx.save();
        ctx.translate(feature.x, feature.y);
        ctx.rotate(lightAngle);
        
        // Light cone with gradient
        const coneGradient = ctx.createLinearGradient(0, 0, 60, 0);
        coneGradient.addColorStop(0, lightColorBright.replace(')', ', 0.4)').replace('hsl', 'hsla'));
        coneGradient.addColorStop(0.5, lightColor.replace(')', ', 0.2)').replace('hsl', 'hsla'));
        coneGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = coneGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(60, -25);
        ctx.lineTo(60, 25);
        ctx.closePath();
        ctx.fill();
        
        // Cone edges
        ctx.strokeStyle = lightColor.replace(')', ', 0.3)').replace('hsl', 'hsla');
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
        
        // Multiple glow layers for realistic light diffusion
        const glowLayers = [
          { radius: 60, opacity: 0.15 },
          { radius: 40, opacity: 0.25 },
          { radius: 25, opacity: 0.4 },
          { radius: 15, opacity: 0.6 }
        ];
        
        glowLayers.forEach(layer => {
          const gradient = ctx.createRadialGradient(feature.x, feature.y, 0, feature.x, feature.y, layer.radius);
          gradient.addColorStop(0, lightColorBright.replace(')', `, ${layer.opacity})`).replace('hsl', 'hsla'));
          gradient.addColorStop(0.5, lightColor.replace(')', `, ${layer.opacity * 0.5})`).replace('hsl', 'hsla'));
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, layer.radius, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Caustic light ripples on water surface
        const time = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
          const ripplePhase = (time * 2 + i * Math.PI / 1.5) % (Math.PI * 2);
          const rippleRadius = 20 + Math.sin(ripplePhase) * 8;
          const rippleOpacity = (Math.sin(ripplePhase) + 1) * 0.15;
          
          ctx.strokeStyle = lightColor.replace(')', `, ${rippleOpacity})`).replace('hsl', 'hsla');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(feature.x, feature.y, rippleRadius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        // LED housing with metallic rim
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // LED core
        const coreGradient = ctx.createRadialGradient(feature.x, feature.y, 0, feature.x, feature.y, 7);
        coreGradient.addColorStop(0, lightColorBright);
        coreGradient.addColorStop(0.7, lightColor);
        coreGradient.addColorStop(1, lightColorDim);
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(feature.x, feature.y, 7, 0, 2 * Math.PI);
        ctx.fill();
        
        // Metallic rim highlight
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
        
        // Animated water spray
        const time = waterAnimationTime;
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + time;
          const height = 15 + Math.sin(time * 3 + i) * 5;
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
        ctx.lineTo(feature.x, feature.y - 20 - Math.sin(time * 2) * 8);
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

  }, [points, features, selectedPoint, hoveredPoint, canvasSize, scale, pendingFeature, cursorPos, selectedFeature, texturesLoaded, paverSize, copingThickness, lightHue, selectedPaverId, selectedCopingId, selectedFinishId, poolShape, waterAnimationTime]);

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on hardscape point
    const clickedHardscapePoint = hardscapePoints.find(p => 
      Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
    );

    if (clickedHardscapePoint) {
      setSelectedHardscapePoint(clickedHardscapePoint.id);
      setSelectedPoint(null);
      setSelectedFeature(null);
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
    } else {
      setSelectedPoint(null);
      setSelectedFeature(null);
      setSelectedHardscapePoint(null);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pendingFeature) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    // Update cursor position for pending features
    setCursorPos({ x, y });

    if (isDraggingHardscape && selectedHardscapePoint) {
      const boundedX = Math.max(0, Math.min(canvasSize.width, x));
      const boundedY = Math.max(0, Math.min(canvasSize.height, y));

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
    setDraggingFeature(false);
    setIsDraggingHardscape(false);
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

  const addFeature = (type: 'stairs' | 'light' | 'jet' | 'tree' | 'fountain' | 'grass' | 'home') => {
    if (type === 'jet') {
      setPendingFeature('jet');
      return;
    }

    let newFeature: PoolFeature;
    
    if (type === 'tree' || type === 'fountain' || type === 'grass' || type === 'home') {
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
        <Button size="sm" variant="outline" onClick={() => setShowControls(!showControls)}>
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </Button>
        
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
          <Tabs defaultValue="pool" className="w-full">
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
              <TabsTrigger value="landscape" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Landscape
              </TabsTrigger>
            </TabsList>

            {/* Pool Design Tab */}
            <TabsContent value="pool" className="mt-0 p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Pool Shape</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={poolShape === 'rectangle' ? 'default' : 'outline'}
                      onClick={() => {
                        setPoolShape('rectangle');
                        setPoints(getShapePoints('rectangle'));
                        setFeatures([]);
                      }}
                      className="flex-1"
                    >
                      Rectangle
                    </Button>
                    <Button
                      size="sm"
                      variant={poolShape === 'kidney' ? 'default' : 'outline'}
                      onClick={() => {
                        setPoolShape('kidney');
                        setPoints(getShapePoints('kidney'));
                        setFeatures([]);
                      }}
                      className="flex-1"
                    >
                      Kidney
                    </Button>
                    <Button
                      size="sm"
                      variant={poolShape === 'freeform' ? 'default' : 'outline'}
                      onClick={() => {
                        setPoolShape('freeform');
                        setPoints(getShapePoints('freeform'));
                        setFeatures([]);
                      }}
                      className="flex-1"
                    >
                      Freeform
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Pool Corners</Label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addPoint} className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Corner
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={removePoint} 
                      variant="outline"
                      disabled={!selectedPoint || points.length <= 3}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
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
            <TabsContent value="features" className="mt-0 p-3 space-y-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button size="sm" onClick={() => addFeature('stairs')} variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Move className="h-5 w-5" />
                    <span className="text-xs">Stairs</span>
                  </Button>
                  <Button size="sm" onClick={() => addFeature('light')} variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Lightbulb className="h-5 w-5" />
                    <span className="text-xs">LED Light</span>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => addFeature('jet')} 
                    variant="outline"
                    disabled={pendingFeature === 'jet'}
                    className="h-auto py-3 flex-col gap-1"
                  >
                    <Waves className="h-5 w-5" />
                    <span className="text-xs">Water Jet</span>
                  </Button>
                  <Button size="sm" onClick={() => addFeature('fountain')} variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Droplets className="h-5 w-5" />
                    <span className="text-xs">Fountain</span>
                  </Button>
                </div>

                {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'stairs' && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <Label className="text-xs font-medium">Stairs Configuration</Label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addStairStep} variant="outline" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                      <Button size="sm" onClick={removeStairStep} variant="outline" className="flex-1">
                        <Minus className="h-4 w-4 mr-1" />
                        Remove Step
                      </Button>
                    </div>
                  </div>
                )}

                {selectedFeature && (
                  <Button size="sm" onClick={removeFeature} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected Feature
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Landscape Tab */}
            <TabsContent value="landscape" className="mt-0 p-3 space-y-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button size="sm" onClick={() => addFeature('tree')} variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Trees className="h-5 w-5" />
                    <span className="text-xs">Tree</span>
                  </Button>
                  <Button size="sm" onClick={() => addFeature('grass')} variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Flower2 className="h-5 w-5" />
                    <span className="text-xs">Grass Area</span>
                  </Button>
                  <Button size="sm" onClick={() => addFeature('home')} variant="outline" className="h-auto py-3 flex-col gap-1">
                    <Home className="h-5 w-5" />
                    <span className="text-xs">House</span>
                  </Button>
                </div>

                {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'tree' && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <Label className="text-xs font-medium">Tree Type</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setFeatures(prev => prev.map(f => 
                            f.id === selectedFeature ? { ...f, treeType: 'oak' } : f
                          ));
                        }} 
                        variant="outline"
                      >
                        Oak
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setFeatures(prev => prev.map(f => 
                            f.id === selectedFeature ? { ...f, treeType: 'palm' } : f
                          ));
                        }} 
                        variant="outline"
                      >
                        Palm
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setFeatures(prev => prev.map(f => 
                            f.id === selectedFeature ? { ...f, treeType: 'pine' } : f
                          ));
                        }} 
                        variant="outline"
                      >
                        Pine
                      </Button>
                    </div>
                  </div>
                )}

                {selectedFeature && (
                  <Button size="sm" onClick={removeFeature} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected Feature
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Canvas - Almost Full Screen */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-border rounded-lg shadow-2xl touch-none bg-gradient-to-br from-amber-50 to-stone-100"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>
    </div>
  );
}
