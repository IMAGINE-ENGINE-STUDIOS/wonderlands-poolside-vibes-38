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
import { applyLandscapeEdit, type LandscapeEdit } from '@/lib/landscape/landscapeOps';
import {
  bedFill, emptyLandscapeLayout, measureLandscapeLayout, sampleBed, type LandscapeLayout,
} from '@/lib/landscape/landscapeEstimate';
import { drawnSpreadFt, getPlantSpec, plantById } from '@/lib/landscape/plantSpecs';
import { LANDSCAPE_LOOKS } from '@/lib/landscape/presets';
import type { BoardView } from './SiteElementsLayer';

const LS_KEY = 'design_studio_landscape_v1';
export const LANDSCAPE_LAYOUT_EVENT = 'design-studio:landscape-layout';

function loadLayout(): LandscapeLayout {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (raw && Array.isArray(raw.beds) && Array.isArray(raw.plantings)) return raw as LandscapeLayout;
  } catch { /* fresh board */ }
  return emptyLandscapeLayout();
}

export const LandscapeLayer: React.FC<{ view: BoardView | null }> = ({ view }) => {
  const [layout, setLayout] = React.useState<LandscapeLayout>(loadLayout);
  const layoutRef = React.useRef(layout);
  layoutRef.current = layout;
  const viewRef = React.useRef(view);
  viewRef.current = view;

  const commit = React.useCallback((next: LandscapeLayout) => {
    layoutRef.current = next;
    setLayout(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent(LANDSCAPE_LAYOUT_EVENT, { detail: next }));
  }, []);

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
      for (const e of edits) next = applyLandscapeEdit(next, e, hole);
      commit(next);
      const t = measureLandscapeLayout(next);
      reply(true, {
        plantCount: t.plantCount,
        bedSqFt: Math.round(t.bedSqFt),
        total: Math.round(t.total),
        species: t.species.slice(0, 6).map((sp) => `${sp.count} ${sp.name}`),
      });
    };
    window.addEventListener('design-studio:landscape-edit', on);
    return () => window.removeEventListener('design-studio:landscape-edit', on);
  }, [commit]);

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

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <g transform={transform}>
        {layout.beds.map((b) => {
          const pts = sampleBed(b);
          if (pts.length < 3) return null;
          const fill = bedFill(b.fill);
          return (
            <polygon
              key={b.id}
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={fill.color}
              fillOpacity={0.55}
              stroke={fill.fleck}
              strokeWidth={2 / zoom}
            />
          );
        })}
        {plantingViews.map(({ p, spec, r }) => (
          <g key={p.id}>
            <circle cx={p.x} cy={p.y} r={r} fill={spec.foliage} fillOpacity={0.75} stroke="rgba(0,0,0,0.25)" strokeWidth={0.75 / zoom} />
            {spec.bloom && <circle cx={p.x} cy={p.y} r={Math.max(1.5, r * 0.35)} fill={spec.bloom} fillOpacity={0.9} />}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default LandscapeLayer;
