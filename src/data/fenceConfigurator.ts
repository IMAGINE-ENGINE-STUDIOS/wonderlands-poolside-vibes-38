/**
 * Aluminum fence configurator data — Florida residential pool-barrier oriented.
 *
 * Code references (summarized for customer-facing use):
 * - Florida Building Code, Residential (FBC-R), Section R4501.17 — Residential Swimming
 *   Barrier requirements (Preston de Ibern/McKenzie Merriam Residential Swimming Pool
 *   Safety Act, F.S. Chapter 515).
 * - ASTM F2286 / AAMA 2604 finish standards for extruded aluminum picket fence.
 * - FBC High-Velocity Hurricane Zone (HVHZ) wind-load provisions, ASCE 7 Risk Category II.
 */

export type FenceUnit = 'linear-ft';

export interface FenceHeightOption {
  id: string;
  label: string;
  heightIn: number;
  pricePerFt: number;
  poolBarrierCompliant: boolean;
  note: string;
}

export interface FenceStyleOption {
  id: string;
  label: string;
  /** Price adjustment per linear ft */
  pricePerFtDelta: number;
  description: string;
}

export interface FenceColorOption {
  id: string;
  label: string;
  hex: string;
  finish: string;
}

export interface FenceGateOption {
  id: string;
  label: string;
  widthFt: number;
  price: number;
  description: string;
}

export interface FenceAddOnOption {
  id: string;
  label: string;
  /** 'each' items are flat, 'linear-ft' items multiply by total footage */
  pricing: 'each' | 'linear-ft';
  price: number;
  description: string;
  /** Required by Florida pool-barrier code when the fence serves as the pool barrier */
  codeRequired?: boolean;
}

/** Base heights — pricing matches PatioFencingSection / studioFencing */
export const FENCE_HEIGHTS: FenceHeightOption[] = [
  {
    id: '36',
    label: '36" (3 ft)',
    heightIn: 36,
    pricePerFt: 40,
    poolBarrierCompliant: false,
    note: 'Decorative / patio perimeter only — below the 48" minimum for a pool barrier.',
  },
  {
    id: '48',
    label: '48" (4 ft)',
    heightIn: 48,
    pricePerFt: 45,
    poolBarrierCompliant: true,
    note: 'Minimum height accepted as a residential pool barrier under FBC-R R4501.17.',
  },
  {
    id: '54',
    label: '54" (4.5 ft)',
    heightIn: 54,
    pricePerFt: 50,
    poolBarrierCompliant: true,
    note: 'Common HOA / municipal upgrade height with added child-resistance.',
  },
  {
    id: '60',
    label: '60" (5 ft)',
    heightIn: 60,
    pricePerFt: 55,
    poolBarrierCompliant: true,
    note: 'Preferred where the barrier also serves as property fencing.',
  },
  {
    id: '72',
    label: '72" (6 ft)',
    heightIn: 72,
    pricePerFt: 60,
    poolBarrierCompliant: true,
    note: 'Privacy/security height. Verify local height limits in front-yard setbacks.',
  },
];

export const FENCE_STYLES: FenceStyleOption[] = [
  { id: 'flat-top', label: 'Flat Top (3-Rail)', pricePerFtDelta: 0, description: 'Clean flush top rail — the standard pool-code profile.' },
  { id: 'spear-top', label: 'Spear Top', pricePerFtDelta: 4, description: 'Pickets extend above the top rail. Not permitted on pool barriers under 60".' },
  { id: 'flat-top-puppy', label: 'Flat Top + Puppy Picket', pricePerFtDelta: 6, description: 'Added lower pickets — closes the bottom gap for small pets.' },
  { id: 'arched', label: 'Arched Panel', pricePerFtDelta: 8, description: 'Architectural arched top rail for entry runs and courtyards.' },
  { id: 'privacy-slat', label: 'Privacy Slat Infill', pricePerFtDelta: 14, description: 'Vertical louvered infill. Higher wind load — engineered post spacing required.' },
];

