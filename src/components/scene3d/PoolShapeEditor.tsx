import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { X, Plus } from 'lucide-react';

export type PointType = 'linear' | 'curve' | 'smooth' | 'corner';

export interface ShapePoint {
  x: number;
  y: number;
  z: number;
  id: string;
  type: PointType;
}

interface PoolShapeEditorProps {
  points: ShapePoint[];
  onPointsChange: (points: ShapePoint[]) => void;
  color?: string;
  yPosition?: number;
  enabled?: boolean;
  name?: string;
}

// Helper: Generate smooth curve through points
function generateCurvePoints(points: ShapePoint[], yPos: number): THREE.Vector3[] {
  if (points.length < 2) return [];
  
  const result: THREE.Vector3[] = [];
  const len = points.length;
  
  for (let i = 0; i < len; i++) {
    const curr = points[i];
    const next = points[(i + 1) % len];
    const p0 = new THREE.Vector3(curr.x, yPos, curr.z);
    const p1 = new THREE.Vector3(next.x, yPos, next.z);
    
    result.push(p0);
    
    // Add interpolated points based on type
    const steps = curr.type === 'curve' || curr.type === 'smooth' ? 16 : 4;
    
    if (curr.type === 'curve' || curr.type === 'smooth') {
      // Catmull-Rom spline
      const prev = points[(i - 1 + len) % len];
      const nextNext = points[(i + 2) % len];
      const pMinus = new THREE.Vector3(prev.x, yPos, prev.z);
      const pPlus = new THREE.Vector3(nextNext.x, yPos, nextNext.z);
      
      for (let t = 1; t <= steps; t++) {
        const alpha = t / steps;
        const a2 = alpha * alpha;
        const a3 = a2 * alpha;
        
        const x = 0.5 * (2 * p0.x + (-pMinus.x + p1.x) * alpha + 
          (2 * pMinus.x - 5 * p0.x + 4 * p1.x - pPlus.x) * a2 + 
          (-pMinus.x + 3 * p0.x - 3 * p1.x + pPlus.x) * a3);
        const z = 0.5 * (2 * p0.z + (-pMinus.z + p1.z) * alpha + 
          (2 * pMinus.z - 5 * p0.z + 4 * p1.z - pPlus.z) * a2 + 
          (-pMinus.z + 3 * p0.z - 3 * p1.z + pPlus.z) * a3);
        
        result.push(new THREE.Vector3(x, yPos, z));
      }
    } else {
      // Linear interpolation
      for (let t = 1; t <= steps; t++) {
        result.push(p0.clone().lerp(p1, t / steps));
      }
    }
  }
  
  return result;
}

// Main Line Component
function CurveLine({ points, yPos, color }: { points: ShapePoint[]; yPos: number; color: string }) {
  const lineRef = useRef<THREE.Line>(null!);
  
  useFrame(() => {
    if (!lineRef.current) return;
    
    const curvePoints = generateCurvePoints(points, yPos);
    const positions = new Float32Array((curvePoints.length + 1) * 3);
    
    curvePoints.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    
    // Close loop
    if (curvePoints.length > 0) {
      positions[curvePoints.length * 3] = curvePoints[0].x;
      positions[curvePoints.length * 3 + 1] = curvePoints[0].y;
      positions[curvePoints.length * 3 + 2] = curvePoints[0].z;
    }
    
    lineRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  });
  
  return (
    <line ref={lineRef as any}>
      <bufferGeometry />
      <lineBasicMaterial color={color} />
    </line>
  );
}

