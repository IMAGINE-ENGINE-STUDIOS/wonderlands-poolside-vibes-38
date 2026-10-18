/**
 * Genius design bus — voice and text control of whichever drawing board is open.
 *
 * A board (the FLIP design spread, a studio tool) registers a small agent that
 * knows how to resize, clear, redraw and describe its own drawing. Genius then
 * resolves plain speech — "make the pool sixteen by thirty two", "clear the
 * board", "what does this cost" — against that agent, entirely in the browser.
 * Nothing here calls a paid service.
 */

import type { SitePlanData, SiteShape } from '@/components/blueprint/SiteDrawingBoard';

export type GeniusDesignKind = 'site' | 'enclosure' | 'fence' | 'grass';

export interface GeniusDesignAgent {
  id: string;
  /** Human label, e.g. "Milan pool site plan" */
  label: string;
  kind: GeniusDesignKind;
  /** Spoken summary of the drawing as it stands (dimensions + price) */
  describe: () => string;
  /** Scale the primary shape to these published dimensions */
  resize?: (widthFt: number, lengthFt: number) => string | null;
  /** Empty the board */
  clear?: () => string | null;
  /** Redraw the product to its published dimensions */
  reset?: () => string | null;
  /** Arm a drawing layer ("deck", "fence", "pool"…) */
  setLayer?: (layer: string) => string | null;
  /** Translate a layer's shapes by feet (v2) */
  move?: (target: string, dxFt: number, dyFt: number) => string | null;
  /** Move a layer beside / inside another layer (v2) */
  moveBeside?: (target: string, beside: string, side?: string) => string | null;
  /** Place catalog objects with the placement rules enforced (v2) */
  place?: (req: GeniusPlaceRequest) => string | null;
  /** Curve or straighten a shape's spline edges (v2) */
  reshape?: (target: string, op: 'curve' | 'straighten') => string | null;
  /** Change a finish: waterline, shell, coping, deck, fence, screen (v2) */
  setFinish?: (part: string, finish: string) => string | null;
  /** Remove a layer's shapes or placed objects of a kind (v2) */
  remove?: (target: string) => string | null;
}

type Listener = (agent: GeniusDesignAgent | null) => void;

let agent: GeniusDesignAgent | null = null;
const listeners = new Set<Listener>();

export function registerGeniusDesignAgent(next: GeniusDesignAgent) {
  agent = next;
  listeners.forEach((l) => l(agent));
  return () => {
    if (agent?.id === next.id) {
      agent = null;
      listeners.forEach((l) => l(null));
    }
  };
}

export const getGeniusDesignAgent = () => agent;

export function subscribeGeniusDesign(listener: Listener) {
  listeners.add(listener);
  listener(agent);
  return () => listeners.delete(listener);
}

/* ------------------------------ speech parsing ----------------------------- */

const WORD_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30,
  forty: 40, fifty: 50, sixty: 60,
};

/** "thirty two" → 32, "16" → 16 */
function readNumber(phrase: string): number | null {
  const clean = phrase.trim().toLowerCase();
  const digits = clean.match(/\d+(?:\.\d+)?/);
  if (digits) return Number(digits[0]);
  const words = clean.split(/[\s-]+/).filter((w) => w in WORD_NUMBERS);
  if (!words.length) return null;
  return words.reduce((sum, w) => sum + WORD_NUMBERS[w], 0);
}

export type GeniusPlaceCategory = 'plant' | 'turf' | 'furniture' | 'fire' | 'kitchen' | 'vehicle' | 'decor';
export type GeniusPlaceZone = 'open' | 'enclosure' | 'fence' | 'deck' | 'driveway';

export interface GeniusPlaceRequest {
  category: GeniusPlaceCategory;
  /** The guest's own words for the thing ("palms", "fireplace") */
  label: string;
  count: number;
  zone: GeniusPlaceZone;
}

