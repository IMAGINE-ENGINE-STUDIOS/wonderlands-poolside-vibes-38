/**
 * Pool light settings — redesigned.
 * Layout: master power + scene mode pills, a strip of light chips (L1…L8)
 * to pick a light, then fine tuning for the selected light.
 */
import { PoolLightConfig, PoolLightColorMode } from './types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus, Power, Palette, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PoolLightControlsProps {
  lights: PoolLightConfig[];
  onLightsChange: (lights: PoolLightConfig[]) => void;
  selectedLightId: string | null;
  onSelectLight: (id: string | null) => void;
  isNightMode: boolean;
}

const MAX_LIGHTS = 8;

/** Underwater LED presets (white mode). */
const SHADES = [
  { color: '#ffffff', name: 'Crisp white' },
  { color: '#fff1d6', name: 'Warm 2700K' },
  { color: '#e6f7ff', name: 'Cool white' },
  { color: '#7fe3f0', name: 'Aqua' },
  { color: '#4f8cff', name: 'Ocean blue' },
  { color: '#7b5cff', name: 'Indigo' },
  { color: '#62e09b', name: 'Lagoon green' },
  { color: '#ff8a7a', name: 'Coral' },
];

export function PoolLightControls({
  lights,
  onLightsChange,
  selectedLightId,
  onSelectLight,
  isNightMode,
}: PoolLightControlsProps) {
  const selectedLight = lights.find((l) => l.id === selectedLightId) ?? null;
  const allOn = lights.length > 0 && lights.every((l) => l.isOn);
  const mode: PoolLightColorMode | 'mixed' = lights.every((l) => l.colorMode === 'gradient')
    ? 'gradient'
    : lights.every((l) => l.colorMode === 'white')
    ? 'white'
    : 'mixed';

  const update = (id: string, patch: Partial<PoolLightConfig>) =>
    onLightsChange(lights.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const addLight = () => {
    if (lights.length >= MAX_LIGHTS) return;
    // Place the new light in the largest gap along the wall
    const sorted = [...lights].map((l) => l.wallPosition).sort((a, b) => a - b);
    let pos = 0.25;
    if (sorted.length) {
      let best = 0;
      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        const b = i === sorted.length - 1 ? sorted[0] + 1 : sorted[i + 1];
        if (b - a > best) { best = b - a; pos = (a + (b - a) / 2) % 1; }
      }
    }
    const light: PoolLightConfig = {
      id: `light-${Date.now()}`,
      wallPosition: pos,
      depthFromSurface: 1.5,
      color: '#ffffff',
      colorMode: 'white',
      intensity: 2,
      isOn: isNightMode || allOn,
    };
    onLightsChange([...lights, light]);
    onSelectLight(light.id);
  };

  const removeLight = () => {
    if (lights.length <= 1) return;
    const id = selectedLightId ?? lights[lights.length - 1].id;
    onLightsChange(lights.filter((l) => l.id !== id));
    onSelectLight(null);
  };

  return (
    <div className="space-y-4">
      {/* Master row */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
              allOn ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground',
            )}
          >
            <Power className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold">All lights</p>
            <p className="text-[11px] text-muted-foreground">
              {lights.filter((l) => l.isOn).length} of {lights.length} on
            </p>
          </div>
        </div>
        <Switch
          checked={allOn}
          onCheckedChange={(on) => onLightsChange(lights.map((l) => ({ ...l, isOn: on })))}
        />
      </div>

      {/* Scene mode */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1">
        {([
          { key: 'white', label: 'Solid colour', icon: Sun },
          { key: 'gradient', label: 'Colour cycle', icon: Palette },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onLightsChange(lights.map((l) => ({ ...l, colorMode: key })))}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
              mode === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Light chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Lights ({lights.length}/{MAX_LIGHTS})</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={removeLight} disabled={lights.length <= 1} aria-label="Remove light">
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={addLight} disabled={lights.length >= MAX_LIGHTS} aria-label="Add light">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {lights.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLight(selectedLightId === l.id ? null : l.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                selectedLightId === l.id ? 'border-primary bg-primary/10 text-foreground' : 'hover:border-primary/50',
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full border"
                style={{
                  background: l.colorMode === 'gradient'
                    ? 'conic-gradient(#ff8a7a,#ffd36b,#62e09b,#4f8cff,#7b5cff,#ff8a7a)'
                    : l.color,
                  opacity: l.isOn ? 1 : 0.3,
                }}
              />
              L{i + 1}
              <span className="text-muted-foreground">{Math.round(l.wallPosition * 100)}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected light */}
      {selectedLight ? (
        <div className="space-y-3 rounded-xl border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">
              Light L{lights.findIndex((l) => l.id === selectedLight.id) + 1}
            </p>
            <Switch checked={selectedLight.isOn} onCheckedChange={(isOn) => update(selectedLight.id, { isOn })} />
          </div>

          {([
            { key: 'intensity', label: 'Brightness', min: 0.5, max: 5, step: 0.1, unit: '×' },
            { key: 'depthFromSurface', label: 'Depth below water', min: 0.5, max: 4, step: 0.1, unit: ' ft' },
            { key: 'wallPosition', label: 'Position on wall', min: 0, max: 0.999, step: 0.005, unit: '' },
          ] as const).map((s) => (
            <div key={s.key} className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium tabular-nums">
                  {s.key === 'wallPosition'
                    ? `${Math.round(selectedLight.wallPosition * 100)}%`
                    : `${(selectedLight[s.key] as number).toFixed(1)}${s.unit}`}
                </span>
              </div>
              <Slider
                value={[selectedLight[s.key] as number]}
                min={s.min}
                max={s.max}
                step={s.step}
                onValueChange={([v]) => update(selectedLight.id, { [s.key]: v } as Partial<PoolLightConfig>)}
              />
            </div>
          ))}

          {selectedLight.colorMode === 'white' && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Colour</p>
              <div className="grid grid-cols-8 gap-1.5">
                {SHADES.map((s) => (
                  <button
                    key={s.color}
                    type="button"
                    title={s.name}
                    aria-label={s.name}
                    onClick={() => update(selectedLight.id, { color: s.color })}
                    className={cn(
                      'aspect-square rounded-md border-2 transition-transform hover:scale-110',
                      selectedLight.color === s.color ? 'border-primary' : 'border-border',
                    )}
                    style={{ backgroundColor: s.color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedLight.color}
                onChange={(e) => update(selectedLight.id, { color: e.target.value })}
                className="h-7 w-full cursor-pointer rounded-md border bg-transparent"
                aria-label="Custom colour"
              />
            </div>
          )}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Pick a light above, or click one in the 3D view. Drag it in the scene to move it along the wall.
        </p>
      )}
    </div>
  );
}
