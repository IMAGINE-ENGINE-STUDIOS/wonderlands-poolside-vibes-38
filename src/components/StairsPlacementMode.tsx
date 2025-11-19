import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { Point } from './scene3d/types';

interface StairsPlacementModeProps {
  poolPoints: Point[];
  copingWidth: number;
  isActive: boolean;
  onPlace: (position: [number, number, number], rotation: number) => void;
  onCancel: () => void;
}

export const StairsPlacementMode = ({
  poolPoints,
  copingWidth,
  isActive,
  onPlace,
  onCancel
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

  // Create blue indicator line on coping
  const indicatorGeometry = useMemo(() => {
    if (!hoverPosition || !isActive) return null;

    const points: THREE.Vector3[] = [];
    
    // Draw line segment on coping where stairs will attach
    const lineLength = 3; // 3 feet wide indicator
    const angle = hoverRotation;
    const dx = Math.sin(angle) * lineLength / 2;
    const dz = -Math.cos(angle) * lineLength / 2;

    points.push(new THREE.Vector3(
      hoverPosition.x - dx,
      0.1, // Slightly above water surface
      hoverPosition.z - dz
    ));
    points.push(new THREE.Vector3(
      hoverPosition.x + dx,
      0.1,
      hoverPosition.z + dz
    ));

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [hoverPosition, hoverRotation, isActive]);

  if (!isActive || !indicatorGeometry) return null;

  return (
    <primitive object={new THREE.Line(indicatorGeometry, new THREE.LineBasicMaterial({ color: 0x4488ff, linewidth: 3 }))} />
  );
};

