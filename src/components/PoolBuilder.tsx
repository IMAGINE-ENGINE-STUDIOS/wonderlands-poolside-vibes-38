import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, Move, Lightbulb, Waves, Ruler } from 'lucide-react';
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import { paverTypes } from '@/data/paverData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  angle?: number; // For jets pointing inward
  steps?: number; // For stairs step count
  wallSegment?: number; // Which wall segment it's attached to
  wallPosition?: number; // Position along the wall (0-1)
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
  const paverTextureRef = useRef<HTMLImageElement | null>(null);
  const linerTextureRef = useRef<HTMLImageElement | null>(null);
  const getShapePoints = (shape: 'rectangle' | 'kidney' | 'freeform'): Point[] => {
    const centerX = 350;
    const centerY = 250;
    
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

  const [points, setPoints] = useState<Point[]>(getShapePoints('rectangle'));
  const [features, setFeatures] = useState<PoolFeature[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(15); // pixels per foot - increased for better visibility
  const [canvasSize, setCanvasSize] = useState({ width: 700, height: 500 });
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

  // Update canvas size based on container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 32, 900);
        const height = Math.min(width * 0.71, 600);
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

    // Calculate paver size in pixels (24 inches = 2 feet)
    const paverSizeInFeet = paverSize / 12;
    const paverSizeInPixels = paverSizeInFeet * scale;

    // Draw paver texture as background at scale
    if (paverTextureRef.current) {
      const img = paverTextureRef.current;
      
      // Calculate how many pavers fit
      const numPaversX = Math.ceil(canvasSize.width / paverSizeInPixels) + 1;
      const numPaversY = Math.ceil(canvasSize.height / paverSizeInPixels) + 1;
      
      // Draw pavers as perfect squares with enhanced quality
      for (let i = 0; i < numPaversX; i++) {
        for (let j = 0; j < numPaversY; j++) {
          const x = i * paverSizeInPixels;
          const y = j * paverSizeInPixels;
          
          // Draw high-quality paver image
          ctx.save();
          ctx.drawImage(
            img,
            x,
            y,
            paverSizeInPixels,
            paverSizeInPixels
          );
          
          // Add subtle ambient occlusion in corners for depth
          const aoGradient = ctx.createRadialGradient(
            x + paverSizeInPixels / 2,
            y + paverSizeInPixels / 2,
            paverSizeInPixels * 0.3,
            x + paverSizeInPixels / 2,
            y + paverSizeInPixels / 2,
            paverSizeInPixels * 0.7
          );
          aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
          aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
          ctx.fillStyle = aoGradient;
          ctx.fillRect(x, y, paverSizeInPixels, paverSizeInPixels);
          
          // Draw grout lines with depth
          ctx.strokeStyle = 'rgba(100, 80, 60, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, paverSizeInPixels, paverSizeInPixels);
          
          ctx.restore();
        }
      }
      
      // Add directional lighting shader effect
      const lightAngle = Math.PI / 4; // 45 degrees
      const lightGradient = ctx.createLinearGradient(
        0, 0,
        Math.cos(lightAngle) * canvasSize.width,
        Math.sin(lightAngle) * canvasSize.height
      );
      lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      lightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
      ctx.fillStyle = lightGradient;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    } else {
      // Fallback solid color
      ctx.fillStyle = '#D4C4A8';
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
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
        
        // Draw individual coping bricks around perimeter
        const brickWidth = 12; // Width of each coping brick
        let totalPerimeter = 0;
        
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
          totalPerimeter += segmentLength;
        }
        
        // Draw bricks along each edge
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const segmentLength = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const numBricks = Math.ceil(segmentLength / brickWidth);
          
          for (let j = 0; j < numBricks; j++) {
            const t = j / numBricks;
            const x = p1.x + dx * t;
            const y = p1.y + dy * t;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            
            // Draw coping brick texture
            ctx.drawImage(
              copingTextureRef.current,
              -brickWidth / 2,
              -copingThickness,
              brickWidth,
              copingThickness * 2
            );
            
            // Add grout line
            ctx.strokeStyle = 'rgba(100, 80, 60, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-brickWidth / 2, -copingThickness, brickWidth, copingThickness * 2);
            
            ctx.restore();
          }
        }
        
        ctx.restore();
      } else {
        // Fallback solid coping
        ctx.lineWidth = copingThickness * 2;
        ctx.strokeStyle = '#8B7355';
        ctx.stroke();
      }

      // Fill pool with premium liner texture
      ctx.save();
      ctx.clip();
      
      if (linerTextureRef.current) {
        const pattern = ctx.createPattern(linerTextureRef.current, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fill();
        }
      } else {
        // Fallback to solid aquamarine color
        ctx.fillStyle = '#5BC5D9';
        ctx.fill();
      }
      
      // Subtle water shimmer overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      
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

    // Draw features with better styling
    features.forEach((feature) => {
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
        // LED color-changing light with advanced physics
        const hue = lightHue;
        const lightColor = `hsl(${hue}, 100%, 60%)`;
        const lightColorBright = `hsl(${hue}, 100%, 80%)`;
        const lightColorDim = `hsl(${hue}, 80%, 40%)`;
        
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
        const nearWall = findNearestWallPoint(feature.x, feature.y);
        const distToWall = Math.sqrt((feature.x - nearWall.x) ** 2 + (feature.y - nearWall.y) ** 2);
        
        // If near wall, show directional cone
        if (distToWall < 30) {
          const angle = feature.angle || (nearWall.angle + Math.PI / 2);
          
          // Draw jet cone pointing inward
          ctx.save();
          ctx.translate(feature.x, feature.y);
          ctx.rotate(angle);
          
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
        }
        
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
      }
      ctx.restore();
    });

    // Draw pending jet following cursor
    if (pendingFeature === 'jet') {
      ctx.save();
      const nearWall = findNearestWallPoint(cursorPos.x, cursorPos.y);
      const distToWall = Math.sqrt((cursorPos.x - nearWall.x) ** 2 + (cursorPos.y - nearWall.y) ** 2);
      
      if (distToWall < 30) {
        const angle = nearWall.angle + Math.PI / 2;
        
        ctx.translate(cursorPos.x, cursorPos.y);
        ctx.rotate(angle);
        
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
      }
      
      ctx.fillStyle = 'rgba(91, 165, 198, 0.7)';
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Notify parent of changes
    if (onPoolDataChange) {
      onPoolDataChange({
        points,
        features,
        perimeter: parseFloat(calculatePerimeter()),
        area: parseFloat(calculateArea())
      });
    }
  }, [points, features, selectedPoint, hoveredPoint, canvasSize, scale, pendingFeature, cursorPos, selectedFeature, texturesLoaded, paverSize]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If placing jet, place it
    if (pendingFeature === 'jet') {
      const nearWall = findNearestWallPoint(x, y);
      const distToWall = Math.sqrt((x - nearWall.x) ** 2 + (y - nearWall.y) ** 2);
      
      const newJet: PoolFeature = {
        type: 'jet',
        x,
        y,
        id: Date.now().toString(),
        angle: distToWall < 30 ? nearWall.angle + Math.PI / 2 : undefined
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
    } else {
      setSelectedPoint(null);
      setSelectedFeature(null);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (pendingFeature) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

    if (draggingFeature && selectedFeature) {
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
      } else {
        // Jets can be placed anywhere
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
    if (type === 'jet') {
      setPendingFeature('jet');
      return;
    }

    // Find a point on the wall
    const wallPoint = findNearestWallPoint(canvasSize.width / 2, canvasSize.height / 2);
    
    const newFeature: PoolFeature = {
      type,
      x: wallPoint.x,
      y: wallPoint.y,
      id: Date.now().toString(),
      steps: type === 'stairs' ? 3 : undefined,
      angle: wallPoint.angle + Math.PI / 2,
      wallSegment: wallPoint.segment,
      wallPosition: wallPoint.position
    };
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


        {/* Pool Shape Selector */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <Label className="text-sm font-semibold mb-3 block">Pool Shape</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={poolShape === 'rectangle' ? 'default' : 'outline'}
              onClick={() => {
                setPoolShape('rectangle');
                setPoints(getShapePoints('rectangle'));
                setFeatures([]);
              }}
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
            >
              Freeform
            </Button>
          </div>
        </div>

        {/* Coping Border Controls */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <Label className="text-sm font-semibold mb-3 block">Coping Border</Label>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 w-full sm:w-auto">
                <Select value={selectedCopingId} onValueChange={setSelectedCopingId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select coping type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-background">
                    {paverTypes.filter(p => p.category === 'paver').map((paver) => (
                      <SelectItem key={paver.id} value={paver.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border border-border bg-cover bg-center"
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
            <div className="flex items-center gap-4">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Thickness: {(copingThickness / scale).toFixed(1)} ft
              </Label>
              <Input
                type="range"
                min={scale * 0.5}
                max={scale * 2}
                step={1}
                value={copingThickness}
                onChange={(e) => setCopingThickness(Number(e.target.value))}
                className="flex-1"
              />
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max="2"
                value={(copingThickness / scale).toFixed(1)}
                onChange={(e) => setCopingThickness(Number(e.target.value) * scale)}
                className="w-20 h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Pool Finish Selector */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <Label className="text-sm font-semibold mb-3 block">Pool Finish</Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <Select value={selectedFinishId} onValueChange={setSelectedFinishId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-background">
                  {finishes.map((finish) => (
                    <SelectItem key={finish.id} value={finish.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-border bg-cover bg-center"
                          style={{ backgroundImage: `url(${finish.image})` }}
                        />
                        <span>{finish.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Deck Paver Selector */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <Label className="text-sm font-semibold mb-3 block">Deck Paver Selection</Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full sm:w-auto">
              <Select value={selectedPaverId} onValueChange={setSelectedPaverId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select paver type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-background">
                  {paverTypes.filter(p => p.category === 'paver').map((paver) => (
                    <SelectItem key={paver.id} value={paver.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-border bg-cover bg-center"
                          style={{ backgroundImage: `url(${paver.image})` }}
                        />
                        <span>{paver.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {paverSize}" x {paverSize}" pavers
              </Badge>
              <Badge variant="secondary" className="text-xs">
                ${paverTypes.find(p => p.id === selectedPaverId)?.basePrice || 15}/sq ft
              </Badge>
            </div>
          </div>
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
          <Button 
            size="sm" 
            onClick={() => addFeature('jet')} 
            variant="outline" 
            className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
            disabled={pendingFeature === 'jet'}
          >
            <Waves className="h-4 w-4 mr-1" />
            {pendingFeature === 'jet' ? 'Click to Place Jet' : 'Add Jet'}
          </Button>
          {selectedFeature && features.find(f => f.id === selectedFeature)?.type === 'stairs' && (
            <>
              <div className="h-4 w-px bg-border mx-1" />
              <Button size="sm" onClick={addStairStep} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
              <Button size="sm" onClick={removeStairStep} variant="outline">
                <Minus className="h-4 w-4 mr-1" />
                Remove Step
              </Button>
            </>
          )}
          {selectedFeature && (
            <Button size="sm" onClick={removeFeature} variant="destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Remove Feature
            </Button>
          )}
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
                <Lightbulb className="h-3 w-3" />
                Lights and stairs snap to walls • Jets follow cursor
              </p>
              <p className="flex items-center gap-2">
                <Move className="h-3 w-3" />
                Select stairs to add/remove individual steps
              </p>
            </div>
          </div>
          <div className="mt-3 p-2 bg-card rounded border">
            <p className="text-xs font-semibold text-primary">Premium Pool Liner Included</p>
            <p className="text-xs text-muted-foreground">Aquamarine Mosaic Pattern</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
