import { useState, useEffect, lazy, Suspense } from "react";
import Footer from "@/components/Footer";
import ShoppingCart from "@/components/ShoppingCart";
import OrderManagement from "@/components/OrderManagement";

// Lazy-loaded sections for performance
const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));

const Index = () => {
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  
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
    <div className="relative min-h-screen pt-20">
      <div className="relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading content…</div>}>
          <PoolCatalog />
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