export type GeniusDesignCommand =
  | { kind: 'resize'; widthFt: number; lengthFt: number }
  | { kind: 'clear' }
  | { kind: 'reset' }
  | { kind: 'layer'; layer: string }
  | { kind: 'describe' }
  | { kind: 'move'; target: string; dxFt: number; dyFt: number }
  | { kind: 'moveBeside'; target: string; beside: string; side?: string }
  | { kind: 'place'; req: GeniusPlaceRequest }
  | { kind: 'reshape'; target: string; op: 'curve' | 'straighten' }
  | { kind: 'finish'; part: string; finish: string }
  | { kind: 'remove'; target: string };

const LAYER_WORDS = ['property', 'building', 'driveway', 'patio', 'pool', 'deck', 'gravel', 'fence', 'equipment'];

/* ------------------------- v2 vocabulary (objects & zones) ------------------------- */

const TARGET_WORDS: Record<string, string> = {
  pool: 'pool', spa: 'spa', 'hot tub': 'spa', ledge: 'ledge', deck: 'deck', patio: 'patio',
  screen: 'enclosure', enclosure: 'enclosure', cage: 'enclosure', lanai: 'enclosure',
  turf: 'turf', grass: 'turf', fence: 'fence', driveway: 'driveway', gravel: 'gravel',
  equipment: 'equipment', building: 'building', house: 'building',
};

const ITEM_WORDS: Array<[RegExp, GeniusPlaceCategory, string]> = [
  [/\b(palms?|trees?|plants?|flowers?|bush(es)?|shrubs?|hedges?|garden)\b/, 'plant', 'plants'],
  [/\b(grass|turf|lawn|sod)\b/, 'turf', 'turf'],
  [/\b(chairs?|tables?|loungers?|sofas?|couch|furniture|seating|benches?)\b/, 'furniture', 'furniture'],
  [/\b(fireplaces?|fire ?pits?|fire ?bowls?)\b/, 'fire', 'fire feature'],
  [/\b(bbq|barbecue|grills?|outdoor kitchens?|kitchens?)\b/, 'kitchen', 'outdoor kitchen'],
  [/\b(cars?|vehicles?|trucks?|vans?)\b/, 'vehicle', 'vehicle'],
  [/\b(statues?|decor(ations?)?|fountains?|lighting|lights?|planters?)\b/, 'decor', 'decor'],
];

