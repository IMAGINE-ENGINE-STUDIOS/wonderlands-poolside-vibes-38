/**
 * Shared controls used by both Asset Managers (2D designer and 3D viewer):
 * - panel tab / button styles (tabs match Terrain Editor, buttons match Asset Manager)
 * - stair styles + soft-edge slider + quick width extension
 * - bar-stool controls
 * - contour-seating "wrap along the wall" presets
 * - Objects panel: scene objects list, gizmo mode (move / rotate / scale), Sketchfab gallery
 */
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Move3d, RotateCw, Maximize, Trash2, Footprints, Waves, Layers, Rows3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './poolAssetTypes';
import type { TerrainAsset } from './TerrainEditor';
import type { GizmoMode } from './TerrainAssetsRenderer';
import { SketchfabBrowser, type SketchfabPick } from './SketchfabBrowser';

/** Tab strip — Terrain Editor look */
export const PANEL_TABS_LIST = 'w-full grid p-1 h-auto';
export const PANEL_TAB = 'text-[10px] px-1 py-1.5 flex-col gap-0.5 h-auto';
/** Buttons — Asset Manager look */
export const PANEL_BTN = 'text-xs';

const STAIR_STYLES: { key: NonNullable<PoolStairConfig['style']>; label: string; Icon: typeof Footprints }[] = [
  { key: 'classic', label: 'Classic', Icon: Footprints },
  { key: 'wedding-cake', label: 'Wedding cake', Icon: Waves },
  { key: 'bench', label: 'Bench entry', Icon: Rows3 },
  { key: 'floating', label: 'Floating', Icon: Layers },
];

