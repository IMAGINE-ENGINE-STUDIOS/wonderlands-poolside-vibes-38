/**
 * Concierge grounding (P0): per-question catalog retrieval for the genius
 * function. The hard test (2026-10-18) proved the model improvises — even
 * denies — product facts when the whole catalog is pasted as background.
 * So for every guest question we MATCH the catalog rows that answer it and
 * pin them, with rules, at the top of the model's attention.
 */
import { CATALOG_ROWS, type CatalogRow } from "./catalogData.ts";

const money = (n: number) => "$" + n.toLocaleString("en-US");

/** Static rate rows for structure questions (from the Wonderlands knowledge base). */
const RATE_ROWS: { keys: RegExp; lines: string[] }[] = [
  {
    keys: /\b(screen|enclosure|cage|lanai)\b/i,
    lines: [
      "Screen enclosures are priced per square foot of enclosure footprint: Standard $22/sq ft · Deluxe $24/sq ft · Premium $26/sq ft. A lanai runs $60 (Standard) / $80 (Deluxe) / $100 (Premium) per sq ft.",
      "To estimate for a pool: enclosure footprint ≈ (pool width + 8 ft) × (pool length + 8 ft) — a 20 × 40 pool gives about 28 × 48 = 1,344 sq ft, roughly $29,600–$34,900 by tier.",
    ],
  },
  {
    keys: /\b(fence|fencing|barrier)\b/i,
    lines: ["Pool fencing by height: 48 in $45/ft · 54 in $50/ft · 60 in $55/ft · 72 in $65/ft. Walk gates $850, double gates $1,700. Florida pool-barrier minimum is 48 in with a self-closing, self-latching gate."],
  },
  {
    keys: /\b(cover|covers)\b/i,
    lines: ["Automatic pool covers: Atom $25,000 · Eclipse $27,000 · CS3000 $30,000 · Infinity 4000 $32,000."],
  },
  {
    keys: /\b(paver|pavers|decking|deck cost)\b/i,
    lines: ["Coralina pavers run about $25/sq ft installed. Pool shell cost basis is about $250 per sq ft of water surface; landscaping typically $15–20+ per sq ft."],
  },
  {
    keys: /\b(solar|heating|heater|heat pump)\b/i,
    lines: ["Solar pool heating is sized to the pool's surface area; Wonderlands offers solar heating options and heat pumps — exact quotes come from the free consultation because roof orientation and plumbing runs matter."],
  },
];

const CATEGORY_WORDS: { re: RegExp; cat: string }[] = [
  { re: /\b(spa|spas|hot tub|jacuzzi)\b/i, cat: "Spa" },
  { re: /\b(sauna|saunas)\b/i, cat: "Sauna" },
  { re: /\b(tanning ledge|sunning ledge|sun shelf|baja shelf|ledge)\b/i, cat: "Tanning Ledge" },
  { re: /\b(cover|covers)\b/i, cat: "Cover" },
  { re: /\b(driveway gate|gate|gates)\b/i, cat: "Driveway Gate" },
  { re: /\b(pool|pools|piscina|piscinas|swimming)\b/i, cat: "Pool" },
];

const CHEAPEST = /\b(cheapest|least expensive|most affordable|lowest price|budget pick|más barata|mas barata|económica|economica)\b/i;
const LARGEST = /\b(biggest|largest|most expensive|grandest|más grande|mas grande|más cara|mas cara)\b/i;
const DEEPEST = /\b(deepest|deep end|más profunda)\b/i;

