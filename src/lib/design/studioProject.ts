/** Complete studio document and ID-based 3D reconciliation. Imagine Engine Studios Corp. */
import type { Board3D } from './board3D';
import { paverTypes } from '@/data/paverData';
import { buildFinishTextures } from '@/data/textureLibrary';
import type { StudioMaterials } from './studioMaterials';

export function reconcileStudioBoard<T extends { additionalPools?: any[]; site?: any[]; scale?: number; additionalDeckPoints?: Record<string, any[]> }>(state: T, board: Board3D | null): T {
  if (!board?.origin) return state;
  const scale = state.scale ?? 10, origin = board.origin;
  const toPx = (pts: { x: number; z: number }[]) => pts.map((p, i) => ({ x: (p.x + origin.x) * scale, y: (p.z + origin.y) * scale, id: `p${i}` }));
  const additionalPools = (state.additionalPools ?? []).map(p => {
    const w = board.waters?.find(w => w.itemId === p.id);
    if (!w) return p;
    const old = p.materials as StudioMaterials | undefined;
    const materials = { ...old, finishUrl: w.finish, copingUrl: w.coping, waterlineUrl: w.waterline, finishScale: w.finishScale, copingScale: w.copingScale, waterlineScale: w.waterlineScale };
    const finish = buildFinishTextures().find(f => f.url === w.finish);
    if (finish) Object.assign(materials, { finishId: `cat-${finish.id}` });
    const coping = paverTypes.find(p => p.image === w.coping);
    if (coping) Object.assign(materials, { copingId: coping.id });
    const deck = board.surfaces.find(s => s.itemId === `__deck_${p.id}`);
    if (deck) Object.assign(materials, { paverUrl: deck.image, paverScale: deck.scale, paverId: paverTypes.find(p => p.image === deck.image)?.id ?? old?.paverId });
    const same = w.pts.length === p.points.length && w.pts.every((q, i) => Math.abs((q.x + origin.x) * scale - p.points[i].x) < .01 && Math.abs((q.z + origin.y) * scale - p.points[i].y) < .01);
    // A densified render ring is not a new control polygon unless it was edited in 3D.
    const unchanged = p.renderRing3D && JSON.stringify(p.renderRing3D) === JSON.stringify(w.pts);
    return { ...p, points: same || unchanged ? p.points : toPx(w.pts), materials, details3D: { ...w }, renderRing3D: w.pts };
  });
  const site = (state.site ?? []).map(e => {
    const line = [...board.fences, ...board.screens].find(x => x.itemId === e.id);
    const surface = board.surfaces.find(s => s.itemId === e.id);
    return { ...e, ...(line ? { pts: toPx(line.pts), color: line.color, height: line.height, gates: line.gates, details3D: line } : {}), ...(surface ? { textureUrl: surface.image, textureScale: surface.scale, color: surface.kind === 'turf' ? surface.color : e.color } : {}) };
  });
  return { ...state, additionalPools, site };
}

export function completeStudioProject(board2D: Record<string, any>, scene3D: unknown, board3D: Board3D | null): Record<string, any> {
  return { ...reconcileStudioBoard(board2D, board3D), studioVersion: 2, scene3D, board3D };
}