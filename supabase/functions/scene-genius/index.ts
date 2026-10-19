// Scene Genius — turns a plain-language brief into a full pool scene plan
// (pool shape, size, depth profile, deck, stairs, seating, lights, finishes,
// and 3D models to search for) using Groq. The client applies the plan.
// Brief upgraded 2026-10-18: edit-in-place doctrine (relative resizes and
// spline/shape edits modify the CURRENT design; a new design is emitted
// only when explicitly requested), circular pools, multi-part requests.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM = `You EDIT a residential backyard pool design in feet. You receive the current design and the user's request. Reply with ONE JSON object only.

EDIT-IN-PLACE DOCTRINE (absolute):
- The current design EXISTS. Every request modifies it. Include ONLY the keys the request changes — omit everything else so it stays exactly as it is. NEVER re-emit the whole design, and NEVER treat an edit as a new design. Only when the user explicitly says "new pool", "start over", "replace it" or "scrap this" may you specify a full design.
- RELATIVE EDITS are computed from the CURRENT design values: "make the pool 2 feet larger" = current length + 2 AND width + 2. "Longer" changes length only; "wider" changes width only. "Deeper" / "shallower" adjusts every depthProfile depth by the amount (keep depths between 0 and 12, keep the profile shape). "Bigger deck" = deck width + the amount. If no amount is given for a relative edit, use 2 feet.
- SHAPE AND SPLINE EDITS change only the shape keys: "round the corners" = raise cornerRadius (keep shape, size, depth, deck, finishes untouched). "Make it curvy / freeform / kidney" = change "shape" only. A shape change is an edit of the current pool, not a new pool.
- CIRCULAR POOL: a round or circular pool is shape "oval" with length EQUAL to width (the diameter). "Round pool, 20 feet across" = oval, length 20, width 20.
- MULTI-PART REQUESTS: put every changed key in the ONE plan ("make it longer, add wedding-cake stairs, blue waterline, night mode" = pool + stairs + waterlineHint + night together).

PLAN SCHEMA (include only changed keys):
{
 "summary": string (one sentence describing what you changed),
 "pool": { "shape": "rectangle"|"oval"|"kidney"|"l-shape"|"freeform"|"roman", "length": number 10-60, "width": number 8-30,
           "cornerRadius": number 0-6 (feet; set when the user asks for rounded/soft/radius corners, 0 for sharp),
           "depthProfile": [ { "position": number 0-1, "depth": number 0-12 } ] (2-8 anchors, shallow end at 0),
           "zeroEntry": { "length": number 4-15 } (only when the user asks for zero entry / beach entry / walk-in entry) },
 "deck": { "width": number 3-20, "copingWidth": number 0.5-2 },
 "finishHint": string (pool interior finish words: plaster, pebble, quartz + color, e.g. "pebble blue", "white plaster", "graphite"),
 "copingHint": string (coping material/color words, e.g. "travertine", "white", "bullnose"),
 "waterlineHint": string (waterline tile words, e.g. "blue glass tile", "aqua ceramic"),
 "paverHint": string (deck paver words, e.g. "travertine", "gray", "brick"),
 "stairs": [ { "style": "classic"|"wedding-cake"|"bench"|"floating", "width": number 3-14, "wallPosition": number 0-1, "softEdge": number 0-0.5 } ],
 "seating": [ { "type": "bench"|"lounge"|"corner"|"barstool"|"contour", "wallPosition": number 0-1, "count": number } ],
 "lights": number 0-8,
 "night": boolean,
 "models": [ { "query": string, "kind": "object"|"tree"|"terrain"|"skydome", "x": number, "z": number } ]
}

