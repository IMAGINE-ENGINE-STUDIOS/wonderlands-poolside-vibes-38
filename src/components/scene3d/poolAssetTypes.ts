// Pool Asset Types for stairs, chairs, and other interactive pool elements

export interface PoolStairConfig {
  id: string;
  wallPosition: number;      // 0-1 position along pool perimeter
  shape: 'linear' | 'curved';
  width: number;             // Width in feet
  numSteps: number;
  stepHeight: number;        // Height per step (default 7.5 inches = 0.625 ft)
  stepDepth: number;         // Depth per step (default 11 inches = 0.917 ft)
  textureUrl: string;
  cornerRadius?: number;     // For curved stairs
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
}

export interface PoolJetConfig {
  id: string;
  wallPosition: number;
  depthFromSurface: number;
  type: 'standard' | 'bubbler' | 'waterfall';
  intensity: number;
  isOn: boolean;
}

export interface ContourSeatingConfig {
  id: string;
  startPosition: number;    // 0-1 position along pool perimeter (start)
  endPosition: number;      // 0-1 position along pool perimeter (end)
  width: number;            // Width extending into pool (default 1.5 ft)
  height: number;           // Depth below water for top surface (default 1 ft)
  textureUrl: string;
}

export type PoolAsset = PoolStairConfig | PoolChairConfig | PoolJetConfig | ContourSeatingConfig;
