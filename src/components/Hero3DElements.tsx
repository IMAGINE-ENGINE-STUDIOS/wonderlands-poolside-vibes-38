import { Canvas } from '@react-three/fiber';
import { Float, Environment, Sparkles, useTexture, OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';

function FloatingPool() {
  const poolRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (poolRef.current) {
      poolRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      poolRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={poolRef} position={[-3, 2, 0]} scale={0.4}>
        {/* Pool */}
        <mesh>
          <boxGeometry args={[3, 0.15, 1.5]} />
          <meshStandardMaterial 
            color="#0288D1" 
            transparent 
            opacity={0.8}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
        
        {/* Pool Border */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[3.2, 0.05, 1.7]} />
          <meshStandardMaterial color="#E0E0E0" />
        </mesh>
        
        {/* Water Sparkle Effect */}
        <Sparkles 
          count={20} 
          scale={[3, 0.1, 1.5]} 
          size={1} 
          speed={0.3}
          color="#4FC3F7"
        />
      </group>
    </Float>
  );
}

function FloatingPatio() {
  const patioRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (patioRef.current) {
      patioRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      patioRef.current.position.x = 3 + Math.sin(state.clock.elapsedTime * 0.6) * 0.3;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group ref={patioRef} position={[3, -1, 2]} scale={0.3}>
        {/* Patio Deck */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial 
            color="#D4C4A8"
            roughness={0.8}
          />
        </mesh>
        
        {/* Lounge Chair */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Umbrella */}
        <group position={[1, 0, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.6]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[0, 0.65, 0]}>
            <coneGeometry args={[0.4, 0.15, 8]} />
            <meshStandardMaterial color="#FF6B6B" />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function FloatingAccessories() {
  return (
    <>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh position={[0, 3, -2]} scale={0.2}>
          <sphereGeometry args={[1]} />
          <meshStandardMaterial 
            color="#FF6B6B" 
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh position={[4, 1, -3]} scale={0.15}>
          <torusGeometry args={[1, 0.3]} />
          <meshStandardMaterial 
            color="#4ECDC4"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[-4, 0, -1]} scale={0.1}>
          <cylinderGeometry args={[1, 1, 3]} />
          <meshStandardMaterial 
            color="#FFA726"
            metalness={0.2}
            roughness={0.8}
          />
        </mesh>
      </Float>
    </>
  );
}

function Hero3DScene() {
  return (
    <>
      <Environment preset="sunset" background={false} />
      
      {/* Soft Ambient Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 5, 2]} 
        intensity={0.8}
        color="#FFB347"
      />
      <pointLight position={[-5, 3, -2]} intensity={0.4} color="#4FC3F7" />
      
      {/* Floating Elements */}
      <FloatingPool />
      <FloatingPatio />
      
      {/* Brand Element */}
      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.5, 0.2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.9}
            roughness={0.1}
            emissive="#4FC3F7"
            emissiveIntensity={0.1}
          />
        </mesh>
      </Float>
      
      {/* Magical Atmosphere */}
      <Sparkles 
        count={100} 
        scale={[20, 15, 10]} 
        size={3} 
        speed={0.2}
        color="#ffffff"
        opacity={0.6}
      />
      
      {/* Auto-rotate view */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

const Hero3DElements = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          toneMapping: 2,
          toneMappingExposure: 1
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Hero3DScene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Hero3DElements;