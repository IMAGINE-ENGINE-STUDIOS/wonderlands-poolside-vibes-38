/** Copyright Imagine Engine Studios Corp. */
import { it } from 'node:test';
import { strict as assert } from 'node:assert';
import { poolTerrainOpening } from './poolTerrainOpening';
import { pointInRing } from './polygonGeometry';
it('grass opening contains concave pool vertices in either winding', () => {
  const pool = [{x:0,z:0},{x:20,z:0},{x:20,z:20},{x:12,z:20},{x:12,z:5},{x:8,z:5},{x:8,z:20},{x:0,z:20}];
  for (const ring of [pool, [...pool].reverse()]) {
    const regions = poolTerrainOpening(ring, 0.4);
    for (const p of pool) assert.ok(regions.some(region => pointInRing(p, region[0])), `opening must contain ${p.x},${p.z}`);
    assert.ok(regions.some(region => pointInRing({x:10,z:4.9}, region[0])));
  }
});