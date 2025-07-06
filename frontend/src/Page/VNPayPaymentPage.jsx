import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VNPayPayment from '../components/Cart/VNPayPayment';
import './VNPayPaymentPage.css';

const VNPayPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orderData, setOrderData] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        // Lấy data từ navigation state
        const state = location.state;
        
        if (!state || !state.orderData || !state.totalAmount) {
            // Nếu không có data, chuyển về trang checkout
            console.log('❌ No order data found, redirecting to checkout');
            navigate('/checkout', { replace: true });
            return;
        }

        console.log('✅ Order data received:', state.orderData);
        console.log('💰 Total amount:', state.totalAmount);
        
        setOrderData(state.orderData);
        setTotalAmount(state.totalAmount);
    }, [location, navigate]);

    const handlePaymentComplete = (paymentResult) => {
        console.log('✅ Payment completed:', paymentResult);
        
        // Chuyển hướng về trang thành công hoặc trang chủ
        navigate('/', { 
            replace: true,
            state: { 
                paymentSuccess: true, 
                transactionId: paymentResult.transactionId,
                message: 'Thanh toán thành công! Đơn hàng của bạn đang được xử lý.'
            }
        });
    };

    const handlePaymentCancel = () => {
        console.log('❌ Payment cancelled');
        
        // Chuyển về trang checkout với thông báo
        navigate('/checkout', { 
            replace: true,
            state: { 
                paymentCancelled: true,
                message: 'Thanh toán đã được hủy. Bạn có thể thử lại.'
            }
        });
    };

    // Hiển thị loading nếu chưa có data
    if (!orderData || !totalAmount) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            }}>
                <div style={{ 
                    background: 'white', 
                    padding: '40px', 
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                    <div className="vnpay-loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #e9ecef',
                        borderTop: '4px solid #1e3c72',
                        borderRadius: '50%',
                        margin: '0 auto 20px'
                    }}></div>
                    <h2 style={{ color: '#1e3c72', marginBottom: '10px' }}>Đang tải...</h2>
                    <p style={{ color: '#6c757d', margin: 0 }}>Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <VNPayPayment
            orderData={orderData}
            totalAmount={totalAmount}
            onPaymentComplete={handlePaymentComplete}
            onPaymentCancel={handlePaymentCancel}
        />
    );
};

export default VNPayPaymentPage; 