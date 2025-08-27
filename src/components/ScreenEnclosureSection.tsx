
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid3X3, Calculator, Shield, Home } from 'lucide-react';
import { useShoppingCart } from './ShoppingCartProvider';

const ScreenEnclosureSection = () => {
  const { addToCart, setIsCartOpen } = useShoppingCart();
  const [surfaceArea, setSurfaceArea] = useState<string>('');
  const [enclosureHeight, setEnclosureHeight] = useState<string>('1-story');
  const [enclosureType, setEnclosureType] = useState<string>('standard');

  const calculatePrice = () => {
    const area = parseFloat(surfaceArea) || 0;
    let pricePerSqFt = 15; // base price

    // Calculate price based on type and height
    if (enclosureType === 'premium') {
      pricePerSqFt = enclosureHeight === '2-story' ? 28 : 22;
    } else if (enclosureType === 'deluxe') {
      pricePerSqFt = enclosureHeight === '2-story' ? 25 : 18;
    } else {
      pricePerSqFt = enclosureHeight === '2-story' ? 22 : 15;
    }

    return area * pricePerSqFt;
  };

  const getFeatures = () => {
    const features = [];
    
    if (enclosureType === 'premium') {
      features.push('Premium Aluminum Frame', 'Superior Screen Mesh', 'Enhanced Hardware', 'Weather Resistant Coating');
    } else if (enclosureType === 'deluxe') {
      features.push('Deluxe Aluminum Frame', 'High-Quality Screen Mesh', 'Standard Hardware', 'Weather Treatment');
    } else {
      features.push('Standard Aluminum Frame', 'Basic Screen Mesh', 'Standard Hardware');
    }
    
    features.push(`${enclosureHeight === '2-story' ? 'Two' : 'Single'} Story Height`);
    
    return features;
  };

  const handleAddToCart = () => {
    const totalPrice = calculatePrice();
    const area = parseFloat(surfaceArea) || 0;
    
    if (area <= 0) {
      alert('Please enter a valid surface area');
      return;
    }

    const item = {
      id: `screen-enclosure-${enclosureType}-${enclosureHeight}-${area}`,
      name: `${enclosureType.charAt(0).toUpperCase() + enclosureType.slice(1)} Screen Enclosure (${area} sq ft)`,
      price: totalPrice,
      image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png',
      category: 'screen-enclosure',
      extras: [{
        name: `${enclosureHeight === '2-story' ? 'Two' : 'Single'} Story Configuration`,
        price: 0
      }]
    };

    addToCart(item);
    setIsCartOpen(true);
  };

  return (
    <section id="screen-enclosures" className="py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Screen Enclosures
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Protect your pool area from insects and debris while enjoying the Florida breeze
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Configuration Panel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Configure Your Screen Enclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surface-area">Surface Area (sq ft) *</Label>
                  <Input
                    id="surface-area"
                    type="number"
                    placeholder="Enter square footage"
                    value={surfaceArea}
                    onChange={(e) => setSurfaceArea(e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enclosure-height">Height Configuration</Label>
                  <Select value={enclosureHeight} onValueChange={setEnclosureHeight}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-story">Single Story</SelectItem>
                      <SelectItem value="2-story">Two Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enclosure-type">Screen Quality</Label>
                <Select value={enclosureType} onValueChange={setEnclosureType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select screen type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Screen Enclosure</SelectItem>
                    <SelectItem value="deluxe">Deluxe Screen Enclosure</SelectItem>
                    <SelectItem value="premium">Premium Screen Enclosure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {parseFloat(surfaceArea) > 0 && (
                <Card className="bg-muted/50 border-teal/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Price Calculation</h4>
                        <p className="text-sm text-muted-foreground">
                          {surfaceArea} sq ft × ${(calculatePrice() / parseFloat(surfaceArea)).toFixed(0)}/sq ft
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                          ${calculatePrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <h5 className="font-medium text-sm">Features Included:</h5>
                      <div className="flex flex-wrap gap-1">
                        {getFeatures().map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={handleAddToCart}
                      className="w-full"
                      variant="gradient"
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Visual Display */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-teal/10 relative">
                <img
                  src="/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png"
                  alt="Screen Enclosure"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Premium Screen Enclosure</h3>
                    <p className="text-sm opacity-90">Protect your investment while maintaining the outdoor experience</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal" />
                  Why Choose Screen Enclosures?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Insect Protection</h4>
                      <p className="text-sm text-muted-foreground">Keep mosquitoes and other pests away from your pool area</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Debris Shield</h4>
                      <p className="text-sm text-muted-foreground">Reduce leaves, twigs, and other debris in your pool</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-coral rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">UV Protection</h4>
                      <p className="text-sm text-muted-foreground">Filter harmful UV rays while maintaining visibility</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center border-muted">
            <CardHeader>
              <Grid3X3 className="h-8 w-8 mx-auto text-muted-foreground" />
              <CardTitle>Standard</CardTitle>
              <p className="text-sm text-muted-foreground">Basic protection</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">$15-$22<span className="text-sm">/sq ft</span></div>
              <ul className="text-sm space-y-1 text-left">
                <li>• Standard aluminum frame</li>
                <li>• Basic screen mesh</li>
                <li>• Standard hardware</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 bg-primary/5">
            <CardHeader>
              <Home className="h-8 w-8 mx-auto text-primary" />
              <CardTitle>Deluxe</CardTitle>
              <p className="text-sm text-muted-foreground">Enhanced quality</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2 text-primary">$18-$25<span className="text-sm">/sq ft</span></div>
              <ul className="text-sm space-y-1 text-left">
                <li>• Deluxe aluminum frame</li>
                <li>• High-quality screen mesh</li>
                <li>• Weather treatment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center border-teal/20 bg-teal/5">
            <CardHeader>
              <Shield className="h-8 w-8 mx-auto text-teal" />
              <CardTitle>Premium</CardTitle>
              <p className="text-sm text-muted-foreground">Maximum durability</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2 text-teal">$22-$28<span className="text-sm">/sq ft</span></div>
              <ul className="text-sm space-y-1 text-left">
                <li>• Premium aluminum frame</li>
                <li>• Superior screen mesh</li>
                <li>• Enhanced hardware</li>
                <li>• Weather resistant coating</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ScreenEnclosureSection;
