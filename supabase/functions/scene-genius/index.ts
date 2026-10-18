// Scene Genius — turns a plain-language brief into a full pool scene plan
// (pool shape, size, depth profile, deck, stairs, seating, lights, finishes,
// and 3D models to search for) using Meta models via OpenRouter (no Groq).
// The client applies the plan. Model choice: _shared/modelRouter (scene3d).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { metaChat } from "../_shared/metaChat.ts";
import { apiIdForModelKey } from "../_shared/metaModels.ts";
import { routeModelKey } from "../_shared/modelRouter.ts";

const SYSTEM = `You EDIT a residential backyard pool design in feet. You receive the current design and the user's request.
Reply with ONE JSON object only. Include ONLY the keys the user's request changes — omit everything else so it stays as is.
{
 "summary": string (one sentence describing what you changed),
 "pool": { "shape": "rectangle"|"oval"|"kidney"|"l-shape"|"freeform"|"roman", "length": number 10-60, "width": number 8-30,
           "cornerRadius": number 0-6 (feet; set when the user asks for rounded/soft/radius corners, 0 for sharp),
           "depthProfile": [ { "position": number 0-1, "depth": number 0-12 } ] (2-8 anchors, shallow end at 0),
           "zeroEntry": { "length": number 4-15 } (only when the user asks for zero entry / beach entry / walk-in entry) },
 "deck": { "width": number 3-20, "copingWidth": number 0.5-2 },
 "finishHint": string (pool interior finish words, e.g. "blue", "white", "graphite"),
 "copingHint": string (coping material/color words, e.g. "travertine", "white", "bullnose"),
 "waterlineHint": string (waterline tile words),
 "paverHint": string (deck paver words, e.g. "travertine", "gray", "brick"),
 "stairs": [ { "style": "classic"|"wedding-cake"|"bench"|"floating", "width": number 3-14, "wallPosition": number 0-1, "softEdge": number 0-0.5 } ],
 "seating": [ { "type": "bench"|"lounge"|"corner"|"barstool"|"contour", "wallPosition": number 0-1, "count": number } ],
 "lights": number 0-8,
 "night": boolean,
 "models": [ { "query": string, "kind": "object"|"tree"|"terrain"|"skydome", "x": number, "z": number } ]
}
Rules: "models" ONLY when the user explicitly names objects, plants, trees, furniture, terrain or sky to add — the query must be exactly the thing they named. Never add palm trees or decor on your own. Keep x/z outside the pool and deck.
PLACEMENT RULES (absolute): plants, trees and decor NEVER sit on the pool, the deck, a fence or a screen. "Inside the screen" means within the enclosure's footprint on its floor — never on the screen itself; "inside the fenced area" means the open ground the fence encloses. Vehicles go on driveway areas only. Patio furniture, fireplaces, BBQ and outdoor kitchens MAY sit on the deck when the user asks. If a requested spot breaks a rule, put the model at the nearest legal spot and say so in the summary.
SCALE: every model is placed at real-world size — a chair is chair-sized, a palm is palm-sized; when you compose a full scene ("make it beautiful"), balance planting, furniture and lighting across the open zones and respect every placement rule.
NEVER change the pool shape, size, depth, deck or anything else the user did not name. If the request is about doors, gates, fences or screens, return only {"summary"}. No prose, no markdown.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const body = await req.json().catch(() => null);
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 2000) : '';
    const current = body?.current && typeof body.current === 'object' ? JSON.stringify(body.current).slice(0, 2000) : '';
    if (prompt.length < 3) return json({ error: 'Describe the project you want in a few words.' }, 400);

    const key = Deno.env.get('OPENROUTER_API_KEY');
    if (!key) return json({ error: 'Genius is not configured yet.' }, 500);

    let res;
    try {
      res = await metaChat(key, {
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          ...(current ? [{ role: 'user', content: `Current design (JSON): ${current}` }] : []),
          { role: 'user', content: prompt },
        ],
      }, apiIdForModelKey(routeModelKey({ task: 'scene3d' })));
    } catch (e) {
      console.error('scene-genius meta error', e instanceof Error ? e.message : e);
      const busy = e instanceof Error && /429/.test(e.message);
      return json({ error: busy ? 'Genius is busy right now. Try again in a minute.' : 'Genius could not design that. Try again.' }, busy ? 429 : 502);
    }
    let plan: unknown;
    try { plan = JSON.parse(res.text); } catch { return json({ error: 'Genius returned an unreadable design. Try again.' }, 502); }
    return json({ plan });
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
