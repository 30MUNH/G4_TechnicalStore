import React from 'react';
import styles from './OrderManagement.module.css';
import { Eye, Trash2 } from 'lucide-react';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Đang xử lý': return styles.badgeProcessing;
    case 'Đang giao': return styles.badgeShipping;
    case 'Đã giao': return styles.badgeDelivered;
    case 'Đã hủy': return styles.badgeCancelled;
    default: return styles.badge;
  }
};

const OrderTable = ({
  orders = [],
  role = 'admin',
  onStatusChange,
  onDelete,
  onViewDetail,
  pagination = {},
  onPageChange,
  filters = {},
  onFilterChange,
  loading = false
}) => {
  // Các options trạng thái cho admin và shipper
  const getStatusOptions = (currentStatus) => {
    if (role === 'shipper') {
      if (currentStatus === 'Đang xử lý') return ['Đang giao', 'Đã hủy'];
      if (currentStatus === 'Đang giao') return ['Đã giao', 'Đã hủy'];
      return [];
    }
    return ['Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeader}>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Địa chỉ giao</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr className={styles.tableRow}><td className={styles.tableCell} colSpan={7}>Không có đơn hàng nào</td></tr>
          ) : orders.map(order => {
            const statusOptions = getStatusOptions(order.status);
            return (
              <tr key={order.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{order.id}</td>
                <td className={styles.tableCell}>{order.customer?.name || order.customer?.username}</td>
                <td className={styles.tableCell}>{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                <td className={styles.tableCell}>{order.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td className={styles.tableCell}>
                  <span className={styles.badge + ' ' + getStatusBadgeClass(order.status)}>
                    {(role === 'shipper' || role === 'admin' || role === 'staff') ? (
                      <select
                        value={order.status}
                        onChange={e => onStatusChange(order.id, e.target.value)}
                        disabled={role === 'shipper' && statusOptions.length === 0}
                        style={{ minWidth: 110 }}
                      >
                        <option value={order.status}>{order.status}</option>
                        {statusOptions
                          .filter(opt => opt !== order.status)
                          .map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                      </select>
                    ) : order.status}
                  </span>
                </td>
                <td className={styles.tableCell}>{order.shippingAddress}</td>
                <td className={styles.tableCell}>
                  <button className={styles.actionButton + ' ' + styles.actionView} title="Xem chi tiết" onClick={() => onViewDetail && onViewDetail(order)}><Eye size={18} /></button>
                  {(role === 'admin' || role === 'staff') && (
                    <button className={styles.actionButton + ' ' + styles.actionDelete} title="Xóa" onClick={() => onDelete && onDelete(order.id)}><Trash2 size={18} /></button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.paginationButton} onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page === 1}>Trước</button>
          <span>Trang {pagination.page} / {pagination.totalPages}</span>
          <button className={styles.paginationButton} onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}>Sau</button>
        </div>
      )}
      {loading && <div className={styles.loadingContainer}><span className={styles.loadingText}>Đang tải...</span></div>}
    </div>
  );
};

export default OrderTable; 