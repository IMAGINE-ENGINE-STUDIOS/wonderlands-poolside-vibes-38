import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, HardHat, Stamp, Ruler, Minus, Plus, Info, Printer } from 'lucide-react';
import EnclosureDrawingBoard, { EnclosureLayout, EnclosureTakeoff } from './EnclosureDrawingBoard';
import {
  DEFAULT_ENCLOSURE_CONFIG,
  ENCLOSURE_ADDONS,
  ENCLOSURE_DOORS,
  ENCLOSURE_EXTRUSIONS,
  ENCLOSURE_ROOFS,
  ENCLOSURE_SCREENS,
  ENCLOSURE_TYPES,
  EnclosureConfigState,
  buildEnclosureSpec,
  checkEnclosureCompliance,
  designPressurePsf,
  estimateEnclosure,
} from '@/data/screenEnclosureConfigurator';

const CACHE_KEY = 'wonderlands_enclosure_configurator_v1';

interface Props {
  /** Catalog $/sq ft rate for the selected screen enclosure product */
  baseRatePerSqFt?: number;
  /** Reports the fully configured project total so the studio can price it */
  onTotalChange?: (total: number, summary: { areaSqFt: number; perimeterFt: number; description: string }) => void;
}

const emptyLayout: EnclosureLayout = { points: [], closed: false, segmentKinds: {} };

