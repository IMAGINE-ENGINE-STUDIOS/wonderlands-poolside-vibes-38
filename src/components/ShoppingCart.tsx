import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, CreditCard, Package } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';

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
  }, []);

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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CartIcon className="h-5 w-5" />
              Shopping Cart
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some amazing pools and accessories to get started!
            </p>
            <Button onClick={onClose} variant="outline">
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CartIcon className="h-5 w-5" />
              Shopping Cart
              <Badge variant="secondary">{getTotalQuantity()} items</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart}>
              Clear All
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col max-h-[60vh] overflow-auto">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Item Image */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Base Price */}
                      <div className="text-sm">
                        <span className="font-medium">
                          ${item.price.toLocaleString()} each
                        </span>
                      </div>

                      {/* Extras */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium">Add-ons:</p>
                          {item.extras.map((extra, idx) => (
                            <p key={idx} className="ml-2">
                              + {extra.name}: ${extra.price.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg">
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
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total ({getTotalQuantity()} items):</span>
            <span>${calculateTotal().toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?` + 
                  `amount=${calculateTotal()}&` +
                  `product=${encodeURIComponent(`Pool Cart with ${getTotalQuantity()} items`)}&` +
                  `description=${encodeURIComponent(`Complete pool and accessories package`)}&` +
                  `monthly_payment=${Math.round(calculateTotal() * 0.008)}&` +
                  `loan_term=60&` +
                  `project_type=Pool%20Installation`;
                window.open(lyonFinancialUrl, '_blank');
              }}
              variant="default"
              className="flex-1"
            >
              Apply with Lyon Financial
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing cart state globally
export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem('poolShoppingCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      const updatedItems = cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCartItems(updatedItems);
      localStorage.setItem('poolShoppingCart', JSON.stringify(updatedItems));
    } else {
      const newItems = [...cartItems, { ...item, quantity: 1 }];
      setCartItems(newItems);
      localStorage.setItem('poolShoppingCart', JSON.stringify(newItems));
    }

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`
    });
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    addToCart,
    getCartCount
  };
};

export default ShoppingCart;