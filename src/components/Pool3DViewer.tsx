import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder, Text } from '@react-three/drei';
import { Suspense } from 'react';

interface Pool3DViewerProps {
  poolModel: string;
  dimensions?: string;
}

function Pool3DScene({ poolModel, dimensions }: Pool3DViewerProps) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      
      {/* Pool Shape */}
      <Box 
        args={[4, 0.2, 2]} 
        position={[0, -0.5, 0]}
      >
        <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
      </Box>
      
      {/* Pool Border */}
      <Box 
        args={[4.2, 0.1, 2.2]} 
        position={[0, -0.4, 0]}
      >
        <meshStandardMaterial color="#E0E0E0" />
      </Box>
      
      {/* Water Effect */}
      <Box 
        args={[3.8, 0.05, 1.8]} 
        position={[0, -0.35, 0]}
      >
        <meshStandardMaterial color="#0288D1" transparent opacity={0.6} />
      </Box>
      
      {/* Pool Model Text - Using HTML Text instead of 3D */}
      <Text
        position={[-1.5, 1, 0]}
        fontSize={0.3}
        color="#2E7D32"
        anchorX="center"
        anchorY="middle"
      >
        {poolModel}
      </Text>
      
      {/* Floating Elements */}
      <Sphere args={[0.1]} position={[1.5, 0.5, 0.5]}>
        <meshStandardMaterial color="#FF6B6B" />
      </Sphere>
      
      <Cylinder args={[0.05, 0.05, 0.3]} position={[-1.5, 0.2, 0.8]}>
        <meshStandardMaterial color="#4ECDC4" />
      </Cylinder>
      
      {/* Pool Accessories */}
      <Box args={[0.2, 0.1, 0.1]} position={[1.8, -0.3, 0.8]}>
        <meshStandardMaterial color="#FFA726" />
      </Box>
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 2}
        minDistance={3}
        maxDistance={8}
      />
    </>
  );
}

const Pool3DViewer = ({ poolModel, dimensions }: Pool3DViewerProps) => {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-background to-accent/10 rounded-lg overflow-hidden">
      <Canvas 
        camera={{ position: [5, 3, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Pool3DScene poolModel={poolModel} dimensions={dimensions} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Pool3DViewer;