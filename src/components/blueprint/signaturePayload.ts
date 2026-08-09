import type { BlueprintProject } from './types';

/**
 * Canonical payload the Florida electronic signature is bound to.
 *
 * Everything a plan reviewer sees is included; the signature artifacts
 * themselves are excluded so the authentication code stays stable while
 * remaining invalidated by any change to the drawings, title block, permit
 * selection or notes.
 */
export const canonicalSignaturePayload = (data: BlueprintProject) => {
  const { signatures, ...rest } = data;
  return {
    ...rest,
    signatures: {
      engineerSignedDate: signatures.engineerSignedDate,
      contractorSignerName: signatures.contractorSignerName,
      contractorSignedDate: signatures.contractorSignedDate,
      ownerSignerName: signatures.ownerSignerName,
      ownerSignedDate: signatures.ownerSignedDate,
      sealNote: signatures.sealNote,
    },
  };
};
