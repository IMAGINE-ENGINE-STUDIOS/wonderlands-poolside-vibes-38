/**
 * LandscapeLayer — the Design Studio face of the Planting Studio engine
 * (src/lib/landscape). Renders the landscape layout (beds + plantings) over
 * the PoolBuilder board in the same overlay slot and transform as
 * SiteElementsLayer, and applies Genius landscape edits through
 * `applyLandscapeEdit` with the pool + deck as the obstacle hole — real
 * catalog plants at true spacing and mature canopy, beds as filled polygons,
 * take-off priced by `measureLandscapeLayout`. The layout persists per board
 * and broadcasts on `design-studio:landscape-layout`.
 */
import * as React from 'react';
import { applyLandscapeEdit, filterKeepOut, type KeepOutOpts, type LandscapeEdit } from '@/lib/landscape/landscapeOps';
import { inspectDesign, repairLayout } from '@/lib/landscape/inspectDesign';
import { recordDesign } from '@/lib/landscape/designCorpus';
import {
  BED_FILLS, bedFill, emptyLandscapeLayout, measureLandscapeLayout, sampleBed, type BedFillId, type LandscapeLayout,
} from '@/lib/landscape/landscapeEstimate';
import { drawnSpreadFt, getPlantSpec, plantById } from '@/lib/landscape/plantSpecs';
import { LANDSCAPE_LOOKS } from '@/lib/landscape/presets';
import { clearLandscape3D, layoutTo3D, saveLandscape3D } from '@/lib/landscape/landscape3D';
import { publishLandscape } from '@/lib/landscape/landscapeStore';
import type { BoardView } from './SiteElementsLayer';

const LS_KEY = 'design_studio_landscape_v1';
const SITE_LS_KEY = 'design_studio_site_elements_v1';

interface Barrier { polys: Array<Array<{ x: number; y: number }>>; boundsFt?: { x0: number; y0: number; x1: number; y1: number } }

/** Fences and screen enclosures are the landscape's legal boundary: their
 * lines are keep-out zones, and the largest closed one frames the yard —
 * "inside the fenced area" made literal. */
function barriersOf(els: Array<{ kind?: string; pts?: Array<{ x: number; y: number }> }>): Barrier {
  const bs = (els ?? []).filter((e) => (e.kind === 'fence' || e.kind === 'enclosure') && (e.pts?.length ?? 0) >= 2);
  const polys = bs.map((e) => e.pts as Array<{ x: number; y: number }>);
  let boundsFt: Barrier['boundsFt']; let best = 0;
  for (const e of bs) {
    const pts = e.pts as Array<{ x: number; y: number }>;
    if (pts.length < 3) continue;
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    if (area > best) { best = area; boundsFt = { x0: Math.min(...xs) / 10, y0: Math.min(...ys) / 10, x1: Math.max(...xs) / 10, y1: Math.max(...ys) / 10 }; }
  }
  return { polys, boundsFt };
}

function persistedBarriers(): Barrier {
  try {
    const raw = JSON.parse(localStorage.getItem(SITE_LS_KEY) || 'null');
    if (Array.isArray(raw)) return barriersOf(raw);
  } catch { /* no site elements yet */ }
  return { polys: [] };
}
export const LANDSCAPE_LAYOUT_EVENT = 'design-studio:landscape-layout';

/* The board ALWAYS starts at zero (founder rule): a previous session's
 * landscape is never restored onto a fresh board. The layout lives in
 * session state; Genius builds it, Reset clears it, and leaving the
 * Studio ends it. */

/* ------------------------------------------------------------------ *
 * Plan-view drawing kit — the same craft standard as the Studio's other
 * splines: beds render as MATERIALS (procedural mulch grain, river rock,
 * shell, sod) under a steel edge, and plants render as botanical plan
 * symbols (palm fronds, clustered tree canopies, scalloped shrubs, grass
 * tufts) with gradient depth and a ground shadow. Deterministic seeds keep
 * every render identical frame to frame.
 * ------------------------------------------------------------------ */
