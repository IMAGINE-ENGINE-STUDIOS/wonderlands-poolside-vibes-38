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

// Marching Squares for clean contour extraction
function marchingSquares(
  mask: Uint8Array,
  width: number,
  height: number
): { x: number; y: number }[] {
  const contour: { x: number; y: number }[] = [];
  
  // Find start point (first pixel on the boundary)
  let startX = -1, startY = -1;
  outer: for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      if (mask[y * width + x] > 0) {
        startX = x;
        startY = y;
        break outer;
      }
    }
  }
  
  if (startX < 0) return contour;
  
  // Direction lookup for marching squares
  // Each case maps to movement direction (dx, dy)
  const directions: Record<number, [number, number]> = {
    1: [0, 1], 2: [1, 0], 3: [1, 0], 4: [-1, 0],
    5: [0, 1], 6: [1, 0], 7: [1, 0], 8: [0, -1],
    9: [0, -1], 10: [0, -1], 11: [0, -1], 12: [-1, 0],
    13: [0, -1], 14: [-1, 0]
  };
  
  let x = startX, y = startY;
  let prevDir = [1, 0];
  const visited = new Set<string>();
  
  do {
    const key = `${x},${y}`;
    if (visited.has(key) && contour.length > 3) break;
    visited.add(key);
    
    contour.push({ x: x + 0.5, y: y + 0.5 });
    
    // Get cell configuration
    const tl = (y > 0 && x > 0) ? mask[(y - 1) * width + (x - 1)] : 0;
    const tr = (y > 0 && x < width) ? mask[(y - 1) * width + x] : 0;
    const bl = (y < height && x > 0) ? mask[y * width + (x - 1)] : 0;
    const br = (y < height && x < width) ? mask[y * width + x] : 0;
    
    const config = (tl > 0 ? 8 : 0) + (tr > 0 ? 4 : 0) + (br > 0 ? 2 : 0) + (bl > 0 ? 1 : 0);
    
    if (config === 0 || config === 15) {
      // Move in previous direction
      x += prevDir[0];
      y += prevDir[1];
    } else {
      const dir = directions[config] || prevDir;
      prevDir = dir as [number, number];
      x += dir[0];
      y += dir[1];
    }
    
    // Safety limit
    if (contour.length > width * height) break;
  } while (x !== startX || y !== startY);
  
  return contour;
}

// Create binary mask from image data (pool = 1, background = 0)
function createBinaryMask(imageData: ImageData): Uint8Array {
  const { data, width, height } = imageData;
  const mask = new Uint8Array(width * height);
  
  // First pass: detect dominant pool color (usually blue)
  const colorHistogram: Map<string, number> = new Map();
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 128) continue;
    if (r > 240 && g > 240 && b > 240) continue; // Skip white
    
    // Quantize to reduce colors
    const qr = Math.floor(r / 32) * 32;
    const qg = Math.floor(g / 32) * 32;
    const qb = Math.floor(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    colorHistogram.set(key, (colorHistogram.get(key) || 0) + 1);
  }
  
  // Find dominant color
  let maxCount = 0;
  let dominantColor = [64, 128, 192];
  for (const [color, count] of colorHistogram) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color.split(',').map(Number);
    }
  }
  
  const [dr, dg, db] = dominantColor;
  console.log(`🎨 Dominant pool color: RGB(${dr}, ${dg}, ${db})`);
  
  // Second pass: create mask with color similarity
  for (let i = 0; i < data.length; i += 4) {
    const pixelIdx = i / 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    
    // Check if pixel is similar to pool color
    const colorDist = Math.sqrt(
      Math.pow(r - dr, 2) + Math.pow(g - dg, 2) + Math.pow(b - db, 2)
    );
    
    const isWhite = r > 235 && g > 235 && b > 235;
    const isTransparent = a < 128;
    
    // Accept pixels within color distance threshold
    if (!isWhite && !isTransparent && colorDist < 100) {
      mask[pixelIdx] = 255;
    }
  }
  
  // Morphological close to fill small gaps
  dilate(mask, width, height, 2);
  erode(mask, width, height, 2);
  
  return mask;
}

// Simple morphological dilation
function dilate(mask: Uint8Array, width: number, height: number, radius: number): void {
  const temp = new Uint8Array(mask);
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      if (temp[y * width + x] > 0) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            mask[(y + dy) * width + (x + dx)] = 255;
          }
        }
      }
    }
  }
}

