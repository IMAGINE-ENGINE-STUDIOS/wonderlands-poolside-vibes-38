import { Dialog, DialogContent } from "@/components/ui/dialog";
import SimplifiedGilmerPoolCard from "./SimplifiedGilmerPoolCard";

interface GilmerPool {
  model: string;
  dimensions: string;
  depth: string;
  price: number;
  image: string;
  warranty: string;
  brand: string;
  type: string;
  installationTimeWeeks?: number;
  concreteInstallationWeeks?: number;
  websiteUrl?: string;
}

interface GilmerPoolDetailDialogProps {
  pool: GilmerPool | null;
  isOpen: boolean;
  onClose: () => void;
}

const GilmerPoolDetailDialog = ({ pool, isOpen, onClose }: GilmerPoolDetailDialogProps) => {
  if (!pool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 sm:p-2 bg-background">
        <div className="p-2 sm:p-4">
          <SimplifiedGilmerPoolCard pool={pool} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GilmerPoolDetailDialog;
