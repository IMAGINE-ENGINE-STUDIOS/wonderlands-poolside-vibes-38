import { solarPanels, solarBatteries, rackingByCovering, roofCoverings, panelFullName, type RoofCovering } from "@/data/solarHardware";
import { suggestSolarLines, lineTotal, linesTotal, federalCredit, newSolarLine, type SolarQuoteInputs, type SolarQuoteLine } from "@/lib/solar/solarQuote";

/**
 * Solar quote block inside the Quote tool.
 * Edit mode (passcode): the rep sets size, panel, roof and battery, presses
 * "Suggest costs" to fill lines from our hardware rates, then edits any
 * quantity, price or description freely. Read mode shows the clean line list.
 * Styled with the quote's existing light palette.
 */
interface Props {
  editable: boolean;
  inputs: SolarQuoteInputs;
  onInputs: (i: SolarQuoteInputs) => void;
  lines: SolarQuoteLine[];
  onLines: (l: SolarQuoteLine[]) => void;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const SolarQuoteSection = ({ editable, inputs, onInputs, lines, onLines }: Props) => {
  const total = linesTotal(lines);
  const credit = federalCredit(total);
  const panel = solarPanels.find((p) => p.id === inputs.panelId);
  const setLine = (id: string, patch: Partial<SolarQuoteLine>) => onLines(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div className="bg-gradient-to-br from-teal-100 to-orange-100 p-4 rounded-lg space-y-3">
      <h4 className="font-semibold text-teal-600">Solar System</h4>

      {editable && (
        <div className="no-print print:hidden space-y-2 rounded-md border border-teal-200 bg-white/70 p-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <label className="space-y-1">System size (kW DC)
              <input type="number" step={0.1} min={1} value={inputs.kwDc} onChange={(e) => onInputs({ ...inputs, kwDc: Number(e.target.value) || 0 })} className="w-full border rounded px-2 py-1" />
            </label>
            <label className="space-y-1 md:col-span-2">Panel
              <select value={inputs.panelId} onChange={(e) => onInputs({ ...inputs, panelId: e.target.value })} className="w-full border rounded px-2 py-1">
                {solarPanels.map((p) => <option key={p.id} value={p.id}>{panelFullName(p)} · ${p.pricePerWatt}/W</option>)}
              </select>
            </label>
            <label className="space-y-1">Roof
              <select value={inputs.covering} onChange={(e) => onInputs({ ...inputs, covering: e.target.value as RoofCovering })} className="w-full border rounded px-2 py-1">
                {roofCoverings.map((c) => <option key={c} value={c}>{rackingByCovering[c].label}</option>)}
              </select>
            </label>
            <label className="space-y-1">Battery
              <select value={inputs.batteryId} onChange={(e) => onInputs({ ...inputs, batteryId: e.target.value })} className="w-full border rounded px-2 py-1">
                {solarBatteries.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onLines(suggestSolarLines(inputs))} className="px-3 py-1 rounded bg-teal-600 text-white text-xs font-semibold">Suggest costs</button>
            <button type="button" onClick={() => onLines([...lines, newSolarLine()])} className="px-3 py-1 rounded border border-teal-600 text-teal-700 text-xs font-semibold">Add line</button>
            <span className="text-[11px] text-gray-600 self-center">Suggestions use our hardware rates. Every field below can be changed.</span>
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <p className="text-sm text-gray-600">{editable ? "Press “Suggest costs” to build the system lines." : "System lines will be confirmed after the site survey."}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-600 border-b border-teal-200">
              <th className="py-1">Item</th><th className="py-1 text-right">Qty</th><th className="py-1 text-right">Unit</th><th className="py-1 text-right">Total</th>
              {editable && <th className="no-print print:hidden" />}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-b border-teal-100 align-top">
                <td className="py-1 pr-2">
                  {editable ? (
                    <input value={l.item} onChange={(e) => setLine(l.id, { item: e.target.value })} className="w-full border rounded px-1 py-0.5" />
                  ) : (
                    <>
                      <span className="font-medium">{l.item}</span>
                      {l.note && <span className="block text-[11px] text-gray-500">{l.note}</span>}
                    </>
                  )}
                </td>
                <td className="py-1 text-right">
                  {editable ? <input type="number" value={l.qty} onChange={(e) => setLine(l.id, { qty: Number(e.target.value) || 0 })} className="w-16 border rounded px-1 py-0.5 text-right" /> : l.qty}
                </td>
                <td className="py-1 text-right">
                  {editable ? <input type="number" value={l.unitPrice} onChange={(e) => setLine(l.id, { unitPrice: Number(e.target.value) || 0 })} className="w-20 border rounded px-1 py-0.5 text-right" /> : money(l.unitPrice)}
                </td>
                <td className="py-1 text-right font-semibold">{money(lineTotal(l))}</td>
                {editable && (
                  <td className="no-print print:hidden pl-1">
                    <button type="button" onClick={() => onLines(lines.filter((x) => x.id !== l.id))} className="text-xs text-gray-500 hover:text-black">Remove</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {lines.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-sm pt-1">
          <div><p className="text-xs text-gray-600">Installed price</p><p className="font-bold">{money(total)}</p></div>
          <div><p className="text-xs text-gray-600">Est. federal credit (30%)</p><p className="font-bold">−{money(credit)}</p></div>
          <div><p className="text-xs text-gray-600">Est. net cost</p><p className="font-bold">{money(total - credit)}</p></div>
        </div>
      )}
      {panel && lines.length > 0 && (
        <p className="text-[11px] text-gray-600">Panel: {panelFullName(panel)} · {panel.warrantyYears}-year manufacturer warranty.</p>
      )}
    </div>
  );
};

export default SolarQuoteSection;
