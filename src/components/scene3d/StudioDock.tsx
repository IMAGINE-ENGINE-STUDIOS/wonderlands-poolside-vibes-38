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
import { applyZeroEntry } from './depthUtils';

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
  textureLibrary: { finishes: TextureConfig[]; pavers: TextureConfig[]; coping: TextureConfig[]; waterlines?: TextureConfig[] };
  setNight?: (v: boolean) => void;
}

/* ---------------- shapes (feet, centred) ---------------- */
export type Shape = 'rectangle' | 'oval' | 'kidney' | 'l-shape' | 'freeform' | 'roman';
export function shapePoints(shape: Shape, W: number, L: number): { x: number; y: number }[] {
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

/* ---------------- Genius plan helpers ---------------- */
const SHAPES: Shape[] = ['rectangle', 'oval', 'kidney', 'l-shape', 'freeform', 'roman'];
interface GeniusPlan {
  summary?: string;
  pool?: { shape?: string; width?: number; length?: number; cornerRadius?: number; depthProfile?: { position: number; depth: number }[]; zeroEntry?: { length?: number } };
  deck?: { width?: number; copingWidth?: number };
  finishHint?: string; copingHint?: string; waterlineHint?: string; paverHint?: string;
  stairs?: unknown[]; seating?: unknown[]; lights?: number; night?: boolean; models?: unknown[];
}

/** Common edits are read directly from the words so they never depend on the model. */
function applyLocalIntent(text: string, plan: GeniusPlan): GeniusPlan {
  const t = text.toLowerCase();
  const out: GeniusPlan = { ...plan, pool: { ...(plan.pool || {}) } };
  if (/\b(round(ed)?|soft(en)?|radius|curved?)\b.*\bcorners?\b|\bcorners?\b.*\b(round(ed)?|soft)\b/.test(t) && !out.pool!.cornerRadius) {
    const ft = t.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')\s*(?:radius|round)/);
    out.pool!.cornerRadius = ft ? Number(ft[1]) : 2.5;
  }
  if (/\b(sharp|square)\s+corners?\b/.test(t)) out.pool!.cornerRadius = 0;
  if (/\b(zero[\s-]?entry|beach entry|walk[\s-]?in entry|zero depth entry)\b/.test(t) && !out.pool!.zeroEntry) out.pool!.zeroEntry = { length: 8 };
  const coping = t.match(/coping\s+(?:in|to|with|of)?\s*([a-z ]{3,30})|([a-z]{3,20})\s+coping/);
  if (coping && !out.copingHint) out.copingHint = (coping[1] || coping[2]).trim();
  return out;
}

function centred(points: { x: number; y: number }[]) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return points.map((p) => ({ x: p.x - cx, y: p.y - cy }));
}

/** Round sharp corners with a smooth arc; already-curved runs stay as they are. */
export function roundCorners(pts: { x: number; y: number }[], radius: number, samples = 10) {
  const n = pts.length;
  if (n < 3) return pts;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const ax = p0.x - p1.x, ay = p0.y - p1.y, bx = p2.x - p1.x, by = p2.y - p1.y;
    const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
    const turn = Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb || 1))));
    if (la < 1e-6 || lb < 1e-6 || turn > (155 * Math.PI) / 180) { out.push(p1); continue; }
    const r = Math.min(radius, la * 0.45, lb * 0.45);
    const s0 = { x: p1.x + (ax / la) * r, y: p1.y + (ay / la) * r };
    const s1 = { x: p1.x + (bx / lb) * r, y: p1.y + (by / lb) * r };
    for (let k = 0; k <= samples; k++) {
      const u = k / samples, v = 1 - u;
      out.push({ x: v * v * s0.x + 2 * v * u * p1.x + u * u * s1.x, y: v * v * s0.y + 2 * v * u * p1.y + u * u * s1.y });
    }
  }
  return out;
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
      const dims = s.pool.dimensions || { width: 16, length: 32, depth: 6 };
      const { data, error } = await supabase.functions.invoke('scene-genius', {
        body: {
          prompt,
          current: {
            shape: s.pool.shape, width: dims.width, length: dims.length,
            depthProfile: (s.pool.linearDepthAnchors || []).map((a) => ({ position: a.position, depth: a.depth })),
            finish: s.pool.finish?.name, coping: s.deck.coping?.name, waterline: s.deck.waterline?.name, paver: s.deck.paver?.name,
            copingWidth: s.deck.copingWidth, stairs: snapshot.poolStairs.length, seating: snapshot.poolChairs.length + snapshot.contourSeating.length,
            lights: snapshot.poolLights.length,
          },
        },
      });
      if (error || !data?.plan) { setNote(data?.error || 'Genius could not design that. Try again.'); return; }
      const plan = applyLocalIntent(prompt, data.plan as GeniusPlan);
      const p = plan.pool || {};
      const changesOutline = p.shape !== undefined || p.width !== undefined || p.length !== undefined || p.cornerRadius !== undefined;

      // Unchanged keys keep the current design — Genius only edits what was asked.
      let scene: Scene3D = { ...s, pool: { ...s.pool }, deck: { ...s.deck } };
      const W = clamp(p.width, 8, 30, dims.width || 16);
      const L = clamp(p.length, 10, 60, dims.length || 32);
      if (changesOutline) {
        const shape: Shape = SHAPES.includes(p.shape as Shape) ? (p.shape as Shape) : ((SHAPES.includes(s.pool.shape as Shape) ? s.pool.shape : 'rectangle') as Shape);
        const keepCurrent = p.shape === undefined && p.width === undefined && p.length === undefined && s.pool.points?.length >= 3;
        let pts = keepCurrent ? centred(s.pool.points) : shapePoints(shape, W, L);
        const radius = clamp(p.cornerRadius, 0, 6, 0);
        if (radius > 0) pts = roundCorners(pts, radius);
        const fresh = productToScene(
          { name: 'Genius design', model: 'Genius design', dimensions: `${W}' × ${L}'`, depth: `3' - 6'`, price: 0, category: 'pool', type: 'pool' },
          { customPoolShape: pts.map((q, i) => ({ x: q.x * 10, y: q.y * 10, id: `p${i + 1}` })), poolBuilderData: { scale: 10, poolShape: radius > 0 || shape !== 'rectangle' ? 'freeform' : 'rectangle' } },
          paverTypes,
          poolFinishes.map((f: any) => ({ name: f.name, price: f.price, image: f.image, collection: f.collection || 'Standard', description: f.description })),
        ) as Scene3D;
        scene.pool = { ...s.pool, points: fresh.pool.points, sourcePoints: (fresh.pool as any).sourcePoints, shape: fresh.pool.shape, dimensions: { ...dims, width: W, length: L } } as any;
      }

      let anchors = Array.isArray(p.depthProfile) && p.depthProfile.length >= 2
        ? p.depthProfile.slice(0, 8).map((a, i) => ({ id: `ga-${i}`, position: clamp(a.position, 0, 1, i), depth: clamp(a.depth, 0, 12, 5) }))
        : (s.pool.linearDepthAnchors || []).map((a) => ({ ...a }));
      if (p.zeroEntry) {
        // Shared zero-entry definition (same as the Depth Profile Editor toggle).
        anchors = applyZeroEntry(anchors as any, clamp(p.zeroEntry.length, 4, 15, 8), L || 32) as any;
      }
      if (anchors.length >= 2) {
        anchors = anchors.sort((a, b) => a.position - b.position).map((a, i) => ({ ...a, id: `ga-${i}` }));
        scene.pool.linearDepthAnchors = anchors;
        scene.pool.dimensions = { ...(scene.pool.dimensions || dims), depth: Math.max(...anchors.map((a) => a.depth)) } as any;
      }

      if (plan.finishHint) scene.pool.finish = pickTexture(textureLibrary.finishes, plan.finishHint, s.pool.finish);
      if (plan.copingHint) scene.deck.coping = pickTexture(textureLibrary.coping, plan.copingHint, s.deck.coping);
      if (plan.waterlineHint && textureLibrary.waterlines?.length) scene.deck.waterline = pickTexture(textureLibrary.waterlines, plan.waterlineHint, s.deck.waterline as TextureConfig);
      if (plan.paverHint) scene.deck.paver = pickTexture(textureLibrary.pavers, plan.paverHint, s.deck.paver);
      const copingWidth = clamp(plan.deck?.copingWidth, 0.5, 2, s.deck.copingWidth ?? 1);
      scene.deck.copingWidth = copingWidth;
      if (changesOutline || plan.deck?.width !== undefined) {
        const deckW = clamp(plan.deck?.width, 3, 20, 6);
        const outer = mitredOffsetRing(scene.pool.points.map((q) => ({ x: q.x, z: q.y })), copingWidth + deckW, { miterLimit: 2.5 }).offset;
        if (outer.length >= 3) scene.deck.points = outer.map((q, i) => ({ x: q.x, y: q.z, id: `d${i}` }));
      }

      const finishUrl = scene.pool.finish.url;
      const now = Date.now();
      const next: Partial<DockSnapshot> = { scene };
      if (Array.isArray(plan.stairs)) next.poolStairs = plan.stairs.slice(0, 4).map((st: any, i: number) => ({
        id: `stair-${now}-${i}`, wallPosition: clamp(st.wallPosition, 0, 1, 0.1), shape: 'linear',
        style: ['classic', 'wedding-cake', 'bench', 'floating'].includes(st.style) ? st.style : 'classic',
        softEdge: clamp(st.softEdge, 0, 0.5, 0.17), width: clamp(st.width, 3, 14, 6), numSteps: 4,
        stepHeight: 0.625, stepDepth: 0.917, textureUrl: finishUrl, cornerRadius: 0.5,
      }));
      if (Array.isArray(plan.seating)) {
        const chairs: PoolChairConfig[] = [];
        const contour: ContourSeatingConfig[] = [];
        plan.seating.slice(0, 6).forEach((se: any, i: number) => {
          const wp = clamp(se.wallPosition, 0, 1, 0.5);
          if (se.type === 'contour') contour.push({ id: `contour-${now}-${i}`, startPosition: wp, endPosition: wp + 0.2, width: 1.5, height: 1, textureUrl: finishUrl });
          else if (se.type === 'barstool') chairs.push({ id: `chair-${now}-${i}`, wallPosition: wp, textureUrl: finishUrl, ...BAR_STOOL_PRESET, count: clamp(se.count, 1, 8, 3) });
          else {
            const pr = se.type === 'lounge' ? { width: 2.5, depth: 6, height: 1.5, name: 'Tanning Ledge' }
              : se.type === 'corner' ? { width: 2, depth: 2, height: 1, name: 'Corner Seat' }
              : { width: 6, depth: 1.5, height: 1, name: 'Pool Bench' };
            chairs.push({ id: `chair-${now}-${i}`, wallPosition: wp, ...pr, cornerRadius: 0.3, textureUrl: finishUrl, snapToWall: true, followFloor: true });
          }
        });
        next.poolChairs = chairs; next.contourSeating = contour;
      }
      if (typeof plan.lights === 'number') {
        const n = Math.round(clamp(plan.lights, 0, 8, 2));
        next.poolLights = Array.from({ length: n }, (_, i) => ({
          id: `light-${now}-${i}`, wallPosition: (i + 0.5) / Math.max(1, n), depthFromSurface: 2,
          color: '#ffffff', colorMode: 'gradient', intensity: 2, isOn: !!plan.night, angle: 0,
        })) as PoolLightConfig[];
      }
      apply(next);
      if (typeof plan.night === 'boolean') setNight?.(plan.night);

      // 3D models only when the user actually named them in the request.
      const asked = prompt.toLowerCase();
      const models = (Array.isArray(plan.models) ? plan.models : []).filter((m: any) =>
        typeof m?.query === 'string' && m.query.toLowerCase().split(/\s+/).some((w: string) => w.length > 3 && asked.includes(w.replace(/s$/, ''))),
      ).slice(0, 6);
      let placed = 0;
      if (models.length) {
        setNote(`${plan.summary || 'Design updated.'} Adding ${models.length} 3D models…`);
        const reach = Math.max(W, L) / 2 + copingWidth + 8;
        const found = await Promise.all(models.map(async (m: any, i: number) => {
          const hit = await sketchfabFirst(m.query);
          if (!hit) return null;
          const kind: TerrainAsset['type'] = ['object', 'tree', 'terrain', 'skydome'].includes(m.kind) ? m.kind : 'object';
          // Keep props just outside the deck, never inside the pool.
          const ang = Math.atan2(clamp(m.z, -80, 80, 1), clamp(m.x, -80, 80, 1)) || (i * Math.PI) / 3;
          const r = Math.max(reach, Math.hypot(clamp(m.x, -80, 80, 0), clamp(m.z, -80, 80, 0)));
          return {
            id: `sf-${hit.uid}-${now}-${i}`, name: hit.name, type: kind, url: hit.url, format: 'glb',
            position: kind === 'terrain' || kind === 'skydome' ? [0, 0, 0] : [Math.cos(ang) * r, 0, Math.sin(ang) * r], rotation: [0, 0, 0],
            scale: 1, visible: true, autoFit: true,
          } as TerrainAsset;
        }));
        const assets = found.filter(Boolean) as TerrainAsset[];
        placed = assets.length;
        if (assets.length) apply({ terrainAssets: [...snapshot.terrainAssets, ...assets] });
      }
      setNote(`${plan.summary || 'Design updated.'}${models.length ? ` ${placed} of ${models.length} 3D models placed.` : ''}`);
    } catch {
      setNote('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Wand2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
        aria-label="Describe your project for Genius"
        placeholder="Ask Genius: 14×30 kidney pool, 3.5–7 ft deep, travertine deck, wedding cake stairs, palm trees…"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
      />
      {note && <span className="hidden max-w-[32%] truncate text-[11px] text-muted-foreground lg:inline" title={note}>{note}</span>}
      <Button size="sm" className="h-8 shrink-0 rounded-full px-4 text-xs" onClick={run} disabled={busy || prompt.trim().length < 3}>
        {busy ? <Loader2 className="h-3 w-3 animate-spin sm:mr-1" /> : <Wand2 className="h-3 w-3 sm:mr-1" />}
        <span className="hidden sm:inline">Design it</span>
      </Button>
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
type Tab = 'projects' | 'music' | null;
export function StudioDock(props: Props) {
  const [tab, setTab] = useState<Tab>(null);
  const [musicOn, setMusicOn] = useState(ambientMusic.isPlaying());
  useEffect(() => ambientMusic.subscribe(setMusicOn), []);
  useEffect(() => () => ambientMusic.stop(), []);
  const toggle = useCallback((t: Tab) => setTab((cur) => (cur === t ? null : t)), []);
  const titles = { projects: 'Projects gallery', music: 'Music' } as const;
  const glass = 'border border-white/25 bg-background/60 shadow-[0_8px_32px_-8px_hsl(var(--foreground)/0.25)] backdrop-blur-xl backdrop-saturate-150';
  const pill = (active: boolean) =>
    `flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-foreground/5'}`;
  return (
    // Full-width glass bar along the bottom of the 3D viewer.
    <div className="absolute inset-x-3 bottom-3 z-30 md:inset-x-6">
      {tab && (
        <div className={`absolute bottom-full right-0 mb-2 w-[min(20rem,100%)] rounded-2xl p-3 ${glass}`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{titles[tab]}</p>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTab(null)}><X className="h-3.5 w-3.5" /></Button>
          </div>
          {tab === 'projects' && <ProjectsPanel {...props} />}
          {tab === 'music' && <MusicPanel />}
        </div>
      )}
      <div className={`flex items-center gap-2 rounded-full py-1 pl-4 pr-1.5 ${glass}`}>
        <GeniusPanel {...props} />
        <span className="h-5 w-px shrink-0 bg-foreground/10" aria-hidden />
        <button type="button" onClick={() => toggle('projects')} title="Projects" className={pill(tab === 'projects')}>
          <FolderOpen className="h-3.5 w-3.5" /><span className="hidden md:inline">Projects</span>
        </button>
        <button type="button" onClick={() => toggle('music')} title="Music" className={pill(tab === 'music')}>
          {musicOn ? <Music2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}<span className="hidden md:inline">Music</span>
        </button>
      </div>
    </div>
  );
}
