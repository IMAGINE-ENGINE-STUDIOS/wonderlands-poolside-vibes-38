import { test } from "node:test";
import assert from "node:assert/strict";
import { addressLikePattern, distanceFt, parcelBounds, parcelEdges, sqlLikeEscape } from "./parcelLookup";
import { SAMPLE_PARCEL } from "./parcelSample";

test("addressLikePattern keys on house number + street words", () => {
  assert.equal(addressLikePattern("4000 Round Lake Road, Apopka, FL 32712"), "%4000%ROUND LAKE%");
  assert.equal(addressLikePattern("1200 main st"), "%1200%MAIN ST%");
  assert.equal(addressLikePattern("Round Lake Road"), null);
});

test("sqlLikeEscape neutralises quotes and wildcards", () => {
  assert.equal(sqlLikeEscape("O'BRIEN%"), "O''BRIEN");
});

test("distanceFt measures a known span", () => {
  // One degree of latitude is about 364,000 ft anywhere on earth.
  const d = distanceFt([-81.6, 28.74], [-81.6, 29.74]);
  assert.ok(d > 360_000 && d < 368_000, `got ${d}`);
});

test("sample parcel edges and bounds are true to the 5-acre worked example", () => {
  const edges = parcelEdges(SAMPLE_PARCEL.geometry as unknown as GeoJSON.Polygon);
  assert.equal(edges.length, 4);
  const perimeter = edges.reduce((s, e) => s + e.feet, 0);
  // ~1,050 ft x ~215 ft rectangle: perimeter near 2,530 ft, area near 5.2 ac.
  assert.ok(perimeter > 2_400 && perimeter < 2_700, `perimeter ${perimeter}`);
  const [[minLon, minLat], [maxLon, maxLat]] = parcelBounds(SAMPLE_PARCEL.geometry as unknown as GeoJSON.Polygon);
  assert.ok(minLon < -81.596 && maxLon > -81.5933);
  assert.ok(minLat > 28.7419 && maxLat < 28.7426);
});
