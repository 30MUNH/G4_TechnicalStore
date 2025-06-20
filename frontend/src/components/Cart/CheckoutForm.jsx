import React, { useState } from 'react';
import { FaUser, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import styles from './CheckoutForm.module.css';
import { useVietnamProvinces } from '../../Hook/useVietnamProvinces.jsx';

const CheckoutForm = ({ cartItems, subtotal, shippingFee, totalAmount, onPlaceOrder, onBackToCart, isProcessing = false, error = null }) => {
    const { provinces, loading, error: provincesError } = useVietnamProvinces();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        ward: '',
        commune: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        
        // Reset dependent fields when parent location changes
        if (name === 'city') {
            setFormData(prev => ({
                ...prev,
                city: value,
                ward: '',
                commune: ''
            }));
        } else if (name === 'ward') {
            setFormData(prev => ({
                ...prev,
                ward: value,
                commune: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Get available options for dropdowns
    const getCityOptions = () => {
        return Object.keys(provinces || {});
    };

    const getWardOptions = () => {
        if (!formData.city || !provinces[formData.city]) return [];
        return Object.keys(provinces[formData.city]);
    };

    const getCommuneOptions = () => {
        if (!formData.city || !formData.ward || !provinces[formData.city]?.[formData.ward]) return [];
        return provinces[formData.city][formData.ward];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
            onPlaceOrder(formData);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'đ');
    };

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.checkoutHeader}>
                <h1>
                    Thanh toán
                    <span className={styles.itemCount}>({cartItems.length} sản phẩm)</span>
                </h1>
                <button onClick={onBackToCart} className={styles.backButton}>
                    <FaArrowLeft />
                    Quay lại giỏ hàng
                </button>
            </div>

            <div className={styles.checkoutContent}>
                <div className={styles.orderDetails}>
                    <div className={styles.orderItems}>
                        <h2>Đơn hàng của bạn</h2>
                        {cartItems.map(item => (
                            <div key={item.id} className={styles.orderItem}>
                                <img src={item.image} alt={item.name} className={styles.itemImage} />
                                <div className={styles.itemInfo}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemCategory}>{item.category}</p>
                                    <div className={styles.itemPriceQuantity}>
                                        <span>Số lượng: {item.quantity}</span>
                                        <span>{formatCurrency(item.price)}</span>
                                    </div>
                                </div>
                                <div className={styles.itemTotal}>
                                    {formatCurrency(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.shippingForm}>
                        <h2>Thông tin khách hàng</h2>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">Họ và tên *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                placeholder="Nhập họ và tên"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Số điện thoại *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="0123 456 789"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                placeholder="email@example.com"
                            />
                        </div>

                        <h2>Địa chỉ giao hàng</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="address">Địa chỉ *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="Số nhà, tên đường"
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="city">Tỉnh/Thành phố *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleLocationChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {getCityOptions().map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                                {loading && <span className={styles.loadingText}>Đang tải...</span>}
                                {provincesError && <span className={styles.errorText}>Lỗi tải dữ liệu</span>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="ward">Quận/Huyện *</label>
                                <select
                                    id="ward"
                                    name="ward"
                                    value={formData.ward}
                                    onChange={handleLocationChange}
                                    required
                                    disabled={!formData.city || loading}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {getWardOptions().map(ward => (
                                        <option key={ward} value={ward}>{ward}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="commune">Phường/Xã *</label>
                            <select
                                id="commune"
                                name="commune"
                                value={formData.commune}
                                onChange={handleLocationChange}
                                required
                                disabled={!formData.ward || loading}
                            >
                                <option value="">Chọn phường/xã</option>
                                {getCommuneOptions().map(commune => (
                                    <option key={commune} value={commune}>{commune}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                <div className={styles.orderSummary}>
                    <h2>Tóm tắt đơn hàng</h2>
                    <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                            <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Phí vận chuyển</span>
                            <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Tổng cộng</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className={styles.placeOrderButton}
                        onClick={handleSubmit}
                        disabled={cartItems.length === 0 || isProcessing}
                    >
                        {isProcessing ? 'Đang xử lý...' : `Đặt hàng • ${formatCurrency(totalAmount)}`}
                    </button>

                    {totalAmount > 1000000 && shippingFee === 0 && (
                        <p className={styles.shippingPromo}>
                            Miễn phí vận chuyển cho đơn hàng trên 1.000.000đ
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;