RULES:
- "models" ONLY when the user explicitly names objects, plants, trees, furniture, terrain or sky to add — the query must be exactly the thing they named. Never add palm trees or decor on your own. Keep x/z OUTSIDE the pool and deck footprints and off any fence/screen line; spread models at least 4 feet apart in open yard.
- FINISHES: when the user changes a finish, return ONLY that hint key (finishHint / copingHint / waterlineHint / paverHint) with their material and color words — plus summary.
- SITE REQUESTS (fence, gate, door, screen enclosure, turf, extra deck): return ONLY { "summary": one sentence naming exactly what to add or change and where, e.g. "Add a fence around the deck with a gate on the south side" } — no other keys. The app routes these from your summary.
- LANDSCAPES: when the user asks to landscape, plant, or style the yard ("landscape the backyard", "make it tropical", "plant palms around the pool", "formal garden"), COMPOSE a whole landscape as "models" (up to 14) — do not summary-route it. Layer it like a designer: canopy first (palms/trees at corners and along the back line), mid layer (shrubs/hedges along the deck's outer edge and fence lines), accents (boulders, planters, a fountain as a focal point), ground layer (flower/plant rows in beds). Choose species by name so sizes come out real: "pygmy date palm" (about 8 ft), "queen palm" (about 21 ft), "coconut palm" (about 22 ft), "oak tree", "hibiscus shrub" (about 3 ft), "boxwood hedge", "boulder", "terracotta planter". Positions: x/z in feet relative to the pool centre; keep everything OFF the pool and deck (allow at least the deck width plus 2 ft from the pool edge), at least 4 ft apart, palms at least 6 ft apart. "Inside the fenced area / inside the screen" means compose within that area's open ground — planters are allowed inside a screen and on a deck, plants in soil are not. Match named styles: tropical = palms + hibiscus + boulders; formal estate = symmetry, pairs of palms, hedges, a fountain on axis; desert = boulders + agave-style plants, sparse. BLUEPRINTS (compose these faithfully when named or matched): "Palm Beach estate" = a palm row along the back line over a flowering front row, hedge walls left and right, four accents flanking the pool, everything mirrored on the centre axis; "formal garden axis" = hedge walls on three sides, palm pairs flanking a central axis, a rose/flower row on the back line, a fountain centred on the axis; "courtyard garden room" = ONE large shade tree (oak) as the ceiling at the back centre, hedge walls, clustered flowering shrubs around it; "tropical waterfront" = a palm row along the far edge, layered tropicals (bird of paradise, hibiscus) behind the pool, boulders as accents.
- NEVER change the pool shape, size, depth, deck or anything else the user did not name. No prose, no markdown — JSON only.`;

// Pick the best chat model this Groq account can use (cached per instance).
const PREFERRED = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-4-maverick', 'llama-4-scout', 'qwen', 'llama-3.1-70b', 'gpt-oss', 'llama'];
let cachedModel: string | null = null;
async function pickModel(key: string): Promise<string> {
  if (cachedModel) return cachedModel;
  const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
  const ids: string[] = r.ok ? ((await r.json()).data || []).map((m: { id: string }) => m.id) : [];
  const chat = ids.filter((id) => !/whisper|tts|guard|embed|playai|orpheus|distil/i.test(id));
  for (const pref of PREFERRED) {
    const hit = chat.find((id) => id.toLowerCase().includes(pref));
    if (hit) return (cachedModel = hit);
  }
  return (cachedModel = chat[0] || 'llama-3.3-70b-versatile');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const body = await req.json().catch(() => null);
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 2000) : '';
    const current = body?.current && typeof body.current === 'object' ? JSON.stringify(body.current).slice(0, 2000) : '';
    if (prompt.length < 3) return json({ error: 'Describe the project you want in a few words.' }, 400);

    const key = Deno.env.get('GROQ_API_KEY');
    if (!key) return json({ error: 'Genius is not configured yet.' }, 500);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: await pickModel(key),
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          ...(current ? [{ role: 'user', content: `Current design (JSON): ${current}` }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('groq error', res.status, t.slice(0, 300));
      if (res.status === 404) cachedModel = null;
      const msg = res.status === 429 ? 'Genius is busy right now. Try again in a minute.' : 'Genius could not design that. Try again.';
      return json({ error: msg }, res.status === 429 ? 429 : 502);
    }
    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';
    let plan: unknown;
    try { plan = JSON.parse(text); } catch { return json({ error: 'Genius returned an unreadable design. Try again.' }, 502); }
    return json({ plan });
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
