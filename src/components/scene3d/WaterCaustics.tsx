import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PoolLightConfig } from './types';

interface WaterCausticsProps {
  poolPoints: Array<{ x: number; y: number; id: string }>;
  lights: PoolLightConfig[];
  isNightMode: boolean;
  sunAngle: number;
  causticIntensity?: number;
}

// Caustic pattern texture generator
function createCausticTexture(size: number = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Generate caustic pattern using sine waves
      const fx = x / size * Math.PI * 8;
      const fy = y / size * Math.PI * 8;
      
      const c1 = Math.sin(fx) * Math.cos(fy);
      const c2 = Math.sin(fx * 1.3 + 0.5) * Math.cos(fy * 0.8 - 0.3);
      const c3 = Math.cos(fx * 0.7 + fy * 0.9);
      
      const caustic = Math.pow((c1 + c2 + c3 + 3) / 6, 3);
      const value = Math.floor(caustic * 255);
      
      data[idx] = value;
      data[idx + 1] = value;
      data[idx + 2] = value;
      data[idx + 3] = 255;
    }
  }
  
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  
  return texture;
}

// Pool light beam component for underwater light cones
function PoolLightBeam({ 
  light, 
  gradientHue,
  poolPerimeter 
}: { 
  light: PoolLightConfig;
  gradientHue: number;
  poolPerimeter: Array<{ x: number; z: number }>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate light position on perimeter
  const position = useMemo(() => {
    if (poolPerimeter.length < 2) return { x: 0, y: -light.depthFromSurface, z: 0, angle: 0 };
    
    let totalLength = 0;
    const segmentLengths: number[] = [];
    
    for (let i = 0; i < poolPerimeter.length; i++) {
      const p1 = poolPerimeter[i];
      const p2 = poolPerimeter[(i + 1) % poolPerimeter.length];
      const len = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
      segmentLengths.push(len);
      totalLength += len;
    }
    
    const targetDistance = light.wallPosition * totalLength;
    let accumulated = 0;
    
    for (let i = 0; i < poolPerimeter.length; i++) {
      const segmentLength = segmentLengths[i];
      
      if (accumulated + segmentLength >= targetDistance) {
        const p1 = poolPerimeter[i];
        const p2 = poolPerimeter[(i + 1) % poolPerimeter.length];
        const t = (targetDistance - accumulated) / segmentLength;
        
        const x = p1.x + t * (p2.x - p1.x);
        const z = p1.z + t * (p2.z - p1.z);
        
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const angle = Math.atan2(dz, dx) + Math.PI / 2;
        
        return { x, y: -light.depthFromSurface, z, angle };
      }
      
      accumulated += segmentLength;
    }
    
    return { x: poolPerimeter[0].x, y: -light.depthFromSurface, z: poolPerimeter[0].z, angle: 0 };
  }, [light.wallPosition, light.depthFromSurface, poolPerimeter]);
  
  const currentColor = light.colorMode === 'gradient'
    ? `hsl(${gradientHue}, 100%, 50%)`
    : light.color;
  
  if (!light.isOn) return null;
  
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Light cone - volumetric effect */}
      <mesh rotation={[Math.PI / 2, 0, position.angle]}>
        <coneGeometry args={[3, 8, 16, 1, true]} />
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={0.08 * light.intensity / 2}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export function WaterCaustics({
  poolPoints,
  lights,
  isNightMode,
  sunAngle,
  causticIntensity = 0.5
}: WaterCausticsProps) {
  const [gradientHue, setGradientHue] = useState(0);
  const causticPlaneRef = useRef<THREE.Mesh>(null);
  
  // Generate pool perimeter for positioning
  const poolPerimeter = useMemo(() => {
    if (poolPoints.length < 3) return [];
    
    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    return poolPoints.map(p => ({
      x: p.x - centerX,
      z: p.y - centerY
    }));
  }, [poolPoints]);
  
  // Create caustic texture
  const causticTexture = useMemo(() => createCausticTexture(256), []);
  
  // Caustic shader material for pool floor projection
  const causticMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        causticTexture: { value: causticTexture },
        intensity: { value: causticIntensity },
        isNight: { value: isNightMode ? 1.0 : 0.0 },
        sunIntensity: { value: Math.sin(sunAngle * Math.PI / 180) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;
        
        void main() {
          vUv = uv;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D causticTexture;
        uniform float intensity;
        uniform float isNight;
        uniform float sunIntensity;
        
        varying vec2 vUv;
        varying vec3 vWorldPos;
        
        void main() {
          // Animated caustic UVs
          vec2 uv1 = vWorldPos.xz * 0.3 + vec2(time * 0.02, time * 0.015);
          vec2 uv2 = vWorldPos.xz * 0.25 + vec2(-time * 0.018, time * 0.022);
          
          float c1 = texture2D(causticTexture, uv1).r;
          float c2 = texture2D(causticTexture, uv2).r;
          
          float caustic = (c1 + c2) * 0.5;
          caustic = pow(caustic, 2.0);
          
          // Reduce intensity at night, increase with sun
          float dayIntensity = mix(0.3, 1.0, sunIntensity) * (1.0 - isNight * 0.7);
          
          vec3 color = vec3(0.7, 0.85, 1.0) * caustic * intensity * dayIntensity;
          
          gl_FragColor = vec4(color, caustic * intensity * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [causticTexture, causticIntensity, isNightMode, sunAngle]);
  
  // Animate caustics
  useFrame((state) => {
    if (causticMaterial) {
      causticMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
    // Animate gradient hue for colored lights
    setGradientHue(prev => (prev + 0.6) % 360);
  });
  
  // Calculate pool bounds for caustic plane
  const poolBounds = useMemo(() => {
    if (poolPoints.length < 3) return { width: 20, length: 30 };
    
    const minX = Math.min(...poolPoints.map(p => p.x));
    const maxX = Math.max(...poolPoints.map(p => p.x));
    const minY = Math.min(...poolPoints.map(p => p.y));
    const maxY = Math.max(...poolPoints.map(p => p.y));
    
    return {
      width: maxX - minX,
      length: maxY - minY
    };
  }, [poolPoints]);
  
  return (
    <group>
      {/* Caustic projection plane (positioned just above pool floor) */}
      <mesh
        ref={causticPlaneRef}
        position={[0, -4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={causticMaterial}
      >
        <planeGeometry args={[poolBounds.width + 2, poolBounds.length + 2, 1, 1]} />
      </mesh>
      
      {/* Light beams for pool lights (night mode) */}
      {isNightMode && lights.filter(l => l.isOn).map(light => (
        <PoolLightBeam
          key={light.id}
          light={light}
          gradientHue={gradientHue}
          poolPerimeter={poolPerimeter}
        />
      ))}
    </group>
  );
}
