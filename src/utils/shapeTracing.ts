import { loadImage, removeBackground } from './backgroundRemoval';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface TracedShape {
  poolPoints: Point[];
  stairsRegions: { points: Point[]; width: number; position: number }[];
  seatingRegions: { points: Point[]; startPosition: number; endPosition: number }[];
}

// Extract contour points from a binary mask
function extractContourPoints(
  imageData: ImageData,
  threshold: number = 128
): { x: number; y: number }[] {
  const { width, height, data } = imageData;
  const points: { x: number; y: number }[] = [];
  
  // Find edge pixels (pixels with alpha > threshold that have transparent neighbors)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      
      if (alpha > threshold) {
        // Check if this is an edge pixel (has transparent neighbor)
        const neighbors = [
          data[((y - 1) * width + x) * 4 + 3],
          data[((y + 1) * width + x) * 4 + 3],
          data[(y * width + x - 1) * 4 + 3],
          data[(y * width + x + 1) * 4 + 3],
        ];
        
        if (neighbors.some(n => n <= threshold)) {
          points.push({ x, y });
        }
      }
    }
  }
  
  return points;
}

// Order points to form a continuous contour using nearest neighbor
function orderContourPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  if (points.length === 0) return [];
  
  const ordered: { x: number; y: number }[] = [];
  const remaining = [...points];
  
  // Start with leftmost point
  remaining.sort((a, b) => a.x - b.x);
  ordered.push(remaining.shift()!);
  
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const dist = Math.hypot(remaining[i].x - last.x, remaining[i].y - last.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    
    // If nearest point is too far, we might have multiple contours - skip
    if (nearestDist > 20) break;
    
    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }
  
  return ordered;
}

// Simplify contour using Douglas-Peucker algorithm
function simplifyContour(
  points: { x: number; y: number }[],
  epsilon: number = 5
): { x: number; y: number }[] {
  if (points.length <= 2) return points;
  
  // Find point with max distance from line between first and last
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
    const left = simplifyContour(points.slice(0, maxIdx + 1), epsilon);
    const right = simplifyContour(points.slice(maxIdx), epsilon);
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

// Detect rectangular regions that might be stairs (typically rectangular protrusions)
function detectStairsRegions(
  points: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number
): { points: Point[]; width: number; position: number }[] {
  const stairs: { points: Point[]; width: number; position: number }[] = [];
  
  // Look for rectangular protrusions (sudden indentations in the contour)
  // Stairs typically appear as rectangular steps going into the pool
  for (let i = 0; i < points.length - 3; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];
    const p4 = points[i + 3];
    
    // Check for right-angle pattern
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    const angle3 = Math.atan2(p4.y - p3.y, p4.x - p3.x);
    
    const angleDiff1 = Math.abs(normalizeAngle(angle2 - angle1) - Math.PI / 2);
    const angleDiff2 = Math.abs(normalizeAngle(angle3 - angle2) - Math.PI / 2);
    
    if (angleDiff1 < 0.3 && angleDiff2 < 0.3) {
      const width = Math.hypot(p2.x - p3.x, p2.y - p3.y);
      if (width > 20 && width < imageWidth * 0.3) {
        const position = i / points.length;
        stairs.push({
          points: [p1, p2, p3, p4].map((p, idx) => ({
            x: p.x,
            y: p.y,
            id: `stair-${i}-${idx}`
          })),
          width: width / imageWidth,
          position
        });
      }
    }
  }
  
  return stairs;
}

