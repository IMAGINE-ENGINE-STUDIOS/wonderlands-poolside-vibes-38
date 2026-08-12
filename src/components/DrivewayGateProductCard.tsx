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
import InstallationNote from "@/components/InstallationNote";

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
      <Card className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] h-full flex flex-col">
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
          <img
            src={gate.image}
            alt={gate.model}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
              {gate.brand}
            </span>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-7 space-y-4 flex-1">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground line-clamp-1">
              {gate.model}
            </h3>
            <p className="mt-2 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
              {gate.baseDimensions}
            </p>
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{gate.description}</p>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                  ${(gate.basePrice * priceMultiplier).toLocaleString()}
                </p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Incl. installation</p>
              </div>
              {projectType === 'commercial' && (
                <p className="text-right text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Commercial</p>
              )}
            </div>
            {gate.deliveryTime && (
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {gate.deliveryTime}
              </p>
            )}
          </div>
        </CardContent>

        <InstallationNote className="mb-2 px-4 sm:px-5 lg:px-7" />
        <CardFooter className="p-4 sm:p-5 lg:p-7 pt-0 flex flex-col gap-2 mt-auto">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-none text-[10px] uppercase tracking-[0.3em]"
              onClick={() => setShowDetails(true)}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-none text-[10px] uppercase tracking-[0.3em]"
              onClick={() => setShowDetails(true)}
            >
              Configure
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full gap-2 instant-quote-btn rounded-none text-[10px] uppercase tracking-[0.3em]"
            onClick={() => setShowQuoteTool(true)}
          >
            <FileText className="h-3 w-3" />
            Instant Quote
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
              <img loading="lazy" decoding="async"
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
              className="w-full rounded-none"
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
