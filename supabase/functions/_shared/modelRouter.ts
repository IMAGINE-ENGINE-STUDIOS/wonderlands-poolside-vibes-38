/**
 * Model router — which Meta model answers which kind of request.
 * Imagine Engine Studios Corp. Full logic: knowledge/model-routing.md.
 *
 * Rules, in order:
 *  1. An explicit guest pick (the FLIP model flipper) always wins, when it
 *     names a hosted model.
 *  2. Otherwise the task decides:
 *       agentic / vision-agentic -> Muse Spark Open (agentic + multimodal)
 *       vision / scene3d / design-complex -> Llama 4 Maverick (multimodal, spatial)
 *       design / bulk -> Llama 4 Scout (fast, longest context)
 *       quick -> Llama 3.1 8B (smallest, fastest)
 *       search / qa / anything else -> Llama 3.3 70B (catalog Q&A default)
 *  3. metaChat's fallback chain stays Meta-only whatever is picked.
 *
 * Deterministic local layers (price lookups, FLIP brain, design bus) run
 * before any model call and are not routed here — they cost nothing.
 */

export type GeniusTask =
  | "agentic"
  | "vision"
  | "vision-agentic"
  | "scene3d"
  | "design"
  | "design-complex"
  | "search"
  | "qa"
  | "bulk"
  | "quick";

const TASK_MODEL: Record<GeniusTask, string> = {
  "agentic": "muse-spark-open",
  "vision-agentic": "muse-spark-open",
  "vision": "llama-4-maverick",
  "scene3d": "llama-4-maverick",
  "design-complex": "llama-4-maverick",
  "design": "llama-4-scout",
  "bulk": "llama-4-scout",
  "quick": "llama-3.1-8b",
  "search": "llama-3.3-70b",
  "qa": "llama-3.3-70b",
};

export interface RouteOptions {
  /** The guest's explicit flipper pick (catalog key), if any. */
  explicit?: string | null;
  /** What kind of request this is. */
  task?: string | null;
  /** The request carries an image / photo / screenshot. */
  hasImage?: boolean;
}

/** Resolve the catalog key of the model that should answer. */
export function routeModelKey(opts: RouteOptions): string {
  if (opts.hasImage && opts.task === "agentic") return TASK_MODEL["vision-agentic"];
  if (opts.hasImage) return TASK_MODEL["vision"];
  const task = (opts.task ?? "qa") as GeniusTask;
  return TASK_MODEL[task] ?? TASK_MODEL["qa"];
}

/**
 * The effective catalog key for a request: the guest's explicit hosted
 * pick when there is one, otherwise the router's choice.
 */
export function effectiveModelKey(opts: RouteOptions, isHosted: (key: string) => boolean): string {
  if (opts.explicit && isHosted(opts.explicit)) return opts.explicit;
  return routeModelKey(opts);
}
