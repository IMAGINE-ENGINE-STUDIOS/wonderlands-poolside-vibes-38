// Site Genius — Website Builder V2 assistant. Groq only (never Lovable AI).
// Imagine Engine Studios Corp.
// Modes:
//   build   → { pages:[{ name, sections:[{ type, props, style }] }], theme }
//   command → { summary, ops:[...] } edits to the current page (client validates)
//   rewrite → { text }
//   seo     → { title, description }
// The browser validates every block type/prop against its own block list, so
// nothing unknown ever reaches a saved site.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const BLOCK_HELP = `Block types and their props:
hero{eyebrow,title,subtitle,ctaLabel,ctaHref,cta2Label,cta2Href}; text{title,body}; services{title,items:[{title,body}]};
products{title,columns,items:[{name,price,description,buttonLabel,buttonHref}]}; testimonials{title,items:[{quote,name}]};
cta{title,body,ctaLabel,ctaHref}; form{title,body,buttonLabel,anchor,thanks}; faq{title,items:[{q,a}]};
pricing{title,items:[{name,price,period,features,ctaLabel,ctaHref,featured}]} (features = one per line);
team{title,items:[{name,role,bio}]}; stats{title,items:[{value,label}]}; logos{title,items:[{name}]};
map{title,address}; booking{title,body,url}; columns{title,items:[{title,body}]}; header{links:[{label,href}],ctaLabel,ctaHref};
footer{text,links:[{label,href}]}; posts{title,items:[{title,date,excerpt}]}; spacer{height}.
Links: "#contact" for the lead form, "page:<slug>" for another page ("page:" = home).
Style keys (optional): bg, color (hex), align (left|center|right), width (narrow|normal|wide|full), padY (px).`;

const SYSTEMS: Record<string, string> = {
  build: `You build a complete small-business website for a residential contractor. Reply with ONE JSON object:
{"theme":{"primary":hex,"headingFont":one of ["Cormorant Garamond","Playfair Display","Sora","Outfit","Space Grotesk","DM Serif Display"],"bodyFont":one of ["Manrope","Work Sans","Karla","Plus Jakarta Sans"]},
 "pages":[{"name":string,"seo":{"title":string,"description":string},"sections":[{"type":string,"props":{},"style":{}}]}]}
Home first (header, hero, services, stats or testimonials placeholder, faq, cta, form, footer). 2-4 pages total. Write real, specific, confident copy from the business description.
Never invent phone numbers, emails, addresses, prices, reviews or client names — leave those empty strings. ${BLOCK_HELP} No prose, no markdown.`,
  command: `You edit ONE page of a website. You receive the page as JSON (sections with id, type, props summary) and a request.
Reply with ONE JSON object: {"summary":string (one sentence),"ops":[...]} where each op is one of:
{"op":"add","type":string,"props":{},"style":{},"after":sectionId|null}
{"op":"update","id":sectionId,"props":{},"style":{}}
{"op":"remove","id":sectionId}
{"op":"move","id":sectionId,"to":index}
{"op":"theme","theme":{"primary"?:hex,"background"?:hex,"text"?:hex,"headingFont"?:string,"bodyFont"?:string,"radius"?:number}}
{"op":"addPage","name":string,"sections":[{"type":string,"props":{},"style":{}}]}
Only change what was asked. Never invent phone numbers, prices or reviews. ${BLOCK_HELP} No prose, no markdown.`,
  rewrite: `You rewrite website copy for a residential contractor. Follow the instruction (shorter, friendlier, more luxurious, translate, etc.).
Reply with ONE JSON object: {"text":string}. Keep facts, never invent numbers. No markdown.`,
  seo: `You write search-engine page titles (max 60 chars) and descriptions (max 155 chars) for a contractor website page.
Reply with ONE JSON object: {"title":string,"description":string}. No markdown.`,
  agent: `You are Genius, a senior professional website builder working INSIDE the Wonderlands Website Builder V2. You can edit the WHOLE project:
