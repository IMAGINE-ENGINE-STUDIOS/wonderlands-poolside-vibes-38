/**
 * Model router (browser mirror) — which Meta model answers which request.
 *
 * The server copy in supabase/functions/_shared/modelRouter.ts makes the
 * final call; this mirror lets the app label and pre-classify requests.
 * Full logic: knowledge/model-routing.md. No Groq — Meta models only.
 */

export type GeniusTask =
  | 'agentic'
  | 'vision'
  | 'vision-agentic'
  | 'scene3d'
  | 'design'
  | 'design-complex'
  | 'search'
  | 'qa'
  | 'bulk'
  | 'quick';

export const TASK_MODEL: Record<GeniusTask, string> = {
  agentic: 'muse-spark-open',
  'vision-agentic': 'muse-spark-open',
  vision: 'llama-4-maverick',
  scene3d: 'llama-4-maverick',
  'design-complex': 'llama-4-maverick',
  design: 'llama-4-scout',
  bulk: 'llama-4-scout',
  quick: 'llama-3.1-8b',
  search: 'llama-3.3-70b',
  qa: 'llama-3.3-70b',
};

export function routeModelKey(opts: { task?: string | null; hasImage?: boolean }): string {
  if (opts.hasImage && opts.task === 'agentic') return TASK_MODEL['vision-agentic'];
  if (opts.hasImage) return TASK_MODEL.vision;
  const task = (opts.task ?? 'qa') as GeniusTask;
  return TASK_MODEL[task] ?? TASK_MODEL.qa;
}

/**
 * Classify a guest request into a router task from its words and the
 * surface it was asked on. Keyword-based and deterministic — the model
 * itself is never asked to classify.
 */
export function classifyGeniusTask(text: string, surface?: string): GeniusTask {
  const t = ` ${text.toLowerCase()} `;
  if (text.length > 8000) return 'bulk';
  if (/\b(photo|image|picture|screenshot|this pic|attached)\b/.test(t)) return 'vision';
  if (/\b(3d|three dimensional|scene|render|walkthrough)\b/.test(t)) return 'scene3d';
  const multiStep = /\b(and then|after that|first .* then|book .* and|design .* and|create .* and)\b/.test(t);
  const codeWords = /\b(code|script|api|function|debug|build me an app)\b/.test(t);
  if (multiStep || codeWords) return 'agentic';
  if (surface === 'design' || /\b(design studio|drawing board|my design|my plan)\b/.test(t)) {
    const complex = /\b(complex|landscap|beautiful|complete|full|entire|everything|scene)\b/.test(t) ||
      (t.match(/\b(pool|deck|fence|screen|turf|grass|palm|spa|kitchen|fireplace)\b/g) ?? []).length >= 3;
    return complex ? 'design-complex' : 'design';
  }
  if (surface === 'search') return 'search';
  if (surface === 'solar') return 'qa';
  if (text.trim().length < 40 && !/\?/.test(text)) return 'quick';
  return 'qa';
}