export const FENCE_COLORS: FenceColorOption[] = [
  { id: 'black', label: 'Textured Black', hex: '#111827', finish: 'AAMA 2604 powder coat' },
  { id: 'bronze', label: 'Antique Bronze', hex: '#4A3728', finish: 'AAMA 2604 powder coat' },
  { id: 'white', label: 'Gloss White', hex: '#F8FAFC', finish: 'AAMA 2604 powder coat' },
  { id: 'sandstone', label: 'Sandstone', hex: '#C2B49A', finish: 'AAMA 2604 powder coat' },
  { id: 'slate', label: 'Slate Grey', hex: '#5B6470', finish: 'AAMA 2604 powder coat' },
];

export const FENCE_GATES: FenceGateOption[] = [
  { id: 'walk-36', label: 'Walk Gate 36"', widthFt: 3, price: 650, description: 'Single leaf pedestrian gate with self-closing hinges and self-latching hardware.' },
  { id: 'walk-48', label: 'Walk Gate 48"', widthFt: 4, price: 780, description: 'Wide single leaf — ADA-friendly clear opening.' },
  { id: 'double-72', label: 'Double Gate 6 ft', widthFt: 6, price: 1450, description: 'Two leaves with drop rod — equipment access.' },
  { id: 'double-120', label: 'Double Gate 10 ft', widthFt: 10, price: 1950, description: 'Wide double gate for vehicle or heavy equipment access.' },
];

export const FENCE_ADDONS: FenceAddOnOption[] = [
  { id: 'self-closing', label: 'Self-Closing / Self-Latching Kit (per gate)', pricing: 'each', price: 185, description: 'Magna-Latch style latch mounted min. 54" above grade, opening outward from the pool.', codeRequired: true },
  { id: 'alarm', label: 'Gate Open Alarm (per gate)', pricing: 'each', price: 240, description: 'Audible alarm required where the barrier gate serves a dwelling access point.' },
  { id: 'core-drill', label: 'Core Drilling into Concrete/Pavers', pricing: 'linear-ft', price: 6, description: 'Posts core-drilled and grouted into existing hardscape instead of soil footings.' },
  { id: 'hvhz', label: 'HVHZ / Coastal Wind Package', pricing: 'linear-ft', price: 9, description: 'Heavier extrusions, tighter post spacing, stainless fasteners for 170+ mph zones.' },
  { id: 'raked', label: 'Raked / Sloped Terrain Panels', pricing: 'linear-ft', price: 7, description: 'Field-raked panels to follow grade and hold the 4" bottom clearance.' },
  { id: 'demo', label: 'Removal & Haul-Off of Existing Fence', pricing: 'linear-ft', price: 8, description: 'Demolition, disposal, and site cleanup of existing fencing.' },
];

/** Fixed project costs applied to every fence contract */
export const FENCE_PROJECT_FEES = {
  permitAndDrawings: 850,
  mobilization: 450,
};

