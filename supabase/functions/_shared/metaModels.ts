/**
 * Meta model catalog for Genius / FLIP. Imagine Engine Studios Corp.
 *
 * Served by Groq (founder direction 2026-10-18: "use the groq then") —
 * the same pattern as Startup Factory Hub: the Supabase functions are
 * the doorway, the GROQ_API_KEY secret is the founder's, Groq's LPUs
 * run Meta's open models. `apiId` is the Groq model id; null means
 * Groq does not serve it (Code Llama — self-hosted via Ollama only,
 * see infra/model-server/). Muse Spark Open is a limited preview on
 * Groq; when it is unavailable the metaChat chain advances past it.
 *
 * Keep in sync with src/lib/metaModels.ts (the browser copy).
 */

export interface MetaModel {
  key: string;
  label: string;
  family: "Muse Spark" | "Llama 4" | "Llama 3" | "Code Llama";
  /** Groq model id, or null when Groq does not serve it. */
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
    apiId: "meta-models/muse-spark-open",
    ollamaTag: null,
    blurb:
      "Meta's newest open model (released October 2026): 816B MoE with 42B active parameters, natively multimodal, purpose-built for coding and end-to-end agentic workflows. Served by Groq as a limited preview — at roughly a terabyte of weights it has no self-hosted run; if the preview is unavailable, the Llama chain answers.",
    multimodal: true,
  },
  {
    key: "llama-4-maverick",
    label: "Llama 4 Maverick",
    family: "Llama 4",
    apiId: "meta-llama/llama-4-maverick-17b-128e-instruct",
    ollamaTag: "llama4:maverick",
    blurb:
      "The Llama 4 flagship: 17B active parameters across 128 experts, natively multimodal, the strongest Llama for reasoning and code — served on Groq.",
    multimodal: true,
  },
  {
    key: "llama-4-scout",
    label: "Llama 4 Scout",
    family: "Llama 4",
    apiId: "meta-llama/llama-4-scout-17b-16e-instruct",
    ollamaTag: "llama4:scout",
    blurb:
      "Llama 4's efficiency model: 17B active parameters across 16 experts, natively multimodal, very long context — served on Groq.",
    multimodal: true,
  },
  {
    key: "llama-3.3-70b",
    label: "Llama 3.3 70B",
    family: "Llama 3",
    apiId: "llama-3.3-70b-versatile",
    ollamaTag: "llama3.3:70b",
    blurb:
      "The Meta workhorse on Groq. Also self-hostable via Ollama (llama3.3:70b, ~43 GB) on server-grade hardware.",
  },
  {
    key: "llama-3.1-8b",
    label: "Llama 3.1 8B",
    family: "Llama 3",
    apiId: "llama-3.1-8b-instant",
    ollamaTag: "llama3.1:8b",
    blurb:
      "Small and fast on Groq — and the one Llama that fits a consumer RTX locally via Ollama (llama3.1:8b, 4.9 GB).",
  },
  {
    key: "codellama-70b",
    label: "Code Llama 70B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:70b",
    blurb: "Meta's code-specialized family at its largest size. Self-hosted via Ollama only — Groq does not serve Code Llama.",
  },
  {
    key: "codellama-34b",
    label: "Code Llama 34B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:34b",
    blurb: "Code-specialized, mid-size. Self-hosted via Ollama only — Groq does not serve Code Llama.",
  },
  {
    key: "codellama-13b",
    label: "Code Llama 13B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:13b",
    blurb: "Code-specialized, fits a high-end consumer GPU. Self-hosted via Ollama only — Groq does not serve Code Llama.",
  },
  {
    key: "codellama-7b",
    label: "Code Llama 7B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:7b",
    blurb: "Code-specialized, smallest size — runs on a consumer RTX via Ollama.",
  },
];

export const metaModelByKey = (key?: string | null): MetaModel | null =>
  META_MODELS.find((m) => m.key === key) ?? null;

/** The self-hosted serve id for a catalog key, or null when the endpoint does not serve it. */
export const apiIdForModelKey = (key?: string | null): string | null =>
  metaModelByKey(key)?.apiId ?? null;
