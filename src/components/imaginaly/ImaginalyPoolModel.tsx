
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { Group, Mesh, Color } from 'three';

interface PoolModelProps {
  poolModel: string;
  settings: {
    shaderMode: string;
    waterQuality: number;
    enableEffects: boolean;
  };
}

export const ImaginalyPoolModel = ({ poolModel, settings }: PoolModelProps) => {
  const poolRef = useRef<Group>(null);
  const waterRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (poolRef.current) {
      poolRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime) * 0.003;
    }
    
    if (waterRef.current && settings.waterQuality > 0) {
      waterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      waterRef.current.position.y = -0.35 + Math.sin(state.clock.elapsedTime * 1.5) * 0.008;
    }
  });

  const getMaterialProps = () => {
    switch (settings.shaderMode) {
      case 'pbr':
        return { metalness: 0.8, roughness: 0.2 };
      case 'unlit':
        return { emissive: new Color('#4FC3F7'), emissiveIntensity: 0.3 };
      default:
        return { metalness: 0.3, roughness: 0.1 };
    }
  };

  const materialProps = getMaterialProps();

  return (
    <group ref={poolRef}>
      {/* Main Pool Body */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.2, 2]} />
        <meshStandardMaterial 
          color="#4FC3F7" 
          transparent 
          opacity={0.9}
          {...materialProps}
        />
      </mesh>
      
      {/* Pool Border */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[4.2, 0.1, 2.2]} />
        <meshStandardMaterial 
          color="#F5F5F5" 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      
      {/* Enhanced Water */}
      <mesh ref={waterRef} position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 1.8, Math.max(1, settings.waterQuality) * 8, Math.max(1, settings.waterQuality) * 8]} />
        <meshStandardMaterial
          color="#0288D1"
          metalness={0.7}
          roughness={0.1}
          transparent
          opacity={0.85}
          emissive={new Color("#004D7A")}
          emissiveIntensity={0.08}
        />
      </mesh>
      
      {/* Pool Steps */}
      <mesh position={[1.8, -0.3, 0.8]}>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
      
      {/* Pool Light */}
      <mesh position={[-1.5, -0.45, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial 
          color="#FFD700" 
          emissive={new Color("#FFD700")}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Pool Model Label with Float */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[-1.5, 1.2, 0]}>
          <boxGeometry args={[1.8, 0.25, 0.08]} />
          <meshStandardMaterial 
            color="#2E7D32" 
            metalness={0.6}
            roughness={0.3}
            emissive={new Color("#1B5E20")}
            emissiveIntensity={0.05}
          />
        </mesh>
      </Float>
      
      {/* Water Effects */}
      {settings.enableEffects && (
        <Sparkles 
          count={35} 
          scale={[6, 3, 6]} 
          size={1.5} 
          speed={0.2}
          color="#4FC3F7"
        />
      )}
    </group>
  );
};
