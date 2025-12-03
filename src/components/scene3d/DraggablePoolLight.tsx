import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { PoolLightConfig } from './types';

interface DraggablePoolLightProps {
  light: PoolLightConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (lightId: string, wallPosition: number) => void;
  isSelected: boolean;
  onSelect: (lightId: string) => void;
  gradientHue: number; // For synchronized gradient animation
}

// Calculate position on pool wall from wallPosition (0-1)
function getPositionOnPerimeter(
  wallPosition: number,
  perimeter: Array<{ x: number; z: number }>,
  depthFromSurface: number
): { x: number; y: number; z: number; angle: number } {
  if (perimeter.length < 2) {
    return { x: 0, y: -depthFromSurface, z: 0, angle: 0 };
  }

  // Calculate total perimeter length
  let totalLength = 0;
  const segmentLengths: number[] = [];
  
  for (let i = 0; i < perimeter.length; i++) {
    const p1 = perimeter[i];
    const p2 = perimeter[(i + 1) % perimeter.length];
    const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    segmentLengths.push(len);
    totalLength += len;
  }

  // Find position along perimeter
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
      
      // No offset - light sits directly on wall surface
      return { x, y: -depthFromSurface, z, angle };
    }
    
    accumulated += segmentLength;
  }

  // Fallback to first point
  return { x: perimeter[0].x, y: -depthFromSurface, z: perimeter[0].z, angle: 0 };
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

    // Project point onto segment
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

export function DraggablePoolLight({
  light,
  poolPerimeter,
  onPositionChange,
  isSelected,
  onSelect,
  gradientHue
}: DraggablePoolLightProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Calculate current position
  const position = getPositionOnPerimeter(
    light.wallPosition,
    poolPerimeter,
    light.depthFromSurface
  );

  // Get current light color
  const currentColor = light.colorMode === 'gradient'
    ? `hsl(${gradientHue}, 100%, 50%)`
    : light.color;

  // Handle pointer down
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(light.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    
    // Set drag plane at light's Y position
    dragPlaneRef.current.constant = -position.y;
  }, [light.id, onSelect, gl.domElement, position.y]);

  // Handle pointer move (global)
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
        onPositionChange(light.id, newWallPosition);
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
  }, [isDragging, camera, gl.domElement, poolPerimeter, light.id, onPositionChange]);

  // Calculate inward direction for light projection (into pool)
  // Apply user angle offset for direction control
  const angleOffset = ((light.angle || 0) * Math.PI) / 180; // Convert degrees to radians
  const adjustedAngle = position.angle + angleOffset;
  
  const inwardDir = {
    x: Math.cos(adjustedAngle),
    z: Math.sin(adjustedAngle)
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
      onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      {/* Light housing - rotated to face INTO the pool with angle adjustment */}
      <group rotation={[0, adjustedAngle, 0]}>
        {/* Outer ring - 2 inch diameter (0.167 ft), 0.5 inch thick - rotated 90° on X to face inward */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.083, 0.021, 8, 24]} />
          <meshStandardMaterial
            color={isSelected ? '#ffff00' : '#888888'}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        
        {/* Inner light lens - 1 inch diameter, facing into pool center */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[0.02, 0, 0]}>
          <circleGeometry args={[0.042, 24]} />
          <meshStandardMaterial
            color={light.isOn ? currentColor : '#333333'}
            emissive={light.isOn ? currentColor : '#000000'}
            emissiveIntensity={light.isOn ? 3.0 : 0}
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Selection indicator ring */}
        {isSelected && (
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.12, 0.14, 32]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
      
      {/* Point light with angle-adjusted direction */}
      {light.isOn && (
        <pointLight
          color={currentColor}
          intensity={light.intensity * 3}
          distance={20}
          decay={2}
          position={[inwardDir.x * 0.1, 0, inwardDir.z * 0.1]}
        />
      )}
    </group>
  );
}
