import * as React from 'react';
import { createPortal } from 'react-dom';
const { useState } = React;
const SHOW_EXTRA_FEATURE_SECTIONS = false;
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DepthProfileEditor as DepthProfileEditor3D } from '@/components/scene3d/DepthProfileEditor';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MousePointer2, PenTool, Shapes, Ruler, Layers, Palette, Lightbulb,
  Move, Waves, Droplets, Plus, Minus, Trash2, ChevronDown, ChevronRight,
  Square, Circle, Eye, EyeOff, Grid3X3, Magnet, X,
  ArrowDownToLine, Sofa, RectangleVertical, ArrowUpFromLine,
  Leaf, TreeDeciduous, Flower2, Hexagon, Lamp,
  Droplet, GitBranch, ArrowDownWideNarrow, Sparkles, Fan,
  Route, LayoutList, AlignHorizontalDistributeCenter
} from 'lucide-react';
import { paverTypes } from '@/data/paverData';
import { gilmerPools } from '@/data/gilmerPools';
import { pools as catalogPools } from '@/components/PoolCatalog';
import { DECK_PAVERS, FENCE_MATERIALS, FENCE_COLORS, SCREEN_STYLES, SCREEN_COLORS, TURFS } from '@/components/designStudio/SiteElementsLayer';
import { TextureBuilder, type TextureConfig } from '../TextureBuilder';

interface DesignerToolPanelProps {
  activeTool: string | null;
  setActiveTool: (tool: any) => void;
  poolShape: 'rectangle' | 'kidney' | 'freeform';
  setPoolShape: (shape: any) => void;
  onShapeSelect: (shape: 'rectangle' | 'kidney' | 'freeform') => void;
  selectedFinishId: string;
  setSelectedFinishId: (id: string) => void;
  selectedCopingId: string;
  setSelectedCopingId: (id: string) => void;
  selectedPaverId: string;
  setSelectedPaverId: (id: string) => void;
  finishes: Array<{ id: string; name: string; image: string }>;
  deckOffset: number;
  setDeckOffset: (v: number) => void;
  onRegenerateDeck: () => void;
  onAddFeature: (type: string) => void;
  selectedFeature: string | null;
  onRemoveFeature: () => void;
  onAddStairStep: () => void;
  onRemoveStairStep: () => void;
  featureType?: string;
  depthPoints: Array<{ id: string; position: number; depth: number }>;
  setDepthPoints: (fn: any) => void;
  gridSnap: boolean;
  setGridSnap: (v: boolean) => void;
  snapSize: number;
  setSnapSize: (v: number) => void;
  zoomLevel: number;
  setZoomLevel: (fn: any) => void;
  projectCost: {
    poolCost: number;
    deckCost: number;
    copingCost: number;
    featuresCost: number;
    total: number;
    poolArea?: number;
    poolRate?: number;
    deckArea?: number;
    deckRate?: number;
    copingArea?: number;
    copingRate?: number;
    featuresList?: Array<{ type: string; cost: number }>;
  };
  customTextures: TextureConfig[];
  setCustomTextures: (t: TextureConfig[]) => void;
  isSplineDrawing: boolean;
  onStartDrawPool: () => void;
  onStartDrawDeck: () => void;
  poolWidth?: number;
  poolLength?: number;
  poolArea?: number;
  deckArea?: number;
  // Feature properties
  selectedFeatureData?: {
    type: string;
    steps?: number;
    seatWidth?: number;
    seatDepth?: number;
    wallHeight?: number;
    width?: number;
    length?: number;
    rockSize?: 'small' | 'medium' | 'large';
    treeType?: string;
    lightColor?: string;
    lightIntensity?: number;
    x?: number;
    y?: number;
  };
  onUpdateFeature?: (updates: Record<string, any>) => void;
  scale?: number;
  pendingPlacement?: string | null;
  /** Main pool outline in feet — feeds the 3D Studio depth editor's axis. */
  poolPointsFt?: Array<{ x: number; y: number }>;
  /** Places an inventory pool (width × length in feet) on the board. */
  onPickPool?: (widthFt: number, lengthFt: number) => void;
}

