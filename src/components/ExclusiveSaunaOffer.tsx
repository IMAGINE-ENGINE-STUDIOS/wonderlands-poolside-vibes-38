import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, Users, Zap, CheckCircle, Plus } from "lucide-react";

interface ExclusiveSaunaOfferProps {
  poolModel: string;
  poolPrice: number;
  onAddToQuote?: () => void;
}

const ExclusiveSaunaOffer: React.FC<ExclusiveSaunaOfferProps> = ({ poolModel, poolPrice, onAddToQuote }) => {
  const eligibleModels = ["Astoria", "Genesis", "Claremont", "Extreme 38"];
  const isEligible = eligibleModels.includes(poolModel) && poolPrice >= 70000;

  if (!isEligible) return null;

  const features = [
    { icon: <Users className="w-4 h-4" />, text: "Holds up to 4 people" },
    { icon: <Thermometer className="w-4 h-4" />, text: "6kW heater, 240V, 30-amp" },
    { icon: <Zap className="w-4 h-4" />, text: "Interior LED lighting" },
    { icon: <CheckCircle className="w-4 h-4" />, text: "Sauna stones included" }
  ];

  const specifications = [
    { label: "Lumber", value: "Ball-and-socket, 1⅜″ thick" },
    { label: "Glass", value: "Tempered glass features" },
    { label: "Hardware", value: "Stainless steel bands, hinges, fasteners" },
    { label: "Assembled Size", value: "72″W × 71″D × 75⅜″H" },
    { label: "Interior Size", value: "69¼″W × 63¼″D × 69¼″H" },
    { label: "Bench Size", value: "16″W × 63¼″L × 17″H" }
  ];

  return (
    <div className="mt-4 p-4 border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <h4 className="font-semibold text-sm text-primary">Exclusive Sauna Offer</h4>
            <p className="text-xs text-muted-foreground">Available with {poolModel} $70,000+</p>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 w-8 p-0 shrink-0"
          onClick={onAddToQuote}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <img 
          src="/lovable-uploads/barrel-sauna.webp" 
          alt="Barrel Sauna" 
          className="w-full h-20 object-cover rounded"
        />
        <div className="space-y-1">
          {features.slice(0, 2).map((feature, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <span className="text-primary text-[10px]">{feature.icon}</span>
              <span className="text-muted-foreground">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Size:</span>
          <span>72″W × 71″D × 75⅜″H</span>
        </div>
        <div className="flex justify-between">
          <span>Interior:</span>
          <span>69¼″W × 63¼″D × 69¼″H</span>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveSaunaOffer;