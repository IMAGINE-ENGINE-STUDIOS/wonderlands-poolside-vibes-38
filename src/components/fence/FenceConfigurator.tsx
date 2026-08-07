import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2, HardHat, Ruler, Stamp, Minus, Plus, Info } from 'lucide-react';
import FenceDrawingBoard, { FenceLayout } from './FenceDrawingBoard';
import {
  DEFAULT_FENCE_CONFIG,
  FENCE_ADDONS,
  FENCE_COLORS,
  FENCE_GATES,
  FENCE_HEIGHTS,
  FENCE_STYLES,
  FenceConfigState,
  buildFenceSpec,
  checkFenceCompliance,
  estimateFence,
} from '@/data/fenceConfigurator';

const CACHE_KEY = 'wonderlands_fence_configurator_v1';

interface FenceConfiguratorProps {
  /** Reports the fully configured project total so the studio can price it */
  onTotalChange?: (total: number, summary: { linearFt: number; description: string }) => void;
}

const emptyLayout: FenceLayout = { points: [], closed: false, gateSegments: [] };

const FenceConfigurator = ({ onTotalChange }: FenceConfiguratorProps) => {
  const [config, setConfig] = React.useState<FenceConfigState>(DEFAULT_FENCE_CONFIG);
  const [layout, setLayout] = React.useState<FenceLayout>(emptyLayout);
  const [manualFt, setManualFt] = React.useState('');
  const hydrated = React.useRef(false);

  // hydrate + autosave
  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.config) setConfig({ ...DEFAULT_FENCE_CONFIG, ...parsed.config });
        if (parsed.layout) setLayout(parsed.layout);
        if (typeof parsed.manualFt === 'string') setManualFt(parsed.manualFt);
      }
    } catch {
      /* ignore corrupt cache */
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ config, layout, manualFt }));
      } catch {
        /* storage full */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [config, layout, manualFt]);

  const handleMeasure = React.useCallback((linearFt: number) => {
    setConfig(prev => (prev.linearFt === linearFt ? prev : { ...prev, linearFt }));
  }, []);

  const applyManual = () => {
    const ft = parseFloat(manualFt) || 0;
    setConfig(prev => ({ ...prev, linearFt: ft }));
  };

  const estimate = estimateFence(config);
  const issues = checkFenceCompliance(config);
  const spec = buildFenceSpec(config);
  const errors = issues.filter(i => i.level === 'error');
  const warnings = issues.filter(i => i.level === 'warning');
  const color = FENCE_COLORS.find(c => c.id === config.colorId) || FENCE_COLORS[0];
  const height = FENCE_HEIGHTS.find(h => h.id === config.heightId) || FENCE_HEIGHTS[0];
  const style = FENCE_STYLES.find(s => s.id === config.styleId) || FENCE_STYLES[0];

  React.useEffect(() => {
    onTotalChange?.(estimate.total, {
      linearFt: config.linearFt,
      description: `${height.label} ${style.label} aluminum fence, ${color.label}`,
    });
  }, [estimate.total, config.linearFt, height.label, style.label, color.label, onTotalChange]);

  const setGate = (id: string, delta: number) =>
    setConfig(prev => {
      const next = Math.max(0, (prev.gates[id] || 0) + delta);
      const gates = { ...prev.gates };
      if (next === 0) delete gates[id];
      else gates[id] = next;
      return { ...prev, gates };
    });

  const toggleAddOn = (id: string) =>
    setConfig(prev => ({
      ...prev,
      addOns: prev.addOns.includes(id) ? prev.addOns.filter(a => a !== id) : [...prev.addOns, id],
    }));

  return (
    <div className="space-y-6">
      {/* Layout drawing board */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" />
          <h4 className="font-semibold">Fence Layout Board</h4>
        </div>
        <FenceDrawingBoard layout={layout} onChange={setLayout} onMeasure={handleMeasure} colorHex={color.hex} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Or enter total linear feet</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                className="w-32"
                placeholder="Linear ft"
                value={manualFt}
                onChange={e => setManualFt(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={applyManual}>
                Apply
              </Button>
            </div>
          </div>
          <Badge variant="secondary" className="mb-1">
            Take-off: {config.linearFt.toLocaleString()} linear ft
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Barrier purpose */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">This fence serves as the pool safety barrier</p>
          <p className="text-xs text-muted-foreground">
            Enables Florida Building Code R4501.17 / F.S. 515 barrier validation.
          </p>
        </div>
        <Switch
          checked={config.isPoolBarrier}
          onCheckedChange={v => setConfig(prev => ({ ...prev, isPoolBarrier: v }))}
        />
      </div>

      {/* Height */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Height</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FENCE_HEIGHTS.map(h => (
            <button
              key={h.id}
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, heightId: h.id }))}
              className={`text-left p-3 rounded-lg border transition-all ${config.heightId === h.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{h.label}</span>
                {h.poolBarrierCompliant && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">${h.pricePerFt}/linear ft</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{h.note}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Picket Style</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FENCE_STYLES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, styleId: s.id }))}
              className={`text-left p-3 rounded-lg border transition-all ${config.styleId === s.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {s.pricePerFtDelta > 0 ? `+$${s.pricePerFtDelta}/ft` : 'Included'}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Finish Color</h4>
        <div className="flex flex-wrap gap-2">
          {FENCE_COLORS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, colorId: c.id }))}
              className={`p-2 rounded-lg border w-28 transition-all ${config.colorId === c.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <div className="h-10 w-full rounded-md border" style={{ backgroundColor: c.hex }} />
              <p className="text-[11px] font-medium mt-1 truncate">{c.label}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{color.finish}</p>
      </div>

      {/* Gates */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Gates</h4>
        <div className="space-y-2">
          {FENCE_GATES.map(g => (
            <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {g.label} <span className="text-xs text-muted-foreground">${g.price.toLocaleString()} each</span>
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">{g.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setGate(g.id, -1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{config.gates[g.id] || 0}</span>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => setGate(g.id, 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Site & Code Add-Ons</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FENCE_ADDONS.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAddOn(a.id)}
              className={`text-left p-3 rounded-lg border transition-all ${config.addOns.includes(a.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{a.label}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  ${a.price}
                  {a.pricing === 'linear-ft' ? '/ft' : ''}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{a.description}</p>
              {a.codeRequired && (
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  Code required
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Engineering inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Bottom clearance (in)</Label>
          <Input
            type="number"
            min={0}
            value={config.bottomClearanceIn}
            onChange={e => setConfig(prev => ({ ...prev, bottomClearanceIn: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Picket clear spacing (in)</Label>
          <Input
            type="number"
            step="0.25"
            min={0}
            value={config.picketSpacingIn}
            onChange={e => setConfig(prev => ({ ...prev, picketSpacingIn: parseFloat(e.target.value) || 0 }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Post spacing (ft)</Label>
          <Input
            type="number"
            step="0.5"
            min={0}
            value={config.postSpacingFt}
            onChange={e => setConfig(prev => ({ ...prev, postSpacingFt: parseFloat(e.target.value) || 6 }))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Design wind (mph)</Label>
          <Input
            type="number"
            step="5"
            min={0}
            value={config.windSpeedMph}
            onChange={e => setConfig(prev => ({ ...prev, windSpeedMph: parseFloat(e.target.value) || 150 }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">High-Velocity Hurricane Zone (Miami-Dade / Broward)</p>
          <p className="text-xs text-muted-foreground">Tighter post spacing and NOA-approved assemblies.</p>
        </div>
        <Switch checked={config.hvhz} onCheckedChange={v => setConfig(prev => ({ ...prev, hvhz: v }))} />
      </div>

      {/* Compliance */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Florida Code Compliance</h4>
        {errors.length === 0 && warnings.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm">Configuration meets the residential barrier requirements reviewed here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div
                key={`${issue.code}-${i}`}
                className={`flex items-start gap-2 rounded-lg border p-3 ${issue.level === 'error' ? 'border-destructive/40 bg-destructive/5' : 'border-border bg-muted/40'}`}
              >
                {issue.level === 'error' ? (
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{issue.code}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specification sheets */}
      <Tabs defaultValue="installer" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="installer" className="text-xs">
            <HardHat className="h-3.5 w-3.5 mr-1" /> Installer
          </TabsTrigger>
          <TabsTrigger value="architect" className="text-xs">
            <Ruler className="h-3.5 w-3.5 mr-1" /> Architect
          </TabsTrigger>
          <TabsTrigger value="permit" className="text-xs">
            <Stamp className="h-3.5 w-3.5 mr-1" /> Permits
          </TabsTrigger>
        </TabsList>
        {(['installer', 'architect', 'permit'] as const).map(key => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {spec[key].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-3 border-b border-dashed py-1.5">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium text-right">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Estimate */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h4 className="font-semibold text-sm">Project Estimate</h4>
          {estimate.lines.length === 0 ? (
            <p className="text-xs text-muted-foreground">Draw the layout or enter linear footage to see pricing.</p>
          ) : (
            estimate.lines.map((line, i) => (
              <div key={`${line.label}-${i}`} className="flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-medium truncate">{line.label}</p>
                  <p className="text-muted-foreground">{line.detail}</p>
                </div>
                <span className="font-semibold shrink-0">${line.amount.toLocaleString()}</span>
              </div>
            ))
          )}
          <Separator />
          <div className="flex items-center justify-between text-sm font-bold">
            <span>Fence Project Total</span>
            <span className="text-primary">${estimate.total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FenceConfigurator;