const findTarget = (t: string): string | null => {
  for (const [word, layer] of Object.entries(TARGET_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return layer;
  }
  return null;
};

const zoneOf = (t: string): GeniusPlaceZone => {
  if (/\binside (the )?(screen|enclosure|cage|lanai)\b|\bon the screened\b/.test(t)) return 'enclosure';
  if (/\binside (the )?(fence|fenced area|fenced yard)\b|\bin the fenced\b/.test(t)) return 'fence';
  if (/\bon (the )?(deck|patio)\b/.test(t)) return 'deck';
  if (/\bon (the )?(driveway|drive)\b/.test(t)) return 'driveway';
  return 'open';
};

/** Parse a design instruction. Returns null when the phrase is not about the board. */
export function parseGeniusDesignCommand(text: string): GeniusDesignCommand | null {
  const t = text.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();

  const dims = t.match(
    /(\d+(?:\.\d+)?|[a-z\s-]{3,20}?)\s*(?:ft|feet|foot)?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?|[a-z\s-]{3,20}?)\s*(?:ft|feet|foot)?\b/,
  );
  if (dims && /(make|resize|size|change|set|draw|redraw|adjust|widen|shrink|grow)\b/.test(t)) {
    const w = readNumber(dims[1]);
    const l = readNumber(dims[2]);
    if (w && l && w > 2 && l > 2 && w < 300 && l < 300) {
      return { kind: 'resize', widthFt: Math.min(w, l), lengthFt: Math.max(w, l) };
    }
  }

  if (/\b(clear|erase|wipe|empty|delete)\b.*\b(board|drawing|design|plan|canvas)\b/.test(t)) return { kind: 'clear' };
  if (/\b(start over|reset|redraw it|draw it again|put it back|restore)\b/.test(t)) return { kind: 'reset' };

  /* v2 — place objects ("add two palms inside the fence") */
  if (/\b(add|put|place|plant|install|set|drop)\b/.test(t)) {
    const hit = ITEM_WORDS.find(([re]) => re.test(t));
    if (hit) {
      const countMatch = t.match(/\b(\d{1,2})\b/) ?? t.match(/\b(two|three|four|five|six|seven|eight|a couple of)\b/);
      const count = countMatch ? Math.min(12, Math.max(1, readNumber(countMatch[0]) ?? (/couple/.test(countMatch[0]) ? 2 : 1))) : 1;
      const labelMatch = t.match(hit[0]);
      return { kind: 'place', req: { category: hit[1], label: labelMatch?.[0] ?? hit[2], count, zone: zoneOf(t) } };
    }
  }

  /* v2 — move ("move the pool 3 feet left", "move the spa next to the fence") */
  if (/\b(move|shift|slide|nudge|relocate)\b/.test(t)) {
    const target = findTarget(t);
    if (target) {
      const besideMatch = t.match(/\b(?:next to|beside|against|near|inside|into|by)\s+(?:the\s+)?([a-z ]+?)(?:\s+(?:on|to|by)\b|$)/);
      const besideWord = besideMatch ? findTarget(besideMatch[1]) : null;
      if (besideWord && besideWord !== target) {
        const side = /\bleft\b/.test(t) ? 'left' : /\bright\b/.test(t) ? 'right' : /\b(above|behind|north)\b/.test(t) ? 'above' : /\b(below|front|south)\b/.test(t) ? 'below' : undefined;
        return { kind: 'moveBeside', target, beside: besideWord, side };
      }
      const distMatch = t.match(/(\d+(?:\.\d+)?|[a-z\s-]{3,16}?)\s*(?:ft|feet|foot|m|metres?|meters?)\b/);
      const dist = distMatch ? readNumber(distMatch[1]) : null;
      const feet = dist == null ? 2 : /met/.test(t) ? dist * 3.28084 : dist;
      let dx = 0, dy = 0;
      if (/\bleft\b|\bwest\b/.test(t)) dx = -feet;
      else if (/\bright\b|\beast\b/.test(t)) dx = feet;
      if (/\b(up|north|back|away)\b/.test(t)) dy = -feet;
      else if (/\b(down|south|forward|towards? me)\b/.test(t)) dy = feet;
      if (dx !== 0 || dy !== 0) return { kind: 'move', target, dxFt: +dx.toFixed(2), dyFt: +dy.toFixed(2) };
    }
  }

  /* v2 — reshape splines ("curve the pool edge", "straighten the deck") */
  if (/\b(curve|round|soften|smooth)\b/.test(t)) return { kind: 'reshape', target: findTarget(t) ?? 'pool', op: 'curve' };
  if (/\b(straighten|flatten|square off)\b/.test(t)) return { kind: 'reshape', target: findTarget(t) ?? 'pool', op: 'straighten' };

  /* v2 — finishes ("change the coping to travertine", "make the deck pavers Coralina") */
  const finishMatch = t.match(/\b(coping|waterline|shell|deck|fence|screen|pavers?|tile|interior finish)\b[^.]*?\bto\s+(?:a\s+|the\s+)?([a-z][a-z\s-]{2,30})$/)
    ?? t.match(/\bmake (?:the\s+)?(coping|waterline|shell|deck|fence|screen)\s+(?:a\s+)?([a-z][a-z\s-]{2,30})$/);
  if (finishMatch && /\b(change|make|set|switch|use)\b/.test(t)) {
    return { kind: 'finish', part: finishMatch[1].replace(/s$/, ''), finish: finishMatch[2].trim() };
  }

  /* v2 — remove ("remove the palms", "delete the deck") */
  if (/\b(remove|delete|take out|get rid of|clear away)\b/.test(t)) {
    const item = ITEM_WORDS.find(([re]) => re.test(t));
    if (item) return { kind: 'remove', target: item[1] };
    const target = findTarget(t);
    if (target) return { kind: 'remove', target };
  }

  if (/\b(draw|switch to|arm|use)\b/.test(t)) {
    const layer = LAYER_WORDS.find((l) => new RegExp(`\\b${l}\\b`).test(t));
    if (layer) return { kind: 'layer', layer };
  }

  if (
    /\b(what (is|are) (the )?(dimensions|measurements|size|square footage|sq ft|cost|price)|how (big|much) is (this|the) (design|drawing|plan|pool)|read (me )?(the )?(drawing|design|plan|numbers))\b/.test(
      t,
    )
  ) {
    return { kind: 'describe' };
  }

  return null;
}

