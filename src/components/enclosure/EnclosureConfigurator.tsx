import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, HardHat, Stamp, Ruler, Minus, Plus, Info, Printer } from 'lucide-react';
import EnclosureDrawingBoard, {
  EnclosureLayout,
  EnclosureTakeoff,
  migrateEnclosureLayout,
  countDrawnDoors,
  addDoorToLongestWall,
  removeDrawnDoorsOfType,
  swapDrawnDoorType,
} from './EnclosureDrawingBoard';
import {
  DEFAULT_ENCLOSURE_CONFIG,
  ENCLOSURE_ADDONS,
  ENCLOSURE_DOORS,
  ENCLOSURE_EXTRUSIONS,
  ENCLOSURE_ROOFS,
  ENCLOSURE_SCREENS,
  ENCLOSURE_TYPES,
  EnclosureConfigState,
  EnclosureProject,
  buildEnclosureSpec,
  checkEnclosureCompliance,
  designPressurePsf,
  estimateEnclosure,
} from '@/data/screenEnclosureConfigurator';

const CACHE_KEY = 'wonderlands_enclosure_configurator_v1';

export interface EnclosureEditApi {
  /** Swap the selected option of an element (structure, roof, extrusion, screen, door) */
  setElementOption: (key: string, optionId: string) => void;
  /** Remove a removable element (door line, add-on) */
  removeElement: (key: string) => void;
  /** Set the quantity of a door element */
  setElementQuantity: (key: string, quantity: number) => void;
}

interface Props {
  /** Catalog $/sq ft rate for the selected screen enclosure product */
  baseRatePerSqFt?: number;
  /** Reports the fully configured project total so the studio can price it */
  onTotalChange?: (total: number, summary: { areaSqFt: number; perimeterFt: number; description: string }) => void;
  /** Reports the full, itemized project (elements, specs, compliance, footprint snapshot) */
  onProjectChange?: (project: EnclosureProject) => void;
  /** Exposes an imperative editing API so the cart can change the configuration */
  onApiReady?: (api: EnclosureEditApi) => void;
}

const emptyLayout: EnclosureLayout = { points: [], closed: false, features: {} };

