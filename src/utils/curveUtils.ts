import * as THREE from 'three';

interface Point2D {
  x: number;
  y: number;
}

/**
 * Generates smooth curve points between pool boundary points using Catmull-Rom splines
 * @param points - Array of pool boundary points
 * @param segmentsPerEdge - Number of subdivisions per edge for smoothness
 * @param tension - Curve tension (0 = linear, 1 = very curved)
 * @returns Array of interpolated points forming smooth curves
 */
export function generateCurvedPoolPoints(
  points: Point2D[],
  segmentsPerEdge: number = 20,
  tension: number = 0.5
): Point2D[] {
  if (points.length < 3) return points;

  const curvedPoints: Point2D[] = [];
  
  // Create a closed Catmull-Rom curve
  const vectors = points.map(p => new THREE.Vector2(p.x, p.y));
  
  // Add first point at end to close the loop
  vectors.push(vectors[0].clone());
  
  const curve = new THREE.CatmullRomCurve3(
    vectors.map(v => new THREE.Vector3(v.x, 0, v.y)),
    true, // closed curve
    'catmullrom',
    tension
  );

  // Sample points along the curve
  const totalSegments = points.length * segmentsPerEdge;
  for (let i = 0; i < totalSegments; i++) {
    const t = i / totalSegments;
    const point = curve.getPoint(t);
    curvedPoints.push({ x: point.x, y: point.z });
  }

  return curvedPoints;
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
