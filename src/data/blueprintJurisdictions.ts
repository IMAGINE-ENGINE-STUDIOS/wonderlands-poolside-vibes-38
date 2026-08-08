/**
 * Florida jurisdiction catalog for the Blueprint Builder.
 *
 * Each record drives the sheet set, printed notes, dimensional defaults and
 * submittal checklist for the selected city or county. The Pasco County /
 * Port Richey record is the reference baseline, taken from a certified
 * engineered pool + patio permit set for that jurisdiction.
 */

export type ProjectTypeId =
  | 'fiberglass-pool'
  | 'concrete-pool'
  | 'spa-only'
  | 'paver-deck'
  | 'retaining-wall'
  | 'screen-enclosure'
  | 'pergola'
  | 'fence'
  | 'driveway';

export type PermitTypeId =
  | 'residential-pool'
  | 'accessory-structure'
  | 'electrical-sub'
  | 'plumbing-sub'
  | 'gas-sub'
  | 'site-drainage'
  | 'fence-permit'
  | 'driveway-row';

export interface ProjectType {
  id: ProjectTypeId;
  label: string;
  /** Sheets required for this project type */
  sheets: string[];
  /** Permit types normally pulled for this scope */
  permits: PermitTypeId[];
  scope: string[];
}

export interface PermitType {
  id: PermitTypeId;
  label: string;
  /** Documents the jurisdiction expects at submittal */
  submittals: string[];
}

export interface Jurisdiction {
  id: string;
  city: string;
  county: string;
  /** Building department name printed on the cover */
  authority: string;
  codes: string[];
  windSpeedMph: number;
  exposure: string;
  riskCategory: string;
  /** Maximum impervious / lot coverage allowed, percent */
  maxImperviousPct: number;
  /** Pool water edge setbacks in feet */
  setbacks: { rearFt: number; sideFt: number; frontFt: number; poolToHouseFt: number };
  barrierHeightIn: number;
  /** Sheets this jurisdiction always requires on top of the project type */
  requiredSheets: string[];
  /** Note groups this jurisdiction always requires printed */
  requiredNoteGroups: string[];
  /** Extra local submittal requirements */
  localRequirements: string[];
  /** Whether a signed & sealed engineered plan is mandatory */
  requiresEngineerSeal: boolean;
  reference?: boolean;
}

export const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'fiberglass-pool',
    label: 'New Fiberglass Pool',
    sheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    permits: ['residential-pool', 'electrical-sub', 'plumbing-sub'],
    scope: ['NEW FIBERGLASS POOL.', 'POOL EQUIPMENT INSTALLATION.', 'PAVER DECK / RETAINING WALL "TO BE PERMITTED SEPARATELY" IF APPLICABLE.'],
  },
  {
    id: 'concrete-pool',
    label: 'New Concrete / Gunite Pool',
    sheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    permits: ['residential-pool', 'electrical-sub', 'plumbing-sub', 'gas-sub'],
    scope: ['NEW SHOTCRETE / GUNITE POOL SHELL.', 'POOL EQUIPMENT INSTALLATION.', 'REINFORCED CONCRETE DECK.'],
  },
  {
    id: 'spa-only',
    label: 'Spa / Hot Tub Only',
    sheets: ['A1', 'S1', 'E1', 'P1'],
    permits: ['residential-pool', 'electrical-sub'],
    scope: ['NEW SPA INSTALLATION.', 'SPA EQUIPMENT AND BONDING.'],
  },
  {
    id: 'paver-deck',
    label: 'Paver Deck / Patio',
    sheets: ['A1', 'S2', 'D1'],
    permits: ['accessory-structure', 'site-drainage'],
    scope: ['NEW PAVER DECK / PATIO ON COMPACTED BASE.', 'GRADING AND DRAINAGE.'],
  },
  {
    id: 'retaining-wall',
    label: 'Retaining Wall',
    sheets: ['A1', 'S1', 'S2'],
    permits: ['accessory-structure', 'site-drainage'],
    scope: ['NEW ENGINEERED RETAINING WALL.', 'BACKFILL AND DRAINAGE PROVISIONS.'],
  },
  {
    id: 'screen-enclosure',
    label: 'Screen Enclosure / Pool Cage',
    sheets: ['A1', 'ST1', 'S2'],
    permits: ['accessory-structure'],
    scope: ['NEW ALUMINUM SCREEN ENCLOSURE.', 'ANCHORAGE TO EXISTING DECK / FOOTER.'],
  },
  {
    id: 'pergola',
    label: 'Pergola / Shade Structure',
    sheets: ['A1', 'ST1', 'S2'],
    permits: ['accessory-structure'],
    scope: ['NEW PERGOLA / SHADE STRUCTURE.', 'FOOTINGS AND ANCHORAGE.'],
  },
  {
    id: 'fence',
    label: 'Fence / Pool Barrier',
    sheets: ['A1', 'F1'],
    permits: ['fence-permit'],
    scope: ['NEW ALUMINUM FENCE AND SELF-LATCHING GATES.', 'POOL BARRIER COMPLIANCE.'],
  },
  {
    id: 'driveway',
    label: 'Driveway / Apron',
    sheets: ['A1', 'D1'],
    permits: ['driveway-row', 'site-drainage'],
    scope: ['NEW DRIVEWAY AND APRON.', 'RIGHT-OF-WAY RESTORATION.'],
  },
];

