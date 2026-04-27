import { Dialog, DialogContent } from "@/components/ui/dialog";
import PoolProductCard from "./PoolProductCard";

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

interface PoolDetailDialogProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: (pool: Pool, extras?: any) => void;
}

const PoolDetailDialog = ({ pool, isOpen, onClose, onRequestQuote }: PoolDetailDialogProps) => {
  if (!pool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 sm:p-2 bg-background">
        <div className="p-2 sm:p-4">
          <PoolProductCard
            pool={pool as any}
            onViewDetails={() => {}}
            onRequestQuote={(p, extras) => onRequestQuote(p as any, extras)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PoolDetailDialog;
