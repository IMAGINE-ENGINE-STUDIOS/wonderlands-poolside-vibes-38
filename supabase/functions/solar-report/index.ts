// Wonderlands Solar — address + roof intelligence.
//
// Two read-only actions, both routed through the Lovable connector gateway so
// the Google Maps Platform key never reaches the browser:
//   • geocode  — address text  → formatted address + coordinates
//   • insights — coordinates   → Google Solar buildingInsights (roof segments,
//                                pitch, azimuth, annual sunshine, panel fit)
//
// Results are memo-cached per normalised address / rounded coordinate for the
// life of the instance, so a reader panning the map or re-opening the board does
// not re-bill the same lookup.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** in-instance cache — key → { at, data } */
const cache = new Map<string, { at: number; data: unknown }>();
const CACHE_MS = 1000 * 60 * 60 * 12;

const cached = (key: string) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  cache.delete(key);
  return null;
};

const gatewayHeaders = () => {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const mapsKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!mapsKey) throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  return { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": mapsKey };
};

/** Surfaces the provider's own status and body — never a bare 500. */
const relay = async (res: Response) => {
  const text = await res.text();
  if (!res.ok) {
    console.error(`google maps gateway failed [${res.status}]: ${text}`);
    if (res.status === 403) {
      let reason = "";
      try {
        reason = JSON.parse(text)?.error?.details?.find((d: { reason?: string }) => d.reason)?.reason ?? "";
      } catch { /* body was not JSON */ }
      if (reason === "API_KEY_HTTP_REFERRER_BLOCKED")
        return json({ error: "Google Maps server key is referrer-restricted." }, 403);
      if (reason === "API_KEY_SERVICE_BLOCKED")
        return json({ error: "Google Maps server key does not allow this API." }, 403);
    }
    return json({ error: "Google request failed", status: res.status, details: text }, res.status);
  }
  return JSON.parse(text);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    /* Address suggestions while the reader types — Places API (New).
       Kept server-side so the key never reaches the browser; results are
       memo-cached per prefix so a typed address does not re-bill each keystroke. */
    if (action === "autocomplete") {
      const input = String(body?.input ?? "").trim().slice(0, 200);
      if (input.length < 3) return json({ suggestions: [] });

      const key = `ac:${input.toLowerCase()}`;
      const hit = cached(key);
      if (hit) return json(hit);

      const res = await fetch(`${GATEWAY_URL}/places/v1/places:autocomplete`, {
        method: "POST",
        headers: { ...gatewayHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["us"],
          includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
        }),
      });
      const data = await relay(res);
      if (data instanceof Response) return data;

      const suggestions = ((data as {
        suggestions?: Array<{ placePrediction?: { placeId: string; text?: { text?: string } } }>;
      }).suggestions ?? [])
        .filter((s) => s.placePrediction?.placeId)
        .slice(0, 6)
        .map((s) => ({
          placeId: s.placePrediction!.placeId,
          label: s.placePrediction!.text?.text ?? "",
        }));

      const out = { suggestions };
      cache.set(key, { at: Date.now(), data: out });
      return json(out);
    }

    /* A chosen suggestion → formatted address + coordinates. */
    if (action === "place") {
      const placeId = String(body?.placeId ?? "").trim().slice(0, 200);
      if (!placeId) return json({ error: "Pick an address from the list." }, 400);

      const key = `place:${placeId}`;
      const hit = cached(key);
      if (hit) return json(hit);

      const res = await fetch(`${GATEWAY_URL}/places/v1/places/${encodeURIComponent(placeId)}`, {
        headers: { ...gatewayHeaders(), "X-Goog-FieldMask": "formattedAddress,location" },
      });
      const data = await relay(res);
      if (data instanceof Response) return data;

      const p = data as { formattedAddress?: string; location?: { latitude: number; longitude: number } };
      if (!p.location) return json({ error: "That address has no coordinates." }, 404);

      const out = { address: p.formattedAddress ?? "", lat: p.location.latitude, lng: p.location.longitude };
      cache.set(key, { at: Date.now(), data: out });
      return json(out);
    }

    if (action === "geocode") {
      const address = String(body?.address ?? "").trim().slice(0, 200);
      if (address.length < 5) return json({ error: "Enter a fuller address." }, 400);


      const key = `geo:${address.toLowerCase()}`;
      const hit = cached(key);
      if (hit) return json(hit);

      const res = await fetch(
        `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(address)}`,
        { headers: gatewayHeaders() },
      );
      const data = await relay(res);
      if (data instanceof Response) return data;

      const first = (data as { results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }> })
        .results?.[0];
      if (!first) return json({ error: "That address could not be found." }, 404);

      const out = {
        address: first.formatted_address,
        lat: first.geometry.location.lat,
        lng: first.geometry.location.lng,
      };
      cache.set(key, { at: Date.now(), data: out });
      return json(out);
    }

    if (action === "insights") {
      const lat = Number(body?.lat);
      const lng = Number(body?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
        return json({ error: "Invalid coordinates." }, 400);

      const key = `ins:${lat.toFixed(5)},${lng.toFixed(5)}`;
      const hit = cached(key);
      if (hit) return json(hit);

      const url =
        `${GATEWAY_URL}/solar/v1/buildingInsights:findClosest` +
        `?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=LOW`;
      const res = await fetch(url, { headers: gatewayHeaders() });
      if (res.status === 404) {
        const out = { covered: false as const };
        cache.set(key, { at: Date.now(), data: out });
        return json(out);
      }
      const data = await relay(res);
      if (data instanceof Response) return data;

      const b = data as {
        center?: { latitude: number; longitude: number };
        imageryDate?: { year: number; month: number; day: number };
        solarPotential?: {
          maxSunshineHoursPerYear?: number;
          carbonOffsetFactorKgPerMwh?: number;
          wholeRoofStats?: { areaMeters2?: number; groundAreaMeters2?: number };
          roofSegmentStats?: Array<{
            pitchDegrees: number;
            azimuthDegrees: number;
            stats?: { areaMeters2?: number; sunshineQuantiles?: number[] };
            center?: { latitude: number; longitude: number };
            boundingBox?: { sw: { latitude: number; longitude: number }; ne: { latitude: number; longitude: number } };
          }>;
        };
      };

      const sp = b.solarPotential ?? {};
      const out = {
        covered: true as const,
        center: b.center ?? { latitude: lat, longitude: lng },
        imageryDate: b.imageryDate ?? null,
        maxSunshineHoursPerYear: sp.maxSunshineHoursPerYear ?? null,
        carbonOffsetFactorKgPerMwh: sp.carbonOffsetFactorKgPerMwh ?? null,
        roofAreaMeters2: sp.wholeRoofStats?.areaMeters2 ?? null,
        segments: (sp.roofSegmentStats ?? []).map((s, i) => ({
          index: i,
          pitchDegrees: s.pitchDegrees,
          azimuthDegrees: s.azimuthDegrees,
          areaMeters2: s.stats?.areaMeters2 ?? 0,
          // the median of the sunshine quantiles is the representative figure
          sunshineHours: s.stats?.sunshineQuantiles?.[5] ?? null,
          center: s.center ?? null,
          boundingBox: s.boundingBox ?? null,
        })),
      };
      cache.set(key, { at: Date.now(), data: out });
      return json(out);
    }

    // A static aerial tile of the framed property, returned as a data URL so the
    // board can read its pixels (the WebGL map canvas is cross-origin and cannot
    // be sampled). This is what the click-to-auto-trace fallback works on.
    if (action === "tile") {
      const lat = Number(body?.lat);
      const lng = Number(body?.lng);
      const zoom = Math.min(21, Math.max(16, Number(body?.zoom) || 20));
      const size = Math.min(640, Math.max(256, Number(body?.size) || 640));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
        return json({ error: "Invalid coordinates." }, 400);

      const key = `tile:${lat.toFixed(6)},${lng.toFixed(6)},${zoom},${size}`;
      const hit = cached(key);
      if (hit) return json(hit);

      const res = await fetch(
        `${GATEWAY_URL}/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}x${size}` +
          `&scale=2&maptype=satellite&format=png`,
        { headers: gatewayHeaders() },
      );
      if (!res.ok) {
        const text = await res.text();
        console.error(`static map failed [${res.status}]: ${text}`);
        return json({ error: "Aerial tile unavailable", status: res.status, details: text }, res.status);
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192)
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const out = {
        dataUrl: `data:image/png;base64,${btoa(binary)}`,
        lat,
        lng,
        zoom,
        size,
        /** the static map is returned at scale 2 */
        scale: 2,
      };
      cache.set(key, { at: Date.now(), data: out });
      return json(out);
    }

    return json({ error: "Unknown action." }, 400);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("solar-report error:", message);
    return json({ error: message }, 500);
  }
});
