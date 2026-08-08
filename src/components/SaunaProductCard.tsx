import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Flame, Users, Zap, Clock, ShieldCheck, Droplet, Grid3x3, Home, ChevronDown, ChevronUp } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { poolLiners, tanningLedges } from "@/data/poolData";
import { paverTypes } from "@/data/paverData";
import { useProjectType } from "@/contexts/ProjectTypeContext";

// Spa interface and data
interface Spa {
  model: string;
  price: number;
  category: string;
  image: string;
  dimensions?: string;
  features?: string[];
}

const spas: Spa[] = [
  {
    model: "Mystic",
    price: 24000,
    category: 'premium',
    image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.png",
    dimensions: "7' x 7' x 34\"",
    features: ["LED Lighting", "Jets", "Heater"]
  },
  {
    model: "Serenity",
    price: 22000,
    category: 'deluxe',
    image: "/lovable-uploads/1412e1fb-72ec-4219-a98f-4fcffbd15095.png",
    dimensions: "6' x 6' x 32\"",
    features: ["LED Lighting", "Jets", "Heater"]
  },
  {
    model: "Tranquility",
    price: 20000,
    category: 'standard',
    image: "/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png",
    dimensions: "5' x 5' x 30\"",
    features: ["Basic Lighting", "Jets"]
  }
];

// Simplified paver collections with images from paverTypes
const paverCollections = paverTypes.slice(0, 8).map(p => ({
  name: p.name,
  pricePerSqFt: p.basePrice,
  image: p.image
}));

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
    installationTime: string;
    warranty: string;
  };
}

interface SaunaExtras {
  spa: boolean;
  selectedSpaModel: string;
  heater: boolean;
  heaterModel: string;
  jets: boolean;
  jetsCount: number;
  waterline: boolean;
  waterlineOption: string;
  deckPavers: boolean;
  deckPaversArea: number;
  paverCollection: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
}

const JET_PRICE = 250;

// Pool heater options
const poolHeaters = [
  { name: "Heat Pump - Standard", price: 5250, image: "/lovable-uploads/pool-heater.png" },
  { name: "Heat Pump - Premium", price: 6750, image: "/lovable-uploads/pool-heater.png" },
  { name: "Pentair MasterTemp 125 (125K BTU)", price: 3450, image: "/lovable-uploads/pool-heater.png" },
  { name: "Pentair UltraTemp 90 Heat Pump", price: 7762, image: "/lovable-uploads/pool-heater.png" }
];

const SaunaProductCard = ({ sauna }: SaunaProductCardProps) => {
  const { priceMultiplier, projectType } = useProjectType();
  const [showQuote, setShowQuote] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [extras, setExtras] = useState<SaunaExtras>({
    spa: false,
    selectedSpaModel: '',
    heater: false,
    heaterModel: '',
    jets: false,
    jetsCount: 0,
    waterline: false,
    waterlineOption: '',
    deckPavers: false,
    deckPaversArea: 0,
    paverCollection: '',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: '',
  });

  const toggleExtra = (extra: keyof SaunaExtras) => {
    setExtras(prev => ({ ...prev, [extra]: !prev[extra] }));
  };

  const updateExtra = (extra: keyof SaunaExtras, value: any) => {
    setExtras(prev => ({ ...prev, [extra]: value }));
  };

  const calculateExtrasTotal = () => {
    let total = 0;

    if (extras.spa) {
      const spa = spas.find(s => s.model === extras.selectedSpaModel);
      total += spa?.price || 0;
    }

    if (extras.heater) {
      const heater = poolHeaters.find(h => h.name === extras.heaterModel);
      total += heater?.price || 0;
    }

    if (extras.jets && extras.jetsCount > 0) {
      total += extras.jetsCount * JET_PRICE;
    }

    if (extras.waterline) {
      const liner = poolLiners.find(l => l.name === extras.waterlineOption);
      total += liner?.price || 0;
    }

    if (extras.deckPavers && extras.deckPaversArea > 0) {
      const collection = paverCollections.find(c => c.name === extras.paverCollection);
      total += (collection?.pricePerSqFt || 0) * extras.deckPaversArea;
    }

    if (extras.screenEnclosure && extras.screenEnclosureArea > 0) {
      let pricePerSqFt = 15;
      if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
      total += extras.screenEnclosureArea * pricePerSqFt;
    }

    // Apply project type multiplier (3x for commercial)
    return total * priceMultiplier;
  };

  const getTotalSaunaPrice = () => {
    return (sauna.price + calculateExtrasTotal() / priceMultiplier) * priceMultiplier;
  };

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
                  {sauna.category.toUpperCase()}
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
          </CardFooter>
        </div>
      </Card>

      <SurveyQuoteTool
        pool={null}
        customProduct={{
          name: sauna.name,
          price: sauna.price,
          type: 'Sauna',
          image: sauna.image,
        }}
        isOpen={showQuote}
        onClose={() => setShowQuote(false)}
      />
    </>
  );
};

export default SaunaProductCard;