/** Run a design instruction against the open board. */
export function runGeniusDesignCommand(text: string): string | null {
  const command = parseGeniusDesignCommand(text);
  if (!command) return null;
  if (!agent) return 'Open a drawing board and I will draw it with you.';

  switch (command.kind) {
    case 'resize': {
      const done = agent.resize?.(command.widthFt, command.lengthFt);
      return done ?? 'This board does not take dimensions that way — draw the shape and I will price it.';
    }
    case 'clear':
      return agent.clear?.() ?? 'There is nothing to clear here.';
    case 'reset':
      return agent.reset?.() ?? agent.describe();
    case 'layer':
      return agent.setLayer?.(command.layer) ?? agent.describe();
    case 'describe':
      return agent.describe();
    case 'move': {
      const done = agent.move?.(command.target, command.dxFt, command.dyFt);
      return done ?? `This board cannot move the ${command.target} by voice yet — drag it and I will keep pricing.`;
    }
    case 'moveBeside': {
      const done = agent.moveBeside?.(command.target, command.beside, command.side);
      return done ?? `This board cannot reposition the ${command.target} by voice yet — drag it and I will keep pricing.`;
    }
    case 'place': {
      const done = agent.place?.(command.req);
      return done ?? 'This board does not take placed objects — open the Design Studio board and I will place them there.';
    }
    case 'reshape': {
      const done = agent.reshape?.(command.target, command.op);
      return done ?? `This board cannot reshape the ${command.target} by voice yet.`;
    }
    case 'finish': {
      const done = agent.setFinish?.(command.part, command.finish);
      return done ?? `Finishes live in the Studio's finish picker — open it and choose ${command.finish} for the ${command.part}; the price follows automatically.`;
    }
    case 'remove': {
      const done = agent.remove?.(command.target);
      return done ?? `There is nothing called ${command.target} on this board to remove.`;
    }
  }
}

/* ---------------------- site-plan geometry helpers ---------------------- */


/**
 * Scale the pool (or spa) shape of a site plan so its bounding box measures the
 * requested feet, keeping its centre and its drawn character. Returns null when
 * the plan has no pool shape to work with.
 */
export function resizeSitePlanPool(plan: SitePlanData, widthFt: number, lengthFt: number): SitePlanData | null {
  const index = plan.shapes.findIndex((s) => s.layer === 'pool');
  if (index < 0) return null;
  const shape = plan.shapes[index];
  if (shape.points.length < 3) return null;

  const xs = shape.points.map((p) => p.x);
  const ys = shape.points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const boxW = maxX - minX;
  const boxH = maxY - minY;
  if (boxW <= 0 || boxH <= 0) return null;

  /* The longer run of the drawing takes the longer dimension. */
  const horizontalIsLong = boxW >= boxH;
  const targetW = (horizontalIsLong ? lengthFt : widthFt) * plan.pxPerFt;
  const targetH = (horizontalIsLong ? widthFt : lengthFt) * plan.pxPerFt;
  const sx = targetW / boxW;
  const sy = targetH / boxH;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const points = shape.points.map((p) => ({
    x: +(cx + (p.x - cx) * sx).toFixed(2),
    y: +(cy + (p.y - cy) * sy).toFixed(2),
  }));

  const shapes = [...plan.shapes];
  shapes[index] = { ...shape, points };
  return { ...plan, shapes };
}

