import * as React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

/**
 * FeatureTileCarousel — the single "Screen Enclosure" presentation format.
 *
 * The screen-enclosure section is the reference layout for every configurable
 * group on a product card: a horizontal carousel of square image tiles, each
 * showing a photograph, the option name and its price, with the active tile
 * outlined. This component is that exact markup, extracted so additional
 * features (pool add-ons, sauna options) render identically instead of as
 * checkbox rows.
 *
 * Tiles are toggles: clicking an active tile calls `onSelect` again, letting
 * callers turn the feature off (see `toggle`).
 */

export type FeatureTile = {
  /** Stable key. */
  key: string;
  /** Printed under the image. */
  name: string;
  /** Photograph for the tile. Falls back to `icon`, then to the name. */
  image?: string;
  /** Fallback visual when there is no photograph. */
  icon?: React.ReactNode;
  /** Price line, pre-formatted, e.g. "+$1,700", "$22/sq ft", "Included". */
  priceLabel?: string;
  selected?: boolean;
  onSelect: () => void;
};

/** Accent used for the selected outline — teal primary by default. */
type Accent = "primary" | "coral" | "stone";

const ACCENT: Record<Accent, { ring: string; text: string }> = {
  primary: { ring: "border-primary bg-primary/10", text: "text-primary" },
  coral: { ring: "border-coral bg-coral/10", text: "text-coral" },
  stone: { ring: "border-stone-600 bg-stone-600/10", text: "text-stone-600" },
};

export const FeatureTileCarousel: React.FC<{
  tiles: FeatureTile[];
  /** Small label printed above the carousel. */
  label?: string;
  accent?: Accent;
  /** Tiles per view — matches the enclosure section's two-up default. */
  basis?: string;
}> = ({ tiles, label, accent = "primary", basis = "basis-1/2" }) => {
  const a = ACCENT[accent];
  if (!tiles.length) return null;

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-medium text-muted-foreground block">{label}</label>}
      <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
        <CarouselContent className="-ml-1">
          {tiles.map((t) => (
            <CarouselItem key={t.key} className={`pl-1 ${basis}`}>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={!!t.selected}
                onClick={t.onSelect}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    t.onSelect();
                  }
                }}
                className={`p-3 border rounded-none cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                  t.selected ? a.ring : "border-border"
                }`}
              >
                <div className="w-full h-16 rounded-none mb-2 overflow-hidden flex-shrink-0 bg-muted/50 flex items-center justify-center">
                  {t.image ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    t.icon ?? <span className="text-[10px] text-muted-foreground px-1 text-center">{t.name}</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-h-0">
                  <p className="text-xs font-medium text-center line-clamp-2">{t.name}</p>
                  {t.priceLabel && (
                    <p className={`text-xs font-semibold text-center mt-1 ${a.text}`}>{t.priceLabel}</p>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 animate-pulse" />
        <CarouselNext className="right-0 animate-pulse" />
      </Carousel>
    </div>
  );
};

export default FeatureTileCarousel;
