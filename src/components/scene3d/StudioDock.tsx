/**
 * Studio dock (3D viewer, bottom-left): three tools in one place.
 *  - Genius: describe a project in words → full scene (pool shape/size, depth
 *    profile, deck, coping, stairs, seating, lights, finishes, 3D models).
 *    The brief goes to the `scene-genius` edge function; the plan is applied here.
 *  - Projects: save / load / delete versions of the scene (this browser).
 *  - Music: original ocarina-style ambient loop, mutable, volume control.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Wand2, FolderOpen, Music2, VolumeX, Loader2, Save, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { productToScene } from './SceneConverter';
import { paverTypes } from '@/data/paverData';
import { poolFinishes } from '@/data/consolidatedProducts';
import { mitredOffsetRing } from '@/utils/polygonGeometry';
import type { Scene3D, TextureConfig } from './types';
import type { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './poolAssetTypes';
import type { PoolLightConfig } from './types';
import type { TerrainAsset } from './TerrainEditor';
import { BAR_STOOL_PRESET } from './AssetEditorExtras';
import { ambientMusic } from './ambientMusic';

export interface DockSnapshot {
  scene: Scene3D;
  poolStairs: PoolStairConfig[];
  poolChairs: PoolChairConfig[];
  contourSeating: ContourSeatingConfig[];
  poolLights: PoolLightConfig[];
  terrainAssets: TerrainAsset[];
}

interface Props {
  snapshot: DockSnapshot;
  apply: (next: Partial<DockSnapshot>) => void;
  textureLibrary: { finishes: TextureConfig[]; pavers: TextureConfig[]; coping: TextureConfig[] };
  setNight?: (v: boolean) => void;
}

/* ---------------- shapes (feet, centred) ---------------- */
type Shape = 'rectangle' | 'oval' | 'kidney' | 'l-shape' | 'freeform' | 'roman';
function shapePoints(shape: Shape, W: number, L: number): { x: number; y: number }[] {
  const hw = W / 2, hl = L / 2;
  const N = 96;
  const ring = (fn: (t: number) => [number, number]) =>
    Array.from({ length: N }, (_, i) => { const [x, y] = fn((i / N) * Math.PI * 2); return { x, y }; });
  switch (shape) {
    case 'oval': return ring((t) => [Math.cos(t) * hw, Math.sin(t) * hl]);
    case 'kidney': return ring((t) => {
      // pinch the +x side in the middle → bean shape
      const d = Math.atan2(Math.sin(t), Math.cos(t));
      const pinch = 1 - 0.38 * Math.exp(-(d * d) / 0.25);
      return [Math.cos(t) * hw * pinch, Math.sin(t) * hl];
    });
    case 'freeform': return ring((t) => {
      const r = 1 + 0.08 * Math.sin(3 * t) + 0.05 * Math.cos(2 * t);
      return [Math.cos(t) * hw * r, Math.sin(t) * hl * r];
    });
    case 'roman': {
      const r = Math.min(hw, hl);
      const pts = [{ x: -hw, y: -hl }, { x: hw, y: -hl }, { x: hw, y: hl - r }];
      for (let i = 1; i < 32; i++) { const a = (i / 32) * Math.PI; pts.push({ x: hw * Math.cos(a), y: hl - r + r * Math.sin(a) }); }
      pts.push({ x: -hw, y: hl - r });
      return pts;
    }
    case 'l-shape': return [
      { x: -hw, y: -hl }, { x: hw, y: -hl }, { x: hw, y: hl * 0.1 }, { x: hw * 0.1, y: hl * 0.1 },
      { x: hw * 0.1, y: hl }, { x: -hw, y: hl },
    ];
    default: return [{ x: -hw, y: -hl }, { x: hw, y: -hl }, { x: hw, y: hl }, { x: -hw, y: hl }];
  }
}

const clamp = (v: unknown, lo: number, hi: number, d: number) => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : d;
  return Math.min(hi, Math.max(lo, n));
};
const pickTexture = (list: TextureConfig[], hint: unknown, fallback: TextureConfig) => {
  if (typeof hint !== 'string' || !hint.trim()) return fallback;
  const words = hint.toLowerCase().split(/\s+/);
  return list.find((t) => words.some((w) => w.length > 2 && t.name.toLowerCase().includes(w))) ?? fallback;
};

