import React from 'react';
import PropTypes from 'prop-types';
import { X, AlertTriangle } from 'lucide-react';
import styles from './styles/DeleteConfirmation.module.css';
import commonStyles from './styles/common.module.css';

const DeleteConfirmation = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button onClick={onCancel} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={48} />
          </div>
          <p className={styles.message}>{message}</p>

          <div className={styles.actions}>
            <button
              onClick={onCancel}
              className={commonStyles.buttonSecondary}
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className={styles.deleteButton}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmation.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default DeleteConfirmation; 