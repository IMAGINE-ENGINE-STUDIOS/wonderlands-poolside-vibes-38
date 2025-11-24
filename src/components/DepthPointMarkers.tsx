import { useState, useCallback, useMemo } from 'react';
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
  insertMode?: boolean;
}

export function DepthPointMarkers({
  depthPoints,
  poolDimensions,
  poolPoints,
  onDepthPointsChange,
  enabled = false,
  insertMode = false
}: DepthPointMarkersProps) {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<string | null>(null);
  const [insertPreview, setInsertPreview] = useState<{ position: number; depth: number } | null>(null);

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

  // Calculate depth at a given position using interpolation
  const getInterpolatedDepth = useCallback((positionRatio: number): number => {
    if (depthPoints.length === 0) return poolDimensions.depth / 2;
    
    const sortedPoints = [...depthPoints].sort((a, b) => a.position - b.position);
    
    if (positionRatio <= sortedPoints[0].position) return sortedPoints[0].depth;
    if (positionRatio >= sortedPoints[sortedPoints.length - 1].position) {
      return sortedPoints[sortedPoints.length - 1].depth;
    }
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const curr = sortedPoints[i];
      const next = sortedPoints[i + 1];
      
      if (positionRatio >= curr.position && positionRatio <= next.position) {
        const t = (positionRatio - curr.position) / (next.position - curr.position);
        return curr.depth + (next.depth - curr.depth) * t;
      }
    }
    
    return sortedPoints[0].depth;
  }, [depthPoints, poolDimensions.depth]);

  // Handle clicking on pool floor to insert new depth point
  const handleFloorClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    if (!enabled || !insertMode || draggedPoint) return;
    
    event.stopPropagation();
    
    const worldPoint = event.point;
    
    // Calculate position ratio along pool length
    let positionRatio: number;
    if (lengthDirection === 'z') {
      const zPos = worldPoint.z;
      const minZ = minY - centerY;
      const maxZ = minZ + poolLength;
      positionRatio = (zPos - minZ) / poolLength;
    } else {
      const xPos = worldPoint.x;
      const minX_normalized = minX - centerX;
      const maxX_normalized = minX_normalized + poolWidth;
      positionRatio = (xPos - minX_normalized) / poolWidth;
    }
    
    positionRatio = Math.max(0.01, Math.min(0.99, positionRatio));
    
    // Check if there's already a point very close to this position
    const tooClose = depthPoints.some(dp => Math.abs(dp.position - positionRatio) < 0.05);
    if (tooClose) return;
    
    // Get interpolated depth at this position
    const depth = getInterpolatedDepth(positionRatio);
    
    // Create new depth point
    const newPoint: DepthPoint = {
      id: `depth-${Date.now()}`,
      position: positionRatio,
      depth
    };
    
    // Add and sort depth points
    const updatedPoints = [...depthPoints, newPoint].sort((a, b) => a.position - b.position);
    onDepthPointsChange(updatedPoints);
  }, [enabled, insertMode, draggedPoint, lengthDirection, minY, centerY, poolLength, minX, centerX, poolWidth, depthPoints, onDepthPointsChange, getInterpolatedDepth]);

  // Handle hovering over pool floor to show insert preview
  const handleFloorHover = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!enabled || !insertMode || draggedPoint) {
      setInsertPreview(null);
      return;
    }
    
    const worldPoint = event.point;
    
    // Calculate position ratio
    let positionRatio: number;
    if (lengthDirection === 'z') {
      const zPos = worldPoint.z;
      const minZ = minY - centerY;
      positionRatio = (zPos - minZ) / poolLength;
    } else {
      const xPos = worldPoint.x;
      const minX_normalized = minX - centerX;
      positionRatio = (xPos - minX_normalized) / poolWidth;
    }
    
    positionRatio = Math.max(0.01, Math.min(0.99, positionRatio));
    
    // Check if too close to existing points
    const tooClose = depthPoints.some(dp => Math.abs(dp.position - positionRatio) < 0.05);
    if (tooClose) {
      setInsertPreview(null);
      return;
    }
    
    const depth = getInterpolatedDepth(positionRatio);
    setInsertPreview({ position: positionRatio, depth });
  }, [enabled, insertMode, draggedPoint, lengthDirection, minY, centerY, poolLength, minX, centerX, poolWidth, depthPoints, getInterpolatedDepth]);

  // Create invisible clickable floor plane
  const floorPlane = useMemo(() => {
    if (!insertMode || !enabled) return null;
    
    // Create a large plane at the average depth for clicking
    const avgDepth = depthPoints.length > 0 
      ? depthPoints.reduce((sum, dp) => sum + dp.depth, 0) / depthPoints.length 
      : poolDimensions.depth / 2;
    
    return (
      <mesh
        position={[0, -avgDepth, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleFloorClick}
        onPointerMove={handleFloorHover}
        onPointerLeave={() => setInsertPreview(null)}
      >
        <planeGeometry args={[poolWidth * 1.5, poolLength * 1.5]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
    );
  }, [insertMode, enabled, depthPoints, poolDimensions.depth, poolWidth, poolLength, handleFloorClick, handleFloorHover]);

  if (!enabled || depthPoints.length === 0) return null;

  return (
    <group>
      {/* Invisible clickable floor plane for inserting points */}
      {floorPlane}
      
      {/* Insert preview marker */}
      {insertPreview && (
        <group position={getMarkerPosition(insertPreview.position, insertPreview.depth)}>
          <mesh scale={1.2}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
          <Html
            position={[0, 0.5, 0]}
            center
            distanceFactor={8}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-background/90 backdrop-blur-sm border border-emerald-500 rounded-lg px-3 py-2 shadow-lg">
              <div className="text-xs font-medium text-foreground whitespace-nowrap">
                Click to insert depth point
              </div>
              <div className="text-xs text-muted-foreground">
                Depth: {insertPreview.depth.toFixed(1)} ft
              </div>
            </div>
          </Html>
        </group>
      )}
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
