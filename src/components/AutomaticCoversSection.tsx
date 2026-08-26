import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, Leaf, Settings } from "lucide-react";
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
            {covers.map((cover, index) => <Card key={cover.name} className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]">
                {/* Edge-to-edge image */}
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img loading="lazy" decoding="async" src={cover.image} alt={cover.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm capitalize">
                      {cover.type}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                      {cover.name}
                    </h3>
                    <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                        <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                          ${cover.price.toLocaleString()}
                        </p>
                        <InstallationNote className="mt-2 !text-[9px]" />
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Material</dt>
                      <dd className="text-right text-foreground">{cover.material}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Motor</dt>
                      <dd className="text-right text-foreground">{cover.motorType}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Warranty</dt>
                      <dd className="text-right text-foreground">{cover.warranty}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Installation</dt>
                      <dd className="text-right text-foreground">{cover.installation}</dd>
                    </div>
                  </dl>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Key Features</h4>
                    <ul className="space-y-1">
                      {cover.features.map((feature, idx) => <li key={idx} className="text-sm text-muted-foreground">
                          {feature}
                        </li>)}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 border-t border-border/60 pt-4">
                    <h4 className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Benefits</h4>
                    <ul className="space-y-1">
                      {cover.benefits.map((benefit, idx) => <li key={idx} className="text-sm text-muted-foreground">
                          {benefit}
                        </li>)}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button onClick={() => handleRequestQuote(cover)} className="w-full instant-quote-btn rounded-none text-[10px] uppercase tracking-[0.3em]" size="lg">Instant Quote with Installation</Button>
              </CardContent>
            </Card>)}
          </ProductScrollRow>
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