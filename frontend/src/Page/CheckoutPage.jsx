import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import CheckoutForm from '../components/Cart/CheckoutForm';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { items, totalAmount, loading, error, isInitialized, refreshCart } = useCart();
    const [orderData, setOrderData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // Check authentication but don't block rendering
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('🔐 Not authenticated on checkout page');
            // Don't redirect immediately - let them see the form
        }
    }, [isAuthenticated]);

    // Check cart but don't block rendering  
    useEffect(() => {
        if (!items || items.length === 0) {
            console.log('🛒 Empty cart on checkout page');
            // Don't redirect immediately - let them see empty state
        }
    }, [items]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount).replace('₫', ' ₫');
    };

    const handleOrderSubmit = async (formData) => {
        setSubmitting(true);
        setOrderError(null);

        try {
            // Luôn đồng bộ cart với backend và lấy dữ liệu mới nhất
            console.log('🔄 Refreshing cart before order...');
            await refreshCart();
            
            // Lấy cart trực tiếp từ API để đảm bảo dữ liệu mới nhất
            const cartResponse = await cartService.viewCart();
            console.log('🛒 Current cart from API:', cartResponse);
            
            if (!cartResponse.success || !cartResponse.data?.cartItems || cartResponse.data.cartItems.length === 0) {
                setOrderError('Giỏ hàng của bạn đang trống hoặc đã thay đổi. Vui lòng kiểm tra lại!');
                setSubmitting(false);
                return;
            }

            const currentCart = cartResponse.data;
            console.log('📤 Submitting order:', {
                cartItems: currentCart.cartItems.length,
                totalAmount: currentCart.totalAmount,
                orderData: formData
            });

            // Format address according to backend expectations
            const fullAddress = [
                formData.address,
                formData.commune,
                formData.ward, 
                formData.city
            ].filter(Boolean).join(', ');

            const orderRequest = {
                shippingAddress: fullAddress,
                note: `Customer: ${formData.fullName}, Phone: ${formData.phone}, Email: ${formData.email}`
            };

            const response = await orderService.createOrder(orderRequest);
            
            console.log('✅ Order created successfully:', response);
            
            if (!response.success || !response.data) {
                throw new Error(response.message || 'Đặt hàng thất bại');
            }

            setOrderData(response.data);

            // Refresh cart sau khi đặt hàng thành công để cập nhật trạng thái từ backend
            await refreshCart();
            
            // Show success message and navigate
            const orderId = response.data.id || 'N/A';
            if (orderId === 'N/A') {
                console.warn('Warning: Order created but no ID returned');
            }

            alert(`Đặt hàng thành công! 
Mã đơn hàng: ${orderId}
Tổng tiền: ${formatCurrency(finalTotal)}
Đơn hàng của bạn đang được xử lý.`);
            
            // Navigate to cart which should now be empty
            navigate('/cart');

        } catch (error) {
            console.error('❌ Order submission failed:', error);
            setOrderError(error.message || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    // Remove loading screen - let checkout show immediately

    // Show error state
    if (error) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>Error loading cart</h3>
                <p>{error}</p>
                <button 
                    onClick={() => navigate('/cart')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Go to Cart
                </button>
            </div>
        );
    }

    // Transform cart items to match CheckoutForm expected format
    const transformedCartItems = items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category?.name || 'Product',
        image: item.product.url || '/img/product01.png'
    }));

    const subtotal = totalAmount;
    const shippingFee = subtotal > 1000000 ? 0 : 30000; // Free shipping over 1M VND
    const finalTotal = subtotal + shippingFee;

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '20px', paddingBottom: '20px' }}>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <CheckoutForm 
                            cartItems={transformedCartItems}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            totalAmount={finalTotal}
                            onPlaceOrder={handleOrderSubmit}
                            onBackToCart={handleBackToCart}
                            isProcessing={submitting}
                            error={orderError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage; 