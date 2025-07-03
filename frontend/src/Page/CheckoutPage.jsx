import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import CheckoutForm from '../components/Cart/CheckoutForm';
import Header from '../components/header';
import Footer from '../components/footer';
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
            <>
                <Header />
                <div style={{ 
                    minHeight: '60vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <h3>Loading checkout...</h3>
                </div>
                <Footer />
            </>
        );
    }

    // Show error state
    if (error) {
        return (
            <>
                <Header />
                <div style={{ 
                    minHeight: '60vh', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center' 
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
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="checkout-page">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="checkout-form-section">
                                <h2>Checkout Information</h2>
                                {orderError && (
                                    <div className="alert alert-danger">
                                        {orderError}
                                    </div>
                                )}
                                <CheckoutForm 
                                    onSubmit={handleOrderSubmit}
                                    loading={submitting}
                                />
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="order-summary">
                                <h3>Order Summary</h3>
                                
                                <div className="order-items">
                                    {items.map(item => (
                                        <div key={item.id} className="order-item">
                                            <div className="item-image">
                                                <img 
                                                    src={item.product.url || '/img/product-placeholder.png'} 
                                                    alt={item.product.name}
                                                    onError={(e) => {
                                                        e.target.src = '/img/product-placeholder.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.product.name}</h4>
                                                <p>Quantity: {item.quantity}</p>
                                                <p>Price: {formatCurrency(item.product.price)}</p>
                                            </div>
                                            <div className="item-total">
                                                {formatCurrency(item.product.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-totals">
                                    <div className="summary-row">
                                        <span>Total Amount:</span>
                                        <strong>{formatCurrency(totalAmount)}</strong>
                                    </div>
                                </div>

                                <div className="checkout-note">
                                    <p>* Final tax and shipping costs will be calculated based on your location and shipping method.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage; 