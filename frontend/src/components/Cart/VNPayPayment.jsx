import React, { useState, useEffect } from "react";
import styles from "./VNPayPayment.module.css";

const VNPayPayment = ({
  orderData,
  onPaymentComplete,
  onPaymentCancel,
  totalAmount,
}) => {
  console.log("🎯 VNPayPayment component loaded with:", {
    orderData,
    totalAmount,
    hasOrderId: !!orderData?.id,
  });

  const [paymentStep, setPaymentStep] = useState("info"); // 'info', 'processing', 'success', 'error'
  const [paymentData, setPaymentData] = useState({
    bankCode: "",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    otp: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown
  const [error, setError] = useState("");

  // Check for payment return status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const orderId = urlParams.get("orderId");
    const transactionId = urlParams.get("transactionId");
    const errorMsg = urlParams.get("error");

    if (status === "success" && orderId === orderData?.id) {
      setPaymentStep("success");
      setTimeout(() => {
        onPaymentComplete({
          paymentMethod: "vnpay",
          transactionId: transactionId || `VNP${Date.now()}`,
          amount: totalAmount,
          status: "completed",
        });
      }, 2000);
    } else if (status === "error") {
      setPaymentStep("error");
      setError(errorMsg || "Payment failed");
    }
  }, [orderData?.id, totalAmount, onPaymentComplete]);

  // Countdown timer
  useEffect(() => {
    if (paymentStep === "info" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setError("Payment session has expired. Please try again.");
      setPaymentStep("error");
    }
  }, [countdown, paymentStep]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(amount)
      .replace("₫", "đ");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format card number
    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formatted.length <= 19) {
        setPaymentData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    // Format expiry date
    if (name === "expiryDate") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{2})/, "$1/$2");
      if (formatted.length <= 5) {
        setPaymentData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    // Format CVV
    if (name === "cvv") {
      const formatted = value.replace(/\D/g, "");
      if (formatted.length <= 3) {
        setPaymentData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    // Format OTP
    if (name === "otp") {
      const formatted = value.replace(/\D/g, "");
      if (formatted.length <= 6) {
        setPaymentData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankSelect = (bankCode) => {
    setPaymentData((prev) => ({ ...prev, bankCode }));
  };

  const createVNPayUrl = async () => {
    try {
      // Validate orderData and orderId
      if (!orderData?.id) {
        throw new Error("Order ID is missing. Please try again.");
      }

      const token = localStorage.getItem("authToken"); // Use authToken instead of token
      if (!token) {
        throw new Error("Authentication required");
      }

      // Use the configured API base URL
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiBaseUrl}/payment/create-vnpay-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          orderId: String(orderData.id), // <-- ensure string
          amount: totalAmount,
          bankCode: paymentData.bankCode,
          orderInfo: `Thanh toan don hang ${orderData.id}`,
          locale: "vn",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("VNPAY URL creation response:", result);

      if (result.success && result.data.paymentUrl) {
        console.log("Redirecting to VNPAY:", result.data.paymentUrl);
        // Redirect to VNPAY payment page
        window.location.href = result.data.paymentUrl;
      } else {
        console.error("VNPAY URL creation failed:", result);
        throw new Error(result.message || "Failed to create payment URL");
      }
    } catch (error) {
      console.error("Payment URL creation failed:", error);
      setError(error.message || "Failed to create payment URL");
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    console.log("🚀 handlePayment called!");
    setIsProcessing(true);
    setError("");

    try {
      console.log("Starting payment process...", {
        orderData: orderData?.id,
        totalAmount,
        bankCode: paymentData.bankCode,
      });

      setPaymentStep("processing");

      // Create VNPAY payment URL and redirect
      await createVNPayUrl();
    } catch (error) {
      console.error("Payment process failed:", error);
      setError(
        "An error occurred during payment processing. Please try again."
      );
      setPaymentStep("error");
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const response = await fetch(`${apiBaseUrl}/payment/status/${orderId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        return result.data.status;
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
    }
    return "unknown";
  };

  const bankOptions = [
    { code: "VCB", name: "Vietcombank", logo: "/img/banks/vcb.png" },
    { code: "TCB", name: "Techcombank", logo: "/img/banks/tcb.png" },
    { code: "BIDV", name: "BIDV", logo: "/img/banks/bidv.png" },
    { code: "VTB", name: "VietinBank", logo: "/img/banks/vtb.png" },
    { code: "ACB", name: "ACB", logo: "/img/banks/acb.png" },
    { code: "MB", name: "MBBank", logo: "/img/banks/mb.png" },
    { code: "VPB", name: "VPBank", logo: "/img/banks/vpb.png" },
    { code: "SHB", name: "SHB", logo: "/img/banks/shb.png" },
  ];

  if (paymentStep === "processing") {
    return (
      <div className={styles.vnpayContainer}>
        <div className={styles.vnpayHeader}>
          <img src="/img/logo.png" alt="VNPay" className={styles.vnpayLogo} />
          <h1>Cổng thanh toán VNPay</h1>
        </div>
        <div className={styles.processingContainer}>
          <div className={styles.spinner}></div>
          <h2>Redirecting to VNPAY...</h2>
          <p>Please wait while we redirect you to the secure payment page</p>
          <p>Do not close this window</p>
        </div>
      </div>
    );
  }

  if (paymentStep === "success") {
    // Clear saved form data when payment is successful
    React.useEffect(() => {
      try {
        sessionStorage.removeItem("checkoutFormData");
      } catch (error) {
        console.error("Error clearing saved form data:", error);
      }
    }, []);

    return (
      <div className={styles.vnpayContainer}>
        <div className={styles.vnpayHeader}>
          <img src="/img/logo.png" alt="VNPay" className={styles.vnpayLogo} />
          <h1>Payment Successful</h1>
        </div>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✅</div>
          <h2>Transaction Completed!</h2>
          <p>Your order has been paid successfully</p>
          <div className={styles.transactionDetails}>
            <p>
              <strong>Order ID:</strong> {orderData?.id}
            </p>
            <p>
              <strong>Amount:</strong> {formatCurrency(totalAmount)}
            </p>
            <p>
              <strong>Time:</strong> {new Date().toLocaleString("vi-VN")}
            </p>
          </div>
          <div className={styles.successActions}>
            <button
              className={styles.continueButton}
              onClick={() => (window.location.href = "/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === "error") {
    return (
      <div className={styles.vnpayContainer}>
        <div className={styles.vnpayHeader}>
          <img src="/img/logo.png" alt="VNPay" className={styles.vnpayLogo} />
          <h1>Payment Failed</h1>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Transaction Failed</h2>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button
              className={styles.retryButton}
              onClick={() => {
                setPaymentStep("info");
                setError("");
                setCountdown(300);
                setIsProcessing(false);
              }}
            >
              Try Again
            </button>
            <button className={styles.cancelButton} onClick={onPaymentCancel}>
              Back to Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.vnpayContainer}>
      <div className={styles.vnpayHeader}>
        <img src="/img/logo.png" alt="VNPay" className={styles.vnpayLogo} />
        <h1>VNPay Payment Gateway</h1>
        <div className={styles.securityBadge}>
          <span>🔒 SSL Secure</span>
        </div>
      </div>

      <div className={styles.paymentContent}>
        <div className={styles.orderSummary}>
          <h2>Order Information</h2>
          <div className={styles.orderInfo}>
            <div className={styles.orderRow}>
              <span>Recipient:</span>
              <span>{orderData.fullName}</span>
            </div>
            <div className={styles.orderRow}>
              <span>Phone:</span>
              <span>{orderData.phone}</span>
            </div>
            <div className={styles.orderRow}>
              <span>Address:</span>
              <span>
                {orderData.address}, {orderData.commune}, {orderData.ward},{" "}
                {orderData.city}
              </span>
            </div>
            <div className={`${styles.orderRow} ${styles.totalAmount}`}>
              <span>Total amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className={styles.countdownTimer}>
            <p>⏰ Time remaining: {formatTime(countdown)}</p>
          </div>
        </div>

        <div className={styles.paymentForm}>
          <h2>Payment Information</h2>

          <div className={styles.bankSelection}>
            <label>Select preferred bank (optional)</label>
            <div className={styles.bankOptions}>
              {bankOptions.map((bank) => (
                <div
                  key={bank.code}
                  className={`${styles.bankOption} ${
                    paymentData.bankCode === bank.code ? styles.selected : ""
                  }`}
                  onClick={() => handleBankSelect(bank.code)}
                >
                  <div className={styles.bankLogo}>
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <span style={{ display: "none" }}>🏦</span>
                  </div>
                  <span className={styles.bankName}>{bank.name}</span>
                </div>
              ))}
            </div>
            <p className={styles.bankNote}>
              You can also select your bank on the VNPAY payment page
            </p>
          </div>

          <div className={styles.paymentInfo}>
            <h3>Payment Process</h3>
            <div className={styles.processSteps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span>Click "Pay Now" to redirect to VNPAY</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span>Complete payment on VNPAY's secure page</span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span>You'll be redirected back after payment</span>
              </div>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.securityNote}>
            <p>🔒 Secure payment powered by VNPAY</p>
            <p>🏦 Support for all major Vietnamese banks</p>
            <p>📱 Mobile banking and QR code payment supported</p>
          </div>

          <div className={styles.paymentActions}>
            <button
              className={styles.payButton}
              onClick={() => {
                console.log("🔘 Pay button clicked!");
                console.log("📊 Current state:", {
                  orderData: orderData?.id,
                  totalAmount,
                  isProcessing,
                  paymentStep,
                });
                handlePayment();
              }}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Redirecting..."
                : `Pay ${formatCurrency(totalAmount)}`}
            </button>

            <button
              className={styles.cancelButton}
              onClick={() => {
                // Clear saved form data when user cancels payment
                try {
                  sessionStorage.removeItem("checkoutFormData");
                } catch (error) {
                  console.error("Error clearing saved form data:", error);
                }
                onPaymentCancel();
              }}
            >
              Cancel payment
            </button>

            <button
              className={styles.backButton}
              onClick={onPaymentCancel}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                marginTop: "10px",
                width: "100%",
              }}
            >
              ← Back to Checkout (Keep Form Data)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPayPayment;
