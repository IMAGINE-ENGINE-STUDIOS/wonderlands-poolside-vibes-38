import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Users, Zap, Clock, ShieldCheck } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";

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

const SaunaProductCard = ({ sauna }: SaunaProductCardProps) => {
  const [showQuote, setShowQuote] = useState(false);

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
              ${sauna.price.toLocaleString()}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Complete installation included
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
