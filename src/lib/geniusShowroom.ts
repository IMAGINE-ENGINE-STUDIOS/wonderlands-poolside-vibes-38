/**
 * Genius in the Studio Showroom.
 *
 * When the showroom is on screen Genius can drive every widget on it: jump to a
 * tool, run a search, load a catalog section, open the quote tool, the signature
 * pad, the depth editor or the blueprint import — and explain any product in
 * full. Resolved entirely in the browser; voice remains the only billed step.
 */

import type { NarratorAction } from '@/lib/narratorStore';
import {
  SHOWROOM_HOME_SECTIONS,
  SHOWROOM_WIDGETS,
  findShowroomWidget,
  getShowroomControls,
  type ShowroomWidget,
} from '@/lib/showroomBus';
import { explainProduct, matchCatalogProduct, money, summarizeMatches } from '@/lib/geniusProductBrief';
import { TURNKEY_SCOPE } from '@/data/turnkeyScope';
import { getProjectPipeline } from '@/data/projectPipeline';

export interface ShowroomResolution {
  handled: boolean;
  reply: string;
  actions: NarratorAction[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Chips that always work on this screen. */
export function showroomChips(extra: NarratorAction[] = []): NarratorAction[] {
  return [
    ...extra,
    { label: 'Build a quote', type: 'branch', payload: 'Build me a quote' },
    { label: 'Design my pool', type: 'branch', payload: 'Open the site planner' },
    { label: 'What can you do here?', type: 'branch', payload: 'What can you do here?' },
  ].slice(0, 4);
}

const widgetChip = (widget: ShowroomWidget): NarratorAction => ({
  label: widget.title,
  type: 'branch',
  payload: `Open the ${widget.title}`,
});

/** Which widget does this phrase point at? */
export function matchShowroomWidget(text: string): ShowroomWidget | null {
  const t = norm(text);
  if (!t) return null;
  let best: { widget: ShowroomWidget; score: number } | null = null;
  for (const widget of SHOWROOM_WIDGETS) {
    const needles = [widget.title, ...widget.keywords].map(norm);
    for (const needle of needles) {
      if (needle.length < 3 || !t.includes(needle)) continue;
      const score = needle.length;
      if (!best || score > best.score) best = { widget, score };
    }
  }
  return best?.widget ?? null;
}

function focus(widget: ShowroomWidget): boolean {
  return getShowroomControls()?.focus(widget.id) ?? false;
}

/** Resolve a request against the showroom. handled:false hands the turn on. */
export function resolveShowroomRequest(text: string): ShowroomResolution {
  const controls = getShowroomControls();
  if (!controls) return { handled: false, reply: '', actions: [] };

  const raw = text.trim();
  const t = norm(raw);

  /* ------------------------------ orientation ----------------------------- */
  if (/\b(what can you do|what is here|whats here|help|how does this work|what are my options|show me everything|tour)\b/.test(t)) {
    const disciplines = Array.from(new Set(SHOWROOM_WIDGETS.map((s) => s.tag))).join(', ');
    return {
      handled: true,
      reply: `This is the showroom — ${SHOWROOM_WIDGETS.length} live Wonderlands tools: ${disciplines.toLowerCase()}. Tell me what you want to do — search the catalog, design a layout, price options, or build a quote — and I will open the right tool and work it with you.`,
      actions: showroomChips([{ label: 'List the tools', type: 'branch', payload: 'List every tool' }]),
    };
  }

  if (/\b(list (every|all) (tool|widget)|list the tools|what tools|which tools|all the widgets)\b/.test(t)) {
    const names = SHOWROOM_WIDGETS.map((s) => s.title).join(', ');
    return {
      handled: true,
      reply: `${names}. Name any one and I will take you to it.`,
      actions: showroomChips([widgetChip(findShowroomWidget('site-planner')!)]),
    };
  }

  /* -------------------------------- quoting ------------------------------- */
  if (/\b(quote|quotation|proposal|estimate for me|price me|written price|send me a price|itemi[sz]ed)\b/.test(t)) {
    const product = matchCatalogProduct(raw);
    focus(findShowroomWidget('quote')!);
    controls.openQuote(product ? { name: product.name, price: product.price, type: product.category.toLowerCase() } : undefined);
    return {
      handled: true,
      reply: product
        ? `Opening the quote tool on ${product.name}${money(product.price) ? ` at ${money(product.price)} turn-key` : ''}. Give me your name and email and everything in your selection prints as one itemized quote.`
        : 'Opening the quote tool. Your name and email, then everything in your selection prints as one itemized quote — delivery and installation included.',
      actions: showroomChips([{ label: 'My selection', type: 'branch', payload: "What's in my selection?" }]),
    };
  }

  /* ------------------------------- searching ------------------------------ */
  const searchAsk = raw.match(/\b(?:search|find|look up|show me results for)\s+(?:for\s+)?(.{2,60})$/i);
  if (searchAsk) {
    const query = searchAsk[1].replace(/[?.!]+$/, '').trim();
    focus(findShowroomWidget('search')!);
    controls.search(query);
    const summary = summarizeMatches(query);
    return {
      handled: true,
      reply: summary ? `Searching ${query}. ${summary}` : `Searching ${query} across the catalog — results are on the search desk now.`,
      actions: showroomChips(),
    };
  }

  /* --------------------------- explaining products ------------------------ */
  const product = matchCatalogProduct(raw);
  const wantsProduct = /\b(tell me about|explain|describe|what is|whats|details|spec|specification|how much|price|cost|dimensions|depth|compare)\b/.test(t);
  if (product && (wantsProduct || t.split(' ').length <= 6)) {
    const section = SHOWROOM_HOME_SECTIONS.find((s) => s.keywords.some((k) => norm(product.category).includes(norm(k))));
    if (section) {
      controls.setHomeSection(section.id);
      focus(findShowroomWidget('home-sections')!);
    }
    return {
      handled: true,
      reply: explainProduct(product),
      actions: showroomChips([
        { label: 'Add to selection', type: 'add_to_cart' },
        { label: `Quote ${product.name}`, type: 'branch', payload: `Build a quote for the ${product.name}` },
      ]),
    };
  }

  /* ------------------------- what's included / process -------------------- */
  if (/\b(whats included|what is included|included|turn ?key|standard|process|pipeline|steps|how long|timeline|schedule of works)\b/.test(t)) {
    focus(findShowroomWidget('turnkey')!);
    const pipeline = getProjectPipeline(/spa/.test(t) ? 'spas' : /ledge/.test(t) ? 'tanning-ledges' : 'pools');
    return {
      handled: true,
      reply: `Every build is turn-key: ${TURNKEY_SCOPE.slice(0, 7).map((s) => s.label.toLowerCase()).join(', ')} — plus one project manager through handover.${
        pipeline ? ` The build itself runs in ${pipeline.steps.length} managed steps, starting with ${pipeline.steps[0].title.toLowerCase()}.` : ''
      } Selections like finish, coping, deck and heating are priced as you configure them.`,
      actions: showroomChips(),
    };
  }

  /* ----------------------------- catalog sections ------------------------- */
  const wantsCatalog = /\b(show|open|browse|see|load|view)\b/.test(t);
  const section = SHOWROOM_HOME_SECTIONS.find((s) => s.keywords.some((k) => t.includes(norm(k))));
  const widget = matchShowroomWidget(raw);

  /* --------------------------- opening a widget --------------------------- */
  if (widget) {
    focus(widget);
    if (widget.id === 'signature') controls.openSignature();
    if (widget.id === 'depth') controls.openDepth();
    if (widget.id === 'blueprint') controls.openBlueprintImport();
    if (widget.id === 'sauna-pricing') controls.openSaunaPricing();
    if (widget.id === 'home-sections' && section) controls.setHomeSection(section.id);
    return {
      handled: true,
      reply: `${widget.title}. ${widget.description} It is live on your screen now — tell me what to change and I will work it with you.`,
      actions: showroomChips([
        { label: 'Price this', type: 'branch', payload: 'What does this design cost installed?' },
      ]),
    };
  }

  if (section && wantsCatalog) {
    controls.setHomeSection(section.id);
    focus(findShowroomWidget('home-sections')!);
    return {
      handled: true,
      reply: `${section.label} is loaded below — every model with its turn-key price. Say a name and I will explain it in full.`,
      actions: showroomChips(),
    };
  }

  /* ------------------------------ broad search ---------------------------- */
  if (t.length > 3) {
    const summary = summarizeMatches(raw);
    if (summary) {
      focus(findShowroomWidget('search')!);
      controls.search(raw);
      return { handled: true, reply: summary, actions: showroomChips() };
    }
  }

  return { handled: false, reply: '', actions: [] };
}
