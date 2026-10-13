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
  /** Frame family — decides the frame chrome so each solution looks distinct. */
  family?: ShowroomFamily;
  /** Editorial copy shared with /tools (eyebrow, headline, capabilities, launch route). */
  eyebrow?: string;
  headline?: string;
  capabilities?: string[];
  route?: string;
  cta?: string;
}

export type ShowroomFamily = 'cad' | 'magazine' | 'console' | 'desk' | 'terminal' | 'commerce' | 'catalog' | 'dashboard';

const w = (
  id: string,
  index: string,
  title: string,
  tag: string,
  description: string,
  keywords: string[],
): ShowroomWidget => ({ id, index, title, tag, description, keywords });

const FLAGSHIP: ShowroomWidget[] = [
  w('design-studio', 'S1', 'Design Studio — 2D & 3D', 'CAD engine',
    'A dual-view design engine: a real-time 3D scene and a plan-view board bound to the same geometry at 10 px per foot. Draw or edit the shell outline and the depth profile rebuilds from linear anchors, with coping, waterline tile, deck elevation and walls generated automatically. Switch 2D ↔ 3D at any time; the scene is remembered.',
    ['design studio', '3d', '2d', 'pool designer', 'draw a pool', '3d pool', 'designer']),
  w('flip-v8', 'S2', 'FLIP V8 — The Calm Edition', 'Publishing',
    'The current FLIP magazine shipped on the home page: every category as a book, model dossiers, live tool widgets, cart and estimate — turned page by page with calm arrow-only reading.',
    ['flip', 'flip v8', 'magazine', 'book', 'catalog book', 'edition']),
  w('flip-builder', 'S3', 'Flip Builder V3', 'Publishing',
    'The current builder, same as in SOCIALITE: 50 fonts, kindle mode, colour wheel, reader controls (arrows, curl, page counter, share, study), shopping blocks, minibooks and jump links, category import and one-click publishing.',
    ['flip builder', 'builder', 'make a book', 'create a flip', 'flip it']),
  w('socialite', 'S4', 'SOCIALITE', 'Growth platform',
    'The marketing and communications platform: publish to Facebook, Instagram, Threads, X and YouTube, schedule email, SMS, WhatsApp and calls, run campaigns, quotes and invoices, live insights, Genius knowledge and Shield safe-sending rules.',
    ['socialite', 'social media', 'marketing', 'campaign', 'post', 'schedule posts', 'email campaign']),
  w('solar', 'S5', 'Total Solar Calculator', 'Estimating engine',
    'A solar instrument built on measured roofs rather than averages. Search an address, capture roof planes from high-resolution aerial imagery, and each face is scored for sun exposure from azimuth, pitch, latitude and shade.',
    ['solar', 'solar panels', 'roof', 'solar calculator']),
  w('global-board', 'S6', 'Global Design Board', 'Platform',
    'The one-stop board for an entire project. Site, pool, deck, spa, enclosure, fence, turf, planting and solar each bring their own splines, options and features, priced exactly as in the Studio and the FLIP book.',
    ['global board', 'whole property', 'all trades', 'planting', 'landscape plan']),
  w('wonderlands-studio', 'S7', 'Configuration Studio', 'Platform',
    'The full configuration platform that hosts the other modules: category navigation, product catalogue, option engine, unit-priced trades and a single running total across the whole build.',
    ['wonderlands studio', 'configuration studio', 'studio', 'configure everything']),
];

const BUILDER_AND_DASHBOARDS: ShowroomWidget[] = [
  w('website-builder', 'S8', 'Website Builder V2', 'Web platform',
    'The company website builder: start from the Wonderlands template, edit every text, image, product card and colour, add pages, link anything to any page, then publish to your own address.',
    ['website builder', 'web builder', 'site builder', 'my website', 'build a website']),
  w('dash-command', 'D1', 'Command Center', 'Dashboard',
    'The Wonderlands executive dashboard: today, pipeline, projects, finance, data room and the technology hub — shown here in safe preview mode.',
    ['command center', 'admin', 'admin dashboard']),
  w('dash-workspace', 'D2', 'Company & Contractor Workspace', 'Dashboard',
    'Every licensed company gets this workspace: CRM pipeline, accounts, website builder, clients, quotes, bids, projects, payouts and messages.',
    ['workspace', 'contractor dashboard', 'company dashboard', 'crm']),
  w('dash-account', 'D3', 'Customer Account', 'Dashboard',
    'The homeowner account: projects, quotes, invoices and documents in one place.',
    ['customer account', 'my account', 'homeowner']),
  w('dash-salesrep', 'D4', 'Sales Rep Dashboard', 'Dashboard',
    'The sales team dashboard: assigned leads, pipeline stages and quote tools.',
    ['sales rep', 'sales dashboard', 'sales team']),
];

