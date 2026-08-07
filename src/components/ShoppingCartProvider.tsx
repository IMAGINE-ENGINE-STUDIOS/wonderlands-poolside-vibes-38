
import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
import { useToast } from '@/hooks/use-toast';
import ShoppingCart, { CartItem } from './ShoppingCart';

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  /** Removes a single feature/extra from a cart item */
  removeExtra: (id: string, extraIndex: number) => void;
  /** Replaces a feature/extra selection (name + price) on a cart item */
  updateExtra: (id: string, extraIndex: number, next: { name: string; price: number }) => void;

  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  /** Categories that appear more than once in the cart (duplicate selection flag) */
  getDuplicateCategories: () => string[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

interface ShoppingCartProviderProps {
  children: React.ReactNode;
}

export const ShoppingCartProvider = ({ children }: ShoppingCartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem('poolShoppingCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('poolShoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      const updatedItems = cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCartItems(updatedItems);
    } else {
      const newItems = [...cartItems, { ...item, quantity: 1 }];
      setCartItems(newItems);
    }

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`
    });
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeExtra = (id: string, extraIndex: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, extras: (item.extras || []).filter((_, i) => i !== extraIndex) }
          : item
      )
    );
  };

  const updateExtra = (
    id: string,
    extraIndex: number,
    next: { name: string; price: number }
  ) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              extras: (item.extras || []).map((extra, i) =>
                i === extraIndex ? { ...extra, name: next.name, price: next.price } : extra
              ),
            }
          : item
      )
    );
  };


  const clearCart = () => setCartItems([]);

  const getCartTotal = () =>
    cartItems.reduce((total, item) => {
      const extras = (item.extras || []).reduce((sum, e) => sum + e.price, 0);
      return total + (item.price + extras) * item.quantity;
    }, 0);

  const getDuplicateCategories = () => {
    const counts = new Map<string, number>();
    cartItems.forEach(item => {
      const key = item.category || 'Other';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([category]) => category);
  };

  return (
    <ShoppingCartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart,
        updateQuantity,
        removeExtra,
        updateExtra,

        clearCart,
        getCartCount, 
        getCartTotal,
        getDuplicateCategories,
        isCartOpen, 
        setIsCartOpen 
      }}
    >
      {children}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartProvider;
