// Landscape Genius — turns a plain-language planting request into edit ops for
// the Landscaping Studio board (src/lib/landscape/landscapeOps.ts). Groq only.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SYSTEM = `You EDIT a residential Florida planting plan (feet). You receive a summary of the current plan and the user's request.
Reply with ONE JSON object only, including ONLY keys the request changes:
{
 "summary": string (one friendly sentence: what you changed and why it suits Florida),
 "add": [ { "query": string (a common nursery plant name, e.g. "clusia", "foxtail palm", "red ixora", "muhly grass"),
            "count": number 1-40 (omit for hedges), "pattern": "hedge"|"row"|"cluster"|"accent",
            "side": "back"|"front"|"left"|"right"|"around"|"pool"|"center", "size": "1 gal"|"3 gal"|"7 gal"|"15 gal"|"30 gal"|"45 gal" } ],
 "remove": [ string ] (plant names to remove),
 "clear": boolean (only if the user asks to start over),
 "bedFill": "mulch-brown"|"mulch-black"|"shell"|"river-rock"|"lava-rock"|"sod"|"planted" (restyle all beds),
 "newBed": { "side": same sides, "depthFt": number 2-12, "fill": same fills },
 "irrigation": boolean
}
Rules: add only what was asked or clearly implied ("privacy" = hedge of clusia or podocarpus; "low maintenance" = river-rock beds + natives).
Prefer salt-tolerant plants near the coast and pet-safe plants when pets are mentioned. Never invent prices. No prose, no markdown.`;

const PREFERRED = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-4-maverick', 'llama-4-scout', 'qwen', 'llama'];
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
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 1500) : '';
    const current = body?.current ? JSON.stringify(body.current).slice(0, 1500) : '';
    if (prompt.length < 3) return json({ error: 'Tell Genius what to plant.' }, 400);
    const key = Deno.env.get('GROQ_API_KEY');
    if (!key) return json({ error: 'Genius is not configured yet.' }, 500);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: await pickModel(key),
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM },
          ...(current ? [{ role: 'user', content: `Current plan: ${current}` }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      if (res.status === 404) cachedModel = null;
      console.error('groq error', res.status, (await res.text()).slice(0, 300));
      return json({ error: res.status === 429 ? 'Genius is busy. Try again in a minute.' : 'Genius could not plan that. Try again.' }, res.status === 429 ? 429 : 502);
    }
    const data = await res.json();
    try { return json({ edit: JSON.parse(data?.choices?.[0]?.message?.content ?? '') }); }
    catch { return json({ error: 'Genius returned an unreadable plan. Try again.' }, 502); }
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
