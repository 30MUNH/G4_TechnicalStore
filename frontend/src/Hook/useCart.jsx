import { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export const useCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch cart from backend
    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartService.viewCart();
            if (response.cart) {
                setCartItems(response.cart.cartItems || []);
            }
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

    const handleUpdateQuantity = async (productSlug, newQuantity) => {
        try {
            setLoading(true);
            const currentItem = cartItems.find(item => item.product.slug === productSlug);
            if (!currentItem) return;

            const quantityDiff = newQuantity - currentItem.quantity;
            await cartService.updateQuantity(productSlug, quantityDiff);
            await fetchCart();
        } catch (err) {
            setError('Failed to update quantity');
            console.error('Error updating quantity:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productSlug) => {
        try {
            setLoading(true);
            await cartService.removeItem(productSlug);
            await fetchCart();
        } catch (err) {
            setError('Failed to remove item');
            console.error('Error removing item:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productSlug, quantity = 1) => {
        try {
            setLoading(true);
            await cartService.addToCart(productSlug, quantity);
            await fetchCart();
        } catch (err) {
            setError('Failed to add to cart');
            console.error('Error adding to cart:', err);
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

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    };

    const getItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const shippingFee = 30000;

    const calculateTotalAmount = (subtotal) => {
        return subtotal >= 1000000 ? subtotal : subtotal + shippingFee;
    };

    const subtotal = calculateSubtotal();
    const totalAmount = calculateTotalAmount(subtotal);
    const currentShippingFee = subtotal >= 1000000 ? 0 : shippingFee;

    return {
        cartItems,
        setCartItems,
        handleUpdateQuantity,
        handleRemoveItem,
        addToCart,
        clearCart,
        subtotal,
        totalAmount,
        currentShippingFee,
        itemCount: getItemCount(),
        loading,
        error,
        fetchCart
    };
}; 