/* ============================ v2 geometry & placement ============================
 * The placement rules from knowledge/design-studio.md, as code:
 *  - NOTHING is ever placed on top of a pool, spa or ledge.
 *  - Plants and turf are never placed on a deck, patio, driveway or building —
 *    they live on open ground, inside the fenced area, or inside the screen
 *    enclosure's open floor.
 *  - Furniture, fire features, outdoor kitchens and decor MAY sit on a deck
 *    when the guest says so.
 *  - Vehicles belong on the driveway only.
 *  - "Inside the screen" = inside the enclosure polygon; "inside the fence"
 *    = inside the closed fence line. Never ON the screen or the fence itself.
 */

export interface Pt { x: number; y: number }

export const ptInPoly = (pt: Pt, poly: Pt[]): boolean => {
  if (poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if ((yi > pt.y) !== (yj > pt.y) && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

export const polyCentroid = (poly: Pt[]): Pt => {
  if (!poly.length) return { x: 0, y: 0 };
  return { x: poly.reduce((s, p) => s + p.x, 0) / poly.length, y: poly.reduce((s, p) => s + p.y, 0) / poly.length };
};

const bboxOf = (polys: Pt[][]) => {
  const all = polys.flat();
  if (!all.length) return null;
  return {
    minX: Math.min(...all.map((p) => p.x)), maxX: Math.max(...all.map((p) => p.x)),
    minY: Math.min(...all.map((p) => p.y)), maxY: Math.max(...all.map((p) => p.y)),
  };
};

export const shapesOfLayer = (plan: SitePlanData, layer: string): SiteShape[] =>
  plan.shapes.filter((s) => s.layer === layer && s.points.length >= 2);

/** Closed polygons for a layer; open runs (fences) are closed end-to-end. */
const polysOfLayer = (plan: SitePlanData, layer: string): Pt[][] =>
  shapesOfLayer(plan, layer).filter((s) => s.points.length >= 3).map((s) => s.points);

/** Layers whose AREA nothing of a category may overlap. */
const FORBIDDEN_LAYERS: Record<GeniusPlaceCategory, string[]> = {
  plant: ['pool', 'spa', 'ledge', 'deck', 'patio', 'driveway', 'building', 'equipment', 'solar'],
  turf: ['pool', 'spa', 'ledge', 'deck', 'patio', 'driveway', 'building', 'equipment', 'solar'],
  furniture: ['pool', 'spa', 'ledge'],
  fire: ['pool', 'spa', 'ledge', 'turf'],
  kitchen: ['pool', 'spa', 'ledge', 'turf'],
  vehicle: ['pool', 'spa', 'ledge', 'deck', 'patio', 'turf', 'building', 'gravel', 'equipment', 'solar'],
  decor: ['pool', 'spa', 'ledge'],
};

const ZONE_LAYER: Partial<Record<GeniusPlaceZone, string>> = {
  enclosure: 'enclosure', fence: 'fence', deck: 'deck', driveway: 'driveway',
};

/** Check one point against the placement rules. */
export function validatePlacement(
  plan: SitePlanData,
  category: GeniusPlaceCategory,
  pt: Pt,
  zone: GeniusPlaceZone = 'open',
): { ok: boolean; reason?: string } {
  const zoneLayer = ZONE_LAYER[zone];
  if (zoneLayer) {
    const zonePolys = polysOfLayer(plan, zoneLayer);
    if (!zonePolys.length) return { ok: false, reason: `there is no ${zone === 'enclosure' ? 'screen enclosure' : zone} drawn on this board yet` };
    if (!zonePolys.some((poly) => ptInPoly(pt, poly))) return { ok: false, reason: `that spot is not inside the ${zone}` };
    if (zone === 'deck' && (category === 'plant' || category === 'turf' || category === 'vehicle')) {
      return { ok: false, reason: `${category === 'vehicle' ? 'vehicles' : category} never go on a deck` };
    }
  } else {
    const property = polysOfLayer(plan, 'property');
    if (property.length && !property.some((poly) => ptInPoly(pt, poly))) {
      return { ok: false, reason: 'that spot is outside the property line' };
    }
  }
  if (category === 'vehicle' && zone !== 'driveway') {
    const drives = polysOfLayer(plan, 'driveway');
    if (drives.length && !drives.some((poly) => ptInPoly(pt, poly))) {
      return { ok: false, reason: 'vehicles belong on the driveway' };
    }
  }
  for (const layer of FORBIDDEN_LAYERS[category]) {
    if (polysOfLayer(plan, layer).some((poly) => ptInPoly(pt, poly))) {
      return { ok: false, reason: `that spot is on the ${layer} — ${category} cannot go there` };
    }
  }
  return { ok: true };
}

/** Find up to `count` legal spots for a category inside a zone, centroid-out. */
export function findPlacementSpots(
  plan: SitePlanData,
  category: GeniusPlaceCategory,
  zone: GeniusPlaceZone,
  count: number,
): Pt[] {
  const zoneLayer = ZONE_LAYER[zone];
  const scope = zoneLayer ? polysOfLayer(plan, zoneLayer) : polysOfLayer(plan, 'property');
  const bb = bboxOf(scope.length ? scope : plan.shapes.map((s) => s.points));
  if (!bb) return [];
  const step = Math.max(plan.pxPerFt * 2, (bb.maxX - bb.minX) / 24);
  const centre = { x: (bb.minX + bb.maxX) / 2, y: (bb.minY + bb.maxY) / 2 };
  const candidates: Pt[] = [];
  for (let x = bb.minX + step / 2; x <= bb.maxX; x += step) {
    for (let y = bb.minY + step / 2; y <= bb.maxY; y += step) candidates.push({ x, y });
  }
  candidates.sort((a, b) => Math.hypot(a.x - centre.x, a.y - centre.y) - Math.hypot(b.x - centre.x, b.y - centre.y));
  const spots: Pt[] = [];
  for (const c of candidates) {
    if (spots.length >= count) break;
    if (spots.some((s) => Math.hypot(s.x - c.x, s.y - c.y) < plan.pxPerFt * 3)) continue;
    if (validatePlacement(plan, category, c, zone).ok) spots.push(c);
  }
  return spots;
}

const octagon = (c: Pt, r: number): Pt[] =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x: +(c.x + Math.cos(a) * r).toFixed(1), y: +(c.y + Math.sin(a) * r).toFixed(1) };
  });