export const PERMIT_TYPES: PermitType[] = [
  {
    id: 'residential-pool',
    label: 'Residential Swimming Pool Permit',
    submittals: [
      'Signed & sealed engineered plan set',
      'Boundary survey (signed & sealed)',
      'Notice of commencement (over threshold)',
      'Pool barrier / safety compliance affidavit',
      'Contractor license & liability insurance',
      'Site work inspection scheduled by applicant',
    ],
  },
  {
    id: 'accessory-structure',
    label: 'Accessory Structure Permit',
    submittals: ['Site plan with setbacks', 'Signed & sealed structural details', 'Product approval / NOA sheets'],
  },
  {
    id: 'electrical-sub',
    label: 'Electrical Sub-Permit',
    submittals: ['Bonding & equipotential grid plan (NEC 680.26)', 'Panel / load calculation', 'Licensed electrical contractor info'],
  },
  {
    id: 'plumbing-sub',
    label: 'Plumbing Sub-Permit',
    submittals: ['Pool plumbing layout', 'VGBA compliant suction outlet documentation', 'Backflow prevention detail'],
  },
  {
    id: 'gas-sub',
    label: 'Gas Sub-Permit',
    submittals: ['Gas pipe sizing & isometric', 'Meter capacity verification', 'Florida Fuel Gas Code compliance notes'],
  },
  {
    id: 'site-drainage',
    label: 'Site / Drainage Permit',
    submittals: ['Impervious area calculation', 'Grading & drainage plan', 'Erosion control plan (silt fence)'],
  },
  { id: 'fence-permit', label: 'Fence Permit', submittals: ['Site plan with fence location', 'Fence elevation & gate detail', 'Barrier height certification'] },
  { id: 'driveway-row', label: 'Driveway / Right-of-Way Permit', submittals: ['Right-of-way sketch', 'Culvert / swale detail', 'Maintenance of traffic (if applicable)'] },
];

