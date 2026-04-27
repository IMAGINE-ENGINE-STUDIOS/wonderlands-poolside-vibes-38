import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OptimizedImage } from "./OptimizedImage";
import { Ruler } from "lucide-react";

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

interface CompactPoolCardProps {
  pool: Pool;
  onOpenDetails: (pool: Pool) => void;
  onToggleCompare: (pool: Pool, selected: boolean) => void;
  isCompareSelected: boolean;
  isCompareDisabled?: boolean;
}

const categoryColor = (category: string) => {
  switch (category) {
    case "premium":
      return "bg-gradient-to-r from-coral to-orange text-white";
    case "deluxe":
      return "bg-gradient-to-r from-primary to-teal text-white";
    case "standard":
      return "bg-gradient-to-r from-[hsl(var(--golden))] to-[hsl(var(--golden-light))] text-foreground";
    case "compact":
      return "bg-gradient-to-r from-teal to-primary text-white";
    default:
      return "bg-primary text-primary-foreground";
  }
};

const CompactPoolCard = ({
  pool,
  onOpenDetails,
  onToggleCompare,
  isCompareSelected,
  isCompareDisabled,
}: CompactPoolCardProps) => {
  return (
    <Card className="group relative overflow-hidden border border-border hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col bg-card">
      {/* Compare checkbox */}
      <div
        className="absolute top-2 right-2 z-20 bg-background/90 backdrop-blur-sm rounded-md p-1.5 shadow-md flex items-center gap-1.5 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          id={`compare-${pool.model}`}
          checked={isCompareSelected}
          disabled={!isCompareSelected && isCompareDisabled}
          onCheckedChange={(v) => onToggleCompare(pool, !!v)}
          className="h-4 w-4"
        />
        <label
          htmlFor={`compare-${pool.model}`}
          className="text-[10px] font-semibold uppercase tracking-wide cursor-pointer select-none"
        >
          Compare
        </label>
      </div>

      {/* Image */}
      <button
        type="button"
        onClick={() => onOpenDetails(pool)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-muted block"
        aria-label={`View options for ${pool.model}`}
      >
        {pool.image ? (
          <OptimizedImage
            src={pool.image}
            alt={pool.model}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizeConfig="card"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}

        <div className="absolute top-2 left-2">
          <Badge className={`${categoryColor(pool.category)} text-[10px] uppercase font-bold border-0 shadow`}>
            {pool.category}
          </Badge>
        </div>
      </button>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-sm leading-tight line-clamp-1">{pool.model}</h3>
          {pool.dimensions && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Ruler className="h-3 w-3" />
              {pool.dimensions}
            </p>
          )}
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">From</p>
            <p className="text-base font-bold text-primary leading-tight">
              ${pool.price.toLocaleString()}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="gradient"
          className="w-full h-8 text-xs"
          onClick={() => onOpenDetails(pool)}
        >
          View Options
        </Button>
      </div>
    </Card>
  );
};

export default CompactPoolCard;
