
import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Star, Waves, Clock, Award, Edit } from "lucide-react";
import PoolExtrasPanel, { PoolExtrasState } from "@/components/pool/PoolExtrasPanel";
import { openQuotePreview } from "@/utils/quoteNavigation";

// Import pool data used for options pricing
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";
// Import finishes
import { poolFinishes as poolFinishesData } from "@/components/PoolFinishesSection";

interface ExternalPoolProps {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
}

interface PoolProductCardProps {
  pool?: ExternalPoolProps;
  onViewDetails?: (pool: ExternalPoolProps) => void;
  onRequestQuote?: (pool: ExternalPoolProps, extras?: any) => void;
  isAdmin?: boolean;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-primary to-teal';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
    case 'compact': return 'bg-gradient-to-r from-teal to-primary';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const PoolProductCard: React.FC<PoolProductCardProps> = ({ pool: incomingPool, onViewDetails, onRequestQuote, isAdmin = false }) => {
  const pool = useMemo<ExternalPoolProps>(() => ({
    model: incomingPool?.model || "The Laguna",
    price: incomingPool?.price ?? 65000,
    category: incomingPool?.category || "standard",
    image: incomingPool?.image,
    dimensions: incomingPool?.dimensions,
    depth: incomingPool?.depth,
    features: incomingPool?.features || [],
  }), [incomingPool]);

  const [showDetails, setShowDetails] = useState(false);

  // Previous extras behavior restored and centralized here
  const [extras, setExtras] = useState<PoolExtrasState>({
    finishes: false,
    liners: false,
    tiles: false,
    pavers: false,
    screenEnclosure: false,
    automaticCover: false,
    heater: false,
    spa: false,
    tanningLedge: false,
    spaJets: false,

    finishName: poolFinishesData[0]?.name || "",
    linerName: poolLiners[0]?.name || "",
    tileName: poolTiles[0]?.name || "",
    tanningLedgeName: (tanningLedges && tanningLedges[0]?.name) || "",

    paverSurfaceArea: "",
    enclosureSurfaceArea: "",
    spaJetsQty: 1,

    paverRate: 15,
    enclosureRate: 45,
  });

  const onExtrasChange = (patch: Partial<PoolExtrasState>) => setExtras(prev => ({ ...prev, ...patch }));

  const getSelectedFinishPrice = () => {
    const f = poolFinishesData.find(x => x.name === extras.finishName);
    return f && typeof f.price === "number" ? f.price : 0;
  };
  const getSelectedLinerPrice = () => poolLiners.find(x => x.name === extras.linerName)?.price || 0;
  const getSelectedTilePrice = () => poolTiles.find(x => x.name === extras.tileName)?.price || 0;
  const getSelectedTanningLedgePrice = () =>
    (tanningLedges || []).find(x => x.name === extras.tanningLedgeName)?.price || 0;

  const calculateTotalPrice = () => {
    let total = pool.price;

    if (extras.finishes) total += getSelectedFinishPrice();
    if (extras.liners) total += getSelectedLinerPrice();
    if (extras.tiles) total += getSelectedTilePrice();

    if (extras.pavers && extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea))) {
      total += parseFloat(extras.paverSurfaceArea) * extras.paverRate;
    }

    if (extras.screenEnclosure && extras.enclosureSurfaceArea && !isNaN(parseFloat(extras.enclosureSurfaceArea))) {
      total += parseFloat(extras.enclosureSurfaceArea) * extras.enclosureRate;
    }

    if (extras.automaticCover) total += 6500; // standard pool cover
    if (extras.heater) total += 5000;        // pool heater
    if (extras.spa) total += 12000;          // add-on spa
    if (extras.tanningLedge) total += getSelectedTanningLedgePrice();
    if (extras.spaJets) total += 1800 * (extras.spaJetsQty || 1);

    return total;
  };

  const handleRequestQuote = () => {
    const details = { type: 'pool', pool, extras };
    if (onRequestQuote) {
      onRequestQuote(pool, extras);
    } else {
      // fallback: open preview if callback not provided
      openQuotePreview(details as any);
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Image first */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 overflow-hidden">
        {pool.image ? (
          <img
            src={pool.image}
            alt={pool.model}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(pool.category)} text-white capitalize font-medium px-3 py-1`}>
            <span className="flex items-center gap-1">
              <Waves size={16} />
              {pool.category}
            </span>
          </Badge>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Name & Collection */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {pool.model}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            ${calculateTotalPrice().toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground line-through">
            ${pool.price.toLocaleString()}
          </span>
        </div>

        {/* Description/basic info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {pool.dimensions && <p>Size: {pool.dimensions}</p>}
          {pool.depth && <p>Depth: {pool.depth}</p>}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Installation: 6–10 weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="font-bold text-primary">Warranty: LIFETIME WARRANTY</span>
          </div>
        </div>

        {/* View more details button at the bottom to expand */}
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowDetails((s) => !s)}
          >
            {showDetails ? "Hide Options" : "View More Details"}
          </Button>
        </div>

        {showDetails && (
          <div className="pt-3">
            <PoolExtrasPanel
              extras={extras}
              onChange={onExtrasChange}
            />
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-2">
              {onViewDetails && (
                <Button variant="outline" size="sm" onClick={() => onViewDetails(pool)} className="text-xs">
                  View Details
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleRequestQuote} className="text-xs">
                Request Quote
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolProductCard;

