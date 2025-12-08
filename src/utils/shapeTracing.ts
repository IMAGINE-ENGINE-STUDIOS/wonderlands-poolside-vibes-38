import { loadImage, removeBackground } from './backgroundRemoval';
import { 
  validateAndRepairPolygon, 
  removeDuplicatePoints, 
  calculateBoundingBox,
  ensureCounterClockwise,
  simplifyPolygon
} from './shapeValidation';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface TracedShape {
  poolPoints: Point[];
  stairsRegions: { points: Point[]; width: number; position: number }[];
  seatingRegions: { points: Point[]; startPosition: number; endPosition: number }[];
  spilloverRegions: { points: Point[]; width: number; position: number }[];
}

// Extract contour points from a binary mask using improved edge detection
function extractContourPoints(
  imageData: ImageData,
  threshold: number = 128
): { x: number; y: number }[] {
  const { width, height, data } = imageData;
  const points: { x: number; y: number }[] = [];
  
  // Use Sobel edge detection for better contour extraction
  const edges = sobelEdgeDetection(imageData, threshold);
  
  // Find edge pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (edges[idx] > threshold * 0.5) {
        points.push({ x, y });
      }
    }
  }
  
  return points;
}

// Sobel edge detection for better contour extraction
function sobelEdgeDetection(imageData: ImageData, threshold: number): Float32Array {
  const { width, height, data } = imageData;
  const edges = new Float32Array(width * height);
  
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const alpha = data[idx + 3];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          
          gx += alpha * sobelX[kernelIdx];
          gy += alpha * sobelY[kernelIdx];
        }
      }
      
      edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  
  return edges;
}

// Order points to form a continuous contour using improved nearest neighbor
function orderContourPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length === 0) return [];
  if (points.length < 10) return points;
  
  const ordered: { x: number; y: number }[] = [];
  const remaining = new Set(points.map((_, i) => i));
  
  // Start with leftmost point
  let currentIdx = 0;
  let minX = Infinity;
  points.forEach((p, i) => {
    if (p.x < minX) {
      minX = p.x;
      currentIdx = i;
    }
  });
  
  ordered.push(points[currentIdx]);
  remaining.delete(currentIdx);
  
  // Maximum distance for connecting points (adaptive based on image size)
  const bbox = calculateBoundingBox(points);
  const maxDist = Math.max(bbox.width, bbox.height) * 0.05;
  
  while (remaining.size > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = -1;
    let nearestDist = Infinity;
    
    for (const idx of remaining) {
      const dist = Math.hypot(points[idx].x - last.x, points[idx].y - last.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    }
    
    // If nearest point is too far, we've completed the contour
    if (nearestDist > maxDist || nearestIdx === -1) break;
    
    ordered.push(points[nearestIdx]);
    remaining.delete(nearestIdx);
  }
  
  return ordered;
}

// Improved Douglas-Peucker simplification with minimum segment length
function simplifyContour(
  points: { x: number; y: number }[],
  epsilon: number = 5,
  minSegmentLength: number = 3
): { x: number; y: number }[] {
  if (points.length <= 2) return points;
  
  // First apply Douglas-Peucker
  const simplified = douglasPeucker(points, epsilon);
  
  // Then filter out very short segments
  const result: { x: number; y: number }[] = [simplified[0]];
  
  for (let i = 1; i < simplified.length; i++) {
    const dist = Math.hypot(
      simplified[i].x - result[result.length - 1].x,
      simplified[i].y - result[result.length - 1].y
    );
    
    if (dist >= minSegmentLength || i === simplified.length - 1) {
      result.push(simplified[i]);
    }
  }
  
  return result;
}

function douglasPeucker(
  points: { x: number; y: number }[],
  epsilon: number
): { x: number; y: number }[] {
  if (points.length <= 2) return points;
  
  let maxDist = 0;
  let maxIdx = 0;
  
  const first = points[0];
  const last = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }
  
  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  
  return [first, last];
}

function perpendicularDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const len = Math.hypot(dx, dy);
  
  if (len === 0) return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  
  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (len * len);
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  
  return Math.hypot(point.x - projX, point.y - projY);
}

