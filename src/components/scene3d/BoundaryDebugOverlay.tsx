import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { generateOffsetCurve } from '@/utils/curveUtils';

interface BoundaryDebugOverlayProps {
  poolPoints: THREE.Vector2[];
  copingWidth: number;
  deckWidth: number;
  showCoping: boolean;
}

export function BoundaryDebugOverlay({ 
  poolPoints, 
  copingWidth, 
  deckWidth,
  showCoping 
}: BoundaryDebugOverlayProps) {
  
  const boundaries = useMemo(() => {
    if (poolPoints.length < 3) return null;

    // Convert Vector2 to {x, z} format for generateOffsetCurve
    const poolPoints3D = poolPoints.map(p => ({ x: p.x, z: p.y }));

    // Pool boundary (blue) - at water level
    const poolBoundary3D = poolPoints3D.map(p => new THREE.Vector3(p.x, 0.1, p.z));
    poolBoundary3D.push(poolBoundary3D[0].clone()); // Close the loop

    // Coping boundary (yellow)
    const copingOffset = showCoping ? copingWidth : 0;
    const copingBoundary2D = generateOffsetCurve(poolPoints3D, copingOffset);
    const copingBoundary3D = copingBoundary2D.map(p => new THREE.Vector3(p.x, 0.15, p.z));
    copingBoundary3D.push(copingBoundary3D[0].clone());

    // Deck boundary (green)
    const deckOffset = copingOffset + deckWidth;
    const deckBoundary2D = generateOffsetCurve(poolPoints3D, deckOffset);
    const deckBoundary3D = deckBoundary2D.map(p => new THREE.Vector3(p.x, 0.2, p.z));
    deckBoundary3D.push(deckBoundary3D[0].clone());

    return {
      pool: poolBoundary3D,
      coping: copingBoundary3D,
      deck: deckBoundary3D
    };
  }, [poolPoints, copingWidth, deckWidth, showCoping]);

  if (!boundaries) return null;

  return (
    <group name="boundary-debug-overlay">
      {/* Pool boundary - Blue */}
      <Line
        points={boundaries.pool}
        color="#0066ff"
        lineWidth={3}
        dashed={false}
      />
      
      {/* Coping boundary - Yellow */}
      <Line
        points={boundaries.coping}
        color="#ffff00"
        lineWidth={3}
        dashed={false}
      />
      
      {/* Deck boundary - Green */}
      <Line
        points={boundaries.deck}
        color="#00ff00"
        lineWidth={3}
        dashed={false}
      />
    </group>
  );
}