async function sketchfabFirst(query: string): Promise<{ name: string; url: string; uid: string } | null> {
  try {
    const r = await fetch(`https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=6&q=${encodeURIComponent(query)}`);
    const j = await r.json();
    for (const m of j.results || []) {
      const { data } = await supabase.functions.invoke('sketchfab-download', { body: { uid: m.uid } });
      if (data?.glb) return { name: m.name, url: data.glb, uid: m.uid };
    }
  } catch { /* skip */ }
  return null;
}

/* ---------------- Genius ---------------- */
function GeniusPanel({ snapshot, apply, textureLibrary, setNight }: Props) {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const run = async () => {
    if (prompt.trim().length < 3 || busy) return;
    setBusy(true); setNote('Designing…');
    try {
      const s = snapshot.scene;
      const { data, error } = await supabase.functions.invoke('scene-genius', {
        body: { prompt, current: { dimensions: s.pool.dimensions, shape: s.pool.shape, stairs: snapshot.poolStairs.length, lights: snapshot.poolLights.length } },
      });
      if (error || !data?.plan) { setNote(data?.error || 'Genius could not design that. Try again.'); return; }
      const plan = data.plan as any;

      const W = clamp(plan.pool?.width, 8, 30, 16);
      const L = clamp(plan.pool?.length, 10, 60, 32);
      const shape: Shape = ['rectangle', 'oval', 'kidney', 'l-shape', 'freeform', 'roman'].includes(plan.pool?.shape) ? plan.pool.shape : 'rectangle';
      const anchorsRaw: any[] = Array.isArray(plan.pool?.depthProfile) ? plan.pool.depthProfile.slice(0, 8) : [];
      const anchors = (anchorsRaw.length >= 2 ? anchorsRaw : [{ position: 0, depth: 3.5 }, { position: 1, depth: 6 }])
        .map((a, i) => ({ id: `ga-${i}`, position: clamp(a.position, 0, 1, i), depth: clamp(a.depth, 3, 10, 5) }))
        .sort((a, b) => a.position - b.position);
      const minD = Math.min(...anchors.map((a) => a.depth)), maxD = Math.max(...anchors.map((a) => a.depth));

      const pts = shapePoints(shape, W, L);
      const fresh = productToScene(
        { name: 'Genius design', model: 'Genius design', dimensions: `${W}' × ${L}'`, depth: `${minD}' - ${maxD}'`, price: 0, category: 'pool', type: 'pool' },
        { customPoolShape: pts.map((p, i) => ({ x: p.x * 10, y: p.y * 10, id: `p${i + 1}` })), poolBuilderData: { scale: 10, poolShape: shape === 'rectangle' || shape === 'l-shape' ? 'rectangle' : 'freeform' } },
        paverTypes,
        poolFinishes.map((f: any) => ({ name: f.name, price: f.price, image: f.image, collection: f.collection || 'Standard', description: f.description })),
      ) as Scene3D;

      const copingWidth = clamp(plan.deck?.copingWidth, 0.5, 2, 1);
      const deckW = clamp(plan.deck?.width, 3, 20, 6);
      const ring = fresh.pool.points.map((p) => ({ x: p.x, z: p.y }));
      const outer = mitredOffsetRing(ring, copingWidth + deckW, { miterLimit: 2.5 }).offset;

      const scene: Scene3D = {
        ...fresh,
        pool: {
          ...fresh.pool,
          finish: pickTexture(textureLibrary.finishes, plan.finishHint, s.pool.finish),
          linearDepthAnchors: anchors,
          dimensions: { length: L, width: W, depth: maxD },
        },
        deck: {
          ...fresh.deck,
          ...s.deck,
          paver: pickTexture(textureLibrary.pavers, plan.paverHint, s.deck.paver),
          copingWidth,
          points: outer.length >= 3 ? outer.map((p, i) => ({ x: p.x, y: p.z, id: `d${i}` })) : fresh.deck.points,
        },
      };

      const finishUrl = scene.pool.finish.url;
      const now = Date.now();
      const stairs: PoolStairConfig[] = (Array.isArray(plan.stairs) ? plan.stairs.slice(0, 4) : []).map((st: any, i: number) => ({
        id: `stair-${now}-${i}`, wallPosition: clamp(st.wallPosition, 0, 1, 0.1), shape: 'linear',
        style: ['classic', 'wedding-cake', 'bench', 'floating'].includes(st.style) ? st.style : 'classic',
        softEdge: clamp(st.softEdge, 0, 0.5, 0.17), width: clamp(st.width, 3, 14, 6), numSteps: 4,
        stepHeight: 0.625, stepDepth: 0.917, textureUrl: finishUrl, cornerRadius: 0.5,
      }));
      const chairs: PoolChairConfig[] = [];
      const contour: ContourSeatingConfig[] = [];
      (Array.isArray(plan.seating) ? plan.seating.slice(0, 6) : []).forEach((se: any, i: number) => {
        const wp = clamp(se.wallPosition, 0, 1, 0.5);
        if (se.type === 'contour') {
          contour.push({ id: `contour-${now}-${i}`, startPosition: wp, endPosition: Math.min(1, wp + 0.2), width: 1.5, height: 1, textureUrl: finishUrl });
        } else if (se.type === 'barstool') {
          chairs.push({ id: `chair-${now}-${i}`, wallPosition: wp, textureUrl: finishUrl, ...BAR_STOOL_PRESET, count: clamp(se.count, 1, 8, 3) });
        } else {
          const p = se.type === 'lounge' ? { width: 2.5, depth: 6, height: 1.5, name: 'Tanning Ledge' }
            : se.type === 'corner' ? { width: 2, depth: 2, height: 1, name: 'Corner Seat' }
            : { width: 6, depth: 1.5, height: 1, name: 'Pool Bench' };
          chairs.push({ id: `chair-${now}-${i}`, wallPosition: wp, ...p, cornerRadius: 0.3, textureUrl: finishUrl, snapToWall: true, followFloor: true });
        }
      });
      const nLights = Math.round(clamp(plan.lights, 0, 8, 2));
      const lights: PoolLightConfig[] = Array.from({ length: nLights }, (_, i) => ({
        id: `light-${now}-${i}`, wallPosition: (i + 0.5) / Math.max(1, nLights), depthFromSurface: 2,
        color: '#ffffff', colorMode: 'gradient', intensity: 2, isOn: !!plan.night, angle: 0,
      }));

      apply({ scene, poolStairs: stairs, poolChairs: chairs, contourSeating: contour, poolLights: lights });
      if (typeof plan.night === 'boolean') setNight?.(plan.night);

      const models: any[] = Array.isArray(plan.models) ? plan.models.slice(0, 10) : [];
      let placed = 0;
      if (models.length) {
        setNote(`${plan.summary || 'Design ready.'} Adding ${models.length} 3D models…`);
        const found = await Promise.all(models.map(async (m) => {
          if (typeof m?.query !== 'string') return null;
          const hit = await sketchfabFirst(m.query);
          if (!hit) return null;
          const kind: TerrainAsset['type'] = ['object', 'tree', 'terrain', 'skydome'].includes(m.kind) ? m.kind : 'object';
          return {
            id: `sf-${hit.uid}-${Math.random().toString(36).slice(2, 7)}`, name: hit.name, type: kind, url: hit.url, format: 'glb',
            position: [clamp(m.x, -60, 60, 20), 0, clamp(m.z, -60, 60, 20)], rotation: [0, 0, 0],
            scale: 1, visible: true, autoFit: true,
          } as TerrainAsset;
        }));
        const assets = found.filter(Boolean) as TerrainAsset[];
        placed = assets.length;
        if (assets.length) apply({ terrainAssets: [...snapshot.terrainAssets, ...assets] });
      }
      setNote(`${plan.summary || 'Design ready.'}${models.length ? ` ${placed} of ${models.length} 3D models placed.` : ''}`);
    } catch {
      setNote('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Describe the whole project. Genius builds the pool, depth, deck, stairs, seating, lights and adds 3D models.</p>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="text-xs"
        placeholder="e.g. 14×30 kidney pool, 3.5 to 7 ft deep, travertine deck 8 ft wide, wedding cake stairs, 3 bar stools, palm trees and a pergola, night lights" />
      <Button size="sm" className="w-full text-xs" onClick={run} disabled={busy || prompt.trim().length < 3}>
        {busy ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />}Design it
      </Button>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

/* ---------------- Projects gallery ---------------- */
const PROJECTS_KEY = 'studio3d.projects.v1';
interface SavedProject { id: string; name: string; savedAt: number; data: DockSnapshot }
const loadProjects = (): SavedProject[] => { try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); } catch { return []; } };

function ProjectsPanel({ snapshot, apply }: Props) {
  const [items, setItems] = useState<SavedProject[]>(loadProjects);
  const [name, setName] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const persist = (next: SavedProject[]) => {
    try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(next)); setItems(next); return true; }
    catch { setNote('Storage is full — delete an older version first.'); return false; }
  };
  const save = () => {
    // Uploaded local files can't be restored later, so only keep web-hosted models.
    const data: DockSnapshot = { ...snapshot, terrainAssets: snapshot.terrainAssets.filter((a) => !a.url.startsWith('blob:')) };
    const p: SavedProject = { id: `prj-${Date.now()}`, name: name.trim() || `Version ${items.length + 1}`, savedAt: Date.now(), data };
    if (persist([p, ...items])) { setName(''); setNote(`Saved “${p.name}”.`); }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Version name" className="h-8 text-xs" />
        <Button size="sm" className="text-xs" onClick={save}><Save className="h-3 w-3 mr-1" />Save</Button>
      </div>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
      <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
        {items.length === 0 && <p className="py-3 text-center text-[11px] text-muted-foreground">No saved versions yet.</p>}
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded border p-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(p.savedAt).toLocaleString()} · {p.data.scene.pool.dimensions ? `${p.data.scene.pool.dimensions.width}×${p.data.scene.pool.dimensions.length} ft` : 'custom'}
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { apply(p.data); setNote(`Loaded “${p.name}”.`); }}>Load</Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Delete" onClick={() => persist(items.filter((x) => x.id !== p.id))}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Music ---------------- */
function MusicPanel() {
  const [on, setOn] = useState(ambientMusic.isPlaying());
  const [vol, setVol] = useState(ambientMusic.getVolume());
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">An original ocarina melody that loops softly while you design.</p>
      <Button size="sm" variant={on ? 'default' : 'outline'} className="w-full text-xs"
        onClick={() => { if (on) ambientMusic.stop(); else ambientMusic.start(); setOn(!on); }}>
        {on ? <><VolumeX className="h-3 w-3 mr-1" />Mute music</> : <><Music2 className="h-3 w-3 mr-1" />Play music</>}
      </Button>
      <div className="space-y-1">
        <p className="text-[11px] text-muted-foreground">Volume {Math.round(vol * 100)}%</p>
        <Slider value={[vol]} min={0} max={1} step={0.05} onValueChange={([v]) => { setVol(v); ambientMusic.setVolume(v); }} />
      </div>
    </div>
  );
}

