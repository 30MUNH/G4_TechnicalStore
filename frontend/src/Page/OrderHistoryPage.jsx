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
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const ordersPerPage = 10;

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            // Fetch both statistics and orders in parallel
            const [statsResponse, ordersResponse] = await Promise.all([
                orderService.getOrderStatistics(),
                orderService.getOrders({
                    page: page,
                    limit: ordersPerPage
                })
            ]);

            // Handle statistics
            if (statsResponse.message === "Order statistics retrieved successfully") {
                setStatistics(statsResponse.statistics);
            }

            // Handle orders with proper pagination data
            if (ordersResponse.message === "Orders retrieved successfully") {
                // Check if response has pagination structure
                if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
                    setOrders(ordersResponse.data);
                    setTotalOrders(ordersResponse.total || ordersResponse.data.length);
                    setTotalPages(ordersResponse.totalPages || Math.ceil((ordersResponse.total || ordersResponse.data.length) / ordersPerPage));
                } else if (Array.isArray(ordersResponse.data)) {
                    setOrders(ordersResponse.data);
                    setTotalOrders(ordersResponse.data.length);
                    setTotalPages(Math.ceil(ordersResponse.data.length / ordersPerPage));
                } else {
                    setOrders([]);
                    setTotalOrders(0);
                    setTotalPages(0);
                }
            } else if (Array.isArray(ordersResponse)) {
                // Fallback for direct array response
                setOrders(ordersResponse);
                setTotalOrders(ordersResponse.length);
                setTotalPages(Math.ceil(ordersResponse.length / ordersPerPage));
            } else {
                setOrders([]);
                setTotalOrders(0);
                setTotalPages(0);
            }

        } catch (err) {
            console.error('❌ OrderHistoryPage Error:', err);
            setError(err.message || 'Cannot load order data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
        document.body.classList.add('order-history-page-active');
        return () => document.body.classList.remove('order-history-page-active');
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleBackToCart = () => {
        navigate('/cart');
    };

    return (
        <>
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
                            <p className="mt-2">Loading order history...</p>
                        </div>
                    </div>
                ) : (
                    <OrderHistory 
                        orders={orders} 
                        totalOrders={totalOrders}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        onBackToCart={handleBackToCart}
                        onOrderUpdate={setOrders}
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
                            Back to cart
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
