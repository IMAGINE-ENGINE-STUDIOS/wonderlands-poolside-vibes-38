import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShoppingCart } from "./ShoppingCartProvider";
import { ShoppingCart, Package } from "lucide-react";

interface MiniCartProps {
  onViewFullCart: () => void;
}

const MiniCart = ({ onViewFullCart }: MiniCartProps) => {
  const { cartItems, getCartCount } = useShoppingCart();
  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.price * item.quantity;
      const extrasPrice = (item.extras || []).reduce((sum, extra) => sum + extra.price, 0) * item.quantity;
      return total + basePrice + extrasPrice;
    }, 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="w-64 p-4 text-center">
        <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  const displayItems = cartItems.slice(0, 3);
  const hasMore = cartItems.length > 3;

  return (
    <div className="w-80">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">Cart</span>
          </div>
          <Badge variant="secondary">{getCartCount()} items</Badge>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto p-3 space-y-2">
        {displayItems.map((item) => (
          <div key={item.id} className="flex gap-2 p-2 rounded-lg hover:bg-muted/50">
            {item.image ? (
              <img loading="lazy" decoding="async"
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold">${item.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <p className="text-xs text-center text-muted-foreground py-1">
            +{cartItems.length - 3} more items
          </p>
        )}
      </div>
      
      <div className="p-3 border-t space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">${calculateTotal().toLocaleString()}</span>
        </div>
        <Button onClick={onViewFullCart} className="w-full">
          View Cart & Checkout
        </Button>
      </div>
    </div>
  );
};

export default MiniCart;
