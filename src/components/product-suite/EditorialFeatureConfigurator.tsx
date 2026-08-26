import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  calculateFeaturePrice,
  getProductFeatures,
  type FeatureConfig,
  type ProductType,
} from "@/config/productFeatures";

/**
 * Editorial Feature Configurator
 * -----------------------------------------------------------------------------
 * WHAT: The exact "additional features" mechanism used by the fiberglass pool
 * card (`SimplifiedGilmerPoolCard`) — a collapsible Accordion per feature (the
 * dropdown) whose content is a swipeable Carousel of option plates — rebuilt as
 * a single shared component so saunas, spas and tanning ledges present their
 * options in the same format instead of each card inventing its own layout.
 *
 * WHY: previously only pools had the accordion + carousel treatment. Sauna used
 * a flat `DynamicFeatureRenderer` list and spas/ledges used bespoke checkbox
 * blocks, so the same catalogue looked and behaved differently per category.
 *
 * HOW: options come from `PRODUCT_FEATURES` in `src/config/productFeatures.ts`
 * (single source of truth per product type) and every price is summed with the
 * shared `calculateFeaturePrice`, so this component never invents pricing.
 */

export interface EditorialFeatureConfiguratorProps {
  /** Which catalogue of options to print — 'sauna' | 'spa' | 'tanning-ledge' | 'pool' … */
  productType: ProductType;
  /** Current selections, keyed by feature id */
  extras: Record<string, any>;
  onExtrasChange: (next: Record<string, any>) => void;
  /** Commercial / residential multiplier applied to the printed figures */
  priceMultiplier?: number;
  /** Which accordion item is open on first render */
  defaultOpenId?: string;
  className?: string;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Is a selection actively chosen (not the "None"/empty sentinel)? */
const isChosen = (value: any) =>
  value !== undefined && value !== null && value !== "" && value !== "None" && value !== false && value !== 0;

/** Sum every configured option of a product type — used by cards and suites. */
export const sumFeatureExtras = (
  productType: ProductType,
  extras: Record<string, any>,
  priceMultiplier = 1,
) =>
  getProductFeatures(productType).reduce(
    (sum, feature) => sum + calculateFeaturePrice(feature, extras[feature.id], extras),
    0,
  ) * priceMultiplier;

/** Line-by-line breakdown of the selected options, for cart and quote payloads. */
export const featureExtrasBreakdown = (
  productType: ProductType,
  extras: Record<string, any>,
  priceMultiplier = 1,
): Array<{ name: string; price: number; key: string }> =>
  getProductFeatures(productType)
    .map((feature) => {
      const price = calculateFeaturePrice(feature, extras[feature.id], extras) * priceMultiplier;
      if (price <= 0) return null;
      const value = extras[feature.id];
      const name =
        feature.type === "selection" || feature.type === "nested"
          ? `${feature.label} — ${value}`
          : feature.type === "area"
            ? `${feature.label} (${value} sq ft)`
            : feature.type === "quantity"
              ? `${feature.label} × ${value}`
              : feature.label;
      /* `key` lets the shared shopping-list widget edit or drop this exact
         feature at its source (the suite's `extras` state). */
      return { name, price, key: feature.id };
    })
    .filter(Boolean) as Array<{ name: string; price: number; key: string }>;

const EditorialFeatureConfigurator: React.FC<EditorialFeatureConfiguratorProps> = ({
  productType,
  extras,
  onExtrasChange,
  priceMultiplier = 1,
  defaultOpenId,
  className,
}) => {
  const features = React.useMemo(() => getProductFeatures(productType), [productType]);
  const set = (id: string, value: any) => onExtrasChange({ ...extras, [id]: value });

  /** The right-hand summary printed on a closed dropdown */
  const summaryFor = (feature: FeatureConfig) => {
    const value = extras[feature.id];
    const price = calculateFeaturePrice(feature, value, extras) * priceMultiplier;
    if (!isChosen(value)) {
      if (feature.type === "selection" && feature.options?.length) {
        const paid = feature.options.filter((o) => o.price > 0).map((o) => o.price);
        return paid.length ? `from ${money(Math.min(...paid))}` : "Included";
      }
      if (feature.type === "area" && feature.pricePerUnit) return `${money(feature.pricePerUnit)}/sq ft`;
      if (feature.basePrice) return `+${money(feature.basePrice * priceMultiplier)}`;
      return "Optional";
    }
    return price > 0 ? `+${money(price)}` : "Included";
  };

  const optionPlates = (feature: FeatureConfig) => {
    const options = (feature.options ?? []).filter((o) => o.name !== "None");
    if (!options.length) return null;
    return (
      <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
        <CarouselContent className="-ml-1">
          {options.map((option, idx) => {
            const selected = extras[feature.id] === option.name;
            return (
              <CarouselItem key={`${feature.id}-${option.name}-${idx}`} className="pl-1 basis-1/2 md:basis-1/3">
                <button
                  type="button"
                  onClick={() => set(feature.id, selected ? "None" : option.name)}
                  className={`flex h-full w-full flex-col rounded-none border p-3 text-left transition-all hover:shadow-md ${
                    selected ? "border-foreground bg-foreground/5" : "border-border/70"
                  }`}
                >
                  <div className="mb-2 flex h-20 w-full flex-shrink-0 items-center justify-center overflow-hidden bg-muted/40">
                    {option.image ? (
                      <img
                        src={option.image}
                        alt={option.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : option.color ? (
                      <span className="block h-full w-full" style={{ backgroundColor: option.color }} />
                    ) : (
                      <span className="px-2 text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                        {option.name}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">{option.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {option.price > 0 ? `+${money(option.price * priceMultiplier)}` : "Included"}
                  </p>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    );
  };

  const body = (feature: FeatureConfig) => {
    switch (feature.type) {
      case "boolean":
        return (
          <label className="flex cursor-pointer items-center justify-between gap-4 border border-border/60 p-3">
            <span className="text-sm text-muted-foreground">
              {feature.description ?? `Add ${feature.label.toLowerCase()} to this configuration.`}
            </span>
            <Checkbox
              checked={!!extras[feature.id]}
              onCheckedChange={(checked) => set(feature.id, !!checked)}
            />
          </label>
        );
      case "quantity":
        return (
          <div className="flex items-center justify-between gap-4 border border-border/60 p-3">
            <span className="text-sm text-muted-foreground">
              {feature.description ?? "Quantity"}
              {feature.basePrice ? ` · ${money(feature.basePrice * priceMultiplier)} each` : ""}
            </span>
            <Input
              type="number"
              min={0}
              value={extras[feature.id] ?? ""}
              placeholder="0"
              onChange={(e) => set(feature.id, e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0)}
              className="w-24 rounded-none"
            />
          </div>
        );
      case "area":
        return (
          <div className="space-y-3">
            {optionPlates(feature)}
            <div className="flex items-center justify-between gap-4 border border-border/60 p-3">
              <span className="text-sm text-muted-foreground">
                Square feet
                {feature.pricePerUnit ? ` · ${money(feature.pricePerUnit)}/sq ft` : ""}
              </span>
              <Input
                type="number"
                min={0}
                value={extras[feature.id] ?? ""}
                placeholder="0"
                onChange={(e) => set(feature.id, e.target.value === "" ? 0 : Number(e.target.value) || 0)}
                className="w-28 rounded-none"
              />
            </div>
          </div>
        );
      default:
        return optionPlates(feature) ?? (
          <p className="text-sm text-muted-foreground">{feature.description ?? "Speak with us for this option."}</p>
        );
    }
  };

  if (!features.length) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenId ?? features[0]?.id}
      className={`space-y-2 ${className ?? ""}`}
    >
      {features.map((feature) => (
        <AccordionItem key={feature.id} value={feature.id} className="rounded-none border border-border/70 px-3">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="flex w-full items-baseline justify-between gap-4 pr-2">
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {summaryFor(feature)}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">{body(feature)}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EditorialFeatureConfigurator;
