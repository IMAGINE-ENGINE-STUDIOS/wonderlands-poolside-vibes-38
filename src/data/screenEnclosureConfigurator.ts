/**
 * Screen enclosure (pool cage / screen room) configurator data — Florida oriented.
 *
 * Code references (summarized for professional use):
 * - Florida Building Code, Residential (FBC-R) Section R4501.17 — residential swimming
 *   pool barrier requirements (F.S. Chapter 515) when the cage serves as the barrier.
 * - FBC Building Section 2002 / 2411 — aluminum screen enclosures as open structures.
 * - ASCE 7 wind provisions, Risk Category II, and FBC HVHZ (Miami-Dade / Broward).
 * - AAMA 2603/2604 finish standards on 6005-T5 extruded aluminum.
 */

export interface EnclosureTypeOption {
  id: string;
  label: string;
  /** Multiplier applied to the catalog base $/sq ft rate */
  rateMultiplier: number;
  description: string;
}

export interface EnclosureRoofOption {
  id: string;
  label: string;
  pricePerSqFt: number;
  description: string;
}

export interface EnclosureExtrusionOption {
  id: string;
  label: string;
  /** Nominal member size */
  size: string;
  wallIn: number;
  pricePerSqFt: number;
  maxSpanFt: number;
  description: string;
}

export interface EnclosureScreenOption {
  id: string;
  label: string;
  /** Manufacturer / market brand */
  brand: string;
  mesh: string;
  pricePerSqFt: number;
  /** Manufacturer warranty in years, when published */
  warrantyYears?: number;
  description: string;
}

export interface EnclosureDoorOption {
  id: string;
  label: string;
  widthFt: number;
  price: number;
  /** Can be used as the code-compliant barrier access point */
  barrierEligible: boolean;
  /** Ships with self-closing hinges + self-latching hardware (no add-on kit needed) */
  selfLatching?: boolean;
  description: string;
}


export interface EnclosureAddOnOption {
  id: string;
  label: string;
  pricing: 'each' | 'sqft' | 'linear-ft';
  price: number;
  description: string;
  codeRequired?: boolean;
}

/** Enclosure structure types */
export const ENCLOSURE_TYPES: EnclosureTypeOption[] = [
  { id: 'screen-room', label: 'Screen Room (Flat Pan)', rateMultiplier: 1, description: 'Low-profile flat roof screen room attached to the house fascia.' },
  { id: 'mansard', label: 'Mansard Pool Cage', rateMultiplier: 1.08, description: 'Standard Florida pool cage — angled mansard corners, best water shed.' },
  { id: 'gable', label: 'Gable Pool Cage', rateMultiplier: 1.18, description: 'Peaked ridge for maximum interior height and clear span.' },
  { id: 'super-gable', label: 'Super Gable', rateMultiplier: 1.3, description: 'Extended ridge with heavy beams for very wide spans.' },
  { id: 'two-story', label: '2-Story Enclosure', rateMultiplier: 1.45, description: 'Two-story cage for two-story elevations — engineered columns required.' },
];

export const ENCLOSURE_ROOFS: EnclosureRoofOption[] = [
  { id: 'screen-roof', label: 'Full Screen Roof', pricePerSqFt: 0, description: 'Standard screened roof panels — maximum airflow and light.' },
  { id: 'florida-glass-roof', label: 'Florida Glass Roof Band', pricePerSqFt: 2.5, description: 'Vinyl-laminated privacy panel band along the house line.' },
  { id: 'insulated-pan', label: 'Insulated Roof Pan (partial)', pricePerSqFt: 9, description: 'Foam-core aluminum pan over part of the roof for shade and rain cover.' },
  { id: 'full-pan', label: 'Full Insulated Roof Pan', pricePerSqFt: 16, description: 'Solid insulated roof over the full footprint — becomes a covered lanai structure.' },
];

export const ENCLOSURE_EXTRUSIONS: EnclosureExtrusionOption[] = [
  { id: '2x2-044', label: '2" x 2" — 0.044" wall', size: '2x2', wallIn: 0.044, pricePerSqFt: 0, maxSpanFt: 10, description: 'Builder-grade uprights for short spans and low wind zones.' },
  { id: '2x3-046', label: '2" x 3" — 0.046" wall', size: '2x3', wallIn: 0.046, pricePerSqFt: 1.5, maxSpanFt: 14, description: 'Common upgrade for standard mansard cages.' },
  { id: '2x4-050', label: '2" x 4" — 0.050" wall', size: '2x4', wallIn: 0.05, pricePerSqFt: 3, maxSpanFt: 18, description: 'Heavier uprights and beams for wide openings.' },
  { id: '2x5-055', label: '2" x 5" — 0.055" wall', size: '2x5', wallIn: 0.055, pricePerSqFt: 4.5, maxSpanFt: 22, description: 'Engineered beam section for gable and high-wind builds.' },
  { id: '2x6-070', label: '2" x 6" — 0.070" wall', size: '2x6', wallIn: 0.07, pricePerSqFt: 6.5, maxSpanFt: 28, description: 'HVHZ / 2-story columns and long clear-span beams.' },
];

