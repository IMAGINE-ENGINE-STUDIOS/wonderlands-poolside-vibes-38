import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Users, Zap, Clock, ShieldCheck, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { DynamicFeatureRenderer } from "./DynamicFeatureRenderer";
import { getProductFeatures, calculateFeaturePrice } from "@/config/productFeatures";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { resolveCategoryLabel } from '@/lib/productCategories';
import SaunaSalesPricingDialog from "./sauna/SaunaSalesPricingDialog";

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'deluxe':
        return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'compact':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      default:
        return 'bg-gradient-to-r from-primary to-teal';
    }
  };
  return (
    <>
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background via-background to-amber-50/20 dark:to-amber-950/10 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 h-full flex flex-col">
        {/* Animated gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col flex-1">
          <CardHeader className="p-0 relative overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden">
              <OptimizedImage
                src={sauna.image}
                alt={sauna.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizeConfig="hero"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* Category badge */}
              <div className="absolute top-4 left-4 z-10">
                <Badge className={`${getCategoryColor(sauna.category)} text-white px-4 py-1.5 shadow-lg backdrop-blur-sm`}>
                  <Flame className="w-3 h-3 mr-1 inline" />
                  {resolveCategoryLabel(sauna.category, 'sauna').toUpperCase()}
                </Badge>
              </div>
              
              {/* Price badge - top right */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-xl border border-amber-200 dark:border-amber-800">
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    ${(sauna.price * priceMultiplier).toLocaleString()}
                  </div>
                  {projectType === 'commercial' && (
                    <div className="text-xs text-amber-600 font-medium">Commercial</div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4 relative z-10 flex-1 flex flex-col">
            {/* Title and specs - moved from image overlay */}
            <div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {sauna.name}
              </h3>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span>{sauna.capacity}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span>{sauna.heaterPower}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {sauna.description}
            </p>

            {/* Key specs grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Installation</div>
                  <div className="text-xs font-medium">{sauna.installationTime}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Warranty</div>
                  <div className="text-xs font-medium">{sauna.warranty}</div>
                </div>
              </div>
            </div>

            {/* Features showcase - fixed height for consistency */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Premium Features</p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sauna.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Flame className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-foreground/80 leading-tight line-clamp-2">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Features Toggle - pushed to bottom of content */}
            <div className="pt-3 border-t mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between"
              >
                <span className="text-xs font-semibold">Additional Features</span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

          {/* Sauna-specific configuration options */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t">
              <DynamicFeatureRenderer
                productType="sauna"
                selectedExtras={extras}
                onExtrasChange={setExtras}
              />
              {extrasTotal > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Selected options</span>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">+${extrasTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="rounded-lg bg-muted/40 border px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Included at no extra cost</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Kiln-dried wood construction, heater with sauna stones, control unit, interior LED lighting,
                  ergonomic benches, ventilation, delivery, permits and professional installation.
                </p>
              </div>
            </div>
          )}
          </CardContent>

          <CardFooter className="p-4 pt-0 flex gap-2 mt-auto">
            <Button
              onClick={() => setShowQuote(true)}
              className="flex-1 instant-quote-btn transition-all duration-300"
              size="sm"
            >
              Get Instant Quote
            </Button>
            <Button
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
      </Card>

      <SaunaSalesPricingDialog
        open={showSalesPricing}
        onOpenChange={setShowSalesPricing}
        name={sauna.name}
        unitCost={sauna.unitCost ?? sauna.price}
        capacity={sauna.capacity}
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
