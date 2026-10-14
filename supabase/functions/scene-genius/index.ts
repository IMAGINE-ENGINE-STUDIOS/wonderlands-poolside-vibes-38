// Scene Genius — turns a plain-language brief into a full pool scene plan
// (pool shape, size, depth profile, deck, stairs, seating, lights, finishes,
// and 3D models to search for) using Groq. The client applies the plan.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM = `You design residential backyard pools in feet. Reply with ONE JSON object only, matching:
{
 "summary": string (one sentence describing the design),
 "pool": { "shape": "rectangle"|"oval"|"kidney"|"l-shape"|"freeform"|"roman", "length": number 10-60, "width": number 8-30,
           "depthProfile": [ { "position": number 0-1, "depth": number 3-10 } ] (2-6 anchors, shallow end at 0) },
 "deck": { "width": number 3-20, "copingWidth": number 0.5-2 },
 "stairs": [ { "style": "classic"|"wedding-cake"|"bench"|"floating", "width": number 3-14, "wallPosition": number 0-1, "softEdge": number 0-0.5 } ],
 "seating": [ { "type": "bench"|"lounge"|"corner"|"barstool"|"contour", "wallPosition": number 0-1, "count": number } ],
 "lights": number 0-8,
 "finishHint": string (e.g. "blue", "white", "graphite"),
 "paverHint": string (e.g. "travertine", "gray", "brick"),
 "night": boolean,
 "models": [ { "query": string (a short 3D model search like "palm tree"), "kind": "object"|"tree"|"terrain"|"skydome", "x": number -60..60, "z": number -60..60 } ] (0-10 items; keep x/z outside the pool and deck)
}
Pick sensible real-world values when the brief doesn't say. No prose, no markdown.`;

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
        model: 'llama-3.3-70b-versatile',
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
