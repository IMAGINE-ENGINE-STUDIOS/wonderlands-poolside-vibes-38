import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_SATELLITE_STYLE, MAPBOX_TOKEN } from "@/lib/gis/mapboxToken";
import { parcelBounds, parcelEdges, type ParcelResult } from "@/lib/gis/parcelLookup";

// Shared GIS layer — the parcel map: Mapbox satellite with the county parcel
// boundary drawn as colored glass and every side labelled with its true
// ground length. Consumed by Surveyor-class surfaces and the Solar Genius
// board; the layer (src/lib/gis) is identical on both sites.

function edgeLabelFeatures(result: ParcelResult): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: parcelEdges(result.feature.geometry).map((e) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: e.midpoint },
      properties: { label: `${Math.round(e.feet)} ft` },
    })),
  };
}

export default function ParcelMap({ parcel, height = 320 }: { parcel: ParcelResult; height?: number }) {
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const parcelRef = useRef(parcel);
  parcelRef.current = parcel;

  useEffect(() => {
    if (!MAPBOX_TOKEN || !hostRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: hostRef.current,
      style: MAPBOX_SATELLITE_STYLE,
      center: [-81.5948, 28.7422],
      zoom: 16,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.addSource("gis-parcel", { type: "geojson", data: parcelRef.current.feature });
      map.addSource("gis-edges", { type: "geojson", data: edgeLabelFeatures(parcelRef.current) });
      map.addLayer({
        id: "gis-parcel-fill",
        type: "fill",
        source: "gis-parcel",
        paint: { "fill-color": "#22d3ee", "fill-opacity": 0.16 },
      });
      map.addLayer({
        id: "gis-parcel-glow",
        type: "line",
        source: "gis-parcel",
        paint: { "line-color": "#22d3ee", "line-width": 10, "line-opacity": 0.35, "line-blur": 6 },
      });
      map.addLayer({
        id: "gis-parcel-line",
        type: "line",
        source: "gis-parcel",
        paint: { "line-color": "#a5f3fc", "line-width": 2.5, "line-opacity": 0.95 },
      });
      map.addLayer({
        id: "gis-edge-labels",
        type: "symbol",
        source: "gis-edges",
        layout: { "text-field": ["get", "label"], "text-size": 12, "text-allow-overlap": true },
        paint: { "text-color": "#ecfeff", "text-halo-color": "rgba(8,47,73,0.85)", "text-halo-width": 1.6 },
      });
      map.fitBounds(parcelBounds(parcelRef.current.feature.geometry), { padding: 40, duration: 0 });
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("gis-parcel")) return;
    (map.getSource("gis-parcel") as mapboxgl.GeoJSONSource).setData(parcel.feature);
    (map.getSource("gis-edges") as mapboxgl.GeoJSONSource).setData(edgeLabelFeatures(parcel));
    map.fitBounds(parcelBounds(parcel.feature.geometry), { padding: 40, duration: 600 });
  }, [parcel]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("gis-parcel-fill")) return;
    const vis = showBoundaries ? "visible" : "none";
    for (const id of ["gis-parcel-fill", "gis-parcel-glow", "gis-parcel-line"])
      map.setLayoutProperty(id, "visibility", vis);
  }, [showBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("gis-edge-labels")) return;
    map.setLayoutProperty("gis-edge-labels", "visibility", showMeasurements ? "visible" : "none");
  }, [showMeasurements]);

  const chip = (on: boolean) =>
    `border px-3 py-2 text-[9px] uppercase tracking-[0.28em] transition-colors ${
      on ? "border-foreground bg-foreground text-background" : "border-border/60 hover:border-foreground"
    }`;

  return (
    <div>
      <div className="relative overflow-hidden border border-border/60 bg-neutral-900" style={{ height }}>
        {MAPBOX_TOKEN ? (
          <div ref={hostRef} className="absolute inset-0" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-xs leading-relaxed text-white/60">
              The satellite picture lights up as soon as this site&apos;s public Mapbox key is in place. The
              parcel record below is live either way.
            </p>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button aria-pressed={showBoundaries} onClick={() => setShowBoundaries((v) => !v)} className={chip(showBoundaries)}>
          Boundaries
        </button>
        <button aria-pressed={showMeasurements} onClick={() => setShowMeasurements((v) => !v)} className={chip(showMeasurements)}>
          Measurements
        </button>
        <span className="ml-auto text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
          {parcel.fields.source}
        </span>
      </div>
    </div>
  );
}
