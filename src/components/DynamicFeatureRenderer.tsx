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

  const renderFeature = (feature: FeatureConfig) => {
    switch (feature.type) {
      case 'boolean':
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

      case 'selection':
        return (
          <div key={feature.id}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <Label className="text-sm font-medium">{feature.label}</Label>
                {feature.description && (
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedExtras[feature.id] !== undefined && selectedExtras[feature.id] !== 'None'}
                  onCheckedChange={(checked) => {
                    const newExtras = {
                      ...selectedExtras,
                      [feature.id]: checked ? (feature.options?.[1]?.name || '') : 'None'
                    };
                    onExtrasChange(newExtras);
                    if (checked) {
                      setActiveFeatureCarousel(feature.id);
                    } else {
                      setActiveFeatureCarousel(null);
                    }
                  }}
                />
                {selectedExtras[feature.id] && selectedExtras[feature.id] !== 'None' && (
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
            {selectedExtras[feature.id] && selectedExtras[feature.id] !== 'None' && activeFeatureCarousel === feature.id && feature.options && (
              <div className="h-24 mb-4">
                <Carousel className="w-full h-full">
                  <CarouselContent className="-ml-1 h-full">
                    {feature.options.filter(opt => opt.name !== 'None').map((option) => (
                      <CarouselItem key={option.name} className="pl-1 basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <div
                          className={`cursor-pointer rounded-lg border-2 transition-all duration-200 p-2 h-full ${
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
                            <img src={option.image} alt={option.name} className="w-full h-16 object-cover rounded" />
                          )}
                          <p className="text-xs font-medium mt-1 truncate">{option.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {option.price > 0 ? `+$${option.price.toLocaleString()}` : 'Included'}
                          </p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
          </div>
        );

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
                value={selectedExtras[feature.id] || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
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
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={selectedExtras[feature.id] || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    onExtrasChange({
                      ...selectedExtras,
                      [feature.id]: value
                    });
                  }}
                  className="w-24"
                  placeholder="sq ft"
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
