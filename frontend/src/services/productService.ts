import api from './apiInterceptor';
import type { Product, Category, ApiResponse } from '../types/product';

class ProductService {

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>('/products');
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }

  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(`/products/category/${categorySlug}`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>(`/categories`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async getNewProducts(limit: number = 8): Promise<{ laptops: Product[]; pcs: Product[]; accessories: Product[] }> {
    console.log("Gọi getNewProducts");
    try {
      const response = await api.get<ApiResponse<{ laptops: Product[]; pcs: Product[]; accessories: Product[] }>>(`/products/new?limit=${limit}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return { laptops: [], pcs: [], accessories: [] };
    } catch (error) {
      console.error('Error fetching new products:', error);
      return { laptops: [], pcs: [], accessories: [] };
    }
  }

  async getTopSellingProducts(limit: number = 6): Promise<Product[]> {
    console.log("Gọi getTopSellingProducts");
    try {
      const response = await api.get<ApiResponse<Product[]>>(`/products/top-selling?limit=${limit}`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      return [];
    }
  }

  async searchProducts(keyword: string): Promise<Product[]> {
    try {
      const response = await api.get<ApiResponse<Product[]>>(`/products/search?q=${encodeURIComponent(keyword)}`);
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // CRUD operations for product management
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.post<ApiResponse<Product>>('/products', productData);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to create product');
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put<ApiResponse<Product>>(`/products/${id}`, productData);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to update product');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
      if (!response.data || !response.data.success) {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

export const productService = new ProductService(); 