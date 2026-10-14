// Genius Translate — translates Genius text (narration, chat replies, search results)
// into the guest's language. Groq only. © Imagine Engine Studios Corp.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

import { groqChat } from '../_shared/groqChat.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const body = await req.json().catch(() => null);
    const texts: string[] = Array.isArray(body?.texts) ? body.texts.slice(0, 40).map((t: unknown) => String(t ?? '').slice(0, 4000)) : [];
    const language = String(body?.language ?? '').slice(0, 40);
    if (!texts.length || !language) return json({ error: 'texts and language required' }, 400);
    const key = Deno.env.get('GROQ_API_KEY');
    if (!key) return json({ translations: texts });
    const r = await groqChat(key, ({
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Translate each string into natural, warm ${language}. Keep product names, brand names, prices, dimensions (like 8' × 14') and numbers exactly as written. Reply with JSON {"t": [strings in the same order]}.`,
          },
          { role: 'user', content: JSON.stringify({ strings: texts }) },
        ],
      }));
    if (!r.ok) return json({ translations: texts, status: r.status });
    const data = await r.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content ?? '{}');
    const out: string[] = Array.isArray(parsed?.t) ? parsed.t.map(String) : [];
    return json({ translations: texts.map((t, i) => out[i] || t) });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
