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

  // Calculate total perimeter length and segment lengths
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
        
        // Calculate inward-facing angle
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
  const { camera, gl } = useThree();

  // Load texture with pool-wall-like settings
  const texture = useTexture(seating.textureUrl);
  
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1); // 1ft = 1 texture unit
    }
  }, [texture]);

  // Generate contour seating geometry with proper pool-wall-like UV mapping
  const geometry = useMemo(() => {
    const perimeterPoints = getPerimeterSection(
      seating.startPosition,
      seating.endPosition,
      poolPerimeter
    );

    if (perimeterPoints.length < 2) return null;

    // Create shape that follows the pool wall contour
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Calculate cumulative distance along the perimeter for proper UV mapping
    const cumulativeDistances: number[] = [0];
    for (let i = 1; i < perimeterPoints.length; i++) {
      const prev = perimeterPoints[i - 1];
      const curr = perimeterPoints[i];
      const dist = Math.sqrt((curr.x - prev.x) ** 2 + (curr.z - prev.z) ** 2);
      cumulativeDistances.push(cumulativeDistances[i - 1] + dist);
    }
    const totalLength = cumulativeDistances[cumulativeDistances.length - 1];

    // For each point along the perimeter, create inner and outer vertices
    const topBelowWater = seating.height;

    for (let i = 0; i < perimeterPoints.length; i++) {
      const pt = perimeterPoints[i];
      const floorDepth = getFloorDepthAt(pt.x, pt.z);
      const topY = -topBelowWater;
      const bottomY = -floorDepth; // Always touch the floor
      const wallHeight = Math.abs(topY - bottomY);

      // Inward direction
      const inX = Math.cos(pt.angle);
      const inZ = Math.sin(pt.angle);

      // Outer edge (at wall)
      const ox = pt.x;
      const oz = pt.z;
      
      // Inner edge (into pool)
      const ix = pt.x + inX * seating.width;
      const iz = pt.z + inZ * seating.width;

      // UV mapping: U based on distance along perimeter (1ft = 1 UV unit)
      // V based on height (1ft = 1 UV unit) - like pool walls
      const uCoord = cumulativeDistances[i]; // Distance in feet = UV coordinate

      // Add 4 vertices per point: outer-top, outer-bottom, inner-top, inner-bottom
      // Outer top
      vertices.push(ox, topY, oz);
      uvs.push(uCoord, 0);
      
      // Outer bottom  
      vertices.push(ox, bottomY, oz);
      uvs.push(uCoord, wallHeight);
      
      // Inner top - offset UV for inner face
      vertices.push(ix, topY, iz);
      uvs.push(uCoord, 0);
      
      // Inner bottom
      vertices.push(ix, bottomY, iz);
      uvs.push(uCoord, wallHeight);

      // Create faces connecting to previous point
      if (i > 0) {
        const base = (i - 1) * 4;
        const curr = i * 4;

        // Top face - UV based on actual dimensions (1ft squares)
        indices.push(base + 0, base + 2, curr + 2);
        indices.push(base + 0, curr + 2, curr + 0);

        // Bottom face
        indices.push(base + 3, base + 1, curr + 1);
        indices.push(base + 3, curr + 1, curr + 3);

        // Outer wall (visible from outside pool)
        indices.push(base + 0, curr + 0, curr + 1);
        indices.push(base + 0, curr + 1, base + 1);

        // Inner wall (visible from inside pool)
        indices.push(base + 2, base + 3, curr + 3);
        indices.push(base + 2, curr + 3, curr + 2);
      }
    }

    // End caps with proper UV
    if (perimeterPoints.length >= 2) {
      // Start cap
      indices.push(0, 1, 3);
      indices.push(0, 3, 2);
      
      // End cap
      const last = (perimeterPoints.length - 1) * 4;
      indices.push(last + 2, last + 3, last + 1);
      indices.push(last + 2, last + 1, last + 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [seating, poolPerimeter, getFloorDepthAt]);

  // Handle pointer events
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

  if (!geometry) return null;

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
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh geometry={geometry} position={[0, 0.05, 0]}>
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}
