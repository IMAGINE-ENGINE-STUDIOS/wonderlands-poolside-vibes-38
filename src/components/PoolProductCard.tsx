import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, DollarSign, Palette, Wrench, Calculator, CreditCard, Edit, ChevronDown } from "lucide-react";
import ImageCard from "./ImageCard";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { openQuotePreview } from "@/utils/quoteNavigation";

// Pool image mapping
const poolImages: Record<string, string> = {
  // Apollo series
  "Apollo 14": "/lovable-uploads/apollo-14-new.jpg",
  "Apollo": "/lovable-uploads/apollo-14-new.jpg",
  
  // Ariel series
  "Ariel 16": "/lovable-uploads/ariel-16-new.jpg",
  "Ariel": "/lovable-uploads/ariel-16-new.jpg",
  
  // Astoria series
  "Astoria 12": "/lovable-uploads/astoria-12.jpg",
  "Astoria": "/lovable-uploads/astoria-new.jpg",
  
  // Coral series
  "Coral 16": "/lovable-uploads/coral-16-new.jpg",
  "Coral": "/lovable-uploads/coral-16-new.jpg",
  
  // Enchantment series
  "Enchantment 917": "/lovable-uploads/enchantment-917.jpg",
  "Enchantment 921": "/lovable-uploads/enchantment-921.jpg",
  "Enchantment 924": "/lovable-uploads/enchantment-924.jpg",
  "Enchantment": "/lovable-uploads/enchantment-917.jpg",
  
  // Tuscan series
  "Tuscan 1120": "/lovable-uploads/tuscan-1120.jpg",
  "Tuscan 1324": "/lovable-uploads/tuscan-1324.jpg",
  "Tuscan 1427": "/lovable-uploads/tuscan-1427.jpg",
  "Tuscan": "/lovable-uploads/tuscan-1120.jpg",
  
  // Other pools
  "Bermuda": "/lovable-uploads/bermuda.jpg",
  "Cape Cod": "/lovable-uploads/cape-cod.jpg",
  "Fiji": "/lovable-uploads/fiji.jpg",
  "Freeform Beach Entry": "/lovable-uploads/freeform-beach-entry.jpg",
  "Genesis": "/lovable-uploads/genesis.jpg",
  "Geometric Luxury": "/lovable-uploads/geometric-luxury.jpg",
  "Jamaica": "/lovable-uploads/jamaica.jpg",
  "Kidney Spa Modern": "/lovable-uploads/kidney-spa-modern.jpg",
  "L-Shaped Elegant": "/lovable-uploads/l-shaped-elegant.jpg",
  "St. Lucia": "/lovable-uploads/st-lucia.jpg",
  "Synergy": "/lovable-uploads/synergy.jpg",
  "Valencia": "/lovable-uploads/valencia.jpg",
};

// Add-on options with images
const addOnOptions = {
  automaticCover: {
    name: "Automatic Cover",
    basePrice: 5000,
    image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png",
    options: [
      { name: "Standard Cover", price: 5000 },
      { name: "Premium Cover", price: 7000 },
      { name: "Solar Cover", price: 6000 }
    ]
  },
  heater: {
    name: "Pool Heater",
    basePrice: 3000,
    image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png",
    options: [
      { name: "Gas Heater", price: 3000 },
      { name: "Heat Pump", price: 4500 },
      { name: "Solar Heater", price: 3500 }
    ]
  },
  spa: {
    name: "Spa Addition",
    basePrice: 8000,
    image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png",
    options: [
      { name: "6-Person Spa", price: 8000 },
      { name: "8-Person Spa", price: 10000 },
      { name: "Luxury Spa", price: 12000 }
    ]
  },
  tanningLedge: {
    name: "Tanning Ledge",
    basePrice: 4000,
    image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png",
    options: [
      { name: "Standard Ledge", price: 4000 },
      { name: "Extended Ledge", price: 5500 },
      { name: "Luxury Ledge", price: 7000 }
    ]
  },
  lighting: {
    name: "LED Lighting",
    basePrice: 1500,
    image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png",
    options: [
      { name: "Basic LED Package", price: 1500 },
      { name: "Color Changing LEDs", price: 2500 },
      { name: "Premium Light Show", price: 4000 }
    ]
  }
};

export interface Pool {
  id?: string;
  model: string;
  price: number;
  dimensions?: string;
  depth?: string;
  category?: 'budget' | 'premium' | 'luxury' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  features?: string[];
  description?: string;
  gallons?: number;
  shape?: string;
  material?: string;
  warranty?: string;
  installation?: string;
  maintenance?: string;
  warrantyYears?: number | string;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  heater?: boolean;
  salt_system?: boolean;
  carbon_fiber?: boolean;
}

interface PoolProductCardProps {
  pool: Pool;
  onAddToCart?: (pool: Pool) => void;
  isAdmin?: boolean;
}

