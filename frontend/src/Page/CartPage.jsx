import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartView from '../components/Cart/CartView';
import { OrderHistory } from '../components/Cart/OrderHistory';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';

const CartPage = () => {
    console.log('🛒 CartPage Debug - Component initializing');
    
    const navigate = useNavigate();
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        getFinalTotal,
        getCartTotal,
        getTax,
        getShipping
    } = useCart();

    // Removed cart data debug to prevent console spam - data available via window.authService.debugAuthState()

    // Debug state changes
    useEffect(() => {
        console.log('🛒 CartPage Debug - State changed:', {
            showOrderHistory,
            ordersCount: orders.length,
            loading,
            error
        });
    }, [showOrderHistory, orders, loading, error]);

    const handleQuantityChange = (productId, newQuantity) => {
        console.log('🔄 CartPage Debug - Quantity change requested:', {
            productId,
            newQuantity,
            willRemove: newQuantity <= 0
        });
        
        if (newQuantity <= 0) {
            console.log('🗑️ CartPage Debug - Removing item due to zero quantity');
            removeFromCart(productId);
        } else {
            console.log('🔢 CartPage Debug - Updating quantity');
            updateQuantity(productId, newQuantity);
        }
    };

    const handleProceedToCheckout = () => {
        console.log('💳 CartPage Debug - Proceeding to checkout:', {
            cartItemsCount: cartItems?.length,
            finalTotal: getFinalTotal()
        });
        navigate('/checkout');
    };

    const handleViewOrderHistory = async () => {
        console.log('📋 CartPage Debug - Loading order history');
        setShowOrderHistory(true);
        setLoading(true);
        setError(null);
        
        try {
            console.log('📤 CartPage Debug - Calling orderService.getOrders');
            const response = await orderService.getOrders();
            console.log('📨 CartPage Debug - Order history response:', {
                success: !!response,
                ordersCount: response?.orders?.length || 0,
                orders: response?.orders
            });
            setOrders(response.orders || []);
        } catch (err) {
            console.error('❌ CartPage Debug - Failed to load order history:', err);
            const errorMessage = err.message || 'Không thể tải lịch sử đơn hàng';
            setError(errorMessage);
        } finally {
            console.log('🔄 CartPage Debug - Setting loading to false');
            setLoading(false);
        }
    };

    const handleBackToCart = () => {
        console.log('🔙 CartPage Debug - Going back to cart from order history');
        setShowOrderHistory(false);
        setError(null);
    };

    const handleContinueShopping = () => {
        console.log('🛍️ CartPage Debug - Continuing shopping, navigating to home');
        navigate('/');
    };

    // Add cart-page-active class to body to remove main-content padding
    useEffect(() => {
        console.log('🛒 CartPage Debug - Adding cart-page-active class to body');
        document.body.classList.add('cart-page-active');
        return () => {
            console.log('🧹 CartPage Debug - Removing cart-page-active class from body');
            document.body.classList.remove('cart-page-active');
        };
    }, []);

    // Component mount/unmount debug
    useEffect(() => {
        console.log('🛒 CartPage Debug - Component mounted');
        return () => {
            console.log('🛒 CartPage Debug - Component unmounting');
        };
    }, []);

    if (showOrderHistory) {
        console.log('📋 CartPage Debug - Rendering order history view');
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
                                    Lịch sử đơn hàng
                                </h1>
                                <p style={{
                                    fontSize: '0.9rem',
                                    opacity: '0.8',
                                    margin: 0,
                                    marginTop: '0.2rem',
                                    marginLeft: '3.4rem'
                                }}>
                                    {orders.length === 0 ? 'Chưa có đơn hàng' : `${orders.length} đơn hàng`}
                                </p>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="container-fluid px-4 py-4" style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                    minHeight: 'calc(100vh - 80px)'
                }}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-2">Đang tải lịch sử đơn hàng...</p>
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

    console.log('🛒 CartPage Debug - Rendering main cart view');
    return (
        <div style={{ margin: 0, padding: 0 }}>
            {/* Cart page header */}
            <nav className="navbar navbar-expand-lg" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                padding: '1.2rem 2rem',
                boxShadow: '0 4px 20px rgba(30, 41, 59, 0.4)',
                margin: 0,
                marginTop: 0,
                borderBottom: '2px solid #0ea5e9'
            }}>
                <div className="container-fluid">
                    <div className="navbar-brand text-white d-flex align-items-center">
                        <div className="me-3" style={{
                            fontSize: '2rem',
                            background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '50px',
                            height: '50px'
                        }}>
                            🛒
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0' }}>
                                Tech Store
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                                Giỏ hàng của bạn
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container-fluid px-4 py-4" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                minHeight: 'calc(100vh - 80px)'
            }}>
                <CartView
                    cartItems={cartItems}
                    onUpdateQuantity={handleQuantityChange}
                    onRemoveItem={removeFromCart}
                    onCheckout={handleProceedToCheckout}
                    onViewOrderHistory={handleViewOrderHistory}
                    onContinueShopping={handleContinueShopping}
                    subtotal={getCartTotal()}
                    shippingFee={getShipping()}
                    totalAmount={getFinalTotal()}
                />
            </div>
        </div>
    );
};

export default CartPage; 