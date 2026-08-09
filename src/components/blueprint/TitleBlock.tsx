import * as React from 'react';
import type { BlueprintProject } from './types';
import { findJurisdiction } from '@/data/blueprintJurisdictions';
import SignaturePad from './SignaturePad';
import FloridaSealStatement from './FloridaSealStatement';
import FloridaDigitalSealDialog from './FloridaDigitalSealDialog';
import { canonicalSignaturePayload } from './signaturePayload';

type Patch = (fn: (draft: BlueprintProject) => BlueprintProject) => void;

interface Props {
  data: BlueprintProject;
  sheetCode: string;
  sheetDescription: string;
  sheetIndex: { code: string; description: string }[];
  sheetNumber: number;
  sheetCount: number;
  /** When provided the title block becomes editable in place */
  onDataChange?: Patch;
  /** Clicking a DRW row in the sheet index selects that sheet */
  onSheetSelect?: (code: string) => void;
}

/** Inline editable text — renders plain text when not editable (print safe). */
const Edit: React.FC<{
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, editable, className = '', placeholder, multiline }) => {
  if (!editable || !onChange) return <span className={className}>{value || placeholder || '—'}</span>;
  const shared =
    'w-full bg-transparent outline-none rounded-[2px] px-[2px] -mx-[2px] hover:bg-[#e2e8f0]/70 focus:bg-[#dbeafe] focus:ring-1 focus:ring-[#2563eb] print:hover:bg-transparent print:focus:bg-transparent';
  if (multiline) {
    return (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        rows={3}
        className={`${shared} resize-none ${className}`}
      />
    );
  }
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className={`${shared} ${className}`}
    />
  );
};

const Row: React.FC<{
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  editable?: boolean;
}> = ({ label, value, onChange, editable }) => (
  <div className="flex justify-between gap-2 border-b border-[#cbd5e1] py-[2px] text-[7.5px] last:border-0">
    <span className="text-[#64748b]">{label}</span>
    <span className="min-w-0 flex-1 text-right font-semibold text-[#0f172a]">
      <Edit value={value || ''} onChange={onChange} editable={editable && !!onChange} className="text-right" />
    </span>
  </div>
);

const BlockTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-y border-[#0f172a] bg-[#0f172a] px-1.5 py-[2px] text-[7.5px] font-bold tracking-[0.14em] text-white">
    {children}
  </div>
);

type SigKey = 'engineer' | 'contractor' | 'owner' | 'seal';

/**
 * Right-hand title block of the plan sheet: engineer of record, sheet index,
 * contractor, project information, revision history and signature/seal panel.
 * All fields are editable in place when `onDataChange` is supplied.
 */
