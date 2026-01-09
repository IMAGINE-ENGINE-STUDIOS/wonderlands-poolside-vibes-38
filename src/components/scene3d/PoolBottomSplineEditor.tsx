import { useRef, useState, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { PerimeterDepthPoint } from './types';
import { Plus, X } from 'lucide-react';

type PointType = 'linear' | 'smooth';

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
  const [hoveredSegmentIndex, setHoveredSegmentIndex] = useState<number | null>(null);
  const [internalSelectedPointId, setInternalSelectedPointId] = useState<string | null>(null);

  const selectedPointId = externalSelectedPointId ?? internalSelectedPointId;
  const setSelectedPointId = onSelectPoint ?? setInternalSelectedPointId;

  if (!enabled || perimeterDepthPoints.length === 0) return null;

  // Generate curve points for smooth interpolation
  const curvePoints = useMemo(() => {
    if (perimeterDepthPoints.length < 2) return [];
    
    const result: THREE.Vector3[] = [];
    
    for (let i = 0; i < perimeterDepthPoints.length; i++) {
      const curr = perimeterDepthPoints[i];
      const next = perimeterDepthPoints[(i + 1) % perimeterDepthPoints.length];
      const p0 = new THREE.Vector3(curr.x, -curr.depth, curr.z);
      const p1 = new THREE.Vector3(next.x, -next.depth, next.z);
      
      result.push(p0);
      
      // Use smooth interpolation for 'smooth' type points
      if (curr.type === 'smooth') {
        const segments = 12;
        const prev = perimeterDepthPoints[(i - 1 + perimeterDepthPoints.length) % perimeterDepthPoints.length];
        const nextNext = perimeterDepthPoints[(i + 2) % perimeterDepthPoints.length];
        const pMinus1 = new THREE.Vector3(prev.x, -prev.depth, prev.z);
        const p2 = new THREE.Vector3(nextNext.x, -nextNext.depth, nextNext.z);
        
        for (let t = 1; t <= segments; t++) {
          const alpha = t / segments;
          const tt = alpha * alpha;
          const ttt = tt * alpha;
          
          // Catmull-Rom spline interpolation
          const q = new THREE.Vector3(
            0.5 * (2 * p0.x + (-pMinus1.x + p1.x) * alpha + 
              (2 * pMinus1.x - 5 * p0.x + 4 * p1.x - p2.x) * tt + 
              (-pMinus1.x + 3 * p0.x - 3 * p1.x + p2.x) * ttt),
            0.5 * (2 * p0.y + (-pMinus1.y + p1.y) * alpha + 
              (2 * pMinus1.y - 5 * p0.y + 4 * p1.y - p2.y) * tt + 
              (-pMinus1.y + 3 * p0.y - 3 * p1.y + p2.y) * ttt),
            0.5 * (2 * p0.z + (-pMinus1.z + p1.z) * alpha + 
              (2 * pMinus1.z - 5 * p0.z + 4 * p1.z - p2.z) * tt + 
              (-pMinus1.z + 3 * p0.z - 3 * p1.z + p2.z) * ttt)
          );
          result.push(q);
        }
      } else {
        // Linear interpolation
        for (let t = 1; t <= 4; t++) {
          result.push(p0.clone().lerp(p1, t / 4));
        }
      }
    }
    
    return result;
  }, [perimeterDepthPoints]);

  // Main line points for rendering
  const mainLinePoints = useMemo(() => {
    if (curvePoints.length === 0) return [];
    const pts = curvePoints.map(p => [p.x, p.y, p.z] as [number, number, number]);
    pts.push(pts[0]); // Close the loop
    return pts;
  }, [curvePoints]);

  // Segment lines for editing
  const segmentLines = useMemo(() => {
    return perimeterDepthPoints.map((point, i) => {
      const next = perimeterDepthPoints[(i + 1) % perimeterDepthPoints.length];
      return {
        points: [
          [point.x, -point.depth, point.z],
          [next.x, -next.depth, next.z]
        ] as [[number, number, number], [number, number, number]],
        index: i
      };
    });
  }, [perimeterDepthPoints]);

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

  // Add a new point between two existing points
  const handleAddPoint = (index: number) => {
    const p1 = perimeterDepthPoints[index];
    const p2 = perimeterDepthPoints[(index + 1) % perimeterDepthPoints.length];
    
    const newPoint: PerimeterDepthPoint = {
      x: (p1.x + p2.x) / 2,
      z: (p1.z + p2.z) / 2,
      depth: (p1.depth + p2.depth) / 2,
      id: `perimeter-depth-${Date.now()}`,
      type: 'linear'
    };
    
    const newPoints = [
      ...perimeterDepthPoints.slice(0, index + 1),
      newPoint,
      ...perimeterDepthPoints.slice(index + 1)
    ];
    onPointsChange(newPoints);
  };

  // Delete a point (minimum 3 points required)
  const handleDeletePoint = (pointId: string) => {
    if (perimeterDepthPoints.length <= 3) {
      return;
    }
    onPointsChange(perimeterDepthPoints.filter(p => p.id !== pointId));
    if (selectedPointId === pointId) {
      setSelectedPointId(null);
    }
  };

  // Change point type
  const handleChangePointType = (pointId: string, type: PointType) => {
    onPointsChange(perimeterDepthPoints.map(p => 
      p.id === pointId ? { ...p, type } : p
    ));
  };

  // Get point visual properties
  const getPointColor = (point: PerimeterDepthPoint, isHovered: boolean, isDragged: boolean, isSelected: boolean) => {
    if (isDragged) return '#ffff00';
    if (isSelected) return '#ff6600';
    if (isHovered) return '#00ff00';
    return point.type === 'smooth' ? '#ff00ff' : '#00ffff';
  };

  return (
    <group 
      onPointerMove={handlePointerMove} 
      onPointerUp={handlePointerUp}
    >
      {/* Main connecting spline along pool floor edge */}
      {mainLinePoints.length > 0 && (
        <Line 
          points={mainLinePoints} 
          color="#00ffff" 
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      )}

      {/* Segment lines for hover detection */}
      {segmentLines.map(({ points: segPoints, index: i }) => (
        <Line 
          key={`seg-${i}`}
          points={segPoints}
          color={hoveredSegmentIndex === i ? '#ffff00' : '#00ffff'}
          lineWidth={1}
          transparent
          opacity={0.3}
          onPointerOver={() => setHoveredSegmentIndex(i)}
          onPointerOut={() => setHoveredSegmentIndex(null)}
        />
      ))}

      {/* Add point buttons on segment hover */}
      {perimeterDepthPoints.map((point, i) => {
        const next = perimeterDepthPoints[(i + 1) % perimeterDepthPoints.length];
        const midX = (point.x + next.x) / 2;
        const midZ = (point.z + next.z) / 2;
        const midDepth = (point.depth + next.depth) / 2;
        
        return (
          <group key={`add-${i}`} position={[midX, -midDepth + 1, midZ]}>
            {hoveredSegmentIndex === i && (
              <Html distanceFactor={10}>
                <button
                  onClick={() => handleAddPoint(i)}
                  className="bg-primary text-primary-foreground rounded-full p-2 shadow-xl hover:scale-110 transition-transform"
                  title="Add Point"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </Html>
            )}
          </group>
        );
      })}

      {/* Control points */}
      {perimeterDepthPoints.map((point, i) => {
        const isHovered = hoveredPointId === point.id;
        const isDragged = draggedPointId === point.id;
        const isSelected = selectedPointId === point.id;
        const scale = isDragged ? 1.2 : isHovered || isSelected ? 1.0 : 0.6;
        const color = getPointColor(point, isHovered, isDragged, isSelected);

        return (
          <group key={point.id}>
            {/* Visual control sphere */}
            <mesh
              position={[point.x, -point.depth, point.z]}
              onPointerDown={handlePointerDown(point.id)}
              onPointerEnter={() => setHoveredPointId(point.id)}
              onPointerLeave={() => setHoveredPointId(null)}
            >
              {point.type === 'smooth' ? (
                <dodecahedronGeometry args={[scale, 0]} />
              ) : (
                <sphereGeometry args={[scale, 16, 16]} />
              )}
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isSelected ? 0.8 : 0.5}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Vertical guide line from water surface to point */}
            <Line
              points={[
                [point.x, 0, point.z],
                [point.x, -point.depth, point.z]
              ]}
              color={isSelected ? '#ff6600' : '#00ffff'}
              lineWidth={1}
              transparent
              opacity={isSelected ? 0.6 : 0.3}
              dashed
              dashSize={0.2}
              gapSize={0.1}
            />

            {/* Ground marker */}
            <mesh position={[point.x, 0, point.z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
              <meshStandardMaterial 
                color={color}
                emissive={color}
                emissiveIntensity={0.4}
              />
            </mesh>

            {/* Control panel when point is active */}
            {(isHovered || isDragged || isSelected) && (
              <Html position={[point.x, -point.depth + 2, point.z]} center>
                <div className="bg-background/95 backdrop-blur-sm text-foreground px-4 py-3 rounded-lg text-sm shadow-2xl border border-border min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">Floor Point {i + 1}</div>
                    {perimeterDepthPoints.length > 3 && (
                      <button
                        onClick={() => handleDeletePoint(point.id)}
                        className="text-destructive hover:bg-destructive/10 rounded p-1 transition-colors"
                        title="Delete Point"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    <div>Depth: <span className="font-mono text-cyan-400">{point.depth.toFixed(1)}' deep</span></div>
                    <div>X: {point.x.toFixed(1)} ft | Z: {point.z.toFixed(1)} ft</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-semibold mb-1">Point Type:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {(['linear', 'smooth'] as PointType[]).map(type => (
                        <button
                          key={type}
                          onClick={() => handleChangePointType(point.id, type)}
                          className={`px-2 py-1 rounded text-xs transition-colors capitalize ${
                            point.type === type 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    Drag vertically to change depth
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
