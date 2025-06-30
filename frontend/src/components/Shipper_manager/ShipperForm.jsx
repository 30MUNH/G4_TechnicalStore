import React from 'react';
import styles from './ShipperForm.module.css';

// Removed vehicle types and status options as they're not needed for shipper account management



const ShipperForm = ({ mode = 'add', initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    ...initialData
  });

  const isViewMode = mode === 'view';

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            disabled={isViewMode}
            placeholder="Nhập tên đăng nhập"
            required
          />
        </div>

        {(mode === 'add' || !isViewMode) && (
          <div className={styles.formGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isViewMode}
              placeholder="Nhập mật khẩu"
              required={mode === 'add'}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="fullName">Họ và tên</label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            disabled={isViewMode}
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Số điện thoại</label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={isViewMode}
            placeholder="Nhập số điện thoại"
            required
          />
        </div>

        {isViewMode && (
          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <div className={styles.viewOnly}>
              <span className={styles.statusBadge}>
                {formData.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        {!isViewMode && (
          <button type="submit" className={styles.primaryButton}>
            {mode === 'add' ? 'Thêm Shipper' : 'Cập nhật'}
          </button>
        )}
        <button type="button" onClick={onCancel} className={styles.secondaryButton}>
          {isViewMode ? 'Đóng' : 'Hủy'}
        </button>
      </div>
    </form>
  );
};

export default ShipperForm; 