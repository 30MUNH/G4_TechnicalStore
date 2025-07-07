import React from 'react';
import styles from './OrderDetailModal.module.css';
import { formatDateTime } from '../../utils/dateFormatter';

const OrderDetailModal = ({ order, open, onClose, onStatusChange, role = 'admin' }) => {
  if (!open || !order) return null;

  // Các trạng thái cho phép chuyển
  const getStatusOptions = (currentStatus) => {
    if (role === 'shipper') {
      if (currentStatus === 'Đang xử lý') return ['Đang giao', 'Đã hủy'];
      if (currentStatus === 'Đang giao') return ['Đã giao', 'Đã hủy'];
      return [];
    }
    return ['Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];
  };

  const statusOptions = getStatusOptions(order.status);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeBtn}>×</button>
        <h3 className={styles.title}>Chi tiết đơn hàng #{order.id}</h3>
        <div className={styles.info}>
          <strong>Khách hàng:</strong> {order.customer?.name || order.customer?.username}<br />
          <strong>Ngày đặt:</strong> {formatDateTime(order.orderDate)}<br />
          <strong>Địa chỉ giao:</strong> {order.shippingAddress}<br />
          <strong>Tổng tiền:</strong> {order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}<br />
          <strong>Trạng thái:</strong> {order.status}<br />
          {order.cancelReason && <><strong>Lý do hủy:</strong> {order.cancelReason}<br /></>}
        </div>
        <div className={styles.products}>
          <strong>Sản phẩm:</strong>
          <ul>
            {order.orderDetails?.map((item, idx) => (
              <li key={idx}>
                {item.product?.name} x {item.quantity} ({item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })})
              </li>
            ))}
          </ul>
        </div>
        {/* Đổi trạng thái */}
        {(role === 'admin' || role === 'staff' || (role === 'shipper' && statusOptions.length > 0)) && (
          <div style={{ marginTop: 16 }}>
            <label><strong>Chuyển trạng thái:</strong></label>
            <select
              className={styles.statusSelect}
              value={order.status}
              onChange={e => onStatusChange(order.id, e.target.value)}
              disabled={role === 'shipper' && statusOptions.length === 0}
            >
              <option value={order.status}>{order.status}</option>
              {statusOptions.filter(opt => opt !== order.status).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal; 