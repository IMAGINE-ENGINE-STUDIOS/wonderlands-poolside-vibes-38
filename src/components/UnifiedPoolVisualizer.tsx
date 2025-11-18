import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Scene3D, TransformMode, CameraPreset, TextureConfig, Annotation } from './scene3d/types';
import { Pool3DScene } from './Pool3DScene';
import { Scene3DControlPanel } from './Scene3DControlPanel';
import { Scene3DAnnotations } from './Scene3DAnnotations';
import { Button } from './ui/button';
import * as THREE from 'three';

interface UnifiedPoolVisualizerProps {
  scene: Scene3D;
  textureLibrary: {
    finishes: TextureConfig[];
    pavers: TextureConfig[];
    coping: TextureConfig[];
  };
  onSceneChange?: (scene: Scene3D) => void;
}

// Camera preset positions component
function CameraController({ 
  preset, 
  target 
}: { 
  preset: CameraPreset | null; 
  target: [number, number, number];
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (!preset) return;

    const positions: Record<CameraPreset, [number, number, number]> = {
      top: [target[0], target[1] + 50, target[2]],
      front: [target[0], target[1] + 10, target[2] + 40],
      side: [target[0] + 40, target[1] + 10, target[2]],
      isometric: [target[0] + 30, target[1] + 30, target[2] + 30]
    };

    const newPosition = positions[preset];
    camera.position.lerp(new THREE.Vector3(...newPosition), 0.1);
  }, [preset, target, camera]);

  return null;
}

export function UnifiedPoolVisualizer({
  scene: initialScene,
  textureLibrary,
  onSceneChange
}: UnifiedPoolVisualizerProps) {
  const [scene, setScene] = useState<Scene3D>(initialScene);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([100, 20, 100]);
  const [fenceHeight, setFenceHeight] = useState(6);
  const controlsRef = useRef<any>(null);

  // Update parent when scene changes
  useEffect(() => {
    onSceneChange?.(scene);
  }, [scene, onSceneChange]);

  // Sync with initial scene updates
  useEffect(() => {
    setScene(initialScene);
  }, [initialScene]);

  // Auto-snap camera to selected category
  useEffect(() => {
    if (!selectedCategory || !controlsRef.current) return;
    
    const cameraConfigs: Record<string, { position: [number, number, number], target: [number, number, number] }> = {
      pool: { position: [0, 40, 0], target: [0, -3, 0] },
      deck: { position: [25, 15, 25], target: [0, 0, 0] },
      coping: { position: [15, 5, 15], target: [0, 0, 0] },
      waterline: { position: [20, 2, 20], target: [0, -0.2, 0] }
    };
    
    const config = cameraConfigs[selectedCategory];
    if (config) {
      setCameraPreset(null);
      setScene(prev => ({
        ...prev,
        camera: {
          position: config.position,
          target: config.target
        }
      }));
    }
  }, [selectedCategory]);

  const handleTextureChange = (category: 'pool' | 'deck' | 'coping' | 'waterline', texture: TextureConfig) => {
    setScene(prev => {
      const updated = { ...prev };
      
      if (category === 'pool') {
        updated.pool.finish = texture;
      } else if (category === 'deck') {
        updated.deck.paver = texture;
      } else if (category === 'coping') {
        updated.deck.coping = texture;
      } else if (category === 'waterline') {
        // Store waterline texture in deck for now
        updated.deck.waterline = texture;
      }
      
      return updated;
    });
  };

  const handleTransformChange = (
    position: [number, number, number],
    rotation: [number, number, number],
    scale: number
  ) => {
    if (!selectedObject) return;
    
    setScene(prev => {
      const updated = { ...prev };
      
      // Update position/rotation based on selected object
      if (selectedObject === 'pool') {
        updated.pool.position = position;
        updated.pool.rotation = rotation;
      }
      
      return updated;
    });
  };

  const handleCenterCamera = () => {
    if (!selectedObject) return;
    
    // Calculate target based on selected object
    let target: [number, number, number] = [0, 0, 0];
    
    if (selectedObject === 'pool' && scene.pool.dimensions) {
      target = [
        scene.pool.dimensions.width / 2,
        0,
        scene.pool.dimensions.length / 2
      ];
    }
    
    setScene(prev => ({
      ...prev,
      camera: {
        position: [target[0] + 20, target[1] + 20, target[2] + 20],
        target
      }
    }));
    
    setCameraPreset('isometric');
  };

  const handleAddAnnotation = (text: string, price?: number) => {
    if (!selectedObject) return;
    
    // Calculate position based on selected object
    let position: [number, number, number] = [0, 5, 0];
    
    if (selectedObject === 'pool' && scene.pool.dimensions) {
      position = [
        scene.pool.dimensions.width / 2,
        5,
        scene.pool.dimensions.length / 2
      ];
    }
    
    const newAnnotation: Annotation = {
      id: `note-${Date.now()}`,
      objectId: selectedObject,
      position,
      text,
      color: '#fef3c7',
      price,
      confirmed: false
    };
    
    setScene(prev => ({
      ...prev,
      annotations: [...prev.annotations, newAnnotation]
    }));
  };

  const handleDeleteAnnotation = (id: string) => {
    setScene(prev => ({
      ...prev,
      annotations: prev.annotations.filter(a => a.id !== id)
    }));
  };

  const handleToggleConfirmAnnotation = (id: string) => {
    setScene(prev => ({
      ...prev,
      annotations: prev.annotations.map(a =>
        a.id === id ? { ...a, confirmed: !a.confirmed } : a
      )
    }));
  };

  return (
    <div className="flex h-full w-full">
      {/* Main 3D Canvas */}
      <div className="flex-1 relative">
        <R3FCanvas
          shadows
          camera={{
            position: scene.camera.position,
            fov: 50
          }}
        >
          {/* Dynamic Sky with Clouds */}
          <Sky 
            distance={450000}
            sunPosition={sunPosition}
            inclination={0.6}
            azimuth={0.25}
          />
          
          <ambientLight intensity={0.4} />
          <directionalLight
            position={sunPosition}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={100}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />
          
          <CameraController preset={cameraPreset} target={scene.camera.target} />
          
          {/* Pool rendering */}
          <Pool3DScene
            points={scene.pool.points}
            depthPoints={scene.pool.depthPoints}
            hardscapePoints={scene.deck.points}
            linerTextureUrl={scene.pool.finish.url}
            paverTextureUrl={scene.deck.paver.url}
            copingTextureUrl={scene.deck.coping.url}
            waterlineTextureUrl={scene.deck.waterline?.url}
            fenceTextureUrl="/src/assets/fence-texture.png"
            features={scene.features.map(f => ({
              type: f.type as any,
              x: f.position[0],
              y: f.position[2],
              id: f.id,
              angle: f.rotation?.[1]
            }))}
            fencePoints={[]}
            scale={1}
            poolShape="rectangle"
            poolDimensions={scene.pool.dimensions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            fenceHeight={fenceHeight}
            paverTextureScale={scene.deck.paver.scale || 1}
            copingTextureScale={scene.deck.coping.scale || 1}
            waterlineTextureScale={scene.deck.waterline?.scale || 1}
          />
          
          {/* Annotations */}
          <Scene3DAnnotations
            annotations={scene.annotations}
            onDelete={handleDeleteAnnotation}
            onToggleConfirm={handleToggleConfirmAnnotation}
          />
          
          <OrbitControls
            ref={controlsRef}
            makeDefault
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
            enableDamping
            dampingFactor={0.05}
          />
        </R3FCanvas>
        

        {/* Selected object indicator */}
        {(selectedObject || selectedCategory) && (
          <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">
              Selected: <span className="text-primary capitalize">{selectedObject || selectedCategory}</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Right Control Panel */}
      <Scene3DControlPanel
        scene={scene}
        selectedObject={selectedObject}
        selectedCategory={selectedCategory}
        textureLibrary={textureLibrary}
        transformMode={transformMode}
        autoRotate={autoRotate}
        onTextureChange={handleTextureChange}
        onTransformChange={handleTransformChange}
        onTransformModeChange={setTransformMode}
        onCenterCamera={handleCenterCamera}
        onAddAnnotation={handleAddAnnotation}
        onAutoRotateToggle={() => setAutoRotate(!autoRotate)}
        onSceneChange={setScene}
        sunPosition={sunPosition}
        onSunPositionChange={setSunPosition}
        fenceHeight={fenceHeight}
        onFenceHeightChange={setFenceHeight}
      />
    </div>
  );
}
