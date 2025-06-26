import api from './apiInterceptor';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  price: number;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

class ProductService {
  private baseURL = '/api';

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(`${this.baseURL}/products`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(`${this.baseURL}/products/category/${categorySlug}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>(`${this.baseURL}/categories`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get<ApiResponse<Product>>(`${this.baseURL}/products/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getNewProducts(limit: number = 8): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(`${this.baseURL}/products/new?limit=${limit}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching new products:', error);
      return [];
    }
  }

  async getTopSellingProducts(limit: number = 6): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(`${this.baseURL}/products/top-selling?limit=${limit}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      return [];
    }
  }
}

export const productService = new ProductService(); 