const PoolProductCard = ({ pool, onAddToCart, isAdmin }: PoolProductCardProps) => {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showEditorStudio, setShowEditorStudio] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, any>>({});
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  
  const { addToCart } = useShoppingCart();

  // Get correct pool image
  const getPoolImage = (poolModel: string) => {
    return poolImages[poolModel] || poolImages[poolModel.split(' ')[0]] || "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png";
  };

  const handleAddOnToggle = (addOnKey: string, enabled: boolean) => {
    if (enabled) {
      setSelectedAddOns(prev => ({
        ...prev,
        [addOnKey]: {
          ...addOnOptions[addOnKey as keyof typeof addOnOptions],
          selectedOption: addOnOptions[addOnKey as keyof typeof addOnOptions].options[0],
          enabled: true
        }
      }));
    } else {
      setSelectedAddOns(prev => {
        const newAddOns = { ...prev };
        delete newAddOns[addOnKey];
        return newAddOns;
      });
    }
  };

  const handleOptionChange = (addOnKey: string, option: any) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [addOnKey]: {
        ...prev[addOnKey],
        selectedOption: option
      }
    }));
  };

  const calculateTotal = () => {
    const addOnsTotal = Object.values(selectedAddOns).reduce((sum, addOn: any) => {
      return sum + (addOn.selectedOption?.price || addOn.basePrice || 0);
    }, 0);
    return pool.price + addOnsTotal;
  };

  const handleRequestQuote = () => {
    const extras = Object.entries(selectedAddOns).map(([key, addOn]: [string, any]) => ({
      name: addOn.name,
      price: addOn.selectedOption?.price || addOn.basePrice,
      image: addOn.image,
      description: addOn.selectedOption?.name || addOn.name
    }));

    openQuotePreview({
      type: 'pool',
      pool: {
        ...pool,
        image: getPoolImage(pool.model)
      },
      extras: { items: extras },
      customer: customerInfo.name && customerInfo.email ? customerInfo : undefined
    });
  };

  const handleLyonFinance = () => {
    // Lyon Financial integration
    const financeUrl = `https://apply.lyonfinancial.net/apply?partner_id=wonderlands&amount=${calculateTotal()}&product=pool`;
    window.open(financeUrl, '_blank');
  };

  const handleAddToCartWithExtras = () => {
    const extras = Object.values(selectedAddOns).map((addOn: any) => ({
      name: addOn.name,
      price: addOn.selectedOption?.price || addOn.basePrice,
      image: addOn.image
    }));

    addToCart({
      id: `pool_${pool.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: pool.model,
      price: pool.price,
      category: 'pool',
      image: getPoolImage(pool.model),
      extras
    });
  };

  return (
    <>
      <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <Badge className="bg-gradient-to-r from-primary to-teal text-white capitalize font-medium px-3 py-1">
              {pool.category || 'premium'}
            </Badge>
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
              ))}
            </div>
          </div>
          
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {pool.model}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <ImageCard
              src={getPoolImage(pool.model)}
              alt={pool.model}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              enableZoom={false}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-teal" />
            <span className="text-2xl font-bold text-foreground">
              ${pool.price.toLocaleString()}
            </span>
          </div>
          
          {pool.dimensions && (
            <p className="text-sm text-muted-foreground">
              Dimensions: {pool.dimensions}
            </p>
          )}
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-2">
            {isAdmin && (
              <Button
                onClick={() => setShowEditorStudio(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            
            <Button
              onClick={() => setShowCustomizeModal(true)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Palette className="h-4 w-4 mr-1" />
              Customize
            </Button>
            
            <Button
              onClick={handleRequestQuote}
              variant="default"
              size="sm"
              className="w-full"
            >
              <Calculator className="h-4 w-4 mr-1" />
              Quote
            </Button>
            
            <Button
              onClick={() => setShowFinanceModal(true)}
              variant="gradient"
              size="sm"
              className="w-full"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Finance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customize Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Customize Your {pool.model}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Pool Preview</h3>
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <ImageCard
                    src={getPoolImage(pool.model)}
                    alt={pool.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Total Price</h4>
                  <p className="text-3xl font-bold text-primary">
                    ${calculateTotal().toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Add-On Options</h3>
                <div className="space-y-4">
                  {Object.entries(addOnOptions).map(([key, addOn]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={addOn.image} 
                            alt={addOn.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-medium">{addOn.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Starting at ${addOn.basePrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={!!selectedAddOns[key]}
                          onCheckedChange={(checked) => handleAddOnToggle(key, checked)}
                        />
                      </div>
                      
                      {selectedAddOns[key] && (
                        <div className="mt-3">
                          <Label className="text-sm font-medium">Select Option:</Label>
                          <Select
                            value={selectedAddOns[key]?.selectedOption?.name || ''}
                            onValueChange={(value) => {
                              const option = addOn.options.find(opt => opt.name === value);
                              if (option) handleOptionChange(key, option);
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {addOn.options.map((option) => (
                                <SelectItem key={option.name} value={option.name}>
                                  <div className="flex justify-between w-full">
                                    <span>{option.name}</span>
                                    <span className="ml-4 font-medium">
                                      ${option.price.toLocaleString()}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleAddToCartWithExtras}
                variant="outline" 
                className="flex-1"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={handleRequestQuote}
                variant="default" 
                className="flex-1"
              >
                Get Quote
              </Button>
              <Button 
                onClick={handleLyonFinance}
                variant="gradient" 
                className="flex-1"
              >
                Finance Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finance Modal */}
      <Dialog open={showFinanceModal} onOpenChange={setShowFinanceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finance Your Pool</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Get Pre-Approved Today</h3>
              <p className="text-muted-foreground mb-4">
                Quick approval process with Lyon Financial
              </p>
              <div className="text-2xl font-bold text-primary mb-4">
                ${calculateTotal().toLocaleString()}
              </div>
              <Button onClick={handleLyonFinance} className="w-full">
                Apply for Financing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cast to any to avoid cross-file Pool type mismatch */}
      <SurveyQuoteTool 
        pool={pool as any}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  );
};

export default PoolProductCard;
