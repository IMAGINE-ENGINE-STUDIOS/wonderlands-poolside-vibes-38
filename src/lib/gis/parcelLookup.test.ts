import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addressLikePattern,
  distanceFt,
  parcelBounds,
  parcelEdges,
  parseGeocodeCenter,
  pointGeometryParam,
  sqlLikeEscape,
  statewideFields,
} from "./parcelLookup";
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

test("parseGeocodeCenter takes the first feature's centre", () => {
  const hit = parseGeocodeCenter({
    features: [{ center: [-81.812538, 28.149948], place_name: "4449 Juliana Lake Drive, Auburndale, Florida 33823" }],
  });
  assert.deepEqual(hit, { lon: -81.812538, lat: 28.149948, placeName: "4449 Juliana Lake Drive, Auburndale, Florida 33823" });
  assert.equal(parseGeocodeCenter({ features: [] }), null);
  assert.equal(parseGeocodeCenter(null), null);
  assert.equal(parseGeocodeCenter({ features: [{ center: "nope" }] }), null);
});

test("statewideFields derives acres from LND_SQFOOT and joins the situs", () => {
  const f = statewideFields({
    PARCEL_ID: "252709298387000730",
    PHY_ADDR1: "4449 JULIANA LAKE DR",
    PHY_CITY: "AUBURNDALE",
    PHY_ZIPCD: 33823,
    LND_SQFOOT: 7684,
  });
  assert.equal(f.parcelId, "252709298387000730");
  assert.equal(f.situs, "4449 JULIANA LAKE DR, AUBURNDALE, 33823");
  assert.ok(f.acreage != null && Math.abs(f.acreage - 7684 / 43560) < 1e-9);
  assert.equal(statewideFields({ LND_SQFOOT: 0 }).acreage, null);
  assert.equal(statewideFields({}).acreage, null);
});

test("pointGeometryParam carries its own spatial reference", () => {
  assert.deepEqual(JSON.parse(pointGeometryParam(-81.81, 28.15)), {
    x: -81.81,
    y: 28.15,
    spatialReference: { wkid: 4326 },
  });
});
