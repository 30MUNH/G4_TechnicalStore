import React from 'react';
import PropTypes from 'prop-types';
import { X, Edit3, User, Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import styles from '../styles/CustomerDetail.module.css';
import commonStyles from '../styles/common.module.css';

const CustomerDetail = ({ customer, onClose, onEdit }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Chi tiết khách hàng</h2>
          <div className={styles.actions}>
            <button
              onClick={() => onEdit(customer)}
              className={commonStyles.buttonSecondary}
            >
              <Edit3 className={commonStyles.icon} />
              Chỉnh sửa
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <X className={styles.closeIcon} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.customerHeader}>
            <div className={styles.customerAvatar}>
              <span>{customer.firstName[0]}{customer.lastName[0]}</span>
            </div>
            <div className={styles.customerInfo}>
              <h3 className={styles.customerName}>
                {customer.firstName} {customer.lastName}
              </h3>
              <span className={customer.status === 'Active' ? commonStyles.badgeSuccess : commonStyles.badgeInactive}>
                {customer.status === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Thông tin liên hệ</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <User className={styles.fieldIcon} />
                  Họ và tên
                </div>
                <div className={styles.fieldValue}>
                  {customer.firstName} {customer.lastName}
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <Mail className={styles.fieldIcon} />
                  Email
                </div>
                <div className={styles.fieldValue}>{customer.email}</div>
              </div>
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
                  Ngày tham gia
                </div>
                <div className={styles.fieldValue}>
                  {new Date(customer.dateJoined).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Thông tin đơn hàng</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <ShoppingBag className={styles.fieldIcon} />
                  Tổng số đơn hàng
                </div>
                <div className={styles.fieldValue}>{customer.totalOrders} đơn hàng</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <DollarSign className={styles.fieldIcon} />
                  Tổng chi tiêu
                </div>
                <div className={styles.fieldValue}>{formatCurrency(customer.totalSpent)}</div>
              </div>
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  <Calendar className={styles.fieldIcon} />
                  Đơn hàng gần nhất
                </div>
                <div className={styles.fieldValue}>
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN')
                    : 'Chưa có'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomerDetail.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    dateJoined: PropTypes.string.isRequired,
    totalOrders: PropTypes.number.isRequired,
    totalSpent: PropTypes.number.isRequired,
    lastOrderDate: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default CustomerDetail; 