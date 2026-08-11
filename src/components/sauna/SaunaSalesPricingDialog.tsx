import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck } from "lucide-react";
import { getSaunaPriceBreakdown } from "@/lib/saunaPricing";

const SALES_PASSCODE = "WONDERMAGIC";

interface SaunaSalesPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  unitCost: number;
  capacity?: string;
  /** Published factory freight for the model */
  freight?: number;
  /** Retail total of the options the customer configured (already marked up) */
  optionsRetail?: number;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const SaunaSalesPricingDialog = ({
  open,
  onOpenChange,
  name,
  unitCost,
  capacity,
  freight,
  optionsRetail = 0,
}: SaunaSalesPricingDialogProps) => {
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const breakdown = useMemo(() => getSaunaPriceBreakdown(unitCost, capacity, freight), [unitCost, capacity, freight]);

  const handleUnlock = () => {
    if (passcode.trim().toUpperCase() === SALES_PASSCODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const rows: Array<[string, number]> = [
    ["Unit cost (manufacturer)", breakdown.unitCost],
    ["Freight to warehouse", breakdown.freight],
    ["Local delivery & handling", breakdown.localDelivery],
    ["Installation labor", breakdown.installation],
    ["Electrical (240V circuit)", breakdown.electrical],
    ["Pad / site prep", breakdown.sitePrep],
    ["Overhead & warranty reserve", breakdown.overhead],
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setPasscode(""); setError(false); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Sales Team Pricing
          </DialogTitle>
          <DialogDescription>Internal only — never share with customers.</DialogDescription>
        </DialogHeader>

        {!unlocked ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" /> Enter the sales passcode to view the cost model.
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Passcode"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              />
              <Button onClick={handleUnlock}>Unlock</Button>
            </div>
            {error && <p className="text-xs text-muted-foreground">Passcode not recognized.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Model</p>
              <p className="font-semibold">{name}</p>
            </div>

            <div className="rounded-lg border divide-y">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{money(value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 text-sm bg-muted/40">
                <span className="font-semibold">Total delivered cost</span>
                <span className="font-bold">{money(breakdown.totalCost)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-muted-foreground">Gross profit</span>
                <span className="font-semibold text-primary">{money(breakdown.profit)}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-muted-foreground">Customer price (base)</span>
                <span className="font-bold">{money(breakdown.retail)}</span>
              </div>
              {optionsRetail > 0 && (
                <>
                  <div className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Configured options (retail)</span>
                    <span className="font-medium">{money(optionsRetail)}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 text-sm bg-muted/40">
                    <span className="font-semibold">Customer total</span>
                    <span className="font-bold">{money(breakdown.retail + optionsRetail)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Gross margin {breakdown.grossMarginPct.toFixed(1)}%</Badge>
              <Badge variant="secondary">Floor price {money(breakdown.totalCost * 1.1)}</Badge>
              <Badge variant="secondary">Max discount {money(breakdown.profit * 0.5)}</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Floor price keeps a 10% margin over delivered cost. Discounts beyond the max require
              management approval.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaunaSalesPricingDialog;
