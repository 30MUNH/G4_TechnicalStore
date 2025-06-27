import React from 'react';
import styles from './ShipperForm.module.css';

const vehicleTypes = [
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
  { value: 'truck', label: 'Xe tải' }
];

const statusOptions = [
  { value: 'delivering', label: 'Đang giao' },
  { value: 'preparing', label: 'Chuẩn bị hàng' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' }
];



const ShipperForm = ({ mode = 'add', initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = React.useState({
    orderId: '',
    shipperName: '',
    vehicleType: '',
    status: '',
    area: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    rating: 0,
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
          <label htmlFor="orderId">Mã đơn</label>
          <input
            id="orderId"
            type="text"
            value={formData.orderId}
            onChange={(e) => handleChange('orderId', e.target.value)}
            disabled={isViewMode}
            placeholder="VD: DH001"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="shipperName">Tên shipper</label>
          <input
            id="shipperName"
            type="text"
            value={formData.shipperName}
            onChange={(e) => handleChange('shipperName', e.target.value)}
            disabled={isViewMode}
            placeholder="Nhập tên shipper"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="vehicleType">Phương tiện</label>
          <select
            id="vehicleType"
            value={formData.vehicleType}
            onChange={(e) => handleChange('vehicleType', e.target.value)}
            disabled={isViewMode}
            required
          >
            <option value="">Chọn loại phương tiện</option>
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="status">Trạng thái</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            disabled={isViewMode}
            required
          >
            <option value="">Chọn trạng thái</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="area">Khu vực</label>
          <input
            id="area"
            type="text"
            value={formData.area}
            onChange={(e) => handleChange('area', e.target.value)}
            disabled={isViewMode}
            placeholder="Nhập khu vực giao hàng"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="deliveryDate">Ngày giao hàng</label>
          <input
            id="deliveryDate"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => handleChange('deliveryDate', e.target.value)}
            disabled={isViewMode}
            required
          />
        </div>

        {isViewMode && (
          <div className={styles.formGroup}>
            <label>Đánh giá</label>
            <div className={styles.viewOnly}>
              <div className={styles.rating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`${styles.star} ${
                      star <= (formData.rating || 0) ? styles.starFilled : styles.starEmpty
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className={styles.ratingText}>
                  {(formData.rating || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        {!isViewMode && (
          <button type="submit" className={styles.primaryButton}>
            {mode === 'add' ? 'Thêm' : 'Lưu'}
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