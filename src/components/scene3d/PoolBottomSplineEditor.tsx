import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PerimeterDepthPoint } from './types';

interface PoolBottomSplineEditorProps {
  perimeterDepthPoints: PerimeterDepthPoint[];
  onPointsChange: (points: PerimeterDepthPoint[]) => void;
  enabled: boolean;
}

export function PoolBottomSplineEditor({
  perimeterDepthPoints,
  onPointsChange,
  enabled
}: PoolBottomSplineEditorProps) {
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  if (!enabled || perimeterDepthPoints.length === 0) return null;

  const handlePointerDown = (pointId: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDraggedPointId(pointId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggedPointId) return;
    e.stopPropagation();

    const point = perimeterDepthPoints.find(p => p.id === draggedPointId);
    if (!point) return;

    // Raycast against vertical drag plane at point's X/Z position
    const intersectionPoint = new THREE.Vector3();
    const ray = new THREE.Ray();
    e.ray.intersectPlane(dragPlaneRef.current, intersectionPoint);

    // Only allow vertical movement (depth change)
    const newDepth = Math.max(1, Math.min(12, -intersectionPoint.y));

    const updatedPoints = perimeterDepthPoints.map(p =>
      p.id === draggedPointId ? { ...p, depth: newDepth } : p
    );

    onPointsChange(updatedPoints);
  };

  const handlePointerUp = () => {
    setDraggedPointId(null);
  };

  // Create connecting lines along pool bottom perimeter
  const linePoints = perimeterDepthPoints.map(p => 
    new THREE.Vector3(p.x, -p.depth, p.z)
  );
  linePoints.push(linePoints[0]); // Close the loop

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);

  return (
    <group onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* Connecting line along pool floor edge */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ 
        color: '#00ffff', 
        linewidth: 2, 
        transparent: true, 
        opacity: 0.8 
      }))} />

      {/* Control points */}
      {perimeterDepthPoints.map((point) => {
        const isHovered = hoveredPointId === point.id;
        const isDragged = draggedPointId === point.id;
        const scale = isDragged ? 0.8 : isHovered ? 0.7 : 0.5;
        const color = isDragged ? '#ffff00' : isHovered ? '#00ff00' : '#00ffff';

        return (
          <group key={point.id}>
            {/* Visual control sphere */}
            <mesh
              position={[point.x, -point.depth, point.z]}
              onPointerDown={handlePointerDown(point.id)}
              onPointerEnter={() => setHoveredPointId(point.id)}
              onPointerLeave={() => setHoveredPointId(null)}
            >
              <sphereGeometry args={[scale, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Vertical guide line */}
            <primitive 
              object={(() => {
                const lineGeo = new THREE.BufferGeometry();
                const positions = new Float32Array([
                  point.x, 0, point.z,
                  point.x, -point.depth, point.z
                ]);
                lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const lineMat = new THREE.LineDashedMaterial({
                  color: '#00ffff',
                  transparent: true,
                  opacity: 0.3,
                  dashSize: 0.2,
                  gapSize: 0.1
                });
                const line = new THREE.Line(lineGeo, lineMat);
                line.computeLineDistances();
                return line;
              })()}
            />

            {/* Depth label */}
            {(isHovered || isDragged) && (
              <Html position={[point.x, -point.depth + 1, point.z]} center>
                <div className="bg-black/80 text-cyan-400 px-2 py-1 rounded text-xs font-mono border border-cyan-400/50">
                  {point.depth.toFixed(1)}' deep
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