export function StairStyleControls({ stair, onChange }: { stair: PoolStairConfig; onChange: (u: Partial<PoolStairConfig>) => void }) {
  const style = stair.style ?? 'classic';
  const soft = stair.softEdge ?? 0;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Stair style</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {STAIR_STYLES.map(({ key, label, Icon }) => (
            <Button key={key} variant={style === key ? 'default' : 'outline'} size="sm" className={PANEL_BTN} onClick={() => onChange({ style: key })}>
              <Icon className="h-3 w-3 mr-1" />{label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Soft edges: {(soft * 12).toFixed(0)}"</Label>
        <Slider value={[soft]} onValueChange={([v]) => onChange({ softEdge: v })} min={0} max={0.5} step={1 / 24} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Extend along the wall</Label>
        <div className="grid grid-cols-4 gap-1">
          {[4, 6, 8, 12].map((w) => (
            <Button key={w} variant={stair.width === w ? 'default' : 'outline'} size="sm" className={cn(PANEL_BTN, 'px-0')} onClick={() => onChange({ width: w })}>{w} ft</Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarStoolControls({ chair, onChange }: { chair: PoolChairConfig; onChange: (u: Partial<PoolChairConfig>) => void }) {
  if (chair.style !== 'barstool') return null;
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Stools: {chair.count ?? 3}</Label>
        <Slider value={[chair.count ?? 3]} onValueChange={([v]) => onChange({ count: v })} min={1} max={8} step={1} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Spacing: {(chair.spacing ?? 2.2).toFixed(1)} ft</Label>
        <Slider value={[chair.spacing ?? 2.2]} onValueChange={([v]) => onChange({ spacing: v })} min={1.6} max={4} step={0.1} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Seat size: {(chair.width * 12).toFixed(0)}"</Label>
        <Slider value={[chair.width]} onValueChange={([v]) => onChange({ width: v, depth: v })} min={1} max={2} step={1 / 12} />
      </div>
    </div>
  );
}

export const BAR_STOOL_PRESET: Omit<PoolChairConfig, 'id' | 'wallPosition' | 'textureUrl'> = {
  width: 1.17, depth: 1.17, height: 1.5, cornerRadius: 0.58,
  snapToWall: true, followFloor: true, name: 'Pool Bar Stools', style: 'barstool', count: 3, spacing: 2.2,
};

export function ContourWrapButtons({ seating, onChange }: { seating: ContourSeatingConfig; onChange: (u: Partial<ContourSeatingConfig>) => void }) {
  const span = (f: number) => onChange({ endPosition: Math.min(1, seating.startPosition + f) });
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Wrap around the pool</Label>
      <div className="grid grid-cols-4 gap-1">
        <Button variant="outline" size="sm" className={cn(PANEL_BTN, 'px-0')} onClick={() => span(0.125)}>1/8</Button>
        <Button variant="outline" size="sm" className={cn(PANEL_BTN, 'px-0')} onClick={() => span(0.25)}>1/4</Button>
        <Button variant="outline" size="sm" className={cn(PANEL_BTN, 'px-0')} onClick={() => span(0.5)}>1/2</Button>
        <Button variant="outline" size="sm" className={cn(PANEL_BTN, 'px-0')} onClick={() => onChange({ startPosition: 0, endPosition: 1 })}>Full</Button>
      </div>
    </div>
  );
}

export function pickToAsset(pick: SketchfabPick, type: TerrainAsset['type'] = 'object'): TerrainAsset {
  return {
    id: `sf-${pick.uid}-${Date.now()}`,
    name: pick.name,
    type,
    url: pick.url,
    format: 'glb',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: type === 'terrain' ? 1 : 1,
    visible: true,
    autoFit: type !== 'terrain' && type !== 'skydome',
  };
}

const GIZMO_MODES: { mode: GizmoMode; label: string; Icon: typeof Move3d }[] = [
  { mode: 'translate', label: 'Move', Icon: Move3d },
  { mode: 'rotate', label: 'Rotate', Icon: RotateCw },
  { mode: 'scale', label: 'Scale', Icon: Maximize },
];

export function ObjectsPanel({
  sceneObjects, onChange, selectedId, onSelect, gizmoMode, onGizmoModeChange,
}: {
  sceneObjects: TerrainAsset[];
  onChange?: (next: TerrainAsset[]) => void;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  gizmoMode?: GizmoMode;
  onGizmoModeChange?: (m: GizmoMode) => void;
}) {
  const objects = sceneObjects.filter((a) => a.type === 'furniture' || a.type === 'object' || a.type === 'custom');
  const selected = objects.find((o) => o.id === selectedId);
  const uniform = selected ? (typeof selected.scale === 'number' ? selected.scale : selected.scale[0]) : 1;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">In the scene</Label>
        {objects.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No objects yet. Pick one from the gallery below.</p>
        ) : objects.map((a) => (
          <div key={a.id} onClick={() => onSelect?.(a.id)}
            className={cn('flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors', selectedId === a.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50')}>
            <span className="flex-1 truncate text-xs font-medium">{a.name}</span>
            <Switch checked={a.visible} onClick={(e) => e.stopPropagation()}
              onCheckedChange={(v) => onChange?.(sceneObjects.map((x) => (x.id === a.id ? { ...x, visible: v } : x)))} />
            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Remove"
              onClick={(e) => { e.stopPropagation(); onChange?.(sceneObjects.filter((x) => x.id !== a.id)); if (selectedId === a.id) onSelect?.(null); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <Label className="text-xs font-medium">Move, rotate or scale in the scene</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {GIZMO_MODES.map(({ mode, label, Icon }) => (
              <Button key={mode} variant={gizmoMode === mode ? 'default' : 'outline'} size="sm" className={PANEL_BTN} onClick={() => onGizmoModeChange?.(mode)}>
                <Icon className="h-3 w-3 mr-1" />{label}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Size: {Math.round(uniform * 100)}%</Label>
            <Slider value={[uniform]} min={0.1} max={4} step={0.05}
              onValueChange={([v]) => onChange?.(sceneObjects.map((x) => (x.id === selected.id ? { ...x, scale: v } : x)))} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Turn: {Math.round(((selected.rotation[1] * 180) / Math.PI) % 360)}°</Label>
            <Slider value={[selected.rotation[1]]} min={-Math.PI} max={Math.PI} step={Math.PI / 24}
              onValueChange={([v]) => onChange?.(sceneObjects.map((x) => (x.id === selected.id ? { ...x, rotation: [x.rotation[0], v, x.rotation[2]] } : x)))} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Real-world size</Label>
            <Switch checked={selected.autoFit !== false}
              onCheckedChange={(v) => onChange?.(sceneObjects.map((x) => (x.id === selected.id ? { ...x, autoFit: v } : x)))} />
          </div>
          <p className="text-[11px] text-muted-foreground">Objects are solid in walk mode — you can walk around them and step onto them.</p>
        </div>
      )}

      <div className="border-t pt-2 space-y-1.5">
        <Label className="text-xs">3D model gallery</Label>
        <SketchfabBrowser onAdd={(pick) => onChange?.([...sceneObjects, pickToAsset(pick)])} />
      </div>
    </div>
  );
}
