import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PerimeterDepthPoint } from './types';

interface PoolBottomSplineEditorProps {
  perimeterDepthPoints: PerimeterDepthPoint[];
  onPointsChange: (points: PerimeterDepthPoint[]) => void;
  enabled: boolean;
  selectedPointId?: string | null;
  onSelectPoint?: (id: string | null) => void;
}

export function PoolBottomSplineEditor({
  perimeterDepthPoints,
  onPointsChange,
  enabled,
  selectedPointId: externalSelectedPointId,
  onSelectPoint
}: PoolBottomSplineEditorProps) {
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [internalSelectedPointId, setInternalSelectedPointId] = useState<string | null>(null);
  const dragPlaneRef = useRef<THREE.Plane>(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const selectedPointId = externalSelectedPointId ?? internalSelectedPointId;
  const setSelectedPointId = onSelectPoint ?? setInternalSelectedPointId;

  if (!enabled || perimeterDepthPoints.length === 0) return null;

  const handlePointerDown = (pointId: string) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDraggedPointId(pointId);
    setSelectedPointId(pointId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!draggedPointId) return;
    e.stopPropagation();

    const point = perimeterDepthPoints.find(p => p.id === draggedPointId);
    if (!point) return;

    // Create a vertical plane at the point's X/Z position for raycasting
    const verticalPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), -point.x);
    const intersectionPoint = new THREE.Vector3();
    
    // Intersect the ray with the vertical plane
    if (e.ray.intersectPlane(verticalPlane, intersectionPoint)) {
      // Only allow vertical movement (depth change), constrain to reasonable values
      const newDepth = Math.max(1, Math.min(12, -intersectionPoint.y));

      const updatedPoints = perimeterDepthPoints.map(p =>
        p.id === draggedPointId ? { ...p, depth: newDepth } : p
      );

      onPointsChange(updatedPoints);
    }
  };

  const handlePointerUp = () => {
    setDraggedPointId(null);
  };

  // Click on empty space to deselect
  const handleGroupClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.eventObject.type === 'Group') {
      setSelectedPointId(null);
    }
  };

  // Create connecting lines along pool bottom perimeter
  const linePoints = perimeterDepthPoints.map(p => 
    new THREE.Vector3(p.x, -p.depth, p.z)
  );
  linePoints.push(linePoints[0]); // Close the loop

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);

  return (
    <group 
      onPointerMove={handlePointerMove} 
      onPointerUp={handlePointerUp}
      onClick={handleGroupClick}
    >
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
        const isSelected = selectedPointId === point.id;
        const scale = isDragged ? 1.2 : isHovered || isSelected ? 1.0 : 0.6;
        const color = isDragged ? '#ffff00' : isSelected ? '#ff6600' : isHovered ? '#00ff00' : '#00ffff';

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
                emissiveIntensity={isSelected ? 0.8 : 0.5}
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
                  color: isSelected ? '#ff6600' : '#00ffff',
                  transparent: true,
                  opacity: isSelected ? 0.6 : 0.3,
                  dashSize: 0.2,
                  gapSize: 0.1
                });
                const line = new THREE.Line(lineGeo, lineMat);
                line.computeLineDistances();
                return line;
              })()}
            />

            {/* Depth label */}
            {(isHovered || isDragged || isSelected) && (
              <Html position={[point.x, -point.depth + 1, point.z]} center>
                <div className={`px-2 py-1 rounded text-xs font-mono border ${
                  isSelected 
                    ? 'bg-orange-900/80 text-orange-400 border-orange-400/50' 
                    : 'bg-black/80 text-cyan-400 border-cyan-400/50'
                }`}>
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
