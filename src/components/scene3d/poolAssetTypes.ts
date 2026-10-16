// Pool Asset Types for stairs, chairs, and other interactive pool elements

export interface StairSplinePoint {
  position: number;  // 0-1 along stair length
  widthOffset: number;  // Offset from base width
  depthOffset: number;  // Offset from base step depth
}

export interface PoolStairConfig {
  id: string;
  wallPosition: number;      // 0-1 position along pool perimeter
  shape: 'linear' | 'curved';
  /** Visual style: classic full steps, tiered wedding-cake, wide bench entry, or floating slabs */
  style?: 'classic' | 'wedding-cake' | 'bench' | 'floating';
  /** Soft (rounded) edge radius on every step, in feet (0 = sharp) */
  softEdge?: number;
  width: number;             // Width in feet
  numSteps: number;
  stepHeight: number;        // Height per step (default 7.5 inches = 0.625 ft)
  stepDepth: number;         // Depth per step (default 11 inches = 0.917 ft)
  textureUrl: string;
  cornerRadius?: number;     // For curved stairs
  splinePoints?: StairSplinePoint[];  // Control points for custom shaping
}

export interface PoolChairConfig {
  id: string;
  wallPosition: number;      // 0-1 position along pool perimeter (if snapped to wall)
  floorPosition?: { x: number; z: number }; // Position if not snapped to wall
  width: number;             // Width in feet
  depth: number;             // Depth in feet
  height: number;            // Height from floor in feet
  cornerRadius: number;      // Rounded edges radius
  textureUrl: string;
  snapToWall: boolean;       // Whether to snap to wall or free-position
  followFloor: boolean;      // Whether to follow pool floor depth
  name?: string;
  /** 'block' = tanning ledge / bench, 'barstool' = submerged round bar stools */
  style?: 'block' | 'barstool';
  /** Bar stools: how many in the row and the gap between centres (ft) */
  count?: number;
  spacing?: number;
}

export interface PoolJetConfig {
  id: string;
  wallPosition: number;
  depthFromSurface: number;
  type: 'standard' | 'bubbler' | 'waterfall';
  intensity: number;
  isOn: boolean;
}

export interface SeatingSplinePoint {
  position: number;  // 0-1 along seating perimeter section
  width: number;     // Width at this point
  depth: number;     // Depth below water at this point
}

export interface ContourSeatingConfig {
  id: string;
  /** Procedural preset: every seat is swept along the wall so it bends round corners and can wrap 360°. */
  kind?: 'contour' | 'sunbench' | 'lounge' | 'bench' | 'corner';
  startPosition: number;    // 0-1 position along pool perimeter (start)
  endPosition: number;      // end along perimeter; may exceed 1 (wraps the seam, up to start + 1 = full 360°)
  width: number;            // Width extending into pool (default 1.5 ft)
  softEdge?: number;        // rounded nosing radius on the inner top edge (ft)
  height: number;           // Depth below water for top surface (default 1 ft)
  textureUrl: string;
  splinePoints?: SeatingSplinePoint[];  // Control points for variable width/depth
}

export type PoolAsset = PoolStairConfig | PoolChairConfig | PoolJetConfig | ContourSeatingConfig;
