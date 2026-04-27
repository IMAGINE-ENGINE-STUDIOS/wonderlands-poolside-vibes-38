import { Button } from "@/components/ui/button";
import { X, BarChart3 } from "lucide-react";

interface Pool {
  model: string;
  image?: string;
  price: number;
}

interface PoolComparisonBarProps {
  pools: Pool[];
  onRemove: (model: string) => void;
  onCompare: () => void;
  onClear: () => void;
  maxPools?: number;
}

const PoolComparisonBar = ({
  pools,
  onRemove,
  onCompare,
  onClear,
  maxPools = 4,
}: PoolComparisonBarProps) => {
  if (pools.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[95vw] max-w-3xl">
      <div className="bg-background border border-border shadow-2xl rounded-2xl p-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          <BarChart3 className="h-5 w-5 text-primary shrink-0" />
          <span className="font-semibold text-sm shrink-0">
            Compare ({pools.length}/{maxPools})
          </span>
          <div className="flex items-center gap-2 ml-2">
            {pools.map((p) => (
              <div
                key={p.model}
                className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted group"
                title={p.model}
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.model}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onRemove(p.model)}
                  className="absolute top-0 right-0 bg-black/60 hover:bg-black/80 text-white rounded-bl-md p-0.5"
                  aria-label={`Remove ${p.model} from comparison`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            Clear
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={onCompare}
            disabled={pools.length < 2}
            className="text-xs"
          >
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoolComparisonBar;
