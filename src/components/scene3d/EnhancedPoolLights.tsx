import { useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { PoolLightConfig } from './types';
import { DraggablePoolLight } from './DraggablePoolLight';
import { generateCurvedPoolPoints, normalize2DTo3D } from '@/utils/curveUtils';

interface EnhancedPoolLightsProps {
  poolPoints: Array<{ x: number; y: number; id: string }>;
  lights: PoolLightConfig[];
  onLightsChange: (lights: PoolLightConfig[]) => void;
  selectedLightId: string | null;
  onSelectLight: (id: string | null) => void;
}

export function EnhancedPoolLights({
  poolPoints,
  lights,
  onLightsChange,
  selectedLightId,
  onSelectLight
}: EnhancedPoolLightsProps) {
  // Gradient animation state
  const [gradientHue, setGradientHue] = useState(0);

  // Animate gradient color
  useFrame((state, delta) => {
    // Complete color cycle every 10 seconds
    setGradientHue(prev => (prev + delta * 36) % 360);
  });

  // Generate pool perimeter for light positioning
  const poolPerimeter = useMemo(() => {
    if (poolPoints.length < 3) return [];

    const curvedPoints = generateCurvedPoolPoints(
      poolPoints.map(p => ({ x: p.x, y: p.y })),
      30,
      0.3
    );
    
    return normalize2DTo3D(curvedPoints);
  }, [poolPoints]);

  // Handle light position change from dragging
  const handlePositionChange = useCallback((lightId: string, wallPosition: number) => {
    onLightsChange(lights.map(l =>
      l.id === lightId ? { ...l, wallPosition } : l
    ));
  }, [lights, onLightsChange]);

  if (poolPerimeter.length === 0) return null;

  return (
    <group>
      {lights.map(light => (
        <DraggablePoolLight
          key={light.id}
          light={light}
          poolPerimeter={poolPerimeter}
          onPositionChange={handlePositionChange}
          isSelected={light.id === selectedLightId}
          onSelect={onSelectLight}
          gradientHue={gradientHue}
        />
      ))}
    </group>
  );
}

// Create default lights (2 lights at 25% and 75% of perimeter)
export function createDefaultPoolLights(isNightMode: boolean = false): PoolLightConfig[] {
  return [
    {
      id: 'light-default-1',
      wallPosition: 0.25,
      depthFromSurface: 1.5,
      color: '#ffffff',
      colorMode: 'white',
      intensity: 2,
      isOn: isNightMode
    },
    {
      id: 'light-default-2',
      wallPosition: 0.75,
      depthFromSurface: 1.5,
      color: '#ffffff',
      colorMode: 'white',
      intensity: 2,
      isOn: isNightMode
    }
  ];
}
