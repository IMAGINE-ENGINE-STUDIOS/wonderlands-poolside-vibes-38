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
  enableEdit = true,
  name = 'Pool Edge',
  yPosition = 0,
  showControls = true
}: PoolSplineEditorProps) {
  const [draggedPoint, setDraggedPoint] = useState<string | null>(null);
  const [hoverPoint, setHoverPoint] = useState<string | null>(null);
  const [hoverSegment, setHoverSegment] = useState<number | null>(null);

  // Generate curve points using Catmull-Rom splines
  const curvePoints = useMemo(() => {
    if (points.length < 2) return [];
    
    const result: THREE.Vector3[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      const p0 = new THREE.Vector3(curr.x, yPosition, curr.z);
      const p1 = new THREE.Vector3(next.x, yPosition, next.z);
      
      result.push(p0);
      
      if (curr.type === 'curve' || curr.type === 'smooth') {
        const segments = 16;
        const prev = points[(i - 1 + points.length) % points.length];
        const nextNext = points[(i + 2) % points.length];
        const pMinus1 = new THREE.Vector3(prev.x, yPosition, prev.z);
        const p2 = new THREE.Vector3(nextNext.x, yPosition, nextNext.z);
        
        for (let t = 1; t <= segments; t++) {
          const alpha = t / segments;
          const tt = alpha * alpha;
          const ttt = tt * alpha;
          
          const q = new THREE.Vector3(
            0.5 * (2 * p0.x + (-pMinus1.x + p1.x) * alpha + 
              (2 * pMinus1.x - 5 * p0.x + 4 * p1.x - p2.x) * tt + 
              (-pMinus1.x + 3 * p0.x - 3 * p1.x + p2.x) * ttt),
            yPosition,
            0.5 * (2 * p0.z + (-pMinus1.z + p1.z) * alpha + 
              (2 * pMinus1.z - 5 * p0.z + 4 * p1.z - p2.z) * tt + 
              (-pMinus1.z + 3 * p0.z - 3 * p1.z + p2.z) * ttt)
          );
          result.push(q);
        }
      } else {
        for (let t = 1; t <= 4; t++) {
          result.push(p0.clone().lerp(p1, t / 4));
        }
      }
    }
    
    return result;
  }, [points, yPosition]);

  // Main line geometry
  const mainLineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(curvePoints.length * 3 + 3);
    curvePoints.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    if (curvePoints.length > 0) {
      positions[curvePoints.length * 3] = curvePoints[0].x;
      positions[curvePoints.length * 3 + 1] = curvePoints[0].y;
      positions[curvePoints.length * 3 + 2] = curvePoints[0].z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [curvePoints]);

  // Segment geometries
  const segmentGeos = useMemo(() => {
    if (!enableEdit || points.length < 2) return [];
    return points.map((point, i) => {
      const next = points[(i + 1) % points.length];
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array([point.x, yPosition, point.z, next.x, yPosition, next.z]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return geo;
    });
  }, [points, yPosition, enableEdit]);

  // Shared vertical line geometry
  const vertLineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array([0, 0, 0, 0, -1.5, 0]);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

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
    onPointsChange(points.map(p =>
      p.id === draggedPoint ? { ...p, x: intersection.point.x, z: intersection.point.z } : p
    ));
  };

  const handlePointerUp = () => setDraggedPoint(null);

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
    onPointsChange(points.map(p => p.id === pointId ? { ...p, type } : p));
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
      <line>
        <primitive object={mainLineGeo} attach="geometry" />
        <lineBasicMaterial color={color} />
      </line>

      {enableEdit && segmentGeos.map((geo, i) => (
        <line
          key={`seg-${i}`}
          onPointerOver={() => setHoverSegment(i)}
          onPointerOut={() => setHoverSegment(null)}
        >
          <primitive object={geo} attach="geometry" />
          <lineBasicMaterial color={hoverSegment === i ? '#ffff00' : color} transparent opacity={0.3} />
        </line>
      ))}

      {enableEdit && showControls && points.map((point, i) => {
        const next = points[(i + 1) % points.length];
        const midX = (point.x + next.x) / 2;
        const midZ = (point.z + next.z) / 2;
        return (
          <group key={`add-${i}`} position={[midX, yPosition + 2, midZ]}>
            {hoverSegment === i && (
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

      {points.map((point, i) => {
        const isHovered = hoverPoint === point.id;
        const isDragged = draggedPoint === point.id;
        const pointColor = getPointColor(point, isHovered, isDragged);
        const pointSize = isDragged ? 0.7 : isHovered ? 0.6 : 0.5;
        const shape = getPointShape(point.type);

        return (
          <group key={point.id} position={[point.x, yPosition + 1.5, point.z]}>
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
            
            <line>
              <primitive object={vertLineGeo} attach="geometry" />
              <lineBasicMaterial color={pointColor} opacity={0.7} transparent />
            </line>
            
            <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              {point.type === 'corner' ? (
                <boxGeometry args={[0.3, 0.3, 0.05]} />
              ) : (
                <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
              )}
              <meshStandardMaterial 
                color={pointColor}
                emissive={pointColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {enableEdit && showControls && (isHovered || isDragged) && (
              <Html distanceFactor={10}>
                <div className="bg-background/95 backdrop-blur-sm text-foreground px-4 py-3 rounded-lg text-sm shadow-2xl border border-border min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">{name} Point {i + 1}</div>
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
                      {(['linear', 'curve', 'smooth', 'corner'] as PointType[]).map(type => (
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
