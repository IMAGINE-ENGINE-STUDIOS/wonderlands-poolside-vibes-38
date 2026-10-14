/**
 * Genius platform tools — the single registry of every tool and solution
 * Genius can open from the search engine (3D, 2D, solar, quotes, suites…).
 * Matching is local and free; products are handled by the product index.
 * © Imagine Engine Studios Corp — Wonderlands World.
 */
export interface PlatformTool {
  id: string;
  label: string;
  description: string;
  route: string;
  keywords: string[];
}

export const PLATFORM_TOOLS: PlatformTool[] = [
  { id: 'studio-3d', label: '3D Pool Studio', description: 'Design your pool and backyard in 3D', route: '/studio-3d', keywords: ['3d', 'three d', 'render', 'visualize', 'studio', 'design pool'] },
  { id: 'design-studio', label: '2D Design Studio', description: 'Draw your pool shape to scale', route: '/design-studio', keywords: ['2d', 'draw', 'drawing', 'sketch', 'shape', 'designer'] },
  { id: 'global-board', label: 'Global Design Board', description: 'Pools, decks, turf, fences and screens on one board', route: '/global-design-board-v2', keywords: ['board', 'backyard', 'layout', 'plan', 'site plan', 'whole yard'] },
  { id: 'showroom', label: 'Studio Showroom', description: 'Every tool in one showroom', route: '/studio-showroom', keywords: ['showroom', 'tools', 'widgets'] },
  { id: 'solar-genius', label: 'Solar Genius', description: 'Size solar and lower your energy bill', route: '/solar-genius', keywords: ['solar', 'energy', 'bill', 'panels', 'electricity', 'battery', 'power'] },
  { id: 'landscaping', label: 'Landscaping Studio', description: 'Plan plants and garden beds around your pool', route: '/landscaping', keywords: ['landscape', 'landscaping', 'plants', 'garden', 'trees', 'palm', 'yard makeover'] },
  { id: 'pool-spa-suites', label: 'Pool & Spa Suites', description: 'Browse every pool and spa collection', route: '/suites/pools-and-spas', keywords: ['suite', 'collection', 'catalog', 'browse pools', 'browse spas'] },
  { id: 'sauna-suite', label: 'Sauna Suite', description: 'Almost Heaven saunas and options', route: '/suites/saunas', keywords: ['sauna', 'steam', 'heat'] },
  { id: 'enclosure-suite', label: 'Screen Enclosure Suite', description: 'Pool cages and patio screens', route: '/suites/enclosures', keywords: ['cage', 'screen', 'enclosure', 'lanai'] },
  { id: 'fencing-suite', label: 'Fencing Suite', description: 'Pool-code aluminum fencing', route: '/suites/fencing', keywords: ['fence', 'fencing', 'gate'] },
  { id: 'calculator', label: 'Pool Calculator', description: 'Estimate your full pool project', route: '/pool-calculator', keywords: ['calculator', 'cost', 'estimate', 'how much', 'budget', 'price'] },
  { id: 'quote', label: 'Request a Quote', description: 'Get a detailed written quote', route: '/quote', keywords: ['quote', 'proposal', 'pricing'] },
  { id: 'blueprint', label: 'Blueprint Builder', description: 'Permit-ready plan sets', route: '/blueprint-builder', keywords: ['blueprint', 'permit', 'plans', 'drawing set'] },
  { id: 'flip', label: 'FLIP Catalog Book', description: 'Turn the pages of the full collection', route: '/flip', keywords: ['flip', 'book', 'magazine', 'catalog'] },
  { id: 'consultation', label: 'Book a Consultation', description: 'Meet a Wonderlands designer', route: '/consultation', keywords: ['consult', 'appointment', 'meeting', 'schedule', 'call', 'designer'] },
  { id: 'technology', label: 'Wonderlands Technology', description: 'The platform behind Wonderlands', route: '/technology', keywords: ['technology', 'platform', 'software', 'saas'] },
  { id: 'jobs', label: 'Careers', description: 'Join the Wonderlands team', route: '/jobs', keywords: ['job', 'career', 'work', 'hiring'] },
];

/** Score tools against a query; best first. */
export function matchPlatformTools(query: string, limit = 4): PlatformTool[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  return PLATFORM_TOOLS.map((t) => {
    let s = 0;
    const hay = `${t.label} ${t.description}`.toLowerCase();
    if (hay.includes(q)) s += 5;
    t.keywords.forEach((k) => {
      if (q.includes(k)) s += 4;
      else if (words.some((w) => k.includes(w))) s += 2;
    });
    words.forEach((w) => { if (hay.includes(w)) s += 1; });
    return { t, s };
  })
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.t);
}

/** Rotating hero prompts typed by the typewriter placeholder. */
export const SEARCH_PROMPTS = [
  'Search for a Pool…',
  'Are you craving a Sauna?',
  "Let's help you lower your energy bill with some Solar power!",
  "It's relaxing time — time to jump in the Pool!",
  'Design your backyard in 3D…',
  'Find a Spa for two under the stars…',
  'Plan a tropical garden around your pool…',
  'What is the cheapest pool?',
];
