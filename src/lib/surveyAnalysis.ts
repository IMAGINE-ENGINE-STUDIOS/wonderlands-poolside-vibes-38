/**
 * Survey analysis: turns an uploaded boundary / topographic / plot survey into
 * (a) structured permit data for the title block and info boxes, and
 * (b) real editable site polygons on the drawing board.
 *
 * Geometry comes back normalized to the lot bounding box, so it is re-projected
 * onto the canvas at a true scale derived from the lot dimensions. Every point
 * lands as a normal draggable vertex — nothing is baked into an image.
 */
import { supabase } from '@/integrations/supabase/client';
import { CANVAS_H, CANVAS_W, type SiteLayerId, type SitePlanData, type SiteShape } from '@/components/blueprint/SiteDrawingBoard';
import type { BlueprintProject, SurveyRecord } from '@/components/blueprint/types';

export interface SurveyAnalysisInput {
  imageDataUrl: string;
  textLayer?: string;
}

export async function analyzeSurveySheet({ imageDataUrl, textLayer }: SurveyAnalysisInput): Promise<SurveyRecord> {
  const { data, error } = await supabase.functions.invoke('analyze-survey', {
    body: { imageDataUrl, textLayer },
  });
  if (error) throw new Error(error.message || 'The survey could not be analyzed.');
  const payload = data as { survey?: SurveyRecord; error?: string };
  if (payload?.error) throw new Error(payload.error);
  if (!payload?.survey) throw new Error('No survey data could be read from that sheet.');
  return payload.survey;
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Feet per canvas pixel chosen so the whole lot fits with a comfortable margin. */
export function scaleForLot(widthFt: number | null, depthFt: number | null): number {
  const w = widthFt && widthFt > 0 ? widthFt : 60;
  const d = depthFt && depthFt > 0 ? depthFt : 120;
  const fit = Math.min((CANVAS_W - 160) / w, (CANVAS_H - 120) / d);
  return Math.max(1, Math.min(24, +fit.toFixed(2)));
}

const VALID_LAYERS: SiteLayerId[] = ['property', 'building', 'driveway', 'patio', 'pool', 'deck', 'gravel', 'fence', 'equipment'];

/**
 * Projects the normalized survey geometry onto the drawing canvas at a real
 * scale and returns editable site shapes plus the matching px/ft.
 */
export function vectorizeSurvey(survey: SurveyRecord, existing: SitePlanData): SitePlanData {
  const widthFt = num(survey.lot?.widthFt);
  const depthFt = num(survey.lot?.depthFt);
  const pxPerFt = scaleForLot(widthFt, depthFt);
  const lotW = (widthFt && widthFt > 0 ? widthFt : 60) * pxPerFt;
  const lotH = (depthFt && depthFt > 0 ? depthFt : 120) * pxPerFt;
  const originX = (CANVAS_W - lotW) / 2;
  const originY = (CANVAS_H - lotH) / 2;

  const project = (pair: unknown): { x: number; y: number } | null => {
    if (!Array.isArray(pair) || pair.length < 2) return null;
    const nx = num(pair[0]);
    const ny = num(pair[1]);
    if (nx === null || ny === null) return null;
    return { x: originX + nx * lotW, y: originY + ny * lotH };
  };

  const stamp = Date.now();
  const shapes: SiteShape[] = [];

  const lotPts = (survey.geometry?.lotPolygon || []).map(project).filter(Boolean) as { x: number; y: number }[];
  if (lotPts.length >= 3) {
    shapes.push({ id: `survey-${stamp}-lot`, layer: 'property', points: lotPts, closed: true, importedFrom: 'Survey' });
  } else {
    shapes.push({
      id: `survey-${stamp}-lot`,
      layer: 'property',
      points: [
        { x: originX, y: originY },
        { x: originX + lotW, y: originY },
        { x: originX + lotW, y: originY + lotH },
        { x: originX, y: originY + lotH },
      ],
      closed: true,
      importedFrom: 'Survey',
    });
  }

  (survey.geometry?.features || []).forEach((feature, i) => {
    const pts = (feature?.points || []).map(project).filter(Boolean) as { x: number; y: number }[];
    if (pts.length < 2) return;
    const layer = VALID_LAYERS.includes(feature.layer as SiteLayerId) ? (feature.layer as SiteLayerId) : 'patio';
    shapes.push({
      id: `survey-${stamp}-${i}`,
      layer,
      points: pts,
      closed: feature.closed !== false && pts.length > 2,
      importedFrom: `Survey — ${feature.label || layer}`,
    });
  });

  return { ...existing, pxPerFt, shapes };
}

const firstText = (...values: (string | null | undefined)[]) => values.find(v => v && v.trim())?.trim() || '';

/** Merges the extracted survey values into the blueprint project fields. */
export function applySurveyToProject(
  draft: BlueprintProject,
  survey: SurveyRecord,
  site: SitePlanData
): BlueprintProject {
  const p = survey.property || {};
  const lotLabel = firstText(
    p.lotNumber && p.subdivision ? `LOT ${p.lotNumber}, ${p.subdivision}${p.phase ? ` PHASE ${p.phase}` : ''}` : null,
    p.subdivision
  );

  return {
    ...draft,
    site,
    survey,
    project: {
      ...draft.project,
      clientName: firstText(survey.certifiedTo?.[0], draft.project.clientName),
      address: firstText(p.streetAddress, draft.project.address),
      cityStateZip: firstText(
        p.cityStateZip,
        p.county && p.state ? `${p.county} COUNTY, ${p.state}` : null,
        draft.project.cityStateZip
      ),
      parcelId: firstText(p.parcelId, lotLabel, draft.project.parcelId),
      scale: firstText(p.scaleText, draft.project.scale),
    },
  };
}

/** Fields the permit set still needs after an import — drives the gap checklist. */
export function surveyGaps(survey: SurveyRecord): string[] {
  const gaps: string[] = [];
  const req: [string, unknown][] = [
    ['Lot dimensions', survey.lot?.widthFt && survey.lot?.depthFt],
    ['Lot area', survey.lot?.areaSf],
    ['Street address', survey.property?.streetAddress],
    ['Plat book / pages', survey.property?.platBook],
    ['Parcel ID', survey.property?.parcelId],
    ['Building setbacks', survey.setbacks && Object.values(survey.setbacks).some(v => typeof v === 'number')],
    ['Finished floor elevation', survey.elevations?.finishedFloorFt],
    ['Flood zone / FIRM panel', survey.elevations?.floodZone],
    ['Surveyor of record', survey.surveyor?.name || survey.surveyor?.firm],
    ['Traced lot boundary', (survey.geometry?.lotPolygon || []).length >= 3],
    ['Traced improvements', (survey.geometry?.features || []).length > 0],
  ];
  req.forEach(([label, value]) => {
    if (!value) gaps.push(label);
  });
  return gaps;
}
