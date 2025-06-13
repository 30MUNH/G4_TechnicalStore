import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService, CartItem } from '../services/cartService';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartService.viewCart();
            setCartItems(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch cart');
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (productId: string, quantity: number) => {
        try {
            setLoading(true);
            await cartService.addToCart(productId, quantity);
            await fetchCart();
        } catch (err) {
            setError('Failed to add item to cart');
            console.error('Error adding to cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            setLoading(true);
            await cartService.removeItem(productId);
            await fetchCart();
        } catch (err) {
            setError('Failed to remove item from cart');
            console.error('Error removing from cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            setLoading(true);
            await cartService.updateQuantity(productId, quantity);
            await fetchCart();
        } catch (err) {
            setError('Failed to update quantity');
            console.error('Error updating quantity:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            await cartService.clearCart();
            setCartItems([]);
        } catch (err) {
            setError('Failed to clear cart');
            console.error('Error clearing cart:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
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