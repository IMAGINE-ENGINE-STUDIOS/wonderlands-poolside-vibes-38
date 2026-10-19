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
 *
 * NATIVE APPLY (v3): plans land through the `design-studio:pool-update`
 * bridge in PoolBuilder's own data format — the 3D round-trip converter is
 * bypassed, so circular outlines (96-point ovals), rounded corners and
 * landscape features arrive exactly as computed. Moves (pool, spa, site
 * elements, placed features) and direct landscape planting are parsed and
 * executed locally with the placement law: vegetation never lands on the
 * pool or the deck ring; "inside the fenced area / inside the screen" plant
 * inside those polygons, clear of the water and deck.
 */
import * as React from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { invokeGenius } from '@/lib/geniusInvoke';
import { shapePoints, roundCorners, type Shape } from '@/components/scene3d/StudioDock';
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
  features: any[];
  additionalPools: any[];
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
  return {
    points,
    depthPoints,
    features: Array.isArray(raw?.features) ? raw.features : [],
    additionalPools: Array.isArray(raw?.additionalPools) ? raw.additionalPools : [],
    lengthFt: Math.max(wFt, hFt),
    widthFt: Math.min(wFt, hFt),
  };
}

const centroid = (pts: Array<{ x: number; y: number }>) => ({
  x: pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length),
  y: pts.reduce((s, p) => s + p.y, 0) / Math.max(1, pts.length),
});
const bbox = (pts: Array<{ x: number; y: number }>) => {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
};
function pointInPoly(x: number, y: number, poly: Array<{ x: number; y: number }>) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** The deck ring around an outline (px), used as the no-planting zone. */
function deckRingPx(outline: Array<{ x: number; y: number }>, deckFt = 7) {
  const ring = outline.map((p) => ({ x: p.x, z: p.y }));
  const out = mitredOffsetRing(ring, deckFt * PX_PER_FT, { miterLimit: 2.5 }).offset;
  return out.length >= 3 ? out.map((p) => ({ x: p.x, y: p.z })) : outline;
}

/** Scale the current outline to the target feet about its own centre.
 *  Points, order, ids and curve types are preserved — the spline is edited,
 *  not redrawn. */
function transformOutline(points: CurrentPool['points'], lengthFt: number, widthFt: number) {
  const { minX, maxX, minY, maxY } = bbox(points);
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
const translatePts = (pts: Array<{ x: number; y: number; id?: string }>, dxFt: number, dyFt: number) =>
  pts.map((p, i) => ({ ...p, x: Math.round(p.x + dxFt * PX_PER_FT), y: Math.round(p.y + dyFt * PX_PER_FT), id: p.id ?? `p${i + 1}` }));

/* ---------------- moves ---------------- */
const DIRS: Array<{ re: RegExp; dx: number; dy: number; label: string }> = [
  { re: /\b(left|west)\b/, dx: -1, dy: 0, label: 'left' },
  { re: /\b(right|east)\b/, dx: 1, dy: 0, label: 'right' },
  { re: /\b(up|north|toward(?:s)? the house|closer to the house)\b/, dx: 0, dy: -1, label: 'up' },
  { re: /\b(down|south|toward(?:s)? the (?:yard|back))\b/, dx: 0, dy: 1, label: 'down' },
];
function parseFeet(q: string): number | null {
  const m = q.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')/);
  return m ? parseFloat(m[1]) : null;
}

/* ---------------- landscape vocabulary ---------------- */
const VEG: Array<{ re: RegExp; make: () => any; def: number; label: string }> = [
  { re: /\bpalms?\b/, make: () => ({ type: 'tree', treeType: 'palm' }), def: 4, label: 'palms' },
  { re: /\boak\b/, make: () => ({ type: 'tree', treeType: 'oak' }), def: 2, label: 'oaks' },
  { re: /\btrees?\b/, make: () => ({ type: 'tree', treeType: 'oak' }), def: 3, label: 'trees' },
  { re: /\bflowering shrubs?\b/, make: () => ({ type: 'shrub', shrubType: 'flowering' }), def: 6, label: 'flowering shrubs' },
  { re: /\bshrubs?\b|\bbush(?:es)?\b/, make: () => ({ type: 'shrub', shrubType: 'round' }), def: 6, label: 'shrubs' },
  { re: /\bhedges?\b/, make: () => ({ type: 'hedge-row' }), def: 2, label: 'hedges' },
  { re: /\bflowers?\b|\bflower ?beds?\b/, make: () => ({ type: 'plant-row' }), def: 2, label: 'flower beds' },
  { re: /\bboulders?\b/, make: () => ({ type: 'boulder' }), def: 2, label: 'boulders' },
  { re: /\brocks?\b/, make: () => ({ type: 'rock' }), def: 3, label: 'rocks' },
  { re: /\bfountain\b/, make: () => ({ type: 'fountain' }), def: 1, label: 'fountain' },
];
const COUNT_WORDS: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12 };

