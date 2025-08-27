
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ShoppingCart, { CartItem } from './ShoppingCart';

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  getCartCount: () => number;
  openCart: () => void;
  closeCart: () => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const useShoppingCart = () => {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
};

interface ShoppingCartProviderProps {
  children: React.ReactNode;
}

const ShoppingCartProvider = ({ children }: ShoppingCartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = {
    cartItems,
    addToCart,
    getCartCount,
    openCart,
    closeCart
  };

  return (
    <ShoppingCartContext.Provider value={value}>
      {children}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={closeCart}
      />
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartProvider;
