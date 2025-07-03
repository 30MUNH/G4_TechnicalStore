import React, { useState } from 'react';
import styles from './CheckoutForm.module.css';
import { useVietnamProvinces } from '../../Hook/useVietnamProvinces';

// SVG Icons (placeholders)
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
    </svg>
);

const GeoAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
    </svg>
);

const CheckoutForm = ({ cartItems, subtotal, shippingFee, totalAmount, onPlaceOrder, onBackToCart, isProcessing = false, error = null }) => {
    const { provinces, loading: provincesLoading, error: provincesError } = useVietnamProvinces();
    
    // Debug provinces data
    React.useEffect(() => {
        console.log('🌍 Provinces loading:', provincesLoading);
        console.log('🌍 Provinces error:', provincesError);
        console.log('🌍 Provinces data:', Object.keys(provinces).length, 'provinces loaded');
        if (Object.keys(provinces).length > 0) {
            console.log('🌍 Sample province:', Object.keys(provinces)[0], provinces[Object.keys(provinces)[0]]);
        }
    }, [provinces, provincesLoading, provincesError]);
    
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        ward: '',
        commune: ''
    });

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProvinceChange = (e) => {
        const provinceName = e.target.value;
        setSelectedProvince(provinceName);
        setSelectedDistrict('');
        setFormData(prev => ({ ...prev, city: provinceName, ward: '', commune: '' }));
        
        if (provinces[provinceName]) {
            setAvailableDistricts(Object.keys(provinces[provinceName]));
            setAvailableWards([]);
        } else {
            setAvailableDistricts([]);
            setAvailableWards([]);
        }
    };

    const handleDistrictChange = (e) => {
        const districtName = e.target.value;
        setSelectedDistrict(districtName);
        setFormData(prev => ({ ...prev, ward: districtName, commune: '' }));
        
        if (provinces[selectedProvince] && provinces[selectedProvince][districtName]) {
            setAvailableWards(provinces[selectedProvince][districtName]);
        } else {
            setAvailableWards([]);
        }
    };

    const handleWardChange = (e) => {
        const wardName = e.target.value;
        setFormData(prev => ({ ...prev, commune: wardName }));
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
                    <ArrowLeftIcon />
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

                        <div className={styles.addressSection}>
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
                                    value={selectedProvince}
                                    onChange={handleProvinceChange}
                                    required
                                    disabled={provincesLoading}
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {Object.keys(provinces).map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                                {provincesLoading && <small>Đang tải dữ liệu địa chính...</small>}
                                {provincesError && <small style={{color: 'red'}}>Lỗi: {provincesError}</small>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="ward">Quận/Huyện *</label>
                                <select
                                    id="ward"
                                    name="ward"
                                    value={selectedDistrict}
                                    onChange={handleDistrictChange}
                                    required
                                    disabled={!selectedProvince || availableDistricts.length === 0}
                                >
                                    <option value="">Chọn quận/huyện</option>
                                    {availableDistricts.map(district => (
                                        <option key={district} value={district}>{district}</option>
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
                                onChange={handleWardChange}
                                required
                                disabled={!selectedDistrict || availableWards.length === 0}
                            >
                                <option value="">Chọn phường/xã</option>
                                {availableWards.map(ward => (
                                    <option key={ward} value={ward}>{ward}</option>
                                ))}
                            </select>
                        </div>
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
