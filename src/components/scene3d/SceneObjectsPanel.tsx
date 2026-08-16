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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SceneObjectEntry {
  id: string;
  label: string;
  detail?: string;
  icon: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
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
}

/**
 * Scene Objects widget — lists every object currently in the 3D scene,
 * grouped by kind, with selection and delete actions.
 */
export function SceneObjectsPanel({ groups, className, defaultOpen = false }: SceneObjectsPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

  const total = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups]
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'bg-background/80 backdrop-blur hover:bg-background p-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 text-sm',
          className
        )}
        title="Scene objects"
      >
        <Layers className="w-4 h-4" />
        <span className="hidden md:inline">Objects</span>
        <span className="text-xs font-semibold text-muted-foreground">{total}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'w-64 max-h-[60vh] flex flex-col bg-background/90 backdrop-blur border border-border rounded-xl shadow-2xl overflow-hidden',
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
        {filtered.length === 0 && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center">No objects found.</p>
        )}
        {filtered.map(group => {
          const isCollapsed = collapsed[group.key];
          return (
            <div key={group.key} className="mb-1">
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {group.label}
                <span className="ml-auto text-[10px] font-semibold">{group.items.length}</span>
              </button>
              {!isCollapsed && (
                <ul>
                  {group.items.map(item => (
                    <li key={item.id}>
                      <div
                        className={cn(
                          'group flex items-center gap-2 pl-6 pr-2 py-1.5 text-xs cursor-pointer transition-colors',
                          item.selected ? 'bg-primary/15 text-foreground' : 'hover:bg-muted/60'
                        )}
                        onClick={item.onSelect}
                      >
                        <span className="text-muted-foreground shrink-0">{item.icon}</span>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.detail && (
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.detail}</span>
                        )}
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
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
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
};
