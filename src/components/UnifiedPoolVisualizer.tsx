import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky, Grid } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Scene3D, TransformMode, CameraPreset, TextureConfig, Annotation } from './scene3d/types';
import { Pool3DScene } from './Pool3DScene';
import { Scene3DControlPanel } from './Scene3DControlPanel';
import { StairsControls } from './StairsControls';
import { Scene3DAnnotations } from './Scene3DAnnotations';
import { DistanceMeasurements } from './DistanceMeasurements';
import { GridLabels } from './GridLabels';
import { AssetManager, Asset3DRenderer } from './AssetManager';
import { Button } from './ui/button';
import { Maximize2, Minimize2, Move, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { Checkbox } from './ui/checkbox';
import * as THREE from 'three';
import { Scene3DErrorBoundary } from './scene3d/Scene3DErrorBoundary';
import { validateScene } from '@/utils/sceneValidator';
import { textureCache } from '@/utils/textureCache';

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
  // Validate scene before using it
  const validatedScene = validateScene(initialScene);
  
  console.log('🎬 UnifiedPoolVisualizer: Initializing with scene', {
    poolFinish: validatedScene.pool.finish?.url,
    paver: validatedScene.deck.paver?.url,
    coping: validatedScene.deck.coping?.url,
    waterline: validatedScene.deck.waterline?.url,
    timestamp: new Date().toISOString()
  });
  
  const { state: scene, set: setScene, undo, redo, canUndo, canRedo, reset } = useUndoRedo<Scene3D>(validatedScene);
  
  // Texture preloading state
  const [texturesReady, setTexturesReady] = useState(false);
  
  // Recovery handler for error boundary
  const handleSceneRecover = useCallback((recoveredScene: Scene3D) => {
    console.log('🛡️ Applying recovered scene with fallback textures');
    reset(recoveredScene);
  }, [reset]);
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
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [controllerCollapsed, setControllerCollapsed] = useState(false);
  const [assets3D, setAssets3D] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(true);
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
    reset(initialScene);
  }, [initialScene, reset]);
  
  // Helper to safely extract texture URLs with fallbacks
  const safeGetTextureUrl = useCallback((textureConfig: TextureConfig | undefined, fallback: string): string => {
    const url = textureConfig?.url;
    const isValid = url && url !== '' && url !== 'undefined' && url !== 'null';
    const result = isValid ? url : fallback;
    
    if (!isValid) {
      console.warn('⚠️ Invalid texture URL detected:', {
        received: url,
        receivedType: typeof url,
        fallback,
        textureConfig
      });
    }
    
    return result;
  }, []);
  
  // Extract safe texture URLs
  const linerTextureUrl = safeGetTextureUrl(scene.pool.finish, '/src/assets/finishes/sapphire-blue-g3.jpg');
  const paverTextureUrl = safeGetTextureUrl(scene.deck.paver, '/lovable-uploads/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png');
  const copingTextureUrl = safeGetTextureUrl(scene.deck.coping, '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png');
  const waterlineTextureUrl = safeGetTextureUrl(scene.deck.waterline, scene.pool.finish.url);
  
  // Log extracted texture URLs for debugging
  console.log('🎨 UnifiedPoolVisualizer Safe Texture URLs:', {
    liner: linerTextureUrl,
    paver: paverTextureUrl,
    coping: copingTextureUrl,
    waterline: waterlineTextureUrl
  });
  
  // Preload textures before rendering 3D scene
  useEffect(() => {
    const preloadTextures = async () => {
      console.log('🔄 Preloading textures...');
      try {
        const urls = [linerTextureUrl, paverTextureUrl, copingTextureUrl, waterlineTextureUrl];
        
        console.log('📦 Texture URLs to preload:', urls);
        await Promise.all(urls.map(url => textureCache.loadTexture(url)));
        console.log('✅ All textures preloaded successfully');
        setTexturesReady(true);
      } catch (error) {
        console.error('❌ Texture preload failed:', error);
        // Still set ready to show error boundary instead of infinite loading
        setTexturesReady(true);
      }
    };
    
    preloadTextures();
  }, [linerTextureUrl, paverTextureUrl, copingTextureUrl, waterlineTextureUrl]);

  // Camera centering when category is selected
  useEffect(() => {
    if (!selectedCategory || !controlsRef.current) return;
    
    const cameraConfigs: Record<string, { position: [number, number, number], target: [number, number, number] }> = {
      pool: { position: [0, 40, 0], target: [0, -3, 0] },
      deck: { position: [25, 15, 25], target: [0, 0, 0] },
      coping: { position: [15, 5, 15], target: [0, 0.1, 0] },
      waterline: { position: [20, 2, 20], target: [0, -0.2, 0] },
      water: { position: [0, 30, 30], target: [0, 0, 0] }
    };
    
    const config = cameraConfigs[selectedCategory];
    if (config && controlsRef.current) {
      // Smoothly animate camera
      const controls = controlsRef.current;
      controls.target.set(...config.target);
      
      // Update camera position
      const camera = controls.object;
      camera.position.set(...config.position);
      camera.lookAt(new THREE.Vector3(...config.target));
      
      controls.update();
    }
  }, [selectedCategory]);

  const handleTextureChange = (category: 'pool' | 'deck' | 'coping' | 'waterline', texture: TextureConfig) => {
    const updated = { ...scene };
    
    if (category === 'pool') {
      updated.pool.finish = texture;
    } else if (category === 'deck') {
      updated.deck.paver = texture;
    } else if (category === 'coping') {
      updated.deck.coping = texture;
    } else if (category === 'waterline') {
      updated.deck.waterline = texture;
    }
    
    setScene(updated);
  };

  const handleTransformChange = (
    position: [number, number, number],
    rotation: [number, number, number],
    scale: number
  ) => {
    if (!selectedObject) return;
    
    const updated = { ...scene };
    
    // Update position/rotation based on selected object
    if (selectedObject === 'pool') {
      updated.pool.position = position;
      updated.pool.rotation = rotation;
    }
    
    setScene(updated);
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
    
    setScene({
      ...scene,
      camera: {
        position: [target[0] + 20, target[1] + 20, target[2] + 20],
        target
      }
    });
    
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
    
    setScene({
      ...scene,
      annotations: [...scene.annotations, newAnnotation]
    });
  };

  const handleDeleteAnnotation = (id: string) => {
    setScene({
      ...scene,
      annotations: scene.annotations.filter(a => a.id !== id)
    });
  };

  const handleToggleConfirmAnnotation = (id: string) => {
    setScene({
      ...scene,
      annotations: scene.annotations.map(a =>
        a.id === id ? { ...a, confirmed: !a.confirmed } : a
      )
    });
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

    setScene({
      ...scene,
      stairs: [...scene.stairs, newStair]
    });

    setIsStairsPlacementMode(false);
    setSelectedStairId(newStair.id);
  };

  const handleStairsChange = (updatedStairs: any[]) => {
    setScene({
      ...scene,
      stairs: updatedStairs
    });
  };

  const handlePoolPointsChange = (points: any[]) => {
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        points
      }
    });
  };

  const handleDeckPointsChange = (points: any[]) => {
    setScene({
      ...scene,
      deck: {
        ...scene.deck,
        points
      }
    });
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
    const currentPos = scene.pool.position;
    const step = transformStepSize;
    const newPosition: [number, number, number] = [...currentPos];
    
    if (axis === 'x') newPosition[0] += delta * step;
    if (axis === 'y') newPosition[1] += delta * step;
    if (axis === 'z') newPosition[2] += delta * step;
    
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        position: newPosition
      }
    });
  };

  const handleDirectPositionInput = (axis: 'x' | 'y' | 'z', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const newPosition: [number, number, number] = [...scene.pool.position];
    if (axis === 'x') newPosition[0] = numValue;
    if (axis === 'y') newPosition[1] = numValue;
    if (axis === 'z') newPosition[2] = numValue;
    
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        position: newPosition
      }
    });
  };

  const handleResetPosition = () => {
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        position: [-10, 0, 20] // S25 grid position
      }
    });
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
  }, [poolTransformMode, transformStepSize, handlePoolPositionChange]);

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

        {/* Undo/Redo & Reset View Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="bg-background/80 hover:bg-background p-2 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="bg-background/80 hover:bg-background p-2 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (controlsRef.current) {
                // Reset camera to default isometric view
                const controls = controlsRef.current;
                controls.target.set(0, 0, 0);
                const camera = controls.object;
                camera.position.set(40, 30, 40);
                camera.lookAt(0, 0, 0);
                controls.update();
              }
            }}
            className="bg-background/80 hover:bg-background p-2 rounded-lg shadow-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Scene Controls Dashboard - Inside 3D Viewer with Arrow Toggle */}
        <div className={`absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg shadow-lg z-10 transition-all duration-300 ${
          controllerCollapsed ? 'w-auto' : 'max-w-xs'
        }`}>
          {/* Collapse/Expand Toggle - Arrow Button */}
          {controllerCollapsed ? (
            <button
              onClick={() => setControllerCollapsed(false)}
              className="p-3 bg-background rounded-lg shadow-lg hover:bg-muted transition-colors"
              title="Expand Controls"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setControllerCollapsed(true)}
              className="absolute -right-3 top-4 bg-background rounded-full p-1 shadow-lg hover:bg-muted transition-colors"
              title="Collapse Controls"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {!controllerCollapsed && (
            <div className="p-4 space-y-3">
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

              {/* Measurements Toggle */}
              <div className="pt-2 border-t flex items-center gap-2">
                <Checkbox
                  id="show-measurements"
                  checked={showMeasurements}
                  onCheckedChange={(checked) => setShowMeasurements(checked as boolean)}
                />
                <label htmlFor="show-measurements" className="text-xs cursor-pointer">
                  Show Distance Measurements
                </label>
              </div>

              {/* Grid Toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={(checked) => setShowGrid(checked as boolean)}
                />
                <label htmlFor="show-grid" className="text-xs cursor-pointer">
                  Show Grid Labels
                </label>
              </div>
            </div>
          )}
        </div>

        <Scene3DErrorBoundary scene={scene} onRecover={handleSceneRecover}>
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-background/95">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading 3D Viewer...</p>
              </div>
            </div>
          }>
            {texturesReady && (
              <R3FCanvas
                shadows
                gl={{ 
                  preserveDrawingBuffer: true,
                  antialias: true,
                  alpha: true,
                  powerPreference: "high-performance"
                }}
                onCreated={({ gl }) => {
                  console.log('✅ WebGL Context Created');
                  gl.domElement.addEventListener('webglcontextlost', (event) => {
                    event.preventDefault();
                    console.error('❌ WebGL Context Lost - attempting recovery');
                  });
                  gl.domElement.addEventListener('webglcontextrestored', () => {
                    console.log('✅ WebGL Context Restored');
                  });
                }}
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
          
          {/* Pool hole and water - at S25 position [-10, 0, 20] */}
          <group ref={poolGroupRef} position={scene.pool.position} key={`pool-${scene.pool.position.join('-')}`}>
            {/* Pool Mesh (walls and floor) AND Water Surface - both at S25 */}
            <group onClick={() => setSelectedCategory('pool')}>
              <Pool3DScene
                points={scene.pool.points}
                depthPoints={scene.pool.depthPoints}
                hardscapePoints={[]} // Empty - deck rendered separately
                linerTextureUrl={linerTextureUrl}
                paverTextureUrl={paverTextureUrl}
                copingTextureUrl={copingTextureUrl}
                waterlineTextureUrl={waterlineTextureUrl}
                fenceTextureUrl="/src/assets/fence-texture.png"
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

          {/* Deck, coping, and waterline - centered at U21 [0, 0, 0] */}
          {scene.deck.points && scene.deck.points.length > 0 && (
            <group position={[0, 0, 0]} onClick={() => setSelectedCategory('deck')}>
              <Pool3DScene
                points={scene.pool.points}
                depthPoints={[]}
                hardscapePoints={scene.deck.points}
                linerTextureUrl={linerTextureUrl}
                paverTextureUrl={paverTextureUrl}
                copingTextureUrl={copingTextureUrl}
                waterlineTextureUrl={waterlineTextureUrl}
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
                poolPosition={scene.pool.position} // Pass pool offset for proper coping/waterline alignment
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

          {/* 3D Assets */}
          {assets3D.map((asset) => (
            <Asset3DRenderer key={asset.id} asset={asset} />
          ))}

          {/* Grid with Labels */}
          {showGrid && (
            <>
              <Grid
                args={[200, 200]}
                cellSize={5}
                cellThickness={0.5}
                cellColor="#6f6f6f"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#9d4b4b"
                fadeDistance={400}
                fadeStrength={1}
                followCamera={false}
                infiniteGrid
              />
              <GridLabels gridSize={200} cellSize={5} visible={showGrid} />
            </>
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
                  setScene({
                    ...scene,
                    pool: {
                      ...scene.pool,
                      position: [pos.x, pos.y, pos.z]
                    }
                  });
                }
              }}
            />
          )}
          
          {/* Distance Measurements */}
          <DistanceMeasurements
            poolPoints={scene.pool.points}
            deckPoints={scene.deck.points}
            showMeasurements={showMeasurements}
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
            )}
          </Suspense>
        </Scene3DErrorBoundary>

        {/* Asset Manager - Visible in fullscreen */}
        <AssetManager 
          assets={assets3D}
          onAddAsset={(asset) => setAssets3D([...assets3D, asset])}
          onRemoveAsset={(id) => setAssets3D(assets3D.filter(a => a.id !== id))}
        />
      </div>
      
      {/* Right Control Panel - Visible in fullscreen */}
      {!controllerCollapsed && (
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
        onSelectCategory={setSelectedCategory}
      />
      )}
    </div>
  );
}
