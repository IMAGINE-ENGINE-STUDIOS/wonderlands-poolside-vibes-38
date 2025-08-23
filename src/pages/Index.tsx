import { useState, lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShoppingCart, { useShoppingCart } from "@/components/ShoppingCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart as CartIcon } from "lucide-react";

// Lazy-loaded heavy sections for performance
const Hero = lazy(() => import("@/components/Hero"));
const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));
const SpaSection = lazy(() => import("@/components/SpaSection"));
const PoolFinishesSection = lazy(() => import("@/components/PoolFinishesSection"));
const PaversSection = lazy(() => import("@/components/PaversSection"));
const AutomaticCoversSection = lazy(() => import("@/components/AutomaticCoversSection"));
const FloridaPoolElements = lazy(() => import("@/components/FloridaPoolElements"));
const WonderlandsBrandShowcase = lazy(() => import("@/components/WonderlandsBrandShowcase"));

const Index = () => {
  const [showCart, setShowCart] = useState(false);
  const { getCartCount } = useShoppingCart();

  console.log("Index component rendering...");
  console.log("Cart count:", getCartCount());

  return (
    <div className="relative min-h-screen">
      <Header />
      <Suspense fallback={<div className="sr-only" aria-busy="true">Loading visual elements…</div>}> 
        <FloridaPoolElements />
      </Suspense>
      
      {/* Shopping Cart Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setShowCart(true)}
          variant="secondary"
          size="icon"
          className="shadow-lg relative"
          title="Shopping Cart"
          aria-label="Open shopping cart"
        >
          <CartIcon className="h-4 w-4" />
          {getCartCount() > 0 && (
            <Badge className="absolute -top-2 -right-2 px-1 min-w-5 h-5 text-xs">
              {getCartCount()}
            </Badge>
          )}
        </Button>
      </div>
      
      <div className="relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading content…</div>}>
          <Hero />
          <WonderlandsBrandShowcase />
          <PoolCatalog />
          <SpaSection />
          <PoolFinishesSection />
          <PaversSection />
          <AutomaticCoversSection />
          <Footer />
        </Suspense>
      </div>
      
      {/* Shopping Cart Modal */}
      <ShoppingCart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />
    </div>
  );
};

export default Index;
