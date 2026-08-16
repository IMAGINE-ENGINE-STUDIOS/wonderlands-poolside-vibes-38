import * as React from 'react';
import {
  SiteDrawingBoard,
  DEFAULT_PX_PER_FT,
  type SitePlanData,
} from '@/components/blueprint/SiteDrawingBoard';
import { sitePlanToBuilderData, sitePlanToScene } from '@/lib/sitePlanToBuilder';
import { formatMoney } from '@/lib/siteEstimate';
import { buildProductSitePlan } from '@/lib/productSitePlan';
import usePersistentState from '@/hooks/usePersistentState';
import { Button } from '@/components/ui/button';
import { Box, Ruler } from 'lucide-react';

interface Props {
  /** Model name used to seed the board with the product footprint */
  modelName?: string;
  meta?: string;
  categoryId?: string;
  onPoolDataChange?: (data: any) => void;
  onViewIn3D?: (scene: any, textureLibrary: any) => void;
}

const EMPTY: SitePlanData = { shapes: [], pxPerFt: DEFAULT_PX_PER_FT };

/**
 * "Build a Pool" now uses the full 2D site studio board instead of the
 * simplified canvas: property boundary, residence, paver deck, pool and
 * barriers on a scaled grid, priced live off the drawn geometry.
 */
export const StudioSitePlanner: React.FC<Props> = ({
  modelName,
  meta,
  categoryId = 'pools',
  onPoolDataChange,
  onViewIn3D,
}) => {
  const [plan, setPlan] = usePersistentState<SitePlanData>('studio_sitePlan', EMPTY);

  // Seed the board with the selected product footprint the first time it opens
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (seeded.current || plan.shapes.length) return;
    const seed = buildProductSitePlan({ categoryId, modelName, meta });
    if (seed) {
      seeded.current = true;
      setPlan(seed);
    }
  }, [categoryId, modelName, meta, plan.shapes.length, setPlan]);

  const derived = React.useMemo(() => sitePlanToBuilderData(plan), [plan]);

  React.useEffect(() => {
    onPoolDataChange?.(derived);
  }, [derived, onPoolDataChange]);

  return (
    <div className="space-y-4">
      <SiteDrawingBoard
        data={plan}
        onChange={setPlan}
        menuSide
        defaultLayer="pool"
        header={
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Wonderlands 2D Studio
              </p>
              <p className="text-sm font-semibold">
                {modelName ? `${modelName} — site plan` : 'Build a Pool — site plan'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              {derived.area.toLocaleString()} sq ft pool · {(derived.deckArea || 0).toLocaleString()} sq ft deck
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm font-semibold">{formatMoney(derived.totalCost)}</span>
              <Button
                size="sm"
                onClick={() => {
                  const { scene, textureLibrary } = sitePlanToScene(plan);
                  onViewIn3D?.(scene, textureLibrary);
                }}
                disabled={!derived.points.length}
                className="gap-1.5"
              >
                <Box className="h-3.5 w-3.5" /> View in 3D
              </Button>
            </div>
          </div>
        }
      />

      {derived.estimate.lines.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-3">
            Priced as drawn
          </p>
          <div className="space-y-1.5">
            {derived.estimate.lines.map((l) => (
              <div key={l.label} className="flex items-baseline justify-between text-sm">
                <span>
                  {l.label} <span className="text-xs text-muted-foreground">{l.detail}</span>
                </span>
                <span className="font-medium">{formatMoney(l.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-3">
            <span className="text-sm font-semibold">Turnkey total</span>
            <span className="text-lg font-semibold">{formatMoney(derived.estimate.total)}</span>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            All prices include delivery, installation and the product as described.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudioSitePlanner;
