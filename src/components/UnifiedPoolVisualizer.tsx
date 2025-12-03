import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky, Grid } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Scene3D, TransformMode, CameraPreset, TextureConfig, Annotation, Point, PoolLightConfig } from './scene3d/types';
import { Pool3DScene } from './Pool3DScene';
import WaterSurface from './WaterSurface';
import { Scene3DControlPanel } from './Scene3DControlPanel';
import { StairsControls } from './StairsControls';
import { Scene3DAnnotations } from './Scene3DAnnotations';
import { DistanceMeasurements } from './DistanceMeasurements';
import { GridLabels } from './GridLabels';
import { AssetManager, Asset3DRenderer } from './AssetManager';
import { SplineLegend } from './SplineLegend';
import { ComponentControlPanel } from './ComponentControlPanel';
import { ClimateController } from './scene3d/ClimateController';
import { EnhancedPoolLights, createDefaultPoolLights } from './scene3d/EnhancedPoolLights';
import { WaterCaustics } from './scene3d/WaterCaustics';
import { PoolAssetManager } from './scene3d/PoolAssetManager';
import { PoolAssetsRenderer } from './scene3d/PoolAssetsRenderer';
import { PoolStairConfig, PoolChairConfig } from './scene3d/poolAssetTypes';
import { WalkthroughController } from './scene3d/WalkthroughController';
import { PoolDesignerHeader } from './scene3d/PoolDesignerHeader';
import { Button } from './ui/button';
import { Maximize2, Minimize2, Move, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw, Ruler, Grid3x3, Waves, Box, Sun, Moon, Footprints, PersonStanding, Edit3 } from 'lucide-react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { Checkbox } from './ui/checkbox';
import * as THREE from 'three';
import { Scene3DErrorBoundary } from './scene3d/Scene3DErrorBoundary';
import { validateScene } from '@/utils/sceneValidator';
import { textureCache } from '@/utils/textureCache';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
  const [selectedComponent, setSelectedComponent] = useState<'pool' | 'deck' | 'coping' | 'waterline' | null>(null);
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([100, 20, 100]);
  const [fenceHeight, setFenceHeight] = useState(6);
  const [isStairsPlacementMode, setIsStairsPlacementMode] = useState(false);
  const [selectedStairId, setSelectedStairId] = useState<string | null>(null);
  const [enablePoolSplineEdit, setEnablePoolSplineEdit] = useState(false);
  const [enableDeckSplineEdit, setEnableDeckSplineEdit] = useState(false);
  const [enableFloorDepthSplineEdit, setEnableFloorDepthSplineEdit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [poolTransformMode, setPoolTransformMode] = useState(false);
  const [transformStepSize, setTransformStepSize] = useState(1); // Default 1 ft
  const [showMeasurements, setShowMeasurements] = useState(false);
  
  const [assets3D, setAssets3D] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(false); // Hidden by default
  const [showRulers, setShowRulers] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false); // Hidden by default
  const [showDebugBoundaries, setShowDebugBoundaries] = useState(false);
  const [showWater, setShowWater] = useState(true);
  const [deckWidth, setDeckWidth] = useState(3); // Default 3 feet
  const [showClimateController, setShowClimateController] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [sunAngle, setSunAngle] = useState(90); // Noon by default
  
  // Pool lights state
  const [poolLights, setPoolLights] = useState<PoolLightConfig[]>(() => 
    scene.poolLights || createDefaultPoolLights(false)
  );
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  
  // Pool assets state (stairs, chairs, contour seating)
  const [poolStairs, setPoolStairs] = useState<PoolStairConfig[]>([]);
  const [poolChairs, setPoolChairs] = useState<PoolChairConfig[]>([]);
  const [contourSeating, setContourSeating] = useState<Array<{
    id: string;
    startPosition: number;
    endPosition: number;
    width: number;
    height: number;
    textureUrl: string;
  }>>([]);
  const [selectedPoolAssetId, setSelectedPoolAssetId] = useState<string | null>(null);
  const [showPoolAssetManager, setShowPoolAssetManager] = useState(false);
  
  // Walkthrough mode state
  const [isWalkthroughMode, setIsWalkthroughMode] = useState(false);
  
  // Spline edit mode - locks camera when editing splines
  const [isSplineEditMode, setIsSplineEditMode] = useState(false);
  
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
  
  // Sync pool lights with night mode
  useEffect(() => {
    setPoolLights(prev => prev.map(l => ({ ...l, isOn: isNightMode })));
  }, [isNightMode]);
  
  // Handle pool lights change
  const handlePoolLightsChange = useCallback((newLights: PoolLightConfig[]) => {
    setPoolLights(newLights);
    // Update scene for persistence
    setScene({
      ...scene,
      poolLights: newLights
    });
  }, [scene, setScene]);
  
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
    // Reset camera to default isometric view centered on pool
    const target: [number, number, number] = [0, 0, 0];
    const position: [number, number, number] = [30, 25, 30];
    
    // Update camera via controls ref
    if (controlsRef.current) {
      controlsRef.current.target.set(target[0], target[1], target[2]);
      controlsRef.current.object.position.set(position[0], position[1], position[2]);
      controlsRef.current.update();
    }
    
    setScene({
      ...scene,
      camera: {
        position,
        target
      }
    });
    
    setCameraPreset(null);
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

  const handlePoolPointsChange = (points: Point[]) => {
    console.log('Pool points updated:', points);
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

  const handlePerimeterDepthPointsChange = (points: Array<{ x: number; z: number; depth: number; id: string; type?: 'linear' | 'smooth' }>) => {
    console.log('Perimeter depth points updated:', points);
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        perimeterDepthPoints: points
      }
    });
  };

  const toggleFullscreen = async () => {
    // For mobile, toggle fullscreen and rotate screen to landscape
    if (isMobile) {
      if (!isFullscreen) {
        // Entering fullscreen - lock to landscape
        try {
          const orientation = screen.orientation as any;
          if (orientation && orientation.lock) {
            await orientation.lock('landscape');
          }
          
          // Also try native fullscreen API if available
          if (canvasContainerRef.current) {
            const elem = canvasContainerRef.current as any;
            const requestFullscreen = elem.requestFullscreen || 
                                      elem.webkitRequestFullscreen || 
                                      elem.mozRequestFullScreen || 
                                      elem.msRequestFullscreen;
            
            if (requestFullscreen) {
              try {
                await requestFullscreen.call(elem);
              } catch (err) {
                console.log('Fullscreen API not available, using CSS fallback');
              }
            }
          }
        } catch (err) {
          console.log('Screen orientation lock not available, using CSS fallback');
        }
        
        setIsFullscreen(true);
      } else {
        // Exiting fullscreen - unlock orientation
        try {
          const orientation = screen.orientation as any;
          if (orientation && orientation.unlock) {
            orientation.unlock();
          }
          
          // Exit native fullscreen if active
          if (document.fullscreenElement) {
            const exitFullscreen = (document as any).exitFullscreen || 
                                  (document as any).webkitExitFullscreen || 
                                  (document as any).mozCancelFullScreen || 
                                  (document as any).msExitFullscreen;
            
            if (exitFullscreen) {
              await exitFullscreen.call(document);
            }
          }
        } catch (err) {
          console.log('Screen orientation unlock not needed');
        }
        
        setIsFullscreen(false);
      }
      return;
    }
    
    // For desktop, use Fullscreen API
    if (!canvasContainerRef.current) return;
    
    const elem = canvasContainerRef.current as any;
    
    if (!isFullscreen) {
      const requestFullscreen = elem.requestFullscreen || 
                                elem.webkitRequestFullscreen || 
                                elem.mozRequestFullScreen || 
                                elem.msRequestFullscreen;
      
      if (requestFullscreen) {
        requestFullscreen.call(elem);
      }
    } else {
      const exitFullscreen = (document as any).exitFullscreen || 
                            (document as any).webkitExitFullscreen || 
                            (document as any).mozCancelFullScreen || 
                            (document as any).msExitFullscreen;
      
      if (exitFullscreen) {
        exitFullscreen.call(document);
      }
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
      <div 
        ref={canvasContainerRef} 
        className={`flex-1 relative ${
          isFullscreen && isMobile 
            ? 'fixed inset-0 z-[99999] bg-background' 
            : ''
        }`}
      >
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
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg shadow-lg transition-colors ${showGrid ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
            title={showGrid ? "Hide Grid" : "Show Grid"}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowWater(!showWater)}
            className={`p-2 rounded-lg shadow-lg transition-colors ${showWater ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
            title={showWater ? "Hide Water" : "Show Water"}
          >
            <Waves className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`p-2 rounded-lg shadow-lg transition-colors ${showWireframe ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
            title={showWireframe ? "Hide Wireframe" : "Show Wireframe"}
          >
            <Box className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowClimateController(!showClimateController)}
            className={`p-2 rounded-lg shadow-lg transition-colors ${isNightMode ? 'bg-blue-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="Climate Controls"
          >
            {isNightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowPoolAssetManager(!showPoolAssetManager)}
            className={`p-2 rounded-lg shadow-lg transition-colors ${showPoolAssetManager ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
            title="Pool Assets (Stairs, Seating)"
          >
            <Footprints className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsWalkthroughMode(!isWalkthroughMode)}
            className={`p-2 rounded-lg shadow-lg transition-colors ${isWalkthroughMode ? 'bg-green-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="Walkthrough Mode (WASD + Space to jump)"
          >
            <PersonStanding className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const newMode = !isSplineEditMode;
              setIsSplineEditMode(newMode);
              // When entering spline edit mode, enable appropriate editing
              if (newMode) {
                setEnablePoolSplineEdit(true);
              }
            }}
            className={`p-2 rounded-lg shadow-lg transition-colors ${isSplineEditMode ? 'bg-orange-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="Spline Edit Mode (locks camera for precise editing)"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        {/* Pool Designer Header with Measurements & Cost */}
        <PoolDesignerHeader
          poolPoints={scene.pool.points}
          poolDepth={poolDepth}
          deckWidth={deckWidth}
          copingWidth={scene.deck.copingWidth || 1}
          poolPrice={parseFloat(new URLSearchParams(window.location.search).get('price') || '50000')}
        />

        {/* Walkthrough Mode UI Overlay */}
        {isWalkthroughMode && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Exit button */}
            <button
              onClick={() => setIsWalkthroughMode(false)}
              className="absolute top-4 right-16 pointer-events-auto bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Exit Walkthrough (ESC)
            </button>
            
            {/* Instructions */}
            <div className="absolute bottom-4 left-4 pointer-events-none bg-black/50 text-white p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Walkthrough Controls:</p>
              <p>WASD / Arrow Keys - Move</p>
              <p>Mouse - Look around</p>
              <p>Space - Jump</p>
              <p>ESC - Exit</p>
              {isMobile && (
                <>
                  <p className="mt-2 font-medium">Mobile:</p>
                  <p>Left side - Move</p>
                  <p>Right side - Look</p>
                </>
              )}
            </div>
            
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full opacity-50"></div>
            </div>
          </div>
        )}

        {/* Spline Edit Mode UI Overlay */}
        {isSplineEditMode && !isWalkthroughMode && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Exit button */}
            <button
              onClick={() => {
                setIsSplineEditMode(false);
                setEnablePoolSplineEdit(false);
                setEnableFloorDepthSplineEdit(false);
              }}
              className="absolute top-4 right-16 pointer-events-auto bg-orange-500/80 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Exit Edit Mode
            </button>
            
            {/* Instructions */}
            <div className="absolute bottom-4 right-4 pointer-events-none bg-orange-900/80 text-white p-3 rounded-lg text-sm max-w-xs">
              <p className="font-medium mb-1 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Spline Edit Mode Active
              </p>
              <p className="text-xs opacity-80">Camera rotation locked for precise editing</p>
              <ul className="text-xs mt-2 space-y-1 opacity-90">
                <li>• Drag control points to reshape</li>
                <li>• Scroll to zoom, drag to pan</li>
                <li>• Click outside to deselect</li>
              </ul>
            </div>
          </div>
        )}


         {/* Quick Controls Bar - Bottom Left */}
         <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
           {/* Spline Editor Legend */}
           {(enablePoolSplineEdit || enableDeckSplineEdit) && <SplineLegend />}
         </div>

         {/* Component-Specific Control Panel */}
         <ComponentControlPanel
           selectedComponent={selectedComponent}
           scene={scene}
           onClose={() => {
             setSelectedComponent(null);
             setSelectedCategory(null);
           }}
           onSceneChange={setScene}
           textureLibrary={textureLibrary}
           poolCategory={new URLSearchParams(window.location.search).get('category') || 'deluxe'}
           poolModel={new URLSearchParams(window.location.search).get('model') || ''}
           deckWidth={deckWidth}
           onDeckWidthChange={setDeckWidth}
           enablePoolSplineEdit={enablePoolSplineEdit}
           onPoolSplineEditToggle={() => setEnablePoolSplineEdit(!enablePoolSplineEdit)}
           enableFloorDepthSplineEdit={enableFloorDepthSplineEdit}
           onFloorDepthSplineEditToggle={() => setEnableFloorDepthSplineEdit(!enableFloorDepthSplineEdit)}
           poolLights={poolLights}
           onPoolLightsChange={handlePoolLightsChange}
           selectedLightId={selectedLightId}
           onSelectLight={setSelectedLightId}
           isNightMode={isNightMode}
         />

          {/* Climate Controller Panel */}
          <ClimateController
            isOpen={showClimateController}
            onClose={() => setShowClimateController(false)}
            isNightMode={isNightMode}
            onNightModeChange={setIsNightMode}
            sunAngle={sunAngle}
            onSunAngleChange={setSunAngle}
            onSunPositionChange={setSunPosition}
          />

          {/* Pool Asset Manager (Stairs, Seating, Lights, Jets) */}
          <PoolAssetManager
            isOpen={showPoolAssetManager}
            onToggle={() => setShowPoolAssetManager(!showPoolAssetManager)}
            stairs={poolStairs}
            onStairsChange={setPoolStairs}
            chairs={poolChairs}
            onChairsChange={setPoolChairs}
            contourSeating={contourSeating}
            onContourSeatingChange={setContourSeating}
            lights={poolLights}
            onLightsChange={handlePoolLightsChange}
            selectedAssetId={selectedPoolAssetId}
            onSelectAsset={setSelectedPoolAssetId}
            poolFinishTexture={linerTextureUrl}
            isNightMode={isNightMode}
          />

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
                  preserveDrawingBuffer: false, // Changed to false for better memory
                  antialias: true,
                  alpha: false, // Changed to false for better performance
                  powerPreference: "high-performance",
                  failIfMajorPerformanceCaveat: false // Don't fail on slower devices
                }}
                onCreated={({ gl, scene }) => {
                  console.log('✅ WebGL Context Created');
                  
                  // Handle context loss
                  gl.domElement.addEventListener('webglcontextlost', (event) => {
                    event.preventDefault();
                    console.error('❌ WebGL Context Lost - attempting recovery');
                  });
                  
                  // Handle context restore
                  gl.domElement.addEventListener('webglcontextrestored', () => {
                    console.log('✅ WebGL Context Restored');
                  });
                  
                  // Enable automatic garbage collection
                  gl.dispose = () => {
                    console.log('🧹 Cleaning up WebGL resources');
                  };
                }}
                camera={{
                  position: scene.camera.position,
                  fov: 50
                }}
                frameloop={isWalkthroughMode ? "always" : "demand"} // Always render during walkthrough for smooth movement
              >
          {/* Dynamic Sky with Clouds - Day/Night modes */}
          {!isNightMode ? (
            <Sky 
              distance={450000}
              sunPosition={sunPosition}
              inclination={0.6}
              azimuth={0.25}
            />
          ) : (
            // Night sky - dark background
            <color attach="background" args={['#0a1628']} />
          )}
          
          {/* Day lighting */}
          {!isNightMode && (
            <>
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
            </>
          )}
          
          {/* Night lighting - Moon and ambient */}
          {isNightMode && (
            <>
              <ambientLight intensity={0.15} color="#4a5568" />
              {/* Moon light */}
              <directionalLight
                position={[50, 80, 30]}
                intensity={0.4}
                color="#c4d4e8"
                castShadow
              />
              {/* Subtle fill light */}
              <hemisphereLight
                intensity={0.2}
                color="#1a365d"
                groundColor="#1a202c"
              />
            </>
          )}
          
          {/* Pool Lights - Draggable, wall-snapped lights */}
          <EnhancedPoolLights
            poolPoints={scene.pool.points}
            lights={poolLights}
            onLightsChange={handlePoolLightsChange}
            selectedLightId={selectedLightId}
            onSelectLight={setSelectedLightId}
          />
          
          {/* Water Caustics - Light patterns on pool floor */}
          <WaterCaustics
            poolPoints={scene.pool.points}
            lights={poolLights}
            isNightMode={isNightMode}
            sunAngle={sunAngle}
            causticIntensity={0.5}
          />
          
          {/* Pool Assets (Stairs, Chairs, Contour Seating) */}
          <PoolAssetsRenderer
            poolPoints={scene.pool.points}
            stairs={poolStairs}
            onStairsChange={setPoolStairs}
            chairs={poolChairs}
            onChairsChange={setPoolChairs}
            contourSeating={contourSeating}
            onContourSeatingChange={setContourSeating}
            selectedAssetId={selectedPoolAssetId}
            onSelectAsset={setSelectedPoolAssetId}
            poolDepth={poolDepth}
          />
          
          <CameraController preset={cameraPreset} target={scene.camera.target} />
          
          {/* Pool walls, floor, coping, waterline, AND deck - all in one rendering */}
          <group ref={poolGroupRef} position={[0, 0, 0]} key={`pool-${scene.pool.position.join('-')}`}>
            <Pool3DScene
              points={scene.pool.points}
              depthPoints={scene.pool.depthPoints}
              hardscapePoints={scene.deck.points || []} // Include deck in single render
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
              onSelectComponent={setSelectedComponent}
              fenceHeight={fenceHeight}
              paverTextureScale={scene.deck.paver.scale || 1.8}
              copingTextureScale={scene.deck.coping.scale || 1.8}
              waterlineTextureScale={scene.deck.waterline?.scale || 1.8}
              linerTextureScale={scene.pool.finish.scale || 1.8}
              paverTextureOffset={scene.deck.paver.offset || [0, 0]}
              copingTextureOffset={scene.deck.coping.offset || [0, 0]}
              waterlineTextureOffset={scene.deck.waterline?.offset || [0, 0]}
              linerTextureOffset={scene.pool.finish.offset || [0, 0]}
              poolPosition={[0, 0, 0]}
              copingHeight={scene.deck.copingHeight || 2 / 12}
              deckHeight={scene.deck.deckHeight || 2 / 12}
              copingWidth={scene.deck.copingWidth || 1.0}
              deckWidth={deckWidth}
              deckElevation={scene.deck.deckElevation || 0}
              stairs={scene.stairs}
              onStairsChange={handleStairsChange}
              isStairsPlacementMode={isStairsPlacementMode}
              onStairsPlacementComplete={handleStairsPlacementComplete}
              selectedStairId={selectedStairId}
              onSelectStair={setSelectedStairId}
              enablePoolSplineEdit={enablePoolSplineEdit}
              enableDeckSplineEdit={enableDeckSplineEdit}
              enableFloorDepthSplineEdit={enableFloorDepthSplineEdit}
              perimeterDepthPoints={scene.pool.perimeterDepthPoints}
              onPoolPointsChange={handlePoolPointsChange}
              onDeckPointsChange={handleDeckPointsChange}
              onPerimeterDepthPointsChange={handlePerimeterDepthPointsChange}
              showWireframe={showWireframe}
              showRulers={showWireframe} 
              showDebugBoundaries={showDebugBoundaries}
              onDebugBoundariesChange={setShowDebugBoundaries}
            />
          </group>

          {/* Water surface - follows actual pool shape */}
          {showWater && (
            <group position={[0, 0, 0]}>
              <WaterSurface 
                poolPoints={scene.pool.points}
                depthPoints={scene.pool.depthPoints}
                poolDimensions={scene.pool.dimensions}
                showWireframe={showWireframe}
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
          
          {/* Walkthrough Controller */}
          <WalkthroughController
            enabled={isWalkthroughMode}
            onExit={() => setIsWalkthroughMode(false)}
            groundLevel={0}
            playerHeight={5.5}
            moveSpeed={10}
            jumpForce={15}
          />
          
          {/* OrbitControls - disabled during walkthrough or spline edit mode */}
          {!isWalkthroughMode && !isSplineEditMode && (
            <OrbitControls
              ref={controlsRef}
              makeDefault
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              enableDamping
              dampingFactor={0.05}
            />
          )}
          
          {/* Show message when in spline edit mode */}
          {isSplineEditMode && !isWalkthroughMode && (
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableRotate={false}
              enablePan={true}
              enableZoom={true}
              enableDamping={false}
            />
          )}
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
    </div>
  );
}
