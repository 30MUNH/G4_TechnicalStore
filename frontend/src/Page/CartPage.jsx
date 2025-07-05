import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartView from '../components/Cart/CartView';
import { OrderHistory } from '../components/Cart/OrderHistory';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
    const navigate = useNavigate();
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [orders, setOrders] = useState([]);

    const [orderError, setOrderError] = useState(null);
    const { isAuthenticated } = useAuth();
    const { 
        items, 
        totalAmount, 
        loading, 
        error, 
        isInitialized,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        refreshCart
    } = useCart();

    const handleViewOrderHistory = async () => {
        setShowOrderHistory(true);
        setOrderError(null);
        
        // Check authentication first
        console.log('🔐 Auth check before loading orders:', {
            isAuthenticated: isAuthenticated(),
            hasToken: !!localStorage.getItem('authToken'),
            username: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.username : 'none'
        });
        
        if (!isAuthenticated()) {
            setOrderError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
            return;
        }
        
        try {
            console.log('📤 Calling orderService.getOrders()...');
            const response = await orderService.getOrders();
            console.log('📋 Order history RAW response:', response);
            console.log('📋 Response structure:', {
                hasData: !!response.data,
                dataType: typeof response.data,
                dataKeys: response.data ? Object.keys(response.data) : [],
                nestedData: response.data?.data,
                nestedDataType: typeof response.data?.data,
                nestedDataLength: Array.isArray(response.data?.data) ? response.data.data.length : 'not array'
            });
            
            // ResponseInterceptor wraps: { success: true, data: { data: orders.orders } }
            const orders = response.data?.data || [];
            console.log('📋 Final orders array:', orders, 'Length:', orders.length);
            setOrders(orders);
        } catch (err) {
            console.error('❌ Failed to load order history:', err);
            setOrderError(err.message || 'Failed to load order history');
        }
    };

    const handleBackToCart = () => {
        setShowOrderHistory(false);
        setOrderError(null);
    };

    // Handlers for CartView
    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            const currentItem = items.find(item => item.product.id === productId);
            if (!currentItem) return;

            // If new quantity is 0 or less, remove item
            if (newQuantity <= 0) {
                await handleRemoveItem(productId);
                return;
            }

            const difference = newQuantity - currentItem.quantity;
            
            if (difference > 0) {
                await increaseQuantity(productId, difference);
            } else if (difference < 0) {
                await decreaseQuantity(productId, Math.abs(difference));
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeItem(productId);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleCheckout = () => {
        if (transformedCartItems.length === 0) {
            alert('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.');
            return;
        }
        navigate('/checkout');
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    // Transform cart items to match CartView expected format - with fallback for empty/undefined items
    const transformedCartItems = (items || []).map(item => ({
        id: item.product?.id || item.id, // Use product ID for cart operations
        name: item.product?.name || 'Unknown Product',
        price: item.product?.price || 0,
        quantity: item.quantity || 1,
        category: item.product?.category?.name || 'Product', // Extract name from category object
        image: item.product?.url || '/img/product01.png'
    }));

    const subtotal = totalAmount || 0;
    const shippingFee = subtotal > 1000000 ? 0 : 30000; // Free shipping over 1M VND
    const finalTotal = subtotal + shippingFee;

    // Add cart-page-active class to body to remove main-content padding
    useEffect(() => {
        document.body.classList.add('cart-page-active');
        return () => {
            document.body.classList.remove('cart-page-active');
        };
    }, []);

    // Check authentication but don't block rendering
    useEffect(() => {
        if (!isAuthenticated()) {
            console.log('🔐 Not authenticated on cart page, user will see empty cart');
            // Don't redirect immediately - let them see the page
        }
    }, [isAuthenticated]);

    // Remove loading screen - just show cart immediately

    // Show error state
    if (error) {
        return (
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
                    <OrderHistory 
                        orders={orders} 
                        onBackToCart={handleBackToCart} 
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '80vh', paddingTop: '20px', paddingBottom: '20px' }}>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <CartView 
                            cartItems={transformedCartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                            onCheckout={handleCheckout}
                            onViewOrderHistory={handleViewOrderHistory}
                            onContinueShopping={handleContinueShopping}
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            totalAmount={finalTotal}
                        />
                    </div>
                </div>
            </div>


        </div>
    );
};

export default CartPage; 