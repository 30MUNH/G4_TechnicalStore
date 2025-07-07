import React, { useState } from 'react';
import styles from './CartView.module.css'; // Use the same CSS module as CartView

export const OrderHistory = ({ orders, onBackToCart }) => {
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    
    console.log('📋 OrderHistory Debug - Component rendered with props:', {
        ordersCount: orders?.length,
        orders,
        onBackToCart: typeof onBackToCart
    });

    // Validate props
    if (!Array.isArray(orders)) {
        console.error('❌ OrderHistory Debug - orders is not an array:', orders);
        return <div>Error: Invalid orders data</div>;
    }

    const toggleOrderDetails = (orderId) => {
        const newExpandedOrders = new Set(expandedOrders);
        if (newExpandedOrders.has(orderId)) {
            newExpandedOrders.delete(orderId);
        } else {
            newExpandedOrders.add(orderId);
        }
        setExpandedOrders(newExpandedOrders);
    };

    const getStatusColor = (status) => {
        console.log('🎨 OrderHistory Debug - Getting status color for:', status);
        switch (status?.toLowerCase()) {
            case 'pending':
                return '#f59e0b'; // Amber
            case 'processing':
                return '#3b82f6'; // Blue
            case 'shipped':
                return '#10b981'; // Emerald
            case 'delivered':
                return '#059669'; // Green
            case 'cancelled':
                return '#ef4444'; // Red
            default:
                console.warn('⚠️ OrderHistory Debug - Unknown status:', status);
                return '#6b7280'; // Gray
        }
    };

    const formatDate = (dateString) => {
        console.log('📅 OrderHistory Debug - Formatting date:', dateString);
        try {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const formatted = new Date(dateString).toLocaleDateString('vi-VN', options);
            console.log('📅 OrderHistory Debug - Date formatted:', { original: dateString, formatted });
            return formatted;
        } catch (error) {
            console.error('❌ OrderHistory Debug - Date formatting error:', error, { dateString });
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        console.log('💰 OrderHistory Debug - Formatting currency:', { amount, type: typeof amount });
        try {
            const formatted = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount).replace('₫', 'đ');
            return formatted;
        } catch (error) {
            console.error('❌ OrderHistory Debug - Currency formatting error:', error, { amount });
            return `${amount} VND`;
        }
    };

    const handleBackToCart = () => {
        console.log('🔙 OrderHistory Debug - Back to cart clicked');
        if (typeof onBackToCart === 'function') {
            onBackToCart();
        } else {
            console.error('❌ OrderHistory Debug - onBackToCart is not a function:', typeof onBackToCart);
        }
    };

    return (
        <div className={styles.cartView}>
            <div className={styles.cartHeader}>
                <h1>
                    📋 Lịch sử đơn hàng
                    <span className={styles.itemCount}>({orders.length} đơn hàng)</span>
                </h1>
                <button onClick={handleBackToCart} className={styles.historyButton}>
                    ← Quay lại giỏ hàng
                </button>
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyCart}>
                    <h2>Chưa có đơn hàng nào</h2>
                    <p>Bạn chưa có đơn hàng nào trong lịch sử. Hãy mua sắm và đặt hàng nhé!</p>
                    <button onClick={handleBackToCart} className={styles.continueShoppingButton}>
                        🛒 Quay lại giỏ hàng
                    </button>
                </div>
            ) : (
                <div style={{
                    padding: '40px 20px 40px 40px',
                    marginTop: '40px',
                    width: '100%',
                    marginLeft: '0',
                    marginRight: '0'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px',
                        alignItems: 'stretch',
                        maxWidth: '1300px'
                    }}>
                        {orders.map((order) => {
                            console.log('📦 OrderHistory Debug - Rendering order:', order);
                            
                            // Validate order data
                            if (!order.id) {
                                console.error('❌ OrderHistory Debug - Order missing ID:', order);
                            }
                            if (!order.orderDate) {
                                console.error('❌ OrderHistory Debug - Order missing orderDate:', order);
                            }
                            if (!order.status) {
                                console.error('❌ OrderHistory Debug - Order missing status:', order);
                            }
                            if (!Array.isArray(order.orderDetails)) {
                                console.warn('⚠️ OrderHistory Debug - Order details is not an array:', order.orderDetails);
                            }

                            const isExpanded = expandedOrders.has(order.id);

                            return (
                                <div key={order.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '32px',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                                    width: '100%',
                                    transition: 'all 0.3s ease',
                                    border: '2px solid #f1f5f9'
                                }}>
                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '2px solid #e2e8f0',
                                        marginBottom: '1.5rem',
                                        width: '100%'
                                    }}>
                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.4rem', color: '#1f2937', fontWeight: '700', textAlign: 'left' }}>
                                                📦 Đơn hàng #{order.id}
                                            </h3>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem', textAlign: 'left' }}>
                                                📅 Đặt ngày: {formatDateTime(order.orderDate)}
                                            </p>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <span style={{ fontSize: '1rem', color: '#6b7280' }}>Trạng thái:</span>
                                                <span style={{
                                                    backgroundColor: getStatusColor(order.status),
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '1.5rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => toggleOrderDetails(order.id)}
                                                style={{
                                                    backgroundColor: isExpanded ? '#dc2626' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '0.75rem 1.5rem',
                                                    borderRadius: '0.75rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    minWidth: '150px',
                                                    justifyContent: 'center'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            >
                                                {isExpanded ? '🔼 Ẩn chi tiết' : '🔽 Chi tiết đơn hàng'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Summary Preview (always visible) */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.2rem',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '0.75rem',
                                        marginBottom: isExpanded ? '1.5rem' : '0'
                                    }}>
                                        <div style={{ fontSize: '1.2rem', color: '#4b5563', textAlign: 'left' }}>
                                            <strong>Số sản phẩm:</strong> {order.orderDetails?.length || 0}
                                        </div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>
                                            <strong>Tổng tiền:</strong> {formatCurrency(
                                                order.orderDetails?.reduce((sum, item) => {
                                                    return sum + (item.price * item.quantity);
                                                }, 0) || parseFloat(order.totalAmount) || 0
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Order Details */}
                                    {isExpanded && (
                                        <div style={{ 
                                            animation: 'fadeIn 0.3s ease-in-out',
                                            width: '100%' 
                                        }}>
                                            {/* Order Items */}
                                            <div style={{ width: '100%' }}>
                                                <h4 style={{ 
                                                    fontSize: '1.3rem', 
                                                    color: '#1f2937', 
                                                    marginBottom: '1rem',
                                                    fontWeight: '600',
                                                    textAlign: 'left'
                                                }}>
                                                    📋 Danh sách sản phẩm:
                                                </h4>
                                                {order.orderDetails?.map((item, index) => {
                                                    console.log('📦 OrderHistory Debug - Rendering order detail item:', item);
                                                    
                                                    // Validate item data
                                                    if (!item.id) {
                                                        console.error('❌ OrderHistory Debug - Order detail missing ID:', item);
                                                    }
                                                    if (!item.product) {
                                                        console.error('❌ OrderHistory Debug - Order detail missing product:', item);
                                                    }
                                                    if (typeof item.quantity !== 'number') {
                                                        console.warn('⚠️ OrderHistory Debug - Invalid quantity type:', typeof item.quantity, item);
                                                    }
                                                    if (typeof item.price !== 'number') {
                                                        console.warn('⚠️ OrderHistory Debug - Invalid price type:', typeof item.price, item);
                                                    }

                                                    return (
                                                        <div key={item.id} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '1rem',
                                                            borderBottom: index < order.orderDetails.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                            backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                                                            borderRadius: '0.5rem',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            <img
                                                                src={item.product?.image || '/img/product01.png'}
                                                                alt={item.product?.name}
                                                                style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    marginRight: '1.5rem'
                                                                }}
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600', textAlign: 'left' }}>
                                                                    {item.product?.name}
                                                                </h4>
                                                                <p style={{ margin: '0 0 0.25rem 0', color: '#6b7280', fontSize: '1rem', textAlign: 'left' }}>
                                                                    {item.product?.category?.name}
                                                                </p>
                                                                <p style={{ margin: 0, color: '#059669', fontSize: '1.1rem', fontWeight: '600', textAlign: 'left' }}>
                                                                    {formatCurrency(item.price)}
                                                                </p>
                                                            </div>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '2rem',
                                                                fontSize: '1.1rem'
                                                            }}>
                                                                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                                                                    <span style={{ display: 'block', color: '#6b7280', fontSize: '1rem' }}>Số lượng</span>
                                                                    <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{item.quantity}</span>
                                                                </div>
                                                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                                                    <span style={{ display: 'block', color: '#6b7280', fontSize: '1rem' }}>Thành tiền</span>
                                                                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#dc2626' }}>
                                                                        {formatCurrency(item.price * item.quantity)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Order Summary */}
                                            <div style={{
                                                marginTop: '2rem',
                                                paddingTop: '1.5rem',
                                                borderTop: '2px solid #e2e8f0',
                                                width: '100%'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.75rem',
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {(() => {
                                                        // Tính subtotal từ orderDetails thay vì dựa vào order.subtotal
                                                        const subtotal = order.orderDetails?.reduce((sum, item) => {
                                                            return sum + (item.price * item.quantity);
                                                        }, 0) || parseFloat(order.totalAmount) || 0;

                                                        const shippingFee = 0; // Miễn phí vận chuyển
                                                        const total = subtotal + shippingFee;

                                                        return (
                                                            <>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Tạm tính ({order.orderDetails?.length || 0} sản phẩm):</span>
                                                                    <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Phí vận chuyển:</span>
                                                                    <span style={{ fontWeight: '600', color: '#059669' }}>Miễn phí</span>
                                                                </div>
                                                                <div style={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between', 
                                                                    padding: '1rem 0', 
                                                                    borderTop: '1px solid #e2e8f0',
                                                                    fontSize: '1.3rem',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    <span>Tổng cộng:</span>
                                                                    <span style={{ color: '#dc2626' }}>{formatCurrency(total)}</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                                {order.shippingAddress && (
                                                    <div style={{
                                                        marginTop: '1.5rem',
                                                        padding: '1.5rem',
                                                        backgroundColor: '#e0f2fe',
                                                        borderRadius: '0.75rem',
                                                        fontSize: '1.2rem',
                                                        fontWeight: 'bold',
                                                        color: '#0c4a6e',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem'
                                                    }}>
                                                        <span style={{fontSize: '1.4rem'}}>📍</span>
                                                        <span>Địa chỉ giao hàng:</span>
                                                        <span style={{fontWeight: 700, fontSize: '1.2rem'}}>{order.shippingAddress}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}; 