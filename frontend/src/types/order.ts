export enum OrderStatus {
    PENDING = 'PENDING',
    SHIPPING = 'SHIPPING',
    PENDING_EXTERNAL_SHIPPING = 'PENDING_EXTERNAL_SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export interface OrderDetail {
    id: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        url: string;
        price: number;
    };
}

export interface Order {
    id: string;
    customer: {
        id: string;
        username: string;
    };
    shipper?: {
        id: string;
        username: string;
    };
    orderDate: Date;
    status: OrderStatus;
    totalAmount: number;
    shippingAddress: string;
    note?: string;
    cancelReason?: string;
    orderDetails: OrderDetail[];
}

export interface OrderStatistics {
    total: number;
    pending: number;
    processing: number;
    shipping: number;
    delivered: number;
    cancelled: number;
} 