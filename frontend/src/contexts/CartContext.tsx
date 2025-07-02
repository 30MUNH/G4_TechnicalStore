import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService, type CartItem } from '../services/cartService';
import { useAuth } from './AuthContext';
import debounce from 'lodash/debounce';

interface CartContextType {
    cartItems: CartItem[];
    totalAmount: number;
    addToCart: (productSlug: string, quantity: number) => Promise<void>;
    removeFromCart: (productSlug: string) => Promise<void>;
    updateQuantity: (productSlug: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    getTax: () => number;
    getShipping: () => number;
    getFinalTotal: () => number;
    loading: boolean;
    error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('🛒 CartProvider Debug - Component initializing');
    
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const { isAuthenticated } = useAuth();

    // Debug state changes - FIXED: Remove isAuthenticated function from dependencies
    useEffect(() => {
        const authStatus = isAuthenticated();
        console.log('🛒 CartProvider Debug - State changed:', {
            cartItemsCount: cartItems.length,
            totalAmount,
            loading,
            isUpdating,
            error,
            isAuthenticated: authStatus
        });
    }, [cartItems, totalAmount, loading, isUpdating, error]);

    useEffect(() => {
        console.log('🛒 CartProvider Debug - useEffect for fetchCart triggered, refreshTrigger:', refreshTrigger);
        
        const fetchCart = async () => {
            console.group('🛒 [DEBUG] Cart Fetch Process');
            
            // Check if we just completed registration - if so, skip cart fetch UNLESS we have a valid token
            const justRegistered = sessionStorage.getItem('registrationSuccess');
            const justLoggedIn = sessionStorage.getItem('loginSuccess');
            const hasValidToken = !!localStorage.getItem('authToken');
            
            if (justRegistered && !hasValidToken) {
                try {
                    const regData = JSON.parse(justRegistered);
                    const timeSinceReg = Date.now() - regData.timestamp;
                    if (timeSinceReg < 3000) { // Reduced to 3 seconds grace period for registration
                        console.log('⏸️ Skipping cart fetch - just completed registration without valid token');
                        console.log('🕒 Registration grace period:', timeSinceReg, 'ms (reduced to 3s)');
                        setCartItems([]);
                        setTotalAmount(0);
                        console.groupEnd();
                        return;
                    }
                } catch (e) {
                    console.warn('❌ Invalid registration data:', e);
                }
            } else if (justRegistered && hasValidToken) {
                console.log('✅ Registration completed with token - allowing cart fetch');
            }
            
            if (justLoggedIn) {
                try {
                    const loginData = JSON.parse(justLoggedIn);
                    const timeSinceLogin = Date.now() - loginData.timestamp;
                    if (timeSinceLogin < 3000) { // 3 seconds grace period for login
                        console.log('⏸️ Skipping cart fetch - just completed login');
                        console.log('🕒 Login grace period:', timeSinceLogin, 'ms');
                        console.log('💡 This prevents 401 errors from token timing issues');
                        setCartItems([]);
                        setTotalAmount(0);
                        console.groupEnd();
                        return;
                    }
                } catch (e) {
                    console.warn('❌ Invalid login data:', e);
                }
            }
            
            // Check auth using token directly instead of isAuthenticated() function
            const authToken = localStorage.getItem('authToken');
            console.log('🔍 Auth check:', {
                hasAuthToken: !!authToken,
                tokenLength: authToken?.length,
                timestamp: new Date().toLocaleTimeString()
            });
            
            if (!authToken) {
                console.log('❌ Not authenticated - clearing cart');
                setCartItems([]);
                setTotalAmount(0);
                console.groupEnd();
                return;
            }

            try {
                console.log('🔄 Setting loading to true');
                setLoading(true);
                console.log('📤 Calling cartService.viewCart()...');
                
                const response = await cartService.viewCart();
                
                console.log('📨 Cart service response:', {
                    success: response.success,
                    hasData: !!response.data,
                    cartItemsCount: response.data?.cartItems?.length || 0,
                    totalAmount: response.data?.totalAmount || 0,
                    message: response.message
                });
                
                // Handle blocked API calls during registration
                if (response.message === 'Registration flow active') {
                    console.log('⏸️ Cart API blocked during registration - setting empty cart');
                    setCartItems([]);
                    setTotalAmount(0);
                    setError(null);
                    return;
                }
                
                if (response.success && response.data) {
                    console.log('✅ Updating cart state with fetched data');
                    setCartItems(response.data.cartItems || []);
                    setTotalAmount(response.data.totalAmount || 0);
                    console.log('✅ Cart data updated successfully');
                } else {
                    console.log('⚠️ No cart data - setting empty cart');
                    setCartItems([]);
                    setTotalAmount(0);
                }
                setError(null);
            } catch (err: unknown) {
                // Handle blocked API calls
                const error = err as { message?: string; response?: { status?: number; data?: { message?: string } } };
                if (error?.message === 'API_BLOCKED_REGISTRATION_FLOW') {
                    console.log('⏸️ Cart fetch blocked during registration flow');
                    setCartItems([]);
                    setTotalAmount(0);
                    setError(null);
                    return;
                }
                
                console.error('❌ Error fetching cart:', {
                    error: err,
                    status: error?.response?.status,
                    message: error?.response?.data?.message || error?.message
                });
                
                setError('Failed to fetch cart');
                setCartItems([]);
                setTotalAmount(0);
            } finally {
                console.log('🔄 Setting loading to false');
                setLoading(false);
                console.groupEnd();
            }
        };
        
        // Add a small delay to avoid immediate cart fetch after page transitions
        // This prevents auth conflicts during registration flow
        const timer = setTimeout(() => {
            console.log('🕒 Cart fetch timer triggered');
            fetchCart();
        }, 1000);

        return () => {
            console.log('🧹 Clearing cart fetch timer');
            clearTimeout(timer);
        };
    }, [refreshTrigger]);

    const debouncedAddToCart = useCallback(
        debounce(async (productSlug: string, quantity: number) => {
            console.log('🛒 CartProvider Debug - debouncedAddToCart called:', { productSlug, quantity, isUpdating });
            if (isUpdating) {
                console.log('⏸️ Cart is already updating, skipping add to cart');
                return;
            }
            setIsUpdating(true);
            try {
                console.log('📤 Calling cartService.addToCart');
                const response = await cartService.addToCart(productSlug, quantity);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to add item to cart');
                }
                console.log('✅ Add to cart successful, triggering cart refresh');
                setRefreshTrigger(prev => prev + 1);
            } catch (err) {
                console.error('❌ Error in debouncedAddToCart:', err);
                setError('Failed to add item to cart');
                throw err;
            } finally {
                console.log('🔄 Setting isUpdating to false');
                setIsUpdating(false);
            }
        }, 500),
        [isUpdating]
    );

