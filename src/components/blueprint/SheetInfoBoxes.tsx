import * as React from 'react';
import type { BlueprintProject } from './types';
import { SITE_LAYERS, measureSitePlan } from './SiteDrawingBoard';
import {
  EQUIPMENT_LEGEND,
  EQUIPMENT_OPTIONS,
  NOTE_LIBRARY,
  REFERENCE_CODES,
} from '@/data/blueprintTemplates';

const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`border border-[#0f172a] bg-white ${className || ''}`}>
    <div className="border-b border-[#0f172a] bg-[#e2e8f0] px-1.5 py-[2px] text-[7px] font-bold tracking-[0.14em] text-[#0f172a]">
      {title}
    </div>
    <div className="px-1.5 py-1">{children}</div>
  </div>
);

export const ReferenceCodesBox: React.FC = () => (
  <Panel title="REFERENCE CODE / STANDARDS">
    <p className="mb-1 text-[6.5px] text-[#64748b]">
      THESE DRAWINGS HAVE BEEN DESIGNED TO BE IN ACCORDANCE WITH THE FOLLOWING CODES:
    </p>
    <ul className="space-y-[1px] text-[7px] text-[#0f172a]">
      {REFERENCE_CODES.map(c => (
        <li key={c}>- {c}</li>
      ))}
    </ul>
  </Panel>
);

export const ScopeOfWorkBox: React.FC<{ scope: string[] }> = ({ scope }) => (
  <Panel title="SCOPE OF WORK">
    <ol className="space-y-[1px] text-[7px] text-[#0f172a]">
      {scope.map((s, i) => (
        <li key={s}>
          {i + 1}) {s}
        </li>
      ))}
    </ol>
  </Panel>
);

