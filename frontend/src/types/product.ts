export interface Product {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  slug: string;
  price: number;
  description: string;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// Response format mới từ backend (không có success field)
export interface ApiResponse<T> {
  message: string;
  error?: string;
  [key: string]: any; // Cho phép các field khác như products, categories, etc.
}

// Response format cũ (để backward compatibility)
export interface LegacyApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
} 