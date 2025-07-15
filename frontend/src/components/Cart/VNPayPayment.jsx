import React, { useState, useEffect } from 'react';
import styles from './VNPayPayment.module.css';

const VNPayPayment = ({ orderData, onPaymentComplete, onPaymentCancel, totalAmount }) => {
    const [paymentStep, setPaymentStep] = useState('info'); // 'info', 'processing', 'success', 'error'
    const [paymentData, setPaymentData] = useState({
        bankCode: '',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        otp: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [countdown, setCountdown] = useState(300); // 5 minutes countdown
    const [error, setError] = useState('');

    // Countdown timer
    useEffect(() => {
        if (paymentStep === 'info' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (countdown === 0) {
            setError('Payment session has expired. Please try again.');
            setPaymentStep('error');
        }
    }, [countdown, paymentStep]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'đ');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Format card number
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
            if (formatted.length <= 19) {
                setPaymentData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }
        
        // Format expiry date
        if (name === 'expiryDate') {
            const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
            if (formatted.length <= 5) {
                setPaymentData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }
        
        // Format CVV
        if (name === 'cvv') {
            const formatted = value.replace(/\D/g, '');
            if (formatted.length <= 3) {
                setPaymentData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }
        
        // Format OTP
        if (name === 'otp') {
            const formatted = value.replace(/\D/g, '');
            if (formatted.length <= 6) {
                setPaymentData(prev => ({ ...prev, [name]: formatted }));
            }
            return;
        }
        
        setPaymentData(prev => ({ ...prev, [name]: value }));
    };

    const handleBankSelect = (bankCode) => {
        setPaymentData(prev => ({ ...prev, bankCode }));
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        // Validate required fields
        if (!paymentData.bankCode) {
            setError('Please select a bank');
            setIsProcessing(false);
            return;
        }

        if (!paymentData.cardNumber || !paymentData.cardHolder || !paymentData.expiryDate || !paymentData.cvv) {
            setError('Please enter complete card information');
            setIsProcessing(false);
            return;
        }

        try {
            // Simulate payment processing
            setPaymentStep('processing');
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate OTP step
            setPaymentStep('otp');
            setIsProcessing(false);
            
        } catch (error) {
            setError('An error occurred during payment processing. Please try again.');
            setPaymentStep('error');
            setIsProcessing(false);
        }
    };

    const handleOTPSubmit = async () => {
        if (!paymentData.otp || paymentData.otp.length !== 6) {
            setError('Please enter 6-digit OTP code');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            // Simulate OTP verification
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate payment success
            setPaymentStep('success');
            setTimeout(() => {
                onPaymentComplete({
                    paymentMethod: 'vnpay',
                    transactionId: `VNP${Date.now()}`,
                    amount: totalAmount,
                    status: 'completed'
                });
            }, 2000);
            
        } catch (error) {
            setError('OTP code is incorrect. Please try again.');
            setIsProcessing(false);
        }
    };

    const bankOptions = [
        { code: 'VCB', name: 'Vietcombank', logo: '/img/banks/vcb.png' },
        { code: 'TCB', name: 'Techcombank', logo: '/img/banks/tcb.png' },
        { code: 'BIDV', name: 'BIDV', logo: '/img/banks/bidv.png' },
        { code: 'VTB', name: 'VietinBank', logo: '/img/banks/vtb.png' },
        { code: 'ACB', name: 'ACB', logo: '/img/banks/acb.png' },
        { code: 'MB', name: 'MBBank', logo: '/img/banks/mb.png' },
        { code: 'VPB', name: 'VPBank', logo: '/img/banks/vpb.png' },
        { code: 'SHB', name: 'SHB', logo: '/img/banks/shb.png' }
    ];

    if (paymentStep === 'processing') {
        return (
            <div className={styles.vnpayContainer}>
                <div className={styles.vnpayHeader}>
                    <img src="/img/logo.png" alt="VNPay" className={styles.vnpayLogo} />
                    <h1>Cổng thanh toán VNPay</h1>
                </div>
                <div className={styles.processingContainer}>
                    <div className={styles.spinner}></div>
                    <h2>Processing payment...</h2>
                    <p>Please do not close this webpage</p>
                </div>
            </div>
        );
    }

    if (paymentStep === 'otp') {
        return (
            <div className={styles.vnpayContainer}>
                <div className={styles.vnpayHeader}>
                    <img src="/img/logo.png" alt="VNPay" className={styles.vnpayLogo} />
                    <h1>Xác thực OTP</h1>
                </div>
                <div className={styles.otpContainer}>
                    <div className={styles.otpInfo}>
                        <h2>Enter OTP Code</h2>
                        <p>OTP code has been sent to the phone number registered with the bank</p>
                        <p className={styles.phoneNumber}>***{orderData.phone?.slice(-4)}</p>
                    </div>
                    
                    <div className={styles.otpInputContainer}>
                        <label htmlFor="otp">Mã OTP (6 số)</label>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={paymentData.otp}
                            onChange={handleInputChange}
                            placeholder="Nhập mã OTP"
                            className={styles.otpInput}
                            maxLength="6"
                        />
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.otpActions}>
                        <button 
                            className={styles.submitButton}
                            onClick={handleOTPSubmit}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Verifying...' : 'Confirm'}
                        </button>
                        <button 
                            className={styles.cancelButton}
                            onClick={onPaymentCancel}
                        >
                            Cancel payment
                        </button>
                    </div>

                    <div className={styles.countdownTimer}>
                        <p>Time remaining: {formatTime(countdown)}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentStep === 'success') {
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
                        <p><strong>Transaction ID:</strong> VNP{Date.now()}</p>
                        <p><strong>Amount:</strong> {formatCurrency(totalAmount)}</p>
                        <p><strong>Time:</strong> {formatDateTime(new Date())}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentStep === 'error') {
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
                                setPaymentStep('info');
                                setError('');
                                setCountdown(300);
                            }}
                        >
                            Try Again
                        </button>
                        <button 
                            className={styles.cancelButton}
                            onClick={onPaymentCancel}
                        >
                            Cancel Payment
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
                            <span>{orderData.address}, {orderData.commune}, {orderData.ward}, {orderData.city}</span>
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
                        <label>Select bank</label>
                        <div className={styles.bankOptions}>
                            {bankOptions.map(bank => (
                                <div 
                                    key={bank.code}
                                    className={`${styles.bankOption} ${paymentData.bankCode === bank.code ? styles.selected : ''}`}
                                    onClick={() => handleBankSelect(bank.code)}
                                >
                                    <div className={styles.bankLogo}>
                                        <img 
                                            src={bank.logo} 
                                            alt={bank.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <span style={{ display: 'none' }}>🏦</span>
                                    </div>
                                    <span className={styles.bankName}>{bank.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.cardInfo}>
                        <h3>Card Information</h3>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="cardNumber">Card number *</label>
                            <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={paymentData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="1234 5678 9012 3456"
                                className={styles.cardInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cardHolder">Cardholder name *</label>
                            <input
                                type="text"
                                id="cardHolder"
                                name="cardHolder"
                                value={paymentData.cardHolder}
                                onChange={handleInputChange}
                                placeholder="NGUYEN VAN A"
                                className={styles.cardInput}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="expiryDate">Expiry date *</label>
                                <input
                                    type="text"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={paymentData.expiryDate}
                                    onChange={handleInputChange}
                                    placeholder="MM/YY"
                                    className={styles.cardInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="cvv">CVV *</label>
                                <input
                                    type="text"
                                    id="cvv"
                                    name="cvv"
                                    value={paymentData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    className={styles.cardInput}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.securityNote}>
                        <p>🔒 Your card information is secured with 256-bit SSL encryption</p>
                        <p>📱 You will receive an OTP code to verify the transaction</p>
                    </div>

                    <div className={styles.paymentActions}>
                        <button 
                            className={styles.payButton}
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
                        </button>
                        
                        <button 
                            className={styles.cancelButton}
                            onClick={onPaymentCancel}
                        >
                            Cancel payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VNPayPayment; 