/** Top-of-market screen fabrics offered by Florida enclosure builders */
export const ENCLOSURE_SCREENS: EnclosureScreenOption[] = [
  { id: 'phifer-1814', label: 'Phifer 18/14 Pool & Patio', brand: 'Phifer', mesh: '18 x 14 fiberglass', pricePerSqFt: 0, warrantyYears: 5, description: 'Industry-standard charcoal fiberglass — best airflow and visibility, lowest cost.' },
  { id: 'phifer-2020', label: 'Phifer No-See-Um 20/20', brand: 'Phifer', mesh: '20 x 20 fiberglass', pricePerSqFt: 1.25, warrantyYears: 5, description: 'Tight weave that blocks sand flies and gnats; slightly reduced airflow.' },
  { id: 'phifer-bettervue', label: 'Phifer BetterVue', brand: 'Phifer', mesh: '18 x 16 micro-fiber', pricePerSqFt: 1.85, warrantyYears: 10, description: 'Finer yarn for noticeably clearer outward view and better airflow than standard mesh.' },
  { id: 'phifer-ultravue2', label: 'Phifer UltraVue2', brand: 'Phifer', mesh: '20 x 21 micro-fiber', pricePerSqFt: 2.45, warrantyYears: 10, description: 'Premium high-clarity insect screen — the clearest view in the Phifer line.' },
  { id: 'superscreen-plus', label: 'Super Screen Plus (Chatham)', brand: 'Chatham / Super Screen', mesh: '17 x 14 vinyl-coated polyester', pricePerSqFt: 2.25, warrantyYears: 10, description: 'Vinyl-coated polyester with a 10-year no-hole warranty — excellent tear resistance.' },
  { id: 'superscreen-deluxe', label: 'Super Screen Deluxe 15-Yr', brand: 'Chatham / Super Screen', mesh: '18 x 14 heavy polyester', pricePerSqFt: 3.1, warrantyYears: 15, description: 'Heaviest Super Screen weave with a 15-year warranty for coastal and high-UV exposures.' },
  { id: 'phifer-tuffscreen', label: 'Phifer TuffScreen / Pet Mesh', brand: 'Phifer', mesh: 'Heavy vinyl-coated polyester', pricePerSqFt: 3.25, warrantyYears: 10, description: 'Pet and impact resistant mesh for door walls, kick panels and dog runs.' },
  { id: 'twitchell-textilene90', label: 'Twitchell Textilene 90 Solar', brand: 'Twitchell', mesh: '90% solar shade fabric', pricePerSqFt: 3.75, warrantyYears: 10, description: 'Blocks up to 90% of solar heat and glare — ideal on west and south walls.' },
  { id: 'phifer-solar-insect', label: 'Phifer SunTex 80 Solar Insect', brand: 'Phifer', mesh: '80% solar / insect fabric', pricePerSqFt: 3.45, warrantyYears: 10, description: 'Dual-purpose solar shade and insect screen with strong wind and tear resistance.' },
  { id: 'florida-glass', label: 'Florida Glass Privacy Laminate', brand: 'Phifer', mesh: 'Vinyl-laminated fiberglass', pricePerSqFt: 2.75, warrantyYears: 5, description: 'Opaque vinyl laminate used on kick panels and house-side privacy walls.' },
];

export const ENCLOSURE_DOORS: EnclosureDoorOption[] = [
  { id: 'single-36-sl', label: 'Self-Latching Single Swing Door 36"', widthFt: 3, price: 760, barrierEligible: true, selfLatching: true, description: 'Code-ready barrier door: self-closing hinges, self-latching release at 54" AFG, outward swing.' },
  { id: 'double-72-sl', label: 'Self-Latching Double Swing Door 6 ft', widthFt: 6, price: 1495, barrierEligible: true, selfLatching: true, description: 'Two self-closing leaves with drop rod and self-latching hardware for equipment access.' },
  { id: 'single-42-sl', label: 'Self-Latching Wide Door 42" (ADA-friendly)', widthFt: 3.5, price: 940, barrierEligible: true, selfLatching: true, description: 'Wider clear opening with self-closing hinges, self-latching lever and key lock.' },
  { id: 'single-36', label: 'Single Swing Door 36" (standard hinge)', widthFt: 3, price: 585, barrierEligible: true, description: 'Standard swing door — requires the self-closing / self-latching kit to serve as the barrier.' },
  { id: 'double-72', label: 'Double Swing Door 6 ft (standard hinge)', widthFt: 6, price: 1180, barrierEligible: true, description: 'Two leaves with drop rod; add the self-latching kit for barrier compliance.' },
  { id: 'sliding-72', label: 'Sliding Screen Door 6 ft', widthFt: 6, price: 890, barrierEligible: false, description: 'Sliding panel — cannot be used as the pool-barrier access point.' },
  { id: 'pet-door', label: 'Pet Door Panel', widthFt: 1, price: 320, barrierEligible: false, description: 'Framed pet panel with lockable flap. Not permitted in a barrier wall.' },
];


export const ENCLOSURE_ADDONS: EnclosureAddOnOption[] = [
  { id: 'self-closing', label: 'Self-Closing / Self-Latching Door Kit (per door)', pricing: 'each', price: 175, description: 'Latch mounted min. 54" above the deck, door swings outward away from the pool.', codeRequired: true },
  { id: 'door-alarm', label: 'Door Open Alarm (per door)', pricing: 'each', price: 235, description: 'Audible alarm where the enclosure wall doubles as the dwelling barrier.' },
  { id: 'super-gutter', label: 'Super Gutter', pricing: 'linear-ft', price: 22, description: '6" integral gutter tied into the roof line with downspouts.' },
  { id: 'kick-plate', label: 'Kick Plate / Chair Rail Band', pricing: 'linear-ft', price: 14, description: 'Lower aluminum or Florida Glass band protecting the screen from furniture and pets.' },
  { id: 'footer', label: 'Concrete Footer / Beam Tie-In', pricing: 'linear-ft', price: 38, description: 'New monolithic footer where the cage does not land on existing deck.' },
  { id: 'demo', label: 'Removal & Haul-Off of Existing Cage', pricing: 'sqft', price: 3.5, description: 'Demolition, disposal and site cleanup of the existing enclosure.' },
  { id: 'hvhz', label: 'HVHZ / Coastal Wind Package', pricing: 'sqft', price: 4.5, description: 'Heavier extrusions, tighter anchor spacing, stainless fasteners for 170+ mph zones.' },
  { id: 'lighting', label: 'Screen Enclosure Lighting Package', pricing: 'each', price: 1450, description: 'Perimeter LED fixtures, fans-ready beams and GFCI-protected circuits.' },
];

/**
 * Florida general-contractor cost model.
 * All values are DIRECT COST to the contractor (not sell price). Sell price is built
 * up as: direct cost + overhead + target gross margin.
 */
