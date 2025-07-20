import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, Leaf, Settings, DollarSign, Star } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import Pool3DViewer from "./Pool3DViewer";

interface AutomaticCover {
  name: string;
  price: number;
  type: 'solar' | 'safety' | 'thermal' | 'hybrid';
  material: string;
  motorType: string;
  warranty: string;
  features: string[];
  benefits: string[];
  installation: string;
}

const covers: AutomaticCover[] = [
  {
    name: "SolarMax Pro",
    price: 18000,
    type: 'solar',
    material: "UV-resistant vinyl",
    motorType: "DC Motor",
    warranty: "10 years",
    features: ["Solar heating", "Energy efficient", "Remote control", "Safety sensors"],
    benefits: ["Reduces heating costs by 70%", "Prevents evaporation", "Keeps debris out"],
    installation: "2-3 days"
  },
  {
    name: "SafetyGuard Elite",
    price: 22000,
    type: 'safety',
    material: "Reinforced mesh",
    motorType: "AC Motor",
    warranty: "15 years",
    features: ["Child safety lock", "Weight capacity 250lbs", "Emergency manual override", "LED indicators"],
    benefits: ["ASTM safety compliant", "Peace of mind", "Insurance discounts"],
    installation: "3-4 days"
  },
  {
    name: "ThermalShield Plus",
    price: 20000,
    type: 'thermal',
    material: "Insulated fabric",
    motorType: "DC Motor",
    warranty: "12 years",
    features: ["Thermal insulation", "Automatic timer", "Weather sensors", "App control"],
    benefits: ["Reduces heat loss by 80%", "Extends swimming season", "Lower energy bills"],
    installation: "2-3 days"
  },
  {
    name: "HybridMaster",
    price: 28000,
    type: 'hybrid',
    material: "Multi-layer composite",
    motorType: "Smart Motor",
    warranty: "20 years",
    features: ["All-in-one solution", "AI weather response", "Solar heating", "Safety compliance"],
    benefits: ["Maximum efficiency", "Premium protection", "Smart automation"],
    installation: "4-5 days"
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'solar': return 'bg-gradient-to-r from-orange to-amber-500';
    case 'safety': return 'bg-gradient-to-r from-red-500 to-red-600';
    case 'thermal': return 'bg-gradient-to-r from-primary to-teal';
    case 'hybrid': return 'bg-gradient-to-r from-purple-500 to-purple-600';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'solar': return <Leaf size={16} />;
    case 'safety': return <Shield size={16} />;
    case 'thermal': return <Zap size={16} />;
    case 'hybrid': return <Settings size={16} />;
    default: return <Shield size={16} />;
  }
};

const AutomaticCoversSection = () => {
  const [selectedCover, setSelectedCover] = useState<AutomaticCover | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [show3D, setShow3D] = useState<string | null>(null);

  const handleRequestQuote = (cover: AutomaticCover) => {
    setSelectedCover(cover);
    setShowQuoteModal(true);
  };

  const toggle3D = (coverName: string) => {
    setShow3D(show3D === coverName ? null : coverName);
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Automatic Pool Covers
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Protect your investment with our state-of-the-art automatic pool covers. Safety, efficiency, and convenience in one smart solution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {covers.map((cover, index) => (
              <Card 
                key={cover.name} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getTypeColor(cover.type)} text-white capitalize font-medium px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(cover.type)}
                        {cover.type}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cover.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      {cover.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* 3D Toggle and Viewer */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggle3D(cover.name)}
                      className="w-full"
                    >
                      {show3D === cover.name ? 'Hide 3D Preview' : 'Show 3D Preview'}
                    </Button>
                    
                    {show3D === cover.name && (
                      <Pool3DViewer poolModel={`${cover.name} Cover`} dimensions="Interactive Demo" />
                    )}
                  </div>
                  
                  {/* Specifications */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="font-medium">{cover.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Motor:</span>
                      <span className="font-medium">{cover.motorType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty:</span>
                      <span className="font-medium">{cover.warranty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Installation:</span>
                      <span className="font-medium">{cover.installation}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {cover.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  {/* Benefits */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {cover.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-teal rounded-full"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={() => handleRequestQuote(cover)}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    Get Quote & Installation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedCover ? {
          name: selectedCover.name,
          price: selectedCover.price,
          type: 'automatic-cover'
        } : undefined}
      />
    </>
  );
};

export default AutomaticCoversSection;