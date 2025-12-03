import * as THREE from 'three';

/**
 * Utility functions for creating pool wall-style mesh geometry
 * with proper 1ft x 1ft UV mapping and correct index winding
 */

export interface WallSegmentParams {
  p1: { x: number; z: number };
  p2: { x: number; z: number };
  topY: number;
  bottomY1: number;
  bottomY2: number;
  cumulativeDistance: number;
  faceInward?: boolean; // true = normal points inward (toward pool center)
}

export interface QuadVertices {
  vertices: number[];
  uvs: number[];
  indices: number[];
  vertexCount: number;
}

/**
 * Create a wall segment quad with proper UV mapping
 * UV: U = cumulative perimeter distance (1ft = 1 unit), V = height (1ft = 1 unit)
 */
export function createWallSegment(params: WallSegmentParams): QuadVertices {
  const { p1, p2, topY, bottomY1, bottomY2, cumulativeDistance, faceInward = true } = params;
  
  const segmentLength = Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)
  );
  
  const height1 = Math.abs(topY - bottomY1);
  const height2 = Math.abs(topY - bottomY2);
  
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  
  // Vertex order: 0=topLeft, 1=topRight, 2=bottomLeft, 3=bottomRight
  if (faceInward) {
    // Normal points inward - standard order
    vertices.push(p1.x, topY, p1.z);        // 0: top-left
    vertices.push(p2.x, topY, p2.z);        // 1: top-right
    vertices.push(p1.x, bottomY1, p1.z);    // 2: bottom-left
    vertices.push(p2.x, bottomY2, p2.z);    // 3: bottom-right
    
    // UV: cumulative distance for U, height for V
    uvs.push(cumulativeDistance, height1);
    uvs.push(cumulativeDistance + segmentLength, height2);
    uvs.push(cumulativeDistance, 0);
    uvs.push(cumulativeDistance + segmentLength, 0);
    
    // Index winding for inward-facing normal
    indices.push(0, 1, 3, 0, 3, 2);
  } else {
    // Normal points outward - reversed vertex order
    vertices.push(p2.x, topY, p2.z);        // 0: top-left (swapped)
    vertices.push(p1.x, topY, p1.z);        // 1: top-right (swapped)
    vertices.push(p2.x, bottomY2, p2.z);    // 2: bottom-left (swapped)
    vertices.push(p1.x, bottomY1, p1.z);    // 3: bottom-right (swapped)
    
    uvs.push(cumulativeDistance + segmentLength, height2);
    uvs.push(cumulativeDistance, height1);
    uvs.push(cumulativeDistance + segmentLength, 0);
    uvs.push(cumulativeDistance, 0);
    
    indices.push(0, 1, 3, 0, 3, 2);
  }
  
  return { vertices, uvs, indices, vertexCount: 4 };
}

/**
 * Create a horizontal surface (top or bottom) with world-space UV mapping
 * UV: x = U, z = V (1ft = 1 unit)
 */
