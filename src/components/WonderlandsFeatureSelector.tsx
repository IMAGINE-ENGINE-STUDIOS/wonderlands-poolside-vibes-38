import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureOption {
  name: string;
  price: number;
  image: string;
  description?: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  options?: FeatureOption[];
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  allowMultiple?: boolean;
}

interface WonderlandsFeatureSelectorProps {
  features: Feature[];
  selectedExtras: any;
  onExtrasChange: (extras: any) => void;
}

export const WonderlandsFeatureSelector = ({
  features,
  selectedExtras,
  onExtrasChange
}: WonderlandsFeatureSelectorProps) => {
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

  const toggleFeature = (featureId: string) => {
    setExpandedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const isFeatureActive = (featureId: string) => {
    return selectedExtras[featureId] === true || 
           (selectedExtras[featureId] && typeof selectedExtras[featureId] === 'string' && selectedExtras[featureId] !== '');
  };

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    onExtrasChange({
      ...selectedExtras,
      [featureId]: enabled
    });
    
    if (enabled) {
      setExpandedFeatures(prev => new Set(prev).add(featureId));
    }
  };

  const handleOptionSelect = (featureId: string, optionName: string) => {
    const optionKey = `${featureId}Option`;
    onExtrasChange({
      ...selectedExtras,
      [featureId]: true,
      [optionKey]: optionName
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Customize Your Product</h3>
      </div>
      
      {features.map((feature) => {
        const isActive = isFeatureActive(feature.id);
        const isExpanded = expandedFeatures.has(feature.id);
        const selectedOption = selectedExtras[`${feature.id}Option`];
        
        return (
          <Card 
            key={feature.id} 
            className={cn(
              "transition-all duration-300 border-2",
              isActive ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/30"
            )}
          >
            <CardContent className="p-4">
              {/* Feature Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={feature.id}
                      checked={isActive}
                      onCheckedChange={(checked) => handleFeatureToggle(feature.id, !!checked)}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor={feature.id} 
                      className="font-semibold text-sm cursor-pointer"
                    >
                      {feature.name}
                    </Label>
                    {isActive && (
                      <Badge variant="secondary" className="ml-2 h-5">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {feature.description}
                  </p>
                  
                  {/* Show selected option name under description */}
                  {isActive && selectedOption && (
                    <p className="text-xs font-medium text-primary mt-1 ml-6">
                      ✓ {selectedOption}
                    </p>
                  )}
                </div>
                
                {isActive && feature.options && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeature(feature.id)}
                    className="shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Feature Options - Expandable */}
              {isActive && feature.options && isExpanded && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Choose your option:
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {feature.options.map((option) => (
                        <button
                          key={option.name}
                          onClick={() => handleOptionSelect(feature.id, option.name)}
                          className={cn(
                            "group relative overflow-hidden rounded-lg border-2 transition-all duration-200 p-2 text-left",
                            selectedOption === option.name
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/50 hover:shadow-sm"
                          )}
                        >
                          {/* Option Image */}
                          <div className="aspect-square mb-2 overflow-hidden rounded bg-muted">
                            <img
                              src={option.image}
                              alt={option.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          
                          {/* Option Details */}
                          <div className="space-y-1">
                            <p className="text-xs font-semibold line-clamp-2 min-h-[2rem]">
                              {option.name}
                            </p>
                            {option.price > 0 && (
                              <p className="text-xs font-bold text-primary">
                                +${option.price.toLocaleString()}
                              </p>
                            )}
                            {option.price === 0 && (
                              <p className="text-xs font-medium text-green-600">
                                Included
                              </p>
                            )}
                          </div>
                          
                          {/* Selected Indicator */}
                          {selectedOption === option.name && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Input for area/quantity if required */}
              {isActive && feature.requiresInput && (
                <>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <Label htmlFor={`${feature.id}-input`} className="text-xs font-medium">
                      {feature.inputLabel}
                    </Label>
                    <Input
                      id={`${feature.id}-input`}
                      type="number"
                      placeholder={feature.inputPlaceholder}
                      value={selectedExtras[`${feature.id}Area`] || selectedExtras[`${feature.id}Quantity`] || ''}
                      onChange={(e) => {
                        const inputKey = feature.inputLabel?.includes('Area') 
                          ? `${feature.id}Area` 
                          : `${feature.id}Quantity`;
                        onExtrasChange({
                          ...selectedExtras,
                          [inputKey]: e.target.value
                        });
                      }}
                      className="max-w-xs"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
