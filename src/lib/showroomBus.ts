/**
 * Studio Showroom registry and control bus.
 *
 * The showroom lists every live Wonderlands widget. This module is the single
 * source of truth for that list, and it exposes a tiny bus the page registers
 * so Genius can operate the showroom exactly like a guest would: jump to a
 * widget, open the quote tool, run a search, switch the catalog section.
 *
 * Nothing here calls a paid service.
 */

export interface ShowroomWidget {
  id: string;
  index: string;
  title: string;
  /** Discipline chip shown on the frame */
  tag: string;
  description: string;
  /** Plain words a guest may use for this widget */
  keywords: string[];
}

const w = (
  id: string,
  index: string,
  title: string,
  tag: string,
  description: string,
  keywords: string[],
): ShowroomWidget => ({ id, index, title, tag, description, keywords });

export const SHOWROOM_WIDGETS: ShowroomWidget[] = [
  w('search', '01', 'Advanced Search', 'Navigation',
    'Catalog-wide search with filters, category routing and inline results. Shown in the full and slim variants used across the site.',
    ['search', 'find', 'look up', 'catalog search', 'filters']),
  w('flip-search', '02', 'FLIP Search Engine', 'Navigation',
    'The in-book search: every result opens as pages of the magazine — a category opens its edition, a model opens its dossier.',
    ['flip search', 'book search', 'magazine search', 'search the book']),
  w('cart', '03', 'Configuration & Cart Widget', 'Commerce',
    'The studio total-price widget: live configuration price, editable shopping list, feature swaps, quote and checkout actions.',
    ['cart', 'selection', 'basket', 'total price', 'shopping list']),
  w('features', '05', 'Dynamic Feature Renderer', 'Configurator',
    'Category-aware option engine. Renders carousels, toggles and counters from the product feature config — pool options and sauna options differ automatically.',
    ['features', 'options', 'add ons', 'extras', 'configure options', 'upgrades']),
  w('media', '06', 'Product Media Gallery', 'Presentation',
    'Product image and video gallery with keyboard-friendly navigation and consistent media framing.',
    ['gallery', 'photos', 'images', 'media', 'video']),
  w('pool-calc', '07', 'Pool Calculator', 'Calculator',
    'Volume, heating and chemical calculator by pool shape and depth profile.',
    ['pool calculator', 'volume', 'gallons', 'chemicals']),
  w('heater-calc', '08', 'Heater Sizing Calculator', 'Calculator',
    'Recommends heater capacity from pool dimensions and target temperature rise, and can push the pick back into a configuration.',
    ['heater', 'heat pump', 'heater size', 'btu', 'temperature']),
  w('inline-calc', '09', 'Inline Quick Calculators', 'Calculator',
    'Lightweight square-foot and linear-foot estimators for pavers, screen, fence and lanai used inside the search experience.',
    ['quick calculator', 'square feet', 'linear feet', 'estimator']),
  w('flip-calculators', '09b', 'FLIP Calculators & Design Boards', 'Calculator',
    'The full FLIP V7 calculator set: pool and site plan, screen enclosure, aluminium fencing, artificial turf and hardscape. Each one prices itself off its drawing and can open its design board as a section or full screen.',
    ['flip calculators', 'calculators', 'design board', 'estimate', 'enclosure calculator', 'fence calculator', 'turf calculator', 'paver calculator']),
  w('site-planner', '10', '2D Site Planner', 'Drawing',
    'The professional 2D studio board: property boundary, residence, paver deck, pool and barriers on a scaled grid, priced live off the drawn geometry, with a hand-off into 3D.',
    ['site plan', '2d', 'draw the pool', 'plan the yard', 'layout', 'deck', 'design my pool', 'drawing board']),
  w('fence', '11', 'Fence Drawing Board & Configurator', 'Drawing',
    'Florida-code aluminum fence tool: draw the run on a 1 ft grid, flag gates, then price height, style and installation.',
    ['fence', 'fencing', 'aluminum fence', 'gate', 'barrier']),
  w('enclosure', '12', 'Screen Enclosure Studio', 'Drawing',
    'Draw the enclosure footprint with doors and house-attached walls, then configure fabric, frame and compliance with customer and contractor pricing views.',
    ['screen enclosure', 'enclosure', 'cage', 'screen', 'lanai cage']),
  w('grass', '13', 'Artificial Grass Studio', 'Drawing',
    'Draw patio and yard turf areas with curves and cut-outs, then price turf, infill, base and installation per area.',
    ['grass', 'turf', 'artificial grass', 'lawn', 'putting green']),
  w('blueprint', '14', 'Blueprint Import & Builder', 'Documents',
    'Bring an existing plan set in — PDF, JPG, DXF or SVG — calibrate it to scale and keep editing it as real site geometry in the blueprint builder.',
    ['blueprint', 'plan set', 'permit', 'import a plan', 'survey', 'dxf', 'autocad', 'pdf plan']),
  w('signature', '15', 'Wonderlands Signature Tool', 'Documents',
    'Draw, type or upload a signature and apply it to a document. Florida statutory electronic signature language with a hashed audit record.',
    ['signature', 'sign', 'e-sign', 'esignature', 'initials']),
  w('depth', '16', 'Depth Profile Editor', 'Configurator',
    'Shape the pool floor: draggable depth anchors, a movable and rotatable depth axis and presets for zero-entry, lagoon, sport and deep-end floors.',
    ['depth', 'depth profile', 'pool floor', 'zero entry', 'lagoon', 'shallow', 'deep end']),
  w('scene-objects', '17', 'Scene Objects Panel', 'Configurator',
    'Every object in the 3D scene, grouped by kind, with search, selection and delete — the inspector of the 3D design studio.',
    ['scene objects', '3d objects', 'layers', 'inspector', 'what is in the scene']),
  w('financing', '18', 'Financing Options', 'Commerce',
    'Monthly payment scenarios by term and rate — used on the checkout page.',
    ['financing', 'monthly payment', 'finance', 'payments', 'loan']),
  w('quote', '19', 'Survey Quote Tool', 'Documents',
    'Guided intake with name and email required, then a printable, itemized quote that includes everything in the cart plus a quote gallery.',
    ['quote', 'quotation', 'estimate', 'proposal', 'price me', 'itemized quote']),
  w('turnkey', '20', 'Turn-key Scope & Project Pipeline', 'Documents',
    'What is standard on every Wonderlands build — permits, engineering, digging, logistics, project management — beside the managed step-by-step pipeline for pools, spas and tanning ledges.',
    ['turn key', 'turnkey', 'whats included', 'included', 'standard', 'pipeline', 'process', 'steps', 'timeline', 'how long']),
  w('sauna-card', '21', 'Sauna Product Card', 'Presentation',
    'The Almost Heaven sauna card with heater, jets, waterline, paver and enclosure options priced like a pool configuration.',
    ['sauna card', 'sauna product', 'almost heaven']),
  w('sauna-pricing', '22', 'Sauna Sales Pricing', 'Internal',
    'Internal turnkey cost breakdown for the sales team. Passcode protected.',
    ['sauna pricing', 'sales pricing', 'cost breakdown']),
  w('site-header', '23', 'Site Header', 'Home page',
    'Main page navigation bar: logo, menu, search entry, cart and account access.',
    ['header', 'navigation bar', 'menu']),
  w('hero', '24', 'Hero', 'Home page',
    'Main page opening statement with the headline, supporting copy and primary calls to action.',
    ['hero', 'headline', 'opening']),
  w('mission', '25', 'Mission, Vision & Values', 'Home page',
    'Editorial trio block presenting the Wonderlands mission, vision and values on the home page.',
    ['mission', 'vision', 'values', 'about us']),
  w('browse-categories', '26', 'Browse Categories (Editorial)', 'Home page',
    'Magazine-style category index used on the main page. Selecting a tile switches the active home section.',
    ['browse categories', 'category index', 'categories']),
  w('section-banner', '27', 'Section Banner', 'Home page',
    'Slim photographic banner that titles each home page section and acts as its scroll anchor.',
    ['banner', 'section banner']),
  w('home-sections', '28', 'Home Catalog Sections', 'Home page',
    'Every product section of the main page — pools, spas, saunas, enclosures, fencing, pavers, grass, landscaping, covers, gates, finishes and liners. Pick one to load it live.',
    ['catalog', 'product sections', 'pools', 'spas', 'saunas', 'pavers', 'landscaping', 'covers', 'gates', 'finishes', 'liners', 'show me products']),
  w('site-footer', '29', 'Site Footer', 'Home page',
    'Main page footer: navigation, contact details, scheduling link and legal information.',
    ['footer', 'contact details']),
];

