import React from 'react';
import styles from './CartView.module.css'; // Use the same CSS module as CartView

export const OrderHistory = ({ orders, onBackToCart }) => {
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
                <div className={styles.cartContent}>
                    <div className={styles.cartItems}>
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

                            return (
                                <div key={order.id} className={styles.cartItem} style={{ flexDirection: 'column' }}>
                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingBottom: '1rem',
                                        borderBottom: '1px solid #e2e8f0',
                                        marginBottom: '1rem',
                                        width: '100%'
                                    }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#1f2937' }}>
                                                📦 Đơn hàng #{order.id}
                                            </h3>
                                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                                                📅 Đặt ngày: {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Trạng thái:</span>
                                            <span style={{
                                                backgroundColor: getStatusColor(order.status),
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.8rem',
                                                fontWeight: '500'
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{ width: '100%' }}>
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
                                                    padding: '0.75rem 0',
                                                    borderBottom: index < order.orderDetails.length - 1 ? '1px solid #f3f4f6' : 'none'
                                                }}>
                                                    <img
                                                        src={item.product?.image || '/img/product01.png'}
                                                        alt={item.product?.name}
                                                        className={styles.itemImage}
                                                        style={{ marginRight: '1rem' }}
                                                    />
                                                    <div className={styles.itemDetails} style={{ flex: 1 }}>
                                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                                                            {item.product?.name}
                                                        </h4>
                                                        <p className={styles.itemCategory} style={{ margin: '0 0 0.25rem 0' }}>
                                                            {item.product?.category?.name}
                                                        </p>
                                                        <p className={styles.itemPrice} style={{ margin: 0 }}>
                                                            {formatCurrency(item.price)}
                                                        </p>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        <span>Số lượng: {item.quantity}</span>
                                                        <div className={styles.itemTotal}>
                                                            <span>Thành tiền:</span>
                                                            <span className={styles.totalValue}>
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
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #e2e8f0',
                                        width: '100%'
                                    }}>
                                        <div className={styles.summaryDetails}>
                                            {(() => {
                                                // Tính subtotal từ orderDetails thay vì dựa vào order.subtotal
                                                const subtotal = order.orderDetails?.reduce((sum, item) => {
                                                    return sum + (item.price * item.quantity);
                                                }, 0) || parseFloat(order.totalAmount) || 0;

                                                const shippingFee = 0; // Miễn phí vận chuyển
                                                const total = subtotal + shippingFee;

                                                return (
                                                    <>
                                                        <div className={styles.summaryRow}>
                                                            <span>Tạm tính ({order.orderDetails?.length || 0} sản phẩm):</span>
                                                            <span>{formatCurrency(subtotal)}</span>
                                                        </div>
                                                        <div className={styles.summaryRow}>
                                                            <span>Phí vận chuyển:</span>
                                                            <span>Miễn phí</span>
                                                        </div>
                                                        <div className={`${styles.summaryRow} ${styles.total}`}>
                                                            <span>Tổng cộng:</span>
                                                            <span>{formatCurrency(total)}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {order.shippingAddress && (
                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '1rem',
                                                backgroundColor: '#e0f2fe',
                                                borderRadius: '0.5rem',
                                                fontSize: '1.1rem',
                                                fontWeight: 'bold',
                                                color: '#0c4a6e',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <span style={{fontSize: '1.4rem'}}>📍</span>
                                                <span>Địa chỉ giao hàng:</span>
                                                <span style={{fontWeight: 700, fontSize: '1.15rem'}}>{order.shippingAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}; 