export function createHorizontalSurface(
  points: Array<{ x: number; z: number }>,
  y: number,
  faceUp: boolean = true
): THREE.BufferGeometry {
  if (points.length < 3) return new THREE.BufferGeometry();
  
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].z);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].z);
  }
  shape.closePath();
  
  const geometry = new THREE.ShapeGeometry(shape);
  
  // Apply world-space UV mapping
  const positionAttr = geometry.getAttribute('position');
  const uvAttr = geometry.getAttribute('uv');
  
  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const z = positionAttr.getY(i); // In ShapeGeometry, Y is actually Z
    uvAttr.setXY(i, x, z);
  }
  uvAttr.needsUpdate = true;
  
  // Rotate to horizontal plane
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, y, 0);
  
  if (!faceUp) {
    // Flip normals for bottom surface
    const index = geometry.getIndex();
    if (index) {
      const newIndices = [];
      for (let i = 0; i < index.count; i += 3) {
        newIndices.push(index.getX(i + 2), index.getX(i + 1), index.getX(i));
      }
      geometry.setIndex(newIndices);
    }
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Create an end cap quad for seating/stairs
 * UV uses width for U and height for V
 */
export function createEndCap(
  outerPoint: { x: number; z: number },
  innerPoint: { x: number; z: number },
  topY: number,
  bottomY: number,
  width: number,
  faceStart: boolean = true
): QuadVertices {
  const height = Math.abs(topY - bottomY);
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  
  if (faceStart) {
    // Start cap - normal points toward start
    vertices.push(outerPoint.x, topY, outerPoint.z);      // 0: top-outer
    vertices.push(innerPoint.x, topY, innerPoint.z);      // 1: top-inner
    vertices.push(outerPoint.x, bottomY, outerPoint.z);   // 2: bottom-outer
    vertices.push(innerPoint.x, bottomY, innerPoint.z);   // 3: bottom-inner
    
    uvs.push(0, height);
    uvs.push(width, height);
    uvs.push(0, 0);
    uvs.push(width, 0);
  } else {
    // End cap - normal points toward end (reversed)
    vertices.push(innerPoint.x, topY, innerPoint.z);      // 0: top-inner
    vertices.push(outerPoint.x, topY, outerPoint.z);      // 1: top-outer
    vertices.push(innerPoint.x, bottomY, innerPoint.z);   // 2: bottom-inner
    vertices.push(outerPoint.x, bottomY, outerPoint.z);   // 3: bottom-outer
    
    uvs.push(0, height);
    uvs.push(width, height);
    uvs.push(0, 0);
    uvs.push(width, 0);
  }
  
  indices.push(0, 1, 3, 0, 3, 2);
  
  return { vertices, uvs, indices, vertexCount: 4 };
}

/**
 * Create a box geometry with proper UV mapping for stairs/benches
 * Uses world-space UV for top/bottom, cumulative distance for sides
 */
export function createBoxWithUV(
  x: number, y: number, z: number,
  width: number, height: number, depth: number,
  cumulativeU: number = 0
): THREE.BufferGeometry {
  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;
  
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  
  // TOP face (Y+) - world-space UV
  let baseIdx = vertices.length / 3;
  vertices.push(
    x - hw, y + hh, z - hd,  // 0
    x + hw, y + hh, z - hd,  // 1
    x + hw, y + hh, z + hd,  // 2
    x - hw, y + hh, z + hd   // 3
  );
  uvs.push(
    x - hw, z - hd,
    x + hw, z - hd,
    x + hw, z + hd,
    x - hw, z + hd
  );
  indices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx, baseIdx + 3, baseIdx + 2);
  
  // BOTTOM face (Y-) - world-space UV
  baseIdx = vertices.length / 3;
  vertices.push(
    x - hw, y - hh, z + hd,  // 0
    x + hw, y - hh, z + hd,  // 1
    x + hw, y - hh, z - hd,  // 2
    x - hw, y - hh, z - hd   // 3
  );
  uvs.push(
    x - hw, z + hd,
    x + hw, z + hd,
    x + hw, z - hd,
    x - hw, z - hd
  );
  indices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx, baseIdx + 3, baseIdx + 2);
  
  // FRONT face (Z+) - cumulative distance UV
  baseIdx = vertices.length / 3;
  vertices.push(
    x - hw, y + hh, z + hd,  // 0: top-left
    x + hw, y + hh, z + hd,  // 1: top-right
    x + hw, y - hh, z + hd,  // 2: bottom-right
    x - hw, y - hh, z + hd   // 3: bottom-left
  );
  uvs.push(
    cumulativeU, height,
    cumulativeU + width, height,
    cumulativeU + width, 0,
    cumulativeU, 0
  );
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
  
  // BACK face (Z-) - cumulative distance UV
  baseIdx = vertices.length / 3;
  vertices.push(
    x + hw, y + hh, z - hd,  // 0: top-left
    x - hw, y + hh, z - hd,  // 1: top-right
    x - hw, y - hh, z - hd,  // 2: bottom-right
    x + hw, y - hh, z - hd   // 3: bottom-left
  );
  uvs.push(
    cumulativeU, height,
    cumulativeU + width, height,
    cumulativeU + width, 0,
    cumulativeU, 0
  );
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
  
  // RIGHT face (X+) - cumulative distance UV
  baseIdx = vertices.length / 3;
  vertices.push(
    x + hw, y + hh, z + hd,  // 0: top-left
    x + hw, y + hh, z - hd,  // 1: top-right
    x + hw, y - hh, z - hd,  // 2: bottom-right
    x + hw, y - hh, z + hd   // 3: bottom-left
  );
  uvs.push(
    cumulativeU, height,
    cumulativeU + depth, height,
    cumulativeU + depth, 0,
    cumulativeU, 0
  );
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
  
  // LEFT face (X-) - cumulative distance UV
  baseIdx = vertices.length / 3;
  vertices.push(
    x - hw, y + hh, z - hd,  // 0: top-left
    x - hw, y + hh, z + hd,  // 1: top-right
    x - hw, y - hh, z + hd,  // 2: bottom-right
    x - hw, y - hh, z - hd   // 3: bottom-left
  );
  uvs.push(
    cumulativeU, height,
    cumulativeU + depth, height,
    cumulativeU + depth, 0,
    cumulativeU, 0
  );
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Merge multiple BufferGeometries into one
 */
