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

  // Generate wall meshes using PlaneGeometry like pool walls for perfect UV
  const { wallMeshes, topMesh, endCaps } = useMemo(() => {
    const perimeterPoints = getPerimeterSection(
      seating.startPosition,
      seating.endPosition,
      poolPerimeter
    );

    if (perimeterPoints.length < 2) {
      return { wallMeshes: [], topMesh: null, endCaps: [] };
    }

    const topBelowWater = seating.height;
    const wallMeshes: Array<{
      geometry: THREE.BufferGeometry;
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [];

    // Create wall segments like pool walls - each gets its own PlaneGeometry
    for (let i = 0; i < perimeterPoints.length - 1; i++) {
      const pt1 = perimeterPoints[i];
      const pt2 = perimeterPoints[i + 1];

      const segmentLength = Math.sqrt((pt2.x - pt1.x) ** 2 + (pt2.z - pt1.z) ** 2);
      if (segmentLength < 0.01) continue;
      
      const depth1 = getFloorDepthAt(pt1.x, pt1.z);
      const depth2 = getFloorDepthAt(pt2.x, pt2.z);
      const avgDepth = (depth1 + depth2) / 2;
      
      const topY = -topBelowWater;
      const bottomY = -avgDepth;
      const wallHeight = Math.abs(topY - bottomY);
      if (wallHeight < 0.01) continue;

      // OUTER WALL - create plane with proper UV (1ft = 1 UV unit)
      const outerGeo = new THREE.PlaneGeometry(segmentLength, wallHeight);
      const outerUV = outerGeo.getAttribute('uv');
      for (let j = 0; j < outerUV.count; j++) {
        const u = outerUV.getX(j) * segmentLength;
        const v = outerUV.getY(j) * wallHeight;
        outerUV.setXY(j, u, v);
      }

      const cx = (pt1.x + pt2.x) / 2;
      const cz = (pt1.z + pt2.z) / 2;
      const cy = topY - wallHeight / 2;
      const wallAngle = Math.atan2(pt2.z - pt1.z, pt2.x - pt1.x);

      wallMeshes.push({
        geometry: outerGeo,
        position: [cx, cy, cz],
        rotation: [0, -wallAngle, 0]
      });

      // INNER WALL - offset by seating width
      const inX1 = pt1.x + Math.cos(pt1.angle) * seating.width;
      const inZ1 = pt1.z + Math.sin(pt1.angle) * seating.width;
      const inX2 = pt2.x + Math.cos(pt2.angle) * seating.width;
      const inZ2 = pt2.z + Math.sin(pt2.angle) * seating.width;

      const innerSegmentLength = Math.sqrt((inX2 - inX1) ** 2 + (inZ2 - inZ1) ** 2);
      if (innerSegmentLength < 0.01) continue;
      
      const innerGeo = new THREE.PlaneGeometry(innerSegmentLength, wallHeight);
      const innerUV = innerGeo.getAttribute('uv');
      for (let j = 0; j < innerUV.count; j++) {
        const u = innerUV.getX(j) * innerSegmentLength;
        const v = innerUV.getY(j) * wallHeight;
        innerUV.setXY(j, u, v);
      }

      const inCx = (inX1 + inX2) / 2;
      const inCz = (inZ1 + inZ2) / 2;
      const innerAngle = Math.atan2(inZ2 - inZ1, inX2 - inX1);

      wallMeshes.push({
        geometry: innerGeo,
        position: [inCx, cy, inCz],
        rotation: [0, -innerAngle + Math.PI, 0]
      });
    }

    // Create TOP surface using Shape for accurate contour
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
      // Apply 1ft x 1ft UV mapping
      const topUV = topGeo.getAttribute('uv');
      const topPos = topGeo.getAttribute('position');
      for (let i = 0; i < topUV.count; i++) {
        const x = topPos.getX(i);
        const z = topPos.getY(i);
        topUV.setXY(i, x, z);
      }

      topMesh = {
        geometry: topGeo,
        position: [0, -topBelowWater, 0]
      };
    }

    // Create end caps
    const endCaps: Array<{
      geometry: THREE.BufferGeometry;
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [];

    if (perimeterPoints.length >= 2) {
      // Start cap
      const startPt = perimeterPoints[0];
      const startDepth = getFloorDepthAt(startPt.x, startPt.z);
      const startHeight = Math.abs(-topBelowWater - (-startDepth));
      
      if (startHeight > 0.01) {
        const startCapGeo = new THREE.PlaneGeometry(seating.width, startHeight);
        const startCapUV = startCapGeo.getAttribute('uv');
        for (let j = 0; j < startCapUV.count; j++) {
          startCapUV.setXY(j, startCapUV.getX(j) * seating.width, startCapUV.getY(j) * startHeight);
        }
        
        endCaps.push({
          geometry: startCapGeo,
          position: [
            startPt.x + Math.cos(startPt.angle) * seating.width / 2,
            -topBelowWater - startHeight / 2,
            startPt.z + Math.sin(startPt.angle) * seating.width / 2
          ],
          rotation: [0, -startPt.angle + Math.PI / 2, 0]
        });
      }

      // End cap
      const endPt = perimeterPoints[perimeterPoints.length - 1];
      const endDepth = getFloorDepthAt(endPt.x, endPt.z);
      const endHeight = Math.abs(-topBelowWater - (-endDepth));
      
      if (endHeight > 0.01) {
        const endCapGeo = new THREE.PlaneGeometry(seating.width, endHeight);
        const endCapUV = endCapGeo.getAttribute('uv');
        for (let j = 0; j < endCapUV.count; j++) {
          endCapUV.setXY(j, endCapUV.getX(j) * seating.width, endCapUV.getY(j) * endHeight);
        }
        
        endCaps.push({
          geometry: endCapGeo,
          position: [
            endPt.x + Math.cos(endPt.angle) * seating.width / 2,
            -topBelowWater - endHeight / 2,
            endPt.z + Math.sin(endPt.angle) * seating.width / 2
          ],
          rotation: [0, -endPt.angle - Math.PI / 2, 0]
        });
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

  return (
    <group ref={groupRef}>
      {/* Wall segments with proper UV */}
      {wallMeshes.map((wall, idx) => (
        <mesh
          key={`wall-${idx}`}
          geometry={wall.geometry}
          position={wall.position}
          rotation={wall.rotation}
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
      {endCaps.map((cap, idx) => (
        <mesh
          key={`cap-${idx}`}
          geometry={cap.geometry}
          position={cap.position}
          rotation={cap.rotation}
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
