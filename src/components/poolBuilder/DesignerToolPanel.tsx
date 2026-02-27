import * as React from 'react';
const { useState } = React;
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MousePointer2, PenTool, Shapes, Ruler, Layers, Palette, Lightbulb,
  Move, Waves, Droplets, Plus, Minus, Trash2, ChevronDown, ChevronRight,
  Square, Circle, Eye, EyeOff, Grid3X3, Magnet, X
} from 'lucide-react';
import { paverTypes } from '@/data/paverData';
import { TextureBuilder, type TextureConfig } from '../TextureBuilder';

interface DesignerToolPanelProps {
  activeTool: string | null;
  setActiveTool: (tool: any) => void;
  poolShape: 'rectangle' | 'kidney' | 'freeform';
  setPoolShape: (shape: any) => void;
  onShapeSelect: (shape: 'rectangle' | 'kidney' | 'freeform') => void;
  // Materials
  selectedFinishId: string;
  setSelectedFinishId: (id: string) => void;
  selectedCopingId: string;
  setSelectedCopingId: (id: string) => void;
  selectedPaverId: string;
  setSelectedPaverId: (id: string) => void;
  finishes: Array<{ id: string; name: string; image: string }>;
  // Deck
  deckOffset: number;
  setDeckOffset: (v: number) => void;
  onRegenerateDeck: () => void;
  // Features
  onAddFeature: (type: string) => void;
  selectedFeature: string | null;
  onRemoveFeature: () => void;
  onAddStairStep: () => void;
  onRemoveStairStep: () => void;
  featureType?: string;
  // Depth
  depthPoints: Array<{ id: string; position: number; depth: number }>;
  setDepthPoints: (fn: any) => void;
  // Grid
  gridSnap: boolean;
  setGridSnap: (v: boolean) => void;
  snapSize: number;
  setSnapSize: (v: number) => void;
  // Zoom
  zoomLevel: number;
  setZoomLevel: (fn: any) => void;
  // Cost
  projectCost: {
    poolCost: number;
    deckCost: number;
    copingCost: number;
    featuresCost: number;
    total: number;
  };
  // Textures
  customTextures: TextureConfig[];
  setCustomTextures: (t: TextureConfig[]) => void;
  // Spline drawing
  isSplineDrawing: boolean;
  // Shape panel hooks
  onStartDrawPool: () => void;
  onStartDrawDeck: () => void;
  // Pool dimensions
  poolWidth?: number;
  poolLength?: number;
  poolArea?: number;
  deckArea?: number;
}

type PanelSection = 'tools' | 'shape' | 'materials' | 'deck' | 'features' | 'depth' | 'cost' | 'textures' | null;

