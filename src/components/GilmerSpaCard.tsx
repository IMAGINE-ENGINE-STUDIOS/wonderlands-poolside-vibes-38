import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Waves, DollarSign, Thermometer, Zap, Droplets, Clock, Award, Cpu } from "lucide-react";
import { GilmerSpa } from "@/data/gilmerSpas";
import { paverTypes } from "@/data/paverData";
import azureBlueFinish from "@/assets/finishes/azure-blue-g2.jpg";
interface GilmerSpaCardProps {
  spa: GilmerSpa;
  onRequestQuote?: (spa: GilmerSpa, extras: any) => void;
}
const getCategoryColor = (category: string) => {
  switch (category) {
    case "deluxe":
      return "bg-gradient-to-r from-primary to-teal";
    case "standard":
      return "bg-gradient-to-r from-secondary to-accent";
    case "spillover":
      return "bg-gradient-to-r from-coral to-orange";
    default:
      return "bg-gradient-to-r from-primary to-teal";
  }
};

// Spa heater options
const spaHeaters = [
  {
    name: "Spa Heat Pump - Compact",
    price: 3500,
    description: "Compact heat pump designed for spas",
  },
  {
    name: "Spa Heat Pump - Premium",
    price: 4500,
    description: "Premium spa heat pump with digital controls",
  },
  {
    name: "Pentair MasterTemp 125 (125K BTU)",
    price: 2300,
    description: "Compact high-efficiency gas heater",
  },
  {
    name: "Pentair UltraTemp 90 Heat Pump",
    price: 5175,
    description: "Energy-efficient heat pump for spas",
  },
];

