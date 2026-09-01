import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  pebbleTecFinishes,
  PEBBLE_TEC_PRICE_LABEL,
  type PebbleTecFinish,
} from "@/data/pebbleTecFinishes";

/**
 * Pebble Tec® finishes for concrete (gunite) pools.
 *
 * The complete published range lives in `src/data/pebbleTecFinishes.ts` and is
 * shared with FLIP and the Studio galleries — this section simply surfaces the
 * same single source on the main page, grouped by Pebble Tec collection.
 * Pebble Tec is concrete-only, so it is presented separately from the Latham
 * Crystite range above. Pricing is surface-area driven (no fixed figure).
 */

const COLLECTIONS: PebbleTecFinish["collection"][] = [
  "Pebble Tec",
  "PebbleSheen",
  "PebbleFina",
  "PebbleBrilliance",
  "PebbleQuartz",
  "PebbleBreeze",
];

interface Props {
  onSelect?: (finish: PebbleTecFinish) => void;
}

const PebbleTecConcreteFinishes = ({ onSelect }: Props) => {
  const [activeCollection, setActiveCollection] = React.useState<"all" | PebbleTecFinish["collection"]>("all");

  const grouped = React.useMemo(() => {
    const map = new Map<string, PebbleTecFinish[]>();
    pebbleTecFinishes.forEach((f) => {
      const list = map.get(f.collection) ?? [];
      list.push(f);
      map.set(f.collection, list);
    });
    return map;
  }, []);

  const visible = React.useMemo(
    () => (activeCollection === "all" ? COLLECTIONS : [activeCollection]),
    [activeCollection],
  );

  return (
    <div className="mt-16 border-t border-border/60 pt-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[0.5em] text-muted-foreground">
            Chapter II — Concrete Pools
          </p>
          <h3 className="font-serif text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Pebble Tec® Interior Finishes
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            The complete Pebble Tec® range for custom concrete shells — exposed pebble,
            polished and quartz surfaces. {PEBBLE_TEC_PRICE_LABEL}.
          </p>
        </div>
        <Badge variant="outline" className="rounded-none text-[9px] uppercase tracking-[0.3em]">
          {pebbleTecFinishes.length} finishes
        </Badge>
      </div>

      {/* Collection filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(["all", ...COLLECTIONS] as const).map((c) => (
          <Button
            key={c}
            type="button"
            size="sm"
            variant={activeCollection === c ? "default" : "outline"}
            className="rounded-none text-[10px] uppercase tracking-[0.25em]"
            onClick={() => setActiveCollection(c as typeof activeCollection)}
          >
            {c === "all" ? "All collections" : c}
          </Button>
        ))}
      </div>

      <div className="space-y-10">
        {visible.map((collection) => {
          const finishes = grouped.get(collection) ?? [];
          if (!finishes.length) return null;
          return (
            <div key={collection}>
              <div className="mb-4 flex items-baseline justify-between border-b border-border/60 pb-2">
                <h4 className="font-serif text-lg font-light tracking-tight text-foreground">{collection}</h4>
                <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  {finishes.length} colours
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {finishes.map((finish) => (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => onSelect?.(finish)}
                    className="group text-left"
                  >
                    <div
                      className="h-20 w-full border border-border/70 transition-colors group-hover:border-foreground/50 sm:h-24"
                      style={{ backgroundColor: finish.color }}
                    >
                      {finish.image && (
                        <img
                          src={finish.image}
                          alt={`${finish.collection} ${finish.name} pool finish`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-foreground">{finish.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Concrete only
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PebbleTecConcreteFinishes;
