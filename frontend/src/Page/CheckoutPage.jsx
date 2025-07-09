import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import CheckoutForm from '../components/Cart/CheckoutForm';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { items, totalAmount, loading, error, isInitialized, refreshCart } = useCart();
    const [orderData, setOrderData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [validatedCart, setValidatedCart] = useState(null);
    const [paymentMessage, setPaymentMessage] = useState(null);

    // Check authentication but don't block rendering
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('🔐 Not authenticated on checkout page');
            // Don't redirect immediately - let them see the form
        }
    }, [isAuthenticated]);

    // Handle payment messages from navigation state
    useEffect(() => {
        const state = location.state;
        if (state) {
            if (state.paymentCancelled && state.message) {
                setPaymentMessage({ type: 'warning', text: state.message });
                // Clear the state
                navigate(location.pathname, { replace: true });
            } else if (state.paymentSuccess && state.message) {
                setPaymentMessage({ type: 'success', text: state.message });
                // Clear the state
                navigate(location.pathname, { replace: true });
            }
        }
    }, [location, navigate]);

    // Auto-hide payment message after 5 seconds
    useEffect(() => {
        if (paymentMessage) {
            const timer = setTimeout(() => {
                setPaymentMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [paymentMessage]);


    // Khi vào trang checkout, luôn lấy cart mới nhất từ backend
    useEffect(() => {
        const validateCartOnMount = async () => {
            if (!isAuthenticated()) {
                setValidatedCart(null);
                return;
            }
            
            try {
                const cartResponse = await cartService.viewCart();
                
                if (cartResponse.success && cartResponse.data?.data?.cartItems?.length > 0) {
                    setValidatedCart(cartResponse.data.data);
                } else {
                    setValidatedCart(null);
                }
            } catch (error) {
                setValidatedCart(null);
            }
        };
        validateCartOnMount();
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
            // Kiểm tra authentication trước khi tiếp tục
            if (!isAuthenticated()) {
                setOrderError('Vui lòng đăng nhập để đặt hàng');
                setSubmitting(false);
                return;
            }

            // Luôn lấy cart mới nhất từ backend trước khi đặt hàng
            const cartResponse = await cartService.viewCart();
            
            if (!cartResponse.success || !cartResponse.data?.data?.cartItems || cartResponse.data.data.cartItems.length === 0) {
                setOrderError('Giỏ hàng của bạn đang trống hoặc đã thay đổi. Vui lòng kiểm tra lại!');
                setSubmitting(false);
                return;
            }
            
            const currentCart = cartResponse.data.data;
            
            // Validate thông tin khách hàng
            const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'ward', 'commune'];
            const missingFields = requiredFields.filter(field => !formData[field]?.trim());
            if (missingFields.length > 0) {
                setOrderError(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
                setSubmitting(false);
                return;
            }
            
            // Tạo order request
            const fullAddress = [
                formData.address.trim(),
                formData.commune.trim(),
                formData.ward.trim(),
                formData.city.trim()
            ].filter(Boolean).join(', ');
            
            const orderRequest = {
                shippingAddress: fullAddress,
                note: [
                    `Khách hàng: ${formData.fullName.trim()}`,
                    `Số điện thoại: ${formData.phone.trim()}`,
                    `Email: ${formData.email.trim()}`,
                    `Số lượng sản phẩm: ${currentCart.cartItems.length}`,
                    `Tổng tiền: ${formatCurrency(currentCart.totalAmount)}`
                ].join(' | ')
            };
            
            console.log('📤 Submitting order:', {
                cartItems: currentCart.cartItems.length,
                totalAmount: currentCart.totalAmount,
                orderData: formData
            });
            
            const response = await orderService.createOrder(orderRequest);
            console.log('🎯 [CHECKOUT] Order response:', {
                success: response.success,
                hasData: !!response.data,
                hasOrderId: !!response.data?.id,
                hasNestedOrderId: !!response.data?.data?.id
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Đặt hàng thất bại');
            }
            
            // Try both direct and nested structure for order ID
            const orderData = response.data?.id ? response.data : response.data?.data;
            if (!orderData?.id) {
                console.error('❌ [CHECKOUT] No order ID found in response:', response);
                throw new Error('Payment successful but order ID not received');
            }
            
            console.log('✅ [CHECKOUT] Order created successfully:', {
                orderId: orderData.id,
                totalAmount: orderData.totalAmount
            });
            
            setOrderData(orderData);
            await refreshCart();
            
            alert('Payment successful');
            
            navigate('/orders', {
                state: {
                    newOrderId: orderData.id,
                    message: 'Payment successful'
                }
            });

        } catch (error) {
            setOrderError(error.message || 'Đặt hàng thất bại');
        } finally {
            setSubmitting(false);
        }
    };


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
                <h3>Lỗi tải giỏ hàng</h3>
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
                    Quay lại giỏ hàng
                </button>
            </div>
        );
    }

    // Show loading state briefly
    if (loading && !isInitialized) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Đang tải...</span>
                    </div>
                    <p style={{ marginTop: '10px' }}>Đang tải thông tin giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // Ưu tiên sử dụng validatedCart nếu có, fallback về context
    const activeCart = validatedCart || { cartItems: items, totalAmount };
    const cartItems = activeCart.cartItems || items || [];
    const subtotal = activeCart.totalAmount || totalAmount || 0;
    const shippingFee = subtotal > 1000000 ? 0 : 30000;
    const finalTotal = subtotal + shippingFee;

    if ((!cartItems || cartItems.length === 0)) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
                <h3>Giỏ hàng trống</h3>
                <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
                <button onClick={() => navigate('/cart')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Quay lại giỏ hàng
                </button>
            </div>
        );
    }

    // Transform cart items với error handling
    const transformedCartItems = cartItems.map((item, index) => {
        try {
            return {
                id: item.product?.id || item.id || `item-${index}`,
                name: item.product?.name || item.name || `Sản phẩm ${index + 1}`,
                price: item.product?.price || item.price || 0,
                quantity: item.quantity || 1,
                category: item.product?.category?.name || item.product?.category || 'Sản phẩm',
                image: item.product?.images && item.product.images.length > 0 
                    ? item.product.images[0].url 
                    : '/img/pc.png',
                // Pass through the full product data
                product: item.product
            };
        } catch (error) {
            return {
                id: `error-item-${index}`,
                name: `Lỗi sản phẩm ${index + 1}`,
                price: 0,
                quantity: 1,
                category: 'Lỗi',
                image: '/img/product01.png'
            };
        }
    });

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '20px', paddingBottom: '20px' }}>
            <div className="container">
                {/* Payment Message */}
                {paymentMessage && (
                    <div className="row">
                        <div className="col-md-12">
                            <div 
                                className={`alert alert-${paymentMessage.type === 'success' ? 'success' : 'warning'} alert-dismissible fade show`}
                                role="alert"
                                style={{ marginBottom: '20px' }}
                            >
                                <strong>
                                    {paymentMessage.type === 'success' ? '✅ ' : '⚠️ '}
                                </strong>
                                {paymentMessage.text}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setPaymentMessage(null)}
                                    aria-label="Close"
                                ></button>
                            </div>
                        </div>
                    </div>
                )}
                
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