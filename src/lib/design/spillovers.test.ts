// Spill-over stretch rules — Imagine Engine Studios Corp.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spillEnds } from './spillovers';
const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
test('spill covers only the chosen stretch between two points', () => {
  assert.deepEqual(spillEnds(sq, { id: 's', poolId: '__pool', seg: 0, t0: 0.2, t1: 0.7, pitch: 0 }), [{ x: 2, y: 0 }, { x: 7, y: 0 }]);
});
test('last segment closes back to the first point', () => {
  assert.deepEqual(spillEnds(sq, { id: 's', poolId: '__pool', seg: 3, t0: 0, t1: 1, pitch: 10 }), [{ x: 0, y: 10 }, { x: 0, y: 0 }]);
});
