/** Copyright Imagine Engine Studios Corp. */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { poolInsertionHit, splineHandleRadius, splineHitRadius } from './studioSplineControls';
const pool = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
describe('studio spline precision', () => {
  it('outside pool clicks do not insert points, including clicks over its deck', () => {
    assert.equal(poolInsertionHit(pool, 'rectangle', { x: 125, y: 50 }, 1), null);
    assert.equal(poolInsertionHit(pool, 'rectangle', { x: -40, y: -40 }, 1), null);
    assert.deepEqual(poolInsertionHit(pool, 'rectangle', { x: 50, y: 10 }, 1), { index: 0, point: { x: 50, y: 0 } });
  });
  it('handles become smaller on screen when zoomed in', () => {
    assert.equal(splineHandleRadius(1), 5);
    assert.equal(splineHandleRadius(4) * 4, splineHandleRadius(1));
    assert.ok(splineHitRadius(4) < splineHitRadius(1));
  });
});