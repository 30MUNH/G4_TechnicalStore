import React from 'react';
import './OrderHistory.module.css';

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
            }).format(amount);
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
        <div className="order-history-container">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <button
                    className="btn"
                    onClick={handleBackToCart}
                    style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        console.log('🖱️ OrderHistory Debug - Back button hover enter');
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(30, 41, 59, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        console.log('🖱️ OrderHistory Debug - Back button hover leave');
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    ← Quay lại giỏ hàng
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem'
                    }}>
                        📋
                    </div>
                    <h3 className="mb-3">Chưa có đơn hàng nào</h3>
                    <p className="text-muted">
                        Bạn chưa có đơn hàng nào trong lịch sử. Hãy mua sắm và đặt hàng nhé!
                    </p>
                </div>
            ) : (
                <div className="row">
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
                            <div key={order.id} className="col-12 mb-4">
                                <div className="card" style={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div className="card-header bg-white" style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        padding: '1rem 1.5rem'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-0">Đơn hàng #{order.id}</h6>
                                                <small className="text-muted">
                                                    Đặt ngày: {formatDate(order.orderDate)}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">Trạng thái:</span>
                                                <span className="badge" style={{
                                                    backgroundColor: getStatusColor(order.status),
                                                    padding: '0.5em 1em',
                                                    fontSize: '0.85em'
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-borderless mb-0">
                                                <thead>
                                                    <tr className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                        <th>Sản phẩm</th>
                                                        <th className="text-center">Số lượng</th>
                                                        <th className="text-end">Giá</th>
                                                        <th className="text-end">Tổng</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.orderDetails?.map((item) => {
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
                                                            <tr key={item.id}>
                                                                <td style={{ maxWidth: '300px' }}>
                                                                    <div className="d-flex align-items-center">
                                                                        {item.product?.image && (
                                                                            <img
                                                                                src={item.product.image}
                                                                                alt={item.product.name}
                                                                                style={{
                                                                                    width: '50px',
                                                                                    height: '50px',
                                                                                    objectFit: 'cover',
                                                                                    borderRadius: '8px',
                                                                                    marginRight: '1rem'
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <div className="fw-medium">{item.product?.name}</div>
                                                                            <small className="text-muted">
                                                                                {item.product?.category?.name}
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center">{item.quantity}</td>
                                                                <td className="text-end">{formatCurrency(item.price)}</td>
                                                                <td className="text-end">{formatCurrency(item.price * item.quantity)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan="3" className="text-end fw-medium">Tạm tính:</td>
                                                        <td className="text-end">{formatCurrency(order.subtotal)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="3" className="text-end fw-medium">Phí vận chuyển:</td>
                                                        <td className="text-end">{formatCurrency(order.shippingFee)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="3" className="text-end fw-medium">Thuế:</td>
                                                        <td className="text-end">{formatCurrency(order.tax)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="3" className="text-end fw-bold">Tổng cộng:</td>
                                                        <td className="text-end fw-bold">{formatCurrency(order.total)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                    {order.note && (
                                        <div className="card-footer bg-white" style={{
                                            borderTop: '1px solid #e2e8f0',
                                            padding: '1rem 1.5rem'
                                        }}>
                                            <strong>Ghi chú:</strong> {order.note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}; 