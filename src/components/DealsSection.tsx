import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Tag, ArrowRight, Star, Clock, Percent } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import enchantment917DealImage from "@/assets/pools/enchantment-917-perspective.jpg";
import cancunDeluxeDealImage from "@/assets/cancun-deluxe.png";

interface Deal {
  id: string;
  name: string;
  originalPrice: number;
  dealPrice: number;
  image: string;
  category: string;
  badge: string;
  description: string;
  features: string[];
  savings: number;
}

interface DealsSectionProps {
  onViewDeal: (deal: Deal) => void;
}

const deals: Deal[] = [
  {
    id: "bermuda-sauna-bundle",
    name: "Bermuda Pool + 4-Person Barrel Sauna",
    originalPrice: 82525,
    dealPrice: 72863,
    image: "/lovable-uploads/bermuda-pool.png",
    category: "Bundle",
    badge: "Best Seller",
    description: "Complete pool & sauna package with salt system, 3D patio render, 5ft pavers, and 2 LED lights included.",
    features: ["Salt System Included", "3D Patio Render", "5ft Pavers", "2 LED Lights", "3-Month Installation"],
    savings: 9662,
  },
  {
    id: "milan-starter",
    name: "Milan 8.14 Starter Package",
    originalPrice: 35150,
    dealPrice: 31150,
    image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
    category: "Starter",
    badge: "Best Value",
    description: "Perfect entry-level fiberglass pool with salt system and carbon fiber. Ideal for smaller backyards.",
    features: ["Salt System Included", "Carbon Fiber", "Lifetime Warranty", "16-Week Install"],
    savings: 4000,
  },
  {
    id: "cancun-deluxe-deal",
    name: "Cancún Deluxe with Integrated Spa",
    originalPrice: 122875,
    dealPrice: 112875,
    image: cancunDeluxeDealImage,
    category: "Premium",
    badge: "Hot Deal",
    description: "Luxury freeform pool with integrated spa, tanning ledge, and spillover water feature.",
    features: ["Integrated Spa", "Tanning Ledge", "Spillover Feature", "Sauna Offer"],
    savings: 10000,
  },
  {
    id: "enchantment-compact",
    name: "Enchantment 9.17 Compact Pool",
    originalPrice: 48100,
    dealPrice: 44100,
    image: enchantment917DealImage,
    category: "Compact",
    badge: "Space Saver",
    description: "Energy-efficient compact pool with salt system. Perfect fit for cozy backyards without compromising quality.",
    features: ["Salt System Included", "Energy Efficient", "Carbon Fiber", "Lifetime Warranty"],
    savings: 4000,
  },
  {
    id: "astoria-16-premium",
    name: "Astoria 16 Premium Package",
    originalPrice: 118338,
    dealPrice: 110338,
    image: "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png",
    category: "Premium",
    badge: "Flagship",
    description: "Our largest Astoria model with salt system, integrated seating, and easy entry steps for the ultimate pool experience.",
    features: ["Salt System Included", "Largest Astoria", "Integrated Seating", "Lifetime Warranty"],
    savings: 8000,
  },
  {
    id: "corinthian-14-bme",
    name: "Corinthian 14 BME Deep Pool",
    originalPrice: 96388,
    dealPrice: 90388,
    image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png",
    category: "Deluxe",
    badge: "Deep Dive",
    description: "Roman end design with built-in bench and 6'6\" deep end. Premium fiberglass with salt system.",
    features: ["Roman End Design", "Built-in Bench", "6'6\" Deep End", "Salt System"],
    savings: 6000,
  },
];

const DealsSection: React.FC<DealsSectionProps> = ({ onViewDeal }) => {
  return (
    <div className="relative overflow-hidden py-16 bg-gradient-to-b from-coral/10 via-background to-primary/5">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-coral/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-coral animate-pulse" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-coral via-primary to-teal">
              Deals & Best Offers
            </h2>
            <Flame className="h-8 w-8 text-coral animate-pulse" />
          </div>
          <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
            Exclusive packages and limited-time offers on our most popular products
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {deals.map((deal) => (
            <Card
              key={deal.id}
              className="group relative overflow-hidden border border-border/50 hover:border-coral/50 transition-all duration-300 hover:shadow-xl hover:shadow-coral/10 bg-card"
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-coral to-primary text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                  <Tag className="h-3 w-3 mr-1" />
                  {deal.badge}
                </Badge>
              </div>

              {/* Savings Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-green-500 text-white border-0 px-2 py-1 text-xs font-bold shadow-lg">
                  <Percent className="h-3 w-3 mr-1" />
                  Save ${deal.savings.toLocaleString()}
                </Badge>
              </div>

              {/* Image */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <OptimizedImage
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                    {deal.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {deal.name}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {deal.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {deal.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {feature}
                    </Badge>
                  ))}
                  {deal.features.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                      +{deal.features.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Pricing */}
                <div className="flex items-end gap-2 pt-2">
                  <span className="text-2xl font-bold text-primary">
                    ${deal.dealPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground line-through mb-0.5">
                    ${deal.originalPrice.toLocaleString()}
                  </span>
                </div>

                {/* CTA */}
                <Button
                  variant="gradient"
                  className="w-full group/btn mt-2"
                  onClick={() => onViewDeal(deal)}
                >
                  View Deal
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export { deals };
export type { Deal };
export default DealsSection;
