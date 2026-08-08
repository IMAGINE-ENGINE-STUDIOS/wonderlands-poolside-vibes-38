
import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
import { useToast } from '@/hooks/use-toast';
import { usePersistentState } from '@/hooks/usePersistentState';
import ShoppingCart, { CartItem } from './ShoppingCart';
import { resolveCategoryLabel } from '@/lib/productCategories';


interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  /** Removes a single feature/extra from a cart item */
  removeExtra: (id: string, extraIndex: number) => void;
  /** Replaces a feature/extra selection (name + price) on a cart item */
  updateExtra: (id: string, extraIndex: number, next: { name: string; price: number }) => void;
  /** Live-syncs base price and features of a cart item while it is being configured */
  syncItemConfig: (id: string, next: { price?: number; extras?: CartItem['extras'] }) => void;

  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  /** Categories that appear more than once in the cart (duplicate selection flag) */
  getDuplicateCategories: () => string[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

// Keep a single context instance across hot reloads / duplicate module copies,
// otherwise consumers hold a stale context and throw "must be used within a Provider".
const globalStore = globalThis as unknown as {
  __wlShoppingCartContext?: React.Context<ShoppingCartContextType | undefined>;
};
const ShoppingCartContext =
  globalStore.__wlShoppingCartContext ??
  (globalStore.__wlShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined));

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (context === undefined) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

export const useOptionalShoppingCart = () => useContext(ShoppingCartContext);

interface ShoppingCartProviderProps {
  children: React.ReactNode;
}

export const ShoppingCartProvider = ({ children }: ShoppingCartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = usePersistentState('cart_drawerOpen', false);
  const { toast } = useToast();

  useEffect(() => {
    const savedCart = localStorage.getItem('poolShoppingCart');
    if (savedCart) {
      // Re-label legacy items that stored pricing tiers ("premium") as a category
      const parsed: CartItem[] = JSON.parse(savedCart);
      setCartItems(
        parsed.map(item => ({
          ...item,
          category:
            resolveCategoryLabel(item.category, (item as any).type, item.id, item.name) || 'Other',
        }))
      );
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('poolShoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (incoming: Omit<CartItem, 'quantity'>) => {
    // Categories are product families (Pools, Spas, Saunas...) — never pricing tiers
    const item = {
      ...incoming,
      category:
        resolveCategoryLabel(incoming.category, (incoming as any).type, incoming.id, incoming.name) ||
        'Other',
    };
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

  const syncItemConfig = (
    id: string,
    next: { price?: number; extras?: CartItem['extras'] }
  ) => {
    setCartItems(prev => {
      const target = prev.find(item => item.id === id);
      if (!target) return prev;
      const samePrice = next.price === undefined || next.price === target.price;
      const sameExtras =
        next.extras === undefined ||
        JSON.stringify(next.extras) === JSON.stringify(target.extras || []);
      if (samePrice && sameExtras) return prev;
      return prev.map(item =>
        item.id === id
          ? {
              ...item,
              price: next.price !== undefined ? next.price : item.price,
              extras: next.extras !== undefined ? next.extras : item.extras,
            }
          : item
      );
    });
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
        syncItemConfig,


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
