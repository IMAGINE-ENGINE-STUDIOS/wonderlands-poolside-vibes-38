import { useState } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import PoolCatalog from "@/components/PoolCatalog";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import FloridaPoolElements from "@/components/FloridaPoolElements";
import Footer from "@/components/Footer";
import ShoppingCart from "@/components/ShoppingCart";
import RealTimeContentEditor from "@/components/RealTimeContentEditor";
import { Button } from "@/components/ui/button";
import { useShoppingCart } from "@/components/ShoppingCart";
import { ShoppingCart as CartIcon, Edit, Badge } from "lucide-react";

const Index = () => {
  const [showCart, setShowCart] = useState(false);
  const [showCMSEditor, setShowCMSEditor] = useState(false);
  const { getCartCount } = useShoppingCart();

  return (
    <div className="relative min-h-screen">
      <Header />
      <FloridaPoolElements />
      
      {/* Floating Action Buttons */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {/* CMS Editor Button */}
        <Button
          onClick={() => setShowCMSEditor(true)}
          variant="secondary"
          size="icon"
          className="shadow-lg"
          title="Edit Page Content"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        {/* Shopping Cart Button */}
        <Button
          onClick={() => setShowCart(true)}
          variant="secondary"
          size="icon"
          className="shadow-lg relative"
          title="Shopping Cart"
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
        <Hero />
        <PoolCatalog />
        <LinersSection />
        <AutomaticCoversSection />
        <Footer />
      </div>
      
      {/* Shopping Cart Modal */}
      <ShoppingCart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />
      
      {/* CMS Content Editor */}
      <RealTimeContentEditor
        isOpen={showCMSEditor}
        onClose={() => setShowCMSEditor(false)}
      />
    </div>
  );
};

export default Index;