const rect = (c: Pt, w: number, h: number): Pt[] => [
  { x: c.x - w / 2, y: c.y - h / 2 }, { x: c.x + w / 2, y: c.y - h / 2 },
  { x: c.x + w / 2, y: c.y + h / 2 }, { x: c.x - w / 2, y: c.y + h / 2 },
];

/** Plan symbol (layer, footprint in feet) per placed category. */
const SYMBOL: Record<GeniusPlaceCategory, { layer: string; wFt: number; hFt: number; round?: boolean }> = {
  plant: { layer: 'gravel', wFt: 3, hFt: 3, round: true },
  turf: { layer: 'turf', wFt: 10, hFt: 8 },
  furniture: { layer: 'patio', wFt: 6, hFt: 4 },
  fire: { layer: 'patio', wFt: 4, hFt: 4, round: true },
  kitchen: { layer: 'patio', wFt: 8, hFt: 3 },
  vehicle: { layer: 'driveway', wFt: 15, hFt: 6 },
  decor: { layer: 'gravel', wFt: 2, hFt: 2, round: true },
};

export interface PlaceOutcome { plan: SitePlanData; placed: number; note: string }

/**
 * Place objects on a site plan as plan symbols, enforcing the rules.
 * Returns the new plan plus how many were placed and an honest note.
 */
