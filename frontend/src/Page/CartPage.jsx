import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartView from '../components/Cart/CartView';
import { OrderHistory } from '../components/Cart/OrderHistory';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/header';
import Footer from '../components/footer';

const CartPage = () => {
    const navigate = useNavigate();
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [orders, setOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const { isAuthenticated } = useAuth();
    const { items, totalAmount, loading, error, isInitialized } = useCart();

    const handleViewOrderHistory = async () => {
        setShowOrderHistory(true);
        setOrderLoading(true);
        setOrderError(null);
        
        try {
            const response = await orderService.getOrders();
            setOrders(response.orders || []);
        } catch (err) {
            console.error('Failed to load order history:', err);
            setOrderError(err.message || 'Failed to load order history');
        } finally {
            setOrderLoading(false);
        }
    };

    const handleBackToCart = () => {
        setShowOrderHistory(false);
        setOrderError(null);
    };

    // Add cart-page-active class to body to remove main-content padding
    useEffect(() => {
        document.body.classList.add('cart-page-active');
        return () => {
            document.body.classList.remove('cart-page-active');
        };
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (isInitialized && !isAuthenticated()) {
            navigate('/login', {
                state: {
                    returnUrl: '/cart',
                    message: 'Please login to view your cart'
                }
            });
        }
    }, [isAuthenticated, isInitialized, navigate]);

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
                    <h3>Loading cart...</h3>
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
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    if (showOrderHistory) {
        return (
            <div style={{ margin: 0, padding: 0 }}>
                {/* Header */}
                <nav className="navbar" style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                    padding: '1rem 2rem',
                    boxShadow: '0 4px 20px rgba(30, 41, 59, 0.4)',
                    margin: 0,
                    borderBottom: '2px solid #0ea5e9'
                }}>
                    <div className="container-fluid">
                        <div className="d-flex align-items-center w-100">
                            <div className="text-white">
                                <h1 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem'
                                }}>
                                    <span style={{ fontSize: '1.8rem' }}>📋</span>
                                    Order History
                                </h1>
                                <p style={{
                                    fontSize: '0.9rem',
                                    opacity: '0.8',
                                    margin: 0,
                                    marginTop: '0.2rem',
                                    marginLeft: '3.4rem'
                                }}>
                                    {orders.length === 0 ? 'No orders yet' : `${orders.length} orders`}
                                </p>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="container-fluid px-4 py-4" style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                    minHeight: 'calc(100vh - 80px)'
                }}>
                    {orderError && (
                        <div className="alert alert-danger" role="alert">
                            {orderError}
                        </div>
                    )}
                    {orderLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading order history...</p>
                        </div>
                    ) : (
                        <OrderHistory 
                            orders={orders} 
                            onBackToCart={handleBackToCart} 
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div style={{ minHeight: '80vh', paddingTop: '20px', paddingBottom: '20px' }}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <CartView />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CartPage; 