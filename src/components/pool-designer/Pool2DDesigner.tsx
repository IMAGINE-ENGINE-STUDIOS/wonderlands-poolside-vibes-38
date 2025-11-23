import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Pool2DCanvas, type PoolPoint, type DeckPoint } from './Pool2DCanvas';
import { PoolShapeEditor } from './PoolShapeEditor';
import { DepthProfileEditor, type DepthPoint } from './DepthProfileEditor';
import { Maximize2, Minimize2, Layers, DollarSign, Save, Upload } from 'lucide-react';
import { paverTypes } from '@/data/paverData';
import { useToast } from '@/hooks/use-toast';

interface Pool2DDesignerProps {
  initialDimensions?: { width: number; length: number; depth: number };
  onDesignChange?: (design: {
    poolPoints: PoolPoint[];
    deckPoints: DeckPoint[];
    depthPoints: DepthPoint[];
    finish: string;
    paver: string;
    coping: string;
    deckWidth: number;
    copingWidth: number;
    measurements: {
      poolPerimeter: number;
      poolArea: number;
      deckArea: number;
    };
    costs: {
      poolCost: number;
      deckCost: number;
      copingCost: number;
      total: number;
    };
  }) => void;
  availableFinishes?: Array<{ id: string; name: string; image: string }>;
  availablePavers?: Array<{ id: string; name: string; image: string }>;
}

