import { useState } from "react";
import HeroTemplate from "@/components/HeroTemplate";
import ProductCatalog from "@/components/ProductCatalog";
import ServiceSection from "@/components/ServiceSection";
import ProductDetailModal from "@/components/ProductDetailModal";
import FloridaPoolElements from "@/components/FloridaPoolElements";
import Footer from "@/components/Footer";
import SurveyQuoteTool from "@/components/SurveyQuoteTool";
import type { Product } from "@/components/ProductCatalog";
import type { Service } from "@/components/ServiceSection";

// Sample data - replace with your own products
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Collection Item",
    price: 2999,
    category: "premium",
    dimensions: "Large Size",
    specifications: "High Quality",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    description: "This is a premium product with exceptional quality and features."
  },
  {
    id: "2", 
    name: "Standard Collection Item",
    price: 1999,
    category: "standard",
    dimensions: "Medium Size",
    specifications: "Good Quality",
    features: ["Feature A", "Feature B", "Feature C"],
    description: "A reliable standard product that meets all your needs."
  },
  {
    id: "3",
    name: "Compact Collection Item", 
    price: 999,
    category: "compact",
    dimensions: "Small Size",
    specifications: "Basic Quality",
    features: ["Essential Feature 1", "Essential Feature 2"],
    description: "Perfect entry-level product with essential features."
  }
];

// Sample services - replace with your own services
const sampleServices: Service[] = [
  {
    id: "s1",
    name: "Installation Service",
    price: 500,
    type: "installation",
    description: "Professional installation by certified technicians",
    duration: "2-4 hours",
    warranty: "1 year",
    features: ["Expert installation", "Quality guarantee", "Follow-up support"]
  },
  {
    id: "s2",
    name: "Maintenance Package",
    price: 200,
    type: "maintenance", 
    description: "Regular maintenance to keep your product in perfect condition",
    duration: "Monthly",
    warranty: "6 months",
    features: ["Monthly checkups", "Cleaning service", "Minor repairs"]
  }
];

const EcommerceTemplate = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Product | Service | null>(null);

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('product-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuoteRequest = (item: Product | Service) => {
    setSelectedItem(item);
    setShowQuoteModal(true);
  };

  return (
    <div className="relative min-h-screen">
      <FloridaPoolElements />
      <div className="relative z-10">
        <HeroTemplate
          logo="/lovable-uploads/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png"
          logoAlt="Your Business Logo"
          title="Your Amazing Business"
          subtitle="Transform your experience with our premium products and services. Where quality meets excellence."
          primaryButtonText="Explore Products"
          secondaryButtonText="Get Free Quote"
          trustBadgeText="Trusted by 500+ customers worldwide"
          onPrimaryClick={scrollToCatalog}
          onSecondaryClick={() => setShowQuoteModal(true)}
          showQuoteModal={showQuoteModal}
          QuoteComponent={() => (
            <SurveyQuoteTool 
              pool={null}
              isOpen={showQuoteModal}
              onClose={() => setShowQuoteModal(false)}
            />
          )}
        />
        
        <ProductCatalog
          title="Our Product Collection"
          subtitle="Discover our premium products designed for every lifestyle and budget."
          products={sampleProducts}
          catalogId="product-catalog"
          onRequestQuote={handleQuoteRequest}
          DetailModalComponent={ProductDetailModal}
          QuoteComponent={({ product, isOpen, onClose }: any) => (
            <SurveyQuoteTool 
              pool={product}
              isOpen={isOpen}
              onClose={onClose}
            />
          )}
        />
        
        <ServiceSection
          title="Our Services"
          subtitle="Professional services to enhance your experience and ensure satisfaction."
          services={sampleServices}
          onRequestQuote={handleQuoteRequest}
          QuoteComponent={({ service, isOpen, onClose, customProduct }: any) => (
            <SurveyQuoteTool 
              pool={null}
              isOpen={isOpen}
              onClose={onClose}
              customProduct={customProduct}
            />
          )}
        />
        
        <Footer />
      </div>
    </div>
  );
};

export default EcommerceTemplate;