export const findShowroomWidget = (id: string) => SHOWROOM_WIDGETS.find((s) => s.id === id);

/** Which home catalog sections the showroom can load live. */
export const SHOWROOM_HOME_SECTIONS: { id: string; label: string; keywords: string[] }[] = [
  { id: 'pools', label: 'Pool Catalog', keywords: ['pool', 'pools', 'concrete pool', 'fiberglass pool'] },
  { id: 'gilmer-pools', label: 'Latham / Gilmer Pools', keywords: ['latham', 'gilmer'] },
  { id: 'saunas', label: 'Saunas', keywords: ['sauna', 'saunas', 'almost heaven'] },
  { id: 'spas', label: 'Spa Catalog', keywords: ['spa', 'spas', 'hot tub', 'jacuzzi'] },
  { id: 'gilmer-spas', label: 'Latham / Gilmer Spas', keywords: ['latham spa', 'gilmer spa'] },
  { id: 'tanning-ledges', label: 'Tanning Ledges', keywords: ['tanning ledge', 'sun shelf', 'baja'] },
  { id: 'screen-enclosures', label: 'Screen Enclosures', keywords: ['screen enclosure', 'cage'] },
  { id: 'patio-fencing', label: 'Patio Fencing', keywords: ['fence', 'fencing'] },
  { id: 'lanai', label: 'Lanai', keywords: ['lanai'] },
  { id: 'pavers', label: 'Pavers', keywords: ['paver', 'pavers', 'travertine', 'porcelain', 'coralina'] },
  { id: 'artificial-grass', label: 'Artificial Grass', keywords: ['grass', 'turf'] },
  { id: 'landscaping', label: 'Landscaping', keywords: ['landscaping', 'plants', 'vegetation', 'palms'] },
  { id: 'covers', label: 'Automatic Covers', keywords: ['cover', 'automatic cover', 'safety cover'] },
  { id: 'driveway-gates', label: 'Driveway Gates', keywords: ['gate', 'driveway gate'] },
  { id: 'pool-finishes', label: 'Pool Finishes', keywords: ['finish', 'finishes', 'pebble tec', 'gelcoat'] },
  { id: 'liners', label: 'Liners', keywords: ['liner', 'liners', 'vinyl'] },
];

