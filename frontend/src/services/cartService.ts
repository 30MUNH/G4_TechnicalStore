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

export const cartService = {
    async addToCart(productSlug: string, quantity: number) {
        const response = await api.post('/cart/add', { productSlug, quantity });
        return response.data;
    },

    async viewCart() {
        const response = await api.get('/cart/view');
        return response.data;
    },

    async updateQuantity(productSlug: string, quantity: number) {
        const endpoint = quantity > 0 ? '/cart/increase' : '/cart/decrease';
        const response = await api.post(endpoint, {
            productSlug: productSlug,
            amount: Math.abs(quantity)
        });
        return response.data;
    },

    async removeItem(productSlug: string) {
        const response = await api.patch('/cart/remove', {
            productSlug: productSlug
        });
        return response.data;
    },

    async clearCart() {
        const response = await api.post('/cart/clear');
        return response.data;
    }
}; 