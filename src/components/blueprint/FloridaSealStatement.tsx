import * as React from 'react';
import {
  buildSignatureStatement,
  findDesignation,
  formatAuthCode,
  hashDocument,
  type FlDigitalSignature,
} from '@/data/floridaDigitalSignature';

interface Props {
  signature?: FlDigitalSignature;
  /** Same canonical payload used when signing — used to re-verify the link */
  payload: unknown;
  /** Opens the signing dialog when the block is editable */
  onClick?: () => void;
}

/**
 * Print-safe statutory signature statement that must appear next to the seal on
 * every electronically signed Florida plan sheet, plus a live verification of
 * the authentication code against the current document.
 */
export const FloridaSealStatement: React.FC<Props> = ({ signature, payload, onClick }) => {
  const [valid, setValid] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (!signature?.documentHash) {
      setValid(null);
      return;
    }
    hashDocument(payload, signature.hashAlgorithm)
      .then(digest => {
        if (!cancelled) setValid(digest === signature.documentHash);
      })
      .catch(() => {
        if (!cancelled) setValid(null);
      });
    return () => {
      cancelled = true;
    };
  }, [payload, signature?.documentHash, signature?.hashAlgorithm]);

  if (!signature?.signedAt) {
    return (
      <button
        type="button"
        disabled={!onClick}
        onClick={onClick}
        className="w-full border border-dashed border-[#94a3b8] px-1 py-[3px] text-left text-[6px] uppercase tracking-wider text-[#94a3b8] disabled:cursor-default"
      >
        {onClick ? 'Apply Florida electronic signature & seal' : 'Not electronically signed'}
      </button>
    );
  }

  const designation = findDesignation(signature.designationId);

  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className="w-full border border-[#0f172a] px-1 py-[3px] text-left disabled:cursor-default"
      title={onClick ? 'Edit or revoke the electronic signature' : undefined}
    >
      <div className="text-[6px] font-bold leading-tight tracking-[0.12em] text-[#0f172a]">
        ELECTRONIC SIGNATURE &amp; SEAL
      </div>
      {valid !== null ? (
        <div
          className={`text-[5.6px] font-bold tracking-[0.1em] ${
            valid ? 'text-[#15803d]' : 'text-[#b91c1c]'
          }`}
        >
          {valid ? 'SIGNATURE VERIFIED — DOCUMENT UNALTERED' : 'INVALIDATED — DOCUMENT ALTERED SINCE SIGNING'}
        </div>
      ) : null}
      <p className="mt-[2px] text-[5.6px] leading-[1.35] text-[#0f172a]">{buildSignatureStatement(signature)}</p>
      <div className="mt-[2px] space-y-[1px] text-[5.6px] leading-[1.3] text-[#334155]">
        <div>
          {designation.label.toUpperCase()} · LICENSE NO. {signature.licenseNumber || '—'} · {designation.rule}
        </div>
        {signature.method === 'digital-certificate' && signature.certificateAuthority ? (
          <div>
            CERTIFICATE: {signature.certificateAuthority}
            {signature.certificateSerial ? ` · SN ${signature.certificateSerial}` : ''}
            {signature.certificateExpires ? ` · EXP ${signature.certificateExpires}` : ''}
          </div>
        ) : null}
        <div className="break-all font-mono text-[#0f172a]">
          {signature.hashAlgorithm} AUTH CODE: {signature.authCode || formatAuthCode(signature.documentHash)}
        </div>
      </div>
    </button>
  );
};

export default FloridaSealStatement;
