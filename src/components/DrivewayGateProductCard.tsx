import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { FileText } from "lucide-react";

interface DrivewayGateProps {
  model: string;
  baseDimensions: string;
  basePrice: number;
  image: string;
  description: string;
  warranty: string;
  brand: string;
  priceIncludesInstallation: boolean;
  deliveryTime?: string;
  sizes: Array<{ dimensions: string; price: number }>;
  addons: Array<{ name: string; price: number; description: string }>;
}

const DrivewayGateProductCard = ({ gate }: { gate: DrivewayGateProps }) => {
  const { priceMultiplier, projectType } = useProjectType();
  const [showDetails, setShowDetails] = useState(false);
  // Set initial selected size to match the card's base size
  const initialSize = gate.sizes.find(s => s.dimensions === gate.baseDimensions) || gate.sizes[0];
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [includeOpener, setIncludeOpener] = useState(false);
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const { addToCart } = useShoppingCart();

  const totalPrice = (selectedSize.price + (includeOpener ? gate.addons[0].price : 0)) * priceMultiplier;

  const handleAddToCart = () => {
    const cartItem = {
      id: `driveway-gate-${selectedSize.dimensions}${includeOpener ? '-opener' : ''}`,
      name: `${gate.model} - ${selectedSize.dimensions}`,
      price: totalPrice,
      image: gate.image,
      category: "Driveway Gate" as const,
      quantity: 1,
      options: {
        size: selectedSize.dimensions,
        ...(includeOpener && { "Automatic Gate Opener": "Yes" })
      }
    };
    addToCart(cartItem);
    toast.success("Added to cart!");
    setShowDetails(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={gate.image}
            alt={gate.model}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm">
            {gate.brand}
          </Badge>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{gate.model}</h3>
            <p className="text-sm text-muted-foreground font-medium">
              {gate.baseDimensions}
            </p>
            <p className="text-sm line-clamp-2">{gate.description}</p>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-2xl font-bold text-primary">
                ${(gate.basePrice * priceMultiplier).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                incl. installation
              </span>
              {projectType === 'commercial' && (
                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">Commercial</Badge>
              )}
            </div>
            {gate.deliveryTime && (
              <p className="text-sm font-medium text-green-600">
                {gate.deliveryTime}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 gap-2 flex-col">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              View Details
            </Button>
            <Button
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              Configure & Order
            </Button>
          </div>
          <Button
            className="w-full gap-2 instant-quote-btn transition-all duration-300"
            onClick={() => setShowQuoteTool(true)}
          >
            <FileText className="h-4 w-4" />
            Create Instant Quote
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{gate.model}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={gate.image}
                alt={gate.model}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{gate.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-semibold block mb-2">Select Size</label>
                <Select
                  value={selectedSize.dimensions}
                  onValueChange={(value) => {
                    const size = gate.sizes.find(s => s.dimensions === value);
                    if (size) setSelectedSize(size);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gate.sizes.map((size) => (
                      <SelectItem key={size.dimensions} value={size.dimensions}>
                        {size.dimensions} - ${size.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="opener"
                  checked={includeOpener}
                  onCheckedChange={(checked) => setIncludeOpener(checked as boolean)}
                />
                <div className="flex-1">
                  <label
                    htmlFor="opener"
                    className="font-semibold cursor-pointer"
                  >
                    {gate.addons[0].name}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gate.addons[0].description} (+${gate.addons[0].price.toLocaleString()})
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gate ({selectedSize.dimensions})</span>
                <span>${selectedSize.price.toLocaleString()}</span>
              </div>
              {includeOpener && (
                <div className="flex justify-between text-sm">
                  <span>{gate.addons[0].name}</span>
                  <span>${gate.addons[0].price.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Includes delivery and installation
              </p>
              {gate.deliveryTime && (
                <p className="text-sm font-medium text-green-600">
                  {gate.deliveryTime}
                </p>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
            >
              Add to Cart - ${totalPrice.toLocaleString()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool
        pool={null}
        isOpen={showQuoteTool}
        onClose={() => setShowQuoteTool(false)}
        customProduct={{
          name: `${gate.model} - ${selectedSize.dimensions}${includeOpener ? ' with Automatic Opener' : ''}`,
          price: totalPrice,
          type: 'Driveway Gate',
          image: gate.image
        }}
      />
    </>
  );
};

export default DrivewayGateProductCard;