const FBC_2023 = ['FBC 2023 8TH EDITION', 'FBC-RESIDENTIAL 2023', 'NEC 2023 (NFPA 70)', 'FLORIDA FUEL GAS CODE 2023'];

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: 'port-richey-pasco',
    city: 'Port Richey',
    county: 'Pasco County',
    authority: 'Pasco County Building Construction Services',
    codes: FBC_2023,
    windSpeedMph: 150,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 50,
    setbacks: { rearFt: 5, sideFt: 5, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    requiredNoteGroups: ['site', 'structural', 'bonding'],
    localRequirements: [
      'Paver deck / retaining wall to be permitted separately if applicable',
      'Site work inspection required on all issued residential pool permits',
      'Excess fill must be hauled offsite, no on-site redistribution',
      'Erosion control at limits of construction / property line',
    ],
    requiresEngineerSeal: true,
    reference: true,
  },
  {
    id: 'new-port-richey-pasco',
    city: 'New Port Richey',
    county: 'Pasco County',
    authority: 'City of New Port Richey Building Division',
    codes: FBC_2023,
    windSpeedMph: 150,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 50,
    setbacks: { rearFt: 5, sideFt: 5, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    requiredNoteGroups: ['site', 'structural', 'bonding'],
    localRequirements: ['City zoning review prior to building review', 'Tree protection plan where grand trees are present'],
    requiresEngineerSeal: true,
  },
  {
    id: 'tampa-hillsborough',
    city: 'Tampa',
    county: 'Hillsborough County',
    authority: 'City of Tampa Construction Services Center',
    codes: FBC_2023,
    windSpeedMph: 150,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 60,
    setbacks: { rearFt: 5, sideFt: 5, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1', 'D1'],
    requiredNoteGroups: ['site', 'structural', 'bonding', 'barrier'],
    localRequirements: ['Stormwater / impervious worksheet required', 'Tree removal permit reviewed with pool permit'],
    requiresEngineerSeal: true,
  },
  {
    id: 'orlando-orange',
    city: 'Orlando',
    county: 'Orange County',
    authority: 'City of Orlando Permitting Services',
    codes: FBC_2023,
    windSpeedMph: 140,
    exposure: 'B',
    riskCategory: 'II',
    maxImperviousPct: 55,
    setbacks: { rearFt: 5, sideFt: 7.5, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    requiredNoteGroups: ['site', 'structural', 'bonding'],
    localRequirements: ['Survey less than 5 years old', 'Screened equipment location shown on plan'],
    requiresEngineerSeal: true,
  },
  {
    id: 'windermere-orange',
    city: 'Windermere',
    county: 'Orange County',
    authority: 'Town of Windermere Building Department',
    codes: FBC_2023,
    windSpeedMph: 140,
    exposure: 'B',
    riskCategory: 'II',
    maxImperviousPct: 45,
    setbacks: { rearFt: 7.5, sideFt: 7.5, frontFt: 30, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1', 'D1'],
    requiredNoteGroups: ['site', 'structural', 'bonding', 'barrier'],
    localRequirements: ['Lakefront setback review where applicable', 'Construction parking / staging plan'],
    requiresEngineerSeal: true,
  },
  {
    id: 'cape-coral-lee',
    city: 'Cape Coral',
    county: 'Lee County',
    authority: 'City of Cape Coral Building Division',
    codes: FBC_2023,
    windSpeedMph: 172,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 55,
    setbacks: { rearFt: 5, sideFt: 5, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    requiredNoteGroups: ['site', 'structural', 'bonding', 'barrier'],
    localRequirements: ['Seawall / canal setback verification', 'Higher design wind pressures for enclosures (172 mph)'],
    requiresEngineerSeal: true,
  },
  {
    id: 'naples-collier',
    city: 'Naples',
    county: 'Collier County',
    authority: 'Collier County Growth Management',
    codes: FBC_2023,
    windSpeedMph: 172,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 50,
    setbacks: { rearFt: 10, sideFt: 7.5, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1', 'D1'],
    requiredNoteGroups: ['site', 'structural', 'bonding', 'barrier'],
    localRequirements: ['Coastal construction control line review where applicable', 'Vegetation removal permit'],
    requiresEngineerSeal: true,
  },
  {
    id: 'sarasota-sarasota',
    city: 'Sarasota',
    county: 'Sarasota County',
    authority: 'Sarasota County Building Services',
    codes: FBC_2023,
    windSpeedMph: 155,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 50,
    setbacks: { rearFt: 8, sideFt: 6, frontFt: 25, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    requiredNoteGroups: ['site', 'structural', 'bonding'],
    localRequirements: ['Flood zone / base flood elevation note required', 'Neighborhood grading compliance'],
    requiresEngineerSeal: true,
  },
  {
    id: 'st-petersburg-pinellas',
    city: 'St. Petersburg',
    county: 'Pinellas County',
    authority: 'City of St. Petersburg Development Review',
    codes: FBC_2023,
    windSpeedMph: 150,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 60,
    setbacks: { rearFt: 5, sideFt: 5, frontFt: 20, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1', 'D1'],
    requiredNoteGroups: ['site', 'structural', 'bonding', 'barrier'],
    localRequirements: ['Coastal high hazard area review', 'Impervious surface ratio worksheet'],
    requiresEngineerSeal: true,
  },
  {
    id: 'miami-dade',
    city: 'Miami',
    county: 'Miami-Dade County',
    authority: 'Miami-Dade / City of Miami Building Department',
    codes: [...FBC_2023, 'HIGH VELOCITY HURRICANE ZONE (HVHZ) PROVISIONS'],
    windSpeedMph: 175,
    exposure: 'C',
    riskCategory: 'II',
    maxImperviousPct: 55,
    setbacks: { rearFt: 7.5, sideFt: 7.5, frontFt: 20, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1', 'B1'],
    requiredNoteGroups: ['site', 'structural', 'bonding', 'barrier'],
    localRequirements: ['HVHZ product approval (Miami-Dade NOA) for all enclosures and screens', 'Separate barrier plan sheet required', 'Zoning improvement plan review'],
    requiresEngineerSeal: true,
  },
  {
    id: 'jacksonville-duval',
    city: 'Jacksonville',
    county: 'Duval County',
    authority: 'City of Jacksonville Building Inspection Division',
    codes: FBC_2023,
    windSpeedMph: 130,
    exposure: 'B',
    riskCategory: 'II',
    maxImperviousPct: 60,
    setbacks: { rearFt: 5, sideFt: 5, frontFt: 20, poolToHouseFt: 3 },
    barrierHeightIn: 48,
    requiredSheets: ['A1', 'S1', 'S2', 'E1', 'P1'],
    requiredNoteGroups: ['site', 'structural', 'bonding'],
    localRequirements: ['Septic / well clearance verification where applicable'],
    requiresEngineerSeal: true,
  },
];

export const findJurisdiction = (id: string) => JURISDICTIONS.find(j => j.id === id) || JURISDICTIONS[0];
export const findProjectType = (id: ProjectTypeId) => PROJECT_TYPES.find(p => p.id === id) || PROJECT_TYPES[0];
export const findPermitType = (id: PermitTypeId) => PERMIT_TYPES.find(p => p.id === id);

/** Sheets required for a jurisdiction + project type combination, in canonical order */
export function resolveSheets(jurisdictionId: string, projectTypeId: ProjectTypeId): string[] {
  const j = findJurisdiction(jurisdictionId);
  const p = findProjectType(projectTypeId);
  const order = ['A1', 'S1', 'S2', 'ST1', 'E1', 'P1', 'B1', 'D1', 'F1'];
  const set = new Set<string>(p.sheets);
  // A jurisdiction only forces its extra sheets that are relevant to the scope
  j.requiredSheets.forEach(code => {
    if (p.sheets.includes(code) || code === 'A1' || code === 'B1' || code === 'D1') set.add(code);
  });
  return order.filter(code => set.has(code));
}

/** Note groups printed for a jurisdiction + project type combination */
export function resolveNoteGroups(jurisdictionId: string, projectTypeId: ProjectTypeId, sheets: string[]): string[] {
  const j = findJurisdiction(jurisdictionId);
  const groups = new Set<string>(j.requiredNoteGroups);
  if (projectTypeId === 'concrete-pool' || projectTypeId === 'fiberglass-pool' || projectTypeId === 'spa-only') {
    groups.add('sofa');
    groups.add('plumbing');
  }
  if (sheets.includes('F1')) groups.add('barrier');
  return Array.from(groups);
}
