import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';

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
  const [hoverMidpoint, setHoverMidpoint] = useState<number | null>(null);

  const handlePointerDown = (pointId: string) => (e: any) => {
    if (!enableDrag) return;
    e.stopPropagation();
    (e.target as any).setPointerCapture?.(e.pointerId);
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
      (e.target as any).releasePointerCapture?.(e.pointerId);
    }
    setDraggedPoint(null);
  };

  // Add point at midpoint between two existing points
  const handleAddPoint = (segmentIndex: number) => {
    const p1 = points[segmentIndex];
    const p2 = points[(segmentIndex + 1) % points.length];
    
    const newPoint: SplinePoint = {
      x: (p1.x + p2.x) / 2,
      y: yPosition,
      z: (p1.z + p2.z) / 2,
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Insert new point after segmentIndex
    const newPoints = [...points];
    newPoints.splice(segmentIndex + 1, 0, newPoint);
    onPointsChange(newPoints);
  };

  // Remove a point (minimum 3 points required)
  const handleRemovePoint = (pointId: string) => {
    if (points.length <= 3) return; // Minimum 3 points for a valid shape
    const newPoints = points.filter(p => p.id !== pointId);
    onPointsChange(newPoints);
  };

  // Calculate midpoints for add buttons
  const midpoints = useMemo(() => {
    return points.map((p, i) => {
      const next = points[(i + 1) % points.length];
      return {
        x: (p.x + next.x) / 2,
        z: (p.z + next.z) / 2,
        segmentIndex: i
      };
    });
  }, [points]);

  // Calculate line points for Drei's Line component
  const linePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    points.forEach(p => {
      pts.push([p.x, yPosition, p.z]);
    });
    // Close the loop
    if (points.length > 0) {
      pts.push([points[0].x, yPosition, points[0].z]);
    }
    return pts;
  }, [points, yPosition]);

  return (
    <group>
      {/* Spline curve line */}
      <Line points={linePoints} color={color} lineWidth={lineWidth} />

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
            <Line 
              points={[[0, 0, 0], [0, -1.5, 0]]} 
              color={pointColor} 
              lineWidth={1}
              transparent
              opacity={0.6}
            />
            
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
                  {points.length > 3 && (
                    <button 
                      className="mt-2 bg-red-500/80 hover:bg-red-500 px-2 py-1 rounded text-xs w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePoint(point.id);
                      }}
                    >
                      Remove Point
                    </button>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Midpoint add buttons */}
      {midpoints.map((mp, index) => {
        const isHovered = hoverMidpoint === index;
        
        return (
          <group key={`midpoint-${index}`} position={[mp.x, yPosition + 1, mp.z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                handleAddPoint(mp.segmentIndex);
              }}
              onPointerOver={() => setHoverMidpoint(index)}
              onPointerOut={() => setHoverMidpoint(null)}
            >
              <sphereGeometry args={[isHovered ? 0.35 : 0.25, 16, 16]} />
              <meshStandardMaterial 
                color={isHovered ? '#00ff00' : '#ffffff'}
                emissive={isHovered ? '#00ff00' : '#ffffff'}
                emissiveIntensity={isHovered ? 0.6 : 0.3}
                transparent
                opacity={isHovered ? 1 : 0.7}
              />
            </mesh>
            
            {/* Plus icon indicator */}
            <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <mesh>
                <boxGeometry args={[0.15, 0.03, 0.03]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
              <mesh>
                <boxGeometry args={[0.03, 0.15, 0.03]} />
                <meshBasicMaterial color="#000000" />
              </mesh>
            </group>
            
            {isHovered && (
              <Html distanceFactor={10}>
                <div className="bg-green-600/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap shadow-xl">
                  Click to add point
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
