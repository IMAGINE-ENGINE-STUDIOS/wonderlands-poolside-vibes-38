/**
 * Genius for the 2D designer — same `scene-genius` brief as the 3D dock.
 * Turns a sentence ("14×30 kidney pool, 3.5–7 ft deep, 6 ft deck") into a
 * pool outline, depth profile and deck ring, handed to the parent as a
 * Scene3D so the existing 3D→2D sync path draws it on the 2D board.
 */
import * as React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { productToScene } from '@/components/scene3d/SceneConverter';
import { shapePoints, type Shape } from '@/components/scene3d/StudioDock';
import { paverTypes } from '@/data/paverData';
import { poolFinishes } from '@/data/consolidatedProducts';
import { mitredOffsetRing } from '@/utils/polygonGeometry';

const clamp = (v: unknown, lo: number, hi: number, d: number) => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : d;
  return Math.min(hi, Math.max(lo, n));
};
const SHAPES: Shape[] = ['rectangle', 'oval', 'kidney', 'l-shape', 'freeform', 'roman'];

export function Genius2DBar({ onScene }: { onScene: (scene: any) => void }) {
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  const run = async () => {
    if (prompt.trim().length < 3 || busy) return;
    setBusy(true); setNote('Designing…');
    try {
      const { data, error } = await supabase.functions.invoke('scene-genius', { body: { prompt, current: { mode: '2d' } } });
      if (error || !data?.plan) { setNote(data?.error || 'Genius could not design that. Try again.'); return; }
      const plan = data.plan as any;
      const W = clamp(plan.pool?.width, 8, 30, 16);
      const L = clamp(plan.pool?.length, 10, 60, 32);
      const shape: Shape = SHAPES.includes(plan.pool?.shape) ? plan.pool.shape : 'rectangle';
      const raw: any[] = Array.isArray(plan.pool?.depthProfile) ? plan.pool.depthProfile.slice(0, 8) : [];
      const anchors = (raw.length >= 2 ? raw : [{ position: 0, depth: 3.5 }, { position: 1, depth: 6 }])
        .map((a, i) => ({ id: `ga-${i}`, position: clamp(a.position, 0, 1, i), depth: clamp(a.depth, 3, 10, 5) }))
        .sort((a, b) => a.position - b.position);
      const minD = Math.min(...anchors.map((a) => a.depth)), maxD = Math.max(...anchors.map((a) => a.depth));
      const pts = shapePoints(shape, W, L);
      // Land the pool in the middle of the 2D board (PoolBuilder's canvas fills the window);
      // straight shapes keep sharp corners in 2D and 3D alike.
      const ox = Math.round(window.innerWidth / 2), oy = Math.round(window.innerHeight / 2);
      const straight = shape === 'rectangle' || shape === 'l-shape';
      const fresh: any = productToScene(
        { name: 'Genius design', model: 'Genius design', dimensions: `${W}' × ${L}'`, depth: `${minD}' - ${maxD}'`, price: 0, category: 'pool', type: 'pool' },
        { customPoolShape: pts.map((p, i) => ({ x: p.x * 10 + ox, y: p.y * 10 + oy, id: `p${i + 1}`, ...(straight ? { curveType: 'linear' as const } : {}) })), poolBuilderData: { scale: 10, poolShape: shape === 'rectangle' || shape === 'l-shape' ? 'rectangle' : 'freeform' } },
        paverTypes,
        poolFinishes.map((f: any) => ({ name: f.name, price: f.price, image: f.image, collection: f.collection || 'Standard', description: f.description })),
      );
      const copingWidth = clamp(plan.deck?.copingWidth, 0.5, 2, 1);
      const deckW = clamp(plan.deck?.width, 3, 20, 6);
      const ring = fresh.pool.points.map((p: any) => ({ x: p.x, z: p.y }));
      const outer = mitredOffsetRing(ring, copingWidth + deckW, { miterLimit: 2.5 }).offset;
      onScene({
        ...fresh,
        pool: { ...fresh.pool, linearDepthAnchors: anchors, dimensions: { length: L, width: W, depth: maxD } },
        deck: { ...fresh.deck, copingWidth, points: outer.length >= 3 ? outer.map((p, i) => ({ x: p.x, y: p.z, id: `d${i}` })) : fresh.deck.points },
      });
      setNote(plan.summary || `Drawn: ${W}′ × ${L}′ ${shape} pool.`);
    } catch {
      setNote('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-40 mx-auto flex max-w-4xl items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-1.5 shadow-lg backdrop-blur-xl">
      <Wand2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
        aria-label="Describe your pool for Genius"
        placeholder="Ask Genius: 14×30 kidney pool, 3.5–7 ft deep, 6 ft deck…"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
      />
      {note && <span className="hidden max-w-[35%] truncate text-[11px] text-muted-foreground md:inline" title={note}>{note}</span>}
      <Button size="sm" className="h-8 shrink-0 rounded-full px-4 text-xs" onClick={run} disabled={busy || prompt.trim().length < 3}>
        {busy ? <Loader2 className="h-3 w-3 animate-spin sm:mr-1" /> : <Wand2 className="h-3 w-3 sm:mr-1" />}
        <span className="hidden sm:inline">Draw it</span>
      </Button>
    </div>
  );
}

export default Genius2DBar;