// Detect rectangular regions that might be stairs
function detectStairsRegions(
  points: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number
): { points: Point[]; width: number; position: number }[] {
  const stairs: { points: Point[]; width: number; position: number }[] = [];
  
  if (points.length < 8) return stairs;
  
  // Look for rectangular protrusions with right angles
  for (let i = 0; i < points.length - 5; i++) {
    const segment = points.slice(i, i + 6);
    
    // Check for step pattern (right angles)
    const angles = [];
    for (let j = 1; j < segment.length - 1; j++) {
      const angle = calculateAngle(segment[j - 1], segment[j], segment[j + 1]);
      angles.push(angle);
    }
    
    // Stairs have 2+ consecutive right angles (85-95 degrees)
    const rightAngleCount = angles.filter(a => a > 75 && a < 105).length;
    
    if (rightAngleCount >= 2) {
      const width = Math.hypot(segment[1].x - segment[2].x, segment[1].y - segment[2].y);
      
      if (width > 15 && width < imageWidth * 0.3) {
        const position = i / points.length;
        stairs.push({
          points: segment.map((p, idx) => ({
            x: p.x,
            y: p.y,
            id: `stair-${i}-${idx}`
          })),
          width: width / imageWidth,
          position
        });
        i += 5; // Skip processed points
      }
    }
  }
  
  return stairs;
}

// Detect curved indentations that might be seating/tanning ledges
function detectSeatingRegions(
  points: { x: number; y: number }[],
  imageWidth: number
): { points: Point[]; startPosition: number; endPosition: number }[] {
  const seating: { points: Point[]; startPosition: number; endPosition: number }[] = [];
  
  if (points.length < 20) return seating;
  
  const windowSize = Math.min(15, Math.floor(points.length / 10));
  
  for (let i = windowSize; i < points.length - windowSize; i++) {
    const prev = points[i - windowSize];
    const curr = points[i];
    const next = points[i + windowSize];
    
    // Calculate curvature
    const curvature = calculateCurvature(prev, curr, next);
    
    // Significant inward curve suggests seating (negative curvature = inward)
    if (curvature < -0.02 && curvature > -0.15) {
      const startPos = (i - windowSize) / points.length;
      const endPos = (i + windowSize) / points.length;
      
      // Check we don't already have nearby seating
      const exists = seating.some(s => 
        Math.abs(s.startPosition - startPos) < 0.1 || 
        Math.abs(s.endPosition - endPos) < 0.1
      );
      
      if (!exists) {
        const segmentPoints = points.slice(i - windowSize, i + windowSize + 1);
        seating.push({
          points: segmentPoints.map((p, idx) => ({
            x: p.x,
            y: p.y,
            id: `seating-${i}-${idx}`
          })),
          startPosition: startPos,
          endPosition: endPos
        });
      }
    }
  }
  
  return seating;
}

// Detect spillover/spa attachment regions
function detectSpilloverRegions(
  points: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number
): { points: Point[]; width: number; position: number }[] {
  const spillovers: { points: Point[]; width: number; position: number }[] = [];
  
  if (points.length < 10) return spillovers;
  
  // Find narrow protrusions (spillover channels)
  const bbox = calculateBoundingBox(points);
  const avgWidth = bbox.width;
  
  // Group consecutive points by their deviation from main shape
  let currentProtrusion: { x: number; y: number }[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    
    // Check if point is part of a narrow protrusion
    const prev = points[(i - 5 + points.length) % points.length];
    const next = points[(i + 5) % points.length];
    
    const localWidth = Math.hypot(prev.x - next.x, prev.y - next.y);
    
    if (localWidth < avgWidth * 0.25) {
      currentProtrusion.push(p);
    } else if (currentProtrusion.length > 5) {
      // Found a spillover
      const protrusionBbox = calculateBoundingBox(currentProtrusion);
      spillovers.push({
        points: currentProtrusion.map((pt, idx) => ({
          x: pt.x,
          y: pt.y,
          id: `spillover-${spillovers.length}-${idx}`
        })),
        width: Math.max(protrusionBbox.width, protrusionBbox.height) / imageWidth,
        position: i / points.length
      });
      currentProtrusion = [];
    } else {
      currentProtrusion = [];
    }
  }
  
  return spillovers;
}

