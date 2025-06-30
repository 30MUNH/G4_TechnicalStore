import api from './apiInterceptor';

export interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        url: string;
        stock: number;
        category: string;
    };
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}

interface Cart {
    id: string;
    totalAmount: number;
    cartItems: CartItem[];
}

export const cartService = {
    async addToCart(productSlug: string, quantity: number): Promise<ApiResponse<Cart>> {
        const response = await api.post('/cart/add', { productSlug, quantity });
        return response.data;
    },

    async viewCart(): Promise<ApiResponse<Cart>> {
        const response = await api.get('/cart/view');
        return response.data;
    },

    async updateQuantity(productSlug: string, quantity: number): Promise<ApiResponse<Cart>> {
        const endpoint = quantity > 0 ? '/cart/increase' : '/cart/decrease';
        const response = await api.post(endpoint, {
            productSlug: productSlug,
            amount: Math.abs(quantity)
        });
        return response.data;
    },

    async removeItem(productSlug: string): Promise<ApiResponse<Cart>> {
        const response = await api.patch('/cart/remove', {
            productSlug: productSlug
        });
        return response.data;
    },

    async clearCart(): Promise<ApiResponse<void>> {
        const response = await api.post('/cart/clear');
        return response.data;
    }
}; 