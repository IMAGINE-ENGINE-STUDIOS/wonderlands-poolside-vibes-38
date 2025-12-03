import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { PoolStairConfig } from './poolAssetTypes';
import { getPositionOnPerimeter, getWallPositionFromPoint, mergeGeometries } from '@/utils/poolWallMeshUtils';

interface DraggablePoolStairProps {
  stair: PoolStairConfig;
  poolPerimeter: Array<{ x: number; z: number }>;
  onPositionChange: (stairId: string, wallPosition: number) => void;
  isSelected: boolean;
  onSelect: (stairId: string) => void;
  poolDepth: number;
  getFloorDepthAt?: (x: number, z: number) => number;
}

export function DraggablePoolStair({
  stair,
  poolPerimeter,
  onPositionChange,
  isSelected,
  onSelect,
  poolDepth,
  getFloorDepthAt
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
      texture.repeat.set(1, 1);
    }
  }, [texture]);

  // Calculate current position on wall
  const position = getPositionOnPerimeter(stair.wallPosition, poolPerimeter);

  // Determine if this is a "length" wall (needs 180 rotation)
  const isLengthWall = useMemo(() => {
    const normalizedAngle = ((position.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const tolerance = Math.PI / 4;
    return (normalizedAngle < tolerance || 
            Math.abs(normalizedAngle - Math.PI) < tolerance || 
            normalizedAngle > (2 * Math.PI - tolerance));
  }, [position.angle]);

  // Top of stairs is 1ft below water surface
  const stairTopY = -1;

  // Auto-calculate number of steps needed to reach the bottom
  const actualNumSteps = useMemo(() => {
    const depthToTravel = poolDepth - 1;
    const stepsNeeded = Math.ceil(depthToTravel / stair.stepHeight);
    return Math.max(stair.numSteps, stepsNeeded);
  }, [poolDepth, stair.stepHeight, stair.numSteps]);

  // Generate unified stair geometry using CopingGeometry pattern
  const stairGeometry = useMemo(() => {
    const stepWidth = stair.width;
    const stepDepth = stair.stepDepth;
    const stepHeight = stair.stepHeight;
    
    const allVertices: number[] = [];
    const allUVs: number[] = [];
    const allIndices: number[] = [];
    let vertexOffset = 0;
    
    // Track cumulative distance for UV mapping
    let cumulativeZ = 0;
    
    for (let i = 0; i < actualNumSteps; i++) {
      const stepTopY = stairTopY - i * stepHeight;
      const stepZOffset = i * stepDepth;
      
      // Get floor depth at this step position (in local coordinates)
      const worldAngle = position.angle;
      const worldX = position.x + Math.sin(worldAngle) * (stepZOffset + stepDepth / 2);
      const worldZ = position.z + Math.cos(worldAngle) * (stepZOffset + stepDepth / 2);
      const localFloorDepth = getFloorDepthAt ? getFloorDepthAt(worldX, worldZ) : poolDepth;
      
      const stepBottomY = -localFloorDepth;
      const blockHeight = Math.max(0.1, stepTopY - stepBottomY);
      
      const hw = stepWidth / 2;
      const hh = blockHeight / 2;
      const zStart = stepZOffset;
      const zEnd = stepZOffset + stepDepth;
      const yCenter = stepTopY - hh;
      
      // TOP face - world-space UV
      let baseIdx = vertexOffset;
      allVertices.push(
        -hw, stepTopY, zStart,
        hw, stepTopY, zStart,
        hw, stepTopY, zEnd,
        -hw, stepTopY, zEnd
      );
      allUVs.push(
        0, cumulativeZ,
        stepWidth, cumulativeZ,
        stepWidth, cumulativeZ + stepDepth,
        0, cumulativeZ + stepDepth
      );
      allIndices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx, baseIdx + 3, baseIdx + 2);
      vertexOffset += 4;
      
      // FRONT face (Z+ direction) - visible when looking at stairs
      baseIdx = vertexOffset;
      allVertices.push(
        -hw, stepTopY, zEnd,
        hw, stepTopY, zEnd,
        hw, stepBottomY, zEnd,
        -hw, stepBottomY, zEnd
      );
      allUVs.push(
        0, blockHeight,
        stepWidth, blockHeight,
        stepWidth, 0,
        0, 0
      );
      allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
      vertexOffset += 4;
      
      // BACK face (Z- direction) - only for first step
      if (i === 0) {
        baseIdx = vertexOffset;
        allVertices.push(
          hw, stepTopY, zStart,
          -hw, stepTopY, zStart,
          -hw, stepBottomY, zStart,
          hw, stepBottomY, zStart
        );
        allUVs.push(
          0, blockHeight,
          stepWidth, blockHeight,
          stepWidth, 0,
          0, 0
        );
        allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
        vertexOffset += 4;
      }
      
      // LEFT face (X-)
      baseIdx = vertexOffset;
      allVertices.push(
        -hw, stepTopY, zStart,
        -hw, stepTopY, zEnd,
        -hw, stepBottomY, zEnd,
        -hw, stepBottomY, zStart
      );
      allUVs.push(
        cumulativeZ, blockHeight,
        cumulativeZ + stepDepth, blockHeight,
        cumulativeZ + stepDepth, 0,
        cumulativeZ, 0
      );
      allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
      vertexOffset += 4;
      
      // RIGHT face (X+)
      baseIdx = vertexOffset;
      allVertices.push(
        hw, stepTopY, zEnd,
        hw, stepTopY, zStart,
        hw, stepBottomY, zStart,
        hw, stepBottomY, zEnd
      );
      allUVs.push(
        cumulativeZ + stepDepth, blockHeight,
        cumulativeZ, blockHeight,
        cumulativeZ, 0,
        cumulativeZ + stepDepth, 0
      );
      allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
      vertexOffset += 4;
      
      cumulativeZ += stepDepth;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(allUVs, 2));
    geometry.setIndex(allIndices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [stair, poolDepth, actualNumSteps, position, getFloorDepthAt, stairTopY]);

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

  // Calculate total stair depth for positioning
  const totalStairDepth = actualNumSteps * stair.stepDepth;

  // Position stairs at wall edge - rotate to face into pool
  const baseRotation = position.angle + Math.PI / 2 + Math.PI;
  const finalRotation = isLengthWall ? baseRotation + Math.PI : baseRotation;

  return (
    <group
      ref={groupRef}
      position={[position.x, 0, position.z]}
      rotation={[0, finalRotation, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => gl.domElement.style.cursor = isDragging ? 'grabbing' : 'grab'}
      onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')}
    >
      <mesh geometry={stairGeometry}>
        <meshStandardMaterial 
          map={texture} 
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, stairTopY + 0.05, totalStairDepth / 2]}>
          <boxGeometry args={[stair.width + 0.2, 0.05, totalStairDepth + 0.2]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
