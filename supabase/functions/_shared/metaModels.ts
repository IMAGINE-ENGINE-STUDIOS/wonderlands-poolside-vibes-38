/**
 * Meta model catalog for Genius / FLIP. Imagine Engine Studios Corp.
 *
 * One registry for every Meta model FLIP can run. There is no Groq here:
 * hosted models are served through OpenRouter (apiId set) and selectable
 * in the FLIP model flipper; local-only models carry an Ollama tag
 * (apiId null) — shown in the flipper as self-hosted, and the hosted
 * chain in metaChat.ts answers instead, so a local-only pick never
 * breaks Genius for a guest on the hosted site.
 *
 * Keep in sync with src/lib/metaModels.ts (the browser copy).
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
    blurb:
      "Meta's newest open model (released October 2026): 816B MoE with 42B active parameters, natively multimodal, purpose-built for coding and end-to-end agentic workflows. Served hosted — the weights need roughly a terabyte of memory, so there is no consumer-hardware local run.",
    multimodal: true,
  },
  {
    key: "llama-4-maverick",
    label: "Llama 4 Maverick",
    family: "Llama 4",
    apiId: "meta-llama/llama-4-maverick",
    ollamaTag: null,
    blurb:
      "The Llama 4 flagship: 17B active parameters across 128 experts, natively multimodal, the strongest Llama for reasoning and code.",
    multimodal: true,
  },
  {
    key: "llama-4-scout",
    label: "Llama 4 Scout",
    family: "Llama 4",
    apiId: "meta-llama/llama-4-scout",
    ollamaTag: null,
    blurb:
      "Llama 4's efficiency model: 17B active parameters across 16 experts, natively multimodal, built for very long context at low cost.",
    multimodal: true,
  },
  {
    key: "llama-3.3-70b",
    label: "Llama 3.3 70B",
    family: "Llama 3",
    apiId: "meta-llama/llama-3.3-70b-instruct",
    ollamaTag: "llama3.3:70b",
    blurb:
      "The Meta workhorse. Also self-hostable via Ollama (llama3.3:70b, ~43 GB) on server-grade hardware.",
  },
  {
    key: "llama-3.1-8b",
    label: "Llama 3.1 8B",
    family: "Llama 3",
    apiId: "meta-llama/llama-3.1-8b-instruct",
    ollamaTag: "llama3.1:8b",
    blurb:
      "Small and fast hosted — and the one Llama that fits a consumer RTX locally via Ollama (llama3.1:8b, 4.9 GB).",
  },
  {
    key: "codellama-70b",
    label: "Code Llama 70B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:70b",
    blurb: "Meta's code-specialized family at its largest size. Self-hosted via Ollama only.",
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
    blurb: "Code-specialized, fits a high-end consumer GPU locally. Self-hosted via Ollama only.",
  },
  {
    key: "codellama-7b",
    label: "Code Llama 7B",
    family: "Code Llama",
    apiId: null,
    ollamaTag: "codellama:7b",
    blurb: "Code-specialized, smallest size — runs locally on a consumer RTX via Ollama. Self-hosted only.",
  },
];

export const metaModelByKey = (key?: string | null): MetaModel | null =>
  META_MODELS.find((m) => m.key === key) ?? null;

/** The hosted (OpenRouter) model id for a catalog key, or null when the model is local-only / unknown. */
export const apiIdForModelKey = (key?: string | null): string | null =>
  metaModelByKey(key)?.apiId ?? null;
