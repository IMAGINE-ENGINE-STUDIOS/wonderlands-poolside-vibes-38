// Integrity guard for saved 3D boards — Imagine Engine Studios Corp.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeBoard3D, type Board3D } from './board3D';

const sq = [{ x: 0, z: 0 }, { x: 4, z: 0 }, { x: 4, z: 4 }, { x: 0, z: 4 }];

test('drops a spill-over with a missing end', () => {
  const d = { fences: [], screens: [], surfaces: [], spills: [{ id: 'a', a: { x: 1, z: 1 }, b: undefined, center: { x: 0, z: 0 }, pitch: 0 }] } as unknown as Board3D;
  assert.equal(sanitizeBoard3D(d)!.spills!.length, 0);
});

test('drops a pool/spa left with fewer than 3 valid points', () => {
  const d = { fences: [], screens: [], surfaces: [], waters: [{ pts: [sq[0], undefined, { x: NaN, z: 1 }] }, { pts: sq }] } as unknown as Board3D;
  assert.equal(sanitizeBoard3D(d)!.waters!.length, 1);
});
