import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Calculator, FileText, ExternalLink, Waves, Settings } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

interface QuoteData {
  name: string;
  email: string;
  phone: string;
  address: string;
  poolType: string;
  poolSize: string;
  budget: string;
  timeline: string;
  additionalFeatures: string[];
  specialRequests: string;
}

const QuotationTool = () => {
  const { toast } = useToast();
  const [quoteData, setQuoteData] = useState<QuoteData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    poolType: "",
    poolSize: "",
    budget: "",
    timeline: "",
    additionalFeatures: [],
    specialRequests: ""
  });

  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const poolTypes = [
    { value: "carbon-fiber", label: "Carbon Fiber Pool", basePrice: 45000 },
    { value: "concrete", label: "Concrete Pool", basePrice: 65000 },
    { value: "infinity", label: "Infinity Pool", basePrice: 125000 },
    { value: "spa-combo", label: "Pool + Spa Combo", basePrice: 85000 }
  ];

  const poolSizes = [
    { value: "small", label: "Small (12x24)", multiplier: 0.8 },
    { value: "medium", label: "Medium (16x32)", multiplier: 1.0 },
    { value: "large", label: "Large (20x40)", multiplier: 1.3 },
    { value: "extra-large", label: "Extra Large (24x48)", multiplier: 1.6 }
  ];

  const additionalFeatures = [
    { id: "heating", name: "Pool Heating System", price: 8500 },
    { id: "saltwater", name: "Saltwater System", price: 2500 },
    { id: "led-lights", name: "LED Lighting Package", price: 3500 },
    { id: "waterfall", name: "Waterfall Feature", price: 5500 },
    { id: "screen-enclosure", name: "Screen Enclosure", price: 12000 },
    { id: "deck-pavers", name: "Premium Deck Pavers", price: 8000 },
    { id: "automatic-cover", name: "Automatic Pool Cover", price: 15000 }
  ];

  const calculateEstimate = () => {
    const selectedPoolType = poolTypes.find(type => type.value === quoteData.poolType);
    const selectedPoolSize = poolSizes.find(size => size.value === quoteData.poolSize);
    
    if (!selectedPoolType || !selectedPoolSize) return;

    let basePrice = selectedPoolType.basePrice * selectedPoolSize.multiplier;
    
    // Add additional features
    const featuresPrice = quoteData.additionalFeatures.reduce((total, featureId) => {
      const feature = additionalFeatures.find(f => f.id === featureId);
      return total + (feature?.price || 0);
    }, 0);

    const totalEstimate = Math.round(basePrice + featuresPrice);
    setEstimatedPrice(totalEstimate);
  };

  const handleFeatureToggle = (featureId: string) => {
    setQuoteData(prev => ({
      ...prev,
      additionalFeatures: prev.additionalFeatures.includes(featureId)
        ? prev.additionalFeatures.filter(id => id !== featureId)
        : [...prev.additionalFeatures, featureId]
    }));
  };

  const handleSubmitQuote = () => {
    if (!quoteData.name || !quoteData.email || !quoteData.poolType) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, email, and pool type.",
        variant: "destructive"
      });
      return;
    }

    calculateEstimate();
    
    toast({
      title: "Quote Generated!",
      description: "Your personalized pool quote has been calculated. Schedule a consultation for final pricing.",
    });
  };

  const openUltimoTool = () => {
    window.open("https://app.ultimo.com/pool-configurator", "_blank");
  };

  const scheduleConsultation = () => {
    window.open("https://calendly.com/wonderlandsworlds/30min", "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 border-t-4 border-gradient-to-r from-primary via-coral to-teal">
        <div className="text-center mb-8">
          <div className="border-t-8 border-gradient-to-r from-primary via-coral to-teal w-32 mx-auto mb-6"></div>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Pool Quotation Tool
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get an instant estimate for your dream pool with our advanced quotation calculator
          </p>
          <div className="border-t-8 border-gradient-to-r from-teal via-coral to-primary w-32 mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Quote Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Your details for personalized quote delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={quoteData.name}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={quoteData.email}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={quoteData.phone}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={quoteData.address}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, City, FL"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pool Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  Pool Configuration
                </CardTitle>
                <CardDescription>
                  Select your preferred pool specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pool Type *</Label>
                    <Select value={quoteData.poolType} onValueChange={(value) => setQuoteData(prev => ({ ...prev, poolType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pool type" />
                      </SelectTrigger>
                      <SelectContent>
                        {poolTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} - Starting at ${type.basePrice.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pool Size</Label>
                    <Select value={quoteData.poolSize} onValueChange={(value) => setQuoteData(prev => ({ ...prev, poolSize: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pool size" />
                      </SelectTrigger>
                      <SelectContent>
                        {poolSizes.map(size => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Budget Range</Label>
                    <Select value={quoteData.budget} onValueChange={(value) => setQuoteData(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                        <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                        <SelectItem value="80k-100k">$80,000 - $100,000</SelectItem>
                        <SelectItem value="100k-150k">$100,000 - $150,000</SelectItem>
                        <SelectItem value="150k+">$150,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <Select value={quoteData.timeline} onValueChange={(value) => setQuoteData(prev => ({ ...prev, timeline: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="When do you want to start?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="1-3months">1-3 months</SelectItem>
                        <SelectItem value="3-6months">3-6 months</SelectItem>
                        <SelectItem value="6-12months">6-12 months</SelectItem>
                        <SelectItem value="planning">Just planning ahead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Features */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Features</CardTitle>
                <CardDescription>
                  Select optional features to enhance your pool experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {additionalFeatures.map(feature => (
                    <div
                      key={feature.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        quoteData.additionalFeatures.includes(feature.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleFeatureToggle(feature.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{feature.name}</span>
                        <span className="text-sm text-muted-foreground">
                          +${feature.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requests</CardTitle>
                <CardDescription>
                  Any additional requirements or custom features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={quoteData.specialRequests}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Describe any special requirements, unique design elements, or specific needs..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quote Summary & Tools */}
          <div className="space-y-6">
            {/* Estimate Summary */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Quote Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {estimatedPrice ? (
                  <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Estimated Total</p>
                    <p className="text-3xl font-bold text-primary">
                      ${estimatedPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      *Estimate includes selected features. Final price may vary.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-border rounded-lg">
                    <Calculator className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Complete the form to see your estimate
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleSubmitQuote} 
                  className="w-full"
                  size="lg"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Quote
                </Button>

                <div className="space-y-2">
                  <Button 
                    onClick={openUltimoTool}
                    variant="outline" 
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Advanced Pool Configurator
                  </Button>
                  
                  <Button 
                    onClick={scheduleConsultation}
                    variant="outline" 
                    className="w-full"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Features */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Wonderlands?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span className="text-sm">Lifetime Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span className="text-sm">Florida Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span className="text-sm">500+ Satisfied Customers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  <span className="text-sm">Free Design Consultation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuotationTool;