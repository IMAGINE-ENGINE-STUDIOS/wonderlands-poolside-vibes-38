import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

  const handlePointerUp = () => {
    setDraggedPoint(null);
  };

  // Create line geometry from points
  const lineGeometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  
  points.forEach(p => {
    positions.push(p.x, yPosition, p.z);
  });
  
  // Close the loop
  if (points.length > 0) {
    positions.push(points[0].x, yPosition, points[0].z);
  }
  
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  return (
    <group>
      {/* Spline curve line */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, linewidth: lineWidth }))} />

      {/* Control points */}
      {points.map((point, index) => {
        const isHovered = hoverPoint === point.id;
        const isDragged = draggedPoint === point.id;
        const pointColor = isDragged ? '#ff0000' : isHovered ? '#ffff00' : color;
        const pointSize = isDragged ? 0.4 : isHovered ? 0.35 : 0.25;

        return (
          <group key={point.id} position={[point.x, yPosition, point.z]}>
            <mesh
              onPointerDown={handlePointerDown(point.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOver={() => setHoverPoint(point.id)}
              onPointerOut={() => setHoverPoint(null)}
            >
              <sphereGeometry args={[pointSize, 16, 16]} />
              <meshBasicMaterial color={pointColor} />
            </mesh>
            
            {(isHovered || isDragged) && (
              <Html distanceFactor={10}>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                  {name} Point {index + 1}
                  <br />
                  X: {point.x.toFixed(2)} Z: {point.z.toFixed(2)}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
