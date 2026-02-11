import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight, Tag } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";

// Import existing product data from different categories
import { saunas } from "@/data/saunaData";
import { gilmerSpas } from "@/data/gilmerSpas";
import { glimmerglassTanningLedges } from "@/data/poolData";
import enchantment917Image from "@/assets/pools/enchantment-917.png";
import cancunDeluxeImage from "@/assets/cancun-deluxe.png";

export interface BestSellerItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  badge: string;
  description: string;
  features: string[];
  sourceType: 'pool' | 'spa' | 'sauna' | 'tanning-ledge' | 'gate';
}

// Curate best sellers from existing product data across categories
const bestSellers: BestSellerItem[] = [
  // Pool - Bermuda 12
  {
    id: "bermuda-12",
    name: "Bermuda 12",
    price: 56525,
    image: "/lovable-uploads/bermuda-pool.png",
    category: "Pool",
    badge: "Best Seller",
    description: "The most popular fiberglass pool with versatile design, perfect for families and entertaining.",
    features: ["Salt System", "Carbon Fiber", "Lifetime Warranty"],
    sourceType: 'pool',
  },
  // Pool - Cancún Deluxe
  {
    id: "cancun-deluxe",
    name: "Cancún Deluxe",
    price: 112875,
    image: cancunDeluxeImage,
    category: "Pool",
    badge: "Premium Pick",
    description: "Luxury freeform pool with integrated spa, tanning ledge, and spillover water feature.",
    features: ["Integrated Spa", "Tanning Ledge", "Spillover Feature"],
    sourceType: 'pool',
  },
  // Sauna - Barrel Sauna 4-Person (from saunaData)
  {
    id: saunas[0].id,
    name: saunas[0].name,
    price: saunas[0].price,
    image: saunas[0].image,
    category: "Sauna",
    badge: "Top Rated",
    description: saunas[0].description,
    features: saunas[0].features.slice(0, 3),
    sourceType: 'sauna',
  },
  // Spa - Moondance Spillover (from gilmerSpas)
  {
    id: "moondance-spillover",
    name: gilmerSpas[0].model,
    price: gilmerSpas[0].price,
    image: gilmerSpas[0].image,
    category: "Spa",
    badge: "Fan Favorite",
    description: "Premium spillover spa with fiberglass construction and lifetime structural warranty.",
    features: gilmerSpas[0].features?.slice(0, 3) || ["Spillover Design", "Fiberglass", "Life Warranty"],
    sourceType: 'spa',
  },
  // Pool - Enchantment 9.17
  {
    id: "enchantment-917",
    name: "Enchantment 9.17",
    price: 44100,
    image: enchantment917Image,
    category: "Pool",
    badge: "Space Saver",
    description: "Energy-efficient compact pool with salt system. Perfect fit for cozy backyards without compromising quality.",
    features: ["Salt System", "Energy Efficient", "Lifetime Warranty"],
    sourceType: 'pool',
  },
  // Tanning Ledge - Paradise (from glimmerglassTanningLedges)
  {
    id: "paradise-tanning",
    name: glimmerglassTanningLedges[0].name + " Tanning Ledge",
    price: glimmerglassTanningLedges[0].price,
    image: glimmerglassTanningLedges[0].image,
    category: "Tanning Ledge",
    badge: "Most Popular",
    description: glimmerglassTanningLedges[0].description,
    features: glimmerglassTanningLedges[0].features.slice(0, 3),
    sourceType: 'tanning-ledge',
  },
];

interface BestSellersSectionProps {
  onViewProduct: (item: BestSellerItem) => void;
}

const BestSellersSection: React.FC<BestSellersSectionProps> = ({ onViewProduct }) => {
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
            <Star className="h-8 w-8 text-coral animate-pulse" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-coral via-primary to-teal">
              Best Sellers
            </h2>
            <Star className="h-8 w-8 text-coral animate-pulse" />
          </div>
          <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
            Our most popular products across all categories — trusted by hundreds of happy customers
          </p>
        </div>

        {/* Best Sellers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {bestSellers.map((item) => (
            <Card
              key={item.id}
              className="group relative overflow-hidden border border-border/50 hover:border-coral/50 transition-all duration-300 hover:shadow-xl hover:shadow-coral/10 bg-card"
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-coral to-primary text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                  <Tag className="h-3 w-3 mr-1" />
                  {item.badge}
                </Badge>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-primary/90 text-white border-0 px-2 py-1 text-xs font-bold shadow-lg">
                  {item.category}
                </Badge>
              </div>

              {/* Image */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {item.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-end gap-2 pt-2">
                  <span className="text-2xl font-bold text-primary">
                    ${item.price.toLocaleString()}
                  </span>
                </div>

                {/* CTA */}
                <Button
                  variant="gradient"
                  className="w-full group/btn mt-2"
                  onClick={() => onViewProduct(item)}
                >
                  View Details
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

export { bestSellers };
export default BestSellersSection;
