import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { mitredOffsetRing } from '@/utils/polygonGeometry';
import { Canvas as R3FCanvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Sky, Grid, PerformanceMonitor } from '@react-three/drei';
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
import { flyCamera } from './scene3d/cameraFly';
import { StudioDock } from './scene3d/StudioDock';
import { ComponentControlPanel } from './ComponentControlPanel';
import { ClimateController } from './scene3d/ClimateController';
import { EnhancedPoolLights, createDefaultPoolLights } from './scene3d/EnhancedPoolLights';
import { WaterCaustics } from './scene3d/WaterCaustics';
import { PoolAssetManager } from './scene3d/PoolAssetManager';
import { PoolAssetsRenderer } from './scene3d/PoolAssetsRenderer';
import { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './scene3d/poolAssetTypes';
import { WalkthroughController } from './scene3d/WalkthroughController';
import { CameraFocusController, FocusRequest } from './scene3d/CameraFocusController';
import { OrbitKeyboardControls } from './scene3d/OrbitKeyboardControls';
import { createPortal } from 'react-dom';
import { PoolDesignerHeader, POOL_SHELL_PRICE_PER_SQFT } from './scene3d/PoolDesignerHeader';
import { FEATURE_COSTS } from '@/utils/poolBuilderPricing';
import { SplineEditPanel } from './scene3d/SplineEditPanel';
import { DepthProfileEditor } from './scene3d/DepthProfileEditor';
import { createDepthInterpolator, createDefaultLinearAnchors, createDefaultDepthAxis, computePerimeterDepths, getPoolBounds, interpolateDepthFromAnchors, positionAlongAxis } from './scene3d/depthUtils';
import { TerrainEditor, TerrainAsset, AssetLibraryItem } from './scene3d/TerrainEditor';
import { TerrainAssetsRenderer, DEFAULT_GIZMO_SNAP, type GizmoMode, type GizmoSnapSettings } from './scene3d/TerrainAssetsRenderer';
import { SceneObjectsPanel, SceneObjectGroup, sceneObjectIcons } from './scene3d/SceneObjectsPanel';
import { Button } from './ui/button';
import { Maximize2, Minimize2, Move, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw, Ruler, Grid3x3, Waves, Sun, Moon, PersonStanding, Edit3, ArrowUpDown } from 'lucide-react';
import { useBoardCommands, publishBoardStatus } from '@/components/designStudio/boardCommands';
import { useSceneHistory, SceneSnapshot } from '@/hooks/useSceneHistory';
import { Checkbox } from './ui/checkbox';
import * as THREE from 'three';
import { Scene3DErrorBoundary } from './scene3d/Scene3DErrorBoundary';
import { validateScene } from '@/utils/sceneValidator';
import { textureCache } from '@/utils/textureCache';
import { useIsMobile } from '@/hooks/use-mobile';
import { LandscapePlants3D } from './scene3d/LandscapePlants3D';
import { BoardElements3D } from './scene3d/BoardElements3D';
import { GradientSky } from './scene3d/GradientSky';
import { loadBoard3D, BOARD_3D_EVENT, updateBoard3D, waterAxis, waterCenter } from '@/lib/design/board3D';
import { useSceneLayers, isObjectHidden, boardObjectId } from '@/lib/design/sceneLayers';
import { usePersistentState } from '@/hooks/usePersistentState';
import { Slider } from './ui/slider';
import { BOARD_SELECT_EVENT, type BoardSelection } from './scene3d/BoardElements3D';
import { BoardElementEditor } from './scene3d/BoardElementEditor';
import { board3DTakeoff, seatingLines } from '@/lib/design/board3DTakeoff';
import { useSiteElements, siteElementImage, gateLines } from './designStudio/SiteElementsLayer';

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

// Force re-render when scene state changes (for frameloop="demand")
// Uses burst rendering to guarantee texture updates are visible
function SceneInvalidator({ scene, isNightMode, sunPosition }: { 
  scene: Scene3D; 
  isNightMode: boolean;
  sunPosition: [number, number, number];
}) {
  const { invalidate } = useThree();
  const isFirstRender = useRef(true);
  const rafIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Always invalidate immediately
    invalidate();
    
    // Skip burst on first render - textures aren't loaded yet
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Cancel any pending animation frames
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    // Burst render: schedule 3 frames to ensure texture is fully displayed
    let frameCount = 0;
    const burstRender = () => {
      invalidate();
      frameCount++;
      if (frameCount < 3) {
        rafIdRef.current = requestAnimationFrame(burstRender);
      }
    };
    
    rafIdRef.current = requestAnimationFrame(burstRender);
    
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    scene.pool.finish?.url,
    scene.pool.finish?.scale,
    scene.pool.finish?.offset,
    scene.deck.paver?.url,
    scene.deck.paver?.scale,
    scene.deck.paver?.offset,
    scene.deck.coping?.url,
    scene.deck.coping?.scale,
    scene.deck.coping?.offset,
    scene.deck.waterline?.url,
    scene.deck.waterline?.scale,
    scene.deck.waterline?.offset,
    scene.deck.copingWidth,
    scene.deck.copingHeight,
    scene.deck.deckElevation,
    isNightMode,
    sunPosition,
    invalidate
  ]);
  
  return null;
}