export function placeObjectShapes(plan: SitePlanData, req: GeniusPlaceRequest): PlaceOutcome {
  const spots = findPlacementSpots(plan, req.category, req.zone, req.count);
  if (!spots.length) {
    const probe = validatePlacement(plan, req.category, polyCentroid(plan.shapes[0]?.points ?? []), req.zone);
    return {
      plan, placed: 0,
      note: `I could not place the ${req.label} — ${probe.reason ?? 'no legal spot fits the placement rules'}. Nothing was drawn on top of anything.`,
    };
  }
  const sym = SYMBOL[req.category];
  const stamp = Date.now();
  const added: SiteShape[] = spots.map((c, i) => ({
    id: `gen-${stamp}-${i}`,
    layer: sym.layer as SiteShape['layer'],
    points: sym.round ? octagon(c, (sym.wFt / 2) * plan.pxPerFt) : rect(c, sym.wFt * plan.pxPerFt, sym.hFt * plan.pxPerFt),
    closed: true,
    importedFrom: `genius:${req.category}`,
  }));
  const zoneText = req.zone === 'open' ? 'on the open ground' : req.zone === 'enclosure' ? 'inside the screen enclosure' : req.zone === 'fence' ? 'inside the fenced area' : `on the ${req.zone}`;
  return {
    plan: { ...plan, shapes: [...plan.shapes, ...added] },
    placed: spots.length,
    note: `${spots.length} × ${req.label} placed ${zoneText}, clear of the pool, deck and structures${spots.length < req.count ? ` (only ${spots.length} legal spot${spots.length === 1 ? '' : 's'} fit)` : ''}.`,
  };
}

/** Translate every shape of a layer by feet. Returns null when the layer is absent. */
export function translateSiteShapes(plan: SitePlanData, layer: string, dxFt: number, dyFt: number): SitePlanData | null {
  if (!shapesOfLayer(plan, layer).length) return null;
  const dx = dxFt * plan.pxPerFt, dy = dyFt * plan.pxPerFt;
  return {
    ...plan,
    shapes: plan.shapes.map((s) => s.layer === layer
      ? { ...s, points: s.points.map((p) => ({ x: +(p.x + dx).toFixed(2), y: +(p.y + dy).toFixed(2) })) }
      : s),
  };
}

/** Move a layer so its bounding box sits beside another layer's, 2 ft clear. */
export function moveShapeBeside(
  plan: SitePlanData, layer: string, beside: string, side?: string,
): { plan: SitePlanData; dxFt: number; dyFt: number } | null {
  const a = bboxOf(shapesOfLayer(plan, layer).map((s) => s.points));
  const b = bboxOf(shapesOfLayer(plan, beside).map((s) => s.points));
  if (!a || !b) return null;
  const gap = 2 * plan.pxPerFt;
  const dir = side ?? 'right';
  let dx = 0, dy = 0;
  if (dir === 'left') dx = b.minX - gap - a.maxX;
  else if (dir === 'above') dy = b.minY - gap - a.maxY;
  else if (dir === 'below') dy = b.maxY + gap - a.minY;
  else dx = b.maxX + gap - a.minX;
  const next = translateSiteShapes(plan, layer, dx / plan.pxPerFt, dy / plan.pxPerFt);
  return next ? { plan: next, dxFt: dx / plan.pxPerFt, dyFt: dy / plan.pxPerFt } : null;
}

/** Curve (spline arcs on every segment) or straighten (arcs off) a layer's first shape. */
export function reshapeSiteShape(plan: SitePlanData, layer: string, op: 'curve' | 'straighten'): SitePlanData | null {
  const index = plan.shapes.findIndex((s) => s.layer === layer && s.points.length >= 3);
  if (index < 0) return null;
  const shape = plan.shapes[index];
  const next: SiteShape = op === 'curve'
    ? { ...shape, curves: shape.points.map(() => true), arcs: shape.points.map(() => 0.22) }
    : { ...shape, curves: shape.points.map(() => false), arcs: undefined, fillets: undefined, tension: undefined };
  const shapes = [...plan.shapes];
  shapes[index] = next;
  return { ...plan, shapes };
}

/** Remove a layer's shapes, or placed objects of a category (genius:<category>). */
export function removeSiteShapes(plan: SitePlanData, target: string): { plan: SitePlanData; removed: number } {
  const kept = plan.shapes.filter((s) => s.layer !== target && s.importedFrom !== `genius:${target}`);
  return { plan: { ...plan, shapes: kept }, removed: plan.shapes.length - kept.length };
}
