import * as React from 'react';
import type { BlueprintProject } from './types';
import { findJurisdiction } from '@/data/blueprintJurisdictions';

interface Props {
  data: BlueprintProject;
  sheetCode: string;
  sheetDescription: string;
  sheetIndex: { code: string; description: string }[];
  sheetNumber: number;
  sheetCount: number;
}

const Row: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-2 border-b border-[#cbd5e1] py-[2px] text-[7.5px] last:border-0">
    <span className="text-[#64748b]">{label}</span>
    <span className="text-right font-semibold text-[#0f172a]">{value || '—'}</span>
  </div>
);

const BlockTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-y border-[#0f172a] bg-[#0f172a] px-1.5 py-[2px] text-[7.5px] font-bold tracking-[0.14em] text-white">
    {children}
  </div>
);

/**
 * Right-hand title block of the plan sheet: engineer of record, sheet index,
 * contractor, project information, revision history and signature/seal panel.
 */
export const TitleBlock: React.FC<Props> = ({ data, sheetCode, sheetDescription, sheetIndex, sheetNumber, sheetCount }) => {
  const j = findJurisdiction(data.jurisdictionId);

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-l-2 border-[#0f172a] bg-white">
      {/* Engineer of record */}
      <div className="px-1.5 pb-1 pt-1.5">
        <div className="text-[15px] font-black leading-none tracking-[0.2em] text-[#0f172a]">
          {data.engineer.firm || 'ENGINEER'}
        </div>
        <div className="mt-1 space-y-[1px] text-[7px] leading-tight text-[#334155]">
          <div>LICENSE {data.engineer.firmLicense}</div>
          <div>{data.engineer.address}</div>
          <div>{data.engineer.website}</div>
        </div>
      </div>
      <BlockTitle>ENGINEER OF RECORD</BlockTitle>
      <div className="px-1.5 py-1 text-[7.5px] leading-tight text-[#0f172a]">
        <div className="font-bold">{data.engineer.engineerName}</div>
        <div>LICENSE NO. {data.engineer.engineerLicense}</div>
        <div>{data.engineer.engineerEmail}</div>
        <p className="mt-1 text-[6px] leading-[1.35] text-[#64748b]">{data.engineer.sealDisclaimer}</p>
      </div>

      {/* Seal + signatures */}
      <BlockTitle>SEAL &amp; SIGNATURES</BlockTitle>
      <div className="px-1.5 py-1.5">
        <div className="mx-auto flex h-[86px] w-[86px] items-center justify-center rounded-full border-2 border-dashed border-[#94a3b8] text-center text-[6px] font-semibold leading-tight tracking-wide text-[#94a3b8]">
          DIGITAL SEAL
          <br />
          &amp; SIGNATURE
        </div>
        <div className="mt-2 space-y-2">
          {[
            { label: 'ENGINEER / ARCHITECT', name: data.engineer.engineerName, date: data.signatures.engineerSignedDate },
            { label: 'CONTRACTOR', name: data.signatures.contractorSignerName, date: data.signatures.contractorSignedDate },
            { label: 'OWNER ACKNOWLEDGEMENT', name: data.signatures.ownerSignerName, date: data.signatures.ownerSignedDate },
          ].map(sig => (
            <div key={sig.label}>
              <div className="h-[14px] border-b border-[#0f172a]" />
              <div className="flex justify-between text-[6.5px] text-[#64748b]">
                <span>{sig.label}</span>
                <span>{sig.date || 'DATE'}</span>
              </div>
              <div className="text-[7px] font-semibold text-[#0f172a]">{sig.name || ''}</div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 text-[6px] leading-tight text-[#64748b]">
          SHA AUTH CODE: <span className="font-mono text-[#0f172a]">{data.engineer.shaCode || '—'}</span>
        </div>
      </div>

      {/* Sheet index */}
      <BlockTitle>SHEET INDEX</BlockTitle>
      <table className="w-full text-[7px]">
        <thead>
          <tr className="border-b border-[#0f172a] text-[6.5px] tracking-wider text-[#64748b]">
            <th className="w-8 px-1.5 py-[2px] text-left">DRW</th>
            <th className="px-1.5 py-[2px] text-left">DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          {sheetIndex.map(s => (
            <tr key={s.code} className={s.code === sheetCode ? 'bg-[#e2e8f0] font-bold' : ''}>
              <td className="px-1.5 py-[2px]">{s.code}</td>
              <td className="px-1.5 py-[2px]">{s.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Contractor */}
      <BlockTitle>CONTRACTOR</BlockTitle>
      <div className="px-1.5 py-1 text-[7.5px] leading-tight text-[#0f172a]">
        <div className="font-bold">{data.contractor.tradeName}</div>
        <div>{data.contractor.legalName}</div>
        <div>LICENSE NUMBER: {data.contractor.license}</div>
        <div>{data.contractor.address}</div>
        {data.contractor.phone ? <div>{data.contractor.phone}</div> : null}
      </div>

      {/* Project info */}
      <BlockTitle>PROJECT INFORMATION</BlockTitle>
      <div className="px-1.5 py-1 text-[7.5px] leading-tight text-[#0f172a]">
        <div className="font-bold uppercase">{data.project.title}</div>
        <div className="uppercase">{data.project.clientName}</div>
        <div className="uppercase">{data.project.address}</div>
        <div className="uppercase">{data.project.cityStateZip}</div>
        <div className="mt-1 space-y-0">
          <Row label="PARCEL ID" value={data.project.parcelId} />
          <Row label="AUTHORITY" value={j.authority} />
          <Row label="WIND / EXP." value={`${j.windSpeedMph} MPH / ${j.exposure}`} />
          <Row label="SCALE" value={data.project.scale} />
        </div>
      </div>

      {/* Revisions */}
      <BlockTitle>REVISIONS</BlockTitle>
      <table className="w-full text-[6.5px]">
        <tbody>
          {[...data.revisions].reverse().map((r, i) => (
            <tr key={`${r.rev}-${i}`} className="border-b border-[#cbd5e1]">
              <td className="w-4 px-1 py-[2px] font-bold">{r.rev}</td>
              <td className="px-1 py-[2px] uppercase">{r.description}</td>
              <td className="px-1 py-[2px]">{r.drawn}</td>
              <td className="px-1 py-[2px]">{r.drawnDate}</td>
              <td className="px-1 py-[2px]">{r.approved}</td>
              <td className="px-1 py-[2px]">{r.approvedDate}</td>
            </tr>
          ))}
          <tr className="text-[6px] tracking-wider text-[#64748b]">
            <td className="px-1 py-[2px]">R</td>
            <td className="px-1 py-[2px]">DESCRIPTION</td>
            <td className="px-1 py-[2px]">DRAWN</td>
            <td className="px-1 py-[2px]">DATE</td>
            <td className="px-1 py-[2px]">APP</td>
            <td className="px-1 py-[2px]">DATE</td>
          </tr>
        </tbody>
      </table>

      {/* Sheet identity */}
      <div className="mt-auto border-t-2 border-[#0f172a]">
        <div className="grid grid-cols-[1fr_auto] items-stretch">
          <div className="border-r border-[#0f172a] px-1.5 py-1 text-[7px] leading-tight">
            <div className="text-[6px] tracking-wider text-[#64748b]">DRAWING</div>
            <div className="font-bold uppercase text-[#0f172a]">
              {sheetCode} - {sheetDescription}
            </div>
            <div className="mt-1 text-[6px] tracking-wider text-[#64748b]">JOB</div>
            <div className="font-semibold uppercase text-[#0f172a]">
              {data.project.jobNumber} - {data.project.title}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <div className="text-[6px] tracking-wider text-[#64748b]">SHEET</div>
            <div className="text-[20px] font-black leading-none text-[#0f172a]">{sheetCode}</div>
            <div className="text-[6.5px] text-[#64748b]">
              {sheetNumber} OF {sheetCount}
            </div>
            <div className="mt-1 text-[6px] text-[#64748b]">REV {data.revisions[data.revisions.length - 1]?.rev ?? '0'}</div>
          </div>
        </div>
        <div className="border-t border-[#cbd5e1] px-1.5 py-[2px] text-[5.5px] leading-tight text-[#94a3b8]">
          {data.project.filePath} &nbsp;|&nbsp; PAGE: {data.project.pageSize}
        </div>
      </div>
    </aside>
  );
};

export default TitleBlock;
