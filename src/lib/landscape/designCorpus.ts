/**
 * The accepted-design corpus — Training Plan, Phase 5 (+ Phase 6 feed).
 *
 * Every Genius-composed design that lands on a customer's board is stored
 * here (their browser, their data — the Studio is local-first throughout).
 * New compositions retrieve the most similar past designs and prefer
 * THEIR species when the brief's law leaves a choice: the house style is
 * learned from approved work instead of being reinvented per request.
 *
 * exportCorpusJSONL is the Phase 6 bridge: brief → accepted layout pairs,
 * the exact shape a fine-tuning run on the self-hosted model consumes.
 * Training itself waits for the VM and a corpus worth learning from.
 */
import type { LandscapeLayout } from "./landscapeEstimate";

export interface CorpusEntry {
  id: string;
  ts: number;
  style: string | null;
  tier?: string;
  maintenance?: string;
  privacy?: boolean;
  waterfront?: boolean;
  /** Yard frame the design was composed in, feet. */
  frameW: number;
  frameH: number;
  plantCount: number;
  total: number;
  /** Species ids by quantity, most-used first — the design's fingerprint. */
  speciesTop: string[];
  layout: LandscapeLayout;
  inspectionScore?: number;
}

const KEY = "design_studio_corpus_v1";
const CAP = 25;

interface Store { get: (k: string) => string | null; set: (k: string, v: string) => void }
const mem = new Map<string, string>();
const memoryStore: Store = { get: (k) => mem.get(k) ?? null, set: (k, v) => { mem.set(k, v); } };
export const corpusStore: Store =
  typeof localStorage !== "undefined"
    ? { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* full/blocked — the design still ships */ } } }
    : memoryStore;

export function loadCorpus(store: Store = corpusStore): CorpusEntry[] {
  try {
    const raw = store.get(KEY);
    const parsed = raw ? (JSON.parse(raw) as CorpusEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function recordDesign(entry: CorpusEntry, store: Store = corpusStore): void {
  const all = loadCorpus(store);
  all.unshift(entry);
  store.set(KEY, JSON.stringify(all.slice(0, CAP)));
}

export interface CorpusQuery { style?: string | null; frameW?: number; frameH?: number }

/** Most similar accepted designs: same style first, then closest yard shape. */
export function similarDesigns(q: CorpusQuery, store: Store = corpusStore, limit = 3): CorpusEntry[] {
  const score = (e: CorpusEntry): number => {
    let s = 0;
    if (q.style && e.style === q.style) s += 10;
    if (q.frameW && q.frameH && e.frameW && e.frameH) {
      const a = q.frameW / q.frameH, b = e.frameW / e.frameH;
      s += Math.max(0, 6 - Math.abs(a - b) * 8);
      s += Math.max(0, 4 - Math.abs(q.frameW - e.frameW) / 12);
    }
    if (e.inspectionScore) s += e.inspectionScore / 50;
    return s;
  };
  return loadCorpus(store).map((e) => ({ e, s: score(e) })).filter((x) => x.s > 4).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.e);
}

/** Species the customer's approved designs keep using — composition prefers them. */
export function preferredSpecies(q: CorpusQuery, store: Store = corpusStore): Set<string> {
  const out = new Set<string>();
  for (const e of similarDesigns(q, store)) for (const id of e.speciesTop) out.add(id);
  return out;
}

/** Phase 6 dataset: one JSON object per line — brief in, accepted design out. */
export function exportCorpusJSONL(store: Store = corpusStore): string {
  return loadCorpus(store).map((e) => JSON.stringify({
    brief: { style: e.style, tier: e.tier ?? "signature", maintenance: e.maintenance ?? "standard", privacy: !!e.privacy, waterfront: !!e.waterfront },
    frameFt: { w: e.frameW, h: e.frameH },
    result: {
      plantCount: e.plantCount,
      total: Math.round(e.total),
      species: e.layout.plantings.reduce<Record<string, number>>((acc, p) => { acc[p.plantId] = (acc[p.plantId] ?? 0) + 1; return acc; }, {}),
      beds: e.layout.beds.map((b) => ({ fill: b.fill, points: b.points.length, closed: b.closed })),
      inspectionScore: e.inspectionScore ?? null,
    },
  })).join("\n");
}