function parseDims(text: string): { a: number; b: number } | null {
  const m = text.match(/(\d{1,3}(?:\.\d+)?)\s*(?:ft|feet|')?\s*(?:x|×|by)\s*(\d{1,3}(?:\.\d+)?)/i);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  return a >= 4 && b >= 4 ? { a, b } : null;
}

function parseBudget(text: string): number | null {
  const m = text.match(/(?:under|below|less than|max(?:imum)?|budget(?: of)?|hasta|menos de)\s*\$?\s*(\d{1,3}(?:,\d{3})?|\d+(?:\.\d+)?)\s*(k|grand|mil)?/i)
    ?? text.match(/\$\s*(\d{1,3}(?:,\d{3})?|\d+(?:\.\d+)?)\s*(k|grand|mil)?\s*(?:budget|max|or less)/i);
  if (!m) return null;
  let v = parseFloat(m[1].replace(/,/g, ""));
  if (m[2] || (v > 0 && v < 1000 && /\bk\b/i.test(text))) v *= 1000;
  return v >= 5000 ? v : null;
}

function maxDepthFt(depth: string): number {
  const nums = [...depth.matchAll(/(\d+(?:\.\d+)?)\s*'/g)].map((x) => parseFloat(x[1]));
  return nums.length ? Math.max(...nums) : 0;
}

function fmtRow(r: CatalogRow): string {
  const size = r.w && r.l ? `${r.dims}` : r.dims || "size in listing";
  return `- ${r.n} (${r.c}${r.b ? ", " + r.b : ""}) — ${size} — depth ${r.d} — ${money(r.p)}`;
}

/**
 * Build the pinned grounding block for the guest's latest words, or "" when
 * the question carries no product signal (small talk, navigation, design…).
 */
export function buildGrounding(userText: string): string {
  const text = userText.slice(0, 1200);
  if (text.trim().length < 3) return "";
  const picked = new Map<string, CatalogRow>();
  const notes: string[] = [];
  const add = (r: CatalogRow) => picked.set(r.n + "|" + r.p, r);

  const dims = parseDims(text);
  const budget = parseBudget(text);
  const cats = CATEGORY_WORDS.filter((c) => c.re.test(text)).map((c) => c.cat);
  const poolOnly = cats.length === 0 || cats.includes("Pool");

  /* 1 — a product named outright wins. */
  const lower = text.toLowerCase();
  for (const r of CATALOG_ROWS) {
    if (r.n.length >= 4 && lower.includes(r.n.toLowerCase())) add(r);
  }

  /* 2 — exact dimensions: the size EXISTS if a row matches it. */
  if (dims) {
    const exact = CATALOG_ROWS.filter(
      (r) => (Math.abs(r.w - dims.a) < 0.6 && Math.abs(r.l - dims.b) < 0.6) || (Math.abs(r.w - dims.b) < 0.6 && Math.abs(r.l - dims.a) < 0.6),
    );
    exact.forEach(add);
    if (exact.length) {
      notes.push(`The guest asked about a ${dims.a} × ${dims.b} ft size and the matched product(s) above ARE that size: they exist and are sold by Wonderlands. Quote name, size and price exactly.`);
    } else {
      const target = dims.a * dims.b;
      const nearest = [...CATALOG_ROWS]
        .filter((r) => r.w > 0 && (cats.length === 0 || cats.includes(r.c)))
        .sort((x, y) => Math.abs(x.w * x.l - target) - Math.abs(y.w * y.l - target))
        .slice(0, 3);
      nearest.forEach(add);
      notes.push(`No product is exactly ${dims.a} × ${dims.b} ft; the rows above are the nearest sizes in the catalog. Offer those by name — never invent another size.`);
    }
  }

  /* 3 — superlatives resolve against the real rows. */
  const scope = cats.length ? CATALOG_ROWS.filter((r) => cats.includes(r.c)) : CATALOG_ROWS.filter((r) => r.c === "Pool");
  if (CHEAPEST.test(text) && scope.length) {
    [...scope].sort((a, b) => a.p - b.p).slice(0, 3).forEach(add);
    notes.push("The guest asked for the cheapest option: the first row above is the lowest-priced in its category. Name it and its price.");
  }
  if (LARGEST.test(text) && scope.length) {
    const priced = [...scope].sort((a, b) => b.p - a.p).slice(0, 2);
    const byArea = [...scope].filter((r) => r.w > 0).sort((a, b) => b.w * b.l - a.w * a.l).slice(0, 2);
    [...priced, ...byArea].forEach(add);
    notes.push("The guest asked for the biggest / most premium option: answer from the rows above (largest by water area and highest priced), naming the product and price.");
  }
  if (DEEPEST.test(text) && poolOnly) {
    [...CATALOG_ROWS.filter((r) => r.c === "Pool")].sort((a, b) => maxDepthFt(b.d) - maxDepthFt(a.d)).slice(0, 2).forEach(add);
    notes.push("The guest asked about depth: the rows above include the deepest pools carried; quote their depth figures exactly.");
  }

  /* 4 — a budget narrows to real candidates under it. */
  if (budget) {
    const under = CATALOG_ROWS.filter((r) => r.p <= budget && (cats.length === 0 || cats.includes(r.c)))
      .sort((a, b) => b.p - a.p)
      .slice(0, 5);
    under.forEach(add);
    notes.push(`The guest's budget is ${money(budget)}: the rows above are real options at or under it. Recommend from those; do not claim nothing fits if rows are shown.`);
  }

  /* 4b — a ledge request also pins the ledge products themselves. */
  if (cats.includes("Tanning Ledge")) {
    CATALOG_ROWS.filter((r) => r.c === "Tanning Ledge" && (!budget || r.p <= budget))
      .sort((a, b) => a.p - b.p)
      .slice(0, 3)
      .forEach(add);
  }

  /* 5 — a bare category question gets its best-known anchors. */
  if (!picked.size && cats.length) {
    const inCat = CATALOG_ROWS.filter((r) => cats.includes(r.c));
    [...inCat].sort((a, b) => a.p - b.p).slice(0, 1).forEach(add);
    [...inCat].sort((a, b) => b.w * b.l - a.w * a.l).slice(0, 1).forEach(add);
  }

  /* 6 — rate rows for structures & services. */
  const rateLines: string[] = [];
  for (const rr of RATE_ROWS) if (rr.keys.test(text)) rateLines.push(...rr.lines);

  if (!picked.size && !rateLines.length) return "";

  const lines = [
    "VERIFIED FACTS FOR THIS QUESTION — these rows were matched from the Wonderlands catalog for exactly what the guest asked. Answer product, size and price questions ONLY from these rows and the rates below; they override any general catalog text if the two ever differ.",
    ...[...picked.values()].slice(0, 8).map(fmtRow),
    ...rateLines.map((l) => "- RATE: " + l),
    ...notes.map((n) => "- RULE: " + n),
    "- RULE: A product shown above EXISTS and is sold by Wonderlands — never say it is not offered. Quote its price exactly as shown. Every price includes delivery and installation.",
  ];
  return lines.join("\n");
}
