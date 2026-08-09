import type { SitePlanData } from './SiteDrawingBoard';
import type { PermitTypeId, ProjectTypeId } from '@/data/blueprintJurisdictions';
import type { FlDigitalSignature } from '@/data/floridaDigitalSignature';

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
  /** PNG data URLs drawn with the Wonderlands signing tool */
  engineerSignatureImage?: string;
  contractorSignatureImage?: string;
  ownerSignatureImage?: string;
  sealImage?: string;
  /** Florida statutory electronic signature & seal of the design professional */
  digitalSignature?: FlDigitalSignature;
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

/* -------------------------------------------------- Survey (imported data) */

export interface SurveyBoundaryCall {
  label: string | null;
  bearing: string | null;
  distanceFt: number | null;
}

export interface SurveyGeometryFeature {
  layer: string;
  label: string;
  closed: boolean;
  points: [number, number][];
}

/** Structured data transcribed from an uploaded boundary / topographic survey */
export interface SurveyRecord {
  surveyor?: {
    firm?: string | null;
    name?: string | null;
    licenseNumber?: string | null;
    certificateOfAuthorization?: string | null;
    phone?: string | null;
    address?: string | null;
    signedDate?: string | null;
    electronicSignatureNote?: string | null;
  };
  property?: {
    lotNumber?: string | null;
    subdivision?: string | null;
    phase?: string | null;
    platBook?: string | null;
    platPages?: string | null;
    county?: string | null;
    state?: string | null;
    streetAddress?: string | null;
    cityStateZip?: string | null;
    parcelId?: string | null;
    rightOfWayStreet?: string | null;
    scaleText?: string | null;
    northArrowDeg?: number | null;
  };
  lot?: {
    widthFt?: number | null;
    depthFt?: number | null;
    areaSf?: number | null;
    boundaryCalls?: SurveyBoundaryCall[];
  };
  setbacks?: {
    frontFt?: number | null;
    frontPorchFt?: number | null;
    rearFt?: number | null;
    sideFt?: number | null;
    sideCornerFt?: number | null;
    rearPoolFt?: number | null;
  };
  elevations?: {
    finishedFloorFt?: number | null;
    benchmarkFt?: number | null;
    datum?: string | null;
    floodZone?: string | null;
    firmPanel?: string | null;
    communityNumber?: string | null;
  };
  easements?: { label: string; widthFt?: number | null; location?: string | null }[];
  structures?: { label: string; type?: string; areaSf?: number | null; dimensions?: string | null }[];
  surveyNotes?: string[];
  certifiedTo?: string[];
  revisions?: { description: string; date?: string | null }[];
  geometry?: {
    lotPolygon?: [number, number][];
    features?: SurveyGeometryFeature[];
  };
  confidence?: number;
  /** File the data was read from */
  sourceFile?: string;
}
