import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export interface SplinePoint {
  x: number;
  y: number;
  z: number;
  id: string;
}

interface SplineEditorProps {
  points: SplinePoint[];
  onPointsChange: (points: SplinePoint[]) => void;
  color?: string;
  lineWidth?: number;
  enableDrag?: boolean;
  name?: string;
  yPosition?: number;
}

export function SplineEditor({
  points,
  onPointsChange,
  color = '#00ff00',
  lineWidth = 2,
  enableDrag = true,
  name = 'Spline',
  yPosition = 0
}: SplineEditorProps) {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<string | null>(null);

  const handlePointerDown = (pointId: string) => (e: any) => {
    if (!enableDrag) return;
    e.stopPropagation();
    (e.target as any).setPointerCapture?.(e.pointerId); // Capture pointer for touch
    setDraggedPoint(pointId);
  };

  const handlePointerMove = (e: any) => {
    if (!draggedPoint || !enableDrag) return;
    e.stopPropagation();

    const point = e.intersections[0]?.point;
    if (!point) return;

    const updatedPoints = points.map(p =>
      p.id === draggedPoint
        ? { ...p, x: point.x, z: point.z, y: yPosition }
        : p
    );
    onPointsChange(updatedPoints);
  };

  const handlePointerUp = (e: any) => {
    if (draggedPoint) {
      (e.target as any).releasePointerCapture?.(e.pointerId); // Release pointer capture
    }
    setDraggedPoint(null);
  };

  // Create line geometry from points (memoized)
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    points.forEach(p => {
      positions.push(p.x, yPosition, p.z);
    });
    
    // Close the loop
    if (points.length > 0) {
      positions.push(points[0].x, yPosition, points[0].z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [points, yPosition]);

  // Create vertical line geometry for indicators (shared)
  const verticalLineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, 0, -1.5, 0]);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <group>
      {/* Spline curve line */}
      <line>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial color={color} />
      </line>

      {/* Control points */}
      {points.map((point, index) => {
        const isHovered = hoverPoint === point.id;
        const isDragged = draggedPoint === point.id;
        const pointColor = isDragged ? '#ff0000' : isHovered ? '#ffff00' : color;
        const pointSize = isDragged ? 0.6 : isHovered ? 0.5 : 0.4;

        return (
          <group key={point.id} position={[point.x, yPosition + 1.5, point.z]}>
            {/* Main control sphere */}
            <mesh
              onPointerDown={handlePointerDown(point.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOver={() => setHoverPoint(point.id)}
              onPointerOut={() => setHoverPoint(null)}
            >
              <sphereGeometry args={[pointSize, 32, 32]} />
              <meshStandardMaterial 
                color={pointColor} 
                emissive={pointColor}
                emissiveIntensity={0.5}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            
            {/* Vertical indicator line to surface */}
            <line>
              <primitive object={verticalLineGeometry} attach="geometry" />
              <lineBasicMaterial color={pointColor} opacity={0.6} transparent />
            </line>
            
            {/* Surface marker */}
            <mesh position={[0, -1.5, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
              <meshStandardMaterial 
                color={pointColor}
                emissive={pointColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {(isHovered || isDragged) && (
              <Html distanceFactor={10}>
                <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl border border-white/20">
                  <div className="font-bold mb-1">{name} Point {index + 1}</div>
                  <div className="text-xs opacity-80">
                    X: {point.x.toFixed(2)} ft | Z: {point.z.toFixed(2)} ft
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    Drag to reposition
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