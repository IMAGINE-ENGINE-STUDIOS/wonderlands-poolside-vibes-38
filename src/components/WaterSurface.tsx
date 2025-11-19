import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Point } from './scene3d/types';

interface WaterSurfaceProps {
  poolPoints: Point[];
}

// Custom shader for realistic water with waves, reflections, and caustics
const WaterSurface: React.FC<WaterSurfaceProps> = ({ poolPoints }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create water geometry from pool points
  const waterGeometry = useMemo(() => {
    if (poolPoints.length < 3) return null;

    // Create shape from pool points
    const shape = new THREE.Shape();
    poolPoints.forEach((point, i) => {
      if (i === 0) {
        shape.moveTo(point.x, point.y);
      } else {
        shape.lineTo(point.x, point.y);
      }
    });
    shape.closePath();

    // Create highly tessellated geometry for smooth wave deformation
    const geometry = new THREE.ShapeGeometry(shape, 128);
    geometry.rotateX(-Math.PI / 2);
    
    return geometry;
  }, [poolPoints]);

  // Water shader material with waves, reflections, and caustics
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0.01, 0.25, 0.45) }, // Deep blue water
        foamColor: { value: new THREE.Color(0.8, 0.95, 1.0) },
        causticScale: { value: 8.0 },
        causticStrength: { value: 0.4 },
        waveHeight: { value: 0.08 }, // Wave amplitude in feet
        waveFrequency: { value: 0.5 }, // Wave frequency
        waveSpeed: { value: 0.3 }, // Wave animation speed
        reflectionStrength: { value: 0.6 },
        transparency: { value: 0.85 },
      },
      vertexShader: `
        uniform float time;
        uniform float waveHeight;
        uniform float waveFrequency;
        uniform float waveSpeed;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vWaveHeight;
        
        // Improved wave function with multiple octaves
        float wave(vec2 pos, float freq, float time) {
          float wave1 = sin(pos.x * freq + time * waveSpeed) * cos(pos.y * freq * 0.8 + time * waveSpeed * 0.7);
          float wave2 = sin((pos.x - pos.y) * freq * 1.3 + time * waveSpeed * 1.5) * 0.5;
          float wave3 = cos(pos.x * freq * 0.6 + pos.y * freq * 0.9 + time * waveSpeed * 0.9) * 0.3;
          return (wave1 + wave2 + wave3) / 1.8;
        }
        
        void main() {
          vPosition = position;
          vUv = uv;
          
          // Calculate wave displacement
          float displacement = wave(position.xz, waveFrequency, time) * waveHeight;
          displacement += wave(position.xz * 2.0, waveFrequency * 1.5, time * 1.3) * waveHeight * 0.4;
          displacement += wave(position.xz * 0.5, waveFrequency * 0.8, time * 0.7) * waveHeight * 0.6;
          
          vWaveHeight = displacement;
          
          vec3 newPosition = position;
          newPosition.y += displacement;
          
          // Calculate normal for lighting (approximate based on neighboring wave heights)
          float eps = 0.1;
          float dx = wave(position.xz + vec2(eps, 0.0), waveFrequency, time) * waveHeight 
                   - wave(position.xz - vec2(eps, 0.0), waveFrequency, time) * waveHeight;
          float dz = wave(position.xz + vec2(0.0, eps), waveFrequency, time) * waveHeight 
                   - wave(position.xz - vec2(0.0, eps), waveFrequency, time) * waveHeight;
          
          vec3 tangentX = normalize(vec3(1.0, dx / (2.0 * eps), 0.0));
          vec3 tangentZ = normalize(vec3(0.0, dz / (2.0 * eps), 1.0));
          vNormal = normalize(cross(tangentZ, tangentX));
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 waterColor;
        uniform vec3 foamColor;
        uniform float causticScale;
        uniform float causticStrength;
        uniform float reflectionStrength;
        uniform float transparency;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vWaveHeight;
        
        // Caustic pattern generator
        float caustic(vec2 uv, float time) {
          vec2 p = uv * causticScale;
          
          // Multiple layers of caustics for realism
          float c1 = abs(sin(p.x + time * 0.5) * cos(p.y - time * 0.3));
          float c2 = abs(sin((p.x + p.y) * 0.7 + time * 0.7) * cos((p.x - p.y) * 0.8 - time * 0.4));
          float c3 = abs(sin(p.x * 1.3 - time * 0.6) * cos(p.y * 1.1 + time * 0.5));
          
          float caustic = (c1 + c2 * 0.7 + c3 * 0.5) / 2.2;
          caustic = pow(caustic, 3.0); // Sharpen caustic patterns
          
          return caustic;
        }
        
        // Fresnel effect for reflections
        float fresnel(vec3 normal, vec3 viewDir, float power) {
          float facing = dot(normal, viewDir);
          return pow(1.0 - abs(facing), power);
        }
        
        void main() {
          // View direction for Fresnel
          vec3 viewDir = normalize(cameraPosition - vPosition);
          
          // Calculate Fresnel reflection (stronger at grazing angles)
          float fresnelValue = fresnel(vNormal, viewDir, 3.0);
          
          // Caustic light patterns
          float causticPattern = caustic(vPosition.xz, time);
          
          // Sky reflection color (simulated)
          vec3 skyColor = vec3(0.5, 0.7, 0.9);
          
          // Base water color with depth
          vec3 baseColor = waterColor;
          
          // Add caustics to water color
          vec3 colorWithCaustics = baseColor + causticPattern * causticStrength * vec3(1.0, 1.0, 0.95);
          
          // Mix water and sky reflection based on Fresnel
          vec3 finalColor = mix(colorWithCaustics, skyColor, fresnelValue * reflectionStrength);
          
          // Add foam/highlights at wave peaks
          float foamAmount = smoothstep(0.05, 0.08, abs(vWaveHeight));
          finalColor = mix(finalColor, foamColor, foamAmount * 0.3);
          
          // Add sparkles/highlights
          float sparkle = caustic(vPosition.xz * 2.0, time * 2.0);
          sparkle = pow(sparkle, 8.0) * fresnelValue;
          finalColor += sparkle * vec3(1.0, 1.0, 0.95) * 0.5;
          
          // Lighting (simple directional)
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.3 + 0.7;
          finalColor *= diffuse;
          
          // Output with transparency
          gl_FragColor = vec4(finalColor, transparency);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false, // Important for transparency
    });
  }, []);

  // Animate water waves
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (!waterGeometry) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={waterGeometry}
      material={waterMaterial}
      position={[0, 0.01, 0]} // Slightly above y=0 to prevent z-fighting with pool floor
      receiveShadow
    >
      <shaderMaterial ref={materialRef} attach="material" {...waterMaterial} />
    </mesh>
  );
};

export default WaterSurface;
