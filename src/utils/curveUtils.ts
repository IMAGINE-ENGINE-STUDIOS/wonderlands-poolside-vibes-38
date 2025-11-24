import * as THREE from 'three';

interface Point2D {
  x: number;
  y: number;
}

interface SegmentInfo {
  isCurved: boolean;
  points: Point2D[];
}

/**
 * Detects if a segment should be curved based on angle between edges
 * @param p0 - Previous point
 * @param p1 - Current point  
 * @param p2 - Next point
 * @param angleThreshold - Angle threshold in degrees (default 170 = nearly straight)
 * @returns true if segment should be curved
 */
function shouldCurveSegment(p0: Point2D, p1: Point2D, p2: Point2D, angleThreshold: number = 170): boolean {
  const v1x = p1.x - p0.x;
  const v1y = p1.y - p0.y;
  const v2x = p2.x - p1.x;
  const v2y = p2.y - p1.y;
  
  const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
  
  if (len1 === 0 || len2 === 0) return false;
  
  const dot = (v1x * v2x + v1y * v2y) / (len1 * len2);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
  
  // If angle is close to 180 degrees (straight), don't curve
  return angle < angleThreshold;
}

/**
 * Generates adaptive curve points - straight lines where appropriate, curves where needed
 * @param points - Array of pool boundary points
 * @param segmentsPerEdge - Number of subdivisions per curved edge
 * @param tension - Curve tension (0 = linear, 1 = very curved)
 * @param angleThreshold - Angle threshold for curve detection (default 170)
 * @returns Array of interpolated points with mixed straight/curved segments
 */
export function generateCurvedPoolPoints(
  points: Point2D[],
  segmentsPerEdge: number = 20,
  tension: number = 0.5,
  angleThreshold: number = 170
): Point2D[] {
  if (points.length < 3) return points;

  const result: Point2D[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    
    // Check if this segment should be curved
    const isCurved = shouldCurveSegment(p0, p1, p2, angleThreshold);
    
    if (isCurved) {
      // Use Catmull-Rom spline for this segment
      const curve = new THREE.CatmullRomCurve3(
        [p0, p1, p2, p3].map(p => new THREE.Vector3(p.x, 0, p.y)),
        false, // not closed
        'catmullrom',
        tension
      );
      
      // Sample segment from 0.33 to 0.66 to get just the p1->p2 portion
      for (let j = 0; j < segmentsPerEdge; j++) {
        const t = 0.33 + (j / segmentsPerEdge) * 0.33;
        const point = curve.getPoint(t);
        result.push({ x: point.x, y: point.z });
      }
    } else {
      // Straight line segment - just add the point
      result.push({ x: p1.x, y: p1.y });
    }
  }
  
  return result;
}

/**
 * Generates smooth bezier curve between two points with control points
 * @param p1 - Start point
 * @param p2 - End point
 * @param cp1 - First control point
 * @param cp2 - Second control point
 * @param segments - Number of segments
 * @returns Array of interpolated points
 */
export function generateBezierSegment(
  p1: Point2D,
  p2: Point2D,
  cp1: Point2D,
  cp2: Point2D,
  segments: number = 20
): Point2D[] {
  const points: Point2D[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const t1 = 1 - t;
    
    // Cubic Bezier formula
    const x = t1 * t1 * t1 * p1.x +
              3 * t1 * t1 * t * cp1.x +
              3 * t1 * t * t * cp2.x +
              t * t * t * p2.x;
              
    const y = t1 * t1 * t1 * p1.y +
              3 * t1 * t1 * t * cp1.y +
              3 * t1 * t * t * cp2.y +
              t * t * t * p2.y;
    
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Generates automatic control points for smooth curves through all points
 * @param points - Array of points to curve through
 * @param smoothness - How much the curve should bow (0-1)
 * @returns Array of control point pairs for each segment
 */
export function generateAutoControlPoints(
  points: Point2D[],
  smoothness: number = 0.25
): Array<[Point2D, Point2D]> {
  const controlPoints: Array<[Point2D, Point2D]> = [];
  
  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];
    
    // Calculate tangent at p1 based on neighbors
    const tangentX = (p2.x - p0.x) * smoothness;
    const tangentY = (p2.y - p0.y) * smoothness;
    
    // First control point (coming out of p1)
    const cp1: Point2D = {
      x: p1.x + tangentX,
      y: p1.y + tangentY
    };
    
    // Calculate tangent at p2 based on neighbors
    const tangent2X = (p3.x - p1.x) * smoothness;
    const tangent2Y = (p3.y - p1.y) * smoothness;
    
    // Second control point (going into p2)
    const cp2: Point2D = {
      x: p2.x - tangent2X,
      y: p2.y - tangent2Y
    };
    
    controlPoints.push([cp1, cp2]);
  }
  
  return controlPoints;
}

/**
 * Creates a smooth outline of a shape by interpolating curved segments
 * @param points - Original shape points
 * @param curvature - Amount of curvature (0 = straight, 1 = maximum curve)
 * @param resolution - Points per edge
 * @returns Smooth curved outline points
 */
export function createSmoothOutline(
  points: Point2D[],
  curvature: number = 0.5,
  resolution: number = 20
): Point2D[] {
  if (points.length < 3) return points;
  
  const smoothPoints: Point2D[] = [];
  const controlPoints = generateAutoControlPoints(points, curvature);
  
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const [cp1, cp2] = controlPoints[i];
    
    const segment = generateBezierSegment(p1, p2, cp1, cp2, resolution);
    
    // Add all points except the last one (to avoid duplicates)
    smoothPoints.push(...segment.slice(0, -1));
  }
  
  return smoothPoints;
}
