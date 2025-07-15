import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { provinces, loading: provincesLoading, error: provincesError } = useVietnamProvinces();
    

    
    // Early return for invalid props
    if (!cartItems || !Array.isArray(cartItems)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>⚠️ Cart data error</h3>
                <p>Cart data is invalid. Please try again.</p>
                <button 
                    onClick={() => onBackToCart && onBackToCart()}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to cart
                </button>
            </div>
        );
    }
    

    
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
    const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to Cash on Delivery

    // Notification function
    const showNotification = (message, type = "info") => {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#22c55e';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }

        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4700);
    };

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

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.fullName || !formData.phone || !formData.email || 
            !formData.address || !formData.city || !formData.ward || !formData.commune) {
            showNotification('⚠️ Please fill in all shipping information', 'warning');
            return;
        }
        
        if (!paymentMethod) {
            showNotification('⚠️ Please select payment method (COD or VNPay)', 'warning');
            return;
        }
        
        if (paymentMethod === 'vnpay') {
            // VNPay payment flow - chuyển hướng đến trang VNPay
            const orderData = {
                ...formData,
                paymentMethod: paymentMethod,
                paymentProvider: 'vnpay'
            };
            
            // Chuyển hướng đến trang VNPay payment với order data
            navigate('/vnpay-payment', {
                state: {
                    orderData: orderData,
                    totalAmount: totalAmount,
                    cartItems: cartItems
                }
            });
        } else {
            // COD payment flow
            const orderData = {
                ...formData,
                paymentMethod: paymentMethod
            };
            onPlaceOrder(orderData);
        }
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(amount)
                .replace('₫', 'đ');
        } catch (error) {
            return `${amount || 0} VND`;
        }
    };

    try {
        return (
        <div className={styles.checkoutContainer}>
            <div className={styles.checkoutHeader}>
                <h1>
                    Payment
                    <span className={styles.itemCount}>({cartItems.length} products)</span>
                </h1>
                <button onClick={onBackToCart} className={styles.backButton}>
                    <ArrowLeftIcon />
                    Back to cart
                </button>
            </div>

            <div className={styles.checkoutContent}>
                <div className={styles.orderDetails}>
                    <div className={styles.orderItems}>
                        <h2>Your order</h2>
                        {cartItems.map((item, index) => {
                            // Safe data extraction with fallbacks
                            const itemName = item.product?.name || item.name || `Product ${index + 1}`;
                            const itemPrice = item.product?.price ;
                            const itemCategory = item.product?.category?.name || item.product?.category || item.category || 'Product';
                            const itemQuantity = item.quantity || 1;
                            
                            // Try multiple image sources
                            const imageUrl = 
                                (item.product?.images && item.product.images.length > 0 && item.product.images[0]?.url) ||
                                item.product?.image ||
                                item.product?.imageUrl ||
                                item.image ||
                                item.imageUrl;

                            return (
                                <div key={item.id || `item-${index}`} className={styles.orderItem}>
                                    <div className={styles.leftSection}>
                                        {imageUrl ? (
                                            <img 
                                                src={imageUrl} 
                                                alt={itemName}
                                                className={styles.itemImage}
                                                onError={(e) => {
                                                    e.target.src = '/img/pc.png';
                                                }}
                                            />
                                        ) : (
                                            <div className={`${styles.itemImage} ${styles.imagePlaceholder}`}>
                                                <span>📦</span>
                                            </div>
                                        )}
                                        <div className={styles.itemQuantity}>
                                            <span>Số lượng: {itemQuantity}</span>
                                        </div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <h3>{itemName}</h3>
                                        <p className={styles.itemCategory}>{itemCategory}</p>
                                    </div>
                                    <div className={styles.itemTotal}>
                                        {formatCurrency(itemPrice * itemQuantity)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.shippingForm}>
                        <h2>Customer information</h2>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">Full name *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone number *</label>
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
                            <h2>Shipping address</h2>

                        <div className={styles.formGroup}>
                            <label htmlFor="address">Address *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="House number, street name"
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="city">Province/City *</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={selectedProvince}
                                    onChange={handleProvinceChange}
                                    required
                                    disabled={provincesLoading}
                                >
                                    <option value="">Select province/city</option>
                                    {Object.keys(provinces).map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                                {provincesLoading && <small>Loading data...</small>}
                                {provincesError && <small style={{color: 'red'}}>Error: {provincesError}</small>}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="ward">District/County *</label>
                                <select
                                    id="ward"
                                    name="ward"
                                    value={selectedDistrict}
                                    onChange={handleDistrictChange}
                                    required
                                    disabled={!selectedProvince || availableDistricts.length === 0}
                                >
                                    <option value="">Select district/county</option>
                                    {availableDistricts.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="commune">Ward/Commune *</label>
                            <select
                                id="commune"
                                name="commune"
                                value={formData.commune}
                                onChange={handleWardChange}
                                required
                                disabled={!selectedDistrict || availableWards.length === 0}
                            >
                                <option value="">Select ward/commune</option>
                                {availableWards.map(ward => (
                                    <option key={ward} value={ward}>{ward}</option>
                                ))}
                            </select>
                        </div>


                        </div>
                    </form>
                </div>

                <div className={styles.orderSummary}>
                    <h2>Order summary</h2>
                    <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal ({cartItems.length} products)</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping fee</span>
                            <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.total}`}>
                            <span>Total</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    <div className={styles.paymentSectionSummary}>
                        <h3>Payment method</h3>
                        
                        <div className={styles.paymentMethodsCompact}>
                            <div className={styles.paymentOptionCompact}>
                                <input
                                    type="radio"
                                    id="cod-summary"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={handlePaymentMethodChange}
                                    className={styles.paymentRadio}
                                />
                                <label htmlFor="cod-summary" className={styles.paymentLabelCompact}>
                                    <div className={styles.paymentIconCompact}>💰</div>
                                    <div className={styles.paymentInfoCompact}>
                                        <span className={styles.paymentTitle}>COD</span>
                                        <span className={styles.paymentDesc}>Cash on delivery</span>    
                                    </div>
                                </label>
                            </div>

                            <div className={styles.paymentOptionCompact}>
                                <input
                                    type="radio"
                                    id="vnpay-summary"
                                    name="paymentMethod"
                                    value="vnpay"
                                    checked={paymentMethod === 'vnpay'}
                                    onChange={handlePaymentMethodChange}
                                    className={styles.paymentRadio}
                                />
                                <label htmlFor="vnpay-summary" className={styles.paymentLabelCompact}>
                                    <div className={styles.paymentIconCompact}>💳</div>
                                    <div className={styles.paymentInfoCompact}>
                                        <span className={styles.paymentTitle}>VNPay</span>
                                        <span className={styles.paymentDesc}>Online payment</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        

                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="button"
                        className={`${styles.placeOrderButton} ${paymentMethod === 'vnpay' ? styles.vnpayButton : styles.codButton}`}
                        onClick={handleSubmit}
                        disabled={cartItems.length === 0 || isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 
                         paymentMethod === 'vnpay' ? 
                         `💳 Payment VNPay • ${formatCurrency(totalAmount)}` : 
                         `💰 Order COD • ${formatCurrency(totalAmount)}`}
                    </button>

                    {totalAmount > 1000000 && shippingFee === 0 && (
                        <p className={styles.shippingPromo}>
                            Free shipping for orders over 1.000.000đ
                        </p>
                    )}
                </div>
            </div>
        </div>
        );
    } catch (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>⚠️ Error displaying payment page</h3>
                <p>An error occurred while displaying the payment page. Please try again.</p>
                <p style={{ color: 'red', fontSize: '14px' }}>{error.message}</p>
                <button 
                    onClick={() => {
                        window.location.reload();
                    }}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    🔄 Reload page
                </button>
                <button 
                    onClick={() => onBackToCart && onBackToCart()}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to cart
                </button>
            </div>
        );
    }
};

export default CheckoutForm;
