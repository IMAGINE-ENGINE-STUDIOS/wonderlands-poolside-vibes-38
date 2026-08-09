import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { getProductFeatures, type ProductType, type FeatureConfig } from '@/config/productFeatures';

interface DynamicFeatureRendererProps {
  productType: ProductType;
  selectedExtras: any;
  onExtrasChange: (extras: any) => void;
}

export function DynamicFeatureRenderer({ productType, selectedExtras, onExtrasChange }: DynamicFeatureRendererProps) {
  const [activeFeatureCarousel, setActiveFeatureCarousel] = useState<string | null>(null);
  const features = getProductFeatures(productType);

  const fmt = (n: number) => `$${n.toLocaleString()}`;

  const renderFeature = (feature: FeatureConfig) => {
    switch (feature.type) {
      case 'boolean':
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {feature.image && (
                  <img src={feature.image} alt={feature.label} loading="lazy" className="h-10 w-10 rounded object-cover border border-border flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <Label className="text-sm font-medium">{feature.label}</Label>
                  {feature.description && (
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  )}
                  {!!feature.basePrice && (
                    <p className="text-xs font-semibold text-primary">+{fmt(feature.basePrice)}</p>
                  )}
                </div>
              </div>
              <Checkbox
                checked={selectedExtras[feature.id]}
                onCheckedChange={(checked) => {
                  onExtrasChange({
                    ...selectedExtras,
                    [feature.id]: !!checked
                  });
                }}
              />
            </div>
          </div>
        );

      case 'selection': {
        const selectedName = selectedExtras[feature.id];
        const selectedOption = feature.options?.find(o => o.name === selectedName);
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {selectedOption?.image && (
                  <img src={selectedOption.image} alt={selectedOption.name} loading="lazy" className="h-10 w-10 rounded object-cover border border-border flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <Label className="text-sm font-medium">{feature.label}</Label>
                  {feature.description && (
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  )}
                  {selectedOption && selectedOption.name !== 'None' && (
                    <p className="text-xs font-semibold text-primary truncate">
                      {selectedOption.name} — {selectedOption.price > 0 ? `+${fmt(selectedOption.price)}` : 'Included'}
                    </p>
                  )}
                  {!selectedOption && feature.options && feature.options.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      from {fmt(Math.min(...feature.options.filter(o => o.price > 0).map(o => o.price)))}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedExtras[feature.id] !== undefined && selectedExtras[feature.id] !== 'None' && selectedExtras[feature.id] !== ''}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Open carousel to let user select an option
                      setActiveFeatureCarousel(feature.id);
                      // Set to first valid option if available
                      const firstOption = feature.options?.find(opt => opt.name !== 'None');
                      const newExtras = {
                        ...selectedExtras,
                        [feature.id]: firstOption?.name || ''
                      };
                      onExtrasChange(newExtras);
                    } else {
                      // Uncheck - set back to None
                      const newExtras = {
                        ...selectedExtras,
                        [feature.id]: 'None'
                      };
                      onExtrasChange(newExtras);
                      setActiveFeatureCarousel(null);
                    }
                  }}
                />
              </div>
            </div>

            {/* Always-visible option carousel, matching the pool configurator format */}
            {feature.options && feature.options.filter(opt => opt.name !== 'None').length > 0 && (
              <div className="space-y-3 mb-4">
                <Carousel
                  className="w-full"
                  opts={{
                    align: 'start',
                    loop: false,
                    duration: 25,
                  }}
                >
                  <CarouselContent className="-ml-1">
                    {feature.options.filter(opt => opt.name !== 'None').map((option, idx) => (
                      <CarouselItem key={`${feature.id}-${option.name}-${idx}`} className="pl-1 basis-1/2 md:basis-1/4">
                        <div
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                            selectedExtras[feature.id] === option.name ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          onClick={() => {
                            onExtrasChange({
                              ...selectedExtras,
                              [feature.id]: option.name
                            });
                          }}
                        >
                          <div className="w-full h-28 rounded-md mb-2 overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                            {option.image ? (
                              <img
                                src={option.image}
                                alt={option.name}
                                loading="lazy"
                                className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                              />
                            ) : (
                              <span className="text-[10px] text-muted-foreground px-1 text-center">{option.name}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium text-center truncate">{option.name}</p>
                            <p className="text-xs text-foreground font-semibold text-center">
                              {option.price > 0 ? `+$${option.price.toLocaleString()}` : 'Included'}
                            </p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0 animate-pulse" />
                  <CarouselNext className="right-0 animate-pulse" />
                </Carousel>
              </div>
            )}
          </div>
        );
      }



      case 'quantity':
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
              <Input
                type="number"
                min={0}
                value={selectedExtras[feature.id] ?? ''}
                placeholder="0"
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                  onExtrasChange({
                    ...selectedExtras,
                    [feature.id]: value
                  });
                }}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'area':
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
                {!!feature.pricePerUnit && (
                  <p className="text-xs font-semibold text-primary">{fmt(feature.pricePerUnit)} / sq ft</p>
                )}
              </div>
              <div className="flex items-center gap-2">

                <Input
                  type="number"
                  min={0}
                  value={selectedExtras[feature.id] ?? ''}
                  placeholder="0"
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    onExtrasChange({
                      ...selectedExtras,
                      [feature.id]: value
                    });
                  }}
                  className="w-24"
                />
                <span className="text-xs text-muted-foreground">sq ft</span>
              </div>
            </div>
          </div>
        );

      case 'nested':
        // Handle nested features (e.g., spa with sub-features)
        const isParentEnabled = selectedExtras[feature.id];
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
              <Checkbox
                checked={isParentEnabled}
                onCheckedChange={(checked) => {
                  onExtrasChange({
                    ...selectedExtras,
                    [feature.id]: !!checked
                  });
                }}
              />
            </div>
            {isParentEnabled && feature.subFeatures && (
              <div className="ml-4 space-y-4 mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                {feature.subFeatures.map(subFeature => renderFeature(subFeature))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {features.map(feature => renderFeature(feature))}
    </div>
  );
}