export const TitleBlock: React.FC<Props> = ({
  data,
  sheetCode,
  sheetDescription,
  sheetIndex,
  sheetNumber,
  sheetCount,
  onDataChange,
  onSheetSelect,
}) => {
  const j = findJurisdiction(data.jurisdictionId);
  const editable = !!onDataChange;
  const [signing, setSigning] = React.useState<SigKey | null>(null);
  const [sealDialog, setSealDialog] = React.useState(false);
  const payload = React.useMemo(() => canonicalSignaturePayload(data), [data]);

  const setEngineer = (key: keyof BlueprintProject['engineer']) => (v: string) =>
    onDataChange?.(prev => ({ ...prev, engineer: { ...prev.engineer, [key]: v } }));
  const setContractor = (key: keyof BlueprintProject['contractor']) => (v: string) =>
    onDataChange?.(prev => ({ ...prev, contractor: { ...prev.contractor, [key]: v } }));
  const setProject = (key: keyof BlueprintProject['project']) => (v: string) =>
    onDataChange?.(prev => ({ ...prev, project: { ...prev.project, [key]: v } }));
  const setSignature = (key: keyof BlueprintProject['signatures']) => (v: string) =>
    onDataChange?.(prev => ({ ...prev, signatures: { ...prev.signatures, [key]: v } }));

  const setRevision = (index: number, key: keyof BlueprintProject['revisions'][number]) => (v: string) =>
    onDataChange?.(prev => ({
      ...prev,
      revisions: prev.revisions.map((r, i) => (i === index ? { ...r, [key]: v } : r)),
    }));

  const signatureRows: {
    key: SigKey;
    label: string;
    name: string;
    onName?: (v: string) => void;
    date: string;
    onDate: (v: string) => void;
    image?: string;
    imageKey: keyof BlueprintProject['signatures'];
  }[] = [
    {
      key: 'engineer',
      label: 'ENGINEER / ARCHITECT',
      name: data.engineer.engineerName,
      onName: setEngineer('engineerName'),
      date: data.signatures.engineerSignedDate,
      onDate: setSignature('engineerSignedDate'),
      image: data.signatures.engineerSignatureImage,
      imageKey: 'engineerSignatureImage',
    },
    {
      key: 'contractor',
      label: 'CONTRACTOR',
      name: data.signatures.contractorSignerName,
      onName: setSignature('contractorSignerName'),
      date: data.signatures.contractorSignedDate,
      onDate: setSignature('contractorSignedDate'),
      image: data.signatures.contractorSignatureImage,
      imageKey: 'contractorSignatureImage',
    },
    {
      key: 'owner',
      label: 'OWNER ACKNOWLEDGEMENT',
      name: data.signatures.ownerSignerName,
      onName: setSignature('ownerSignerName'),
      date: data.signatures.ownerSignedDate,
      onDate: setSignature('ownerSignedDate'),
      image: data.signatures.ownerSignatureImage,
      imageKey: 'ownerSignatureImage',
    },
  ];

  const activeRow = signatureRows.find(r => r.key === signing);

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-l-2 border-[#0f172a] bg-white">
      {/* Engineer of record */}
      <div className="px-1.5 pb-1 pt-1.5">
        <div className="text-[15px] font-black leading-none tracking-[0.2em] text-[#0f172a]">
          <Edit value={data.engineer.firm} onChange={setEngineer('firm')} editable={editable} placeholder="ENGINEER" />
        </div>
        <div className="mt-1 space-y-[1px] text-[7px] leading-tight text-[#334155]">
          <div>
            LICENSE{' '}
            <Edit value={data.engineer.firmLicense} onChange={setEngineer('firmLicense')} editable={editable} />
          </div>
          <Edit value={data.engineer.address} onChange={setEngineer('address')} editable={editable} />
          <Edit value={data.engineer.website} onChange={setEngineer('website')} editable={editable} />
        </div>
      </div>
      <BlockTitle>ENGINEER OF RECORD</BlockTitle>
      <div className="px-1.5 py-1 text-[7.5px] leading-tight text-[#0f172a]">
        <div className="font-bold">
          <Edit value={data.engineer.engineerName} onChange={setEngineer('engineerName')} editable={editable} />
        </div>
        <div>
          LICENSE NO.{' '}
          <Edit value={data.engineer.engineerLicense} onChange={setEngineer('engineerLicense')} editable={editable} />
        </div>
        <Edit value={data.engineer.engineerEmail} onChange={setEngineer('engineerEmail')} editable={editable} />
        <div className="mt-1 text-[6px] leading-[1.35] text-[#64748b]">
          <Edit
            value={data.engineer.sealDisclaimer}
            onChange={setEngineer('sealDisclaimer')}
            editable={editable}
            multiline
            className="text-[6px] leading-[1.35]"
          />
        </div>
      </div>

      {/* Seal + signatures */}
      <BlockTitle>SEAL &amp; SIGNATURES</BlockTitle>
      <div className="px-1.5 py-1.5">
        <button
          type="button"
          disabled={!editable}
          onClick={() => setSigning('seal')}
          className="mx-auto flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#94a3b8] text-center text-[6px] font-semibold leading-tight tracking-wide text-[#94a3b8] disabled:cursor-default"
          title={editable ? 'Draw the digital seal' : undefined}
        >
          {data.signatures.sealImage ? (
            <img src={data.signatures.sealImage} alt="Digital seal" className="h-full w-full object-contain" />
          ) : (
            <span>
              DIGITAL SEAL
              <br />
              &amp; SIGNATURE
            </span>
          )}
        </button>
        <div className="mt-2 space-y-2">
          {signatureRows.map(sig => (
            <div key={sig.key}>
              <button
                type="button"
                disabled={!editable}
                onClick={() => setSigning(sig.key)}
                className="block h-[18px] w-full border-b border-[#0f172a] text-left disabled:cursor-default"
                title={editable ? `Sign as ${sig.label.toLowerCase()}` : undefined}
              >
                {sig.image ? (
                  <img src={sig.image} alt={`${sig.label} signature`} className="h-[18px] w-auto object-contain" />
                ) : editable ? (
                  <span className="text-[6px] uppercase tracking-wider text-[#94a3b8]">Click to sign</span>
                ) : null}
              </button>
              <div className="flex items-center justify-between gap-1 text-[6.5px] text-[#64748b]">
                <span className="shrink-0">{sig.label}</span>
                <span className="min-w-0 flex-1 text-right">
                  <Edit
                    value={sig.date}
                    onChange={sig.onDate}
                    editable={editable}
                    placeholder="DATE"
                    className="text-right text-[6.5px]"
                  />
                </span>
              </div>
              <div className="text-[7px] font-semibold text-[#0f172a]">
                <Edit value={sig.name} onChange={sig.onName} editable={editable} placeholder="NAME" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5">
          <FloridaSealStatement
            signature={data.signatures.digitalSignature}
            payload={payload}
            onClick={editable ? () => setSealDialog(true) : undefined}
          />
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
            <tr
              key={s.code}
              onClick={onSheetSelect ? () => onSheetSelect(s.code) : undefined}
              className={`${s.code === sheetCode ? 'bg-[#e2e8f0] font-bold' : ''} ${
                onSheetSelect ? 'cursor-pointer hover:bg-[#dbeafe]' : ''
              }`}
              title={onSheetSelect ? `Open sheet ${s.code}` : undefined}
            >
              <td className="px-1.5 py-[2px]">{s.code}</td>
              <td className="px-1.5 py-[2px]">{s.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Contractor */}
      <BlockTitle>CONTRACTOR</BlockTitle>
      <div className="px-1.5 py-1 text-[7.5px] leading-tight text-[#0f172a]">
        <div className="font-bold">
          <Edit value={data.contractor.tradeName} onChange={setContractor('tradeName')} editable={editable} />
        </div>
        <Edit value={data.contractor.legalName} onChange={setContractor('legalName')} editable={editable} />
        <div>
          LICENSE NUMBER:{' '}
          <Edit value={data.contractor.license} onChange={setContractor('license')} editable={editable} />
        </div>
        <Edit value={data.contractor.address} onChange={setContractor('address')} editable={editable} />
        {editable || data.contractor.phone ? (
          <Edit value={data.contractor.phone} onChange={setContractor('phone')} editable={editable} placeholder="PHONE" />
        ) : null}
      </div>

      {/* Project info */}
      <BlockTitle>PROJECT INFORMATION</BlockTitle>
      <div className="px-1.5 py-1 text-[7.5px] leading-tight text-[#0f172a]">
        <div className="font-bold uppercase">
          <Edit value={data.project.title} onChange={setProject('title')} editable={editable} />
        </div>
        <div className="uppercase">
          <Edit value={data.project.clientName} onChange={setProject('clientName')} editable={editable} />
        </div>
        <div className="uppercase">
          <Edit value={data.project.address} onChange={setProject('address')} editable={editable} />
        </div>
        <div className="uppercase">
          <Edit value={data.project.cityStateZip} onChange={setProject('cityStateZip')} editable={editable} />
        </div>
        <div className="mt-1 space-y-0">
          <Row
            label="PARCEL ID"
            value={data.project.parcelId}
            onChange={setProject('parcelId')}
            editable={editable}
          />
          <Row label="AUTHORITY" value={j.authority} />
          <Row label="WIND / EXP." value={`${j.windSpeedMph} MPH / ${j.exposure}`} />
          <Row label="SCALE" value={data.project.scale} onChange={setProject('scale')} editable={editable} />
        </div>
      </div>

      {/* Revisions */}
      <BlockTitle>REVISIONS</BlockTitle>
      <table className="w-full text-[6.5px]">
        <tbody>
          {data.revisions
            .map((r, i) => ({ r, i }))
            .reverse()
            .map(({ r, i }) => (
              <tr key={`${r.rev}-${i}`} className="border-b border-[#cbd5e1]">
                <td className="w-4 px-1 py-[2px] font-bold">
                  <Edit value={r.rev} onChange={setRevision(i, 'rev')} editable={editable} />
                </td>
                <td className="px-1 py-[2px] uppercase">
                  <Edit value={r.description} onChange={setRevision(i, 'description')} editable={editable} />
                </td>
                <td className="px-1 py-[2px]">
                  <Edit value={r.drawn} onChange={setRevision(i, 'drawn')} editable={editable} />
                </td>
                <td className="px-1 py-[2px]">
                  <Edit value={r.drawnDate} onChange={setRevision(i, 'drawnDate')} editable={editable} />
                </td>
                <td className="px-1 py-[2px]">
                  <Edit value={r.approved} onChange={setRevision(i, 'approved')} editable={editable} />
                </td>
                <td className="px-1 py-[2px]">
                  <Edit value={r.approvedDate} onChange={setRevision(i, 'approvedDate')} editable={editable} />
                </td>
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
              <Edit value={data.project.jobNumber} onChange={setProject('jobNumber')} editable={editable} /> -{' '}
              {data.project.title}
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

      {editable ? (
        <SignaturePad
          open={signing !== null}
          onOpenChange={open => setSigning(open ? signing : null)}
          title={signing === 'seal' ? 'Digital seal & signature' : activeRow ? `Sign — ${activeRow.label}` : 'Sign'}
          onApply={dataUrl => {
            if (signing === 'seal') setSignature('sealImage')(dataUrl);
            else if (activeRow) setSignature(activeRow.imageKey)(dataUrl);
          }}
        />
      ) : null}

      {editable ? (
        <FloridaDigitalSealDialog
          open={sealDialog}
          onOpenChange={setSealDialog}
          payload={payload}
          value={data.signatures.digitalSignature}
          defaultSignerName={data.engineer.engineerName}
          defaultLicense={data.engineer.engineerLicense}
          onApply={signature =>
            onDataChange?.(prev => ({
              ...prev,
              signatures: { ...prev.signatures, digitalSignature: signature },
              engineer: { ...prev.engineer, shaCode: signature.authCode },
            }))
          }
          onRemove={() =>
            onDataChange?.(prev => ({
              ...prev,
              signatures: { ...prev.signatures, digitalSignature: undefined },
              engineer: { ...prev.engineer, shaCode: '' },
            }))
          }
        />
      ) : null}
    </aside>
  );
};

export default TitleBlock;