export const ENCLOSURE_COST_MODEL = {
  /** Aluminum extrusion material $/sq ft of framed surface (walls + roof), 2x2 base */
  frameMaterialPerSqFt: 2.6,
  /** Added material cost per sq ft for each $1 of extrusion upgrade */
  frameUpgradeFactor: 0.4,
  /** Screen fabric + spline base $/sq ft of screened surface (18/14 fiberglass) */
  screenMaterialPerSqFt: 0.55,
  screenUpgradeFactor: 0.6,
  /** Roof pan material factor applied to the roof option rate */
  roofPanCostFactor: 0.6,
  /** Fasteners, base plates, sleeves, splices, gutter straps, caulk $/sq ft */
  partsPerSqFt: 0.55,
  /** Door: share of catalog price that is material/parts vs. field labor */
  doorMaterialShare: 0.42,
  doorLaborShare: 0.18,
  /** Add-on: cost share of the listed add-on amount */
  addOnMaterialShare: 0.45,
  addOnLaborShare: 0.22,
  /** Installation labor (burdened crew rate) $/sq ft of framed surface */
  laborPerSqFt: 2.6,
  /** Extra labor factor per ft of mean roof height above 11 ft */
  heightLaborFactorPerFt: 0.03,
  /** Freight / delivery */
  deliveryPerSqFt: 0.3,
  deliveryFlat: 350,
  craneTwoStory: 850,
  /** Florida sales tax on materials (6% state + typical 1% county surtax) */
  materialTaxRate: 0.07,
  /** General conditions */
  dumpster: 385,
  equipmentPerSqFt: 0.25,
  equipmentPerSqFtTwoStory: 0.9,
  layoutAndCleanup: 325,
  /** Insurance (GL + workers comp) as % of material + labor */
  insuranceRate: 0.035,
  /** Warranty / callback reserve as % of material + labor */
  warrantyReserveRate: 0.015,
  /** Soft costs */
  engineeringStandard: 1250,
  engineeringSealed: 2200,
  permitFlat: 425,
  permitPercentOfValue: 0.016,
  nocAndInspections: 195,
  planRunner: 150,
  /** Contingency on direct cost */
  contingencyRate: 0.03,
  /** Company overhead (office, trucks, marketing, admin) as % of direct cost */
  defaultOverheadPct: 12,
  /** Target gross margin on the sell price */
  defaultTargetMarginPct: 32,
  /** Florida installed market range $/sq ft of footprint, for competitiveness check */
  marketRangePerSqFt: { low: 24, high: 48 },
};


