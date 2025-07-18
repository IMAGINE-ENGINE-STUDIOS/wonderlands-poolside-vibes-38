import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Box, Sphere, Cylinder } from '@react-three/drei';
import { Suspense } from 'react';

interface Pool3DViewerProps {
  poolModel: string;
  dimensions?: string;
}

function Pool3DScene({ poolModel, dimensions }: Pool3DViewerProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
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
      
      {/* Pool Model Text */}
      <Text3D 
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.3}
        height={0.05}
        position={[-1.5, 1, 0]}
      >
        {poolModel}
        <meshStandardMaterial color="#2E7D32" />
      </Text3D>
      
      {/* Floating Elements */}
      <Sphere args={[0.1]} position={[1.5, 0.5, 0.5]}>
        <meshStandardMaterial color="#FF6B6B" />
      </Sphere>
      
      <Cylinder args={[0.05, 0.05, 0.3]} position={[-1.5, 0.2, 0.8]}>
        <meshStandardMaterial color="#4ECDC4" />
      </Cylinder>
      
      <OrbitControls enableZoom={true} enablePan={false} />
    </>
  );
}

const Pool3DViewer = ({ poolModel, dimensions }: Pool3DViewerProps) => {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-background to-accent/10 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Pool3DScene poolModel={poolModel} dimensions={dimensions} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Pool3DViewer;