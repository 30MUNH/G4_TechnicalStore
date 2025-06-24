import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import styles from './ShipperForm.module.css';

// Local data definitions
const vehicleTypes = [
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
  { value: 'truck', label: 'Xe tải' }
];

const statusOptions = [
  { value: 'Active', label: 'Đi làm' },
  { value: 'Inactive', label: 'Nghỉ' }
];

const ShipperForm = ({
  formData,
  mode,
  onFormDataChange,
  onSave,
  onCancel
}) => {
  const isViewMode = mode === 'view';
  
  const handleInputChange = (field, value) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleWorkingAreasChange = (value) => {
    // Convert comma-separated string to array
    const areas = value.split(',').map(area => area.trim()).filter(area => area.length > 0);
    handleInputChange('workingAreas', areas);
  };

  return (
    <div className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mã nhân viên *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.employeeId || ''}
            onChange={(e) => handleInputChange('employeeId', e.target.value)}
            disabled={isViewMode}
            placeholder="VD: SH001"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Họ và tên *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.fullname || ''}
            onChange={(e) => handleInputChange('fullname', e.target.value)}
            disabled={isViewMode}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Số điện thoại</label>
          <input
            type="tel"
            className={styles.input}
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={isViewMode}
            placeholder="VD: 0901234567"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Số bằng lái *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.licenseNumber || ''}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            disabled={isViewMode}
            placeholder="VD: B1-123456"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Loại xe *</label>
          <select
            className={styles.select}
            value={formData.vehicleType || 'motorbike'}
            onChange={(e) => handleInputChange('vehicleType', e.target.value)}
            disabled={isViewMode}
          >
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Biển số xe *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.vehiclePlate || ''}
            onChange={(e) => handleInputChange('vehiclePlate', e.target.value)}
            disabled={isViewMode}
            placeholder="VD: 29H1-12345"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trạng thái</label>
          <select
            className={styles.select}
            value={formData.status || 'Active'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            disabled={isViewMode}
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày bắt đầu</label>
          <input
            type="date"
            className={styles.input}
            value={formData.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            disabled={isViewMode}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Khu vực làm việc</label>
        <input
          type="text"
          className={styles.input}
          value={(formData.workingAreas || []).join(', ')}
          onChange={(e) => handleWorkingAreasChange(e.target.value)}
          disabled={isViewMode}
          placeholder="VD: láng hạ, thanh xuân, hoàng mai"
        />

      </div>

      {mode === 'view' && (
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Đánh giá</span>
            <span className={styles.statValue}>{formData.rating?.toFixed(1) || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Tổng giao hàng</span>
            <span className={styles.statValue}>{formData.totalDeliveries || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Trạng thái hoạt động</span>
            <span className={styles.statValue}>
              {formData.isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>
        </div>
      )}

      <div className={styles.formActions}>
        {!isViewMode && (
          <button
            type="button"
            onClick={onSave}
            className={`${styles.button} ${styles.primaryButton}`}
          >
            {mode === 'add' ? 'Thêm' : 'Cập nhật'}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          {isViewMode ? 'Đóng' : 'Hủy'}
        </button>
      </div>
    </div>
  );
};

export default ShipperForm; 