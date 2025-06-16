import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { OrderStatus } from '../../types/order';
import './OrderHistory.css';

const getStatusIcon = (status) => {
    switch (status) {
        case OrderStatus.PENDING:
            return <Clock className="status-icon" />;
        case OrderStatus.PROCESSING:
            return <Package className="status-icon" />;
        case OrderStatus.SHIPPING:
            return <Truck className="status-icon" />;
        case OrderStatus.DELIVERED:
            return <CheckCircle className="status-icon" />;
        case OrderStatus.CANCELLED:
            return <XCircle className="status-icon" />;
        default:
            return null;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case OrderStatus.PENDING:
            return 'status-pending';
        case OrderStatus.PROCESSING:
            return 'status-processing';
        case OrderStatus.SHIPPING:
            return 'status-shipped';
        case OrderStatus.DELIVERED:
            return 'status-delivered';
        case OrderStatus.CANCELLED:
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

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await orderService.getOrders();
            if (response.message === "Lấy danh sách đơn hàng thành công") {
                setOrders(response.orders);
            } else {
                throw new Error(response.error || "Không thể lấy danh sách đơn hàng");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus, cancelReason = '') => {
        try {
            setError(null);
            const response = await orderService.updateOrderStatus(orderId, {
                status: newStatus,
                cancelReason
            });
            if (response.message === "Cập nhật trạng thái đơn hàng thành công") {
                // Cập nhật state local
                setOrders(orders.map(order => 
                    order.id === orderId 
                        ? { ...order, status: newStatus, cancelReason } 
                        : order
                ));
            } else {
                throw new Error(response.error || "Không thể cập nhật trạng thái đơn hàng");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    if (loading) {
        return <div className="loading">Đang tải danh sách đơn hàng...</div>;
    }

    if (error) {
        return <div className="error">Lỗi: {error}</div>;
    }

    if (!orders.length) {
        return <div className="empty">Bạn chưa có đơn hàng nào</div>;
    }

    return (
        <div className="order-history">
            <h2>Lịch sử đơn hàng</h2>
            {orders.map((order) => (
                <div key={order.id} className="order-card">
                    <div className="order-header" onClick={() => toggleOrderDetails(order.id)}>
                        <div className="order-summary">
                            <div className="status">
                                {getStatusIcon(order.status)}
                                <span>{order.status}</span>
                            </div>
                            <div className="order-info">
                                <span>Mã đơn: {order.id}</span>
                                <span>Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                                <span>Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                        {expandedOrderId === order.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    
                    {expandedOrderId === order.id && (
                        <div className="order-details">
                            <div className="shipping-info">
                                <h4>Thông tin giao hàng</h4>
                                <p>Địa chỉ: {order.shippingAddress}</p>
                                {order.note && <p>Ghi chú: {order.note}</p>}
                                {order.cancelReason && <p>Lý do hủy: {order.cancelReason}</p>}
                            </div>
                            
                            <div className="products">
                                <h4>Sản phẩm</h4>
                                {order.orderDetails.map((detail) => (
                                    <div key={detail.id} className="product-item">
                                        <img src={detail.product.url} alt={detail.product.name} />
                                        <div className="product-info">
                                            <h5>{detail.product.name}</h5>
                                            <p>Số lượng: {detail.quantity}</p>
                                            <p>Đơn giá: {detail.price.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {order.status === OrderStatus.PENDING && (
                                <div className="actions">
                                    <button 
                                        className="cancel-button"
                                        onClick={() => {
                                            const reason = window.prompt('Nhập lý do hủy đơn hàng:');
                                            if (reason) {
                                                handleStatusUpdate(order.id, OrderStatus.CANCELLED, reason);
                                            }
                                        }}
                                    >
                                        Hủy đơn hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OrderHistory; 