// Simple morphological erosion
function erode(mask: Uint8Array, width: number, height: number, radius: number): void {
  const temp = new Uint8Array(mask);
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let allSet = true;
      for (let dy = -radius; dy <= radius && allSet; dy++) {
        for (let dx = -radius; dx <= radius && allSet; dx++) {
          if (temp[(y + dy) * width + (x + dx)] === 0) {
            allSet = false;
          }
        }
      }
      mask[y * width + x] = allSet ? 255 : 0;
    }
  }
}

// Catmull-Rom spline interpolation for smooth curves
function catmullRomSpline(
  points: { x: number; y: number }[],
  samplesPerSegment: number = 10,
  tension: number = 0.5
): { x: number; y: number }[] {
  if (points.length < 3) return points;
  
  const result: { x: number; y: number }[] = [];
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    
    for (let j = 0; j < samplesPerSegment; j++) {
      const t = j / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      
      // Catmull-Rom basis functions
      const b0 = -tension * t + 2 * tension * t2 - tension * t3;
      const b1 = 1 + (tension - 3) * t2 + (2 - tension) * t3;
      const b2 = tension * t + (3 - 2 * tension) * t2 + (tension - 2) * t3;
      const b3 = -tension * t2 + tension * t3;
      
      result.push({
        x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
        y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y
      });
    }
  }
  
  return result;
}

// Resample contour to have evenly spaced points
function resampleContour(
  points: { x: number; y: number }[],
  targetCount: number
): { x: number; y: number }[] {
  if (points.length < 3) return points;
  
  // Calculate total perimeter
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    perimeter += Math.hypot(next.x - points[i].x, next.y - points[i].y);
  }
  
  const spacing = perimeter / targetCount;
  const result: { x: number; y: number }[] = [points[0]];
  
  let accumulated = 0;
  let currentIdx = 0;
  
  for (let i = 1; i < targetCount; i++) {
    const targetDist = i * spacing;
    
    while (accumulated < targetDist && currentIdx < points.length - 1) {
      const curr = points[currentIdx];
      const next = points[(currentIdx + 1) % points.length];
      const segLen = Math.hypot(next.x - curr.x, next.y - curr.y);
      
      if (accumulated + segLen >= targetDist) {
        const t = (targetDist - accumulated) / segLen;
        result.push({
          x: curr.x + t * (next.x - curr.x),
          y: curr.y + t * (next.y - curr.y)
        });
        break;
      }
      
      accumulated += segLen;
      currentIdx++;
    }
  }
  
  return result;
}

// Adaptive simplification that preserves curves
function adaptiveSimplify(
  points: { x: number; y: number }[],
  minAngle: number = 150 // Degrees - preserve sharp turns
): { x: number; y: number }[] {
  if (points.length <= 10) return points;
  
  const result: { x: number; y: number }[] = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    // Calculate angle at current point
    const angle = calculateAngle(prev, curr, next);
    
    // Keep points at sharp turns or every few points
    if (angle < minAngle || i % 3 === 0) {
      result.push(curr);
    }
  }
  
  result.push(points[points.length - 1]);
  return result;
}

function calculateAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const dot = v1.x * v2.x + v1.y * v2.y;
  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);
  
  if (len1 === 0 || len2 === 0) return 180;
  
  const cosAngle = Math.max(-1, Math.min(1, dot / (len1 * len2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

// Calculate curvature at a point
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

// Detect rectangular regions that might be stairs
function detectStairsRegions(
  points: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number
): { points: Point[]; width: number; position: number }[] {
  const stairs: { points: Point[]; width: number; position: number }[] = [];
  
  if (points.length < 10) return stairs;
  
  // Look for areas with consecutive near-90-degree angles
  for (let i = 0; i < points.length; i++) {
    const p1 = points[(i - 1 + points.length) % points.length];
    const p2 = points[i];
    const p3 = points[(i + 1) % points.length];
    
    const angle = calculateAngle(p1, p2, p3);
    
    // Right angle indicates potential stairs
    if (angle > 80 && angle < 100) {
      const width = Math.hypot(p2.x - p3.x, p2.y - p3.y) / imageWidth;
      
      if (width > 0.05 && width < 0.25) {
        stairs.push({
          points: [
            { x: p1.x, y: p1.y, id: `stair-${i}-0` },
            { x: p2.x, y: p2.y, id: `stair-${i}-1` },
            { x: p3.x, y: p3.y, id: `stair-${i}-2` }
          ],
          width,
          position: i / points.length
        });
      }
    }
  }
  
  return stairs;
}

// Detect curved indentations (seating/tanning ledges)
function detectSeatingRegions(
  points: { x: number; y: number }[],
  imageWidth: number
): { points: Point[]; startPosition: number; endPosition: number }[] {
  const seating: { points: Point[]; startPosition: number; endPosition: number }[] = [];
  
  if (points.length < 20) return seating;
  
  const windowSize = Math.max(5, Math.floor(points.length / 20));
  
  for (let i = windowSize; i < points.length - windowSize; i++) {
    const prev = points[i - windowSize];
    const curr = points[i];
    const next = points[i + windowSize];
    
    const curvature = calculateCurvature(prev, curr, next);
    
    // Significant inward curve suggests seating
    if (curvature < -0.05) {
      const startPos = (i - windowSize) / points.length;
      const endPos = (i + windowSize) / points.length;
      
      const exists = seating.some(s => 
        Math.abs(s.startPosition - startPos) < 0.15
      );
      
      if (!exists) {
        const segmentPoints = points.slice(i - windowSize, i + windowSize + 1);
        seating.push({
          points: segmentPoints.map((p, idx) => ({
            x: p.x, y: p.y, id: `seating-${i}-${idx}`
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
  
  if (points.length < 20) return spillovers;
  
  const bbox = calculateBoundingBox(points);
  
  // Look for narrow protrusions
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 10 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 10) % points.length];
    
    const localWidth = Math.hypot(prev.x - next.x, prev.y - next.y);
    const avgWidth = (bbox.width + bbox.height) / 2;
    
    if (localWidth < avgWidth * 0.2) {
      const position = i / points.length;
      const exists = spillovers.some(s => Math.abs(s.position - position) < 0.1);
      
      if (!exists) {
        spillovers.push({
          points: [
            { x: prev.x, y: prev.y, id: `spillover-${i}-0` },
            { x: curr.x, y: curr.y, id: `spillover-${i}-1` },
            { x: next.x, y: next.y, id: `spillover-${i}-2` }
          ],
          width: localWidth / imageWidth,
          position
        });
      }
    }
  }
  
  return spillovers;
}

// Main function to trace pool shape from image
export async function tracePoolShapeFromImage(
  file: File,
  targetScale: number = 1
): Promise<TracedShape> {
  console.log('🔍 Starting improved pool shape tracing...');
  
  try {
    // Load and remove background using ML
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
    
    return processImageDataWithSplines(imageData, targetScale);
  } catch (error) {
    console.error('❌ ML tracing failed, falling back to quick trace:', error);
    return quickTracePoolShape(file, targetScale);
  }
}

// Process image data with spline fitting for smooth curves
function processImageDataWithSplines(imageData: ImageData, targetScale: number): TracedShape {
  const { width, height } = imageData;
  
  console.log(`📐 Processing ${width}x${height} image...`);
  
  // Create binary mask
  const mask = createBinaryMask(imageData);
  
  // Extract contour using marching squares
  console.log('🔄 Extracting contour with marching squares...');
  const rawContour = marchingSquares(mask, width, height);
  console.log(`Found ${rawContour.length} raw contour points`);
  
  if (rawContour.length < 10) {
    console.warn('⚠️ Not enough contour points, using fallback');
    return createFallbackShape(targetScale);
  }
  
  // Resample to even spacing
  const resampledCount = Math.min(200, Math.max(50, Math.floor(rawContour.length / 5)));
  const resampled = resampleContour(rawContour, resampledCount);
  console.log(`Resampled to ${resampled.length} evenly spaced points`);
  
  // Apply adaptive simplification (keep sharp corners, smooth curves)
  const simplified = adaptiveSimplify(resampled, 160);
  console.log(`Simplified to ${simplified.length} key points`);
  
  // Fit Catmull-Rom spline for smooth curves
  const splinePoints = catmullRomSpline(simplified, 8, 0.5);
  console.log(`Generated ${splinePoints.length} spline points`);
  
  // Final resample to target point count
  const finalCount = Math.min(120, Math.max(40, Math.floor(splinePoints.length / 3)));
  const finalPoints = resampleContour(splinePoints, finalCount);
  console.log(`Final contour: ${finalPoints.length} points`);
  
  // Detect features
  const stairsRegions = detectStairsRegions(finalPoints, width, height);
  const seatingRegions = detectSeatingRegions(finalPoints, width);
  const spilloverRegions = detectSpilloverRegions(finalPoints, width, height);
  
  console.log(`Detected: ${stairsRegions.length} stairs, ${seatingRegions.length} seating, ${spilloverRegions.length} spillovers`);
  
  // Normalize points to center and scale
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDim = Math.max(width, height);
  
  const poolPoints: Point[] = finalPoints.map((p, i) => ({
    x: ((p.x - centerX) / maxDim) * targetScale * 100,
    y: ((p.y - centerY) / maxDim) * targetScale * 100,
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
  
  return processImageDataWithSplines(imageData, targetScale);
}
