import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { ContourSeatingConfig } from './poolAssetTypes';

interface ContourSeatingProps {
  seating: ContourSeatingConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (id: string, startPosition: number, endPosition: number) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  getFloorDepthAt: (x: number, z: number) => number;
}

// Get points along perimeter between start and end positions
function getPerimeterSection(
  startPos: number,
  endPos: number,
  perimeter: Array<{ x: number; z: number }>,
  resolution: number = 20
): Array<{ x: number; z: number; angle: number }> {
  if (perimeter.length < 2) return [];

  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < perimeter.length; i++) {
    const p1 = perimeter[i];
    const p2 = perimeter[(i + 1) % perimeter.length];
    const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    segmentLengths.push(len);
    totalLength += len;
  }

  const points: Array<{ x: number; z: number; angle: number }> = [];
  const step = (endPos - startPos) / resolution;

  for (let t = 0; t <= resolution; t++) {
    const pos = startPos + t * step;
    const targetDistance = pos * totalLength;
    let accumulated = 0;

    for (let i = 0; i < perimeter.length; i++) {
      const segmentLength = segmentLengths[i];
      
      if (accumulated + segmentLength >= targetDistance) {
        const p1 = perimeter[i];
        const p2 = perimeter[(i + 1) % perimeter.length];
        const segT = (targetDistance - accumulated) / segmentLength;
        
        const x = p1.x + segT * (p2.x - p1.x);
        const z = p1.z + segT * (p2.z - p1.z);
        
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const angle = Math.atan2(dz, dx) + Math.PI / 2;
        
        points.push({ x, z, angle });
        break;
      }
      
      accumulated += segmentLength;
    }
  }

  return points;
}

