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

// Debug helper for cart operations
const debugCartOperation = (operation: string, data?: Record<string, unknown>) => {
    console.group(`🛒 [CART DEBUG] ${operation}`);
    
    // Check auth state
    const authToken = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('user');
    const registrationSuccess = sessionStorage.getItem('registrationSuccess');
    
    console.log('🔐 Auth State Check:', {
        hasAuthToken: !!authToken,
        tokenLength: authToken?.length || 0,
        tokenPreview: authToken ? authToken.substring(0, 20) + '...' : 'NONE',
        hasUserInfo: !!userInfo,
        userInfo: userInfo ? JSON.parse(userInfo) : null,
        registrationActive: !!registrationSuccess
    });
    
    // Check registration flow timing
    if (registrationSuccess) {
        try {
            const regData = JSON.parse(registrationSuccess);
            const timeSinceReg = Date.now() - regData.timestamp;
            console.log('⏱️ Registration Timing:', {
                registeredAt: new Date(regData.timestamp).toLocaleTimeString(),
                timeSinceReg: timeSinceReg + 'ms',
                isInGracePeriod: timeSinceReg < 10000,
                willBlockAPI: timeSinceReg < 10000
            });
        } catch (e) {
            console.warn('❌ Invalid registration data');
        }
    }
    
    // Check current page context
    const currentPath = window.location.pathname;
    console.log('📍 Page Context:', {
        currentPath,
        isAuthPage: ['/login', '/signup'].includes(currentPath),
        timestamp: new Date().toLocaleTimeString()
    });
    
    if (data) {
        console.log('📊 Operation Data:', data);
    }
    
    console.groupEnd();
};

export const cartService = {
    async addToCart(productSlug: string, quantity: number): Promise<ApiResponse<Cart>> {
        debugCartOperation('ADD TO CART', { productSlug, quantity });
        
        try {
            const response = await api.post('/cart/add', { productSlug, quantity });
            console.log('✅ Add to cart success:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Add to cart failed:', error);
            throw error;
        }
    },

    async viewCart(): Promise<ApiResponse<Cart>> {
        debugCartOperation('VIEW CART');
        
        try {
            const response = await api.get('/cart/view');
            console.log('✅ View cart success:', {
                status: response.status,
                data: response.data,
                cartItemsCount: response.data?.data?.cartItems?.length || 0
            });
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown }; message?: string; config?: { headers?: { Authorization?: string } } };
            console.error('❌ View cart failed:', {
                error,
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                message: axiosError.message,
                hasAuthHeader: !!axiosError.config?.headers?.Authorization,
                authHeader: axiosError.config?.headers?.Authorization?.substring(0, 20) + '...'
            });
            throw error;
        }
    },

    async updateQuantity(productSlug: string, quantity: number): Promise<ApiResponse<Cart>> {
        const endpoint = quantity > 0 ? '/cart/increase' : '/cart/decrease';
        debugCartOperation('UPDATE QUANTITY', { productSlug, quantity, endpoint });
        
        try {
            const response = await api.post(endpoint, {
                productSlug: productSlug,
                amount: Math.abs(quantity)
            });
            console.log('✅ Update quantity success:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Update quantity failed:', error);
            throw error;
        }
    },

    async removeItem(productSlug: string): Promise<ApiResponse<Cart>> {
        debugCartOperation('REMOVE ITEM', { productSlug });
        
        try {
            const response = await api.patch('/cart/remove', {
                productSlug: productSlug
            });
            console.log('✅ Remove item success:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Remove item failed:', error);
            throw error;
        }
    },

    async clearCart(): Promise<ApiResponse<void>> {
        debugCartOperation('CLEAR CART');
        
        try {
            const response = await api.post('/cart/clear');
            console.log('✅ Clear cart success:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Clear cart failed:', error);
            throw error;
        }
    }
}; 