export interface EnclosureComplianceIssue {
  level: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface EnclosureConfigState {
  typeId: string;
  roofId: string;
  extrusionId: string;
  screenId: string;
  qualityRatePerSqFt: number;
  doors: Record<string, number>;
  addOns: string[];
  /** Take-off from the drawing board */
  areaSqFt: number;
  perimeterFt: number;
  /** Screened wall footage only (house-attached runs excluded) */
  screenWallFt: number;
  longestSpanFt: number;
  wallHeightFt: number;
  meanRoofHeightFt: number;
  roofPitch: string;
  windSpeedMph: number;
  exposure: 'B' | 'C' | 'D';
  hvhz: boolean;
  isPoolBarrier: boolean;
  screenBottomGapIn: number;
  /** Contractor business inputs */
  overheadPct?: number;
  targetMarginPct?: number;
}

export const DEFAULT_ENCLOSURE_CONFIG: EnclosureConfigState = {
  typeId: 'mansard',
  roofId: 'screen-roof',
  extrusionId: '2x3-046',
  screenId: 'phifer-1814',
  qualityRatePerSqFt: 22,
  doors: { 'single-36-sl': 1 },
  addOns: ['super-gutter'],

  areaSqFt: 0,
  perimeterFt: 0,
  screenWallFt: 0,
  longestSpanFt: 0,
  wallHeightFt: 8,
  meanRoofHeightFt: 11,
  roofPitch: '3:12',
  windSpeedMph: 150,
  exposure: 'C',
  hvhz: false,
  isPoolBarrier: true,
  screenBottomGapIn: 0,
  overheadPct: ENCLOSURE_COST_MODEL.defaultOverheadPct,
  targetMarginPct: ENCLOSURE_COST_MODEL.defaultTargetMarginPct,
};

/** Velocity pressure (psf) — simplified ASCE 7 qh for open screen structures */
export function designPressurePsf(config: EnclosureConfigState): number {
  const kz = config.exposure === 'B' ? 0.7 : config.exposure === 'D' ? 1.03 : 0.85;
  const kzt = 1;
  const kd = 0.85;
  const qh = 0.00256 * kz * kzt * kd * config.windSpeedMph ** 2;
  // Screen porosity reduction typically taken at ~0.5 for insect screen walls
  const porosity = config.roofId === 'full-pan' ? 1 : 0.5;
  return Math.round(qh * porosity * 10) / 10;
}

export function checkEnclosureCompliance(config: EnclosureConfigState): EnclosureComplianceIssue[] {
  const issues: EnclosureComplianceIssue[] = [];
  const extrusion = ENCLOSURE_EXTRUSIONS.find(e => e.id === config.extrusionId);
  const doorEntries = Object.entries(config.doors).filter(([, q]) => q > 0);
  const doorCount = doorEntries.reduce((s, [, q]) => s + q, 0);
  const barrierDoors = doorEntries.filter(([id]) => ENCLOSURE_DOORS.find(d => d.id === id)?.barrierEligible);
  // Doors that need the retrofit kit: barrier-eligible but not factory self-latching
  const kitNeededDoors = barrierDoors.filter(([id]) => !ENCLOSURE_DOORS.find(d => d.id === id)?.selfLatching);

  if (config.isPoolBarrier) {
    if (config.wallHeightFt * 12 < 48) {
      issues.push({ level: 'error', code: 'R4501.17.1.1', message: 'A barrier wall must be at least 48 inches high measured from the outside finished deck.' });
    }
    if (config.screenBottomGapIn > 4) {
      issues.push({ level: 'error', code: 'R4501.17.1.2', message: 'Clearance under the screen wall may not exceed 4 inches (2 inches over a non-solid surface).' });
    }
    if (doorCount === 0) {
      issues.push({ level: 'warning', code: 'R4501.17.2', message: 'No door configured. A barrier enclosure requires at least one self-closing, self-latching access door.' });
    }
    if (doorCount > 0 && barrierDoors.length === 0) {
      issues.push({ level: 'error', code: 'R4501.17.2.1', message: 'Sliding and pet doors cannot serve as the barrier access point — add a self-latching swing door.' });
    }
    if (kitNeededDoors.length > 0 && !config.addOns.includes('self-closing')) {
      issues.push({ level: 'error', code: 'R4501.17.2.1', message: 'Standard-hinge barrier doors must be upgraded: select a Self-Latching door model or add the self-closing / self-latching kit (release at least 54 inches above the deck, outward swing away from the pool).' });
    }

    if (config.screenId === 'florida-glass' || config.roofId === 'full-pan') {
      issues.push({ level: 'warning', code: 'R4501.17.1.3', message: 'Solid panels increase wind load and can be climbable — confirm the engineered assembly and barrier path with the reviewer.' });
    }
  }

  if (extrusion && config.longestSpanFt > extrusion.maxSpanFt) {
    issues.push({ level: 'error', code: 'FBC 2002 / span', message: `Longest clear span of ${config.longestSpanFt.toFixed(1)} ft exceeds the ${extrusion.maxSpanFt} ft tested span for ${extrusion.label}. Increase the member size or add a column.` });
  }
  if (config.windSpeedMph >= 170 && !config.addOns.includes('hvhz')) {
    issues.push({ level: 'warning', code: 'ASCE 7 / HVHZ', message: 'Design wind speed at or above 170 mph — add the HVHZ / Coastal Wind Package for signed-and-sealed engineering.' });
  }
  if (config.hvhz && !config.addOns.includes('hvhz')) {
    issues.push({ level: 'warning', code: 'HVHZ', message: 'HVHZ jurisdictions require Miami-Dade NOA approved assemblies and the coastal wind package.' });
  }
  if (config.typeId === 'two-story' && !['2x5-055', '2x6-070'].includes(config.extrusionId)) {
    issues.push({ level: 'error', code: 'FBC 2411', message: 'Two-story enclosures require 2x5 (0.055") columns or heavier.' });
  }
  if (config.roofId === 'full-pan' && !config.addOns.includes('footer')) {
    issues.push({ level: 'warning', code: 'FBC 1808', message: 'A solid insulated roof transfers real gravity load — a designed footer or verified existing beam is required.' });
  }
  if (!config.addOns.includes('super-gutter') && config.roofId !== 'full-pan') {
    issues.push({ level: 'info', code: 'DRAINAGE', message: 'Without a Super Gutter, roof runoff sheets onto the deck perimeter. Confirm drainage away from the structure.' });
  }
  if (config.areaSqFt <= 0) {
    issues.push({ level: 'info', code: 'TAKEOFF', message: 'Draw the enclosure footprint on the 2D board or enter the area to price the project.' });
  }
  return issues;
}

export interface EnclosureEstimateLine {
  label: string;
  detail: string;
  amount: number;
}

export type EnclosureCostCategory =
  | 'Materials'
  | 'Delivery & Freight'
  | 'Installation Labor'
  | 'General Conditions'
  | 'Drawings & Permits'
  | 'Contingency';

export interface EnclosureCostLine {
  category: EnclosureCostCategory;
  label: string;
  detail: string;
  amount: number;
}

export function estimateEnclosure(config: EnclosureConfigState) {
  const M = ENCLOSURE_COST_MODEL;
  const type = ENCLOSURE_TYPES.find(t => t.id === config.typeId) || ENCLOSURE_TYPES[0];
  const roof = ENCLOSURE_ROOFS.find(r => r.id === config.roofId) || ENCLOSURE_ROOFS[0];
  const extrusion = ENCLOSURE_EXTRUSIONS.find(e => e.id === config.extrusionId) || ENCLOSURE_EXTRUSIONS[0];
  const screen = ENCLOSURE_SCREENS.find(s => s.id === config.screenId) || ENCLOSURE_SCREENS[0];
  const doorCount = Object.values(config.doors).reduce((s, n) => s + n, 0);
  const barrierDoorCount = Object.entries(config.doors).reduce(
    (s, [id, q]) => s + (ENCLOSURE_DOORS.find(d => d.id === id)?.barrierEligible ? q : 0),
    0
  );
  // Kit only applies to barrier doors that are not already factory self-latching
  const kitDoorCount = Object.entries(config.doors).reduce((s, [id, q]) => {
    const door = ENCLOSURE_DOORS.find(d => d.id === id);
    return s + (door?.barrierEligible && !door.selfLatching ? q : 0);
  }, 0);
  const selfLatchingDoorCount = Object.entries(config.doors).reduce(
    (s, [id, q]) => s + (ENCLOSURE_DOORS.find(d => d.id === id)?.selfLatching ? q : 0),
    0
  );

  const area = Math.max(0, config.areaSqFt);
  const baseRate = Math.round(config.qualityRatePerSqFt * type.rateMultiplier * 100) / 100;
  const twoStory = config.typeId === 'two-story';

  // ---------- Take-off surfaces ----------
  const wallRunFt = config.screenWallFt || config.perimeterFt * 0.8;
  const wallArea = Math.round(wallRunFt * config.wallHeightFt * (twoStory ? 2 : 1));
  const roofArea = Math.round(area * (1 + (type.rateMultiplier - 1) * 1.2));
  const framedArea = wallArea + roofArea;
  const screenedArea = wallArea + (roof.id === 'full-pan' ? 0 : roofArea);

  const costLines: EnclosureCostLine[] = [];
  const push = (category: EnclosureCostCategory, label: string, detail: string, amount: number) => {
    if (amount > 0) costLines.push({ category, label, detail, amount: Math.round(amount) });
  };

  // ---------- Materials ----------
  const framePerSqFt = M.frameMaterialPerSqFt + extrusion.pricePerSqFt * M.frameUpgradeFactor;
  const frameCost = framedArea * framePerSqFt;
  const screenPerSqFt = M.screenMaterialPerSqFt + screen.pricePerSqFt * M.screenUpgradeFactor;
  const screenCost = screenedArea * screenPerSqFt;
  const roofPanCost = roof.pricePerSqFt > 0 ? roofArea * roof.pricePerSqFt * M.roofPanCostFactor : 0;
  const partsCost = framedArea * M.partsPerSqFt;

  let doorMaterial = 0;
  let doorLabor = 0;
  ENCLOSURE_DOORS.forEach(door => {
    const qty = config.doors[door.id] || 0;
    if (qty > 0) {
      doorMaterial += qty * door.price * M.doorMaterialShare;
      doorLabor += qty * door.price * M.doorLaborShare;
    }
  });

  // Add-ons priced at list, then split into material / labor cost
  const addOnAmounts: { id: string; label: string; detail: string; amount: number }[] = [];
  config.addOns.forEach(id => {
    const addon = ENCLOSURE_ADDONS.find(a => a.id === id);
    if (!addon) return;
    if (addon.pricing === 'each') {
      const qty = addon.id === 'self-closing' ? kitDoorCount : addon.id === 'door-alarm' ? Math.max(doorCount, 1) : 1;
      if (qty <= 0) return;
      addOnAmounts.push({ id: addon.id, label: addon.label, detail: `${qty} x $${addon.price.toLocaleString()}`, amount: qty * addon.price });
    } else if (addon.pricing === 'sqft' && area > 0) {
      addOnAmounts.push({ id: addon.id, label: addon.label, detail: `${area.toLocaleString()} sq ft x $${addon.price}/sq ft`, amount: area * addon.price });
    } else if (addon.pricing === 'linear-ft') {
      const ft = addon.id === 'super-gutter' ? config.perimeterFt : config.screenWallFt || config.perimeterFt;
      if (ft > 0) addOnAmounts.push({ id: addon.id, label: addon.label, detail: `${ft.toLocaleString()} ft x $${addon.price}/ft`, amount: ft * addon.price });
    }
  });
  const addOnTotal = addOnAmounts.reduce((s, a) => s + a.amount, 0);
  const addOnMaterial = addOnTotal * M.addOnMaterialShare;
  const addOnLabor = addOnTotal * M.addOnLaborShare;

  if (area > 0) {
    push('Materials', `Aluminum framing — ${extrusion.label}`, `${framedArea.toLocaleString()} sq ft framed surface x $${framePerSqFt.toFixed(2)}/sq ft`, frameCost);
    push('Materials', `Screen fabric — ${screen.brand} ${screen.mesh}`, `${screenedArea.toLocaleString()} sq ft screened x $${screenPerSqFt.toFixed(2)}/sq ft + spline`, screenCost);
    push('Materials', `Roof assembly — ${roof.label}`, `${roofArea.toLocaleString()} sq ft roof panel material`, roofPanCost);
    push('Materials', 'Fasteners, base plates, sleeves & sealants', `${framedArea.toLocaleString()} sq ft x $${M.partsPerSqFt.toFixed(2)}/sq ft`, partsCost);
    push('Materials', 'Doors & barrier hardware (material)', `${doorCount} door(s) — frames, screens, self-latching hardware`, doorMaterial);
    push('Materials', 'Add-on materials', addOnAmounts.map(a => a.label).join(', ') || 'None', addOnMaterial);
  }

  const materialSubtotal = frameCost + screenCost + roofPanCost + partsCost + doorMaterial + addOnMaterial;
  const materialTax = materialSubtotal * M.materialTaxRate;
  push('Materials', 'Florida sales tax on materials', `${(M.materialTaxRate * 100).toFixed(0)}% of $${Math.round(materialSubtotal).toLocaleString()}`, materialTax);

  // ---------- Delivery & freight ----------
  if (area > 0) {
    push('Delivery & Freight', 'Extrusion & panel delivery', `${framedArea.toLocaleString()} sq ft x $${M.deliveryPerSqFt.toFixed(2)}/sq ft`, framedArea * M.deliveryPerSqFt);
    push('Delivery & Freight', 'Truck & handling (flat)', 'Load-out, long-length aluminum handling, staging', M.deliveryFlat);
    if (twoStory) push('Delivery & Freight', 'Crane / boom lift set', 'Two-story column and beam set', M.craneTwoStory);
  }

  // ---------- Installation labor ----------
  const heightFactor = 1 + Math.max(0, config.meanRoofHeightFt - 11) * M.heightLaborFactorPerFt;
  const laborRate = M.laborPerSqFt * heightFactor;
  const structureLabor = framedArea * laborRate;
  if (area > 0) {
    push('Installation Labor', 'Frame & screen installation crew', `${framedArea.toLocaleString()} sq ft x $${laborRate.toFixed(2)}/sq ft (burdened)`, structureLabor);
    push('Installation Labor', 'Door hanging & hardware adjustment', `${doorCount} door(s)`, doorLabor);
    push('Installation Labor', 'Add-on installation labor', addOnAmounts.map(a => a.label).join(', ') || 'None', addOnLabor);
  }
  const laborSubtotal = structureLabor + doorLabor + addOnLabor;

  // ---------- General conditions ----------
  const insurance = (materialSubtotal + laborSubtotal) * M.insuranceRate;
  const warrantyReserve = (materialSubtotal + laborSubtotal) * M.warrantyReserveRate;
  const equipment = area * (twoStory ? M.equipmentPerSqFtTwoStory : M.equipmentPerSqFt);
  if (area > 0) {
    push('General Conditions', 'Dumpster & disposal', 'Roll-off, haul-off and tipping fees', M.dumpster);
    push('General Conditions', 'Lifts, scaffold & small tools', `${area.toLocaleString()} sq ft footprint`, equipment);
    push('General Conditions', 'Layout, protection & final cleanup', 'Chalk layout, deck/pool protection, punch list', M.layoutAndCleanup);
    push('General Conditions', 'General liability & workers comp', `${(M.insuranceRate * 100).toFixed(1)}% of material + labor`, insurance);
    push('General Conditions', 'Warranty & callback reserve', `${(M.warrantyReserveRate * 100).toFixed(1)}% of material + labor`, warrantyReserve);
  }

  // ---------- Drawings & permits ----------
  const sealedRequired = config.hvhz || config.windSpeedMph >= 170 || twoStory || roof.id === 'full-pan';
  const engineering = sealedRequired ? M.engineeringSealed : M.engineeringStandard;
  const runningCost =
    materialSubtotal + materialTax + laborSubtotal + insurance + warrantyReserve + equipment + M.dumpster + M.layoutAndCleanup;
  const permitFees = M.permitFlat + runningCost * M.permitPercentOfValue;
  if (area > 0) {
    push('Drawings & Permits', sealedRequired ? 'Signed & sealed P.E. drawings' : 'Engineered drawing package', sealedRequired ? 'Florida P.E. calculations, HVHZ / high-wind or 2-story scope' : 'Master-sealed plan set, elevations and anchor details', engineering);
    push('Drawings & Permits', 'Permit & plan review fees', `$${M.permitFlat} submittal + ${(M.permitPercentOfValue * 100).toFixed(1)}% of construction value`, permitFees);
    push('Drawings & Permits', 'NOC, inspections & plan runner', 'Notice of commencement, inspection scheduling, courier', M.nocAndInspections + M.planRunner);
  }

  // ---------- Contingency ----------
  const preContingency = costLines.reduce((s, l) => s + l.amount, 0);
  const contingency = preContingency * M.contingencyRate;
  push('Contingency', 'Job contingency', `${(M.contingencyRate * 100).toFixed(0)}% of direct cost (weather, slab conditions, rework)`, contingency);

  const directCost = costLines.reduce((s, l) => s + l.amount, 0);
  const overheadPct = config.overheadPct ?? M.defaultOverheadPct;
  const marginPct = Math.min(60, Math.max(0, config.targetMarginPct ?? M.defaultTargetMarginPct));
  const overhead = directCost * (overheadPct / 100);
  const costBasis = directCost + overhead;
  const sellPrice = marginPct >= 100 ? costBasis : Math.round(costBasis / (1 - marginPct / 100));
  const profit = sellPrice - costBasis;
  const markupFactor = directCost > 0 ? sellPrice / directCost : 0;

  // ---------- Customer-facing itemization (cost x markup) ----------
  const scope: { label: string; detail: string; cost: number }[] = [];
  if (area > 0) {
    scope.push({
      label: `${type.label} — engineered structure installed`,
      detail: `${area.toLocaleString()} sq ft footprint / ${framedArea.toLocaleString()} sq ft framed — ${extrusion.label}`,
      cost: frameCost + partsCost + structureLabor + framedArea * M.deliveryPerSqFt + M.deliveryFlat + (twoStory ? M.craneTwoStory : 0),
    });
    scope.push({
      label: `Screen system — ${screen.brand} ${screen.label}`,
      detail: `${screenedArea.toLocaleString()} sq ft screened, spline installed${screen.warrantyYears ? `, ${screen.warrantyYears}-yr fabric warranty` : ''}`,
      cost: screenCost,
    });
    if (roofPanCost > 0) scope.push({ label: `Roof — ${roof.label}`, detail: `${roofArea.toLocaleString()} sq ft panel supplied & installed`, cost: roofPanCost });
    if (doorCount > 0) scope.push({ label: 'Doors & barrier hardware', detail: `${doorCount} door(s), ${selfLatchingDoorCount} factory self-latching`, cost: doorMaterial + doorLabor });
    if (addOnTotal > 0) scope.push({ label: 'Selected add-ons', detail: addOnAmounts.map(a => a.label).join(', '), cost: addOnMaterial + addOnLabor });
    scope.push({ label: 'Engineering, drawings & permits', detail: sealedRequired ? 'Sealed P.E. package, permit fees, inspections' : 'Engineered plan set, permit fees, inspections', cost: engineering + permitFees + M.nocAndInspections + M.planRunner });
    scope.push({ label: 'Mobilization, equipment & site conditions', detail: 'Delivery handling, lifts, protection, disposal, insurance, cleanup', cost: equipment + M.dumpster + M.layoutAndCleanup + insurance + warrantyReserve + materialTax + contingency });
  }

  const lines: EnclosureEstimateLine[] = scope.map(s => ({
    label: s.label,
    detail: s.detail,
    amount: Math.round(s.cost * markupFactor),
  }));
  // Reconcile rounding so the itemization sums exactly to the sell price
  if (lines.length > 0) {
    const diff = sellPrice - lines.reduce((s, l) => s + l.amount, 0);
    lines[lines.length - 1].amount += diff;
  }

  // ---------- Granular, editable elements (cart / quote) ----------
  const mk = (cost: number) => Math.round(cost * markupFactor);
  const extrusionUpgradeCost = framedArea * extrusion.pricePerSqFt * M.frameUpgradeFactor;
  const elements: EnclosureElement[] = [];
  if (area > 0) {
    elements.push({
      key: 'structure',
      kind: 'structure',
      label: `${type.label} — engineered structure installed`,
      detail: `${area.toLocaleString()} sq ft footprint / ${framedArea.toLocaleString()} sq ft framed surface, ${config.roofPitch} pitch`,
      amount: mk(frameCost - extrusionUpgradeCost + partsCost + structureLabor + framedArea * M.deliveryPerSqFt + M.deliveryFlat + (twoStory ? M.craneTwoStory : 0)),
      optionId: type.id,
      options: ENCLOSURE_TYPES.map(t => ({ id: t.id, label: t.label })),
      removable: false,
    });
    elements.push({
      key: 'extrusion',
      kind: 'extrusion',
      label: `Structural profile — ${extrusion.label}`,
      detail: `${extrusion.size} @ ${extrusion.wallIn}" wall, rated ${extrusion.maxSpanFt} ft clear span`,
      amount: mk(extrusionUpgradeCost),
      optionId: extrusion.id,
      options: ENCLOSURE_EXTRUSIONS.map(e => ({ id: e.id, label: e.label })),
      removable: false,
    });
    elements.push({
      key: 'screen',
      kind: 'screen',
      label: `Screen fabric — ${screen.brand} ${screen.label}`,
      detail: `${screenedArea.toLocaleString()} sq ft screened, ${screen.mesh}${screen.warrantyYears ? `, ${screen.warrantyYears}-yr fabric warranty` : ''}`,
      amount: mk(screenCost),
      optionId: screen.id,
      options: ENCLOSURE_SCREENS.map(s => ({ id: s.id, label: `${s.brand} ${s.label}` })),
      removable: false,
    });
    elements.push({
      key: 'roof',
      kind: 'roof',
      label: `Roof assembly — ${roof.label}`,
      detail: roofPanCost > 0 ? `${roofArea.toLocaleString()} sq ft engineered panel supplied & installed` : `${roofArea.toLocaleString()} sq ft screened roof`,
      amount: mk(roofPanCost),
      optionId: roof.id,
      options: ENCLOSURE_ROOFS.map(r => ({ id: r.id, label: r.label })),
      removable: false,
    });
    ENCLOSURE_DOORS.forEach(door => {
      const qty = config.doors[door.id] || 0;
      if (qty <= 0) return;
      elements.push({
        key: `door:${door.id}`,
        kind: 'door',
        label: door.label,
        detail: `${qty} x ${door.selfLatching ? 'self-closing / self-latching' : 'standard hinge'}${door.barrierEligible ? ', barrier eligible' : ''}`,
        amount: mk(qty * door.price * (M.doorMaterialShare + M.doorLaborShare)),
        quantity: qty,
        optionId: door.id,
        options: ENCLOSURE_DOORS.map(d => ({ id: d.id, label: d.label })),
        removable: true,
      });
    });
    addOnAmounts.forEach(a => {
      elements.push({
        key: `addon:${a.id}`,
        kind: 'addon',
        label: a.label,
        detail: a.detail,
        amount: mk(a.amount * (M.addOnMaterialShare + M.addOnLaborShare)),
        optionId: a.id,
        removable: true,
      });
    });
    elements.push({
      key: 'engineering',
      kind: 'soft',
      label: 'Engineering, drawings & permits',
      detail: sealedRequired ? 'Signed & sealed Florida P.E. package, permit fees, inspections' : 'Engineered plan set, permit fees, inspections',
      amount: mk(engineering + permitFees + M.nocAndInspections + M.planRunner),
      removable: false,
    });
    elements.push({
      key: 'mobilization',
      kind: 'general',
      label: 'Mobilization, equipment & site conditions',
      detail: 'Delivery handling, lifts, deck protection, disposal, insurance, cleanup',
      amount: mk(equipment + M.dumpster + M.layoutAndCleanup + insurance + warrantyReserve + materialTax + contingency),
      removable: false,
    });
    // Reconcile so elements sum exactly to the sell price
    const eDiff = sellPrice - elements.reduce((s, e) => s + e.amount, 0);
    elements[0].amount += eDiff;
  }

  const categoryTotals = costLines.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.amount;
    return acc;
  }, {});

  const pricePerSqFt = area > 0 ? Math.round((sellPrice / area) * 100) / 100 : 0;
  const costPerSqFt = area > 0 ? Math.round((directCost / area) * 100) / 100 : 0;
  // Fixed soft costs (drawings, permits, mobilization) push small jobs to a higher $/sq ft,
  // so the Florida market band is scaled by footprint before judging competitiveness.
  const market = area > 0
    ? {
        low: Math.round((M.marketRangePerSqFt.low + 4500 / area) * 10) / 10,
        high: Math.round((M.marketRangePerSqFt.high + 9000 / area) * 10) / 10,
      }
    : M.marketRangePerSqFt;
  const competitiveness: 'below' | 'competitive' | 'above' =
    pricePerSqFt === 0 ? 'competitive' : pricePerSqFt < market.low ? 'below' : pricePerSqFt > market.high ? 'above' : 'competitive';

  return {
    lines,
    total: sellPrice,
    costLines,
    categoryTotals,
    directCost: Math.round(directCost),
    overhead: Math.round(overhead),
    overheadPct,
    marginPct,
    profit: Math.round(profit),
    costBasis: Math.round(costBasis),
    pricePerSqFt,
    costPerSqFt,
    breakEvenPerSqFt: area > 0 ? Math.round((costBasis / area) * 100) / 100 : 0,
    marketRange: market,
    competitiveness,
    framedArea,
    screenedArea,
    wallArea,
    roofArea,
    sealedRequired,
    baseRate,
    doorCount,
    barrierDoorCount,
    kitDoorCount,
    selfLatchingDoorCount,
    type,
    roof,
    extrusion,
    screen,
  };
}


