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
                {selectedExtras[feature.id] && selectedExtras[feature.id] !== 'None' && selectedExtras[feature.id] !== '' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newCarousel = activeFeatureCarousel === feature.id ? null : feature.id;
                      setActiveFeatureCarousel(newCarousel);
                    }}
                  >
                    <ChevronDown className={`h-3 w-3 transition-transform ${activeFeatureCarousel === feature.id ? 'rotate-180' : ''}`} />
                  </Button>
                )}
              </div>
            </div>

            {selectedExtras[feature.id] && selectedExtras[feature.id] !== 'None' && selectedExtras[feature.id] !== '' && activeFeatureCarousel === feature.id && feature.options && (
              <div className="mb-4 border rounded-lg p-2 bg-background overflow-hidden w-full">
                <Carousel className="w-full">
                  <CarouselContent className="h-20 sm:h-24">
                    {feature.options.filter(opt => opt.name !== 'None').map((option) => (
                      <CarouselItem key={option.name} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-2">
                        <div
                          className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-1.5 sm:p-2 h-full flex flex-col ${
                            selectedExtras[feature.id] === option.name
                              ? 'border-primary shadow-md'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            onExtrasChange({
                              ...selectedExtras,
                              [feature.id]: option.name
                            });
                            setActiveFeatureCarousel(null);
                          }}
                        >
                          {option.image && (
                            <img src={option.image} alt={option.name} className="w-full h-8 sm:h-12 object-cover rounded mb-1 flex-shrink-0" />
                          )}
                          <p className="text-[10px] sm:text-xs font-medium truncate">{option.name}</p>
                          <p className="text-[9px] sm:text-xs text-muted-foreground">
                            {option.price > 0 ? `+$${option.price.toLocaleString()}` : 'Included'}
                          </p>
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
