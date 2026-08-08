import type { SitePlanData } from './SiteDrawingBoard';
import type { PermitTypeId, ProjectTypeId } from '@/data/blueprintJurisdictions';

export interface EngineerBlock {
  firm: string;
  firmLicense: string;
  address: string;
  website: string;
  engineerName: string;
  engineerLicense: string;
  engineerEmail: string;
  shaCode: string;
  sealDisclaimer: string;
}

export interface ContractorBlock {
  tradeName: string;
  legalName: string;
  license: string;
  address: string;
  phone: string;
}

export interface ProjectBlock {
  jobNumber: string;
  title: string;
  clientName: string;
  address: string;
  cityStateZip: string;
  parcelId: string;
  scale: string;
  pageSize: string;
  filePath: string;
}

export interface RevisionRow {
  rev: string;
  description: string;
  drawn: string;
  drawnDate: string;
  approved: string;
  approvedDate: string;
}

export interface PoolDataRow {
  model: string;
  code: string;
  size: string;
  depths: string;
  gallons: string;
  waterSurfaceSf: string;
  perimeterFt: string;
  stepsFt: string;
  seatsFt: string;
  weightLb: string;
}

export interface SignatureBlockData {
  engineerSignedDate: string;
  contractorSignerName: string;
  contractorSignedDate: string;
  ownerSignerName: string;
  ownerSignedDate: string;
  sealNote: string;
}

export interface BlueprintProject {
  jurisdictionId: string;
  projectTypeId: ProjectTypeId;
  permitTypeIds: PermitTypeId[];
  engineer: EngineerBlock;
  contractor: ContractorBlock;
  project: ProjectBlock;
  revisions: RevisionRow[];
  pool: PoolDataRow;
  scopeOfWork: string[];
  /** Existing (pre-construction) area rows, sq ft */
  existingAreas: { building: number; driveway: number; patio: number };
  site: SitePlanData;
  signatures: SignatureBlockData;
  /** Sheet code -> extra sheet-specific notes typed by the user */
  sheetNotes: Record<string, string>;
  /** Sheet codes the user disabled from the resolved set */
  disabledSheets: string[];
}
