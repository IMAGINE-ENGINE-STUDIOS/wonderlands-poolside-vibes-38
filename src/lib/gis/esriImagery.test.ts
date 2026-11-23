import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ESRI_IMAGERY_TILE_URL,
  addEsriSatelliteFallback,
  esriImagerySource,
  pickEsriBeforeLayerId,
} from "./esriImagery";

test("esriImagerySource: keyless World Imagery XYZ raster", () => {
  const src = esriImagerySource();
  assert.equal(src.type, "raster");
  assert.deepEqual(src.tiles, [
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  ]);
  assert.equal(ESRI_IMAGERY_TILE_URL.includes("access_token"), false);
  assert.equal(src.tileSize, 256);
});

test("pickEsriBeforeLayerId: under the style satellite raster when present", () => {
  const layers = [
    { id: "background", type: "background" },
    { id: "satellite", type: "raster" },
    { id: "road-label", type: "symbol" },
  ];
  assert.equal(pickEsriBeforeLayerId(layers), "satellite");
});

test("pickEsriBeforeLayerId: before the first label layer when no raster", () => {
  const layers = [
    { id: "background", type: "background" },
    { id: "water", type: "fill" },
    { id: "place-label", type: "symbol" },
  ];
  assert.equal(pickEsriBeforeLayerId(layers), "place-label");
  assert.equal(pickEsriBeforeLayerId([]), undefined);
  assert.equal(pickEsriBeforeLayerId(undefined), undefined);
});

test("addEsriSatelliteFallback: adds source + layer once, under satellite", () => {
  const added: string[] = [];
  const fake = {
    _sources: new Set<string>(),
    _layers: new Set<string>(),
    getSource(id: string) {
      return this._sources.has(id) ? {} : undefined;
    },
    addSource(id: string) {
      this._sources.add(id);
      added.push(`source:${id}`);
    },
    getLayer(id: string) {
      return this._layers.has(id) ? {} : undefined;
    },
    addLayer(layer: { id: string }, beforeId?: string) {
      this._layers.add(layer.id);
      added.push(`layer:${layer.id}<${beforeId}`);
    },
    getStyle() {
      return {
        layers: [
          { id: "background", type: "background" },
          { id: "satellite", type: "raster" },
        ],
      };
    },
  };
  addEsriSatelliteFallback(fake as never);
  addEsriSatelliteFallback(fake as never);
  assert.deepEqual(added, [
    "source:esri-world-imagery",
    "layer:esri-world-imagery-layer<satellite",
  ]);
});