export const AreasBox: React.FC<{ data: BlueprintProject; maxImperviousPct: number }> = ({ data, maxImperviousPct }) => {
  const measured = measureSitePlan(data.site);
  const property = measured.propertySqFt;
  const existingTotal =
    data.existingAreas.building + data.existingAreas.driveway + data.existingAreas.patio;
  const proposedRows = SITE_LAYERS.filter(l => l.impervious).map(l => ({
    label: l.label.toUpperCase(),
    sqft: Math.round(measured.byLayer[l.id]),
  }));
  const pct = (v: number) => (property > 0 ? `${Math.round((v / property) * 100)}%` : '—');
  const over = measured.imperviousPct > maxImperviousPct;

  return (
    <Panel title="AREAS / IMPERVIOUS CALCULATION">
      <table className="w-full text-[7px]">
        <thead>
          <tr className="border-b border-[#0f172a] text-[6.5px] tracking-wider text-[#64748b]">
            <th className="py-[2px] text-left">DESCRIPTION</th>
            <th className="py-[2px] text-right">AREA (SF)</th>
            <th className="w-10 py-[2px] text-right">%</th>
          </tr>
        </thead>
        <tbody className="text-[#0f172a]">
          <tr className="border-b border-[#cbd5e1] font-semibold">
            <td className="py-[2px]">PROPERTY</td>
            <td className="py-[2px] text-right">{property.toLocaleString()}</td>
            <td className="py-[2px] text-right">100%</td>
          </tr>
          <tr>
            <td colSpan={3} className="pt-1 text-[6px] tracking-wider text-[#64748b]">
              EXISTING
            </td>
          </tr>
          <tr>
            <td className="py-[2px]">BUILDING AREAS</td>
            <td className="py-[2px] text-right">{data.existingAreas.building.toLocaleString()}</td>
            <td />
          </tr>
          <tr>
            <td className="py-[2px]">DRIVEWAY</td>
            <td className="py-[2px] text-right">{data.existingAreas.driveway.toLocaleString()}</td>
            <td />
          </tr>
          <tr>
            <td className="py-[2px]">CONC. PATIO, AC PAD</td>
            <td className="py-[2px] text-right">{data.existingAreas.patio.toLocaleString()}</td>
            <td />
          </tr>
          <tr className="border-y border-[#0f172a] font-semibold">
            <td className="py-[2px]">TOTAL EXISTING IMPERVIOUS</td>
            <td className="py-[2px] text-right">{existingTotal.toLocaleString()}</td>
            <td className="py-[2px] text-right">{pct(existingTotal)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="pt-1 text-[6px] tracking-wider text-[#64748b]">
              PROPOSED
            </td>
          </tr>
          {proposedRows.map(r => (
            <tr key={r.label}>
              <td className="py-[2px]">{r.label}</td>
              <td className="py-[2px] text-right">{r.sqft.toLocaleString()}</td>
              <td />
            </tr>
          ))}
          <tr className="border-t border-[#0f172a] font-semibold">
            <td className="py-[2px]">TOTAL IMPERVIOUS</td>
            <td className="py-[2px] text-right">{measured.imperviousSqFt.toLocaleString()}</td>
            <td className="py-[2px] text-right">{measured.imperviousPct}%</td>
          </tr>
        </tbody>
      </table>
      <p className={`mt-1 text-[6.5px] ${over ? 'font-bold text-[#b91c1c]' : 'text-[#64748b]'}`}>
        MAX ALLOWED IMPERVIOUS: {maxImperviousPct}%{over ? ' — PROPOSED EXCEEDS LIMIT, REVISE SCOPE' : ' — PROPOSED WITHIN LIMIT'}
      </p>
    </Panel>
  );
};

export const PoolDataBox: React.FC<{ data: BlueprintProject }> = ({ data }) => (
  <Panel title="POOL DATA">
    <table className="w-full text-[6.5px]">
      <thead>
        <tr className="border-b border-[#0f172a] tracking-wider text-[#64748b]">
          <th className="py-[2px] text-left">POOL</th>
          <th className="py-[2px] text-left">CODE</th>
          <th className="py-[2px] text-left">W x L</th>
          <th className="py-[2px] text-left">DEPTHS</th>
          <th className="py-[2px] text-right">GAL</th>
          <th className="py-[2px] text-right">WSA</th>
          <th className="py-[2px] text-right">PERIM</th>
          <th className="py-[2px] text-right">STEPS</th>
          <th className="py-[2px] text-right">SEATS</th>
          <th className="py-[2px] text-right">WT</th>
        </tr>
      </thead>
      <tbody className="text-[#0f172a]">
        <tr>
          <td className="py-[2px] font-semibold">{data.pool.model}</td>
          <td className="py-[2px]">{data.pool.code}</td>
          <td className="py-[2px]">{data.pool.size}</td>
          <td className="py-[2px]">{data.pool.depths}</td>
          <td className="py-[2px] text-right">{data.pool.gallons}</td>
          <td className="py-[2px] text-right">{data.pool.waterSurfaceSf}</td>
          <td className="py-[2px] text-right">{data.pool.perimeterFt}</td>
          <td className="py-[2px] text-right">{data.pool.stepsFt}</td>
          <td className="py-[2px] text-right">{data.pool.seatsFt}</td>
          <td className="py-[2px] text-right">{data.pool.weightLb}</td>
        </tr>
      </tbody>
    </table>
  </Panel>
);

export const EquipmentLegendBox: React.FC = () => (
  <Panel title="EQUIPMENT LEGEND">
    <div className="grid grid-cols-2 gap-x-3 text-[7px] text-[#0f172a]">
      {EQUIPMENT_LEGEND.map(e => (
        <div key={e.code} className="flex gap-1.5 border-b border-[#e2e8f0] py-[1px]">
          <span className="w-7 font-bold">{e.code}</span>
          <span>{e.description}</span>
        </div>
      ))}
    </div>
  </Panel>
);

export const EquipmentOptionsBox: React.FC = () => (
  <Panel title="EQUIPMENT OPTIONS">
    <table className="w-full text-[6.5px]">
      <thead>
        <tr className="border-b border-[#0f172a] tracking-wider text-[#64748b]">
          <th className="py-[2px] text-left">ITEM</th>
          <th className="py-[2px] text-left">JANDY</th>
          <th className="py-[2px] text-left">HAYWARD</th>
          <th className="py-[2px] text-left">PENTAIR</th>
        </tr>
      </thead>
      <tbody className="text-[#0f172a]">
        {EQUIPMENT_OPTIONS.map(r => (
          <tr key={r.item} className="border-b border-[#e2e8f0]">
            <td className="py-[2px] font-semibold">{r.item}</td>
            <td className="py-[2px]">{r.jandy}</td>
            <td className="py-[2px]">{r.hayward}</td>
            <td className="py-[2px]">{r.pentair}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Panel>
);

export const NotesBox: React.FC<{ groupIds: string[]; extra?: string }> = ({ groupIds, extra }) => {
  const groups = NOTE_LIBRARY.filter(g => groupIds.includes(g.id));
  if (!groups.length && !extra) return null;
  return (
    <Panel title="NOTES">
      <div className="space-y-1.5">
        {groups.map(g => (
          <div key={g.id}>
            <div className="text-[6.5px] font-bold tracking-wider text-[#0f172a]">{g.title}</div>
            <ol className="mt-[2px] space-y-[1px] text-[6.5px] leading-[1.35] text-[#334155]">
              {g.notes.map((n, i) => (
                <li key={n}>
                  {i + 1}) {n}
                </li>
              ))}
            </ol>
          </div>
        ))}
        {extra ? (
          <div>
            <div className="text-[6.5px] font-bold tracking-wider text-[#0f172a]">PROJECT SPECIFIC NOTES</div>
            <p className="whitespace-pre-wrap text-[6.5px] leading-[1.35] text-[#334155]">{extra}</p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
};

export const DetailCalloutsBox: React.FC<{ details: string[]; sheetCode: string }> = ({ details, sheetCode }) => (
  <Panel title="DETAIL CALLOUTS">
    <div className="grid grid-cols-2 gap-1.5">
      {details.map((d, i) => (
        <div key={d} className="flex min-h-[54px] flex-col border border-dashed border-[#94a3b8] p-1">
          <div className="flex items-center gap-1 text-[7px] font-bold text-[#0f172a]">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#0f172a] text-[6px]">
              {i + 1}
            </span>
            {d}
          </div>
          <div className="mt-auto text-right text-[6px] text-[#94a3b8]">{sheetCode}</div>
        </div>
      ))}
    </div>
  </Panel>
);

export const JurisdictionBox: React.FC<{
  authority: string;
  codes: string[];
  windSpeedMph: number;
  exposure: string;
  riskCategory: string;
  setbacks: { rearFt: number; sideFt: number; frontFt: number; poolToHouseFt: number };
  barrierHeightIn: number;
  localRequirements: string[];
}> = ({ authority, codes, windSpeedMph, exposure, riskCategory, setbacks, barrierHeightIn, localRequirements }) => (
  <Panel title="JURISDICTION REQUIREMENTS">
    <div className="text-[7px] text-[#0f172a]">
      <div className="font-bold uppercase">{authority}</div>
      <div className="mt-[2px] text-[6.5px] text-[#334155]">
        DESIGN WIND {windSpeedMph} MPH &middot; EXPOSURE {exposure} &middot; RISK CAT. {riskCategory}
      </div>
      <div className="text-[6.5px] text-[#334155]">
        SETBACKS: REAR {setbacks.rearFt}' &middot; SIDE {setbacks.sideFt}' &middot; FRONT {setbacks.frontFt}' &middot; POOL TO
        HOUSE {setbacks.poolToHouseFt}'
      </div>
      <div className="text-[6.5px] text-[#334155]">BARRIER MIN HEIGHT: {barrierHeightIn} IN.</div>
      <div className="mt-1 text-[6px] tracking-wider text-[#64748b]">ADOPTED CODES</div>
      <div className="text-[6.5px]">{codes.join(' | ')}</div>
      <div className="mt-1 text-[6px] tracking-wider text-[#64748b]">LOCAL REQUIREMENTS</div>
      <ul className="space-y-[1px] text-[6.5px] text-[#334155]">
        {localRequirements.map(r => (
          <li key={r}>- {r.toUpperCase()}</li>
        ))}
      </ul>
    </div>
  </Panel>
);

export default Panel;
