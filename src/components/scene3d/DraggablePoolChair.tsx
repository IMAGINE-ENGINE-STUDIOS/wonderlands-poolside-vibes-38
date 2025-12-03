import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { PoolChairConfig } from './poolAssetTypes';

interface DraggablePoolChairProps {
  chair: PoolChairConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (chairId: string, wallPosition: number, floorPosition?: { x: number; z: number }) => void;
  isSelected: boolean;
  onSelect: (chairId: string) => void;
  getFloorDepthAt: (x: number, z: number) => number;
}

// Calculate position on pool wall from wallPosition (0-1)
function getPositionOnPerimeter(
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
      
      // Offset inward from wall
      const inwardOffset = 0.3;
      const offsetX = x + Math.cos(angle) * inwardOffset;
      const offsetZ = z + Math.sin(angle) * inwardOffset;
      
      return { x: offsetX, z: offsetZ, angle };
    }
    
    accumulated += segmentLength;
  }

  return { x: perimeter[0].x, z: perimeter[0].z, angle: 0 };
}

function getWallPositionFromPoint(
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

export function DraggablePoolChair({
  chair,
  poolPerimeter,
  onPositionChange,
  isSelected,
  onSelect,
  getFloorDepthAt
}: DraggablePoolChairProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Load texture
  const texture = useTexture(chair.textureUrl);
  
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    }
  }, [texture]);

  // Calculate position
  const wallPos = getPositionOnPerimeter(chair.wallPosition, poolPerimeter);
  const posX = chair.snapToWall ? wallPos.x : (chair.floorPosition?.x || 0);
  const posZ = chair.snapToWall ? wallPos.z : (chair.floorPosition?.z || 0);
  const angle = chair.snapToWall ? wallPos.angle : 0;
  
  // Get floor depth at position - seating ALWAYS touches the bottom
  const floorDepth = getFloorDepthAt(posX, posZ);
  // Top surface is at desired depth below water (chair.height represents depth below water for top surface)
  const topBelowWater = chair.height;
  // Thickness extends from top surface to the pool floor - always touches bottom
  const chairThickness = Math.max(0.5, floorDepth - topBelowWater);
  const posY = -topBelowWater - chairThickness / 2; // Center of the chair mesh

  // Create proper UV-mapped box geometry to match pool wall texture
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(chair.width, chairThickness, chair.depth);
    const uvAttribute = geo.attributes.uv;
    const positionAttribute = geo.attributes.position;
    
    // Remap UVs to create 1ft x 1ft squares like pool walls
    for (let i = 0; i < uvAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      
      // Determine which face this vertex belongs to based on normal direction
      const faceIndex = Math.floor(i / 4);
      
      if (faceIndex < 2) {
        // Top/Bottom faces - use X and Z for UV
        uvAttribute.setXY(i, (x + chair.width / 2), (z + chair.depth / 2));
      } else if (faceIndex < 4) {
        // Front/Back faces - use X and Y for UV
        uvAttribute.setXY(i, (x + chair.width / 2), (y + chairThickness / 2));
      } else {
        // Left/Right faces - use Z and Y for UV
        uvAttribute.setXY(i, (z + chair.depth / 2), (y + chairThickness / 2));
      }
    }
    
    uvAttribute.needsUpdate = true;
    return geo;
  }, [chair.width, chair.depth, chairThickness]);

  // Handle pointer events
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(chair.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    dragPlaneRef.current.constant = -posY;
  }, [chair.id, onSelect, gl.domElement, posY]);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersectPoint = new THREE.Vector3();
      
      if (raycaster.current.ray.intersectPlane(dragPlaneRef.current, intersectPoint)) {
        if (chair.snapToWall) {
          const newWallPosition = getWallPositionFromPoint(intersectPoint, poolPerimeter);
          onPositionChange(chair.id, newWallPosition);
        } else {
          onPositionChange(chair.id, chair.wallPosition, { x: intersectPoint.x, z: intersectPoint.z });
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      gl.domElement.style.cursor = 'auto';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, camera, gl.domElement, poolPerimeter, chair, onPositionChange]);

  return (
    <group
      ref={groupRef}
      position={[posX, posY, posZ]}
      rotation={[0, angle, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
      onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      {/* Main chair body with proper UV mapping - matches pool wall texture */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, chairThickness / 2 + 0.05, 0]}>
          <boxGeometry args={[chair.width + 0.1, 0.05, chair.depth + 0.1]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
