
interface LightingProps {
  lightingModel: 'realistic' | 'stylized' | 'cinematic';
  intensity?: number;
}

export const ImaginalyLighting = ({ lightingModel, intensity = 1 }: LightingProps) => {
  const getLightingSetup = () => {
    switch (lightingModel) {
      case 'realistic':
        return (
          <>
            <ambientLight intensity={0.4 * intensity} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.0 * intensity}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-8, 4, -8]} intensity={0.3 * intensity} color="#FFB347" />
          </>
        );
      case 'stylized':
        return (
          <>
            <ambientLight intensity={0.6 * intensity} />
            <directionalLight position={[5, 8, 3]} intensity={0.8 * intensity} />
            <pointLight position={[0, 3, 0]} intensity={0.4 * intensity} color="#4FC3F7" />
          </>
        );
      case 'cinematic':
        return (
          <>
            <ambientLight intensity={0.3 * intensity} />
            <directionalLight 
              position={[12, 12, 8]} 
              intensity={1.2 * intensity}
              castShadow
            />
            <spotLight 
              position={[0, 8, 0]} 
              intensity={0.8 * intensity} 
              angle={0.4} 
              penumbra={0.6}
              color="#4FC3F7"
            />
          </>
        );
      default:
        return <ambientLight intensity={0.5 * intensity} />;
    }
  };

  return <>{getLightingSetup()}</>;
};
