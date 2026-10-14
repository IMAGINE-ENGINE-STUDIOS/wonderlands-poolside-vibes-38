/**
 * Suite routes — one place mapping every home-page discipline to its suite page.
 * Dedicated suites (saunas, spas, tanning ledges, enclosures/lanai/fencing) keep
 * their own pages; every other discipline opens the generic /suites/:category
 * page (CategorySuite), which carries the same model picker, drawing board and quote.
 */
export const DEDICATED_SUITES: Record<string, string> = {
  saunas: "/suites/saunas",
  spas: "/suites/spas",
  "pools-and-spas": "/suites/pools-and-spas",
  "tanning-ledges": "/suites/tanning-ledges",
  "screen-enclosures": "/suites/enclosures",
  lanai: "/suites/lanai",
  "patio-fencing": "/suites/fencing",
};

export const suiteRoute = (categoryId: string) => DEDICATED_SUITES[categoryId] ?? `/suites/${categoryId}`;

/** Every discipline's drawing board, offered inside every suite. */
export const ALL_BOARDS: Array<{ id: string; label: string }> = [
  { id: "concrete-pools", label: "Concrete Pools" },
  { id: "solar", label: "Solar" },
  { id: "pools", label: "Fiberglass Pools" },
  { id: "saunas", label: "Saunas" },
  { id: "spas", label: "Spas" },
  { id: "tanning-ledges", label: "Tanning Ledges" },
  { id: "screen-enclosures", label: "Screen Enclosures" },
  { id: "patio-fencing", label: "Patio Fencing" },
  { id: "lanai", label: "Lanai" },
  { id: "pavers", label: "Pavers" },
  { id: "artificial-grass", label: "Artificial Grass" },
  { id: "landscaping", label: "Landscaping" },
  { id: "covers", label: "Covers" },
  { id: "driveway-gates", label: "Driveway Gates" },
  { id: "finishes", label: "Finishes" },
  { id: "liners", label: "Liners" },
];