export interface EnclosureSpecRow {
  label: string;
  value: string;
}

/** Derived build spec for installers, architects/engineers and permit reviewers */
export function buildEnclosureSpec(config: EnclosureConfigState): {
  installer: EnclosureSpecRow[];
  architect: EnclosureSpecRow[];
  permit: EnclosureSpecRow[];
} {
  const type = ENCLOSURE_TYPES.find(t => t.id === config.typeId) || ENCLOSURE_TYPES[0];
  const roof = ENCLOSURE_ROOFS.find(r => r.id === config.roofId) || ENCLOSURE_ROOFS[0];
  const extrusion = ENCLOSURE_EXTRUSIONS.find(e => e.id === config.extrusionId) || ENCLOSURE_EXTRUSIONS[0];
  const screen = ENCLOSURE_SCREENS.find(s => s.id === config.screenId) || ENCLOSURE_SCREENS[0];
  const doorCount = Object.values(config.doors).reduce((s, n) => s + n, 0);
  const uprightSpacing = config.hvhz || config.windSpeedMph >= 170 ? 4 : 6;
  const uprights = config.screenWallFt > 0 ? Math.ceil(config.screenWallFt / uprightSpacing) + 1 : 0;
  const panels = config.screenWallFt > 0 ? Math.ceil(config.screenWallFt / uprightSpacing) : 0;
  const pressure = designPressurePsf(config);
  const anchorSpacing = config.hvhz ? 8 : 12;
  const screenRolls = config.areaSqFt > 0 ? Math.ceil((config.areaSqFt * 1.35) / 700) : 0;

  return {
    installer: [
      { label: 'Structure type', value: `${type.label} — ${config.roofPitch} roof pitch` },
      { label: 'Footprint', value: `${config.areaSqFt.toLocaleString()} sq ft / ${config.perimeterFt.toLocaleString()} ft perimeter` },
      { label: 'Screened wall run', value: `${config.screenWallFt.toLocaleString()} ft (house-attached runs excluded)` },
      { label: 'Uprights', value: `${uprights} @ ${uprightSpacing} ft o.c. — ${extrusion.label}` },
      { label: 'Screen panels', value: `${panels} wall bays + roof bays; ${screenRolls} roll(s) of ${screen.brand} ${screen.mesh} @ 700 sq ft` },
      { label: 'Base / anchors', value: `1/4" x 2-1/4" Tapcon @ ${anchorSpacing}" o.c. into 3,000 psi slab, 1-1/4" min. embed` },
      { label: 'Slab edge', value: 'Min. 4" clear from slab edge; epoxy anchors where edge distance is short' },
      { label: 'Beam splices', value: `Internal sleeves at splices, #10 x 3/4" ${config.hvhz ? '304 stainless' : 'painted'} screws, 3 per connection` },
      { label: 'Screen install', value: 'Spline roll into extrusion channel, 0.175" spline, no more than 2% sag' },
      {
        label: 'Doors',
        value:
          doorCount > 0
            ? Object.entries(config.doors)
                .filter(([, q]) => q > 0)
                .map(([id, q]) => {
                  const d = ENCLOSURE_DOORS.find(x => x.id === id);
                  return `${q} x ${d?.label || id}${d?.selfLatching ? ' (self-closing / self-latching, latch @ 54" AFF, outward swing)' : ''}`;
                })
                .join('; ')
            : 'None configured',
      },

      { label: 'Gutter', value: config.addOns.includes('super-gutter') ? '6" Super Gutter with downspouts to grade, 1/8" per ft slope' : 'None — verify deck drainage' },
      { label: 'Finish protection', value: `${config.hvhz ? 'AAMA 2604' : 'AAMA 2603'} powder coat, touch-up all field cuts` },
    ],
    architect: [
      { label: 'Occupancy / use', value: 'Open aluminum screen enclosure, unoccupied accessory structure' },
      { label: 'Wall / eave height', value: `${config.wallHeightFt} ft wall, ${config.meanRoofHeightFt} ft mean roof height` },
      { label: 'Longest clear span', value: `${config.longestSpanFt.toFixed(1)} ft (member rated ${extrusion.maxSpanFt} ft)` },
      { label: 'Design wind speed', value: `${config.windSpeedMph} mph, Exposure ${config.exposure}, Risk Cat. II (ASCE 7)` },
      { label: 'Design pressure', value: `${pressure} psf net on screen surfaces (porosity reduced)` },
      { label: 'Zone', value: config.hvhz ? 'HVHZ — Miami-Dade / Broward' : 'Standard Florida wind zone' },
      { label: 'Members', value: `${extrusion.size} @ ${extrusion.wallIn}" wall, 6005-T5 extruded aluminum` },
      { label: 'Roof assembly', value: `${roof.label}${roof.pricePerSqFt > 0 ? ' — engineered panel' : ''}` },
      { label: 'Infill', value: `${screen.brand} ${screen.label} (${screen.mesh})${screen.warrantyYears ? ` — ${screen.warrantyYears}-yr fabric warranty` : ''}` },
      { label: 'Load path', value: 'Uplift and lateral load through uprights to base plate anchors into existing slab / new footer' },
      { label: 'Deflection limit', value: 'L/60 for screen framing members under design wind' },
      { label: 'Barrier function', value: config.isPoolBarrier ? 'Enclosure serves as the required pool safety barrier' : 'Separate pool barrier provided' },
    ],
    permit: [
      { label: 'Code basis', value: 'FBC 8th Ed. — Building 2002/2411, Residential R4501.17, F.S. 515' },
      { label: 'Submittal set', value: 'Survey site plan, enclosure plan & elevations, anchor detail, screen schedule' },
      { label: 'Engineering', value: config.hvhz || config.windSpeedMph >= 170 || config.typeId === 'two-story' ? 'Signed & sealed Florida P.E. calculations required' : 'Master-sealed engineering package typically accepted' },
      { label: 'Product approval', value: config.hvhz ? 'Miami-Dade NOA required for framing, screen and doors' : 'Florida Product Approval (FL#) for the framing system' },
      { label: 'Setbacks / easements', value: 'Verify rear/side setbacks, drainage easements and plat restrictions' },
      { label: 'Impervious area', value: `${config.roofId === 'full-pan' ? 'Solid roof counts toward lot coverage — confirm limits' : 'Screen roof generally excluded from impervious coverage'}` },
      { label: 'Inspections', value: 'Anchor/attachment inspection, then final enclosure and barrier inspection' },
      { label: 'Pool linkage', value: 'Final pool inspection is withheld until the barrier passes' },
      { label: 'Electrical', value: config.addOns.includes('lighting') ? 'Separate electrical permit for lighting / fan circuits (GFCI)' : 'No electrical scope' },
      { label: 'Utilities', value: 'Sunshine 811 locate ticket before any footer excavation' },
      { label: 'HOA', value: 'Architectural review approval letter required by most Florida HOAs' },
      { label: 'Contractor', value: 'Licensed Florida specialty structure / aluminum contractor with WC and GL certificates' },
    ],
  };
}
