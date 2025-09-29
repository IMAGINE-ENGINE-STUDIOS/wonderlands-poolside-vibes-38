import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Thermometer, Users, Zap, CheckCircle } from "lucide-react";

interface ExclusiveSaunaOfferProps {
  poolModel: string;
  poolPrice: number;
}

const ExclusiveSaunaOffer: React.FC<ExclusiveSaunaOfferProps> = ({ poolModel, poolPrice }) => {
  const eligibleModels = ["Astoria", "Genesis", "Claremont"];
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
    <Card className="mt-6 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-primary">
              🔥 Exclusive Sauna Offer
            </CardTitle>
            <CardDescription className="text-base">
              Available with select fiberglass pool models $70,000+
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {poolModel} Eligible
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sauna Image */}
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/barrel-sauna.webp" 
              alt="Barrel Sauna" 
              className="w-full h-48 object-cover rounded-lg"
            />
            
            {/* Key Features */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">{feature.icon}</span>
                  <span className="text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Specifications */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Sauna Specifications</h4>
            <div className="space-y-2">
              {specifications.map((spec, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium text-muted-foreground">{spec.label}:</span>
                  <span className="text-foreground text-right max-w-[60%]">{spec.value}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Heater Electrical:</span>
                  <span className="text-sm text-foreground">240V, 30-amp, hardwire</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Lighting Electrical:</span>
                  <span className="text-sm text-foreground">110V, 15-amp, plug-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button className="flex-1" size="lg">
            Add Sauna to Quote
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExclusiveSaunaOffer;