/**
 * Genius for the 2D designer — same `scene-genius` brief as the 3D dock.
 *
 * EDIT-IN-PLACE (founder rule): the bar sends the CURRENT pool (real outline
 * size + depth anchors) with every request, and a returned plan is applied by
 * TRANSFORMING the current outline — scaled about its own centre, points and
 * curve types preserved — never by redrawing a fresh pool in the middle of
 * the window. A fresh outline is generated only when no pool exists yet, when
 * the plan changes the shape, or when the guest explicitly asks for a new
 * design. Summary-only plans (fences, screens, turf and other site requests
 * the function routes) are shown as the note and NEVER fabricate a pool.
 */
import * as React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeGenius } from '@/lib/geniusInvoke';
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
const PX_PER_FT = 10;

interface CurrentPool {
  points: Array<{ x: number; y: number; id?: string; curveType?: string }>;
  depthPoints: Array<{ position: number; depth: number }>;
  lengthFt: number;
  widthFt: number;
}

/** Snapshot of the pool as drawn right now (PoolBuilder points are board px). */
function snapshotCurrent(raw: any): CurrentPool | null {
  const points = Array.isArray(raw?.points) ? raw.points.filter((p: any) => typeof p?.x === 'number' && typeof p?.y === 'number') : [];
  if (points.length < 3) return null;
  const xs = points.map((p: any) => p.x), ys = points.map((p: any) => p.y);
  const wFt = (Math.max(...xs) - Math.min(...xs)) / PX_PER_FT;
  const hFt = (Math.max(...ys) - Math.min(...ys)) / PX_PER_FT;
  const depthPoints = (Array.isArray(raw?.depthPoints) ? raw.depthPoints : [])
    .filter((a: any) => typeof a?.position === 'number' && typeof a?.depth === 'number')
    .map((a: any) => ({ position: a.position, depth: a.depth }));
  return { points, depthPoints, lengthFt: Math.max(wFt, hFt), widthFt: Math.min(wFt, hFt) };
}

/** Scale the current outline to the target feet about its own centre.
 *  Points, order, ids and curve types are preserved — the spline is edited,
 *  not redrawn. */
function transformOutline(points: CurrentPool['points'], lengthFt: number, widthFt: number) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const boxW = Math.max(1, maxX - minX), boxH = Math.max(1, maxY - minY);
  const horizontalIsLong = boxW >= boxH;
  const sx = ((horizontalIsLong ? lengthFt : widthFt) * PX_PER_FT) / boxW;
  const sy = ((horizontalIsLong ? widthFt : lengthFt) * PX_PER_FT) / boxH;
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return points.map((p, i) => ({
    x: Math.round(cx + (p.x - cx) * sx),
    y: Math.round(cy + (p.y - cy) * sy),
    id: p.id ?? `p${i + 1}`,
    ...(p.curveType ? { curveType: p.curveType as any } : {}),
  }));
}

