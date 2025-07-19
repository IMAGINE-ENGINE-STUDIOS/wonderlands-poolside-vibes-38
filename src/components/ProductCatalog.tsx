import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  dimensions?: string;
  specifications?: string;
  features?: string[];
  description?: string;
}

interface ProductCatalogProps {
  title: string;
  subtitle: string;
  products: Product[];
  catalogId: string;
  onViewDetails?: (product: Product) => void;
  onRequestQuote?: (product: Product, extras?: any) => void;
  DetailModalComponent?: React.ComponentType<any>;
  QuoteComponent?: React.ComponentType<any>;
}

const ProductCatalog = ({
  title,
  subtitle,
  products,
  catalogId,
  onViewDetails,
  onRequestQuote,
  DetailModalComponent,
  QuoteComponent
}: ProductCatalogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
    onViewDetails?.(product);
  };

  const handleRequestQuote = (product: Product, extras?: any) => {
    setSelectedProduct(product);
    setShowDetailModal(false);
    setShowQuoteModal(true);
    onRequestQuote?.(product, extras);
  };

  return (
    <>
      <section id={catalogId} className="py-20 px-4 relative overflow-hidden">
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
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      </section>

      {DetailModalComponent && (
        <DetailModalComponent
          product={selectedProduct}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onRequestQuote={handleRequestQuote}
        />
      )}
      
      {QuoteComponent && (
        <QuoteComponent
          product={selectedProduct}
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </>
  );
};

export default ProductCatalog;