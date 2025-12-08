/**
 * Shape Validation & Repair Utilities
 * Ensures polygon shapes are valid for THREE.js triangulation
 */

interface Point2D {
  x: number;
  y: number;
}

/**
 * Check if a polygon is valid (no self-intersections, proper winding)
 */
export function isValidPolygon(points: Point2D[]): boolean {
  if (points.length < 3) return false;
  
  // Check for duplicate consecutive points
  for (let i = 0; i < points.length; i++) {
    const next = (i + 1) % points.length;
    if (Math.abs(points[i].x - points[next].x) < 0.001 && 
        Math.abs(points[i].y - points[next].y) < 0.001) {
      return false;
    }
  }
  
  // Check for self-intersections
  if (hasSelfIntersections(points)) {
    return false;
  }
  
  return true;
}

/**
 * Check if polygon has self-intersecting edges
 */
export function hasSelfIntersections(points: Point2D[]): boolean {
  for (let i = 0; i < points.length; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % points.length];
    
    // Check against all non-adjacent edges
    for (let j = i + 2; j < points.length; j++) {
      // Skip adjacent edges
      if (j === (i + points.length - 1) % points.length) continue;
      
      const b1 = points[j];
      const b2 = points[(j + 1) % points.length];
      
      if (segmentsIntersect(a1, a2, b1, b2)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if two line segments intersect
 */
function segmentsIntersect(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): boolean {
  const d1 = direction(b1, b2, a1);
  const d2 = direction(b1, b2, a2);
  const d3 = direction(a1, a2, b1);
  const d4 = direction(a1, a2, b2);
  
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  
  if (d1 === 0 && onSegment(b1, b2, a1)) return true;
  if (d2 === 0 && onSegment(b1, b2, a2)) return true;
  if (d3 === 0 && onSegment(a1, a2, b1)) return true;
  if (d4 === 0 && onSegment(a1, a2, b2)) return true;
  
  return false;
}

function direction(p1: Point2D, p2: Point2D, p3: Point2D): number {
  return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

function onSegment(p1: Point2D, p2: Point2D, p: Point2D): boolean {
  return Math.min(p1.x, p2.x) <= p.x && p.x <= Math.max(p1.x, p2.x) &&
         Math.min(p1.y, p2.y) <= p.y && p.y <= Math.max(p1.y, p2.y);
}

/**
 * Calculate polygon area (positive = counter-clockwise, negative = clockwise)
 */
export function calculatePolygonArea(points: Point2D[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return area / 2;
}

/**
 * Ensure polygon has counter-clockwise winding (for THREE.js holes)
 */
export function ensureCounterClockwise(points: Point2D[]): Point2D[] {
  const area = calculatePolygonArea(points);
  if (area < 0) {
    // Clockwise, reverse to counter-clockwise
    return [...points].reverse();
  }
  return points;
}

/**
 * Ensure polygon has clockwise winding (for THREE.js main shapes)
 */
export function ensureClockwise(points: Point2D[]): Point2D[] {
  const area = calculatePolygonArea(points);
  if (area > 0) {
    // Counter-clockwise, reverse to clockwise
    return [...points].reverse();
  }
  return points;
}

/**
 * Remove duplicate consecutive points
 */
export function removeDuplicatePoints(points: Point2D[], tolerance: number = 0.01): Point2D[] {
  if (points.length < 2) return points;
  
  const result: Point2D[] = [points[0]];
  
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    
    if (Math.abs(curr.x - prev.x) > tolerance || Math.abs(curr.y - prev.y) > tolerance) {
      result.push(curr);
    }
  }
  
  // Also check first and last point
  if (result.length > 2) {
    const first = result[0];
    const last = result[result.length - 1];
    if (Math.abs(first.x - last.x) < tolerance && Math.abs(first.y - last.y) < tolerance) {
      result.pop();
    }
  }
  
  return result;
}

/**
 * Remove colinear points (points on the same line)
 */
export function removeColinearPoints(points: Point2D[], tolerance: number = 0.001): Point2D[] {
  if (points.length < 3) return points;
  
  const result: Point2D[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    
    // Calculate cross product to check colinearity
    const cross = (curr.x - prev.x) * (next.y - prev.y) - (curr.y - prev.y) * (next.x - prev.x);
    
    if (Math.abs(cross) > tolerance) {
      result.push(curr);
    }
  }
  
  return result.length >= 3 ? result : points;
}

/**
 * Simplify polygon using Douglas-Peucker algorithm
 */
export function simplifyPolygon(points: Point2D[], epsilon: number = 1): Point2D[] {
  if (points.length <= 3) return points;
  
  // Find point with max distance from line
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
    const left = simplifyPolygon(points.slice(0, maxIdx + 1), epsilon);
    const right = simplifyPolygon(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  
  return [first, last];
}

function perpendicularDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  if (len === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
  
  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (len * len);
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  
  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

/**
 * Calculate convex hull of points (Graham scan)
 */
export function calculateConvexHull(points: Point2D[]): Point2D[] {
  if (points.length < 3) return points;
  
  // Find bottom-left point
  let start = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[start].y || 
        (points[i].y === points[start].y && points[i].x < points[start].x)) {
      start = i;
    }
  }
  
  // Sort points by polar angle
  const startPoint = points[start];
  const sorted = [...points].sort((a, b) => {
    if (a === startPoint) return -1;
    if (b === startPoint) return 1;
    
    const angleA = Math.atan2(a.y - startPoint.y, a.x - startPoint.x);
    const angleB = Math.atan2(b.y - startPoint.y, b.x - startPoint.x);
    
    if (angleA !== angleB) return angleA - angleB;
    
    const distA = (a.x - startPoint.x) ** 2 + (a.y - startPoint.y) ** 2;
    const distB = (b.x - startPoint.x) ** 2 + (b.y - startPoint.y) ** 2;
    return distA - distB;
  });
  
  // Build hull
  const hull: Point2D[] = [];
  
  for (const point of sorted) {
    while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
      hull.pop();
    }
    hull.push(point);
  }
  
  return hull;
}

function cross(o: Point2D, a: Point2D, b: Point2D): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Calculate bounding box of points
 */
export function calculateBoundingBox(points: Point2D[]): { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number } {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Main validation and repair function
 * Returns a valid polygon or a safe fallback
 */
export function validateAndRepairPolygon(
  points: Point2D[],
  options: {
    maxVertices?: number;
    simplifyEpsilon?: number;
    fallbackToBoundingBox?: boolean;
    fallbackToConvexHull?: boolean;
  } = {}
): Point2D[] {
  const {
    maxVertices = 150,
    simplifyEpsilon = 0.5,
    fallbackToBoundingBox = true,
    fallbackToConvexHull = true
  } = options;
  
  if (points.length < 3) {
    console.warn('⚠️ ShapeValidation: Less than 3 points, returning bounding box');
    return getFallbackRectangle(points);
  }
  
  let result = [...points];
  
  // Step 1: Remove duplicate points
  result = removeDuplicatePoints(result);
  
  if (result.length < 3) {
    console.warn('⚠️ ShapeValidation: After dedup, less than 3 points');
    return getFallbackRectangle(points);
  }
  
  // Step 2: Remove colinear points
  result = removeColinearPoints(result);
  
  // Step 3: Simplify if too many points
  if (result.length > maxVertices) {
    const epsilon = simplifyEpsilon * (result.length / maxVertices);
    result = simplifyPolygon(result, epsilon);
    console.log(`📐 ShapeValidation: Simplified from ${points.length} to ${result.length} points`);
  }
  
  // Step 4: Check for self-intersections
  if (hasSelfIntersections(result)) {
    console.warn('⚠️ ShapeValidation: Self-intersections detected');
    
    if (fallbackToConvexHull) {
      console.log('📐 ShapeValidation: Using convex hull fallback');
      result = calculateConvexHull(result);
    } else if (fallbackToBoundingBox) {
      console.log('📐 ShapeValidation: Using bounding box fallback');
      return getFallbackRectangle(result);
    }
  }
  
  // Step 5: Ensure proper winding (counter-clockwise for holes)
  result = ensureCounterClockwise(result);
  
  // Final validation
  if (result.length < 3 || !isValidPolygon(result)) {
    console.warn('⚠️ ShapeValidation: Final validation failed, using fallback');
    return getFallbackRectangle(points);
  }
  
  return result;
}

/**
 * Get a simple rectangle as fallback
 */
function getFallbackRectangle(points: Point2D[]): Point2D[] {
  if (points.length === 0) {
    return [
      { x: -10, y: -20 },
      { x: 10, y: -20 },
      { x: 10, y: 20 },
      { x: -10, y: 20 }
    ];
  }
  
  const bbox = calculateBoundingBox(points);
  const padding = 0.5;
  
  return [
    { x: bbox.minX - padding, y: bbox.minY - padding },
    { x: bbox.maxX + padding, y: bbox.minY - padding },
    { x: bbox.maxX + padding, y: bbox.maxY + padding },
    { x: bbox.minX - padding, y: bbox.maxY + padding }
  ];
}

/**
 * Create a safe THREE.js Path from validated points
 * Returns null if shape is invalid
 */
export function createSafePathFromPoints(points: Point2D[]): { path: Point2D[]; isValid: boolean; usedFallback: boolean } {
  if (points.length < 3) {
    const fallback = getFallbackRectangle(points);
    return { path: fallback, isValid: true, usedFallback: true };
  }
  
  const validated = validateAndRepairPolygon(points, {
    maxVertices: 100, // Lower for terrain holes
    fallbackToConvexHull: true,
    fallbackToBoundingBox: true
  });
  
  const usedFallback = validated.length !== points.length || 
                       validated.some((p, i) => p.x !== points[i]?.x || p.y !== points[i]?.y);
  
  return {
    path: validated,
    isValid: validated.length >= 3,
    usedFallback
  };
}

/**
 * Smooth a polygon by adding intermediate points on curves
 * while maintaining sharp corners
 */
export function smoothPolygonWithCorners(
  points: Point2D[],
  angleThreshold: number = 70,
  subdivisions: number = 5
): Point2D[] {
  if (points.length < 3) return points;
  
  const result: Point2D[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    
    // Calculate angle at this vertex
    const v1x = curr.x - prev.x;
    const v1y = curr.y - prev.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
    
    if (len1 === 0 || len2 === 0) {
      result.push(curr);
      continue;
    }
    
    const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);
    const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
    
    // Sharp corner - keep as is
    if (angle >= angleThreshold) {
      result.push(curr);
    } else {
      // Gentle curve - add subdivisions
      for (let j = 0; j <= subdivisions; j++) {
        const t = j / subdivisions;
        // Quadratic bezier through curr with control at curr
        const midPrev = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 };
        const midNext = { x: (curr.x + next.x) / 2, y: (curr.y + next.y) / 2 };
        
        const t1 = 1 - t;
        result.push({
          x: t1 * t1 * midPrev.x + 2 * t1 * t * curr.x + t * t * midNext.x,
          y: t1 * t1 * midPrev.y + 2 * t1 * t * curr.y + t * t * midNext.y
        });
      }
    }
  }
  
  return removeDuplicatePoints(result);
}