const EnclosureConfigurator = ({ baseRatePerSqFt, onTotalChange, onProjectChange, onApiReady }: Props) => {
  const [config, setConfig] = React.useState<EnclosureConfigState>({
    ...DEFAULT_ENCLOSURE_CONFIG,
    qualityRatePerSqFt: baseRatePerSqFt || DEFAULT_ENCLOSURE_CONFIG.qualityRatePerSqFt,
  });
  const [layout, setLayout] = React.useState<EnclosureLayout>(emptyLayout);
  const [manualArea, setManualArea] = React.useState('');
  const [snapshot, setSnapshot] = React.useState<string | null>(null);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.config) setConfig(prev => ({ ...prev, ...parsed.config }));
      if (parsed.layout) setLayout(migrateEnclosureLayout(parsed.layout));
      if (typeof parsed.manualArea === 'string') setManualArea(parsed.manualArea);
      if (typeof parsed.snapshot === 'string') setSnapshot(parsed.snapshot);
      }
    } catch {
      /* ignore corrupt cache */
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ config, layout, manualArea, snapshot }));
      } catch {
        // Storage full — keep the configuration and drop only the image
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ config, layout, manualArea }));
        } catch {
          /* storage unavailable */
        }
      }
    }, 400);
    return () => clearTimeout(t);
  }, [config, layout, manualArea, snapshot]);

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

  // ---- report the full, itemized project (cart + quote) ----
  const projectRef = React.useRef(onProjectChange);
  projectRef.current = onProjectChange;
  const project: EnclosureProject = {
    total: estimate.total,
    areaSqFt: config.areaSqFt,
    perimeterFt: config.perimeterFt,
    description: `${estimate.type.label} — ${config.areaSqFt.toLocaleString()} sq ft footprint`,
    typeLabel: estimate.type.label,
    roofLabel: estimate.roof.label,
    extrusionLabel: estimate.extrusion.label,
    screenLabel: `${estimate.screen.brand} ${estimate.screen.label}`,
    elements: estimate.elements,
    spec,
    compliance: issues,
    header: {
      framedAreaSqFt: estimate.framedArea,
      screenedAreaSqFt: estimate.screenedArea,
      screenWallFt: config.screenWallFt,
      longestSpanFt: config.longestSpanFt,
      wallHeightFt: config.wallHeightFt,
      meanRoofHeightFt: config.meanRoofHeightFt,
      windSpeedMph: config.windSpeedMph,
      exposure: config.exposure,
      hvhz: config.hvhz,
      designPressurePsf: pressure,
      sealedRequired: estimate.sealedRequired,
      isPoolBarrier: config.isPoolBarrier,
      doorCount: estimate.doorCount,
      pricePerSqFt: estimate.pricePerSqFt,
    },
    snapshot,
  };
  const projectKey = JSON.stringify(project);
  React.useEffect(() => {
    projectRef.current?.(JSON.parse(projectKey) as EnclosureProject);
  }, [projectKey]);

  // ---- imperative editing API used by the shopping cart ----
  const apiRef = React.useRef(onApiReady);
  apiRef.current = onApiReady;
  React.useEffect(() => {
    apiRef.current?.({
      setElementOption: (key, optionId) => {
        setConfig(prev => {
          if (key === 'structure') return { ...prev, typeId: optionId };
          if (key === 'roof') return { ...prev, roofId: optionId };
          if (key === 'extrusion') return { ...prev, extrusionId: optionId };
          if (key === 'screen') return { ...prev, screenId: optionId };
          if (key.startsWith('door:')) {
            const fromId = key.slice(5);
            if (fromId === optionId) return prev;
            const qty = prev.doors[fromId] || 0;
            const doors = { ...prev.doors };
            delete doors[fromId];
            doors[optionId] = (doors[optionId] || 0) + qty;
            return { ...prev, doors };
          }
          return prev;
        });
      },
      removeElement: key => {
        setConfig(prev => {
          if (key.startsWith('door:')) {
            const doors = { ...prev.doors };
            delete doors[key.slice(5)];
            return { ...prev, doors };
          }
          if (key.startsWith('addon:')) {
            const id = key.slice(6);
            return { ...prev, addOns: prev.addOns.filter(a => a !== id) };
          }
          return prev;
        });
      },
      setElementQuantity: (key, quantity) => {
        if (!key.startsWith('door:')) return;
        const id = key.slice(5);
        setConfig(prev => {
          const doors = { ...prev.doors };
          if (quantity <= 0) delete doors[id];
          else doors[id] = quantity;
          return { ...prev, doors };
        });
      },
    });
  }, []);



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

  const typeLabel = ENCLOSURE_TYPES.find(t => t.id === config.typeId)?.label || 'Screen Enclosure';

  return (
    <Tabs defaultValue="customer" className="w-full space-y-6">
      {/* Proposal header */}
      <div className="quote-sheet rounded-2xl px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="quote-eyebrow">Wonderlands World • Screen Enclosure Proposal</p>
            <h3 className="mt-1.5 text-xl sm:text-2xl font-semibold tracking-tight truncate">{typeLabel}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Turnkey design, engineering, permitting and installation — prepared for your property in Florida.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="quote-eyebrow">Estimated investment</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
              ${estimate.total.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {config.areaSqFt ? `${config.areaSqFt.toLocaleString()} sq ft • $${estimate.pricePerSqFt.toFixed(2)}/sq ft` : 'Draw or enter an area'}
            </p>
          </div>
        </div>
        <div className="quote-rule my-4" />
        <TabsList className="grid grid-cols-2 w-full glass-tile p-1 h-auto">
          <TabsTrigger value="customer" className="text-xs py-2">
            <Ruler className="h-3.5 w-3.5 mr-1" /> Your Proposal
          </TabsTrigger>
          <TabsTrigger value="pro" className="text-xs py-2">
            <HardHat className="h-3.5 w-3.5 mr-1" /> Contractor &amp; Project Tools
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="customer" className="space-y-6 mt-0">
      {/* Take-off board */}
      <section className="glass-panel rounded-2xl p-5 space-y-4">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="quote-eyebrow">Section 01</p>
              <h4 className="text-sm font-semibold flex items-center gap-2 mt-1">
                <Ruler className="h-4 w-4 text-primary" /> Footprint &amp; Measurements
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
                  className="w-32 h-9 glass-tile"
                  placeholder="e.g. 620"
                />
              </div>
              <Button size="sm" variant="outline" onClick={applyManual}>
                Apply
              </Button>
            </div>
          </div>
          <EnclosureDrawingBoard layout={layout} onChange={setLayout} onMeasure={handleMeasure} onSnapshot={setSnapshot} />
      </section>

      {/* Structure configuration */}
      <section className="glass-panel rounded-2xl p-5 space-y-4">
          <div>
            <p className="quote-eyebrow">Section 02</p>
            <h4 className="text-sm font-semibold mt-1">Structure &amp; Materials</h4>
          </div>
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
            <div className="flex items-center justify-between rounded-xl glass-tile p-3">
              <div>
                <p className="text-sm font-medium">HVHZ jurisdiction</p>
                <p className="text-[11px] text-muted-foreground">Miami-Dade / Broward — NOA approved assemblies</p>
              </div>
              <Switch checked={config.hvhz} onCheckedChange={v => setConfig(p => ({ ...p, hvhz: v }))} />
            </div>
            <div className="flex items-center justify-between rounded-xl glass-tile p-3">
              <div>
                <p className="text-sm font-medium">Enclosure is the pool barrier</p>
                <p className="text-[11px] text-muted-foreground">Applies FBC-R R4501.17 barrier checks</p>
              </div>
              <Switch checked={config.isPoolBarrier} onCheckedChange={v => setConfig(p => ({ ...p, isPoolBarrier: v }))} />
            </div>
          </div>
      </section>

      {/* Doors + add-ons */}
      <section className="glass-panel rounded-2xl p-5 space-y-4">
          <div>
            <p className="quote-eyebrow">Section 03</p>
            <h4 className="text-sm font-semibold mt-1">Doors &amp; Hardware</h4>
          </div>
          <div className="space-y-2">
            {ENCLOSURE_DOORS.map(door => (
              <div key={door.id} className="flex items-center justify-between gap-3 rounded-xl glass-tile p-3">
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

          <div className="quote-rule" />
          <h4 className="text-sm font-semibold">Add-Ons &amp; Site Work</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {ENCLOSURE_ADDONS.map(addon => (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddOn(addon.id)}
                className={`text-left rounded-xl p-3 transition-all duration-200 glass-tile hover:-translate-y-0.5 ${
                  config.addOns.includes(addon.id) ? 'glass-tile-active' : ''
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
      </section>

      {/* Estimate */}
      <section className="quote-sheet rounded-2xl p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="quote-eyebrow">Section 04</p>
              <h4 className="text-base font-semibold mt-1">Investment Summary — Turnkey Installed</h4>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print proposal
            </Button>
          </div>
          {estimate.lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Draw or enter the enclosure area to generate your proposal.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl glass-panel-soft overflow-hidden">
                {estimate.lines.map((line, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm border-b border-border/40 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{line.label}</p>
                      <p className="text-[11px] text-muted-foreground">{line.detail}</p>
                    </div>
                    <span className="font-semibold shrink-0 tabular-nums">${line.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between rounded-xl glass-tile px-4 py-3">
                <div>
                  <p className="quote-eyebrow">Contract total</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {config.areaSqFt.toLocaleString()} sq ft • ${estimate.pricePerSqFt.toFixed(2)}/sq ft installed
                  </p>
                </div>
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  ${estimate.total.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Includes materials, freight, installation labor, parts, engineered drawings, permit fees and inspections.
                Florida market range for this scope is ${estimate.marketRange.low}–${estimate.marketRange.high}/sq ft.
              </p>
            </div>
          )}
      </section>
      </TabsContent>

      <TabsContent value="pro" className="space-y-5 mt-0">
      {/* Compliance */}
      <section className="glass-panel rounded-2xl p-5 space-y-3">
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
                <div key={i} className="flex items-start gap-2 rounded-xl glass-tile p-2.5">
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
      </section>

      {/* Contractor cost model */}
      <section className="glass-panel rounded-2xl p-5 space-y-4">
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
              <div className="quote-rule" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(estimate.categoryTotals).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between rounded-lg glass-tile px-2 py-1">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-semibold">${amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="quote-rule" />
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
      </section>

      {/* Spec sheets */}
      <Tabs defaultValue="installer" className="w-full space-y-3">
        <TabsList className="grid grid-cols-3 w-full glass-tile p-1 h-auto">
          <TabsTrigger value="installer" className="text-xs py-2">
            <HardHat className="h-3.5 w-3.5 mr-1" /> Installer
          </TabsTrigger>
          <TabsTrigger value="architect" className="text-xs py-2">
            <Ruler className="h-3.5 w-3.5 mr-1" /> Architect / Engineer
          </TabsTrigger>
          <TabsTrigger value="permit" className="text-xs py-2">
            <Stamp className="h-3.5 w-3.5 mr-1" /> Permit
          </TabsTrigger>
        </TabsList>
        {(['installer', 'architect', 'permit'] as const).map(key => (
          <TabsContent key={key} value={key} className="mt-0">
            <div className="glass-panel rounded-2xl p-5 space-y-2">
                {spec[key].map((row, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,140px)_1fr] gap-3 text-xs border-b border-border/40 pb-1.5 last:border-0">
                    <span className="font-semibold">{row.label}</span>
                    <span className="text-muted-foreground">{row.value}</span>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      </TabsContent>
    </Tabs>

  );
};

export default EnclosureConfigurator;
