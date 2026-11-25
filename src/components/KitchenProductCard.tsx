import { useMemo, useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { DynamicFeatureRenderer } from "./DynamicFeatureRenderer";
import {
  getProductFeatures,
  calculateFeaturePrice,
  getFeatureLineImage,
} from "@/config/productFeatures";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import InstallationNote from "@/components/InstallationNote";
import type { Kitchen } from "@/data/kitchenData";

// The standard Wonderlands product card (same build as SaunaProductCard),
// adapted for the outdoor kitchen section: the piece is the product, and
// the expandable carries the full scope services (plumbing, electrical,
// permits, installation, delivery) priced by the kitchen pricing model.
// Products with no cost on record (the Belgard sets) print no price line
// and no quote button: they are priced from the project take off.

interface KitchenProductCardProps {
  product: Kitchen;
}

const money = (n: number, exact = false) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: exact ? 2 : 0,
    maximumFractionDigits: exact ? 2 : 0,
  });

const KitchenProductCard = ({ product }: KitchenProductCardProps) => {
  const { priceMultiplier, projectType } = useProjectType();
  const [showQuote, setShowQuote] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [extras, setExtras] = useState<Record<string, any>>({});

  const extrasTotal = useMemo(
    () =>
      getProductFeatures("kitchen").reduce(
        (sum, feature) =>
          sum + calculateFeaturePrice(feature, extras[feature.id], extras),
        0,
      ) * priceMultiplier,
    [extras, priceMultiplier],
  );

  const priced = typeof product.price === "number";
  const perUnit = product.unit === "sqft" || product.unit === "piece";
  const unitSuffix =
    product.unit === "sqft" ? " / sq ft" : product.unit === "piece" ? " / piece" : "";
  const totalPrice = () => (product.price ?? 0) * priceMultiplier + extrasTotal;

  return (
    <>
      <div className="group flex h-full flex-col overflow-hidden rounded-none border border-border/70 transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]">
        <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            sizeConfig="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
              {product.group}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/80">
              {product.brand ?? "Wonderlands"} Collection
            </p>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col space-y-5 p-4 sm:p-5 lg:p-7">
          <div>
            <h3 className="font-serif text-2xl font-light leading-[1.05] tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h3>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
              <div>
                {priced ? (
                  <>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                      {perUnit ? "Price" : "From"}
                    </p>
                    <p className="font-serif text-2xl font-light text-foreground sm:text-3xl">
                      {money((product.price ?? 0) * priceMultiplier, perUnit)}
                      {unitSuffix}
                    </p>
                    {projectType === "commercial" && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Commercial Rate
                      </p>
                    )}
                    <InstallationNote className="mt-2 !text-[9px]" />
                  </>
                ) : (
                  <p className="max-w-[220px] text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
                    Priced from the project take off when quoted
                  </p>
                )}
              </div>
              {product.meta && (
                <p className="max-w-[45%] text-right text-[10px] uppercase leading-relaxed tracking-[0.25em] text-muted-foreground">
                  {product.meta}
                </p>
              )}
            </div>
          </div>

          {product.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          )}

          {product.features && product.features.length > 0 && (
            <div className="flex-1 space-y-2">
              <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                Highlights
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {product.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-none bg-foreground/60" />
                    <span className="text-xs leading-tight text-muted-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {priced && (
            <div className="mt-auto border-t border-border/60 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="flex w-full items-center justify-between rounded-none text-[10px] uppercase tracking-[0.3em]"
              >
                <span>Full scope services</span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {priced && showDetails && (
            <div className="space-y-4 border-t border-border/60 pt-4">
              <DynamicFeatureRenderer
                productType="kitchen"
                selectedExtras={extras}
                onExtrasChange={setExtras}
              />
              {extrasTotal > 0 && (
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    Selected services
                  </span>
                  <span className="font-serif text-lg font-light text-foreground">
                    +{money(extrasTotal)}
                  </span>
                </div>
              )}
              <div className="border-t border-border/60 pt-3">
                <p className="mb-1 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
                  The house standard
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Every price includes delivery and installation. No feature is
                  priced without its whole chain: the water, the power, the
                  licensed trades and the permits are lines of their own, in
                  the open.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        {priced && (
          <CardFooter className="mt-auto flex gap-2 p-4 pt-0 sm:p-5 sm:pt-0 lg:p-7 lg:pt-0">
            <Button
              onClick={() => setShowQuote(true)}
              className="instant-quote-btn flex-1 rounded-none bg-foreground text-[10px] uppercase tracking-[0.3em] text-background transition-all duration-300 hover:bg-foreground/90"
              size="sm"
            >
              Get Instant Quote
            </Button>
          </CardFooter>
        )}
      </div>

      {priced && (
        <SurveyQuoteTool
          pool={null}
          customProduct={{
            name: product.name,
            price: product.price ?? 0,
            type: "Outdoor Kitchen",
            image: product.image,
          }}
          extras={{
            productType: "kitchen",
            extrasTotal,
            totalPrice: totalPrice(),
            extrasBreakdown: getProductFeatures("kitchen")
              .map((feature) => {
                const price =
                  calculateFeaturePrice(feature, extras[feature.id], extras) *
                  priceMultiplier;
                if (price <= 0) return null;
                const value = extras[feature.id];
                const name =
                  feature.type === "selection"
                    ? `${feature.label} — ${value}`
                    : feature.label;
                return {
                  name,
                  price,
                  image: getFeatureLineImage(feature, value, extras),
                };
              })
              .filter(Boolean) as Array<{
              name: string;
              price: number;
              image?: string;
            }>,
          }}
          isOpen={showQuote}
          onClose={() => setShowQuote(false)}
        />
      )}
    </>
  );
};

export default KitchenProductCard;
