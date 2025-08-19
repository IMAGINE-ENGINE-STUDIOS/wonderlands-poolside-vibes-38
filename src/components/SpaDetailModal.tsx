import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Waves, DollarSign, Star, Clock, Award, Flame, Zap, Palette, Ruler, Droplets } from "lucide-react";

interface Spa {
  model: string;
  price: number;
  category: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  image?: string;
}

interface SpaDetailModalProps {
  spa: Spa | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestQuote: (spa: Spa) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-amber-500 to-orange-500';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const SpaDetailModal = ({ spa, isOpen, onClose, onRequestQuote }: SpaDetailModalProps) => {
  if (!spa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl font-bold">
              {spa.model}
            </DialogTitle>
            <Badge className={`${getCategoryColor(spa.category)} text-white capitalize font-medium px-3 py-1`}>
              <span className="flex items-center gap-1">
                <Waves size={16} />
                {spa.category}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-primary/10 to-teal/10 rounded-lg overflow-hidden">
              {spa.image ? (
                <img 
                  src={spa.image} 
                  alt={spa.model}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
                  <Waves size={64} className="text-primary/60" />
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < 4 ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.8/5 stars)</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Price */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-teal" />
              <span className="text-3xl font-bold text-foreground">
                ${spa.price.toLocaleString()}
              </span>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {spa.dimensions && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Ruler className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dimensions</p>
                      <p className="font-medium">{spa.dimensions}</p>
                    </div>
                  </div>
                )}
                {spa.depth && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Depth</p>
                      <p className="font-medium">{spa.depth}</p>
                    </div>
                  </div>
                )}
                {spa.installationTimeWeeks && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Installation</p>
                      <p className="font-medium">{spa.installationTimeWeeks} weeks</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Award className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Warranty</p>
                    <p className="font-medium text-primary">LIFETIME WARRANTY</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {spa.features && spa.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Features & Benefits
                </h3>
                <ul className="space-y-2">
                  {spa.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Special Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Available Add-ons</h3>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Flame className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Premium Spa Heater</p>
                    <p className="text-xs text-muted-foreground">Maintain perfect temperature year-round</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 ml-auto">+$3,500</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Therapeutic Spa Jets</p>
                    <p className="text-xs text-muted-foreground">Massage and hydrotherapy features</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 ml-auto">+$2,500</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Waves className="h-5 w-5 text-teal" />
                  <div>
                    <p className="font-medium">Relaxing Spa Bubblers</p>
                    <p className="text-xs text-muted-foreground">Gentle bubbling for ultimate relaxation</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 ml-auto">+$2,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => onRequestQuote(spa)}
            className="flex-1"
            size="lg"
          >
            Get Custom Quote
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            size="lg"
            className="sm:w-auto"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpaDetailModal;