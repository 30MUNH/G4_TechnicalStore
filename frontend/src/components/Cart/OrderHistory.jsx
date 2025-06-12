import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const getStatusIcon = (status) => {
    switch (status) {
        case 'pending':
            return <Clock className="status-icon" />;
        case 'processing':
            return <Package className="status-icon" />;
        case 'shipped':
            return <Truck className="status-icon" />;
        case 'delivered':
            return <CheckCircle className="status-icon" />;
        case 'cancelled':
            return <XCircle className="status-icon" />;
        default:
            return <Clock className="status-icon" />;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'processing':
            return 'status-processing';
        case 'shipped':
            return 'status-shipped';
        case 'delivered':
            return 'status-delivered';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return 'status-default';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'pending':
            return 'Chờ xử lý';
        case 'processing':
            return 'Đang xử lý';
        case 'shipped':
            return 'Đang giao';
        case 'delivered':
            return 'Đã giao';
        case 'cancelled':
            return 'Đã hủy';
        default:
            return 'Không xác định';
    }
};

export const OrderHistory = ({ orders = [] }) => {
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    const toggleOrderDetails = (orderId) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    if (orders.length === 0) {
        return (
            <div className="order-history">
                <div className="empty-orders">
                    <Package className="empty-icon" />
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history">
            {orders.map((order) => (
                <div key={order.id} className="order-card-compact">
                    {/* Compact Order Summary */}
                    <div className="order-summary-compact">
                        <div className="order-main-info">
                            <div className="order-title-compact">
                                <h4>#{order.id}</h4>
                                <span className={`order-status-compact ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div className="order-meta-compact">
                                <span className="order-date-compact">
                                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                </span>
                                <span className="item-count-compact">
                                    {order.items.length} sản phẩm
                                </span>
                            </div>
                        </div>

                        <div className="order-right-info">
                            <div className="total-amount-compact">{order.total.toLocaleString()}đ</div>
                            <button
                                className="btn-details"
                                onClick={() => toggleOrderDetails(order.id)}
                            >
                                {expandedOrders.has(order.id) ? (
                                    <>
                                        Ẩn <ChevronUp size={16} />
                                    </>
                                ) : (
                                    <>
                                        Chi tiết <ChevronDown size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedOrders.has(order.id) && (
                        <div className="order-details-expanded">
                            <div className="order-items-expanded">
                                <h5>Sản phẩm đã đặt:</h5>
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item-expanded">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="item-image-expanded"
                                        />
                                        <div className="item-details-expanded">
                                            <p className="item-name-expanded">{item.product.name}</p>
                                            <p className="item-quantity-expanded">
                                                Số lượng: {item.quantity} × {item.product.price.toLocaleString()}đ
                                            </p>
                                        </div>
                                        <div className="item-total-expanded">
                                            {(item.product.price * item.quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-info-expanded">
                                <div className="info-section">
                                    <h5>Thông tin giao hàng:</h5>
                                    <p><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
                                    <p><strong>Thanh toán:</strong> {order.paymentMethod}</p>
                                    {order.trackingNumber && (
                                        <p><strong>Mã vận đơn:</strong> <span className="tracking-code">{order.trackingNumber}</span></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}; 