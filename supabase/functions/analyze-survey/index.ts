import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCHEMA_INSTRUCTIONS = `
Return ONLY minified JSON (no markdown fence, no prose) matching exactly this shape.
Use null for anything not printed on the drawing. Never invent values.

{
  "surveyor": { "firm": string|null, "name": string|null, "licenseNumber": string|null, "certificateOfAuthorization": string|null, "phone": string|null, "address": string|null, "signedDate": string|null, "electronicSignatureNote": string|null },
  "property": { "lotNumber": string|null, "subdivision": string|null, "phase": string|null, "platBook": string|null, "platPages": string|null, "county": string|null, "state": string|null, "streetAddress": string|null, "cityStateZip": string|null, "parcelId": string|null, "rightOfWayStreet": string|null, "scaleText": string|null, "northArrowDeg": number|null },
  "lot": { "widthFt": number|null, "depthFt": number|null, "areaSf": number|null,
           "boundaryCalls": [ { "label": string|null, "bearing": string|null, "distanceFt": number|null } ] },
  "setbacks": { "frontFt": number|null, "frontPorchFt": number|null, "rearFt": number|null, "sideFt": number|null, "sideCornerFt": number|null, "rearPoolFt": number|null },
  "elevations": { "finishedFloorFt": number|null, "benchmarkFt": number|null, "datum": string|null, "floodZone": string|null, "firmPanel": string|null, "communityNumber": string|null },
  "easements": [ { "label": string, "widthFt": number|null, "location": string|null } ],
  "structures": [ { "label": string, "type": "building"|"driveway"|"patio"|"walk"|"lanai"|"pool"|"deck"|"equipment"|"other", "areaSf": number|null, "dimensions": string|null } ],
  "surveyNotes": [ string ],
  "certifiedTo": [ string ],
  "revisions": [ { "description": string, "date": string|null } ],
  "geometry": {
    "lotPolygon": [ [number, number] ],
    "features": [ { "layer": "building"|"driveway"|"patio"|"pool"|"deck"|"gravel"|"fence"|"equipment", "label": string, "closed": boolean, "points": [ [number, number] ] } ]
  },
  "confidence": number
}

Geometry rules:
- All geometry coordinates are normalized to the LOT bounding box: x = 0 at the west/left lot line, x = 1 at the east/right lot line, y = 0 at the north/top lot line, y = 1 at the south/bottom lot line (screen orientation, y grows downward).
- "lotPolygon" traces the property boundary in order, 4 or more points, no repeated closing point.
- Trace each visible improvement (house footprint, driveway, walks, lanai, patio, AC pad, pool if present) as a separate feature polygon with at least 4 points; map covered lanai / concrete patio / AC pads to "patio", paver walks and paver entries to "deck", the residence to "building".
- Read dimension callouts to keep proportions accurate; do not output decorative items (legend, north arrow, seal, tables).
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageDataUrl, textLayer } = await req.json();
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      throw new Error("imageDataUrl is required");
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Analysis service is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a Florida land surveying and permit drafting specialist. You read boundary, topographic and plot surveys and transcribe them into structured permit data with traced geometry. Output JSON only.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `Analyze this survey sheet and extract every permit-relevant value plus traced geometry.\n${SCHEMA_INSTRUCTIONS}` +
                  (textLayer ? `\n\nEmbedded text layer from the source file (use to confirm numbers):\n${String(textLayer).slice(0, 6000)}` : ""),
              },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("gateway error", res.status, detail);
      if (res.status === 429) throw new Error("Analysis is busy right now — try again in a moment.");
      if (res.status === 402) throw new Error("Analysis credits are exhausted.");
      throw new Error("The survey could not be analyzed.");
    }

    const payload = await res.json();
    const raw: string = payload?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("The survey could not be read clearly. Try a sharper scan.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      throw new Error("The survey could not be read clearly. Try a sharper scan.");
    }

    return new Response(JSON.stringify({ survey: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("analyze-survey failed", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
