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
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated()) {
            setCartItems([]);
            setTotalAmount(0);
            return;
        }

        try {
            setLoading(true);
            const response = await cartService.viewCart();
            if (response.cart) {
                setCartItems(response.cart.cartItems || []);
                setTotalAmount(response.cart.totalAmount || 0);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch cart');
            console.error('Error fetching cart:', err);
            setCartItems([]);
            setTotalAmount(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const debouncedAddToCart = useCallback(
        debounce(async (productSlug: string, quantity: number) => {
            if (isUpdating) return;
            setIsUpdating(true);
            try {
                await cartService.addToCart(productSlug, quantity);
                await fetchCart();
            } catch (err) {
                setError('Failed to add item to cart');
                console.error('Error adding to cart:', err);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        }, 500),
        [fetchCart, isUpdating]
    );

    const debouncedUpdateQuantity = useCallback(
        debounce(async (productSlug: string, quantity: number) => {
            if (isUpdating) return;
            setIsUpdating(true);
            try {
                await cartService.updateQuantity(productSlug, quantity);
                await fetchCart();
            } catch (err) {
                setError('Failed to update quantity');
                console.error('Error updating quantity:', err);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        }, 500),
        [fetchCart, isUpdating]
    );

    const debouncedRemoveFromCart = useCallback(
        debounce(async (productSlug: string) => {
            if (isUpdating) return;
            setIsUpdating(true);
            try {
                await cartService.removeItem(productSlug);
                await fetchCart();
            } catch (err) {
                setError('Failed to remove item from cart');
                console.error('Error removing from cart:', err);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        }, 500),
        [fetchCart, isUpdating]
    );

    const addToCart = async (productSlug: string, quantity: number) => {
        if (!isAuthenticated()) {
            setError('Please login to add items to cart');
            return;
        }
        await debouncedAddToCart(productSlug, quantity);
    };

    const updateQuantity = async (productSlug: string, quantity: number) => {
        if (!isAuthenticated()) {
            setError('Please login to manage cart');
            return;
        }
        await debouncedUpdateQuantity(productSlug, quantity);
    };

    const removeFromCart = async (productSlug: string) => {
        if (!isAuthenticated()) {
            setError('Please login to manage cart');
            return;
        }
        await debouncedRemoveFromCart(productSlug);
    };

    const clearCart = async () => {
        if (!isAuthenticated() || isUpdating) return;
        
        setIsUpdating(true);
        try {
            await cartService.clearCart();
            setCartItems([]);
            setTotalAmount(0);
        } catch (err) {
            setError('Failed to clear cart');
            console.error('Error clearing cart:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    }, [cartItems]);

    const getTax = useCallback(() => {
        return getCartTotal() * 0.1;
    }, [getCartTotal]);

    const getShipping = useCallback(() => {
        const total = getCartTotal();
        return total >= 1000000 ? 0 : 30000;
    }, [getCartTotal]);

    const getFinalTotal = useCallback(() => {
        return getCartTotal() + getTax() + getShipping();
    }, [getCartTotal, getTax, getShipping]);

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
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 