function calculateAngle(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const dot = v1.x * v2.x + v1.y * v2.y;
  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);
  
  if (len1 === 0 || len2 === 0) return 180;
  
  const cosAngle = Math.max(-1, Math.min(1, dot / (len1 * len2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

function calculateCurvature(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const cross = v1.x * v2.y - v1.y * v2.x;
  const len = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  
  return len > 0 ? cross / len : 0;
}

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

// Main function to trace pool shape from image with ML background removal
export async function tracePoolShapeFromImage(
  file: File,
  targetScale: number = 1
): Promise<TracedShape> {
  console.log('🔍 Starting pool shape tracing with ML...');
  
  try {
    // Load and remove background
    const img = await loadImage(file);
    const maskedBlob = await removeBackground(img);
    const maskedImg = await loadImage(maskedBlob);
    
    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    canvas.width = maskedImg.naturalWidth;
    canvas.height = maskedImg.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(maskedImg, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    return processImageData(imageData, targetScale);
  } catch (error) {
    console.error('❌ ML tracing failed, falling back to quick trace:', error);
    return quickTracePoolShape(file, targetScale);
  }
}

// Process image data to extract pool shape
function processImageData(imageData: ImageData, targetScale: number): TracedShape {
  const { width, height } = imageData;
  
  console.log('📐 Extracting contour points...');
  const rawPoints = extractContourPoints(imageData);
  console.log(`Found ${rawPoints.length} raw edge points`);
  
  if (rawPoints.length < 10) {
    console.warn('⚠️ Not enough points detected, using fallback');
    return createFallbackShape(targetScale);
  }
  
  const orderedPoints = orderContourPoints(rawPoints);
  console.log(`Ordered ${orderedPoints.length} contour points`);
  
  // Adaptive epsilon based on image size
  const maxDim = Math.max(width, height);
  const epsilon = maxDim * 0.012; // Finer simplification
  const minSegment = maxDim * 0.005;
  
  const simplifiedPoints = simplifyContour(orderedPoints, epsilon, minSegment);
  console.log(`Simplified to ${simplifiedPoints.length} points`);
  
  // Validate and repair the polygon
  const validatedPoints = validateAndRepairPolygon(
    simplifiedPoints.map(p => ({ x: p.x, y: p.y })),
    {
      maxVertices: 120,
      simplifyEpsilon: epsilon * 0.5,
      fallbackToConvexHull: true
    }
  );
  
  console.log(`Validated to ${validatedPoints.length} points`);
  
  // Detect features
  const stairsRegions = detectStairsRegions(validatedPoints as any, width, height);
  const seatingRegions = detectSeatingRegions(validatedPoints as any, width);
  const spilloverRegions = detectSpilloverRegions(validatedPoints as any, width, height);
  
  console.log(`Detected: ${stairsRegions.length} stairs, ${seatingRegions.length} seating, ${spilloverRegions.length} spillovers`);
  
  // Normalize points to center and scale
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDimNorm = Math.max(width, height);
  
  const poolPoints: Point[] = validatedPoints.map((p, i) => ({
    x: ((p.x - centerX) / maxDimNorm) * targetScale * 100,
    y: ((p.y - centerY) / maxDimNorm) * targetScale * 100,
    id: `${i + 1}`
  }));
  
  return {
    poolPoints,
    stairsRegions,
    seatingRegions,
    spilloverRegions
  };
}

// Create fallback rectangular shape
function createFallbackShape(targetScale: number): TracedShape {
  const size = targetScale * 50;
  return {
    poolPoints: [
      { x: -size * 0.4, y: -size * 0.8, id: '1' },
      { x: size * 0.4, y: -size * 0.8, id: '2' },
      { x: size * 0.4, y: size * 0.8, id: '3' },
      { x: -size * 0.4, y: size * 0.8, id: '4' }
    ],
    stairsRegions: [],
    seatingRegions: [],
    spilloverRegions: []
  };
}

// Quick trace without ML - uses color-based extraction
export async function quickTracePoolShape(
  file: File,
  targetScale: number = 1
): Promise<TracedShape> {
  console.log('🔍 Starting quick pool shape tracing (no ML)...');
  
  const img = await loadImage(file);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  // Find the dominant pool color (blue tones)
  const colorCounts: Map<string, number> = new Map();
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue; // Skip transparent
    if (r > 240 && g > 240 && b > 240) continue; // Skip white
    if (r < 20 && g < 20 && b < 20) continue; // Skip black
    
    // Quantize colors for grouping
    const qr = Math.floor(r / 24) * 24;
    const qg = Math.floor(g / 24) * 24;
    const qb = Math.floor(b / 24) * 24;
    const key = `${qr},${qg},${qb}`;
    
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }
  
  // Find most common color (likely the pool)
  let maxCount = 0;
  let dominantColor = '64,128,192';
  
  for (const [color, count] of colorCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }
  
  const [dr, dg, db] = dominantColor.split(',').map(Number);
  console.log(`Dominant color: RGB(${dr}, ${dg}, ${db}) with ${maxCount} pixels`);
  
  // Create mask for pool area
  const maskData = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const colorDist = Math.hypot(r - dr, g - dg, b - db);
    const isWhite = r > 235 && g > 235 && b > 235;
    
    // More lenient color matching
    if (!isWhite && colorDist < 120) {
      maskData.data[i + 3] = 255;
    } else {
      maskData.data[i + 3] = 0;
    }
  }
  
  return processImageData(maskData, targetScale);
}
