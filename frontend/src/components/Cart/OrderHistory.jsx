import React, { useState } from 'react';
import styles from './CartView.module.css'; // Use the same CSS module as CartView
import { formatDateTime } from '../../utils/dateFormatter';
import { useInvoiceExport } from '../../Hook/useInvoiceExport';
import { useOrders } from '../../Hook/useOrders';

export const OrderHistory = ({ 
    orders, 
    onBackToCart,
    onOrderUpdate 
}) => {
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const { exportToPDF } = useInvoiceExport();
    const { cancelOrder } = useOrders();

    // Notification function
    const showNotification = (message, type = "info") => {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#22c55e';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4700);
    };

    // Validate props
    if (!Array.isArray(orders)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>⚠️ Lỗi dữ liệu đơn hàng</h3>
                <p>Dữ liệu đơn hàng không hợp lệ. Vui lòng thử lại.</p>
                <button onClick={onBackToCart} style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    ← Quay lại giỏ hàng
                </button>
            </div>
        );
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
        if (!status) return '#6b7280'; // Gray for null/undefined
        
        switch (status) {
            case 'Đang chờ':
                return '#f59e0b'; // Amber - Waiting
            case 'Đang xử lý':
                return '#3b82f6'; // Blue - Processing
            case 'Đang giao':
                return '#8b5cf6'; // Purple - Shipping
            case 'Đã giao':
                return '#059669'; // Green - Delivered
            case 'Đã hủy':
                return '#ef4444'; // Red - Cancelled
            // Fallback for English values (backward compatibility)
            case 'processing':
                return '#3b82f6'; // Blue
            case 'shipped':
            case 'shipping':
                return '#8b5cf6'; // Purple
            case 'delivered':
                return '#059669'; // Green
            case 'cancelled':
                return '#ef4444'; // Red
            default:
                return '#6b7280'; // Gray
        }
    };

    const formatDate = (dateString) => {
        try {
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            const formatted = new Date(dateString).toLocaleDateString('vi-VN', options);
            return formatted;
        } catch (error) {
            return dateString || 'N/A';
        }
    };

    const formatCurrency = (amount) => {
        try {
            const formatted = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount).replace('₫', 'đ');
            return formatted;
        } catch (error) {
            return `${amount || 0} VND`;
        }
    };

    const handleBackToCart = () => {
        if (typeof onBackToCart === 'function') {
            onBackToCart();
        }
    };

    const handleCancelOrder = (orderId) => {
        setSelectedOrderId(orderId);
        setShowCancelModal(true);
        setCancelReason('');
    };

    const handleCancelConfirm = async () => {
        if (!selectedOrderId || !cancelReason.trim()) {
            showNotification('⚠️ Vui lòng nhập lý do hủy đơn hàng', 'warning');
            return;
        }

        try {
            // Call API to cancel order
            await cancelOrder(selectedOrderId, cancelReason);
            
            // Update local state immediately
            if (onOrderUpdate) {
                onOrderUpdate((prevOrders) => 
                    prevOrders.map(order => 
                        order.id === selectedOrderId 
                            ? { ...order, status: 'Đã hủy', cancelReason: cancelReason }
                            : order
                    )
                );
            }
            
            showNotification('✅ Đã hủy đơn hàng thành công!', 'success');
            
            // Close modal and reset states
            setShowCancelModal(false);
            setSelectedOrderId(null);
            setCancelReason('');
            
        } catch (error) {
            console.error('Cancel order error:', error);
            
            // Handle specific error cases
            if (error.message?.includes('account_locked')) {
                showNotification('⚠️ Tài khoản của bạn đã bị khóa do hủy quá nhiều đơn hàng. Vui lòng liên hệ hỗ trợ.', 'error');
            } else if (error.message?.includes('order_cannot_cancel')) {
                showNotification('❌ Không thể hủy đơn hàng này do đã qua thời gian cho phép.', 'error');
            } else {
                showNotification('❌ Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleCancelClose = () => {
        setShowCancelModal(false);
        setSelectedOrderId(null);
        setCancelReason('');
    };

    // Check if order can be cancelled (only pending and processing orders)
    const canCancelOrder = (status) => {
        return status === 'Đang chờ' || status === 'Đang xử lý' ;
    };

    return (
        <div className={styles.cartView}>
            <div className={styles.cartHeader}>
                <h1>
                    📋 Lịch sử đơn hàng
                    <span className={styles.itemCount}>({orders.length} đơn hàng hiện tại)</span>
                </h1>
                <button onClick={handleBackToCart} className={styles.historyButton}>
                    ← Quay lại giỏ hàng
                </button>
            </div>





            {orders.length === 0 ? (
                <div className={styles.emptyCart}>
                    <h2>🛒 Chưa có đơn hàng nào</h2>
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
                                            
                                                                        {/* Cancel Order Button - show for cancellable orders only */}
                            {canCancelOrder(order.status) && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    style={{
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#dc2626';
                                                        e.target.style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#ef4444';
                                                        e.target.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    ❌ Hủy đơn
                                                </button>
                                            )}
                                            
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
                            <strong>Số sản phẩm:</strong> {(order.orderDetails && Array.isArray(order.orderDetails)) ? order.orderDetails.length : 0}
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#059669', textAlign: 'right' }}>
                            <strong>Tổng tiền:</strong> {formatCurrency(
                                order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0
                                    ? order.orderDetails.reduce((sum, item) => {
                                        return sum + ((item.price || 0) * (item.quantity || 0));
                                    }, 0)
                                    : parseFloat(order.totalAmount) || 0
                            )}
                        </div>
                                    </div>

                                    {/* Expanded Order Details */}
                                    {isExpanded && (
                                        <div style={{ 
                                            opacity: 1,
                                            transition: 'opacity 0.3s ease-in-out',
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
                                                                                        {order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0 ? (
                                            order.orderDetails.map((item, index) => (
                                                        <div key={item.id || index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '1rem',
                                                            borderBottom: index < order.orderDetails.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                            backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                                                            borderRadius: '0.5rem',
                                                            marginBottom: '0.5rem'
                                                        }}>
                                                            {item.product?.images && item.product.images.length > 0 ? (
                                                                <img
                                                                    src={item.product.images[0].url}
                                                                    alt={item.product?.name || 'Sản phẩm'}
                                                                    style={{
                                                                        width: '80px',
                                                                        height: '80px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px',
                                                                        marginRight: '1.5rem'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.src = '/img/pc.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    backgroundColor: '#f3f4f6',
                                                                    borderRadius: '8px',
                                                                    marginRight: '1.5rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: '#6b7280',
                                                                    fontSize: '12px',
                                                                    border: '2px dashed #d1d5db'
                                                                }}>
                                                                    📦
                                                                </div>
                                                            )}
                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '600', textAlign: 'left' }}>
                                                                    {item.product?.name || 'Sản phẩm không xác định'}
                                                                </h4>
                                                                <p style={{ margin: '0 0 0.25rem 0', color: '#6b7280', fontSize: '1rem', textAlign: 'left' }}>
                                                                    {item.product?.category?.name || 'Chưa phân loại'}
                                                                </p>
                                                                <p style={{ margin: 0, color: '#059669', fontSize: '1.1rem', fontWeight: '600', textAlign: 'left' }}>
                                                                    {formatCurrency(item.price || 0)}
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
                                                                    <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{item.quantity || 0}</span>
                                                                </div>
                                                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                                                    <span style={{ display: 'block', color: '#6b7280', fontSize: '1rem' }}>Thành tiền</span>
                                                                    <span style={{ fontWeight: '700', fontSize: '1.2rem', color: '#dc2626' }}>
                                                                        {formatCurrency((item.price || 0) * (item.quantity || 0))}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{
                                                        padding: '2rem',
                                                        textAlign: 'center',
                                                        backgroundColor: '#f8fafc',
                                                        borderRadius: '0.75rem',
                                                        border: '2px dashed #e2e8f0'
                                                    }}>
                                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                                                        <h4 style={{ 
                                                            color: '#6b7280', 
                                                            marginBottom: '0.5rem',
                                                            fontSize: '1.2rem'
                                                        }}>
                                                            Không có chi tiết sản phẩm
                                                        </h4>
                                                    </div>
                                                )}
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
                                                        // Tính subtotal từ orderDetails, fallback to totalAmount
                                                        const hasOrderDetails = order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0;
                                                        const subtotal = hasOrderDetails 
                                                            ? order.orderDetails.reduce((sum, item) => {
                                                                return sum + ((item.price || 0) * (item.quantity || 0));
                                                            }, 0)
                                                            : parseFloat(order.totalAmount) || 0;

                                                        const shippingFee = 0; // Miễn phí vận chuyển
                                                        const total = subtotal + shippingFee;

                                                        return (
                                                            <>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>
                                                                        {hasOrderDetails 
                                                                            ? `Tạm tính (${order.orderDetails.length} sản phẩm):`
                                                                            : 'Tạm tính:'
                                                                        }
                                                                    </span>
                                                                    <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Phí vận chuyển:</span>
                                                                    <span style={{ fontWeight: '600', color: '#059669' }}>Miễn phí</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '1.1rem' }}>
                                                                    <span>Hình thức thanh toán:</span>
                                                                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                                                                        {order.paymentMethod || 'Chưa cập nhật'}
                                                                    </span>
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

                                                {/* Export Invoice Button - show for confirmed orders (not cancelled) */}
                                                {order.status !== 'cancelled' && (
                                                    <div style={{
                                                        marginTop: '1.5rem',
                                                        display: 'flex',
                                                        justifyContent: 'flex-end'
                                                    }}>
                                                        <button
                                                            onClick={() => exportToPDF(order)}
                                                            style={{
                                                                backgroundColor: '#059669',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.75rem 1.5rem',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '1rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#047857';
                                                                e.target.style.transform = 'translateY(-1px)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = '#059669';
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        >
                                                            📄 Xuất hóa đơn
                                                        </button>
                                                    </div>
                                                )}

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

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        animation: 'modalSlideIn 0.3s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <h3 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1f2937'
                            }}>
                                Xác nhận hủy đơn hàng
                            </h3>
                        </div>
                        
                        <p style={{
                            margin: '0 0 20px 0',
                            color: '#6b7280',
                            fontSize: '16px',
                            lineHeight: '1.5'
                        }}>
                            Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrderId}? Vui lòng cho biết lý do hủy:
                        </p>
                        
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy đơn hàng..."
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '12px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                resize: 'vertical',
                                outline: 'none',
                                marginBottom: '24px',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                            }}
                        />
                        
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={handleCancelClose}
                                style={{
                                    padding: '12px 24px',
                                    border: '2px solid #e2e8f0',
                                    backgroundColor: 'white',
                                    color: '#6b7280',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f9fafb';
                                    e.target.style.borderColor = '#d1d5db';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.borderColor = '#e2e8f0';
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#ef4444';
                                }}
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}; 