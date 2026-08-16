import { useState, useMemo, lazy, Suspense } from 'react';
import { Point } from './types';
import { Ruler, DollarSign, Calculator, ChevronDown, ChevronUp, Layers, Lock, Unlock, FileText } from 'lucide-react';
import { getPaverPricePerSqFt, getCopingPricePerSqFtByName } from '@/utils/paverPricing';

const SurveyQuoteTool = lazy(() => import('@/components/SurveyQuoteTool'));

/** Shell price per square foot for a custom-designed pool */
export const POOL_SHELL_PRICE_PER_SQFT = 250;
const EDIT_PASSCODE = 'WONDERMAGIC';

interface PoolDesignerHeaderProps {
  poolPoints: Point[];
  poolDepth: number;
  deckWidth: number;
  copingWidth: number;
  poolPrice: number;
  /** Selected deck paver product name (store catalog) */
  paverName?: string;
  /** Selected coping product name (store catalog) */
  copingName?: string;
  /** Selected interior finish product name */
  finishName?: string;
  /** Selected waterline tile product name */
  waterlineName?: string;
  paverPricePerSqft?: number;
  copingPricePerSqft?: number;
  additionalFeatures?: Array<{ name: string; price: number }>;
  /** Additional water bodies (spas / tanning ledges / extra pools) */
  additionalBodies?: Array<{ name: string; areaSqFt: number; multiplierLabel?: string; price: number }>;
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

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function PoolDesignerHeader({
  poolPoints,
  poolDepth,
  deckWidth,
  copingWidth,
  poolPrice,
  paverName,
  copingName,
  finishName,
  waterlineName,
  paverPricePerSqft,
  copingPricePerSqft,
  additionalFeatures = [],
  additionalBodies = []
}: PoolDesignerHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  // Manual rate overrides (passcode protected)
  const [rateOverrides, setRateOverrides] = useState<Record<string, number>>({});

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

  // Store rates — derived from the actual products the user selected
  const rates = useMemo(() => {
    const shell = rateOverrides.shell ?? POOL_SHELL_PRICE_PER_SQFT;
    const deck = rateOverrides.deck ?? paverPricePerSqft ?? getPaverPricePerSqFt(paverName);
    const coping = rateOverrides.coping ?? copingPricePerSqft ?? getCopingPricePerSqFtByName(copingName);
    return { shell, deck, coping };
  }, [rateOverrides, paverName, copingName, paverPricePerSqft, copingPricePerSqft]);

  const costs = useMemo(() => {
    const pool = measurements.poolArea * rates.shell;
    const deckCost = measurements.deckArea * rates.deck;
    const copingCost = measurements.copingArea * rates.coping;
    const bodiesCost = additionalBodies.reduce((sum, b) => sum + (rateOverrides[`body-${b.name}`] ?? b.price), 0);
    const featuresCost = additionalFeatures.reduce(
      (sum, f) => sum + (rateOverrides[`feature-${f.name}`] ?? f.price),
      0
    );
    const total = pool + deckCost + copingCost + featuresCost + bodiesCost;

    return { pool, deck: deckCost, coping: copingCost, features: featuresCost, bodies: bodiesCost, total };
  }, [measurements, rates, additionalFeatures, additionalBodies, rateOverrides]);

  // Full itemization used for the quote document
  const quoteExtras = useMemo(() => {
    const breakdown: Array<{ name: string; price: number; image: string }> = [];
    breakdown.push({
      name: `${paverName || 'Deck'} — ${Math.round(measurements.deckArea)} sq ft × $${rates.deck}/sq ft`,
      price: Math.round(costs.deck),
      image: ''
    });
    breakdown.push({
      name: `${copingName || 'Coping'} — ${Math.round(measurements.copingArea)} sq ft × $${rates.coping}/sq ft`,
      price: Math.round(costs.coping),
      image: ''
    });
    if (finishName) breakdown.push({ name: `Interior Finish — ${finishName}`, price: 0, image: '' });
    if (waterlineName) breakdown.push({ name: `Waterline Tile — ${waterlineName}`, price: 0, image: '' });
    additionalBodies.forEach(b =>
      breakdown.push({
        name: `${b.name} — ${Math.round(b.areaSqFt)} sq ft${b.multiplierLabel ? ` (${b.multiplierLabel})` : ''}`,
        price: Math.round(rateOverrides[`body-${b.name}`] ?? b.price),
        image: ''
      })
    );
    additionalFeatures.forEach(f =>
      breakdown.push({
        name: f.name,
        price: Math.round(rateOverrides[`feature-${f.name}`] ?? f.price),
        image: ''
      })
    );
    return {
      extrasBreakdown: breakdown,
      extrasTotal: breakdown.reduce((s, l) => s + l.price, 0),
      squareFootage: Math.round(measurements.poolArea),
      pricePerSqFt: rates.shell
    };
  }, [
    measurements,
    rates,
    costs,
    paverName,
    copingName,
    finishName,
    waterlineName,
    additionalFeatures,
    additionalBodies,
    rateOverrides
  ]);

  const tryUnlock = () => {
    if (passcode.trim().toUpperCase() === EDIT_PASSCODE) {
      setUnlocked(true);
      setShowPasscode(false);
    }
    setPasscode('');
  };

  const EditableRate = ({ id, value }: { id: string; value: number }) =>
    unlocked ? (
      <input
        type="number"
        value={value}
        onChange={e => setRateOverrides(prev => ({ ...prev, [id]: Number(e.target.value) }))}
        className="w-16 px-1 py-0.5 rounded border border-border bg-background text-right text-xs"
      />
    ) : (
      <span>${value}</span>
    );

  const EditableAmount = ({ id, value }: { id: string; value: number }) =>
    unlocked ? (
      <input
        type="number"
        value={Math.round(value)}
        onChange={e => setRateOverrides(prev => ({ ...prev, [id]: Number(e.target.value) }))}
        className="w-24 px-1 py-0.5 rounded border border-border bg-background text-right text-xs"
      />
    ) : (
      <span>{money(value)}</span>
    );

  return (
    <div className="relative max-w-[280px] md:max-w-none">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Compact Header - inline */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-2 md:gap-4 px-2 md:px-3 py-1.5 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            {/* Pool Dimensions */}
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-500" />
              <span className="text-[10px] md:text-xs font-medium whitespace-nowrap">
                {measurements.width.toFixed(0)}' × {measurements.length.toFixed(0)}'
              </span>
            </div>

            {/* Pool Area - hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1">
              <Layers className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" />
              <span className="text-[10px] md:text-xs whitespace-nowrap">
                {measurements.poolArea.toFixed(0)} sqft
              </span>
            </div>

            {/* Total Cost */}
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-500" />
              <span className="text-[10px] md:text-xs font-semibold text-green-600 whitespace-nowrap">
                {money(costs.total)}
              </span>
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground flex-shrink-0" />
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Cost Breakdown</span>
                </div>
                <button
                  onClick={() => (unlocked ? setUnlocked(false) : setShowPasscode(v => !v))}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  title={unlocked ? 'Lock pricing' : 'Unlock pricing with passcode'}
                >
                  {unlocked ? <Unlock className="w-3.5 h-3.5 text-green-600" /> : <Lock className="w-3.5 h-3.5" />}
                  {unlocked ? 'Editing' : 'Edit prices'}
                </button>
              </div>

              {showPasscode && !unlocked && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="password"
                    value={passcode}
                    placeholder="Passcode"
                    onChange={e => setPasscode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && tryUnlock()}
                    className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background"
                  />
                  <button
                    onClick={tryUnlock}
                    className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground"
                  >
                    Unlock
                  </button>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Pool Shell ({measurements.poolArea.toFixed(0)} sq ft × <EditableRate id="shell" value={rates.shell} />
                    /sq ft){finishName ? ` — ${finishName}` : ''}
                  </span>
                  <span>{money(costs.pool)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {paverName || 'Deck'} ({measurements.deckArea.toFixed(0)} sq ft ×{' '}
                    <EditableRate id="deck" value={rates.deck} />/sq ft)
                  </span>
                  <span>{money(costs.deck)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {copingName || 'Coping'} ({measurements.copingArea.toFixed(0)} sq ft ×{' '}
                    <EditableRate id="coping" value={rates.coping} />/sq ft)
                  </span>
                  <span>{money(costs.coping)}</span>
                </div>
                {waterlineName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waterline Tile — {waterlineName}</span>
                    <span className="text-xs text-muted-foreground">Included</span>
                  </div>
                )}

                {additionalBodies.length > 0 && (
                  <>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Additional Water Bodies</div>
                    </div>
                    {additionalBodies.map(body => (
                      <div key={body.name} className="flex justify-between items-center pl-2">
                        <span className="text-muted-foreground">
                          {body.name} ({Math.round(body.areaSqFt)} sq ft
                          {body.multiplierLabel ? `, ${body.multiplierLabel}` : ''})
                        </span>
                        <EditableAmount id={`body-${body.name}`} value={rateOverrides[`body-${body.name}`] ?? body.price} />
                      </div>
                    ))}
                  </>
                )}

                {additionalFeatures.length > 0 && (
                  <>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Additional Features</div>
                    </div>
                    {additionalFeatures.map((feature, idx) => (
                      <div key={`${feature.name}-${idx}`} className="flex justify-between items-center pl-2">
                        <span className="text-muted-foreground">{feature.name}</span>
                        <EditableAmount
                          id={`feature-${feature.name}`}
                          value={rateOverrides[`feature-${feature.name}`] ?? feature.price}
                        />
                      </div>
                    ))}
                  </>
                )}

                <div className="flex justify-between pt-2 border-t border-border font-semibold text-green-600">
                  <span>Total Estimate</span>
                  <span>{money(costs.total)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowQuote(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
              >
                <FileText className="w-4 h-4" />
                Generate Quote
              </button>
            </div>
          </div>
        )}
      </div>

      {showQuote && (
        <Suspense fallback={null}>
          <SurveyQuoteTool
            pool={null}
            isOpen={showQuote}
            onClose={() => setShowQuote(false)}
            customProduct={{
              name: `Custom Pool Design — ${measurements.width.toFixed(0)}' × ${measurements.length.toFixed(0)}'`,
              price: Math.round(costs.pool),
              type: 'pool'
            }}
            extras={quoteExtras}
          />
        </Suspense>
      )}
    </div>
  );
}
