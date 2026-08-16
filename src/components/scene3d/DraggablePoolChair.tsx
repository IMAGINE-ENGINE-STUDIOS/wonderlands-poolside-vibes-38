import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTiledTexture } from '@/hooks/useTiledTexture';
import { PoolChairConfig } from './poolAssetTypes';
import { getPositionOnPerimeter, getWallPositionFromPoint } from '@/utils/poolWallMeshUtils';

interface DraggablePoolChairProps {
  chair: PoolChairConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (chairId: string, wallPosition: number, floorPosition?: { x: number; z: number }) => void;
  isSelected: boolean;
  onSelect: (chairId: string) => void;
  getFloorDepthAt: (x: number, z: number) => number;
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
  const texture = useTiledTexture(chair.textureUrl);

  // Calculate position with inward offset
  const wallPos = useMemo(() => {
    const pos = getPositionOnPerimeter(chair.wallPosition, poolPerimeter);
    // Offset inward from wall
    const inwardOffset = 0.3;
    return {
      x: pos.x + Math.cos(pos.angle) * inwardOffset,
      z: pos.z + Math.sin(pos.angle) * inwardOffset,
      angle: pos.angle
    };
  }, [chair.wallPosition, poolPerimeter]);
  
  const posX = chair.snapToWall ? wallPos.x : (chair.floorPosition?.x || 0);
  const posZ = chair.snapToWall ? wallPos.z : (chair.floorPosition?.z || 0);
  const angle = chair.snapToWall ? wallPos.angle : 0;
  
  // Get floor depth at position - seating ALWAYS touches the bottom
  const floorDepth = getFloorDepthAt(posX, posZ);
  const topBelowWater = chair.height;
  const chairThickness = Math.max(0.5, floorDepth - topBelowWater);
  const topY = -topBelowWater;
  const bottomY = -floorDepth;

  // Create custom BufferGeometry with proper UV mapping (like CopingGeometry)
  const geometry = useMemo(() => {
    const hw = chair.width / 2;
    const hd = chair.depth / 2;
    const height = chairThickness;
    
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    // TOP face - world-space UV
    let baseIdx = vertices.length / 3;
    vertices.push(
      -hw, topY, -hd,
      hw, topY, -hd,
      hw, topY, hd,
      -hw, topY, hd
    );
    uvs.push(
      -hw, -hd,
      hw, -hd,
      hw, hd,
      -hw, hd
    );
    indices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx, baseIdx + 3, baseIdx + 2);
    
    // BOTTOM face - world-space UV
    baseIdx = vertices.length / 3;
    vertices.push(
      -hw, bottomY, hd,
      hw, bottomY, hd,
      hw, bottomY, -hd,
      -hw, bottomY, -hd
    );
    uvs.push(
      -hw, hd,
      hw, hd,
      hw, -hd,
      -hw, -hd
    );
    indices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx, baseIdx + 3, baseIdx + 2);
    
    // FRONT face (Z+) - cumulative distance UV
    baseIdx = vertices.length / 3;
    vertices.push(
      -hw, topY, hd,
      hw, topY, hd,
      hw, bottomY, hd,
      -hw, bottomY, hd
    );
    uvs.push(
      0, height,
      chair.width, height,
      chair.width, 0,
      0, 0
    );
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
    
    // BACK face (Z-) - cumulative distance UV
    baseIdx = vertices.length / 3;
    vertices.push(
      hw, topY, -hd,
      -hw, topY, -hd,
      -hw, bottomY, -hd,
      hw, bottomY, -hd
    );
    uvs.push(
      0, height,
      chair.width, height,
      chair.width, 0,
      0, 0
    );
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
    
    // RIGHT face (X+) - cumulative distance UV
    baseIdx = vertices.length / 3;
    vertices.push(
      hw, topY, hd,
      hw, topY, -hd,
      hw, bottomY, -hd,
      hw, bottomY, hd
    );
    uvs.push(
      0, height,
      chair.depth, height,
      chair.depth, 0,
      0, 0
    );
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
    
    // LEFT face (X-) - cumulative distance UV
    baseIdx = vertices.length / 3;
    vertices.push(
      -hw, topY, -hd,
      -hw, topY, hd,
      -hw, bottomY, hd,
      -hw, bottomY, -hd
    );
    uvs.push(
      0, height,
      chair.depth, height,
      chair.depth, 0,
      0, 0
    );
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
  }, [chair.width, chair.depth, chairThickness, topY, bottomY]);

  // Handle pointer events
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(chair.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    dragPlaneRef.current.constant = topBelowWater;
  }, [chair.id, onSelect, gl.domElement, topBelowWater]);

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
      position={[posX, 0, posZ]}
      rotation={[0, angle, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
      onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, topY + 0.05, 0]}>
          <boxGeometry args={[chair.width + 0.1, 0.05, chair.depth + 0.1]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
