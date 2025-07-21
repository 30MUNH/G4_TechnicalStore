import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutForm.module.css";
import { useVietnamProvinces } from "../../Hook/useVietnamProvinces";
import { orderService } from "../../services/orderService";
import { sendOtpForGuest, verifyOtpForGuest } from "../../services/authService";
import OTPPopup from "../Login/OTPPopup";

// SVG Icons (placeholders)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
  </svg>
);

const GeoAltIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path
      fillRule="evenodd"
      d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
    />
  </svg>
);

const CheckoutForm = ({
  cartItems,
  subtotal,
  shippingFee,
  totalAmount,
  onPlaceOrder,
  onBackToCart,
  isProcessing = false,
  error = null,
  isGuest = false,
}) => {
  const navigate = useNavigate();
  const {
    provinces,
    loading: provincesLoading,
    error: provincesError,
  } = useVietnamProvinces();

  // OTP states for guest verification
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // Clear saved form data when order is successfully placed
  const clearSavedFormData = () => {
    try {
      sessionStorage.removeItem("checkoutFormData");
    } catch (error) {
    }
  };

  // Early return for invalid props
  if (!cartItems || !Array.isArray(cartItems)) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>⚠️ Cart data error</h3>
        <p>Cart data is invalid. Please try again.</p>
        <button
          onClick={() => onBackToCart && onBackToCart()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back to cart
        </button>
      </div>
    );
  }

  // Load saved form data from sessionStorage on component mount
  const getSavedFormData = () => {
    try {
      const saved = sessionStorage.getItem("checkoutFormData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    ward: "",
    commune: "",
  });

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default to Cash on Delivery
  const [isVNPayProcessing, setIsVNPayProcessing] = useState(false); // Local state for VNPAY processing
  const [requireInvoice, setRequireInvoice] = useState(false); // VAT invoice checkbox state

  // Load saved form data on component mount
  React.useEffect(() => {
    const savedData = getSavedFormData();
    if (savedData) {
      setFormData({
        fullName: savedData.fullName || "",
        phone: savedData.phone || "",
        email: savedData.email || "",
        address: savedData.address || "",
        city: savedData.city || "",
        ward: savedData.ward || "",
        commune: savedData.commune || "",
      });
      setSelectedProvince(savedData.city || "");
      setSelectedDistrict(savedData.ward || "");
      setPaymentMethod(savedData.paymentMethod || "cod");
    }
  }, []); // Empty dependency array - only run once on mount

  // Populate districts and wards when component loads with saved data
  React.useEffect(() => {
    if (selectedProvince && provinces[selectedProvince]) {
      setAvailableDistricts(Object.keys(provinces[selectedProvince]));

      if (selectedDistrict && provinces[selectedProvince][selectedDistrict]) {
        setAvailableWards(provinces[selectedProvince][selectedDistrict]);
      }
    }
  }, [provinces, selectedProvince, selectedDistrict]);

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
      case "success":
        notification.style.backgroundColor = "#22c55e";
        break;
      case "error":
        notification.style.backgroundColor = "#ef4444";
        break;
      case "warning":
        notification.style.backgroundColor = "#f59e0b";
        break;
      default:
        notification.style.backgroundColor = "#3b82f6";
    }

    // Add animation keyframes if not already added
    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
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
        notification.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 4700);
  };

  // Save form data to sessionStorage
  const saveFormData = (newFormData) => {
    try {
      const dataToSave = {
        ...newFormData,
        paymentMethod,
      };
      sessionStorage.setItem("checkoutFormData", JSON.stringify(dataToSave));
    } catch (error) {
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
    saveFormData(newFormData);
  };

  const handleProvinceChange = (e) => {
    const provinceName = e.target.value;
    setSelectedProvince(provinceName);
    setSelectedDistrict("");
    const newFormData = {
      ...formData,
      city: provinceName,
      ward: "",
      commune: "",
    };
    setFormData(newFormData);
    saveFormData(newFormData);

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
    const newFormData = { ...formData, ward: districtName, commune: "" };
    setFormData(newFormData);
    saveFormData(newFormData);

    if (
      provinces[selectedProvince] &&
      provinces[selectedProvince][districtName]
    ) {
      setAvailableWards(provinces[selectedProvince][districtName]);
    } else {
      setAvailableWards([]);
    }
  };

  const handleWardChange = (e) => {
    const wardName = e.target.value;
    const newFormData = { ...formData, commune: wardName };
    setFormData(newFormData);
    saveFormData(newFormData);
  };

  const handlePaymentMethodChange = (e) => {
    const newPaymentMethod = e.target.value;
    setPaymentMethod(newPaymentMethod);
    saveFormData({ ...formData, paymentMethod: newPaymentMethod });
  };

  // OTP handling functions for guest users
  const handleSendOtpForGuest = async () => {
    try {
      const result = await sendOtpForGuest(formData.phone);
      if (result.success) {
        setShowOtpPopup(true);
        setOtpError('');
        showNotification("📱 OTP sent to your phone number", "success");
      } else {
        showNotification(result.message || "Failed to send OTP", "error");
      }
    } catch (error) {
      showNotification("Failed to send OTP. Please try again.", "error");
    }
  };

  const handleVerifyOtpForGuest = async (otpCode) => {
    try {
      const result = await verifyOtpForGuest(formData.phone, otpCode);
      if (result.success) {
        setOtpVerified(true);
        setShowOtpPopup(false);
        setOtpError('');
        showNotification("✅ Phone number verified successfully!", "success");
        
        // If we have pending order data, proceed with order creation
        if (pendingOrderData) {
          processOrder(pendingOrderData);
        }
      } else {
        setOtpError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    }
  };

  const processOrder = (orderData) => {
    if (paymentMethod === "vnpay") {
      // VNPay payment flow - create order first, then redirect to VNPay
      setIsVNPayProcessing(true);

      // Create order request with proper structure
      const orderRequest = {
        shippingAddress: orderData.shippingAddress,
        note: [
          `Khách hàng: ${orderData.fullName.trim()}`,
          `Số điện thoại: ${orderData.phone.trim()}`,
          `Email: ${orderData.email.trim()}`,
          `Số lượng sản phẩm: ${cartItems.length}`,
          `Total amount: ${formatCurrency(requireInvoice ? totalAmount + (subtotal * 0.1) : totalAmount)}`,
          requireInvoice ? "VAT Invoice Requested" : "No Invoice Required",
          "Phone Verified" // Add verification flag
        ].join(" | "),
        paymentMethod: orderData.paymentMethod,
        requireInvoice: requireInvoice,
        isGuest: isGuest,
        ...(isGuest ? {
          guestInfo: {
            fullName: orderData.fullName.trim(),
            phone: orderData.phone.trim(),
            email: orderData.email.trim()
          },
          guestCartItems: cartItems.map(item => ({
            productId: item.product?.id || item.id,
            quantity: item.quantity || 1,
            price: item.product?.price || item.price || 0,
            name: item.product?.name || item.name || 'Unknown Product'
          }))
        } : {})
      };

      // Create order first, then redirect to VNPay
      orderService
        .createOrder(orderRequest)
        .then((response) => {
          // Get the order data with ID
          const orderData = response.data?.id
            ? response.data
            : response.data?.data;
          if (!orderData?.id) {
            showNotification(
              "Order creation failed - no order ID received",
              "error"
            );
            setIsVNPayProcessing(false);
            return;
          }

          // Navigate to VNPay payment page with the real order object
          navigate("/vnpay-payment", {
            state: {
              orderData: orderData,
              totalAmount: totalAmount,
              cartItems: cartItems,
            },
          });
        })
        .catch((error) => {
          showNotification(error.message || "Order creation failed", "error");
          setIsVNPayProcessing(false);
        });
    } else {
      // COD payment flow - pass order data to parent component
      // Clear saved form data when order is placed
      clearSavedFormData();
      onPlaceOrder(orderData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.fullName?.trim() ||
      !formData.phone?.trim() ||
      !formData.email?.trim() ||
      !formData.address?.trim() ||
      !formData.city?.trim() ||
      !formData.ward?.trim() ||
      !formData.commune?.trim()
    ) {
      showNotification("⚠️ Please fill in all shipping information", "warning");
      return;
    }

    // Validate field lengths
    if (formData.fullName.trim().length > 100) {
      showNotification("⚠️ Full name cannot exceed 100 characters", "warning");
      return;
    }

    if (formData.address.trim().length > 200) {
      showNotification("⚠️ Address cannot exceed 200 characters", "warning");
      return;
    }

    // Validate phone format (Vietnamese phone number)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      showNotification("⚠️ Please enter a valid phone number (10-11 digits)", "warning");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showNotification("⚠️ Please enter a valid email address", "warning");
      return;
    }

    if (!paymentMethod) {
      showNotification(
        "⚠️ Please select payment method (COD or VNPay)",
        "warning"
      );
      return;
    }

    // Build the full address
    const fullAddress = [
      formData.address.trim(),
      formData.commune.trim(),
      formData.ward.trim(),
      formData.city.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    // Map frontend payment method to backend expected values
    const backendPaymentMethod = paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment';

    // Create order data with proper structure
    const orderData = {
      ...formData,
      paymentMethod: backendPaymentMethod, // Use mapped payment method
      requireInvoice: requireInvoice,
      shippingAddress: fullAddress, // Add explicit shipping address
      isGuest: isGuest, // Pass guest flag
    };

    // For guest users, require OTP verification before processing order
    if (isGuest && !otpVerified) {
      // Store order data for later processing after OTP verification
      setPendingOrderData(orderData);
      // Send OTP to guest's phone number
      handleSendOtpForGuest();
      return;
    }

    // Process order (either authenticated user or OTP-verified guest)
    processOrder(orderData);
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      })
        .format(amount)
        .replace("₫", "đ");
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
            <span className={styles.itemCount}>
              ({cartItems.length} products)
            </span>
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
                const itemName =
                  item.product?.name || item.name || `Product ${index + 1}`;
                const itemPrice = item.product?.price;
                const itemCategory =
                  item.product?.category?.name ||
                  item.product?.category ||
                  item.category ||
                  "Product";
                const itemQuantity = item.quantity || 1;

                // Try multiple image sources
                const imageUrl =
                  (item.product?.images &&
                    item.product.images.length > 0 &&
                    item.product.images[0]?.url) ||
                  item.product?.image ||
                  item.product?.imageUrl ||
                  item.image ||
                  item.imageUrl;

                return (
                  <div
                    key={item.id || `item-${index}`}
                    className={styles.orderItem}
                  >
                    <div className={styles.leftSection}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={itemName}
                          className={styles.itemImage}
                          onError={(e) => {
                            e.target.src = "/img/pc.png";
                          }}
                        />
                      ) : (
                        <div
                          className={`${styles.itemImage} ${styles.imagePlaceholder}`}
                        >
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
              
              {isGuest && (
                <div className={styles.guestNotification}>
                  <div className={styles.guestNotificationIcon}>ℹ️</div>
                  <div className={styles.guestNotificationText}>
                    <strong>Bạn đang đặt hàng dưới dạng khách.</strong>
                    <br />
                    Đơn hàng sẽ không hiển thị trong tài khoản. Bạn có thể tạo tài khoản sau để theo dõi đơn hàng dễ dàng hơn.
                  </div>
                </div>
              )}

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
                      {Object.keys(provinces).map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {provincesLoading && <small>Loading data...</small>}
                    {provincesError && (
                      <small style={{ color: "red" }}>
                        Error: {provincesError}
                      </small>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ward">District/County *</label>
                    <select
                      id="ward"
                      name="ward"
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      required
                      disabled={
                        !selectedProvince || availableDistricts.length === 0
                      }
                    >
                      <option value="">Select district/county</option>
                      {availableDistricts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
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
                    {availableWards.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
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
                <span>
                  {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
                </span>
              </div>
              
              {/* VAT Invoice Checkbox */}
              <div className={styles.vatInvoiceSection}>
                <label className={styles.vatInvoiceLabel}>
                  <input
                    type="checkbox"
                    checked={requireInvoice}
                    onChange={(e) => setRequireInvoice(e.target.checked)}
                    className={styles.vatInvoiceCheckbox}
                  />
                  <span className={styles.vatInvoiceText}>
                    Export VAT invoice (10%)
                  </span>
                </label>
              </div>

              {/* VAT Row - only show when checkbox is checked */}
              {requireInvoice && (
                <div className={styles.summaryRow}>
                  <span>VAT (10%)</span>
                  <span>{formatCurrency(subtotal * 0.1)}</span>
                </div>
              )}

              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>{formatCurrency(requireInvoice ? totalAmount + (subtotal * 0.1) : totalAmount)}</span>
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
                    checked={paymentMethod === "cod"}
                    onChange={handlePaymentMethodChange}
                    className={styles.paymentRadio}
                  />
                  <label
                    htmlFor="cod-summary"
                    className={styles.paymentLabelCompact}
                  >
                    <div className={styles.paymentIconCompact}>💰</div>
                    <div className={styles.paymentInfoCompact}>
                      <span className={styles.paymentTitle}>COD</span>
                      <span className={styles.paymentDesc}>
                        Cash on delivery
                      </span>
                    </div>
                  </label>
                </div>

                <div className={styles.paymentOptionCompact}>
                  <input
                    type="radio"
                    id="vnpay-summary"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={handlePaymentMethodChange}
                    className={styles.paymentRadio}
                  />
                  <label
                    htmlFor="vnpay-summary"
                    className={styles.paymentLabelCompact}
                  >
                    <div className={styles.paymentIconCompact}>💳</div>
                    <div className={styles.paymentInfoCompact}>
                      <span className={styles.paymentTitle}>VNPay</span>
                      <span className={styles.paymentDesc}>Online payment</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="button"
              className={`${styles.placeOrderButton} ${
                paymentMethod === "vnpay"
                  ? styles.vnpayButton
                  : styles.codButton
              }`}
              onClick={handleSubmit}
              disabled={
                cartItems.length === 0 || isProcessing || isVNPayProcessing
              }
            >
              {isProcessing || isVNPayProcessing
                ? "Processing..."
                : paymentMethod === "vnpay"
                ? `💳 Payment VNPay • ${formatCurrency(totalAmount)}`
                : `💰 Order COD • ${formatCurrency(totalAmount)}`}
            </button>

            {totalAmount > 1000000 && shippingFee === 0 && (
              <p className={styles.shippingPromo}>
                Free shipping for orders over 1.000.000đ
              </p>
            )}
          </div>
        </div>

        {/* OTP Popup for guest verification */}
        <OTPPopup
          isOpen={showOtpPopup}
          onClose={() => {
            setShowOtpPopup(false);
            setOtpError('');
            setPendingOrderData(null);
          }}
          onVerify={handleVerifyOtpForGuest}
          onResend={handleSendOtpForGuest}
          error={otpError}
        />
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h3>⚠️ Error displaying payment page</h3>
        <p>
          An error occurred while displaying the payment page. Please try again.
        </p>
        <p style={{ color: "red", fontSize: "14px" }}>{error.message}</p>
        <button
          onClick={() => {
            window.location.reload();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔄 Reload page
        </button>
        <button
          onClick={() => onBackToCart && onBackToCart()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back to cart
        </button>
      </div>
    );
  }
};

export default CheckoutForm;
