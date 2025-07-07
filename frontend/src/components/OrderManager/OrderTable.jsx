import React from 'react';
import { Eye, Edit, Trash2, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './OrderTable.module.css';

const OrderTable = ({
  orders = [],
  currentPage = 1,
  totalPages = 1,
  totalOrders = 0,
  itemsPerPage = 10,
  role = 'admin',
  onView,
  onStatusUpdate,
  onDelete,
  onPageChange
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalOrders);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Đang xử lý': return styles.statusProcessing;
      case 'Đang giao': return styles.statusShipping;
      case 'Đã giao': return styles.statusDelivered;
      case 'Đã hủy': return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Status options for admin and shipper
  const getStatusOptions = (currentStatus) => {
    if (role === 'shipper') {
      if (currentStatus === 'Processing') return ['Shipping', 'Cancelled'];
      if (currentStatus === 'Shipping') return ['Delivered', 'Cancelled'];
      return [];
    }
    return ['Processing', 'Shipping', 'Delivered', 'Cancelled'];
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.headerCell}>ORDER ID</th>
              <th className={styles.headerCell}>CUSTOMER</th>
              <th className={styles.headerCell}>ORDER DATE</th>
              <th className={styles.headerCell}>TOTAL AMOUNT</th>
              <th className={styles.headerCell}>STATUS</th>
              <th className={styles.headerCell}>SHIPPING ADDRESS</th>
              <th className={styles.headerCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {!orders.length ? (
              <tr>
                <td colSpan="7" className={styles.emptyStateCell}>
                  <div className={styles.emptyState}>
                    <ShoppingCart className={styles.emptyIcon} />
                    <h3 className={styles.emptyTitle}>No orders found</h3>
                    <p className={styles.emptyDescription}>
                      No orders in system or no matches with current filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusOptions = getStatusOptions(order.status);
                return (
                  <tr key={order.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.orderId}`}>
                      #{order.id}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.customerInfo}>
                        <div className={styles.avatar}>
                          {(order.customer?.name || order.customer?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.customerName}>
                          {order.customer?.name || order.customer?.username || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`${styles.tableCell} ${styles.orderDate}`}>
                      {formatDate(order.orderDate)}
                    </td>
                    <td className={`${styles.tableCell} ${styles.totalAmount}`}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className={styles.tableCell}>
                      {(role === 'admin' || role === 'staff' || role === 'shipper') && statusOptions.length > 0 ? (
                        <select
                          className={`${styles.statusSelect} ${getStatusClass(order.status)}`}
                          value={order.status}
                          onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                          disabled={role === 'shipper' && statusOptions.length === 0}
                        >
                          <option value={order.status}>{order.status}</option>
                          {statusOptions
                            .filter(opt => opt !== order.status)
                            .map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                      ) : (
                        <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className={`${styles.tableCell} ${styles.shippingAddress}`}>
                      <span className={styles.addressText} title={order.shippingAddress}>
                        {order.shippingAddress?.length > 30 
                          ? `${order.shippingAddress.substring(0, 30)}...` 
                          : order.shippingAddress}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          onClick={() => onView(order)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {(role === 'admin' || role === 'staff') && onDelete && (
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => onDelete(order.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {totalOrders} orders
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.currentPage}>{currentPage}</span>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTable; 