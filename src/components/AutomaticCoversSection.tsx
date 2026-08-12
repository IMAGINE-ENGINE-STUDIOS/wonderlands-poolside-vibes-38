import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, Leaf, Settings, DollarSign, Star, Droplets, Thermometer, Bolt } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";
import InstallationNote from "@/components/InstallationNote";
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
  image: string;
}
const covers: AutomaticCover[] = [{
  name: "Eclipse",
  price: 27000,
  type: 'safety',
  material: "High-grade PVC",
  motorType: "DC Motor",
  warranty: "10 years",
  features: ["Dual track system", "Emergency manual override", "Auto-close sensors", "LED status indicators"],
  benefits: ["Advanced safety features", "Quiet operation", "Weather resistant"],
  installation: "2-3 days",
  image: "/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.webp"
}, {
  name: "CS3000",
  price: 30000,
  type: 'hybrid',
  material: "Multi-layer vinyl",
  motorType: "AC Motor",
  warranty: "15 years",
  features: ["Smart automation", "Variable speed control", "Weather sensors", "Remote monitoring"],
  benefits: ["Commercial grade reliability", "Energy efficient", "Low maintenance"],
  installation: "3-4 days",
  image: "/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.webp"
}, {
  name: "Infinity 4000",
  price: 32000,
  type: 'hybrid',
  material: "Premium composite",
  motorType: "Smart Motor",
  warranty: "20 years",
  features: ["AI-powered automation", "Solar integration", "App control", "Predictive maintenance"],
  benefits: ["Ultimate performance", "Maximum energy savings", "Smart home integration"],
  installation: "4-5 days",
  image: "/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.webp"
}, {
  name: "Atom",
  price: 25000,
  type: 'thermal',
  material: "Insulated fabric",
  motorType: "DC Motor",
  warranty: "12 years",
  features: ["Compact design", "Quick deployment", "Temperature sensors", "Timer controls"],
  benefits: ["Space efficient", "Fast operation", "Thermal retention"],
  installation: "2-3 days",
  image: "/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.webp"
}];
const getTypeColor = (type: string) => {
  switch (type) {
    case 'solar':
      return 'bg-gradient-to-r from-orange to-amber-500';
    case 'safety':
      return 'bg-gradient-to-r from-red-500 to-red-600';
    case 'thermal':
      return 'bg-gradient-to-r from-primary to-teal';
    case 'hybrid':
      return 'bg-gradient-to-r from-purple-500 to-purple-600';
    default:
      return 'bg-gradient-to-r from-primary to-teal';
  }
};
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'solar':
      return <Leaf size={16} />;
    case 'safety':
      return <Shield size={16} />;
    case 'thermal':
      return <Zap size={16} />;
    case 'hybrid':
      return <Settings size={16} />;
    default:
      return <Shield size={16} />;
  }
};
const AutomaticCoversSection = () => {
  const [selectedCover, setSelectedCover] = useState<AutomaticCover | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const handleRequestQuote = (cover: AutomaticCover) => {
    setSelectedCover(cover);
    setShowQuoteModal(true);
  };

  // Listen for search events to open specific covers
  React.useEffect(() => {
    const handleOpenProduct = (event: CustomEvent) => {
      const {
        type,
        id,
        name
      } = event.detail;
      if (type === 'cover' || type === 'automatic' || name?.toLowerCase().includes('cover')) {
        const cover = covers.find(c => c.name.toLowerCase() === name?.toLowerCase() || c.name.toLowerCase().includes(name?.toLowerCase()));
        if (cover) {
          setSelectedCover(cover);
          setShowQuoteModal(true);
        }
      }
    };
    window.addEventListener('open-product', handleOpenProduct as EventListener);
    return () => window.removeEventListener('open-product', handleOpenProduct as EventListener);
  }, []);
  return <>
      <section className="py-12 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <EditorialSectionHeader
          eyebrow="Volume VI — Shelter"
          title="Automatic Pool Covers"
          description="Safety, efficiency and convenience in one engineered, low-profile system."
        />

          <ProductScrollRow className="mb-8">
            {covers.map((cover, index) => <Card key={cover.name} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getTypeColor(cover.type)} text-white capitalize font-medium px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(cover.type)}
                        {cover.type}
                      </span>
                    </Badge>
                    
                  </div>
                  
                  <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cover.name}
                  </CardTitle>
                </CardHeader>
                
                <InstallationNote className="mb-2" />
                <CardContent className="space-y-4">
                  {/* Cover Image */}
                  <div className="aspect-video overflow-hidden rounded-lg bg-muted/30">
                    <img loading="lazy" decoding="async" src={cover.image} alt={cover.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      {cover.price.toLocaleString()}
                    </span>
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
                      {cover.features.map((feature, idx) => <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>)}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  {/* Benefits */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {cover.benefits.map((benefit, idx) => <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-teal rounded-full"></div>
                          {benefit}
                        </li>)}
                    </ul>
                  </div>
                  
                  {/* Action Button */}
                  <Button onClick={() => handleRequestQuote(cover)} className="w-full instant-quote-btn transition-all duration-300 rounded-none" size="lg">Instant Quote with Installation</Button>
              </CardContent>
            </Card>)}
          </ProductScrollRow>
        </div>
      </section>

      {/* Energy Savings Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/5 to-teal/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              How Much Energy Does an Automatic Pool Cover Save?
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Consistent use of a pool cover offers these cost- and energy-saving benefits:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Evaporation Reduction */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-background/90 backdrop-blur-sm border-2 hover:border-teal/30">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-teal to-cyan-400 rounded-full flex items-center justify-center mb-4">
                    <Droplets className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">Up to 90%</h3>
                  <h4 className="text-lg font-semibold text-teal mb-3">reduction</h4>
                  <p className="text-foreground/80 font-medium">in evaporation</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pool covers dramatically reduce water loss, saving thousands of gallons annually and reducing the need for constant refilling.
                </p>
              </CardContent>
            </Card>

            {/* Heating Cost Reduction */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-background/90 backdrop-blur-sm border-2 hover:border-orange/30">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange to-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Thermometer className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">Up to 70%</h3>
                  <h4 className="text-lg font-semibold text-orange mb-3">reduction</h4>
                  <p className="text-foreground/80 font-medium">in pool heating costs</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  By retaining heat and reducing heat loss overnight, covers significantly lower your pool heating expenses.
                </p>
              </CardContent>
            </Card>

            {/* Electricity Cost Reduction */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-background/90 backdrop-blur-sm border-2 hover:border-primary/30">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-400 rounded-full flex items-center justify-center mb-4">
                    <Bolt className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">Up to 50%</h3>
                  <h4 className="text-lg font-semibold text-primary mb-3">reduction</h4>
                  <p className="text-foreground/80 font-medium">in electricity costs</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lower filtration needs and reduced pump runtime translate to substantial savings on your electricity bill.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-teal/10 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Start Saving Today
                </h3>
                <p className="text-foreground/80 mb-6">
                  An automatic pool cover is more than just protection – it's an investment that pays for itself through reduced operating costs, water savings, and extended equipment life.
                </p>
                <Button variant="gradient" size="lg" className="hover:scale-105 transition-transform duration-300 rounded-none">
                  Calculate Your Savings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} customProduct={selectedCover ? {
      name: selectedCover.name,
      price: selectedCover.price,
      type: 'automatic-cover'
    } : undefined} />
    </>;
};
export default AutomaticCoversSection;