    const debouncedUpdateQuantity = useCallback(
        debounce(async (productSlug: string, quantity: number) => {
            console.log('🛒 CartProvider Debug - debouncedUpdateQuantity called:', { productSlug, quantity, isUpdating });
            if (isUpdating) {
                console.log('⏸️ Cart is already updating, skipping quantity update');
                return;
            }
            setIsUpdating(true);
            try {
                console.log('📤 Calling cartService.updateQuantity');
                const response = await cartService.updateQuantity(productSlug, quantity);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to update quantity');
                }
                console.log('✅ Update quantity successful, triggering cart refresh');
                setRefreshTrigger(prev => prev + 1);
            } catch (err) {
                console.error('❌ Error in debouncedUpdateQuantity:', err);
                setError('Failed to update quantity');
                throw err;
            } finally {
                console.log('🔄 Setting isUpdating to false');
                setIsUpdating(false);
            }
        }, 500),
        [isUpdating]
    );

    const debouncedRemoveFromCart = useCallback(
        debounce(async (productSlug: string) => {
            console.log('🛒 CartProvider Debug - debouncedRemoveFromCart called:', { productSlug, isUpdating });
            if (isUpdating) {
                console.log('⏸️ Cart is already updating, skipping remove from cart');
                return;
            }
            setIsUpdating(true);
            try {
                console.log('📤 Calling cartService.removeItem');
                const response = await cartService.removeItem(productSlug);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to remove item from cart');
                }
                console.log('✅ Remove item successful, triggering cart refresh');
                setRefreshTrigger(prev => prev + 1);
            } catch (err) {
                console.error('❌ Error in debouncedRemoveFromCart:', err);
                setError('Failed to remove item from cart');
                throw err;
            } finally {
                console.log('🔄 Setting isUpdating to false');
                setIsUpdating(false);
            }
        }, 500),
        [isUpdating]
    );

    const addToCart = async (productSlug: string, quantity: number) => {
        console.log('🛒 CartProvider Debug - addToCart called:', { productSlug, quantity });
        if (!isAuthenticated()) {
            console.error('❌ User not authenticated for addToCart');
            setError('Please login to add items to cart');
            return;
        }
        await debouncedAddToCart(productSlug, quantity);
    };

    const updateQuantity = async (productSlug: string, quantity: number) => {
        console.log('🛒 CartProvider Debug - updateQuantity called:', { productSlug, quantity });
        if (!isAuthenticated()) {
            console.error('❌ User not authenticated for updateQuantity');
            setError('Please login to manage cart');
            return;
        }
        await debouncedUpdateQuantity(productSlug, quantity);
    };

    const removeFromCart = async (productSlug: string) => {
        console.log('🛒 CartProvider Debug - removeFromCart called:', { productSlug });
        if (!isAuthenticated()) {
            console.error('❌ User not authenticated for removeFromCart');
            setError('Please login to manage cart');
            return;
        }
        await debouncedRemoveFromCart(productSlug);
    };

    const clearCart = async () => {
        console.log('🛒 CartProvider Debug - clearCart called:', { isAuthenticated: isAuthenticated(), isUpdating });
        if (!isAuthenticated() || isUpdating) {
            console.log('⏸️ Cannot clear cart - not authenticated or already updating');
            return;
        }
        
        setIsUpdating(true);
        try {
            console.log('📤 Calling cartService.clearCart');
            const response = await cartService.clearCart();
            if (!response.success) {
                throw new Error(response.message || 'Failed to clear cart');
            }
            console.log('✅ Clear cart successful, updating local state');
            setCartItems([]);
            setTotalAmount(0);
        } catch (err) {
            console.error('❌ Error in clearCart:', err);
            setError('Failed to clear cart');
        } finally {
            console.log('🔄 Setting isUpdating to false');
            setIsUpdating(false);
        }
    };

    const getCartTotal = useCallback(() => {
        const total = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        // Removed debug log to prevent console spam
        return total;
    }, [cartItems]);

    const getTax = useCallback(() => {
        const tax = getCartTotal() * 0.1;
        // Removed debug log to prevent console spam
        return tax;
    }, [getCartTotal]);

    const getShipping = useCallback(() => {
        const total = getCartTotal();
        const shipping = total >= 1000000 ? 0 : 30000;
        // Removed debug log to prevent console spam
        return shipping;
    }, [getCartTotal]);

    const getFinalTotal = useCallback(() => {
        const cartTotal = getCartTotal();
        const tax = getTax();
        const shipping = getShipping();
        const finalTotal = cartTotal + tax + shipping;
        // Removed debug log to prevent console spam
        return finalTotal;
    }, [getCartTotal, getTax, getShipping]);

    console.log('🛒 CartProvider Debug - Rendering provider with context value:', {
        cartItemsCount: cartItems.length,
        totalAmount,
        loading,
        error,
        isUpdating
    });

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalAmount,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getTax,
                getShipping,
                getFinalTotal,
                loading,
                error
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    // Removed debug logs to prevent console spam
    const context = useContext(CartContext);
    if (context === undefined) {
        console.error('❌ useCart must be used within a CartProvider');
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 