/* Inventory pools (main-site catalogs, same order, own photos) with measurements parsed to feet. */
const parseFt = (s: string) => { const m = s.match(/(\d+(?:\.\d+)?)\s*'?\s*(?:(\d+)\s*")?/); return m ? parseFloat(m[1]) + (m[2] ? parseInt(m[2]) / 12 : 0) : 0; };
const INVENTORY_POOLS = [...catalogPools, ...gilmerPools]
  .filter(p => p.image && p.dimensions)
  .map(p => { const [a, b] = String(p.dimensions).split(/\s*[x×]\s*/i); const w = parseFt(a ?? ''), l = parseFt(b ?? ''); return { model: p.model, image: p.image as string, dims: String(p.dimensions), w: Math.min(w, l), l: Math.max(w, l) }; })
  .filter(p => p.w > 0 && p.l > 0);

function ColorChips({ colors, value, onPick }: { colors: { id: string; hex: string }[]; value?: string; onPick: (hex: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {colors.map(c => (
        <button key={c.id} onClick={() => onPick(c.hex)}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold capitalize text-foreground ${value === c.hex ? 'border-foreground' : 'border-border'}`}>
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c.hex }} />{c.id}
        </button>
      ))}
    </div>
  );
}

type PanelSection = 'tools' | 'shape' | 'materials' | 'deck' | 'pool-features' | 'landscape' | 'water-features' | 'depth' | 'cost' | 'textures' | null;

export function DesignerToolPanel(props: DesignerToolPanelProps) {
  const [expandedSection, setExpandedSection] = useState<PanelSection>(null);
  const [depthAnchorId, setDepthAnchorId] = useState<string | null>(null);
  // Board selection (broadcast by SiteElementsLayer) drives the Materials panel.
  const [boardSel, setBoardSel] = useState<{ id: string | null; kind: string | null; color?: string; style?: string } | null>(null);
  React.useEffect(() => {
    const h = (e: Event) => setBoardSel((e as CustomEvent).detail);
    window.addEventListener('design-studio:selection', h);
    return () => window.removeEventListener('design-studio:selection', h);
  }, []);
  const restyle = (patch: Record<string, unknown>) => {
    if (boardSel?.id) window.dispatchEvent(new CustomEvent('design-studio:site-restyle', { detail: { id: boardSel.id, patch } }));
  };

  const toggleSection = (section: PanelSection) => {
    setExpandedSection(prev => {
      const next = prev === section ? null : section;
      if (next) window.dispatchEvent(new CustomEvent('studio-rail:open', { detail: 'tools' }));
      return next;
    });
  };
  // Rail buttons render inside the shared left floating menu (SiteElementsLayer slot) when present.
  const [railSlot, setRailSlot] = useState<HTMLElement | null>(null);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);
  React.useEffect(() => {
    let raf = 0;
    const find = () => { const el = document.getElementById('studio-rail-slot'); setHeaderSlot(document.getElementById('board-header-slot')); if (el) setRailSlot(el); else raf = requestAnimationFrame(find); };
    find();
    const h = (e: Event) => { if ((e as CustomEvent).detail !== 'tools') setExpandedSection(null); };
    window.addEventListener('studio-rail:open', h);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('studio-rail:open', h); };
  }, []);

  const formatCurrency = (val: number) => 
    val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}`;

  const scaleVal = props.scale || 10;
  const snapControls = (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => props.setGridSnap(!props.gridSnap)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                      props.gridSnap
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <Magnet className="w-3 h-3" />
                    <span className="hidden sm:inline">Snap {props.gridSnap ? 'ON' : 'OFF'}</span>
                  </button>
                  {props.gridSnap && (
                    <select
                      value={props.snapSize}
                      onChange={e => props.setSnapSize(parseInt(e.target.value))}
                      className="hidden sm:block h-6 text-[10px] bg-muted/30 border border-border/50 rounded px-1"
                    >
                      <option value="1">1"</option>
                      <option value="6">6"</option>
                      <option value="12">1ft</option>
                    </select>
                  )}
                </div>
  );

  return (
    <div className={railSlot ? "absolute left-[5.25rem] top-16 z-[30] bottom-0 flex pointer-events-none" : "absolute top-0 right-0 bottom-0 z-20 flex flex-row items-stretch pointer-events-none"}>
      {/* Section flyout (opens left of the rail); depth uses the 3D Studio editor instead. */}
      {expandedSection && expandedSection !== 'depth' && (
      <div className="pointer-events-auto w-72 self-start max-h-[calc(100%-5rem)] rounded-2xl border border-border bg-background/95 shadow-sm backdrop-blur overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">{RAIL.find(r => r.id === expandedSection)?.label}</span>
          <button onClick={() => setExpandedSection(null)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-1.5 space-y-1">

            {/* ═══ TOOLS ═══ */}
            <SectionHeader
              label="Tools"
              icon={<MousePointer2 className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'tools'}
              onToggle={() => toggleSection('tools')}
            />
            {expandedSection === 'tools' && (
              <div className="px-2 pb-2 space-y-2">
                <div className="flex gap-1">
                  <ToolButton icon={<MousePointer2 className="w-4 h-4" />} label="Select" active={props.activeTool === 'select'} onClick={() => props.setActiveTool('select')} />
                  <ToolButton icon={<PenTool className="w-4 h-4" />} label="Draw Pool" active={props.activeTool === 'draw-pool'} onClick={props.onStartDrawPool} />
                  <ToolButton icon={<Layers className="w-4 h-4" />} label="Draw Deck" active={props.activeTool === 'draw-deck'} onClick={props.onStartDrawDeck} />
                  <ToolButton icon={<Plus className="w-4 h-4" />} label="Add Point" active={props.activeTool === 'add'} onClick={() => props.setActiveTool(props.activeTool === 'add' ? 'select' : 'add')} />
                </div>
                {!headerSlot && snapControls}
              </div>
            )}

            {/* ═══ POOL SHAPE ═══ */}
            <SectionHeader
              label="Pool Shape"
              icon={<Shapes className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'shape'}
              onToggle={() => toggleSection('shape')}
              badge={props.poolWidth ? `${props.poolWidth.toFixed(0)}' × ${props.poolLength?.toFixed(0)}'` : undefined}
            />
            {expandedSection === 'shape' && (
              <div className="px-2 pb-2 space-y-2">
                <button onClick={() => { props.onStartDrawPool(); setExpandedSection(null); }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-background hover:opacity-90">
                  <PenTool className="h-4 w-4" />Draw a pool
                </button>
                {props.onPickPool && (
                  <div className="grid grid-cols-2 gap-2">
                    {INVENTORY_POOLS.map(p => (
                      <button key={p.model} onClick={() => props.onPickPool!(p.w, p.l)} title={p.model}
                        className="overflow-hidden rounded-lg border border-border bg-background text-left hover:border-foreground">
                        <img src={p.image} alt={p.model} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        <span className="block px-1.5 py-1 text-[11px] font-bold text-foreground">{p.dims}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Basic shapes</p>
                <div className="grid grid-cols-3 gap-1">
                  {(['rectangle', 'kidney', 'freeform'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => props.onShapeSelect(shape)}
                      className={`py-1.5 px-2 rounded-md text-[10px] font-medium transition-all capitalize ${
                        props.poolShape === shape
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-muted/20 text-muted-foreground border border-transparent hover:bg-muted/40'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
                {props.poolWidth && (
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-muted/20 rounded px-2 py-1">
                      <span className="text-muted-foreground">Area</span>
                      <span className="block font-semibold text-foreground">{props.poolArea?.toFixed(0)} sq ft</span>
                    </div>
                    <div className="bg-muted/20 rounded px-2 py-1">
                      <span className="text-muted-foreground">Deck</span>
                      <span className="block font-semibold text-foreground">{props.deckArea?.toFixed(0)} sq ft</span>
                    </div>
                  </div>
                )}
                <p className="text-[9px] text-muted-foreground/70">
                  Click pool/deck points to edit. Use Select tool to drag.
                </p>
              </div>
            )}

            {/* ═══ MATERIALS ═══ */}
            <SectionHeader
              label="Materials"
              icon={<Palette className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'materials'}
              onToggle={() => toggleSection('materials')}
            />
            {expandedSection === 'materials' && (
              <div className="px-2 pb-2 space-y-2">
                {!boardSel?.kind && (
                  <p className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-xs font-semibold text-foreground">
                    Select an element on the board — a pool, deck, fence, screen or turf — to see its materials.
                  </p>
                )}
                {boardSel?.kind === 'pool' && (<>
                  <MaterialSelect label="Pool Finish" value={props.selectedFinishId} onChange={props.setSelectedFinishId}
                    options={props.finishes.map(f => ({ id: f.id, name: f.name, image: f.image }))} />
                  <MaterialSelect label="Coping" value={props.selectedCopingId} onChange={props.setSelectedCopingId}
                    options={paverTypes.filter(p => p.category === 'paver').map(p => ({ id: p.id, name: p.name, image: p.image }))} />
                </>)}
                {boardSel?.kind === 'deck' && (
                  <MaterialSelect label="Deck Pavers"
                    value={boardSel.id?.startsWith('deck-') ? (boardSel.style ?? '') : props.selectedPaverId}
                    onChange={(id) => {
                      if (boardSel.id?.startsWith('deck-')) { const d = DECK_PAVERS.find(x => x.id === id); if (d) restyle({ style: d.id, label: d.label, rate: d.rate }); }
                      else props.setSelectedPaverId(id);
                    }}
                    options={paverTypes.filter(p => p.category === 'paver').map(p => ({ id: p.id, name: p.name, image: p.image }))} />
                )}
                {boardSel?.kind === 'fence' && (<>
                  <MaterialSelect label="Fence" value={boardSel.style ?? ''} onChange={(id) => { const m = FENCE_MATERIALS.find(x => x.id === id); if (m) restyle({ style: m.id, label: m.label }); }}
                    options={FENCE_MATERIALS.map(m => ({ id: m.id, name: m.label, image: m.image }))} />
                  <ColorChips colors={FENCE_COLORS} value={boardSel.color} onPick={(c) => restyle({ color: c })} />
                </>)}
                {boardSel?.kind === 'enclosure' && (<>
                  <MaterialSelect label="Screen" value={boardSel.style ?? ''} onChange={(id) => { const s = SCREEN_STYLES.find(x => x.id === id); if (s) restyle({ style: s.id, label: s.label, rate: s.rate }); }}
                    options={SCREEN_STYLES.map(s => ({ id: s.id, name: s.label, image: s.image }))} />
                  <ColorChips colors={SCREEN_COLORS} value={boardSel.color} onPick={(c) => restyle({ color: c })} />
                </>)}
                {boardSel?.kind === 'turf' && (
                  <MaterialSelect label="Turf" value={TURFS.find(t => t.color === boardSel.color)?.id ?? ''}
                    onChange={(id) => { const t = TURFS.find(x => x.id === id); if (t) restyle({ color: t.color, label: t.label, rate: t.rate }); }}
                    options={TURFS.map(t => ({ id: t.id, name: t.label, image: t.image }))} />
                )}
              </div>
            )}

            {/* ═══ DECK ═══ */}
            <SectionHeader
              label="Deck"
              icon={<Grid3X3 className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'deck'}
              onToggle={() => toggleSection('deck')}
              badge={`${props.deckOffset}ft offset`}
            />
            {(expandedSection === 'deck' || expandedSection === 'tools') && (
              <div className="px-2 pb-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] text-muted-foreground w-14">Offset</Label>
                  <Input
                    type="number"
                    value={props.deckOffset}
                    onChange={e => {
                      const v = Math.max(3, parseFloat(e.target.value) || 3);
                      props.setDeckOffset(v);
                      props.onRegenerateDeck();
                    }}
                    className="h-6 w-16 text-xs px-1.5 text-center"
                    min="3"
                    step="0.5"
                  />
                  <span className="text-[9px] text-muted-foreground">ft</span>
                </div>
                <p className="text-[9px] text-muted-foreground/70">
                  Deck points are editable. Click any deck corner to type exact coordinates.
                </p>
              </div>
            )}
            {/* Pool Structure, Landscape and Water Features are hidden for now (owner request). Set SHOW_EXTRA_FEATURE_SECTIONS to true to bring them back. */}
            {SHOW_EXTRA_FEATURE_SECTIONS && (<>

            {/* ═══ POOL FEATURES ═══ */}
            <SectionHeader
              label="Pool Structure"
              icon={<Waves className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'pool-features'}
              onToggle={() => toggleSection('pool-features')}
            />
            {expandedSection === 'pool-features' && (
              <div className="px-2 pb-2 space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <FeatureButton icon={<ArrowDownToLine className="w-3.5 h-3.5" />} label="Stairs" onClick={() => props.onAddFeature('stairs')} isActive={props.pendingPlacement === 'stairs'} />
                  <FeatureButton icon={<Sofa className="w-3.5 h-3.5" />} label="Seat" onClick={() => props.onAddFeature('pool-seat')} isNew isActive={props.pendingPlacement === 'pool-seat'} />
                  <FeatureButton icon={<RectangleVertical className="w-3.5 h-3.5" />} label="Wall" onClick={() => props.onAddFeature('pool-wall')} isNew isActive={props.pendingPlacement === 'pool-wall'} />
                  <FeatureButton icon={<Lightbulb className="w-3.5 h-3.5" />} label="Light" onClick={() => props.onAddFeature('light')} isActive={props.pendingPlacement === 'light'} />
                  <FeatureButton icon={<Droplets className="w-3.5 h-3.5" />} label="Jet" onClick={() => props.onAddFeature('jet')} isActive={props.pendingPlacement === 'jet'} />
                  <FeatureButton icon={<ArrowUpFromLine className="w-3.5 h-3.5" />} label="Diving" onClick={() => props.onAddFeature('diving-board')} isNew isActive={props.pendingPlacement === 'diving-board'} />
                </div>
                {/* Stair controls when stairs selected */}
                {props.selectedFeature && props.featureType === 'stairs' && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={props.onAddStairStep} variant="outline" className="flex-1 h-6 text-[10px]">
                      <Plus className="h-3 w-3 mr-0.5" />Step
                    </Button>
                    <Button size="sm" onClick={props.onRemoveStairStep} variant="outline" className="flex-1 h-6 text-[10px]">
                      <Minus className="h-3 w-3 mr-0.5" />Step
                    </Button>
                  </div>
                )}
                {/* Feature properties panel */}
                {props.selectedFeature && props.selectedFeatureData && (
                  <FeaturePropertiesPanel
                    featureData={props.selectedFeatureData}
                    onUpdate={props.onUpdateFeature}
                    scale={scaleVal}
                  />
                )}
                {props.selectedFeature && (
                  <Button size="sm" onClick={props.onRemoveFeature} variant="destructive" className="w-full h-6 text-[10px]">
                    <Trash2 className="h-3 w-3 mr-1" />Remove Feature
                  </Button>
                )}
              </div>
            )}

            {/* ═══ LANDSCAPE ═══ */}
            <SectionHeader
              label="Landscape"
              icon={<TreeDeciduous className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'landscape'}
              onToggle={() => toggleSection('landscape')}
            />
            {expandedSection === 'landscape' && (
              <div className="px-2 pb-2 space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <FeatureButton icon={<Leaf className="w-3.5 h-3.5" />} label="Grass" onClick={() => props.onAddFeature('grass-region')} isNew isActive={props.pendingPlacement === 'grass-region'} />
                  <FeatureButton icon={<Route className="w-3.5 h-3.5" />} label="Path" onClick={() => props.onAddFeature('pathway')} isActive={props.pendingPlacement === 'pathway'} />
                  <FeatureButton icon={<Minus className="w-3.5 h-3.5" />} label="Edging" onClick={() => props.onAddFeature('edging')} isNew isActive={props.pendingPlacement === 'edging'} />
                  <FeatureButton icon={<TreeDeciduous className="w-3.5 h-3.5" />} label="Tree" onClick={() => props.onAddFeature('tree')} isActive={props.pendingPlacement === 'tree'} />
                  <FeatureButton icon={<Flower2 className="w-3.5 h-3.5" />} label="Shrub" onClick={() => props.onAddFeature('shrub')} isActive={props.pendingPlacement === 'shrub'} />
                  <FeatureButton icon={<AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />} label="Hedge" onClick={() => props.onAddFeature('hedge-row')} isNew isActive={props.pendingPlacement === 'hedge-row'} />
                  <FeatureButton icon={<LayoutList className="w-3.5 h-3.5" />} label="Plants" onClick={() => props.onAddFeature('plant-row')} isNew isActive={props.pendingPlacement === 'plant-row'} />
                  <FeatureButton icon={<Hexagon className="w-3.5 h-3.5" />} label="Rock" onClick={() => props.onAddFeature('rock')} isNew isActive={props.pendingPlacement === 'rock'} />
                  <FeatureButton icon={<Circle className="w-3.5 h-3.5" />} label="Boulder" onClick={() => props.onAddFeature('boulder')} isNew isActive={props.pendingPlacement === 'boulder'} />
                  <FeatureButton icon={<Lamp className="w-3.5 h-3.5" />} label="Path Light" onClick={() => props.onAddFeature('landscape-light')} isNew isActive={props.pendingPlacement === 'landscape-light'} />
                </div>
                {/* Properties for selected landscape feature */}
                {props.selectedFeature && props.selectedFeatureData && 
                  ['rock','boulder','hedge-row','plant-row','landscape-light','edging','grass-region','tree','shrub','pathway'].includes(props.selectedFeatureData.type) && (
                  <FeaturePropertiesPanel
                    featureData={props.selectedFeatureData}
                    onUpdate={props.onUpdateFeature}
                    scale={scaleVal}
                  />
                )}
                {props.selectedFeature && props.selectedFeatureData && 
                  ['rock','boulder','hedge-row','plant-row','landscape-light','edging','grass-region','tree','shrub','pathway'].includes(props.selectedFeatureData.type) && (
                  <Button size="sm" onClick={props.onRemoveFeature} variant="destructive" className="w-full h-6 text-[10px]">
                    <Trash2 className="h-3 w-3 mr-1" />Remove
                  </Button>
                )}
              </div>
            )}

            {/* ═══ WATER FEATURES ═══ */}
            <SectionHeader
              label="Water Features"
              icon={<Droplet className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'water-features'}
              onToggle={() => toggleSection('water-features')}
            />
            {expandedSection === 'water-features' && (
              <div className="px-2 pb-2 space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <FeatureButton icon={<Droplet className="w-3.5 h-3.5" />} label="Fountain" onClick={() => props.onAddFeature('fountain')} isActive={props.pendingPlacement === 'fountain'} />
                  <FeatureButton icon={<Waves className="w-3.5 h-3.5" />} label="Pond" onClick={() => props.onAddFeature('pond')} isNew isActive={props.pendingPlacement === 'pond'} />
                  <FeatureButton icon={<GitBranch className="w-3.5 h-3.5" />} label="Stream" onClick={() => props.onAddFeature('stream')} isNew isActive={props.pendingPlacement === 'stream'} />
                  <FeatureButton icon={<ArrowDownWideNarrow className="w-3.5 h-3.5" />} label="Waterfall" onClick={() => props.onAddFeature('waterfall')} isNew isActive={props.pendingPlacement === 'waterfall'} />
                  <FeatureButton icon={<Sparkles className="w-3.5 h-3.5" />} label="Deck Jet" onClick={() => props.onAddFeature('jumping-jet')} isNew isActive={props.pendingPlacement === 'jumping-jet'} />
                  <FeatureButton icon={<Fan className="w-3.5 h-3.5" />} label="Sprinkler" onClick={() => props.onAddFeature('sprinkler')} isNew isActive={props.pendingPlacement === 'sprinkler'} />
                </div>
                {props.selectedFeature && props.selectedFeatureData && 
                  ['fountain','pond','stream','waterfall','jumping-jet','sprinkler','water-curtain'].includes(props.selectedFeatureData.type) && (
                  <>
                    <FeaturePropertiesPanel
                      featureData={props.selectedFeatureData}
                      onUpdate={props.onUpdateFeature}
                      scale={scaleVal}
                    />
                    <Button size="sm" onClick={props.onRemoveFeature} variant="destructive" className="w-full h-6 text-[10px]">
                      <Trash2 className="h-3 w-3 mr-1" />Remove
                    </Button>
                  </>
                )}
              </div>
            )}
            </>)}

            {/* Depth Profile = the exact 3D Studio editor (same anchors shape). */}

            {/* Cost estimate lives only in the header take-off dropdown. */}

            {/* ═══ TEXTURES ═══ */}
            <SectionHeader
              label="Custom Textures"
              icon={<Palette className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'textures'}
              onToggle={() => toggleSection('textures')}
            />
            {expandedSection === 'textures' && (
              <div className="px-2 pb-2">
                <TextureBuilder currentTextures={props.customTextures} onTexturesChange={props.setCustomTextures} />
              </div>
            )}

          </div>
        </ScrollArea>
      </div>
      )}

      {headerSlot && createPortal(snapControls, headerSlot)}
      {railSlot ? (['studio-rail-slot', 'studio-rail-slot-pools', 'studio-rail-slot-end'] as const).map(slotId => { const el = slotId === 'studio-rail-slot' ? railSlot : document.getElementById(slotId); return el ? <React.Fragment key={slotId}>{createPortal(RAIL.filter(r => r.slot === slotId).map(r => (
        <button
          key={r.id}
          title={r.label}
          onClick={() => toggleSection(r.id)}
          aria-pressed={expandedSection === r.id}
          className={`pointer-events-auto flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.06em] transition-colors ${expandedSection === r.id ? 'bg-foreground text-background' : 'text-foreground hover:bg-foreground/10'}`}
        >
          {r.icon}
          <span className="leading-none">{r.label}</span>
        </button>
      )), el)}</React.Fragment> : null; }) : (
      <nav aria-label="2D Designer tools" className="pointer-events-auto flex w-16 shrink-0 flex-col border-l border-border bg-background/95 backdrop-blur">
        {RAIL.map(r => (
          <button key={r.id} onClick={() => toggleSection(r.id)} aria-pressed={expandedSection === r.id}
            className={`flex flex-col items-center gap-1 border-b border-border px-1 py-3 text-[8.5px] uppercase tracking-[0.12em] transition-colors ${expandedSection === r.id ? 'bg-foreground text-background' : 'text-foreground hover:bg-foreground/10'}`}>
            {r.icon}<span className="leading-tight text-center">{r.label}</span>
          </button>
        ))}
      </nav>
      )}

      {/* Depth editor is portalled to the page so the narrow click-through rail can't clip it off-screen. */}
      {expandedSection === 'depth' && createPortal(
        <div className="fixed inset-x-0 top-20 z-[100] flex justify-center pointer-events-none">
          <div className="relative w-[460px] max-w-[calc(100vw-2rem)] pointer-events-auto [&>div]:!static [&>div]:!translate-x-0 [&>div]:!left-auto [&>div]:!top-auto [&>div]:![translate:none]">
            <DepthProfileEditor3D
              isOpen
              onClose={() => setExpandedSection(null)}
              linearDepthAnchors={props.depthPoints}
              onLinearDepthAnchorsChange={(a) => props.setDepthPoints(() => a)}
              selectedAnchorId={depthAnchorId}
              onSelectAnchor={setDepthAnchorId}
              poolPoints={props.poolPointsFt as any}
              poolDimensions={props.poolLength && props.poolWidth ? { length: props.poolLength, width: props.poolWidth } : undefined}
            />
          </div>
        </div>, document.body)}
    </div>
  );
}

// Unified left rail order: Tools, Materials, Depth | Pools | (site: Decks, Fences, Turf, Screens, Board) | Textures.
const RAIL: Array<{ id: Exclude<PanelSection, null>; label: string; icon: React.ReactNode; slot: 'studio-rail-slot' | 'studio-rail-slot-pools' | 'studio-rail-slot-end' }> = [
  { id: 'tools', label: 'Tools', icon: <MousePointer2 className="h-4 w-4" />, slot: 'studio-rail-slot' },
  { id: 'materials', label: 'Materials', icon: <Palette className="h-4 w-4" />, slot: 'studio-rail-slot' },
  { id: 'depth', label: 'Depth', icon: <Ruler className="h-4 w-4" />, slot: 'studio-rail-slot' },
  { id: 'shape', label: 'Pools', icon: <Waves className="h-4 w-4" />, slot: 'studio-rail-slot-pools' },
  { id: 'textures', label: 'Textures', icon: <Layers className="h-4 w-4" />, slot: 'studio-rail-slot-end' },
];

/* ─── Sub-components ─── */

function SectionHeader({ label, icon, expanded, onToggle, badge }: {
  label: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  // Section headers now live in the vertical rail; kept for call-site compatibility.
  void label; void icon; void expanded; void onToggle; void badge;
  return null;
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-2 py-1.5 border transition-colors text-left text-[11px] uppercase tracking-[0.2em] ${
        expanded
          ? 'border-foreground bg-foreground text-background'
          : 'border-transparent hover:border-border text-foreground'
      }`}
    >
      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-[11px] font-medium flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
      {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
}

function ToolButton({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`flex-1 h-8 flex items-center justify-center rounded-lg transition-all ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            }`}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FeatureButton({ icon, label, onClick, isNew, isActive }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isNew?: boolean;
  isActive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all ${
        isActive
          ? 'bg-primary/20 text-primary border border-primary/40 ring-1 ring-primary/30'
          : 'bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="text-[9px]">{label}</span>
      {isNew && !isActive && (
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
      {isActive && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </button>
  );
}

function MaterialSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ id: string; name: string; image: string }>;
}) {
  // Swatch grid identical in style to the 3D texture picker.
  const current = options.find(o => o.id === value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</Label>
        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{current?.name}</span>
      </div>
      {/* Same swatch card as the Whole property picker — square photo, name below (Imagine Engine Studios Corp). */}
      <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            title={opt.name}
            className={`flex flex-col border text-left text-[10px] transition-colors ${opt.id === value ? 'border-foreground' : 'border-border hover:border-foreground'}`}
          >
            <img loading="lazy" decoding="async" src={opt.image} alt={opt.name} className="aspect-square w-full object-cover" />
            <span className="block min-h-[2.25rem] p-1 leading-tight">{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[10px] font-medium text-foreground">${value.toLocaleString()}</span>
    </div>
  );
}

function CostRowDetailed({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="space-y-0">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-semibold text-foreground">${value.toLocaleString()}</span>
      </div>
      {detail && (
        <div className="text-[8px] text-muted-foreground/70 pl-1">{detail}</div>
      )}
    </div>
  );
}

function FeaturePropertiesPanel({ featureData, onUpdate, scale }: {
  featureData: {
    type: string;
    steps?: number;
    seatWidth?: number;
    seatDepth?: number;
    wallHeight?: number;
    width?: number;
    length?: number;
    rockSize?: 'small' | 'medium' | 'large';
    treeType?: string;
    lightColor?: string;
    lightIntensity?: number;
    x?: number;
    y?: number;
  };
  onUpdate?: (updates: Record<string, any>) => void;
  scale: number;
}) {
  if (!onUpdate) return null;
  const { type } = featureData;

  return (
    <div className="bg-muted/20 rounded p-2 space-y-1.5 border border-border/30">
      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Properties</span>
      
      {/* Position */}
      {featureData.x != null && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-[9px] text-muted-foreground">X (ft)</Label>
            <Input type="number" value={((featureData.x || 0) / scale).toFixed(1)} onChange={e => onUpdate({ x: parseFloat(e.target.value) * scale })} className="h-5 text-[10px] px-1" step="0.5" />
          </div>
          <div className="flex-1">
            <Label className="text-[9px] text-muted-foreground">Y (ft)</Label>
            <Input type="number" value={((featureData.y || 0) / scale).toFixed(1)} onChange={e => onUpdate({ y: parseFloat(e.target.value) * scale })} className="h-5 text-[10px] px-1" step="0.5" />
          </div>
        </div>
      )}

      {/* Pool seat */}
      {type === 'pool-seat' && (
        <>
          <PropSlider label="Width" value={(featureData.seatWidth || 60) / scale} min={3} max={12} step={0.5} unit="ft" onChange={v => onUpdate({ seatWidth: v * scale })} />
          <PropSlider label="Depth" value={(featureData.seatDepth || 20) / scale} min={1} max={4} step={0.5} unit="ft" onChange={v => onUpdate({ seatDepth: v * scale })} />
        </>
      )}

      {/* Pool wall */}
      {type === 'pool-wall' && (
        <>
          <PropSlider label="Width" value={(featureData.width || 80) / scale} min={4} max={20} step={1} unit="ft" onChange={v => onUpdate({ width: v * scale })} />
          <PropSlider label="Height" value={featureData.wallHeight || 3} min={1} max={6} step={0.5} unit="ft" onChange={v => onUpdate({ wallHeight: v })} />
        </>
      )}

      {/* Diving board */}
      {type === 'diving-board' && (
        <PropSlider label="Length" value={(featureData.length || 100) / scale} min={6} max={16} step={1} unit="ft" onChange={v => onUpdate({ length: v * scale })} />
      )}

      {/* Rock/Boulder size */}
      {(type === 'rock' || type === 'boulder') && (
        <div>
          <Label className="text-[9px] text-muted-foreground">Size</Label>
          <div className="flex gap-1 mt-0.5">
            {(['small', 'medium', 'large'] as const).map(s => (
              <button key={s} onClick={() => onUpdate({ rockSize: s })}
                className={`flex-1 py-1 text-[9px] rounded capitalize ${featureData.rockSize === s ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground'}`}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Tree type */}
      {type === 'tree' && (
        <div>
          <Label className="text-[9px] text-muted-foreground">Type</Label>
          <div className="grid grid-cols-3 gap-1 mt-0.5">
            {(['palm', 'oak', 'pine'] as const).map(t => (
              <button key={t} onClick={() => onUpdate({ treeType: t })}
                className={`py-1 text-[9px] rounded capitalize ${featureData.treeType === t ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground'}`}
              >{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Light color */}
      {(type === 'landscape-light' || type === 'light') && (
        <div className="flex items-center gap-2">
          <Label className="text-[9px] text-muted-foreground">Color</Label>
          <input type="color" value={featureData.lightColor || '#fffacd'} onChange={e => onUpdate({ lightColor: e.target.value })} className="w-6 h-5 rounded border-0 cursor-pointer" />
        </div>
      )}
    </div>
  );
}

function PropSlider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between">
        <Label className="text-[9px] text-muted-foreground">{label}</Label>
        <span className="text-[9px] text-foreground font-medium">{value.toFixed(1)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 mt-0.5 accent-primary"
      />
    </div>
  );
}
