import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { PoolStairConfig } from './poolAssetTypes';

interface DraggablePoolStairProps {
  stair: PoolStairConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (stairId: string, wallPosition: number) => void;
  isSelected: boolean;
  onSelect: (stairId: string) => void;
  poolDepth: number;
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
      
      // Calculate inward-facing angle
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const angle = Math.atan2(dz, dx) + Math.PI / 2;
      
      return { x, z, angle };
    }
    
    accumulated += segmentLength;
  }

  return { x: perimeter[0].x, z: perimeter[0].z, angle: 0 };
}

// Find closest wallPosition from a 3D point
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

export function DraggablePoolStair({
  stair,
  poolPerimeter,
  onPositionChange,
  isSelected,
  onSelect,
  poolDepth
}: DraggablePoolStairProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Load texture
  const texture = useTexture(stair.textureUrl);
  
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(0.5, 0.5);
    }
  }, [texture]);

  // Calculate current position on wall
  const position = getPositionOnPerimeter(stair.wallPosition, poolPerimeter);

  // Calculate inward direction (into pool)
  const inwardDir = useMemo(() => ({
    x: Math.cos(position.angle),
    z: Math.sin(position.angle)
  }), [position.angle]);

  // Generate solid stair geometry that reaches the floor
  const stairMeshes = useMemo(() => {
    const meshes: JSX.Element[] = [];
    const stepWidth = stair.width;
    const stepDepth = stair.stepDepth;
    const stepHeight = stair.stepHeight;
    const numSteps = stair.numSteps;
    const cornerRadius = stair.cornerRadius || 0;
    
    // Calculate total height needed to reach floor
    const totalStairHeight = poolDepth;
    
    for (let i = 0; i < numSteps; i++) {
      // Each step is a solid block from its top surface down to the pool floor
      const stepTop = -i * stepHeight; // Y position of step top
      const stepBottom = -poolDepth; // Always extends to pool floor
      const blockHeight = stepTop - stepBottom;
      
      // Z offset - steps go inward into the pool
      const zOffset = i * stepDepth;
      
      if (stair.shape === 'curved' && cornerRadius > 0) {
        // Create curved step with rounded front corners
        const shape = new THREE.Shape();
        const r = Math.min(cornerRadius, stepWidth / 4, stepDepth / 2);
        const w = stepWidth / 2;
        const d = stepDepth;
        
        // Start from back-left, go clockwise
        shape.moveTo(-w, 0);
        shape.lineTo(-w, d - r);
        shape.quadraticCurveTo(-w, d, -w + r, d);
        shape.lineTo(w - r, d);
        shape.quadraticCurveTo(w, d, w, d - r);
        shape.lineTo(w, 0);
        shape.lineTo(-w, 0);
        
        const extrudeSettings = { 
          depth: blockHeight, 
          bevelEnabled: false 
        };
        
        meshes.push(
          <mesh 
            key={`step-${i}`}
            position={[0, stepTop, zOffset]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <extrudeGeometry args={[shape, extrudeSettings]} />
            <meshStandardMaterial 
              map={texture} 
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        );
      } else {
        // Linear step - simple box
        meshes.push(
          <mesh 
            key={`step-${i}`}
            position={[0, stepTop - blockHeight / 2, zOffset + stepDepth / 2]}
          >
            <boxGeometry args={[stepWidth, blockHeight, stepDepth]} />
            <meshStandardMaterial 
              map={texture} 
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
        );
      }
    }
    
    return meshes;
  }, [stair, texture, poolDepth]);

  // Handle pointer events
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(stair.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    dragPlaneRef.current.constant = 0;
  }, [stair.id, onSelect, gl.domElement]);

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
        const newWallPosition = getWallPositionFromPoint(intersectPoint, poolPerimeter);
        onPositionChange(stair.id, newWallPosition);
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
  }, [isDragging, camera, gl.domElement, poolPerimeter, stair.id, onPositionChange]);

  // Offset stairs slightly inward from wall so they're fully inside pool
  const inwardOffset = 0.1; // Small offset to ensure stairs are inside

  return (
    <group
      ref={groupRef}
      position={[
        position.x + inwardDir.x * inwardOffset,
        0,
        position.z + inwardDir.z * inwardOffset
      ]}
      rotation={[0, position.angle, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
      onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      {/* Render solid stair steps */}
      {stairMeshes}
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0.05, stair.stepDepth * stair.numSteps / 2]}>
          <boxGeometry args={[stair.width + 0.2, 0.05, stair.stepDepth * stair.numSteps + 0.2]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
