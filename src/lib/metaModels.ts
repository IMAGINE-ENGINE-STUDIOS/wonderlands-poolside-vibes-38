/**
 * Meta model catalog + the guest's model choice for FLIP's Genius.
 *
 * No Groq anywhere: hosted models are Meta's, served through OpenRouter.
 * The flipper in the Genius panel lets a guest flip between them; the
 * choice is sent to the `genius` function, which tries the pick first
 * and falls back to its Meta-only chain if needed. Code Llama models are
 * local-only via Ollama (apiId null) — listed so the range is visible,
 * but disabled in the hosted flipper.
 *
 * Keep the catalog in sync with supabase/functions/_shared/metaModels.ts.
 */

export interface MetaModel {
  key: string;
  label: string;
  family: "Muse Spark" | "Llama 4" | "Llama 3" | "Code Llama";
  /** OpenRouter model id, or null when the model is local-only. */
  apiId: string | null;
  ollamaTag: string | null;
  blurb: string;
  multimodal?: boolean;
}

export const META_MODELS: MetaModel[] = [
  {
    key: "muse-spark-open",
    label: "Muse Spark Open",
    family: "Muse Spark",
    apiId: "meta/muse-spark-open",
    ollamaTag: null,
    blurb: "Meta's newest open model (October 2026): 816B MoE, 42B active, multimodal, built for coding and agentic work.",
    multimodal: true,
  },
  {
    key: "llama-4-maverick",
    label: "Llama 4 Maverick",
    family: "Llama 4",
    apiId: "meta-llama/llama-4-maverick",
    ollamaTag: null,
    blurb: "Llama 4 flagship: 17B active / 128 experts, natively multimodal, strongest Llama reasoning and code.",
    multimodal: true,
  },
  {
    key: "llama-4-scout",
    label: "Llama 4 Scout",
    family: "Llama 4",
    apiId: "meta-llama/llama-4-scout",
    ollamaTag: null,
    blurb: "Llama 4 efficiency model: 17B active / 16 experts, natively multimodal, very long context.",
    multimodal: true,
  },
  {
    key: "llama-3.3-70b",
    label: "Llama 3.3 70B",
    family: "Llama 3",
    apiId: "meta-llama/llama-3.3-70b-instruct",
    ollamaTag: "llama3.3:70b",
    blurb: "The Meta workhorse; also self-hostable via Ollama on server hardware.",
  },
  {
    key: "llama-3.1-8b",
    label: "Llama 3.1 8B",
    family: "Llama 3",
    apiId: "meta-llama/llama-3.1-8b-instruct",
    ollamaTag: "llama3.1:8b",
    blurb: "Small and fast hosted; the one Llama that fits a consumer RTX locally via Ollama (4.9 GB).",
  },
  {
    key: "codellama-70b",
    label: "Code Llama 70B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:70b",
    blurb: "Code-specialized, largest size. Self-hosted via Ollama only.",
  },
  {
    key: "codellama-34b",
    label: "Code Llama 34B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:34b",
    blurb: "Code-specialized, mid-size. Self-hosted via Ollama only.",
  },
  {
    key: "codellama-13b",
    label: "Code Llama 13B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:13b",
    blurb: "Code-specialized, fits a high-end consumer GPU. Self-hosted via Ollama only.",
  },
  {
    key: "codellama-7b",
    label: "Code Llama 7B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:7b",
    blurb: "Code-specialized, smallest size — runs on a consumer RTX via Ollama. Self-hosted only.",
  },
];

export const metaModelByKey = (key?: string | null): MetaModel | null =>
  META_MODELS.find((m) => m.key === key) ?? null;

/* ------------------------- the guest's flip choice ------------------------ */

const STORAGE_KEY = "wl.flip.genius.model";

/** The default Genius model in FLIP. */
export const DEFAULT_FLIP_MODEL_KEY = "llama-3.3-70b";

let current: string = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && metaModelByKey(saved)?.apiId ? saved : DEFAULT_FLIP_MODEL_KEY;
  } catch {
    return DEFAULT_FLIP_MODEL_KEY;
  }
})();

const listeners = new Set<(key: string) => void>();

export const getFlipModelKey = () => current;

/**
 * The guest's explicit pick, or null when they never flipped — so the
 * model router (not the default) decides those requests.
 */
export function getFlipModelPick(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && metaModelByKey(saved)?.apiId ? saved : null;
  } catch {
    return null;
  }
}

export const getFlipModel = (): MetaModel => metaModelByKey(current) ?? META_MODELS[3];

export function setFlipModelKey(next: string) {
  if (!metaModelByKey(next)?.apiId || next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((l) => l(current));
}

export function subscribeFlipModel(listener: (key: string) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
