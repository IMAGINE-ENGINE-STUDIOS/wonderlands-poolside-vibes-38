import earcut from 'earcut';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Point } from './scene3d/types';
import { generateCurvedPoolPoints } from '@/utils/curveUtils';
import { validateAndRepairPolygon, ensureCounterClockwise } from '@/utils/shapeValidation';

interface DepthPoint {
  position: number;
  depth: number;
  id: string;
}

interface WaterSurfaceProps {
  poolPoints: Point[];
  depthPoints: DepthPoint[];
  poolDimensions?: {
    length: number;
    width: number;
    depth: number;
  };
  showWireframe?: boolean;
}

// Enhanced Water Surface with dynamic simulation, depth-based colors, god rays, and water color filter
const WaterSurface: React.FC<WaterSurfaceProps> = ({ poolPoints, depthPoints, poolDimensions, showWireframe = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Get depth interpolation function
  const getDepthAtPosition = useMemo(() => {
    return (ratio: number): number => {
      if (depthPoints.length === 0) return 6;
      
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      
      for (let i = 0; i < depthPoints.length - 1; i++) {
        const curr = depthPoints[i];
        const next = depthPoints[i + 1];
        
        if (clampedRatio >= curr.position && clampedRatio <= next.position) {
          const segmentRatio = (clampedRatio - curr.position) / (next.position - curr.position);
          return curr.depth + (next.depth - curr.depth) * segmentRatio;
        }
      }
      
      return depthPoints[depthPoints.length - 1].depth;
    };
  }, [depthPoints]);

  // Create water geometry from pool points with depth data - MUST match pool floor exactly
  const waterGeometry = useMemo(() => {
    if (poolPoints.length < 3) {
      console.warn('⚠️ WaterSurface: Invalid pool points, creating fallback geometry');
      return null;
    }

    
    try {
      // CRITICAL: Use generateCurvedPoolPoints with EXACT same parameters as Pool3DScene PoolMesh
      // MUST use 30 segments to match pool walls exactly for waterline intersection
      const curvedPoints = generateCurvedPoolPoints(
        poolPoints.map(p => ({ x: p.x, y: p.y })),
        30, // MUST match Pool3DScene segments for exact alignment
        0.3  // MUST match Pool3DScene tension
      );

      // Calculate center using EXACT same method as Pool3DScene (lines 210-215)
      const minX = Math.min(...curvedPoints.map(p => p.x));
      const maxX = Math.max(...curvedPoints.map(p => p.x));
      const minY = Math.min(...curvedPoints.map(p => p.y));
      const maxY = Math.max(...curvedPoints.map(p => p.y));
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Calculate pool dimensions for depth mapping
      // DEPTH DIRECTION: Along the LONGEST side (length axis) - shallow to deep
      const poolWidth = maxX - minX;
      const poolLength = maxY - minY;
      const depthDirection = poolLength > poolWidth ? 'y' : 'x';

      // Normalize points to match Pool3DScene coordinate system (lines 217-220)
      const normalizedPoints = curvedPoints.map(p => ({
        x: p.x - centerX,
        z: p.y - centerY // Use z to match Pool3DScene
      }));

      // Create water geometry using EXACT same triangulation as pool floor
      // This ensures water mesh clips exactly at waterline intersection with walls
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const indices: number[] = [];
      const uvs: number[] = [];

      // Calculate center point for fan triangulation (matches pool floor method)
      const centerWaterX = normalizedPoints.reduce((sum, p) => sum + p.x, 0) / normalizedPoints.length;
      const centerWaterZ = normalizedPoints.reduce((sum, p) => sum + p.z, 0) / normalizedPoints.length;

      // Add center vertex first (index 0)
      vertices.push(centerWaterX, 0, centerWaterZ);
      uvs.push(0.5, 0.5);

      // Add perimeter vertices - these match pool wall inner edges exactly
      for (const p of normalizedPoints) {
        vertices.push(p.x, 0, p.z);
        // Calculate UV based on position
        const u = (p.x - (minX - centerX)) / poolWidth;
        const v = (p.z - (minY - centerY)) / poolLength;
        uvs.push(u, v);
      }

      // Earcut stays inside concave curves (a centre fan folded over the deck).
      const tri = earcut(normalizedPoints.flatMap((p) => [p.x, p.z]));
      for (let i = 0; i < tri.length; i += 3) {
        const t = [tri[i] + 1, tri[i + 1] + 1, tri[i + 2] + 1];
        const [p0, p1, p2] = t.map((k) => normalizedPoints[k - 1]);
        const up = (p1.x - p0.x) * (p2.z - p0.z) - (p1.z - p0.z) * (p2.x - p0.x) < 0;
        if (up) indices.push(t[0], t[1], t[2]); else indices.push(t[0], t[2], t[1]);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      
      // Add depth attribute for depth-based coloring
      const positions = geometry.getAttribute('position');
      const depthArray = new Float32Array(positions.count);
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        
        // Calculate position ratio along LONGEST axis (length) for depth gradient
        // z corresponds to the y-axis in 2D pool space
        let depthRatio;
        if (depthDirection === 'y') {
          // Length is longer, gradient along z (which was y in 2D)
          depthRatio = (z - (minY - centerY)) / poolLength;
        } else {
          // Width is longer, gradient along x
          depthRatio = (x - (minX - centerX)) / poolWidth;
        }
        
        depthRatio = Math.max(0, Math.min(1, depthRatio));
        const depth = getDepthAtPosition(depthRatio);
        depthArray[i] = depth;
      }
      
      geometry.setAttribute('depth', new THREE.BufferAttribute(depthArray, 1));
      // No rotation needed - geometry is already in correct XZ plane
      
      return geometry;
    } catch (error) {
      console.error('❌ WaterSurface: Failed to create geometry:', error);
      // Return simple fallback plane
      const fallbackGeometry = new THREE.PlaneGeometry(20, 40);
      fallbackGeometry.rotateX(-Math.PI / 2);
      return fallbackGeometry;
    }
  }, [poolPoints, getDepthAtPosition]);

  // Enhanced water shader material with depth-based colors, god rays, and water texture
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        
        // Depth-based water colors (shallow to deep)
        shallowColor: { value: new THREE.Color(0.4, 0.85, 0.9) }, // Turquoise
        mediumColor: { value: new THREE.Color(0.1, 0.5, 0.75) },  // Medium blue
        deepColor: { value: new THREE.Color(0.01, 0.25, 0.55) },  // Deep blue
        
        // Water color filter overlay
        waterColorFilter: { value: new THREE.Color(0.15, 0.45, 0.75) }, // Blue tint
        filterStrength: { value: 0.35 },
        
        foamColor: { value: new THREE.Color(0.9, 0.95, 1.0) },
        
        // Caustics
        causticScale: { value: 6.0 },
        causticStrength: { value: 0.5 },
        
        // Waves
        waveHeight: { value: 0.06 },
        waveFrequency: { value: 0.4 },
        waveSpeed: { value: 0.25 },
        
        // God rays (underwater light shafts)
        godRayIntensity: { value: 0.7 },
        godRayScale: { value: 3.0 },
        godRaySpeed: { value: 0.15 },
        
        // Reflections
        reflectionStrength: { value: 0.5 },
        transparency: { value: 0.3 },
        
        // Depth settings
        maxDepth: { value: Math.max(...depthPoints.map(d => d.depth)) },
        minDepth: { value: Math.min(...depthPoints.map(d => d.depth)) },
      },
      vertexShader: `
        uniform float time;
        uniform float waveHeight;
        uniform float waveFrequency;
        uniform float waveSpeed;
        
        attribute float depth;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vWaveHeight;
        varying float vDepth;
        
        // Lightweight Gerstner wave simulation: 4 directional waves summed
        // analytically (position + exact normal), no textures, no CPU work.
        vec3 gerstner(vec2 p, vec2 dir, float steep, float wl, float t, inout vec3 tan, inout vec3 bin) {
          float k = 6.28318 / wl;
          float c = sqrt(32.17 / k) * waveSpeed;   // deep-water dispersion (ft/s²)
          vec2 d = normalize(dir);
          float f = k * (dot(d, p) - c * t);
          float a = steep / k * waveHeight * 6.0;
          float sf = sin(f), cf = cos(f);
          tan += vec3(-d.x * d.x * steep * sf, d.x * steep * cf, -d.x * d.y * steep * sf) * waveHeight * 6.0;
          bin += vec3(-d.x * d.y * steep * sf, d.y * steep * cf, -d.y * d.y * steep * sf) * waveHeight * 6.0;
          return vec3(d.x * a * cf, a * sf, d.y * a * cf);
        }

        void main() {
          vUv = uv;
          vDepth = depth;
          vec3 tan = vec3(1.0, 0.0, 0.0);
          vec3 bin = vec3(0.0, 0.0, 1.0);
          vec2 p = position.xz;
          vec3 off = vec3(0.0);
          off += gerstner(p, vec2(1.0, 0.35), 0.10, 9.0, time, tan, bin);
          off += gerstner(p, vec2(-0.4, 1.0), 0.08, 5.5, time, tan, bin);
          off += gerstner(p, vec2(0.7, -0.8), 0.06, 3.2, time, tan, bin);
          off += gerstner(p, vec2(-1.0, -0.2), 0.04, 1.7, time, tan, bin);
          off.y *= 0.5; // pools are calm: keep the swell subtle
          vec3 newPosition = position + off;
          vPosition = newPosition;
          vWaveHeight = off.y;
          vNormal = normalize(cross(bin, tan));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        
        uniform vec3 shallowColor;
        uniform vec3 mediumColor;
        uniform vec3 deepColor;
        uniform vec3 waterColorFilter;
        uniform float filterStrength;
        uniform vec3 foamColor;
        
        uniform float causticScale;
        uniform float causticStrength;
        uniform float godRayIntensity;
        uniform float godRayScale;
        uniform float godRaySpeed;
        uniform float reflectionStrength;
        uniform float transparency;
        uniform float maxDepth;
        uniform float minDepth;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vWaveHeight;
        varying float vDepth;
        
        // Caustic pattern generator
        float caustic(vec2 uv, float time) {
          vec2 p = uv * causticScale;
          
          float c1 = abs(sin(p.x + time * 0.5) * cos(p.y - time * 0.3));
          float c2 = abs(sin((p.x + p.y) * 0.7 + time * 0.7) * cos((p.x - p.y) * 0.8 - time * 0.4));
          float c3 = abs(sin(p.x * 1.3 - time * 0.6) * cos(p.y * 1.1 + time * 0.5));
          
          float caustic = (c1 + c2 * 0.7 + c3 * 0.5) / 2.2;
          caustic = pow(caustic, 3.0);
          
          return caustic;
        }
        
        // God rays (underwater light shafts)
        float godRays(vec2 uv, float time) {
          vec2 p = uv * godRayScale;
          
          // Animated light shafts
          float ray1 = abs(sin(p.x * 0.5 + time * godRaySpeed + p.y * 0.3));
          float ray2 = abs(cos(p.x * 0.3 - time * godRaySpeed * 0.7 + p.y * 0.5));
          float ray3 = abs(sin((p.x + p.y) * 0.4 + time * godRaySpeed * 1.2));
          
          float rays = (ray1 + ray2 * 0.8 + ray3 * 0.6) / 2.4;
          rays = pow(rays, 4.0);
          
          return rays;
        }
        
        // Fresnel effect
        float fresnel(vec3 normal, vec3 viewDir, float power) {
          float facing = dot(normal, viewDir);
          return pow(1.0 - abs(facing), power);
        }
        
        void main() {
          // View direction for Fresnel
          vec3 viewDir = normalize(cameraPosition - vPosition);
          
          // Calculate Fresnel reflection
          float fresnelValue = fresnel(vNormal, viewDir, 3.0);
          
          // Depth-based color interpolation
          float depthRatio = (vDepth - minDepth) / (maxDepth - minDepth);
          depthRatio = clamp(depthRatio, 0.0, 1.0);
          
          // Three-stage color gradient: shallow -> medium -> deep
          vec3 depthColor;
          if (depthRatio < 0.5) {
            depthColor = mix(shallowColor, mediumColor, depthRatio * 2.0);
          } else {
            depthColor = mix(mediumColor, deepColor, (depthRatio - 0.5) * 2.0);
          }
          
          // Use depth color as base (no texture)
          vec3 baseColor = depthColor;
          
          // Apply water color filter
          baseColor = mix(baseColor, waterColorFilter, filterStrength);
          
          // Caustic light patterns (more visible in shallow areas)
          float causticPattern = caustic(vPosition.xz, time);
          float causticMask = 1.0 - depthRatio * 0.7;
          vec3 colorWithCaustics = baseColor + causticPattern * causticStrength * causticMask * vec3(1.0, 1.0, 0.95);
          
          // God rays (underwater light shafts) - more visible in deeper areas
          float godRayPattern = godRays(vPosition.xz, time);
          float godRayMask = depthRatio * 0.8 + 0.2;
          colorWithCaustics += godRayPattern * godRayIntensity * godRayMask * vec3(0.9, 0.95, 1.0);
          
          // Sky reflection: Schlick Fresnel (water F0 ≈ 0.02) against a sky gradient
          vec3 refl = reflect(-viewDir, vNormal);
          vec3 skyColor = mix(vec3(0.72, 0.84, 0.95), vec3(0.32, 0.55, 0.85), clamp(refl.y, 0.0, 1.0));
          float schlick = 0.02 + 0.98 * pow(1.0 - clamp(dot(vNormal, viewDir), 0.0, 1.0), 5.0);
          float fres = clamp(max(schlick, fresnelValue * 0.6) * reflectionStrength * 1.4, 0.0, 0.85);
          vec3 finalColor = mix(colorWithCaustics, skyColor, fres);

          // Add foam/highlights at wave peaks
          float foamAmount = smoothstep(0.04, 0.06, abs(vWaveHeight));
          finalColor = mix(finalColor, foamColor, foamAmount * 0.25);

          // Sparkles/highlights
          float sparkle = caustic(vPosition.xz * 2.5, time * 2.0);
          sparkle = pow(sparkle, 10.0) * fresnelValue;
          finalColor += sparkle * vec3(1.0, 1.0, 0.98) * 0.4;

          // Lighting + sun glints (Blinn-Phong specular on the wave normals)
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.3 + 0.7;
          finalColor *= diffuse;
          vec3 halfV = normalize(lightDir + viewDir);
          float spec = pow(max(dot(vNormal, halfV), 0.0), 220.0);
          finalColor += vec3(1.0, 0.98, 0.92) * spec * 1.6;
          
          gl_FragColor = vec4(finalColor, transparency);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: showWireframe,
    });
  }, [depthPoints, showWireframe]);

  // Animate water
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
      position={[0, 0.01, 0]}
      receiveShadow
    >
      <primitive ref={materialRef} object={waterMaterial} attach="material" />
    </mesh>
  );
};


export default WaterSurface;
