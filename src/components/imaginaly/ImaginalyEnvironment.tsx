
import { Environment, Sky } from '@react-three/drei';

interface EnvironmentProps {
  skyboxType: 'environment' | 'procedural';
  selectedSkybox: string;
}

export const ImaginalyEnvironment = ({ skyboxType, selectedSkybox }: EnvironmentProps) => {
  if (skyboxType === 'procedural') {
    return <Sky sunPosition={[100, 20, 100]} />;
  }

  return <Environment preset={selectedSkybox as any} />;
};
