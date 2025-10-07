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

// Simplified paver collections
const paverCollections = paverTypes.slice(0, 8).map(p => ({
  name: p.name,
  pricePerSqFt: p.basePrice
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
  waterline: boolean;
  waterlineOption: string;
  deckPavers: boolean;
  deckPaversArea: number;
  paverCollection: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: string;
}

// Pool heater options
const poolHeaters = [
  { name: "Heat Pump - Standard", price: 3500, image: "/lovable-uploads/pool-heater.png" },
  { name: "Heat Pump - Premium", price: 4500, image: "/lovable-uploads/pool-heater.png" },
  { name: "Gas Heater - Propane", price: 2800, image: "/lovable-uploads/pool-heater.png" },
  { name: "Solar Heater System", price: 5000, image: "/lovable-uploads/pool-heater.png" },
];

const SaunaProductCard = ({ sauna }: SaunaProductCardProps) => {
  const [showQuote, setShowQuote] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [extras, setExtras] = useState<SaunaExtras>({
    spa: false,
    selectedSpaModel: spas[0].model,
    heater: false,
    heaterModel: poolHeaters[0].name,
    waterline: false,
    waterlineOption: poolLiners[0].name,
    deckPavers: false,
    deckPaversArea: 0,
    paverCollection: paverCollections[0].name,
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'standard',
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
      
      if (extras.heater) {
        const heater = poolHeaters.find(h => h.name === extras.heaterModel);
        total += heater?.price || 0;
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
    }
    
    return total;
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
      <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-amber-500/50">
        <CardHeader className="p-0 relative">
          <div className="relative h-64 overflow-hidden">
            <OptimizedImage
              src={sauna.image}
              alt={sauna.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              sizeConfig="hero"
            />
            <div className="absolute top-4 left-4 z-10">
              <Badge className={`${getCategoryColor(sauna.category)} text-white px-4 py-1`}>
                {sauna.category.toUpperCase()}
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {sauna.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{sauna.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-amber-600" />
              <span className="text-muted-foreground">{sauna.capacity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-muted-foreground">{sauna.heaterPower}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-muted-foreground text-xs">{sauna.installationTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-orange-600" />
              <span className="text-muted-foreground text-xs">{sauna.warranty}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-3xl font-bold text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ${(sauna.price + calculateExtrasTotal()).toLocaleString()}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-1">
              {calculateExtrasTotal() > 0 ? 'Base + Extras included' : 'Complete installation included'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-amber-600">Key Features:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {sauna.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Flame className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Features Toggle */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between"
            >
              <span className="text-sm font-semibold">Additional Features</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Additional Features Options */}
          {showDetails && (
            <div className="space-y-3 pt-4 border-t">
              {/* Add a Spa */}
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox 
                  checked={extras.spa} 
                  onCheckedChange={() => toggleExtra('spa')} 
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex items-center space-x-1">
                  <Droplet size={16} className="text-primary" />
                  <span className="text-sm">Add a Spa (+${extras.spa ? (spas.find(s => s.model === extras.selectedSpaModel)?.price || 0).toLocaleString() : '0'})</span>
                </div>
              </label>
              {extras.spa && (
                <div className="ml-6 space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Select Spa Model:</label>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {spas.map((spa) => (
                        <CarouselItem key={spa.model} className="pl-1 basis-1/2 sm:basis-1/3">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.selectedSpaModel === spa.model ? 'border-primary bg-primary/10' : 'border-border'
                            }`} 
                            onClick={() => updateExtra('selectedSpaModel', spa.model)}
                          >
                            <div className="w-full h-20 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <OptimizedImage 
                                src={spa.image} 
                                alt={spa.model} 
                                className="w-full h-full object-cover" 
                                loading="lazy"
                              />
                            </div>
                            <p className="text-xs font-medium text-center">{spa.model}</p>
                            <p className="text-xs text-muted-foreground text-center">{spa.dimensions}</p>
                            <p className="text-xs text-primary font-semibold text-center">+${spa.price.toLocaleString()}</p>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>

                  {/* Spa Sub-options */}
                  <div className="ml-4 space-y-4 mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                    {/* Spa Heater */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.heater} 
                        onCheckedChange={() => toggleExtra('heater')} 
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex items-center space-x-1">
                        <Zap size={16} className="text-primary" />
                        <span className="text-sm">Spa Heater (+${extras.heater ? (poolHeaters.find(h => h.name === extras.heaterModel)?.price || 0).toLocaleString() : '0'})</span>
                      </div>
                    </label>
                    {extras.heater && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                        <div className="grid grid-cols-1 gap-2">
                          {poolHeaters.map((heater) => (
                            <button
                              key={heater.name}
                              onClick={() => updateExtra('heaterModel', heater.name)}
                              className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${
                                extras.heaterModel === heater.name 
                                  ? 'border-primary bg-primary/10 text-primary' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex-1 text-left">
                                <div>{heater.name}</div>
                                <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Waterline */}
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        checked={extras.waterline} 
                        onCheckedChange={() => toggleExtra('waterline')} 
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex items-center space-x-1">
                        <Droplet size={16} className="text-primary" />
                        <span className="text-sm">Waterline (+${extras.waterline ? (poolLiners.find(l => l.name === extras.waterlineOption)?.price || 0).toLocaleString() : '0'})</span>
                      </div>
                    </label>
                    {extras.waterline && (
                      <div className="ml-6 space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Select Waterline:</label>
                        <Carousel className="w-full">
                          <CarouselContent className="-ml-1">
                            {poolLiners.map((liner) => (
                              <CarouselItem key={liner.name} className="pl-1 basis-1/3">
                                <div 
                                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                    extras.waterlineOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                                  }`} 
                                  onClick={() => updateExtra('waterlineOption', liner.name)}
                                >
                                  <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                    <OptimizedImage 
                                      src={liner.image} 
                                      alt={liner.name} 
                                      className="w-full h-full object-cover" 
                                      loading="lazy"
                                    />
                                  </div>
                                  <p className="text-xs font-medium text-center">{liner.name}</p>
                                  <p className="text-xs text-primary font-semibold text-center">+${liner.price.toLocaleString()}</p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-0" />
                          <CarouselNext className="right-0" />
                        </Carousel>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deck Pavers - Standalone */}
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox 
                  checked={extras.deckPavers} 
                  onCheckedChange={() => toggleExtra('deckPavers')} 
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex items-center space-x-1">
                  <Grid3x3 size={16} className="text-primary" />
                  <span className="text-sm">Deck Pavers (+${extras.deckPavers && extras.deckPaversArea > 0 ? ((paverCollections.find(c => c.name === extras.paverCollection)?.pricePerSqFt || 0) * extras.deckPaversArea).toLocaleString() : '0'})</span>
                </div>
              </label>
              {extras.deckPavers && (
                <div className="ml-6 space-y-2">
                  <div className="mb-3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Deck Area (sq ft)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter deck surface area"
                      value={extras.deckPaversArea || ''}
                      onChange={(e) => updateExtra('deckPaversArea', parseFloat(e.target.value) || 0)}
                      className="mb-2"
                    />
                    {extras.deckPaversArea > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Calculated Cost: ${((paverCollections.find(c => c.name === extras.paverCollection)?.pricePerSqFt || 0) * extras.deckPaversArea).toLocaleString()} ({extras.deckPaversArea} sq ft × ${paverCollections.find(c => c.name === extras.paverCollection)?.pricePerSqFt}/sq ft)
                      </div>
                    )}
                  </div>
                  <label className="text-xs font-medium text-muted-foreground">Select Paver Collection:</label>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {paverCollections.map((collection) => (
                        <CarouselItem key={collection.name} className="pl-1 basis-1/2 sm:basis-1/3">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              extras.paverCollection === collection.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`} 
                            onClick={() => updateExtra('paverCollection', collection.name)}
                          >
                            <p className="text-xs font-medium">{collection.name}</p>
                            <p className="text-xs text-primary">${collection.pricePerSqFt}/sq ft</p>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>
              )}

              {/* Screen Enclosure - Standalone */}
              <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox 
                  checked={extras.screenEnclosure} 
                  onCheckedChange={() => toggleExtra('screenEnclosure')} 
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex items-center space-x-1">
                  <Home size={16} className="text-primary" />
                  <span className="text-sm">Screen Enclosure (+${extras.screenEnclosure && extras.screenEnclosureArea > 0 ? (() => {
                    let pricePerSqFt = 15;
                    if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
                    return (extras.screenEnclosureArea * pricePerSqFt).toLocaleString();
                  })() : '0'})</span>
                </div>
              </label>
              {extras.screenEnclosure && (
                <div className="ml-6 space-y-2">
                  <div className="mb-3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Screen Enclosure Area (sq ft)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter surface area for screen enclosure"
                      value={extras.screenEnclosureArea || ''}
                      onChange={(e) => updateExtra('screenEnclosureArea', parseFloat(e.target.value) || 0)}
                      className="mb-2"
                    />
                    {extras.screenEnclosureArea > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Calculated Cost: ${(() => {
                          let pricePerSqFt = 15;
                          if (extras.screenEnclosureQuality === 'premium') pricePerSqFt = 28;
                          return (extras.screenEnclosureArea * pricePerSqFt).toLocaleString();
                        })()} ({extras.screenEnclosureArea} sq ft × ${extras.screenEnclosureQuality === 'premium' ? '$28' : '$15'}/sq ft)
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md text-center ${
                        extras.screenEnclosureQuality === 'standard' ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => updateExtra('screenEnclosureQuality', 'standard')}
                    >
                      <p className="text-sm font-medium">Standard</p>
                      <p className="text-xs text-muted-foreground">$15/sq ft</p>
                    </div>
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md text-center ${
                        extras.screenEnclosureQuality === 'premium' ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => updateExtra('screenEnclosureQuality', 'premium')}
                    >
                      <p className="text-sm font-medium">Premium</p>
                      <p className="text-xs text-muted-foreground">$28/sq ft</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-2">
          <Button
            onClick={() => setShowQuote(true)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            Get Instant Quote
          </Button>
        </CardFooter>
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
