import * as THREE from 'three';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { PoolStairConfig } from './poolAssetTypes';
import { getPositionOnPerimeter, getWallPositionFromPoint } from '@/utils/poolWallMeshUtils';

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

  const texture = useTexture(stair.textureUrl);
  
  useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    }
  }, [texture]);

  const position = getPositionOnPerimeter(stair.wallPosition, poolPerimeter);

  // Determine if this is a "length" wall (needs 180 rotation)
  const isLengthWall = useMemo(() => {
    const normalizedAngle = ((position.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const tolerance = Math.PI / 4;
    return (normalizedAngle < tolerance || 
            Math.abs(normalizedAngle - Math.PI) < tolerance || 
            normalizedAngle > (2 * Math.PI - tolerance));
  }, [position.angle]);

  const stairTopY = -1; // 1ft below water surface

  // Auto-calculate number of steps needed to reach the bottom
  const actualNumSteps = useMemo(() => {
    const depthToTravel = poolDepth - 1;
    const stepsNeeded = Math.ceil(depthToTravel / stair.stepHeight);
    return Math.max(stair.numSteps, stepsNeeded);
  }, [poolDepth, stair.stepHeight, stair.numSteps]);

  // Generate rounded corner path points
  const generateCornerArc = (
    cornerX: number, 
    cornerZ: number, 
    radius: number, 
    startAngle: number, 
    endAngle: number, 
    segments: number
  ): Array<{x: number, z: number}> => {
    const points: Array<{x: number, z: number}> = [];
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / segments);
      points.push({
        x: cornerX + Math.cos(angle) * radius,
        z: cornerZ + Math.sin(angle) * radius
      });
    }
    return points;
  };

  // Generate stair geometry with proper 1ft x 1ft UV mapping like pool walls
  const stairGeometry = useMemo(() => {
    const stepWidth = stair.width;
    const stepDepth = stair.stepDepth;
    const stepHeight = stair.stepHeight;
    const cornerRadius = stair.shape === 'curved' ? (stair.cornerRadius || 0.5) : 0;
    
    const allVertices: number[] = [];
    const allUVs: number[] = [];
    const allIndices: number[] = [];
    let vertexOffset = 0;
    
    // Cumulative distance along perimeter for UV mapping
    let cumulativePerimeterDist = 0;
    
    for (let i = 0; i < actualNumSteps; i++) {
      const stepTopY = stairTopY - i * stepHeight;
      const stepZOffset = i * stepDepth;
      
      // Get floor depth at this step position
      const worldAngle = position.angle;
      const worldX = position.x + Math.sin(worldAngle) * (stepZOffset + stepDepth / 2);
      const worldZ = position.z + Math.cos(worldAngle) * (stepZOffset + stepDepth / 2);
      const localFloorDepth = getFloorDepthAt ? getFloorDepthAt(worldX, worldZ) : poolDepth;
      
      const stepBottomY = -localFloorDepth;
      const blockHeight = Math.max(0.1, stepTopY - stepBottomY);
      
      const hw = stepWidth / 2;
      const zStart = stepZOffset;
      const zEnd = stepZOffset + stepDepth;
      
      // Effective corner radius (can't be more than half the width or depth)
      const effectiveRadius = Math.min(cornerRadius, hw, stepDepth / 2);
      
      if (stair.shape === 'curved' && effectiveRadius > 0.1) {
        // Generate rounded step with proper corner arcs
        const cornerSegments = 6;
        
        // Build profile path for rounded rectangle
        const profilePoints: Array<{x: number, z: number}> = [];
        
        // Bottom-left corner arc
        const blCorner = generateCornerArc(
          -hw + effectiveRadius, zStart + effectiveRadius,
          effectiveRadius,
          Math.PI, Math.PI * 1.5,
          cornerSegments
        );
        profilePoints.push(...blCorner);
        
        // Bottom-right corner arc
        const brCorner = generateCornerArc(
          hw - effectiveRadius, zStart + effectiveRadius,
          effectiveRadius,
          Math.PI * 1.5, Math.PI * 2,
          cornerSegments
        );
        profilePoints.push(...brCorner);
        
        // Top-right corner arc
        const trCorner = generateCornerArc(
          hw - effectiveRadius, zEnd - effectiveRadius,
          effectiveRadius,
          0, Math.PI * 0.5,
          cornerSegments
        );
        profilePoints.push(...trCorner);
        
        // Top-left corner arc
        const tlCorner = generateCornerArc(
          -hw + effectiveRadius, zEnd - effectiveRadius,
          effectiveRadius,
          Math.PI * 0.5, Math.PI,
          cornerSegments
        );
        profilePoints.push(...tlCorner);
        
        // Close the loop
        profilePoints.push(profilePoints[0]);
        
        // TOP SURFACE - Use 1ft x 1ft UV pattern based on local coordinates
        const topBase = vertexOffset;
        const centerX = 0;
        const centerZ = zStart + stepDepth / 2;
        
        // Center vertex
        allVertices.push(centerX, stepTopY, centerZ);
        allUVs.push(centerX, centerZ); // 1ft = 1 UV unit
        vertexOffset++;
        
        // Perimeter vertices
        for (let j = 0; j < profilePoints.length - 1; j++) {
          const pt = profilePoints[j];
          allVertices.push(pt.x, stepTopY, pt.z);
          allUVs.push(pt.x, pt.z); // 1ft = 1 UV unit
          vertexOffset++;
        }
        
        // Fan triangles from center
        for (let j = 0; j < profilePoints.length - 2; j++) {
          allIndices.push(topBase, topBase + j + 1, topBase + j + 2);
        }
        allIndices.push(topBase, topBase + profilePoints.length - 2, topBase + 1);
        
        // SIDE WALLS - cumulative distance UV for proper 1ft squares
        let wallCumulativeDist = cumulativePerimeterDist;
        
        for (let j = 0; j < profilePoints.length - 1; j++) {
          const p1 = profilePoints[j];
          const p2 = profilePoints[j + 1];
          const segLen = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
          
          const idx = vertexOffset;
          allVertices.push(p1.x, stepTopY, p1.z);
          allVertices.push(p2.x, stepTopY, p2.z);
          allVertices.push(p1.x, stepBottomY, p1.z);
          allVertices.push(p2.x, stepBottomY, p2.z);
          
          // UV: cumulative distance for U, height for V (1ft = 1 UV unit)
          allUVs.push(wallCumulativeDist, blockHeight);
          allUVs.push(wallCumulativeDist + segLen, blockHeight);
          allUVs.push(wallCumulativeDist, 0);
          allUVs.push(wallCumulativeDist + segLen, 0);
          
          allIndices.push(idx, idx + 1, idx + 2);
          allIndices.push(idx + 1, idx + 3, idx + 2);
          
          vertexOffset += 4;
          wallCumulativeDist += segLen;
        }
        
      } else {
        // Linear (rectangular) step geometry with proper 1ft x 1ft UV mapping
        
        // TOP face - local coordinate UV for 1ft grid
        let baseIdx = vertexOffset;
        allVertices.push(
          -hw, stepTopY, zStart,
          hw, stepTopY, zStart,
          hw, stepTopY, zEnd,
          -hw, stepTopY, zEnd
        );
        // UV based on local X,Z for consistent 1ft tiling
        allUVs.push(
          0, 0,
          stepWidth, 0,
          stepWidth, stepDepth,
          0, stepDepth
        );
        allIndices.push(baseIdx, baseIdx + 2, baseIdx + 1, baseIdx, baseIdx + 3, baseIdx + 2);
        vertexOffset += 4;
        
        // FRONT face (Z+ direction) - cumulative distance based UV
        baseIdx = vertexOffset;
        allVertices.push(
          -hw, stepTopY, zEnd,
          hw, stepTopY, zEnd,
          hw, stepBottomY, zEnd,
          -hw, stepBottomY, zEnd
        );
        // UV: width along U, height along V
        allUVs.push(
          cumulativePerimeterDist, blockHeight,
          cumulativePerimeterDist + stepWidth, blockHeight,
          cumulativePerimeterDist + stepWidth, 0,
          cumulativePerimeterDist, 0
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
        
        // LEFT face (X-) - cumulative distance based UV
        baseIdx = vertexOffset;
        allVertices.push(
          -hw, stepTopY, zStart,
          -hw, stepTopY, zEnd,
          -hw, stepBottomY, zEnd,
          -hw, stepBottomY, zStart
        );
        const leftStartDist = cumulativePerimeterDist + stepWidth;
        allUVs.push(
          leftStartDist, blockHeight,
          leftStartDist + stepDepth, blockHeight,
          leftStartDist + stepDepth, 0,
          leftStartDist, 0
        );
        allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
        vertexOffset += 4;
        
        // RIGHT face (X+) - cumulative distance based UV
        baseIdx = vertexOffset;
        allVertices.push(
          hw, stepTopY, zEnd,
          hw, stepTopY, zStart,
          hw, stepBottomY, zStart,
          hw, stepBottomY, zEnd
        );
        const rightStartDist = cumulativePerimeterDist + stepWidth + stepDepth;
        allUVs.push(
          rightStartDist + stepDepth, blockHeight,
          rightStartDist, blockHeight,
          rightStartDist, 0,
          rightStartDist + stepDepth, 0
        );
        allIndices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
        vertexOffset += 4;
      }
      
      // Update cumulative distance for next step
      cumulativePerimeterDist += (stepWidth * 2) + (stepDepth * 2);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(allUVs, 2));
    geometry.setIndex(allIndices);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [stair, poolDepth, actualNumSteps, position, getFloorDepthAt, stairTopY]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(stair.id);
    setIsDragging(true);
    gl.domElement.style.cursor = 'grabbing';
    dragPlaneRef.current.constant = 0;
  }, [stair.id, onSelect, gl.domElement]);

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

  const totalStairDepth = actualNumSteps * stair.stepDepth;
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
      
      {isSelected && (
        <mesh position={[0, stairTopY + 0.05, totalStairDepth / 2]}>
          <boxGeometry args={[stair.width + 0.2, 0.05, totalStairDepth + 0.2]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
