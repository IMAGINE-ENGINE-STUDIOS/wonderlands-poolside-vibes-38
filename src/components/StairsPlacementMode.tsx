import { useEffect, useState, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Point } from './scene3d/types';

interface StairsPlacementModeProps {
  poolPoints: Point[];
  copingWidth: number;
  isActive: boolean;
  onPlace: (position: [number, number, number], rotation: number) => void;
  onCancel: () => void;
  numSteps: number;
  stepHeight: number;
  stepDepth: number;
  stairWidth: number;
  stairShape: 'rectangle' | 'square' | 'rounded';
}

export const StairsPlacementMode = ({
  poolPoints,
  copingWidth,
  isActive,
  onPlace,
  onCancel,
  numSteps,
  stepHeight,
  stepDepth,
  stairWidth,
  stairShape
}: StairsPlacementModeProps) => {
  const { camera, raycaster, scene, gl } = useThree();
  const [hoverPosition, setHoverPosition] = useState<THREE.Vector3 | null>(null);
  const [hoverRotation, setHoverRotation] = useState(0);
  

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Find closest point on coping edge
      const mousePos = new THREE.Vector2(x, y);
      let closestPoint: THREE.Vector3 | null = null;
      let closestRotation = 0;
      let minDistance = Infinity;

      for (let i = 0; i < poolPoints.length; i++) {
        const p1 = poolPoints[i];
        const p2 = poolPoints[(i + 1) % poolPoints.length];

        // Calculate segment direction (inward from coping)
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / length; // Normal pointing inward
        const nz = dx / length;

        // Sample points along the coping edge
        const samples = 20;
        for (let s = 0; s <= samples; s++) {
          const t = s / samples;
          const px = p1.x + dx * t;
          const pz = p1.y + dy * t;

          const edgePoint = new THREE.Vector3(px, 0, pz);
          const screenPos = edgePoint.project(camera);
          const dist = screenPos.distanceTo(new THREE.Vector3(mousePos.x, mousePos.y, 0));

          if (dist < minDistance) {
            minDistance = dist;
            // Position slightly inward from coping edge
            closestPoint = new THREE.Vector3(
              px + nx * (copingWidth * 0.5),
              0,
              pz + nz * (copingWidth * 0.5)
            );
            closestRotation = Math.atan2(dx, -dy);
          }
        }
      }

      setHoverPosition(closestPoint);
      setHoverRotation(closestRotation);
    };

    const handleClick = () => {
      if (hoverPosition) {
        onPlace([hoverPosition.x, hoverPosition.y, hoverPosition.z], hoverRotation);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, poolPoints, copingWidth, camera, raycaster, gl, onPlace, onCancel, hoverPosition, hoverRotation]);

  // Create stairs preview geometry
  const stairsPreviewGeometry = useMemo(() => {
    if (!hoverPosition || !isActive) return null;

    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    let vertexIndex = 0;

    for (let i = 0; i < numSteps; i++) {
      const currentDepth = i * stepDepth;
      const nextDepth = (i + 1) * stepDepth;
      const currentHeight = -i * stepHeight;
      const nextHeight = -(i + 1) * stepHeight;

      const hw = stairWidth / 2;

      // Tread (top surface)
      const treadVerts = [
        [-hw, currentHeight, currentDepth],
        [hw, currentHeight, currentDepth],
        [hw, currentHeight, nextDepth],
        [-hw, currentHeight, nextDepth]
      ];

      treadVerts.forEach(v => vertices.push(...v));
      const treadUVs = [[0, 0], [1, 0], [1, 1], [0, 1]];
      treadUVs.forEach(uv => uvs.push(...uv));
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
      vertexIndex += 4;

      // Riser (front vertical surface)
      const riserVerts = [
        [-hw, currentHeight, nextDepth],
        [hw, currentHeight, nextDepth],
        [hw, nextHeight, nextDepth],
        [-hw, nextHeight, nextDepth]
      ];

      riserVerts.forEach(v => vertices.push(...v));
      const riserUVs = [[0, 0], [1, 0], [1, 1], [0, 1]];
      riserUVs.forEach(uv => uvs.push(...uv));
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
      vertexIndex += 4;

      // Left side panel
      const leftVerts = [
        [-hw, currentHeight, currentDepth],
        [-hw, currentHeight, nextDepth],
        [-hw, nextHeight, nextDepth],
        [-hw, nextHeight, currentDepth]
      ];
      leftVerts.forEach(v => vertices.push(...v));
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
      vertexIndex += 4;

      // Right side panel
      const rightVerts = [
        [hw, currentHeight, currentDepth],
        [hw, nextHeight, currentDepth],
        [hw, nextHeight, nextDepth],
        [hw, currentHeight, nextDepth]
      ];
      rightVerts.forEach(v => vertices.push(...v));
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3);
      vertexIndex += 4;
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [numSteps, stepHeight, stepDepth, stairWidth, isActive, hoverPosition]);

  if (!isActive || !hoverPosition || !stairsPreviewGeometry) return null;

  return (
    <group position={[hoverPosition.x, hoverPosition.y, hoverPosition.z]} rotation={[0, hoverRotation, 0]}>
      <mesh geometry={stairsPreviewGeometry}>
        <meshStandardMaterial 
          color="#4488ff" 
          transparent 
          opacity={0.6}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

