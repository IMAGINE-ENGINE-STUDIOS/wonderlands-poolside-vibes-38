import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sparkles } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Mesh, Group } from 'three';
import { useFrame } from '@react-three/fiber';

interface Enhanced3DPoolViewerProps {
  poolModel: string;
  dimensions?: string;
  className?: string;
}

function WaterEffect() {
  const waterRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      waterRef.current.position.y = -0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  return (
    <mesh ref={waterRef} position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.8, 1.8]} />
      <meshStandardMaterial
        color="#0288D1"
        metalness={0.8}
        roughness={0.1}
        transparent
        opacity={0.8}
        emissive="#004D7A"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

function PoolStructure({ poolModel }: { poolModel: string }) {
  const poolRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (poolRef.current) {
      poolRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime) * 0.005;
    }
  });

  return (
    <group ref={poolRef}>
      {/* Main Pool Body */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.2, 2]} />
        <meshStandardMaterial 
          color="#4FC3F7" 
          transparent 
          opacity={0.9}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      
      {/* Pool Border/Coping */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[4.2, 0.1, 2.2]} />
        <meshStandardMaterial 
          color="#F5F5F5" 
          roughness={0.2}
          metalness={0.1}
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
          emissive="#FFD700"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function PatioElements() {
  return (
    <group>
      {/* Patio Deck */}
      <mesh position={[0, -0.6, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial 
          color="#D4C4A8"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Lounge Chairs */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh position={[-3, -0.4, -2]}>
          <boxGeometry args={[0.6, 0.1, 1.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.1}>
        <mesh position={[3, -0.4, -2]}>
          <boxGeometry args={[0.6, 0.1, 1.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </Float>
      
      {/* Umbrella */}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.15}>
        <group position={[-3.5, 0, -1.5]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <coneGeometry args={[0.8, 0.3, 8]} />
            <meshStandardMaterial color="#FF6B6B" />
          </mesh>
        </group>
      </Float>
      
      {/* Pool Accessories */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <mesh position={[2, -0.2, 0.9]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
      </Float>
      
      <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.18}>
        <mesh position={[-1.8, -0.15, 0.6]}>
          <torusGeometry args={[0.15, 0.05]} />
          <meshStandardMaterial color="#4ECDC4" />
        </mesh>
      </Float>
    </group>
  );
}

function Enhanced3DScene({ poolModel }: { poolModel: string }) {
  return (
    <>
      <Environment preset="sunset" />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#FFB347" />
      <spotLight 
        position={[0, 5, 0]} 
        intensity={0.8} 
        angle={0.3} 
        penumbra={0.5}
        color="#4FC3F7"
        target-position={[0, -0.5, 0]}
      />
      
      {/* Pool Structure */}
      <PoolStructure poolModel={poolModel} />
      
      {/* Water Effect */}
      <WaterEffect />
      
      {/* Patio Elements */}
      <PatioElements />
      
      {/* Floating Pool Model Text */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[-1.5, 1.5, 0]}>
          <boxGeometry args={[2, 0.3, 0.1]} />
          <meshStandardMaterial 
            color="#2E7D32" 
            metalness={0.8}
            roughness={0.2}
            emissive="#1B5E20"
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>
      
      {/* Magical Sparkles */}
      <Sparkles 
        count={50} 
        scale={[8, 4, 8]} 
        size={2} 
        speed={0.4}
        color="#4FC3F7"
      />
      
      {/* Enhanced Controls */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

const Enhanced3DPoolViewer = ({ poolModel, dimensions, className = "" }: Enhanced3DPoolViewerProps) => {
  return (
    <div className={`w-full h-80 bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      <Canvas 
        camera={{ position: [6, 4, 6], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 2,
          toneMappingExposure: 1.2
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Enhanced3DScene poolModel={poolModel} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Enhanced3DPoolViewer;