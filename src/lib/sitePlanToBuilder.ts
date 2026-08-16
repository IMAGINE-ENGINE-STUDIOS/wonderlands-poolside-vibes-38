import {
  siteShapeOutline,
  type SitePlanData,
  type SiteShape,
} from '@/components/blueprint/SiteDrawingBoard';
import { poolBuilderToScene, buildTextureLibrary } from '@/components/scene3d/PoolBuilderConverter';
import { computeSiteEstimate } from '@/lib/siteEstimate';

const largest = (shapes: SiteShape[]) =>
  shapes.slice().sort((a, b) => b.points.length - a.points.length)[0];

const withIds = (pts: { x: number; y: number }[], prefix: string) =>
  pts.map((p, i) => ({ x: p.x, y: p.y, id: `${prefix}-${i}` }));

const perimeterFt = (pts: { x: number; y: number }[], pxPerFt: number) => {
  if (pts.length < 2) return 0;
  let len = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len / (pxPerFt || 1);
};

/**
 * Bridges the professional 2D site board into the shapes the studio already
 * understands: the pool-builder data contract used by the price summary and the
 * Scene3D payload used by the 3D viewer.
 */
export function sitePlanToBuilderData(plan: SitePlanData) {
  const est = computeSiteEstimate(plan);
  const poolShape = largest(plan.shapes.filter((s) => s.layer === 'pool'));
  const deckShape = largest(plan.shapes.filter((s) => s.layer === 'deck'));
  const poolOutline = poolShape ? siteShapeOutline(poolShape) : [];
  const deckOutline = deckShape ? siteShapeOutline(deckShape) : [];

  const poolCost = est.poolSqFt * 280;
  const deckCost = est.lines
    .filter((l) => l.label !== 'Pool / spa' && l.label !== 'Pool barrier')
    .reduce((s, l) => s + l.amount, 0);
  const copingCost = 0;
  const featuresCost = est.total - poolCost - deckCost - copingCost;

  return {
    points: withIds(poolOutline, 'pool'),
    depthPoints: [
      { position: 0, depth: 3.5, id: 'd0' },
      { position: 1, depth: 6, id: 'd1' },
    ],
    hardscapePoints: withIds(deckOutline, 'deck'),
    features: [] as any[],
    perimeter: perimeterFt(poolOutline, plan.pxPerFt),
    area: est.poolSqFt,
    deckArea: est.deckSqFt,
    totalCost: est.total,
    scale: plan.pxPerFt,
    breakdown: {
      poolCost,
      deckCost,
      copingCost,
      featuresCost: Math.max(0, featuresCost),
      total: est.total,
    },
    estimate: est,
  };
}

/** Scene3D + texture library for the studio 3D viewer, straight off the 2D plan. */
export function sitePlanToScene(plan: SitePlanData) {
  const data = sitePlanToBuilderData(plan);
  const scene = poolBuilderToScene({
    points: data.points,
    depthPoints: data.depthPoints,
    hardscapePoints: data.hardscapePoints,
    fencePoints: [],
    features: [],
    customTextures: [],
    poolShape: 'freeform',
    scale: plan.pxPerFt || 1,
    paverTypes: [],
  } as any);
  return { scene, textureLibrary: buildTextureLibrary([], []) };
}