export interface FenceComplianceIssue {
  level: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface FenceConfigState {
  heightId: string;
  styleId: string;
  colorId: string;
  isPoolBarrier: boolean;
  gates: Record<string, number>;
  addOns: string[];
  linearFt: number;
  bottomClearanceIn: number;
  picketSpacingIn: number;
  postSpacingFt: number;
  windSpeedMph: number;
  hvhz: boolean;
}

export const DEFAULT_FENCE_CONFIG: FenceConfigState = {
  heightId: '48',
  styleId: 'flat-top',
  colorId: 'black',
  isPoolBarrier: true,
  gates: {},
  addOns: ['self-closing'],
  linearFt: 0,
  bottomClearanceIn: 4,
  picketSpacingIn: 3.75,
  postSpacingFt: 6,
  windSpeedMph: 150,
  hvhz: false,
};

/** Florida residential pool-barrier rule checks (FBC-R R4501.17 / F.S. 515) */
export function checkFenceCompliance(config: FenceConfigState): FenceComplianceIssue[] {
  const issues: FenceComplianceIssue[] = [];
  const height = FENCE_HEIGHTS.find(h => h.id === config.heightId);
  const style = FENCE_STYLES.find(s => s.id === config.styleId);
  const gateCount = Object.values(config.gates).reduce((s, n) => s + n, 0);

  if (config.isPoolBarrier) {
    if (!height || height.heightIn < 48) {
      issues.push({ level: 'error', code: 'R4501.17.1.1', message: 'Pool barriers must be at least 48 inches high measured from the outside finished grade.' });
    }
    if (config.bottomClearanceIn > 4) {
      issues.push({ level: 'error', code: 'R4501.17.1.2', message: 'Maximum clearance between the bottom of the barrier and grade is 4 inches (2 inches over a non-solid surface such as turf or mulch).' });
    }
    if (config.picketSpacingIn > 4) {
      issues.push({ level: 'error', code: 'R4501.17.1.4', message: 'Clear openings between vertical pickets may not exceed 4 inches so a 4-inch sphere cannot pass through.' });
    }
    if (height && height.heightIn < 60 && style?.id === 'spear-top') {
      issues.push({ level: 'error', code: 'R4501.17.1.5', message: 'Spear/finial tops are not permitted on pool barriers under 60 inches — use a flat top rail.' });
    }
    if (gateCount === 0) {
      issues.push({ level: 'warning', code: 'R4501.17.2', message: 'No gate configured. Every pool enclosure needs at least one code-compliant access gate.' });
    }
    if (gateCount > 0 && !config.addOns.includes('self-closing')) {
      issues.push({ level: 'error', code: 'R4501.17.2.1', message: 'Gates must be self-closing and self-latching, opening outward away from the pool, with the release mechanism at least 54 inches above grade.' });
    }
    if (style?.id === 'privacy-slat') {
      issues.push({ level: 'warning', code: 'R4501.17.1.3', message: 'Solid/privacy infill creates a climbable and higher wind-load surface — engineering review required before permitting.' });
    }
  }

  if (config.windSpeedMph >= 170 && !config.addOns.includes('hvhz')) {
    issues.push({ level: 'warning', code: 'ASCE 7 / HVHZ', message: 'Design wind speed at or above 170 mph — add the HVHZ / Coastal Wind Package for signed-and-sealed engineering.' });
  }
  if (config.postSpacingFt > 8) {
    issues.push({ level: 'error', code: 'ASTM F2408', message: 'Post spacing over 8 feet exceeds the tested panel span for extruded aluminum fence.' });
  }
  if (config.hvhz && config.postSpacingFt > 6) {
    issues.push({ level: 'warning', code: 'HVHZ', message: 'Inside HVHZ counties (Miami-Dade, Broward) post spacing should be 6 feet or less.' });
  }
  if (config.linearFt <= 0) {
    issues.push({ level: 'info', code: 'TAKEOFF', message: 'Draw the fence layout or enter total linear feet to price the project.' });
  }
  return issues;
}

export interface FenceEstimateLine {
  label: string;
  detail: string;
  amount: number;
}

export function estimateFence(config: FenceConfigState) {
  const height = FENCE_HEIGHTS.find(h => h.id === config.heightId) || FENCE_HEIGHTS[0];
  const style = FENCE_STYLES.find(s => s.id === config.styleId) || FENCE_STYLES[0];
  const rate = height.pricePerFt + style.pricePerFtDelta;
  const gateCount = Object.values(config.gates).reduce((s, n) => s + n, 0);
  const lines: FenceEstimateLine[] = [];

  if (config.linearFt > 0) {
    lines.push({
      label: `${height.label} ${style.label}`,
      detail: `${config.linearFt.toLocaleString()} linear ft x $${rate}/ft`,
      amount: config.linearFt * rate,
    });
  }

  FENCE_GATES.forEach(gate => {
    const qty = config.gates[gate.id] || 0;
    if (qty > 0) lines.push({ label: gate.label, detail: `${qty} x $${gate.price.toLocaleString()}`, amount: qty * gate.price });
  });

  config.addOns.forEach(id => {
    const addon = FENCE_ADDONS.find(a => a.id === id);
    if (!addon) return;
    if (addon.pricing === 'each') {
      const qty = Math.max(gateCount, 1);
      lines.push({ label: addon.label, detail: `${qty} x $${addon.price.toLocaleString()}`, amount: qty * addon.price });
    } else if (config.linearFt > 0) {
      lines.push({ label: addon.label, detail: `${config.linearFt.toLocaleString()} ft x $${addon.price}/ft`, amount: config.linearFt * addon.price });
    }
  });

  if (config.linearFt > 0) {
    lines.push({ label: 'Permit, Drawings & Engineering', detail: 'Signed site plan and county submittal', amount: FENCE_PROJECT_FEES.permitAndDrawings });
    lines.push({ label: 'Mobilization & Site Prep', detail: 'Layout, locates, equipment', amount: FENCE_PROJECT_FEES.mobilization });
  }

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total, rate, gateCount, height, style };
}

/** Derived build spec for installers, architects and permit reviewers */
export function buildFenceSpec(config: FenceConfigState) {
  const height = FENCE_HEIGHTS.find(h => h.id === config.heightId) || FENCE_HEIGHTS[0];
  const style = FENCE_STYLES.find(s => s.id === config.styleId) || FENCE_STYLES[0];
  const color = FENCE_COLORS.find(c => c.id === config.colorId) || FENCE_COLORS[0];
  const gateCount = Object.values(config.gates).reduce((s, n) => s + n, 0);
  const posts = config.linearFt > 0 ? Math.ceil(config.linearFt / config.postSpacingFt) + 1 : 0;
  const panels = config.linearFt > 0 ? Math.ceil(config.linearFt / config.postSpacingFt) : 0;
  const picketsPerPanel = Math.max(1, Math.floor((config.postSpacingFt * 12) / (config.picketSpacingIn + 0.75)));

  return {
    installer: [
      { label: 'Panels (nominal)', value: `${panels} @ ${config.postSpacingFt} ft` },
      { label: 'Posts', value: `${posts} (2" x 2" extruded, ${config.hvhz ? '0.100"' : '0.062"'} wall)` },
      { label: 'Pickets per panel', value: `${picketsPerPanel} @ ${config.picketSpacingIn}" clear` },
      { label: 'Footings (soil)', value: `10" dia. x 24" deep, 3,000 psi concrete` },
      { label: 'Footings (hardscape)', value: `3" core drill, non-shrink grout, 8" min. embed` },
      { label: 'Bottom clearance', value: `${config.bottomClearanceIn}" max to finished grade` },
      { label: 'Fasteners', value: config.hvhz ? '304 stainless, tamper-resistant' : 'Powder-coated stainless' },
      { label: 'Gates', value: gateCount > 0 ? `${gateCount} — self-closing hinges, latch @ 54" AFG, swings away from pool` : 'None configured' },
    ],
    architect: [
      { label: 'Barrier height', value: `${height.heightIn}" AFG (${height.label})` },
      { label: 'Profile', value: `${style.label}, ${color.label}` },
      { label: 'Finish', value: `${color.finish}, ASTM F2286 extruded 6005-T5 aluminum` },
      { label: 'Design wind speed', value: `${config.windSpeedMph} mph, Exposure C, Risk Cat. II (ASCE 7)` },
      { label: 'Zone', value: config.hvhz ? 'HVHZ (Miami-Dade / Broward)' : 'Standard Florida wind zone' },
      { label: 'Climb resistance', value: 'No horizontal member within 45" of grade on the outside face' },
      { label: 'Setbacks', value: 'Verify side/rear 0 ft, front-yard height limit per municipal zoning' },
      { label: 'Grading', value: 'Barrier follows grade; raked panels where slope exceeds 1:12' },
    ],
    permit: [
      { label: 'Code basis', value: 'FBC-R R4501.17 / F.S. Ch. 515 residential barrier' },
      { label: 'Submittal set', value: 'Survey-based site plan, fence elevation, footing detail, product approval' },
      { label: 'Product approval', value: 'Florida Product Approval or Miami-Dade NOA number for the panel system' },
      { label: 'Engineering', value: config.hvhz || config.windSpeedMph >= 170 ? 'Signed & sealed FL P.E. calculations required' : 'Master-sealed detail typically accepted' },
      { label: 'Inspections', value: 'Post-hole / footing inspection, then final barrier inspection' },
      { label: 'Pool linkage', value: 'Final pool inspection is withheld until the barrier passes' },
      { label: 'Utilities', value: 'Sunshine 811 locate ticket required before digging (48 business hours)' },
      { label: 'HOA / plat', value: 'Confirm easements, drainage swales and HOA architectural approval' },
    ],
  };
}
