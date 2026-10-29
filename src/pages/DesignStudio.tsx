import { BoardObjectsPanel, publishBoard2D } from '@/components/designStudio/BoardObjectsPanel';
import * as React from "react";
const {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} = React;
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Layers, Box, RotateCcw, Home } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PoolBuilder } from "@/components/PoolBuilder";
import { SiteElementsLayer, SiteTakeoffMenu, siteElementsTo3D, SITE_ELEMENTS_KEY, SITE_ELEMENTS_EVENT } from "@/components/designStudio/SiteElementsLayer";
import { LandscapeLayer } from "@/components/designStudio/LandscapeLayer";
import { saveBoard3D, loadBoard3D, clearBoard3D } from "@/lib/design/board3D";
import { cacheRead, cacheWrite } from "@/lib/uiCache";
import { UnifiedPoolVisualizer } from "@/components/UnifiedPoolVisualizer";
import { productToScene, scene3DToPoolBuilder } from "@/components/scene3d/SceneConverter";
import { pools, spas } from "@/components/PoolCatalog";
import { gilmerPools } from "@/data/gilmerPools";
import { gilmerSpas } from "@/data/gilmerSpas";
import { tanningLedges } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { poolFinishes as poolFinishesData } from "@/data/consolidatedProducts";
import { buildCatalogTextureLibrary } from "@/data/textureLibrary";
import { useToast } from "@/hooks/use-toast";
import { CategoryToolbar } from "@/components/designStudio/CategoryToolbar";
import { BoardHeaderControls } from "@/components/designStudio/BoardHeaderControls";
import { BoardReportButton } from "@/components/designStudio/BoardReportButton";
import { useBoardCommands, sendBoardCommand } from "@/components/designStudio/boardCommands";
import { ProjectManager, getAutoSave, setAutoSave, saveProjectToLibrary, setActiveStudioProject } from '@/components/poolBuilder/ProjectManager';
import { completeStudioProject } from '@/lib/design/studioProject';
import { clearLandscape3D } from '@/lib/landscape/landscape3D';
import { toast as boardToast } from "sonner";
import { SubToolbar } from "@/components/designStudio/SubToolbar";
import { Genius2DBar } from "@/components/designStudio/Genius2DBar";
import type { DesignCategory, ToolDefinition } from "@/components/designStudio/featureTypes";
interface Product {
  model?: string;
  name?: string;
  price: number;
  category: string;
  image?: string;
  dimensions?: string;
  depth?: string;
  type?: 'pool' | 'spa' | 'tanning-ledge';
}

// Finish options with images - using consolidated data
const finishOptions = poolFinishesData.map(finish => ({
  name: finish.name,
  price: finish.price,
  image: finish.image,
  collection: finish.collection || 'Standard',
  description: finish.description
}));

/**
 * Catalog-backed texture galleries (finishes, pavers, coping, waterline tiles).
 * Built once at module scope — identical to the Wonderlands Studio catalog.
 */