export function Genius2DBar({ onScene, getCurrent }: { onScene: (scene: any) => void; getCurrent?: () => any }) {
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);
  /* Latest site elements (fence / enclosure / turf…), for zones and moves. */
  const elementsRef = React.useRef<any[]>([]);
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('design_studio_site_elements_v1') || '[]');
      if (Array.isArray(saved)) elementsRef.current = saved;
    } catch { /* fresh board */ }
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (Array.isArray(d)) elementsRef.current = d;
    };
    window.addEventListener('design-studio:site-elements', h);
    return () => window.removeEventListener('design-studio:site-elements', h);
  }, []);

  const sendPoolUpdate = React.useCallback((detail: Record<string, unknown>) => {
    window.dispatchEvent(new CustomEvent('design-studio:pool-update', { detail }));
  }, []);
  const moveElement = React.useCallback((detail: Record<string, unknown>) => new Promise<boolean>((res) => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      if (d.kind !== 'move') return;
      window.removeEventListener('design-studio:element-result', h);
      res(!!d.ok);
    };
    window.addEventListener('design-studio:element-result', h);
    setTimeout(() => res(false), 1200);
    window.dispatchEvent(new CustomEvent('design-studio:move-element', { detail }));
  }), []);

  const run = async () => {
    if (prompt.trim().length < 3 || busy) return;
    const q = prompt.toLowerCase();
    const current = snapshotCurrent(getCurrent?.());

    /* ---- gates & doors (site layer) ---- */
    const gateKind = /\b(screen|cage|enclosure)\b/.test(q) ? 'enclosure' : /\bfence\b/.test(q) ? 'fence' : /\bgate\b/.test(q) ? 'fence' : null;
    if (/\b(door|doors|gate|gates)\b/.test(q) && !/\bmove\b/.test(q)) {
      if (!gateKind) { setNote('Add the door to the screen or the fence? Say "door on the screen" or "gate on the fence".'); return; }
      const count = Number(q.match(/\b(\d)\b/)?.[1] ?? (/\btwo\b/.test(q) ? 2 : /\bthree\b/.test(q) ? 3 : 1));
      const done = new Promise<boolean>((res) => { const h = (e: Event) => { window.removeEventListener('design-studio:gate-result', h); res(!!(e as CustomEvent).detail?.ok); }; window.addEventListener('design-studio:gate-result', h); setTimeout(() => res(false), 800); });
      window.dispatchEvent(new CustomEvent('design-studio:add-gate', { detail: { kind: gateKind, count, double: /double/.test(q) } }));
      const ok = await done;
      setNote(ok ? `Added ${count} ${gateKind === 'fence' ? 'gate' : 'door'}${count > 1 ? 's' : ''}. Nothing else changed.` : `Draw a ${gateKind === 'fence' ? 'fence' : 'screen'} first, then ask again.`);
      if (ok) setPrompt('');
      return;
    }

    /* ---- moves: pool, spa, site elements, placed features — executed here ---- */
    if (/\b(move|shift|slide|nudge|relocate)\b/.test(q)) {
      const feet = parseFeet(q);
      const dir = DIRS.find((d) => d.re.test(q));
      const beside = /\b(beside|next to|alongside|adjacent to)\b/.test(q);
      const dxFt = dir ? dir.dx * (feet ?? 3) : 0;
      const dyFt = dir ? dir.dy * (feet ?? 3) : 0;
      const wantsPool = /\bpool\b/.test(q) && !/\bpool deck\b/.test(q);
      const wantsSpa = /\bspa\b|\bhot tub\b/.test(q);
      const elKind = /\b(screen|enclosure|cage)\b/.test(q) ? 'enclosure' : /\bfence\b/.test(q) ? 'fence' : /\bturf\b/.test(q) ? 'turf' : /\bdeck\b/.test(q) ? 'deck' : null;
      const rockMove = /\brocks?\b|\bboulders?\b/.test(q);
      const treeMove = /\bpalms?\b|\btrees?\b|\bshrubs?\b|\bbush/.test(q);
      const did: string[] = [];
      if ((dir || beside) && (wantsPool || wantsSpa || elKind || rockMove || treeMove)) {
        if (wantsPool && current) {
          if (beside && elKind) {
            /* pool beside an element: shift the pool toward that element's side */
            const el = elementsRef.current.find((x) => x.kind === elKind);
            if (el?.pts?.length >= 3) {
              const pc = centroid(current.points), ec = centroid(el.pts);
              const pb = bbox(current.points);
              const gap = 2 * PX_PER_FT;
              let dx = 0, dy = 0;
              if (Math.abs(ec.x - pc.x) >= Math.abs(ec.y - pc.y)) dx = ec.x - pc.x - Math.sign(ec.x - pc.x || 1) * ((pb.maxX - pb.minX) / 2 + (bbox(el.pts).maxX - bbox(el.pts).minX) / 2 + gap);
              else dy = ec.y - pc.y - Math.sign(ec.y - pc.y || 1) * ((pb.maxY - pb.minY) / 2 + (bbox(el.pts).maxY - bbox(el.pts).minY) / 2 + gap);
              /* fence/screen rings enclose the pool — moving the pool inside one only makes sense as a nudge */
              if (elKind === 'fence' || elKind === 'enclosure') { dx = 0; dy = 0; }
              if (dx || dy) { sendPoolUpdate({ points: translatePts(current.points, dx / PX_PER_FT, dy / PX_PER_FT) }); did.push('the pool beside the ' + elKind); }
            }
          }
          if (!did.length && dir) { sendPoolUpdate({ points: translatePts(current.points, dxFt, dyFt) }); did.push(`the pool ${feet ?? 3} ft ${dir.label}`); }
        }
        if (wantsSpa && current) {
          const spaIdx = current.additionalPools.findIndex((b: any) => /spa/i.test(String(b?.type ?? b?.featureType ?? '')) || /spa/i.test(String(b?.id ?? '')));
          const body = spaIdx >= 0 ? current.additionalPools[spaIdx] : current.additionalPools[0];
          if (body?.points?.length >= 3) {
            let moved = body.points;
            if (beside && wantsPool) {
              const pc = centroid(current.points), sc = centroid(body.points), sb = bbox(body.points), pb = bbox(current.points);
              const gapFt = 2;
              let nx = sc.x, ny = sc.y;
              if (Math.abs(sc.x - pc.x) >= Math.abs(sc.y - pc.y)) nx = pc.x + Math.sign(sc.x - pc.x || 1) * ((pb.maxX - pb.minX) / 2 + (sb.maxX - sb.minX) / 2 + gapFt * PX_PER_FT);
              else ny = pc.y + Math.sign(sc.y - pc.y || 1) * ((pb.maxY - pb.minY) / 2 + (sb.maxY - sb.minY) / 2 + gapFt * PX_PER_FT);
              moved = translatePts(body.points, (nx - sc.x) / PX_PER_FT, (ny - sc.y) / PX_PER_FT);
              did.push('the spa beside the pool');
            } else if (dir) {
              moved = translatePts(body.points, dxFt, dyFt);
              did.push(`the spa ${feet ?? 3} ft ${dir.label}`);
            }
            if (did.length) {
              const bodies = current.additionalPools.map((b: any, i: number) => (b === body ? { ...b, points: moved } : b));
              sendPoolUpdate({ additionalPools: bodies });
            }
          } else if (wantsSpa && !wantsPool) {
            setNote('There is no spa drawn yet — add one first, then I can move it.');
            return;
          }
        }
        if (elKind && !(beside && wantsPool)) {
          const ok = await moveElement(beside ? { kind: elKind, besidePool: true } : { kind: elKind, dxFt, dyFt });
          if (ok) did.push(beside ? `the ${elKind} beside the pool` : `the ${elKind} ${feet ?? 3} ft ${dir?.label ?? ''}`.trim());
        }
        if ((rockMove || treeMove) && current && dir) {
          const types = rockMove ? ['rock', 'boulder'] : ['tree', 'shrub'];
          let n = 0;
          const feats = current.features.map((f: any) => {
            if (!types.includes(f?.type)) return f;
            n++;
            return { ...f, x: Math.round(f.x + dxFt * PX_PER_FT), y: Math.round(f.y + dyFt * PX_PER_FT) };
          });
          if (n) { sendPoolUpdate({ features: feats }); did.push(`${n} ${rockMove ? 'rock' : 'plant'}${n > 1 ? 's' : ''} ${feet ?? 3} ft ${dir.label}`); }
        }
        if (did.length) {
          setNote(`Moved ${did.join(' and ')}. Nothing else changed.`);
          setPrompt('');
          return;
        }
        if (!dir && !beside) { setNote('Tell me how far and which way — for example "move the pool 4 feet left". Nothing was moved.'); return; }
      }
    }

    /* ---- draw a site element (fence / screen / turf) ---- */
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

    /* ---- direct landscape planting (no function round-trip) ---- */
    const vegHit = VEG.filter((v) => v.re.test(q));
    if (vegHit.length && /\b(add|plant|put|place|grow|landscape|line|surround)\b/.test(q) && current) {
      const deck = deckRingPx(current.points);
      const zoneKind = /\binside the (?:screen|enclosure)\b/.test(q) ? 'enclosure' : /\binside the fenc/.test(q) ? 'fence' : null;
      const zone = zoneKind ? elementsRef.current.find((x) => x.kind === zoneKind)?.pts : null;
      const zb = zone ? bbox(zone) : bbox(current.points);
      const placed: any[] = [];
      const placedNames: string[] = [];
      const taken: Array<{ x: number; y: number }> = [];
      const fits = (x: number, y: number) => {
        if (pointInPoly(x, y, deck)) return false;                    /* never on pool or deck */
        if (zone && !pointInPoly(x, y, zone)) return false;           /* stay inside the asked zone */
        if (!zone && pointInPoly(x, y, current.points)) return false;
        return taken.every((t) => Math.hypot(t.x - x, t.y - y) >= 3 * PX_PER_FT);
      };
      for (const v of vegHit) {
        const numM = q.match(new RegExp(`(\\d+|${Object.keys(COUNT_WORDS).join('|')})\\s+(?:[a-z]+\\s+)?${v.label.replace(/s$/, '').replace('flower beds', 'flower')}`));
        const count = Math.min(24, numM ? (Number(numM[1]) || COUNT_WORDS[numM[1]] || v.def) : v.def);
        let made = 0;
        if (zone) {
          for (let tries = 0; tries < 400 && made < count; tries++) {
            const x = zb.minX + Math.random() * (zb.maxX - zb.minX);
            const y = zb.minY + Math.random() * (zb.maxY - zb.minY);
            if (!fits(x, y)) continue;
            placed.push({ ...v.make(), x: Math.round(x), y: Math.round(y), id: `gf-${Date.now().toString(36)}-${placed.length}` });
            taken.push({ x, y }); made++;
          }
        } else {
          /* bed ring: just outside the deck, evenly around the pool */
          const ringPts: Array<{ x: number; y: number }> = [];
          const bed = deckRingPx(current.points, 9.5);
          for (let i = 0; i < bed.length; i++) {
            const a = bed[i], b = bed[(i + 1) % bed.length];
            const segLen = Math.hypot(b.x - a.x, b.y - a.y);
            const steps = Math.max(1, Math.floor(segLen / (3.2 * PX_PER_FT)));
            for (let sIdx = 0; sIdx < steps; sIdx++) ringPts.push({ x: a.x + ((b.x - a.x) * sIdx) / steps, y: a.y + ((b.y - a.y) * sIdx) / steps });
          }
          const start = Math.floor(Math.random() * Math.max(1, ringPts.length));
          for (let k = 0; k < ringPts.length && made < count; k++) {
            const p = ringPts[(start + k * 2) % ringPts.length];
            if (!fits(p.x, p.y)) continue;
            placed.push({ ...v.make(), x: Math.round(p.x), y: Math.round(p.y), id: `gf-${Date.now().toString(36)}-${placed.length}` });
            taken.push(p); made++;
          }
        }
        if (made) placedNames.push(`${made} ${v.label}`);
      }
      if (placed.length) {
        sendPoolUpdate({ features: [...current.features, ...placed] });
        setNote(`Planted ${placedNames.join(', ')}${zone ? ` inside the ${zoneKind === 'enclosure' ? 'screen' : 'fenced area'}` : ' around the pool'} — on the ground, never on the pool or deck. Nothing else changed.`);
        setPrompt('');
        return;
      }
      setNote(zone ? 'No open ground fits inside there clear of the pool and deck — try planting around the pool instead.' : 'Draw the pool first, then I can plant around it.');
      return;
    }

    /* ---- everything else goes to scene-genius ---- */
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
      const currentBody = current
        ? { mode: '2d', pool: { length: Math.round(current.lengthFt), width: Math.round(current.widthFt), depthProfile: current.depthPoints.slice(0, 8), outlinePoints: current.points.length } }
        : { mode: '2d' };
      const { data, error } = await invokeGenius('scene-genius', { body: { prompt, current: currentBody } }, { onBusy: () => setNote('Busier than normal right now — your design is underway and will go through on its own. Hang tight…') });
      if (error || !data?.plan) { setNote(data?.error || 'Genius could not design that. Try again.'); return; }
      const plan = data.plan as any;

      /* Summary-only plan = a site request the function routes. */
      if (!plan.pool && !plan.deck && !plan.finishHint && !plan.copingHint && !plan.waterlineHint && !plan.paverHint && !plan.stairs && !plan.seating && plan.lights === undefined && plan.night === undefined && !plan.models?.length) {
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
       * an explicit new design, or a first draw — always natively, in pixels. */
      let outline: Array<{ x: number; y: number; id: string; curveType?: any }>;
      if (current && !shapeChanged && !explicitNew) {
        outline = transformOutline(current.points, L, W);
      } else {
        const pts = shapePoints(shape, W, L);
        const c = current ? centroid(current.points) : { x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight / 2) };
        const straight = shape === 'rectangle' || shape === 'l-shape';
        outline = pts.map((p, i) => ({ x: Math.round(p.x * PX_PER_FT + c.x), y: Math.round(p.y * PX_PER_FT + c.y), id: `p${i + 1}`, curveType: straight ? ('linear' as const) : ('curve' as const) }));
      }
      /* Rounded corners round the CURRENT spline (and any fresh shape). */
      const cornerR = clamp(plan.pool?.cornerRadius, 0, 6, 0);
      if (cornerR > 0) {
        outline = roundCorners(outline, cornerR * PX_PER_FT).map((p, i) => ({ x: Math.round(p.x), y: Math.round(p.y), id: `p${i + 1}`, curveType: 'curve' as const }));
      }

      /* Pool features the plan names (stairs, seating, lights). */
      const feats: any[] = current ? [...current.features] : [];
      const oc = centroid(outline);
      const ob = bbox(outline);
      const inset = (x: number, y: number, ft: number) => {
        const dx = oc.x - x, dy = oc.y - y, len = Math.hypot(dx, dy) || 1;
        return { x: Math.round(x + (dx / len) * ft * PX_PER_FT), y: Math.round(y + (dy / len) * ft * PX_PER_FT) };
      };
      if (plan.stairs) {
        const mid = { x: (ob.minX + ob.maxX) / 2, y: ob.minY };
        const p = inset(mid.x, mid.y, 1);
        feats.push({ type: 'stairs', x: p.x, y: p.y, id: `gf-stairs-${Date.now().toString(36)}`, steps: 3 });
      }
      if (plan.seating) {
        const p = inset((ob.minX + ob.maxX) / 2, ob.maxY, 1);
        feats.push({ type: 'pool-seat', x: p.x, y: p.y, id: `gf-seat-${Date.now().toString(36)}` });
      }
      if (typeof plan.lights === 'number' && plan.lights > 0) {
        const n = Math.min(8, Math.round(plan.lights));
        for (let i = 0; i < n; i++) {
          const src = outline[Math.floor((i * outline.length) / n)] ?? oc;
          const p = inset(src.x, src.y, 0.6);
          feats.push({ type: 'light', x: p.x, y: p.y, id: `gf-light-${Date.now().toString(36)}-${i}` });
        }
      }
      /* Models the plan composes (3D vocabulary): land them as 2D features
       * with the placement law — never inside the pool/deck ring. */
      const models = Array.isArray(plan.models) ? plan.models.slice(0, 40) : [];
      const deck = deckRingPx(outline);
      let modelsPlaced = 0;
      for (const m of models) {
        const name = String(m?.name ?? m?.category ?? '').toLowerCase();
        const v = VEG.find((x) => x.re.test(name)) ?? (/\bfire\b/.test(name) ? null : null);
        if (!v) continue;
        const x = oc.x + (typeof m.x === 'number' ? m.x : 0) * PX_PER_FT;
        const y = oc.y + (typeof m.y === 'number' ? m.y : typeof m.z === 'number' ? m.z : 0) * PX_PER_FT;
        if (pointInPoly(x, y, deck) || pointInPoly(x, y, outline)) continue;
        feats.push({ ...v.make(), x: Math.round(x), y: Math.round(y), id: `gf-m-${Date.now().toString(36)}-${modelsPlaced}` });
        modelsPlaced++;
      }

      const materials = {
        ...(plan.finishHint ? { finish: String(plan.finishHint) } : {}),
        ...(plan.copingHint ? { coping: String(plan.copingHint) } : {}),
        ...(plan.paverHint ? { paver: String(plan.paverHint) } : {}),
      };
      sendPoolUpdate({
        points: outline,
        depthPoints: anchors,
        ...(feats.length !== (current?.features.length ?? 0) ? { features: feats } : {}),
        ...(Object.keys(materials).length ? { materials } : {}),
      });
      const circular = shape === 'oval' && W === L;
      setNote(plan.summary || (current && !shapeChanged && !explicitNew
        ? `Edited in place: ${W}′ × ${L}′${cornerR > 0 ? ', corners rounded' : ''} — your outline, adjusted.`
        : `Drawn: ${circular ? `circular pool, ${W} ft across` : `${W}′ × ${L}′ ${shape} pool`}${modelsPlaced ? `, plus ${modelsPlaced} landscape pieces` : ''}.`));
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
        placeholder="Ask Genius: draw a circular pool, round the corners, move the fence 3 ft right, plant palms around the pool…"
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