const BASE_WIDGETS: ShowroomWidget[] = [
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

/* Editorial copy and frame family — mirrors the /tools descriptions. */
type Detail = Pick<ShowroomWidget, 'family' | 'eyebrow' | 'headline' | 'capabilities' | 'route' | 'cta'>;
const DETAILS: Record<string, Detail> = {
  'design-studio': { family: 'cad', eyebrow: 'Real-time WebGL. True scale.', headline: 'Walk the water before it exists.', route: '/design-studio', cta: 'Open the Designer',
    capabilities: ['Bidirectional 2D ↔ 3D geometry sync with scene memory', 'Linear depth anchors with auto wall generation', 'Coping, waterline and deck at 1 ft UV texture scale', 'Snap-to-wall lighting with gradient presets', 'Live cost model per shell, deck and feature'] },
  'flip-v8': { family: 'magazine', eyebrow: 'The book, read calmly.', headline: 'Every category, one edition.', route: '/', cta: 'Open on the home page',
    capabilities: ['Arrow-only page turning, keyboard friendly', 'Category editions and model dossiers', 'Live tool widgets inside the pages', 'Cart, estimate and quote from any page', 'Genius narrator on every leaf'] },
  'flip-builder': { family: 'magazine', eyebrow: 'Compose. Publish. Sell.', headline: 'Your own edition, page by page.', route: '/flip', cta: 'Open Flip Builder V3',
    capabilities: ['50 fonts, colour wheel and kindle mode', 'Reader controls: arrows, curl, counter, share, study', 'Shopping blocks, minibooks and page-jump links', 'Category import from the catalogue', 'One-click publishing to /flip/:slug'] },
  socialite: { family: 'console', eyebrow: 'Publish. Message. Grow.', headline: 'Every channel, one console.', route: '/socialite', cta: 'Open SOCIALITE',
    capabilities: ['Posts to Facebook, Instagram, Threads, X and YouTube', 'Timed email, SMS, WhatsApp and calls', 'Campaign Console with flip-book emails', 'Live insights from your own accounts', 'Shield safe-sending rules and Genius knowledge'] },
  solar: { family: 'terminal', eyebrow: 'Aerial roof capture. Real yield.', headline: 'Only the panels the roof can hold.', route: '/solar-board', cta: 'Open the Solar Board',
    capabilities: ['Address search over high-resolution aerial tiles', 'Roof plane capture with editable outlines', 'Per-face exposure from azimuth, pitch and shade', 'Astronomical sun path and yearly simulation', 'Electricity tariffs and contractor bill of materials'] },
  'global-board': { family: 'cad', eyebrow: 'Every trade. One take-off.', headline: 'The whole property, priced as it is drawn.', route: '/global-design-board', cta: 'Open the Global Board',
    capabilities: ['All trade layers on one canvas', 'Studio-identical imagery, options and pricing', 'Automatic overlap cropping between trades', 'Project-wide dossier with payment schedule', 'One-click load into the blueprint plan set'] },
  'wonderlands-studio': { family: 'commerce', eyebrow: 'The master instrument.', headline: 'Every category, one running total.', route: '/wonderlands-studio', cta: 'Enter the Studio',
    capabilities: ['Fourteen product categories in one surface', 'Unit-priced trades alongside catalogue products', 'Real-time autosave and viewport restoration', 'Single running total across the whole build', 'Handoff into the quote and document engines'] },
  search: { family: 'catalog', eyebrow: 'The whole catalog, one field.', headline: 'Find it by name, or by number.', route: '/', cta: 'Search the Catalog',
    capabilities: ['Single index across products, trades and specifications', 'Filter chips with category-scoped routing', 'Inline results with direct deep links', 'Full and slim presentation variants'] },
  'flip-search': { family: 'magazine' },
  cart: { family: 'commerce' },
  features: { family: 'commerce', eyebrow: 'Category-aware options.', headline: 'Pools and saunas ask different questions.', route: '/wonderlands-studio', cta: 'Configure a Product',
    capabilities: ['Declarative feature configs per product type', 'Carousels, toggles and counters generated automatically', 'Business rules and restrictions enforced centrally', 'Selections priced into the running total'] },
  media: { family: 'catalog' },
  'pool-calc': { family: 'terminal', eyebrow: 'Volume. Heat. Area.', headline: 'The numbers behind the water.', route: '/pool-calculator', cta: 'Run the Numbers',
    capabilities: ['Volume and turnover by shape and depth profile', 'Heater sizing by temperature rise and surface area', 'Inline square-foot and linear-foot estimators', 'Results write back into the active configuration'] },
  'heater-calc': { family: 'terminal' },
  'inline-calc': { family: 'terminal' },
  'flip-calculators': { family: 'terminal' },
  'site-planner': { family: 'cad', eyebrow: 'Plan view. Survey accurate.', headline: 'One continuous line, drawn to scale.', route: '/blueprint-builder', cta: 'Open the Board',
    capabilities: ['Layered site polygons with per-layer styling', 'Vertex-level editing and dimension callouts', 'Automatic area and impervious-coverage totals', 'Exports geometry to the plan set and the designer'] },
  fence: { family: 'cad', eyebrow: 'Barrier logic, built in.', headline: 'Every run, every gate, measured.', route: '/studio-showroom#fence', cta: 'Design a Fence',
    capabilities: ['Segment-level gate flagging with hardware rules', 'Automatic linear footage, panel and post takeoff', 'Height and style pricing by barrier compliance', 'Separate material and installation lines'] },
  enclosure: { family: 'cad', eyebrow: 'Structure, priced as you draw.', headline: 'Draw the footprint, price the structure.', route: '/studio-showroom#enclosure', cta: 'Configure an Enclosure',
    capabilities: ['Vertex drawing with house-attached wall segments', 'Fixed-size door bays', 'Fabric, gauge, roof style and wind-load options', 'Customer turnkey price and contractor cost view'] },
  grass: { family: 'cad', eyebrow: 'Any silhouette. Any size.', headline: 'Turf, drawn free-hand.', route: '/wonderlands-studio', cta: 'Open the Grass Board',
    capabilities: ['Polygon and spline areas with per-area takeoff', 'Multi-region drawing with independent products', 'Live retail pricing per square foot', 'Infill, base and labour broken out'] },
  blueprint: { family: 'desk', eyebrow: 'Permit ready. Print ready.', headline: 'The whole plan set, editable in place.', route: '/blueprint-builder', cta: 'Open Blueprint Builder',
    capabilities: ['Inline editing of every information block', 'PDF / JPG / PNG underlay with scale calibration', 'DXF and SVG vector import with layer mapping', 'Multi-sheet templates with true-scale print output'] },
  signature: { family: 'desk', eyebrow: 'Florida statutory signature.', headline: 'Signed, sealed, and verifiable.', route: '/blueprint-builder', cta: 'Open the Signature Tool',
    capabilities: ['Draw, type or upload — one normalised output', 'Transparent PNG suitable for sheet embedding', 'SHA-256 authentication code over the document', 'Engineer, contractor and owner signature blocks'] },
  depth: { family: 'cad' },
  'scene-objects': { family: 'cad' },
  financing: { family: 'commerce' },
  quote: { family: 'desk', eyebrow: 'Intake to signed proposal.', headline: 'One survey becomes the document.', route: '/quote', cta: 'Build a Proposal',
    capabilities: ['Guided intake with required contact capture', 'Itemised component and feature summation', 'Passcode-gated text and price overrides', 'Downloadable PDF, invoice and email handoff'] },
  turnkey: { family: 'desk' },
  'sauna-card': { family: 'catalog' },
  'sauna-pricing': { family: 'commerce' },
  'website-builder': { family: 'cad', eyebrow: 'Design. Publish. Launch.', headline: 'Your whole website, edited in place.',
    capabilities: ['Wonderlands template as the starting point', 'Multipage with links to any page or element', 'Text, image, product card and colour controls', 'Desktop, tablet and mobile views', 'Publish and connect your own domain'] },
  'dash-command': { family: 'dashboard' },
  'dash-workspace': { family: 'dashboard' },
  'dash-account': { family: 'dashboard' },
  'dash-salesrep': { family: 'dashboard' },
};

/* Showroom order: most powerful solutions first, atomic widgets after, dashboards last. */
const ORDER = [
  'design-studio', 'website-builder', 'global-board', 'wonderlands-studio', 'flip-builder', 'flip-v8', 'socialite', 'solar',
  'site-planner', 'enclosure', 'fence', 'grass', 'depth', 'scene-objects',
  'quote', 'blueprint', 'signature', 'turnkey', 'sauna-pricing', 'flip-calculators', 'pool-calc', 'heater-calc', 'inline-calc',
  'features', 'cart', 'financing', 'search', 'flip-search', 'media', 'sauna-card',
  'home-sections', 'browse-categories', 'mission', 'section-banner', 'hero', 'site-header', 'site-footer',
  'dash-command', 'dash-workspace', 'dash-account', 'dash-salesrep',
];

const ALL = [...FLAGSHIP, ...BUILDER_AND_DASHBOARDS, ...BASE_WIDGETS];
export const SHOWROOM_WIDGETS: ShowroomWidget[] = ORDER.map((id) => ALL.find((x) => x.id === id)!)
  .filter(Boolean)
  .map((x, i) => ({
    family: 'catalog' as ShowroomFamily,
    ...x,
    ...DETAILS[x.id],
    index: String(i + 1).padStart(2, '0'),
  }));

export const SHOWROOM_FAMILY_LABEL: Record<ShowroomFamily, string> = {
  cad: 'Design & drawing',
  magazine: 'FLIP publishing',
  console: 'SOCIALITE',
  desk: 'Documents & permits',
  terminal: 'Estimating',
  commerce: 'Commerce',
  catalog: 'Catalog & home page',
  dashboard: 'Dashboards',
};

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