// Control Point Component
function ControlPoint({
  point,
  index,
  yPos,
  onDragStart,
  onDrag,
  onDragEnd,
  onDelete,
  onChangeType,
  isDragged,
  isHovered,
  onHover,
  totalPoints,
  name
}: {
  point: ShapePoint;
  index: number;
  yPos: number;
  onDragStart: (id: string) => void;
  onDrag: (id: string, pos: THREE.Vector3) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  onChangeType: (id: string, type: PointType) => void;
  isDragged: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  totalPoints: number;
  name: string;
}) {
  const getColor = () => {
    if (isDragged) return '#ff0000';
    if (isHovered) return '#ffff00';
    switch (point.type) {
      case 'curve': return '#00ffff';
      case 'smooth': return '#ff00ff';
      case 'corner': return '#ff8800';
      default: return '#00ff00';
    }
  };
  
  const size = isDragged ? 0.7 : isHovered ? 0.6 : 0.5;
  const color = getColor();
  
  const verticalLineGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, 0, -1.5, 0]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);
  
  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    onDragStart(point.id);
  }, [point.id, onDragStart]);
  
  const handlePointerMove = useCallback((e: any) => {
    e.stopPropagation();
    if (isDragged && e.intersections[0]) {
      const pos = e.intersections[0].point;
      onDrag(point.id, pos);
    }
  }, [isDragged, point.id, onDrag]);
  
  return (
    <group position={[point.x, yPos + 1.5, point.z]}>
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={onDragEnd}
        onPointerOver={() => onHover(point.id)}
        onPointerOut={() => onHover(null)}
      >
        {point.type === 'corner' ? (
          <boxGeometry args={[size * 1.4, size * 1.4, size * 1.4]} />
        ) : point.type === 'curve' ? (
          <octahedronGeometry args={[size]} />
        ) : point.type === 'smooth' ? (
          <dodecahedronGeometry args={[size]} />
        ) : (
          <sphereGeometry args={[size, 16, 16]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      
      {/* Vertical line */}
      <primitive 
        object={new THREE.Line(
          verticalLineGeo,
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 })
        )}
      />
      
      {/* Surface marker */}
      <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {point.type === 'corner' ? (
          <boxGeometry args={[0.3, 0.3, 0.05]} />
        ) : (
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        )}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      
      {/* UI */}
      {(isHovered || isDragged) && (
        <Html distanceFactor={10}>
          <div className="bg-background/95 backdrop-blur-sm text-foreground px-4 py-3 rounded-lg text-sm shadow-2xl border border-border min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold">{name} Point {index + 1}</div>
              {totalPoints > 3 && (
                <button
                  onClick={() => onDelete(point.id)}
                  className="text-destructive hover:bg-destructive/10 rounded p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              X: {point.x.toFixed(2)} | Z: {point.z.toFixed(2)}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold mb-1">Type:</div>
              <div className="grid grid-cols-2 gap-1">
                {(['linear', 'curve', 'smooth', 'corner'] as PointType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => onChangeType(point.id, type)}
                    className={`px-2 py-1 rounded text-xs capitalize ${
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
          </div>
        </Html>
      )}
    </group>
  );
}

// Segment hover line
function SegmentLine({
  p1,
  p2,
  yPos,
  index,
  color,
  isHovered,
  onHover,
  onAddPoint
}: {
  p1: ShapePoint;
  p2: ShapePoint;
  yPos: number;
  index: number;
  color: string;
  isHovered: boolean;
  onHover: (idx: number | null) => void;
  onAddPoint: (idx: number) => void;
}) {
  const midX = (p1.x + p2.x) / 2;
  const midZ = (p1.z + p2.z) / 2;
  
  const segmentGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([p1.x, yPos, p1.z, p2.x, yPos, p2.z]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [p1.x, p1.z, p2.x, p2.z, yPos]);
  
  return (
    <>
      <primitive 
        object={new THREE.Line(
          segmentGeo,
          new THREE.LineBasicMaterial({ 
            color: isHovered ? '#ffff00' : color, 
            transparent: true, 
            opacity: 0.3 
          })
        )}
        onPointerOver={() => onHover(index)}
        onPointerOut={() => onHover(null)}
      />
      
      {isHovered && (
        <group position={[midX, yPos + 2, midZ]}>
          <Html distanceFactor={10}>
            <button
              onClick={() => onAddPoint(index)}
              className="bg-primary text-primary-foreground rounded-full p-2 shadow-xl hover:scale-110"
            >
              <Plus className="w-4 h-4" />
            </button>
          </Html>
        </group>
      )}
    </>
  );
}

export function PoolShapeEditor({
  points,
  onPointsChange,
  color = '#00ff00',
  yPosition = 0,
  enabled = true,
  name = 'Pool Edge'
}: PoolShapeEditorProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  
  const handleDragStart = useCallback((id: string) => {
    if (enabled) setDraggedId(id);
  }, [enabled]);
  
  const handleDrag = useCallback((id: string, pos: THREE.Vector3) => {
    if (!enabled || !draggedId) return;
    onPointsChange(points.map(p => 
      p.id === id ? { ...p, x: pos.x, z: pos.z } : p
    ));
  }, [enabled, draggedId, points, onPointsChange]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);
  
  const handleDelete = useCallback((id: string) => {
    if (points.length <= 3) {
      alert('Must have at least 3 points');
      return;
    }
    onPointsChange(points.filter(p => p.id !== id));
  }, [points, onPointsChange]);
  
  const handleChangeType = useCallback((id: string, type: PointType) => {
    onPointsChange(points.map(p => p.id === id ? { ...p, type } : p));
  }, [points, onPointsChange]);
  
  const handleAddPoint = useCallback((index: number) => {
    const curr = points[index];
    const next = points[(index + 1) % points.length];
    const newPt: ShapePoint = {
      x: (curr.x + next.x) / 2,
      z: (curr.z + next.z) / 2,
      y: yPosition,
      id: `pt-${Date.now()}`,
      type: 'linear'
    };
    const updated = [...points];
    updated.splice(index + 1, 0, newPt);
    onPointsChange(updated);
  }, [points, yPosition, onPointsChange]);
  
  if (!enabled) return null;
  
  return (
    <group>
      <CurveLine points={points} yPos={yPosition} color={color} />
      
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        return (
          <SegmentLine
            key={`seg-${i}`}
            p1={p}
            p2={next}
            yPos={yPosition}
            index={i}
            color={color}
            isHovered={hoveredSegment === i}
            onHover={setHoveredSegment}
            onAddPoint={handleAddPoint}
          />
        );
      })}
      
      {points.map((p, i) => (
        <ControlPoint
          key={p.id}
          point={p}
          index={i}
          yPos={yPosition}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onDelete={handleDelete}
          onChangeType={handleChangeType}
          isDragged={draggedId === p.id}
          isHovered={hoveredId === p.id}
          onHover={setHoveredId}
          totalPoints={points.length}
          name={name}
        />
      ))}
    </group>
  );
}
