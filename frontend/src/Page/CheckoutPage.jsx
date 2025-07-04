import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import CheckoutForm from '../components/Cart/CheckoutForm';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { items, totalAmount, loading, error, isInitialized } = useCart();
    const [orderData, setOrderData] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (isInitialized && !isAuthenticated()) {
            navigate('/login', {
                state: {
                    returnUrl: '/checkout',
                    message: 'Please login to proceed with checkout'
                }
            });
        }
    }, [isAuthenticated, isInitialized, navigate]);

    // Redirect if cart is empty
    useEffect(() => {
        if (isInitialized && (!items || items.length === 0)) {
            navigate('/cart', {
                state: {
                    message: 'Your cart is empty. Add some products to checkout.'
                }
            });
        }
    }, [items, isInitialized, navigate]);

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
            console.log('📤 Submitting order:', {
                cartItems: items.length,
                totalAmount: totalAmount,
                orderData: formData
            });

            const orderRequest = {
                customerInfo: formData,
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                totalAmount: totalAmount
            };

            const response = await orderService.createOrder(orderRequest);
            
            console.log('✅ Order created successfully:', response);
            setOrderData(response);

            // Navigate to success page
            navigate('/order-success', {
                state: { orderData: response }
            });

        } catch (error) {
            console.error('❌ Order submission failed:', error);
            setOrderError(error.message || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading while checking authentication
    if (!isInitialized || loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}>
                <h3>Loading checkout...</h3>
            </div>
        );
    }

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