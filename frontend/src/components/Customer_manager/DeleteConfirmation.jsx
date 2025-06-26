import React from 'react';
import PropTypes from 'prop-types';
import { X, AlertTriangle } from 'lucide-react';
import styles from '../styles/DeleteConfirmation.module.css';
import commonStyles from '../styles/common.module.css';

const DeleteConfirmation = ({ customer, onConfirm, onClose }) => {
  const handleConfirm = () => {
    onConfirm(customer.id);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Xác nhận xóa</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={48} />
          </div>
          <p className={styles.message}>
            Bạn có chắc chắn muốn xóa khách hàng{' '}
            <strong>{customer.firstName} {customer.lastName}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </p>

          <div className={styles.actions}>
            <button
              onClick={onClose}
              className={commonStyles.buttonSecondary}
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className={styles.deleteButton}
            >
              Xóa khách hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmation.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default DeleteConfirmation; 