every page, every section, the theme, business details, SEO, and page structure. You also answer questions about the builder expertly.
You receive the full site as JSON (theme, pages with id/name/slug/seo, sections with id/type/props/style), the currently open page id, the conversation so far and the user's request.
Reply with ONE JSON object: {"reply":string,"ops":[...]}.
"reply" = clear, helpful, specific answer in the user's language (2-8 short sentences or a short list using "- "). After edits, say exactly what you changed and on which pages, and give 1-2 pro suggestions for next steps. If the user only asks a question, answer it and return "ops":[].
Ops (every op may include "page":pageId; default = open page):
{"op":"add","type":string,"props":{},"style":{},"after":sectionId|null,"page"?:id}
{"op":"update","id":sectionId,"props":{},"style":{}}   (arrays in props replace the whole list — send the complete list)
{"op":"remove","id":sectionId}
{"op":"move","id":sectionId,"to":index}
{"op":"duplicate","id":sectionId}
{"op":"theme","theme":{"primary"?,"background"?,"text"?,"headingFont"?,"bodyFont"?,"radius"?,"brand"?,"phone"?,"email"?,"whatsapp"?}}
{"op":"addPage","name":string,"seo"?:{"title","description"},"sections":[{"type","props","style"}]}
{"op":"renamePage","page":id,"name":string}
{"op":"removePage","page":id}   (never the home page)
{"op":"seo","page":id,"seo":{"title","description"}}
{"op":"open","page":id}   (switch the editor to that page)
Builder knowledge (explain these when asked): Left = Genius. Right tabs: Blocks (drag or click to add; Saved sections), Layers (drag to reorder, hide, duplicate, delete), Section (content fields, Rewrite with Genius on long text, product cards: blank card, bulk add, add from Wonderlands catalogue or a whole category), Style (colour presets/gradients, background photo/video, darken, spacing, title size, alignment, width, section font, Hide on mobile/tablet/desktop), Site (business name, phone, email, WhatsApp, logo, colours, fonts, corner roundness, custom domain with A records 185.158.133.1 for @ and www, page name, page SEO + Suggest with Genius, delete page, published versions with Restore).
Top bar: page picker, + Page, Duplicate page, Wonderlands template, trade Templates (pools, landscaping, solar, roofing, general contractor), zoom 50-150%, desktop/tablet/phone preview, full screen, undo/redo, site address /sites/<slug>, Save draft (autosaves every 4s), Publish, Unpublish, View. Visitors only see the published version. Lead forms file leads into the company CRM; extra questions, thank-you message and redirect are on the form block. Product "pay" buttons use the company's own Stripe Payment Links.
Wonderlands tool block ("tech", prop tool) embeds: design2d Design Studio 2D, studio 3D Studio, design Global Design Board V2, landscaping Landscaping studio, solarboard Solar drawing board, enclosures Screen enclosure/lanai/fencing board, poolspa Pool & Spa Suites, blueprint Blueprint builder, solar Solar Genius, quote Quote Atelier, calculator Pool cost calculator, showroom Studio showroom, flip FLIP book (needs flipSlug). tech props: {tool,flipSlug,title,height}.
Other blocks: image{src,caption,link,height}; gallery{title,items:[{src,caption,link}]}; video{title,url}; beforeafter{title,before,after,height}; embed{title,url,height}; hero also has image,minHeight.
Products: when adding or filling a "products" block you may leave items empty or give real product names (e.g. Glimmerglass pool models) — the builder fills every card with the real Wonderlands catalogue photo, name, price and description; never write placeholder names like "Product A". Text on the page can be edited by double-clicking it (font gallery, size, colour, bold, italic, alignment). Custom domain: Site tab → Web address (top) → type the domain, Save, add A @ and A www → 185.158.133.1 at the domain company; the card checks DNS live and the domain goes live by itself after Publish — no email needed. Rules: keep ids exactly as given; only change what was asked (but do the whole job when asked for site-wide work); never invent phone numbers, emails, addresses, prices, reviews, client names or awards — leave empty and tell the user to fill them; never say "AI". ${BLOCK_HELP} No markdown outside the reply string.`,
};

const PREFERRED = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-4-maverick', 'llama-4-scout', 'qwen', 'llama'];
let cachedModel: string | null = null;
async function pickModel(key: string): Promise<string> {
  if (cachedModel) return cachedModel;
  const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${key}` } });
  const ids: string[] = r.ok ? ((await r.json()).data || []).map((m: { id: string }) => m.id) : [];
  const chat = ids.filter((id) => !/whisper|tts|guard|embed|playai|orpheus|distil/i.test(id));
  for (const pref of PREFERRED) { const hit = chat.find((id) => id.toLowerCase().includes(pref)); if (hit) return (cachedModel = hit); }
  return (cachedModel = chat[0] || 'llama-3.3-70b-versatile');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const body = await req.json().catch(() => null);
    const mode = typeof body?.mode === 'string' && SYSTEMS[body.mode] ? body.mode : '';
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 14000) : '';
    const context = body?.context ? JSON.stringify(body.context).slice(0, mode === 'agent' ? 40000 : 6000) : '';
    const history = mode === 'agent' && Array.isArray(body?.history)
      ? body.history.slice(-10).filter((m: any) => typeof m?.text === 'string').map((m: any) => ({ role: m.who === 'you' ? 'user' : 'assistant', content: m.text.slice(0, 1500) }))
      : [];
    if (!mode) return json({ error: 'Unknown request.' }, 400);
    if (prompt.length < 2) return json({ error: 'Tell Genius what you need.' }, 400);
    const key = Deno.env.get('GROQ_API_KEY');
    if (!key) return json({ error: 'Genius is not configured yet.' }, 500);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: await pickModel(key),
        temperature: mode === 'build' ? 0.6 : 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEMS[mode] },
          ...history,
          ...(context ? [{ role: 'user', content: `Site JSON: ${context}` }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      if (res.status === 404) cachedModel = null;
      console.error('groq error', res.status, (await res.text()).slice(0, 300));
      return json({ error: res.status === 429 ? 'Genius is busy. Try again in a minute.' : 'Genius could not do that. Try again.' }, res.status === 429 ? 429 : 502);
    }
    const data = await res.json();
    try { return json({ result: JSON.parse(data?.choices?.[0]?.message?.content ?? '') }); }
    catch { return json({ error: 'Genius returned an unreadable answer. Try again.' }, 502); }
  } catch (e) {
    console.error(e);
    return json({ error: 'Something went wrong.' }, 500);
  }
});
