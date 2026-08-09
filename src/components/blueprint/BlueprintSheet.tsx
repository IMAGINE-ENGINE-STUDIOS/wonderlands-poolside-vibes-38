import * as React from 'react';
import TitleBlock from './TitleBlock';
import SiteDrawingBoard from './SiteDrawingBoard';
import {
  AreasBox,
  DetailCalloutsBox,
  EquipmentLegendBox,
  EquipmentOptionsBox,
  JurisdictionBox,
  NotesBox,
  PoolDataBox,
  ReferenceCodesBox,
  ScopeOfWorkBox,
  SurveyDataBox,
} from './SheetInfoBoxes';
import type { BlueprintProject } from './types';
import { SHEET_TEMPLATES } from '@/data/blueprintTemplates';
import { findJurisdiction } from '@/data/blueprintJurisdictions';

interface Props {
  data: BlueprintProject;
  sheetCode: string;
  sheets: string[];
  noteGroups: string[];
  onSiteChange: (site: BlueprintProject['site']) => void;
  /** Enables in-place editing of the title block fields and signatures */
  onDataChange?: (fn: (draft: BlueprintProject) => BlueprintProject) => void;
  /** Selecting a DRW row in the sheet index switches the active sheet */
  onSheetSelect?: (code: string) => void;
  /** Print/preview mode disables drawing tools */
  readOnly?: boolean;
  /** Opens the blueprint import dialog from the drawing board toolbar */
  onRequestImport?: () => void;
}

/**
 * One 36 x 24 plan sheet: drawing area + note/legend column on the left,
 * full architectural title block on the right.
 */
export const BlueprintSheet: React.FC<Props> = ({ data, sheetCode, sheets, noteGroups, onSiteChange, onDataChange, onSheetSelect, readOnly, onRequestImport }) => {
  const template = SHEET_TEMPLATES[sheetCode];
  const j = findJurisdiction(data.jurisdictionId);
  const sheetIndex = sheets.map(code => ({ code, description: SHEET_TEMPLATES[code]?.description || code }));
  const sheetNumber = sheets.indexOf(sheetCode) + 1;
  if (!template) return null;

  const sheetNoteGroups = template.noteGroups.filter(g => noteGroups.includes(g));

  return (
    <div className="bp-sheet flex border-2 border-[#0f172a] bg-white text-[#0f172a] shadow-xl">
      {/* Drawing + info column */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-2">
        <header className="flex items-baseline justify-between border-b border-[#0f172a] pb-1">
          <h2 className="text-[13px] font-black tracking-[0.18em]">{template.description}</h2>
          <span className="text-[7px] tracking-wider text-[#64748b]">
            {data.project.jobNumber} &middot; {j.city.toUpperCase()}, {j.county.toUpperCase()} &middot; SCALE {data.project.scale}
          </span>
        </header>

        {template.hasSitePlan ? (
          <div className="rounded-sm border border-[#0f172a] p-1">
            <SiteDrawingBoard
              data={data.site}
              onChange={onSiteChange}
              readOnly={readOnly}
              height={readOnly ? 420 : undefined}
              onRequestImport={onRequestImport}
            />
          </div>
        ) : null}

        {template.hasSitePlan && data.survey ? <SurveyDataBox data={data} /> : null}

        {template.details ? <DetailCalloutsBox details={template.details} sheetCode={sheetCode} /> : null}

        <div className="grid grid-cols-2 gap-2">
          {template.tables.includes('referenceCodes') ? <ReferenceCodesBox /> : null}
          {template.tables.includes('scopeOfWork') ? <ScopeOfWorkBox scope={data.scopeOfWork} /> : null}
          {template.tables.includes('areas') ? <AreasBox data={data} maxImperviousPct={j.maxImperviousPct} /> : null}
          {template.tables.includes('poolData') ? (
            <div className="col-span-2">
              <PoolDataBox data={data} />
            </div>
          ) : null}
          {template.tables.includes('equipmentLegend') ? <EquipmentLegendBox /> : null}
          {template.tables.includes('equipmentOptions') ? (
            <div className="col-span-2">
              <EquipmentOptionsBox />
            </div>
          ) : null}
          {sheetCode === 'A1' ? (
            <JurisdictionBox
              authority={j.authority}
              codes={j.codes}
              windSpeedMph={j.windSpeedMph}
              exposure={j.exposure}
              riskCategory={j.riskCategory}
              setbacks={j.setbacks}
              barrierHeightIn={j.barrierHeightIn}
              localRequirements={j.localRequirements}
            />
          ) : null}
        </div>

        <NotesBox groupIds={sheetNoteGroups} extra={data.sheetNotes[sheetCode]} />
      </div>

      <TitleBlock
        data={data}
        sheetCode={sheetCode}
        sheetDescription={template.description}
        sheetIndex={sheetIndex}
        sheetNumber={sheetNumber}
        sheetCount={sheets.length}
        onDataChange={readOnly ? undefined : onDataChange}
        onSheetSelect={readOnly ? undefined : onSheetSelect}
      />
    </div>
  );
};

export default BlueprintSheet;
