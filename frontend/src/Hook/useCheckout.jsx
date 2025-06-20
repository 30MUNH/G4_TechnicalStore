import { useState } from 'react';

export const useCheckout = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    const processOrder = async (cartItems, customerDetails, orderActions, navigationActions) => {
        setIsProcessing(true);
        setCheckoutError(null);

        try {
            // Validate cart
            if (!cartItems || cartItems.length === 0) {
                throw new Error('Giỏ hàng trống');
            }

            // Validate customer details
            const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'ward', 'commune'];
            for (const field of requiredFields) {
                if (!customerDetails[field]?.trim()) {
                    throw new Error(`Vui lòng nhập ${field}`);
                }
            }

            // Calculate totals
            const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
            const shippingFee = subtotal >= 1000000 ? 0 : 30000;
            const totalAmount = subtotal + shippingFee;

            // Create order
            const newOrder = orderActions.createOrder(
                cartItems,
                customerDetails,
                subtotal,
                totalAmount,
                shippingFee
            );

            // Clear cart and navigate
            orderActions.clearCart();
            navigationActions.goToOrderHistory();

            // Show success message
            alert('Đặt hàng thành công!');

            return newOrder;
        } catch (error) {
            setCheckoutError(error.message);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const clearError = () => setCheckoutError(null);

    return {
        isProcessing,
        checkoutError,
        processOrder,
        clearError,
    };
}; 