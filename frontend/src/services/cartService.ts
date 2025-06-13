import api from './apiInterceptor';

export interface CartItem {
    productId: string;
    quantity: number;
}

export const cartService = {
    async addToCart(productId: string, quantity: number) {
        const response = await api.post('/cart/add', { productId, quantity });
        return response.data;
    },

    async viewCart() {
        const response = await api.get('/cart/view');
        return response.data;
    },

    async updateQuantity(productId: string, quantity: number) {
        const endpoint = quantity > 0 ? '/cart/increase' : '/cart/decrease';
        const response = await api.post(endpoint, {
            productSlug: productId,
            amount: Math.abs(quantity)
        });
        return response.data;
    },

    async removeItem(productId: string) {
        const response = await api.patch('/cart/remove', {
            productSlug: productId
        });
        return response.data;
    },

    async clearCart() {
        const response = await api.delete('/cart/clear');
        return response.data;
    }
}; 