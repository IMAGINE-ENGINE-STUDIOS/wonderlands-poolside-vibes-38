import { useState, useCallback } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface DepthPoint {
  position: number;
  depth: number;
  id: string;
}

interface DepthPointMarkersProps {
  depthPoints: DepthPoint[];
  poolDimensions: {
    length: number;
    width: number;
    depth: number;
  };
  poolPoints: Array<{ x: number; y: number; id: string }>;
  onDepthPointsChange: (depthPoints: DepthPoint[]) => void;
  enabled?: boolean;
}

export function DepthPointMarkers({
  depthPoints,
  poolDimensions,
  poolPoints,
  onDepthPointsChange,
  enabled = false
}: DepthPointMarkersProps) {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<string | null>(null);

  // Calculate pool bounds
  const minX = Math.min(...poolPoints.map(p => p.x));
  const maxX = Math.max(...poolPoints.map(p => p.x));
  const minY = Math.min(...poolPoints.map(p => p.y));
  const maxY = Math.max(...poolPoints.map(p => p.y));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const poolLength = maxY - minY;
  const poolWidth = maxX - minX;
  const lengthDirection = poolLength > poolWidth ? 'z' : 'x';

  // Convert position ratio to 3D coordinates
  const getMarkerPosition = useCallback((positionRatio: number, depth: number): [number, number, number] => {
    if (lengthDirection === 'z') {
      const zPos = (minY - centerY) + positionRatio * poolLength;
      return [0, -depth, zPos];
    } else {
      const xPos = (minX - centerX) + positionRatio * poolWidth;
      return [xPos, -depth, 0];
    }
  }, [lengthDirection, minX, minY, centerX, centerY, poolLength, poolWidth]);

  const handlePointerDown = useCallback((pointId: string) => {
    if (!enabled) return;
    setDraggedPoint(pointId);
  }, [enabled]);

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>, pointId: string) => {
    if (!enabled || draggedPoint !== pointId) return;

    event.stopPropagation();
    
    // Get the world Y position of the pointer intersection
    const worldY = event.point.y;
    
    // Convert to depth (depth is negative Y)
    const newDepth = Math.max(0.5, Math.min(12, -worldY));
    
    // Update the depth point
    const updatedPoints = depthPoints.map(dp =>
      dp.id === pointId ? { ...dp, depth: newDepth } : dp
    );
    
    onDepthPointsChange(updatedPoints);
  }, [enabled, draggedPoint, depthPoints, onDepthPointsChange]);

  const handlePointerUp = useCallback(() => {
    setDraggedPoint(null);
  }, []);

  if (!enabled || depthPoints.length === 0) return null;

  return (
    <group>
      {depthPoints.map((depthPoint) => {
        const [x, y, z] = getMarkerPosition(depthPoint.position, depthPoint.depth);
        const isDragging = draggedPoint === depthPoint.id;
        const isHover = hoverPoint === depthPoint.id;
        const scale = isDragging ? 1.5 : isHover ? 1.2 : 1;

        return (
          <group key={depthPoint.id} position={[x, y, z]}>
            {/* Vertical indicator line from surface to floor */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([0, 0, 0, 0, depthPoint.depth, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={isDragging ? '#3b82f6' : '#94a3b8'} linewidth={2} />
            </line>

            {/* Surface marker (at water level) */}
            <mesh
              position={[0, depthPoint.depth, 0]}
              onPointerDown={() => handlePointerDown(depthPoint.id)}
              onPointerMove={(e) => handlePointerMove(e, depthPoint.id)}
              onPointerUp={handlePointerUp}
              onPointerEnter={() => setHoverPoint(depthPoint.id)}
              onPointerLeave={() => setHoverPoint(null)}
              scale={scale}
            >
              <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
              <meshStandardMaterial
                color={isDragging ? '#3b82f6' : isHover ? '#60a5fa' : '#94a3b8'}
                emissive={isDragging ? '#3b82f6' : isHover ? '#3b82f6' : '#000000'}
                emissiveIntensity={isDragging ? 0.5 : isHover ? 0.3 : 0}
              />
            </mesh>

            {/* Floor marker (draggable handle) */}
            <mesh
              onPointerDown={() => handlePointerDown(depthPoint.id)}
              onPointerMove={(e) => handlePointerMove(e, depthPoint.id)}
              onPointerUp={handlePointerUp}
              onPointerEnter={() => setHoverPoint(depthPoint.id)}
              onPointerLeave={() => setHoverPoint(null)}
              scale={scale}
            >
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color={isDragging ? '#3b82f6' : isHover ? '#60a5fa' : '#f59e0b'}
                emissive={isDragging ? '#3b82f6' : isHover ? '#3b82f6' : '#f59e0b'}
                emissiveIntensity={isDragging ? 0.8 : isHover ? 0.5 : 0.3}
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>

            {/* Label */}
            {(isHover || isDragging) && (
              <Html
                position={[0, 0.5, 0]}
                center
                distanceFactor={8}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              >
                <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
                  <div className="text-xs font-medium text-foreground whitespace-nowrap">
                    Depth: {depthPoint.depth.toFixed(1)} ft
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Position: {(depthPoint.position * 100).toFixed(0)}%
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
