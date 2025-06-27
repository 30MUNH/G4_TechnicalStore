import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Save } from 'lucide-react';
import styles from './styles/CustomerEdit.module.css';
import commonStyles from './styles/common.module.css';

const CustomerEdit = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: customer.firstName,
    email: customer.email,
    phone: customer.phone,
    dateOfBirth: customer.dateOfBirth || '',
    gender: customer.gender || 'male',
    status: customer.status,
    role: customer.role || 'staff',
    notes: customer.notes || '',
    createdAt: customer.createdAt || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate name length
    if (formData.firstName.length > 50) {
      newErrors.firstName = 'Tên không được quá 50 ký tự';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (formData.email.length > 50) {
      newErrors.email = 'Email không được quá 50 ký tự';
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 số';
    }

    // Validate date of birth
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    if (dob > today) {
      newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
    }

    // Validate created date
    const createdDate = new Date(formData.createdAt);
    if (createdDate > today) {
      newErrors.createdAt = 'Ngày tạo không thể là ngày trong tương lai';
    }

    // Validate notes
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Ghi chú không được quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...customer,
        ...formData
      });
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {customer.id ? 'Chỉnh sửa thông tin' : 'Thêm nhân viên mới'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>Tên</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                required
                maxLength={50}
              />
              {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                required
                maxLength={50}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                required
                pattern="[0-9]{10,11}"
              />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.label}>Ngày sinh</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`${styles.input} ${errors.dateOfBirth ? styles.inputError : ''}`}
              />
              {errors.dateOfBirth && <span className={styles.errorText}>{errors.dateOfBirth}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="createdAt" className={styles.label}>Ngày tạo</label>
              <input
                type="date"
                id="createdAt"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                className={`${styles.input} ${errors.createdAt ? styles.inputError : ''}`}
                required
              />
              {errors.createdAt && <span className={styles.errorText}>{errors.createdAt}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gender" className={styles.label}>Giới tính</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.label}>Vai trò</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="shipper">Shipper</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="working">Đang làm việc</option>
                <option value="off">Nghỉ việc</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label htmlFor="notes" className={styles.label}>Ghi chú</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.notes ? styles.inputError : ''}`}
                rows={3}
                maxLength={500}
              />
              {errors.notes && <span className={styles.errorText}>{errors.notes}</span>}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={commonStyles.buttonSecondary}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={commonStyles.buttonPrimary}
            >
              <Save className={commonStyles.icon} />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CustomerEdit.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    status: PropTypes.string,
    dateOfBirth: PropTypes.string,
    gender: PropTypes.string,
    role: PropTypes.string,
    notes: PropTypes.string,
    createdAt: PropTypes.string
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CustomerEdit; 