import { supabase } from '@/integrations/supabase/client';

/**
 * Folder → contract link resolution, through the contract page's own
 * backend (the contract_drafts records behind contract.html?c=<id>).
 *
 * - If a draft already exists for the folder's customer (matched on the
 *   record's client_name), its share link is used.
 * - Otherwise a new draft is created with the platform's standard
 *   contract document — the same default document the contract page
 *   itself would store — with the client name set to the folder's
 *   customer name, and the new record's link is used.
 * The folder → draft pairing is remembered in this browser so repeat
 * clicks are instant and never create duplicates from the same device.
 */

const LS_KEY = 'ww_folder_contract_links';

type LinkMap = Record<string, string>;

const readMap = (): LinkMap => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}') as LinkMap;
  } catch {
    return {};
  }
};

const writeMap = (map: LinkMap) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — resolution still works, just re-looks-up */
  }
};

/** Lowercase, collapse spaces, drop a leading honorific (Mr./Mrs./Ms./Dr.). */
const normName = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(mr|mrs|ms|miss|dr)\.?\s+/, '')
    .replace(/\.$/, '');

interface DraftRow {
  id: string;
  client_name: string | null;
  is_final: boolean | null;
}

const findExistingDraft = async (folderName: string): Promise<string | null> => {
  const { data, error } = await (supabase as any)
    .from('contract_drafts')
    .select('id, client_name, is_final');
  if (error || !data) return null;
  const rows = data as DraftRow[];
  const target = normName(folderName);
  if (!target) return null;

  const exact = rows.filter(r => normName(r.client_name ?? '') === target);
  if (exact.length) {
    return (exact.find(r => !r.is_final) ?? exact[0]).id;
  }
  // Unique containment match only (e.g. folder "Mr. Saleh" vs the record's
  // "Saleh Barakat") — never guess between multiple candidates.
  const partial = rows.filter(r => {
    const c = normName(r.client_name ?? '');
    return c.length >= 3 && target.length >= 3 && (c.includes(target) || target.includes(c));
  });
  return partial.length === 1 ? partial[0].id : null;
};

let templatePromise: Promise<string> | null = null;
const fetchContractTemplate = () => {
  if (!templatePromise) {
    templatePromise = fetch('/contract.html')
      .then(r => r.text())
      .catch(err => {
        templatePromise = null;
        throw err;
      });
  }
  return templatePromise;
};

/**
 * The contract page's own fresh document, replicated faithfully: the
 * static #doc from contract.html plus the same fills the page applies
 * on load (client name, the contractor's fixed details, today's date,
 * empty scope sections hidden).
 */
const buildDefaultContractHtml = async (clientName: string): Promise<string> => {
  const pageHtml = await fetchContractTemplate();
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  const docEl = parsed.getElementById('doc');
  if (!docEl) throw new Error('Contract template not found');

  const field = (key: string) => docEl.querySelector<HTMLElement>(`[data-field="${key}"]`);
  const setField = (key: string, val: string) => {
    const el = field(key);
    if (el) {
      el.textContent = val;
      el.style.borderBottom = 'none';
    }
  };
  const fillDefault = (key: string, val: string) => {
    const el = field(key);
    if (el && /^_+$/.test((el.textContent || '').trim())) {
      el.textContent = val;
      el.style.borderBottom = 'none';
    }
  };

  setField('clientName', clientName);
  fillDefault('contractorEmail', 'sales@wonderlandsworld.com');
  fillDefault('contractorAddress', '6900 Tavistock Lakes Blvd, Suite 400, Orlando, FL 32827');
  fillDefault(
    'effectiveDate',
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  );

  const ss = field('scopeSummary');
  if (ss && /^_+$/.test((ss.textContent || '').trim()) && ss.parentElement) {
    (ss.parentElement as HTMLElement).style.display = 'none';
  }
  (['equipmentList', 'featuresList'] as const).forEach(key => {
    const ul = field(key);
    if (!ul) return;
    const lis = ul.querySelectorAll('li');
    const empty =
      lis.length > 0 && Array.from(lis).every(li => /^_*$/.test((li.textContent || '').trim()));
    if (empty) {
      const p = ul.previousElementSibling as HTMLElement | null;
      if (p && /^(Equipment|Features):$/.test((p.textContent || '').trim())) p.style.display = 'none';
      ul.style.display = 'none';
    }
  });

  return docEl.innerHTML;
};

const createDraft = async (folderName: string): Promise<string> => {
  const documentHtml = await buildDefaultContractHtml(folderName);
  const { data, error } = await (supabase as any).rpc('create_contract_draft', {
    p_document_html: documentHtml,
    p_signed_roles: {},
    p_client_sig_data: '',
    p_client_name: folderName,
    p_client_email: '',
    p_project_address: '',
    p_proposal_no: '',
    p_proposal_date: '',
    p_contract_price: '',
  });
  if (error || !data) throw new Error('Could not create the contract record');
  return data as string;
};

/** The share link (contract.html?c=<id>) for a folder's customer contract. */
export const resolveFolderContractLink = async (
  folderId: string,
  folderName: string,
): Promise<string> => {
  const map = readMap();
  let id = map[folderId];
  if (!id) id = (await findExistingDraft(folderName)) ?? undefined;
  if (!id) id = await createDraft(folderName);
  if (map[folderId] !== id) {
    map[folderId] = id;
    writeMap(map);
  }
  return `${window.location.origin}/contract.html?c=${id}`;
};
