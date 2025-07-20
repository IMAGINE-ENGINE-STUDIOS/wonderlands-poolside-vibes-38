import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  GalaGoodsAPI, 
  GalaGoodsProduct, 
  GalaGoodsOrder, 
  GalaGoodsBusiness,
  GalaGoodsUser,
  initializeGalaGoodsAPI 
} from '../services/galaGoodsApi';

interface GalaGoodsContextType {
  api: GalaGoodsAPI | null;
  user: GalaGoodsUser | null;
  businesses: GalaGoodsBusiness[];
  products: GalaGoodsProduct[];
  orders: GalaGoodsOrder[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  
  // Actions
  initialize: (apiKey: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadProducts: () => Promise<void>;
  loadBusinesses: () => Promise<void>;
  loadOrders: () => Promise<void>;
  createOrder: (orderData: Partial<GalaGoodsOrder>) => Promise<GalaGoodsOrder>;
  setError: (error: string | null) => void;
}

const GalaGoodsContext = createContext<GalaGoodsContextType | undefined>(undefined);

export const useGalaGoods = () => {
  const context = useContext(GalaGoodsContext);
  if (context === undefined) {
    throw new Error('useGalaGoods must be used within a GalaGoodsProvider');
  }
  return context;
};

interface GalaGoodsProviderProps {
  children: ReactNode;
  apiKey?: string;
}

export const GalaGoodsProvider: React.FC<GalaGoodsProviderProps> = ({ 
  children, 
  apiKey 
}) => {
  const [api, setApi] = useState<GalaGoodsAPI | null>(null);
  const [user, setUser] = useState<GalaGoodsUser | null>(null);
  const [businesses, setBusinesses] = useState<GalaGoodsBusiness[]>([]);
  const [products, setProducts] = useState<GalaGoodsProduct[]>([]);
  const [orders, setOrders] = useState<GalaGoodsOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initialize = async (key: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiInstance = initializeGalaGoodsAPI(key);
      setApi(apiInstance);
      setIsInitialized(true);
      
      // Store API key in localStorage for persistence
      localStorage.setItem('gala-goods-api-key', key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize GALA-GOODS API');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!api) throw new Error('API not initialized');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await api.authenticateUser({ email, password });
      setUser(userData);
      
      // Store user data
      localStorage.setItem('gala-goods-user', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gala-goods-user');
  };

  const loadProducts = async () => {
    if (!api) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const productsData = await api.getProducts();
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinesses = async () => {
    if (!api) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const businessesData = await api.getBusinesses();
      setBusinesses(businessesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load businesses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!api) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: Partial<GalaGoodsOrder>): Promise<GalaGoodsOrder> => {
    if (!api) throw new Error('API not initialized');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newOrder = await api.createOrder(orderData);
      setOrders(prev => [...prev, newOrder]);
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('gala-goods-api-key');
    const storedUser = localStorage.getItem('gala-goods-user');
    
    if (apiKey && !isInitialized) {
      initialize(apiKey);
    } else if (storedApiKey && !isInitialized) {
      initialize(storedApiKey);
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
        localStorage.removeItem('gala-goods-user');
      }
    }
  }, [apiKey, isInitialized]);

  const value: GalaGoodsContextType = {
    api,
    user,
    businesses,
    products,
    orders,
    isLoading,
    error,
    isInitialized,
    initialize,
    login,
    logout,
    loadProducts,
    loadBusinesses,
    loadOrders,
    createOrder,
    setError,
  };

  return (
    <GalaGoodsContext.Provider value={value}>
      {children}
    </GalaGoodsContext.Provider>
  );
};