export function UnifiedPoolVisualizer({
  scene: initialScene,
  textureLibrary,
  onSceneChange,
  embedded = false,
  showcase = false
}: UnifiedPoolVisualizerProps & { embedded?: boolean; showcase?: boolean }) {
  const isMobile = useIsMobile();
  
  // Validate scene before using it
  const validatedScene = validateScene(initialScene);
  
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
  
  // Header Undo/Redo/Save icons (shared with the 2D board) drive the 3D history too. Imagine Engine Studios Corp.
  useBoardCommands((c) => { if (c === 'undo') undo(); else if (c === 'redo') redo(); });
  useEffect(() => { publishBoardStatus({ canUndo, canRedo, lastSaved: new Date().toISOString() }); }, [canUndo, canRedo, snapshot]);

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
  const [autoRotate, setAutoRotate] = useState(showcase);
  // Showcase pre-screen: the camera orbits slowly until the user enters.
  useEffect(() => { setAutoRotate(showcase); }, [showcase]);
  const [sunPosition, setSunPosition] = useState<[number, number, number]>([0, 100, 50]); // noon — clear blue sky by default
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

  // Terrain asset selection + transform gizmo state
  const [selectedTerrainAssetId, setSelectedTerrainAssetId] = useState<string | null>(null);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate');
  const [gizmoSnap, setGizmoSnap] = useState<GizmoSnapSettings>(DEFAULT_GIZMO_SNAP);

  // Gizmo keyboard shortcuts: G move, R rotate, T scale, X toggle snap, Esc deselect
  useEffect(() => {
    if (!selectedTerrainAssetId) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.key === 'g' || e.key === 'G') setGizmoMode('translate');
      else if (e.key === 'r' || e.key === 'R') setGizmoMode('rotate');
      else if (e.key === 't' || e.key === 'T') setGizmoMode('scale');
      else if (e.key === 'x' || e.key === 'X') setGizmoSnap(prev => ({ ...prev, enabled: !prev.enabled }));
      else if (e.key === 'Escape') setSelectedTerrainAssetId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedTerrainAssetId]);

  // Camera focus request (used to center the camera on newly dropped assets)
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const focusTokenRef = useRef(0);
  const focusOn = useCallback((position: [number, number, number], distance?: number) => {
    focusTokenRef.current += 1;
    setFocusRequest({ position, distance, token: focusTokenRef.current });
  }, []);
  // Selecting a pool part glides to the exact point the user clicked, keeping
  // the current viewing side. One camera authority: CameraFocusController.
  const lastPickRef = useRef<[number, number, number] | null>(null);
  const PART_DISTANCE: Record<string, number> = { pool: 20, deck: 16, coping: 8, waterline: 6 };
  const selectComponentAtPick = useCallback((c: 'pool' | 'deck' | 'coping' | 'waterline' | null) => {
    setSelectedComponent(c);
    if (c && lastPickRef.current) { setAutoRotate(false); focusOn(lastPickRef.current, PART_DISTANCE[c]); }
  }, [focusOn]);
  // Center on a freshly dropped 3D model
  const focusOnAsset = useCallback((position: [number, number, number]) => {
    focusOn(position, 16);
  }, [focusOn]);
  // Center on the pool (stairs / seating / lights are placed on the pool perimeter,
  // whose geometry is normalized around the scene origin)
  const focusOnPoolAsset = useCallback(() => {
    const pts = scene.pool.points || [];
    if (!pts.length) {
      focusOn([0, 0, 0], 26);
      return;
    }
    const spanX = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x));
    const spanZ = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y));
    focusOn([0, -1, 0], Math.max(18, Math.max(spanX, spanZ) * 1.2));
  }, [focusOn, scene.pool.points]);

  // Corner editing: fly to the chosen pool corner and freeze the camera
  // (no orbit/pan) until the user presses Done. Pool geometry is centred on
  // its bounding box, matching normalize2DTo3D.
  const [frozenCornerIndex, setFrozenCornerIndex] = useState<number | null>(null);
  const focusCorner = useCallback((index: number) => {
    const pts = scene.pool.points || [];
    const p = pts[index];
    if (!p) return;
    const xs = pts.map(q => q.x), ys = pts.map(q => q.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    setEnablePoolSplineEdit(true);
    setFrozenCornerIndex(index);
    setAutoRotate(false);
    focusOn([p.x - cx, 0, p.y - cy], 12);
  }, [scene.pool.points, focusOn]);
  const releaseCorner = useCallback(() => {
    setFrozenCornerIndex(null);
    focusOnPoolAsset();
  }, [focusOnPoolAsset]);




  const FLORIDA_STEP_HEIGHT = 0.625; // 7.5 inches
  const DEFAULT_STEP_DEPTH = 0.9167; // 11 inches
  
  const poolDepth = scene.pool.dimensions?.depth || 8;

  // Adaptive GPU quality (see PerformanceMonitor in the Canvas).
  const [perfDpr, setPerfDpr] = useState(1.5);
  const [shadowRes, setShadowRes] = useState(2048);
  const sceneHeavy = terrainAssets.length + assets3D.length > 10;

  // Live cost inputs for the designer header — mirrors the products the user selected
  const designerFeatureLines = useMemo(
    () =>
      (scene.features || []).map(f => ({
        name: f.metadata?.name || f.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        price: f.metadata?.price ?? FEATURE_COSTS[f.type] ?? 0,
      })),
    [scene.features]
  );

  const designerBodyLines = useMemo(
    () =>
      (scene.additionalPools || []).map((body, i) => {
        const pts = body.points || [];
        let area = 0;
        for (let j = 0; j < pts.length; j++) {
          const k = (j + 1) % pts.length;
          area += pts[j].x * pts[k].y - pts[k].x * pts[j].y;
        }
        area = Math.abs(area / 2);
        const isSpa = body.type === 'spa' || body.featureType === 'tanning-ledge';
        const rate = isSpa ? POOL_SHELL_PRICE_PER_SQFT * (4 / 3.5) : POOL_SHELL_PRICE_PER_SQFT;
        const label =
          body.featureType === 'tanning-ledge'
            ? 'Tanning Ledge'
            : body.featureType === 'spillover-spa'
            ? 'Spillover Spa'
            : body.type === 'spa'
            ? 'Spa'
            : `Additional Pool ${i + 1}`;
        return {
          name: label,
          areaSqFt: area,
          multiplierLabel: `$${Math.round(rate)}/sq ft`,
          price: area * rate,
        };
      }),
    [scene.additionalPools]
  );

  /**
   * Every physical object placed in the 3D scene, itemized for the quote.
   *
   * WHY: the quote must mirror the scene exactly — stairs, chairs, contour
   * seating, lights and imported 3D/terrain objects are real build items, so
   * they belong in the estimate and in the generated quote document, not only
   * in the Scene Objects widget.
   */
  const designerSceneObjectLines = useMemo(() => {
    const lines: Array<{ name: string; price: number }> = [];

    poolStairs.forEach((s, i) =>
      lines.push({
        name: `Pool Stairs ${i + 1} — ${s.numSteps} steps`,
        price: FEATURE_COSTS.stairs ?? 0,
      })
    );

    poolChairs.forEach((c, i) =>
      lines.push({
        name: `${c.name || `In-Pool Chair ${i + 1}`} — ${c.width}×${c.depth} ft`,
        price: FEATURE_COSTS['pool-seat'] ?? 0,
      })
    );

    contourSeating.forEach((s, i) =>
      lines.push({
        name: `Contour Seating ${i + 1} — ${s.width} ft wide`,
        price: FEATURE_COSTS['pool-seat'] ?? 0,
      })
    );

    /* The scene always ships two courtesy lights ('light-default-*') so the pool
       renders at night. Those are part of the base build, not add-ons, so they
       are never billed — only lights the customer actually placed are quoted. */
    poolLights
      .filter(l => !l.id.startsWith('light-default-'))
      .forEach((l, i) =>
        lines.push({ name: `Pool Light ${i + 1}`, price: FEATURE_COSTS.light ?? 0 })
      );

    /* Terrain / imported 3D props only appear when they carry a real price —
       zero-cost decor would otherwise clutter the quote with $0 lines. */
    terrainAssets.forEach(a => {
      const price = (a as any).price ?? 0;
      if (price > 0) lines.push({ name: `${a.name} (${a.type})`, price });
    });

    assets3D.forEach(a => {
      const price = (a as any).price ?? 0;
      if (price > 0) lines.push({ name: `${a.name}${a.type ? ` (${a.type})` : ''}`, price });
    });


    return lines;
  }, [poolStairs, poolChairs, contourSeating, poolLights, terrainAssets, assets3D]);

  /** Pool features + every scene object, in one list for the estimate & quote */
  const designerQuoteFeatureLines = useMemo(
    () => [...designerFeatureLines, ...designerSceneObjectLines],
    [designerFeatureLines, designerSceneObjectLines]
  );





  // Create linearDepthAnchors if not set, based on product depths
  const linearDepthAnchors = useMemo(() => {
    if (scene.pool.linearDepthAnchors && scene.pool.linearDepthAnchors.length >= 2) {
      return scene.pool.linearDepthAnchors;
    }
    return createDefaultLinearAnchors(poolShallowDepth, poolDeepDepth);
  }, [scene.pool.linearDepthAnchors, poolShallowDepth, poolDeepDepth]);

  // Depth axis: the direction the profile runs across the pool (movable / rotatable)
  const depthAxis = useMemo(() => {
    return scene.pool.depthAxis ?? createDefaultDepthAxis(scene.pool.points, scene.pool.dimensions);
  }, [scene.pool.depthAxis, scene.pool.points, scene.pool.dimensions]);

  // Create getFloorDepthAt function using linear depth anchors along the depth axis
  const getFloorDepthAt = useMemo(() => {
    return createDepthInterpolator(
      linearDepthAnchors,
      scene.pool.points,
      scene.pool.dimensions,
      depthAxis
    );
  }, [linearDepthAnchors, scene.pool.points, scene.pool.dimensions, depthAxis]);

  // Perimeter depths driven live by the profile + axis so the 3D bottom always
  // matches the tool (zero-entry, lagoon, sport bottoms, diagonal slopes...).
  const resolvedPerimeterDepthPoints = useMemo(() => {
    if (!scene.pool.points || scene.pool.points.length < 3) {
      return scene.pool.perimeterDepthPoints;
    }
    const bounds = getPoolBounds(scene.pool.points);
    const normalized = scene.pool.points.map((p, i) => ({
      x: p.x - bounds.centerX,
      z: p.y - bounds.centerZ,
      id: `perimeter-depth-${i}`,
      type: 'smooth' as const,
    }));
    return computePerimeterDepths(normalized, linearDepthAnchors, depthAxis);
  }, [scene.pool.points, scene.pool.perimeterDepthPoints, linearDepthAnchors, depthAxis]);

  // Terrain cutout footprint: exact pool outline offset by the deck, world XZ.
  // Extra pools/spas from the Global Design Board: each cuts its own hole.
  const [boardWaters, setBoardWaters] = useState(() => loadBoard3D()?.waters ?? []);
  const [boardData, setBoardData] = useState(() => loadBoard3D());
  useEffect(() => {
    const on = () => { const d = loadBoard3D(); setBoardWaters(d?.waters ?? []); setBoardData(d); };
    window.addEventListener(BOARD_3D_EVENT, on);
    return () => window.removeEventListener(BOARD_3D_EVENT, on);
  }, []);
  /**
   * Extra board pool/spa being edited. The main pool's own widgets
   * (ComponentControlPanel + PoolAssetManager) are pointed at it through a
   * proxy scene, so every pool uses the exact same controls; edits map back
   * into that water body only. Imagine Engine Studios Corp.
   */
  const [activeWater, setActiveWater] = useState<number | null>(null);
  /** Glides the camera onto extra pool/spa k (set below once the board waters are known). */
  const focusWaterRef = useRef<((k: number) => void) | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<BoardSelection>).detail;
      // Only a pool/spa click changes the target; closing widgets or picking a fence/deck keeps it.
      if (d?.type === 'water') { setActiveWater(d.i); setSelectedComponent((d.part ?? 'pool') as any); setShowPoolAssetManager(false); focusWaterRef.current?.(d.i); }
    };
    window.addEventListener(BOARD_SELECT_EVENT, on);
    return () => window.removeEventListener(BOARD_SELECT_EVENT, on);
  }, []);
  const activeW = activeWater != null ? boardWaters[activeWater] : undefined;
  const waterScene = useMemo(() => {
    if (!activeW) return null;
    const c = waterCenter(activeW.pts);
    const isUrl = (v?: string) => !!v && /^(\/|https?:)/.test(v);
    const pts = activeW.pts.map((p, k) => ({ x: p.x - c.x, y: p.z - c.z, id: `w${k}` }));
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const anchors = activeW.anchors ?? createDefaultLinearAnchors(activeW.kind === 'spa' ? 3 : 3.5, activeW.kind === 'spa' ? 3 : Math.max(activeW.depth, 5));
    return {
      ...scene,
      pool: { ...scene.pool, points: pts as any, sourcePoints: undefined, perimeterDepthPoints: undefined, linearDepthAnchors: anchors, depthAxis: waterAxis(activeW),
        finish: { ...scene.pool.finish, url: isUrl(activeW.finish) ? activeW.finish : '/textures/finishes/sapphire-blue-g3.webp' },
        dimensions: { length: Math.max(...ys) - Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), depth: Math.max(...anchors.map((a) => a.depth)) } },
      deck: { ...scene.deck, copingWidth: activeW.copingWidth, copingHeight: activeW.copingHeight ?? scene.deck.copingHeight,
        coping: { ...scene.deck.coping, url: isUrl(activeW.coping) ? activeW.coping : scene.deck.coping.url },
        waterline: { ...(scene.deck.waterline ?? scene.deck.coping), url: isUrl(activeW.waterline) ? activeW.waterline : (scene.deck.waterline?.url ?? '') } },
    } as typeof scene;
  }, [activeW, scene]);
  const onWaterSceneChange = useCallback((next: typeof scene) => {
    if (activeWater == null || !activeW) return;
    const c = waterCenter(activeW.pts);
    updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((w, k) => k !== activeWater ? w : {
      ...w,
      finish: next.pool.finish?.url || w.finish,
      coping: next.deck.coping?.url || w.coping,
      waterline: next.deck.waterline?.url || w.waterline,
      copingWidth: next.deck.copingWidth ?? w.copingWidth,
      copingHeight: next.deck.copingHeight ?? w.copingHeight,
      anchors: next.pool.linearDepthAnchors ?? w.anchors,
      axis: next.pool.depthAxis ?? w.axis,
      pts: next.pool.points?.length >= 3 ? next.pool.points.map((p) => ({ x: p.x + c.x, z: p.y + c.z })) : w.pts,
    }) }));
  }, [activeWater, activeW]);
  /** Whole-scene take-off: extra pools/spas, copings, every deck, turf, fences, screens. */
  const [siteItems] = useSiteElements();
  const ratedItems = useMemo(() => siteItems.map((e) => ({ ...e, image: siteElementImage(e), doorLines: gateLines(e) })), [siteItems]);
  const sceneTakeoff = useMemo(() => board3DTakeoff(boardData, ratedItems, POOL_SHELL_PRICE_PER_SQFT), [boardData, ratedItems]);
  /** Main pool: $250/sq ft shell until seats/sun benches are added; their footprint moves to the ledge rate. */
  const mainSeatLines = useMemo(() => seatingLines('Main pool', contourSeating, scene.pool.points.map((p) => ({ x: p.x, z: p.y })), POOL_SHELL_PRICE_PER_SQFT), [contourSeating, scene.pool.points]);
  const headerBodies = useMemo(() => (boardData?.waters?.length ? sceneTakeoff.bodies : designerBodyLines), [boardData, sceneTakeoff, designerBodyLines]);
  const headerFeatures = useMemo(() => [...designerQuoteFeatureLines, ...mainSeatLines, ...sceneTakeoff.lines], [designerQuoteFeatureLines, mainSeatLines, sceneTakeoff]);
  /** Point every header control at a pool: null = main pool, k = extra pool/spa k. Glides the camera to it. */
  const targetWater = useCallback((k: number | null) => {
    if (k == null) { setActiveWater(null); window.dispatchEvent(new CustomEvent(BOARD_SELECT_EVENT, { detail: null })); setSelectedComponent('pool' as any); focusOnPoolAsset(); return; }
    if (!boardWaters[k]) return;
    // The select event also centres the camera (same path as clicking the pool in 3D).
    window.dispatchEvent(new CustomEvent(BOARD_SELECT_EVENT, { detail: { type: 'water', i: k, part: 'pool' } }));
  }, [boardWaters, focusOnPoolAsset]);
  focusWaterRef.current = (k: number) => {
    const w = boardWaters[k]; if (!w || w.pts.length < 3) return;
    const c = waterCenter(w.pts); const xs = w.pts.map((p) => p.x), zs = w.pts.map((p) => p.z);
    setAutoRotate(false); focusOn([c.x, -1, c.z], Math.max(14, Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) * 1.3));
  };
  /** Per-body tile size (finish, coping, waterline, deck). Imagine Engine Studios Corp. */
  const [showTileSize, setShowTileSize] = useState(false);
  const mainScales = { finish: scene.pool.finish.scale || 1.8, coping: scene.deck.coping.scale || 1.8, waterline: scene.deck.waterline?.scale || 1.8, deck: scene.deck.paver.scale || 1.8 };
  const activeDeck = activeW ? boardData?.surfaces.find((s) => s.kind === 'deck' && s.itemId === `__deck_${activeW.itemId}`) : undefined;
  const tileRows = activeW ? ([
    { key: 'finishScale', label: 'Finish', own: activeW.finishScale, main: mainScales.finish },
    { key: 'copingScale', label: 'Coping', own: activeW.copingScale, main: mainScales.coping },
    { key: 'waterlineScale', label: 'Waterline', own: activeW.waterlineScale, main: mainScales.waterline },
    { key: 'deck', label: 'Deck pavers', own: activeDeck?.scale, main: mainScales.deck },
  ] as const).map((r) => ({ key: r.key, label: r.label, own: r.own != null, value: r.own ?? r.main })) : [];
  const setTileScale = useCallback((key: string, v: number | undefined) => {
    if (activeWater == null) return;
    updateBoard3D((d) => {
      const w = d.waters?.[activeWater]; if (!w) return d;
      if (key === 'deck') return { ...d, surfaces: d.surfaces.map((s) => (s.kind === 'deck' && s.itemId === `__deck_${w.itemId}` ? { ...s, scale: v } : s)) };
      return { ...d, waters: d.waters!.map((x, k) => (k === activeWater ? { ...x, [key]: v } : x)) };
    });
  }, [activeWater]);
  /** Stable reference so extra pools don't rebuild on every render. */
  const boardScales = useMemo(() => ({ finish: mainScales.finish, coping: mainScales.coping, waterline: mainScales.waterline, paver: mainScales.deck }), [mainScales.finish, mainScales.coping, mainScales.waterline, mainScales.deck]);
  const waterVisible = activeWater != null ? !activeW?.waterOff : showWater;
  const toggleWater = useCallback(() => {
    if (activeWater == null) { setShowWater((v) => !v); return; }
    updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((w, k) => (k === activeWater ? { ...w, waterOff: !w.waterOff } : w)) }));
  }, [activeWater]);
  const setWaterStairs = useCallback((u: any) => { if (activeWater == null) return; updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((w, k) => k === activeWater ? { ...w, stairs: typeof u === 'function' ? u(w.stairs ?? []) : u } : w) })); }, [activeWater]);
  const setWaterChairs = useCallback((u: any) => { if (activeWater == null) return; updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((w, k) => k === activeWater ? { ...w, chairs: typeof u === 'function' ? u(w.chairs ?? []) : u } : w) })); }, [activeWater]);
  const setWaterSeating = useCallback((u: any) => { if (activeWater == null) return; updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((w, k) => k === activeWater ? { ...w, seating: typeof u === 'function' ? u(w.seating ?? []) : u } : w) })); }, [activeWater]);
  const terrainSiteRef = useMemo(() => {
    const deckWidth = Number((scene.deck as any)?.width ?? (scene.deck as any)?.deckWidth) || 6;
    const base = {
      poolLength: scene.pool.dimensions?.length || 32,
      poolWidth: scene.pool.dimensions?.width || 16,
      deckWidth,
    };
    const pts = scene.pool.points;
    const holes = boardWaters.filter((w) => w.pts.length >= 3).map((w) => mitredOffsetRing(w.pts, (w.copingWidth || 1) + 0.5).offset.map((p) => ({ x: p.x, z: p.z })));
    const holesKey = holes.map((h) => h.map((p) => `${p.x.toFixed(1)},${p.z.toFixed(1)}`).join('|')).join('#');
    if (!pts || pts.length < 3) return { ...base, holes, outlineKey: holesKey };
    const b = getPoolBounds(pts);
    const ring = pts.map((p) => ({ x: p.x - b.centerX, z: p.y - b.centerZ }));
    const off = mitredOffsetRing(ring, deckWidth + 1).offset.map((p) => ({ x: p.x, z: p.z }));
    return { ...base, outline: off, holes, outlineKey: off.map((p) => `${p.x.toFixed(1)},${p.z.toFixed(1)}`).join('|') + '#' + holesKey };
  }, [scene.pool.points, scene.pool.dimensions, scene.deck, boardWaters]);

  // Interior floor depth (pool-centred coords, same space as the perimeter depths).
  const floorDepthAtCentered = useCallback(
    (x: number, z: number) => interpolateDepthFromAnchors(positionAlongAxis(x, z, depthAxis), linearDepthAnchors),
    [depthAxis, linearDepthAnchors]
  );

  // Update parent when scene changes
  useEffect(() => {
    onSceneChange?.(scene);
  }, [scene, onSceneChange]);

  // Sync with incoming scene updates.
  // IMPORTANT: only react to STRUCTURAL changes (shape / deck outline / dimensions).
  // The parent re-creates the scene object on every render, and resetting on identity
  // wiped every material the user picked in the component panel (the widget looked dead).
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  const structureSignature = useMemo(
    () =>
      JSON.stringify({
        p: (initialScene.pool.points || []).map((p: any) => [Math.round(p.x * 100), Math.round(p.y * 100)]),
        dp: (initialScene.pool.depthPoints || []).map((d: any) => [d.position, d.depth]),
        d: (initialScene.deck.points || []).map((p: any) => [Math.round(p.x * 100), Math.round(p.y * 100)]),
        dim: initialScene.pool.dimensions,
        f: (initialScene.features || []).map((f: any) => f.id),
      }),
    [initialScene]
  );

  const lastSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastSignatureRef.current === structureSignature) return;
    const isFirst = lastSignatureRef.current === null;
    lastSignatureRef.current = structureSignature;

    const incoming = validateScene(initialScene);
    const current = sceneRef.current;

    // Keep the user's material selections across structural updates.
    const merged = isFirst
      ? incoming
      : {
          ...incoming,
          pool: { ...incoming.pool, finish: current.pool.finish || incoming.pool.finish },
          deck: {
            ...incoming.deck,
            paver: current.deck.paver || incoming.deck.paver,
            coping: current.deck.coping || incoming.deck.coping,
            waterline: current.deck.waterline || incoming.deck.waterline,
            copingWidth: current.deck.copingWidth ?? incoming.deck.copingWidth,
            copingHeight: current.deck.copingHeight ?? incoming.deck.copingHeight,
            deckElevation: current.deck.deckElevation ?? incoming.deck.deckElevation,
          },
        };

    resetHistory({
      scene: merged,
      terrainAssets: [],
      poolStairs: [],
      poolChairs: [],
      contourSeating: [],
      poolLights: merged.poolLights || createDefaultPoolLights(false),
      assets3D: [],
    });
  }, [structureSignature, initialScene, resetHistory]);

  
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

  // ===== Layers & site levels (display-only hiding; quotes keep every item) =====
  const layerState = useSceneLayers();
  const hid = (id: string, layer = 'structure') => isObjectHidden(id, layer, layerState);
  const [xray, setXray] = usePersistentState('studio3d.xray', false);
  const poolElevation = Math.max(0, (scene.pool as any).elevation ?? 0);
  const deckElevation = scene.deck.deckElevation ?? 0;
  const bodyElevation = activeWater != null ? Math.max(0, activeW?.elevation ?? 0) : poolElevation;
  const setLevels = (patch: { pool?: number; deck?: number }) => (activeWater != null && patch.pool !== undefined)
    ? (updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((w, k) => (k === activeWater ? { ...w, elevation: patch.pool } : w)) })), localStorage.setItem('studio3d.levels.elevated', patch.pool > 0 ? '1' : '0'))
    : (patch.pool !== undefined && localStorage.setItem('studio3d.levels.elevated', patch.pool > 0 ? '1' : '0'), setScene({
    ...scene,
    pool: patch.pool !== undefined ? { ...scene.pool, elevation: patch.pool } as any : scene.pool,
    deck: patch.deck !== undefined ? { ...scene.deck, deckElevation: patch.deck } : scene.deck,
  }));
  const [boardForList, setBoardForList] = useState(() => loadBoard3D());
  useEffect(() => {
    const on = () => setBoardForList(loadBoard3D());
    window.addEventListener(BOARD_3D_EVENT, on);
    return () => window.removeEventListener(BOARD_3D_EVENT, on);
  }, []);
  /* Hidden assets are filtered from the view; edits merge them back so nothing is lost. */
  const keepHidden = <T extends { id: string }>(all: T[], layer: string) => {
    const shown = all.filter(x => !hid(x.id, layer));
    const hiddenOnes = all.filter(x => hid(x.id, layer));
    return { shown, merge: (next: T[]) => [...next, ...hiddenOnes] };
  };
  const stairsV = keepHidden(poolStairs, 'structure');
  const chairsV = keepHidden(poolChairs, 'structure');
  const seatingV = keepHidden(contourSeating, 'structure');
  const lightsV = keepHidden(poolLights, 'lighting');

  // ===== Scene Objects widget: flat inventory of everything in the 3D scene =====
  const sceneObjectGroups: SceneObjectGroup[] = useMemo(() => {
    const groups: SceneObjectGroup[] = [];

    const structure = [
      {
        id: 'obj-pool',
        label: 'Pool Shell',
        detail: `${scene.pool.points?.length || 0} pts`,
        icon: sceneObjectIcons.pool,
        selected: selectedComponent === 'pool',
        onSelect: () => setSelectedComponent('pool'),
      },
      {
        id: 'obj-deck',
        layer: 'deck',
        label: 'Deck',
        detail: `${scene.deck.points?.length || 0} pts`,
        icon: sceneObjectIcons.deck,
        selected: selectedComponent === 'deck',
        onSelect: () => setSelectedComponent('deck'),
      },
      {
        id: 'obj-coping',
        layer: 'deck',
        label: 'Coping',
        detail: `${((scene.deck.copingWidth || 1) * 12).toFixed(0)}"`,
        icon: sceneObjectIcons.coping,
        selected: selectedComponent === 'coping',
        onSelect: () => setSelectedComponent('coping'),
      },
      {
        id: 'obj-waterline',
        label: 'Waterline Tile',
        icon: sceneObjectIcons.coping,
        selected: selectedComponent === 'waterline',
        onSelect: () => setSelectedComponent('waterline'),
      },
      {
        id: 'obj-water',
        label: 'Water Surface',
        detail: showWater ? 'visible' : 'hidden',
        icon: sceneObjectIcons.water,
        onSelect: () => setShowWater(!showWater),
      },
    ];
    groups.push({ key: 'structure', label: 'Structure', items: structure });

    if (poolStairs.length) {
      groups.push({
        key: 'stairs',
        label: 'Stairs',
        items: poolStairs.map((s, i) => ({
          id: s.id,
          label: `Stairs ${i + 1}`,
          detail: `${s.numSteps} steps`,
          icon: sceneObjectIcons.stairs,
          selected: selectedPoolAssetId === s.id,
          onSelect: () => setSelectedPoolAssetId(s.id),
          onDelete: () => setPoolStairs(prev => prev.filter(x => x.id !== s.id)),
        })),
      });
    }

    if (poolChairs.length) {
      groups.push({
        key: 'chairs',
        label: 'Seats & Chairs',
        items: poolChairs.map((c, i) => ({
          id: c.id,
          label: c.name || `Chair ${i + 1}`,
          detail: `${c.width}×${c.depth} ft`,
          icon: sceneObjectIcons.chair,
          selected: selectedPoolAssetId === c.id,
          onSelect: () => setSelectedPoolAssetId(c.id),
          onDelete: () => setPoolChairs(prev => prev.filter(x => x.id !== c.id)),
        })),
      });
    }

    if (contourSeating.length) {
      groups.push({
        key: 'seating',
        label: 'Contour Seating',
        items: contourSeating.map((s, i) => ({
          id: s.id,
          label: `Seating ${i + 1}`,
          detail: `${s.width} ft wide`,
          icon: sceneObjectIcons.seating,
          selected: selectedPoolAssetId === s.id,
          onSelect: () => setSelectedPoolAssetId(s.id),
          onDelete: () => setContourSeating(prev => prev.filter(x => x.id !== s.id)),
        })),
      });
    }

    if (poolLights.length) {
      groups.push({
        key: 'lights',
        label: 'Lights',
        items: poolLights.map((l, i) => ({
          id: l.id,
          label: `Light ${i + 1}`,
          detail: l.isOn ? 'on' : 'off',
          icon: sceneObjectIcons.light,
          layer: 'lighting',
          selected: selectedLightId === l.id,
          onSelect: () => setSelectedLightId(l.id),
          onDelete: () => handlePoolLightsChange(poolLights.filter(x => x.id !== l.id)),
        })),
      });
    }

    if (scene.features?.length) {
      groups.push({
        key: 'features',
        label: 'Landscape & Features',
        items: scene.features.map((f, i) => ({
          id: f.id,
          label: `${String(f.type).replace(/-/g, ' ')} ${i + 1}`,
          icon: sceneObjectIcons.terrain,
          layer: 'landscape',
          onSelect: () => setSelectedObject(f.id),
          selected: selectedObject === f.id,
          onDelete: () =>
            setScene({ ...scene, features: scene.features.filter(x => x.id !== f.id) }),
        })),
      });
    }

    if (terrainAssets.length) {
      groups.push({
        key: 'terrain',
        label: 'Terrain Assets',
        items: terrainAssets.map(a => ({
          id: a.id,
          label: a.name,
          detail: a.type,
          icon: sceneObjectIcons.terrain,
          layer: 'landscape',
          onDelete: () => setTerrainAssets(prev => prev.filter(x => x.id !== a.id)),
        })),
      });
    }

    if (assets3D.length) {
      groups.push({
        key: 'assets3d',
        label: '3D Objects',
        items: assets3D.map(a => ({
          id: a.id,
          label: a.name,
          detail: a.type,
          icon: sceneObjectIcons.asset,
          selected: selectedObject === a.id,
          onSelect: () => setSelectedObject(a.id),
          onDelete: () => setAssets3D(prev => prev.filter(x => x.id !== a.id)),
        })),
      });
    }

    /* Board pieces drawn in 2D (fences, screens, turf, drawn decks, extra pools/spas). */
    const b = boardForList;
    if (b) {
      const fences = [
        ...b.fences.map((f, i) => ({ id: boardObjectId('fence', f.itemId, i), label: `${f.style} fence ${i + 1}`, detail: `${f.height} ft`, icon: sceneObjectIcons.fence, layer: 'fences' })),
        ...b.screens.map((c, i) => ({ id: boardObjectId('screen', c.itemId, i), label: `Screen ${i + 1}`, detail: `${c.height} ft`, icon: sceneObjectIcons.fence, layer: 'fences' })),
      ];
      if (fences.length) groups.push({ key: 'fences', label: 'Fences & Screens', items: fences });
      const surfaces = b.surfaces.map((x, i) => ({ id: boardObjectId('surface', x.itemId, i), label: `${x.kind === 'deck' ? 'Deck' : 'Turf'} ${i + 1}`, icon: x.kind === 'deck' ? sceneObjectIcons.deck : sceneObjectIcons.terrain, layer: x.kind === 'deck' ? 'deck' : 'landscape' }));
      if (surfaces.length) groups.push({ key: 'surfaces', label: 'Decks & Turf', items: surfaces });
      const waters = (b.waters ?? []).map((w, i) => ({ id: boardObjectId('water', w.itemId, i), label: (w as any).name || `Pool / spa ${i + 2}`, icon: sceneObjectIcons.pool, layer: 'structure' }));
      if (waters.length) groups.push({ key: 'waters', label: 'Other Pools & Spas', items: waters });
    }

    return groups;
  }, [
    boardForList,
    scene,
    setScene,
    selectedComponent,
    showWater,
    poolStairs,
    poolChairs,
    contourSeating,
    poolLights,
    terrainAssets,
    assets3D,
    selectedPoolAssetId,
    selectedLightId,
    selectedObject,
    setPoolStairs,
    setPoolChairs,
    setContourSeating,
    setTerrainAssets,
    setAssets3D,
    handlePoolLightsChange,
  ]);


  
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
  const linerTextureUrl = safeGetTextureUrl(scene.pool.finish, '/textures/finishes/sapphire-blue-g3.webp');
  const paverTextureUrl = safeGetTextureUrl(scene.deck.paver, '/media/6f65c8d2-ad09-4fef-b01f-cb3c2e96cf11.png');
  const copingTextureUrl = safeGetTextureUrl(scene.deck.coping, '/media/08c51883-4e87-4344-b773-ec0a6d575b54.webp');
  const waterlineTextureUrl = safeGetTextureUrl(scene.deck.waterline, scene.pool.finish.url);
  
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
      flyCamera(controlsRef.current, position, target, 1000);
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
    // A 3D wall/corner edit makes the edited outline the new truth: drop the
    // old 2D control points so going back to 2D keeps this shape.
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        points,
        sourcePoints: undefined,
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

  const handleDepthAxisChange = (axis: { start: { x: number; z: number }; end: { x: number; z: number } }) => {
    setScene({
      ...scene,
      pool: {
        ...scene.pool,
        depthAxis: axis
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
    <div className={embedded ? "absolute inset-0 z-0" : "fixed inset-0 z-[9999]"}>
      {/* Main 3D Canvas - Full screen */}
      <div 
        ref={canvasContainerRef} 
        className="absolute inset-0 bg-background"
      >
        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Scene Objects Widget */}
        <div className="absolute top-4 right-16 md:right-[4.25rem] z-20">
          <SceneObjectsPanel groups={sceneObjectGroups} footer={
            <div className="space-y-2 text-xs">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Site levels</div>
              <label className="block">
                <span className="flex justify-between"><span>{activeW ? (activeW.kind === 'spa' ? 'Spa' : 'Pool') + ' ' + ((activeWater ?? 0) + 2) : 'Pool'} height above ground</span><span>{bodyElevation.toFixed(1)} ft</span></span>
                <Slider min={0} max={5} step={0.25} value={[bodyElevation]} onValueChange={([v]) => setLevels({ pool: v })} className="mt-1.5" />
              </label>
              <label className="block">
                <span className="flex justify-between"><span>Deck level (− sunken / + raised)</span><span>{deckElevation >= 0 ? '+' : ''}{deckElevation.toFixed(1)} ft</span></span>
                <Slider min={-4} max={4} step={0.25} value={[deckElevation]} onValueChange={([v]) => setLevels({ deck: v })} className="mt-1.5" />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={!!xray} onCheckedChange={(v) => setXray(!!v)} />
                <span>See pool walls below ground</span>
              </label>
            </div>
          } />
        </div>



        {/* Undo/Redo & Reset View Controls */}
        {/* In the Design Studio these controls live in the white header (slot #studio3d-header-slot) — Imagine Engine Studios Corp */}
        <HeaderSlotPortal>
        <div className="flex min-w-0 flex-wrap items-center gap-1 md:gap-1.5 [&_button]:shrink-0">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Undo (Ctrl+Z)${historyLength > 0 ? ` - ${historyLength} change${historyLength > 1 ? 's' : ''} in history` : ''}`}
          >
            <Undo2 className="w-4 h-4" strokeWidth={1.8} />
            {historyLength > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {historyLength}
              </span>
            )}
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Redo (Ctrl+Y)${futureLength > 0 ? ` - ${futureLength} change${futureLength > 1 ? 's' : ''} available` : ''}`}
          >
            <Redo2 className="w-4 h-4" strokeWidth={1.8} />
            {futureLength > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {futureLength}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              if (controlsRef.current) {
                // Reset camera to default isometric view
                flyCamera(controlsRef.current, [40, 30, 40], [0, 0, 0], 1000);
              }
            }}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => {
              const newShowGrid = !showGrid;
              setShowGrid(newShowGrid);
              setShowMeasurements(newShowGrid);
              setShowRulers(newShowGrid);
            }}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] ${showGrid ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
            title={showGrid ? "Hide Grid & Measurements" : "Show Grid & Measurements"}
          >
            <Grid3x3 className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            onClick={toggleWater}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] ${waterVisible ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
            title={`${waterVisible ? 'Hide' : 'Show'} water · ${activeW ? activeW.label : 'Main pool'}`}
          >
            <Waves className="w-4 h-4" strokeWidth={1.8} />
          </button>
          {boardWaters.length > 0 && (
            /* Pool picker: every header control and widget works on the chosen pool/spa. */
            <Select value={activeWater == null ? 'main' : String(activeWater)} onValueChange={(value) => targetWater(value === 'main' ? null : Number(value))}>
              <SelectTrigger aria-label="Pool in focus" className="h-9 w-32 shrink-0 rounded-full bg-background text-foreground border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="main">Main pool</SelectItem>
                {boardWaters.map((w, k) => <SelectItem key={w.itemId ?? k} value={String(k)}>{w.kind === 'spa' ? 'Spa' : 'Pool'} {k + 2}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {activeW && (
            /* Tile size for the selected pool/spa only; unset parts follow the main pool. */
            <div className="relative">
              <button type="button" onClick={() => setShowTileSize((v) => !v)} title={`Tile size · ${activeW.label}`}
                className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] ${showTileSize ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}>
                <Ruler className="w-4 h-4" strokeWidth={1.8} />
              </button>
              {showTileSize && (
                <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-900">Tile size · {activeW.label}</p>
                  {tileRows.map((r) => (
                    <div key={r.key} className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-700">
                        <span>{r.label}</span>
                        <span className="tabular-nums">{r.value.toFixed(1)} ft{r.own ? '' : ' · main'}</span>
                      </div>
                      <input type="range" min={0.5} max={6} step={0.1} value={r.value} onChange={(e) => setTileScale(r.key, Number(e.target.value))} className="w-full accent-slate-900" />
                      {r.own && <button type="button" onClick={() => setTileScale(r.key, undefined)} className="text-[11px] text-slate-500 underline hover:text-slate-900">Match main pool</button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setShowClimateController(!showClimateController)}
            className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] ${isNightMode ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
            title="Climate Controls"
          >
            {isNightMode ? <Moon className="w-4 h-4" strokeWidth={1.8} /> : <Sun className="w-4 h-4" strokeWidth={1.8} />}
          </button>
          <button
            onClick={() => setIsWalkthroughMode(!isWalkthroughMode)}
            className={`hidden md:flex w-9 h-9 md:w-10 md:h-10 items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] ${isWalkthroughMode ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
            title="Walkthrough Mode (WASD)"
          >
            <PersonStanding className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => setShowDepthProfileEditor(!showDepthProfileEditor)}
            className={`hidden md:flex w-9 h-9 md:w-10 md:h-10 items-center justify-center rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-200 active:scale-[0.96] ${showDepthProfileEditor ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'}`}
            title={`Depth Profile Editor · ${activeW ? activeW.label : 'Main pool'}`}
          >
            <ArrowUpDown className="w-4 h-4" strokeWidth={1.8} />
          </button>
          {/* 3D Spline Editor deprecated — deck & coping now live in the Deck/Coping settings panel. */}
        </div>
        </HeaderSlotPortal>

        {/* Mobile estimates - bottom bar */}
        <div className="absolute bottom-16 left-4 right-4 z-20 sm:hidden">
          <PoolDesignerHeader
            poolPoints={scene.pool.points}
            poolDepth={poolDepth}
            deckWidth={deckWidth}
            copingWidth={scene.deck.copingWidth || 1}
            poolPrice={parseFloat(new URLSearchParams(window.location.search).get('price') || '50000')}
            paverName={scene.deck.paver?.name}
            copingName={scene.deck.coping?.name}
            finishName={scene.pool.finish?.name}
            waterlineName={scene.deck.waterline?.name}
            additionalFeatures={headerFeatures}
            additionalBodies={headerBodies}
            dropUp
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
          </div>

         {/* Component-Specific Control Panel - Hidden in spline edit mode */}
         {!isSplineEditMode && (
           <ComponentControlPanel
              selectedComponent={selectedComponent}
              scene={waterScene ?? scene}
              onClose={() => {
                setSelectedComponent(null);
                setSelectedCategory(null);
              }}
              onSceneChange={waterScene ? onWaterSceneChange : setScene}
              onSelectComponent={setSelectedComponent}
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
            linearDepthAnchors={waterScene ? waterScene.pool.linearDepthAnchors! : linearDepthAnchors}
            onLinearDepthAnchorsChange={waterScene ? ((a: any) => onWaterSceneChange({ ...waterScene, pool: { ...waterScene.pool, linearDepthAnchors: a } } as any)) : handleLinearDepthAnchorsChange}
            selectedAnchorId={selectedSplinePointId}
            onSelectAnchor={setSelectedSplinePointId}
            poolShallowDepth={poolShallowDepth}
            poolDeepDepth={poolDeepDepth}
            poolPoints={waterScene ? waterScene.pool.points : scene.pool.points}
            poolDimensions={waterScene ? waterScene.pool.dimensions : scene.pool.dimensions}
            depthAxis={waterScene ? (waterScene.pool.depthAxis as any) : depthAxis}
            onDepthAxisChange={waterScene ? ((ax: any) => onWaterSceneChange({ ...waterScene, pool: { ...waterScene.pool, depthAxis: ax } } as any)) : handleDepthAxisChange}
            perimeterDepthPoints={waterScene ? [] : (resolvedPerimeterDepthPoints || [])}
            onPerimeterDepthPointsChange={handlePerimeterDepthPointsChange}
            shapeEditEnabled={enablePoolSplineEdit}
            onShapeEditToggle={() => setEnablePoolSplineEdit(v => !v)}
            onFocusCorner={focusCorner}
            activeCornerIndex={frozenCornerIndex}
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

          {/* Global Design Board piece widget (fence / screen / extra pools & spas) */}
          <BoardElementEditor />

          {/* Pool Asset Manager (Stairs, Seating, Lights, Jets) */}
          <PoolAssetManager
            isOpen={showPoolAssetManager}
            onToggle={() => setShowPoolAssetManager(!showPoolAssetManager)}
            stairs={activeW ? (activeW.stairs ?? []) : poolStairs}
            onStairsChange={activeW ? setWaterStairs : setPoolStairs}
            chairs={activeW ? (activeW.chairs ?? []) : poolChairs}
            onChairsChange={activeW ? setWaterChairs : setPoolChairs}
            targetLabel={activeW ? (activeW.kind === 'spa' ? 'Spa' : 'Pool') + ' ' + ((activeWater ?? 0) + 2) : 'Main pool'}
            contourSeating={activeW ? (activeW.seating ?? []) : contourSeating}
            onContourSeatingChange={activeW ? setWaterSeating : setContourSeating}
            lights={poolLights}
            onLightsChange={handlePoolLightsChange}
            selectedAssetId={selectedPoolAssetId}
            onSelectAsset={setSelectedPoolAssetId}
            poolFinishTexture={linerTextureUrl}
            isNightMode={isNightMode}
            sceneObjects={terrainAssets}
            onSceneObjectsChange={(next) => {
              if (next.length > terrainAssets.length) {
                const added = next[next.length - 1];
                if (added) {
                  setSelectedTerrainAssetId(added.id);
                  focusOnAsset(added.position as [number, number, number]);
                }
              }
              setTerrainAssets(next);
            }}
          selectedObjectId={selectedTerrainAssetId}
          onSelectObject={setSelectedTerrainAssetId}
          gizmoMode={gizmoMode}
          onGizmoModeChange={setGizmoMode}
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
                dpr={sceneHeavy ? Math.min(perfDpr, 1) : perfDpr} // adaptive: drops when FPS < 30 or scene is heavy
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
                }}
                camera={{
                  position: scene.camera.position,
                  fov: 50
                }}
                frameloop={isWalkthroughMode ? "always" : "demand"} // Always render during walkthrough for smooth movement
                onDoubleClick={(e) => {
                  // Double-clicking empty space (or anything that isn't the
                  // selected asset) dismisses the transform gizmo.
                  const hitAsset = (e as any).intersections?.some((i: any) => {
                    let o: any = i.object;
                    while (o) {
                      if (o.name === 'terrain-assets') return true;
                      o = o.parent;
                    }
                    return false;
                  });
                  if (!hitAsset) setSelectedTerrainAssetId(null);
                }}
                onPointerMissed={(e) => {
                  if ((e as MouseEvent).detail >= 2) setSelectedTerrainAssetId(null);
                }}
              >
          {/* Force re-render on state changes */}
          <SceneInvalidator scene={scene} isNightMode={isNightMode} sunPosition={sunPosition} />
          {/* Adaptive quality: below 30 FPS lower resolution + shadows, recover when it's smooth again */}
          <PerformanceMonitor
            bounds={() => [30, 55]}
            flipflops={4}
            onDecline={() => { setPerfDpr(d => Math.max(0.75, +(d - 0.25).toFixed(2))); setShadowRes(1024); }}
            onIncline={() => { setPerfDpr(d => Math.min(1.5, +(d + 0.25).toFixed(2))); if (!sceneHeavy) setShadowRes(2048); }}
          />
          
          {/* Realistic vivid-blue daytime sky (low haze, clear Rayleigh blue, crisp sun disc) — Imagine Engine Studios Corp */}
          {!isNightMode ? (
            <GradientSky sunPosition={sunPosition} />
          ) : (
            // Night sky - dark background
            <color attach="background" args={['#0a1628']} />
          )}
          
          {/* Day lighting: warm sun key light + blue sky / ground bounce fill */}
          {!isNightMode && (
            <>
              <ambientLight intensity={0.28} />
              <hemisphereLight args={['#5fb4ff', '#6b5a43', 0.55]} />
              <directionalLight
                position={sunPosition}
                color="#fff4e2"
                intensity={1.6}
                castShadow
                shadow-mapSize-width={shadowRes}
                shadow-mapSize-height={shadowRes}
                shadow-camera-near={0.5}
                shadow-camera-far={140}
                shadow-camera-left={-28}
                shadow-camera-right={28}
                shadow-camera-top={28}
                shadow-camera-bottom={-28}
                shadow-bias={-0.0005}
                shadow-normalBias={0.03}
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
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.5}
                shadow-camera-far={140}
                shadow-camera-left={-28}
                shadow-camera-right={28}
                shadow-camera-top={28}
                shadow-camera-bottom={-28}
                shadow-bias={-0.0005}
                shadow-normalBias={0.03}
              />

              {/* Subtle fill light */}
              <hemisphereLight
                intensity={0.2}
                color="#1a365d"
                groundColor="#1a202c"
              />
            </>
          )}
          
          <group position={[0, poolElevation, 0]}>
          {/* Pool Lights - Draggable, wall-snapped lights (hidden ones are kept on edit) */}
          <EnhancedPoolLights
            poolPoints={scene.pool.points}
            lights={lightsV.shown}
            onLightsChange={(next) => handlePoolLightsChange(lightsV.merge(next))}
            selectedLightId={selectedLightId}
            onSelectLight={setSelectedLightId}
          />
          
          {/* Water Caustics - Light patterns on pool floor */}
          <WaterCaustics
            poolPoints={scene.pool.points}
            lights={lightsV.shown}
            isNightMode={isNightMode}
            sunAngle={sunAngle}
            causticIntensity={0.5}
          />
          
          {/* Pool Assets (Stairs, Chairs, Contour Seating) */}
          <PoolAssetsRenderer
            poolPoints={scene.pool.points}
            stairs={stairsV.shown}
            onStairsChange={(next) => setPoolStairs(stairsV.merge(next))}
            chairs={chairsV.shown}
            onChairsChange={(next) => setPoolChairs(chairsV.merge(next))}
            contourSeating={seatingV.shown}
            onContourSeatingChange={(next) => setContourSeating(seatingV.merge(next))}
            selectedAssetId={selectedPoolAssetId}
            onSelectAsset={setSelectedPoolAssetId}
            poolDepth={poolDepth}
            getFloorDepthAt={getFloorDepthAt}
          />
          </group>
          
          <CameraController preset={cameraPreset} target={scene.camera.target} />
          
          
          {/* Landscaping plan handed off from the Landscape Studio */}
          <LandscapePlants3D />
          <BoardElements3D holes={[]} mainElevation={poolElevation}
            scales={boardScales} mainCoping={scene.deck.coping?.url} mainWaterline={scene.deck.waterline?.url ?? scene.deck.coping?.url} />

          {/* Pool walls, floor, coping, waterline, AND deck - all in one rendering */}
          <group ref={poolGroupRef} position={[0, 0, 0]} key={`pool-${scene.pool.position.join('-')}`}
            onPointerDown={(e) => { lastPickRef.current = [e.point.x, e.point.y, e.point.z]; }}>
            <Pool3DScene
              points={scene.pool.points}
              depthPoints={scene.pool.depthPoints}
              hardscapePoints={scene.deck.points || []} // Include deck in single render
              linerTextureUrl={linerTextureUrl}
              paverTextureUrl={paverTextureUrl}
              copingTextureUrl={copingTextureUrl}
              waterlineTextureUrl={waterlineTextureUrl}
              fenceTextureUrl="/fence-texture.webp"
              features={scene.features.filter(f => !hid(f.id, "landscape")).map(f => ({
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
              onSelectComponent={selectComponentAtPick}
              fenceHeight={fenceHeight}
              paverTextureScale={scene.deck.paver.scale || 1.8}
              copingTextureScale={scene.deck.coping.scale || 1.8}
              waterlineTextureScale={scene.deck.waterline?.scale || 1.8}
              linerTextureScale={scene.pool.finish.scale || 1.8}
              paverTextureOffset={scene.deck.paver.offset || [0, 0]}
              copingTextureOffset={scene.deck.coping.offset || [0, 0]}
              waterlineTextureOffset={scene.deck.waterline?.offset || [0, 0]}
              linerTextureOffset={scene.pool.finish.offset || [0, 0]}
              paverTextureRotation={scene.deck.paver.rotation || 0}
              copingTextureRotation={scene.deck.coping.rotation || 0}
              waterlineTextureRotation={scene.deck.waterline?.rotation || 0}
              linerTextureRotation={scene.pool.finish.rotation || 0}
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
              perimeterDepthPoints={resolvedPerimeterDepthPoints}
              floorDepthAt={floorDepthAtCentered}
              onPoolPointsChange={handlePoolPointsChange}
              onDeckPointsChange={handleDeckPointsChange}
              onPerimeterDepthPointsChange={handlePerimeterDepthPointsChange}
              selectedSplinePointId={selectedSplinePointId}
              onSelectSplinePoint={setSelectedSplinePointId}
              showWireframe={showWireframe}
              showGrid={showGrid}
              showRulers={showWireframe} 

              showDebugBoundaries={showDebugBoundaries}
              onDebugBoundariesChange={setShowDebugBoundaries}
              hiddenParts={{ pool: hid('obj-pool'), deck: hid('obj-deck', 'deck'), coping: hid('obj-coping', 'deck'), waterline: hid('obj-waterline') }}
              poolElevation={poolElevation}
              xray={!!xray}
            />
          </group>

          {/* Water surface - follows actual pool shape */}
 {showWater && !hid('obj-water') && (
            <group position={[0, poolElevation, 0]}>
              <WaterSurface 
                poolPoints={scene.pool.points}
                depthPoints={scene.pool.depthPoints}
                poolDimensions={scene.pool.dimensions}
                showWireframe={showWireframe}
              />
            </group>
          )}

          {/* 3D Assets */}
          {assets3D.filter((a) => !hid(a.id)).map((asset) => (
            <Asset3DRenderer key={asset.id} asset={asset} />
          ))}

          {/* Terrain Assets from Terrain Editor - selectable with transform gizmo + snapping */}
          <TerrainAssetsRenderer
            assets={terrainAssets.filter((a) => !hid(a.id, 'landscape'))}
            siteRef={terrainSiteRef}
            selectedAssetId={selectedTerrainAssetId}
            onAssetClick={(id) => setSelectedTerrainAssetId(id)}
            gizmoEnabled={!isWalkthroughMode && !isSplineEditMode}
            gizmoMode={gizmoMode}
            snap={gizmoSnap}
            onAssetTransform={(id, next) => setTerrainAssets(prev =>
              prev.map(a => (a.id === id ? { ...a, ...next } : a))
            )}
          />

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

          {/* Auto-center camera on newly dropped assets */}
          {!isWalkthroughMode && (
            <CameraFocusController request={focusRequest} controlsRef={controlsRef} />
          )}

          {/* Keyboard fly controls: WASD / arrows, Q-E or PageUp-Dn for height, Shift to sprint */}
          <OrbitKeyboardControls
            enabled={!isWalkthroughMode && !isSplineEditMode}
            controlsRef={controlsRef}
            moveSpeed={18}
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
              enableRotate={!selectedPoolAssetId && !isSplineEditMode && frozenCornerIndex === null}
              enablePan={frozenCornerIndex === null}
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
          onAddAsset={(asset) => {
            setAssets3D([...assets3D, asset]);
            focusOnAsset(asset.position);
          }}
          onRemoveAsset={(id) => setAssets3D(assets3D.filter(a => a.id !== id))}
          stairs={poolStairs}
          onStairsChange={(next) => {
            if (next.length > poolStairs.length) focusOnPoolAsset();
            setPoolStairs(next);
          }}
          chairs={poolChairs}
          onChairsChange={(next) => {
            if (next.length > poolChairs.length) focusOnPoolAsset();
            setPoolChairs(next);
          }}
          contourSeating={contourSeating}
          onContourSeatingChange={(next) => {
            if (next.length > contourSeating.length) focusOnPoolAsset();
            setContourSeating(next);
          }}
          lights={poolLights}
          onLightsChange={(next) => {
            if (next.length > poolLights.length) focusOnPoolAsset();
            handlePoolLightsChange(next);
          }}
          selectedAssetId={selectedPoolAssetId}
          onSelectAsset={setSelectedPoolAssetId}
          poolFinishTexture={linerTextureUrl}
          isNightMode={isNightMode}
          availableFinishes={textureLibrary.finishes}
          sceneObjects={terrainAssets}
          onSceneObjectsChange={(next) => {
            if (next.length > terrainAssets.length) {
              const added = next[next.length - 1];
              if (added) {
                setSelectedTerrainAssetId(added.id);
                focusOnAsset(added.position as [number, number, number]);
              }
            }
            setTerrainAssets(next);
          }}
          selectedObjectId={selectedTerrainAssetId}
          onSelectObject={setSelectedTerrainAssetId}
          gizmoMode={gizmoMode}
          onGizmoModeChange={setGizmoMode}
        />


        {/* Genius / Projects gallery / Music */}
        <StudioDock
          snapshot={{ scene, poolStairs, poolChairs, contourSeating, poolLights, terrainAssets }}
          apply={(next) => pushSnapshot(next as any)}
          textureLibrary={textureLibrary}
          setNight={setIsNightMode}
        />

        {/* Terrain Editor */}
        <TerrainEditor
          terrainAssets={terrainAssets}
          onTerrainAssetsChange={(next) => {
            if (next.length > terrainAssets.length) {
              const added = next[next.length - 1];
              if (added) {
                setSelectedTerrainAssetId(added.id);
                focusOnAsset(added.position as [number, number, number]);
              }
            }
            setTerrainAssets(next);
          }}
          assetLibrary={assetLibrary}
          onAssetLibraryChange={setAssetLibrary}
          selectedAssetId={selectedTerrainAssetId}
          onSelectedAssetIdChange={setSelectedTerrainAssetId}
          gizmoMode={gizmoMode}
          onGizmoModeChange={setGizmoMode}
          snap={gizmoSnap}
          onSnapChange={setGizmoSnap}
        />

        {/* Corner edit HUD — camera stays frozen until Done */}
        {frozenCornerIndex !== null && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10050] flex items-center gap-3 rounded-full border bg-background/95 px-4 py-2 shadow-xl backdrop-blur">
            <span className="text-xs font-medium">
              Editing corner C{frozenCornerIndex + 1} — camera locked. Drag the point to reshape.
            </span>
            <button
              type="button"
              onClick={releaseCorner}
              className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              Done
            </button>
          </div>
        )}



      </div>
    </div>
  );
}


/** Renders children into the studio header slot when present, otherwise as a floating top-left row. */
function HeaderSlotPortal({ children }: { children: import("react").ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('studio3d-header-slot')); }, []);
  if (slot) return createPortal(children, slot);
  return <div className="absolute top-4 left-4 z-20 max-w-[calc(100%-200px)]">{children}</div>;
}