// Paver options
const paverOptions = [
  {
    name: "No Pavers",
    price: 0,
    description: "No additional pavers",
  },
  ...paverTypes.map((paver) => ({
    name: paver.name,
    price: 0,
    // Base price is 0, actual cost calculated by surface area × $15/sq ft
    description: paver.description,
    image: paver.image || azureBlueFinish,
  })),
];
const GilmerSpaCard = ({ spa, onRequestQuote }: GilmerSpaCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedColor, setSelectedColor] = useState(spa.colorOptions[0]);
  const [extras, setExtras] = useState({
    heater: false,
    heaterModel: "",
    jets: false,
    jetQuantity: 0,
    pavers: false,
    paverOption: "",
    paverSurfaceArea: "",
    color: spa.colorOptions[0],
  });
  const colorSwatches: Record<string, string> = {
    "Ocean Blue": "bg-blue-600",
    "Sapphire Blue": "bg-blue-700",
    "Coastal Bronze": "bg-amber-700",
    "Snow White": "bg-white border-2 border-gray-300",
    "Steel Grey": "bg-gray-500",
    "Arctic White": "bg-gray-100 border-2 border-gray-300",
    "Glacier Blue": "bg-cyan-400",
  };
  const toggleExtra = (extra: string) => {
    setExtras((prev) => ({
      ...prev,
      [extra]: !prev[extra as keyof typeof prev],
    }));

    // Expand details when selecting an option
    if (!showDetails) {
      setShowDetails(true);
    }
  };
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setExtras((prev) => ({
      ...prev,
      color,
    }));
  };
  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };
  const calculateTotalPrice = () => {
    let total = spa.price;

    // Add heater price if selected
    if (extras.heater && extras.heaterModel) {
      const selectedHeater = spaHeaters.find((h) => h.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }

    // Add jets price
    if (extras.jets && extras.jetQuantity > 0) {
      total += extras.jetQuantity * 1800; // $1800 per jet
    }

    // Add paver surface area cost
    if (extras.pavers && extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea))) {
      total += parseFloat(extras.paverSurfaceArea) * 20; // $20 per sq ft
    }
    return total;
  };
  const handleRequestQuote = () => {
    if (onRequestQuote) {
      const extrasBreakdown = [];
      if (extras.heater && extras.heaterModel) {
        const selectedHeater = spaHeaters.find((h) => h.name === extras.heaterModel);
        if (selectedHeater) {
          extrasBreakdown.push({
            name: selectedHeater.name,
            price: selectedHeater.price,
          });
        }
      }
      if (extras.jets && extras.jetQuantity > 0) {
        extrasBreakdown.push({
          name: `Spa Jets (${extras.jetQuantity})`,
          price: extras.jetQuantity * 1800,
        });
      }
      if (extras.pavers && extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea))) {
        extrasBreakdown.push({
          name: `${extras.paverOption} (${extras.paverSurfaceArea} sq ft)`,
          price: parseFloat(extras.paverSurfaceArea) * 20,
        });
      }
      onRequestQuote(spa, {
        ...extras,
        selectedColor,
        extrasBreakdown,
        extrasTotal: extrasBreakdown.reduce((sum, item) => sum + item.price, 0),
      });
    }
  };
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Spa Image */}
      <div
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
        onClick={handleImageClick}
      >
        <img
          src={spa.image}
          alt={spa.model}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
        />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(spa.category)} text-white capitalize font-medium px-3 py-1`}>
            <span className="flex items-center gap-1">
              <Waves size={16} />
              {spa.spillover ? "Spillover" : spa.category}
            </span>
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Click for Details
          </div>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Spa Name */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {spa.model}
          </h3>
          <p className="text-xs text-muted-foreground">
            {spa.brand} • {spa.type}
          </p>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
            {spa.price > 0 ? (
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  ${calculateTotalPrice().toLocaleString()}
                </span>
                {calculateTotalPrice() === spa.price && (
                  <span className="text-xs text-muted-foreground">Base Price (includes installation)</span>
                )}
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-semibold text-muted-foreground">Contact for Pricing</span>
            )}
          </div>

          {/* Final Price Summary */}
          {(extras.heater || extras.jets || extras.pavers) && calculateTotalPrice() > spa.price && (
            <div className="bg-primary/10 p-2 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Final Price:</span>
                <span className="text-lg font-bold text-primary">${calculateTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {spa.dimensions && spa.dimensions !== "TBD" && <p>Size: {spa.dimensions}</p>}
          {spa.depth && spa.depth !== "TBD" && <p>Depth: {spa.depth}</p>}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Installation: {spa.installationTimeWeeks} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="font-bold text-primary">{spa.warranty}</span>
          </div>
        </div>

        {/* Key Features */}
        {spa.features && spa.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="space-y-1">
              {spa.features.slice(0, 3).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-xs">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feature Checkboxes */}

        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />

            {/* Color Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Droplets size={16} />
                Spa Color Options
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {spa.colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`p-2 rounded-lg border-2 transition-all ${selectedColor === color ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${colorSwatches[color]}`} />
                      <span className="text-xs font-medium">{color}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Jets Options */}
            {extras.jets && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap size={16} />
                  Spa Jets
                </h4>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Number of Jets ($1,800 each)</label>
                  <Input
                    type="number"
                    min="0"
                    value={extras.jetQuantity}
                    onChange={(e) =>
                      setExtras((prev) => ({
                        ...prev,
                        jetQuantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full"
                  />
                  {extras.jetQuantity > 0 && (
                    <p className="text-sm text-primary font-medium">
                      Jets Cost: ${(extras.jetQuantity * 1800).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Heater Options */}
            {extras.heater && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Thermometer size={16} />
                  Spa Heaters
                </h4>
                <div className="grid gap-2">
                  {spaHeaters.map((heater) => (
                    <button
                      key={heater.name}
                      onClick={() =>
                        setExtras((prev) => ({
                          ...prev,
                          heaterModel: heater.name,
                        }))
                      }
                      className={`p-3 rounded-lg border-2 text-left transition-all ${extras.heaterModel === heater.name ? "border-primary bg-primary/10" : "border-gray-200 hover:border-primary/50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{heater.name}</p>
                          <p className="text-xs text-muted-foreground">{heater.description}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">+${heater.price.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paver Options */}
            {extras.pavers && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Cpu size={16} />
                  Pavers ($20/sq ft)
                </h4>
                <div className="space-y-3">
                  <select
                    value={extras.paverOption}
                    onChange={(e) =>
                      setExtras((prev) => ({
                        ...prev,
                        paverOption: e.target.value,
                      }))
                    }
                    className="w-full p-2 rounded-lg border-2 border-gray-200 focus:border-primary outline-none"
                  >
                    <option value="">Select Paver Type</option>
                    {paverOptions.map((paver) => (
                      <option key={paver.name} value={paver.name}>
                        {paver.name}
                      </option>
                    ))}
                  </select>

                  {extras.paverOption && extras.paverOption !== "No Pavers" && (
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Surface Area (sq ft)</label>
                      <Input
                        type="number"
                        min="0"
                        value={extras.paverSurfaceArea}
                        onChange={(e) =>
                          setExtras((prev) => ({
                            ...prev,
                            paverSurfaceArea: e.target.value,
                          }))
                        }
                        placeholder="Enter square footage"
                        className="w-full"
                      />
                      {extras.paverSurfaceArea && !isNaN(parseFloat(extras.paverSurfaceArea)) && (
                        <p className="text-sm text-primary font-medium">
                          Paver Cost: ${(parseFloat(extras.paverSurfaceArea) * 20).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Color Preview - Always Visible when collapsed */}
        {!showDetails && (
          <div className="space-y-3">
            <div 
              className="space-y-2"
              onMouseEnter={() => setShowDetails(true)}
              onTouchStart={() => setShowDetails(true)}
            >
              <h4 className="font-semibold text-foreground text-sm">Color Options</h4>
              <div className="flex gap-2 flex-wrap">
                {spa.colorOptions.slice(0, 5).map((color, idx) => (
                  <div
                    key={`spa-color-${color}-${idx}`}
                    className={`w-10 h-10 rounded-lg cursor-pointer border-2 transition-all hover:scale-110 ${
                      selectedColor === color ? "border-primary ring-2 ring-primary/30" : "border-border"
                    } ${colorSwatches[color] || "bg-gray-400"}`}
                    onClick={() => {
                      setSelectedColor(color);
                      setExtras((prev) => ({ ...prev, color }));
                      setShowDetails(true);
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            {/* Expand Arrow */}
            <div 
              className="flex flex-col items-center cursor-pointer py-2 hover:bg-muted/50 rounded-lg transition-all group"
              onClick={() => setShowDetails(true)}
              onMouseEnter={() => setShowDetails(true)}
            >
              <span className="text-xs text-muted-foreground mb-1">View all options</span>
              <svg 
                className="w-5 h-5 text-primary animate-bounce group-hover:text-primary/80 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Action Buttons - Only when expanded */}
        {showDetails && (
          <div className="space-y-2 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-primary to-teal hover:shadow-lg transition-all"
              onClick={handleRequestQuote}
            >
              Instant Quote
            </Button>
            <Button variant="outline" className="w-full" onClick={handleImageClick}>
              Hide Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default GilmerSpaCard;