export function DesignerToolPanel(props: DesignerToolPanelProps) {
  const [expandedSection, setExpandedSection] = useState<PanelSection>('tools');

  const toggleSection = (section: PanelSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const formatCurrency = (val: number) => 
    val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}`;

  return (
    <div className="absolute top-8 right-8 z-20 w-[260px] max-h-[calc(100vh-120px)] flex flex-col">
      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 bg-muted/30 border-b border-border/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">2D Designer</span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatCurrency(props.projectCost.total)}
          </span>
        </div>

        <ScrollArea className="flex-1 max-h-[calc(100vh-180px)]">
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
                {/* Primary tools row */}
                <div className="flex gap-1">
                  <ToolButton icon={<MousePointer2 className="w-4 h-4" />} label="Select" active={props.activeTool === 'select'} onClick={() => props.setActiveTool('select')} />
                  <ToolButton icon={<PenTool className="w-4 h-4" />} label="Draw Pool" active={props.activeTool === 'draw-pool'} onClick={props.onStartDrawPool} />
                  <ToolButton icon={<Layers className="w-4 h-4" />} label="Draw Deck" active={props.activeTool === 'draw-deck'} onClick={props.onStartDrawDeck} />
                  <ToolButton icon={<Plus className="w-4 h-4" />} label="Add Point" active={props.activeTool === 'add'} onClick={() => props.setActiveTool(props.activeTool === 'add' ? 'select' : 'add')} />
                </div>

                {/* Grid snap controls */}
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
                    Snap {props.gridSnap ? 'ON' : 'OFF'}
                  </button>
                  {props.gridSnap && (
                    <select
                      value={props.snapSize}
                      onChange={e => props.setSnapSize(parseInt(e.target.value))}
                      className="h-6 text-[10px] bg-muted/30 border border-border/50 rounded px-1"
                    >
                      <option value="1">1"</option>
                      <option value="6">6"</option>
                      <option value="12">1ft</option>
                    </select>
                  )}
                </div>

                {/* Zoom */}
                <div className="flex items-center gap-1">
                  <button onClick={() => props.setZoomLevel((p: number) => Math.max(p - 0.2, 0.3))} className="w-6 h-6 flex items-center justify-center rounded bg-muted/30 hover:bg-muted/50 text-muted-foreground">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-muted-foreground w-10 text-center font-mono">
                    {(props.zoomLevel * 100).toFixed(0)}%
                  </span>
                  <button onClick={() => props.setZoomLevel((p: number) => Math.min(p + 0.2, 3))} className="w-6 h-6 flex items-center justify-center rounded bg-muted/30 hover:bg-muted/50 text-muted-foreground">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
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
                  Click pool/deck points to edit coordinates. Use Select tool to drag points.
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
                <MaterialSelect
                  label="Pool Finish"
                  value={props.selectedFinishId}
                  onChange={props.setSelectedFinishId}
                  options={props.finishes.map(f => ({ id: f.id, name: f.name, image: f.image }))}
                />
                <MaterialSelect
                  label="Coping"
                  value={props.selectedCopingId}
                  onChange={props.setSelectedCopingId}
                  options={paverTypes.filter(p => p.category === 'paver').map(p => ({ id: p.id, name: p.name, image: p.image }))}
                />
                <MaterialSelect
                  label="Deck Pavers"
                  value={props.selectedPaverId}
                  onChange={props.setSelectedPaverId}
                  options={paverTypes.filter(p => p.category === 'paver').map(p => ({ id: p.id, name: p.name, image: p.image }))}
                />
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
            {expandedSection === 'deck' && (
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

            {/* ═══ FEATURES ═══ */}
            <SectionHeader
              label="Features"
              icon={<Lightbulb className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'features'}
              onToggle={() => toggleSection('features')}
            />
            {expandedSection === 'features' && (
              <div className="px-2 pb-2 space-y-2">
                <div className="grid grid-cols-4 gap-1">
                  <FeatureButton icon={<Move className="w-3.5 h-3.5" />} label="Stairs" onClick={() => props.onAddFeature('stairs')} />
                  <FeatureButton icon={<Lightbulb className="w-3.5 h-3.5" />} label="Light" onClick={() => props.onAddFeature('light')} />
                  <FeatureButton icon={<Waves className="w-3.5 h-3.5" />} label="Jet" onClick={() => props.onAddFeature('jet')} />
                  <FeatureButton icon={<Droplets className="w-3.5 h-3.5" />} label="Fountain" onClick={() => props.onAddFeature('fountain')} />
                </div>
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
                {props.selectedFeature && (
                  <Button size="sm" onClick={props.onRemoveFeature} variant="destructive" className="w-full h-6 text-[10px]">
                    <Trash2 className="h-3 w-3 mr-1" />Remove Feature
                  </Button>
                )}
              </div>
            )}

            {/* ═══ DEPTH ═══ */}
            <SectionHeader
              label="Depth Profile"
              icon={<Ruler className="w-3.5 h-3.5" />}
              expanded={expandedSection === 'depth'}
              onToggle={() => toggleSection('depth')}
            />
            {expandedSection === 'depth' && (
              <div className="px-2 pb-2 space-y-2">
                <div className="flex gap-1">
                  {[...props.depthPoints].sort((a, b) => a.position - b.position).map(dp => (
                    <div key={dp.id} className="flex-1 space-y-0.5">
                      <span className="text-[9px] text-muted-foreground block text-center">
                        {(dp.position * 100).toFixed(0)}%
                      </span>
                      <Input
                        type="number"
                        value={dp.depth.toFixed(1)}
                        onChange={e => {
                          const v = Math.max(1, Math.min(12, parseFloat(e.target.value) || 1));
                          props.setDepthPoints((prev: any[]) => prev.map((d: any) =>
                            d.id === dp.id ? { ...d, depth: v } : d
                          ));
                        }}
                        className="h-6 text-[10px] px-1 text-center"
                        min="1" max="12" step="0.1"
                      />
                      <span className="text-[8px] text-muted-foreground block text-center">ft</span>
                    </div>
                  ))}
                </div>
                {/* Mini depth profile SVG */}
                <div className="bg-muted/20 rounded p-2">
                  <svg width="100%" height="50" viewBox="0 0 200 50" className="overflow-visible">
                    <line x1="5" y1="5" x2="195" y2="5" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.5" />
                    {(() => {
                      const sorted = [...props.depthPoints].sort((a, b) => a.position - b.position);
                      let d = `M ${5 + sorted[0].position * 190},5`;
                      sorted.forEach(dp => {
                        d += ` L ${5 + dp.position * 190},${5 + dp.depth / 12 * 40}`;
                      });
                      d += ` L ${5 + sorted[sorted.length - 1].position * 190},5 Z`;
                      return <path d={d} fill="hsl(var(--primary)/0.15)" stroke="hsl(var(--primary))" strokeWidth="1.5" />;
                    })()}
                    {[...props.depthPoints].sort((a, b) => a.position - b.position).map(dp => (
                      <circle
                        key={dp.id}
                        cx={5 + dp.position * 190}
                        cy={5 + dp.depth / 12 * 40}
                        r="3"
                        fill="hsl(var(--primary))"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {/* ═══ COST BREAKDOWN ═══ */}
            <SectionHeader
              label="Cost Estimate"
              icon={<span className="text-[10px] font-bold">$</span>}
              expanded={expandedSection === 'cost'}
              onToggle={() => toggleSection('cost')}
              badge={formatCurrency(props.projectCost.total)}
            />
            {expandedSection === 'cost' && (
              <div className="px-2 pb-2 space-y-1">
                <CostRow label="Pool Shell" value={props.projectCost.poolCost} />
                <CostRow label="Deck/Pavers" value={props.projectCost.deckCost} />
                <CostRow label="Coping" value={props.projectCost.copingCost} />
                <CostRow label="Features" value={props.projectCost.featuresCost} />
                <div className="border-t border-border/30 pt-1 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-foreground">Total</span>
                  <span className="text-xs font-bold text-primary">
                    ${props.projectCost.total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

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
    </div>
  );
}

/* ─── Sub-components ─── */

function SectionHeader({ label, icon, expanded, onToggle, badge }: {
  label: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${
        expanded
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted/30 text-foreground'
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

function FeatureButton({ icon, label, onClick }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
    >
      {icon}
      <span className="text-[9px]">{label}</span>
    </button>
  );
}

function MaterialSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ id: string; name: string; image: string }>;
}) {
  return (
    <div className="space-y-0.5">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] z-50 bg-background">
          {options.map(opt => (
            <SelectItem key={opt.id} value={opt.id}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${opt.image})` }} />
                <span className="text-[11px]">{opt.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
