import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky, Grid } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react';
import { Scene3D, TransformMode, CameraPreset, TextureConfig, Annotation, Point, PoolLightConfig, LinearDepthAnchor } from './scene3d/types';
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
import { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './scene3d/poolAssetTypes';
import { WalkthroughController } from './scene3d/WalkthroughController';
import { PoolDesignerHeader } from './scene3d/PoolDesignerHeader';
import { SplineEditPanel } from './scene3d/SplineEditPanel';
import { DepthProfileEditor } from './scene3d/DepthProfileEditor';
import { createDepthInterpolator, createDefaultLinearAnchors } from './scene3d/depthUtils';
import { TerrainEditor, TerrainAsset, AssetLibraryItem } from './scene3d/TerrainEditor';
import { TerrainAssetsRenderer } from './scene3d/TerrainAssetsRenderer';
import { Button } from './ui/button';
import { Maximize2, Minimize2, Move, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw, Ruler, Grid3x3, Waves, Sun, Moon, PersonStanding, Edit3, ArrowUpDown } from 'lucide-react';
import { useSceneHistory, SceneSnapshot } from '@/hooks/useSceneHistory';
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
    waterlines?: TextureConfig[];
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

// Component to force re-render when scene changes (needed for demand frameloop)
function SceneInvalidator({ scene }: { scene: Scene3D }) {
  const { invalidate } = useThree();
  
  useEffect(() => {
    // Invalidate frame when scene changes to trigger re-render
    invalidate();
  }, [scene, invalidate]);
  
  return null;
}

// Smooth zoom controller for component selection
function SelectionZoomController({
  selectedComponent,
  controlsRef,
  poolDimensions
}: {
  selectedComponent: 'pool' | 'deck' | 'coping' | 'waterline' | null;
  controlsRef: React.RefObject<any>;
  poolDimensions?: { width?: number; length?: number };
}) {
  const { camera } = useThree();
  const animationRef = useRef<number | null>(null);
  const previousComponent = useRef<string | null>(null);
  
  useEffect(() => {
    // Only animate when selection changes to a new component
    if (selectedComponent === previousComponent.current) return;
    previousComponent.current = selectedComponent;
    
    if (!selectedComponent || !controlsRef.current) return;
    
    const controls = controlsRef.current;
    const width = poolDimensions?.width || 15;
    const length = poolDimensions?.length || 30;
    const poolSize = Math.max(width, length);
    
    // Target positions for each component - closer zoom for details
    const zoomConfigs: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
      pool: { 
        position: [poolSize * 0.8, poolSize * 0.6, poolSize * 0.8], 
        target: [0, -2, 0] 
      },
      deck: { 
        position: [poolSize * 1.0, poolSize * 0.5, poolSize * 1.0], 
        target: [0, 0, 0] 
      },
      coping: { 
        position: [poolSize * 0.6, poolSize * 0.4, poolSize * 0.6], 
        target: [0, 0.5, 0] 
      },
      waterline: { 
        position: [poolSize * 0.5, poolSize * 0.3, poolSize * 0.5], 
        target: [0, -0.5, 0] 
      }
    };
    
    const config = zoomConfigs[selectedComponent];
    if (!config) return;
    
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPosition = new THREE.Vector3(...config.position);
    const endTarget = new THREE.Vector3(...config.target);
    
    let progress = 0;
    const duration = 800; // ms
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPosition, endPosition, eased);
      controls.target.lerpVectors(startTarget, endTarget, eased);
      controls.update();
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedComponent, camera, controlsRef, poolDimensions]);
  
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
  
  // Create initial snapshot for scene history
  const initialSnapshot: SceneSnapshot = useMemo(() => ({
    scene: validatedScene,
    terrainAssets: [],
    poolStairs: [],
    poolChairs: [],
    contourSeating: [],
    poolLights: validatedScene.poolLights || createDefaultPoolLights(false),
    assets3D: [],
  }), []);
  
  const {
    snapshot,
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    historyLength,
    futureLength,
  } = useSceneHistory(initialSnapshot);
  
  // Extract state from snapshot
  const scene = snapshot.scene;
  const terrainAssets = snapshot.terrainAssets;
  const poolStairs = snapshot.poolStairs;
  const poolChairs = snapshot.poolChairs;
  const contourSeating = snapshot.contourSeating;
  const poolLights = snapshot.poolLights;
  const assets3D = snapshot.assets3D;
  
  // Setters that push to history
  const setScene = useCallback((newScene: Scene3D) => {
    pushSnapshot({ scene: newScene });
  }, [pushSnapshot]);
  
  const setTerrainAssets = useCallback((updater: TerrainAsset[] | ((prev: TerrainAsset[]) => TerrainAsset[])) => {
    const newAssets = typeof updater === 'function' ? updater(snapshot.terrainAssets) : updater;
    pushSnapshot({ terrainAssets: newAssets });
  }, [pushSnapshot, snapshot.terrainAssets]);
  
  const setPoolStairs = useCallback((updater: PoolStairConfig[] | ((prev: PoolStairConfig[]) => PoolStairConfig[])) => {
    const newStairs = typeof updater === 'function' ? updater(snapshot.poolStairs) : updater;
    pushSnapshot({ poolStairs: newStairs });
  }, [pushSnapshot, snapshot.poolStairs]);
  
  const setPoolChairs = useCallback((updater: PoolChairConfig[] | ((prev: PoolChairConfig[]) => PoolChairConfig[])) => {
    const newChairs = typeof updater === 'function' ? updater(snapshot.poolChairs) : updater;
    pushSnapshot({ poolChairs: newChairs });
  }, [pushSnapshot, snapshot.poolChairs]);
  
  const setContourSeating = useCallback((updater: ContourSeatingConfig[] | ((prev: ContourSeatingConfig[]) => ContourSeatingConfig[])) => {
    const newSeating = typeof updater === 'function' ? updater(snapshot.contourSeating) : updater;
    pushSnapshot({ contourSeating: newSeating });
  }, [pushSnapshot, snapshot.contourSeating]);
  
  const setPoolLights = useCallback((updater: PoolLightConfig[] | ((prev: PoolLightConfig[]) => PoolLightConfig[])) => {
    const newLights = typeof updater === 'function' ? updater(snapshot.poolLights) : updater;
    pushSnapshot({ poolLights: newLights });
  }, [pushSnapshot, snapshot.poolLights]);
  
  const setAssets3D = useCallback((updater: any[] | ((prev: any[]) => any[])) => {
    const newAssets = typeof updater === 'function' ? updater(snapshot.assets3D) : updater;
    pushSnapshot({ assets3D: newAssets });
  }, [pushSnapshot, snapshot.assets3D]);
  
  // Texture preloading state
  const [texturesReady, setTexturesReady] = useState(false);
  
  // Recovery handler for error boundary
  const handleSceneRecover = useCallback((recoveredScene: Scene3D) => {
    console.log('🛡️ Applying recovered scene with fallback textures');
    resetHistory({ ...snapshot, scene: recoveredScene });
  }, [resetHistory, snapshot]);
  
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
  
  const [showGrid, setShowGrid] = useState(false); // Hidden by default
  const [showRulers, setShowRulers] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false); // Hidden by default
  const [showDebugBoundaries, setShowDebugBoundaries] = useState(false);
  const [showWater, setShowWater] = useState(true);
  const [deckWidth, setDeckWidth] = useState(3); // Default 3 feet
  const [showClimateController, setShowClimateController] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [sunAngle, setSunAngle] = useState(90); // Noon by default
  
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  
  const [selectedPoolAssetId, setSelectedPoolAssetId] = useState<string | null>(null);
  const [showPoolAssetManager, setShowPoolAssetManager] = useState(false);
  
  // Walkthrough mode state
  const [isWalkthroughMode, setIsWalkthroughMode] = useState(false);
  
  // Asset library state (not tracked in history)
  const [assetLibrary, setAssetLibrary] = useState<AssetLibraryItem[]>([]);
  
  // Spline edit mode - locks camera when editing splines
  const [isSplineEditMode, setIsSplineEditMode] = useState(false);
  const [selectedSplinePointId, setSelectedSplinePointId] = useState<string | null>(null);
  const [selectedSplineComponent, setSelectedSplineComponent] = useState<'pool-floor' | 'seating' | 'stairs' | 'waterline' | 'deck' | 'coping' | null>(null);
  const [showDepthProfileEditor, setShowDepthProfileEditor] = useState(false);
  
  // Parse pool depth from URL or scene
  const parseDepthValue = (depthStr: string): { shallow: number; deep: number } => {
    const match = depthStr.match(/(\d+)[''](\d+)?[""]?\s*[-–]\s*(\d+)[''](\d+)?[""]?/);
    if (match) {
      const shallowFeet = parseInt(match[1]);
      const shallowInches = match[2] ? parseInt(match[2]) : 0;
      const deepFeet = parseInt(match[3]);
      const deepInches = match[4] ? parseInt(match[4]) : 0;
      return {
        shallow: shallowFeet + shallowInches / 12,
        deep: deepFeet + deepInches / 12
      };
    }
    return { shallow: 3.75, deep: 8.5 };
  };
  
  // Get product depths from URL or defaults
  const urlParams = new URLSearchParams(window.location.search);
  const productDepthStr = urlParams.get('depth') || "3'9\" - 8'6\"";
  const productDepths = parseDepthValue(productDepthStr);
  const poolShallowDepth = productDepths.shallow;
  const poolDeepDepth = productDepths.deep;
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const poolGroupRef = useRef<THREE.Group>(null);

  const FLORIDA_STEP_HEIGHT = 0.625; // 7.5 inches
  const DEFAULT_STEP_DEPTH = 0.9167; // 11 inches
  
  const poolDepth = scene.pool.dimensions?.depth || 8;

  // Create linearDepthAnchors if not set, based on product depths
  const linearDepthAnchors = useMemo(() => {
    if (scene.pool.linearDepthAnchors && scene.pool.linearDepthAnchors.length >= 2) {
      return scene.pool.linearDepthAnchors;
    }
    return createDefaultLinearAnchors(poolShallowDepth, poolDeepDepth);
  }, [scene.pool.linearDepthAnchors, poolShallowDepth, poolDeepDepth]);

  // Create getFloorDepthAt function using linear depth anchors
  const getFloorDepthAt = useMemo(() => {
    return createDepthInterpolator(
      linearDepthAnchors,
      scene.pool.points,
      scene.pool.dimensions
    );
  }, [linearDepthAnchors, scene.pool.points, scene.pool.dimensions]);

  // Update parent when scene changes
  useEffect(() => {
    onSceneChange?.(scene);
  }, [scene, onSceneChange]);

  // Sync with initial scene updates
  useEffect(() => {
    resetHistory({
      scene: validateScene(initialScene),
      terrainAssets: [],
      poolStairs: [],
      poolChairs: [],
      contourSeating: [],
      poolLights: initialScene.poolLights || createDefaultPoolLights(false),
      assets3D: [],
    });
  }, [initialScene]);
  
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

  const handleLinearDepthAnchorsChange = (anchors: Array<{ id: string; position: number; depth: number }>) => {
    console.log('Linear depth anchors updated:', anchors);
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        linearDepthAnchors: anchors
      }
    });
  };

  const toggleFullscreen = () => {
    // Simple CSS-based fullscreen toggle for all devices
    setIsFullscreen(!isFullscreen);
  };

  const handlePoolPositionChange = (axis: 'x' | 'y' | 'z', delta: number) => {
    const currentPos = scene.pool.position;
    const step = transformStepSize;
    const newPosition: [number, number, number] = [currentPos[0], currentPos[1], currentPos[2]];
    
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
    
    const pos = scene.pool.position;
    const newPosition: [number, number, number] = [pos[0], pos[1], pos[2]];
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
      {/* Main 3D Canvas - MUST fill available space */}
      <div 
        ref={canvasContainerRef} 
        className={`flex-1 relative h-full w-full min-h-0 ${
          isFullscreen 
            ? 'fixed inset-0 z-[99999] bg-background' 
            : ''
        }`}
        style={{ minHeight: isFullscreen ? '100vh' : 'calc(100vh - 150px)' }}
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
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1 md:gap-2 max-w-[calc(100%-80px)] md:max-w-none">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="bg-background/80 hover:bg-background p-1.5 md:p-2 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
            title={`Undo (Ctrl+Z)${historyLength > 0 ? ` - ${historyLength} change${historyLength > 1 ? 's' : ''} in history` : ''}`}
          >
            <Undo2 className="w-4 h-4 md:w-5 md:h-5" />
            {historyLength > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {historyLength}
              </span>
            )}
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="bg-background/80 hover:bg-background p-1.5 md:p-2 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
            title={`Redo (Ctrl+Y)${futureLength > 0 ? ` - ${futureLength} change${futureLength > 1 ? 's' : ''} available` : ''}`}
          >
            <Redo2 className="w-4 h-4 md:w-5 md:h-5" />
            {futureLength > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {futureLength}
              </span>
            )}
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
            className="bg-background/80 hover:bg-background p-1.5 md:p-2 rounded-lg shadow-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => {
              const newShowGrid = !showGrid;
              setShowGrid(newShowGrid);
              setShowMeasurements(newShowGrid);
              setShowRulers(newShowGrid);
            }}
            className={`p-1.5 md:p-2 rounded-lg shadow-lg transition-colors ${showGrid ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
            title={showGrid ? "Hide Grid & Measurements" : "Show Grid & Measurements"}
          >
            <Grid3x3 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setShowWater(!showWater)}
            className={`p-1.5 md:p-2 rounded-lg shadow-lg transition-colors ${showWater ? 'bg-primary text-primary-foreground' : 'bg-background/80 hover:bg-background'}`}
            title={showWater ? "Hide Water" : "Show Water"}
          >
            <Waves className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setShowClimateController(!showClimateController)}
            className={`p-1.5 md:p-2 rounded-lg shadow-lg transition-colors ${isNightMode ? 'bg-blue-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="Climate Controls"
          >
            {isNightMode ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button
            onClick={() => setIsWalkthroughMode(!isWalkthroughMode)}
            className={`hidden md:block p-1.5 md:p-2 rounded-lg shadow-lg transition-colors ${isWalkthroughMode ? 'bg-green-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="Walkthrough Mode (WASD)"
          >
            <PersonStanding className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setShowDepthProfileEditor(!showDepthProfileEditor)}
            className={`hidden md:block p-1.5 md:p-2 rounded-lg shadow-lg transition-colors ${showDepthProfileEditor ? 'bg-cyan-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="Depth Profile Editor"
          >
            <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => {
              const newMode = !isSplineEditMode;
              setIsSplineEditMode(newMode);
              if (newMode) {
                setEnableFloorDepthSplineEdit(true);
                setSelectedSplineComponent('pool-floor');
                setShowDepthProfileEditor(false); // Close 2D editor when 3D edit mode opens
              } else {
                setEnableFloorDepthSplineEdit(false);
                setSelectedSplineComponent(null);
              }
            }}
            className={`hidden md:block p-1.5 md:p-2 rounded-lg shadow-lg transition-colors ${isSplineEditMode ? 'bg-orange-600 text-white' : 'bg-background/80 hover:bg-background'}`}
            title="3D Spline Editor (Advanced)"
          >
            <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Pool Designer Header with Measurements & Cost - positioned in header bar after buttons */}
        <div className="absolute top-4 left-[320px] md:left-[400px] z-20 hidden sm:block">
          <PoolDesignerHeader
            poolPoints={scene.pool.points}
            poolDepth={poolDepth}
            deckWidth={deckWidth}
            copingWidth={scene.deck.copingWidth || 1}
            poolPrice={parseFloat(new URLSearchParams(window.location.search).get('price') || '50000')}
          />
        </div>
        
        {/* Mobile estimates - bottom bar */}
        <div className="absolute bottom-16 left-4 right-4 z-20 sm:hidden">
          <PoolDesignerHeader
            poolPoints={scene.pool.points}
            poolDepth={poolDepth}
            deckWidth={deckWidth}
            copingWidth={scene.deck.copingWidth || 1}
            poolPrice={parseFloat(new URLSearchParams(window.location.search).get('price') || '50000')}
          />
        </div>

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

         {/* Component-Specific Control Panel - Hidden in spline edit mode */}
         {!isSplineEditMode && (
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
         )}

         {/* Spline Edit Panel - shown only in spline edit mode */}
          <SplineEditPanel
            isOpen={isSplineEditMode}
            onClose={() => {
              setIsSplineEditMode(false);
              setEnablePoolSplineEdit(false);
              setEnableFloorDepthSplineEdit(false);
              setSelectedSplineComponent(null);
              setSelectedSplinePointId(null);
            }}
            perimeterDepthPoints={scene.pool.perimeterDepthPoints || []}
            onPerimeterDepthPointsChange={handlePerimeterDepthPointsChange}
            selectedPointId={selectedSplinePointId}
            onSelectPoint={setSelectedSplinePointId}
            selectedComponent={selectedSplineComponent}
            onSelectComponent={(comp) => {
              setSelectedSplineComponent(comp);
              if (comp === 'pool-floor') {
                setEnableFloorDepthSplineEdit(true);
              }
            }}
            poolModelDepth={poolDeepDepth}
            poolModelShallowDepth={poolShallowDepth}
            stairs={poolStairs}
            onStairsChange={setPoolStairs}
            contourSeating={contourSeating}
            onContourSeatingChange={setContourSeating}
            selectedAssetId={selectedPoolAssetId}
            copingWidth={scene.deck.copingWidth ?? 1.0}
            onCopingWidthChange={(width) => setScene({
              ...scene,
              deck: { ...scene.deck, copingWidth: width }
            })}
            copingHeight={scene.deck.copingHeight ?? 0.5}
            onCopingHeightChange={(height) => setScene({
              ...scene,
              deck: { ...scene.deck, copingHeight: height }
            })}
            deckWidth={deckWidth}
            onDeckWidthChange={setDeckWidth}
          />

         {/* Depth Profile Editor - similar to 2D designer depth tab */}
          <DepthProfileEditor
            isOpen={showDepthProfileEditor && !isSplineEditMode}
            onClose={() => setShowDepthProfileEditor(false)}
            linearDepthAnchors={linearDepthAnchors}
            onLinearDepthAnchorsChange={handleLinearDepthAnchorsChange}
            selectedAnchorId={selectedSplinePointId}
            onSelectAnchor={setSelectedSplinePointId}
            poolShallowDepth={poolShallowDepth}
            poolDeepDepth={poolDeepDepth}
            perimeterDepthPoints={scene.pool.perimeterDepthPoints || []}
            onPerimeterDepthPointsChange={handlePerimeterDepthPointsChange}
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
                frameloop="always" // Always render for immediate texture updates
              >
          {/* Force re-render when scene changes in demand mode */}
          <SceneInvalidator scene={scene} />
          
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
            getFloorDepthAt={getFloorDepthAt}
          />
          
          <CameraController preset={cameraPreset} target={scene.camera.target} />
          
          {/* Smooth zoom on component selection */}
          <SelectionZoomController
            selectedComponent={selectedComponent}
            controlsRef={controlsRef}
            poolDimensions={scene.pool.dimensions}
          />
          
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
              enableFloorDepthSplineEdit={enableFloorDepthSplineEdit || (isSplineEditMode && selectedSplineComponent === 'pool-floor')}
              perimeterDepthPoints={scene.pool.perimeterDepthPoints}
              onPoolPointsChange={handlePoolPointsChange}
              onDeckPointsChange={handleDeckPointsChange}
              onPerimeterDepthPointsChange={handlePerimeterDepthPointsChange}
              selectedSplinePointId={selectedSplinePointId}
              onSelectSplinePoint={setSelectedSplinePointId}
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

          {/* Terrain Assets from Terrain Editor */}
          <TerrainAssetsRenderer assets={terrainAssets} />

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
          />
          
          {/* OrbitControls - Free camera with right-click + scroll, locks on asset drag */}
          {!isWalkthroughMode && (
            <OrbitControls
              ref={controlsRef}
              makeDefault
              autoRotate={autoRotate && !selectedPoolAssetId}
              autoRotateSpeed={0.5}
              enableDamping
              dampingFactor={0.05}
              enableRotate={!selectedPoolAssetId && !isSplineEditMode}
              enablePan={true}
              enableZoom={true}
              mouseButtons={{
                LEFT: selectedPoolAssetId ? undefined : 0, // Disable left click rotate when dragging asset
                MIDDLE: 2, // Middle for pan
                RIGHT: 2 // Right click for rotate
              }}
            />
          )}
               </R3FCanvas>
            )}
          </Suspense>
        </Scene3DErrorBoundary>

        {/* Asset Manager - Visible in fullscreen with Pool Assets */}
        <AssetManager 
          assets={assets3D}
          onAddAsset={(asset) => setAssets3D([...assets3D, asset])}
          onRemoveAsset={(id) => setAssets3D(assets3D.filter(a => a.id !== id))}
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
          availableFinishes={textureLibrary.finishes}
        />

        {/* Terrain Editor */}
        <TerrainEditor
          terrainAssets={terrainAssets}
          onTerrainAssetsChange={setTerrainAssets}
          assetLibrary={assetLibrary}
          onAssetLibraryChange={setAssetLibrary}
        />
      </div>
    </div>
  );
}
