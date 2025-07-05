import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartService } from '../services/cartService';
import type { CartItem } from '../services/cartService';

// Updated interfaces to match backend
interface CartState {
    items: CartItem[];
    totalAmount: number;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
}

type CartAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CART'; payload: { items: CartItem[]; totalAmount: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_INITIALIZED'; payload: boolean };

interface CartContextType extends CartState {
    addToCart: (productId: string, quantity: number) => Promise<void>;
    increaseQuantity: (productId: string, amount?: number) => Promise<void>;
    decreaseQuantity: (productId: string, amount?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    getItemQuantity: (productId: string) => number;
}

// Define proper types for API responses
interface CartApiResponse {
    success: boolean;
    data?: {
        cartItems: CartItem[];
        totalAmount: number;
    };
    message?: string;
    error?: string;
}

interface VoidApiResponse {
    success: boolean;
    data?: void;
    message?: string;
    error?: string;
}

type ApiResponse = CartApiResponse | VoidApiResponse;

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
            error?: string;
        };
    };
    message?: string;
}

const initialState: CartState = {
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
    isInitialized: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_CART':
            return {
                ...state,
                items: action.payload.items,
                totalAmount: action.payload.totalAmount,
                loading: false,
                error: null,
                isInitialized: true,
            };
        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                totalAmount: 0,
                loading: false,
                error: null,
            };
        case 'SET_INITIALIZED':
            return { ...state, isInitialized: action.payload };
        default:
            return state;
    }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Helper function to handle API responses
    const handleApiResponse = (response: ApiResponse, operation: string) => {
        console.log(`🛒 [CART CONTEXT] ${operation} response:`, response);
        
        if (!response.success) {
            const errorMessage = response.message || response.error || 'Unknown error occurred';
            console.error(`❌ ${operation} failed:`, errorMessage);
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }

        // Handle response structure safely
        try {
            let cartData = null;
            
                        // Try to extract cart data from response
            // @ts-ignore - Temporary ignore for flexible response handling
            if (response.data && typeof response.data === 'object') {
                // Check if it's the cart entity directly
                // @ts-ignore
                if (response.data.cartItems !== undefined) {
                    cartData = response.data;
                }
                // Check if it's wrapped (response.data.data.data) - 3 levels for interceptor
                // @ts-ignore
                else if (response.data.data && response.data.data.data && response.data.data.data.cartItems !== undefined) {
                    // @ts-ignore
                    cartData = response.data.data.data;
                }
                // Check if it's wrapped (response.data.data) - 2 levels fallback
                // @ts-ignore
                else if (response.data.data && response.data.data.cartItems !== undefined) {
                    // @ts-ignore
                    cartData = response.data.data;
                }
            }
            
            // @ts-ignore
            if (cartData && cartData.cartItems !== undefined) {
                // @ts-ignore
                const cartItems = Array.isArray(cartData.cartItems) ? cartData.cartItems : [];
                dispatch({
                    type: 'SET_CART',
                    payload: {
                        items: cartItems,
                        // @ts-ignore
                        totalAmount: Number(cartData.totalAmount) || 0,
                    },
                });
                // @ts-ignore
                console.log(`✅ [CART CONTEXT] Cart updated: ${cartItems.length} items, total: ${cartData.totalAmount}`);
            } else if (operation === 'CLEAR_CART') {
                dispatch({ type: 'CLEAR_CART' });
                console.log(`✅ [CART CONTEXT] Cart cleared`);
            } else {
                console.warn(`🛒 [CART CONTEXT] No cart data found for ${operation}`);
                // Don't auto-refresh to avoid infinite loops
            }
        } catch (error) {
            console.error(`🛒 [CART CONTEXT] Error processing ${operation} response:`, error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to process cart response' });
        }
    };

    // Helper function to handle API errors
    const handleApiError = (error: unknown, operation: string) => {
        console.error(`❌ [CART CONTEXT] ${operation} error:`, error);
        
        const apiError = error as ApiError;
        let errorMessage = 'An error occurred';
        
        // Extract error message from various sources
        if (apiError.message) {
            errorMessage = apiError.message;
        } else if (apiError.response?.data?.message) {
            errorMessage = apiError.response.data.message;
        } else if (apiError.response?.data?.error) {
            errorMessage = apiError.response.data.error;
        }
        
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        
        // Don't throw authentication errors to avoid breaking UX
        if (apiError.response?.status === 401) {
            console.warn('🔐 Authentication required for cart operations');
            dispatch({ type: 'CLEAR_CART' });
            return;
        }
        
        throw error;
    };

    const addToCart = async (productId: string, quantity: number): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.addToCart(productId, quantity);
            handleApiResponse(response, 'ADD_TO_CART');
        } catch (error) {
            handleApiError(error, 'ADD_TO_CART');
        }
    };

    const increaseQuantity = async (productId: string, amount: number = 1): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.increaseQuantity(productId, amount);
            handleApiResponse(response, 'INCREASE_QUANTITY');
        } catch (error) {
            handleApiError(error, 'INCREASE_QUANTITY');
        }
    };

    const decreaseQuantity = async (productId: string, amount: number = 1): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.decreaseQuantity(productId, amount);
            handleApiResponse(response, 'DECREASE_QUANTITY');
        } catch (error) {
            handleApiError(error, 'DECREASE_QUANTITY');
        }
    };

    const removeItem = async (productId: string): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.removeItem(productId);
            handleApiResponse(response, 'REMOVE_ITEM');
        } catch (error) {
            handleApiError(error, 'REMOVE_ITEM');
        }
    };

    const clearCart = async (): Promise<void> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.clearCart();
            handleApiResponse(response, 'CLEAR_CART');
        } catch (error) {
            handleApiError(error, 'CLEAR_CART');
        }
    };

    const refreshCart = async (): Promise<void> => {
        // Don't show loading for refresh operations
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.viewCart();
            handleApiResponse(response, 'REFRESH_CART');
        } catch (error) {
            // Handle auth errors silently for refresh
            const apiError = error as ApiError;
            if (apiError.response?.status === 401) {
                console.warn('🔐 Not authenticated, clearing cart');
                dispatch({ type: 'CLEAR_CART' });
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                return;
            }
            handleApiError(error, 'REFRESH_CART');
        }
    };

    const getItemQuantity = (productId: string): number => {
        const item = state.items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    // Initialize cart on mount and auth changes
    useEffect(() => {
        const initializeCart = async () => {
            const authToken = localStorage.getItem('authToken');
            
            if (!authToken) {
                console.log('🔐 No auth token, skipping cart initialization');
                dispatch({ type: 'CLEAR_CART' });
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                return;
            }

            console.log('🛒 Initializing cart with auth token');
            await refreshCart();
        };

        initializeCart();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                if (e.newValue) {
                    console.log('🔐 Auth token added, refreshing cart');
                    refreshCart();
                } else {
                    console.log('🔐 Auth token removed, clearing cart');
                    dispatch({ type: 'CLEAR_CART' });
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const contextValue: CartContextType = {
        ...state,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
        refreshCart,
        getItemQuantity,
    };

    return (
        <div data-provider="cart">
            <CartContext.Provider value={contextValue}>
                {children}
            </CartContext.Provider>
        </div>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        console.error('🛒 [useCart] Context is undefined. Make sure component is wrapped in CartProvider');
        console.error('🛒 [useCart] Current component tree might not have CartProvider as parent');
        console.error('🛒 [useCart] CartContext:', CartContext);
        console.error('🛒 [useCart] Current location:', window.location.pathname);
        
        // Check if we have providers in DOM
        const providers = document.querySelectorAll('[data-provider="cart"]');
        console.error('🛒 [useCart] Cart providers in DOM:', providers.length);
        
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 