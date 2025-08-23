import { useState, useEffect, lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShoppingCart, { useShoppingCart } from "@/components/ShoppingCart";
import OrderManagement from "@/components/OrderManagement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart as CartIcon, Package } from "lucide-react";

// Lazy-loaded heavy sections for performance
const Hero = lazy(() => import("@/components/Hero"));
const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));
const SpaSection = lazy(() => import("@/components/SpaSection"));
const PoolFinishesSection = lazy(() => import("@/components/PoolFinishesSection"));
const PorcelainLinersSection = lazy(() => import("@/components/PorcelainLinersSection"));
const PaversSection = lazy(() => import("@/components/PaversSection"));
const AutomaticCoversSection = lazy(() => import("@/components/AutomaticCoversSection"));
const FloridaPoolElements = lazy(() => import("@/components/FloridaPoolElements"));
const WonderlandsBrandShowcase = lazy(() => import("@/components/WonderlandsBrandShowcase"));

const Index = () => {
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const { getCartCount } = useShoppingCart();

  console.log("Index component rendering...");
  console.log("Cart count:", getCartCount());
  
  useEffect(() => {
    const openCart = () => setShowCart(true);
    const openOrders = () => setShowOrders(true);
    window.addEventListener('open-cart', openCart as unknown as EventListener);
    window.addEventListener('open-orders', openOrders as unknown as EventListener);
    return () => {
      window.removeEventListener('open-cart', openCart as unknown as EventListener);
      window.removeEventListener('open-orders', openOrders as unknown as EventListener);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <Header />
      <Suspense fallback={<div className="sr-only" aria-busy="true">Loading visual elements…</div>}> 
        <FloridaPoolElements />
      </Suspense>
      
      
      <div className="relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading content…</div>}>
          <Hero />
          <WonderlandsBrandShowcase />
          <PoolCatalog />
          <SpaSection />
          <PoolFinishesSection />
          <PorcelainLinersSection />
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
      
      {/* Order Management Modal */}
      <OrderManagement 
        isOpen={showOrders} 
        onClose={() => setShowOrders(false)} 
      />
    </div>
  );
};

export default Index;
