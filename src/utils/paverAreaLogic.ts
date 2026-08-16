/**
 * Single source of truth for how paver / deck square footage is billed off any
 * Wonderlands drawing board.
 *
 * Rule: the paved area is the drawn deck polygon(s) MINUS every surface that
 * needs nothing underneath it — pool, spa, tanning ledge, green space (grass,
 * turf, "Greenland"), bushes, hedges, planters, garden beds, and any zone
 * defined as gravel, sand, dirt, mulch, beach, lagoon, lake, pond or water
 * feature. Only the portion of those shapes that actually overlaps the deck is
 * removed, so a planter drawn on the lawn never reduces the paver count.
 */
import polygonClipping from 'polygon-clipping';

export type FlatPt = { x: number; y: number };

/** Keywords for surfaces that are never paved. */
const NON_PAVER_KEYWORDS = [
  'pool', 'spa', 'hot tub', 'jacuzzi', 'tanning', 'ledge', 'sun shelf', 'baja',
  'greenland', 'green space', 'greenspace', 'grass', 'lawn', 'turf', 'sod',
  'bush', 'shrub', 'hedge', 'plant', 'planter', 'garden', 'bed', 'landscape',
  'tree', 'mulch', 'gravel', 'rock', 'boulder', 'stone bed', 'sand', 'dirt',
  'soil', 'beach', 'lagoon', 'lake', 'pond', 'stream', 'water', 'fountain',
  'waterfall', 'creek', 'river',
];

/**
 * True when a layer / element label describes a surface that requires no pavers
 * underneath it and must therefore be deducted from the deck area.
 */
export const isNonPaverSurface = (kind?: string | null): boolean => {
  if (!kind) return false;
  const k = kind.toLowerCase().replace(/[_-]+/g, ' ');
  return NON_PAVER_KEYWORDS.some((word) => k.includes(word));
};

const toRing = (pts: FlatPt[]): [number, number][] => {
  const r = pts.map((p) => [p.x, p.y] as [number, number]);
  if (r.length >= 3) r.push([r[0][0], r[0][1]]);
  return r;
};

const ringArea = (ring: [number, number][]): number => {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    s += (ring[j][0] + ring[i][0]) * (ring[i][1] - ring[j][1]);
  }
  return Math.abs(s / 2);
};

/** Absolute area of a simple polygon, in the units of the supplied points. */
export const flatPolygonArea = (pts: FlatPt[]): number =>
  pts.length < 3 ? 0 : ringArea(toRing(pts));

/**
 * Net paved area of the drawn deck after every non-paver surface that overlaps
 * it is cut out. Units follow the input (pass `pxPerUnit` to convert px → ft).
 */
export function computeNetPaverArea(params: {
  /** Deck / patio / driveway polygons drawn on the board */
  deckPolygons: FlatPt[][];
  /** Polygons of surfaces that need nothing underneath (pool, spa, grass, gravel…) */
  exclusionPolygons: FlatPt[][];
  /** Drawing scale: pixels (or units) per foot. Defaults to 1 (already in feet). */
  pxPerFt?: number;
}): number {
  const { deckPolygons, exclusionPolygons, pxPerFt = 1 } = params;
  const decks = deckPolygons.filter((p) => p && p.length >= 3);
  if (!decks.length) return 0;
  const sq = (pxPerFt || 1) * (pxPerFt || 1);

  let net = 0;
  try {
    const union = polygonClipping.union(
      decks.map((p) => [toRing(p)]) as never,
    ) as [number, number][][][];
    const cuts = exclusionPolygons
      .filter((p) => p && p.length >= 3)
      .map((p) => [toRing(p)]) as never[];
    const result = (cuts.length
      ? (polygonClipping.difference(union as never, ...cuts) as [number, number][][][])
      : union) || [];
    result.forEach((poly) => {
      poly.forEach((ring, i) => {
        const a = ringArea(ring);
        net += i === 0 ? a : -a;
      });
    });
  } catch {
    // Degenerate geometry — fall back to a plain subtraction so a price still shows.
    const gross = decks.reduce((sum, p) => sum + flatPolygonArea(p), 0);
    const cut = exclusionPolygons.reduce((sum, p) => sum + flatPolygonArea(p), 0);
    net = Math.max(0, gross - cut);
  }

  return Math.max(0, net / sq);
}
