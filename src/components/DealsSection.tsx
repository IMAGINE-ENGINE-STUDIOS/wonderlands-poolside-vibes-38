import * as React from "react";
import { useState } from "react";
import { Star } from "lucide-react";
import PoolProductCard from "./PoolProductCard";
import GilmerSpaCard from "./GilmerSpaCard";
import SaunaProductCard from "./SaunaProductCard";
import TanningLedgeProductCard from "./TanningLedgeProductCard";
import SurveyQuoteTool from "./SurveyQuoteTool";

// Import product data
import { saunas } from "@/data/saunaData";
import { gilmerSpas } from "@/data/gilmerSpas";
import { glimmerglassTanningLedges } from "@/data/poolData";
import enchantment917Image from "@/assets/pools/enchantment-917.webp";
import cancunDeluxeImage from "@/assets/cancun-deluxe.webp";

// Best seller pool definitions (matching PoolCatalog pool structure)
const bestSellerPools = [
  {
    model: "Bermuda 12",
    price: 56525,
    category: 'standard' as const,
    image: "/lovable-uploads/bermuda-pool.webp",
    dimensions: "12′ × 24′",
    depth: "3′ 6″ – 5′ 6″",
    installationTimeWeeks: 16,
    warrantyYears: "Lifetime" as string | number,
    features: ["Salt system included", "Classic Shape", "Versatile Depth"],
    heater: false,
    saltSystem: true,
    carbonFiber: true,
  },
  {
    model: "Cancún Deluxe",
    price: 112875,
    category: 'deluxe' as const,
    image: cancunDeluxeImage,
    dimensions: "16' x 35'",
    depth: "4'3\" - 6'6\"; Spa 3'",
    installationTimeWeeks: 12,
    warrantyYears: 10 as string | number,
    features: ["Integrated Spa", "Freeform Design", "Tanning Ledge", "Spillover Water Feature", "Premium Finish", "Sauna Offer"],
    heater: false,
    saltSystem: false,
    carbonFiber: false,
  },
  {
    model: "Enchantment 9.17",
    price: 44100,
    category: 'compact' as const,
    image: enchantment917Image,
    dimensions: "9′ 1″ × 17′ 5″",
    depth: "~4′ 9″",
    installationTimeWeeks: 16,
    warrantyYears: "Lifetime" as string | number,
    features: ["Salt system included", "Compact Design", "Energy Efficient"],
    heater: false,
    saltSystem: true,
    carbonFiber: true,
  },
];

// Best seller sauna (first sauna)
const bestSellerSauna = saunas[0];

// Best seller spa (first gilmer spa)
const bestSellerSpa = gilmerSpas[0];

// Best seller tanning ledge (first glimmerglass)
const bestSellerTanningLedge = {
  name: glimmerglassTanningLedges[0].name + " Tanning Ledge",
  price: glimmerglassTanningLedges[0].price,
  category: 'premium' as const,
  image: glimmerglassTanningLedges[0].image,
  description: glimmerglassTanningLedges[0].description,
  dimensions: glimmerglassTanningLedges[0].dimensions,
  depth: glimmerglassTanningLedges[0].depth,
  features: glimmerglassTanningLedges[0].features,
  installationTimeWeeks: 2,
  warrantyYears: "Lifetime" as string | number,
};

const BestSellersSection: React.FC = () => {
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleViewDetails = (pool: any) => {
    // No-op or could open a detail modal
  };

  const handleRequestQuote = (product: any, extras?: any) => {
    setSelectedPool(product);
    setSelectedExtras(extras || null);
    setShowQuoteModal(true);
  };

  const handleSpaQuote = (spa: any, extras: any) => {
    setSelectedPool({ model: spa.model, price: spa.price, image: spa.image });
    setSelectedExtras(extras);
    setShowQuoteModal(true);
  };

  const handleTanningLedgeQuote = (ledge: any, extras?: any) => {
    setSelectedPool({ model: ledge.name, price: ledge.price, image: ledge.image });
    setSelectedExtras(extras || null);
    setShowQuoteModal(true);
  };

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

        {/* Best Sellers Grid - Using native card components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {/* Pool Cards */}
          {bestSellerPools.map((pool) => (
            <PoolProductCard
              key={pool.model}
              pool={pool}
              onViewDetails={handleViewDetails}
              onRequestQuote={handleRequestQuote}
            />
          ))}

          {/* Sauna Card */}
          <SaunaProductCard sauna={bestSellerSauna} />

          {/* Spa Card */}
          <GilmerSpaCard spa={bestSellerSpa} onRequestQuote={handleSpaQuote} />

          {/* Tanning Ledge Card */}
          <TanningLedgeProductCard
            ledge={bestSellerTanningLedge}
            onViewDetails={() => {}}
            onRequestQuote={handleTanningLedgeQuote}
          />
        </div>
      </div>

      {/* Quote Modal */}
      <SurveyQuoteTool
        pool={selectedPool}
        isOpen={showQuoteModal}
        onClose={() => {
          setShowQuoteModal(false);
          setSelectedPool(null);
          setSelectedExtras(null);
        }}
        extras={selectedExtras}
      />
    </div>
  );
};

export default BestSellersSection;
