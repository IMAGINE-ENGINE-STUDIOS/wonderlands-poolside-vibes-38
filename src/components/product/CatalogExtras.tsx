import * as React from "react";
import { DynamicFeatureRenderer } from "@/components/DynamicFeatureRenderer";
import {
  getProductFeatures,
  getDefaultExtras,
  calculateFeaturePrice,
  type ProductType,
} from "@/config/productFeatures";

/**
 * CatalogExtras — shared bridge between a product card and the central
 * `PRODUCT_FEATURES` catalogue in `src/config/productFeatures.ts`.
 *
 * Cards (GlimmerGlass pools, GlimmerGlass spas, ...) historically hard-coded a
 * handful of add-ons, so catalogue options such as covers, jets, tanning
 * ledges, cold plunges or screen enclosures never surfaced. Instead of
 * duplicating that markup per card, a card renders <CatalogExtrasPanel /> and
 * excludes the ids it already renders itself. Pricing and the quote/cart line
 * items come from the same helper, so Studio, cards and quotes stay in sync.
 */

export interface CatalogExtraLine {
  name: string;
  price: number;
  image?: string;
}

export function useCatalogExtras(productType: ProductType, excludeIds: string[] = []) {
  const excludeKey = excludeIds.join("|");
  const features = React.useMemo(
    () => getProductFeatures(productType).filter((f) => !excludeIds.includes(f.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productType, excludeKey],
  );

  const [extras, setExtras] = React.useState<any>(() => getDefaultExtras(productType));

  const lines = React.useMemo<CatalogExtraLine[]>(() => {
    const out: CatalogExtraLine[] = [];
    features.forEach((feature) => {
      const value = extras?.[feature.id];
      if (value === undefined || value === null) return;
      if (value === false || value === 0 || value === "" || value === "None") return;

      const price = calculateFeaturePrice(feature, value, extras);
      const label =
        typeof value === "string"
          ? `${feature.label}: ${value}`
          : typeof value === "number"
            ? `${feature.label} (${value})`
            : feature.label;
      const image =
        (typeof value === "string" && feature.options?.find((o) => o.name === value)?.image) ||
        (feature as any).image;

      out.push({ name: label, price, image });
    });
    return out;
  }, [features, extras]);

  const total = React.useMemo(() => lines.reduce((sum, l) => sum + (l.price || 0), 0), [lines]);

  return { extras, setExtras, lines, total, features };
}

interface CatalogExtrasPanelProps {
  productType: ProductType;
  excludeIds?: string[];
  extras: any;
  onExtrasChange: (extras: any) => void;
  title?: string;
  className?: string;
}

export function CatalogExtrasPanel({
  productType,
  excludeIds = [],
  extras,
  onExtrasChange,
  title = "More Additional Features",
  className,
}: CatalogExtrasPanelProps) {
  return (
    <div className={className}>
      <p className="mb-2 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">{title}</p>
      <DynamicFeatureRenderer
        productType={productType}
        excludeIds={excludeIds}
        selectedExtras={extras}
        onExtrasChange={onExtrasChange}
      />
    </div>
  );
}
