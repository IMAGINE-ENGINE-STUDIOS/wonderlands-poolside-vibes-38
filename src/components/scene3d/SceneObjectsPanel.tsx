import { useMemo, useState } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Trash2,
  Waves,
  Square,
  Frame,
  Droplets,
  Footprints,
  Armchair,
  Sofa,
  Lightbulb,
  TreePine,
  Boxes,
  Search,
  X,
  Eye,
  EyeOff,
  FolderPlus,
  Fence,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSceneLayers, sceneLayerActions, layerOf, isObjectHidden } from '@/lib/design/sceneLayers';

export interface SceneObjectEntry {
  id: string;
  label: string;
  detail?: string;
  icon: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  /** Default layer id (see lib/design/sceneLayers DEFAULT_LAYERS). */
  layer?: string;
}

export interface SceneObjectGroup {
  key: string;
  label: string;
  items: SceneObjectEntry[];
}

interface SceneObjectsPanelProps {
  groups: SceneObjectGroup[];
  className?: string;
  defaultOpen?: boolean;
  /** Extra controls shown under the list (e.g. pool / deck levels). */
  footer?: React.ReactNode;
}

/**
 * Scene Objects widget — lists every object currently in the 3D scene,
 * grouped by kind, with selection and delete actions.
 */
export function SceneObjectsPanel({ groups, className, defaultOpen = false, footer }: SceneObjectsPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [byLayer, setByLayer] = useState(true);
  const [newLayer, setNewLayer] = useState('');
  const [dropKey, setDropKey] = useState<string | null>(null);
  const layerState = useSceneLayers();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .map(g => ({
        ...g,
        items: q
          ? g.items.filter(i =>
              `${i.label} ${i.detail ?? ''}`.toLowerCase().includes(q)
            )
          : g.items,
      }))
      .filter(g => g.items.length > 0);
  }, [groups, query]);

  /* Layer view: every object regrouped under the layer it lives on. */
  const shown = useMemo(() => {
    if (!byLayer) return filtered.map(g => ({ ...g, layerId: undefined as string | undefined }));
    const all = filtered.flatMap(g => g.items);
    return layerState.layers.map(l => ({
      key: `layer:${l.id}`,
      label: l.name,
      layerId: l.id as string | undefined,
      items: all.filter(i => layerOf(i.id, i.layer ?? 'structure', layerState) === l.id),
    })).filter(g => g.items.length > 0 || !query);
  }, [byLayer, filtered, layerState, query]);

  const total = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'p-2 rounded-lg flex items-center justify-center bg-white text-black shadow-md border border-black/10 hover:bg-white/90',
          className
        )}
        title={`Scene objects (${total})`}
        aria-label="Scene objects"
      >
        <Layers className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'w-72 max-h-[70vh] flex flex-col glass-panel rounded-xl overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="w-4 h-4" />
          Scene Objects
          <span className="text-xs font-normal text-muted-foreground">{total}</span>
        </div>
        <button
          onClick={() => setByLayer(v => !v)}
          className="ml-auto mr-1 px-1.5 py-0.5 rounded text-[10px] hover:bg-muted flex items-center gap-1"
          title={byLayer ? 'Group by type' : 'Group by layer'}
        >
          {byLayer ? <LayoutGrid className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
          {byLayer ? 'Types' : 'Layers'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-2 py-2 border-b border-border">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search objects"
            className="w-full bg-muted/50 rounded-md pl-7 pr-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {shown.length === 0 && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center">No objects found.</p>
        )}
        {shown.map(group => {
          const isCollapsed = collapsed[group.key];
          const layer = group.layerId ? layerState.layers.find(l => l.id === group.layerId) : undefined;
          return (
            <div
              key={group.key}
              className={cn('mb-1 rounded-md transition-colors', dropKey === group.key && 'bg-primary/10 ring-1 ring-primary/40')}
              onDragOver={e => { if (!layer) return; e.preventDefault(); setDropKey(group.key); }}
              onDragLeave={() => setDropKey(k => (k === group.key ? null : k))}
              onDrop={e => {
                e.preventDefault(); setDropKey(null);
                if (!layer) return;
                const obj = e.dataTransfer.getData('text/x-scene-object');
                const lay = e.dataTransfer.getData('text/x-scene-layer');
                if (obj) sceneLayerActions.moveObject(obj, layer.id);
                else if (lay) sceneLayerActions.reorderLayer(lay, layer.id);
              }}
            >
              <div
                className="flex items-center gap-1 px-2"
                draggable={!!layer}
                onDragStart={e => { if (layer) e.dataTransfer.setData('text/x-scene-layer', layer.id); }}
              >
                <button
                  onClick={() => setCollapsed(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                  className="flex-1 min-w-0 flex items-center gap-1.5 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span className={cn('truncate', layer?.hidden && 'line-through opacity-60')}>{group.label}</span>
                  <span className="ml-auto text-[10px] font-semibold">{group.items.length}</span>
                </button>
                {layer && (
                  <button onClick={() => sceneLayerActions.toggleLayer(layer.id)} className="p-1 rounded hover:bg-muted" title={layer.hidden ? 'Show layer' : 'Hide layer'}>
                    {layer.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                )}
                {layer && !layer.builtIn && (
                  <button onClick={() => sceneLayerActions.removeLayer(layer.id)} className="p-1 rounded hover:bg-destructive/20" title="Delete layer">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                )}
              </div>
              {!isCollapsed && (
                <ul>
                  {group.items.map(item => {
                    const hidden = isObjectHidden(item.id, item.layer ?? 'structure', layerState);
                    const own = layerState.hidden.includes(item.id);
                    return (
                    <li key={item.id}>
                      <div
                        draggable
                        onDragStart={e => { e.stopPropagation(); e.dataTransfer.setData('text/x-scene-object', item.id); }}
                        className={cn(
                          'group flex items-center gap-2 pl-6 pr-2 py-1.5 text-xs cursor-pointer transition-colors',
                          item.selected ? 'bg-primary/15 text-foreground' : 'hover:bg-muted/60',
                          hidden && 'opacity-50'
                        )}
                        onClick={item.onSelect}
                      >
                        <span className="text-muted-foreground shrink-0">{item.icon}</span>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.detail && (
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.detail}</span>
                        )}
                        <select
                          value={layerOf(item.id, item.layer ?? 'structure', layerState)}
                          onClick={e => e.stopPropagation()}
                          onChange={e => sceneLayerActions.moveObject(item.id, e.target.value)}
                          className="w-5 opacity-0 group-hover:opacity-100 bg-transparent text-[10px] cursor-pointer"
                          title="Move to layer"
                        >
                          {layerState.layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <button
                          onClick={e => { e.stopPropagation(); sceneLayerActions.toggleObject(item.id); }}
                          className="p-0.5 rounded hover:bg-muted"
                          title={own ? 'Show' : 'Hide'}
                        >
                          {own ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-60" />}
                        </button>
                        {item.onDelete && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              item.onDelete?.();
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 transition-opacity"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        )}
                      </div>
                    </li>
                  );})}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <form
        className="flex items-center gap-1 px-2 py-1.5 border-t border-border"
        onSubmit={e => { e.preventDefault(); if (newLayer.trim()) { sceneLayerActions.addLayer(newLayer); setNewLayer(''); setByLayer(true); } }}
      >
        <input
          value={newLayer}
          onChange={e => setNewLayer(e.target.value)}
          placeholder="New layer name"
          className="flex-1 min-w-0 bg-muted/50 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="submit" className="p-1 rounded hover:bg-muted" title="Add layer"><FolderPlus className="w-3.5 h-3.5" /></button>
      </form>
      {footer && <div className="px-3 py-2 border-t border-border">{footer}</div>}
    </div>
  );
}

export const sceneObjectIcons = {
  pool: <Waves className="w-3.5 h-3.5" />,
  deck: <Square className="w-3.5 h-3.5" />,
  coping: <Frame className="w-3.5 h-3.5" />,
  water: <Droplets className="w-3.5 h-3.5" />,
  stairs: <Footprints className="w-3.5 h-3.5" />,
  chair: <Armchair className="w-3.5 h-3.5" />,
  seating: <Sofa className="w-3.5 h-3.5" />,
  light: <Lightbulb className="w-3.5 h-3.5" />,
  terrain: <TreePine className="w-3.5 h-3.5" />,
  asset: <Boxes className="w-3.5 h-3.5" />,
  fence: <Fence className="w-3.5 h-3.5" />,
};
