import { useState, useMemo, lazy, Suspense } from 'react';
import { Point } from './types';
import { ChevronDown, Lock, Unlock, Waves } from 'lucide-react';
import { getPaverPricePerSqFt, getCopingPricePerSqFtByName } from '@/utils/paverPricing';
import { WATERLINE_FLAT_PER_BODY } from '@/lib/design/board3DTakeoff';
import { enrichQuoteLines } from '@/lib/design/sceneQuoteCatalog';

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
  /** Exact drawn deck area (sq ft); when given it replaces the perimeter estimate */
  deckAreaSqFt?: number;
  /** Every paved deck on the board grouped by paver; when given, the deck line totals them all. */
  deckLines?: Array<{ name: string; areaSqFt: number; rate: number }>;
  /** Open the breakdown upward (bottom-docked mobile bar) — Imagine Engine Studios Corp */
  dropUp?: boolean;
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
  additionalBodies = [],
  deckAreaSqFt,
  deckLines,
  dropUp
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
    const deckArea = deckLines?.length ? deckLines.reduce((t, l) => t + l.areaSqFt, 0) : deckAreaSqFt ?? (perimeter * deckWidth + Math.PI * deckWidth * deckWidth);

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
  }, [poolPoints, poolDepth, deckWidth, copingWidth, deckAreaSqFt, deckLines]);

  // Store rates — derived from the actual products the user selected
  const rates = useMemo(() => {
    const shell = rateOverrides.shell ?? POOL_SHELL_PRICE_PER_SQFT;
    const deck = rateOverrides.deck ?? paverPricePerSqft ?? getPaverPricePerSqFt(paverName);
    const coping = rateOverrides.coping ?? copingPricePerSqft ?? getCopingPricePerSqFtByName(copingName);
    return { shell, deck, coping };
  }, [rateOverrides, paverName, copingName, paverPricePerSqft, copingPricePerSqft]);

  const costs = useMemo(() => {
    const pool = measurements.poolArea * rates.shell;
    const deckCost = deckLines?.length ? deckLines.reduce((t, l) => t + l.areaSqFt * l.rate, 0) : measurements.deckArea * rates.deck;
    const copingCost = measurements.copingArea * rates.coping;
    const bodiesCost = additionalBodies.reduce((sum, b) => sum + (rateOverrides[`body-${b.name}`] ?? b.price), 0);
    const featuresCost = additionalFeatures.reduce(
      (sum, f) => sum + (rateOverrides[`feature-${f.name}`] ?? f.price),
      0
    );
    // Main pool waterline: flat rate per pool/spa (extra bodies come in as feature lines).
    const waterline = waterlineName ? (rateOverrides.waterline ?? WATERLINE_FLAT_PER_BODY) : 0;
    const total = pool + deckCost + copingCost + featuresCost + bodiesCost + waterline;

    return { pool, deck: deckCost, coping: copingCost, features: featuresCost, bodies: bodiesCost, waterline, total };
  }, [measurements, rates, additionalFeatures, additionalBodies, rateOverrides, waterlineName, deckLines]);

  // Full itemization used for the quote document
  const quoteExtras = useMemo(() => {
    const breakdown: Array<{ name: string; price: number; image: string }> = [];
    if (deckLines?.length) deckLines.forEach(l => breakdown.push({ name: `${l.name} — ${Math.round(l.areaSqFt)} sq ft × $${l.rate}/sq ft`, price: Math.round(l.areaSqFt * l.rate), image: '' }));
    else breakdown.push({
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
    if (waterlineName) breakdown.push({ name: `Waterline Tile — ${waterlineName}`, price: Math.round(costs.waterline), image: '' });
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
        image: (f as { image?: string }).image || ''
      })
    );
    const enriched = enrichQuoteLines(breakdown);
    return {
      extrasBreakdown: enriched,
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

  // Editorial summary card — white, slate type, tabular numbers.
  const Line = ({ title, sub, detail, amount }: { title: string; sub?: string; detail: React.ReactNode; amount: React.ReactNode }) => (
    <div className="py-3 flex items-start justify-between gap-3">
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[13px] font-medium tracking-tight text-slate-900 leading-tight">{title}</span>
          {sub && <span className="text-[12px] text-slate-500">— {sub}</span>}
        </div>
        <span className="text-[11.5px] text-slate-500 mt-0.5 tabular-nums leading-tight flex items-center gap-1">{detail}</span>
      </div>
      <div className="shrink-0 text-right text-[13px] font-semibold tracking-tight text-slate-900 tabular-nums">{amount}</div>
    </div>
  );
  const Stat = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
    <div className="px-3 py-3 flex flex-col gap-0.5 min-w-0 overflow-hidden">
      <span className="text-[10px] font-semibold tracking-[0.07em] uppercase text-slate-400 leading-none whitespace-nowrap truncate">{label}</span>
      <span className="text-[13.5px] font-semibold tracking-tight text-slate-900 tabular-nums mt-1 truncate">{value} <span className="font-normal text-slate-500">{unit}</span></span>
    </div>
  );

  return (
    <div className="relative w-auto min-w-[260px] max-w-[calc(100vw-2rem)]">
      <div className={`w-full bg-white border border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden transition-[border-radius] ${isExpanded ? (dropUp ? "rounded-b-[20px] rounded-t-none border-t-slate-100" : "rounded-t-[20px] rounded-b-none border-b-slate-100") : "rounded-full"}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full h-10 px-2.5 flex items-center justify-between bg-white hover:bg-slate-50/50 transition-colors duration-200 group text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
              <Waves className="w-3.5 h-3.5 text-slate-700" strokeWidth={1.8} />
            </div>
            <span className="text-[13.5px] font-semibold tracking-tight text-slate-900 tabular-nums whitespace-nowrap truncate min-w-0">
              {measurements.width.toFixed(0)}' × {measurements.length.toFixed(0)}'
              <span className="text-slate-300 mx-1">·</span>
              {measurements.poolArea.toFixed(0)} sqft
              {/* Extra figures appear only when the screen has room — Imagine Engine Studios Corp */}
              <span className="hidden xl:inline"><span className="text-slate-300 mx-1">·</span>{measurements.perimeter.toFixed(0)} ft perim.</span>
              <span className="hidden xl:inline"><span className="text-slate-300 mx-1">·</span>{measurements.deckArea.toFixed(0)} sqft deck</span>
              <span className="hidden 2xl:inline"><span className="text-slate-300 mx-1">·</span>{Math.round(measurements.gallons).toLocaleString()} gal</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 pl-3">
            <span className="text-[14px] font-semibold tracking-tight text-slate-900 tabular-nums">{money(costs.total)}</span>
            <span className="w-6 h-6 rounded-full border border-slate-200 bg-white flex items-center justify-center">
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2.2} />
            </span>
          </div>
        </button>
      </div>

      {/* Breakdown drops down over the drawing board, never upward — Imagine Engine Studios Corp */}
      <div className={`absolute left-0 right-0 ${dropUp ? "bottom-full -mb-px" : "top-full -mt-px"} z-50 grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? '' : 'pointer-events-none'}`} style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}>
          <div className={`overflow-hidden bg-white ${dropUp ? "rounded-t-[20px]" : "rounded-b-[20px]"} ${isExpanded ? (dropUp ? "border border-b-0 border-slate-200/80 shadow-[0_-12px_32px_rgba(0,0,0,0.12)]" : "border border-t-0 border-slate-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.12)]") : ""}`}>
            <div className={`${dropUp ? "max-h-[calc(100vh-16rem)]" : "max-h-[calc(100vh-7rem)]"} overflow-y-auto`}>
            <div className="hidden border-slate-200/80 shadow-[0_12px_32px_rgba(0,0,0,0.12)]' : ''}`}>
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 divide-x divide-slate-100 bg-white">
                <Stat label="Pool Area" value={measurements.poolArea.toFixed(0)} unit="sq ft" />
                <Stat label="Perimeter" value={measurements.perimeter.toFixed(1)} unit="ft" />
                <Stat label="Deck Area" value={measurements.deckArea.toFixed(0)} unit="sq ft" />
                <Stat label="Water Volume" value={Math.round(measurements.gallons).toLocaleString()} unit="gal" />
              </div>

              <div className="px-4 pt-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold tracking-[0.06em] uppercase text-slate-400">Cost Breakdown</span>
                  {unlocked && <span className="text-[11px] text-slate-500 flex items-center gap-1"><Unlock className="w-3 h-3" />Editing</span>}
                </div>

                {showPasscode && !unlocked && (
                  <div className="flex items-center gap-2 my-2">
                    <input
                      type="password"
                      value={passcode}
                      placeholder="Passcode"
                      onChange={e => setPasscode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && tryUnlock()}
                      className="flex-1 h-9 px-3 text-[12.5px] rounded-[10px] border border-slate-200 bg-white text-slate-900"
                    />
                    <button onClick={tryUnlock} className="h-9 px-3 rounded-[10px] bg-slate-900 text-white text-[12.5px] font-semibold">Unlock</button>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  <Line title="Pool Shell" sub={finishName || undefined}
                    detail={<>{measurements.poolArea.toFixed(0)} sq ft × $<EditableRate id="shell" value={rates.shell} />/sq ft</>}
                    amount={money(costs.pool)} />
                  {deckLines?.length ? (
                    <div className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[13px] font-medium tracking-tight text-slate-900 leading-tight">Total Deck</span>
                          <span className="text-[11.5px] text-slate-500 mt-0.5 tabular-nums leading-tight">{measurements.deckArea.toFixed(0)} sq ft total paved area</span>
                        </div>
                        <div className="shrink-0 text-right text-[13px] font-semibold tracking-tight text-slate-900 tabular-nums">{money(costs.deck)}</div>
                      </div>
                      <ul className="mt-1.5 space-y-0.5 pl-2 border-l border-slate-200">
                        {deckLines.map(l => (
                          <li key={l.name} className="flex justify-between gap-2 text-[11.5px] text-slate-500 tabular-nums">
                            <span className="truncate">{l.name} · {Math.round(l.areaSqFt)} sq ft × ${l.rate}/sq ft</span>
                            <span className="text-slate-700">{money(l.areaSqFt * l.rate)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                  <Line title={paverName || 'Deck'}
                    detail={<>{measurements.deckArea.toFixed(0)} sq ft × $<EditableRate id="deck" value={rates.deck} />/sq ft</>}
                    amount={money(costs.deck)} />
                  )}
                  <Line title={copingName || 'Coping'}
                    detail={<>{measurements.copingArea.toFixed(0)} sq ft × $<EditableRate id="coping" value={rates.coping} />/sq ft</>}
                    amount={money(costs.coping)} />
                  {waterlineName && (
                    <Line title="Waterline Tile" sub={waterlineName} detail="Whole pool waterline · flat rate"
                      amount={<EditableAmount id="waterline" value={costs.waterline} />} />
                  )}
                  {additionalBodies.map(body => (
                    <Line key={body.name} title={body.name}
                      detail={<>{Math.round(body.areaSqFt)} sq ft{body.multiplierLabel ? ` · ${body.multiplierLabel}` : ''}</>}
                      amount={<EditableAmount id={`body-${body.name}`} value={rateOverrides[`body-${body.name}`] ?? body.price} />} />
                  ))}
                  {additionalFeatures.map((feature, idx) => (
                    <Line key={`${feature.name}-${idx}`} title={feature.name} detail="Additional feature"
                      amount={<EditableAmount id={`feature-${feature.name}`} value={rateOverrides[`feature-${feature.name}`] ?? feature.price} />} />
                  ))}
                </div>
              </div>

              <div className="mx-4 mt-1 mb-3 py-3 flex items-center justify-between border-t border-slate-200">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-900">Total</span>
                <span className="text-[16px] font-bold tracking-tight text-slate-900 tabular-nums">{money(costs.total)}</span>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => (unlocked ? setUnlocked(false) : setShowPasscode(v => !v))}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-[13.5px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {unlocked ? <Lock className="w-3.5 h-3.5" /> : null}
                  {unlocked ? 'Lock prices' : 'Edit prices'}
                </button>
                <button
                  onClick={() => setShowQuote(true)}
                  className="h-11 flex-[1.35] rounded-xl bg-slate-900 text-white text-[13.5px] font-semibold hover:bg-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.15)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.2)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  Generate Quote
                </button>
              </div>
              <div className="px-4 pb-4">
                <div className="rounded-[10px] bg-slate-50 border border-slate-100 px-3 py-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[11px] text-slate-500 leading-snug">Prices include installation and standard warranty</span>
                </div>
              </div>
            </div>
          </div>
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
            aboveDesigner
          />
        </Suspense>
      )}
    </div>
  );
}
