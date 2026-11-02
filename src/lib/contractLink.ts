/**
 * Create Contract handoff helpers.
 *
 * The standalone contract page (public/contract.html) is filled from BOTH
 * documents of the quote system: the quote itself and the invoice generated
 * from it. These helpers compute the deduplicated union of the two
 * documents' product/service lines and open the page pre-filled.
 *
 * Identity rule (founder): an item is the same item when its description —
 * product name + configuration — matches (the quote system's line items
 * carry no product id). If the same item carries different quantities on
 * the quote vs the invoice, the INVOICE quantity wins and the mismatch is
 * reported in the result. Pure price-reconciliation lines the invoice
 * builder appends ("Special pricing adjustment" / "Additional scope
 * adjustment") are not products or services and never enter the contract.
 */

export interface ContractLineInput {
  description: string;
  quantity?: number | null;
}

export interface ContractUnionLine {
  description: string;
  quantity: number;
}

export interface ContractUnionResult {
  lines: ContractUnionLine[];
  /** Product/service line items on the quote (adjustment lines excluded). */
  quoteCount: number;
  /** Product/service line items on the invoice (adjustment lines excluded). */
  invoiceCount: number;
  /** Price-reconciliation lines excluded from both documents. */
  excludedAdjustments: number;
  /** Same item, different quantity — resolved to the invoice quantity. */
  quantityMismatches: { description: string; quoteQty: number; invoiceQty: number }[];
}

const ADJUSTMENT_KEYS = new Set(["special pricing adjustment", "additional scope adjustment"]);

/** Item identity: name + configuration, normalised. */
export const contractLineKey = (description: string) =>
  String(description || "").trim().replace(/\s+/g, " ").toLowerCase();

const isAdjustmentLine = (description: string) => ADJUSTMENT_KEYS.has(contractLineKey(description));

/** Merge repeated identities inside one document, summing their quantities. */
const mergeDoc = (list: ContractLineInput[]): ContractUnionLine[] => {
  const out: ContractUnionLine[] = [];
  const byKey = new Map<string, ContractUnionLine>();
  for (const raw of list) {
    const description = String(raw?.description || "").trim();
    if (!description) continue;
    const key = contractLineKey(description);
    const qty = Number(raw?.quantity) || 1;
    const existing = byKey.get(key);
    if (existing) existing.quantity += qty;
    else {
      const line = { description, quantity: qty };
      byKey.set(key, line);
      out.push(line);
    }
  }
  return out;
};

/**
 * Deduplicated union of the quote's lines and the invoice's lines.
 * Quote order is preserved; invoice-only items append in invoice order.
 * On a shared item the invoice quantity wins (and is reported).
 */
export const unionContractLines = (
  quoteLines: ContractLineInput[],
  invoiceLines: ContractLineInput[],
): ContractUnionResult => {
  const quoteProductLines = (quoteLines || []).filter((l) => !isAdjustmentLine(l?.description));
  const invoiceProductLines = (invoiceLines || []).filter((l) => !isAdjustmentLine(l?.description));
  const excludedAdjustments =
    (quoteLines || []).length - quoteProductLines.length + ((invoiceLines || []).length - invoiceProductLines.length);

  const lines = mergeDoc(quoteProductLines);
  const byKey = new Map(lines.map((l) => [contractLineKey(l.description), l]));
  const quantityMismatches: ContractUnionResult["quantityMismatches"] = [];

  for (const inv of mergeDoc(invoiceProductLines)) {
    const key = contractLineKey(inv.description);
    const existing = byKey.get(key);
    if (existing) {
      if (existing.quantity !== inv.quantity) {
        quantityMismatches.push({ description: existing.description, quoteQty: existing.quantity, invoiceQty: inv.quantity });
        existing.quantity = inv.quantity; // invoice quantity wins
      }
    } else {
      byKey.set(key, inv);
      lines.push(inv);
    }
  }

  return {
    lines,
    quoteCount: quoteProductLines.length,
    invoiceCount: invoiceProductLines.length,
    excludedAdjustments,
    quantityMismatches,
  };
};

/** Contract text for one line: the description, with quantity when above 1. */
export const contractLineText = (line: ContractUnionLine) =>
  line.quantity > 1 ? `${line.description} × ${line.quantity}` : line.description;

/** Split the union into the page's equip (main product) and feat (the rest). */
export const splitEquipFeat = (lines: ContractUnionLine[]) => {
  const texts = lines.map(contractLineText);
  return {
    equip: texts.length ? texts[0] : undefined,
    feat: texts.length > 1 ? texts.slice(1).join("|") : undefined,
  };
};

/* The invoice is generated inside SurveyQuoteTool; its originating quote's
 * lines are stashed under the invoice id so the invoice view can union both
 * documents exactly (no heuristics, no re-derivation). */
const stashKey = (invoiceId: string) => `contract_quote_lines_${invoiceId}`;

export const stashQuoteLinesForInvoice = (invoiceId: string, lines: ContractLineInput[]) => {
  try {
    localStorage.setItem(stashKey(invoiceId), JSON.stringify(lines || []));
  } catch {
    /* storage full/blocked — the invoice view falls back to the invoice's own lines */
  }
};

export const readStashedQuoteLines = (invoiceId: string): ContractLineInput[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(stashKey(invoiceId)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Open the contract page (public/contract.html) with the given fields set. */
export const openContractPage = (params: Record<string, string | undefined>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") qs.set(k, String(v));
  });
  // Wonderlands serves the app at the root base, so the contract page is /contract.html.
  window.open(`/contract.html?${qs.toString()}`, "_blank");
};
