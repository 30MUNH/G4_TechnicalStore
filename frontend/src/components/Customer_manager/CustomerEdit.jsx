import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, Save } from 'lucide-react';
import styles from '../styles/CustomerEdit.module.css';
import commonStyles from '../styles/common.module.css';

const CustomerEdit = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    role: customer.role || 'user'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};


    const fullNameLength = (formData.firstName + formData.lastName).length;
    if (fullNameLength > 15) {
      newErrors.firstName = 'Độ dài họ và tên quá dài';
      newErrors.lastName = 'Độ dài họ và tên quá dài';
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (formData.email.length > 50) {
      newErrors.email = 'Email không được quá 50 ký tự';
    }


    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    

    if (name === 'firstName' || name === 'lastName') {
      const otherField = name === 'firstName' ? 'lastName' : 'firstName';
      const totalLength = (name === 'firstName' ? value + formData[otherField] : formData[otherField] + value).length;
      
      if (totalLength > 15) {
        setErrors(prev => ({
          ...prev,
          firstName: 'Độ dài họ và tên quá dài',
          lastName: 'Độ dài họ và tên quá dài'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          firstName: '',
          lastName: ''
        }));
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


    if (errors[name] && (name === 'email' || name === 'phone')) {
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
          <h2 className={styles.title}>Chỉnh sửa khách hàng</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>Họ</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                required
                maxLength={30}
              />
              {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Tên</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                required
                maxLength={30}
              />
              {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
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
              <label htmlFor="status" className={styles.label}>Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="Active">Đang hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
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
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="shipper">Shipper</option>
              </select>
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
    id: PropTypes.number,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    role: PropTypes.string
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CustomerEdit; 