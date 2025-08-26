import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Ruler, Settings, Waves } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { openQuotePreview } from "@/utils/quoteNavigation";
import ImageCard from "./ImageCard";

export interface Pool {
  id: string;
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
}

interface PoolProductCardProps {
  pool: Pool;
  onViewDetails: (pool: Pool) => void;
  onRequestQuote: (pool: Pool, extras?: any) => void;
}

interface ExtraOptions {
  finish: string;
  liner: string;
  pavers: {
    enabled: boolean;
    type: string;
    area: number;
  };
  screenEnclosure: {
    enabled: boolean;
    type: string;
    area: number;
    twoStory: boolean;
  };
  tiles: string;
  automaticCover: boolean;
  heater: boolean;
  spa: boolean;
  tanningLedge: boolean;
  spaJets: {
    enabled: boolean;
    quantity: number;
  };
}

const poolFinishes = [
  { id: 'finish-1', name: 'PebbleTec', price: 3500 },
  { id: 'finish-2', name: 'QuartzScape', price: 2800 },
  { id: 'finish-3', name: 'Hydrazzo', price: 4200 },
];

const poolLiners = [
  { id: 'liner-1', name: 'Marble', price: 1800 },
  { id: 'liner-2', name: 'Granite', price: 2200 },
  { id: 'liner-3', name: 'Onyx', price: 2500 },
];

const paverOptions = [
  { id: 'paver-1', name: 'Travertine', pricePerSqFt: 12 },
  { id: 'paver-2', name: 'Concrete', pricePerSqFt: 8 },
  { id: 'paver-3', name: 'Brick', pricePerSqFt: 10 },
];

const screenEnclosures = [
  { id: 'enclosure-1', name: 'Standard', basePrice: 15, premiumPrice: 25 },
  { id: 'enclosure-2', name: 'Deluxe', basePrice: 20, premiumPrice: 30 },
  { id: 'enclosure-3', name: 'Premium', basePrice: 25, premiumPrice: 35 },
];

const poolTiles = [
  { id: 'tile-1', name: 'Ceramic', price: 800 },
  { id: 'tile-2', name: 'Porcelain', price: 1200 },
  { id: 'tile-3', name: 'Glass', price: 1500 },
];