const studioTextureLibrary = buildCatalogTextureLibrary();
/** Copyright Imagine Engine Studios Corp. Embedded studios never navigate away from their host. */
const DesignStudio = ({ embedded = false, initialView = '2d', onClose }: { embedded?: boolean; initialView?: '2d' | '3d'; onClose?: () => void }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DesignCategory>('pool');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [customPoolShape, setCustomPoolShape] = useState<any[] | null>(null);
  const [poolBuilderData, setPoolBuilderData] = useState<{
    points: any[];
    features: any[];
    perimeter: number;
    area: number;
    deckArea?: number;
    depthPoints?: any[];
    hardscapePoints?: any[];
    additionalPools?: any[];
    scale?: number;
    totalCost?: number;
    breakdown?: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      featuresCost: number;
      total: number;
      featuresList?: Array<{ type: string; cost: number }>;
    };
  } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const project2DRef = useRef<any>(getAutoSave()?.data ?? {});
  const projectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capture2D = useCallback((data: any) => { project2DRef.current = { ...project2DRef.current, ...data }; publishBoard2D(project2DRef.current); }, []);

  
  // Loop prevention for bidirectional sync
  const updateSourceRef = useRef<'2d' | '3d' | null>(null);
  const lastScene3DRef = useRef<any>(null);
  const externalUpdateRef = useRef<any>(null);
  
  const sceneMemoryKey = `design-studio.scene3d.${searchParams.get('model') || 'custom'}`;
  const sceneHydrated = useRef(false);
  if (!sceneHydrated.current) {
    sceneHydrated.current = true;
    try {
      const raw = localStorage.getItem(sceneMemoryKey);
      lastScene3DRef.current = getAutoSave()?.data?.scene3D ?? (raw ? JSON.parse(raw) : null);
    } catch { /* ignore */ }
  }
  const [selectedExtras, setSelectedExtras] = useState<any>({
    finish: '',
    paverOption: '',
    copingPaverOption: '',
    customPoolShape: null,
    depthProfile: null,
    poolBuilderData: null,
    poolBuilderFeatures: null
  });

  // Handle tool selection from toolbar
  const handleToolSelect = useCallback((tool: ToolDefinition) => {
    setActiveTool(tool.id);
    toast({
      title: tool.name,
      description: tool.description || `${tool.name} tool selected`
    });
  }, [toast]);

  // Clear tool after it's been used
  const handleToolUsed = useCallback(() => {
    // Keep tool active for repeated use, user can switch manually
  }, []);

  // Reset entire scene to blank
  const handleResetScene = useCallback(() => {
    // Clear all state first (including the 2D ⇄ 3D scene memory)
    setActiveStudioProject(null);
    if (projectTimer.current) clearTimeout(projectTimer.current);
    project2DRef.current = {};
    lastScene3DRef.current = null;
    try { localStorage.removeItem(sceneMemoryKey); } catch { /* ignore */ }
    // Every board element goes: fences, screens, turf, drawn decks, extra pools/spas and the saved 3D board.
    cacheWrite(SITE_ELEMENTS_KEY, []);
    window.dispatchEvent(new CustomEvent(SITE_ELEMENTS_EVENT, { detail: [] }));
    clearBoard3D();
    // The landscape layer goes with everything else: its saved plan, its 3D
    // handoff, and a reset event for the mounted layer to clear itself.
    try { localStorage.removeItem('design_studio_landscape_v1'); } catch { /* ignore */ }
    clearLandscape3D();
    window.dispatchEvent(new CustomEvent('design-studio:landscape-reset'));
    sentBoardRef.current = null;
    setPoolBuilderData(null);
    setCustomPoolShape(null);
    setActiveTool(null);
    setActiveCategory('pool');
    setSelectedExtras({
      finish: '',
      paverOption: '',
      copingPaverOption: '',
      customPoolShape: null,
      depthProfile: null,
      poolBuilderData: null,
      poolBuilderFeatures: null
    });
    lastScene3DRef.current = null;
    externalUpdateRef.current = null;
    updateSourceRef.current = null;

    // Exit fullscreen if active (3D view)
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }

    // Switch to 2D and force full remount with new key
    setActiveView('2d');
    // Use setTimeout to ensure state is flushed before remount
    setTimeout(() => {
      setResetKey(k => k + 1);
    }, 0);

    // Clear any saved project from localStorage
    try {
      localStorage.removeItem('poolBuilderAutoSave');
      localStorage.removeItem('wonderlands-autosave');
      localStorage.removeItem('wonderlands_studio_autosave');
      localStorage.removeItem('wonderlands_studio_projects_autosave');
    } catch (e) {
      // ignore
    }

    toast({
      title: "Project Cleared",
      description: "Everything has been erased. Start drawing your new pool!"
    });
  }, [toast]);

  // Get product from URL params
  const selectedProduct = useMemo<Product | null>(() => {
    const model = searchParams.get('model');
    const price = searchParams.get('price');
    const category = searchParams.get('category');
    const dimensions = searchParams.get('dimensions');
    const depth = searchParams.get('depth');
    const type = searchParams.get('type') as 'pool' | 'spa' | 'tanning-ledge' | null;
    if (!model || !price) {
      // Default to first pool if no params
      const defaultPool = pools[0] || gilmerPools[0];
      if (defaultPool) {
        return {
          model: defaultPool.model,
          price: defaultPool.price,
          category: defaultPool.category,
          dimensions: defaultPool.dimensions,
          depth: defaultPool.depth,
          type: 'pool' as const
        };
      }
      return null;
    }

    // Try to find matching product
    let foundProduct: Product | null = null;

    // Check pools
    const poolMatch = [...pools, ...gilmerPools].find(p => p.model === model);
    if (poolMatch) {
      foundProduct = {
        ...poolMatch,
        type: 'pool' as const
      };
    }

    // Check spas
    if (!foundProduct) {
      const spaMatch = [...spas, ...gilmerSpas].find(s => s.model === model);
      if (spaMatch) {
        foundProduct = {
          ...spaMatch,
          type: 'spa' as const
        };
      }
    }

    // Check tanning ledges
    if (!foundProduct) {
      const ledgeMatch = tanningLedges.find(t => t.name === model);
      if (ledgeMatch) {
        foundProduct = {
          model: ledgeMatch.name,
          name: ledgeMatch.name,
          price: ledgeMatch.price,
          category: 'Tanning Ledge',
          type: 'tanning-ledge' as const
        };
      }
    }

    // Fallback to URL params
    if (!foundProduct) {
      foundProduct = {
        model,
        price: parseFloat(price),
        category: category || 'Pool',
        dimensions: dimensions || undefined,
        depth: depth || undefined,
        type: type || 'pool'
      };
    }
    return foundProduct;
  }, [searchParams]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (embedded) return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [embedded]);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle pool builder data changes (from 2D)
  const materials2DDirtyRef = useRef(false);
  const poolDataRef = useRef<any>(null);
  const lastMaterialsKeyRef = useRef<string | null>(null);
  const handlePoolDataChange = useCallback((data: any) => {
    // Skip if this update was triggered by 3D sync
    if (updateSourceRef.current === '3d') {
      updateSourceRef.current = null;
      return;
    }
    updateSourceRef.current = '2d';
    requestAnimationFrame(() => { updateSourceRef.current = null; });
    
    
    const matKey = JSON.stringify(data.materials ?? null);
    if (lastMaterialsKeyRef.current !== null && lastMaterialsKeyRef.current !== matKey) {
      materials2DDirtyRef.current = true; // 2D picked new textures → they win over 3D memory
    }
    lastMaterialsKeyRef.current = matKey;
    poolDataRef.current = data;
    setPoolBuilderData(data);
    setCustomPoolShape(data.points);
    const jetCount = data.features?.filter((f: any) => f.type === 'jet').length || 0;
    const hasStairs = data.features?.some((f: any) => f.type === 'stairs') || false;
    const lightCount = data.features?.filter((f: any) => f.type === 'light').length || 0;
    setSelectedExtras((prev: any) => ({
      ...prev,
      customPoolShape: data.points,
      depthProfile: data.depthPoints,
      poolBuilderData: data,
      additionalPools: data.additionalPools || [],
      hardscapePoints: data.hardscapePoints || [],
      jets: jetCount > 0,
      jetQuantity: jetCount,
      poolBuilderFeatures: {
        jets: jetCount,
        stairs: hasStairs,
        lights: lightCount,
        totalFeaturesCost: data.breakdown?.featuresCost || 0,
        deckArea: data.deckArea || 0
      }
    }));
  }, []);

  // Handle 3D scene changes → sync back to 2D state
  const sync3DTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handle3DSceneChange = useCallback((updatedScene: any) => {
    // Skip if this update was triggered by 2D sync
    if (updateSourceRef.current === '2d') {
      return;
    }
    // The first scene the 3D Studio reports is just what it loaded — only real 3D edits flow back to 2D,
    // so an older remembered scene can never replace the board when you return.
    if (skipFirst3DRef.current) { skipFirst3DRef.current = false; return; }
    // Slider drags fire every frame: sync back to 2D once the value settles so the
    // round-trip never re-renders the 3D Studio mid-drag (the slider used to freeze).
    if (sync3DTimer.current) clearTimeout(sync3DTimer.current);
    sync3DTimer.current = setTimeout(() => {

    // Store latest 3D scene (deep copy — panels mutate nested objects) so
    // textures, deck/coping settings, depth profile and lights persist across 2D ⇄ 3D.
    materials2DDirtyRef.current = false;
    try { lastScene3DRef.current = structuredClone(updatedScene); } catch { lastScene3DRef.current = updatedScene; }
    try { localStorage.setItem(sceneMemoryKey, JSON.stringify(lastScene3DRef.current)); } catch { /* quota */ }
    
    if (projectTimer.current) clearTimeout(projectTimer.current);
    projectTimer.current = setTimeout(() => setAutoSave(completeStudioProject(project2DRef.current, lastScene3DRef.current, loadBoard3D())), 2000);

    // Convert 3D scene back to 2D format
    const scale = poolBuilderData?.scale || 10;
    const converted = scene3DToPoolBuilder(updatedScene, scale);
    
    // Update shared state so 2D reflects 3D changes
    updateSourceRef.current = '3d';
    requestAnimationFrame(() => { updateSourceRef.current = null; });
    
    setCustomPoolShape(converted.points);
    setSelectedExtras((prev: any) => ({
      ...prev,
      customPoolShape: converted.points,
      depthProfile: converted.depthPoints,
      poolBuilderData: {
        ...prev.poolBuilderData,
        points: converted.points,
        depthPoints: converted.depthPoints,
        hardscapePoints: converted.hardscapePoints,
        scale
      },
      additionalPools: converted.additionalPools,
      hardscapePoints: converted.hardscapePoints
    }));
    
    // Prepare external update for PoolBuilder
    externalUpdateRef.current = {
      points: converted.points,
      depthPoints: converted.depthPoints,
      hardscapePoints: converted.hardscapePoints,
      features: converted.features,
      additionalPools: converted.additionalPools,
      materials: converted.materials
    };
    }, 150);
  }, [poolBuilderData?.scale, sceneMemoryKey]);

  /* Genius 2D bridge: the Genius bar speaks PoolBuilder's OWN data format
   * (points / depthPoints / features / additionalPools in board pixels) on
   * this event, and the update lands through the exact external-update path
   * the 3D sync uses — no 3D round-trip, no converter in between. */
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail ?? {};
      const cur: any = poolDataRef.current ?? {};
      const points = Array.isArray(d.points) && d.points.length >= 3 ? d.points : cur.points;
      const depthPoints = Array.isArray(d.depthPoints) && d.depthPoints.length >= 2 ? d.depthPoints : cur.depthPoints;
      externalUpdateRef.current = {
        points,
        depthPoints,
        hardscapePoints: d.hardscapePoints ?? cur.hardscapePoints,
        features: d.features ?? cur.features,
        additionalPools: d.additionalPools ?? cur.additionalPools,
        ...(d.materials ? { materials: d.materials } : {}),
      };
      updateSourceRef.current = '3d';
      requestAnimationFrame(() => { updateSourceRef.current = null; });
      if (points) setCustomPoolShape(points);
      setSelectedExtras((prev: any) => ({
        ...prev,
        customPoolShape: points ?? prev.customPoolShape,
        depthProfile: depthPoints ?? prev.depthProfile,
        additionalPools: d.additionalPools ?? prev.additionalPools,
        poolBuilderData: {
          ...prev.poolBuilderData,
          points: points ?? prev.poolBuilderData?.points,
          depthPoints: depthPoints ?? prev.poolBuilderData?.depthPoints,
          features: d.features ?? prev.poolBuilderData?.features,
          additionalPools: d.additionalPools ?? prev.poolBuilderData?.additionalPools,
        },
      }));
    };
    window.addEventListener('design-studio:pool-update', h);
    return () => window.removeEventListener('design-studio:pool-update', h);
  }, []);

  // Handle switching to 3D view
  const sentBoardRef = useRef<any>(null);
  const skipFirst3DRef = useRef(false);
  const getCompleteProject = useCallback(() => {
    const scene = lastScene3DRef.current;
    let data = project2DRef.current;
    if (activeView === '3d' && scene) {
      const converted = scene3DToPoolBuilder(scene, data.scale ?? 10);
      data = { ...data, points: converted.points, depthPoints: converted.depthPoints, hardscapePoints: converted.hardscapePoints,
        selectedFinishId: converted.materials.finish ?? data.selectedFinishId,
        selectedPaverId: converted.materials.paver ?? data.selectedPaverId,
        selectedCopingId: converted.materials.coping ?? data.selectedCopingId };
    }
    return activeView === '3d' ? completeStudioProject(data, scene, loadBoard3D()) : { ...data, studioVersion: 2, scene3D: scene };
  }, [activeView]);
  const saveComplete = useCallback(() => {
    try { const data = getCompleteProject(); const p = saveProjectToLibrary(data); setAutoSave(data); boardToast.success(`Saved ${p.name}`); }
    catch { boardToast.message('Your browser could not save this design. Free some storage and try again.'); }
  }, [getCompleteProject]);
  const loadComplete = useCallback((data: any) => {
    if (projectTimer.current) clearTimeout(projectTimer.current);
    project2DRef.current = data; setAutoSave(data);
    lastScene3DRef.current = data.scene3D ?? null;
    externalUpdateRef.current = null; materials2DDirtyRef.current = false;
    cacheWrite(SITE_ELEMENTS_KEY, data.site ?? []);
    window.dispatchEvent(new CustomEvent(SITE_ELEMENTS_EVENT, { detail: data.site ?? [] }));
    if (data.board3D) saveBoard3D(data.board3D); else clearBoard3D();
    try { if (data.scene3D) localStorage.setItem(sceneMemoryKey, JSON.stringify(data.scene3D)); else localStorage.removeItem(sceneMemoryKey); } catch { /* quota */ }
    setActiveView('2d'); setResetKey(k => k + 1);
  }, [sceneMemoryKey]);
  useEffect(() => {
    const save = () => {
      if (projectTimer.current) clearTimeout(projectTimer.current);
      projectTimer.current = setTimeout(() => setAutoSave(getCompleteProject()), 2000);
    };
    save(); window.addEventListener('studio3d:globalDesign', save); window.addEventListener(SITE_ELEMENTS_EVENT, save);
    const flush = () => setAutoSave(getCompleteProject());
    window.addEventListener('pagehide', flush);
    return () => { if (projectTimer.current) clearTimeout(projectTimer.current); window.removeEventListener('pagehide', flush); window.removeEventListener('studio3d:globalDesign', save); window.removeEventListener(SITE_ELEMENTS_EVENT, save); };
  }, [getCompleteProject, poolBuilderData]);
  const handleSwitch3D = useCallback(() => {
    // Never show a pool that isn't on the 2D board: 3D only opens the pool drawn here
    // (or the catalog model the studio was opened with).
    if (!(customPoolShape && customPoolShape.length >= 3) && !searchParams.get('model')) {
      toast({ title: 'Draw your pool first', description: 'Draw the pool on the 2D board — the 3D Studio shows exactly that pool, its deck and everything around it.' });
      return;
    }
    // The Design Studio owns the 3D hand-off: its fences/screens/turf replace any
    // leftover design-board data, so the 3D viewer never shows another project.
    try {
      const sent = siteElementsTo3D(cacheRead<any[]>(SITE_ELEMENTS_KEY, []), customPoolShape ?? [], poolBuilderData?.scale || 10, poolBuilderData?.hardscapePoints ?? [], poolBuilderData?.additionalPools ?? [], (poolBuilderData as any)?.additionalDecks ?? {});
      saveBoard3D(sent);
      externalUpdateRef.current = null; skipFirst3DRef.current = true;
      sentBoardRef.current = JSON.parse(JSON.stringify(sent));
      project2DRef.current = { ...project2DRef.current, additionalPools: (project2DRef.current.additionalPools ?? []).map((p: any) => ({ ...p, renderRing3D: sent.waters?.find(w => w.itemId === p.id)?.pts })) };
      setAutoSave(completeStudioProject(project2DRef.current, lastScene3DRef.current, sent));
    } catch { /* ignore */ }
    lastScene3DRef.current = buildPersistedScene();
    setActiveView('3d');
    // Stay in the page (not browser fullscreen) so the header with "Back to 2D" stays visible.
    if (customPoolShape && customPoolShape.length > 0) {
      toast({
        title: "Custom Shape Loaded",
        description: `Your custom pool design with ${customPoolShape.length} points is now in 3D!`
      });
    }
    // Depend on the whole 2D design so every extra pool and deck is sent (no stale copy).
  }, [customPoolShape, poolBuilderData, searchParams, toast]);

  /* /studio-3d now lands here with ?view=3d: open the 3D Studio once a pool is on the board. */
  const autoOpened3D = useRef(false);
  useEffect(() => {
    if (autoOpened3D.current || (embedded ? initialView !== '3d' : searchParams.get('view') !== '3d')) return;
    if ((customPoolShape && customPoolShape.length >= 3) || searchParams.get('model')) { autoOpened3D.current = true; handleSwitch3D(); }
  }, [customPoolShape, searchParams, handleSwitch3D, embedded, initialView]);
  const handleSwitch2D = useCallback(() => {
    const data = getCompleteProject();
    project2DRef.current = data;
    setAutoSave(data);
    cacheWrite(SITE_ELEMENTS_KEY, data.site ?? []);
    window.dispatchEvent(new CustomEvent(SITE_ELEMENTS_EVENT, { detail: data.site ?? [] }));
    externalUpdateRef.current = null;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setIsFullscreen(false);
    setActiveView('2d');
  }, [getCompleteProject]);
  useBoardCommands((c) => {
    if (c === 'save') saveComplete();
    else if (c === 'projects') setProjectsOpen(true);
  });
  /**
   * 3D scene with memory: geometry comes from the current 2D design, while
   * everything chosen in 3D (finish, pavers, coping, waterline, deck/coping
   * sizes, depth profile, lights, stairs, notes) is restored from the last session.
   */
  const buildPersistedScene = () => {
    const base = productToScene(selectedProduct, { ...selectedExtras, customPoolShape }, paverTypes, finishOptions);
    const last = lastScene3DRef.current;
    if (!last?.pool || !last?.deck) return base;
    const use3DMaterials = !materials2DDirtyRef.current;
    const sameShape = (last.pool.points?.length ?? 0) === (base.pool.points?.length ?? 0);
    return {
      ...base,
      poolLights: last.poolLights ?? base.poolLights,
      stairs: last.stairs ?? base.stairs,
      annotations: last.annotations ?? base.annotations,
      camera: last.camera ?? base.camera,
      pool: {
        ...base.pool,
        finish: use3DMaterials ? (last.pool.finish ?? base.pool.finish) : base.pool.finish,
        position: last.pool.position ?? base.pool.position,
        rotation: last.pool.rotation ?? base.pool.rotation,
        ...(sameShape ? {
          linearDepthAnchors: last.pool.linearDepthAnchors,
          depthAxis: last.pool.depthAxis,
          perimeterDepthPoints: last.pool.perimeterDepthPoints,
        } : {}),
      },
      deck: {
        ...base.deck,
        paver: use3DMaterials ? (last.deck.paver ?? base.deck.paver) : base.deck.paver,
        coping: use3DMaterials ? (last.deck.coping ?? base.deck.coping) : base.deck.coping,
        waterline: last.deck.waterline ?? base.deck.waterline,
        copingHeight: last.deck.copingHeight ?? base.deck.copingHeight,
        copingWidth: last.deck.copingWidth ?? base.deck.copingWidth,
        copingEdgeProfile: last.deck.copingEdgeProfile ?? base.deck.copingEdgeProfile,
        deckHeight: last.deck.deckHeight ?? base.deck.deckHeight,
        deckElevation: last.deck.deckElevation ?? base.deck.deckElevation,
      },
    };
  };

  if (!selectedProduct) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No product selected</p>
          <Button onClick={() => navigate('/wonderlands-studio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studio
          </Button>
        </div>
      </div>;
  }
  return <div className={`${embedded ? 'h-full min-h-0' : 'h-screen'} overflow-hidden bg-background flex flex-col select-none`}>
      {!embedded && <Helmet>
        <title>2D & 3D Pool and Patio Designer | Wonderlands</title>
        <meta name="description" content="Draw custom pools, spas, decks and patios to scale in your browser. Switch between 2D and 3D, choose finishes and build a residential project estimate." />
        <link rel="canonical" href="https://www.wonderlandsworld.com/design-studio" />
        <meta property="og:title" content="2D & 3D Pool and Patio Designer | Wonderlands" />
        <meta property="og:description" content="Browser-based pool and patio design tools for homeowners and contractors: scaled drawing, 3D visualization, materials and estimates." />
        <meta property="og:url" content="https://www.wonderlandsworld.com/design-studio" />
        <meta property="og:type" content="website" />
      </Helmet>}
      {/* Category Toolbar with integrated header elements */}
      {activeView === '2d' ? <>
          <CategoryToolbar hideCategories activeCategory={activeCategory} onCategoryChange={setActiveCategory} headerLeft={<div className="flex items-center gap-1 sm:gap-4">
                <Button variant="ghost" size="sm" onClick={() => embedded ? onClose?.() : navigate(-1)} className="gap-2 px-2 sm:px-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <BoardHeaderControls />
              </div>} headerRight={<div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <BoardReportButton scale={poolBuilderData?.scale || 10} poolPts={poolBuilderData?.points ?? []} deckPts={poolBuilderData?.hardscapePoints ?? []} poolDepth={lastScene3DRef.current?.pool?.depth?.deep ?? 6} additionalPools={poolBuilderData?.additionalPools} additionalDecks={(poolBuilderData as any)?.additionalDecks} />
                <div className="hidden sm:block min-w-0"><SiteTakeoffMenu additionalDecks={(poolBuilderData as any)?.additionalDecks} paver={(poolBuilderData as any)?.materials?.paver} scale={poolBuilderData?.scale || 10} poolPts={poolBuilderData?.points ?? []} deckPts={poolBuilderData?.hardscapePoints ?? []} poolDepth={lastScene3DRef.current?.pool?.depth?.deep ?? 6} deckWidth={lastScene3DRef.current?.deck?.width ?? 4} copingWidth={lastScene3DRef.current?.deck?.copingWidth ?? 1} poolPrice={parseFloat(searchParams.get("price") || "50000")} deckAreaSqFt={poolBuilderData?.deckArea} featuresList={poolBuilderData?.breakdown?.featuresList} additionalPools={poolBuilderData?.additionalPools}
                  stats={poolBuilderData ? { perimeter: poolBuilderData.perimeter || 0, area: poolBuilderData.area || 0, corners: poolBuilderData.points?.length || 0, features: poolBuilderData.features?.length || 0, deckArea: poolBuilderData.deckArea || 0 } : null}
                  totals={poolBuilderData?.breakdown ? { pool: poolBuilderData.breakdown.poolCost || 0, deck: poolBuilderData.breakdown.deckCost || 0, coping: poolBuilderData.breakdown.copingCost || 0, features: poolBuilderData.breakdown.featuresCost || 0 } : null} /></div>
                <div id="board-header-slot" className="flex items-center gap-1.5" />
                <Button size="sm" onClick={handleSwitch3D} className="h-9 gap-1.5 rounded-full bg-foreground px-3 sm:px-4 text-xs shrink-0 font-semibold uppercase tracking-[0.08em] sm:tracking-[0.15em] text-background hover:bg-foreground/90">
                  <Box className="h-3.5 w-3.5" />3D<span className="hidden sm:inline"> Mode</span>
                </Button>
                
                <div className="h-6 w-px bg-border hidden sm:block" />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive px-2 sm:px-3">
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Reset</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All items will be eliminated — every pool, spa, deck, fence, screen, turf and feature on the board will be removed and the board cleaned out. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetScene} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={() => embedded ? onClose?.() : navigate("/")} title={embedded ? 'Close studio' : 'Home'} className="rounded-full w-9 h-9 p-0 bg-primary hover:bg-primary/90 shadow-md shrink-0">
                  <Home className="h-4 w-4" />
                </Button>
              </div>} />
          <SubToolbar hideTools category={activeCategory} activeTool={activeTool} onToolSelect={handleToolSelect} stats={false as boolean && poolBuilderData ? {
        perimeter: poolBuilderData.perimeter,
        area: poolBuilderData.area,
        corners: poolBuilderData.points?.length || 0,
        features: poolBuilderData.features?.length || 0,
        deckArea: poolBuilderData.deckArea || 0,
        totalCost: poolBuilderData.breakdown?.total || poolBuilderData.totalCost || 0
      } : null} />
        </> : <header className="relative z-[60] flex flex-nowrap items-center justify-between gap-1 px-1.5 sm:px-4 py-1.5 bg-muted/50 border-b shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Back always returns to the 2D designer — your shape, finishes and 3D settings are kept. */}
            <Button variant="ghost" size="sm" onClick={handleSwitch2D} className="gap-2 px-2 sm:px-3" title="Back to the 2D designer">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <BoardHeaderControls hideHistory />
          </div>
          {/* 3D controls sit inline in the top row (not a second row below). */}
          <div id="studio3d-header-slot" className="relative z-[70] flex min-w-0 flex-1 items-center justify-start sm:justify-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&_*]:flex-nowrap" />
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="min-w-0 max-w-xs hidden sm:block">
            <SiteTakeoffMenu additionalDecks={(poolBuilderData as any)?.additionalDecks} paver={(poolBuilderData as any)?.materials?.paver} scale={poolBuilderData?.scale || 10} poolPts={poolBuilderData?.points ?? []} deckPts={poolBuilderData?.hardscapePoints ?? []} poolDepth={lastScene3DRef.current?.pool?.depth?.deep ?? 6} deckWidth={lastScene3DRef.current?.deck?.width ?? 4} copingWidth={lastScene3DRef.current?.deck?.copingWidth ?? 1} poolPrice={parseFloat(searchParams.get("price") || "50000")} deckAreaSqFt={poolBuilderData?.deckArea} featuresList={poolBuilderData?.breakdown?.featuresList} additionalPools={poolBuilderData?.additionalPools}
                  stats={poolBuilderData ? { perimeter: poolBuilderData.perimeter || 0, area: poolBuilderData.area || 0, corners: poolBuilderData.points?.length || 0, features: poolBuilderData.features?.length || 0, deckArea: poolBuilderData.deckArea || 0 } : null}
                  totals={poolBuilderData?.breakdown ? { pool: poolBuilderData.breakdown.poolCost || 0, deck: poolBuilderData.breakdown.deckCost || 0, coping: poolBuilderData.breakdown.copingCost || 0, features: poolBuilderData.breakdown.featuresCost || 0 } : null} />
            </div>
            {/* Single black 2D switch — the 3D tab is redundant inside the 3D studio. */}
            <Button size="sm" onClick={handleSwitch2D} className="gap-1.5 h-9 rounded-full bg-foreground text-background hover:bg-foreground/90 px-3 shrink-0">
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">2D Designer</span><span className="sm:hidden">2D</span>
            </Button>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive px-2 sm:px-3">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All items will be eliminated — every pool, spa, deck, fence, screen, turf and feature on the board will be removed and the board cleaned out. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetScene} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* Home sits in the header beside Reset (floating rail is hidden on this page). */}
            <Button onClick={() => embedded ? onClose?.() : navigate("/")} title={embedded ? 'Close studio' : 'Home'} className="rounded-full w-9 h-9 p-0 bg-primary hover:bg-primary/90 shadow-md shrink-0">
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </header>}

      <ProjectManager isOpen={projectsOpen} onOpenChange={setProjectsOpen} onSaveProject={getCompleteProject} onLoadProject={loadComplete} />
      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {activeView === '2d' ? <div className="relative w-full h-full">
            {/* Objects & layers — same spot as the 3D Studio widget. */}
            <div className="absolute top-4 right-16 md:right-[4.25rem] z-40"><BoardObjectsPanel /></div>
            <PoolBuilder managedProjects onProjectStateChange={capture2D} key={resetKey} initialDimensions={selectedProduct.dimensions} initialDepth={selectedProduct.depth} externalTool={activeTool} externalTab={activeCategory} hideInternalTabs={true} onToolUsed={handleToolUsed} onPoolDataChange={handlePoolDataChange} onExternalUpdate={externalUpdateRef.current} renderOverlay={(view) => <><LandscapeLayer view={view} /><SiteElementsLayer view={view} poolTotals={poolBuilderData?.breakdown ? { pool: poolBuilderData.breakdown.poolCost, deck: poolBuilderData.breakdown.deckCost, coping: poolBuilderData.breakdown.copingCost, features: poolBuilderData.breakdown.featuresCost, deckArea: poolBuilderData.deckArea || 0, area: poolBuilderData.area || 0 } : null} /></>} />
            {/* Genius draws a full pool + depth + deck from a sentence (same brief as 3D). */}
            <Genius2DBar onScene={(sc) => { updateSourceRef.current = null; handle3DSceneChange(sc); }} getCurrent={() => poolDataRef.current} />
          </div> : <div className="w-full h-full">
            <UnifiedPoolVisualizer embedded scene={buildPersistedScene()} textureLibrary={studioTextureLibrary} onSceneChange={handle3DSceneChange} />
            
          </div>}
      </main>
    </div>;
};
export default DesignStudio;