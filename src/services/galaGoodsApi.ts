const GALA_GOODS_BASE_URL = 'https://afpebmbmgbbaqutmbpck.supabase.co/functions/v1';

// Types based on GALA-GOODS API structure
export interface GalaGoodsProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  images?: string[];
  stock?: number;
  metadata?: Record<string, any>;
}

export interface GalaGoodsBusiness {
  id: string;
  name: string;
  description?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface GalaGoodsOrder {
  id: string;
  products: GalaGoodsProduct[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerId: string;
  businessId: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface GalaGoodsUser {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  metadata?: Record<string, any>;
}

export class GalaGoodsAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${GALA_GOODS_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GALA-GOODS API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Business methods
  async getBusinesses(): Promise<GalaGoodsBusiness[]> {
    return this.makeRequest('/api-businesses');
  }

  async getBusiness(id: string): Promise<GalaGoodsBusiness> {
    return this.makeRequest(`/api-businesses/${id}`);
  }

  async createBusiness(business: Partial<GalaGoodsBusiness>): Promise<GalaGoodsBusiness> {
    return this.makeRequest('/api-businesses', {
      method: 'POST',
      body: JSON.stringify(business),
    });
  }

  // Product methods
  async getProducts(): Promise<GalaGoodsProduct[]> {
    return this.makeRequest('/api-products');
  }

  async getProduct(id: string): Promise<GalaGoodsProduct> {
    return this.makeRequest(`/api-products/${id}`);
  }

  async createProduct(product: Partial<GalaGoodsProduct>): Promise<GalaGoodsProduct> {
    return this.makeRequest('/api-products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, product: Partial<GalaGoodsProduct>): Promise<GalaGoodsProduct> {
    return this.makeRequest(`/api-products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.makeRequest(`/api-products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async createOrder(orderData: Partial<GalaGoodsOrder>): Promise<GalaGoodsOrder> {
    return this.makeRequest('/api-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<GalaGoodsOrder[]> {
    return this.makeRequest('/api-orders');
  }

  async getOrder(id: string): Promise<GalaGoodsOrder> {
    return this.makeRequest(`/api-orders/${id}`);
  }

  async updateOrder(id: string, orderData: Partial<GalaGoodsOrder>): Promise<GalaGoodsOrder> {
    return this.makeRequest(`/api-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string): Promise<void> {
    return this.makeRequest(`/api-orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Authentication methods (if supported by GALA-GOODS)
  async authenticateUser(credentials: { email: string; password: string }): Promise<GalaGoodsUser> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerUser(userData: Partial<GalaGoodsUser>): Promise<GalaGoodsUser> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}

// Singleton instance
let galaGoodsApiInstance: GalaGoodsAPI | null = null;

export const initializeGalaGoodsAPI = (apiKey: string) => {
  galaGoodsApiInstance = new GalaGoodsAPI(apiKey);
  return galaGoodsApiInstance;
};

export const getGalaGoodsAPI = () => {
  if (!galaGoodsApiInstance) {
    throw new Error('GALA-GOODS API not initialized. Call initializeGalaGoodsAPI first.');
  }
  return galaGoodsApiInstance;
};