const PoolProductCard = ({ pool, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [showExtras, setShowExtras] = useState(false);
  const [extras, setExtras] = useState<ExtraOptions>({
    finish: poolFinishes[0].name,
    liner: poolLiners[0].name,
    pavers: {
      enabled: false,
      type: paverOptions[0].name,
      area: 0,
    },
    screenEnclosure: {
      enabled: false,
      type: screenEnclosures[0].name,
      area: 0,
      twoStory: false,
    },
    tiles: poolTiles[0].name,
    automaticCover: false,
    heater: false,
    spa: false,
    tanningLedge: false,
    spaJets: {
      enabled: false,
      quantity: 4,
    },
  });

  const handleRequestQuote = () => {
    console.log('Requesting quote for pool:', pool);
    
    const quotePayload = {
      type: 'pool' as const,
      pool: {
        ...pool,
        selectedExtras: extras
      },
      extras
    };
    
    console.log('Quote payload:', quotePayload);
    openQuotePreview(quotePayload);
  };

  const handleViewDetails = () => {
    onViewDetails(pool);
  };

  const updateExtras = (key: keyof ExtraOptions, value: any) => {
    setExtras((prev) => ({ ...prev, [key]: value }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'deluxe': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'standard': return 'bg-gradient-to-r from-blue-500 to-teal-500';
      case 'compact': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default: return 'bg-gradient-to-r from-primary to-teal';
    }
  };

  const calculatePaversPrice = () => {
    const selectedPaver = paverOptions.find((p) => p.name === extras.pavers.type);
    return selectedPaver ? extras.pavers.area * selectedPaver.pricePerSqFt : 0;
  };

  const calculateScreenEnclosurePrice = () => {
    const selectedEnclosure = screenEnclosures.find((e) => e.name === extras.screenEnclosure.type);
    if (!selectedEnclosure) return 0;
    
    const basePrice = selectedEnclosure.basePrice;
    const premiumPrice = selectedEnclosure.premiumPrice;
    
    return extras.screenEnclosure.twoStory ? extras.screenEnclosure.area * premiumPrice : extras.screenEnclosure.area * basePrice;
  };

  const getTotalExtrasPrice = () => {
    let total = 0;

    const selectedFinish = poolFinishes.find((f) => f.name === extras.finish);
    total += selectedFinish ? selectedFinish.price : 0;

    const selectedLiner = poolLiners.find((l) => l.name === extras.liner);
    total += selectedLiner ? selectedLiner.price : 0;

    total += calculatePaversPrice();
    total += calculateScreenEnclosurePrice();

    const selectedTiles = poolTiles.find((t) => t.name === extras.tiles);
    total += selectedTiles ? selectedTiles.price : 0;

    total += extras.automaticCover ? 5000 : 0;
    total += extras.heater ? 3000 : 0;
    total += extras.spa ? 8000 : 0;
    total += extras.tanningLedge ? 4000 : 0;
    total += extras.spaJets.enabled ? extras.spaJets.quantity * 500 : 0;

    return total;
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background/80 via-background/60 to-primary/5 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
      {/* Pool Image */}
      <div className="relative h-64 overflow-hidden rounded-t-2xl">
        <ImageCard
          src={pool.image}
          alt={pool.model}
          className="w-full h-full transition-transform duration-700 group-hover:scale-110"
          objectFit="cover"
          enableZoom={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(pool.category)} text-white font-semibold px-3 py-1.5 text-sm shadow-lg`}>
            {pool.category.charAt(0).toUpperCase() + pool.category.slice(1)}
          </Badge>
        </div>

        {/* Price */}
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
          <div className="text-white font-bold text-lg">
            ${(pool.price + getTotalExtrasPrice()).toLocaleString()}
          </div>
          {getTotalExtrasPrice() > 0 && (
            <div className="text-white/80 text-xs">
              Base: ${pool.price.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Pool Info */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {pool.model}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Ruler size={16} className="text-primary" />
              <span>{pool.dimensions}</span>
            </div>
            <div className="flex items-center gap-1">
              <Waves size={16} className="text-teal" />
              <span>{pool.depth}</span>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">Key Features:</h4>
            <div className="grid grid-cols-1 gap-1">
              {pool.features?.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleViewDetails}
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-primary hover:text-white transition-colors"
          >
            <Eye size={16} className="mr-2" />
            View Details
          </Button>
          
          <Button
            onClick={() => setShowExtras(!showExtras)}
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-primary hover:text-white transition-colors"
          >
            <Settings size={16} className="mr-2" />
            Customize
          </Button>
        </div>

        {/* Request Quote Button */}
        <Button
          onClick={handleRequestQuote}
          variant="gradient"
          size="lg"
          className="w-full text-base font-semibold hover:scale-105 transition-all duration-300"
        >
          <FileText size={18} className="mr-2" />
          Request Quote - ${(pool.price + getTotalExtrasPrice()).toLocaleString()}
        </Button>

        {/* Extras Panel */}
        {showExtras && (
          <div className="mt-6 p-4 border border-border/50 rounded-lg bg-muted/30 space-y-4">
            <h4 className="font-semibold text-foreground mb-3">Customize Your Pool</h4>
            
            {/* Finishes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pool Finish</Label>
              <Select value={extras.finish} onValueChange={(value) => updateExtras('finish', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select finish" />
                </SelectTrigger>
                <SelectContent>
                  {poolFinishes.map((finish) => (
                    <SelectItem key={finish.id} value={finish.name}>
                      {finish.name} (+${finish.price.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Liners */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pool Liner</Label>
              <Select value={extras.liner} onValueChange={(value) => updateExtras('liner', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select liner" />
                </SelectTrigger>
                <SelectContent>
                  {poolLiners.map((liner) => (
                    <SelectItem key={liner.id} value={liner.name}>
                      {liner.name} (+${liner.price.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pavers with calculation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Add Pavers</Label>
                <Switch
                  checked={extras.pavers.enabled}
                  onCheckedChange={(checked) => updateExtras('pavers', { ...extras.pavers, enabled: checked })}
                />
              </div>
              
              {extras.pavers.enabled && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Paver Type</Label>
                    <Select value={extras.pavers.type} onValueChange={(value) => updateExtras('pavers', { ...extras.pavers, type: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select paver type" />
                      </SelectTrigger>
                      <SelectContent>
                        {paverOptions.map((paver) => (
                          <SelectItem key={paver.id} value={paver.name}>
                            {paver.name} (${paver.pricePerSqFt}/sq ft)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Area (sq ft)</Label>
                      <Input
                        type="number"
                        value={extras.pavers.area}
                        onChange={(e) => updateExtras('pavers', { ...extras.pavers, area: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  {extras.pavers.area > 0 && (
                    <div className="text-sm font-medium text-primary">
                      Pavers Cost: ${calculatePaversPrice().toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Screen Enclosure with calculation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Add Screen Enclosure</Label>
                <Switch
                  checked={extras.screenEnclosure.enabled}
                  onCheckedChange={(checked) => updateExtras('screenEnclosure', { ...extras.screenEnclosure, enabled: checked })}
                />
              </div>
              
              {extras.screenEnclosure.enabled && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Enclosure Type</Label>
                    <Select value={extras.screenEnclosure.type} onValueChange={(value) => updateExtras('screenEnclosure', { ...extras.screenEnclosure, type: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select enclosure type" />
                      </SelectTrigger>
                      <SelectContent>
                        {screenEnclosures.map((enclosure) => (
                          <SelectItem key={enclosure.id} value={enclosure.name}>
                            {enclosure.name} (${enclosure.basePrice}/sq ft)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Area (sq ft)</Label>
                      <Input
                        type="number"
                        value={extras.screenEnclosure.area}
                        onChange={(e) => updateExtras('screenEnclosure', { ...extras.screenEnclosure, area: parseInt(e.target.value) || 0 })}
                        min="0"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={extras.screenEnclosure.twoStory}
                          onChange={(e) => updateExtras('screenEnclosure', { ...extras.screenEnclosure, twoStory: e.target.checked })}
                          className="w-3 h-3"
                        />
                        Two Story
                      </Label>
                    </div>
                  </div>
                  
                  {extras.screenEnclosure.area > 0 && (
                    <div className="text-sm font-medium text-primary">
                      Enclosure Cost: ${calculateScreenEnclosurePrice().toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pool Tiles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Pool Tiles</Label>
              <Select value={extras.tiles} onValueChange={(value) => updateExtras('tiles', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tiles" />
                </SelectTrigger>
                <SelectContent>
                  {poolTiles.map((tile) => (
                    <SelectItem key={tile.id} value={tile.name}>
                      {tile.name} (+${tile.price.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add-ons with toggles */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Automatic Cover</Label>
                <Switch
                  checked={extras.automaticCover}
                  onCheckedChange={(checked) => updateExtras('automaticCover', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Heater</Label>
                <Switch
                  checked={extras.heater}
                  onCheckedChange={(checked) => updateExtras('heater', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Add Spa</Label>
                <Switch
                  checked={extras.spa}
                  onCheckedChange={(checked) => updateExtras('spa', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Tanning Ledge</Label>
                <Switch
                  checked={extras.tanningLedge}
                  onCheckedChange={(checked) => updateExtras('tanningLedge', checked)}
                />
              </div>
            </div>

            {/* Spa Jets with quantity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Spa Jets</Label>
                <Switch
                  checked={extras.spaJets.enabled}
                  onCheckedChange={(checked) => updateExtras('spaJets', { ...extras.spaJets, enabled: checked })}
                />
              </div>
              
              {extras.spaJets.enabled && (
                <div className="pl-4 border-l-2 border-primary/20">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Quantity:</Label>
                    <Input
                      type="number"
                      value={extras.spaJets.quantity}
                      onChange={(e) => updateExtras('spaJets', { ...extras.spaJets, quantity: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="12"
                      className="w-20 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">
                      (+${(extras.spaJets.quantity * 500).toLocaleString()})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Extras Price */}
            {getTotalExtrasPrice() > 0 && (
              <div className="pt-3 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Total Extras:</span>
                  <span className="font-bold text-primary text-lg">
                    +${getTotalExtrasPrice().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-foreground">Grand Total:</span>
                  <span className="font-bold text-primary text-xl">
                    ${(pool.price + getTotalExtrasPrice()).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolProductCard;