const hashStr = (t: string) => { let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); };
const rng = (seed: number) => { let x = (seed % 2147483646) + 1; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; };
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
};
const gradId = (hex: string) => `can-${hex.replace('#', '')}`;

function scallopPath(cx: number, cy: number, r: number, seed: number, lobes = 9, amp = 0.13): string {
  const rand = rng(seed);
  const phase = rand() * Math.PI * 2;
  const N = 40;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(lobes * t + phase) + 0.05 * Math.sin(3 * t + phase * 2));
    pts.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
  }
  let d = `M ${((pts[0][0] + pts[N - 1][0]) / 2).toFixed(1)} ${((pts[0][1] + pts[N - 1][1]) / 2).toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p = pts[i], q = pts[(i + 1) % N];
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  return d + ' Z';
}

const FLECKS: Record<string, { palette: string[]; kind: 'dash' | 'dot' | 'rock' | 'grass' | 'lava' }> = {
  'mulch-brown': { palette: ['#7d5a3a', '#54381f', '#86644a', '#4a2f1a'], kind: 'dash' },
  'mulch-black': { palette: ['#3d3831', '#1f1c19', '#4a443b'], kind: 'dash' },
  'shell': { palette: ['#efe8d2', '#c9bc9c', '#f7f2df'], kind: 'dot' },
  'river-rock': { palette: ['#a39a89', '#776f60', '#b5ab99', '#6b6355', '#948a76'], kind: 'rock' },
  'lava-rock': { palette: ['#4a3f3a', '#584a42', '#2e2724'], kind: 'lava' },
  'sod': { palette: ['#5d8f47', '#3f6a2e', '#6fa355'], kind: 'grass' },
  'planted': { palette: ['#6d5136', '#4c3823', '#7d5f3d'], kind: 'dash' },
};

function BedPattern({ fillId, base }: { fillId: string; base: string }) {
  const spec = FLECKS[fillId] ?? FLECKS['mulch-brown'];
  const rand = rng(hashStr(fillId));
  const items: React.ReactNode[] = [];
  const T = 46;
  if (spec.kind === 'rock') {
    for (let i = 0; i < 15; i++) {
      const cx = rand() * T, cy = rand() * T, rx = 4 + rand() * 4.5, ry = rx * (0.62 + rand() * 0.2), rot = rand() * 180;
      items.push(<ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={spec.palette[i % spec.palette.length]} stroke="rgba(30,24,16,0.25)" strokeWidth={0.7} />);
    }
  } else if (spec.kind === 'dot') {
    for (let i = 0; i < 34; i++) items.push(<circle key={i} cx={rand() * T} cy={rand() * T} r={1.2 + rand() * 1.6} fill={spec.palette[i % spec.palette.length]} opacity={0.55 + rand() * 0.4} />);
  } else if (spec.kind === 'grass') {
    for (let i = 0; i < 36; i++) {
      const x = rand() * T, y = rand() * T, a = (rand() - 0.5) * 0.9, l = 3.4 + rand() * 2.4;
      items.push(<line key={i} x1={x} y1={y} x2={x + Math.sin(a) * l} y2={y - Math.cos(a) * l} stroke={spec.palette[i % spec.palette.length]} strokeWidth={1.3} strokeLinecap="round" opacity={0.8} />);
    }
  } else if (spec.kind === 'lava') {
    for (let i = 0; i < 13; i++) items.push(<circle key={`b${i}`} cx={rand() * T} cy={rand() * T} r={2.8 + rand() * 3.4} fill={spec.palette[i % spec.palette.length]} />);
    for (let i = 0; i < 18; i++) items.push(<circle key={`s${i}`} cx={rand() * T} cy={rand() * T} r={0.7 + rand() * 0.8} fill="#a4442c" opacity={0.75} />);
  } else {
    for (let i = 0; i < 26; i++) {
      const x = rand() * T, y = rand() * T, a = rand() * Math.PI, l = 3.6 + rand() * 3.4;
      items.push(<line key={i} x1={x} y1={y} x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l} stroke={spec.palette[i % spec.palette.length]} strokeWidth={2.1} strokeLinecap="round" opacity={0.5 + rand() * 0.45} />);
    }
    if (fillId === 'planted') for (let i = 0; i < 11; i++) items.push(<circle key={`g${i}`} cx={rand() * T} cy={rand() * T} r={1.7} fill="#4d7c3a" opacity={0.85} />);
  }
  return (
    <pattern id={`bedpat-${fillId}`} width={T} height={T} patternUnits="userSpaceOnUse" patternTransform={`rotate(${(hashStr(fillId) % 36) - 18})`}>
      <rect width={T} height={T} fill={base} />
      {items}
    </pattern>
  );
}

export const LandscapeLayer: React.FC<{ view: BoardView | null }> = ({ view }) => {
  const [layout, setLayout] = React.useState<LandscapeLayout>(() => emptyLandscapeLayout());
  const layoutRef = React.useRef(layout);
  layoutRef.current = layout;
  const viewRef = React.useRef(view);
  viewRef.current = view;

  const [barriers, setBarriers] = React.useState<Barrier>(persistedBarriers);
  const barriersRef = React.useRef(barriers);
  barriersRef.current = barriers;
  React.useEffect(() => {
    const on = (ev: Event) => setBarriers(barriersOf(((ev as CustomEvent).detail ?? []) as never[]));
    window.addEventListener('design-studio:site-elements', on);
    return () => window.removeEventListener('design-studio:site-elements', on);
  }, []);

  const publishSnapshot = React.useCallback((next: LandscapeLayout) => {
    const t = measureLandscapeLayout(next);
    const byPlant = new Map<string, { name: string; count: number }>();
    for (const p of next.plantings) {
      const cur = byPlant.get(p.plantId) ?? { name: plantById(p.plantId)?.name ?? p.plantId, count: 0 };
      cur.count++; byPlant.set(p.plantId, cur);
    }
    publishLandscape({
      total: t.total, plantCount: t.plantCount, bedSqFt: t.bedSqFt,
      lines: [
        ...t.species.map((sp) => ({ name: `Landscaping · ${sp.name} ×${sp.qty}`, price: sp.amount })),
        ...t.beds.map((b) => ({ name: `Planting bed · ${bedFill(b.fill as BedFillId).name} (${Math.round(b.areaSqFt)} sq ft)`, price: b.amount })),
        ...(next.irrigation && t.irrigationTotal > 0 ? [{ name: 'Drip irrigation system', price: t.irrigationTotal }] : []),
      ],
      species: [...byPlant.entries()].map(([plantId, v]) => ({ plantId, name: v.name, count: v.count })),
      beds: t.beds.map((b) => ({ id: b.id, label: `Bed · ${bedFill(b.fill as BedFillId).name}`, sqFt: Math.round(b.areaSqFt) })),
    });
  }, []);

  const commit = React.useCallback((next: LandscapeLayout, holeFt?: { x0: number; y0: number; x1: number; y1: number }) => {
    layoutRef.current = next;
    setLayout(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent(LANDSCAPE_LAYOUT_EVENT, { detail: next }));
    publishSnapshot(next);
    if (holeFt) saveLandscape3D(layoutTo3D(next, holeFt));
  }, [publishSnapshot]);

  /* Opening state: ZERO. Clear any landscape an earlier session persisted
   * (board storage + the 3D handoff) and publish the empty snapshot so the
   * Objects panel and the summary open clean too. */
  React.useEffect(() => {
    try { localStorage.removeItem(LS_KEY); } catch { /* storage unavailable */ }
    clearLandscape3D();
    publishSnapshot(emptyLandscapeLayout());
  }, [publishSnapshot]);

  const holeOf = React.useCallback(() => {
    const v = viewRef.current;
    const all = [...(v?.poolPts ?? []), ...(v?.deckPts ?? [])];
    if (all.length < 3) return undefined;
    const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    return { x0: Math.min(...xs) / 10, y0: Math.min(...ys) / 10, x1: Math.max(...xs) / 10, y1: Math.max(...ys) / 10 };
  }, []);

  /* Reset Everything wipes the landscape with the rest of the board, and
   * the Objects panel can remove a species or a bed from here. */
  React.useEffect(() => {
    const onReset = () => { commit(emptyLandscapeLayout()); clearLandscape3D(); };
    const onRemove = (ev: Event) => {
      const d = (ev as CustomEvent).detail || {};
      const cur = layoutRef.current;
      const next = d.bedId
        ? { ...cur, beds: cur.beds.filter((b) => b.id !== d.bedId) }
        : d.plantId
          ? { ...cur, plantings: cur.plantings.filter((p) => p.plantId !== d.plantId) }
          : d.plantingId
            ? { ...cur, plantings: cur.plantings.filter((p) => p.id !== d.plantingId) }
            : cur;
      if (next !== cur) commit(next, holeOf());
    };
    window.addEventListener('design-studio:landscape-reset', onReset);
    window.addEventListener('design-studio:landscape-remove', onRemove);
    return () => {
      window.removeEventListener('design-studio:landscape-reset', onReset);
      window.removeEventListener('design-studio:landscape-remove', onRemove);
    };
  }, [commit, holeOf]);

  /* The law applies retroactively: a fence drawn over existing plants
   * lifts the ones on its line, and 3D republishes without them. */
  React.useEffect(() => {
    if (!barriers.polys.length || !layoutRef.current.plantings.length) return;
    const next = filterKeepOut(layoutRef.current, barriers.polys);
    if (next === layoutRef.current) return;
    const v = viewRef.current;
    const all = [...(v?.poolPts ?? []), ...(v?.deckPts ?? [])];
    if (all.length >= 3) {
      const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
      commit(next, { x0: Math.min(...xs) / 10, y0: Math.min(...ys) / 10, x1: Math.max(...xs) / 10, y1: Math.max(...ys) / 10 });
    } else commit(next);
  }, [barriers, commit]);

  /* Genius landscape edits: { edits: LandscapeEdit[] } or { look: id },
   * applied against the live pool+deck hole so nothing lands on water or
   * pavers. Answers on design-studio:landscape-result with the take-off. */
  React.useEffect(() => {
    const on = (ev: Event) => {
      const d = (ev as CustomEvent).detail || {};
      const reply = (ok: boolean, extra: Record<string, unknown> = {}) =>
        window.dispatchEvent(new CustomEvent('design-studio:landscape-result', { detail: { ok, ...extra } }));
      const v = viewRef.current;
      const pool = v?.poolPts ?? [];
      if (pool.length < 3) return reply(false, { reason: 'no-pool' });
      const all = [...pool, ...(v?.deckPts ?? [])];
      const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
      const hole = {
        x0: Math.min(...xs) / 10, y0: Math.min(...ys) / 10,
        x1: Math.max(...xs) / 10, y1: Math.max(...ys) / 10,
      };
      let edits: LandscapeEdit[] = Array.isArray(d.edits) ? d.edits : [];
      if (d.look) {
        const look = LANDSCAPE_LOOKS.find((l) => l.id === d.look);
        if (!look) return reply(false, { reason: 'no-look' });
        edits = look.recipe as LandscapeEdit[];
      }
      if (!edits.length && !d.clearAll) return reply(false, { reason: 'empty' });
      let next = d.clearAll ? emptyLandscapeLayout() : layoutRef.current;
      const b = barriersRef.current;
      const opts: KeepOutOpts | undefined = b.polys.length ? { polys: b.polys, boundsFt: b.boundsFt } : undefined;
      for (const e of edits) next = applyLandscapeEdit(next, e, hole, opts);
      /* Inspector (Phase 4): Genius compositions are graded before the
       * customer sees them; one repair pass removes whatever breaks the
       * rules. Corpus (Phase 5): the design is remembered so the next one
       * composes in the pattern of work already approved. */
      let inspection: { score: number; passed: boolean; fixed: number } | undefined;
      if ((d.look || d.inspect) && !d.clearAll) {
        const holePoly = [
          { x: hole.x0 * 10, y: hole.y0 * 10 }, { x: hole.x1 * 10, y: hole.y0 * 10 },
          { x: hole.x1 * 10, y: hole.y1 * 10 }, { x: hole.x0 * 10, y: hole.y1 * 10 },
        ];
        const iopts = { hole: holePoly, barriers: b.polys, budgetCap: typeof d.budgetCap === 'number' ? d.budgetCap : undefined, privacy: !!d.privacy || !!d.brief?.privacy };
        let insp = inspectDesign(next, iopts);
        let fixed = 0;
        if (!insp.passed) {
          const rep = repairLayout(next, insp, iopts);
          if (rep.removed > 0) { next = rep.layout; fixed = rep.removed; insp = inspectDesign(next, iopts); }
        }
        inspection = { score: insp.score, passed: insp.passed, fixed };
        const tt = measureLandscapeLayout(next);
        const counts = new Map<string, number>();
        for (const p of next.plantings) counts.set(p.plantId, (counts.get(p.plantId) ?? 0) + 1);
        recordDesign({
          id: `d-${Date.now().toString(36)}`, ts: Date.now(),
          style: (d.look as string) ?? d.brief?.style ?? null,
          tier: d.brief?.tier, maintenance: d.brief?.maintenance,
          privacy: !!d.privacy || !!d.brief?.privacy, waterfront: !!d.brief?.waterfront,
          frameW: b.boundsFt ? Math.round(b.boundsFt.x1 - b.boundsFt.x0) : 60,
          frameH: b.boundsFt ? Math.round(b.boundsFt.y1 - b.boundsFt.y0) : 40,
          plantCount: tt.plantCount, total: tt.total,
          speciesTop: [...counts.entries()].sort((a, c) => c[1] - a[1]).slice(0, 8).map(([id]) => id),
          layout: next, inspectionScore: insp.score,
        });
      }
      commit(next, hole);
      const t = measureLandscapeLayout(next);
      reply(true, {
        plantCount: t.plantCount,
        bedSqFt: Math.round(t.bedSqFt),
        total: Math.round(t.total),
        species: t.species.slice(0, 6).map((sp) => `${sp.qty} ${sp.name}`),
        ...(inspection ? { inspection } : {}),
      });
    };
    window.addEventListener('design-studio:landscape-edit', on);
    return () => window.removeEventListener('design-studio:landscape-edit', on);
  }, [commit]);

  /* A saved layout meets the board: publish the 3D handoff once the pool
   * geometry is known, so 3D shows the plan without a fresh edit. */
  const holeKey = view?.poolPts?.length ? `${view.poolPts.length}:${view.deckPts?.length ?? 0}` : '';
  const publishedRef = React.useRef('');
  React.useEffect(() => {
    if (!view || !holeKey || publishedRef.current === holeKey) return;
    const all = [...(view.poolPts ?? []), ...(view.deckPts ?? [])];
    if (all.length < 3 || !layoutRef.current.plantings.length) return;
    const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    publishedRef.current = holeKey;
    saveLandscape3D(layoutTo3D(layoutRef.current, {
      x0: Math.min(...xs) / 10, y0: Math.min(...ys) / 10, x1: Math.max(...xs) / 10, y1: Math.max(...ys) / 10,
    }));
  }, [view, holeKey]);

  if (!view) return null;
  const transform = `translate(${view.width / 2 + view.pan.x} ${view.height / 2 + view.pan.y}) scale(${view.zoom}) translate(${-view.width / 2} ${-view.height / 2})`;
  const zoom = view.zoom || 1;
  /* Tall plants draw last (on top) — the spec's mature height decides order. */
  const plantingViews = layout.plantings
    .map((p) => {
      const plant = plantById(p.plantId);
      if (!plant) return null;
      const variant = plant.variants.find((x) => x.id === p.variantId) ?? plant.variants[0];
      const spec = getPlantSpec(plant, variant?.label);
      const size = p.size ?? variant?.sizes[Math.min(1, Math.max(0, variant.sizes.length - 1))]?.size ?? '3 gal';
      return { p, spec, r: Math.max(4, (drawnSpreadFt(spec, size) / 2) * 10) };
    })
    .filter(Boolean)
    .sort((a, b) => a!.spec.heightFt - b!.spec.heightFt) as Array<{ p: LandscapeLayout['plantings'][number]; spec: ReturnType<typeof getPlantSpec>; r: number }>;
  const foliageColors = [...new Set(plantingViews.map((v) => v.spec.foliage))];

  const plantSymbol = ({ p, spec, r }: (typeof plantingViews)[number]) => {
    const seed = hashStr(p.id);
    const rand = rng(seed);
    const gid = gradId(spec.foliage);
    const dark = shade(spec.foliage, -34);
    const light = shade(spec.foliage, 30);
    const remove = () => commit({ ...layoutRef.current, plantings: layoutRef.current.plantings.filter((x) => x.id !== p.id) }, holeOf());
    const shadow = <ellipse cx={p.x + r * 0.14} cy={p.y + r * 0.36} rx={r * 0.95} ry={r * 0.48} fill="#14210f" opacity={0.16} />;
    const wrap = (children: React.ReactNode) => (
      <g key={p.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onDoubleClick={remove}>
        <title>{`${plantById(p.plantId)?.name ?? 'Plant'} — double-click to remove`}</title>
        {shadow}
        {children}
      </g>
    );
    switch (spec.form) {
      case 'palm': {
        const fronds: React.ReactNode[] = [];
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + rand() * 0.25;
          const len = r * (0.92 + rand() * 0.3);
          const tx = p.x + Math.cos(a) * len, ty = p.y + Math.sin(a) * len;
          const cxp = p.x + Math.cos(a) * len * 0.52 - Math.sin(a) * len * 0.2, cyp = p.y + Math.sin(a) * len * 0.52 + Math.cos(a) * len * 0.2;
          fronds.push(<path key={`d${i}`} d={`M ${p.x} ${p.y} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`} stroke={dark} strokeWidth={Math.max(1.4, r * 0.15)} fill="none" strokeLinecap="round" opacity={0.92} />);
        }
        for (let i = 0; i < 9; i++) {
          const a = ((i + 0.5) / 9) * Math.PI * 2 + rand() * 0.25;
          const len = r * (0.6 + rand() * 0.22);
          const tx = p.x + Math.cos(a) * len, ty = p.y + Math.sin(a) * len;
          const cxp = p.x + Math.cos(a) * len * 0.5 - Math.sin(a) * len * 0.16, cyp = p.y + Math.sin(a) * len * 0.5 + Math.cos(a) * len * 0.16;
          fronds.push(<path key={`l${i}`} d={`M ${p.x} ${p.y} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`} stroke={light} strokeWidth={Math.max(1.1, r * 0.1)} fill="none" strokeLinecap="round" opacity={0.9} />);
        }
        return wrap(<>{fronds}<circle cx={p.x} cy={p.y} r={Math.max(1.8, r * 0.13)} fill="#6b4a2f" /><circle cx={p.x} cy={p.y} r={Math.max(0.9, r * 0.06)} fill="#4c3420" /></>);
      }
      case 'tree': {
        const lobes: React.ReactNode[] = [];
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + seed * 0.01;
          lobes.push(<circle key={i} cx={p.x + Math.cos(a) * r * 0.4} cy={p.y + Math.sin(a) * r * 0.4} r={r * 0.56} fill={`url(#${gid})`} />);
        }
        return wrap(<>
          {lobes}
          <circle cx={p.x} cy={p.y} r={r * 0.72} fill={`url(#${gid})`} />
          <path d={scallopPath(p.x - r * 0.14, p.y - r * 0.16, r * 0.44, seed + 3, 8, 0.16)} fill={light} opacity={0.35} />
          <circle cx={p.x} cy={p.y} r={Math.max(1.6, r * 0.09)} fill="#5a4030" />
        </>);
      }
      case 'grass':
      case 'spike': {
        const blades: React.ReactNode[] = [];
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + rand() * 0.5;
          const len = r * (0.66 + rand() * 0.42);
          blades.push(<line key={i} x1={p.x} y1={p.y} x2={p.x + Math.cos(a) * len} y2={p.y + Math.sin(a) * len} stroke={i % 2 ? light : dark} strokeWidth={Math.max(1.1, r * 0.13)} strokeLinecap="round" />);
          if (spec.bloom && i % 3 === 0) blades.push(<circle key={`b${i}`} cx={p.x + Math.cos(a) * len} cy={p.y + Math.sin(a) * len} r={Math.max(1.1, r * 0.11)} fill={spec.bloom} />);
        }
        return wrap(<>{blades}<circle cx={p.x} cy={p.y} r={Math.max(1.2, r * 0.16)} fill={dark} /></>);
      }
      case 'mat': {
        const dots: React.ReactNode[] = [];
        for (let i = 0; i < 7; i++) dots.push(<circle key={i} cx={p.x + (rand() - 0.5) * r * 1.2} cy={p.y + (rand() - 0.5) * r * 0.6} r={Math.max(1, r * 0.07)} fill={spec.bloom ?? light} opacity={0.9} />);
        return wrap(<>
          <g transform={`translate(${p.x} ${p.y}) scale(1 0.62) translate(${-p.x} ${-p.y})`}>
            <path d={scallopPath(p.x, p.y, r, seed, 11, 0.1)} fill={`url(#${gid})`} />
          </g>
          {dots}
        </>);
      }
      default: {
        const dots: React.ReactNode[] = [];
        if (spec.bloom) for (let i = 0; i < 6; i++) dots.push(<circle key={i} cx={p.x + (rand() - 0.5) * r * 1.1} cy={p.y + (rand() - 0.5) * r * 1.1} r={Math.max(1.3, r * 0.085)} fill={spec.bloom} opacity={0.95} />);
        return wrap(<>
          <path d={scallopPath(p.x, p.y, r, seed)} fill={`url(#${gid})`} />
          <path d={scallopPath(p.x - r * 0.13, p.y - r * 0.15, r * 0.55, seed + 5, 8, 0.16)} fill={light} opacity={0.4} />
          {dots}
        </>);
      }
    }
  };

  return (
    <>
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        {foliageColors.map((hex) => (
          <radialGradient key={hex} id={gradId(hex)} cx="38%" cy="32%" r="82%">
            <stop offset="0%" stopColor={shade(hex, 30)} />
            <stop offset="55%" stopColor={hex} />
            <stop offset="100%" stopColor={shade(hex, -32)} />
          </radialGradient>
        ))}
        {BED_FILLS.map((f) => <BedPattern key={f.id} fillId={f.id} base={f.color} />)}
      </defs>
      <g transform={transform}>
        {layout.beds.map((b) => {
          const pts = sampleBed(b);
          if (pts.length < 3) return null;
          const fill = bedFill(b.fill);
          const points = pts.map((p) => `${p.x},${p.y}`).join(' ');
          const remove = () => commit({ ...layoutRef.current, beds: layoutRef.current.beds.filter((x) => x.id !== b.id) }, holeOf());
          return (
            <g key={b.id}>
              <polygon points={points} transform="translate(2.5 3.5)" fill="#14210f" opacity={0.2} />
              <polygon points={points} fill={fill.color} />
              <polygon
                points={points}
                fill={`url(#bedpat-${b.fill})`}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onDoubleClick={remove}
              >
                <title>{`Planting bed · ${fill.name} — double-click to remove`}</title>
              </polygon>
              <polygon points={points} fill="none" stroke="rgba(20,14,8,0.25)" strokeWidth={7 / zoom} />
              <polygon points={points} fill="none" stroke="#241c14" strokeWidth={2.6 / zoom} opacity={0.9} />
            </g>
          );
        })}
        {plantingViews.map(plantSymbol)}
      </g>
    </svg>
    </>
  );
};

export default LandscapeLayer;
