import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderHistory } from '../components/Cart/OrderHistory.jsx';
import { orderService } from '../services/orderService';

export const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch both statistics and orders in parallel
            const [statsResponse, ordersResponse] = await Promise.all([
                orderService.getOrderStatistics(),
                orderService.getOrders()
            ]);

            // Handle statistics
            if (statsResponse.message === "Order statistics retrieved successfully") {
                setStatistics(statsResponse.statistics);
            }

            // Handle orders
            if (ordersResponse.message === "Orders retrieved successfully") {
                setOrders(ordersResponse.data || []);
            } else if (Array.isArray(ordersResponse)) {
                // Fallback for direct array response
                setOrders(ordersResponse);
            } else {
                setOrders([]);
            }

        } catch (err) {
            console.error('❌ OrderHistoryPage Error:', err);
            setError(err.message || 'Không thể tải dữ liệu đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        document.body.classList.add('order-history-page-active');
        return () => document.body.classList.remove('order-history-page-active');
    }, []);

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
            {/* Header */}
            <nav className="navbar" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                padding: '1rem 2rem',
                boxShadow: '0 4px 20px rgba(30, 41, 59, 0.4)',
                margin: 0,
                borderBottom: '2px solid #0ea5e9'
            }}>
                <div className="container-fluid">
                    <div className="d-flex align-items-center w-100">
                        <div className="text-white">
                            <h1 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem'
                            }}>
                                <span style={{ fontSize: '1.8rem' }}>📋</span>
                                Lịch sử đơn hàng
                            </h1>
                            {!loading && !error && (
                                <p style={{
                                    fontSize: '0.9rem',
                                    opacity: '0.8',
                                    margin: 0,
                                    marginTop: '0.2rem',
                                    marginLeft: '3.4rem'
                                }}>
                                    {orders.length === 0 ? 'Chưa có đơn hàng' : `${orders.length} đơn hàng`}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container-fluid px-4 py-4" style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                minHeight: 'calc(100vh - 80px)'
            }}>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Đang tải lịch sử đơn hàng...</p>
                        </div>
                    </div>
                ) : (
                    <OrderHistory 
                        orders={orders} 
                        onBackToCart={handleBackToCart}
                    />
                )}

                {/* Nút quay lại */}
                <div className="d-flex justify-content-center mt-4 mb-3">
                    <div style={{ width: 'fit-content' }}>
                        <button
                            className="text-white d-flex align-items-center justify-content-center"
                            style={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '99px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                fontSize: '1rem',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
                                width: 'fit-content',
                                maxWidth: '300px',
                                whiteSpace: 'nowrap'
                            }}
                            onClick={() => navigate('/cart')}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.5)';
                                e.target.style.background = 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.3)';
                                e.target.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)';
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>←</span>
                            Quay lại giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
