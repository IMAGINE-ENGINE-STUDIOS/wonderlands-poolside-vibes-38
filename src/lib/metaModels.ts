/**
 * Meta model catalog for FLIP's Genius (browser copy).
 * Imagine Engine Studios Corp.
 *
 * SELF-HOSTED (founder direction 2026-10-18: no OpenRouter, no Groq).
 * `apiId` is the id on the founder's own model server (Ollama/vLLM —
 * see infra/model-server/); null means the server does not serve it.
 * Muse Spark Open is the hosted-only exception: at 816B parameters it
 * cannot be self-hosted, so it is listed for honesty and the
 * self-hosted Llama chain answers in its place.
 *
 * Keep in sync with supabase/functions/_shared/metaModels.ts.
 */

export interface MetaModel {
  key: string;
  label: string;
  family: "Muse Spark" | "Llama 4" | "Llama 3" | "Code Llama";
  /** Id on the self-hosted model server, or null when the endpoint does not serve it. */
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
    apiId: null,
    ollamaTag: null,
    blurb:
      "Meta's newest open model (released October 2026): 816B MoE with 42B active parameters, natively multimodal, purpose-built for coding and end-to-end agentic workflows. HOSTED-ONLY exception: the weights need roughly a terabyte of memory, so no self-hosted run exists — the self-hosted Llama chain answers in its place.",
    multimodal: true,
  },
  {
    key: "llama-4-maverick",
    label: "Llama 4 Maverick",
    family: "Llama 4",
    apiId: "llama4:maverick",
    ollamaTag: "llama4:maverick",
    blurb:
      "The Llama 4 flagship: 17B active parameters across 128 experts, natively multimodal, the strongest self-hosted Llama for reasoning and code. Needs datacenter-class GPUs on the model server.",
    multimodal: true,
  },
  {
    key: "llama-4-scout",
    label: "Llama 4 Scout",
    family: "Llama 4",
    apiId: "llama4:scout",
    ollamaTag: "llama4:scout",
    blurb:
      "Llama 4's efficiency model: 17B active parameters across 16 experts, natively multimodal, very long context. Self-hosted on a large GPU server.",
    multimodal: true,
  },
  {
    key: "llama-3.3-70b",
    label: "Llama 3.3 70B",
    family: "Llama 3",
    apiId: "llama3.3:70b",
    ollamaTag: "llama3.3:70b",
    blurb:
      "The Meta workhorse, self-hosted via Ollama (llama3.3:70b, ~43 GB) on server-grade hardware.",
  },
  {
    key: "llama-3.1-8b",
    label: "Llama 3.1 8B",
    family: "Llama 3",
    apiId: "llama3.1:8b",
    ollamaTag: "llama3.1:8b",
    blurb:
      "Small and fast — the one Llama that fits a consumer RTX (llama3.1:8b, 4.9 GB) on your own machine.",
  },
  {
    key: "codellama-70b",
    label: "Code Llama 70B",
    family: "Code Llama",
    apiId: "codellama:70b",
    ollamaTag: "codellama:70b",
    blurb: "Meta's code-specialized family at its largest size. Self-hosted via Ollama.",
  },
  {
    key: "codellama-34b",
    label: "Code Llama 34B",
    family: "Code Llama",
    apiId: "codellama:34b",
    ollamaTag: "codellama:34b",
    blurb: "Code-specialized, mid-size. Self-hosted via Ollama.",
  },
  {
    key: "codellama-13b",
    label: "Code Llama 13B",
    family: "Code Llama",
    apiId: "codellama:13b",
    ollamaTag: "codellama:13b",
    blurb: "Code-specialized, fits a high-end consumer GPU. Self-hosted via Ollama.",
  },
  {
    key: "codellama-7b",
    label: "Code Llama 7B",
    family: "Code Llama",
    apiId: "codellama:7b",
    ollamaTag: "codellama:7b",
    blurb: "Code-specialized, smallest size — runs on a consumer RTX via Ollama.",
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