const EnclosureConfigurator = ({ baseRatePerSqFt, onTotalChange }: Props) => {
  const [config, setConfig] = React.useState<EnclosureConfigState>({
    ...DEFAULT_ENCLOSURE_CONFIG,
    qualityRatePerSqFt: baseRatePerSqFt || DEFAULT_ENCLOSURE_CONFIG.qualityRatePerSqFt,
  });
  const [layout, setLayout] = React.useState<EnclosureLayout>(emptyLayout);
  const [manualArea, setManualArea] = React.useState('');
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.config) setConfig(prev => ({ ...prev, ...parsed.config }));
        if (parsed.layout) setLayout(parsed.layout);
        if (typeof parsed.manualArea === 'string') setManualArea(parsed.manualArea);
      }
    } catch {
      /* ignore corrupt cache */
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ config, layout, manualArea }));
      } catch {
        /* storage full */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [config, layout, manualArea]);

  // Keep the catalog rate in sync when the selected product changes
  React.useEffect(() => {
    if (!baseRatePerSqFt) return;
    setConfig(prev => (prev.qualityRatePerSqFt === baseRatePerSqFt ? prev : { ...prev, qualityRatePerSqFt: baseRatePerSqFt }));
  }, [baseRatePerSqFt]);

  const handleMeasure = React.useCallback((t: EnclosureTakeoff) => {
    setConfig(prev =>
      prev.areaSqFt === t.areaSqFt &&
      prev.perimeterFt === t.perimeterFt &&
      prev.screenWallFt === t.screenWallFt &&
      prev.longestSpanFt === t.longestSpanFt
        ? prev
        : {
            ...prev,
            areaSqFt: t.areaSqFt,
            perimeterFt: t.perimeterFt,
            screenWallFt: t.screenWallFt,
            longestSpanFt: t.longestSpanFt,
          }
    );
  }, []);

  const applyManual = () => {
    const area = parseFloat(manualArea) || 0;
    // Assume a near-square footprint for perimeter/span when entered numerically
    const side = Math.sqrt(area) || 0;
    setConfig(prev => ({
      ...prev,
      areaSqFt: Math.round(area),
      perimeterFt: Math.round(side * 4 * 10) / 10,
      screenWallFt: Math.round(side * 3 * 10) / 10,
      longestSpanFt: Math.round(side * 10) / 10,
    }));
  };

  const estimate = estimateEnclosure(config);
  const issues = checkEnclosureCompliance(config);
  const spec = buildEnclosureSpec(config);
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');
  const notes = issues.filter(i => i.level === 'info');
  const pressure = designPressurePsf(config);

  const totalRef = React.useRef(onTotalChange);
  totalRef.current = onTotalChange;
  React.useEffect(() => {
    const type = ENCLOSURE_TYPES.find(t => t.id === config.typeId);
    totalRef.current?.(estimate.total, {
      areaSqFt: config.areaSqFt,
      perimeterFt: config.perimeterFt,
      description: `${type?.label || 'Screen Enclosure'} — ${config.areaSqFt.toLocaleString()} sq ft`,
    });
  }, [estimate.total, config.areaSqFt, config.perimeterFt, config.typeId]);

  const setDoorQty = (id: string, delta: number) =>
    setConfig(prev => {
      const next = Math.max(0, (prev.doors[id] || 0) + delta);
      const doors = { ...prev.doors };
      if (next === 0) delete doors[id];
      else doors[id] = next;
      return { ...prev, doors };
    });

  const toggleAddOn = (id: string) =>
    setConfig(prev => ({
      ...prev,
      addOns: prev.addOns.includes(id) ? prev.addOns.filter(a => a !== id) : [...prev.addOns, id],
    }));

  return (
    <Tabs defaultValue="customer" className="w-full space-y-5">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="customer" className="text-xs">
          <Ruler className="h-3.5 w-3.5 mr-1" /> Customer Tools
        </TabsTrigger>
        <TabsTrigger value="pro" className="text-xs">
          <HardHat className="h-3.5 w-3.5 mr-1" /> Contractor &amp; Project Tools
        </TabsTrigger>
      </TabsList>

      <TabsContent value="customer" className="space-y-5 mt-0">
      {/* Take-off board */}
      <Card>
        <CardContent className="pt-5 space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" /> 2D Enclosure Take-Off (Top View)
              </h4>
              <p className="text-xs text-muted-foreground">
                Draw the enclosure footprint at 10 px = 1 ft, then tag door bays and the house-attached wall.
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Or enter area (sq ft)</Label>
                <Input
                  type="number"
                  min={0}
                  value={manualArea}
                  onChange={e => setManualArea(e.target.value)}
                  className="w-32 h-9"
                  placeholder="e.g. 620"
                />
              </div>
              <Button size="sm" variant="outline" onClick={applyManual}>
                Apply
              </Button>
            </div>
          </div>
          <EnclosureDrawingBoard layout={layout} onChange={setLayout} onMeasure={handleMeasure} />
        </CardContent>
      </Card>

      {/* Structure configuration */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <h4 className="text-sm font-semibold">Structure & Materials</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Enclosure type</Label>
              <Select value={config.typeId} onValueChange={v => setConfig(p => ({ ...p, typeId: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCLOSURE_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">{estimate.type.description}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Roof assembly</Label>
              <Select value={config.roofId} onValueChange={v => setConfig(p => ({ ...p, roofId: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCLOSURE_ROOFS.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                      {r.pricePerSqFt > 0 ? ` (+$${r.pricePerSqFt}/sq ft)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">{estimate.roof.description}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Framing extrusion</Label>
              <Select value={config.extrusionId} onValueChange={v => setConfig(p => ({ ...p, extrusionId: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCLOSURE_EXTRUSIONS.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.label} — span {e.maxSpanFt} ft
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">{estimate.extrusion.description}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Screen fabric</Label>
              <Select value={config.screenId} onValueChange={v => setConfig(p => ({ ...p, screenId: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENCLOSURE_SCREENS.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.brand} — {s.label}
                      {s.pricePerSqFt > 0 ? ` (+$${s.pricePerSqFt}/sq ft)` : ' (included)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">{estimate.screen.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <Badge variant="secondary" className="text-[10px]">{estimate.screen.mesh}</Badge>
                {estimate.screen.warrantyYears && (
                  <Badge variant="outline" className="text-[10px]">{estimate.screen.warrantyYears}-yr warranty</Badge>
                )}
              </div>
            </div>

          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Wall height (ft)</Label>
              <Input
                type="number"
                min={4}
                max={24}
                value={config.wallHeightFt}
                onChange={e => setConfig(p => ({ ...p, wallHeightFt: parseFloat(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mean roof height (ft)</Label>
              <Input
                type="number"
                min={4}
                max={30}
                value={config.meanRoofHeightFt}
                onChange={e => setConfig(p => ({ ...p, meanRoofHeightFt: parseFloat(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Roof pitch</Label>
              <Select value={config.roofPitch} onValueChange={v => setConfig(p => ({ ...p, roofPitch: v }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['1:12', '2:12', '3:12', '4:12', '5:12'].map(p => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Design wind speed (mph)</Label>
              <Select value={String(config.windSpeedMph)} onValueChange={v => setConfig(p => ({ ...p, windSpeedMph: parseInt(v, 10) }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[130, 140, 150, 160, 170, 180, 195].map(w => (
                    <SelectItem key={w} value={String(w)}>
                      {w} mph
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Exposure category</Label>
              <Select value={config.exposure} onValueChange={v => setConfig(p => ({ ...p, exposure: v as 'B' | 'C' | 'D' }))}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B — suburban / wooded</SelectItem>
                  <SelectItem value="C">C — open terrain</SelectItem>
                  <SelectItem value="D">D — coastal / water exposure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Screen bottom gap (in)</Label>
              <Input
                type="number"
                min={0}
                max={12}
                value={config.screenBottomGapIn}
                onChange={e => setConfig(p => ({ ...p, screenBottomGapIn: parseFloat(e.target.value) || 0 }))}
                className="h-9"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">HVHZ jurisdiction</p>
                <p className="text-[11px] text-muted-foreground">Miami-Dade / Broward — NOA approved assemblies</p>
              </div>
              <Switch checked={config.hvhz} onCheckedChange={v => setConfig(p => ({ ...p, hvhz: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Enclosure is the pool barrier</p>
                <p className="text-[11px] text-muted-foreground">Applies FBC-R R4501.17 barrier checks</p>
              </div>
              <Switch checked={config.isPoolBarrier} onCheckedChange={v => setConfig(p => ({ ...p, isPoolBarrier: v }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doors + add-ons */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <h4 className="text-sm font-semibold">Doors & Hardware</h4>
          <div className="space-y-2">
            {ENCLOSURE_DOORS.map(door => (
              <div key={door.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium flex flex-wrap items-center gap-2">
                    {door.label}
                    {door.selfLatching && (
                      <Badge className="text-[10px]">Self-closing / self-latching</Badge>
                    )}
                    {door.barrierEligible ? (
                      <Badge variant="secondary" className="text-[10px]">Barrier eligible</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Not a barrier door</Badge>
                    )}
                  </p>

                  <p className="text-[11px] text-muted-foreground">{door.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">${door.price.toLocaleString()}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setDoorQty(door.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{config.doors[door.id] || 0}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setDoorQty(door.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />
          <h4 className="text-sm font-semibold">Add-Ons & Site Work</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {ENCLOSURE_ADDONS.map(addon => (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddOn(addon.id)}
                className={`text-left rounded-md border p-3 transition-colors ${
                  config.addOns.includes(addon.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                }`}
              >
                <p className="text-sm font-medium flex items-center gap-2">
                  {addon.label}
                  {addon.codeRequired && (
                    <Badge variant="secondary" className="text-[10px]">Code</Badge>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground">{addon.description}</p>
                <p className="text-[11px] font-semibold mt-1">
                  ${addon.price.toLocaleString()}
                  {addon.pricing === 'sqft' ? ' / sq ft' : addon.pricing === 'linear-ft' ? ' / ft' : ' each'}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Stamp className="h-4 w-4 text-primary" /> Florida Code Review
          </h4>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Configuration passes the automated FBC checks.
            </div>
          ) : (
            <div className="space-y-2">
              {[...errors, ...warnings, ...notes].map((issue, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border border-border p-2.5">
                  {issue.level === 'error' ? (
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                  ) : issue.level === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-semibold">{issue.code}</p>
                    <p className="text-xs text-muted-foreground">{issue.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Design pressure {pressure} psf • {config.windSpeedMph} mph • Exposure {config.exposure}
            {config.hvhz ? ' • HVHZ' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Estimate */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Customer Price — Turnkey Installed</h4>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print spec sheet
            </Button>
          </div>
          {estimate.lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Draw or enter the enclosure area to generate the estimate.</p>
          ) : (
            <div className="space-y-1.5">
              {estimate.lines.map((line, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{line.label}</p>
                    <p className="text-[11px] text-muted-foreground">{line.detail}</p>
                  </div>
                  <span className="font-semibold shrink-0">${line.amount.toLocaleString()}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Contract Total</span>
                <span className="text-lg font-bold">${estimate.total.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                ${estimate.pricePerSqFt.toFixed(2)}/sq ft installed — includes materials, freight, installation labor,
                parts, engineered drawings, permit fees and inspections. Florida market range for this scope is $
                {estimate.marketRange.low}–${estimate.marketRange.high}/sq ft.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contractor cost model */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Contractor Cost Model (internal)</h4>
            {estimate.total > 0 && (
              <Badge
                variant={estimate.competitiveness === 'competitive' ? 'secondary' : 'outline'}
                className="text-[10px]"
              >
                {estimate.competitiveness === 'competitive'
                  ? 'Competitive for Florida'
                  : estimate.competitiveness === 'below'
                    ? 'Below market — check margin'
                    : 'Above market — may lose bids'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Company overhead %</Label>
              <Input
                type="number"
                min={0}
                max={40}
                step={0.5}
                value={config.overheadPct ?? 12}
                onChange={e => setConfig(prev => ({ ...prev, overheadPct: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-[10px] text-muted-foreground">Office, trucks, admin, marketing, licensing.</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Target gross margin %</Label>
              <Input
                type="number"
                min={0}
                max={60}
                step={1}
                value={config.targetMarginPct ?? 32}
                onChange={e => setConfig(prev => ({ ...prev, targetMarginPct: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-[10px] text-muted-foreground">Profit kept after cost + overhead.</p>
            </div>
          </div>

          {estimate.costLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Enter the footprint to build the cost estimate.</p>
          ) : (
            <>
              <div className="space-y-1.5">
                {estimate.costLines.map((line, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        <span className="text-muted-foreground">{line.category}:</span> {line.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{line.detail}</p>
                    </div>
                    <span className="font-semibold shrink-0">${line.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(estimate.categoryTotals).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-semibold">${amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Direct job cost</span>
                  <span className="font-semibold">${estimate.directCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Overhead ({estimate.overheadPct}%)</span>
                  <span className="font-semibold">${estimate.overhead.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Break-even</span>
                  <span className="font-semibold">
                    ${estimate.costBasis.toLocaleString()} (${estimate.breakEvenPerSqFt.toFixed(2)}/sq ft)
                  </span>
                </div>
                <div className="flex items-center justify-between text-primary">
                  <span className="font-semibold">Gross profit ({estimate.marginPct}%)</span>
                  <span className="font-bold">${estimate.profit.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Take-off used: {estimate.framedArea.toLocaleString()} sq ft framed surface,{' '}
                {estimate.screenedArea.toLocaleString()} sq ft screened, {estimate.roofArea.toLocaleString()} sq ft roof.
                {estimate.sealedRequired ? ' Sealed P.E. drawings priced in.' : ' Master-sealed drawing package priced in.'}
              </p>
            </>
          )}
        </CardContent>
      </Card>


      {/* Spec sheets */}
      <Tabs defaultValue="installer" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="installer" className="text-xs">
            <HardHat className="h-3.5 w-3.5 mr-1" /> Installer
          </TabsTrigger>
          <TabsTrigger value="architect" className="text-xs">
            <Ruler className="h-3.5 w-3.5 mr-1" /> Architect / Engineer
          </TabsTrigger>
          <TabsTrigger value="permit" className="text-xs">
            <Stamp className="h-3.5 w-3.5 mr-1" /> Permit
          </TabsTrigger>
        </TabsList>
        {(['installer', 'architect', 'permit'] as const).map(key => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardContent className="pt-5 space-y-2">
                {spec[key].map((row, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,140px)_1fr] gap-3 text-xs border-b border-border/60 pb-1.5 last:border-0">
                    <span className="font-semibold">{row.label}</span>
                    <span className="text-muted-foreground">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EnclosureConfigurator;
