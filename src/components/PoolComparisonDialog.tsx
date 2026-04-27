import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Minus } from "lucide-react";

interface Pool {
  model: string;
  price: number;
  category: "premium" | "deluxe" | "standard" | "compact";
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  warrantyYears?: number | string;
  installationTimeWeeks?: number;
  saltSystem?: boolean;
  heater?: boolean;
  carbonFiber?: boolean;
  type?: string;
}

interface PoolComparisonDialogProps {
  pools: Pool[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (model: string) => void;
  onOpenDetails: (pool: Pool) => void;
}

const Bool = ({ value }: { value?: boolean }) =>
  value ? (
    <Check className="h-4 w-4 text-primary mx-auto" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
  );

const PoolComparisonDialog = ({
  pools,
  isOpen,
  onClose,
  onRemove,
  onOpenDetails,
}: PoolComparisonDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Compare Pools ({pools.length})
          </DialogTitle>
        </DialogHeader>

        {pools.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No pools selected for comparison.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 w-32 sticky left-0 bg-background z-10"></th>
                  {pools.map((p) => (
                    <th key={p.model} className="p-2 min-w-[180px] align-top">
                      <div className="relative bg-card border border-border rounded-lg p-2">
                        <button
                          type="button"
                          onClick={() => onRemove(p.model)}
                          className="absolute top-1 right-1 p-1 bg-background/80 hover:bg-background rounded-full shadow"
                          aria-label={`Remove ${p.model}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.model}
                            className="w-full h-28 object-cover rounded-md mb-2"
                            loading="lazy"
                          />
                        )}
                        <h3 className="font-bold text-sm text-left">{p.model}</h3>
                        <Badge className="mt-1 text-[10px] uppercase">
                          {p.category}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_td]:p-2 [&_td]:border-b [&_td]:border-border [&_th]:border-b [&_th]:border-border [&_th]:font-medium [&_th]:text-left [&_th]:text-muted-foreground">
                <tr>
                  <th>Price</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center font-bold text-primary">
                      ${p.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Dimensions</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center">
                      {p.dimensions || "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Depth</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center">
                      {p.depth || "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Type</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center">
                      {p.type || "Fiberglass"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Installation</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center">
                      {p.installationTimeWeeks
                        ? `${p.installationTimeWeeks} weeks`
                        : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Warranty</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center">
                      {p.warrantyYears
                        ? p.warrantyYears === "Lifetime" || p.warrantyYears === "Life"
                          ? "Lifetime"
                          : `${p.warrantyYears} yrs`
                        : "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Salt System</th>
                  {pools.map((p) => (
                    <td key={p.model}>
                      <Bool value={p.saltSystem} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Heater Included</th>
                  {pools.map((p) => (
                    <td key={p.model}>
                      <Bool value={p.heater} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Carbon Fiber</th>
                  {pools.map((p) => (
                    <td key={p.model}>
                      <Bool value={p.carbonFiber} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="align-top">Key Features</th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-left">
                      <ul className="text-xs space-y-1">
                        {(p.features || []).slice(0, 5).map((f) => (
                          <li key={f} className="flex items-start gap-1">
                            <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th></th>
                  {pools.map((p) => (
                    <td key={p.model} className="text-center">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => {
                          onClose();
                          onOpenDetails(p);
                        }}
                        className="w-full text-xs"
                      >
                        View Options
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PoolComparisonDialog;
