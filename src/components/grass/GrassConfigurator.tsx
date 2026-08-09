import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Lock, Ruler, HardHat, Leaf, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { artificialGrassOptions, getGrassPricePerSqFt } from '@/data/artificialGrassData';
import GrassDrawingBoard, { GrassLayout, GrassTakeoff } from './GrassDrawingBoard';
import {
  GRASS_BASE_SYSTEMS,
  GRASS_INFILLS,
  GRASS_EDGINGS,
  GRASS_EXTRAS,
  GRASS_DEFAULT_LOADING,
  GRASS_CONTRACTOR_PASSCODE,
  DEFAULT_GRASS_CONFIG,
  GrassProjectConfig,
  computeGrassEstimate,
  GrassEstimate,
} from '@/data/artificialGrassConfigurator';
import { usePersistentState } from '@/hooks/usePersistentState';

export interface GrassProjectSummary {
  areaSqFt: number;
  perimeterFt: number;
  lines: { label: string; detail: string; price: number }[];
  snapshot: string | null;
  config: GrassProjectConfig;
}

interface Props {
  /** Grass product currently selected in the studio (drives new areas) */
  initialGrassName?: string;
  onTotalChange?: (total: number, summary: GrassProjectSummary) => void;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const GrassConfigurator: React.FC<Props> = ({ initialGrassName, onTotalChange }) => {
  const initialId =
    artificialGrassOptions.find(g => g.name === initialGrassName)?.id || artificialGrassOptions[0].id;

  const [layout, setLayout] = usePersistentState<GrassLayout>('grass-layout', { areas: [] });
  const [activeGrassId, setActiveGrassId] = usePersistentState<string>('grass-active-product', initialId);
  const [config, setConfig] = usePersistentState<GrassProjectConfig>('grass-config', DEFAULT_GRASS_CONFIG);
  const [takeoff, setTakeoff] = React.useState<GrassTakeoff>({ areaSqFt: 0, perimeterFt: 0, areas: [] });
  const [snapshot, setSnapshot] = React.useState<string | null>(null);

  // Contractor gate
  const [unlocked, setUnlocked] = React.useState(false);
  const [passcode, setPasscode] = React.useState('');
  const [profitPct, setProfitPct] = React.useState(GRASS_DEFAULT_LOADING.developerProfitPct * 100);

  const areaInputs = React.useMemo(
    () =>
      takeoff.areas.map(a => ({
        id: a.id,
        grassName: a.grassName,
        grassRatePerSqFt: getGrassPricePerSqFt(a.grassName),
        areaSqFt: a.areaSqFt,
        perimeterFt: a.perimeterFt,
      })),
    [takeoff]
  );

  const estimate: GrassEstimate = React.useMemo(
    () =>
      computeGrassEstimate(areaInputs, config, {
        ...GRASS_DEFAULT_LOADING,
        developerProfitPct: profitPct / 100,
      }),
    [areaInputs, config, profitPct]
  );

  // Report the turnkey total up to the studio
  const lastRef = React.useRef<string>('');
  React.useEffect(() => {
    const summary: GrassProjectSummary = {
      areaSqFt: estimate.areaSqFt,
      perimeterFt: estimate.perimeterFt,
      lines: estimate.lines.map(l => ({ label: l.label, detail: l.detail, price: Math.round(l.retail) })),
      snapshot,
      config,
    };
    const key = `${estimate.customerTotal}|${estimate.areaSqFt}|${summary.lines.length}|${snapshot ? 1 : 0}`;
    if (key === lastRef.current) return;
    lastRef.current = key;
    onTotalChange?.(estimate.customerTotal, summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estimate, snapshot, config]);

  const toggleExtra = (id: string) =>
    setConfig(prev => ({
      ...prev,
      extraIds: prev.extraIds.includes(id) ? prev.extraIds.filter(x => x !== id) : [...prev.extraIds, id],
    }));

  const OptionCarousel = ({
    title,
    options,
    valueId,
    onSelect,
    unitLabel,
  }: {
    title: string;
    options: typeof GRASS_BASE_SYSTEMS;
    valueId: string;
    onSelect: (id: string) => void;
    unitLabel: string;
  }) => (
    <div>
      <Label className="text-sm font-semibold">{title}</Label>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {options.map(o => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            className={cn(
              'w-56 shrink-0 rounded-xl border p-3 text-left transition-all',
              valueId === o.id
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border/70 bg-white/60 hover:border-primary/50'
            )}
          >
            <p className="text-sm font-medium">{o.name}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{o.description}</p>
            <p className="mt-2 text-xs font-semibold text-primary">
              ${o.retail}/{unitLabel}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className="border-white/40 bg-white/60 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Leaf className="h-4 w-4 text-primary" /> Artificial Turf Design Studio
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Draw every turf area of the patio or yard — any size, straight or curved — and the plan quotes itself.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Design Board</TabsTrigger>
              <TabsTrigger value="options">Options & Quote</TabsTrigger>
              <TabsTrigger value="contractor">
                <HardHat className="mr-1.5 h-3.5 w-3.5" /> Contractor
              </TabsTrigger>
            </TabsList>

            {/* -------------------------------- design ------------------------------- */}
            <TabsContent value="design" className="mt-4">
              <GrassDrawingBoard
                layout={layout}
                onChange={setLayout}
                onMeasure={setTakeoff}
                onSnapshot={setSnapshot}
                activeGrassId={activeGrassId}
                onActiveGrassChange={setActiveGrassId}
              />
              {takeoff.areas.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {takeoff.areas.map((a, i) => (
                    <div key={a.id} className="rounded-lg border border-white/50 bg-white/60 p-3 backdrop-blur">
                      <p className="text-xs font-semibold">
                        Area {i + 1} · {a.grassName}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {a.areaSqFt.toLocaleString()} sq ft · {a.perimeterFt.toLocaleString()} lf edge
                      </p>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        {money(a.areaSqFt * getGrassPricePerSqFt(a.grassName))} turf
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* -------------------------------- options ------------------------------ */}
            <TabsContent value="options" className="mt-4 space-y-5">
              <OptionCarousel
                title="Base System"
                options={GRASS_BASE_SYSTEMS}
                valueId={config.baseSystemId}
                onSelect={id => setConfig(p => ({ ...p, baseSystemId: id }))}
                unitLabel="sq ft"
              />
              <OptionCarousel
                title="Infill"
                options={GRASS_INFILLS}
                valueId={config.infillId}
                onSelect={id => setConfig(p => ({ ...p, infillId: id }))}
                unitLabel="sq ft"
              />
              <OptionCarousel
                title="Edge Restraint"
                options={GRASS_EDGINGS}
                valueId={config.edgingId}
                onSelect={id => setConfig(p => ({ ...p, edgingId: id }))}
                unitLabel="lf"
              />

              <div>
                <Label className="text-sm font-semibold">Project Extras</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {GRASS_EXTRAS.map(e => (
                    <label
                      key={e.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors',
                        config.extraIds.includes(e.id) ? 'border-primary bg-primary/10' : 'border-border/70 bg-white/60'
                      )}
                    >
                      <Checkbox checked={config.extraIds.includes(e.id)} onCheckedChange={() => toggleExtra(e.id)} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{e.name}</span>
                        <span className="block text-[11px] leading-snug text-muted-foreground">{e.description}</span>
                        <span className="mt-1 block text-xs font-semibold text-primary">
                          ${e.retail.toLocaleString()}
                          {e.unit === 'sqft' ? '/sq ft' : e.unit === 'lf' ? '/lf' : ' / project'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {config.extraIds.includes('french-drain') && (
                <div className="max-w-xs">
                  <Label className="text-xs font-medium text-muted-foreground">Drain line length (linear ft)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={config.drainLf || ''}
                    onChange={e => setConfig(p => ({ ...p, drainLf: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 h-9"
                    placeholder="e.g. 40"
                  />
                </div>
              )}

              <Separator />

              {/* Customer investment summary */}
              <div className="rounded-xl border border-white/50 bg-white/70 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Turnkey Investment</p>
                    <p className="text-3xl font-semibold">{money(estimate.customerTotal)}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="flex items-center justify-end gap-1">
                      <Ruler className="h-3 w-3" /> {estimate.areaSqFt.toLocaleString()} sq ft
                    </p>
                    <p>{estimate.perimeterFt.toLocaleString()} lf edge</p>
                    {estimate.areaSqFt > 0 && <p>{money(estimate.pricePerSqFt)}/sq ft installed</p>}
                  </div>
                </div>

                {estimate.lines.length > 0 ? (
                  <div className="mt-4 space-y-1.5">
                    {estimate.lines.map((l, i) => (
                      <div key={`${l.label}-${i}`} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0">
                          <span className="font-medium">{l.label}</span>
                          <span className="block text-[11px] text-muted-foreground">{l.detail}</span>
                        </span>
                        <span className="shrink-0 font-mono text-sm">{money(l.retail)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Draw a turf area on the design board to build the quote.
                  </p>
                )}

                <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
                  Includes materials, base preparation, infill, seaming, edge restraint, labor, mobilization and
                  clean-up. Manufacturer turf warranty applies per product.
                </p>
              </div>
            </TabsContent>

            {/* ------------------------------ contractor ----------------------------- */}
            <TabsContent value="contractor" className="mt-4">
              {!unlocked ? (
                <div className="mx-auto max-w-sm rounded-xl border border-white/50 bg-white/70 p-6 text-center backdrop-blur-xl">
                  <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold">Contractor & Developer Tools</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cost model, margin and developer profit. Passcode required.
                  </p>
                  <Input
                    type="password"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && passcode.trim().toUpperCase() === GRASS_CONTRACTOR_PASSCODE)
                        setUnlocked(true);
                    }}
                    placeholder="Passcode"
                    className="mt-4 h-9 text-center"
                  />
                  <Button
                    type="button"
                    className="mt-3 w-full"
                    onClick={() => {
                      if (passcode.trim().toUpperCase() === GRASS_CONTRACTOR_PASSCODE) setUnlocked(true);
                    }}
                  >
                    Unlock
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: 'Direct Cost', value: estimate.directCost },
                      { label: `Overhead (${Math.round(GRASS_DEFAULT_LOADING.overheadPct * 100)}%)`, value: estimate.overhead },
                      { label: `Contingency (${Math.round(GRASS_DEFAULT_LOADING.contingencyPct * 100)}%)`, value: estimate.contingency },
                      { label: 'Loaded Cost', value: estimate.loadedCost },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl border border-white/50 bg-white/70 p-3 backdrop-blur">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                        <p className="mt-1 text-lg font-semibold">{money(m.value)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-white/50 bg-white/70 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Developer profit over the project</Label>
                      <Badge variant="secondary" className="font-mono">
                        {profitPct.toFixed(0)}%
                      </Badge>
                    </div>
                    <Slider
                      value={[profitPct]}
                      min={0}
                      max={60}
                      step={1}
                      onValueChange={v => setProfitPct(v[0])}
                      className="mt-3"
                    />
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Developer Profit</p>
                        <p className="text-lg font-semibold text-primary">{money(estimate.developerProfit)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Quoted Price</p>
                        <p className="text-lg font-semibold">{money(estimate.customerTotal)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Gross Margin</p>
                        <p className="text-lg font-semibold">
                          {money(estimate.marginDollars)}{' '}
                          <span className="text-xs text-muted-foreground">({estimate.marginPct.toFixed(1)}%)</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/50 bg-white/70 p-4 backdrop-blur">
                    <p className="text-sm font-semibold">Cost breakdown (internal)</p>
                    <div className="mt-2 space-y-1.5">
                      {estimate.lines.map((l, i) => (
                        <div key={`${l.label}-cost-${i}`} className="flex items-baseline justify-between gap-3 text-xs">
                          <span className="min-w-0 truncate">{l.label}</span>
                          <span className="shrink-0 font-mono">
                            cost {money(l.cost)} · sell {money(l.retail)}
                          </span>
                        </div>
                      ))}
                      {estimate.lines.length === 0 && (
                        <p className="text-xs text-muted-foreground">Draw a turf area to generate the cost model.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/50 bg-white/70 p-4 text-[11px] leading-relaxed text-muted-foreground backdrop-blur">
                    <p className="mb-1 text-xs font-semibold text-foreground">Installer notes</p>
                    Excavate 3" min, compact base to 90% modified Proctor, slope 1% to drainage. Seams glued with
                    outdoor turf adhesive on 6" seam tape, nails at 4" on seams and 6" on perimeter. Infill brushed in
                    two lifts. Verify irrigation caps and utility locates before excavation.
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrassConfigurator;