export function Genius2DBar({ onScene, getCurrent }: { onScene: (scene: any) => void; getCurrent?: () => any }) {
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);

  const run = async () => {
    if (prompt.trim().length < 3 || busy) return;
    // Scope guard — Imagine Engine Studios Corp: Genius only changes what was asked.
    const q = prompt.toLowerCase();
    const gateKind = /\b(screen|cage|enclosure)\b/.test(q) ? 'enclosure' : /\bfence\b/.test(q) ? 'fence' : /\bgate\b/.test(q) ? 'fence' : null;
    if (/\b(door|doors|gate|gates)\b/.test(q)) {
      if (!gateKind) { setNote('Add the door to the screen or the fence? Say "door on the screen" or "gate on the fence".'); return; }
      const count = Number(q.match(/\b(\d)\b/)?.[1] ?? (/\btwo\b/.test(q) ? 2 : /\bthree\b/.test(q) ? 3 : 1));
      const done = new Promise<boolean>((res) => { const h = (e: Event) => { window.removeEventListener('design-studio:gate-result', h); res(!!(e as CustomEvent).detail?.ok); }; window.addEventListener('design-studio:gate-result', h); setTimeout(() => res(false), 800); });
      window.dispatchEvent(new CustomEvent('design-studio:add-gate', { detail: { kind: gateKind, count, double: /double/.test(q) } }));
      const ok = await done;
      setNote(ok ? `Added ${count} ${gateKind === 'fence' ? 'gate' : 'door'}${count > 1 ? 's' : ''}. Nothing else changed.` : `Draw a ${gateKind === 'fence' ? 'fence' : 'screen'} first, then ask again.`);
      if (ok) setPrompt('');
      return;
    }
    /* Draw a site element (fence / screen / turf): the site layer draws it from
     * the real outlines and reports back — no scene-genius round-trip. */
    const drawKind = /\b(fence|fencing)\b/.test(q) ? 'fence' : /\b(screen|enclosure|cage)\b/.test(q) ? 'enclosure' : /\b(turf|grass|lawn)\b/.test(q) ? 'turf' : null;
    if (drawKind && /\b(draw|add|put|build|install|around|surround|enclose|wrap)\b/.test(q)) {
      const around = /\bpool\b/.test(q) && !/\bdeck\b/.test(q) ? 'pool' : 'deck';
      const done = new Promise<boolean>((res) => { const h = (e: Event) => { window.removeEventListener('design-studio:element-result', h); res(!!(e as CustomEvent).detail?.ok); }; window.addEventListener('design-studio:element-result', h); setTimeout(() => res(false), 1200); });
      window.dispatchEvent(new CustomEvent('design-studio:add-element', { detail: { kind: drawKind, around } }));
      const ok = await done;
      setNote(ok ? `Drew the ${drawKind === 'enclosure' ? 'screen enclosure' : drawKind} around the ${around}. Nothing else changed.` : 'Draw the pool and its deck first, then ask again.');
      if (ok) setPrompt('');
      return;
    }
    const poolish = /\b(pool|spa|kidney|oval|rectangle|roman|freeform|l-shape|deep|depth|shallow|deck)\b|\d+\s*[x×]\s*\d+/.test(q);
    const finishish = /\b(finish|coping|waterline|tile|pavers?|shell|interior)\b/.test(q);
    const siteish = /\b(fence|screen|enclosure|cage|turf|grass|landscap|garden|palm|tree|rock|boulder)\b/.test(q);
    const editish = /\b(move|shift|slide|curve|curved|straighten|round|rounded|bigger|larger|smaller|wider|longer|deeper|shallower|reshape|remove|delete)\b/.test(q);
    if (!poolish && !finishish && !siteish && !editish) {
      setNote('Genius here designs and edits the pool, deck, finishes, fences, screens and site — ask for any of those. Nothing was changed.');
      return;
    }
    setBusy(true); setNote('Designing…');
    try {
      const current = snapshotCurrent(getCurrent?.());
      const currentBody = current
        ? { mode: '2d', pool: { length: Math.round(current.lengthFt), width: Math.round(current.widthFt), depthProfile: current.depthPoints.slice(0, 8), outlinePoints: current.points.length } }
        : { mode: '2d' };
      const { data, error } = await invokeGenius('scene-genius', { body: { prompt, current: currentBody } }, { onBusy: () => setNote('Busier than normal right now — your design is underway and will go through on its own. Hang tight…') });
      if (error || !data?.plan) { setNote(data?.error || 'Genius could not design that. Try again.'); return; }
      const plan = data.plan as any;

      /* Summary-only plan = a site request the function routes (fence, screen,
       * turf…). Show exactly what was understood; draw nothing, claim nothing. */
      if (!plan.pool && !plan.deck && !plan.finishHint && !plan.copingHint && !plan.waterlineHint && !plan.paverHint && !plan.stairs && !plan.seating && plan.lights === undefined && plan.night === undefined) {
        setNote(plan.summary || 'Understood — nothing on the pool changed.');
        setPrompt('');
        return;
      }

      const explicitNew = /\b(new pool|start over|replace|scrap|different pool|another pool)\b/.test(q);
      const shapeChanged = !!plan.pool?.shape && !!current;
      const W = clamp(plan.pool?.width, 8, 30, current ? Math.round(current.widthFt) : 16);
      const L = clamp(plan.pool?.length, 10, 60, current ? Math.round(current.lengthFt) : 32);
      const shape: Shape = SHAPES.includes(plan.pool?.shape) ? plan.pool.shape : 'rectangle';
      const raw: any[] = Array.isArray(plan.pool?.depthProfile) ? plan.pool.depthProfile.slice(0, 8) : [];
      const anchors = (raw.length >= 2 ? raw : current && current.depthPoints.length >= 2 ? current.depthPoints : [{ position: 0, depth: 3.5 }, { position: 1, depth: 6 }])
        .map((a, i) => ({ id: `ga-${i}`, position: clamp(a.position, 0, 1, i), depth: clamp(a.depth, 0, 12, 5) }))
        .sort((a, b) => a.position - b.position);
      const minD = Math.min(...anchors.map((a) => a.depth)), maxD = Math.max(...anchors.map((a) => a.depth));

      /* The outline: EDIT the current one in place whenever a pool exists and
       * the plan did not change its shape; regenerate only for a shape change,
       * an explicit new design, or a first draw — and even then land it on the
       * current pool's centre, not the window's. */
      let outline: Array<{ x: number; y: number; id: string; curveType?: any }>;
      let outlineShape: 'rectangle' | 'freeform';
      if (current && !shapeChanged && !explicitNew) {
        outline = transformOutline(current.points, L, W);
        outlineShape = current.points.length === 4 ? 'rectangle' : 'freeform';
      } else {
        const pts = shapePoints(shape, W, L);
        const cx = current ? Math.round(current.points.reduce((s, p) => s + p.x, 0) / current.points.length) : Math.round(window.innerWidth / 2);
        const cy = current ? Math.round(current.points.reduce((s, p) => s + p.y, 0) / current.points.length) : Math.round(window.innerHeight / 2);
        const straight = shape === 'rectangle' || shape === 'l-shape';
        outline = pts.map((p, i) => ({ x: p.x * 10 + cx, y: p.y * 10 + cy, id: `p${i + 1}`, ...(straight ? { curveType: 'linear' as const } : {}) }));
        outlineShape = straight ? 'rectangle' : 'freeform';
      }
      const fresh: any = productToScene(
        { name: 'Genius design', model: 'Genius design', dimensions: `${W}' × ${L}'`, depth: `${minD}' - ${maxD}'`, price: 0, category: 'pool', type: 'pool' },
        { customPoolShape: outline, poolBuilderData: { scale: 10, poolShape: outlineShape } },
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
      setNote(plan.summary || (current && !shapeChanged && !explicitNew ? `Edited in place: ${W}′ × ${L}′ — your outline, resized.` : `Drawn: ${W}′ × ${L}′ ${shape} pool.`));
      setPrompt('');
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
        placeholder="Ask Genius: make the pool 2 ft larger, draw a circular pool, change the finish…"
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
