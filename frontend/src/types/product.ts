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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
} 