// Scene Genius — turns a plain-language brief into a full pool scene plan
// (pool shape, size, depth profile, deck, stairs, seating, lights, finishes,
// and 3D models to search for) using Groq. The client applies the plan.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

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
Rules: "models" ONLY when the user explicitly names objects, plants, trees, furniture, terrain or sky to add — the query must be exactly the thing they named. Never add palm trees or decor on your own. Keep x/z outside the pool and deck. No prose, no markdown.`;

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
