
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Home, Zap, Eye } from 'lucide-react';

const screenEnclosureOptions = [
  {
    id: 'standard-1-story',
    name: 'Standard Screen Enclosure - 1 Story',
    description: 'Premium aluminum frame with high-quality screen mesh for single-story applications',
    pricePerSqFt: 15,
    features: ['Aluminum Frame', 'Standard Screen Mesh', 'Single Story Height', 'Basic Hardware'],
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  {
    id: 'standard-2-story',
    name: 'Standard Screen Enclosure - 2 Story',
    description: 'Premium aluminum frame with reinforced structure for two-story applications',
    pricePerSqFt: 22,
    features: ['Reinforced Aluminum Frame', 'Standard Screen Mesh', 'Two Story Height', 'Heavy-Duty Hardware'],
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  {
    id: 'premium-1-story',
    name: 'Premium Screen Enclosure - 1 Story',
    description: 'High-end aluminum frame with superior screen mesh and enhanced features',
    pricePerSqFt: 20,
    features: ['Premium Aluminum Frame', 'Superior Screen Mesh', 'Single Story Height', 'Enhanced Hardware', 'Weather Resistant'],
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  {
    id: 'premium-2-story',
    name: 'Premium Screen Enclosure - 2 Story',
    description: 'High-end aluminum frame with superior screen mesh for two-story applications',
    pricePerSqFt: 28,
    features: ['Premium Aluminum Frame', 'Superior Screen Mesh', 'Two Story Height', 'Enhanced Hardware', 'Weather Resistant', 'Reinforced Structure'],
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  }
];

const ScreenEnclosureSection = () => {
  return (
    <section id="screen-enclosures" className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal">
            Screen Enclosures
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your outdoor space with our premium screen enclosures. Available in single and two-story configurations with standard and premium options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {screenEnclosureOptions.map((enclosure) => (
            <Card key={enclosure.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/40 overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={enclosure.image} 
                  alt={enclosure.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gradient-to-r from-primary to-teal text-white">
                    Screen Enclosure
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {enclosure.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {enclosure.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {enclosure.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {enclosure.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{enclosure.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xl font-bold text-primary">
                      ${enclosure.pricePerSqFt}/sq ft
                    </span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Custom Screen Enclosure Solutions</h3>
            <p className="text-muted-foreground mb-6">
              Our screen enclosures are custom-built to fit your exact specifications. Pricing varies based on square footage, height requirements, and premium features selected.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span>Single Story: $15-20/sq ft</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Two Story: $22-28/sq ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScreenEnclosureSection;
