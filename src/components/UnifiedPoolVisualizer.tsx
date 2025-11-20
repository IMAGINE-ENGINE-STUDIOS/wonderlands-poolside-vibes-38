import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import { Scene3D, TransformMode, CameraPreset, TextureConfig, Annotation } from './scene3d/types';
import { Pool3DScene } from './Pool3DScene';
import { Scene3DControlPanel } from './Scene3DControlPanel';
import { StairsControls } from './StairsControls';
import { Scene3DAnnotations } from './Scene3DAnnotations';
import { Button } from './ui/button';
import { Maximize2, Minimize2, Move } from 'lucide-react';
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
  const [isStairsPlacementMode, setIsStairsPlacementMode] = useState(false);
  const [selectedStairId, setSelectedStairId] = useState<string | null>(null);
  const [enablePoolSplineEdit, setEnablePoolSplineEdit] = useState(false);
  const [enableDeckSplineEdit, setEnableDeckSplineEdit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [poolTransformMode, setPoolTransformMode] = useState(false);
  const [transformStepSize, setTransformStepSize] = useState(1); // Default 1 ft
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const poolGroupRef = useRef<THREE.Group>(null);

  const FLORIDA_STEP_HEIGHT = 0.625; // 7.5 inches
  const DEFAULT_STEP_DEPTH = 0.9167; // 11 inches
  
  const poolDepth = scene.pool.dimensions?.depth || 8;

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

  const handleStairsPlacementComplete = (position: [number, number, number], rotation: number) => {
    if (position[0] === 0 && position[1] === 0 && position[2] === 0) {
      // Cancel placement
      setIsStairsPlacementMode(false);
      return;
    }

    const numSteps = Math.ceil(poolDepth / FLORIDA_STEP_HEIGHT);
    
    const newStair = {
      id: `stair-${Date.now()}`,
      position,
      rotation,
      shape: 'rectangle' as const,
      width: 3,
      numSteps,
      stepHeight: FLORIDA_STEP_HEIGHT,
      stepDepth: DEFAULT_STEP_DEPTH
    };

    setScene(prev => ({
      ...prev,
      stairs: [...prev.stairs, newStair]
    }));

    setIsStairsPlacementMode(false);
    setSelectedStairId(newStair.id);
  };

  const handleStairsChange = (updatedStairs: any[]) => {
    setScene(prev => ({
      ...prev,
      stairs: updatedStairs
    }));
  };

  const handlePoolPointsChange = (points: any[]) => {
    setScene(prev => ({
      ...prev,
      pool: {
        ...prev.pool,
        points
      }
    }));
  };

  const handleDeckPointsChange = (points: any[]) => {
    setScene(prev => ({
      ...prev,
      deck: {
        ...prev.deck,
        points
      }
    }));
  };

  const toggleFullscreen = () => {
    if (!canvasContainerRef.current) return;
    
    if (!isFullscreen) {
      canvasContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePoolPositionChange = (axis: 'x' | 'y' | 'z', delta: number) => {
    setScene(prev => {
      const currentPos = prev.pool.position;
      const step = transformStepSize;
      const newPosition: [number, number, number] = [...currentPos];
      
      if (axis === 'x') newPosition[0] += delta * step;
      if (axis === 'y') newPosition[1] += delta * step;
      if (axis === 'z') newPosition[2] += delta * step;
      
      return {
        ...prev,
        pool: {
          ...prev.pool,
          position: newPosition
        }
      };
    });
  };

  const handleDirectPositionInput = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setScene(prev => {
      const newPosition: [number, number, number] = [...prev.pool.position];
      if (axis === 'x') newPosition[0] = numValue;
      if (axis === 'y') newPosition[1] = numValue;
      if (axis === 'z') newPosition[2] = numValue;
      
      return {
        ...prev,
        pool: {
          ...prev.pool,
          position: newPosition
        }
      };
    });
  };

  const handleResetPosition = () => {
    setScene(prev => ({
      ...prev,
      pool: {
        ...prev.pool,
        position: [0, 0, 0]
      }
    }));
  };

  // Keyboard controls for pool movement
  useEffect(() => {
    if (!poolTransformMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 0.00833; // Millimeter precision (0.1 inch)
      
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
          e.preventDefault();
          handlePoolPositionChange('x', -step / transformStepSize);
          break;
        case 'arrowright':
          e.preventDefault();
          handlePoolPositionChange('x', step / transformStepSize);
          break;
        case 'arrowup':
          e.preventDefault();
          handlePoolPositionChange('z', -step / transformStepSize);
          break;
        case 'arrowdown':
          e.preventDefault();
          handlePoolPositionChange('z', step / transformStepSize);
          break;
        case 'q':
          e.preventDefault();
          handlePoolPositionChange('y', -step / transformStepSize);
          break;
        case 'e':
          e.preventDefault();
          handlePoolPositionChange('y', step / transformStepSize);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [poolTransformMode, transformStepSize]);

  return (
    <div className="flex h-full w-full">
      {/* Main 3D Canvas */}
      <div ref={canvasContainerRef} className="flex-1 relative">
        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background p-2 rounded-lg shadow-lg transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Scene Controls Dashboard */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg space-y-3 max-w-xs z-10">
          <h3 className="text-sm font-semibold mb-2">Pool Transform Controls</h3>
          
          {/* Pool Transform Mode Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs">Move Pool</label>
            <button
              onClick={() => setPoolTransformMode(!poolTransformMode)}
              className={`p-2 rounded transition-colors ${
                poolTransformMode ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
              title="Toggle Pool Transform Mode"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>

          {/* Step Size Control */}
          <div className="space-y-2">
            <label className="text-xs">Movement Step Size</label>
            <div className="flex gap-1">
              <button
                onClick={() => setTransformStepSize(0.00833)} // 0.1 inch (millimeter precision)
                className={`px-2 py-1 text-xs rounded ${transformStepSize === 0.00833 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                0.1"
              </button>
              <button
                onClick={() => setTransformStepSize(0.0833)} // 1 inch
                className={`px-2 py-1 text-xs rounded ${transformStepSize === 0.0833 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                1"
              </button>
              <button
                onClick={() => setTransformStepSize(1)} // 1 foot
                className={`px-2 py-1 text-xs rounded ${transformStepSize === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                1ft
              </button>
            </div>
          </div>

          {/* Position Controls */}
          {poolTransformMode && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium">Position (X, Y, Z)</div>
                <button
                  onClick={handleResetPosition}
                  className="px-2 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs rounded"
                >
                  Reset
                </button>
              </div>
              
              <div className="text-xs text-muted-foreground mb-1">
                Use arrows (↑↓←→), Q (down), E (up)
              </div>
              
              {/* X Axis */}
              <div className="flex items-center gap-2">
                <span className="text-xs w-4">X:</span>
                <button
                  onClick={() => handlePoolPositionChange('x', -1)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  value={scene.pool.position[0].toFixed(3)}
                  onChange={(e) => handleDirectPositionInput('x', e.target.value)}
                  className="flex-1 text-center text-xs bg-background border rounded px-1 py-1"
                  step={transformStepSize}
                />
                <button
                  onClick={() => handlePoolPositionChange('x', 1)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs"
                >
                  +
                </button>
              </div>

              {/* Y Axis (Elevation) */}
              <div className="flex items-center gap-2">
                <span className="text-xs w-4">Y:</span>
                <button
                  onClick={() => handlePoolPositionChange('y', -1)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  value={scene.pool.position[1].toFixed(3)}
                  onChange={(e) => handleDirectPositionInput('y', e.target.value)}
                  className="flex-1 text-center text-xs bg-background border rounded px-1 py-1"
                  step={transformStepSize}
                />
                <button
                  onClick={() => handlePoolPositionChange('y', 1)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs"
                >
                  +
                </button>
              </div>

              {/* Z Axis */}
              <div className="flex items-center gap-2">
                <span className="text-xs w-4">Z:</span>
                <button
                  onClick={() => handlePoolPositionChange('z', -1)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  value={scene.pool.position[2].toFixed(3)}
                  onChange={(e) => handleDirectPositionInput('z', e.target.value)}
                  className="flex-1 text-center text-xs bg-background border rounded px-1 py-1"
                  step={transformStepSize}
                />
                <button
                  onClick={() => handlePoolPositionChange('z', 1)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

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
          
          {/* Pool rendering - ONLY pool components in this group */}
          <group ref={poolGroupRef} position={scene.pool.position}>
            {/* Pool Mesh (walls and floor) */}
            <group onClick={() => setSelectedCategory('pool')}>
              <Pool3DScene
                points={scene.pool.points}
                depthPoints={scene.pool.depthPoints}
                hardscapePoints={[]} // Empty - deck stays fixed
                linerTextureUrl={scene.pool.finish.url}
                paverTextureUrl=""
                copingTextureUrl={scene.deck.coping.url}
                waterlineTextureUrl={scene.deck.waterline?.url}
                fenceTextureUrl=""
                features={[]}
                fencePoints={[]}
                scale={1}
                poolShape="rectangle"
                poolDimensions={scene.pool.dimensions}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                fenceHeight={fenceHeight}
                paverTextureScale={1.8}
                copingTextureScale={scene.deck.coping.scale || 1.8}
                waterlineTextureScale={scene.deck.waterline?.scale || 1.8}
                linerTextureScale={scene.pool.finish.scale || 1.8}
                paverTextureOffset={[0, 0]}
                copingTextureOffset={scene.deck.coping.offset || [0, 0]}
                waterlineTextureOffset={scene.deck.waterline?.offset || [0, 0]}
                linerTextureOffset={scene.pool.finish.offset || [0, 0]}
                poolPosition={[0, 0, 0]} // Position controlled by parent group
                copingHeight={scene.deck.copingHeight || 2 / 12}
                deckHeight={scene.deck.deckHeight || 2 / 12}
                copingWidth={scene.deck.copingWidth || 1.0}
                stairs={scene.stairs}
                onStairsChange={handleStairsChange}
                isStairsPlacementMode={false}
                onStairsPlacementComplete={handleStairsPlacementComplete}
                selectedStairId={selectedStairId}
                onSelectStair={setSelectedStairId}
                enablePoolSplineEdit={false}
                enableDeckSplineEdit={false}
                onPoolPointsChange={handlePoolPointsChange}
                onDeckPointsChange={handleDeckPointsChange}
              />
            </group>
          </group>

          {/* Deck and terrain - FIXED position */}
          {scene.deck.points && scene.deck.points.length > 0 && (
            <group onClick={() => setSelectedCategory('deck')}>
              <Pool3DScene
                points={scene.pool.points}
                depthPoints={[]}
                hardscapePoints={scene.deck.points}
                linerTextureUrl=""
                paverTextureUrl={scene.deck.paver.url}
                copingTextureUrl=""
                waterlineTextureUrl=""
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
                paverTextureScale={scene.deck.paver.scale || 1.8}
                copingTextureScale={1.8}
                waterlineTextureScale={1.8}
                linerTextureScale={1.8}
                paverTextureOffset={scene.deck.paver.offset || [0, 0]}
                copingTextureOffset={[0, 0]}
                waterlineTextureOffset={[0, 0]}
                linerTextureOffset={[0, 0]}
                poolPosition={scene.pool.position}
                copingHeight={scene.deck.copingHeight || 2 / 12}
                deckHeight={scene.deck.deckHeight || 2 / 12}
                copingWidth={scene.deck.copingWidth || 1.0}
                stairs={[]}
                onStairsChange={handleStairsChange}
                isStairsPlacementMode={isStairsPlacementMode}
                onStairsPlacementComplete={handleStairsPlacementComplete}
                selectedStairId={selectedStairId}
                onSelectStair={setSelectedStairId}
                enablePoolSplineEdit={enablePoolSplineEdit}
                enableDeckSplineEdit={enableDeckSplineEdit}
                onPoolPointsChange={handlePoolPointsChange}
                onDeckPointsChange={handleDeckPointsChange}
              />
            </group>
          )}

          {/* Transform Controls for Pool - with translation snap */}
          {poolTransformMode && poolGroupRef.current && (
            <TransformControls 
              object={poolGroupRef.current} 
              mode="translate"
              translationSnap={transformStepSize}
              onChange={() => {
                if (poolGroupRef.current) {
                  const pos = poolGroupRef.current.position;
                  setScene(prev => ({
                    ...prev,
                    pool: {
                      ...prev.pool,
                      position: [pos.x, pos.y, pos.z]
                    }
                  }));
                }
              }}
            />
          )}
          
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
        stairs={scene.stairs}
        poolDepth={poolDepth}
        onStairsChange={handleStairsChange}
        onPlacementModeToggle={setIsStairsPlacementMode}
        isStairsPlacementMode={isStairsPlacementMode}
        selectedStairId={selectedStairId}
        enablePoolSplineEdit={enablePoolSplineEdit}
        enableDeckSplineEdit={enableDeckSplineEdit}
        onPoolSplineEditToggle={() => setEnablePoolSplineEdit(!enablePoolSplineEdit)}
        onDeckSplineEditToggle={() => setEnableDeckSplineEdit(!enableDeckSplineEdit)}
      />
    </div>
  );
}
