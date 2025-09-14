import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Ruler, Waves, Calendar, MapPin, FileText } from "lucide-react";

// Helper function to get discounted price - 10% discount for all pools
const getPoolPrice = (pool: Pool) => {
  return Math.round(pool.price * 0.90); // 10% discount for all pools
};

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  description?: string;
}

interface PoolDetailModalProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: (pool: Pool) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-[hsl(var(--golden))] to-[hsl(var(--golden-light))]';
    case 'compact': return 'bg-gradient-to-r from-teal to-primary';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getPoolFeatures = (model: string): string[] => {
  const standardFeatures = [
    "Premium LED Lighting System",
    "Advanced Salt Water Filter System", 
    "Variable Speed Energy-Efficient Pump",
    "Automatic Pool Cleaner",
    "Digital Control System",
    "Lifetime Structural Warranty",
    "Slip-Resistant Steps & Surfaces",
    "UV-Resistant Gel Coat Finish"
  ];
  
  if (model.includes("Tuscan") || model.includes("Corinthian")) {
    return [...standardFeatures, "Built-in Spa with LED Lighting", "Tanning Ledge", "Swim-up Seating", "Premium Water Features"];
  } else if (model.includes("Laguna") || model.includes("Bay Isle")) {
    return [...standardFeatures, "Tanning Ledge with Lighting", "Beach Entry", "Cascading Water Features", "Integrated Bench Seating"];
  } else if (model.includes("Enchantment")) {
    return [...standardFeatures, "Compact LED Design", "Space-Saving Pump System", "Perfect for Small Yards", "Easy Maintenance Access"];
  }
  
  return [...standardFeatures, "Custom LED Color Options", "Upgraded Filtration Package"];
};

const getDimensions = (pool: Pool): string => {
  return pool.dimensions || "Custom Dimensions Available";
};

const PoolDetailModal = ({ pool, isOpen, onClose, onRequestQuote }: PoolDetailModalProps) => {
  if (!pool) return null;

  const features = getPoolFeatures(pool.model);
  const dimensions = getDimensions(pool);
  const depth = pool.depth || "Standard depth available";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {pool.model}
            </DialogTitle>
<Badge className={`${getCategoryColor(pool.category)} text-white capitalize`}>
              {pool.category === 'standard' ? 'Wonderful' : pool.category}
            </Badge>
          </div>
          <DialogDescription className="text-lg text-muted-foreground">
            Premium fiberglass pool designed for the Florida lifestyle
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pool Image */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-teal/10 min-h-[300px] flex items-center justify-center">
              {pool.image ? (
                <img 
                  src={pool.image} 
                  alt={pool.model}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Waves size={64} className="mx-auto mb-4 text-primary/50" />
                  <p>Pool visualization coming soon</p>
                </div>
              )}
            </div>
            
            {/* Florida Location Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} className="text-coral" />
              <span>Perfect for Florida climate & lifestyle</span>
            </div>
          </div>

          {/* Pool Details */}
          <div className="space-y-6">
            {/* Price */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-teal" />
              <div>
                <p className="text-3xl font-bold text-foreground">
                  ${getPoolPrice(pool).toLocaleString()}
                </p>
                {pool.category === 'deluxe' && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground line-through">
                      ${pool.price.toLocaleString()}
                    </span>
                    <Badge className="bg-red-500 text-white text-xs">25% OFF</Badge>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">Complete installation in Florida</p>
              </div>
            </div>

            <Separator />

            {/* Salt System Note */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-800 font-medium text-center">
                Salt system included in final price
              </p>
            </div>

            {/* Dimensions & Depth */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Ruler className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Dimensions</p>
                  <p className="text-muted-foreground">{dimensions}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-teal" />
                <div>
                  <p className="font-semibold">Depth</p>
                  <p className="text-muted-foreground">{depth}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Waves className="h-5 w-5 text-teal" />
                Key Features
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-primary to-teal rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Installation Info */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-orange" />
              <div>
                <p className="font-semibold">Installation Timeline</p>
                <p className="text-muted-foreground">2-4 weeks typical in Florida</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => onRequestQuote(pool)}
                variant="gradient"
                size="lg"
                className="w-full"
              >
                <FileText className="mr-2 h-5 w-5" />
                Request Custom Quote
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="w-full border-coral text-coral hover:bg-coral hover:text-white"
              >
                Schedule Site Survey
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PoolDetailModal;