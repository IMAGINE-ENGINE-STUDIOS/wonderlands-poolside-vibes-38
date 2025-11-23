import { useState, useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { X, Plus } from 'lucide-react';

export type PointType = 'linear' | 'curve' | 'smooth' | 'corner';

export interface SplinePoint {
  x: number;
  y: number;
  z: number;
  id: string;
  type: PointType;
}

interface PoolSplineEditorProps {
  points: SplinePoint[];
  onPointsChange: (points: SplinePoint[]) => void;
  color?: string;
  lineWidth?: number;
  enableEdit?: boolean;
  name?: string;
  yPosition?: number;
  showControls?: boolean;
}

export function PoolSplineEditor({
  points,
  onPointsChange,
  color = '#00ff00',
  lineWidth = 3,
  enableEdit = true,
  name = 'Pool Edge',
  yPosition = 0,
  showControls = true
}: PoolSplineEditorProps) {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<string | null>(null);
  const [hoverSegment, setHoverSegment] = useState<number | null>(null);

  // Create smooth curve through points based on their types
  const curvePoints = useMemo(() => {
    if (points.length < 2) return [];
    
    const allPoints: THREE.Vector3[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      
      const p0 = new THREE.Vector3(curr.x, yPosition, curr.z);
      const p1 = new THREE.Vector3(next.x, yPosition, next.z);
      
      // Add current point
      allPoints.push(p0);
      
      // Generate intermediate points based on point type
      if (curr.type === 'curve' || curr.type === 'smooth') {
        const segments = 16; // Number of segments for smooth curves
        const prev = points[(i - 1 + points.length) % points.length];
        const nextNext = points[(i + 2) % points.length];
        
        // Catmull-Rom spline for smooth curves
        const p_1 = new THREE.Vector3(prev.x, yPosition, prev.z);
        const p2 = new THREE.Vector3(nextNext.x, yPosition, nextNext.z);
        
        for (let t = 1; t <= segments; t++) {
          const alpha = t / segments;
          const tt = alpha * alpha;
          const ttt = tt * alpha;
          
          // Catmull-Rom formula
          const q = new THREE.Vector3();
          q.x = 0.5 * (
            2 * p0.x +
            (-p_1.x + p1.x) * alpha +
            (2 * p_1.x - 5 * p0.x + 4 * p1.x - p2.x) * tt +
            (-p_1.x + 3 * p0.x - 3 * p1.x + p2.x) * ttt
          );
          q.z = 0.5 * (
            2 * p0.z +
            (-p_1.z + p1.z) * alpha +
            (2 * p_1.z - 5 * p0.z + 4 * p1.z - p2.z) * tt +
            (-p_1.z + 3 * p0.z - 3 * p1.z + p2.z) * ttt
          );
          q.y = yPosition;
          
          allPoints.push(q);
        }
      } else {
        // Linear or corner - just add a few points for straight line
        for (let t = 1; t <= 4; t++) {
          const alpha = t / 4;
          const intermediate = p0.clone().lerp(p1, alpha);
          allPoints.push(intermediate);
        }
      }
    }
    
    return allPoints;
  }, [points, yPosition]);

  // Create line geometry
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    
    curvePoints.forEach(p => {
      positions.push(p.x, p.y, p.z);
    });
    
    // Close the loop
    if (curvePoints.length > 0) {
      positions.push(curvePoints[0].x, curvePoints[0].y, curvePoints[0].z);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [curvePoints]);

  const handlePointerDown = (pointId: string) => (e: any) => {
    if (!enableEdit) return;
    e.stopPropagation();
    setDraggedPoint(pointId);
  };

  const handlePointerMove = (e: any) => {
    if (!draggedPoint || !enableEdit) return;
    e.stopPropagation();

    const intersection = e.intersections[0];
    if (!intersection) return;

    const updatedPoints = points.map(p =>
      p.id === draggedPoint
        ? { ...p, x: intersection.point.x, z: intersection.point.z }
        : p
    );
    onPointsChange(updatedPoints);
  };

  const handlePointerUp = () => {
    setDraggedPoint(null);
  };

  const handleDeletePoint = (pointId: string) => {
    if (points.length <= 3) {
      alert('Pool must have at least 3 points');
      return;
    }
    onPointsChange(points.filter(p => p.id !== pointId));
  };

  const handleAddPoint = (index: number) => {
    const curr = points[index];
    const next = points[(index + 1) % points.length];
    
    const newPoint: SplinePoint = {
      x: (curr.x + next.x) / 2,
      z: (curr.z + next.z) / 2,
      y: yPosition,
      id: `point-${Date.now()}`,
      type: 'linear'
    };
    
    const newPoints = [...points];
    newPoints.splice(index + 1, 0, newPoint);
    onPointsChange(newPoints);
  };

  const handleChangePointType = (pointId: string, type: PointType) => {
    onPointsChange(points.map(p => 
      p.id === pointId ? { ...p, type } : p
    ));
  };

  const getPointColor = (point: SplinePoint, isHovered: boolean, isDragged: boolean) => {
    if (isDragged) return '#ff0000';
    if (isHovered) return '#ffff00';
    
    switch (point.type) {
      case 'linear': return '#00ff00';
      case 'curve': return '#00ffff';
      case 'smooth': return '#ff00ff';
      case 'corner': return '#ff8800';
      default: return color;
    }
  };

  const getPointShape = (type: PointType) => {
    switch (type) {
      case 'linear': return 'sphere';
      case 'curve': return 'octahedron';
      case 'smooth': return 'dodecahedron';
      case 'corner': return 'box';
      default: return 'sphere';
    }
  };

  return (
    <group>
      {/* Main spline curve */}
      <line>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial color={color} />
      </line>

      {/* Thicker invisible line for easier segment hovering */}
      {enableEdit && points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        const segmentGeometry = new THREE.BufferGeometry();
        segmentGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
          point.x, yPosition, point.z,
          next.x, yPosition, next.z
        ], 3));
        
        return (
          <line
            key={`segment-${index}`}
            onPointerOver={() => setHoverSegment(index)}
            onPointerOut={() => setHoverSegment(null)}
          >
            <primitive object={segmentGeometry} attach="geometry" />
            <lineBasicMaterial 
              color={hoverSegment === index ? '#ffff00' : color} 
              transparent
              opacity={0.3}
            />
          </line>
        );
      })}

      {/* Add point buttons on segments */}
      {enableEdit && showControls && points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        const midX = (point.x + next.x) / 2;
        const midZ = (point.z + next.z) / 2;
        
        return (
          <group key={`add-${index}`} position={[midX, yPosition + 2, midZ]}>
            {hoverSegment === index && (
              <Html distanceFactor={10}>
                <button
                  onClick={() => handleAddPoint(index)}
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
      {points.map((point, index) => {
        const isHovered = hoverPoint === point.id;
        const isDragged = draggedPoint === point.id;
        const pointColor = getPointColor(point, isHovered, isDragged);
        const pointSize = isDragged ? 0.7 : isHovered ? 0.6 : 0.5;
        const shape = getPointShape(point.type);

        return (
          <group key={point.id} position={[point.x, yPosition + 1.5, point.z]}>
            {/* Control point geometry based on type */}
            <mesh
              onPointerDown={handlePointerDown(point.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOver={() => setHoverPoint(point.id)}
              onPointerOut={() => setHoverPoint(null)}
            >
              {shape === 'sphere' && <sphereGeometry args={[pointSize, 16, 16]} />}
              {shape === 'octahedron' && <octahedronGeometry args={[pointSize, 0]} />}
              {shape === 'dodecahedron' && <dodecahedronGeometry args={[pointSize, 0]} />}
              {shape === 'box' && <boxGeometry args={[pointSize * 1.4, pointSize * 1.4, pointSize * 1.4]} />}
              <meshStandardMaterial 
                color={pointColor} 
                emissive={pointColor}
                emissiveIntensity={0.6}
                metalness={0.4}
                roughness={0.3}
              />
            </mesh>
            
            {/* Vertical indicator line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes.position"
                  count={2}
                  array={new Float32Array([0, 0, 0, 0, -1.5, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color={pointColor} opacity={0.7} transparent />
            </line>
            
            {/* Surface marker */}
            <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              {point.type === 'corner' && <boxGeometry args={[0.3, 0.3, 0.05]} />}
              {point.type !== 'corner' && <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />}
              <meshStandardMaterial 
                color={pointColor}
                emissive={pointColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Controls UI */}
            {enableEdit && showControls && (isHovered || isDragged) && (
              <Html distanceFactor={10}>
                <div className="bg-background/95 backdrop-blur-sm text-foreground px-4 py-3 rounded-lg text-sm shadow-2xl border border-border min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">{name} Point {index + 1}</div>
                    {points.length > 3 && (
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
                    X: {point.x.toFixed(2)} ft | Z: {point.z.toFixed(2)} ft
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-semibold mb-1">Point Type:</div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => handleChangePointType(point.id, 'linear')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          point.type === 'linear' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Linear
                      </button>
                      <button
                        onClick={() => handleChangePointType(point.id, 'curve')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          point.type === 'curve' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Curve
                      </button>
                      <button
                        onClick={() => handleChangePointType(point.id, 'smooth')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          point.type === 'smooth' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Smooth
                      </button>
                      <button
                        onClick={() => handleChangePointType(point.id, 'corner')}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          point.type === 'corner' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        Corner
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    Drag to move • Click type to change
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
