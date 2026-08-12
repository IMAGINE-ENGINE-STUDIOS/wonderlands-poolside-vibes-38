import { useMemo, useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Users, Zap, Clock, ShieldCheck, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { DynamicFeatureRenderer } from "./DynamicFeatureRenderer";
import { getProductFeatures, calculateFeaturePrice } from "@/config/productFeatures";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { resolveCategoryLabel } from '@/lib/productCategories';
import SaunaSalesPricingDialog from "./sauna/SaunaSalesPricingDialog";
import InstallationNote from "@/components/InstallationNote";

interface SaunaProductCardProps {
  sauna: {
    id: string;
    name: string;
    model: string;
    price: number;
    category: string;
    image: string;
    capacity: string;
    heaterPower: string;
    description: string;
    features: string[];
    dimensions: string;
    unitCost?: number;
    shipping?: number;
    installationTime: string;
    warranty: string;
  };
}

const SaunaProductCard = ({ sauna }: SaunaProductCardProps) => {
  const { priceMultiplier, projectType } = useProjectType();
  const [showQuote, setShowQuote] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSalesPricing, setShowSalesPricing] = useState(false);
  const [extras, setExtras] = useState<Record<string, any>>({});

  // Sum every configured sauna option using the shared feature pricing model
  const extrasTotal = useMemo(
    () =>
      getProductFeatures('sauna').reduce(
        (sum, feature) => sum + calculateFeaturePrice(feature, extras[feature.id], extras),
        0
      ) * priceMultiplier,
    [extras, priceMultiplier]
  );

  const getTotalSaunaPrice = () => sauna.price * priceMultiplier + extrasTotal;

  return (
    <>
      <div className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] h-full flex flex-col">
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
          <OptimizedImage
            src={sauna.image}
            alt={sauna.name}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            sizeConfig="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          <div className="absolute top-4 left-4">
            <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
              {resolveCategoryLabel(sauna.category, 'sauna')}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/80">Wellness Collection</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5 flex-1 flex flex-col">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
              {sauna.name}
            </h3>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                  ${(sauna.price * priceMultiplier).toLocaleString()}
                </p>
                {projectType === 'commercial' && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Commercial Rate</p>
                )}
                <InstallationNote className="mt-2 !text-[9px]" />
              </div>
              <p className="text-right text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {sauna.dimensions}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {sauna.description}
          </p>

          <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Capacity</dt>
              <dd className="text-right text-foreground">{sauna.capacity}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Heater</dt>
              <dd className="text-right text-foreground">{sauna.heaterPower}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Installation</dt>
              <dd className="text-right text-foreground">{sauna.installationTime}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Warranty</dt>
              <dd className="text-right text-foreground">{sauna.warranty}</dd>
            </div>
          </dl>

          <div className="space-y-2 flex-1">
            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Highlights</p>
            <div className="grid grid-cols-1 gap-1.5">
              {sauna.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1 w-1 rounded-none bg-foreground/60 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between rounded-none text-[10px] uppercase tracking-[0.3em]"
            >
              <span>Additional Features</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-border/60">
              <DynamicFeatureRenderer
                productType="sauna"
                selectedExtras={extras}
                onExtrasChange={setExtras}
              />
              {extrasTotal > 0 && (
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Selected options</span>
                  <span className="font-serif text-lg font-light text-foreground">+${extrasTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-border/60 pt-3">
                <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground mb-1">Included at no extra cost</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kiln-dried wood construction, heater with sauna stones, control unit, interior LED lighting,
                  ergonomic benches, ventilation, delivery, permits and professional installation.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 sm:p-5 lg:p-7 pt-0 flex gap-2 mt-auto">
          <Button
            onClick={() => setShowQuote(true)}
            className="flex-1 instant-quote-btn transition-all duration-300 rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90"
            size="sm"
          >
            Get Instant Quote
          </Button>
          <Button
            className="rounded-none"
            variant="outline"
            size="sm"
            onClick={() => setShowSalesPricing(true)}
            aria-label="Sales team pricing"
            title="Sales team access"
          >
            <Lock className="h-4 w-4" />
          </Button>
        </CardFooter>
      </div>

      <SaunaSalesPricingDialog
        open={showSalesPricing}
        onOpenChange={setShowSalesPricing}
        name={sauna.name}
        unitCost={sauna.unitCost ?? sauna.price}
        capacity={sauna.capacity}
        freight={sauna.shipping}
        optionsRetail={extrasTotal}
      />

      <SurveyQuoteTool
        pool={null}
        customProduct={{
          name: sauna.name,
          price: sauna.price,
          type: 'Sauna',
          image: sauna.image,
        }}
        extras={{
          productType: 'sauna',
          extrasTotal,
          totalPrice: getTotalSaunaPrice(),
          extrasBreakdown: getProductFeatures('sauna')
            .map(feature => {
              const price = calculateFeaturePrice(feature, extras[feature.id], extras) * priceMultiplier;
              if (price <= 0) return null;
              const value = extras[feature.id];
              const name =
                feature.type === 'selection' ? `${feature.label} — ${value}` : feature.label;
              return { name, price };
            })
            .filter(Boolean) as Array<{ name: string; price: number }>,
        }}
        isOpen={showQuote}
        onClose={() => setShowQuote(false)}
      />
    </>
  );
};

export default SaunaProductCard;