export function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geometries.length === 0) return new THREE.BufferGeometry();
  if (geometries.length === 1) return geometries[0];
  
  const allVertices: number[] = [];
  const allUVs: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;
  
  for (const geo of geometries) {
    const positions = geo.getAttribute('position');
    const uvs = geo.getAttribute('uv');
    const index = geo.getIndex();
    
    if (!positions || !uvs) continue;
    
    // Copy vertices and UVs
    for (let i = 0; i < positions.count; i++) {
      allVertices.push(positions.getX(i), positions.getY(i), positions.getZ(i));
      allUVs.push(uvs.getX(i), uvs.getY(i));
    }
    
    // Copy indices with offset
    if (index) {
      for (let i = 0; i < index.count; i++) {
        allIndices.push(index.getX(i) + vertexOffset);
      }
    }
    
    vertexOffset += positions.count;
  }
  
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3));
  merged.setAttribute('uv', new THREE.Float32BufferAttribute(allUVs, 2));
  merged.setIndex(allIndices);
  merged.computeVertexNormals();
  
  return merged;
}

/**
 * Calculate perimeter length
 */
export function calculatePerimeterLength(points: Array<{ x: number; z: number }>): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    total += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
  }
  return total;
}

/**
 * Get position and angle on perimeter from normalized position (0-1)
 */
export function getPositionOnPerimeter(
  wallPosition: number,
  perimeter: Array<{ x: number; z: number }>
): { x: number; z: number; angle: number } {
  if (perimeter.length < 2) {
    return { x: 0, z: 0, angle: 0 };
  }

  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < perimeter.length; i++) {
    const p1 = perimeter[i];
    const p2 = perimeter[(i + 1) % perimeter.length];
    const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    segmentLengths.push(len);
    totalLength += len;
  }

  const targetDistance = wallPosition * totalLength;
  let accumulated = 0;

  for (let i = 0; i < perimeter.length; i++) {
    const segmentLength = segmentLengths[i];
    
    if (accumulated + segmentLength >= targetDistance) {
      const p1 = perimeter[i];
      const p2 = perimeter[(i + 1) % perimeter.length];
      const t = (targetDistance - accumulated) / segmentLength;
      
      const x = p1.x + t * (p2.x - p1.x);
      const z = p1.z + t * (p2.z - p1.z);
      
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const angle = Math.atan2(dz, dx) + Math.PI / 2;
      
      return { x, z, angle };
    }
    
    accumulated += segmentLength;
  }

  return { x: perimeter[0].x, z: perimeter[0].z, angle: 0 };
}

/**
 * Find closest wall position from a 3D point
 */
export function getWallPositionFromPoint(
  point: THREE.Vector3,
  perimeter: Array<{ x: number; z: number }>
): number {
  if (perimeter.length < 2) return 0;

  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < perimeter.length; i++) {
    const p1 = perimeter[i];
    const p2 = perimeter[(i + 1) % perimeter.length];
    const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    segmentLengths.push(len);
    totalLength += len;
  }

  let minDist = Infinity;
  let closestPosition = 0;
  let accumulated = 0;

  for (let i = 0; i < perimeter.length; i++) {
    const p1 = perimeter[i];
    const p2 = perimeter[(i + 1) % perimeter.length];
    const segmentLength = segmentLengths[i];

    const segmentDx = p2.x - p1.x;
    const segmentDz = p2.z - p1.z;
    const lengthSq = segmentDx ** 2 + segmentDz ** 2;
    
    if (lengthSq === 0) {
      accumulated += segmentLength;
      continue;
    }

    const t = Math.max(0, Math.min(1,
      ((point.x - p1.x) * segmentDx + (point.z - p1.z) * segmentDz) / lengthSq
    ));

    const projX = p1.x + t * segmentDx;
    const projZ = p1.z + t * segmentDz;
    const dist = Math.sqrt((point.x - projX) ** 2 + (point.z - projZ) ** 2);

    if (dist < minDist) {
      minDist = dist;
      closestPosition = (accumulated + t * segmentLength) / totalLength;
    }

    accumulated += segmentLength;
  }

  return Math.max(0, Math.min(1, closestPosition));
}
