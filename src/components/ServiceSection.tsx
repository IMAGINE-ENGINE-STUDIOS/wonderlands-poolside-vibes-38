import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, DollarSign } from "lucide-react";

export interface Service {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string;
  duration?: string;
  warranty?: string;
  image?: string;
  features: string[];
  icon?: React.ReactNode;
}

interface ServiceSectionProps {
  title: string;
  subtitle: string;
  services: Service[];
  onRequestQuote?: (service: Service) => void;
  QuoteComponent?: React.ComponentType<any>;
}

const getTypeColor = (type: string) => {
  const colors = {
    premium: 'bg-gradient-to-r from-coral to-orange',
    standard: 'bg-gradient-to-r from-primary to-teal',
    basic: 'bg-gradient-to-r from-secondary to-accent',
    installation: 'bg-gradient-to-r from-purple-500 to-pink-500',
    maintenance: 'bg-gradient-to-r from-green-500 to-emerald-500',
    repair: 'bg-gradient-to-r from-red-500 to-orange-500',
    default: 'bg-gradient-to-r from-primary to-teal'
  };
  return colors[type as keyof typeof colors] || colors.default;
};

const ServiceSection = ({
  title,
  subtitle,
  services,
  onRequestQuote,
  QuoteComponent
}: ServiceSectionProps) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleRequestQuote = (service: Service) => {
    setSelectedService(service);
    setShowQuoteModal(true);
    onRequestQuote?.(service);
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              {title}
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getTypeColor(service.type)} text-white capitalize font-medium px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {service.icon}
                        {service.type}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Service Image/Icon */}
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-teal/20 rounded-lg flex items-center justify-center border-2 border-muted">
                    {service.image ? (
                      <img loading="lazy" decoding="async" 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        {service.icon && (
                          <div className="text-primary/60 mx-auto mb-2 flex justify-center">
                            {service.icon}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">{service.type}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      {service.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Specifications */}
                  <div className="space-y-2 text-sm">
                    {service.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{service.duration}</span>
                      </div>
                    )}
                    {service.warranty && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warranty:</span>
                        <span className="font-medium">{service.warranty}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  <Separator />
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Includes:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={() => handleRequestQuote(service)}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300 rounded-none"
                    size="sm"
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {QuoteComponent && (
        <QuoteComponent
          service={selectedService}
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          customProduct={selectedService ? {
            name: selectedService.name,
            price: selectedService.price,
            type: 'service'
          } : undefined}
        />
      )}
    </>
  );
};

export default ServiceSection;