/* --------------------------------- the bus -------------------------------- */

export interface ShowroomControls {
  /** Scroll a widget into view and flag it as the active frame. Returns false when unknown. */
  focus: (id: string) => boolean;
  /** Open the quote tool, optionally seeded with a product. */
  openQuote: (seed?: { name?: string; price?: number; type?: string }) => void;
  /** Open the passcode-protected sales pricing dialog. */
  openSaunaPricing: () => void;
  /** Load one of the live home catalog sections. */
  setHomeSection: (id: string) => boolean;
  /** Type a query into the showroom search desk and run it. */
  search: (query: string) => void;
  /** Open the signature tool. */
  openSignature: () => void;
  /** Open the depth profile editor. */
  openDepth: () => void;
  /** Open the blueprint import dialog. */
  openBlueprintImport: () => void;
}

type Listener = (controls: ShowroomControls | null) => void;

let controls: ShowroomControls | null = null;
const listeners = new Set<Listener>();

export function registerShowroomControls(next: ShowroomControls) {
  controls = next;
  listeners.forEach((l) => l(controls));
  return () => {
    if (controls === next) {
      controls = null;
      listeners.forEach((l) => l(null));
    }
  };
}

export const getShowroomControls = () => controls;
export const isShowroomActive = () => controls !== null;

export function subscribeShowroom(listener: Listener) {
  listeners.add(listener);
  listener(controls);
  return () => listeners.delete(listener);
}
