import React, { useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaTruck, FaHourglassHalf } from 'react-icons/fa';
import styles from './OrderHistory.module.css';

const OrderStatusBadge = ({ status }) => {
    let icon = <FaHourglassHalf className={`${styles.icon} ${styles.statusIconDefault}`} />;
    let text = status || "Đang xử lý";
    let className = styles.statusDefault;

    if (status === 'Đã giao') {
        icon = <FaCheckCircle className={`${styles.icon} ${styles.statusIconSuccess}`} />;
        className = styles.statusSuccess;
    } else if (status === 'Đang giao') {
        icon = <FaTruck className={`${styles.icon} ${styles.statusIconWarning}`} />;
        className = styles.statusWarning;
    } else if (status === 'Đã hủy') {
        className = styles.statusDanger;
    }
    return <span className={`${styles.orderStatusBadge} ${className}`}>{icon}{text}</span>;
};

const OrderHistory = ({ orders, onBackToCart }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return styles.statusDelivered;
            case 'shipping':
                return styles.statusShipping;
            case 'processing':
                return styles.statusProcessing;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'delivered':
                return 'Đã giao';
            case 'shipping':
                return 'Đang giao';
            case 'processing':
                return 'Đang xử lý';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <div className={styles.orderHistoryPage}>
            <div className={styles.orderHeader}>
                <h1>
                    Lịch sử đơn hàng
                    <span className={styles.orderCount}>({orders.length} đơn hàng)</span>
                </h1>
                <button onClick={onBackToCart} className={styles.backButton}>
                    <FaArrowLeft className={styles.icon} />
                    Quay lại giỏ hàng
                </button>
            </div>

            <div className={styles.orderContent}>
                {orders.length === 0 ? (
                    <div className={styles.noOrders}>
                        <div className={styles.noOrdersIcon}>
                            <FaHourglassHalf />
                        </div>
                        <h2>Chưa có đơn hàng nào</h2>
                        <p>Bạn chưa có đơn hàng nào. Hãy thêm sản phẩm vào giỏ hàng và đặt hàng ngay!</p>
                        <button onClick={onBackToCart} className={styles.continueShoppingButton}>
                            <FaArrowLeft />
                            Quay lại giỏ hàng
                        </button>
                    </div>
                ) : (
                    <div className={styles.orderList}>
                        {orders.map(order => (
                            <div key={order.id} className={styles.orderCard}>
                                <div className={styles.orderCardHeader}>
                                    <div className={styles.orderInfo}>
                                        <h3>Đơn hàng #{order.id}</h3>
                                        <span className={styles.orderDate}>
                                            {formatDate(order.orderDate)}
                                        </span>
                                    </div>
                                    <div className={styles.orderStatus}>
                                        <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <span className={styles.orderTotal}>
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.orderPreview}>
                                    <div className={styles.productImages}>
                                        {order.items.slice(0, 3).map(item => (
                                            <img 
                                                key={item.id} 
                                                src={item.image} 
                                                alt={item.name}
                                                className={styles.productImage} 
                                            />
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className={styles.moreItems}>
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className={styles.detailsButton}
                                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                                    >
                                        {selectedOrder === order.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                                    </button>
                                </div>

                                {selectedOrder === order.id && (
                                    <div className={styles.orderDetails}>
                                        <div className={styles.detailsSection}>
                                            <h4>Chi tiết đơn hàng</h4>
                                            <div className={styles.itemsList}>
                                                {order.items.map(item => (
                                                    <div key={item.id} className={styles.orderItem}>
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            className={styles.itemImage}
                                                        />
                                                        <div className={styles.itemInfo}>
                                                            <h5>{item.name}</h5>
                                                            <p className={styles.itemCategory}>{item.category}</p>
                                                            <div className={styles.itemPriceQuantity}>
                                                                <span>Số lượng: {item.quantity}</span>
                                                                <span>{formatCurrency(item.price)}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.itemTotal}>
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.detailsSection}>
                                            <h4>Thông tin giao hàng</h4>
                                            <div className={styles.shippingInfo}>
                                                <p><strong>Người nhận:</strong> {order.shippingInfo.fullName}</p>
                                                <p><strong>Số điện thoại:</strong> {order.shippingInfo.phone}</p>
                                                <p><strong>Địa chỉ:</strong> {order.shippingInfo.address}</p>
                                                <p><strong>Phường:</strong> {order.shippingInfo.ward}</p>
                                                <p><strong>Xã/Quận:</strong> {order.shippingInfo.commune}</p>
                                                <p><strong>Thành phố:</strong> {order.shippingInfo.city}</p>
                                            </div>
                                        </div>

                                        <div className={styles.detailsSection}>
                                            <h4>Tổng quan đơn hàng</h4>
                                            <div className={styles.orderSummary}>
                                                <div className={styles.summaryRow}>
                                                    <span>Tạm tính:</span>
                                                    <span>{formatCurrency(order.subtotal)}</span>
                                                </div>
                                                <div className={styles.summaryRow}>
                                                    <span>Phí vận chuyển:</span>
                                                    <span>{order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}</span>
                                                </div>
                                                <div className={`${styles.summaryRow} ${styles.total}`}>
                                                    <span>Tổng cộng:</span>
                                                    <span>{formatCurrency(order.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
