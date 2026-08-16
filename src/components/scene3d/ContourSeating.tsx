import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTiledTexture } from '@/hooks/useTiledTexture';
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

  const texture = useTiledTexture(seating.textureUrl);

  // Generate geometry with proper 1ft x 1ft UV mapping like pool walls
  const geometry = useMemo(() => {
    const perimeterPoints = getPerimeterSection(
      seating.startPosition,
      seating.endPosition,
      poolPerimeter,
      30
    );

    if (perimeterPoints.length < 2) {
      return new THREE.BufferGeometry();
    }

    const topBelowWater = seating.height;
    const topY = -topBelowWater;
    
    // Calculate inner boundary (offset by seating width)
    const innerPoints = perimeterPoints.map(pt => ({
      x: pt.x + Math.cos(pt.angle) * seating.width,
      z: pt.z + Math.sin(pt.angle) * seating.width,
      angle: pt.angle
    }));

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    const numPoints = perimeterPoints.length;
    
    // Calculate cumulative distances for UV mapping (1ft = 1 UV unit)
    const outerDistances: number[] = [0];
    const innerDistances: number[] = [0];
    let outerTotalDist = 0;
    let innerTotalDist = 0;
    
    for (let i = 0; i < numPoints - 1; i++) {
      const op1 = perimeterPoints[i];
      const op2 = perimeterPoints[i + 1];
      const outerSegLen = Math.sqrt((op2.x - op1.x) ** 2 + (op2.z - op1.z) ** 2);
      outerTotalDist += outerSegLen;
      outerDistances.push(outerTotalDist);
      
      const ip1 = innerPoints[i];
      const ip2 = innerPoints[i + 1];
      const innerSegLen = Math.sqrt((ip2.x - ip1.x) ** 2 + (ip2.z - ip1.z) ** 2);
      innerTotalDist += innerSegLen;
      innerDistances.push(innerTotalDist);
    }

    // TOP SURFACE - world-space UV for perfect 1ft grid
    for (let i = 0; i < numPoints; i++) {
      const outer = perimeterPoints[i];
      const inner = innerPoints[i];
      
      vertices.push(outer.x, topY, outer.z);
      vertices.push(inner.x, topY, inner.z);
      
      // World-space UV for 1ft x 1ft pattern
      uvs.push(outer.x, outer.z);
      uvs.push(inner.x, inner.z);
    }
    
    // Top surface triangles
    for (let i = 0; i < numPoints - 1; i++) {
      const outerIdx = i * 2;
      const innerIdx = i * 2 + 1;
      const nextOuterIdx = (i + 1) * 2;
      const nextInnerIdx = (i + 1) * 2 + 1;
      
      indices.push(outerIdx, nextOuterIdx, innerIdx);
      indices.push(innerIdx, nextOuterIdx, nextInnerIdx);
    }

    // OUTER WALL - cumulative distance UV (1ft = 1 UV unit)
    const outerWallBase = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const pt = perimeterPoints[i];
      const bottomY = -getFloorDepthAt(pt.x, pt.z);
      const height = Math.abs(topY - bottomY);
      
      vertices.push(pt.x, topY, pt.z);
      vertices.push(pt.x, bottomY, pt.z);
      
      // UV: cumulative distance along perimeter, height
      uvs.push(outerDistances[i], height);
      uvs.push(outerDistances[i], 0);
    }
    
    // Outer wall triangles (facing outward)
    for (let i = 0; i < numPoints - 1; i++) {
      const topIdx = outerWallBase + i * 2;
      const bottomIdx = outerWallBase + i * 2 + 1;
      const nextTopIdx = outerWallBase + (i + 1) * 2;
      const nextBottomIdx = outerWallBase + (i + 1) * 2 + 1;
      
      indices.push(topIdx, bottomIdx, nextTopIdx);
      indices.push(bottomIdx, nextBottomIdx, nextTopIdx);
    }

    // INNER WALL - cumulative distance UV
    const innerWallBase = vertices.length / 3;
    for (let i = 0; i < numPoints; i++) {
      const pt = innerPoints[i];
      const outerPt = perimeterPoints[i];
      const bottomY = -getFloorDepthAt(outerPt.x, outerPt.z);
      const height = Math.abs(topY - bottomY);
      
      vertices.push(pt.x, topY, pt.z);
      vertices.push(pt.x, bottomY, pt.z);
      
      uvs.push(innerDistances[i], height);
      uvs.push(innerDistances[i], 0);
    }
    
    // Inner wall triangles (facing inward)
    for (let i = 0; i < numPoints - 1; i++) {
      const topIdx = innerWallBase + i * 2;
      const bottomIdx = innerWallBase + i * 2 + 1;
      const nextTopIdx = innerWallBase + (i + 1) * 2;
      const nextBottomIdx = innerWallBase + (i + 1) * 2 + 1;
      
      indices.push(topIdx, nextTopIdx, bottomIdx);
      indices.push(bottomIdx, nextTopIdx, nextBottomIdx);
    }

    // START END CAP
    const startOuter = perimeterPoints[0];
    const startInner = innerPoints[0];
    const startBottomY = -getFloorDepthAt(startOuter.x, startOuter.z);
    const startHeight = Math.abs(topY - startBottomY);
    
    if (startHeight > 0.01) {
      const startCapBase = vertices.length / 3;
      
      vertices.push(startOuter.x, topY, startOuter.z);
      vertices.push(startInner.x, topY, startInner.z);
      vertices.push(startOuter.x, startBottomY, startOuter.z);
      vertices.push(startInner.x, startBottomY, startInner.z);
      
      // UV for end cap - width x height
      uvs.push(0, startHeight);
      uvs.push(seating.width, startHeight);
      uvs.push(0, 0);
      uvs.push(seating.width, 0);
      
      indices.push(startCapBase, startCapBase + 1, startCapBase + 3);
      indices.push(startCapBase, startCapBase + 3, startCapBase + 2);
    }

    // END END CAP
    const endOuter = perimeterPoints[numPoints - 1];
    const endInner = innerPoints[numPoints - 1];
    const endBottomY = -getFloorDepthAt(endOuter.x, endOuter.z);
    const endHeight = Math.abs(topY - endBottomY);
    
    if (endHeight > 0.01) {
      const endCapBase = vertices.length / 3;
      
      vertices.push(endInner.x, topY, endInner.z);
      vertices.push(endOuter.x, topY, endOuter.z);
      vertices.push(endInner.x, endBottomY, endInner.z);
      vertices.push(endOuter.x, endBottomY, endOuter.z);
      
      uvs.push(0, endHeight);
      uvs.push(seating.width, endHeight);
      uvs.push(0, 0);
      uvs.push(seating.width, 0);
      
      indices.push(endCapBase, endCapBase + 1, endCapBase + 3);
      indices.push(endCapBase, endCapBase + 3, endCapBase + 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
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

  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometry}
        onPointerDown={handlePointerDown}
        onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
        onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
      >
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {isSelected && (
        <mesh position={[0, -seating.height + 0.05, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
