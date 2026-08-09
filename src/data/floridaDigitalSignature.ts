/**
 * Florida electronic / digital signing of engineering & architectural documents.
 *
 * Florida does not accept a plain drawn signature on an electronically
 * transmitted plan set. A design professional signing electronically must
 * attach one of two legally recognized instruments, each of which has to print
 * a specific statutory statement next to the seal:
 *
 *  1. DIGITAL SIGNATURE  — a certificate based signature that is unique to the
 *     signer, under the signer's sole control, verifiable, and linked to the
 *     document so that any later change invalidates it.
 *  2. SHA AUTHENTICATION CODE — a published one-way hash of the signed file
 *     that the building department re-computes to prove the file is unaltered.
 *
 * Rule references implemented below:
 *  - Engineers: F.S. 471.025(4) / F.A.C. 61G15-23.003
 *  - Architects & Interior Designers: F.S. 481.221(5) / F.A.C. 61G1-16.005
 *  - Landscape Architects: F.A.C. 61G10-11.011
 *  - Surveyors & Mappers: F.S. 472.025 / F.A.C. 5J-17.062
 */

export type FlDesignationId = 'pe' | 'ra' | 'la' | 'psm' | 'id';
export type FlSignatureMethod = 'digital-certificate' | 'sha-authentication';
export type FlHashAlgorithm = 'SHA-256' | 'SHA-1';

export interface FlDesignation {
  id: FlDesignationId;
  /** Suffix printed after the professional's name */
  suffix: string;
  label: string;
  board: string;
  rule: string;
  licensePrefix: string;
}

export const FL_DESIGNATIONS: FlDesignation[] = [
  {
    id: 'pe',
    suffix: 'P.E.',
    label: 'Professional Engineer',
    board: 'Florida Board of Professional Engineers',
    rule: 'F.A.C. 61G15-23.003 / F.S. 471.025',
    licensePrefix: 'PE',
  },
  {
    id: 'ra',
    suffix: 'Registered Architect',
    label: 'Registered Architect',
    board: 'Florida Board of Architecture & Interior Design',
    rule: 'F.A.C. 61G1-16.005 / F.S. 481.221',
    licensePrefix: 'AR',
  },
  {
    id: 'la',
    suffix: 'Registered Landscape Architect',
    label: 'Registered Landscape Architect',
    board: 'Florida Board of Landscape Architecture',
    rule: 'F.A.C. 61G10-11.011',
    licensePrefix: 'LA',
  },
  {
    id: 'psm',
    suffix: 'P.S.M.',
    label: 'Professional Surveyor & Mapper',
    board: 'Florida Board of Professional Surveyors and Mappers',
    rule: 'F.A.C. 5J-17.062 / F.S. 472.025',
    licensePrefix: 'LS',
  },
  {
    id: 'id',
    suffix: 'Registered Interior Designer',
    label: 'Registered Interior Designer',
    board: 'Florida Board of Architecture & Interior Design',
    rule: 'F.A.C. 61G1-16.005',
    licensePrefix: 'ID',
  },
];

export const findDesignation = (id: FlDesignationId): FlDesignation =>
  FL_DESIGNATIONS.find(d => d.id === id) || FL_DESIGNATIONS[0];

export interface FlDigitalSignature {
  method: FlSignatureMethod;
  designationId: FlDesignationId;
  /** Name exactly as licensed */
  signerName: string;
  licenseNumber: string;
  /** ISO timestamp captured at the moment of signing */
  signedAt: string;
  hashAlgorithm: FlHashAlgorithm;
  /** Authentication code of the signed document payload */
  authCode: string;
  /** Certificate details when signing with a digital certificate */
  certificateAuthority: string;
  certificateSerial: string;
  certificateExpires: string;
  /** True while the current document still matches `authCode` */
  documentHash: string;
}

const HEX = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

/** Groups a hex digest into 4-character blocks the way plan reviewers read it. */
export const formatAuthCode = (hex: string) => (hex.match(/.{1,4}/g) || []).join(' ');

/**
 * One-way hash of the canonical document payload. The signature is linked to
 * the document: any later edit changes this digest and invalidates the code,
 * which is exactly what the Florida rules require.
 */
export const hashDocument = async (payload: unknown, algorithm: FlHashAlgorithm): Promise<string> => {
  const canonical = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(canonical);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return HEX(digest);
};

export const formatSignedDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};

/**
 * The statutory statement that must be printed adjacent to the electronic seal.
 * Wording follows the language required by the boards above.
 */
export const buildSignatureStatement = (sig: FlDigitalSignature): string => {
  const designation = findDesignation(sig.designationId);
  const name = (sig.signerName || 'NAME OF PROFESSIONAL').toUpperCase();
  const when = sig.signedAt ? formatSignedDate(sig.signedAt) : 'DATE';
  const algo = sig.hashAlgorithm === 'SHA-1' ? 'SHA-1' : 'SHA-256';

  if (sig.method === 'sha-authentication') {
    return (
      `This item has been electronically signed and sealed by ${name}, ${designation.suffix}, ` +
      `on ${when} using a ${algo} authentication code. Printed copies of this document are not ` +
      `considered signed and sealed and the ${algo} authentication code must be verified on any electronic copies.`
    );
  }

  return (
    `This item has been digitally signed and sealed by ${name}, ${designation.suffix}, ` +
    `on ${when} using a Digital Signature. Printed copies of this document are not considered ` +
    `signed and sealed and the signature must be verified on any electronic copies.`
  );
};

/** Short compliance line naming the rule the signature is executed under. */
export const signatureRuleNote = (sig: FlDigitalSignature): string => {
  const d = findDesignation(sig.designationId);
  return `Electronic signature executed under ${d.rule} — ${d.board}. License No. ${
    sig.licenseNumber || '—'
  }.`;
};

export const createEmptySignature = (): FlDigitalSignature => ({
  method: 'digital-certificate',
  designationId: 'pe',
  signerName: '',
  licenseNumber: '',
  signedAt: '',
  hashAlgorithm: 'SHA-256',
  authCode: '',
  certificateAuthority: '',
  certificateSerial: '',
  certificateExpires: '',
  documentHash: '',
});
