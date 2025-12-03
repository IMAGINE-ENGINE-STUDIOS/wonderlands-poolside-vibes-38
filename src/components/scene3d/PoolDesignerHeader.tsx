import { useState, useMemo } from 'react';
import { Point } from './types';
import { Ruler, DollarSign, Calculator, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface PoolDesignerHeaderProps {
  poolPoints: Point[];
  poolDepth: number;
  deckWidth: number;
  copingWidth: number;
  poolPrice: number;
  paverPricePerSqft?: number;
  copingPricePerSqft?: number;
  additionalFeatures?: Array<{ name: string; price: number }>;
}

// Calculate pool area from points
function calculatePoolArea(points: Point[]): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

// Calculate pool perimeter
function calculatePerimeter(points: Point[]): number {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    perimeter += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }
  return perimeter;
}

// Calculate approximate dimensions (bounding box)
function calculateDimensions(points: Point[]): { width: number; length: number } {
  if (points.length === 0) return { width: 0, length: 0 };
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  return {
    width: Math.max(...xs) - Math.min(...xs),
    length: Math.max(...ys) - Math.min(...ys)
  };
}

export function PoolDesignerHeader({
  poolPoints,
  poolDepth,
  deckWidth,
  copingWidth,
  poolPrice,
  paverPricePerSqft = 20,
  copingPricePerSqft = 25,
  additionalFeatures = []
}: PoolDesignerHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const measurements = useMemo(() => {
    const poolArea = calculatePoolArea(poolPoints);
    const perimeter = calculatePerimeter(poolPoints);
    const { width, length } = calculateDimensions(poolPoints);
    
    // Deck area approximation (perimeter * deckWidth + corners)
    const deckArea = perimeter * deckWidth + Math.PI * deckWidth * deckWidth;
    
    // Coping area (perimeter * copingWidth)
    const copingArea = perimeter * copingWidth;
    
    // Water volume
    const waterVolume = poolArea * poolDepth;
    const gallons = waterVolume * 7.48; // cubic feet to gallons

    return {
      poolArea,
      perimeter,
      width,
      length,
      deckArea,
      copingArea,
      waterVolume,
      gallons
    };
  }, [poolPoints, poolDepth, deckWidth, copingWidth]);

  const costs = useMemo(() => {
    const deckCost = measurements.deckArea * paverPricePerSqft;
    const copingCost = measurements.copingArea * copingPricePerSqft;
    const featuresCost = additionalFeatures.reduce((sum, f) => sum + f.price, 0);
    const total = poolPrice + deckCost + copingCost + featuresCost;

    return {
      pool: poolPrice,
      deck: deckCost,
      coping: copingCost,
      features: featuresCost,
      total
    };
  }, [measurements, poolPrice, paverPricePerSqft, copingPricePerSqft, additionalFeatures]);

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Compact Header */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-6 px-4 py-2 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-6">
            {/* Pool Dimensions */}
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium">
                {measurements.width.toFixed(1)}' × {measurements.length.toFixed(1)}' × {poolDepth}'
              </span>
            </div>

            {/* Pool Area */}
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className="text-sm">
                {measurements.poolArea.toFixed(0)} sq ft
              </span>
            </div>

            {/* Total Cost */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600">
                ${costs.total.toLocaleString()}
              </span>
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Measurements Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Pool Area</div>
                <div className="text-sm font-medium">{measurements.poolArea.toFixed(0)} sq ft</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Perimeter</div>
                <div className="text-sm font-medium">{measurements.perimeter.toFixed(1)} ft</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Deck Area</div>
                <div className="text-sm font-medium">{measurements.deckArea.toFixed(0)} sq ft</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Water Volume</div>
                <div className="text-sm font-medium">{Math.round(measurements.gallons).toLocaleString()} gal</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Cost Breakdown</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pool</span>
                  <span>${costs.pool.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Deck ({measurements.deckArea.toFixed(0)} sq ft × ${paverPricePerSqft})
                  </span>
                  <span>${costs.deck.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Coping ({measurements.copingArea.toFixed(0)} sq ft × ${copingPricePerSqft})
                  </span>
                  <span>${costs.coping.toLocaleString()}</span>
                </div>
                
                {additionalFeatures.length > 0 && (
                  <>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Additional Features</div>
                    </div>
                    {additionalFeatures.map((feature, idx) => (
                      <div key={idx} className="flex justify-between pl-2">
                        <span className="text-muted-foreground">{feature.name}</span>
                        <span>${feature.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </>
                )}

                <div className="flex justify-between pt-2 border-t border-border font-semibold text-green-600">
                  <span>Total Estimate</span>
                  <span>${costs.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