/* ---------------- Dock ---------------- */
type Tab = 'genius' | 'projects' | 'music' | null;
export function StudioDock(props: Props) {
  const [tab, setTab] = useState<Tab>(null);
  const [musicOn, setMusicOn] = useState(ambientMusic.isPlaying());
  useEffect(() => ambientMusic.subscribe(setMusicOn), []);
  useEffect(() => () => ambientMusic.stop(), []);
  const toggle = useCallback((t: Tab) => setTab((cur) => (cur === t ? null : t)), []);
  const titles = { genius: 'Genius — design from a prompt', projects: 'Projects gallery', music: 'Music' } as const;
  const btn = (t: Exclude<Tab, null>, Icon: typeof Wand2, label: string) => (
    <button type="button" onClick={() => toggle(t)} title={label}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs shadow-lg transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-background/90 hover:bg-background'}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      {tab && (
        <div className="w-80 rounded-xl border bg-background/95 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{titles[tab]}</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTab(null)}><X className="h-3.5 w-3.5" /></Button>
          </div>
          {tab === 'genius' && <GeniusPanel {...props} />}
          {tab === 'projects' && <ProjectsPanel {...props} />}
          {tab === 'music' && <MusicPanel />}
        </div>
      )}
      <div className="flex gap-1.5">
        {btn('genius', Wand2, 'Genius')}
        {btn('projects', FolderOpen, 'Projects')}
        <button type="button" onClick={() => toggle('music')} title="Music"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs shadow-lg transition-colors ${tab === 'music' ? 'bg-primary text-primary-foreground' : 'bg-background/90 hover:bg-background'}`}>
          {musicOn ? <Music2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}Music
        </button>
      </div>
    </div>
  );
}
