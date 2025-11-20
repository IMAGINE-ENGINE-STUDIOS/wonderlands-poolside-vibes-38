
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, CreditCard, Package } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';

// Re-export the hook and provider from ShoppingCartProvider
export { useShoppingCart, ShoppingCartProvider } from './ShoppingCartProvider';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
  extras?: {
    name: string;
    price: number;
  }[];
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingCart = ({ isOpen, onClose }: ShoppingCartProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('poolShoppingCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [isOpen]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('poolShoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart"
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart"
    });
  };

  const calculateItemTotal = (item: CartItem) => {
    const basePrice = item.price * item.quantity;
    const extrasPrice = (item.extras || []).reduce((sum, extra) => sum + extra.price, 0) * item.quantity;
    return basePrice + extrasPrice;
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (cartItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Shopping Cart
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6 sm:py-8">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 px-4">
              Add some amazing pools and accessories to get started!
            </p>
            <Button onClick={onClose} variant="outline" size="sm" className="sm:size-default">
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">Shopping Cart</span>
              <Badge variant="secondary" className="text-xs">{getTotalQuantity()} items</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs sm:text-sm">
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col max-h-[50vh] sm:max-h-[60vh] overflow-auto">
          <div className="space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-4">
                    {/* Item Image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm sm:text-base line-clamp-2">{item.name}</h4>
                          <Badge variant="outline" className="text-[10px] sm:text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      {/* Base Price */}
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">
                          ${item.price.toLocaleString()} each
                        </span>
                      </div>

                      {/* Extras */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          <p className="font-medium">Add-ons:</p>
                          {item.extras.map((extra, idx) => (
                            <p key={idx} className="ml-2 truncate">
                              + {extra.name}: ${extra.price.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-base sm:text-lg">
                            ${calculateItemTotal(item).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Cart Summary */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center text-base sm:text-lg font-bold">
            <span className="text-sm sm:text-base">Total ({getTotalQuantity()} items):</span>
            <span className="text-base sm:text-lg">${calculateTotal().toLocaleString()}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 text-sm sm:text-base">
              Continue Shopping
            </Button>
            <StripeCheckoutButton
              productId="cart_checkout"
              productName={`Cart with ${getTotalQuantity()} items`}
              price={calculateTotal()}
              quantity={1}
              variant="default"
              className="flex-1 text-sm sm:text-base"
              cartItems={cartItems}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingCart;
