import { useState, useEffect } from 'react';

export const useCheckout = () => {
    console.log('🎯 useCheckout Debug - Hook initializing');
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    // Debug state changes
    useEffect(() => {
        console.log('🎯 useCheckout Debug - State changed:', {
            isProcessing,
            checkoutError
        });
    }, [isProcessing, checkoutError]);

    const processOrder = async (cartItems, customerDetails, orderActions, navigationActions) => {
        console.log('🚀 useCheckout Debug - Processing order started:', {
            cartItemsCount: cartItems?.length,
            customerDetails,
            hasOrderActions: !!orderActions,
            hasNavigationActions: !!navigationActions
        });

        console.log('🔄 useCheckout Debug - Setting processing state');
        setIsProcessing(true);
        setCheckoutError(null);

        try {
            // Validate cart
            console.log('📋 useCheckout Debug - Validating cart items');
            if (!cartItems || cartItems.length === 0) {
                console.error('❌ useCheckout Debug - Cart validation failed: empty cart');
                throw new Error('Giỏ hàng trống');
            }
            console.log('✅ useCheckout Debug - Cart validation passed:', cartItems.length, 'items');

            // Validate customer details
            console.log('👤 useCheckout Debug - Validating customer details');
            const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'ward', 'commune'];
            const missingFields = [];
            
            for (const field of requiredFields) {
                if (!customerDetails[field]?.trim()) {
                    missingFields.push(field);
                }
            }
            
            if (missingFields.length > 0) {
                console.error('❌ useCheckout Debug - Customer validation failed:', missingFields);
                throw new Error(`Vui lòng nhập đầy đủ thông tin: ${missingFields.join(', ')}`);
            }
            console.log('✅ useCheckout Debug - Customer validation passed');

            // Calculate totals
            console.log('💰 useCheckout Debug - Calculating totals');
            const subtotal = cartItems.reduce((total, item) => {
                const itemTotal = item.price * item.quantity;
                console.log('💰 useCheckout Debug - Item calculation:', {
                    name: item.name || item.product?.name,
                    price: item.price,
                    quantity: item.quantity,
                    itemTotal
                });
                return total + itemTotal;
            }, 0);
            
            const shippingFee = subtotal >= 1000000 ? 0 : 30000;
            const totalAmount = subtotal + shippingFee;
            
            console.log('💰 useCheckout Debug - Totals calculated:', {
                subtotal,
                shippingFee,
                totalAmount,
                isFreeShipping: subtotal >= 1000000
            });

            // Validate order actions
            if (!orderActions || typeof orderActions.createOrder !== 'function') {
                console.error('❌ useCheckout Debug - Invalid orderActions:', orderActions);
                throw new Error('Invalid order actions');
            }

            if (!orderActions.clearCart || typeof orderActions.clearCart !== 'function') {
                console.error('❌ useCheckout Debug - Invalid clearCart function:', orderActions.clearCart);
                throw new Error('Invalid clear cart function');
            }

            // Create order
            console.log('📦 useCheckout Debug - Creating order');
            const newOrder = orderActions.createOrder(
                cartItems,
                customerDetails,
                subtotal,
                totalAmount,
                shippingFee
            );
            console.log('✅ useCheckout Debug - Order created:', newOrder);

            // Clear cart
            console.log('🧹 useCheckout Debug - Clearing cart');
            orderActions.clearCart();

            // Navigate
            if (navigationActions && typeof navigationActions.goToOrderHistory === 'function') {
                console.log('🔄 useCheckout Debug - Navigating to order history');
                navigationActions.goToOrderHistory();
            } else {
                console.warn('⚠️ useCheckout Debug - Navigation actions not available or invalid');
            }

            // Show success message
            console.log('🎉 useCheckout Debug - Showing success message');
            alert('Đặt hàng thành công!');

            return newOrder;
        } catch (error) {
            console.error('❌ useCheckout Debug - Order processing failed:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi xử lý đơn hàng';
            setCheckoutError(errorMessage);
            throw error;
        } finally {
            console.log('🔄 useCheckout Debug - Setting processing to false');
            setIsProcessing(false);
        }
    };

    const clearError = () => {
        console.log('🧹 useCheckout Debug - Clearing error');
        setCheckoutError(null);
    };

    console.log('🎯 useCheckout Debug - Hook returning functions:', {
        isProcessing,
        hasCheckoutError: !!checkoutError,
        checkoutError
    });

    return {
        isProcessing,
        checkoutError,
        processOrder,
        clearError,
    };
}; 