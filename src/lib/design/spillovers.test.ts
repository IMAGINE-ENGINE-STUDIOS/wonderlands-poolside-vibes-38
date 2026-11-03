// Spill-over stretch rules — Imagine Engine Studios Corp.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spillEnds, spillCurve } from './spillovers';
const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
test('spill covers only the chosen stretch between two points', () => {
  assert.deepEqual(spillEnds(sq, { id: 's', poolId: '__pool', seg: 0, t0: 0.2, t1: 0.7, pitch: 0 }, 'rectangle'), [{ x: 2, y: 0 }, { x: 7, y: 0 }]);
});
test('last segment closes back to the first point', () => {
  assert.deepEqual(spillEnds(sq, { id: 's', poolId: '__pool', seg: 3, t0: 0, t1: 1, pitch: 10 }, 'rectangle'), [{ x: 0, y: 10 }, { x: 0, y: 0 }]);
});
test('rectangle spill stays on the straight edge and ends at the corner — never past it', () => {
  // 27 x 22 rectangle, left edge (closing segment) at full stretch.
  const rect = [{ x: 0, y: 0 }, { x: 27, y: 0 }, { x: 27, y: 22 }, { x: 0, y: 22 }];
  assert.deepEqual(spillCurve(rect, { id: 's', poolId: '__pool', seg: 3, t0: 0, t1: 1, pitch: 0 }, 'rectangle'), [{ x: 0, y: 22 }, { x: 0, y: 0 }]);
});
test('all-linear typed points stay straight whatever the shape name', () => {
  const typed = sq.map((p) => ({ ...p, curveType: 'linear' as const }));
  assert.deepEqual(spillCurve(typed, { id: 's', poolId: '__pool', seg: 3, t0: 0, t1: 1, pitch: 0 }, 'freeform'), [{ x: 0, y: 10 }, { x: 0, y: 0 }]);
});
test('curved spill ends are the segment vertices at full stretch', () => {
  const free = [{ x: 0, y: 5 }, { x: 8, y: 0 }, { x: 20, y: 1 }, { x: 27, y: 8 }, { x: 22, y: 19 }, { x: 8, y: 22 }, { x: 1, y: 14 }];
  const c = spillCurve(free, { id: 's', poolId: '__pool', seg: 2, t0: 0, t1: 1, pitch: 0 }, 'kidney');
  assert.ok(c && c.length > 2);
  assert.deepEqual(c![0], { x: 20, y: 1 });
  assert.deepEqual(c![c!.length - 1], { x: 27, y: 8 });
});
