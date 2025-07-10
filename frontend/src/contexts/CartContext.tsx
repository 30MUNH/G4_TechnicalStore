import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cartService } from '../services/cartService';
import type { CartItem } from '../services/cartService';

// Updated interfaces to match backend
interface CartState {
    items: CartItem[];
    totalAmount: number;
    loading: boolean;
    operationLoading: boolean; // Separate loading for cart operations (add/update/remove)
    activeOperations: Set<string>; // Track operations per product
    error: string | null;
    isInitialized: boolean;
}

type CartAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_OPERATION_LOADING'; payload: boolean }
    | { type: 'ADD_OPERATION'; payload: string }
    | { type: 'REMOVE_OPERATION'; payload: string }
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
    data?: unknown; // Make flexible to handle different wrapping structures
    message?: string;
    error?: string;
}

type ApiResponse = CartApiResponse;

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
    operationLoading: false,
    activeOperations: new Set<string>(),
    error: null,
    isInitialized: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_OPERATION_LOADING':
            return { ...state, operationLoading: action.payload };
        case 'ADD_OPERATION': {
            const newOperations = new Set(state.activeOperations);
            newOperations.add(action.payload);
            return { 
                ...state, 
                activeOperations: newOperations,
                operationLoading: newOperations.size > 0 
            };
        }
        case 'REMOVE_OPERATION': {
            const newOperations = new Set(state.activeOperations);
            newOperations.delete(action.payload);
            return { 
                ...state, 
                activeOperations: newOperations,
                operationLoading: newOperations.size > 0 
            };
        }
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false, operationLoading: false };
        case 'SET_CART':
            return {
                ...state,
                items: action.payload.items,
                totalAmount: action.payload.totalAmount,
                loading: false,
                operationLoading: false,
                error: null,
                isInitialized: true,
            };
        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                totalAmount: 0,
                loading: false,
                operationLoading: false,
                activeOperations: new Set<string>(),
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
        
        if (!response.success) {
            const errorMessage = response.message || response.error || 'Unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            throw new Error(errorMessage);
        }

        // Handle response structure safely
        try {
            let cartData = null;
            
                        // Try to extract cart data from response  
            if (response.data && typeof response.data === 'object') {
                // Check if it's the cart entity directly
                // @ts-expect-error - Dynamic response structure from backend API
                if (response.data.cartItems !== undefined) {
                    cartData = response.data;
                }

                // Check if it's wrapped (response.data.data.data) - 3 levels for interceptor
                // @ts-expect-error - Nested data structure from API interceptor
                else if (response.data.data && response.data.data.data && response.data.data.data.cartItems !== undefined) {
                    // @ts-expect-error - Accessing nested cart data from interceptor wrapper
                    cartData = response.data.data.data;
                }
                // Check if it's wrapped (response.data.data) - 2 levels fallback

                // Check if it's wrapped (response.data.data)

                // @ts-expect-error - Alternative nested data structure from API
                else if (response.data.data && response.data.data.cartItems !== undefined) {
                    // @ts-expect-error - Accessing nested cart data from API wrapper
                    cartData = response.data.data;
                }
            }
            
            if (cartData && cartData.cartItems !== undefined) {
                const cartItems = Array.isArray(cartData.cartItems) ? cartData.cartItems : [];
                dispatch({
                    type: 'SET_CART',
                    payload: {
                        items: cartItems,
                        totalAmount: Number(cartData.totalAmount) || 0,
                    },
                });
            } else if (operation === 'CLEAR_CART') {
                dispatch({ type: 'CLEAR_CART' });
            } else {
                // Don't auto-refresh to avoid infinite loops
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to process cart response' });
        }
    };

    // Helper function to handle API errors
    const handleApiError = (error: unknown) => {
        
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
            dispatch({ type: 'CLEAR_CART' });
            return;
        }
        
        throw error;
    };

    const addToCart = async (productId: string, quantity: number): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`add-${productId}`)) {
            return;
        }

        const operationId = `add-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.addToCart(productId, quantity);
            handleApiResponse(response, 'ADD_TO_CART');
        } catch (error) {
            handleApiError(error);
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const increaseQuantity = async (productId: string, amount: number = 1): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`increase-${productId}`)) {
            return;
        }

        const operationId = `increase-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.increaseQuantity(productId, amount);
            handleApiResponse(response, 'INCREASE_QUANTITY');
        } catch (error) {
            handleApiError(error);
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const decreaseQuantity = async (productId: string, amount: number = 1): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`decrease-${productId}`)) {
            return;
        }

        const operationId = `decrease-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.decreaseQuantity(productId, amount);
            handleApiResponse(response, 'DECREASE_QUANTITY');
        } catch (error) {
            handleApiError(error);
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const removeItem = async (productId: string): Promise<void> => {
        // Only prevent if the same product is already being processed
        if (state.activeOperations.has(`remove-${productId}`)) {
            return;
        }

        const operationId = `remove-${productId}`;
        dispatch({ type: 'ADD_OPERATION', payload: operationId });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.removeItem(productId);
            handleApiResponse(response, 'REMOVE_ITEM');
        } catch (error) {
            handleApiError(error);
        } finally {
            dispatch({ type: 'REMOVE_OPERATION', payload: operationId });
        }
    };

    const clearCart = async (): Promise<void> => {
        if (state.operationLoading) {
            return;
        }

        // Brief loading state to prevent spam clicks, but no UI loading shown
        dispatch({ type: 'SET_OPERATION_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const response = await cartService.clearCart();
            handleApiResponse(response, 'CLEAR_CART');
        } catch (error) {
            handleApiError(error);
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
                dispatch({ type: 'CLEAR_CART' });
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                return;
            }
            // Don't throw errors for refresh
            dispatch({ type: 'SET_INITIALIZED', payload: true });
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
                dispatch({ type: 'CLEAR_CART' });
                dispatch({ type: 'SET_INITIALIZED', payload: true });
                return;
            }

            // Set initialized immediately to prevent loading screen
            dispatch({ type: 'SET_INITIALIZED', payload: true });
            // Then refresh cart in background
            await refreshCart();
        };

        initializeCart();
    }, []);

    // Listen for auth changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                if (e.newValue) {
                    refreshCart();
                } else {
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
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 