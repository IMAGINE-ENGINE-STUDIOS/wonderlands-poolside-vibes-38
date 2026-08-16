/**
 * Genius design bus — voice and text control of whichever drawing board is open.
 *
 * A board (the FLIP design spread, a studio tool) registers a small agent that
 * knows how to resize, clear, redraw and describe its own drawing. Genius then
 * resolves plain speech — "make the pool sixteen by thirty two", "clear the
 * board", "what does this cost" — against that agent, entirely in the browser.
 * Nothing here calls a paid service.
 */

import type { SitePlanData } from '@/components/blueprint/SiteDrawingBoard';

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

export type GeniusDesignCommand =
  | { kind: 'resize'; widthFt: number; lengthFt: number }
  | { kind: 'clear' }
  | { kind: 'reset' }
  | { kind: 'layer'; layer: string }
  | { kind: 'describe' };

const LAYER_WORDS = ['property', 'building', 'driveway', 'patio', 'pool', 'deck', 'gravel', 'fence', 'equipment'];

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
