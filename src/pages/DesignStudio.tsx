import * as React from "react";
const { useState, useEffect, useMemo, useCallback } = React;
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Layers, Box, Maximize2, Minimize2, Save, Download, Share2 } from "lucide-react";
import { PoolBuilder } from "@/components/PoolBuilder";
import { UnifiedPoolVisualizer } from "@/components/UnifiedPoolVisualizer";
import { productToScene } from "@/components/scene3d/SceneConverter";
import { pools, spas } from "@/components/PoolCatalog";
import { gilmerPools } from "@/data/gilmerPools";
import { gilmerSpas } from "@/data/gilmerSpas";
import { tanningLedges } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { poolFinishes as poolFinishesData, poolLiners as poolLinersData, poolTiles as poolTilesData } from "@/data/consolidatedProducts";
import { useToast } from "@/hooks/use-toast";

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

const DesignStudio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customPoolShape, setCustomPoolShape] = useState<any[] | null>(null);
  const [poolBuilderData, setPoolBuilderData] = useState<{
    points: any[];
    features: any[];
    perimeter: number;
    area: number;
    deckArea?: number;
    depthPoints?: any[];
    totalCost?: number;
    breakdown?: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      featuresCost: number;
      total: number;
    };
  } | null>(null);
  
  const [selectedExtras, setSelectedExtras] = useState<any>({
    finish: '',
    paverOption: '',
    copingPaverOption: '',
    customPoolShape: null,
    depthProfile: null,
    poolBuilderData: null,
    poolBuilderFeatures: null,
  });

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
          type: 'pool' as const,
        };
      }
      return null;
    }
    
    // Try to find matching product
    let foundProduct: Product | null = null;
    
    // Check pools
    const poolMatch = [...pools, ...gilmerPools].find(p => p.model === model);
    if (poolMatch) {
      foundProduct = { ...poolMatch, type: 'pool' as const };
    }
    
    // Check spas
    if (!foundProduct) {
      const spaMatch = [...spas, ...gilmerSpas].find(s => s.model === model);
      if (spaMatch) {
        foundProduct = { ...spaMatch, type: 'spa' as const };
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
        type: type || 'pool',
      };
    }
    
    return foundProduct;
  }, [searchParams]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle pool builder data changes
  const handlePoolDataChange = useCallback((data: any) => {
    console.log('Pool builder data changed:', data);
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

  // Handle switching to 3D view
  const handleSwitch3D = useCallback(() => {
    setActiveView('3d');
    if (customPoolShape && customPoolShape.length > 0) {
      toast({
        title: "Custom Shape Loaded",
        description: `Your custom pool design with ${customPoolShape.length} points is now in 3D!`,
      });
    }
  }, [customPoolShape, toast]);

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No product selected</p>
          <Button onClick={() => navigate('/wonderlands-studio')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold">{selectedProduct.model || selectedProduct.name}</h1>
            <p className="text-xs text-muted-foreground">{selectedProduct.dimensions}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <Tabs value={activeView} onValueChange={(v) => {
            if (v === '3d') handleSwitch3D();
            else setActiveView(v as '2d' | '3d');
          }}>
            <TabsList className="h-9">
              <TabsTrigger value="2d" className="gap-1.5 text-xs px-3">
                <Layers className="h-3.5 w-3.5" />
                2D Designer
              </TabsTrigger>
              <TabsTrigger value="3d" className="gap-1.5 text-xs px-3">
                <Box className="h-3.5 w-3.5" />
                3D Viewer
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="h-6 w-px bg-border" />
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {activeView === '2d' ? (
          <div className="w-full h-full">
            <PoolBuilder
              initialDimensions={selectedProduct.dimensions}
              initialDepth={selectedProduct.depth}
              onPoolDataChange={handlePoolDataChange}
            />
          </div>
        ) : (
          <div className="w-full h-full">
            <UnifiedPoolVisualizer
              scene={productToScene(
                selectedProduct,
                { ...selectedExtras, customPoolShape },
                paverTypes,
                finishOptions
              )}
              textureLibrary={{
                finishes: [
                  ...poolFinishesData.map(f => ({
                    url: f.image,
                    name: f.name,
                    roughness: 0.2,
                    metalness: 0.1
                  })),
                  ...poolLinersData.map(l => ({
                    url: l.image,
                    name: l.name,
                    roughness: 0.3,
                    metalness: 0.2
                  })),
                  ...poolTilesData.map(t => ({
                    url: t.image,
                    name: t.name,
                    roughness: 0.1,
                    metalness: 0.3
                  }))
                ],
                pavers: paverTypes.map(p => ({
                  url: p.image,
                  name: p.name,
                  roughness: 0.8,
                  metalness: 0.0
                })),
                coping: paverTypes.map(p => ({
                  url: p.image,
                  name: p.name,
                  roughness: 0.6,
                  metalness: 0.0
                })),
                waterlines: [
                  { url: '/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.png', name: 'Ballad', roughness: 0.1, metalness: 0.3 },
                  ...poolLinersData.filter(l => l.type === 'Glass').map(l => ({
                    url: l.image,
                    name: l.name,
                    roughness: 0.1,
                    metalness: 0.3
                  })),
                  ...poolLinersData.filter(l => l.type === 'Porcelain').map(l => ({
                    url: l.image,
                    name: l.name,
                    roughness: 0.2,
                    metalness: 0.1
                  }))
                ]
              }}
              onSceneChange={(updatedScene) => {
                // Handle scene updates if needed
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default DesignStudio;