// Detect curved indentations that might be seating (tanning ledges)
function detectSeatingRegions(
  points: { x: number; y: number }[],
  imageWidth: number
): { points: Point[]; startPosition: number; endPosition: number }[] {
  const seating: { points: Point[]; startPosition: number; endPosition: number }[] = [];
  
  // Look for smooth curved sections that indent inward
  const windowSize = 10;
  
  for (let i = windowSize; i < points.length - windowSize; i++) {
    const prev = points[i - windowSize];
    const curr = points[i];
    const next = points[i + windowSize];
    
    // Calculate curvature
    const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    
    const cross = v1.x * v2.y - v1.y * v2.x;
    const dot = v1.x * v2.x + v1.y * v2.y;
    const angle = Math.atan2(cross, dot);
    
    // Significant inward curve suggests seating
    if (Math.abs(angle) > 0.5 && Math.abs(angle) < 1.5) {
      const startPos = (i - windowSize) / points.length;
      const endPos = (i + windowSize) / points.length;
      
      // Check we don't already have nearby seating
      const exists = seating.some(s => 
        Math.abs(s.startPosition - startPos) < 0.1 || 
        Math.abs(s.endPosition - endPos) < 0.1
      );
      
      if (!exists) {
        seating.push({
          points: points.slice(i - windowSize, i + windowSize + 1).map((p, idx) => ({
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

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

// Main function to trace pool shape from image
export async function tracePoolShapeFromImage(
  file: File,
  targetScale: number = 1
): Promise<TracedShape> {
  console.log('Starting pool shape tracing...');
  
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
  
  // Extract and process contour
  console.log('Extracting contour points...');
  const rawPoints = extractContourPoints(imageData);
  console.log(`Found ${rawPoints.length} raw edge points`);
  
  const orderedPoints = orderContourPoints(rawPoints);
  console.log(`Ordered ${orderedPoints.length} contour points`);
  
  // Simplify to reasonable number of points
  const epsilon = Math.max(canvas.width, canvas.height) * 0.02;
  const simplifiedPoints = simplifyContour(orderedPoints, epsilon);
  console.log(`Simplified to ${simplifiedPoints.length} points`);
  
  // Detect features
  const stairsRegions = detectStairsRegions(simplifiedPoints, canvas.width, canvas.height);
  const seatingRegions = detectSeatingRegions(simplifiedPoints, canvas.width);
  
  console.log(`Detected ${stairsRegions.length} potential stairs, ${seatingRegions.length} potential seating`);
  
  // Normalize points to center and scale
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxDim = Math.max(canvas.width, canvas.height);
  
  const poolPoints: Point[] = simplifiedPoints.map((p, i) => ({
    x: ((p.x - centerX) / maxDim) * targetScale * 100,
    y: ((p.y - centerY) / maxDim) * targetScale * 100,
    id: `${i + 1}`
  }));
  
  return {
    poolPoints,
    stairsRegions,
    seatingRegions
  };
}

// Quick trace without ML - uses simple threshold-based extraction
export async function quickTracePoolShape(
  file: File,
  targetScale: number = 1
): Promise<TracedShape> {
  console.log('Starting quick pool shape tracing (no ML)...');
  
  const img = await loadImage(file);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  
  // Find the dominant non-white color (likely the pool)
  const colorCounts: Map<string, number> = new Map();
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Skip near-white pixels
    if (r > 240 && g > 240 && b > 240) continue;
    
    // Quantize colors
    const qr = Math.floor(r / 32) * 32;
    const qg = Math.floor(g / 32) * 32;
    const qb = Math.floor(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;
    
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }
  
  // Find most common non-white color
  let maxCount = 0;
  let dominantColor = '0,0,128'; // Default blue
  
  for (const [color, count] of colorCounts) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }
  
  const [dr, dg, db] = dominantColor.split(',').map(Number);
  
  // Create mask for pool area
  const maskData = new ImageData(width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Check if pixel is close to dominant color or is non-white
    const isWhite = r > 240 && g > 240 && b > 240;
    const colorDist = Math.hypot(r - dr, g - dg, b - db);
    
    if (!isWhite && colorDist < 100) {
      maskData.data[i + 3] = 255;
    } else {
      maskData.data[i + 3] = 0;
    }
  }
  
  // Extract contour from mask
  const rawPoints = extractContourPoints(maskData, 128);
  const orderedPoints = orderContourPoints(rawPoints);
  const epsilon = Math.max(width, height) * 0.015;
  const simplifiedPoints = simplifyContour(orderedPoints, epsilon);
  
  // Detect features
  const stairsRegions = detectStairsRegions(simplifiedPoints, width, height);
  const seatingRegions = detectSeatingRegions(simplifiedPoints, width);
  
  // Normalize points
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDim = Math.max(width, height);
  
  const poolPoints: Point[] = simplifiedPoints.map((p, i) => ({
    x: ((p.x - centerX) / maxDim) * targetScale * 100,
    y: ((p.y - centerY) / maxDim) * targetScale * 100,
    id: `${i + 1}`
  }));
  
  return {
    poolPoints,
    stairsRegions,
    seatingRegions
  };
}