export function ContourSeating({
  seating,
  poolPerimeter,
  onPositionChange,
  isSelected,
  onSelect,
  getFloorDepthAt
}: ContourSeatingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { gl } = useThree();

  const texture = useTexture(seating.textureUrl);
  
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    }
  }, [texture]);

  // Generate wall meshes using pool-wall-style UV mapping (cumulative perimeter distance)
  const { wallMeshes, topMesh, endCaps } = useMemo(() => {
    const perimeterPoints = getPerimeterSection(
      seating.startPosition,
      seating.endPosition,
      poolPerimeter,
      30 // Higher resolution for smooth contour
    );

    if (perimeterPoints.length < 2) {
      return { wallMeshes: [], topMesh: null, endCaps: [] };
    }

    const topBelowWater = seating.height;
    const wallMeshes: Array<{
      vertices: number[];
      uvs: number[];
      indices: number[];
      position: [number, number, number];
    }> = [];

    // Track cumulative perimeter distance for UV mapping (like pool walls)
    let cumulativeDistance = 0;

    // Create wall segments with pool-wall-style cumulative UV mapping
    for (let i = 0; i < perimeterPoints.length - 1; i++) {
      const pt1 = perimeterPoints[i];
      const pt2 = perimeterPoints[i + 1];

      const segmentLength = Math.sqrt((pt2.x - pt1.x) ** 2 + (pt2.z - pt1.z) ** 2);
      if (segmentLength < 0.01) continue;
      
      const depth1 = getFloorDepthAt(pt1.x, pt1.z);
      const depth2 = getFloorDepthAt(pt2.x, pt2.z);
      
      const topY = -topBelowWater;
      const bottomY1 = -depth1;
      const bottomY2 = -depth2;
      const wallHeight = Math.max(Math.abs(topY - bottomY1), Math.abs(topY - bottomY2));
      if (wallHeight < 0.01) continue;

      // OUTER WALL - custom geometry with pool-wall UV pattern
      const outerVerts: number[] = [];
      const outerUVs: number[] = [];
      const outerIndices: number[] = [];
      
      // 4 vertices for the quad: top-left, top-right, bottom-left, bottom-right
      outerVerts.push(pt1.x, topY, pt1.z);        // 0: top-left
      outerVerts.push(pt2.x, topY, pt2.z);        // 1: top-right  
      outerVerts.push(pt1.x, bottomY1, pt1.z);    // 2: bottom-left
      outerVerts.push(pt2.x, bottomY2, pt2.z);    // 3: bottom-right
      
      // UV mapping like pool walls: U = cumulative distance, V = depth
      const avgDepth = (depth1 + depth2) / 2;
      outerUVs.push(cumulativeDistance, avgDepth);                    // 0
      outerUVs.push(cumulativeDistance + segmentLength, avgDepth);    // 1
      outerUVs.push(cumulativeDistance, 0);                           // 2
      outerUVs.push(cumulativeDistance + segmentLength, 0);           // 3
      
      outerIndices.push(0, 3, 1, 0, 2, 3);
      
      wallMeshes.push({
        vertices: outerVerts,
        uvs: outerUVs,
        indices: outerIndices,
        position: [0, 0, 0]
      });

      // INNER WALL - offset by seating width
      const inX1 = pt1.x + Math.cos(pt1.angle) * seating.width;
      const inZ1 = pt1.z + Math.sin(pt1.angle) * seating.width;
      const inX2 = pt2.x + Math.cos(pt2.angle) * seating.width;
      const inZ2 = pt2.z + Math.sin(pt2.angle) * seating.width;

      const innerVerts: number[] = [];
      const innerUVs: number[] = [];
      const innerIndices: number[] = [];
      
      innerVerts.push(inX2, topY, inZ2);          // 0: top-left (reversed for inward normal)
      innerVerts.push(inX1, topY, inZ1);          // 1: top-right
      innerVerts.push(inX2, bottomY2, inZ2);      // 2: bottom-left
      innerVerts.push(inX1, bottomY1, inZ1);      // 3: bottom-right
      
      innerUVs.push(cumulativeDistance + segmentLength, avgDepth);
      innerUVs.push(cumulativeDistance, avgDepth);
      innerUVs.push(cumulativeDistance + segmentLength, 0);
      innerUVs.push(cumulativeDistance, 0);
      
      innerIndices.push(0, 3, 1, 0, 2, 3);
      
      wallMeshes.push({
        vertices: innerVerts,
        uvs: innerUVs,
        indices: innerIndices,
        position: [0, 0, 0]
      });

      cumulativeDistance += segmentLength;
    }

    // Create TOP surface using Shape
    const outerPath: Array<{ x: number; z: number }> = [];
    const innerPath: Array<{ x: number; z: number }> = [];

    for (const pt of perimeterPoints) {
      outerPath.push({ x: pt.x, z: pt.z });
      innerPath.push({
        x: pt.x + Math.cos(pt.angle) * seating.width,
        z: pt.z + Math.sin(pt.angle) * seating.width
      });
    }

    let topMesh: { geometry: THREE.BufferGeometry; position: [number, number, number] } | null = null;

    if (outerPath.length > 1) {
      const shape = new THREE.Shape();
      shape.moveTo(outerPath[0].x, outerPath[0].z);
      for (let i = 1; i < outerPath.length; i++) {
        shape.lineTo(outerPath[i].x, outerPath[i].z);
      }
      for (let i = innerPath.length - 1; i >= 0; i--) {
        shape.lineTo(innerPath[i].x, innerPath[i].z);
      }
      shape.closePath();

      const topGeo = new THREE.ShapeGeometry(shape);
      const topUV = topGeo.getAttribute('uv');
      const topPos = topGeo.getAttribute('position');
      for (let i = 0; i < topUV.count; i++) {
        const x = topPos.getX(i);
        const z = topPos.getY(i);
        topUV.setXY(i, x, z); // 1ft = 1 UV unit
      }

      topMesh = {
        geometry: topGeo,
        position: [0, -topBelowWater, 0]
      };
    }

    // Create end caps with proper UV
    const endCaps: Array<{
      vertices: number[];
      uvs: number[];
      indices: number[];
    }> = [];

    if (perimeterPoints.length >= 2) {
      // Start cap
      const startPt = perimeterPoints[0];
      const startDepth = getFloorDepthAt(startPt.x, startPt.z);
      const startHeight = Math.abs(-topBelowWater - (-startDepth));
      
      if (startHeight > 0.01) {
        const inX = startPt.x + Math.cos(startPt.angle) * seating.width;
        const inZ = startPt.z + Math.sin(startPt.angle) * seating.width;
        
        const startVerts: number[] = [];
        const startUVs: number[] = [];
        
        startVerts.push(startPt.x, -topBelowWater, startPt.z);
        startVerts.push(inX, -topBelowWater, inZ);
        startVerts.push(startPt.x, -startDepth, startPt.z);
        startVerts.push(inX, -startDepth, inZ);
        
        startUVs.push(0, startHeight, seating.width, startHeight, 0, 0, seating.width, 0);
        
        endCaps.push({ vertices: startVerts, uvs: startUVs, indices: [0, 3, 1, 0, 2, 3] });
      }

      // End cap
      const endPt = perimeterPoints[perimeterPoints.length - 1];
      const endDepth = getFloorDepthAt(endPt.x, endPt.z);
      const endHeight = Math.abs(-topBelowWater - (-endDepth));
      
      if (endHeight > 0.01) {
        const inX = endPt.x + Math.cos(endPt.angle) * seating.width;
        const inZ = endPt.z + Math.sin(endPt.angle) * seating.width;
        
        const endVerts: number[] = [];
        const endUVs: number[] = [];
        
        endVerts.push(inX, -topBelowWater, inZ);
        endVerts.push(endPt.x, -topBelowWater, endPt.z);
        endVerts.push(inX, -endDepth, inZ);
        endVerts.push(endPt.x, -endDepth, endPt.z);
        
        endUVs.push(0, endHeight, seating.width, endHeight, 0, 0, seating.width, 0);
        
        endCaps.push({ vertices: endVerts, uvs: endUVs, indices: [0, 3, 1, 0, 2, 3] });
      }
    }

    return { wallMeshes, topMesh, endCaps };
  }, [seating, poolPerimeter, getFloorDepthAt]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(seating.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
  }, [seating.id, onSelect, gl.domElement]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    gl.domElement.style.cursor = 'auto';
  }, [gl.domElement]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointerup', handlePointerUp);
      return () => window.removeEventListener('pointerup', handlePointerUp);
    }
  }, [isDragging, handlePointerUp]);

  const materialProps = {
    map: texture,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
  };

  // Create geometries from vertex data
  const wallGeometries = useMemo(() => {
    return wallMeshes.map(wall => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(wall.vertices, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(wall.uvs, 2));
      geo.setIndex(wall.indices);
      geo.computeVertexNormals();
      return geo;
    });
  }, [wallMeshes]);

  const endCapGeometries = useMemo(() => {
    return endCaps.map(cap => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(cap.vertices, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(cap.uvs, 2));
      geo.setIndex(cap.indices);
      geo.computeVertexNormals();
      return geo;
    });
  }, [endCaps]);

  return (
    <group ref={groupRef}>
      {/* Wall segments with pool-wall-style UV */}
      {wallGeometries.map((geo, idx) => (
        <mesh
          key={`wall-${idx}`}
          geometry={geo}
          onPointerDown={handlePointerDown}
          onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
          onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
        >
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}

      {/* Top surface */}
      {topMesh && (
        <mesh
          geometry={topMesh.geometry}
          position={topMesh.position}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerDown={handlePointerDown}
        >
          <meshStandardMaterial {...materialProps} />
        </mesh>
      )}

      {/* End caps */}
      {endCapGeometries.map((geo, idx) => (
        <mesh
          key={`cap-${idx}`}
          geometry={geo}
        >
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, -seating.height + 0.05, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
