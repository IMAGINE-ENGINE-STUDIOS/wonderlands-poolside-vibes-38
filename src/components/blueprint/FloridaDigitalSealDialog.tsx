import * as React from 'react';
import { ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FL_DESIGNATIONS,
  buildSignatureStatement,
  createEmptySignature,
  findDesignation,
  formatAuthCode,
  hashDocument,
  signatureRuleNote,
  type FlDesignationId,
  type FlDigitalSignature,
  type FlHashAlgorithm,
  type FlSignatureMethod,
} from '@/data/floridaDigitalSignature';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Canonical document payload the signature is linked to */
  payload: unknown;
  value?: FlDigitalSignature;
  defaultSignerName?: string;
  defaultLicense?: string;
  onApply: (signature: FlDigitalSignature) => void;
  onRemove?: () => void;
}

/**
 * Applies a Florida-compliant electronic signature & seal to the plan set:
 * captures the designation, the signing instrument (digital certificate or SHA
 * authentication code) and links the signature to a hash of the document.
 */
export const FloridaDigitalSealDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  payload,
  value,
  defaultSignerName,
  defaultLicense,
  onApply,
  onRemove,
}) => {
  const [draft, setDraft] = React.useState<FlDigitalSignature>(value || createEmptySignature());
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setDraft(prev => {
      const base = value || prev;
      return {
        ...base,
        signerName: base.signerName || defaultSignerName || '',
        licenseNumber: base.licenseNumber || defaultLicense || '',
      };
    });
  }, [open, value, defaultSignerName, defaultLicense]);

  const set = <K extends keyof FlDigitalSignature>(key: K, v: FlDigitalSignature[K]) =>
    setDraft(prev => ({ ...prev, [key]: v }));

  const designation = findDesignation(draft.designationId);
  const canApply = Boolean(draft.signerName.trim() && draft.licenseNumber.trim());

  const apply = async () => {
    setBusy(true);
    try {
      const signedAt = new Date().toISOString();
      const digest = await hashDocument(payload, draft.hashAlgorithm);
      onApply({ ...draft, signedAt, authCode: formatAuthCode(digest), documentHash: digest });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const preview = buildSignatureStatement({ ...draft, signedAt: draft.signedAt || new Date().toISOString() });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" /> Florida electronic signature &amp; seal
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Professional designation</Label>
            <Select value={draft.designationId} onValueChange={v => set('designationId', v as FlDesignationId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FL_DESIGNATIONS.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label} ({d.suffix})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Signing instrument</Label>
            <Select value={draft.method} onValueChange={v => set('method', v as FlSignatureMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="digital-certificate">Digital signature (certificate)</SelectItem>
                <SelectItem value="sha-authentication">SHA authentication code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Name as licensed</Label>
            <Input value={draft.signerName} onChange={e => set('signerName', e.target.value)} placeholder="JANE R. DOE" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">License number</Label>
            <Input
              value={draft.licenseNumber}
              onChange={e => set('licenseNumber', e.target.value)}
              placeholder={`${designation.licensePrefix} 00000`}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Hash algorithm</Label>
            <Select value={draft.hashAlgorithm} onValueChange={v => set('hashAlgorithm', v as FlHashAlgorithm)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SHA-256">SHA-256 (recommended)</SelectItem>
                <SelectItem value="SHA-1">SHA-1 (legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {draft.method === 'digital-certificate' ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Certificate authority</Label>
                <Input
                  value={draft.certificateAuthority}
                  onChange={e => set('certificateAuthority', e.target.value)}
                  placeholder="IdenTrust / GlobalSign / Entrust"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Certificate serial</Label>
                <Input value={draft.certificateSerial} onChange={e => set('certificateSerial', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Certificate expires</Label>
                <Input
                  value={draft.certificateExpires}
                  onChange={e => set('certificateExpires', e.target.value)}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="rounded-md border bg-muted/40 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" /> Statement printed beside the seal
          </p>
          <p className="text-[12px] leading-relaxed">{preview}</p>
          <p className="mt-2 text-[11px] text-muted-foreground">{signatureRuleNote(draft)}</p>
          {draft.authCode ? (
            <p className="mt-2 break-all font-mono text-[11px]">
              {draft.hashAlgorithm} AUTH CODE: {draft.authCode}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          {value && onRemove ? (
            <Button
              variant="ghost"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
            >
              Revoke signature
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={apply} disabled={!canApply || busy}>
            {busy ? <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />}
            Sign &amp; seal document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FloridaDigitalSealDialog;
