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

    console.log('🌊 WaterSurface: Creating water from pool points (EXACT match with pool floor):', poolPoints.length);
    
    try {
      // CRITICAL: Use generateCurvedPoolPoints with EXACT same parameters as Pool3DScene PoolMesh
      // LIMIT segments to prevent WebGL crashes with complex shapes
      const segmentsPerEdge = Math.min(20, Math.ceil(100 / poolPoints.length));
      const curvedPoints = generateCurvedPoolPoints(
        poolPoints.map(p => ({ x: p.x, y: p.y })),
        segmentsPerEdge,  // Adaptive segments
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
      // DEPTH DIRECTION: Along the SHORTEST side (width axis) - shallow to deep
      const poolWidth = maxX - minX;
      const poolLength = maxY - minY;
      const depthDirection = poolWidth < poolLength ? 'x' : 'y';

      // Normalize points to match Pool3DScene coordinate system (lines 217-220)
      const normalizedPoints = curvedPoints.map(p => ({
        x: p.x - centerX,
        y: p.y - centerY
      }));

      // VALIDATE the polygon before creating geometry
      const validatedPoints = validateAndRepairPolygon(normalizedPoints, {
        maxVertices: 100,
        simplifyEpsilon: 0.3,
        fallbackToConvexHull: true,
        fallbackToBoundingBox: true
      });

      console.log('🌊 Water validated:', validatedPoints.length, 'points from', normalizedPoints.length);

      // Create shape from validated points - water fills pool boundary EXACTLY
      const shape = new THREE.Shape();
      validatedPoints.forEach((point, i) => {
        if (i === 0) {
          shape.moveTo(point.x, point.y);
        } else {
          shape.lineTo(point.x, point.y);
        }
      });
      shape.closePath();

      // Create tessellated geometry with error handling
      let geometry: THREE.ShapeGeometry;
      try {
        geometry = new THREE.ShapeGeometry(shape, 64); // Reduced from 128 for stability
      } catch (shapeError) {
        console.warn('⚠️ WaterSurface: ShapeGeometry failed, using simplified shape');
        // Fallback to bounding box
        const fallbackShape = new THREE.Shape();
        const padding = 0.5;
        fallbackShape.moveTo(minX - centerX - padding, minY - centerY - padding);
        fallbackShape.lineTo(maxX - centerX + padding, minY - centerY - padding);
        fallbackShape.lineTo(maxX - centerX + padding, maxY - centerY + padding);
        fallbackShape.lineTo(minX - centerX - padding, maxY - centerY + padding);
        fallbackShape.closePath();
        geometry = new THREE.ShapeGeometry(fallbackShape, 32);
      }
      
      // Add depth attribute for depth-based coloring
      const positions = geometry.getAttribute('position');
      const depthArray = new Float32Array(positions.count);
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        
        // Calculate position ratio along SHORTEST axis (width) for depth gradient
        let depthRatio;
        if (depthDirection === 'x') {
          depthRatio = (x - (minX - centerX)) / poolWidth;
        } else {
          depthRatio = (z - (minY - centerY)) / poolLength;
        }
        
        depthRatio = Math.max(0, Math.min(1, depthRatio));
        const depth = getDepthAtPosition(depthRatio);
        depthArray[i] = depth;
      }
      
      geometry.setAttribute('depth', new THREE.BufferAttribute(depthArray, 1));
      geometry.rotateX(-Math.PI / 2); // Rotate to horizontal
      
      console.log('✅ WaterSurface: Water geometry created with exact pool boundary match');
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
        
        // Multi-octave wave function
        float wave(vec2 pos, float freq, float time) {
          float wave1 = sin(pos.x * freq + time * waveSpeed) * cos(pos.y * freq * 0.8 + time * waveSpeed * 0.7);
          float wave2 = sin((pos.x - pos.y) * freq * 1.3 + time * waveSpeed * 1.5) * 0.5;
          float wave3 = cos(pos.x * freq * 0.6 + pos.y * freq * 0.9 + time * waveSpeed * 0.9) * 0.3;
          return (wave1 + wave2 + wave3) / 1.8;
        }
        
        void main() {
          vPosition = position;
          vUv = uv;
          vDepth = depth;
          
          // Calculate wave displacement
          float displacement = wave(position.xz, waveFrequency, time) * waveHeight;
          displacement += wave(position.xz * 2.0, waveFrequency * 1.5, time * 1.3) * waveHeight * 0.4;
          displacement += wave(position.xz * 0.5, waveFrequency * 0.8, time * 0.7) * waveHeight * 0.6;
          
          vWaveHeight = displacement;
          
          vec3 newPosition = position;
          newPosition.y += displacement;
          
          // Calculate normal for lighting
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
          
          // Sky reflection
          vec3 skyColor = vec3(0.5, 0.7, 0.9);
          vec3 finalColor = mix(colorWithCaustics, skyColor, fresnelValue * reflectionStrength);
          
          // Add foam/highlights at wave peaks
          float foamAmount = smoothstep(0.04, 0.06, abs(vWaveHeight));
          finalColor = mix(finalColor, foamColor, foamAmount * 0.25);
          
          // Sparkles/highlights
          float sparkle = caustic(vPosition.xz * 2.5, time * 2.0);
          sparkle = pow(sparkle, 10.0) * fresnelValue;
          finalColor += sparkle * vec3(1.0, 1.0, 0.98) * 0.4;
          
          // Lighting
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
          float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.3 + 0.7;
          finalColor *= diffuse;
          
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
      material={waterMaterial}
      position={[0, 0.01, 0]}
      receiveShadow
    >
      <shaderMaterial ref={materialRef} attach="material" {...waterMaterial} />
    </mesh>
  );
};

export default WaterSurface;
