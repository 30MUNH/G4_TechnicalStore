// Common interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
}

export interface IOrder {
  id: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  customer?: ICustomer;
  shipper?: IShipper;
}

export interface ICustomer {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  role: Role;
  customerOrders?: IOrder[];
  createdAt: string;
  isRegistered: boolean;
}

export interface IShipper {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  role: Role;
  shipperOrders?: IOrder[];
  createdAt: string;
  isRegistered: boolean;
}

// DTOs
export interface CreateCustomerDto {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface UpdateCustomerDto {
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

export interface CreateShipperDto {
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface UpdateShipperDto {
  username?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

// Custom error types
export interface ApiError extends Error {
  response?: {
    data: {
      message: string;
      error?: string;
    };
    status: number;
  };
} 