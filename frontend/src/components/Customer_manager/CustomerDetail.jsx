import React from 'react';
import PropTypes from 'prop-types';
import { X, Edit3, User, Phone, Calendar } from 'lucide-react';
import styles from './styles/CustomerDetail.module.css';
import commonStyles from './styles/common.module.css';

const CustomerDetail = ({ customer, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Chi tiết khách hàng</h2>
          <div className={styles.actions}>
            <button onClick={onClose} className={styles.closeButton}>
              <X className={styles.closeIcon} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.customerHeader}>
            <div className={styles.customerAvatar}>
              <span>?</span>
            </div>
            <div className={styles.customerInfo}>
              <h3 className={styles.customerName}>
                {customer.phone}
              </h3>
              <span className={customer.isRegistered ? commonStyles.badgeSuccess : commonStyles.badgeInactive}>
                {customer.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Thông tin liên hệ</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <Phone className={styles.fieldIcon} />
                  Số điện thoại
                </div>
                <div className={styles.fieldValue}>{customer.phone}</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <Calendar className={styles.fieldIcon} />
                  Ngày tạo
                </div>
                <div className={styles.fieldValue}>
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <User className={styles.fieldIcon} />
                  Vai trò
                </div>
                <div className={styles.fieldValue}>
                  <span className={commonStyles.badge}>
                    {customer.role?.name || 'Customer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {customer.customerOrders && customer.customerOrders.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Đơn hàng gần đây</h4>
              <div className={styles.ordersList}>
                {customer.customerOrders.map(order => (
                  <div key={order.id} className={styles.orderItem}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>#{order.id}</span>
                      <span className={styles.orderDate}>
                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <span className={`${styles.orderStatus} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

CustomerDetail.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    isRegistered: PropTypes.bool.isRequired,
    role: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired
    }),
    customerOrders: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        orderDate: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired
      })
    ),
    createdAt: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default CustomerDetail; 