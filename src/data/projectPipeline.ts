/**
 * Project pipeline — the ordered steps Wonderlands World runs to deliver a
 * pool, a spa or a tanning ledge turn-key. Used by the FLIP product books and
 * available to any dashboard that tracks a build.
 */

export type PipelineProduct = "pool" | "spa" | "tanning-ledge";

export interface PipelineStep {
  /** 1-based order within the pipeline. */
  step: number;
  title: string;
  detail: string;
  /** Typical working duration, written for a client. */
  duration: string;
  /** Who carries the step. */
  owner: string;
}

export interface ProjectPipeline {
  product: PipelineProduct;
  title: string;
  note: string;
  steps: PipelineStep[];
}

const step = (
  step: number,
  title: string,
  detail: string,
  duration: string,
  owner: string,
): PipelineStep => ({ step, title, detail, duration, owner });

const POOL_PIPELINE: ProjectPipeline = {
  product: "pool",
  title: "Pool project pipeline",
  note: "Fifteen managed steps from your first drawing to the day the water is balanced and handed over.",
  steps: [
    step(1, "Design and selections", "Shell, depth profile, waterline, finish, coping and deck chosen in Wonderlands Studio.", "1–2 weeks", "Design team"),
    step(2, "Proposal and agreement", "Scope, allowances and the payment schedule signed.", "2–3 days", "Sales"),
    step(3, "Site and soil studies", "Survey review, soil and water-table assessment, access study.", "1 week", "Project manager"),
    step(4, "Engineering and architecture", "Sealed structural engineering and architectural review of the plan set.", "1–2 weeks", "Engineer of record"),
    step(5, "Permit drawings and filing", "Construction drawings issued and the permit filed with your jurisdiction.", "2–6 weeks", "Permitting"),
    step(6, "Sourcing and logistics", "Shell, equipment and materials procured, warehoused and scheduled.", "Parallel", "Procurement"),
    step(7, "Layout and excavation", "Pool staked to plan, excavation and spoil removal.", "1–3 days", "Excavation crew"),
    step(8, "Shell set or steel and shotcrete", "Fiberglass shell craned and levelled, or steel, forms and shotcrete for concrete shells.", "1 day – 2 weeks", "Shell crew"),
    step(9, "Plumbing and electrical rough-in", "Returns, skimmers, main drains, bonding and conduit, then rough inspections.", "1 week", "Licensed trades"),
    step(10, "Backfill, grading and deck prep", "Backfill, compaction, drainage and the deck sub-base.", "3–5 days", "Land crew"),
    step(11, "Tile, coping and interior finish", "Waterline tile, coping profile and the selected interior finish applied.", "1–2 weeks", "Finish crew"),
    step(12, "Decking and hardscape", "Pavers or concrete deck installed to the drawn area.", "1 week", "Hardscape crew"),
    step(13, "Equipment set and start-up", "Pump, filtration, heater and automation set, wired and commissioned.", "2–4 days", "Equipment tech"),
    step(14, "Final inspections and screening", "Final county inspection, barrier or screen enclosure completion.", "1 week", "Project manager"),
    step(15, "Water balance and handover", "Fill, chemistry balanced, walkthrough, care schedule and warranty pack.", "1 week", "Service team"),
  ],
};

const SPA_PIPELINE: ProjectPipeline = {
  product: "spa",
  title: "Spa project pipeline",
  note: "A spa runs the same managed scope on a shorter clock — nine steps to hot water.",
  steps: [
    step(1, "Design and selections", "Shell, jet count, finish, coping and surround selected in Wonderlands Studio.", "3–5 days", "Design team"),
    step(2, "Proposal and agreement", "Scope and payment schedule signed.", "1–2 days", "Sales"),
    step(3, "Site study and access plan", "Pad location, setbacks, drainage and craning or transport route.", "3 days", "Project manager"),
    step(4, "Engineering and permit", "Electrical and structural review, drawings filed with your jurisdiction.", "1–4 weeks", "Permitting"),
    step(5, "Base and excavation", "Excavation or a compacted, engineered pad poured to plan.", "1–3 days", "Land crew"),
    step(6, "Set and plumbing", "Spa set and levelled, plumbing and equipment pad connected.", "1–2 days", "Shell crew"),
    step(7, "Electrical and heater", "Bonding, dedicated circuit, heater and controls, rough and final inspection.", "2–4 days", "Licensed trades"),
    step(8, "Surround, coping and finish", "Coping profile, tile and the deck or surround completed.", "3–7 days", "Finish crew"),
    step(9, "Fill, balance and handover", "Start-up, chemistry, jet trim, walkthrough and warranty pack.", "2 days", "Service team"),
  ],
};

const LEDGE_PIPELINE: ProjectPipeline = {
  product: "tanning-ledge",
  title: "Tanning ledge project pipeline",
  note: "Built with the pool it belongs to, or cut into an existing shell — seven steps.",
  steps: [
    step(1, "Design and selections", "Ledge footprint, water depth, finish and umbrella sleeve drawn to scale.", "2–4 days", "Design team"),
    step(2, "Proposal and agreement", "Scope and payment schedule signed.", "1–2 days", "Sales"),
    step(3, "Engineering review", "Structure and hydraulics checked against the pool it joins.", "3–7 days", "Engineer of record"),
    step(4, "Permit revision", "Drawings revised and filed, or added to the pool permit.", "1–3 weeks", "Permitting"),
    step(5, "Excavation and shell work", "Ledge excavated and formed, steel and shotcrete or shell modification.", "2–5 days", "Shell crew"),
    step(6, "Plumbing and finish", "Bubblers, returns, tile, coping profile and interior finish.", "3–7 days", "Finish crew"),
    step(7, "Balance and handover", "Fill, chemistry, bubbler trim, walkthrough and warranty pack.", "1–2 days", "Service team"),
  ],
};

export const PROJECT_PIPELINES: ProjectPipeline[] = [POOL_PIPELINE, SPA_PIPELINE, LEDGE_PIPELINE];

/** Resolve the pipeline for a FLIP/studio category id. */
export const getProjectPipeline = (categoryId: string): ProjectPipeline | null => {
  if (/spa|hot[- ]tub/i.test(categoryId)) return SPA_PIPELINE;
  if (/tanning|ledge/i.test(categoryId)) return LEDGE_PIPELINE;
  if (/pool/i.test(categoryId) || categoryId === "finishes" || categoryId === "liners") return POOL_PIPELINE;
  return null;
};