export function Pool2DDesigner({
  initialDimensions,
  onDesignChange,
  availableFinishes = [
    { id: 'aquamarine', name: 'Aquamarine', image: '/textures/finishes/aquamarine-g3.jpg' },
    { id: 'sapphire', name: 'Sapphire Blue', image: '/textures/finishes/sapphire-blue-g3.jpg' },
  ],
  availablePavers = paverTypes
}: Pool2DDesignerProps) {
  const { toast } = useToast();
  const scale = 10; // pixels per foot
  const gridSize = 20;

  // Responsive canvas size
  const [canvasSize, setCanvasSize] = useState({
    width: typeof window !== 'undefined' ? Math.min(window.innerWidth - 400, 1000) : 1000,
    height: typeof window !== 'undefined' ? Math.min(window.innerHeight - 200, 700) : 700
  });

  // Initialize pool points
  const getInitialPoolPoints = (): PoolPoint[] => {
    if (initialDimensions) {
      const poolWidth = initialDimensions.width * scale;
      const poolLength = initialDimensions.length * scale;
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;

      return [
        { x: centerX - poolLength / 2, y: centerY - poolWidth / 2, id: 'p1', type: 'linear' },
        { x: centerX + poolLength / 2, y: centerY - poolWidth / 2, id: 'p2', type: 'linear' },
        { x: centerX + poolLength / 2, y: centerY + poolWidth / 2, id: 'p3', type: 'linear' },
        { x: centerX - poolLength / 2, y: centerY + poolWidth / 2, id: 'p4', type: 'linear' },
      ];
    }

    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    return [
      { x: centerX - 150, y: centerY - 75, id: 'p1', type: 'linear' },
      { x: centerX + 150, y: centerY - 75, id: 'p2', type: 'linear' },
      { x: centerX + 150, y: centerY + 75, id: 'p3', type: 'linear' },
      { x: centerX - 150, y: centerY + 75, id: 'p4', type: 'linear' },
    ];
  };

  const [poolPoints, setPoolPoints] = useState<PoolPoint[]>(getInitialPoolPoints());
  const [deckPoints, setDeckPoints] = useState<DeckPoint[]>([]);
  const [depthPoints, setDepthPoints] = useState<DepthPoint[]>([
    { position: 0, depth: 3.6, id: 'd1' },
    { position: 0.33, depth: 4.6, id: 'd2' },
    { position: 0.67, depth: 5.6, id: 'd3' },
    { position: 1, depth: 6.6, id: 'd4' }
  ]);

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [selectedDepthPointId, setSelectedDepthPointId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [deckWidth, setDeckWidth] = useState(5); // feet
  const [copingWidth, setCopingWidth] = useState(1.1); // feet
  const [showGrid, setShowGrid] = useState(true);
  const [smoothCorners, setSmoothCorners] = useState(true);
  
  const [selectedFinishId, setSelectedFinishId] = useState(availableFinishes[0]?.id || 'aquamarine');
  const [selectedPaverId, setSelectedPaverId] = useState(availablePavers[0]?.id || 'appian-adobe');
  const [selectedCopingId, setSelectedCopingId] = useState(availablePavers[0]?.id || 'appian-adobe');

  // Pricing
  const POOL_COST_PER_SQFT = 190;
  const PAVER_COST_PER_SQFT = 15;
  const COPING_COST_PER_LINFT = 45;

  // Generate deck from pool
  const generateDeckPoints = useCallback((poolPts: PoolPoint[], deckWidthFeet: number): DeckPoint[] => {
    const xs = poolPts.map(p => p.x);
    const ys = poolPts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const deckWidthPx = deckWidthFeet * scale;

    return [
      { x: minX - deckWidthPx, y: minY - deckWidthPx, id: 'deck1' },
      { x: maxX + deckWidthPx, y: minY - deckWidthPx, id: 'deck2' },
      { x: maxX + deckWidthPx, y: maxY + deckWidthPx, id: 'deck3' },
      { x: minX - deckWidthPx, y: maxY + deckWidthPx, id: 'deck4' }
    ];
  }, [scale]);

  // Update deck when pool or deckWidth changes
  useEffect(() => {
    setDeckPoints(generateDeckPoints(poolPoints, deckWidth));
  }, [poolPoints, deckWidth, generateDeckPoints]);

  // Conversion functions
  const convertPixels = (pixels: number) => {
    const feet = pixels / scale;
    return unit === 'feet' ? feet : feet * 0.3048;
  };

  const convertArea = (areaInPixels: number) => {
    const areaInSqFt = areaInPixels / (scale * scale);
    return unit === 'feet' ? areaInSqFt : areaInSqFt * 0.09290304;
  };

  // Calculate measurements
  const measurements = useMemo(() => {
    // Pool perimeter
    let poolPerimeter = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      const dist = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
      poolPerimeter += dist;
    }

    // Pool area (shoelace formula)
    let poolArea = 0;
    for (let i = 0; i < poolPoints.length; i++) {
      const curr = poolPoints[i];
      const next = poolPoints[(i + 1) % poolPoints.length];
      poolArea += curr.x * next.y - next.x * curr.y;
    }
    poolArea = Math.abs(poolArea / 2);

    // Deck area
    let deckArea = 0;
    if (deckPoints.length >= 3) {
      for (let i = 0; i < deckPoints.length; i++) {
        const curr = deckPoints[i];
        const next = deckPoints[(i + 1) % deckPoints.length];
        deckArea += curr.x * next.y - next.x * curr.y;
      }
      deckArea = Math.abs(deckArea / 2) - poolArea;
    }

    return {
      poolPerimeter: convertPixels(poolPerimeter),
      poolArea: convertArea(poolArea),
      deckArea: convertArea(deckArea)
    };
  }, [poolPoints, deckPoints, unit, scale]);

  // Calculate costs
  const costs = useMemo(() => {
    const poolCost = measurements.poolArea * POOL_COST_PER_SQFT;
    const deckCost = measurements.deckArea * PAVER_COST_PER_SQFT;
    const copingCost = measurements.poolPerimeter * COPING_COST_PER_LINFT;

    return {
      poolCost,
      deckCost,
      copingCost,
      total: poolCost + deckCost + copingCost
    };
  }, [measurements]);

  // Emit design changes
  useEffect(() => {
    onDesignChange?.({
      poolPoints,
      deckPoints,
      depthPoints,
      finish: selectedFinishId,
      paver: selectedPaverId,
      coping: selectedCopingId,
      deckWidth,
      copingWidth,
      measurements,
      costs
    });
  }, [poolPoints, deckPoints, depthPoints, selectedFinishId, selectedPaverId, selectedCopingId, deckWidth, copingWidth, measurements, costs]);

  // Save design
  const saveDesign = () => {
    const designData = {
      poolPoints,
      deckPoints,
      depthPoints,
      finish: selectedFinishId,
      paver: selectedPaverId,
      coping: selectedCopingId,
      deckWidth,
      copingWidth,
      measurements,
      costs,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pool-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Design Saved",
      description: "Pool design has been downloaded successfully."
    });
  };

  return (
    <div className={isFullscreen ? "fixed inset-0 z-50 bg-background overflow-auto p-4" : "w-full"}>
      <Card className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 pb-3 border-b">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Pool Designer 2D</h2>
            {initialDimensions && (
              <Badge variant="secondary" className="text-xs">
                {initialDimensions.width}' × {initialDimensions.length}'
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={unit} onValueChange={(v) => setUnit(v as 'feet' | 'meters')}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feet">Feet</SelectItem>
                <SelectItem value="meters">Meters</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={saveDesign}>
              <Save className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] xl:grid-cols-[320px,1fr] gap-6">
          {/* Controls Panel */}
          <div className="space-y-4 max-h-[70vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
            <Tabs defaultValue="pool" className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs sm:text-sm">
                <TabsTrigger value="pool">Shape</TabsTrigger>
                <TabsTrigger value="depth">Depth</TabsTrigger>
                <TabsTrigger value="deck">Deck</TabsTrigger>
                <TabsTrigger value="cost">Cost</TabsTrigger>
              </TabsList>

              <TabsContent value="pool" className="space-y-4 mt-4">
                <PoolShapeEditor
                  poolPoints={poolPoints}
                  onChange={setPoolPoints}
                  selectedPointId={selectedPointId}
                  onSelectPoint={setSelectedPointId}
                  scale={scale}
                />
              </TabsContent>

              <TabsContent value="depth" className="space-y-4 mt-4">
                <DepthProfileEditor
                  depthPoints={depthPoints}
                  onChange={setDepthPoints}
                  selectedDepthPoint={selectedDepthPointId}
                  onSelectPoint={setSelectedDepthPointId}
                />
              </TabsContent>

              <TabsContent value="deck" className="space-y-4 mt-4">
                <Card className="p-3">
                  <h4 className="font-medium mb-3">Deck Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Deck Width: {deckWidth.toFixed(1)} ft</Label>
                      <Slider
                        value={[deckWidth]}
                        onValueChange={([v]) => setDeckWidth(v)}
                        min={3}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Coping Width: {copingWidth.toFixed(1)} ft</Label>
                      <Slider
                        value={[copingWidth]}
                        onValueChange={([v]) => setCopingWidth(v)}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Deck Area:</span>
                        <span>{measurements.deckArea.toFixed(1)} sq ft</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="cost" className="space-y-4 mt-4">
                <Card className="p-3">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cost Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pool Construction:</span>
                      <span className="font-medium">${costs.poolCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>({measurements.poolArea.toFixed(1)} sq ft × ${POOL_COST_PER_SQFT}/sq ft)</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Deck Pavers:</span>
                      <span className="font-medium">${costs.deckCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>({measurements.deckArea.toFixed(1)} sq ft × ${PAVER_COST_PER_SQFT}/sq ft)</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Coping:</span>
                      <span className="font-medium">${costs.copingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>({measurements.poolPerimeter.toFixed(1)} lin ft × ${COPING_COST_PER_LINFT}/lin ft)</span>
                    </div>

                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-primary">${costs.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Canvas */}
          <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4">
            <Pool2DCanvas
              width={canvasSize.width}
              height={canvasSize.height}
              poolPoints={poolPoints}
              deckPoints={deckPoints}
              scale={scale}
              gridSize={gridSize}
              onPoolPointsChange={setPoolPoints}
              onDeckPointsChange={setDeckPoints}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
              showGrid={showGrid}
              smoothCorners={smoothCorners}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
